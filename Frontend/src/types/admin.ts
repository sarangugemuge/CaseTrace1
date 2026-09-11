export interface RoleRecord {
  id: string;
  name: string;
  role_key: string;
  description?: string;
  permissions: string[];
  is_active: boolean;
  is_system: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SystemConfig {
  storage_backend: string;
  storage_bucket: string;
  storage_endpoint: string;
  db_dialect: string;
  db_status: string;
  sha256_enforcement: string;
  max_upload_size_mb: number;
  audit_retention_days: number;
  active_sessions_count: number;
}
