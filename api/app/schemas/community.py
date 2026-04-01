import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.schemas.recipe import RecipeResponse
from app.schemas.user import UserProfile


class PostCreate(BaseModel):
    post_type: Literal["general", "workout", "pr", "progress", "recipe"]
    content: str = Field(min_length=1, max_length=5000)
    reference_id: uuid.UUID | None = None
    image_url: str | None = None

    @field_validator("image_url")
    @classmethod
    def validate_image_url(cls, v: str | None) -> str | None:
        if v is not None and not v.startswith("/uploads/"):
            raise ValueError("image_url must be a relative /uploads/ path")
        return v


class PostResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    post_type: str
    content: str
    reference_id: uuid.UUID | None = None
    image_url: str | None = None
    likes_count: int
    comments_count: int
    created_at: datetime
    updated_at: datetime
    author: UserProfile | None = None
    liked_by_me: bool = False
    recipe: RecipeResponse | None = None

    model_config = {"from_attributes": True}


class CommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=1000)


class CommentResponse(BaseModel):
    id: uuid.UUID
    post_id: uuid.UUID
    user_id: uuid.UUID
    content: str
    created_at: datetime
    updated_at: datetime
    author: UserProfile | None = None

    model_config = {"from_attributes": True}
