import uuid
from datetime import datetime

from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: uuid.UUID
    type: str
    title: str
    message: str
    link: str | None = None
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class NotificationCount(BaseModel):
    unread: int
    total: int


class NotificationPreferences(BaseModel):
    notifications_enabled: bool
    notif_program_enabled: bool
    notif_community_enabled: bool
    muted_user_ids: list[uuid.UUID]


class NotificationPreferencesUpdate(BaseModel):
    notifications_enabled: bool
    notif_program_enabled: bool | None = None
    notif_community_enabled: bool | None = None


class UserForNotification(BaseModel):
    id: uuid.UUID
    username: str
    avatar_url: str | None = None

    model_config = {"from_attributes": True}
