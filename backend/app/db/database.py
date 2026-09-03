import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.app.core.config import settings

logger = logging.getLogger("casetrace.db")

def create_db_engine(db_url: str):
    connect_args = {}
    engine_kwargs = {"pool_pre_ping": True}
    
    if db_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
    else:
        # PostgreSQL pool configuration
        engine_kwargs.update({
            "pool_size": settings.DB_POOL_SIZE,
            "max_overflow": settings.DB_MAX_OVERFLOW,
            "pool_timeout": settings.DB_POOL_TIMEOUT,
        })
        
    return create_engine(db_url, connect_args=connect_args, **engine_kwargs)

# Primary database engine attempt
target_url = settings.DATABASE_URL
engine = None
is_postgres = target_url.startswith("postgresql")

try:
    engine = create_db_engine(target_url)
    # Quick connectivity test
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    logger.info(f"Successfully connected to database engine at {target_url.split('@')[-1]}")
except Exception as e:
    if is_postgres:
        logger.warning(f"Unable to connect to primary PostgreSQL database ({e}). Falling back to SQLite dev engine.")
        target_url = settings.DB_FALLBACK_URL
        engine = create_db_engine(target_url)
    else:
        engine = create_db_engine(target_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_db_connection() -> dict:
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1")).scalar()
            dialect = engine.dialect.name
            return {
                "status": "connected",
                "dialect": dialect,
                "is_postgres": dialect == "postgresql",
                "url_target": target_url.split('@')[-1]
            }
    except Exception as err:
        return {
            "status": "error",
            "error": str(err),
            "is_postgres": False
        }
