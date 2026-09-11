import pytest
import time
from datetime import datetime, timezone, timedelta
from backend.app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_token,
)
from backend.app.core.config import settings
from backend.app.db.models.user import UserModel
from backend.app.db.models.session import SessionModel

def test_successful_password_authentication(client):
    res = client.post(
        "/api/auth/login",
        json={"email": "robert.vance@casetrace.gov", "password": "password123"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["name"] == "Cmdr. Robert Vance"

def test_invalid_password(client):
    res = client.post(
        "/api/auth/login",
        json={"email": "robert.vance@casetrace.gov", "password": "wrong_password"}
    )
    assert res.status_code == 401
    assert "invalid" in res.json()["detail"].lower()

def test_session_refresh_with_rotation(client):
    login_res = client.post(
        "/api/auth/login",
        json={"email": "alex.mercer@casetrace.gov", "password": "password123"}
    )
    initial_refresh = login_res.json()["refresh_token"]

    # 1. Refresh session
    ref_res = client.post(
        "/api/auth/refresh",
        json={"refresh_token": initial_refresh}
    )
    assert ref_res.status_code == 200
    ref_data = ref_res.json()
    new_access = ref_data["access_token"]
    new_refresh = ref_data["refresh_token"]

    # Refresh token rotated
    assert new_refresh != initial_refresh

    # 2. Old refresh token is now invalid (Rotation security)
    old_ref_res = client.post(
        "/api/auth/refresh",
        json={"refresh_token": initial_refresh}
    )
    assert old_ref_res.status_code == 401

    # 3. New refresh token works
    second_ref_res = client.post(
        "/api/auth/refresh",
        json={"refresh_token": new_refresh}
    )
    assert second_ref_res.status_code == 200

def test_expired_access_token_rejected(client):
    # Create an expired access token (expired 5 minutes ago)
    expired_token = create_access_token(
        subject="usr-001",
        expires_delta=timedelta(minutes=-5)
    )
    res = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"}
    )
    assert res.status_code == 401
    assert "expired" in res.json()["detail"].lower()

def test_logout_and_revoked_session(client):
    login_res = client.post(
        "/api/auth/login",
        json={"email": "marcus.thorne@casetrace.gov", "password": "password123"}
    )
    access_token = login_res.json()["access_token"]
    refresh_token = login_res.json()["refresh_token"]

    # Logout
    logout_res = client.post(
        "/api/auth/logout",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert logout_res.status_code == 200

    # Token tied to revoked session is rejected
    after_logout = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert after_logout.status_code == 401
    assert "revoked" in after_logout.json()["detail"].lower()

    # Refresh token also rejected
    ref_res = client.post(
        "/api/auth/refresh",
        json={"refresh_token": refresh_token}
    )
    assert ref_res.status_code == 401

def test_inactivity_timeout_enforced(client):
    login_res = client.post(
        "/api/auth/login",
        json={"email": "elena.rostova@casetrace.gov", "password": "password123"}
    )
    access_token = login_res.json()["access_token"]
    refresh_token = login_res.json()["refresh_token"]

    # Manually simulate 20 minutes of inactivity in the database session
    token_hash = hash_token(refresh_token)
    from backend.tests.conftest import TestingSessionLocal
    db = TestingSessionLocal()
    session = db.query(SessionModel).filter(SessionModel.refresh_token_hash == token_hash).first()
    assert session is not None
    session.last_active_at = datetime.now(timezone.utc) - timedelta(minutes=20)
    db.commit()
    db.close()

    # Request with access token tied to inactive session should fail
    inactive_res = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert inactive_res.status_code == 401
    assert "inactivity" in inactive_res.json()["detail"].lower()

def test_reauthenticate_endpoint(client):
    login_res = client.post(
        "/api/auth/login",
        json={"email": "elena.rostova@casetrace.gov", "password": "password123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Wrong password reauth fails
    bad_reauth = client.post(
        "/api/auth/reauthenticate",
        json={"password": "wrongpassword"},
        headers=headers
    )
    assert bad_reauth.status_code == 401

    # Correct password reauth succeeds
    good_reauth = client.post(
        "/api/auth/reauthenticate",
        json={"password": "password123"},
        headers=headers
    )
    assert good_reauth.status_code == 200
    assert good_reauth.json()["success"] is True

def test_session_status_endpoint(client):
    login_res = client.post(
        "/api/auth/login",
        json={"email": "david.chen@casetrace.gov", "password": "password123"}
    )
    token = login_res.json()["access_token"]

    status_res = client.get(
        "/api/auth/session/status",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert status_res.status_code == 200
    s_data = status_res.json()
    assert s_data["active"] is True
    assert s_data["role"] == "Auditor / Security"
    assert s_data["inactivity_timeout_seconds"] == 15 * 60
    assert s_data["max_session_lifetime_seconds"] == 8 * 3600

def test_sensitive_operation_reauthentication_flow(client):
    # 1. Login user
    login_res = client.post(
        "/api/auth/login",
        json={"email": "elena.rostova@casetrace.gov", "password": "password123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Reauthenticate with password
    reauth_res = client.post(
        "/api/auth/reauthenticate",
        json={"password": "password123"},
        headers=headers
    )
    assert reauth_res.status_code == 200
    assert reauth_res.json()["success"] is True
    assert "authenticated_at" in reauth_res.json()
