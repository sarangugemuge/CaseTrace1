import pytest
import pyotp
import time
from datetime import datetime, timezone, timedelta
from backend.app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_token,
    verify_totp,
    generate_recovery_codes,
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
    assert data["requires_2fa"] is False
    assert data["user"]["name"] == "Cmdr. Robert Vance"

def test_invalid_password(client):
    res = client.post(
        "/api/auth/login",
        json={"email": "robert.vance@casetrace.gov", "password": "wrong_password"}
    )
    assert res.status_code == 401
    assert "invalid" in res.json()["detail"].lower()

def test_totp_2fa_enrollment_and_verification_flow(client):
    # 1. Login user
    login_res = client.post(
        "/api/auth/login",
        json={"email": "sarah.jenkins@casetrace.gov", "password": "password123"}
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Setup 2FA
    setup_res = client.post("/api/auth/2fa/setup", headers=headers)
    assert setup_res.status_code == 200
    setup_data = setup_res.json()
    assert "secret" in setup_data
    assert setup_data["qr_code"].startswith("data:image/png;base64,")
    secret = setup_data["secret"]

    # 3. Enable 2FA with invalid code (should fail)
    bad_enable = client.post("/api/auth/2fa/enable", json={"code": "000000"}, headers=headers)
    assert bad_enable.status_code == 400

    # 4. Enable 2FA with valid TOTP code
    totp = pyotp.TOTP(secret)
    valid_code = totp.now()
    good_enable = client.post("/api/auth/2fa/enable", json={"code": valid_code}, headers=headers)
    assert good_enable.status_code == 200
    enable_data = good_enable.json()
    assert enable_data["success"] is True
    assert len(enable_data["recovery_codes"]) == 8
    first_recovery_code = enable_data["recovery_codes"][0]

    # 5. Next Login requires 2FA
    login_2fa_res = client.post(
        "/api/auth/login",
        json={"email": "sarah.jenkins@casetrace.gov", "password": "password123"}
    )
    assert login_2fa_res.status_code == 200
    login_2fa_data = login_2fa_res.json()
    assert login_2fa_data["requires_2fa"] is True
    assert "temp_token" in login_2fa_data
    temp_token = login_2fa_data["temp_token"]

    # 6. Verify 2FA with Invalid TOTP (should fail 401)
    bad_verify = client.post(
        "/api/auth/2fa/verify",
        json={"temp_token": temp_token, "code": "999999"}
    )
    assert bad_verify.status_code == 401
    assert "invalid verification code" in bad_verify.json()["detail"].lower()

    # 7. Verify 2FA with Valid TOTP (should succeed 200)
    current_totp_code = totp.now()
    good_verify = client.post(
        "/api/auth/2fa/verify",
        json={"temp_token": temp_token, "code": current_totp_code}
    )
    assert good_verify.status_code == 200
    auth_data = good_verify.json()
    assert "access_token" in auth_data
    assert "refresh_token" in auth_data
    assert auth_data["user"]["is_totp_enabled"] is True

    # 8. Test Single-Use Recovery Code Login
    login_rec_res = client.post(
        "/api/auth/login",
        json={"email": "sarah.jenkins@casetrace.gov", "password": "password123"}
    )
    temp_token_rec = login_rec_res.json()["temp_token"]

    rec_verify = client.post(
        "/api/auth/2fa/verify",
        json={"temp_token": temp_token_rec, "code": first_recovery_code, "is_recovery_code": True}
    )
    assert rec_verify.status_code == 200
    assert "access_token" in rec_verify.json()

    # 9. Test Reused Recovery Code is REJECTED (401)
    login_rec_res2 = client.post(
        "/api/auth/login",
        json={"email": "sarah.jenkins@casetrace.gov", "password": "password123"}
    )
    temp_token_rec2 = login_rec_res2.json()["temp_token"]
    reused_rec = client.post(
        "/api/auth/2fa/verify",
        json={"temp_token": temp_token_rec2, "code": first_recovery_code, "is_recovery_code": True}
    )
    assert reused_rec.status_code == 401
    assert "already used" in reused_rec.json()["detail"].lower()

    # 10. Clean up: Disable 2FA for Sarah Jenkins so other tests aren't affected
    disable_res = client.post(
        "/api/auth/2fa/disable",
        json={"password": "password123"},
        headers={"Authorization": f"Bearer {rec_verify.json()['access_token']}"}
    )
    assert disable_res.status_code == 200

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

def test_sensitive_operation_reauthentication_required(client):
    # 1. Login user
    login_res = client.post(
        "/api/auth/login",
        json={"email": "elena.rostova@casetrace.gov", "password": "password123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Simulate authentication occurred 25 minutes ago (exceeding 15m limit)
    from backend.tests.conftest import TestingSessionLocal
    db = TestingSessionLocal()
    user = db.query(UserModel).filter(UserModel.email == "elena.rostova@casetrace.gov").first()
    user.last_authenticated_at = datetime.now(timezone.utc) - timedelta(minutes=25)
    db.commit()
    db.close()

    # 3. Attempt sensitive operation (e.g. regenerate recovery codes) -> Must be blocked 403
    stale_attempt = client.post(
        "/api/auth/2fa/recovery-codes/regenerate",
        headers=headers
    )
    assert stale_attempt.status_code == 403
    assert "reauthentication required" in stale_attempt.json()["detail"].lower()

    # 4. Perform reauthentication
    reauth_res = client.post(
        "/api/auth/reauthenticate",
        json={"password": "password123"},
        headers=headers
    )
    assert reauth_res.status_code == 200

    # 5. Enable 2FA first so recovery codes can be regenerated
    setup_res = client.post("/api/auth/2fa/setup", headers=headers)
    secret = setup_res.json()["secret"]
    totp = pyotp.TOTP(secret)
    enable_res = client.post("/api/auth/2fa/enable", json={"code": totp.now()}, headers=headers)
    assert enable_res.status_code == 200
    old_codes = enable_res.json()["recovery_codes"]

    # 6. Now sensitive operation succeeds
    regen_res = client.post(
        "/api/auth/2fa/recovery-codes/regenerate",
        headers=headers
    )
    assert regen_res.status_code == 200
    new_codes = regen_res.json()["recovery_codes"]
    assert len(new_codes) == 8
    assert new_codes != old_codes

    # 7. Cleanup disable 2FA
    client.post("/api/auth/2fa/disable", json={"password": "password123"}, headers=headers)

