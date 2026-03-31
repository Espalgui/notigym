import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_active_user
from app.database import get_db
from app.models.achievement import Achievement, UserAchievement
from app.models.user import User
from app.services.achievements import get_current_streak

router = APIRouter(prefix="/achievements", tags=["achievements"])


@router.get("")
async def list_achievements(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List all achievements with user's unlock status."""
    lang = current_user.language or "fr"

    all_result = await db.execute(select(Achievement).order_by(Achievement.category, Achievement.threshold))
    achievements = all_result.scalars().all()

    unlocked_result = await db.execute(
        select(UserAchievement).where(UserAchievement.user_id == current_user.id)
    )
    unlocked_map = {ua.achievement_id: ua.unlocked_at for ua in unlocked_result.scalars().all()}

    return [
        {
            "id": str(a.id),
            "key": a.key,
            "name": a.name_fr if lang.startswith("fr") else a.name_en,
            "description": a.description_fr if lang.startswith("fr") else a.description_en,
            "icon": a.icon,
            "category": a.category,
            "threshold": a.threshold,
            "unlocked": a.id in unlocked_map,
            "unlocked_at": unlocked_map[a.id].isoformat() if a.id in unlocked_map else None,
        }
        for a in achievements
    ]


@router.get("/streak")
async def get_streak(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    streak = await get_current_streak(db, current_user.id)
    return {"current_streak": streak}
