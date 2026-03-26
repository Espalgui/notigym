import uuid as uuid_mod
from datetime import date, timedelta

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_active_user
from app.database import get_db
from app.models.nutrition import NutritionEntry, NutritionGoal, WaterIntake
from app.models.user import User
from app.schemas.nutrition import (
    DailyNutritionSummary,
    DailyWaterSummary,
    NutritionEntryCreate,
    NutritionEntryResponse,
    NutritionEntryUpdate,
    NutritionGoalCreate,
    NutritionGoalResponse,
    WaterIntakeCreate,
    WaterIntakeResponse,
)

router = APIRouter(prefix="/nutrition", tags=["nutrition"])


# --- OpenFoodFacts Search ---

@router.get("/search-food")
async def search_food(
    q: str = Query(..., min_length=2),
    current_user: User = Depends(get_current_active_user),
):
    """Recherche un aliment via OpenFoodFacts et renvoie les résultats formatés."""
    lang = getattr(current_user, "language", "fr") or "fr"
    url = "https://world.openfoodfacts.net/cgi/search.pl"
    params = {
        "search_terms": q,
        "search_simple": 1,
        "action": "process",
        "json": 1,
        "page_size": 50,
        "fields": "product_name,product_name_fr,brands,nutriments,image_front_small_url,quantity",
        "lc": lang,
    }
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
    except Exception:
        return []

    search_lower = q.lower()
    results = []
    for p in data.get("products", []):
        name_fr = p.get("product_name_fr") or ""
        name_en = p.get("product_name") or ""
        name = name_fr or name_en
        if not name:
            continue
        # Filtre : le nom doit contenir au moins un mot de la recherche
        name_lower = (name_fr + " " + name_en).lower()
        if not any(word in name_lower for word in search_lower.split()):
            continue
        brand = p.get("brands", "")
        n = p.get("nutriments", {})
        kcal = n.get("energy-kcal_100g", 0)
        if not kcal:
            continue  # Skip products with no calorie data
        results.append({
            "name": f"{name} ({brand})" if brand else name,
            "calories": round(kcal),
            "protein_g": round(n.get("proteins_100g", 0), 1),
            "carbs_g": round(n.get("carbohydrates_100g", 0), 1),
            "fat_g": round(n.get("fat_100g", 0), 1),
            "quantity": p.get("quantity", ""),
            "image_url": p.get("image_front_small_url", ""),
        })
    return results[:15]


# --- Goals ---

@router.post("/goals", response_model=NutritionGoalResponse, status_code=status.HTTP_201_CREATED)
async def set_goal(
    data: NutritionGoalCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(
        select(NutritionGoal)
        .where(NutritionGoal.user_id == current_user.id, NutritionGoal.is_active == True)  # noqa: E712
    )
    result = await db.execute(
        select(NutritionGoal)
        .where(NutritionGoal.user_id == current_user.id, NutritionGoal.is_active == True)  # noqa: E712
    )
    for old_goal in result.scalars().all():
        old_goal.is_active = False

    goal = NutritionGoal(user_id=current_user.id, **data.model_dump())
    db.add(goal)
    await db.flush()
    await db.refresh(goal)
    return goal


@router.get("/goals", response_model=NutritionGoalResponse | None)
async def get_active_goal(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(NutritionGoal)
        .where(NutritionGoal.user_id == current_user.id, NutritionGoal.is_active == True)  # noqa: E712
        .order_by(NutritionGoal.created_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


# --- Entries ---

@router.post("/entries", response_model=NutritionEntryResponse, status_code=status.HTTP_201_CREATED)
async def create_entry(
    data: NutritionEntryCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    entry = NutritionEntry(user_id=current_user.id, **data.model_dump())
    db.add(entry)
    await db.flush()
    await db.refresh(entry)
    return entry


@router.get("/entries", response_model=list[NutritionEntryResponse])
async def list_entries(
    date: date = Query(...),
    meal_type: str | None = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(NutritionEntry)
        .where(NutritionEntry.user_id == current_user.id, NutritionEntry.date == date)
        .order_by(NutritionEntry.created_at)
    )
    if meal_type:
        query = query.where(NutritionEntry.meal_type == meal_type)
    result = await db.execute(query)
    return result.scalars().all()


@router.put("/entries/{entry_id}", response_model=NutritionEntryResponse)
async def update_entry(
    entry_id: uuid_mod.UUID,
    data: NutritionEntryUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(NutritionEntry).where(NutritionEntry.id == entry_id, NutritionEntry.user_id == current_user.id)
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)
    await db.flush()
    await db.refresh(entry)
    return entry


@router.delete("/entries/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_entry(
    entry_id: uuid_mod.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(NutritionEntry).where(NutritionEntry.id == entry_id, NutritionEntry.user_id == current_user.id)
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")
    await db.delete(entry)
    return None


# --- Summary ---

@router.get("/summary", response_model=DailyNutritionSummary)
async def get_daily_summary(
    date: date = Query(...),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    entries_result = await db.execute(
        select(NutritionEntry)
        .where(NutritionEntry.user_id == current_user.id, NutritionEntry.date == date)
        .order_by(NutritionEntry.created_at)
    )
    entries = entries_result.scalars().all()

    total_cal = sum(e.calories or 0 for e in entries)
    total_protein = sum(e.protein_g or 0.0 for e in entries)
    total_carbs = sum(e.carbs_g or 0.0 for e in entries)
    total_fat = sum(e.fat_g or 0.0 for e in entries)

    goal_result = await db.execute(
        select(NutritionGoal)
        .where(NutritionGoal.user_id == current_user.id, NutritionGoal.is_active == True)  # noqa: E712
        .limit(1)
    )
    goal = goal_result.scalar_one_or_none()

    summary = DailyNutritionSummary(
        date=date,
        total_calories=total_cal,
        total_protein_g=round(total_protein, 1),
        total_carbs_g=round(total_carbs, 1),
        total_fat_g=round(total_fat, 1),
        goal=goal,
        entries=entries,
    )

    if goal:
        summary.calories_remaining = goal.calories - total_cal
        summary.protein_remaining_g = round(goal.protein_g - total_protein, 1)
        summary.carbs_remaining_g = round(goal.carbs_g - total_carbs, 1)
        summary.fat_remaining_g = round(goal.fat_g - total_fat, 1)

    return summary


@router.get("/history", response_model=list[DailyNutritionSummary])
async def get_nutrition_history(
    days: int = Query(7, ge=1, le=90),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    today = date.today()
    start_date = today - timedelta(days=days - 1)

    entries_result = await db.execute(
        select(NutritionEntry)
        .where(
            NutritionEntry.user_id == current_user.id,
            NutritionEntry.date >= start_date,
            NutritionEntry.date <= today,
        )
        .order_by(NutritionEntry.date, NutritionEntry.created_at)
    )
    entries = entries_result.scalars().all()

    by_date: dict[date, list[NutritionEntry]] = {}
    for entry in entries:
        by_date.setdefault(entry.date, []).append(entry)

    goal_result = await db.execute(
        select(NutritionGoal)
        .where(NutritionGoal.user_id == current_user.id, NutritionGoal.is_active == True)  # noqa: E712
        .limit(1)
    )
    goal = goal_result.scalar_one_or_none()

    history = []
    for i in range(days):
        d = start_date + timedelta(days=i)
        day_entries = by_date.get(d, [])
        total_cal = sum(e.calories or 0 for e in day_entries)
        total_protein = sum(e.protein_g or 0.0 for e in day_entries)
        total_carbs = sum(e.carbs_g or 0.0 for e in day_entries)
        total_fat = sum(e.fat_g or 0.0 for e in day_entries)

        summary = DailyNutritionSummary(
            date=d,
            total_calories=total_cal,
            total_protein_g=round(total_protein, 1),
            total_carbs_g=round(total_carbs, 1),
            total_fat_g=round(total_fat, 1),
            goal=goal,
            entries=day_entries,
        )
        if goal:
            summary.calories_remaining = goal.calories - total_cal
            summary.protein_remaining_g = round(goal.protein_g - total_protein, 1)
            summary.carbs_remaining_g = round(goal.carbs_g - total_carbs, 1)
            summary.fat_remaining_g = round(goal.fat_g - total_fat, 1)
        history.append(summary)

    return history


# --- Water ---

@router.post("/water", response_model=WaterIntakeResponse, status_code=status.HTTP_201_CREATED)
async def log_water(
    data: WaterIntakeCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    entry = WaterIntake(user_id=current_user.id, **data.model_dump())
    db.add(entry)
    await db.flush()
    await db.refresh(entry)
    return entry


@router.get("/water", response_model=DailyWaterSummary)
async def get_water(
    date: date = Query(...),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WaterIntake)
        .where(WaterIntake.user_id == current_user.id, WaterIntake.date == date)
        .order_by(WaterIntake.created_at)
    )
    entries = result.scalars().all()
    total = sum(e.amount_ml for e in entries)

    goal_result = await db.execute(
        select(NutritionGoal)
        .where(NutritionGoal.user_id == current_user.id, NutritionGoal.is_active == True)  # noqa: E712
        .order_by(NutritionGoal.created_at.desc())
        .limit(1)
    )
    active_goal = goal_result.scalar_one_or_none()
    goal_ml = (active_goal.water_goal_ml or 2000) if active_goal else 2000

    return DailyWaterSummary(date=date, total_ml=total, goal_ml=goal_ml, entries=entries)
