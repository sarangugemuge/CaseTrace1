from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from typing import List, Dict
from datetime import datetime, timezone

from backend.app.db.database import get_db
from backend.app.db.models.user import UserModel
from backend.app.db.models.case import CaseModel
from backend.app.db.models.document import DocumentModel
from backend.app.db.models.audit import AuditLogModel
from backend.app.schemas.notification import NotificationItem, NotificationsResponse
from backend.app.dependencies.auth import get_current_user
from backend.app.services.case_service import CaseService

router = APIRouter()

@router.get("/notifications", response_model=NotificationsResponse)
def get_user_notifications(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    case_service = CaseService(db)
    authorized_cases = case_service.list_cases_for_user(current_user)
    authorized_case_ids = [c.case_id for c in authorized_cases]
    case_map: Dict[str, CaseModel] = {c.case_id: c for c in authorized_cases}

    is_global = current_user.role in ["Senior Officer", "Auditor / Security", "Admin"]

    items: List[NotificationItem] = []

    # 1. New Case Assignment (For operational users assigned to cases)
    user_assigned_ids = current_user.assigned_case_ids or []
    for c_id in user_assigned_ids:
        if c_id in case_map:
            case_obj = case_map[c_id]
            ts = case_obj.created_at.isoformat() if getattr(case_obj, "created_at", None) else datetime.now(timezone.utc).isoformat()
            items.append(NotificationItem(
                id=f"notif-assign-{c_id}",
                type="CASE_ASSIGNMENT",
                title="Case Assignment",
                message=f"Active assignment for {case_obj.case_number}: {case_obj.title}",
                case_id=c_id,
                case_number=case_obj.case_number,
                timestamp=ts,
                severity="INFO",
                target_url=f"/dashboard/cases/{c_id}",
                read=False
            ))

    # 2. Evidence Requiring Verification (Documents with PENDING status in authorized cases)
    doc_query = db.query(DocumentModel)
    if not is_global:
        doc_query = doc_query.filter(DocumentModel.case_id.in_(authorized_case_ids))
    if current_user.role == "Court User":
        doc_query = doc_query.filter(DocumentModel.sensitivity == "PUBLIC")

    pending_docs = doc_query.filter(DocumentModel.integrity_status == "PENDING").all()
    for doc in pending_docs:
        c_num = case_map[doc.case_id].case_number if doc.case_id in case_map else (doc.case_id or "GENERAL")
        ts = doc.uploaded_at.isoformat() if getattr(doc, "uploaded_at", None) else datetime.now(timezone.utc).isoformat()
        items.append(NotificationItem(
            id=f"notif-pend-{doc.id}",
            type="VERIFICATION_REQUIRED",
            title="Evidence Requires Verification",
            message=f"Artifact '{doc.name}' in {c_num} requires cryptographic integrity verification.",
            case_id=doc.case_id,
            case_number=c_num,
            document_id=doc.id,
            timestamp=ts,
            severity="WARNING",
            target_url=f"/dashboard/cases/{doc.case_id}?tab=evidence" if doc.case_id else "/dashboard/verification",
            read=False
        ))

    # 3. Audit-driven Notifications (Restricted Access, Tamper Alerts, Verification Success, Case Updates)
    audit_query = db.query(AuditLogModel)
    if not is_global:
        audit_query = audit_query.filter(AuditLogModel.case_id.in_(authorized_case_ids))

    recent_logs = audit_query.order_by(desc(AuditLogModel.timestamp)).limit(30).all()

    for log in recent_logs:
        # Court User is strictly restricted: do not expose confidential/forensic tamper alerts or internal investigation logs
        if current_user.role == "Court User":
            if log.document_id:
                doc_obj = db.query(DocumentModel).filter(DocumentModel.id == log.document_id).first()
                if doc_obj and doc_obj.sensitivity != "PUBLIC":
                    continue
            if (log.risk_level or "").upper() in ["HIGH", "CRITICAL"] and log.user_id != current_user.id:
                continue

        c_num = case_map[log.case_id].case_number if log.case_id in case_map else (log.case_id or "SECURITY")
        ts = log.timestamp.isoformat() if getattr(log, "timestamp", None) else datetime.now(timezone.utc).isoformat()

        # A. Restricted Access Attempt
        if log.result in ["DENIED", "BLOCKED"] or "DENIED" in (log.action or ""):
            items.append(NotificationItem(
                id=f"notif-denied-{log.event_id}",
                type="RESTRICTED_ACCESS",
                title="Restricted Access Attempt",
                message=f"Access blocked for {log.user_name} ({log.role}): {log.description or 'Clearance policy denied'}",
                case_id=log.case_id,
                case_number=c_num,
                document_id=log.document_id,
                timestamp=ts,
                severity="CRITICAL",
                target_url=f"/dashboard/cases/{log.case_id}?tab=timeline" if log.case_id else "/dashboard/audit",
                read=False
            ))

        # B. Document Integrity Mismatch
        elif log.result in ["TAMPER_ALERT", "FLAGGED"] or "MISMATCH" in (log.description or ""):
            items.append(NotificationItem(
                id=f"notif-mismatch-{log.event_id}",
                type="INTEGRITY_MISMATCH",
                title="Document Integrity Mismatch",
                message=f"Integrity alert in {c_num}! Current SHA-256 hash mismatch: {log.description}",
                case_id=log.case_id,
                case_number=c_num,
                document_id=log.document_id,
                timestamp=ts,
                severity="CRITICAL",
                target_url="/dashboard/verification",
                read=False
            ))

        # C. Successful Verification
        elif log.action in ["INTEGRITY_VERIFICATION", "DOCUMENT_VERIFIED"] and log.result == "SUCCESS":
            items.append(NotificationItem(
                id=f"notif-verified-{log.event_id}",
                type="VERIFICATION_SUCCESS",
                title="Successful Verification",
                message=f"Bit-exact SHA-256 hash verified for artifact in {c_num}.",
                case_id=log.case_id,
                case_number=c_num,
                document_id=log.document_id,
                timestamp=ts,
                severity="SUCCESS",
                target_url=f"/dashboard/cases/{log.case_id}?tab=integrity" if log.case_id else "/dashboard/verification",
                read=False
            ))

        # D. Case Update
        elif log.action in ["CASE_CREATED", "CASE_UPDATED", "CASE_STAGE_CHANGED"]:
            items.append(NotificationItem(
                id=f"notif-update-{log.event_id}",
                type="CASE_UPDATE",
                title="Case Update",
                message=f"{c_num}: {log.description or 'Case passport records updated'}",
                case_id=log.case_id,
                case_number=c_num,
                timestamp=ts,
                severity="INFO",
                target_url=f"/dashboard/cases/{log.case_id}" if log.case_id else "/dashboard/cases",
                read=False
            ))

    # Sort descending by timestamp and deduplicate by id
    seen_ids = set()
    unique_items: List[NotificationItem] = []
    for it in sorted(items, key=lambda x: x.timestamp, reverse=True):
        if it.id not in seen_ids:
            seen_ids.add(it.id)
            unique_items.append(it)

    final_list = unique_items[:15]
    unread_count = sum(1 for it in final_list if not it.read)

    return NotificationsResponse(
        total=len(final_list),
        unread_count=unread_count,
        notifications=final_list
    )
