"""
Personal Record detection service.
Compares new set data against historical bests and creates PersonalRecord entries.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.workout import PersonalRecord, SessionSet, WorkoutSession


def epley_1rm(weight: float, reps: int) -> float:
    """Estimate 1RM using Epley formula."""
    if reps <= 0 or weight <= 0:
        return 0.0
    if reps == 1:
        return weight
    return round(weight * (1 + reps / 30), 1)


async def check_and_record_pr(
    db: AsyncSession,
    user_id: uuid.UUID,
    exercise_id: uuid.UUID,
    weight_kg: float | None,
    reps: int | None,
    set_id: uuid.UUID,
    is_warmup: bool = False,
) -> bool:
    """
    Check if the given set is a personal record.
    Returns True if a new PR was created.
    """
    if is_warmup or not weight_kg or weight_kg <= 0 or not reps or reps <= 0:
        return False

    new_1rm = epley_1rm(weight_kg, reps)
    if new_1rm <= 0:
        return False

    # Get current best 1RM for this exercise
    result = await db.execute(
        select(func.max(PersonalRecord.estimated_1rm)).where(
            and_(
                PersonalRecord.user_id == user_id,
                PersonalRecord.exercise_id == exercise_id,
                PersonalRecord.record_type == "1rm",
            )
        )
    )
    current_best = result.scalar() or 0.0

    if new_1rm <= current_best:
        return False

    # New PR!
    pr = PersonalRecord(
        id=uuid.uuid4(),
        user_id=user_id,
        exercise_id=exercise_id,
        weight_kg=weight_kg,
        reps=reps,
        estimated_1rm=new_1rm,
        achieved_at=datetime.now(timezone.utc),
        record_type="1rm",
    )
    db.add(pr)

    # Mark the set as PR
    set_result = await db.execute(
        select(SessionSet).where(SessionSet.id == set_id)
    )
    session_set = set_result.scalar_one_or_none()
    if session_set:
        session_set.is_pr = True

    await db.flush()
    return True
