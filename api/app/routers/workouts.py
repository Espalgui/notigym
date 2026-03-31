import uuid as uuid_mod
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.dependencies import get_current_active_user
from app.database import get_db
from app.models.user import User
from app.models.exercise import Exercise
from app.notifications import create_notification
from app.services.pr_detection import check_and_record_pr
from app.workout_templates import get_templates_for_user
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


@router.patch("/programs/{program_id}/favorite")
async def toggle_favorite(
    program_id: uuid_mod.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(WorkoutProgram).where(WorkoutProgram.id == program_id))
    program = result.scalar_one_or_none()
    if not program or program.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found")
    program.is_favorite = not program.is_favorite
    await db.flush()
    return {"is_favorite": program.is_favorite}


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
            message=f"Bravo {current_user.username}, ta séance est enregistrée. {duration}",
            link="/workouts",
        )
        await create_notification(
            db,
            user_id=current_user.id,
            type="whey_reminder",
            title="Nutrition post-séance",
            message=f"C'est le moment idéal pour prendre ta dose de protéines, {current_user.username} ! 🥤",
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

    # PR detection
    is_new_pr = await check_and_record_pr(
        db, current_user.id, data.exercise_id,
        data.weight_kg, data.reps, s.id, data.is_warmup,
    )
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


# --- Progressive Overload ---

@router.get("/exercises/{exercise_id}/last-performance")
async def get_last_performance(
    exercise_id: uuid_mod.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the last session's sets for a given exercise (for overload suggestions)."""
    # Find the most recent completed session that has sets for this exercise
    subq = (
        select(WorkoutSession.id)
        .join(SessionSet, SessionSet.session_id == WorkoutSession.id)
        .where(
            WorkoutSession.user_id == current_user.id,
            WorkoutSession.is_completed == True,  # noqa: E712
            SessionSet.exercise_id == exercise_id,
        )
        .order_by(WorkoutSession.started_at.desc())
        .limit(1)
    ).scalar_subquery()

    result = await db.execute(
        select(SessionSet)
        .where(
            SessionSet.session_id == subq,
            SessionSet.exercise_id == exercise_id,
            SessionSet.is_warmup == False,  # noqa: E712
        )
        .order_by(SessionSet.set_number)
    )
    sets = result.scalars().all()

    if not sets:
        return {"sets": [], "session_date": None}

    # Get session date
    sess_result = await db.execute(
        select(WorkoutSession.started_at).where(WorkoutSession.id == sets[0].session_id)
    )
    session_date = sess_result.scalar()

    return {
        "sets": [
            {
                "set_number": s.set_number,
                "weight_kg": s.weight_kg,
                "reps": s.reps,
                "duration_seconds": s.duration_seconds,
            }
            for s in sets
        ],
        "session_date": session_date.isoformat() if session_date else None,
    }


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

    week_duration_result = await db.execute(
        select(func.coalesce(func.sum(WorkoutSession.duration_minutes), 0))
        .where(*completed_filter, WorkoutSession.started_at >= week_ago, WorkoutSession.duration_minutes.isnot(None))
    )
    total_duration_week = week_duration_result.scalar() or 0.0

    return WorkoutStats(
        total_sessions=total_sessions,
        total_sets=total_sets,
        total_volume_kg=round(float(total_volume), 2),
        avg_session_duration_min=round(float(avg_duration), 1) if avg_duration else None,
        sessions_this_week=sessions_week,
        sessions_this_month=sessions_month,
        total_duration_this_week=round(float(total_duration_week), 1),
    )


# --- Templates ---

@router.get("/templates")
async def list_templates(
    current_user: User = Depends(get_current_active_user),
):
    """Retourne les templates de programmes filtrés et triés selon le profil de l'utilisateur."""
    templates = get_templates_for_user(
        goal=current_user.goal,
        training_type=current_user.training_type,
        gender=current_user.gender,
    )
    lang = getattr(current_user, "language", "fr") or "fr"
    result = []
    for t in templates:
        result.append({
            "id": t["id"],
            "name": t[f"name_{lang}"] if f"name_{lang}" in t else t["name_fr"],
            "description": t[f"description_{lang}"] if f"description_{lang}" in t else t["description_fr"],
            "program_type": t["program_type"],
            "days_per_week": t["days_per_week"],
            "days_count": len(t["days"]),
            "exercises_count": sum(len(d["exercises"]) for d in t["days"]),
            "goals": t["goals"],
            "training_types": t["training_types"],
            "genders": t["genders"],
            "image_url": t.get("image_url"),
            "difficulty": t.get("difficulty"),
        })
    return result


@router.post("/templates/{template_id}/import", response_model=WorkoutProgramResponse, status_code=status.HTTP_201_CREATED)
async def import_template(
    template_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Clone un template en programme personnel pour l'utilisateur."""
    # Cherche dans tous les templates (sans filtre genre pour le cas où l'utilisateur force l'import)
    from app.workout_templates import TEMPLATES
    from app.streetworkout_templates import STREET_WORKOUT_TEMPLATES
    all_templates = TEMPLATES + STREET_WORKOUT_TEMPLATES
    template = next((t for t in all_templates if t["id"] == template_id), None)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    lang = getattr(current_user, "language", "fr") or "fr"
    name = template[f"name_{lang}"] if f"name_{lang}" in template else template["name_fr"]

    # Crée le programme
    program = WorkoutProgram(
        user_id=current_user.id,
        name=name,
        description=template[f"description_{lang}"] if f"description_{lang}" in template else template["description_fr"],
        program_type=template["program_type"],
        image_url=template.get("image_url"),
    )
    db.add(program)
    await db.flush()    # Crée les jours et exercices
    for day_order, day_data in enumerate(template["days"]):
        day_name = day_data[f"name_{lang}"] if f"name_{lang}" in day_data else day_data["name_fr"]
        day = ProgramDay(
            program_id=program.id,
            name=day_name,
            day_order=day_order,
        )
        db.add(day)
        await db.flush()

        for ex_order, ex_data in enumerate(day_data["exercises"]):
            exercise_result = await db.execute(
                select(Exercise).where(Exercise.name_key == ex_data["name_key"])
            )
            exercise = exercise_result.scalar_one_or_none()
            if not exercise:
                continue

            pe = ProgramExercise(
                program_day_id=day.id,
                exercise_id=exercise.id,
                exercise_order=ex_order,
                sets=ex_data["sets"],
                reps_min=ex_data["reps_min"],
                reps_max=ex_data["reps_max"],
                rest_seconds=ex_data["rest_seconds"],
                notes=ex_data.get("notes"),
                tempo=ex_data.get("tempo"),
            )
            db.add(pe)

    await db.flush()

    result = await db.execute(
        select(WorkoutProgram)
        .where(WorkoutProgram.id == program.id)
        .options(selectinload(WorkoutProgram.days).selectinload(ProgramDay.exercises).selectinload(ProgramExercise.exercise))
    )
    return result.scalar_one()


# --- PR Wall ---

@router.get("/records/wall")
async def get_pr_wall(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all PRs grouped by exercise for the PR wall."""
    from sqlalchemy import desc

    subq = (
        select(
            PersonalRecord.exercise_id,
            func.max(PersonalRecord.estimated_1rm).label("best_1rm"),
            func.max(PersonalRecord.weight_kg).label("best_weight"),
            func.max(PersonalRecord.reps).label("best_reps"),
            func.max(PersonalRecord.achieved_at).label("last_pr_date"),
            func.count(PersonalRecord.id).label("pr_count"),
        )
        .where(PersonalRecord.user_id == current_user.id)
        .group_by(PersonalRecord.exercise_id)
    ).subquery()

    result = await db.execute(
        select(
            Exercise.id,
            Exercise.name_fr,
            Exercise.name_en,
            Exercise.muscle_group,
            Exercise.image_url,
            subq.c.best_1rm,
            subq.c.best_weight,
            subq.c.best_reps,
            subq.c.last_pr_date,
            subq.c.pr_count,
        )
        .join(subq, Exercise.id == subq.c.exercise_id)
        .order_by(desc(subq.c.last_pr_date))
    )

    rows = result.all()
    return [
        {
            "exercise_id": str(r.id),
            "name_fr": r.name_fr,
            "name_en": r.name_en,
            "muscle_group": r.muscle_group,
            "image_url": r.image_url,
            "best_1rm": r.best_1rm,
            "best_weight": r.best_weight,
            "best_reps": r.best_reps,
            "last_pr_date": r.last_pr_date.isoformat() if r.last_pr_date else None,
            "pr_count": r.pr_count,
        }
        for r in rows
    ]


@router.get("/records/exercise/{exercise_id}/history")
async def get_pr_history(
    exercise_id: uuid_mod.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get 1RM progression over time for a specific exercise."""
    result = await db.execute(
        select(PersonalRecord)
        .where(
            PersonalRecord.user_id == current_user.id,
            PersonalRecord.exercise_id == exercise_id,
            PersonalRecord.record_type == "1rm",
        )
        .order_by(PersonalRecord.achieved_at)
    )
    prs = result.scalars().all()
    return [
        {
            "date": pr.achieved_at.isoformat(),
            "weight_kg": pr.weight_kg,
            "reps": pr.reps,
            "estimated_1rm": pr.estimated_1rm,
        }
        for pr in prs
    ]
