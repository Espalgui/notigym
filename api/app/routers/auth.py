import uuid as uuid_mod

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt import create_access_token, create_refresh_token, verify_token
from app.config import settings
from app.database import get_db
from app.limiter import limiter
from app.models.user import User
from app.notifications import create_notification
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

_COOKIE_OPTS = dict(
    httponly=True,
    secure=settings.APP_ENV == "production",
    samesite="lax",
)


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    response.set_cookie("access_token", access_token, max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60, **_COOKIE_OPTS)
    response.set_cookie("refresh_token", refresh_token, max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400, **_COOKIE_OPTS)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(request: Request, response: Response, user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=user_in.email,
        password_hash=pwd_context.hash(user_in.password),
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        language=user_in.language,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    await create_notification(
        db,
        user_id=user.id,
        type="welcome",
        title="Bienvenue sur NotiGym !",
        message=f"Salut {user.first_name}, ton compte est prêt. Configure ton profil et crée ton premier programme !",
        link="/profile",
    )

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    _set_auth_cookies(response, access_token, refresh_token)

    return user


@router.post("/login")
@limiter.limit("10/minute")
async def login(request: Request, response: Response, login_in: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == login_in.email))
    user = result.scalar_one_or_none()

    if not user or not pwd_context.verify(login_in.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")

    if user.is_2fa_enabled:
        if not login_in.totp_code:
            return {"requires_2fa": True, "message": "2FA code required"}

        import json

        import pyotp

        totp = pyotp.TOTP(user.totp_secret)
        code_valid = totp.verify(login_in.totp_code, valid_window=1)

        if not code_valid:
            stored_codes = json.loads(user.backup_codes or "[]")
            if login_in.totp_code.upper() in stored_codes:
                stored_codes.remove(login_in.totp_code.upper())
                user.backup_codes = json.dumps(stored_codes)
                await db.flush()
            else:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid 2FA code")

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    _set_auth_cookies(response, access_token, refresh_token)

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
@limiter.limit("20/minute")
async def refresh(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    # Cookie en priorité, fallback sur le body JSON
    refresh_token_value = request.cookies.get("refresh_token")
    if not refresh_token_value:
        try:
            body = await request.json()
            refresh_token_value = body.get("refresh_token")
        except Exception:
            pass

    if not refresh_token_value:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token provided")

    payload = verify_token(refresh_token_value)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user_id = payload.get("sub")
    try:
        uuid_mod.UUID(str(user_id))
    except (ValueError, AttributeError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    _set_auth_cookies(response, access_token, refresh_token)

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return None
