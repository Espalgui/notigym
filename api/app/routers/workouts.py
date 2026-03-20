import uuid as uuid_mod
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.dependencies import get_current_active_user
from app.database import get_db
from app.models.user import User
from app.notifications import create_notification
from app.models.workout import (
    PersonalRecord,
    ProgramDay,
    ProgramExercise,
    SessionSet,
    WorkoutProgram,
    WorkoutSession,
)
from app.schemas.workout import (
    PersonalRecordResponse,
    ProgramDayCreate,
    ProgramDayUpdate,
    ProgramExerciseCreate,
    ProgramExerciseUpdate,
    SessionSetCreate,
    SessionSetResponse,
    SessionSetUpdate,
    WorkoutProgramCreate,
    WorkoutProgramResponse,
    WorkoutProgramUpdate,
    WorkoutSessionCreate,
    WorkoutSessionResponse,
    WorkoutSessionUpdate,
    WorkoutStats,
)

router = APIRouter(prefix="/workouts", tags=["workouts"])


# --- Programs ---

@router.post("/programs", response_model=WorkoutProgramResponse, status_code=status.HTTP_201_CREATED)
async def create_program(
    data: WorkoutProgramCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    program = WorkoutProgram(user_id=current_user.id, **data.model_dump())
    db.add(program)
    await db.flush()
    result = await db.execute(
        select(WorkoutProgram)
        .where(WorkoutProgram.id == program.id)
        .options(selectinload(WorkoutProgram.days).selectinload(ProgramDay.exercises).selectinload(ProgramExercise.exercise))
    )
    return result.scalar_one()


@router.get("/programs", response_model=list[WorkoutProgramResponse])
async def list_programs(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WorkoutProgram)
        .where(WorkoutProgram.user_id == current_user.id)
        .options(selectinload(WorkoutProgram.days).selectinload(ProgramDay.exercises).selectinload(ProgramExercise.exercise))
        .order_by(WorkoutProgram.created_at.desc())
    )
    return result.scalars().unique().all()


@router.get("/programs/{program_id}", response_model=WorkoutProgramResponse)
async def get_program(
    program_id: uuid_mod.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WorkoutProgram)
        .where(WorkoutProgram.id == program_id)
        .options(selectinload(WorkoutProgram.days).selectinload(ProgramDay.exercises).selectinload(ProgramExercise.exercise))
    )
    program = result.scalar_one_or_none()
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found")
    if program.user_id != current_user.id and not program.is_public:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return program


@router.put("/programs/{program_id}", response_model=WorkoutProgramResponse)
async def update_program(
    program_id: uuid_mod.UUID,
    data: WorkoutProgramUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(WorkoutProgram).where(WorkoutProgram.id == program_id))
    program = result.scalar_one_or_none()
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found")
    if program.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(program, field, value)
    program.updated_at = datetime.now(timezone.utc)
    await db.flush()

    result = await db.execute(
        select(WorkoutProgram)
        .where(WorkoutProgram.id == program_id)
        .options(selectinload(WorkoutProgram.days).selectinload(ProgramDay.exercises).selectinload(ProgramExercise.exercise))
    )
    return result.scalar_one()


@router.delete("/programs/{program_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_program(
    program_id: uuid_mod.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(WorkoutProgram).where(WorkoutProgram.id == program_id))
    program = result.scalar_one_or_none()
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found")
    if program.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    await db.delete(program)
    return None


# --- Program Days ---

@router.post("/programs/{program_id}/days", response_model=WorkoutProgramResponse, status_code=status.HTTP_201_CREATED)
async def add_day(
    program_id: uuid_mod.UUID,
    data: ProgramDayCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(WorkoutProgram).where(WorkoutProgram.id == program_id))
    program = result.scalar_one_or_none()
    if not program or program.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found")

    day = ProgramDay(program_id=program_id, name=data.name, day_order=data.day_order)
    db.add(day)
    await db.flush()

    result = await db.execute(
        select(WorkoutProgram)
        .where(WorkoutProgram.id == program_id)
        .options(selectinload(WorkoutProgram.days).selectinload(ProgramDay.exercises).selectinload(ProgramExercise.exercise))
    )
    return result.scalar_one()


@router.put("/programs/days/{day_id}", response_model=WorkoutProgramResponse)
async def update_day(
    day_id: uuid_mod.UUID,
    data: ProgramDayUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ProgramDay)
        .where(ProgramDay.id == day_id)
        .options(selectinload(ProgramDay.program))
    )
    day = result.scalar_one_or_none()
    if not day or day.program.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Day not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(day, field, value)
    await db.flush()

    result = await db.execute(
        select(WorkoutProgram)
        .where(WorkoutProgram.id == day.program_id)
        .options(selectinload(WorkoutProgram.days).selectinload(ProgramDay.exercises).selectinload(ProgramExercise.exercise))
    )
    return result.scalar_one()


@router.delete("/programs/days/{day_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_day(
    day_id: uuid_mod.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ProgramDay)
        .where(ProgramDay.id == day_id)
        .options(selectinload(ProgramDay.program))
    )
    day = result.scalar_one_or_none()
    if not day or day.program.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Day not found")
    await db.delete(day)
    return None


# --- Program Exercises ---

@router.post("/programs/days/{day_id}/exercises", response_model=WorkoutProgramResponse, status_code=status.HTTP_201_CREATED)
async def add_exercise_to_day(
    day_id: uuid_mod.UUID,
    data: ProgramExerciseCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ProgramDay)
        .where(ProgramDay.id == day_id)
        .options(selectinload(ProgramDay.program))
    )
    day = result.scalar_one_or_none()
    if not day or day.program.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Day not found")

    pe = ProgramExercise(program_day_id=day_id, **data.model_dump())
    db.add(pe)
    await db.flush()

    result = await db.execute(
        select(WorkoutProgram)
        .where(WorkoutProgram.id == day.program_id)
        .options(selectinload(WorkoutProgram.days).selectinload(ProgramDay.exercises).selectinload(ProgramExercise.exercise))
    )
    return result.scalar_one()


@router.put("/programs/exercises/{pe_id}", response_model=WorkoutProgramResponse)
async def update_program_exercise(
    pe_id: uuid_mod.UUID,
    data: ProgramExerciseUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ProgramExercise)
        .where(ProgramExercise.id == pe_id)
        .options(selectinload(ProgramExercise.program_day).selectinload(ProgramDay.program))
    )
    pe = result.scalar_one_or_none()
    if not pe or pe.program_day.program.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program exercise not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(pe, field, value)
    await db.flush()

    result = await db.execute(
        select(WorkoutProgram)
        .where(WorkoutProgram.id == pe.program_day.program_id)
        .options(selectinload(WorkoutProgram.days).selectinload(ProgramDay.exercises).selectinload(ProgramExercise.exercise))
    )
    return result.scalar_one()


@router.delete("/programs/exercises/{pe_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_program_exercise(
    pe_id: uuid_mod.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ProgramExercise)
        .where(ProgramExercise.id == pe_id)
        .options(selectinload(ProgramExercise.program_day).selectinload(ProgramDay.program))
    )
    pe = result.scalar_one_or_none()
    if not pe or pe.program_day.program.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program exercise not found")
    await db.delete(pe)
    return None


# --- Sessions ---

@router.post("/sessions", response_model=WorkoutSessionResponse, status_code=status.HTTP_201_CREATED)
async def start_session(
    data: WorkoutSessionCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    session = WorkoutSession(user_id=current_user.id, **data.model_dump())
    db.add(session)
    await db.flush()
    result = await db.execute(
        select(WorkoutSession)
        .where(WorkoutSession.id == session.id)
        .options(selectinload(WorkoutSession.sets))
    )
    return result.scalar_one()


@router.put("/sessions/{session_id}", response_model=WorkoutSessionResponse)
async def update_session(
    session_id: uuid_mod.UUID,
    data: WorkoutSessionUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(WorkoutSession).where(WorkoutSession.id == session_id))
    session = result.scalar_one_or_none()
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(session, field, value)
    await db.flush()

    if data.is_completed:
        duration = f"{data.duration_minutes} min" if data.duration_minutes else ""
        await create_notification(
            db,
            user_id=current_user.id,
            type="workout_completed",
            title="Séance terminée !",
            message=f"Bravo {current_user.first_name}, ta séance est enregistrée. {duration}",
            link="/workouts",
        )
        await create_notification(
            db,
            user_id=current_user.id,
            type="whey_reminder",
            title="Nutrition post-séance",
            message=f"C'est le moment idéal pour prendre ta dose de protéines, {current_user.first_name} ! 🥤",
            link="/nutrition",
        )

    result = await db.execute(
        select(WorkoutSession)
        .where(WorkoutSession.id == session_id)
        .options(selectinload(WorkoutSession.sets))
    )
    return result.scalar_one()


@router.get("/sessions", response_model=list[WorkoutSessionResponse])
async def list_sessions(
    date_from: datetime | None = Query(None),
    date_to: datetime | None = Query(None),
    completed_only: bool = Query(True),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(WorkoutSession)
        .where(WorkoutSession.user_id == current_user.id)
        .options(selectinload(WorkoutSession.sets))
        .order_by(WorkoutSession.started_at.desc())
    )
    if completed_only:
        query = query.where(WorkoutSession.is_completed.is_(True))
    if date_from:
        query = query.where(WorkoutSession.started_at >= date_from)
    if date_to:
        query = query.where(WorkoutSession.started_at <= date_to)
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    return result.scalars().unique().all()


@router.get("/sessions/{session_id}", response_model=WorkoutSessionResponse)
async def get_session(
    session_id: uuid_mod.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WorkoutSession)
        .where(WorkoutSession.id == session_id)
        .options(selectinload(WorkoutSession.sets))
    )
    session = result.scalar_one_or_none()
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return session


# --- Session Sets ---

@router.post("/sessions/{session_id}/sets", response_model=SessionSetResponse, status_code=status.HTTP_201_CREATED)
async def add_set(
    session_id: uuid_mod.UUID,
    data: SessionSetCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(WorkoutSession).where(WorkoutSession.id == session_id))
    session = result.scalar_one_or_none()
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    s = SessionSet(session_id=session_id, **data.model_dump())
    db.add(s)
    await db.flush()
    await db.refresh(s)
    return s


@router.put("/sessions/sets/{set_id}", response_model=SessionSetResponse)
async def update_set(
    set_id: uuid_mod.UUID,
    data: SessionSetUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SessionSet)
        .where(SessionSet.id == set_id)
        .options(selectinload(SessionSet.session))
    )
    s = result.scalar_one_or_none()
    if not s or s.session.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Set not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(s, field, value)
    await db.flush()
    await db.refresh(s)
    return s


@router.delete("/sessions/sets/{set_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_set(
    set_id: uuid_mod.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SessionSet)
        .where(SessionSet.id == set_id)
        .options(selectinload(SessionSet.session))
    )
    s = result.scalar_one_or_none()
    if not s or s.session.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Set not found")
    await db.delete(s)
    return None


# --- Personal Records ---

@router.get("/records", response_model=list[PersonalRecordResponse])
async def list_records(
    exercise_id: uuid_mod.UUID | None = Query(None),
    record_type: str | None = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(PersonalRecord).where(PersonalRecord.user_id == current_user.id)
    if exercise_id:
        query = query.where(PersonalRecord.exercise_id == exercise_id)
    if record_type:
        query = query.where(PersonalRecord.record_type == record_type)
    query = query.order_by(PersonalRecord.achieved_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


# --- Stats ---

@router.get("/stats", response_model=WorkoutStats)
async def get_workout_stats(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    completed_filter = (
        WorkoutSession.user_id == current_user.id,
        WorkoutSession.is_completed.is_(True),
    )

    total_sessions_result = await db.execute(
        select(func.count(WorkoutSession.id)).where(*completed_filter)
    )
    total_sessions = total_sessions_result.scalar() or 0

    total_sets_result = await db.execute(
        select(func.count(SessionSet.id))
        .join(WorkoutSession)
        .where(*completed_filter)
    )
    total_sets = total_sets_result.scalar() or 0

    volume_result = await db.execute(
        select(func.sum(SessionSet.weight_kg * SessionSet.reps))
        .join(WorkoutSession)
        .where(*completed_filter)
    )
    total_volume = volume_result.scalar() or 0.0

    avg_duration_result = await db.execute(
        select(func.avg(WorkoutSession.duration_minutes))
        .where(*completed_filter, WorkoutSession.duration_minutes.isnot(None))
    )
    avg_duration = avg_duration_result.scalar()

    week_result = await db.execute(
        select(func.count(WorkoutSession.id))
        .where(*completed_filter, WorkoutSession.started_at >= week_ago)
    )
    sessions_week = week_result.scalar() or 0

    month_result = await db.execute(
        select(func.count(WorkoutSession.id))
        .where(*completed_filter, WorkoutSession.started_at >= month_ago)
    )
    sessions_month = month_result.scalar() or 0

    return WorkoutStats(
        total_sessions=total_sessions,
        total_sets=total_sets,
        total_volume_kg=round(float(total_volume), 2),
        avg_session_duration_min=round(float(avg_duration), 1) if avg_duration else None,
        sessions_this_week=sessions_week,
        sessions_this_month=sessions_month,
    )
