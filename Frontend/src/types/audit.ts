import { Role } from './auth';

export type AuditEventType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CASE_CREATED'
  | 'CASE_UPDATED'
  | 'CASE_VIEW'
  | 'DOCUMENT_VIEW'
  | 'DOCUMENT_DOWNLOAD'
  | 'DOCUMENT_SHARE'
  | 'ACCESS_GRANTED'
  | 'ACCESS_DENIED'
  | 'DOCUMENT_UPLOAD'
  | 'DOCUMENT_VERSION_CREATED'
  | 'INTEGRITY_VERIFICATION'
  | 'CASE_ASSIGNMENT_CHANGED'
  | 'SECURITY_ALERT';

export type AccessPurpose =
  | 'INVESTIGATION'
  | 'FORENSIC_ANALYSIS'
  | 'LEGAL_REVIEW'
  | 'COURT_PROCEEDING'
  | 'AUDIT'
  | 'ADMINISTRATION';

export interface AuditEntry {
  eventId: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: Role;
  caseId?: string;
  documentId?: string;
  action: AuditEventType;
  purpose?: AccessPurpose | string;
  result: 'SUCCESS' | 'DENIED' | 'FLAGGED';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  ipAddress?: string;
}

export interface AuditSummary {
  totalRecentEvents: number;
  successfulAccesses: number;
  deniedAttempts: number;
  evidenceVerificationEvents: number;
  highRiskEvents: number;
}

