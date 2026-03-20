import logging
import secrets
import string
import uuid as uuid_mod

from fastapi import APIRouter, Depends, HTTPException, Request, status
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_active_user
from app.database import get_db
from app.limiter import limiter
from app.models.user import User
from app.schemas.user import UserResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def get_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


class AdminUserResponse(BaseModel):
    id: uuid_mod.UUID
    email: str
    first_name: str
    last_name: str
    is_active: bool
    is_admin: bool
    is_2fa_enabled: bool
    gender: str | None = None
    goal: str | None = None
    training_type: str | None = None
    created_at: str

    model_config = {"from_attributes": True}


class PasswordResetResponse(BaseModel):
    temp_password: str


@router.get("/users", response_model=list[AdminUserResponse])
async def list_users(
    _: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    return [
        AdminUserResponse(
            id=u.id,
            email=u.email,
            first_name=u.first_name,
            last_name=u.last_name,
            is_active=u.is_active,
            is_admin=u.is_admin,
            is_2fa_enabled=u.is_2fa_enabled,
            gender=u.gender,
            goal=u.goal,
            training_type=u.training_type,
            created_at=u.created_at.isoformat(),
        )
        for u in users
    ]


@router.put("/users/{user_id}/toggle-active", response_model=AdminUserResponse)
async def toggle_user_active(
    user_id: uuid_mod.UUID,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
    user.is_active = not user.is_active
    await db.flush()
    return AdminUserResponse(
        id=user.id, email=user.email, first_name=user.first_name, last_name=user.last_name,
        is_active=user.is_active, is_admin=user.is_admin, is_2fa_enabled=user.is_2fa_enabled,
        gender=user.gender, goal=user.goal, training_type=user.training_type,
        created_at=user.created_at.isoformat(),
    )


@router.post("/users/{user_id}/reset-password", response_model=PasswordResetResponse)
@limiter.limit("10/minute")
async def reset_user_password(
    request: Request,
    user_id: uuid_mod.UUID,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    alphabet = string.ascii_letters + string.digits + "!@#$%"
    temp_password = "".join(secrets.choice(alphabet) for _ in range(12))
    user.password_hash = pwd_context.hash(temp_password)
    # Désactive le 2FA pour que l'utilisateur puisse se reconnecter
    user.is_2fa_enabled = False
    user.totp_secret = None
    user.backup_codes = None
    await db.flush()

    logger.warning("ADMIN %s reset password for user %s", admin.id, user_id)
    return PasswordResetResponse(temp_password=temp_password)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("10/minute")
async def delete_user(
    request: Request,
    user_id: uuid_mod.UUID,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    logger.warning("ADMIN %s deleted user %s", admin.id, user_id)
    await db.delete(user)
