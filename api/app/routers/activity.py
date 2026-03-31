import uuid as uuid_mod
from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_active_user
from app.database import get_db
from app.models.activity import DailyActivity
from app.models.user import User
from app.schemas.activity import (
    ActivitySummary,
    DailyActivityCreate,
    DailyActivityResponse,
    DailyActivityUpdate,
)

router = APIRouter(prefix="/activity", tags=["activity"])


@router.post("/", response_model=DailyActivityResponse, status_code=status.HTTP_201_CREATED)
async def create_or_update_activity(
    data: DailyActivityCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(DailyActivity).where(
            DailyActivity.user_id == current_user.id,
            DailyActivity.date == data.date,
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        for field, value in data.model_dump(exclude={"date"}, exclude_none=True).items():
            setattr(existing, field, value)
        await db.flush()
        await db.refresh(existing)
        return existing

    activity = DailyActivity(user_id=current_user.id, **data.model_dump())
    db.add(activity)
    try:
        await db.flush()
    except IntegrityError:
        await db.rollback()
        # Concurrent insert — retry as update
        result2 = await db.execute(
            select(DailyActivity).where(
                DailyActivity.user_id == current_user.id,
                DailyActivity.date == data.date,
            )
        )
        existing = result2.scalar_one()
        for field, value in data.model_dump(exclude={"date"}, exclude_none=True).items():
            setattr(existing, field, value)
        await db.flush()
        await db.refresh(existing)
        return existing
    await db.refresh(activity)
    return activity


@router.get("/", response_model=list[DailyActivityResponse])
async def list_activities(
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    limit: int = Query(50, ge=1, le=365),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(DailyActivity)
        .where(DailyActivity.user_id == current_user.id)
        .order_by(DailyActivity.date.desc())
    )
    if date_from:
        query = query.where(DailyActivity.date >= date_from)
    if date_to:
        query = query.where(DailyActivity.date <= date_to)
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/today", response_model=DailyActivityResponse | None)
async def get_today_activity(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    from datetime import timezone

    today = datetime.now(timezone.utc).date()
    result = await db.execute(
        select(DailyActivity).where(
            DailyActivity.user_id == current_user.id,
            DailyActivity.date == today,
        )
    )
    return result.scalar_one_or_none()


@router.get("/summary", response_model=ActivitySummary)
async def get_activity_summary(
    days: int = Query(7, ge=1, le=365),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    from datetime import timedelta, timezone

    start_date = datetime.now(timezone.utc).date() - timedelta(days=days)
    result = await db.execute(
        select(
            func.count(DailyActivity.id).label("count"),
            func.coalesce(func.avg(DailyActivity.steps), 0).label("avg_steps"),
            func.coalesce(func.avg(DailyActivity.active_calories), 0).label("avg_cal"),
            func.coalesce(func.avg(DailyActivity.distance_km), 0).label("avg_dist"),
            func.coalesce(func.avg(DailyActivity.sleep_hours), 0).label("avg_sleep"),
            func.coalesce(func.sum(DailyActivity.active_minutes), 0).label("total_active"),
        ).where(
            DailyActivity.user_id == current_user.id,
            DailyActivity.date >= start_date,
        )
    )
    row = result.one()
    return ActivitySummary(
        avg_steps=int(row.avg_steps),
        avg_active_calories=int(row.avg_cal),
        avg_distance_km=round(float(row.avg_dist), 1),
        avg_sleep_hours=round(float(row.avg_sleep), 1),
        total_active_minutes=int(row.total_active),
        days_recorded=row.count,
    )


@router.put("/{activity_id}", response_model=DailyActivityResponse)
async def update_activity(
    activity_id: uuid_mod.UUID,
    data: DailyActivityUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(DailyActivity).where(
            DailyActivity.id == activity_id,
            DailyActivity.user_id == current_user.id,
        )
    )
    activity = result.scalar_one_or_none()
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(activity, field, value)
    await db.flush()
    await db.refresh(activity)
    return activity


@router.delete("/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_activity(
    activity_id: uuid_mod.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(DailyActivity).where(
            DailyActivity.id == activity_id,
            DailyActivity.user_id == current_user.id,
        )
    )
    activity = result.scalar_one_or_none()
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    await db.delete(activity)
    return None
