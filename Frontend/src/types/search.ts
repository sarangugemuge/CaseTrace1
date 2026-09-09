export interface SearchCaseItem {
  caseId: string;
  caseNumber: string;
  title: string;
  status: string;
  priority?: string;
  classification?: string;
}

export interface SearchDocumentItem {
  id: string;
  name: string;
  caseId: string;
  caseNumber?: string;
  sensitivity?: string;
  type?: string;
}

export interface SearchEvidenceItem {
  evidenceId: string;
  name: string;
  caseId: string;
  caseNumber?: string;
  verificationStatus: string;
  sha256Hash?: string;
}

export interface SearchHashItem {
  hash: string;
  matchType: 'DOCUMENT' | 'EVIDENCE' | 'CASE_ANCHOR';
  itemName: string;
  caseId: string;
  caseNumber?: string;
  verificationStatus?: string;
}

export interface GlobalSearchResponse {
  query: string;
  totalResults: number;
  cases: SearchCaseItem[];
  documents: SearchDocumentItem[];
  evidence: SearchEvidenceItem[];
  hashes: SearchHashItem[];
}
