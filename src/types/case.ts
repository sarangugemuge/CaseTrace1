export type CaseStatus = 'ACTIVE' | 'PENDING_REVIEW' | 'IN_COURT' | 'CLOSED' | 'ARCHIVED';

export type CasePriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type CaseClassification = 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET';

export type CaseStage =
  | 'FIR_LODGED'
  | 'EVIDENCE_COLLECTION'
  | 'FORENSIC_ANALYSIS'
  | 'CHARGE_SHEET_PREPARED'
  | 'TRIALS_ONGOING'
  | 'VERDICT_RENDERED';

export interface CaseAssignment {
  userId: string;
  role: string;
  assignedAt: string;
  assignedBy: string;
}

export interface CasePassport {
  caseId: string;
  caseNumber: string;
  title: string;
  description: string;
  status: CaseStatus;
  priority: CasePriority;
  classification: CaseClassification;
  department: string;
  leadInvestigator: string;
  assignedUsers: string[];
  createdAt: string;
  updatedAt: string;
  incidentDate: string;
  caseStage: CaseStage;
  victims: string[];
  suspects: string[];
  evidenceCount: number;
  documentCount: number;
  blockchainAnchorId: string;
}
