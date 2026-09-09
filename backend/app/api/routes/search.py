from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Dict
from backend.app.db.database import get_db
from backend.app.db.models.user import UserModel
from backend.app.db.models.case import CaseModel
from backend.app.db.models.document import DocumentModel
from backend.app.dependencies.auth import get_current_user
from backend.app.services.case_service import CaseService
from backend.app.schemas.search import (
    GlobalSearchResponse,
    SearchCaseItem,
    SearchDocumentItem,
    SearchEvidenceItem,
    SearchHashItem,
)

router = APIRouter()

FORENSIC_CATEGORIES = {
    "SYSTEM_IMAGE",
    "EVIDENCE",
    "EVIDENCE_PHOTO",
    "FORENSIC_REPORT",
    "COURT_EXHIBIT",
}

@router.get("/search", response_model=GlobalSearchResponse)
def global_search(
    q: str = Query("", description="Search term for cases, documents, evidence, or hashes"),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    clean_query = (q or "").strip()[:100]  # Sanitize length to prevent excessive parsing
    if not clean_query:
        return GlobalSearchResponse(
            query="",
            total_results=0,
            cases=[],
            documents=[],
            evidence=[],
            hashes=[],
        )

    case_service = CaseService(db)
    authorized_cases = case_service.list_cases_for_user(current_user)
    authorized_case_ids = [c.case_id for c in authorized_cases]
    case_map: Dict[str, CaseModel] = {c.case_id: c for c in authorized_cases}

    if not authorized_case_ids:
        return GlobalSearchResponse(
            query=clean_query,
            total_results=0,
            cases=[],
            documents=[],
            evidence=[],
            hashes=[],
        )

    term = f"%{clean_query}%"

    # 1. Search Cases
    matching_cases = (
        db.query(CaseModel)
        .filter(
            CaseModel.case_id.in_(authorized_case_ids),
            or_(
                CaseModel.case_number.ilike(term),
                CaseModel.title.ilike(term),
                CaseModel.description.ilike(term),
                CaseModel.lead_investigator.ilike(term),
            ),
        )
        .limit(5)
        .all()
    )

    case_results: List[SearchCaseItem] = [
        SearchCaseItem(
            case_id=c.case_id,
            case_number=c.case_number,
            title=c.title,
            status=c.status,
            priority=c.priority,
            classification=c.classification,
        )
        for c in matching_cases
    ]

    # 2. Search Documents (General documents like FIR, Audits, Filings)
    matching_docs = (
        db.query(DocumentModel)
        .filter(
            DocumentModel.case_id.in_(authorized_case_ids),
            DocumentModel.category.not_in(FORENSIC_CATEGORIES),
            or_(
                DocumentModel.name.ilike(term),
                DocumentModel.category.ilike(term),
                DocumentModel.type.ilike(term),
            ),
        )
        .limit(5)
        .all()
    )

    doc_results: List[SearchDocumentItem] = [
        SearchDocumentItem(
            id=d.id,
            name=d.name,
            case_id=d.case_id,
            case_number=case_map.get(d.case_id).case_number if case_map.get(d.case_id) else d.case_id,
            sensitivity=d.sensitivity,
            type=d.type,
        )
        for d in matching_docs
    ]

    # 3. Search Evidence (Forensic Artifacts, Images, Memory Dumps, or Evidence ID match)
    matching_evidence = (
        db.query(DocumentModel)
        .filter(
            DocumentModel.case_id.in_(authorized_case_ids),
            or_(
                DocumentModel.category.in_(FORENSIC_CATEGORIES),
                DocumentModel.id.ilike(term),
            ),
            or_(
                DocumentModel.name.ilike(term),
                DocumentModel.id.ilike(term),
                DocumentModel.category.ilike(term),
            ),
        )
        .limit(5)
        .all()
    )

    evidence_results: List[SearchEvidenceItem] = [
        SearchEvidenceItem(
            evidence_id=e.id,
            name=e.name,
            case_id=e.case_id,
            case_number=case_map.get(e.case_id).case_number if case_map.get(e.case_id) else e.case_id,
            verification_status=e.integrity_status or "VERIFIED",
            sha256_hash=e.sha256_hash,
        )
        for e in matching_evidence
    ]

    # 4. Search Hashes (SHA-256 hash or blockchain anchor match)
    hash_results: List[SearchHashItem] = []
    if len(clean_query) >= 3:
        matching_hashes = (
            db.query(DocumentModel)
            .filter(
                DocumentModel.case_id.in_(authorized_case_ids),
                or_(
                    DocumentModel.sha256_hash.ilike(term),
                    DocumentModel.blockchain_record_id.ilike(term),
                ),
            )
            .limit(5)
            .all()
        )

        for h in matching_hashes:
            is_evidence = h.category in FORENSIC_CATEGORIES
            hash_results.append(
                SearchHashItem(
                    hash=h.sha256_hash,
                    match_type="EVIDENCE" if is_evidence else "DOCUMENT",
                    item_name=h.name,
                    case_id=h.case_id,
                    case_number=case_map.get(h.case_id).case_number if case_map.get(h.case_id) else h.case_id,
                    verification_status=h.integrity_status or "VERIFIED",
                )
            )

        # Check blockchain anchor ID on cases
        matching_case_anchors = (
            db.query(CaseModel)
            .filter(
                CaseModel.case_id.in_(authorized_case_ids),
                CaseModel.blockchain_anchor_id.ilike(term),
            )
            .limit(3)
            .all()
        )

        for ca in matching_case_anchors:
            hash_results.append(
                SearchHashItem(
                    hash=ca.blockchain_anchor_id,
                    match_type="CASE_ANCHOR",
                    item_name=f"{ca.case_number} Genesis Anchor",
                    case_id=ca.case_id,
                    case_number=ca.case_number,
                    verification_status="CONFIRMED_ON_BLOCKCHAIN",
                )
            )

    total_results = (
        len(case_results) + len(doc_results) + len(evidence_results) + len(hash_results)
    )

    return GlobalSearchResponse(
        query=clean_query,
        total_results=total_results,
        cases=case_results,
        documents=doc_results,
        evidence=evidence_results,
        hashes=hash_results,
    )
