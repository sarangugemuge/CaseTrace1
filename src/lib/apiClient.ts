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
  // If explicitly configured for mock mode, skip network request
  if (API_MODE === 'mock') {
    return mockFallback();
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout for seamless dev UX

    const currentUser = authService.getCurrentUser();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-User-Role': currentUser.role,
      'X-User-Id': currentUser.id,
      ...(options.headers as Record<string, string>),
    };

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
    // Network error or backend offline -> Seamlessly fall back to mock service layer
    return mockFallback();
  }
}

export const apiClient = {
  getApiMode(): string {
    return API_MODE;
  },

  async getHealth(): Promise<{ status: string; service: string; database?: any }> {
    return fetchWithFallback(
      '/api/health',
      {},
      () => ({ status: 'ok', service: 'casetrace-mock-fallback' })
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
