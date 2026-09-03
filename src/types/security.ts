export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AccessDecision {
  allowed: boolean;
  reason: string;
  riskLevel: RiskLevel;
  requiresPurpose: boolean;
  policyId: string;
}

export interface RiskAlert {
  alertId: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: string;
  caseId?: string;
  documentId?: string;
  riskScore: number;
  riskLevel: RiskLevel;
  reason: string;
  recommendedAction: string;
}

export interface BlockchainRecord {
  recordId: string;
  caseId: string;
  documentId?: string;
  sha256Hash: string;
  timestamp: string;
  blockNumber: number;
  previousHash: string;
  merkleRoot: string;
  transactionId: string;
  anchorStatus: 'CONFIRMED_ON_BLOCKCHAIN' | 'PENDING' | 'INVALID';
}

export interface ChainOfCustodyEvent {
  eventId: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  department: string;
  action: string;
  evidenceHash: string;
  verificationBadge: 'VERIFIED' | 'TAMPERED' | 'UNCHECKED';
  notes: string;
}
