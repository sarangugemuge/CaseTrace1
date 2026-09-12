import { User } from '../types/auth';
import { Document } from '../types/document';
import { CasePassport } from '../types/case';
import { RiskLevel, RiskAlert } from '../types/security';

export interface RiskAssessment {
  riskScore: number;
  riskLevel: RiskLevel;
  reason: string;
  recommendedAction: string;
}

const ALERT_STORAGE_KEY = 'casetrace_risk_alerts';

export const riskEngine = {
  assessAccessRisk(
    user: User,
    caseData: CasePassport,
    document?: Document,
    purpose?: string
  ): RiskAssessment {
    let score = 0;
    const reasons: string[] = [];

    // 1. Case assignment check
    const userCaseIds = user?.assignedCaseIds || (user as any)?.assigned_case_ids || [];
    const caseUsers = caseData?.assignedUsers || (caseData as any)?.assigned_users || [];
    const isAssigned =
      userCaseIds.includes(caseData.caseId) ||
      (caseData.caseNumber && userCaseIds.includes(caseData.caseNumber)) ||
      caseUsers.includes(user.id);

    if (!isAssigned) {
      if (user.role !== 'Senior Officer' && user.role !== 'Auditor / Security' && user.role !== 'Admin') {
        score += 45;
        reasons.push(`User is accessing unassigned case (${caseData.caseNumber || caseData.caseId})`);
      }
    }

    // 2. Sensitivity level risk
    if (document) {
      switch (document.sensitivity) {
        case 'TOP_SECRET':
          score += 30;
          reasons.push('Accessing TOP_SECRET classified material');
          break;
        case 'FORENSIC':
          score += 25;
          reasons.push('Accessing raw forensic acquisition image/data');
          break;
        case 'CONFIDENTIAL':
          score += 15;
          reasons.push('Accessing CONFIDENTIAL file');
          break;
        default:
          break;
      }

      // 3. Role vs document category alignment
      if (user.role === 'Court User' && document.sensitivity !== 'PUBLIC') {
        score += 35;
        reasons.push('Court user attempting to access non-public evidence');
      }
      if (user.role === 'Investigating Officer' && document.sensitivity === 'FORENSIC') {
        score += 20;
        reasons.push('Investigator accessing specialized forensic disk image');
      }
    }

    // 4. Missing purpose check
    if (!purpose && document && (document.sensitivity === 'CONFIDENTIAL' || document.sensitivity === 'TOP_SECRET')) {
      score += 25;
      reasons.push('Missing declared purpose for high-sensitivity access');
    }

    // Cap score at 100
    const finalScore = Math.min(score, 100);

    let riskLevel: RiskLevel = 'LOW';
    let recommendedAction = 'Allow access and record standard audit log.';

    if (finalScore >= 76) {
      riskLevel = 'CRITICAL';
      recommendedAction = 'Block access immediately, lock user session, and dispatch alert to Security Chief.';
    } else if (finalScore >= 51) {
      riskLevel = 'HIGH';
      recommendedAction = 'Require Senior Officer counter-authorization and flag for Security Audit.';
    } else if (finalScore >= 26) {
      riskLevel = 'MEDIUM';
      recommendedAction = 'Prompt for mandatory purpose declaration and log security warning.';
    }

    return {
      riskScore: finalScore,
      riskLevel,
      reason: reasons.length > 0 ? reasons.join('; ') : 'Normal authorized activity pattern.',
      recommendedAction,
    };
  },

  getMockAlerts(): RiskAlert[] {
    const defaultAlerts: RiskAlert[] = [
      {
        alertId: 'ALT-901',
        timestamp: '2026-09-03T08:10:05Z',
        userId: 'usr-005',
        userName: 'Clerk Helen Ross',
        role: 'Court User',
        caseId: 'CASE-2026-8942',
        documentId: 'doc-103',
        riskScore: 80,
        riskLevel: 'CRITICAL',
        reason: 'Court User attempted access to raw Forensic RAM Image without clearance.',
        recommendedAction: 'Access automatically blocked. Security notification dispatched.',
      },
      {
        alertId: 'ALT-902',
        timestamp: '2026-09-02T14:12:00Z',
        userId: 'usr-002',
        userName: 'Insp. Sarah Jenkins',
        role: 'Investigating Officer',
        caseId: 'CASE-2026-1105',
        documentId: 'doc-301',
        riskScore: 60,
        riskLevel: 'HIGH',
        reason: 'Investigator accessing unassigned Cyber Attack SCADA case from non-local subnet.',
        recommendedAction: 'Log flag in Audit Trail and verify IP origin.',
      },
    ];

    if (typeof window === 'undefined') return defaultAlerts;

    const stored = localStorage.getItem(ALERT_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(defaultAlerts));
      return defaultAlerts;
    }

    try {
      return JSON.parse(stored) as RiskAlert[];
    } catch {
      return defaultAlerts;
    }
  },

  recordAlert(alert: Omit<RiskAlert, 'alertId' | 'timestamp'>): RiskAlert {
    const alerts = this.getMockAlerts();
    const newAlert: RiskAlert = {
      ...alert,
      alertId: `ALT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
    };

    const updated = [newAlert, ...alerts];
    if (typeof window !== 'undefined') {
      localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(updated));
    }
    return newAlert;
  },
};
