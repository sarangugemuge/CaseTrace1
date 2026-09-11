from sqlalchemy import Column, String, JSON, Boolean, DateTime
from datetime import datetime, timezone
from backend.app.db.database import Base

class RoleModel(Base):
    __tablename__ = "roles"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    role_key = Column(String, nullable=False, unique=True, index=True)
    description = Column(String, nullable=True)
    permissions = Column(JSON, nullable=False, default=list)
    is_active = Column(Boolean, default=True)
    is_system = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
