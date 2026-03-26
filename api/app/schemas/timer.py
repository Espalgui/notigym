import uuid
from datetime import datetime

from pydantic import BaseModel


class TimerPresetCreate(BaseModel):
    name: str
    preset_type: str
    config: str  # JSON string


class TimerPresetResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    preset_type: str
    config: str
    created_at: datetime

    model_config = {"from_attributes": True}
