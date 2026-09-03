# CASETRACE — Secure Digital Case Passport & RBAC Infrastructure

> **Core Architecture Principle:**
> **ONE CASE → ONE DIGITAL CASE PASSPORT → MULTIPLE SECURE VIEWS**
> Access decisions dynamically depend on: `USER ROLE + CASE ASSIGNMENT + DOCUMENT SENSITIVITY + PURPOSE OF ACCESS`.

---

## Phase 5: PostgreSQL Database Integration & Service Architecture

CASETRACE Phase 5 connects the FastAPI backend to a production PostgreSQL database with connection pooling, Alembic migrations, repository/service separation, and environment-controlled data source modes (`NEXT_PUBLIC_API_MODE=real` | `mock`).

### 1. Environment Configuration

Copy `.env.example` to `.env`:

```bash
# Frontend Data Source Mode ('real' for FastAPI + PostgreSQL, 'mock' for local fallback)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_MODE=real

# Backend Database Configuration (PostgreSQL URL format)
DATABASE_URL=postgresql://casetrace_user:casetrace_pass@localhost:5432/casetrace_db
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10
DB_POOL_TIMEOUT=30

# JWT & Security Settings
JWT_SECRET=casetrace_secure_jwt_secret_key_2026_demo
ALGORITHM=HS256
```

### 2. Database Creation & Alembic Migrations

If running a local PostgreSQL instance:

```bash
# 1. Create PostgreSQL Database
createdb -U casetrace_user casetrace_db

# 2. Run Alembic Deterministic Database Migrations
alembic upgrade head

# 3. Seed Development Demo Data (7 Personas, 3 Cases, Document Metadata, Audit Logs)
python -m backend.app.db.seed
```

*(Note: If PostgreSQL is not available locally, the backend automatically uses the development SQLite engine fallback `sqlite:///./casetrace.db` without crashing).*

### 3. Running the Platform

```bash
# Start FastAPI Backend API (Port 8000)
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload

# Start Next.js Frontend (Port 3000)
npm run dev
```

### 4. Running Verification Suite

```bash
# Run Backend Pytest Suite (15 Tests)
python -m pytest backend/tests

# Run Frontend Typecheck & ESLint
.\node_modules\.bin\tsc --noEmit --incremental false
.\node_modules\.bin\eslint "src/**/*.ts" "src/**/*.tsx"
```
