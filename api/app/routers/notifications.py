import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_active_user
from app.database import get_db
from app.models.notification import Notification
from app.models.notification_mute import NotificationMute
from app.models.user import User
from app.schemas.notification import (
    NotificationCount,
    NotificationPreferences,
    NotificationPreferencesUpdate,
    NotificationResponse,
    UserForNotification,
)

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationResponse])
async def list_notifications(
    limit: int = 30,
    unread_only: bool = False,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Notification).where(Notification.user_id == current_user.id)
    if unread_only:
        query = query.where(Notification.is_read == False)  # noqa: E712
    query = query.order_by(Notification.created_at.desc()).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/count", response_model=NotificationCount)
async def notification_count(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    unread = await db.execute(
        select(func.count()).select_from(Notification).where(
            Notification.user_id == current_user.id,
            Notification.is_read == False,  # noqa: E712
        )
    )
    total = await db.execute(
        select(func.count()).select_from(Notification).where(
            Notification.user_id == current_user.id,
        )
    )
    return NotificationCount(unread=unread.scalar_one(), total=total.scalar_one())


@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def mark_as_read(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
    )
    notif = result.scalar_one_or_none()
    if not notif:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    await db.flush()
    return notif


@router.put("/read-all")
async def mark_all_read(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(
        update(Notification)
        .where(
            Notification.user_id == current_user.id,
            Notification.is_read == False,  # noqa: E712
        )
        .values(is_read=True)
    )
    return {"status": "ok"}


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
    )
    notif = result.scalar_one_or_none()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    await db.delete(notif)
    return {"status": "deleted"}


# ── Préférences de notification ──────────────────────────────────────────────

@router.get("/preferences", response_model=NotificationPreferences)
async def get_preferences(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    mutes = await db.execute(
        select(NotificationMute.muted_user_id).where(
            NotificationMute.user_id == current_user.id
        )
    )
    return NotificationPreferences(
        notifications_enabled=current_user.notifications_enabled,
        muted_user_ids=mutes.scalars().all(),
    )


@router.put("/preferences", response_model=NotificationPreferences)
async def update_preferences(
    data: NotificationPreferencesUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    current_user.notifications_enabled = data.notifications_enabled
    await db.flush()
    mutes = await db.execute(
        select(NotificationMute.muted_user_id).where(
            NotificationMute.user_id == current_user.id
        )
    )
    return NotificationPreferences(
        notifications_enabled=current_user.notifications_enabled,
        muted_user_ids=mutes.scalars().all(),
    )


@router.get("/users", response_model=list[UserForNotification])
async def list_users_for_mute(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retourne tous les utilisateurs (sans leur email) pour la gestion des mutes."""
    result = await db.execute(
        select(User).where(User.id != current_user.id, User.is_active == True)  # noqa: E712
        .order_by(User.username)
    )
    return result.scalars().all()


@router.post("/mute/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def mute_user(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot mute yourself")
    exists = await db.execute(
        select(NotificationMute).where(
            NotificationMute.user_id == current_user.id,
            NotificationMute.muted_user_id == user_id,
        )
    )
    if not exists.scalar_one_or_none():
        db.add(NotificationMute(user_id=current_user.id, muted_user_id=user_id))
        await db.flush()


@router.delete("/mute/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unmute_user(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(NotificationMute).where(
            NotificationMute.user_id == current_user.id,
            NotificationMute.muted_user_id == user_id,
        )
    )
    mute = result.scalar_one_or_none()
    if mute:
        await db.delete(mute)
        await db.flush()
