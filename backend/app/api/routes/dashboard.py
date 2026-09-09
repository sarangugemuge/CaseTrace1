from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from typing import List, Dict
from backend.app.db.database import get_db
from backend.app.db.models.user import UserModel
from backend.app.db.models.case import CaseModel
from backend.app.db.models.document import DocumentModel
from backend.app.db.models.audit import AuditLogModel
from backend.app.schemas.dashboard import DashboardStatsResponse, DashboardActivityItem
from backend.app.dependencies.auth import get_current_user
from backend.app.services.case_service import CaseService

router = APIRouter()

@router.get("/dashboard/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    case_service = CaseService(db)
    authorized_cases = case_service.list_cases_for_user(current_user)
    authorized_case_ids = [c.case_id for c in authorized_cases]
    case_number_map: Dict[str, str] = {c.case_id: c.case_number for c in authorized_cases}

    # Summary Metrics
    total_authorized = len(authorized_cases)
    active_cases = sum(1 for c in authorized_cases if (c.status or "").upper() == "ACTIVE")
    critical_cases = sum(1 for c in authorized_cases if (c.priority or "").upper() == "CRITICAL")
    total_evidence_items = sum(c.evidence_count or 0 for c in authorized_cases)

    pending_verification = 0
    integrity_alerts = 0

    if authorized_case_ids:
        # Pending verification: documents not yet VERIFIED
        pending_verification = db.query(DocumentModel).filter(
            DocumentModel.case_id.in_(authorized_case_ids),
            DocumentModel.integrity_status != "VERIFIED"
        ).count()

        # Integrity alerts: documents with tamper status + high-risk/denied audit entries
        tamper_docs_count = db.query(DocumentModel).filter(
            DocumentModel.case_id.in_(authorized_case_ids),
            DocumentModel.integrity_status.in_(["TAMPER_SUSPECTED", "TAMPERED"])
        ).count()

        denied_audit_count = db.query(AuditLogModel).filter(
            AuditLogModel.case_id.in_(authorized_case_ids),
            or_(
                AuditLogModel.result.in_(["DENIED", "BLOCKED", "TAMPER_ALERT"]),
                AuditLogModel.risk_level.in_(["HIGH", "CRITICAL"])
            )
        ).count()

        integrity_alerts = tamper_docs_count + denied_audit_count

    # Fetch Recent Activity stream scoped to permissions
    is_global_auditor = current_user.role in ["Senior Officer", "Auditor / Security", "Admin"]
    
    if is_global_auditor:
        recent_logs = (
            db.query(AuditLogModel)
            .order_by(desc(AuditLogModel.timestamp))
            .limit(15)
            .all()
        )
    elif authorized_case_ids:
        recent_logs = (
            db.query(AuditLogModel)
            .filter(
                or_(
                    AuditLogModel.case_id.in_(authorized_case_ids),
                    AuditLogModel.user_id == current_user.id
                )
            )
            .order_by(desc(AuditLogModel.timestamp))
            .limit(15)
            .all()
        )
    else:
        recent_logs = (
            db.query(AuditLogModel)
            .filter(AuditLogModel.user_id == current_user.id)
            .order_by(desc(AuditLogModel.timestamp))
            .limit(15)
            .all()
        )

    # Resolve document names for activities
    doc_ids = [l.document_id for l in recent_logs if l.document_id]
    doc_name_map: Dict[str, str] = {}
    if doc_ids:
        docs = db.query(DocumentModel.id, DocumentModel.name).filter(DocumentModel.id.in_(doc_ids)).all()
        doc_name_map = {d[0]: d[1] for d in docs}

    # Missing case numbers lookup (if case wasn't in authorized list for non-global users)
    missing_case_ids = [l.case_id for l in recent_logs if l.case_id and l.case_id not in case_number_map]
    if missing_case_ids:
        cases_lookup = db.query(CaseModel.case_id, CaseModel.case_number).filter(CaseModel.case_id.in_(missing_case_ids)).all()
        for c in cases_lookup:
            case_number_map[c[0]] = c[1]

    activity_items: List[DashboardActivityItem] = []
    for log in recent_logs:
        activity_items.append(
            DashboardActivityItem(
                event_id=log.event_id,
                timestamp=log.timestamp,
                action=log.action,
                case_id=log.case_id,
                case_number=case_number_map.get(log.case_id) if log.case_id else None,
                document_id=log.document_id,
                document_name=doc_name_map.get(log.document_id) if log.document_id else None,
                user_name=log.user_name,
                role=log.role,
                result=log.result or "SUCCESS",
                risk_level=log.risk_level or "LOW",
                description=log.description or ""
            )
        )

    return DashboardStatsResponse(
        active_cases=active_cases,
        critical_cases=critical_cases,
        total_evidence_items=total_evidence_items,
        pending_verification=pending_verification,
        integrity_alerts=integrity_alerts,
        total_authorized_cases=total_authorized,
        user_role=current_user.role,
        user_name=current_user.name,
        recent_activity=activity_items
    )

@router.get("/dashboard/activity", response_model=List[DashboardActivityItem])
def get_dashboard_activity(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    stats = get_dashboard_stats(db=db, current_user=current_user)
    return stats.recent_activity

