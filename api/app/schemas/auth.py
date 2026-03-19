from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    totp_code: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    requires_2fa: bool = False


class TwoFARequired(BaseModel):
    requires_2fa: bool = True
    message: str = "2FA code required"


class RefreshRequest(BaseModel):
    refresh_token: str
