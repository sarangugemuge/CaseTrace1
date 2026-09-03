import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

# Add root directory to sys.path
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.main import app
from backend.app.db.seed import seed_database
from backend.app.db.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_casetrace.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    seed_database(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)
    engine.dispose()
    try:
        if os.path.exists("test_casetrace.db"):
            os.remove("test_casetrace.db")
    except Exception:
        pass

@pytest.fixture
def client():
    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
