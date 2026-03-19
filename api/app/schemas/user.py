import uuid
from datetime import date, datetime

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    language: str = "fr"


class UserUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    date_of_birth: date | None = None
    height_cm: float | None = None
    gender: str | None = None
    goal: str | None = None
    privacy: str | None = None
    language: str | None = None


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    first_name: str
    last_name: str
    avatar_url: str | None = None
    date_of_birth: date | None = None
    height_cm: float | None = None
    gender: str | None = None
    goal: str | None = None
    privacy: str
    language: str
    is_active: bool
    is_2fa_enabled: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserProfile(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: str
    avatar_url: str | None = None
    goal: str | None = None

    model_config = {"from_attributes": True}
