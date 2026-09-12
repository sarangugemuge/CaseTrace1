from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.db.database import engine, Base, SessionLocal
from backend.app.db.models.user import UserModel
from backend.app.db.seed import seed_database
from backend.app.api.routes import health, auth, cases, documents, audit, verification, dashboard, search, notifications, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables automatically if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Seed database with all personas & cases (idempotent)
    db = SessionLocal()
    try:
        seed_database(db)
    except Exception as e:
        print(f"Startup seed notice: {e}")
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$|^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root health check endpoint for cloud platforms (Render, Railway, AWS ALB)
@app.get("/", tags=["Health"])
def root():
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "health": f"{settings.API_PREFIX}/health"
    }

# Include Routers
app.include_router(health.router, prefix=settings.API_PREFIX, tags=["Health"])
app.include_router(auth.router, prefix=settings.API_PREFIX, tags=["Auth"])
app.include_router(cases.router, prefix=settings.API_PREFIX, tags=["Cases"])
app.include_router(documents.router, prefix=settings.API_PREFIX, tags=["Documents"])
app.include_router(audit.router, prefix=settings.API_PREFIX, tags=["Audit"])
app.include_router(verification.router, prefix=settings.API_PREFIX, tags=["Verification"])
app.include_router(dashboard.router, prefix=settings.API_PREFIX, tags=["Dashboard"])
app.include_router(search.router, prefix=settings.API_PREFIX, tags=["Search"])
app.include_router(notifications.router, prefix=settings.API_PREFIX, tags=["Notifications"])
app.include_router(admin.router, prefix=settings.API_PREFIX, tags=["Admin & System Configuration"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
