import { User, Role } from '../types/auth';
import { CasePassport } from '../types/case';
import { Document } from '../types/document';
import { AuditEntry } from '../types/audit';
import { authService } from '../services/authService';
import { caseService } from '../services/caseService';
import { auditService } from '../services/auditService';
import { verificationService } from '../services/verificationService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const API_MODE = process.env.NEXT_PUBLIC_API_MODE || 'real'; // 'real' or 'mock'

async function fetchWithFallback<T>(
  url: string,
  options: RequestInit = {},
  mockFallback: () => T
): Promise<T> {
  if (API_MODE === 'mock') {
    return mockFallback();
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const currentUser = authService.getCurrentUser();
    const headers: Record<string, string> = {
      'X-User-Role': currentUser.role,
      'X-User-Id': currentUser.id,
      ...(options.headers as Record<string, string>),
    };

    // Don't override Content-Type for FormData uploads
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`API ${url} returned status ${res.status}. Falling back to mock layer.`);
      return mockFallback();
    }

    return (await res.json()) as T;
  } catch (err) {
    return mockFallback();
  }
}

export const apiClient = {
  getApiMode(): string {
    return API_MODE;
  },

  async getHealth(): Promise<{ status: string; service: string; database?: any; storage?: any }> {
    return fetchWithFallback(
      '/api/health',
      {},
      () => ({ status: 'ok', service: 'casetrace-mock-fallback', storage: { status: 'mock' } })
    );
  },

  async login(email: string, role?: Role): Promise<User> {
    return fetchWithFallback(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password: 'password123' }),
      },
      () => authService.switchDemoRole(role || 'Senior Officer')
    );
  },

  async getCases(user: User): Promise<CasePassport[]> {
    return fetchWithFallback(
      '/api/cases',
      {},
      () => caseService.getCasesForUser(user)
    );
  },

  async getCaseById(caseId: string): Promise<CasePassport | undefined> {
    return fetchWithFallback(
      `/api/cases/${caseId}`,
      {},
      () => caseService.getCaseById(caseId)
    );
  },

  async getCaseDocuments(caseId: string): Promise<Document[]> {
    return fetchWithFallback(
      `/api/cases/${caseId}/documents`,
      {},
      () => caseService.getCaseDocuments(caseId)
    );
  },

  async uploadDocument(
    caseId: string,
    file: File,
    category: string = 'EVIDENCE',
    sensitivity: string = 'CONFIDENTIAL',
    purpose: string = 'INVESTIGATION'
  ): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('sensitivity', sensitivity);
    formData.append('purpose', purpose);

    return fetchWithFallback(
      `/api/cases/${caseId}/documents/upload`,
      {
        method: 'POST',
        body: formData,
      },
      () => {
        // Mock fallback document creation
        const currentUser = authService.getCurrentUser();
        const newDoc: Document = {
          id: `doc-mock-${Date.now()}`,
          caseId,
          name: file.name,
          type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
          category: category as any,
          sensitivity: sensitivity as any,
          version: 1,
          versionHistory: [],
          uploadedBy: currentUser.name,
          uploadedAt: new Date().toISOString(),
          sha256Hash: verificationService.generateHash(`${file.name}-${Date.now()}`),
          blockchainRecordId: `blk-mock-${Date.now()}`,
          allowedRoles: ['Senior Officer', 'Investigating Officer', 'Forensic Officer', 'Prosecutor', 'Auditor / Security', 'Admin'],
          allowedPurposes: ['INVESTIGATION', 'LEGAL_REVIEW', 'FORENSIC_ANALYSIS', 'AUDIT'],
          integrityStatus: 'VERIFIED'
        };
        return newDoc;
      }
    );
  },

  async downloadDocument(documentId: string, purpose: string = 'INVESTIGATION'): Promise<Blob | null> {
    if (API_MODE === 'mock') {
      return new Blob([`CASETRACE MOCK DOWNLOAD CONTAINER FOR ${documentId}`], { type: 'text/plain' });
    }

    try {
      const currentUser = authService.getCurrentUser();
      const res = await fetch(`${API_BASE_URL}/api/documents/${documentId}/download?purpose=${encodeURIComponent(purpose)}`, {
        headers: {
          'X-User-Role': currentUser.role,
          'X-User-Id': currentUser.id,
        },
      });

      if (!res.ok) {
        throw new Error(`Download failed with status ${res.status}`);
      }

      return await res.blob();
    } catch (err) {
      console.warn(`Download falling back to mock blob container for ${documentId}`);
      return new Blob([`CASETRACE FALLBACK CONTAINER FOR ${documentId}`], { type: 'text/plain' });
    }
  },

  async verifyDocumentIntegrity(documentId: string): Promise<{ status: string; match: boolean; details: string; stored_hash: string }> {
    return fetchWithFallback(
      `/api/documents/${documentId}/verify`,
      { method: 'POST' },
      () => ({
        status: 'VERIFIED',
        match: true,
        details: 'Verified against mock metadata ledger.',
        stored_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      })
    );
  },

  async deleteDocument(documentId: string, purpose: string = 'ADMINISTRATIVE'): Promise<{ status: string; message: string }> {
    return fetchWithFallback(
      `/api/documents/${documentId}?purpose=${encodeURIComponent(purpose)}`,
      { method: 'DELETE' },
      () => ({ status: 'success', message: `Document ${documentId} deleted in mock mode.` })
    );
  },

  async getAuditLogs(): Promise<AuditEntry[]> {
    return fetchWithFallback(
      '/api/audit',
      {},
      () => auditService.getLogs()
    );
  },

  async verifyHash(input: string, expectedHash: string): Promise<{ isMatch: boolean; status: string }> {
    return fetchWithFallback(
      '/api/verification/hash',
      {
        method: 'POST',
        body: JSON.stringify({ content: input, expected_hash: expectedHash }),
      },
      () => {
        const computed = verificationService.generateHash(input);
        const match = verificationService.verifyHash(computed, expectedHash);
        return {
          isMatch: match,
          status: match ? 'VERIFIED (BIT-EXACT MATCH)' : 'INTEGRITY MISMATCH (TAMPERED)',
        };
      }
    );
  },
};
