from fastapi import APIRouter
from backend.app.db.database import verify_db_connection

router = APIRouter()

@router.get("/health")
def health_check():
    db_status = verify_db_connection()
    return {
        "status": "ok",
        "service": "casetrace-api",
        "database": db_status
    }
