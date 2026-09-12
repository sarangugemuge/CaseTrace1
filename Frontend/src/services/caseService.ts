import { CasePassport } from '../types/case';
import { Document } from '../types/document';
import { User } from '../types/auth';
import { MOCK_CASES } from '../mock/cases';
import { MOCK_DOCUMENTS } from '../mock/documents';
import { authService } from './authService';
import { auditService } from './auditService';

const LOCAL_CASES_KEY = 'casetrace_custom_cases';

function getStoredCases(): CasePassport[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_CASES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredCases(cases: CasePassport[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_CASES_KEY, JSON.stringify(cases));
  } catch {}
}

export const caseService = {
  getAllCases(): CasePassport[] {
    const stored = getStoredCases();
    const map = new Map<string, CasePassport>();
    for (const c of MOCK_CASES) {
      map.set(c.caseId, c);
    }
    for (const c of stored) {
      map.set(c.caseId, c);
    }
    return Array.from(map.values());
  },

  getCaseById(id: string): CasePassport | undefined {
    const all = this.getAllCases();
    return all.find((c) => c.caseId === id || c.caseNumber === id);
  },

  getCasesForUser(user: User): CasePassport[] {
    const all = this.getAllCases();
    // Senior Officer, Auditor, Admin can see all cases
    if (
      user.role === 'Senior Officer' ||
      user.role === 'Auditor / Security' ||
      user.role === 'Admin'
    ) {
      return all;
    }
    // Others only see cases assigned to them or where their ID is in assignedUsers
    const userCaseIds = user?.assignedCaseIds || (user as any)?.assigned_case_ids || [];
    return all.filter(
      (c) =>
        userCaseIds.includes(c.caseId) ||
        userCaseIds.includes(c.caseNumber) ||
        (c.assignedUsers && c.assignedUsers.includes(user.id))
    );
  },

  getCaseDocuments(caseId: string): Document[] {
    return MOCK_DOCUMENTS.filter((d) => d.caseId === caseId);
  },

  getDocumentById(documentId: string): Document | undefined {
    return MOCK_DOCUMENTS.find((d) => d.id === documentId);
  },

  getCasePassport(caseId: string): { caseData?: CasePassport; documents: Document[] } {
    const caseData = this.getCaseById(caseId);
    const documents = this.getCaseDocuments(caseId);
    return { caseData, documents };
  },

  createCase(caseData: Partial<CasePassport>): CasePassport {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Authentication required to create cases.');
    }
    if (
      currentUser.role !== 'Senior Officer' &&
      currentUser.role !== 'Investigating Officer' &&
      currentUser.role !== 'Admin'
    ) {
      throw new Error('Only Senior Officers, Investigating Officers, and Admins are authorized to create new cases.');
    }

    const caseNumber = (caseData.caseNumber || '').trim();
    if (!caseNumber) {
      throw new Error('Case number cannot be empty.');
    }
    const all = this.getAllCases();
    const existing = all.find((c) => c.caseNumber.toLowerCase() === caseNumber.toLowerCase());
    if (existing) {
      throw new Error(`Case with number '${caseNumber}' already exists.`);
    }

    const newCase: CasePassport = {
      caseId: caseData.caseId || caseNumber,
      caseNumber: caseNumber,
      title: (caseData.title || '').trim(),
      description: (caseData.description || '').trim(),
      status: caseData.status || 'ACTIVE',
      priority: caseData.priority || 'HIGH',
      classification: caseData.classification || 'CONFIDENTIAL',
      department: (caseData.department || 'Financial Crimes Division').trim(),
      leadInvestigator: (caseData.leadInvestigator || currentUser.name).trim(),
      assignedUsers: caseData.assignedUsers?.length ? caseData.assignedUsers : [currentUser.id],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      incidentDate: caseData.incidentDate || new Date().toISOString().split('T')[0],
      caseStage: caseData.caseStage || 'FIR_LODGED',
      victims: caseData.victims || [],
      suspects: caseData.suspects || [],
      evidenceCount: 0,
      documentCount: 0,
      blockchainAnchorId:
        caseData.blockchainAnchorId ||
        `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
    };

    MOCK_CASES.unshift(newCase);
    const stored = getStoredCases();
    saveStoredCases([newCase, ...stored.filter((c) => c.caseId !== newCase.caseId)]);

    auditService.logEvent(currentUser, 'CASE_CREATED', {
      caseId: newCase.caseId,
      result: 'SUCCESS',
      riskLevel: 'LOW',
      description: `New Case Passport created for ${newCase.caseNumber}: ${newCase.title}`,
    });

    return newCase;
  },
};
