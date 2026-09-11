import io
import pytest

def test_document_versioning_flow(client):
    headers = {"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"}

    # 1. Initial document upload
    file_bytes = b"Digital Forensic Disc Image - v1.0 initial forensic baseline."
    response = client.post(
        "/api/cases/CASE-2026-8942/documents/upload",
        files={"file": ("forensic_image.raw", io.BytesIO(file_bytes), "application/octet-stream")},
        data={
            "category": "EVIDENCE",
            "sensitivity": "CONFIDENTIAL",
            "purpose": "INVESTIGATION",
            "description": "Primary forensic capture of target workstation",
            "notes": "Chain of custody sealed at seizure site"
        },
        headers=headers
    )
    assert response.status_code == 201
    doc_data = response.json()
    doc_id = doc_data["id"]
    assert doc_data["version"] == 1
    assert len(doc_data["version_history"]) == 1
    assert doc_data["description"] == "Primary forensic capture of target workstation"
    initial_hash = doc_data["sha256_hash"]

    # 2. Upload new version
    updated_bytes = b"Digital Forensic Disc Image - v2.0 with extracted carve signatures."
    v2_response = client.post(
        f"/api/documents/{doc_id}/versions",
        files={"file": ("forensic_image_v2.raw", io.BytesIO(updated_bytes), "application/octet-stream")},
        data={
            "change_reason": "Appended carve signatures and file header recovery blocks.",
            "purpose": "INVESTIGATION"
        },
        headers=headers
    )
    assert v2_response.status_code == 201
    v2_data = v2_response.json()
    assert v2_data["version"] == 2
    assert v2_data["sha256_hash"] != initial_hash
    assert len(v2_data["version_history"]) == 2
    assert v2_data["version_history"][-1]["change_reason"] == "Appended carve signatures and file header recovery blocks."

    # 3. Update metadata
    meta_response = client.put(
        f"/api/documents/{doc_id}/metadata",
        json={
            "sensitivity": "TOP_SECRET",
            "notes": "Updated after forensic laboratory review"
        },
        headers=headers
    )
    assert meta_response.status_code == 200
    meta_data = meta_response.json()
    assert meta_data["sensitivity"] == "TOP_SECRET"
    assert meta_data["notes"] == "Updated after forensic laboratory review"

    # 4. View document inline
    view_response = client.get(f"/api/documents/{doc_id}/view", headers=headers)
    assert view_response.status_code == 200
    assert "inline" in view_response.headers.get("content-disposition", "")
    assert view_response.content == updated_bytes

    # 5. Verify integrity against stored bytes
    verify_response = client.post(f"/api/documents/{doc_id}/verify", headers=headers)
    assert verify_response.status_code == 200
    assert verify_response.json()["match"] is True
    assert verify_response.json()["verification_result"] == "INTEGRITY VERIFIED"

def test_admin_access_control(client):
    # Non-admin user should be blocked with 403
    senior_headers = {"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"}
    resp = client.get("/api/admin/roles", headers=senior_headers)
    assert resp.status_code == 403

    resp2 = client.get("/api/admin/config", headers=senior_headers)
    assert resp2.status_code == 403

    # Admin user should succeed
    admin_headers = {"X-User-Role": "Admin", "X-User-Id": "usr-007"}
    roles_resp = client.get("/api/admin/roles", headers=admin_headers)
    assert roles_resp.status_code == 200
    roles = roles_resp.json()
    assert len(roles) >= 7

    # Create new custom role
    create_role_resp = client.post(
        "/api/admin/roles",
        json={
            "name": "External Auditor Specialist",
            "role_key": "External Auditor",
            "description": "Third-party compliance and audit reviewer",
            "permissions": ["READ_AUDIT", "EXPORT_AUDIT"]
        },
        headers=admin_headers
    )
    assert create_role_resp.status_code == 201
    new_role = create_role_resp.json()
    role_id = new_role["id"]

    # Update role
    update_role_resp = client.put(
        f"/api/admin/roles/{role_id}",
        json={
            "description": "Updated third-party compliance reviewer",
            "permissions": ["READ_AUDIT", "EXPORT_AUDIT", "VERIFY_HASH"]
        },
        headers=admin_headers
    )
    assert update_role_resp.status_code == 200
    assert len(update_role_resp.json()["permissions"]) == 3

    # System config
    config_resp = client.get("/api/admin/config", headers=admin_headers)
    assert config_resp.status_code == 200
    cfg = config_resp.json()
    assert "storage_backend" in cfg
    assert "db_dialect" in cfg

    # Update system config
    update_cfg = client.put(
        "/api/admin/config",
        json={"max_upload_size_mb": 100, "audit_retention_days": 730},
        headers=admin_headers
    )
    assert update_cfg.status_code == 200
    assert update_cfg.json()["max_upload_size_mb"] == 100

    # Delete custom role
    del_resp = client.delete(f"/api/admin/roles/{role_id}", headers=admin_headers)
    assert del_resp.status_code == 200
