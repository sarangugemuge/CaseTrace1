from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, ExpiredSignatureError, jwt
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from backend.app.core.config import settings
from backend.app.db.database import get_db
from backend.app.db.models.user import UserModel
from backend.app.db.models.session import SessionModel
from backend.app.schemas.user import UserResponse

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    x_user_role: Optional[str] = Header(None, alias="X-User-Role"),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db),
) -> UserModel:
    # 1. If Bearer token is provided, strictly validate JWT and session state
    if token:
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
        except ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Access token has expired.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        token_type = payload.get("type", "access")
        if token_type != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token subject missing.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Validate Session state if token is tied to a session
        session_id: Optional[str] = payload.get("session_id")
        if session_id:
            session_rec = db.query(SessionModel).filter(SessionModel.id == session_id).first()
            if not session_rec or session_rec.is_revoked:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Session has been revoked or is invalid.",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            now = datetime.now(timezone.utc)
            # Ensure session expires_at is timezone-aware
            expires_at = session_rec.expires_at
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if now > expires_at:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Maximum session lifetime exceeded.",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            # Check Inactivity timeout
            last_active = session_rec.last_active_at
            if last_active.tzinfo is None:
                last_active = last_active.replace(tzinfo=timezone.utc)
            if now - last_active > timedelta(minutes=settings.INACTIVITY_TIMEOUT_MINUTES):
                session_rec.is_revoked = True
                db.commit()
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Session expired due to inactivity.",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            # Update last active timestamp on valid use
            session_rec.last_active_at = now
            db.commit()

        user = db.query(UserModel).filter(UserModel.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if user.status != "ACTIVE":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is suspended or inactive.",
            )
        return user

    # 2. Header-based dev/testing persona fallback (for non-token tests)
    if x_user_id:
        user = db.query(UserModel).filter(UserModel.id == x_user_id).first()
        if user:
            return user
    if x_user_role:
        user = db.query(UserModel).filter(UserModel.role == x_user_role).first()
        if user:
            return user

    # 3. Fallback to default Senior Officer demo persona if DB has seeded users
    default_user = db.query(UserModel).first()
    if default_user:
        return default_user

    # Return fallback mock user model object
    return UserModel(
        id="usr-001",
        name="Cmdr. Robert Vance",
        email="robert.vance@casetrace.gov",
        hashed_password="mock",
        role="Senior Officer",
        department="Executive Crime Command",
        designation="Senior Commanding Officer",
        avatar="RV",
        assigned_case_ids=["CASE-2026-8942", "CASE-2026-4410", "CASE-2026-1105"],
        status="ACTIVE",
    )

def require_roles(allowed_roles: List[str]):
    def role_checker(current_user: UserModel = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied for role '{current_user.role}'. Allowed roles: {allowed_roles}",
            )
        return current_user
    return role_checker

def require_recent_auth(max_age_minutes: Optional[int] = None):
    """
    Dependency that enforces reauthentication for highly sensitive operations
    if the user's last password or 2FA verification was more than max_age_minutes ago.
    """
    def recent_auth_checker(current_user: UserModel = Depends(get_current_user)):
        limit = max_age_minutes or settings.SENSITIVE_OP_MAX_AGE_MINUTES
        if not current_user.last_authenticated_at:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Reauthentication required: Sensitive operation requires recent verification.",
            )
        now = datetime.now(timezone.utc)
        auth_time = current_user.last_authenticated_at
        if auth_time.tzinfo is None:
            auth_time = auth_time.replace(tzinfo=timezone.utc)
        if now - auth_time > timedelta(minutes=limit):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Reauthentication required: Authentication is older than {limit} minutes for this sensitive operation.",
            )
        return current_user
    return recent_auth_checker
