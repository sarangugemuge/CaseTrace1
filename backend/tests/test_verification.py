import hashlib

def test_verification_hash_match(client):
    content = "TEST_EVIDENCE_PAYLOAD"
    computed = hashlib.sha256(content.encode("utf-8")).hexdigest()
    req_data = {
        "content": content,
        "expected_hash": computed
    }
    response = client.post("/api/verification/hash", json=req_data)
    assert response.status_code == 200
    res = response.json()
    assert res["is_match"] is True
    assert res["status"] == "VERIFIED (BIT-EXACT MATCH)"
    assert res["verification_result"] == "INTEGRITY VERIFIED"
    assert res["original_hash"] == computed
    assert res["current_hash"] == computed

def test_verification_hash_mismatch(client):
    req_data = {
        "content": "TAMPERED_CONTENT",
        "expected_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    }
    response = client.post("/api/verification/hash", json=req_data)
    assert response.status_code == 200
    res = response.json()
    assert res["is_match"] is False
    assert res["status"] == "INTEGRITY MISMATCH (TAMPERED)"
    assert res["verification_result"] == "INTEGRITY MISMATCH"

def test_valid_document_verification(client):
    """Test 1: Valid document verification via document integrity endpoint."""
    response = client.post(
        "/api/documents/doc-101/verify",
        headers={"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"}
    )
    assert response.status_code == 200
    res = response.json()
    assert res["document_id"] == "doc-101"
    assert res["match"] is True
    assert res["verification_result"] == "INTEGRITY VERIFIED"
    assert res["stored_hash"] == res["original_hash"]

def test_unchanged_document_verification(client):
    """Test 2: Unchanged document verification produces identical hashes."""
    doc_payload = "AUTHENTIC_OFFICIAL_RECORD_AFFIDAVIT_v1"
    expected_hash = hashlib.sha256(doc_payload.encode("utf-8")).hexdigest()

    req_data = {
        "content": doc_payload,
        "expected_hash": expected_hash
    }
    response = client.post("/api/verification/hash", json=req_data)
    assert response.status_code == 200
    res = response.json()
    assert res["is_match"] is True
    assert res["verification_result"] == "INTEGRITY VERIFIED"
    assert res["original_hash"] == res["current_hash"]

def test_modified_document_tamper_detection(client):
    """Test 3: Single-byte modification causes hash mismatch and alert."""
    original_payload = "EVIDENCE_LOG_TRANSFER_AMOUNT_$50,000"
    original_hash = hashlib.sha256(original_payload.encode("utf-8")).hexdigest()

    # Tampered by 1 single character
    tampered_payload = "EVIDENCE_LOG_TRANSFER_AMOUNT_$90,000"
    tampered_hash = hashlib.sha256(tampered_payload.encode("utf-8")).hexdigest()
    assert original_hash != tampered_hash

    req_data = {
        "content": tampered_payload,
        "expected_hash": original_hash
    }
    response = client.post("/api/verification/hash", json=req_data)
    assert response.status_code == 200
    res = response.json()
    assert res["is_match"] is False
    assert res["verification_result"] == "INTEGRITY MISMATCH"
    assert res["current_hash"] == tampered_hash
    assert res["original_hash"] == original_hash

def test_invalid_evidence_input(client):
    """Test 4: Invalid evidence parameters return HTTP 400 / 422."""
    # Missing expected hash
    response = client.post("/api/verification/hash", json={"content": "SOME_CONTENT"})
    assert response.status_code in [400, 422]

    # Empty expected hash
    response = client.post("/api/verification/hash", json={"content": "SOME_CONTENT", "expected_hash": ""})
    assert response.status_code == 400
    assert "Expected hash parameter is required" in response.json()["detail"]

def test_unauthorized_verification_blocked(client):
    """Test 5: Court User unauthorized to access FORENSIC doc-103 is blocked with 403."""
    response = client.post(
        "/api/documents/doc-103/verify",
        headers={"X-User-Role": "Court User", "X-User-Id": "usr-005"}
    )
    assert response.status_code == 403
    assert "Clearance Denied" in response.json()["detail"]

def test_missing_file_verification(client):
    """Test 6: Non-existent document ID returns HTTP 404."""
    response = client.post(
        "/api/documents/doc-non-existent-9999/verify",
        headers={"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"}
    )
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
