import { Role } from './auth';

export interface RolePermissionSummary {
  role: Role;
  displayLabel: string;
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
    displayLabel: 'वरिष्ठ अन्वेषण अधिकारी (Senior Investigating Officer)',
    personaName: 'Shri R. K. Verma',
    designation: 'Senior Investigating Officer',
    department: 'Central Investigation Bureau',
    clearanceLevel: 'TOP SECRET // EXECUTIVE CLEARANCE',
    badgeColor: 'border-purple-500/50 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
    description: 'वरिष्ठ अन्वेषण अधिकारी • Senior supervisory officer with cross-jurisdictional case oversight, incident initialization, and audit review.',
    can: [
      'View all cases across departments (cross-department oversight)',
      'Create and anchor new Digital Case Passports / Incidents',
      'Upload documents and register evidence artifacts',
      'Update case properties and verify evidence integrity',
      'Access security audit streams & custody telemetry',
      'Perform administrative reviews and case assignments',
    ],
    cannot: [
      'Bypass cryptographic tamper detection algorithms',
      'Modify or delete immutable audit ledger entries',
      'Alter historical evidence SHA-256 fingerprints',
    ],
  },
  'Investigating Officer': {
    role: 'Investigating Officer',
    displayLabel: 'अन्वेषण अधिकारी (Investigating Officer)',
    personaName: 'Insp. Rajesh Kumar',
    designation: 'Investigating Officer',
    department: 'Crime Branch Investigation',
    clearanceLevel: 'CONFIDENTIAL // LEAD INVESTIGATOR',
    badgeColor: 'border-blue-500/50 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    description: 'अन्वेषण अधिकारी • Primary investigative officer handling assigned incident inquiry, evidence acquisition, and case filing.',
    can: [
      'Add new incident reports and initialize Digital Case Passports',
      'View and manage assigned case files (e.g. CASE-2026-8942)',
      'Upload digital evidence and investigative reports',
      'Update permitted case details and evidence metadata',
      'Verify evidence bit-exact SHA-256 integrity for assigned cases',
      'Inspect case-level chronological audit streams',
    ],
    cannot: [
      'Access unauthorized / unassigned investigation cases',
      'View restricted TOP_SECRET or raw memory forensics without clearance',
      'Modify or delete immutable audit log records',
      'Access system-wide administrative configuration',
    ],
  },
  'Cyber Crime Investigating Officer': {
    role: 'Cyber Crime Investigating Officer',
    displayLabel: 'साइबर अपराध अन्वेषण अधिकारी (Cyber Crime Investigating Officer)',
    personaName: 'Insp. Vikram Malhotra',
    designation: 'Cyber Crime Investigating Officer',
    department: 'Cyber Crime Investigation Cell',
    clearanceLevel: 'CONFIDENTIAL // CYBER INVESTIGATOR',
    badgeColor: 'border-indigo-500/50 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
    description: 'साइबर अपराध अन्वेषण अधिकारी • Cyber crime investigator handling network forensics, digital evidence, and electronic incident reports.',
    can: [
      'Record cyber incidents and initialize Digital Case Passports',
      'View and manage assigned cyber crime cases',
      'Upload digital evidence, network captures, and technical reports',
      'Verify digital evidence SHA-256 integrity',
      'Inspect case-level chronological audit streams',
    ],
    cannot: [
      'Access unassigned or unauthorized cases',
      'Modify or delete immutable audit log records',
      'Access system-wide administrative console',
    ],
  },
  'Forensic Officer': {
    role: 'Forensic Officer',
    displayLabel: 'डिजिटल फोरेंसिक अधिकारी (Digital Forensics Officer)',
    personaName: 'Dr. Ananya Roy',
    designation: 'Digital Forensics Officer',
    department: 'Central Digital Forensic Science Laboratory',
    clearanceLevel: 'SPECIAL ACCESS // FORENSIC SCIENCE',
    badgeColor: 'border-cyan-500/50 bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
    description: 'डिजिटल फोरेंसिक अधिकारी • Forensic specialist conducting bitstream acquisitions, memory forensics, and hash verification.',
    can: [
      'Conduct authoritative server-side SHA-256 integrity verification',
      'Upload and register forensic disk images, memory captures, and artifacts',
      'Access FORENSIC classification materials for assigned cases',
      'Inspect cryptographic hashes and integrity verification anchors',
      'Update forensic metadata and analysis notes',
    ],
    cannot: [
      'Access unassigned criminal investigation files',
      'Delete or purge historical evidence records',
      'Access system administrative configuration controls',
      'Alter historical chain-of-custody audit logs',
    ],
  },
  'Prosecutor': {
    role: 'Prosecutor',
    displayLabel: 'सरकारी अभियोजक (Public Prosecutor)',
    personaName: 'Adv. Suresh Narang',
    designation: 'Public Prosecutor',
    department: 'Directorate of Public Prosecutions',
    clearanceLevel: 'LEGAL PRIVILEGE // COURTROOM PROSECUTION',
    badgeColor: 'border-amber-500/50 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    description: 'सरकारी अभियोजक • Legal prosecutor examining evidentiary admissibility, chain of custody compliance, and trial filing exhibits.',
    can: [
      'View assigned trial briefs, charge sheets, and evidence exhibits',
      'Inspect Chain of Custody trails for courtroom evidentiary admissibility',
      'Access case-level audit trails for legal discovery',
      'Verify digital evidence SHA-256 hashes for judicial presentation',
    ],
    cannot: [
      'Access unassigned or sealed law enforcement cases',
      'Upload or modify evidentiary artifacts directly',
      'Delete or purge case documents or evidence files',
      'Access restricted raw system images or forensic memory dumps',
    ],
  },
  'Court User': {
    role: 'Court User',
    displayLabel: 'न्यायिक अधिकारी (Judicial Officer)',
    personaName: 'Smt. Geeta Sharma',
    designation: 'Judicial Officer',
    department: 'Principal District & Sessions Court',
    clearanceLevel: 'PUBLIC REGISTRY // JUDICIAL OFFICER',
    badgeColor: 'border-emerald-500/50 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    description: 'न्यायिक अधिकारी • Judicial officer reviewing public court filings, official exhibits, and verifying submitted digital evidence records.',
    can: [
      'View judicial docket entries for assigned case passports',
      'Access PUBLIC sensitivity filings and submitted court exhibits',
      'Verify integrity of submitted digital court records via SHA-256',
      'Inspect official court docket status and registration dates',
    ],
    cannot: [
      'Access CONFIDENTIAL, TOP_SECRET, or raw FORENSIC evidence files',
      'Access unassigned active police investigation files',
      'Upload or alter evidentiary documents (read-only judicial oversight)',
      'View internal police investigation audit telemetry',
    ],
  },
  'Auditor / Security': {
    role: 'Auditor / Security',
    displayLabel: 'सुरक्षा एवं लेखा-परीक्षण अधिकारी (Security & Audit Officer)',
    personaName: 'Shri Alok Deshmukh',
    designation: 'Security & Audit Officer',
    department: 'Internal Oversight & Vigilance',
    clearanceLevel: 'FULL COMPLIANCE // AUDIT OVERSIGHT',
    badgeColor: 'border-rose-500/50 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    description: 'सुरक्षा एवं लेखा-परीक्षण अधिकारी • Independent oversight officer monitoring access governance, policy compliance, and audit logs.',
    can: [
      'Perform cross-department compliance oversight across all cases',
      'Access global immutable audit stream & security violation alerts',
      'Inspect document modification history and version change records',
      'Verify cryptographic hashes and ledger anchors across all files',
    ],
    cannot: [
      'Upload evidence or alter case filings (strictly oversight role)',
      'Delete or tamper with audit records (immutable tamper-evidence)',
      'Modify case details or purge evidence files',
      'Alter system infrastructure configuration',
    ],
  },
  'Admin': {
    role: 'Admin',
    displayLabel: 'प्रणाली प्रशासक (System Administrator)',
    personaName: 'Shri Amit Mehra',
    designation: 'System Administrator',
    department: 'National Informatics Directorate',
    clearanceLevel: 'ROOT GOVERNANCE // SYSTEM ADMIN',
    badgeColor: 'border-red-500/50 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
    description: 'प्रणाली प्रशासक • System administrator responsible for system security policies, role governance, storage configuration, and access controls.',
    can: [
      'Full system governance & policy console access',
      'Manage system roles, permissions, and active statuses',
      'Configure secure object storage repository and system settings',
      'Create and manage Digital Case Passports across departments',
      'View authorized audit streams, document version histories, and metrics',
      'Verify cryptographic integrity across all records',
    ],
    cannot: [
      'Falsify SHA-256 cryptographic verification calculations',
      'Retroactively alter immutable integrity anchors',
      'Tamper with mathematically chained audit blocks',
    ],
  },
};

