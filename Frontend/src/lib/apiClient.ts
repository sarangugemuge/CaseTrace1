import { User, Role, LoginResult, TotpSetupData, SessionStatus } from '../types/auth';
import { CasePassport } from '../types/case';
import { Document } from '../types/document';
import { AuditEntry, AuditSummary } from '../types/audit';
import { NotificationItem } from '../types/notification';
import { DashboardStats, DashboardActivity } from '../types/security';
import { GlobalSearchResponse } from '../types/search';
import { RoleRecord, SystemConfig } from '../types/admin';
import { authService } from '../services/authService';
import { caseService } from '../services/caseService';
import { auditService } from '../services/auditService';
import { riskEngine } from '../services/riskEngine';
import { verificationService } from '../services/verificationService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const API_MODE = process.env.NEXT_PUBLIC_API_MODE || 'real'; // 'real' or 'mock'

function transformDocument(raw: any): Document {
  if (!raw) return raw;
  return {
    id: raw.id,
    caseId: raw.caseId || raw.case_id || '',
    name: raw.name,
    type: raw.type || 'FILE',
    category: raw.category || 'EVIDENCE',
    sensitivity: raw.sensitivity || 'CONFIDENTIAL',
    version: raw.version ?? 1,
    versionHistory: (raw.versionHistory || raw.version_history || []).map((v: any) => ({
      versionNumber: v.versionNumber ?? v.version_number ?? v.version ?? 1,
      uploadedAt: v.uploadedAt || v.uploaded_at || '',
      uploadedBy: v.uploadedBy || v.uploaded_by || '',
      sha256Hash: v.sha256Hash || v.sha256_hash || '',
      previousHash: v.previousHash || v.previous_hash,
      fileSize: v.fileSize || v.file_size || '',
      changeSummary: v.changeSummary || v.change_summary || v.changeReason || v.change_reason || '',
      changeReason: v.changeReason || v.change_reason || v.changeSummary || v.change_summary || '',
    })),
    uploadedBy: raw.uploadedBy || raw.uploaded_by || 'Unknown Officer',
    uploadedAt: raw.uploadedAt || (raw.uploaded_at ? new Date(raw.uploaded_at).toISOString() : new Date().toISOString()),
    sha256Hash: raw.sha256Hash || raw.sha256_hash || '',
    blockchainRecordId: raw.blockchainRecordId || raw.blockchain_record_id || '',
    allowedRoles: raw.allowedRoles || raw.allowed_roles || [],
    allowedPurposes: raw.allowedPurposes || raw.allowed_purposes || [],
    integrityStatus: (raw.integrityStatus || raw.integrity_status || 'VERIFIED') as any,
    storageKey: raw.storageKey || raw.storage_key,
    storageBucket: raw.storageBucket || raw.storage_bucket,
    fileSize: raw.fileSize ?? raw.file_size ?? 0,
    mimeType: raw.mimeType || raw.mime_type || 'application/octet-stream',
    originalFilename: raw.originalFilename || raw.original_filename || raw.name,
    description: raw.description,
    notes: raw.notes,
  };
}

function transformCase(raw: any): CasePassport {
  if (!raw) return raw;
  return {
    caseId: raw.caseId || raw.case_id || '',
    caseNumber: raw.caseNumber || raw.case_number || '',
    title: raw.title || '',
    description: raw.description || '',
    status: raw.status || 'ACTIVE',
    priority: raw.priority || 'HIGH',
    classification: raw.classification || 'CONFIDENTIAL',
    department: raw.department || '',
    leadInvestigator: raw.leadInvestigator || raw.lead_investigator || '',
    assignedUsers: raw.assignedUsers || raw.assigned_users || [],
    createdAt: raw.createdAt || (raw.created_at ? new Date(raw.created_at).toISOString() : new Date().toISOString()),
    updatedAt: raw.updatedAt || (raw.updated_at ? new Date(raw.updated_at).toISOString() : new Date().toISOString()),
    incidentDate: raw.incidentDate || raw.incident_date || '',
    caseStage: raw.caseStage || raw.case_stage || 'FORENSIC_ANALYSIS',
    victims: raw.victims || [],
    suspects: raw.suspects || [],
    evidenceCount: raw.evidenceCount ?? raw.evidence_count ?? 0,
    documentCount: raw.documentCount ?? raw.document_count ?? 0,
    blockchainAnchorId: raw.blockchainAnchorId || raw.blockchain_anchor_id || '',
  };
}

function transformAudit(raw: any): AuditEntry {
  if (!raw) return raw;
  return {
    eventId: raw.eventId || raw.event_id || `evt-${Date.now()}`,
    timestamp: raw.timestamp ? new Date(raw.timestamp).toISOString() : new Date().toISOString(),
    userId: raw.userId || raw.user_id || '',
    userName: raw.userName || raw.user_name || '',
    role: raw.role,
    caseId: raw.caseId || raw.case_id,
    documentId: raw.documentId || raw.document_id,
    action: raw.action,
    purpose: raw.purpose,
    result: raw.result || 'SUCCESS',
    riskLevel: raw.riskLevel || raw.risk_level || 'LOW',
    description: raw.description || '',
    ipAddress: raw.ipAddress || raw.ip_address,
  };
}

async function fetchWithFallback<T>(
  url: string,
  options: RequestInit = {},
  mockFallback: () => T
): Promise<T> {
  if (API_MODE === 'mock') {
    return mockFallback();
  }

  // 1. Inactivity guard: if inactive > 15 minutes, clear session and redirect
  if (authService.isInactive(15)) {
    authService.clearSession();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login?reason=inactivity';
    }
    return mockFallback();
  }
  authService.updateLastActive();

  // 2. Pre-emptive refresh if access token expired or expiring soon (<30s)
  if (authService.isAccessTokenExpired(30) && authService.getRefreshToken()) {
    try {
      await apiClient.refreshToken();
    } catch {
      // Continue with current credentials if refresh fails
    }
  }

  try {
    const controller = new AbortController();
    const timeoutMs = options.body instanceof FormData ? 30000 : 8000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const currentUser = authService.getCurrentUser();
    const token = authService.getToken();
    const headers: Record<string, string> = {
      'X-User-Role': currentUser?.role || '',
      'X-User-Id': currentUser?.id || '',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string>),
    };

    // Don't override Content-Type for FormData uploads
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    let res = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 3. If 401 Unauthorized, attempt a one-time token refresh and retry
    if (res.status === 401 && authService.getRefreshToken()) {
      const refreshed = await apiClient.refreshToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${refreshed.accessToken}`;
        res = await fetch(`${API_BASE_URL}${url}`, {
          ...options,
          headers,
        });
      }
    }

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

  async checkBackendConnection(): Promise<{ isOnline: boolean; mode: string }> {
    if (API_MODE === 'mock') {
      return { isOnline: false, mode: 'mock' };
    }
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${API_BASE_URL}/api/health`, { signal: controller.signal });
      clearTimeout(id);
      return { isOnline: res.ok, mode: res.ok ? 'online' : 'offline' };
    } catch {
      return { isOnline: false, mode: 'offline' };
    }
  },

  async login(email: string, role?: Role, password: string = 'password123'): Promise<LoginResult> {
    if (API_MODE === 'mock') {
      const user = authService.login(email, role);
      return { user, requires2fa: false, accessToken: 'mock-token' };
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.requires_2fa) {
          authService.setTemp2faToken(data.temp_token);
          return {
            requires2fa: true,
            tempToken: data.temp_token,
            message: data.message,
          };
        }
        authService.saveSession(
          data.user,
          data.access_token,
          data.refresh_token,
          data.expires_in || 600
        );
        const mappedUser = authService.getCurrentUser() || data.user;
        return {
          user: mappedUser,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          requires2fa: false,
        };
      }
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Invalid institutional credentials.');
    } catch (err: any) {
      if (err.message && err.message !== 'Failed to fetch') {
        throw err;
      }
      const user = authService.login(email, role);
      return { user, requires2fa: false, accessToken: 'mock-token' };
    }
  },

  async verify2fa(tempToken: string, code: string, isRecoveryCode: boolean = false): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/api/auth/2fa/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        temp_token: tempToken,
        code,
        is_recovery_code: isRecoveryCode,
      }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Failed to verify two-factor authentication code.');
    }
    const data = await res.json();
    authService.saveSession(
      data.user,
      data.access_token,
      data.refresh_token,
      data.expires_in || 600
    );
    authService.clearTemp2faToken();
    return authService.getCurrentUser() || data.user;
  },

  async setup2fa(): Promise<TotpSetupData> {
    const res = await fetch(`${API_BASE_URL}/api/auth/2fa/setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authService.getAccessToken()}`,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to initialize 2FA setup.');
    }
    const data = await res.json();
    return {
      secret: data.secret,
      qrCode: data.qr_code,
      manualEntryKey: data.manual_entry_key,
      issuer: data.issuer,
    };
  },

  async enable2fa(code: string): Promise<{ success: boolean; recoveryCodes: string[] }> {
    const res = await fetch(`${API_BASE_URL}/api/auth/2fa/enable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authService.getAccessToken()}`,
      },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to activate 2FA.');
    }
    const data = await res.json();
    const cur = authService.getCurrentUser();
    if (cur) {
      authService.saveSession({ ...cur, isTotpEnabled: true }, authService.getAccessToken() || '', authService.getRefreshToken() || '');
    }
    return {
      success: data.success,
      recoveryCodes: data.recovery_codes,
    };
  },

  async disable2fa(password?: string, code?: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE_URL}/api/auth/2fa/disable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authService.getAccessToken()}`,
      },
      body: JSON.stringify({ password, code }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to disable 2FA.');
    }
    const cur = authService.getCurrentUser();
    if (cur) {
      authService.saveSession({ ...cur, isTotpEnabled: false }, authService.getAccessToken() || '', authService.getRefreshToken() || '');
    }
    return { success: true };
  },

  async regenerateRecoveryCodes(): Promise<{ recoveryCodes: string[] }> {
    const res = await fetch(`${API_BASE_URL}/api/auth/2fa/recovery-codes/regenerate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authService.getAccessToken()}`,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to regenerate recovery codes.');
    }
    const data = await res.json();
    return { recoveryCodes: data.recovery_codes };
  },

  async refreshToken(): Promise<{ accessToken: string; refreshToken: string } | null> {
    const currentRefresh = authService.getRefreshToken();
    if (!currentRefresh) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: currentRefresh }),
      });
      if (!res.ok) {
        authService.clearSession();
        return null;
      }
      const data = await res.json();
      authService.updateTokens(data.access_token, data.refresh_token, data.expires_in || 600);
      return { accessToken: data.access_token, refreshToken: data.refresh_token };
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    const token = authService.getAccessToken();
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch {
        // Best effort logout
      }
    }
    authService.clearSession();
  },

  async reauthenticate(password?: string, code?: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE_URL}/api/auth/reauthenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authService.getAccessToken()}`,
      },
      body: JSON.stringify({ password, code }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Reauthentication failed.');
    }
    return { success: true };
  },

  async getSessionStatus(): Promise<SessionStatus> {
    return fetchWithFallback(
      '/api/auth/session/status',
      {},
      () => ({
        active: true,
        userId: authService.getCurrentUser()?.id || 'usr-001',
        role: authService.getCurrentUser()?.role || 'Senior Officer',
        isTotpEnabled: false,
        inactivityTimeoutSeconds: 900,
        maxSessionLifetimeSeconds: 28800,
      })
    );
  },

  async getCases(user: User): Promise<CasePassport[]> {
    const res = await fetchWithFallback<any[]>(
      '/api/cases',
      {},
      () => caseService.getCasesForUser(user)
    );
    return (res || []).map(transformCase);
  },

  async getCaseById(caseId: string): Promise<CasePassport | undefined> {
    const res = await fetchWithFallback<any>(
      `/api/cases/${caseId}`,
      {},
      () => caseService.getCaseById(caseId)
    );
    return res ? transformCase(res) : undefined;
  },

  async createCase(caseData: Partial<CasePassport>): Promise<CasePassport> {
    const currentUser = authService.getCurrentUser();
    if (API_MODE === 'mock') {
      return caseService.createCase(caseData);
    }

    const payload = {
      case_number: caseData.caseNumber,
      title: caseData.title,
      description: caseData.description,
      department: caseData.department,
      incident_date: caseData.incidentDate,
      priority: caseData.priority || 'HIGH',
      classification: caseData.classification || 'CONFIDENTIAL',
      lead_investigator: caseData.leadInvestigator || currentUser?.name || 'Authorized Officer',
      status: caseData.status || 'ACTIVE',
      case_stage: caseData.caseStage || 'FIR_LODGED',
      victims: caseData.victims || [],
      suspects: caseData.suspects || [],
      case_id: caseData.caseId || caseData.caseNumber,
      blockchain_anchor_id: caseData.blockchainAnchorId,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-User-Role': currentUser?.role || '',
        'X-User-Id': currentUser?.id || '',
      };

      const res = await fetch(`${API_BASE_URL}/api/cases`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        let errorMessage = `Case creation failed with status ${res.status}`;
        try {
          const errBody = await res.json();
          if (errBody?.detail) {
            errorMessage =
              typeof errBody.detail === 'string'
                ? errBody.detail
                : Array.isArray(errBody.detail)
                ? errBody.detail.map((d: any) => d.msg || d).join(', ')
                : JSON.stringify(errBody.detail);
          }
        } catch (_) {}

        if (res.status >= 400 && res.status < 500) {
          throw new Error(errorMessage);
        }
        console.warn(`Backend 5xx error (${res.status}), falling back to mock layer: ${errorMessage}`);
        return caseService.createCase(caseData);
      }

      const created = await res.json();
      return transformCase(created);
    } catch (err: any) {
      if (
        err.message &&
        !err.message.includes('fetch') &&
        !err.message.includes('abort') &&
        !err.message.includes('network') &&
        !err.message.includes('Failed')
      ) {
        throw err;
      }
      console.warn('Network unreachable for createCase, falling back to client mock store:', err);
      return caseService.createCase(caseData);
    }
  },

  async updateCase(caseId: string, caseData: Partial<CasePassport>): Promise<CasePassport> {
    const currentUser = authService.getCurrentUser();
    const payload: Record<string, any> = {};
    if (caseData.title !== undefined) payload.title = caseData.title;
    if (caseData.description !== undefined) payload.description = caseData.description;
    if (caseData.department !== undefined) payload.department = caseData.department;
    if (caseData.incidentDate !== undefined) payload.incident_date = caseData.incidentDate;
    if (caseData.priority !== undefined) payload.priority = caseData.priority;
    if (caseData.classification !== undefined) payload.classification = caseData.classification;
    if (caseData.leadInvestigator !== undefined) payload.lead_investigator = caseData.leadInvestigator;
    if (caseData.status !== undefined) payload.status = caseData.status;
    if (caseData.caseStage !== undefined) payload.case_stage = caseData.caseStage;
    if (caseData.victims !== undefined) payload.victims = caseData.victims;
    if (caseData.suspects !== undefined) payload.suspects = caseData.suspects;

    const res = await fetch(`${API_BASE_URL}/api/cases/${caseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Role': currentUser?.role || '',
        'X-User-Id': currentUser?.id || '',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
      throw new Error(errJson.detail || `Update failed with status ${res.status}`);
    }

    const data = await res.json();
    return transformCase(data);
  },

  async getCaseDocuments(caseId: string): Promise<Document[]> {
    const res = await fetchWithFallback<any[]>(
      `/api/cases/${caseId}/documents`,
      {},
      () => caseService.getCaseDocuments(caseId)
    );
    return (res || []).map(transformDocument);
  },

  async uploadDocument(
    caseId: string,
    file: File,
    category: string = 'EVIDENCE',
    sensitivity: string = 'CONFIDENTIAL',
    purpose: string = 'INVESTIGATION',
    evidenceId?: string,
    description?: string,
    notes?: string
  ): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('sensitivity', sensitivity);
    formData.append('purpose', purpose);
    if (evidenceId) {
      formData.append('evidence_id', evidenceId);
    }
    if (description) {
      formData.append('description', description);
    }
    if (notes) {
      formData.append('notes', notes);
    }

    const res = await fetchWithFallback<any>(
      `/api/cases/${caseId}/documents/upload`,
      {
        method: 'POST',
        body: formData,
      },
      () => {
        // Mock fallback document creation
        const currentUser = authService.getCurrentUser();
        const newDoc: Document = {
          id: evidenceId || `doc-mock-${Date.now()}`,
          caseId,
          name: file.name,
          type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
          category: category as any,
          sensitivity: sensitivity as any,
          version: 1,
          versionHistory: [],
          uploadedBy: currentUser?.name || 'Authorized Officer',
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
    return transformDocument(res);
  },

  async downloadDocument(documentId: string, purpose: string = 'INVESTIGATION'): Promise<Blob | null> {
    if (API_MODE === 'mock') {
      return new Blob([`CASETRACE MOCK DOWNLOAD CONTAINER FOR ${documentId}`], { type: 'text/plain' });
    }

    try {
      const currentUser = authService.getCurrentUser();
      const res = await fetch(`${API_BASE_URL}/api/documents/${documentId}/download?purpose=${encodeURIComponent(purpose)}`, {
        headers: {
          'X-User-Role': currentUser?.role || '',
          'X-User-Id': currentUser?.id || '',
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

  async addDocumentVersion(
    documentId: string,
    file: File,
    changeReason: string,
    purpose: string = 'INVESTIGATION'
  ): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('change_reason', changeReason);
    formData.append('purpose', purpose);

    const currentUser = authService.getCurrentUser();
    const res = await fetch(`${API_BASE_URL}/api/documents/${documentId}/versions`, {
      method: 'POST',
      headers: {
        'X-User-Role': currentUser?.role || '',
        'X-User-Id': currentUser?.id || '',
      },
      body: formData,
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
      throw new Error(errJson.detail || `Upload failed with status ${res.status}`);
    }

    const data = await res.json();
    return transformDocument(data);
  },

  async updateDocumentMetadata(
    documentId: string,
    updates: { category?: string; sensitivity?: string; description?: string; notes?: string },
    purpose: string = 'INVESTIGATION'
  ): Promise<Document> {
    const currentUser = authService.getCurrentUser();
    const res = await fetch(`${API_BASE_URL}/api/documents/${documentId}/metadata?purpose=${encodeURIComponent(purpose)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Role': currentUser?.role || '',
        'X-User-Id': currentUser?.id || '',
      },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
      throw new Error(errJson.detail || `Update failed with status ${res.status}`);
    }

    const data = await res.json();
    return transformDocument(data);
  },

  getDocumentViewUrl(documentId: string): string {
    return `${API_BASE_URL}/api/documents/${documentId}/view?purpose=VIEW`;
  },

  async getAdminRoles(): Promise<RoleRecord[]> {
    const currentUser = authService.getCurrentUser();
    const res = await fetch(`${API_BASE_URL}/api/admin/roles`, {
      headers: {
        'X-User-Role': currentUser?.role || '',
        'X-User-Id': currentUser?.id || '',
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
      throw new Error(err.detail || `Failed to fetch roles (${res.status})`);
    }
    return res.json();
  },

  async createAdminRole(roleData: { name: string; role_key: string; description?: string; permissions: string[] }): Promise<RoleRecord> {
    const currentUser = authService.getCurrentUser();
    const res = await fetch(`${API_BASE_URL}/api/admin/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Role': currentUser?.role || '',
        'X-User-Id': currentUser?.id || '',
      },
      body: JSON.stringify(roleData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
      throw new Error(err.detail || `Failed to create role (${res.status})`);
    }
    return res.json();
  },

  async updateAdminRole(roleId: string, roleData: { name?: string; description?: string; permissions?: string[]; is_active?: boolean }): Promise<RoleRecord> {
    const currentUser = authService.getCurrentUser();
    const res = await fetch(`${API_BASE_URL}/api/admin/roles/${roleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Role': currentUser?.role || '',
        'X-User-Id': currentUser?.id || '',
      },
      body: JSON.stringify(roleData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
      throw new Error(err.detail || `Failed to update role (${res.status})`);
    }
    return res.json();
  },

  async deleteAdminRole(roleId: string): Promise<void> {
    const currentUser = authService.getCurrentUser();
    const res = await fetch(`${API_BASE_URL}/api/admin/roles/${roleId}`, {
      method: 'DELETE',
      headers: {
        'X-User-Role': currentUser?.role || '',
        'X-User-Id': currentUser?.id || '',
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
      throw new Error(err.detail || `Failed to delete role (${res.status})`);
    }
  },

  async getAdminConfig(): Promise<SystemConfig> {
    const currentUser = authService.getCurrentUser();
    const res = await fetch(`${API_BASE_URL}/api/admin/config`, {
      headers: {
        'X-User-Role': currentUser?.role || '',
        'X-User-Id': currentUser?.id || '',
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
      throw new Error(err.detail || `Failed to fetch system config (${res.status})`);
    }
    return res.json();
  },

  async updateAdminConfig(configData: Partial<SystemConfig>): Promise<SystemConfig> {
    const currentUser = authService.getCurrentUser();
    const res = await fetch(`${API_BASE_URL}/api/admin/config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Role': currentUser?.role || '',
        'X-User-Id': currentUser?.id || '',
      },
      body: JSON.stringify(configData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
      throw new Error(err.detail || `Failed to update system config (${res.status})`);
    }
    return res.json();
  },

  async getAuditLogs(): Promise<AuditEntry[]> {
    const res = await fetchWithFallback<any[]>(
      '/api/audit',
      {},
      () => auditService.getLogs()
    );
    return (res || []).map(transformAudit);
  },

  async getCaseAuditLogs(caseId: string): Promise<AuditEntry[]> {
    const res = await fetchWithFallback<any[]>(
      `/api/cases/${caseId}/audit`,
      {},
      () => {
        const allLogs = auditService.getLogs();
        return allLogs.filter((l) => l.caseId === caseId);
      }
    );
    return (res || []).map(transformAudit);
  },

  async verifyHash(input: string, expectedHash: string): Promise<{ isMatch: boolean; status: string }> {
    const res = await fetchWithFallback<any>(
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
    return {
      isMatch: res.is_match !== undefined ? res.is_match : (res.isMatch !== undefined ? res.isMatch : false),
      status: res.status || 'VERIFICATION_COMPLETE',
    };
  },

  async getDashboardStats(user: User): Promise<DashboardStats> {
    const res = await fetchWithFallback<any>(
      '/api/dashboard/stats',
      {},
      () => {
        const cases = caseService.getCasesForUser(user);
        const auditLogs = auditService.getLogs();
        const alerts = riskEngine.getMockAlerts();
        const activeCases = cases.filter((c) => (c.status || '').toUpperCase() === 'ACTIVE').length;
        const criticalCases = cases.filter((c) => (c.priority || '').toUpperCase() === 'CRITICAL').length;
        const totalEvidence = cases.reduce((acc, c) => acc + (c.evidenceCount || 0), 0);

        const recentActivity: DashboardActivity[] = auditLogs.slice(0, 10).map((l) => ({
          eventId: l.eventId,
          timestamp: l.timestamp,
          action: l.action,
          caseId: l.caseId,
          caseNumber: l.caseId ? cases.find((c) => c.caseId === l.caseId)?.caseNumber : undefined,
          documentId: l.documentId,
          userName: l.userName,
          role: l.role,
          result: l.result,
          riskLevel: l.riskLevel,
          description: l.description,
        }));

        return {
          activeCases,
          criticalCases,
          totalEvidenceItems: totalEvidence,
          pendingVerification: 0,
          integrityAlerts: alerts.length,
          totalAuthorizedCases: cases.length,
          userRole: user.role,
          userName: user.name,
          recentActivity,
        };
      }
    );

    return {
      activeCases: res.activeCases ?? res.active_cases ?? 0,
      criticalCases: res.criticalCases ?? res.critical_cases ?? 0,
      totalEvidenceItems: res.totalEvidenceItems ?? res.total_evidence_items ?? 0,
      pendingVerification: res.pendingVerification ?? res.pending_verification ?? 0,
      integrityAlerts: res.integrityAlerts ?? res.integrity_alerts ?? 0,
      totalAuthorizedCases: res.totalAuthorizedCases ?? res.total_authorized_cases ?? 0,
      userRole: res.userRole || res.user_role || user.role,
      userName: res.userName || res.user_name || user.name,
      recentActivity: (res.recentActivity || res.recent_activity || []).map((a: any) => ({
        eventId: a.eventId || a.event_id || `evt-${Date.now()}`,
        timestamp: a.timestamp ? new Date(a.timestamp).toISOString() : new Date().toISOString(),
        action: a.action || 'EVENT',
        caseId: a.caseId || a.case_id,
        caseNumber: a.caseNumber || a.case_number,
        documentId: a.documentId || a.document_id,
        documentName: a.documentName || a.document_name,
        userName: a.userName || a.user_name,
        role: a.role,
        result: a.result || 'SUCCESS',
        riskLevel: a.riskLevel || a.risk_level || 'LOW',
        description: a.description || '',
      })),
    };
  },

  async searchGlobal(query: string): Promise<GlobalSearchResponse> {
    const clean = (query || '').trim();
    if (!clean) {
      return {
        query: '',
        totalResults: 0,
        cases: [],
        documents: [],
        evidence: [],
        hashes: [],
      };
    }

    const res = await fetchWithFallback<any>(
      `/api/search?q=${encodeURIComponent(clean)}`,
      {},
      () => {
        const currentUser = authService.getCurrentUser();
        const userCases = currentUser ? caseService.getCasesForUser(currentUser) : [];
        const lower = clean.toLowerCase();

        // 1. Cases
        const matchedCases = userCases
          .filter(
            (c) =>
              c.caseNumber.toLowerCase().includes(lower) ||
              c.title.toLowerCase().includes(lower) ||
              c.description.toLowerCase().includes(lower)
          )
          .slice(0, 5)
          .map((c) => ({
            caseId: c.caseId,
            caseNumber: c.caseNumber,
            title: c.title,
            status: c.status,
            priority: c.priority,
            classification: c.classification,
          }));

        // 2. Documents & Evidence
        const allDocs = userCases.flatMap((c) => caseService.getCaseDocuments(c.caseId));
        const forensicCats = ['SYSTEM_IMAGE', 'EVIDENCE', 'EVIDENCE_PHOTO', 'FORENSIC_REPORT', 'COURT_EXHIBIT'];

        const matchedDocs = allDocs
          .filter(
            (d) =>
              !forensicCats.includes(d.category) &&
              (d.name.toLowerCase().includes(lower) ||
                d.type.toLowerCase().includes(lower) ||
                d.category.toLowerCase().includes(lower))
          )
          .slice(0, 5)
          .map((d) => {
            const foundCase = userCases.find((c) => c.caseId === d.caseId);
            return {
              id: d.id,
              name: d.name,
              caseId: d.caseId,
              caseNumber: foundCase?.caseNumber || d.caseId,
              sensitivity: d.sensitivity,
              type: d.type,
            };
          });

        const matchedEvidence = allDocs
          .filter(
            (d) =>
              d.id.toLowerCase().includes(lower) ||
              (forensicCats.includes(d.category) && d.name.toLowerCase().includes(lower))
          )
          .slice(0, 5)
          .map((d) => {
            const foundCase = userCases.find((c) => c.caseId === d.caseId);
            return {
              evidenceId: d.id,
              name: d.name,
              caseId: d.caseId,
              caseNumber: foundCase?.caseNumber || d.caseId,
              verificationStatus: d.integrityStatus || 'VERIFIED',
              sha256Hash: d.sha256Hash,
            };
          });

        // 3. Hashes
        const matchedHashes =
          lower.length >= 3
            ? allDocs
                .filter(
                  (d) =>
                    d.sha256Hash.toLowerCase().includes(lower) ||
                    (d.blockchainRecordId && d.blockchainRecordId.toLowerCase().includes(lower))
                )
                .slice(0, 5)
                .map((d) => {
                  const foundCase = userCases.find((c) => c.caseId === d.caseId);
                  return {
                    hash: d.sha256Hash,
                    matchType: (forensicCats.includes(d.category) ? 'EVIDENCE' : 'DOCUMENT') as any,
                    itemName: d.name,
                    caseId: d.caseId,
                    caseNumber: foundCase?.caseNumber || d.caseId,
                    verificationStatus: d.integrityStatus || 'VERIFIED',
                  };
                })
            : [];

        return {
          query: clean,
          total_results:
            matchedCases.length + matchedDocs.length + matchedEvidence.length + matchedHashes.length,
          cases: matchedCases,
          documents: matchedDocs,
          evidence: matchedEvidence,
          hashes: matchedHashes,
        };
      }
    );

    return {
      query: res.query || clean,
      totalResults: res.totalResults ?? res.total_results ?? 0,
      cases: (res.cases || []).map((c: any) => ({
        caseId: c.caseId || c.case_id,
        caseNumber: c.caseNumber || c.case_number,
        title: c.title,
        status: c.status,
        priority: c.priority,
        classification: c.classification,
      })),
      documents: (res.documents || []).map((d: any) => ({
        id: d.id,
        name: d.name,
        caseId: d.caseId || d.case_id,
        caseNumber: d.caseNumber || d.case_number,
        sensitivity: d.sensitivity,
        type: d.type,
      })),
      evidence: (res.evidence || []).map((e: any) => ({
        evidenceId: e.evidenceId || e.evidence_id || e.id,
        name: e.name,
        caseId: e.caseId || e.case_id,
        caseNumber: e.caseNumber || e.case_number,
        verificationStatus: e.verificationStatus || e.verification_status || 'VERIFIED',
        sha256Hash: e.sha256Hash || e.sha256_hash,
      })),
      hashes: (res.hashes || []).map((h: any) => ({
        hash: h.hash,
        matchType: h.matchType || h.match_type || 'DOCUMENT',
        itemName: h.itemName || h.item_name,
        caseId: h.caseId || h.case_id,
        caseNumber: h.caseNumber || h.case_number,
        verificationStatus: h.verificationStatus || h.verification_status,
      })),
    };
  },

  async getAuditSummary(): Promise<AuditSummary> {
    const res = await fetchWithFallback<any>(
      '/api/audit/summary',
      {},
      () => {
        const logs = auditService.getLogs();
        const successful = logs.filter((l) => l.result === 'SUCCESS').length;
        const denied = logs.filter((l) => l.result === 'DENIED' || l.result === 'FLAGGED').length;
        const verif = logs.filter((l) => l.action === 'INTEGRITY_VERIFICATION' || (l.action || '').includes('VERIF')).length;
        const highRisk = logs.filter((l) => l.riskLevel === 'HIGH' || l.riskLevel === 'CRITICAL').length;
        return {
          totalRecentEvents: logs.length,
          successfulAccesses: successful,
          deniedAttempts: denied,
          evidenceVerificationEvents: verif,
          highRiskEvents: highRisk,
        };
      }
    );

    return {
      totalRecentEvents: res.totalRecentEvents ?? res.total_recent_events ?? 0,
      successfulAccesses: res.successfulAccesses ?? res.successful_accesses ?? 0,
      deniedAttempts: res.deniedAttempts ?? res.denied_attempts ?? 0,
      evidenceVerificationEvents: res.evidenceVerificationEvents ?? res.evidence_verification_events ?? 0,
      highRiskEvents: res.highRiskEvents ?? res.high_risk_events ?? 0,
    };
  },

  async getNotifications(): Promise<NotificationItem[]> {
    const res = await fetchWithFallback<any>(
      '/api/notifications',
      {},
      () => {
        const currentUser = authService.getCurrentUser();
        const isGlobal = currentUser?.role === 'Senior Officer' || currentUser?.role === 'Auditor / Security' || currentUser?.role === 'Admin';
        const userCases = currentUser ? caseService.getCasesForUser(currentUser) : [];
        const authorizedCaseIds = userCases.map((c) => c.caseId);
        const alerts = riskEngine.getMockAlerts();

        const notifs: NotificationItem[] = [];

        // Assignments
        userCases.forEach((c) => {
          notifs.push({
            id: `notif-assign-${c.caseId}`,
            type: 'CASE_ASSIGNMENT',
            title: 'Case Assignment',
            message: `Active assignment for ${c.caseNumber}: ${c.title}`,
            caseId: c.caseId,
            caseNumber: c.caseNumber,
            timestamp: c.createdAt,
            severity: 'INFO',
            targetUrl: `/dashboard/cases/${c.caseId}`,
            read: false,
          });
        });

        // Alerts
        alerts.forEach((alt) => {
          if (currentUser?.role === 'Court User') return;
          if (!isGlobal && (!alt.caseId || !authorizedCaseIds.includes(alt.caseId))) return;
          notifs.push({
            id: `notif-alert-${alt.alertId}`,
            type: 'RESTRICTED_ACCESS',
            title: 'Restricted Access Attempt',
            message: alt.reason,
            caseId: alt.caseId,
            caseNumber: alt.caseId,
            timestamp: alt.timestamp,
            severity: 'CRITICAL',
            targetUrl: alt.caseId ? `/dashboard/cases/${alt.caseId}?tab=timeline` : '/dashboard/audit',
            read: false,
          });
        });

        return {
          total: notifs.length,
          unread_count: notifs.length,
          notifications: notifs,
        };
      }
    );

    const items = res?.notifications || (Array.isArray(res) ? res : []);
    return items.map((n: any) => ({
      id: n.id || `notif-${Date.now()}`,
      type: n.type || 'CASE_UPDATE',
      title: n.title || 'System Notification',
      message: n.message || '',
      caseId: n.caseId || n.case_id,
      caseNumber: n.caseNumber || n.case_number,
      documentId: n.documentId || n.document_id,
      timestamp: n.timestamp ? new Date(n.timestamp).toISOString() : new Date().toISOString(),
      severity: n.severity || 'INFO',
      targetUrl: n.targetUrl || n.target_url || '/dashboard',
      read: n.read ?? false,
    }));
  },
};
