import { Role } from '../types/auth';

export interface IndianRoleDefinition {
  internalKey: Role;
  englishLabel: string;
  description: string;
}

export const INDIAN_ROLE_REGISTRY: Record<Role, IndianRoleDefinition> = {
  'Senior Officer': {
    internalKey: 'Senior Officer',
    englishLabel: 'Senior Investigating Officer',
    description: 'Senior supervisory officer with cross-jurisdictional case oversight and incident management.',
  },
  'Investigating Officer': {
    internalKey: 'Investigating Officer',
    englishLabel: 'Investigating Officer',
    description: 'Primary investigative officer handling incident inquiry, evidence collection, and case filing.',
  },
  'Cyber Crime Investigating Officer': {
    internalKey: 'Cyber Crime Investigating Officer',
    englishLabel: 'Cyber Crime Investigating Officer',
    description: 'Specialized cyber crime investigator for digital incident inquiry.',
  },
  'Forensic Officer': {
    internalKey: 'Forensic Officer',
    englishLabel: 'Digital Forensics Officer',
    description: 'Forensic specialist conducting bitstream acquisitions, memory forensics, and hash verification.',
  },
  'Prosecutor': {
    internalKey: 'Prosecutor',
    englishLabel: 'Public Prosecutor',
    description: 'Legal prosecutor examining evidentiary admissibility, chain of custody compliance, and trial filing exhibits.',
  },
  'Court User': {
    internalKey: 'Court User',
    englishLabel: 'Judicial Officer',
    description: 'Judicial officer reviewing public court filings and official digital exhibits.',
  },
  'Auditor / Security': {
    internalKey: 'Auditor / Security',
    englishLabel: 'Security & Audit Officer',
    description: 'Independent oversight officer monitoring policy compliance and access governance.',
  },
  'Admin': {
    internalKey: 'Admin',
    englishLabel: 'System Administrator',
    description: 'System administrator responsible for system security policies, role governance, and infrastructure health.',
  },
};

export const ROLE_DISPLAY_LABELS: Record<Role, string> = {
  'Senior Officer': 'Senior Investigating Officer',
  'Investigating Officer': 'Investigating Officer',
  'Cyber Crime Investigating Officer': 'Cyber Crime Investigating Officer',
  'Forensic Officer': 'Digital Forensics Officer',
  'Prosecutor': 'Public Prosecutor',
  'Court User': 'Judicial Officer',
  'Auditor / Security': 'Security & Audit Officer',
  'Admin': 'System Administrator',
};

export function findRoleDefinition(roleOrLabel: string | undefined | null): IndianRoleDefinition | null {
  if (!roleOrLabel) return null;
  const clean = roleOrLabel.trim().toLowerCase();

  for (const def of Object.values(INDIAN_ROLE_REGISTRY)) {
    if (
      def.internalKey.toLowerCase() === clean ||
      def.englishLabel.toLowerCase() === clean
    ) {
      return def;
    }
  }

  // Handle aliases like "Auditor", "Court", "Judge", etc.
  if (clean.includes('senior')) return INDIAN_ROLE_REGISTRY['Senior Officer'];
  if (clean.includes('cyber')) return INDIAN_ROLE_REGISTRY['Cyber Crime Investigating Officer'];
  if (clean.includes('investigat')) return INDIAN_ROLE_REGISTRY['Investigating Officer'];
  if (clean.includes('forensic')) return INDIAN_ROLE_REGISTRY['Forensic Officer'];
  if (clean.includes('prosecut')) return INDIAN_ROLE_REGISTRY['Prosecutor'];
  if (clean.includes('court') || clean.includes('judic')) return INDIAN_ROLE_REGISTRY['Court User'];
  if (clean.includes('audit') || clean.includes('secur')) return INDIAN_ROLE_REGISTRY['Auditor / Security'];
  if (clean.includes('admin')) return INDIAN_ROLE_REGISTRY['Admin'];

  return null;
}

export function getRoleLabel(
  role: string | undefined | null,
  _format?: string
): string {
  if (!role) return 'Authorized Personnel';
  const def = findRoleDefinition(role);
  if (!def) return role;
  return def.englishLabel;
}

export function getRoleHindiLabel(_role: string | undefined | null): string {
  return '';
}

export function getRoleBilingualLabel(role: string | undefined | null): string {
  return getRoleLabel(role);
}

export function getInternalRole(roleOrLabel: string): Role {
  const def = findRoleDefinition(roleOrLabel);
  if (def) {
    if (def.internalKey === 'Cyber Crime Investigating Officer') {
      // Backend database uses 'Investigating Officer' as standard enum key
      return 'Investigating Officer';
    }
    return def.internalKey;
  }
  return 'Investigating Officer';
}
