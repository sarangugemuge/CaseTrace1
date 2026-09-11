from pydantic import BaseModel
from typing import Optional
from backend.app.schemas.user import UserResponse

class LoginResponse(BaseModel):
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    expires_in: Optional[int] = None
    user: Optional[UserResponse] = None
    message: Optional[str] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class RefreshTokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class ReauthRequest(BaseModel):
    password: Optional[str] = None

class ReauthResponse(BaseModel):
    success: bool
    message: str
    authenticated_at: str

class SessionStatusResponse(BaseModel):
    active: bool
    user_id: str
    role: str
    last_authenticated_at: Optional[str] = None
    inactivity_timeout_seconds: int
    max_session_lifetime_seconds: int
