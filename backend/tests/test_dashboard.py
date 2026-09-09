def test_get_dashboard_stats_senior_officer(client):
    headers = {"X-User-Role": "Senior Officer"}
    response = client.get("/api/dashboard/stats", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "active_cases" in data
    assert "critical_cases" in data
    assert "total_evidence_items" in data
    assert "pending_verification" in data
    assert "integrity_alerts" in data
    assert "total_authorized_cases" in data
    assert "recent_activity" in data
    assert data["total_authorized_cases"] >= 3
    assert data["user_role"] == "Senior Officer"
    assert isinstance(data["recent_activity"], list)

def test_get_dashboard_stats_court_user(client):
    headers = {"X-User-Role": "Court User", "X-User-Id": "usr-005"}
    response = client.get("/api/dashboard/stats", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["user_role"] == "Court User"
    assert data["total_authorized_cases"] == 2

def test_get_dashboard_stats_activity_structure(client):
    headers = {"X-User-Role": "Senior Officer"}
    response = client.get("/api/dashboard/stats", headers=headers)
    assert response.status_code == 200
    data = response.json()
    if len(data["recent_activity"]) > 0:
        item = data["recent_activity"][0]
        assert "event_id" in item
        assert "action" in item
        assert "result" in item
        assert "risk_level" in item
