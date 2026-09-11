import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Any, Tuple
from jose import jwt
from backend.app.core.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return get_password_hash(plain_password) == hashed_password

def get_password_hash(password: str) -> str:
    # Salted SHA-256 password hash using secret
    salt = settings.JWT_SECRET
    return hashlib.sha256((password + salt).encode("utf-8")).hexdigest()

def hash_token(token: str) -> str:
    # Secure hash of token for database storage
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

def create_access_token(
    subject: str | Any,
    session_id: Optional[str] = None,
    role: Optional[str] = None,
    expires_delta: Optional[timedelta] = None
) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "access",
    }
    if session_id:
        to_encode["session_id"] = str(session_id)
    if role:
        to_encode["role"] = str(role)

    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token() -> Tuple[str, str]:
    """Generates a cryptographically strong refresh token and its SHA-256 hash."""
    raw_token = secrets.token_urlsafe(48)
    token_hash = hash_token(raw_token)
    return raw_token, token_hash
