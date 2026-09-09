import { Role } from './auth';

export interface RolePermissionSummary {
  role: Role;
  personaName: string;
  designation: string;
  department: string;
  clearanceLevel: string;
  badgeColor: string;
  description: string;
  can: string[];
  cannot: string[];
}

export const ROLE_PERMISSIONS: Record<Role, RolePermissionSummary> = {
  'Senior Officer': {
    role: 'Senior Officer',
    personaName: 'Cmdr. Robert Vance',
    designation: 'Senior Commanding Officer',
    department: 'Executive Crime Command',
    clearanceLevel: 'TOP SECRET // EXECUTIVE CLEARANCE',
    badgeColor: 'border-purple-500/50 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
    description: 'Executive authority across all jurisdictional cases with case creation, cross-department oversight, and full audit discovery.',
    can: [
      'View all cases across departments (cross-department oversight)',
      'Create and anchor new Digital Case Passports',
      'Upload documents and register evidence artifacts',
      'Verify evidence bit-exact SHA-256 integrity',
      'Access global security audit stream & telemetry',
      'Perform case updates & administrative reviews',
    ],
    cannot: [
      'Bypass cryptographic tamper detection algorithms',
      'Modify or delete immutable audit ledger entries',
      'Alter historical evidence SHA-256 fingerprints',
    ],
  },
  'Investigating Officer': {
    role: 'Investigating Officer',
    personaName: 'Insp. Sarah Jenkins',
    designation: 'Lead Investigator',
    department: 'Financial Crimes Division',
    clearanceLevel: 'CONFIDENTIAL // LEAD INVESTIGATOR',
    badgeColor: 'border-blue-500/50 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    description: 'Direct investigator responsible for assigned case handling, evidence gathering, and investigative report filing.',
    can: [
      'View assigned case passports (e.g. CASE-2026-8942)',
      'Register evidence and upload investigation files',
      'Access CONFIDENTIAL and INTERNAL case documents',
      'Verify evidence integrity for assigned cases',
      'Inspect case-level chronological audit streams',
    ],
    cannot: [
      'Access unauthorized / unassigned investigation cases',
      'View restricted TOP_SECRET or FORENSIC raw system images',
      'Create new cases (Senior Officer / Admin authorization required)',
      'Access global system audit logs or administrative controls',
    ],
  },
  'Forensic Officer': {
    role: 'Forensic Officer',
    personaName: 'Dr. Alex Mercer',
    designation: 'Chief Forensic Analyst',
    department: 'Digital Forensics Lab',
    clearanceLevel: 'SPECIAL ACCESS // FORENSIC SCIENCE',
    badgeColor: 'border-cyan-500/50 bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
    description: 'Forensic specialist authorized for cryptographic integrity verification, bitstream acquisitions, and memory dump analysis.',
    can: [
      'Conduct authoritative bit-level SHA-256 integrity verification',
      'Access specialized FORENSIC artifacts & disk images for assigned cases',
      'Register digital forensic evidence & memory captures',
      'Inspect cryptographic hashes, blocks, and genesis ledger anchors',
    ],
    cannot: [
      'Access unassigned criminal investigation cases',
      'Create new case passports',
      'Access general system administrative configurations',
      'Modify or delete historical chain-of-custody audit logs',
    ],
  },
  'Prosecutor': {
    role: 'Prosecutor',
    personaName: 'Atty. Marcus Thorne',
    designation: 'Special Public Prosecutor',
    department: 'Department of Public Prosecutions',
    clearanceLevel: 'LEGAL PRIVILEGE // COURTROOM PROSECUTION',
    badgeColor: 'border-amber-500/50 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    description: 'Legal counsel reviewing trial exhibits, chain of custody admissibility, and legal case filings.',
    can: [
      'View assigned legal cases and trial exhibits',
      'Access CONFIDENTIAL legal briefs and case documents',
      'Inspect Chain of Custody trails for courtroom admissibility',
      'Access global and case-level audit trails for trial discovery',
      'Verify digital evidence integrity for court presentation',
    ],
    cannot: [
      'Access unassigned cases',
      'Access restricted FORENSIC disk dumps or TOP_SECRET intelligence',
      'Create new digital case passports',
      'Delete or purge case documents or evidence',
    ],
  },
  'Court User': {
    role: 'Court User',
    personaName: 'Clerk Helen Ross',
    designation: 'Judicial Case Manager',
    department: 'High Court Registry',
    clearanceLevel: 'PUBLIC REGISTRY // JUDICIAL CLERK',
    badgeColor: 'border-emerald-500/50 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    description: 'Judicial registry officer limited strictly to public docket filings and unsealed court exhibits.',
    can: [
      'View public registry data for assigned cases',
      'Access PUBLIC sensitivity filings and redacted court exhibits',
      'Verify integrity of submitted public court documents',
      'Inspect public case docket and registration status',
    ],
    cannot: [
      'Access CONFIDENTIAL, TOP_SECRET, or FORENSIC evidence (Clearance Denied)',
      'Access unassigned investigation cases',
      'Upload documents or register evidence (restricted read-only registry role)',
      'View internal investigation audit logs or administrative controls',
    ],
  },
  'Auditor / Security': {
    role: 'Auditor / Security',
    personaName: 'David Chen',
    designation: 'Lead Cyber Auditor',
    department: 'Internal Affairs & Oversight',
    clearanceLevel: 'FULL COMPLIANCE // AUDIT OVERSIGHT',
    badgeColor: 'border-rose-500/50 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    description: 'Independent oversight auditor monitoring RBAC compliance, policy violations, and tamper alert telemetry.',
    can: [
      'Perform cross-department compliance oversight across all cases',
      'Access global immutable audit stream & security violation alerts',
      'Inspect all sensitivity levels for regulatory compliance',
      'Verify cryptographic hashes and ledger anchors',
    ],
    cannot: [
      'Upload evidence or alter case filings (strictly read-only oversight role)',
      'Create new digital case passports',
      'Delete or tamper with audit records (tamper-evident immutability)',
      'Delete evidence records or modify case details',
    ],
  },
  'Admin': {
    role: 'Admin',
    personaName: 'Elena Rostova',
    designation: 'Principal Systems Administrator',
    department: 'Information Technology Directorate',
    clearanceLevel: 'ROOT GOVERNANCE // SYSTEM ADMIN',
    badgeColor: 'border-red-500/50 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
    description: 'System administrator responsible for infrastructure health, user governance, and security policy orchestration.',
    can: [
      'Full system governance & policy console access',
      'Create and manage Digital Case Passports',
      'Delete documents & evidence (administrative purge with audit record)',
      'View all cases and access global audit telemetry',
      'Verify cryptographic integrity across all records',
    ],
    cannot: [
      'Falsify SHA-256 cryptographic verification calculations',
      'Retroactively alter immutable blockchain ledger anchors',
      'Tamper with mathematically chained audit blocks',
    ],
  },
};
