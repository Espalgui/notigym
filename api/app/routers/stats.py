from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import case, cast, func, Date, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_active_user
from app.database import get_db
from app.models.activity import DailyActivity
from app.models.body import BodyMeasurement
from app.models.nutrition import NutritionEntry, WaterIntake
from app.models.user import User
from app.models.workout import PersonalRecord, SessionSet, WorkoutSession

router = APIRouter(prefix="/stats", tags=["stats"])


def _date_range(period: str) -> tuple[datetime, datetime]:
    now = datetime.now(timezone.utc)
    if period == "week":
        start = now - timedelta(days=7)
    elif period == "year":
        start = now - timedelta(days=365)
    else:
        start = now - timedelta(days=30)
    return start, now


@router.get("/progression")
async def get_progression(
    period: str = Query("month", regex="^(week|month|year)$"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    start, end = _date_range(period)
    uid = current_user.id

    # --- Workout sessions aggregated by day ---
    session_q = (
        select(
            cast(WorkoutSession.started_at, Date).label("date"),
            func.count(WorkoutSession.id).label("sessions"),
            func.coalesce(func.avg(WorkoutSession.duration_minutes), 0).label("avg_duration"),
            func.coalesce(func.avg(WorkoutSession.feeling), 0).label("avg_feeling"),
        )
        .where(
            WorkoutSession.user_id == uid,
            WorkoutSession.is_completed.is_(True),
            WorkoutSession.started_at >= start,
            WorkoutSession.started_at <= end,
        )
        .group_by(cast(WorkoutSession.started_at, Date))
        .order_by(cast(WorkoutSession.started_at, Date))
    )
    session_rows = (await db.execute(session_q)).all()

    workouts_data = [
        {
            "date": str(r.date),
            "sessions": r.sessions,
            "avg_duration": round(float(r.avg_duration), 1),
            "avg_feeling": round(float(r.avg_feeling), 1),
        }
        for r in session_rows
    ]

    # --- Volume by day (sum of weight * reps for completed sessions) ---
    volume_q = (
        select(
            cast(WorkoutSession.started_at, Date).label("date"),
            func.coalesce(func.sum(SessionSet.weight_kg * SessionSet.reps), 0).label("volume"),
            func.count(SessionSet.id).label("total_sets"),
        )
        .join(WorkoutSession, SessionSet.session_id == WorkoutSession.id)
        .where(
            WorkoutSession.user_id == uid,
            WorkoutSession.is_completed.is_(True),
            WorkoutSession.started_at >= start,
            WorkoutSession.started_at <= end,
        )
        .group_by(cast(WorkoutSession.started_at, Date))
        .order_by(cast(WorkoutSession.started_at, Date))
    )
    volume_rows = (await db.execute(volume_q)).all()

    volume_data = [
        {
            "date": str(r.date),
            "volume": round(float(r.volume), 1),
            "total_sets": r.total_sets,
        }
        for r in volume_rows
    ]

    # --- Body measurements over time ---
    body_q = (
        select(
            cast(BodyMeasurement.measured_at, Date).label("date"),
            func.avg(BodyMeasurement.weight_kg).label("weight"),
            func.avg(BodyMeasurement.body_fat_pct).label("body_fat"),
        )
        .where(
            BodyMeasurement.user_id == uid,
            BodyMeasurement.measured_at >= start,
            BodyMeasurement.measured_at <= end,
        )
        .group_by(cast(BodyMeasurement.measured_at, Date))
        .order_by(cast(BodyMeasurement.measured_at, Date))
    )
    body_rows = (await db.execute(body_q)).all()

    body_data = [
        {
            "date": str(r.date),
            "weight": round(float(r.weight), 1) if r.weight else None,
            "body_fat": round(float(r.body_fat), 1) if r.body_fat else None,
        }
        for r in body_rows
    ]

    # --- Nutrition by day ---
    nutrition_q = (
        select(
            NutritionEntry.date.label("date"),
            func.sum(NutritionEntry.calories).label("calories"),
            func.sum(NutritionEntry.protein_g).label("protein"),
            func.sum(NutritionEntry.carbs_g).label("carbs"),
            func.sum(NutritionEntry.fat_g).label("fat"),
        )
        .where(
            NutritionEntry.user_id == uid,
            NutritionEntry.date >= start.date(),
            NutritionEntry.date <= end.date(),
        )
        .group_by(NutritionEntry.date)
        .order_by(NutritionEntry.date)
    )
    nutrition_rows = (await db.execute(nutrition_q)).all()

    nutrition_data = [
        {
            "date": str(r.date),
            "calories": int(r.calories or 0),
            "protein": round(float(r.protein or 0), 1),
            "carbs": round(float(r.carbs or 0), 1),
            "fat": round(float(r.fat or 0), 1),
        }
        for r in nutrition_rows
    ]

    # --- Water by day ---
    water_q = (
        select(
            WaterIntake.date.label("date"),
            func.sum(WaterIntake.amount_ml).label("total_ml"),
        )
        .where(
            WaterIntake.user_id == uid,
            WaterIntake.date >= start.date(),
            WaterIntake.date <= end.date(),
        )
        .group_by(WaterIntake.date)
        .order_by(WaterIntake.date)
    )
    water_rows = (await db.execute(water_q)).all()

    water_data = [
        {"date": str(r.date), "total_ml": int(r.total_ml or 0)}
        for r in water_rows
    ]

    # --- Personal records over time ---
    pr_q = (
        select(
            cast(PersonalRecord.achieved_at, Date).label("date"),
            func.count(PersonalRecord.id).label("count"),
            func.max(PersonalRecord.estimated_1rm).label("best_1rm"),
        )
        .where(
            PersonalRecord.user_id == uid,
            PersonalRecord.achieved_at >= start,
            PersonalRecord.achieved_at <= end,
        )
        .group_by(cast(PersonalRecord.achieved_at, Date))
        .order_by(cast(PersonalRecord.achieved_at, Date))
    )
    pr_rows = (await db.execute(pr_q)).all()

    pr_data = [
        {
            "date": str(r.date),
            "count": r.count,
            "best_1rm": round(float(r.best_1rm), 1) if r.best_1rm else None,
        }
        for r in pr_rows
    ]

    # --- Summary totals for the period ---
    total_sessions_q = await db.execute(
        select(func.count(WorkoutSession.id)).where(
            WorkoutSession.user_id == uid,
            WorkoutSession.is_completed.is_(True),
            WorkoutSession.started_at >= start,
        )
    )
    total_sessions = total_sessions_q.scalar() or 0

    total_volume_q = await db.execute(
        select(func.coalesce(func.sum(SessionSet.weight_kg * SessionSet.reps), 0))
        .join(WorkoutSession, SessionSet.session_id == WorkoutSession.id)
        .where(
            WorkoutSession.user_id == uid,
            WorkoutSession.is_completed.is_(True),
            WorkoutSession.started_at >= start,
        )
    )
    total_volume = round(float(total_volume_q.scalar() or 0), 1)

    total_prs_q = await db.execute(
        select(func.count(PersonalRecord.id)).where(
            PersonalRecord.user_id == uid,
            PersonalRecord.achieved_at >= start,
        )
    )
    total_prs = total_prs_q.scalar() or 0

    avg_calories_q = await db.execute(
        select(func.avg(func.nullif(
            select(func.sum(NutritionEntry.calories))
            .where(NutritionEntry.user_id == uid)
            .correlate(None)
            .scalar_subquery(),
            0,
        )))
    )

    cal_per_day_q = (
        select(func.sum(NutritionEntry.calories).label("daily_cal"))
        .where(
            NutritionEntry.user_id == uid,
            NutritionEntry.date >= start.date(),
            NutritionEntry.date <= end.date(),
        )
        .group_by(NutritionEntry.date)
    )
    cal_rows = (await db.execute(cal_per_day_q)).scalars().all()
    avg_calories = round(sum(cal_rows) / len(cal_rows), 0) if cal_rows else 0

    # --- Daily activity (steps, calories, sleep, etc.) ---
    activity_q = (
        select(
            DailyActivity.date.label("date"),
            DailyActivity.steps,
            DailyActivity.active_calories,
            DailyActivity.distance_km,
            DailyActivity.active_minutes,
            DailyActivity.sleep_hours,
            DailyActivity.resting_heart_rate,
        )
        .where(
            DailyActivity.user_id == uid,
            DailyActivity.date >= start.date(),
            DailyActivity.date <= end.date(),
        )
        .order_by(DailyActivity.date)
    )
    activity_rows = (await db.execute(activity_q)).all()

    activity_data = [
        {
            "date": str(r.date),
            "steps": r.steps,
            "active_calories": r.active_calories,
            "distance_km": round(float(r.distance_km), 1) if r.distance_km else None,
            "active_minutes": r.active_minutes,
            "sleep_hours": round(float(r.sleep_hours), 1) if r.sleep_hours else None,
            "resting_heart_rate": r.resting_heart_rate,
        }
        for r in activity_rows
    ]

    avg_steps_q = await db.execute(
        select(func.coalesce(func.avg(DailyActivity.steps), 0)).where(
            DailyActivity.user_id == uid,
            DailyActivity.date >= start.date(),
            DailyActivity.steps.isnot(None),
        )
    )
    avg_steps = int(avg_steps_q.scalar() or 0)

    return {
        "period": period,
        "date_from": str(start.date()),
        "date_to": str(end.date()),
        "summary": {
            "total_sessions": total_sessions,
            "total_volume_kg": total_volume,
            "total_prs": total_prs,
            "avg_daily_calories": int(avg_calories),
            "avg_daily_steps": avg_steps,
        },
        "workouts": workouts_data,
        "volume": volume_data,
        "body": body_data,
        "nutrition": nutrition_data,
        "water": water_data,
        "personal_records": pr_data,
        "activity": activity_data,
    }
