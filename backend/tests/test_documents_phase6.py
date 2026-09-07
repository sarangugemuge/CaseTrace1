import pytest
import io
import hashlib
from unittest.mock import patch

def test_document_upload_and_download(client):
    file_bytes = b"Official Forensics Evidence Artifact Content"
    expected_hash = hashlib.sha256(file_bytes).hexdigest()

    with patch("backend.app.services.document_service.storage_service.upload_object") as mock_upload, \
         patch("backend.app.services.document_service.storage_service.download_object") as mock_download, \
         patch("backend.app.services.document_service.storage_service.object_exists") as mock_exists, \
         patch("backend.app.services.document_service.storage_service.delete_object") as mock_delete:
        
        mock_upload.return_value = True
        mock_download.return_value = file_bytes
        mock_exists.return_value = True
        mock_delete.return_value = True

        # 1. Test Upload
        response = client.post(
            "/api/cases/CASE-2026-8942/documents/upload",
            headers={"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"},
            files={"file": ("test_evidence.pdf", io.BytesIO(file_bytes), "application/pdf")},
            data={"category": "EVIDENCE", "sensitivity": "CONFIDENTIAL", "purpose": "INVESTIGATION"}
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "test_evidence.pdf"
        assert data["sha256_hash"] == expected_hash
        assert data["file_size"] == len(file_bytes)
        uploaded_id = data["id"]

        # 2. Test Download
        dl_res = client.get(
            f"/api/documents/{uploaded_id}/download?purpose=INVESTIGATION",
            headers={"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"}
        )
        assert dl_res.status_code == 200
        assert dl_res.content == file_bytes

        # 3. Test Verification
        v_res = client.post(
            f"/api/documents/{uploaded_id}/verify",
            headers={"X-User-Role": "Forensic Officer", "X-User-Id": "usr-003"}
        )
        assert v_res.status_code == 200
        v_data = v_res.json()
        assert v_data["status"] == "VERIFIED"
        assert v_data["match"] is True

        # 4. Test Deletion
        del_res = client.delete(
            f"/api/documents/{uploaded_id}",
            headers={"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"}
        )
        assert del_res.status_code == 200
        assert del_res.json()["status"] == "success"

def test_unauthorized_download_blocked(client):
    dl_res = client.get(
        "/api/documents/doc-102/download?purpose=UNAUTHORIZED",
        headers={"X-User-Role": "Court User", "X-User-Id": "usr-005"}
    )
    assert dl_res.status_code == 403

def test_health_check_storage(client):
    with patch("backend.app.services.storage_service.storage_service.verify_storage_connection") as mock_health:
        mock_health.return_value = {"status": "connected", "bucket": "casetrace-documents"}
        res = client.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert "storage" in data
        assert "database" in data
