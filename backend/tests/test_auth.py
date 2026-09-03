def test_login_success(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "robert.vance@casetrace.gov", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "Senior Officer"

def test_login_demo_persona_fallback(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "Investigating Officer", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "Investigating Officer"

def test_login_failure(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "nonexistent@casetrace.gov", "password": "wrongpassword"}
    )
    assert response.status_code == 401
