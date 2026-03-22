import os
import uuid as uuid_mod
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from passlib.context import CryptContext

from app.auth.dependencies import get_current_active_user
from app.config import settings
from app.database import get_db
from app.models.user import User
from app.schemas.security import DeleteAccount, PasswordChange
from app.schemas.user import UserProfile, UserResponse, UserUpdate
from app.limiter import limiter
from app.utils.image import validate_image

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_me(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    update_data = user_in.model_dump(exclude_unset=True)
    if "username" in update_data and update_data["username"] != current_user.username:
        existing = await db.execute(select(User).where(User.username == update_data["username"]))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")
    for field, value in update_data.items():
        setattr(current_user, field, value)
    current_user.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(current_user)
    return current_user


@router.put("/me/avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    contents = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    img, ext = validate_image(contents, max_bytes)  # Vérifie le contenu réel, pas juste le Content-Type

    avatar_dir = os.path.join(settings.UPLOAD_DIR, "avatars")
    os.makedirs(avatar_dir, exist_ok=True)

    filename = f"{current_user.id}_{uuid_mod.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(avatar_dir, filename)

    img.thumbnail((400, 400))
    img.save(filepath)

    current_user.avatar_url = f"/uploads/avatars/{filename}"
    current_user.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(current_user)
    return current_user


@router.put("/me/password")
@limiter.limit("5/minute")
async def change_password(
    request: Request,
    data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    if not pwd_context.verify(data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    if len(data.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters",
        )
    current_user.password_hash = pwd_context.hash(data.new_password)
    current_user.updated_at = datetime.now(timezone.utc)
    await db.flush()
    return {"status": "ok"}


@router.delete("/me")
async def delete_account(
    data: DeleteAccount,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    if not pwd_context.verify(data.password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is incorrect",
        )
    await db.delete(current_user)
    return {"status": "deleted"}


@router.get("/{user_id}", response_model=UserProfile)
async def get_user_profile(
    user_id: uuid_mod.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.privacy != "public":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This profile is private")
    return user
