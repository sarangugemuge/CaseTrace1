import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "CASETRACE API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Environment-driven database URL (Supports PostgreSQL and SQLite fallback)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://casetrace_user:casetrace_pass@localhost:5432/casetrace_db"
    )
    DB_FALLBACK_URL: str = "sqlite:///./casetrace.db"
    
    # Database connection pool configuration
    DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "5"))
    DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "10"))
    DB_POOL_TIMEOUT: int = int(os.getenv("DB_POOL_TIMEOUT", "30"))
    
    # Mode selection: 'real' or 'mock'
    API_MODE: str = os.getenv("API_MODE", "real")

    # MinIO / S3-Compatible Object Storage Configuration
    STORAGE_ENDPOINT: str = os.getenv("STORAGE_ENDPOINT", "http://localhost:9000")
    STORAGE_ACCESS_KEY: str = os.getenv("STORAGE_ACCESS_KEY", "minioadmin")
    STORAGE_SECRET_KEY: str = os.getenv("STORAGE_SECRET_KEY", "minioadmin")
    STORAGE_BUCKET: str = os.getenv("STORAGE_BUCKET", "casetrace")
    STORAGE_REGION: str = os.getenv("STORAGE_REGION", "us-east-1")
    STORAGE_SECURE: bool = os.getenv("STORAGE_SECURE", "false").lower() == "true"

    JWT_SECRET: str = os.getenv("JWT_SECRET", "casetrace_secure_jwt_secret_key_2026_demo")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10"))
    INACTIVITY_TIMEOUT_MINUTES: int = int(os.getenv("INACTIVITY_TIMEOUT_MINUTES", "15"))
    REFRESH_TOKEN_EXPIRE_HOURS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_HOURS", "8"))
    SENSITIVE_OP_MAX_AGE_MINUTES: int = int(os.getenv("SENSITIVE_OP_MAX_AGE_MINUTES", "15"))
    
    CORS_ORIGINS: List[str] = [
        o.strip()
        for o in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
        if o.strip()
    ]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
