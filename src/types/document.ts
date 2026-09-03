import { Role } from './auth';

export type SensitivityLevel =
  | 'PUBLIC'
  | 'INTERNAL'
  | 'CONFIDENTIAL'
  | 'TOP_SECRET'
  | 'FORENSIC';

export type IntegrityStatus = 'VERIFIED' | 'TAMPER_SUSPECTED' | 'UNVERIFIED';

export type DocumentCategory =
  | 'FIRST_INFORMATION_REPORT'
  | 'INVESTIGATION_NOTE'
  | 'FORENSIC_REPORT'
  | 'EVIDENCE_PHOTO'
  | 'WITNESS_STATEMENT'
  | 'CHARGE_SHEET'
  | 'COURT_SUBMISSION'
  | 'FINANCIAL_AUDIT'
  | 'SYSTEM_IMAGE';

export interface DocumentVersion {
  versionNumber: number;
  uploadedAt: string;
  uploadedBy: string;
  sha256Hash: string;
  fileSize: string;
  changeSummary: string;
}

export interface Document {
  id: string;
  caseId: string;
  name: string;
  type: string; // e.g. "PDF", "IMG", "ZIP"
  category: DocumentCategory;
  sensitivity: SensitivityLevel;
  version: number;
  versionHistory: DocumentVersion[];
  uploadedBy: string;
  uploadedAt: string;
  sha256Hash: string;
  blockchainRecordId: string;
  allowedRoles: Role[];
  allowedPurposes: string[];
  integrityStatus: IntegrityStatus;
}
