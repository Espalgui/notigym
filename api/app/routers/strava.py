import time
from datetime import date, timedelta

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_active_user
from app.config import settings
from app.database import get_db
from app.models.activity import DailyActivity
from app.models.user import User

router = APIRouter(prefix="/strava", tags=["strava"])

STRAVA_AUTH_URL = "https://www.strava.com/oauth/authorize"
STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token"
STRAVA_API_URL = "https://www.strava.com/api/v3"


@router.get("/connect")
async def strava_connect(
    current_user: User = Depends(get_current_active_user),
):
    """Return the Strava OAuth authorization URL."""
    redirect_uri = f"{settings.FRONTEND_URL}/activity?strava_callback=1"
    url = (
        f"{STRAVA_AUTH_URL}?client_id={settings.STRAVA_CLIENT_ID}"
        f"&redirect_uri={redirect_uri}"
        f"&response_type=code"
        f"&scope=activity:read_all"
        f"&approval_prompt=auto"
    )
    return {"url": url}


@router.post("/callback")
async def strava_callback(
    code: str = Query(...),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Exchange authorization code for tokens and store them."""
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(STRAVA_TOKEN_URL, data={
            "client_id": settings.STRAVA_CLIENT_ID,
            "client_secret": settings.STRAVA_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
        })
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Strava authorization failed")
        data = resp.json()

    current_user.strava_athlete_id = data["athlete"]["id"]
    current_user.strava_access_token = data["access_token"]
    current_user.strava_refresh_token = data["refresh_token"]
    current_user.strava_token_expires_at = data["expires_at"]
    await db.flush()

    return {"connected": True, "athlete_id": data["athlete"]["id"]}


async def _refresh_token_if_needed(user: User, db: AsyncSession) -> str:
    """Refresh Strava access token if expired."""
    if not user.strava_refresh_token:
        raise HTTPException(status_code=400, detail="Strava not connected")

    if user.strava_token_expires_at and user.strava_token_expires_at > time.time() + 60:
        return user.strava_access_token

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(STRAVA_TOKEN_URL, data={
            "client_id": settings.STRAVA_CLIENT_ID,
            "client_secret": settings.STRAVA_CLIENT_SECRET,
            "grant_type": "refresh_token",
            "refresh_token": user.strava_refresh_token,
        })
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to refresh Strava token")
        data = resp.json()

    user.strava_access_token = data["access_token"]
    user.strava_refresh_token = data["refresh_token"]
    user.strava_token_expires_at = data["expires_at"]
    await db.flush()

    return data["access_token"]


@router.post("/sync")
async def strava_sync(
    days: int = Query(7, ge=1, le=30),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Sync recent Strava activities into DailyActivity."""
    if not current_user.strava_access_token:
        raise HTTPException(status_code=400, detail="Strava not connected")

    access_token = await _refresh_token_if_needed(current_user, db)

    after_ts = int((date.today() - timedelta(days=days)).strftime("%s"))

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(
            f"{STRAVA_API_URL}/athlete/activities",
            headers={"Authorization": f"Bearer {access_token}"},
            params={"after": after_ts, "per_page": 100},
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch Strava activities")
        activities = resp.json()

    # Group activities by day
    daily_data: dict[str, dict] = {}
    for act in activities:
        act_date = act["start_date_local"][:10]  # "2026-03-26"
        if act_date not in daily_data:
            daily_data[act_date] = {
                "steps": 0,
                "distance_km": 0.0,
                "active_calories": 0,
                "active_minutes": 0,
            }
        d = daily_data[act_date]

        distance_km = act.get("distance", 0) / 1000.0
        d["distance_km"] += distance_km

        # Estimate steps: ~1300 steps/km walk, ~1000 steps/km run, 0 for cycling etc.
        act_type = act.get("type", "")
        if act_type in ("Walk", "Hike"):
            d["steps"] += int(distance_km * 1300)
        elif act_type in ("Run", "Trail", "VirtualRun"):
            d["steps"] += int(distance_km * 1000)

        # Calories (Strava provides kilojoules for rides, calories for others)
        if act.get("calories"):
            d["active_calories"] += int(act["calories"])
        elif act.get("kilojoules"):
            d["active_calories"] += int(act["kilojoules"] * 0.239)

        d["active_minutes"] += int(act.get("moving_time", 0) / 60)

    # Upsert into DailyActivity
    synced = 0
    for day_str, data in daily_data.items():
        day_date = date.fromisoformat(day_str)
        result = await db.execute(
            select(DailyActivity).where(
                DailyActivity.user_id == current_user.id,
                DailyActivity.date == day_date,
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            if existing.source == "strava":
                existing.steps = data["steps"] or existing.steps
                existing.distance_km = round(data["distance_km"], 2) or existing.distance_km
                existing.active_calories = data["active_calories"] or existing.active_calories
                existing.active_minutes = data["active_minutes"] or existing.active_minutes
        else:
            activity = DailyActivity(
                user_id=current_user.id,
                date=day_date,
                steps=data["steps"] or None,
                distance_km=round(data["distance_km"], 2) or None,
                active_calories=data["active_calories"] or None,
                active_minutes=data["active_minutes"] or None,
                source="strava",
            )
            db.add(activity)
        synced += 1

    await db.flush()
    return {"synced_days": synced, "activities_count": len(activities)}


@router.get("/status")
async def strava_status(
    current_user: User = Depends(get_current_active_user),
):
    """Check if Strava is connected."""
    return {
        "connected": current_user.strava_access_token is not None,
        "athlete_id": current_user.strava_athlete_id,
    }


@router.delete("/disconnect")
async def strava_disconnect(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Disconnect Strava account."""
    current_user.strava_athlete_id = None
    current_user.strava_access_token = None
    current_user.strava_refresh_token = None
    current_user.strava_token_expires_at = None
    await db.flush()
    return {"disconnected": True}
