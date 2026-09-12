import { User, Role } from '../types/auth';
import { Document, SensitivityLevel } from '../types/document';
import { CasePassport } from '../types/case';
import { AccessDecision, RiskLevel } from '../types/security';
import { AccessPurpose } from '../types/audit';

export type AccessAction = 'VIEW' | 'DOWNLOAD' | 'SHARE' | 'VERIFY';

export const accessControlEngine = {
  evaluateAccess(
    user: User,
    caseData: CasePassport,
    document?: Document,
    action: AccessAction = 'VIEW',
    purpose?: AccessPurpose | string
  ): AccessDecision {
    // 1. Check Admin Override
    if (user.role === 'Admin') {
      return {
        allowed: true,
        reason: 'Admin role authorized with full system governance.',
        riskLevel: 'LOW',
        requiresPurpose: false,
        policyId: 'POL-ADMIN-FULL-01',
      };
    }

    // 2. Case Assignment Check
    const userCaseIds = user?.assignedCaseIds || (user as any)?.assigned_case_ids || [];
    const caseUsers = caseData?.assignedUsers || (caseData as any)?.assigned_users || [];
    const isAssigned =
      userCaseIds.includes(caseData.caseId) ||
      (caseData.caseNumber && userCaseIds.includes(caseData.caseNumber)) ||
      caseUsers.includes(user.id);

    const isCrossDeptAuthorized =
      user.role === 'Senior Officer' || user.role === 'Auditor / Security';

    if (!isAssigned && !isCrossDeptAuthorized) {
      return {
        allowed: false,
        reason: `User is not assigned to ${caseData.caseNumber || caseData.caseId}. Access denied.`,
        riskLevel: 'HIGH',
        requiresPurpose: false,
        policyId: 'POL-CASE-ASSIGNMENT-01',
      };
    }

    // If evaluating case-level view without document
    if (!document) {
      return {
        allowed: true,
        reason: 'Authorized case assignment view granted.',
        riskLevel: 'LOW',
        requiresPurpose: false,
        policyId: 'POL-CASE-VIEW-01',
      };
    }

    // 3. Document Sensitivity vs User Role Check
    const role = user.role;
    const sensitivity = document.sensitivity;

    const allowedSensitivities: Record<string, SensitivityLevel[]> = {
      'Senior Officer': ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'TOP_SECRET', 'FORENSIC'],
      'Investigating Officer': ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL'],
      'Cyber Crime Investigating Officer': ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL'],
      'Forensic Officer': ['PUBLIC', 'INTERNAL', 'FORENSIC'],
      'Prosecutor': ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL'],
      'Court User': ['PUBLIC'], // Public / Redacted Court Filings
      'Auditor / Security': ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'TOP_SECRET', 'FORENSIC'],
      'Admin': ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'TOP_SECRET', 'FORENSIC'],
    };

    const roleAllowed = allowedSensitivities[role] || ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL'];
    if (!roleAllowed.includes(sensitivity)) {
      return {
        allowed: false,
        reason: `Role '${role}' is not authorized to access '${sensitivity}' level documents.`,
        riskLevel: 'CRITICAL',
        requiresPurpose: false,
        policyId: 'POL-SENSITIVITY-RESTRICTED-01',
      };
    }

    // 4. Purpose Requirement Check
    const requiresPurpose = this.checkIfPurposeRequired(role, sensitivity, action);

    if (requiresPurpose && !purpose) {
      return {
        allowed: false,
        reason: `Access to '${document.name}' requires a valid declared purpose.`,
        riskLevel: 'MEDIUM',
        requiresPurpose: true,
        policyId: 'POL-PURPOSE-REQUIRED-01',
      };
    }

    // 5. Action Specific Governance (e.g. DOWNLOAD / SHARE)
    let riskLevel: RiskLevel = 'LOW';
    if (action === 'DOWNLOAD' || action === 'SHARE') {
      if (sensitivity === 'TOP_SECRET' || sensitivity === 'FORENSIC') {
        riskLevel = 'HIGH';
      } else {
        riskLevel = 'MEDIUM';
      }
    }

    return {
      allowed: true,
      reason: `Access granted for ${action} under role '${role}' with declared purpose: ${purpose || 'Standard Authorization'}.`,
      riskLevel,
      requiresPurpose,
      policyId: 'POL-ACCESS-GRANTED-01',
    };
  },

  checkIfPurposeRequired(role: Role, sensitivity: SensitivityLevel, action: AccessAction): boolean {
    if (role === 'Court User') return true; // Always requires purpose
    if (role === 'Forensic Officer') return true; // Purpose mandatory
    if (role === 'Auditor / Security') return true;
    if (role === 'Prosecutor') return true;
    if (
      (role === 'Investigating Officer' || role === 'Cyber Crime Investigating Officer') &&
      sensitivity === 'CONFIDENTIAL'
    )
      return true;
    if (action === 'DOWNLOAD' || action === 'SHARE') return true;
    return false;
  },

  canCreateCase(user: User): boolean {
    return (
      user.role === 'Senior Officer' ||
      user.role === 'Investigating Officer' ||
      user.role === 'Cyber Crime Investigating Officer' ||
      user.role === 'Admin'
    );
  },
};
