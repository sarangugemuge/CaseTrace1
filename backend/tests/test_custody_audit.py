def test_get_case_audit_logs_authorized(client):
    """Test authorized officer retrieves case custody logs in chronological order."""
    response = client.get(
        "/api/cases/CASE-2026-8942/audit",
        headers={"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"}
    )
    assert response.status_code == 200
    logs = response.json()
    assert isinstance(logs, list)
    assert len(logs) > 0

    # Verify chronological ascending order
    for i in range(len(logs) - 1):
        assert logs[i]["timestamp"] <= logs[i + 1]["timestamp"]

def test_case_audit_event_structure(client):
    """Test audit events contain all required evidentiary fields."""
    response = client.get(
        "/api/cases/CASE-2026-8942/audit",
        headers={"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"}
    )
    assert response.status_code == 200
    logs = response.json()
    assert len(logs) > 0

    first_evt = logs[0]
    required_fields = ["event_id", "action", "user_name", "role", "timestamp", "result"]
    for field in required_fields:
        assert field in first_evt, f"Field '{field}' missing from audit event"
        assert first_evt[field] is not None

def test_get_case_audit_logs_unauthorized(client):
    """Test unassigned user (e.g. Court User) is blocked with 403 on restricted case."""
    response = client.get(
        "/api/cases/CASE-2026-1105/audit",
        headers={"X-User-Role": "Court User", "X-User-Id": "usr-005"}
    )
    assert response.status_code == 403
    assert "Clearance Denied" in response.json()["detail"]

def test_get_case_audit_logs_not_found(client):
    """Test non-existent case returns HTTP 404."""
    response = client.get(
        "/api/cases/CASE-NON-EXISTENT-9999/audit",
        headers={"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"}
    )
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
