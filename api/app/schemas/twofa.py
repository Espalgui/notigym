from pydantic import BaseModel


class TwoFASetupResponse(BaseModel):
    secret: str
    qr_code: str
    backup_codes: list[str]


class TwoFAVerifyRequest(BaseModel):
    code: str


class TwoFADisableRequest(BaseModel):
    password: str
    code: str


class TwoFAStatusResponse(BaseModel):
    is_enabled: bool
