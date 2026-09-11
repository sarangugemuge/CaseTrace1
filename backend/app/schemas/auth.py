from pydantic import BaseModel
from typing import Optional, List
from backend.app.schemas.user import UserResponse

class LoginResponse(BaseModel):
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    expires_in: Optional[int] = None
    user: Optional[UserResponse] = None
    requires_2fa: bool = False
    temp_token: Optional[str] = None
    message: Optional[str] = None

class TotpVerifyRequest(BaseModel):
    temp_token: str
    code: str
    is_recovery_code: bool = False

class TotpSetupResponse(BaseModel):
    secret: str
    qr_code: str
    manual_entry_key: str
    issuer: str

class TotpEnableRequest(BaseModel):
    code: str

class TotpEnableResponse(BaseModel):
    success: bool
    message: str
    recovery_codes: List[str]

class TotpDisableRequest(BaseModel):
    password: Optional[str] = None
    code: Optional[str] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class RefreshTokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class ReauthRequest(BaseModel):
    password: Optional[str] = None
    code: Optional[str] = None

class ReauthResponse(BaseModel):
    success: bool
    message: str
    authenticated_at: str

class SessionStatusResponse(BaseModel):
    active: bool
    user_id: str
    role: str
    is_totp_enabled: bool
    last_authenticated_at: Optional[str] = None
    inactivity_timeout_seconds: int
    max_session_lifetime_seconds: int
