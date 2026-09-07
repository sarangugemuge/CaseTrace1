from unittest.mock import patch

def test_health_check(client):
    with patch("backend.app.services.storage_service.storage_service.verify_storage_connection") as mock_st:
        mock_st.return_value = {"status": "connected", "bucket": "casetrace-documents"}
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "casetrace-api"
        assert "storage" in data
        assert "database" in data
