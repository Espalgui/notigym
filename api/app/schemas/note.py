import uuid
from datetime import date, datetime
from pydantic import BaseModel


class NoteCreate(BaseModel):
    date: date
    title: str | None = None
    content: str


class NoteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None


class NoteResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    date: date
    title: str | None = None
    content: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
