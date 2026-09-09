from typing import Optional, Dict, List, Any

# Define the 7 CASETRACE roles
SENIOR_OFFICER = "Senior Officer"
INVESTIGATING_OFFICER = "Investigating Officer"
FORENSIC_OFFICER = "Forensic Officer"
PROSECUTOR = "Prosecutor"
COURT_USER = "Court User"
AUDITOR_SECURITY = "Auditor / Security"
ADMIN = "Admin"

ALLOWED_SENSITIVITIES: Dict[str, List[str]] = {
    SENIOR_OFFICER: ["PUBLIC", "INTERNAL", "CONFIDENTIAL", "TOP_SECRET", "FORENSIC"],
    INVESTIGATING_OFFICER: ["PUBLIC", "INTERNAL", "CONFIDENTIAL"],
    FORENSIC_OFFICER: ["PUBLIC", "INTERNAL", "FORENSIC"],
    PROSECUTOR: ["PUBLIC", "INTERNAL", "CONFIDENTIAL"],
    COURT_USER: ["PUBLIC"],
    AUDITOR_SECURITY: ["PUBLIC", "INTERNAL", "CONFIDENTIAL", "TOP_SECRET", "FORENSIC"],
    ADMIN: ["PUBLIC", "INTERNAL", "CONFIDENTIAL", "TOP_SECRET", "FORENSIC"],
}

def evaluate_access(
    user_role: str,
    user_assigned_cases: List[str],
    user_id: str,
    case_id: str,
    case_assigned_users: List[str],
    document_sensitivity: Optional[str] = None,
    action: str = "VIEW",
    purpose: Optional[str] = None,
) -> Dict[str, Any]:
    # 1. Admin Override
    if user_role == ADMIN:
        return {
            "allowed": True,
            "reason": "Admin role authorized with full system governance.",
            "risk_level": "LOW",
            "requires_purpose": False,
            "policy_id": "POL-ADMIN-FULL-01",
        }

    # 2. Case Assignment Check
    is_assigned = (case_id in user_assigned_cases) or (user_id in case_assigned_users)
    is_cross_dept = user_role in [SENIOR_OFFICER, AUDITOR_SECURITY]

    if not is_assigned and not is_cross_dept:
        return {
            "allowed": False,
            "reason": f"User is not assigned to case {case_id}. Access denied.",
            "risk_level": "HIGH",
            "requires_purpose": False,
            "policy_id": "POL-CASE-ASSIGNMENT-01",
        }

    # 3. Action-Specific Role Validation (e.g. UPLOAD)
    if action == "UPLOAD":
        if user_role not in [SENIOR_OFFICER, INVESTIGATING_OFFICER, FORENSIC_OFFICER, ADMIN]:
            return {
                "allowed": False,
                "reason": f"Role '{user_role}' is not authorized to upload documents or register evidence.",
                "risk_level": "HIGH",
                "requires_purpose": False,
                "policy_id": "POL-UPLOAD-RESTRICTED-01",
            }

    if not document_sensitivity:
        return {
            "allowed": True,
            "reason": "Authorized case assignment view granted.",
            "risk_level": "LOW",
            "requires_purpose": False,
            "policy_id": "POL-CASE-VIEW-01",
        }

    # 4. Sensitivity Level Check
    allowed_levels = ALLOWED_SENSITIVITIES.get(user_role, [])
    if document_sensitivity not in allowed_levels:
        return {
            "allowed": False,
            "reason": f"Role '{user_role}' is not authorized to access '{document_sensitivity}' level documents.",
            "risk_level": "CRITICAL",
            "requires_purpose": False,
            "policy_id": "POL-SENSITIVITY-RESTRICTED-01",
        }

    # 4. Purpose Requirement Check
    requires_purpose = (
        user_role in [COURT_USER, FORENSIC_OFFICER, AUDITOR_SECURITY, PROSECUTOR]
        or (user_role == INVESTIGATING_OFFICER and document_sensitivity == "CONFIDENTIAL")
        or action in ["DOWNLOAD", "SHARE"]
    )

    if requires_purpose and not purpose:
        return {
            "allowed": False,
            "reason": f"Access requires a valid declared purpose.",
            "risk_level": "MEDIUM",
            "requires_purpose": True,
            "policy_id": "POL-PURPOSE-REQUIRED-01",
        }

    risk_level = "LOW"
    if action in ["DOWNLOAD", "SHARE"]:
        risk_level = "HIGH" if document_sensitivity in ["TOP_SECRET", "FORENSIC"] else "MEDIUM"

    return {
        "allowed": True,
        "reason": f"Access granted for {action} under role '{user_role}' with purpose: {purpose or 'Standard Authorization'}.",
        "risk_level": risk_level,
        "requires_purpose": requires_purpose,
        "policy_id": "POL-ACCESS-GRANTED-01",
    }
