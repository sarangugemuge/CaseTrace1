# CASETRACE — Secure Digital Case Passport & RBAC Infrastructure

> **Core Architecture Principle:**
> **ONE CASE → ONE DIGITAL CASE PASSPORT → MULTIPLE SECURE VIEWS**
> Access decisions dynamically depend on: `USER ROLE + CASE ASSIGNMENT + DOCUMENT SENSITIVITY + PURPOSE OF ACCESS`.

---

## Phase 6: Secure Document Storage (MinIO / S3 Object Storage)

CASETRACE Phase 6 implements secure document object storage using MinIO / S3-compatible object storage. Physical document binaries are stored in MinIO, while document metadata, SHA-256 digests, and RBAC rules are stored in PostgreSQL.

**Pipeline Flow:**
`Document Upload → Authoritative Server SHA-256 → MinIO S3 Bucket → PostgreSQL Metadata → Purpose/RBAC Validation → Mediated Download → Audit Event`

### 1. Environment Configuration

Copy `.env.example` to `.env`:

```bash
# Frontend Data Source Mode
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_MODE=real

# PostgreSQL Database Configuration
DATABASE_URL=postgresql://casetrace_user:casetrace_pass@localhost:5432/casetrace_db
DB_POOL_SIZE=5

# MinIO / S3-Compatible Object Storage Configuration (Phase 6)
STORAGE_ENDPOINT=http://localhost:9000
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin
STORAGE_BUCKET=casetrace-documents
STORAGE_REGION=us-east-1
STORAGE_SECURE=false

# Security Settings
JWT_SECRET=casetrace_secure_jwt_secret_key_2026_demo
```

---

### 2. MinIO Local Development Setup

#### Option A: Running Standalone MinIO Binary (Native Windows / Linux / macOS)
1. Download MinIO Server binary:
   - Windows: [minio.exe](https://dl.min.io/server/minio/release/windows-amd64/minio.exe)
2. Start MinIO Server:
   ```cmd
   set MINIO_ROOT_USER=minioadmin
   set MINIO_ROOT_PASSWORD=minioadmin
   minio.exe server D:\minio_data --console-address ":9001"
   ```
3. Access MinIO Web Console at `http://localhost:9001` (Login: `minioadmin` / `minioadmin`).
4. Create Bucket: `casetrace-documents`.

#### Option B: Running via Docker (Optional)
```bash
docker run -p 9000:9000 -p 9001:9001 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"
```

#### Verifying Storage Connectivity
Check system health endpoint:
```bash
curl http://localhost:8000/api/health
```
Response:
```json
{
  "status": "ok",
  "service": "casetrace-api",
  "database": { "status": "connected", "dialect": "postgresql" },
  "storage": { "status": "connected", "bucket": "casetrace-documents", "endpoint": "http://localhost:9000" }
}
```

---

### 3. Database Migrations & Seeding

```bash
# 1. Run Alembic Schema Upgrade (Includes 003_add_storage_metadata migration)
alembic upgrade head

# 2. Seed Development Demo Data
python -m backend.app.db.seed
```

---

### 4. Running Verification Suite

```bash
# Run Pytest Suite (20 Tests Covering Upload, Download, Integrity Verification, Deletion, Audit)
python -m pytest backend/tests

# Run Frontend Typecheck & ESLint
.\node_modules\.bin\tsc --noEmit --incremental false
.\node_modules\.bin\eslint "src/**/*.ts" "src/**/*.tsx"
```
