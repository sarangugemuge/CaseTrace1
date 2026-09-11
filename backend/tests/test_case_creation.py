import pytest

def test_create_case_valid_senior_officer(client):
    headers = {"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"}
    payload = {
        "case_number": "CASE-2026-9901",
        "title": "Operation CyberVanguard Infiltration",
        "description": "Cross-border financial infrastructure reconnaissance and illicit funds routing.",
        "department": "Cyber Warfare & Infrastructure Protection",
        "incident_date": "2026-05-12",
        "priority": "CRITICAL",
        "classification": "TOP_SECRET",
        "lead_investigator": "Dr. Alex Mercer",
        "victims": ["TransNational Power Grid"],
        "suspects": ["ShadowCipher Syndicate"]
    }
    response = client.post("/api/cases", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["case_number"] == "CASE-2026-9901"
    assert data["case_id"] == "CASE-2026-9901"
    assert data["title"] == "Operation CyberVanguard Infiltration"
    assert data["priority"] == "CRITICAL"
    assert data["classification"] == "TOP_SECRET"
    assert data["blockchain_anchor_id"].startswith("0x")
    assert "usr-001" in data["assigned_users"]

def test_create_case_duplicate(client):
    headers = {"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"}
    # CASE-2026-8942 already exists in seed data
    payload = {
        "case_number": "CASE-2026-8942",
        "title": "Duplicate Operation DarkLedge Attempt",
        "description": "Attempting to create duplicate case number.",
        "department": "Financial Crimes Division",
        "incident_date": "2026-01-10",
        "priority": "HIGH",
        "classification": "CONFIDENTIAL",
        "lead_investigator": "Insp. Sarah Jenkins"
    }
    response = client.post("/api/cases", json=payload, headers=headers)
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]

def test_create_case_invalid_input_empty_fields(client):
    headers = {"X-User-Role": "Senior Officer"}
    payload = {
        "case_number": "   ",
        "title": "",
        "description": "Missing title and case number",
        "department": "",
        "incident_date": "2026-01-10",
        "priority": "HIGH",
        "classification": "CONFIDENTIAL",
        "lead_investigator": ""
    }
    response = client.post("/api/cases", json=payload, headers=headers)
    assert response.status_code == 422

def test_create_case_invalid_priority_and_date(client):
    headers = {"X-User-Role": "Senior Officer"}
    payload = {
        "case_number": "CASE-2026-9902",
        "title": "Invalid Priority Case",
        "description": "Testing invalid enum and future date",
        "department": "Digital Forensics Lab",
        "incident_date": "2099-01-01",  # Future date
        "priority": "INVALID_SUPER_HIGH",
        "classification": "TOP_SECRET",
        "lead_investigator": "Dr. Alex Mercer"
    }
    response = client.post("/api/cases", json=payload, headers=headers)
    assert response.status_code == 422

def test_create_case_unauthorized_user(client):
    # Court User does not have case creation authorization
    headers = {"X-User-Role": "Court User", "X-User-Id": "usr-005"}
    payload = {
        "case_number": "CASE-2026-9903",
        "title": "Unauthorized Court User Case",
        "description": "Court user trying to create case.",
        "department": "High Court Registry",
        "incident_date": "2026-03-01",
        "priority": "LOW",
        "classification": "RESTRICTED",
        "lead_investigator": "Clerk Helen Ross"
    }
    response = client.post("/api/cases", json=payload, headers=headers)
    assert response.status_code == 403
    assert "not authorized to record new incidents" in response.json()["detail"]

def test_create_case_valid_investigating_officer(client):
    headers = {"X-User-Role": "Investigating Officer", "X-User-Id": "usr-002"}
    payload = {
        "case_number": "CASE-2026-9904",
        "title": "Ransomware Infiltration Investigation",
        "description": "Critical infrastructure investigation by Cyber Crime Investigating Officer.",
        "department": "Cyber Crime Division",
        "incident_date": "2026-05-14",
        "priority": "HIGH",
        "classification": "CONFIDENTIAL",
        "lead_investigator": "Insp. Sarah Jenkins"
    }
    response = client.post("/api/cases", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["case_number"] == "CASE-2026-9904"
