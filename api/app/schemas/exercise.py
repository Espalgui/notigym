import uuid
from datetime import datetime

from pydantic import BaseModel


class ExerciseCreate(BaseModel):
    name_fr: str
    name_en: str
    muscle_group: str
    category: str
    description_fr: str | None = None
    description_en: str | None = None
    is_compound: bool = False


class ExerciseUpdate(BaseModel):
    name_fr: str | None = None
    name_en: str | None = None
    muscle_group: str | None = None
    category: str | None = None
    description_fr: str | None = None
    description_en: str | None = None
    is_compound: bool | None = None


class ExerciseResponse(BaseModel):
    id: uuid.UUID
    name_key: str
    name_fr: str
    name_en: str
    muscle_group: str
    category: str
    description_fr: str | None = None
    description_en: str | None = None
    image_url: str | None = None
    is_compound: bool
    is_custom: bool
    created_by: uuid.UUID | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
