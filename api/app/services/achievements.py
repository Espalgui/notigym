"""
Achievement checking service.
Called after session completion, PR creation, etc.
"""
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import and_, cast, Date, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.achievement import Achievement, UserAchievement
from app.models.workout import PersonalRecord, SessionSet, WorkoutSession


async def get_current_streak(db: AsyncSession, user_id: uuid.UUID) -> int:
    """Count consecutive days with completed sessions, starting from today."""
    result = await db.execute(
        select(cast(WorkoutSession.started_at, Date).label("day"))
        .where(
            WorkoutSession.user_id == user_id,
            WorkoutSession.is_completed == True,  # noqa: E712
        )
        .group_by("day")
        .order_by(cast(WorkoutSession.started_at, Date).desc())
    )
    days = [r.day for r in result.all()]

    if not days:
        return 0

    today = datetime.now(timezone.utc).date()
    # Allow today or yesterday as start
    if days[0] != today and days[0] != today - timedelta(days=1):
        return 0

    streak = 1
    for i in range(1, len(days)):
        if days[i] == days[i - 1] - timedelta(days=1):
            streak += 1
        else:
            break

    return streak


async def check_achievements(
    db: AsyncSession, user_id: uuid.UUID, trigger: str
) -> list[dict]:
    """
    Check and unlock achievements based on trigger type.
    Returns list of newly unlocked achievements.
    """
    # Get all achievements and user's unlocked ones
    all_result = await db.execute(select(Achievement))
    all_achievements = {a.key: a for a in all_result.scalars().all()}

    unlocked_result = await db.execute(
        select(UserAchievement.achievement_id).where(UserAchievement.user_id == user_id)
    )
    unlocked_ids = {r for r in unlocked_result.scalars().all()}

    newly_unlocked = []

    async def try_unlock(key: str) -> bool:
        ach = all_achievements.get(key)
        if not ach or ach.id in unlocked_ids:
            return False
        ua = UserAchievement(
            id=uuid.uuid4(),
            user_id=user_id,
            achievement_id=ach.id,
        )
        db.add(ua)
        unlocked_ids.add(ach.id)
        newly_unlocked.append({
            "key": ach.key,
            "name_fr": ach.name_fr,
            "name_en": ach.name_en,
            "icon": ach.icon,
        })
        return True

    if trigger in ("session_completed", "all"):
        # Count total sessions
        result = await db.execute(
            select(func.count()).select_from(WorkoutSession).where(
                WorkoutSession.user_id == user_id,
                WorkoutSession.is_completed == True,  # noqa: E712
            )
        )
        total = result.scalar() or 0

        for key, threshold in [
            ("first_session", 1), ("sessions_10", 10), ("sessions_50", 50),
            ("sessions_100", 100), ("sessions_500", 500),
        ]:
            if total >= threshold:
                await try_unlock(key)

        # Streak achievements
        streak = await get_current_streak(db, user_id)
        for key, threshold in [("streak_7", 7), ("streak_30", 30), ("streak_100", 100)]:
            if streak >= threshold:
                await try_unlock(key)

        # Volume achievements
        vol_result = await db.execute(
            select(func.sum(SessionSet.weight_kg * SessionSet.reps)).where(
                SessionSet.session_id.in_(
                    select(WorkoutSession.id).where(
                        WorkoutSession.user_id == user_id,
                        WorkoutSession.is_completed == True,  # noqa: E712
                    )
                ),
                SessionSet.weight_kg.isnot(None),
                SessionSet.reps.isnot(None),
            )
        )
        total_vol = vol_result.scalar() or 0
        for key, threshold in [("volume_1000", 1000), ("volume_10000", 10000), ("volume_100000", 100000)]:
            if total_vol >= threshold:
                await try_unlock(key)

        # Time-based fun achievements
        last_session = await db.execute(
            select(WorkoutSession.started_at)
            .where(WorkoutSession.user_id == user_id, WorkoutSession.is_completed == True)  # noqa: E712
            .order_by(WorkoutSession.started_at.desc())
            .limit(1)
        )
        last_start = last_session.scalar()
        if last_start:
            hour = last_start.hour
            if hour < 7:
                await try_unlock("early_bird")
            if hour >= 21:
                await try_unlock("night_owl")

    if trigger in ("new_pr", "all"):
        result = await db.execute(
            select(func.count()).select_from(PersonalRecord).where(
                PersonalRecord.user_id == user_id
            )
        )
        total_prs = result.scalar() or 0
        for key, threshold in [("first_pr", 1), ("prs_10", 10), ("prs_50", 50)]:
            if total_prs >= threshold:
                await try_unlock(key)

    if newly_unlocked:
        await db.flush()

    return newly_unlocked
