from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification
from app.models.user import User

PROGRAM_TYPES = {"workout_completed", "whey_reminder"}
COMMUNITY_TYPES = {"like", "comment", "new_post"}


async def create_notification(
    db: AsyncSession,
    *,
    user_id,
    type: str,
    title: str,
    message: str,
    link: str | None = None,
):
    # Check per-category preferences
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user:
        if not user.notifications_enabled:
            return None
        if type in PROGRAM_TYPES and not user.notif_program_enabled:
            return None
        if type in COMMUNITY_TYPES and not user.notif_community_enabled:
            return None

    notif = Notification(
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        link=link,
    )
    db.add(notif)
    await db.flush()
    return notif


def get_notification_category(type: str) -> str:
    """Return 'program' or 'community' for a notification type."""
    if type in PROGRAM_TYPES:
        return "program"
    return "community"
