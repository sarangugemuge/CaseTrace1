from sqlalchemy import Column, String, Boolean, DateTime, Index
from datetime import datetime, timezone
from backend.app.db.database import Base

class SessionModel(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    refresh_token_hash = Column(String, nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    last_active_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    is_revoked = Column(Boolean, default=False, nullable=False)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)

    __table_args__ = (
        Index("idx_sessions_user_revoked", "user_id", "is_revoked"),
        Index("idx_sessions_token_hash", "refresh_token_hash"),
    )
