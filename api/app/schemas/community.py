import uuid
from datetime import datetime

from pydantic import BaseModel

from app.schemas.user import UserProfile


class PostCreate(BaseModel):
    post_type: str
    content: str
    reference_id: uuid.UUID | None = None
    image_url: str | None = None


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

    model_config = {"from_attributes": True}


class CommentCreate(BaseModel):
    content: str


class CommentResponse(BaseModel):
    id: uuid.UUID
    post_id: uuid.UUID
    user_id: uuid.UUID
    content: str
    created_at: datetime
    updated_at: datetime
    author: UserProfile | None = None

    model_config = {"from_attributes": True}
