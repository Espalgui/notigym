import uuid
from datetime import datetime

from pydantic import BaseModel


class BodyMeasurementCreate(BaseModel):
    measured_at: datetime
    weight_kg: float | None = None
    body_fat_pct: float | None = None
    chest_cm: float | None = None
    waist_cm: float | None = None
    hips_cm: float | None = None
    left_arm_cm: float | None = None
    right_arm_cm: float | None = None
    left_thigh_cm: float | None = None
    right_thigh_cm: float | None = None
    left_calf_cm: float | None = None
    right_calf_cm: float | None = None
    neck_cm: float | None = None
    shoulders_cm: float | None = None
    notes: str | None = None


class BodyMeasurementResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    measured_at: datetime
    weight_kg: float | None = None
    body_fat_pct: float | None = None
    chest_cm: float | None = None
    waist_cm: float | None = None
    hips_cm: float | None = None
    left_arm_cm: float | None = None
    right_arm_cm: float | None = None
    left_thigh_cm: float | None = None
    right_thigh_cm: float | None = None
    left_calf_cm: float | None = None
    right_calf_cm: float | None = None
    neck_cm: float | None = None
    shoulders_cm: float | None = None
    notes: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class BodyMeasurementStats(BaseModel):
    first_measurement: BodyMeasurementResponse | None = None
    latest_measurement: BodyMeasurementResponse | None = None
    weight_change_kg: float | None = None
    measurement_count: int = 0


class ProgressPhotoResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    measurement_id: uuid.UUID | None = None
    photo_url: str
    category: str
    taken_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}
