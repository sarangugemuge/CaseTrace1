from sqlalchemy import Column, String, Boolean, JSON, DateTime, Index
from datetime import datetime, timezone
from backend.app.db.database import Base

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, index=True)
    department = Column(String, nullable=False)
    designation = Column(String, nullable=False)
    avatar = Column(String, nullable=False)
    assigned_case_ids = Column(JSON, nullable=True, default=list)
    status = Column(String, default="ACTIVE")
    
    # Two-Factor Authentication (TOTP & Recovery Codes)
    totp_secret = Column(String, nullable=True)
    totp_pending_secret = Column(String, nullable=True)
    is_totp_enabled = Column(Boolean, default=False, nullable=False)
    recovery_codes = Column(JSON, nullable=True, default=list)
    
    # Session & Security Tracking
    last_authenticated_at = Column(DateTime, nullable=True, default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("idx_users_role_status", "role", "status"),
    )
