import { AuditEntry, AuditEventType, AccessPurpose } from '../types/audit';
import { User } from '../types/auth';
import { MOCK_AUDIT_LOGS } from '../mock/auditLogs';

const AUDIT_STORAGE_KEY = 'casetrace_audit_logs';

export const auditService = {
  getLogs(): AuditEntry[] {
    if (typeof window === 'undefined') return MOCK_AUDIT_LOGS;

    const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(MOCK_AUDIT_LOGS));
      return MOCK_AUDIT_LOGS;
    }

    try {
      return JSON.parse(stored) as AuditEntry[];
    } catch (e) {
      console.error('Failed to parse audit logs from storage', e);
      return MOCK_AUDIT_LOGS;
    }
  },

  logEvent(
    user: User,
    action: AuditEventType,
    details: {
      caseId?: string;
      documentId?: string;
      purpose?: AccessPurpose | string;
      result: 'SUCCESS' | 'DENIED' | 'FLAGGED';
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      description: string;
    }
  ): AuditEntry {
    const logs = this.getLogs();
    const newEntry: AuditEntry = {
      eventId: `evt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      role: user.role,
      caseId: details.caseId,
      documentId: details.documentId,
      action,
      purpose: details.purpose,
      result: details.result,
      riskLevel: details.riskLevel,
      description: details.description,
      ipAddress: '10.240.12.' + Math.floor(Math.random() * 250 + 1),
    };

    const updatedLogs = [newEntry, ...logs];

    if (typeof window !== 'undefined') {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updatedLogs));
    }

    return newEntry;
  },

  clearLogs(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUDIT_STORAGE_KEY);
    }
  },
};
