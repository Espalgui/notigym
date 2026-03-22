import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    username: str = Field(min_length=2, max_length=50, pattern=r"^[a-zA-Z0-9_-]+$")
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    language: str = Field(default="fr", max_length=10)


class UserUpdate(BaseModel):
    username: str | None = Field(default=None, min_length=2, max_length=50, pattern=r"^[a-zA-Z0-9_-]+$")
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    date_of_birth: date | None = None
    height_cm: float | None = Field(default=None, ge=50, le=300)
    gender: Literal["male", "female", "other"] | None = None
    goal: str | None = Field(default=None, max_length=500)
    training_type: Literal["musculation", "poids_corps", "machines", "hiit", "isometrie", "mixed"] | None = None
    privacy: Literal["public", "private"] | None = None
    language: str | None = Field(default=None, max_length=10)


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    username: str
    first_name: str
    last_name: str
    avatar_url: str | None = None
    date_of_birth: date | None = None
    height_cm: float | None = None
    gender: str | None = None
    goal: str | None = None
    training_type: str | None = None
    privacy: str
    language: str
    is_active: bool
    is_admin: bool = False
    is_2fa_enabled: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserProfile(BaseModel):
    id: uuid.UUID
    username: str
    first_name: str
    last_name: str
    avatar_url: str | None = None
    goal: str | None = None

    model_config = {"from_attributes": True}
