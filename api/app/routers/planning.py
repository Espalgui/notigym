import uuid
from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.user import User
from app.models.workout import (
    ProgramDay,
    ScheduledWorkout,
    WorkoutProgram,
    WorkoutSession,
)
from app.auth.dependencies import get_current_user
from app.schemas.workout import (
    BulkScheduleCreate,
    ScheduleSlotResponse,
    WeeklyPlanningResponse,
    WorkoutSessionResponse,
)

router = APIRouter(prefix="/planning", tags=["planning"])


def _week_bounds(d: date) -> tuple[date, date]:
    """Return (monday, sunday) for the week containing date d."""
    monday = d - timedelta(days=d.weekday())
    sunday = monday + timedelta(days=6)
    return monday, sunday


@router.get("/week", response_model=WeeklyPlanningResponse)
async def get_weekly_planning(
    date: date | None = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    target = date or datetime.now(timezone.utc).date()
    monday, sunday = _week_bounds(target)

    # Fetch schedule slots
    result = await db.execute(
        select(ScheduledWorkout)
        .where(ScheduledWorkout.user_id == user.id)
        .order_by(ScheduledWorkout.weekday)
    )
    slots = result.scalars().all()

    # Get program name + day details for the slots
    program_name = None
    day_info: dict[uuid.UUID, tuple[str, int]] = {}  # day_id -> (name, exercises_count)

    if slots:
        prog_id = slots[0].program_id
        prog_result = await db.execute(
            select(WorkoutProgram)
            .where(WorkoutProgram.id == prog_id)
            .options(selectinload(WorkoutProgram.days).selectinload(ProgramDay.exercises))
        )
        program = prog_result.scalar_one_or_none()
        if program:
            program_name = program.name
            for day in program.days:
                day_info[day.id] = (day.name, len(day.exercises))

    slot_responses = []
    for s in slots:
        day_name = None
        ex_count = 0
        if s.program_day_id and s.program_day_id in day_info:
            day_name, ex_count = day_info[s.program_day_id]
        slot_responses.append(
            ScheduleSlotResponse(
                id=s.id,
                user_id=s.user_id,
                program_id=s.program_id,
                program_day_id=s.program_day_id,
                weekday=s.weekday,
                is_rest_day=s.is_rest_day,
                program_day_name=day_name,
                exercises_count=ex_count,
            )
        )

    # Fetch completed sessions for the week
    monday_dt = datetime(monday.year, monday.month, monday.day, tzinfo=timezone.utc)
    sunday_dt = datetime(sunday.year, sunday.month, sunday.day, 23, 59, 59, tzinfo=timezone.utc)

    sess_result = await db.execute(
        select(WorkoutSession)
        .where(
            and_(
                WorkoutSession.user_id == user.id,
                WorkoutSession.started_at >= monday_dt,
                WorkoutSession.started_at <= sunday_dt,
                WorkoutSession.is_completed == True,  # noqa: E712
            )
        )
        .options(selectinload(WorkoutSession.sets))
        .order_by(WorkoutSession.started_at)
    )
    sessions = sess_result.scalars().all()

    return WeeklyPlanningResponse(
        schedule=slot_responses,
        sessions=[WorkoutSessionResponse.model_validate(s) for s in sessions],
        program_name=program_name,
    )


@router.post("/schedule/bulk", response_model=list[ScheduleSlotResponse])
async def bulk_schedule(
    data: BulkScheduleCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Validate program
    prog_result = await db.execute(
        select(WorkoutProgram)
        .where(
            and_(
                WorkoutProgram.id == data.program_id,
                WorkoutProgram.user_id == user.id,
            )
        )
        .options(selectinload(WorkoutProgram.days).selectinload(ProgramDay.exercises))
    )
    program = prog_result.scalar_one_or_none()
    if not program:
        raise HTTPException(404, "Program not found")

    # Clear existing schedule
    await db.execute(
        delete(ScheduledWorkout).where(ScheduledWorkout.user_id == user.id)
    )

    days_sorted = sorted(program.days, key=lambda d: d.day_order)
    weekdays_sorted = sorted(set(data.weekdays))

    new_slots = []

    # Assign program days to selected weekdays
    for i, wd in enumerate(weekdays_sorted):
        if i < len(days_sorted):
            slot = ScheduledWorkout(
                id=uuid.uuid4(),
                user_id=user.id,
                program_id=program.id,
                program_day_id=days_sorted[i].id,
                weekday=wd,
                is_rest_day=False,
            )
        else:
            slot = ScheduledWorkout(
                id=uuid.uuid4(),
                user_id=user.id,
                program_id=program.id,
                program_day_id=None,
                weekday=wd,
                is_rest_day=True,
            )
        db.add(slot)
        new_slots.append(slot)

    # Fill remaining weekdays as rest
    all_weekdays = set(range(7))
    rest_weekdays = all_weekdays - set(weekdays_sorted)
    for wd in sorted(rest_weekdays):
        slot = ScheduledWorkout(
            id=uuid.uuid4(),
            user_id=user.id,
            program_id=program.id,
            program_day_id=None,
            weekday=wd,
            is_rest_day=True,
        )
        db.add(slot)
        new_slots.append(slot)

    await db.commit()

    # Build response
    day_info = {d.id: (d.name, len(d.exercises)) for d in days_sorted}
    responses = []
    for s in sorted(new_slots, key=lambda x: x.weekday if x.weekday is not None else 99):
        day_name = None
        ex_count = 0
        if s.program_day_id and s.program_day_id in day_info:
            day_name, ex_count = day_info[s.program_day_id]
        responses.append(
            ScheduleSlotResponse(
                id=s.id,
                user_id=s.user_id,
                program_id=s.program_id,
                program_day_id=s.program_day_id,
                weekday=s.weekday,
                is_rest_day=s.is_rest_day,
                program_day_name=day_name,
                exercises_count=ex_count,
            )
        )

    return responses


@router.delete("/schedule")
async def clear_schedule(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(
        delete(ScheduledWorkout).where(ScheduledWorkout.user_id == user.id)
    )
    await db.commit()
    return {"ok": True}
