def test_search_empty_query(client):
    headers = {"X-User-Role": "Senior Officer"}
    response = client.get("/api/search?q=", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_results"] == 0
    assert len(data["cases"]) == 0
    assert len(data["documents"]) == 0
    assert len(data["evidence"]) == 0
    assert len(data["hashes"]) == 0

def test_search_cases_by_number_and_title(client):
    headers = {"X-User-Role": "Senior Officer"}
    # Case insensitive partial match for DarkLedge
    response = client.get("/api/search?q=darkledge", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_results"] > 0
    matching_case = next((c for c in data["cases"] if c["case_number"] == "CASE-2026-8942"), None)
    assert matching_case is not None
    assert "DarkLedge" in matching_case["title"]

def test_search_documents_by_name(client):
    headers = {"X-User-Role": "Senior Officer"}
    response = client.get("/api/search?q=FIR", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["documents"]) > 0
    doc = data["documents"][0]
    assert "FIR" in doc["name"]
    assert doc["case_number"] == "CASE-2026-8942"

def test_search_evidence_by_id_and_name(client):
    headers = {"X-User-Role": "Senior Officer"}
    # doc-103 is System_Forensic_Memory_Dump.img
    response = client.get("/api/search?q=doc-103", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["evidence"]) > 0
    ev = data["evidence"][0]
    assert ev["evidence_id"] == "doc-103"
    assert "Memory_Dump" in ev["name"]
    assert ev["verification_status"] == "VERIFIED"

def test_search_hash_partial(client):
    headers = {"X-User-Role": "Senior Officer"}
    # Partial hash of doc-103: bf5b79647228807d8955219488a08c02c636f1c407559ed5a4bb8e84a20b0805
    response = client.get("/api/search?q=bf5b7964", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["hashes"]) > 0
    hash_match = data["hashes"][0]
    assert "bf5b7964" in hash_match["hash"].lower()
    assert hash_match["case_number"] == "CASE-2026-8942"

def test_search_authorization_scoping(client):
    # Court User is only authorized for CASE-2026-8942 and CASE-2026-4410, NOT CASE-2026-1105
    headers = {"X-User-Role": "Court User", "X-User-Id": "usr-005"}
    response = client.get("/api/search?q=SCADA", headers=headers)
    assert response.status_code == 200
    data = response.json()
    # SCADA is only in CASE-2026-1105, which Court User cannot access
    assert len(data["cases"]) == 0
    assert len(data["documents"]) == 0
    assert len(data["evidence"]) == 0

def test_search_injection_safety(client):
    headers = {"X-User-Role": "Senior Officer"}
    response = client.get("/api/search?q='%20OR%20'1'='1'--", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data["total_results"], int)
