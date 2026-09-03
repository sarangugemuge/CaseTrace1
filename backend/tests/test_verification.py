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
