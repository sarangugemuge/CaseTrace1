import pytest
from backend.app.core.config import Settings
from backend.app.db.database import verify_db_connection, engine

def test_db_settings_defaults():
    s = Settings()
    assert s.PROJECT_NAME == "CASETRACE API"
    assert s.DB_POOL_SIZE >= 1
    assert s.DB_MAX_OVERFLOW >= 1

def test_verify_db_connection_status():
    res = verify_db_connection()
    assert "status" in res
    assert res["status"] in ["connected", "error"]
    assert "is_postgres" in res
