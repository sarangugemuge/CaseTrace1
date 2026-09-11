export type Role =
  | 'Senior Officer'
  | 'Investigating Officer'
  | 'Cyber Crime Investigating Officer'
  | 'Forensic Officer'
  | 'Prosecutor'
  | 'Court User'
  | 'Auditor / Security'
  | 'Admin';

export type Permission =
  | 'FULL_CASE_ACCESS'
  | 'INVESTIGATION_VIEW'
  | 'FORENSIC_VIEW'
  | 'LEGAL_VIEW'
  | 'COURT_VIEW'
  | 'SECURITY_VIEW'
  | 'ADMIN_ACCESS'
  | 'VIEW_TOP_SECRET'
  | 'VIEW_CONFIDENTIAL'
  | 'VIEW_FORENSIC'
  | 'EXPORT_AUDIT'
  | 'MANAGE_USERS';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  designation: string;
  avatar: string;
  assignedCaseIds: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface Session {
  user: User;
  token: string;
  expiresAt: string;
}

export interface LoginResult {
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  message?: string;
}

export interface SessionStatus {
  active: boolean;
  userId: string;
  role: Role;
  lastAuthenticatedAt?: string;
  inactivityTimeoutSeconds: number;
  maxSessionLifetimeSeconds: number;
}
