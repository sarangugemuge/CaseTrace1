import logging
import uuid
from datetime import datetime, timezone
from backend.app.db.database import SessionLocal, engine, Base
from backend.app.db.models.user import UserModel
from backend.app.db.models.case import CaseModel
from backend.app.db.models.document import DocumentModel
from backend.app.db.models.audit import AuditLogModel
from backend.app.db.models.access_record import AccessRecordModel
from backend.app.db.models.role import RoleModel
from backend.app.core.security import get_password_hash

logger = logging.getLogger("casetrace.seed")

def seed_database(db=None):
    close_after = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        close_after = True

    try:
        # 1. Seed 7 Demo Personas / Users
        if db.query(UserModel).count() == 0:
            logger.info("Seeding 7 CASETRACE user personas...")
            users = [
                UserModel(
                    id="usr-001", name="Cmdr. Robert Vance", email="robert.vance@casetrace.gov",
                    hashed_password=get_password_hash("password123"), role="Senior Officer",
                    department="Executive Crime Command", designation="Senior Commanding Officer", avatar="RV",
                    assigned_case_ids=["CASE-2026-8942", "CASE-2026-4410", "CASE-2026-1105"]
                ),
                UserModel(
                    id="usr-002", name="Insp. Sarah Jenkins", email="sarah.jenkins@casetrace.gov",
                    hashed_password=get_password_hash("password123"), role="Investigating Officer",
                    department="Financial Crimes Division", designation="Lead Investigator", avatar="SJ",
                    assigned_case_ids=["CASE-2026-8942"]
                ),
                UserModel(
                    id="usr-003", name="Dr. Alex Mercer", email="alex.mercer@casetrace.gov",
                    hashed_password=get_password_hash("password123"), role="Forensic Officer",
                    department="Digital Forensics Lab", designation="Chief Forensic Analyst", avatar="AM",
                    assigned_case_ids=["CASE-2026-8942", "CASE-2026-1105"]
                ),
                UserModel(
                    id="usr-004", name="Atty. Marcus Thorne", email="marcus.thorne@casetrace.gov",
                    hashed_password=get_password_hash("password123"), role="Prosecutor",
                    department="Department of Public Prosecutions", designation="Special Public Prosecutor", avatar="MT",
                    assigned_case_ids=["CASE-2026-8942", "CASE-2026-4410"]
                ),
                UserModel(
                    id="usr-005", name="Clerk Helen Ross", email="helen.ross@courts.gov",
                    hashed_password=get_password_hash("password123"), role="Court User",
                    department="High Court Registry", designation="Judicial Case Manager", avatar="HR",
                    assigned_case_ids=["CASE-2026-8942"]
                ),
                UserModel(
                    id="usr-006", name="David Chen", email="david.chen@casetrace.gov",
                    hashed_password=get_password_hash("password123"), role="Auditor / Security",
                    department="Internal Affairs & Oversight", designation="Lead Cyber Auditor", avatar="DC",
                    assigned_case_ids=["CASE-2026-8942", "CASE-2026-4410", "CASE-2026-1105"]
                ),
                UserModel(
                    id="usr-007", name="Elena Rostova", email="elena.rostova@casetrace.gov",
                    hashed_password=get_password_hash("password123"), role="Admin",
                    department="Information Technology Directorate", designation="Principal Systems Administrator", avatar="ER",
                    assigned_case_ids=["CASE-2026-8942", "CASE-2026-4410", "CASE-2026-1105"]
                )
            ]
            db.add_all(users)
            db.commit()

        # Seed Indian Personas matching the Frontend Preset Dropdown
        indian_personas = [
            ("usr-ind-001", "Shri R. K. Verma", "rk.verma@casetrace.gov.in", "Senior Officer", "Central Investigation Bureau", "Senior Investigating Officer", "RV"),
            ("usr-ind-002", "Insp. Rajesh Kumar", "rajesh.kumar@casetrace.gov.in", "Investigating Officer", "Crime Branch Investigation", "Investigating Officer", "RK"),
            ("usr-ind-003", "Insp. Vikram Malhotra", "vikram.malhotra@casetrace.gov.in", "Cyber Crime Investigating Officer", "Cyber Crime Investigation Cell", "Cyber Crime Investigating Officer", "VM"),
            ("usr-ind-004", "Dr. Ananya Roy", "ananya.roy@casetrace.gov.in", "Forensic Officer", "Central Digital Forensic Science Laboratory", "Digital Forensics Officer", "AR"),
            ("usr-ind-005", "Adv. Suresh Narang", "suresh.narang@prosecution.gov.in", "Prosecutor", "Directorate of Public Prosecutions", "Public Prosecutor", "SN"),
            ("usr-ind-006", "Smt. Geeta Sharma", "geeta.sharma@ecourts.gov.in", "Court User", "Principal District & Sessions Court", "Judicial Officer", "GS"),
            ("usr-ind-007", "Shri Alok Deshmukh", "alok.deshmukh@casetrace.gov.in", "Auditor / Security", "Internal Oversight & Vigilance", "Security & Audit Officer", "AD"),
            ("usr-ind-008", "Shri Amit Mehra", "amit.mehra@casetrace.gov.in", "Admin", "National Informatics Directorate", "System Administrator", "AM"),
            ("usr-ind-009", "Insp. Sarah Jenkins", "officer.jenkins@police.gov.in", "Investigating Officer", "Financial Crimes Division", "Lead Investigator", "SJ"),
        ]
        for uid, name, email_addr, role_val, dept, desig, av in indian_personas:
            if not db.query(UserModel).filter(UserModel.email == email_addr).first():
                db.add(UserModel(
                    id=uid, name=name, email=email_addr,
                    hashed_password=get_password_hash("password123"), role=role_val,
                    department=dept, designation=desig, avatar=av,
                    assigned_case_ids=["CASE-2026-8942", "CASE-2026-4410", "CASE-2026-1105"]
                ))
        db.commit()

        # 2. Seed 3 Demo Cases
        if db.query(CaseModel).count() == 0:
            logger.info("Seeding 3 CASETRACE investigation cases...")
            c1 = CaseModel(
                case_id="CASE-2026-8942", case_number="CASE-2026-8942",
                title="Operation DarkLedge Financial Fraud",
                description="Multi-jurisdictional syndicate wire fraud exceeding $42 Million.",
                status="ACTIVE", priority="CRITICAL", classification="TOP_SECRET",
                department="Financial Crimes Division", lead_investigator="Insp. Sarah Jenkins",
                assigned_users=["usr-001", "usr-002", "usr-003", "usr-004", "usr-005", "usr-006", "usr-007"],
                incident_date="2025-11-20", case_stage="FORENSIC_ANALYSIS",
                victims=["Global Horizon Banking Corp"], suspects=["Viktor Sterling"],
                evidence_count=18, document_count=6,
                blockchain_anchor_id="0x8f2a1b94c3e801d9f4e271a5b8c9d0e1f2a3b4c5"
            )
            c2 = CaseModel(
                case_id="CASE-2026-4410", case_number="CASE-2026-4410",
                title="Port Harbor Narcotics Network",
                description="Illicit maritime smuggling channels and encrypted satellite comms.",
                status="IN_COURT", priority="HIGH", classification="CONFIDENTIAL",
                department="Narcotics & Tactical Taskforce", lead_investigator="Capt. Hector Ruiz",
                assigned_users=["usr-001", "usr-004", "usr-005", "usr-006", "usr-007"],
                incident_date="2026-02-18", case_stage="TRIALS_ONGOING",
                victims=["Port Authority"], suspects=["Carlos Delgado"],
                evidence_count=34, document_count=14,
                blockchain_anchor_id="0x3c7d9e1f4a5b6c8a9b0c1d2e3f4a5b6c7d8e9f0a"
            )
            c3 = CaseModel(
                case_id="CASE-2026-1105", case_number="CASE-2026-1105",
                title="Critical Infrastructure Cyber Intrusion",
                description="APT-44 SCADA control modules zero-day infiltration.",
                status="ACTIVE", priority="CRITICAL", classification="TOP_SECRET",
                department="Cyber Warfare & Infrastructure Protection", lead_investigator="Dr. Alex Mercer",
                assigned_users=["usr-001", "usr-003", "usr-006", "usr-007"],
                incident_date="2026-06-18", case_stage="EVIDENCE_COLLECTION",
                victims=["National Power Grid"], suspects=["APT-44 Cyber Syndicate"],
                evidence_count=52, document_count=22,
                blockchain_anchor_id="0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b"
            )
            db.add_all([c1, c2, c3])

        # 3. Seed Document Metadata
        if db.query(DocumentModel).count() == 0:
            logger.info("Seeding document metadata records...")
            d1 = DocumentModel(
                id="doc-101", case_id="CASE-2026-8942", name="FIR_Operation_DarkLedge.pdf",
                type="PDF", category="FIRST_INFORMATION_REPORT", sensitivity="PUBLIC",
                version=1, uploaded_by="Insp. Sarah Jenkins",
                sha256_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                blockchain_record_id="blk-001", allowed_roles=["Senior Officer", "Investigating Officer", "Forensic Officer", "Prosecutor", "Court User", "Auditor / Security", "Admin"],
                allowed_purposes=["INVESTIGATION", "LEGAL_REVIEW", "COURT_PROCEEDING", "AUDIT"], integrity_status="VERIFIED"
            )
            d2 = DocumentModel(
                id="doc-102", case_id="CASE-2026-8942", name="Financial_Transaction_Audit_Report.pdf",
                type="PDF", category="FINANCIAL_AUDIT", sensitivity="CONFIDENTIAL",
                version=2, uploaded_by="Insp. Sarah Jenkins",
                sha256_hash="7f83b1657ff1fc53b92dc18148a1d65dfc61dd3002532966737170495f80185d",
                blockchain_record_id="blk-002", allowed_roles=["Senior Officer", "Investigating Officer", "Prosecutor", "Auditor / Security", "Admin"],
                allowed_purposes=["INVESTIGATION", "LEGAL_REVIEW", "AUDIT"], integrity_status="VERIFIED"
            )
            d3 = DocumentModel(
                id="doc-103", case_id="CASE-2026-8942", name="System_Forensic_Memory_Dump.img",
                type="IMG", category="SYSTEM_IMAGE", sensitivity="FORENSIC",
                version=1, uploaded_by="Dr. Alex Mercer",
                sha256_hash="bf5b79647228807d8955219488a08c02c636f1c407559ed5a4bb8e84a20b0805",
                blockchain_record_id="blk-003", allowed_roles=["Senior Officer", "Forensic Officer", "Auditor / Security", "Admin"],
                allowed_purposes=["FORENSIC_ANALYSIS", "AUDIT"], integrity_status="VERIFIED"
            )
            db.add_all([d1, d2, d3])

        # 4. Seed Audit Logs
        if db.query(AuditLogModel).count() == 0:
            logger.info("Seeding audit log records...")
            l1 = AuditLogModel(
                event_id="evt-seed-1", user_id="usr-002", user_name="Insp. Sarah Jenkins",
                role="Investigating Officer", case_id="CASE-2026-8942", document_id="doc-101",
                action="DOCUMENT_VIEW", purpose="INVESTIGATION", result="SUCCESS",
                risk_level="LOW", description="Initial FIR document inspected by lead investigator."
            )
            l2 = AuditLogModel(
                event_id="evt-seed-2", user_id="usr-003", user_name="Dr. Alex Mercer",
                role="Forensic Officer", case_id="CASE-2026-8942", document_id="doc-103",
                action="INTEGRITY_VERIFICATION", purpose="FORENSIC_ANALYSIS", result="SUCCESS",
                risk_level="LOW", description="Memory dump hash verified against ledger block #14820934."
            )
            db.add_all([l1, l2])

        # 5. Seed Access Records
        if db.query(AccessRecordModel).count() == 0:
            logger.info("Seeding access decision records...")
            ar1 = AccessRecordModel(
                id=f"rec-{uuid.uuid4().hex[:8]}", user_id="usr-001", user_role="Senior Officer",
                case_id="CASE-2026-8942", document_id="doc-102", action="VIEW",
                purpose="EXECUTIVE_REVIEW", decision="ALLOWED", policy_id="POL-SENIOR-FULL-01",
                risk_level="LOW", reason="Senior Officer granted full view clearance."
            )
            db.add(ar1)

        # 6. Seed 7 System Roles (Admin Role Management)
        if db.query(RoleModel).count() == 0:
            logger.info("Seeding 7 CASETRACE system roles...")
            roles = [
                RoleModel(
                    id="role-001", name="Senior Investigating Officer", role_key="Senior Officer",
                    description="Senior law enforcement executive with incident creation, cross-department oversight, and full audit discovery.",
                    permissions=["VIEW_CASES", "CREATE_CASES", "EDIT_CASES", "VIEW_EVIDENCE", "UPLOAD_EVIDENCE", "EDIT_EVIDENCE", "VERIFY_EVIDENCE", "VIEW_AUDIT"],
                    is_active=True, is_system=True
                ),
                RoleModel(
                    id="role-002", name="Cyber Crime Investigating Officer", role_key="Investigating Officer",
                    description="Direct cyber investigator handling assigned incident investigation, evidence gathering, and case filing.",
                    permissions=["VIEW_CASES", "CREATE_CASES", "EDIT_CASES", "VIEW_EVIDENCE", "UPLOAD_EVIDENCE", "EDIT_EVIDENCE", "VERIFY_EVIDENCE", "VIEW_AUDIT"],
                    is_active=True, is_system=True
                ),
                RoleModel(
                    id="role-003", name="Digital Forensics Officer", role_key="Forensic Officer",
                    description="Forensic analyst authorized for bitstream acquisitions, memory forensics, and hash verification.",
                    permissions=["VIEW_CASES", "VIEW_EVIDENCE", "UPLOAD_EVIDENCE", "EDIT_EVIDENCE", "VERIFY_EVIDENCE", "VIEW_AUDIT"],
                    is_active=True, is_system=True
                ),
                RoleModel(
                    id="role-004", name="Public Prosecutor", role_key="Prosecutor",
                    description="Legal counsel reviewing trial exhibits, chain of custody admissibility, and legal filings.",
                    permissions=["VIEW_CASES", "VIEW_EVIDENCE", "VERIFY_EVIDENCE", "VIEW_AUDIT"],
                    is_active=True, is_system=True
                ),
                RoleModel(
                    id="role-005", name="Judicial Officer", role_key="Court User",
                    description="Judicial registry officer limited strictly to public docket filings and unsealed exhibits.",
                    permissions=["VIEW_CASES", "VIEW_EVIDENCE", "VERIFY_EVIDENCE"],
                    is_active=True, is_system=True
                ),
                RoleModel(
                    id="role-006", name="Security & Audit Officer", role_key="Auditor / Security",
                    description="Independent oversight auditor monitoring RBAC compliance, policy violations, and tamper alerts.",
                    permissions=["VIEW_CASES", "VIEW_EVIDENCE", "VERIFY_EVIDENCE", "VIEW_AUDIT"],
                    is_active=True, is_system=True
                ),
                RoleModel(
                    id="role-007", name="System Administrator", role_key="Admin",
                    description="System administrator responsible for infrastructure health, user governance, and security policy orchestration.",
                    permissions=["VIEW_CASES", "CREATE_CASES", "EDIT_CASES", "VIEW_EVIDENCE", "UPLOAD_EVIDENCE", "EDIT_EVIDENCE", "VERIFY_EVIDENCE", "VIEW_AUDIT", "MANAGE_ROLES", "SYSTEM_CONFIG"],
                    is_active=True, is_system=True
                ),
            ]
            db.add_all(roles)

        db.commit()
        logger.info("CASETRACE seed completed successfully.")

    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}")
        raise e
    finally:
        if close_after:
            db.close()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    seed_database()
