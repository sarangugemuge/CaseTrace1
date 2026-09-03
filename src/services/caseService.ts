import { CasePassport } from '../types/case';
import { Document } from '../types/document';
import { User } from '../types/auth';
import { MOCK_CASES } from '../mock/cases';
import { MOCK_DOCUMENTS } from '../mock/documents';

export const caseService = {
  getAllCases(): CasePassport[] {
    return MOCK_CASES;
  },

  getCaseById(id: string): CasePassport | undefined {
    return MOCK_CASES.find((c) => c.caseId === id || c.caseNumber === id);
  },

  getCasesForUser(user: User): CasePassport[] {
    // Senior Officer, Auditor, Admin can see all cases
    if (
      user.role === 'Senior Officer' ||
      user.role === 'Auditor / Security' ||
      user.role === 'Admin'
    ) {
      return MOCK_CASES;
    }
    // Others only see cases assigned to them or where their ID is in assignedUsers
    return MOCK_CASES.filter(
      (c) => user.assignedCaseIds.includes(c.caseId) || c.assignedUsers.includes(user.id)
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
};
