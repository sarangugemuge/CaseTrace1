from fastapi import APIRouter
from backend.app.db.database import verify_db_connection
from backend.app.services.storage_service import storage_service

router = APIRouter()

@router.get("/health")
def health_check():
    db_status = verify_db_connection()
    storage_status = storage_service.verify_storage_connection()
    
    return {
        "status": "ok",
        "service": "casetrace-api",
        "database": db_status,
        "storage": storage_status
    }
