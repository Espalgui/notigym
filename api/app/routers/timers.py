import uuid as uuid_mod

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_active_user
from app.database import get_db
from app.models.timer import TimerPreset
from app.models.user import User
from app.schemas.timer import TimerPresetCreate, TimerPresetResponse

router = APIRouter(prefix="/timers", tags=["timers"])


@router.get("/presets", response_model=list[TimerPresetResponse])
async def list_presets(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TimerPreset)
        .where(TimerPreset.user_id == current_user.id)
        .order_by(TimerPreset.created_at.desc())
    )
    return result.scalars().all()


@router.post("/presets", response_model=TimerPresetResponse, status_code=status.HTTP_201_CREATED)
async def create_preset(
    data: TimerPresetCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    if data.preset_type not in ("classic", "tabata"):
        raise HTTPException(status_code=400, detail="preset_type must be 'classic' or 'tabata'")

    preset = TimerPreset(
        user_id=current_user.id,
        name=data.name,
        preset_type=data.preset_type,
        config=data.config,
    )
    db.add(preset)
    await db.flush()
    await db.refresh(preset)
    return preset


@router.delete("/presets/{preset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_preset(
    preset_id: uuid_mod.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TimerPreset).where(
            TimerPreset.id == preset_id,
            TimerPreset.user_id == current_user.id,
        )
    )
    preset = result.scalar_one_or_none()
    if not preset:
        raise HTTPException(status_code=404, detail="Preset not found")
    await db.delete(preset)
