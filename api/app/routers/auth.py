import logging
import uuid as uuid_mod
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from jose import jwt
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
from app.utils.backup_codes import verify_and_consume_backup_code
from app.utils.email import send_login_notification_email, send_verification_email

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

_COOKIE_OPTS = dict(
    httponly=True,
    secure=settings.APP_ENV == "production",
    samesite="strict",
)


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    response.set_cookie("access_token", access_token, max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60, **_COOKIE_OPTS)
    response.set_cookie("refresh_token", refresh_token, max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400, **_COOKIE_OPTS)


def _create_email_verification_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    return jwt.encode(
        {"sub": user_id, "type": "email_verify", "exp": expire},
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(request: Request, response: Response, user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    result = await db.execute(select(User).where(User.username == user_in.username))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")

    user = User(
        email=user_in.email,
        password_hash=pwd_context.hash(user_in.password),
        username=user_in.username,
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        language=user_in.language,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    logger.info("REGISTER success email=%s username=%s ip=%s", user_in.email, user_in.username, request.client.host if request.client else "unknown")

    await create_notification(
        db,
        user_id=user.id,
        type="welcome",
        title="Bienvenue sur NotiGym !",
        message=f"Salut {user.username}, ton compte est prêt. Confirme ton email pour commencer !",
        link="/profile",
    )

    # Send verification email
    token = _create_email_verification_token(str(user.id))
    send_verification_email(user.email, user.username, token)

    return user


@router.get("/verify-email")
async def verify_email(token: str = Query(...), db: AsyncSession = Depends(get_db)):
    payload = verify_token(token)
    if not payload or payload.get("type") != "email_verify":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user.email_verified:
        return {"status": "already_verified"}

    user.email_verified = True
    await db.flush()
    return {"status": "verified"}


@router.post("/resend-verification")
@limiter.limit("3/minute")
async def resend_verification(request: Request, db: AsyncSession = Depends(get_db)):
    body = await request.json()
    email = body.get("email")
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email required")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    # Always return success to prevent email enumeration
    if not user or user.email_verified:
        return {"status": "ok"}

    token = _create_email_verification_token(str(user.id))
    send_verification_email(user.email, user.username, token)
    return {"status": "ok"}


@router.post("/login")
@limiter.limit("10/minute")
async def login(request: Request, response: Response, login_in: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == login_in.email))
    user = result.scalar_one_or_none()

    client_ip = request.client.host if request.client else "unknown"

    if not user or not pwd_context.verify(login_in.password, user.password_hash):
        logger.warning("LOGIN failed email=%s ip=%s reason=invalid_credentials", login_in.email, client_ip)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not user.is_active:
        logger.warning("LOGIN failed email=%s ip=%s reason=account_disabled", login_in.email, client_ip)
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")

    if not user.email_verified:
        logger.warning("LOGIN failed email=%s ip=%s reason=email_not_verified", login_in.email, client_ip)
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email not verified")

    if user.is_2fa_enabled:
        if not login_in.totp_code:
            return {"requires_2fa": True, "message": "2FA code required"}

        import json

        import pyotp

        totp = pyotp.TOTP(user.totp_secret)
        code_valid = totp.verify(login_in.totp_code, valid_window=1)

        if not code_valid:
            stored_codes = json.loads(user.backup_codes or "[]")
            valid, remaining = verify_and_consume_backup_code(login_in.totp_code, stored_codes)
            if valid:
                user.backup_codes = json.dumps(remaining)
                await db.flush()
            else:
                logger.warning("LOGIN failed email=%s ip=%s reason=invalid_2fa", login_in.email, client_ip)
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid 2FA code")

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    _set_auth_cookies(response, access_token, refresh_token)

    logger.info("LOGIN success email=%s ip=%s 2fa=%s", user.email, client_ip, user.is_2fa_enabled)

    # Send login notification email (fire & forget)
    send_login_notification_email(user.email, user.username)

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
