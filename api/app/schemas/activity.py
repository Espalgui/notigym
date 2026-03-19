import uuid
from datetime import date, datetime

from pydantic import BaseModel


class DailyActivityCreate(BaseModel):
    date: date
    steps: int | None = None
    active_calories: int | None = None
    total_calories: int | None = None
    distance_km: float | None = None
    floors_climbed: int | None = None
    active_minutes: int | None = None
    resting_heart_rate: int | None = None
    sleep_hours: float | None = None
    notes: str | None = None


class DailyActivityUpdate(BaseModel):
    steps: int | None = None
    active_calories: int | None = None
    total_calories: int | None = None
    distance_km: float | None = None
    floors_climbed: int | None = None
    active_minutes: int | None = None
    resting_heart_rate: int | None = None
    sleep_hours: float | None = None
    notes: str | None = None


class DailyActivityResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    date: date
    steps: int | None = None
    active_calories: int | None = None
    total_calories: int | None = None
    distance_km: float | None = None
    floors_climbed: int | None = None
    active_minutes: int | None = None
    resting_heart_rate: int | None = None
    sleep_hours: float | None = None
    source: str
    notes: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ActivitySummary(BaseModel):
    avg_steps: int = 0
    avg_active_calories: int = 0
    avg_distance_km: float = 0.0
    avg_sleep_hours: float = 0.0
    total_active_minutes: int = 0
    days_recorded: int = 0
