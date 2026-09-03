from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from typing import Optional, List
from backend.app.core.config import settings
from backend.app.db.database import get_db
from backend.app.db.models.user import UserModel
from backend.app.schemas.user import UserResponse

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    x_user_role: Optional[str] = Header(None, alias="X-User-Role"),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db),
) -> UserModel:
    # 1. Try JWT token authentication
    if token:
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id:
                user = db.query(UserModel).filter(UserModel.id == user_id).first()
                if user:
                    return user
        except JWTError:
            pass

    # 2. Try Header-based dev/demo persona authentication fallback
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
