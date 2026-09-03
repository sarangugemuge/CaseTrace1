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
    
    # Fallback to SQLite if PostgreSQL is unavailable or configured for local dev
    DB_FALLBACK_URL: str = "sqlite:///./casetrace.db"
    
    # Database connection pool configuration
    DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "5"))
    DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "10"))
    DB_POOL_TIMEOUT: int = int(os.getenv("DB_POOL_TIMEOUT", "30"))
    
    # Mode selection: 'real' or 'mock'
    API_MODE: str = os.getenv("API_MODE", "real")

    JWT_SECRET: str = os.getenv("JWT_SECRET", "casetrace_secure_jwt_secret_key_2026_demo")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
