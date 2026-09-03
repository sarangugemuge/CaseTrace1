from sqlalchemy import Column, String, Boolean, DateTime, JSON
from datetime import datetime, timezone
from backend.app.db.database import Base

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, index=True, nullable=False)
    department = Column(String, nullable=False)
    designation = Column(String, nullable=False)
    avatar = Column(String, nullable=False)
    assigned_case_ids = Column(JSON, default=list)
    status = Column(String, default="ACTIVE")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
