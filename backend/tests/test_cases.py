def test_get_cases_senior_officer(client):
    headers = {"X-User-Role": "Senior Officer"}
    response = client.get("/api/cases", headers=headers)
    assert response.status_code == 200
    cases = response.json()
    assert len(cases) >= 3

def test_get_case_by_id_authorized(client):
    headers = {"X-User-Role": "Senior Officer"}
    response = client.get("/api/cases/CASE-2026-8942", headers=headers)
    assert response.status_code == 200
    c = response.json()
    assert c["case_id"] == "CASE-2026-8942"
    assert c["title"] == "Operation DarkLedge Financial Fraud"

def test_get_case_by_id_unassigned_restricted(client):
    headers = {"X-User-Role": "Court User", "X-User-Id": "usr-005"}
    response = client.get("/api/cases/CASE-2026-1105", headers=headers)
    assert response.status_code == 403
