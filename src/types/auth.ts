export type Role =
  | 'Senior Officer'
  | 'Investigating Officer'
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
  token: string; // Mock token
  expiresAt: string;
}
