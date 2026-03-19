import uuid
from datetime import datetime

from pydantic import BaseModel

from app.schemas.exercise import ExerciseResponse


class ProgramExerciseCreate(BaseModel):
    exercise_id: uuid.UUID
    exercise_order: int
    sets: int = 3
    reps_min: int = 8
    reps_max: int = 12
    rest_seconds: int = 90
    tempo: str | None = None
    notes: str | None = None


class ProgramExerciseUpdate(BaseModel):
    exercise_order: int | None = None
    sets: int | None = None
    reps_min: int | None = None
    reps_max: int | None = None
    rest_seconds: int | None = None
    tempo: str | None = None
    notes: str | None = None


class ProgramExerciseResponse(BaseModel):
    id: uuid.UUID
    program_day_id: uuid.UUID
    exercise_id: uuid.UUID
    exercise_order: int
    sets: int
    reps_min: int
    reps_max: int
    rest_seconds: int
    tempo: str | None = None
    notes: str | None = None
    exercise: ExerciseResponse | None = None

    model_config = {"from_attributes": True}


class ProgramDayCreate(BaseModel):
    name: str
    day_order: int


class ProgramDayUpdate(BaseModel):
    name: str | None = None
    day_order: int | None = None


class ProgramDayResponse(BaseModel):
    id: uuid.UUID
    program_id: uuid.UUID
    name: str
    day_order: int
    created_at: datetime
    exercises: list[ProgramExerciseResponse] = []

    model_config = {"from_attributes": True}


class WorkoutProgramCreate(BaseModel):
    name: str
    description: str | None = None
    program_type: str


class WorkoutProgramUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    program_type: str | None = None
    is_active: bool | None = None
    is_public: bool | None = None


class WorkoutProgramResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    description: str | None = None
    program_type: str
    is_active: bool
    is_public: bool
    likes_count: int
    created_at: datetime
    updated_at: datetime
    days: list[ProgramDayResponse] = []

    model_config = {"from_attributes": True}


class SessionSetCreate(BaseModel):
    exercise_id: uuid.UUID
    set_number: int
    reps: int
    weight_kg: float
    rpe: float | None = None
    is_warmup: bool = False
    notes: str | None = None


class SessionSetUpdate(BaseModel):
    reps: int | None = None
    weight_kg: float | None = None
    rpe: float | None = None
    is_warmup: bool | None = None
    is_pr: bool | None = None
    notes: str | None = None


class SessionSetResponse(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    exercise_id: uuid.UUID
    set_number: int
    reps: int
    weight_kg: float
    rpe: float | None = None
    is_warmup: bool
    is_pr: bool
    notes: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class WorkoutSessionCreate(BaseModel):
    program_day_id: uuid.UUID | None = None
    started_at: datetime
    notes: str | None = None


class WorkoutSessionUpdate(BaseModel):
    finished_at: datetime | None = None
    duration_minutes: int | None = None
    feeling: int | None = None
    notes: str | None = None
    is_completed: bool | None = None


class WorkoutSessionResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    program_day_id: uuid.UUID | None = None
    started_at: datetime
    finished_at: datetime | None = None
    duration_minutes: int | None = None
    feeling: int | None = None
    notes: str | None = None
    is_completed: bool
    created_at: datetime
    sets: list[SessionSetResponse] = []

    model_config = {"from_attributes": True}


class PersonalRecordResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    exercise_id: uuid.UUID
    weight_kg: float
    reps: int
    estimated_1rm: float | None = None
    achieved_at: datetime
    record_type: str
    created_at: datetime

    model_config = {"from_attributes": True}


class WorkoutStats(BaseModel):
    total_sessions: int = 0
    total_sets: int = 0
    total_volume_kg: float = 0.0
    avg_session_duration_min: float | None = None
    sessions_this_week: int = 0
    sessions_this_month: int = 0
