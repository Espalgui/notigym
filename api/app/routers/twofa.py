import base64
import io
import json
import secrets

import pyotp
import qrcode
from fastapi import APIRouter, Depends, HTTPException, status
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_active_user
from app.database import get_db
from app.models.user import User
from app.schemas.twofa import (
    TwoFADisableRequest,
    TwoFASetupResponse,
    TwoFAStatusResponse,
    TwoFAVerifyRequest,
)

router = APIRouter(prefix="/auth/2fa", tags=["2fa"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _generate_backup_codes(count: int = 8) -> list[str]:
    return [secrets.token_hex(4).upper() for _ in range(count)]


def _make_qr_base64(uri: str) -> str:
    img = qrcode.make(uri, box_size=6, border=2)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


@router.get("/status", response_model=TwoFAStatusResponse)
async def twofa_status(current_user: User = Depends(get_current_active_user)):
    return TwoFAStatusResponse(is_enabled=current_user.is_2fa_enabled)


@router.post("/setup", response_model=TwoFASetupResponse)
async def twofa_setup(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.is_2fa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is already enabled",
        )

    secret = pyotp.random_base32()
    totp = pyotp.TOTP(secret)
    provisioning_uri = totp.provisioning_uri(
        name=current_user.email,
        issuer_name="NotiGym",
    )
    qr_code = _make_qr_base64(provisioning_uri)
    backup_codes = _generate_backup_codes()

    current_user.totp_secret = secret
    current_user.backup_codes = json.dumps(backup_codes)
    await db.flush()

    return TwoFASetupResponse(
        secret=secret,
        qr_code=qr_code,
        backup_codes=backup_codes,
    )


@router.post("/verify", response_model=TwoFAStatusResponse)
async def twofa_verify(
    body: TwoFAVerifyRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.is_2fa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is already enabled",
        )
    if not current_user.totp_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Call /setup first",
        )

    totp = pyotp.TOTP(current_user.totp_secret)
    if not totp.verify(body.code, valid_window=1):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid code",
        )

    current_user.is_2fa_enabled = True
    await db.flush()

    return TwoFAStatusResponse(is_enabled=True)


@router.post("/disable", response_model=TwoFAStatusResponse)
async def twofa_disable(
    body: TwoFADisableRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.is_2fa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is not enabled",
        )

    if not pwd_context.verify(body.password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password",
        )

    totp = pyotp.TOTP(current_user.totp_secret)
    code_valid = totp.verify(body.code, valid_window=1)

    if not code_valid:
        stored_codes = json.loads(current_user.backup_codes or "[]")
        if body.code.upper() in stored_codes:
            stored_codes.remove(body.code.upper())
            current_user.backup_codes = json.dumps(stored_codes)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid code",
            )

    current_user.is_2fa_enabled = False
    current_user.totp_secret = None
    current_user.backup_codes = None
    await db.flush()

    return TwoFAStatusResponse(is_enabled=False)


@router.get("/backup-codes")
async def get_backup_codes(
    current_user: User = Depends(get_current_active_user),
):
    if not current_user.is_2fa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is not enabled",
        )
    codes = json.loads(current_user.backup_codes or "[]")
    return {"codes": codes}


@router.post("/backup-codes/regenerate")
async def regenerate_backup_codes(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.is_2fa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA is not enabled",
        )
    codes = _generate_backup_codes()
    current_user.backup_codes = json.dumps(codes)
    await db.flush()
    return {"codes": codes}
