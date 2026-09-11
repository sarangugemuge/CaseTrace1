import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from jose import jwt
from sqlalchemy.orm import Session
from backend.app.db.database import get_db
from backend.app.db.models.user import UserModel
from backend.app.db.models.session import SessionModel
from backend.app.schemas.user import UserResponse, Token, LoginRequest
from backend.app.schemas.auth import (
    LoginResponse,
    TotpVerifyRequest,
    TotpSetupResponse,
    TotpEnableRequest,
    TotpEnableResponse,
    TotpDisableRequest,
    RefreshTokenRequest,
    RefreshTokenResponse,
    ReauthRequest,
    ReauthResponse,
    SessionStatusResponse,
)
from backend.app.core.config import settings
from backend.app.core.security import (
    verify_password,
    create_access_token,
    create_temp_2fa_token,
    verify_temp_2fa_token,
    create_refresh_token,
    hash_token,
    generate_totp_secret,
    get_totp_uri,
    verify_totp,
    generate_qr_code_base64,
    generate_recovery_codes,
    verify_and_consume_recovery_code,
)
from backend.app.dependencies.auth import get_current_user, require_recent_auth

router = APIRouter()

@router.post("/auth/login", response_model=Token)
def login(login_req: LoginRequest, request: Request, db: Session = Depends(get_db)):
    # 1. Look up user by email, ID, or demo persona name
    user = db.query(UserModel).filter(UserModel.email == login_req.email).first()
    if not user:
        user = db.query(UserModel).filter(
            (UserModel.id == login_req.email) | (UserModel.role == login_req.email)
        ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid institutional credentials.",
        )

    # 2. Verify password (support mock/password123 for dev fixtures)
    is_valid_pw = verify_password(login_req.password, user.hashed_password)
    if not is_valid_pw and (user.hashed_password == "mock" and login_req.password == "password123"):
        is_valid_pw = True

    if not is_valid_pw:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid institutional credentials.",
        )

    if user.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended or deactivated. Contact your System Administrator.",
        )

    # 3. Two-Factor Authentication Check
    if user.is_totp_enabled:
        temp_token = create_temp_2fa_token(subject=user.id)
        return Token(
            requires_2fa=True,
            temp_token=temp_token,
            message="Two-factor authentication required. Enter your 6-digit TOTP code or recovery code.",
        )

    # 4. Create Authenticated Session with Short-Lived Access Token & Refresh Token
    now = datetime.now(timezone.utc)
    session_id = f"sess_{secrets.token_hex(16)}"
    raw_refresh, refresh_hash = create_refresh_token()
    session_expires = now + timedelta(hours=settings.REFRESH_TOKEN_EXPIRE_HOURS)

    # Client IP & User-Agent for session audit
    ip_addr = request.client.host if request.client else None
    user_agent = request.headers.get("User-Agent")

    new_session = SessionModel(
        id=session_id,
        user_id=user.id,
        refresh_token_hash=refresh_hash,
        created_at=now,
        expires_at=session_expires,
        last_active_at=now,
        is_revoked=False,
        ip_address=ip_addr,
        user_agent=user_agent,
    )
    db.add(new_session)

    user.last_authenticated_at = now
    db.commit()

    token = create_access_token(
        subject=user.id,
        session_id=session_id,
        role=user.role,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return Token(
        access_token=token,
        refresh_token=raw_refresh,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user),
        requires_2fa=False,
    )

@router.post("/auth/2fa/verify", response_model=Token)
def verify_2fa(req: TotpVerifyRequest, request: Request, db: Session = Depends(get_db)):
    user_id = verify_temp_2fa_token(req.temp_token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Two-factor authentication verification request expired or invalid.",
        )

    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")

    code_clean = req.code.strip().replace(" ", "")

    # Check recovery code if requested or format matches
    if req.is_recovery_code or code_clean.upper().startswith("CT-"):
        is_valid_rec, updated_codes = verify_and_consume_recovery_code(code_clean, user.recovery_codes)
        if not is_valid_rec:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or already used backup recovery code.",
            )
        user.recovery_codes = updated_codes
    else:
        # Check standard TOTP
        if not verify_totp(user.totp_secret, code_clean):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid verification code. Please check your authenticator application.",
            )

    now = datetime.now(timezone.utc)
    session_id = f"sess_{secrets.token_hex(16)}"
    raw_refresh, refresh_hash = create_refresh_token()
    session_expires = now + timedelta(hours=settings.REFRESH_TOKEN_EXPIRE_HOURS)

    ip_addr = request.client.host if request.client else None
    user_agent = request.headers.get("User-Agent")

    new_session = SessionModel(
        id=session_id,
        user_id=user.id,
        refresh_token_hash=refresh_hash,
        created_at=now,
        expires_at=session_expires,
        last_active_at=now,
        is_revoked=False,
        ip_address=ip_addr,
        user_agent=user_agent,
    )
    db.add(new_session)

    user.last_authenticated_at = now
    db.commit()

    token = create_access_token(
        subject=user.id,
        session_id=session_id,
        role=user.role,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return Token(
        access_token=token,
        refresh_token=raw_refresh,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user),
        requires_2fa=False,
    )

@router.post("/auth/2fa/setup", response_model=TotpSetupResponse)
def setup_2fa(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    secret = generate_totp_secret()
    current_user.totp_pending_secret = secret
    db.commit()

    uri = get_totp_uri(secret, current_user.email, settings.TOTP_ISSUER_NAME)
    qr_b64 = generate_qr_code_base64(uri)

    return TotpSetupResponse(
        secret=secret,
        qr_code=qr_b64,
        manual_entry_key=secret,
        issuer=settings.TOTP_ISSUER_NAME,
    )

@router.post("/auth/2fa/enable", response_model=TotpEnableResponse)
def enable_2fa(
    req: TotpEnableRequest,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.totp_pending_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No pending 2FA setup found. Please initiate 2FA setup first.",
        )

    if not verify_totp(current_user.totp_pending_secret, req.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 6-digit verification code. Please confirm time synchronization on your authenticator device.",
        )

    # Activate 2FA
    current_user.totp_secret = current_user.totp_pending_secret
    current_user.totp_pending_secret = None
    current_user.is_totp_enabled = True

    # Generate single-use recovery codes
    plain_codes, stored_codes = generate_recovery_codes(count=8)
    current_user.recovery_codes = stored_codes
    db.commit()

    return TotpEnableResponse(
        success=True,
        message="Two-Factor Authentication successfully activated for your institutional account.",
        recovery_codes=plain_codes,
    )

@router.post("/auth/2fa/disable")
def disable_2fa(
    req: TotpDisableRequest,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    verified = False
    if req.password:
        verified = verify_password(req.password, current_user.hashed_password)
    elif req.code and current_user.totp_secret:
        verified = verify_totp(current_user.totp_secret, req.code)

    if not verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password or verification code to disable 2FA.",
        )

    current_user.is_totp_enabled = False
    current_user.totp_secret = None
    current_user.totp_pending_secret = None
    current_user.recovery_codes = []
    db.commit()

    return {"success": True, "message": "Two-factor authentication has been disabled."}

@router.post("/auth/2fa/recovery-codes/regenerate")
def regenerate_recovery_codes(
    current_user: UserModel = Depends(require_recent_auth(max_age_minutes=15)),
    db: Session = Depends(get_db),
):
    if not current_user.is_totp_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Two-factor authentication is not active on this account.",
        )

    plain_codes, stored_codes = generate_recovery_codes(count=8)
    current_user.recovery_codes = stored_codes
    db.commit()

    return {"success": True, "recovery_codes": plain_codes}

@router.post("/auth/refresh", response_model=RefreshTokenResponse)
def refresh_session(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    if not req.refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token required.")

    token_hash = hash_token(req.refresh_token)
    session_rec = db.query(SessionModel).filter(SessionModel.refresh_token_hash == token_hash).first()

    if not session_rec or session_rec.is_revoked:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is invalid or has been revoked.",
        )

    now = datetime.now(timezone.utc)
    expires_at = session_rec.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if now > expires_at:
        session_rec.is_revoked = True
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session lifetime has expired.")

    last_active = session_rec.last_active_at
    if last_active.tzinfo is None:
        last_active = last_active.replace(tzinfo=timezone.utc)
    if now - last_active > timedelta(minutes=settings.INACTIVITY_TIMEOUT_MINUTES):
        session_rec.is_revoked = True
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired due to inactivity.")

    user = db.query(UserModel).filter(UserModel.id == session_rec.user_id).first()
    if not user or user.status != "ACTIVE":
        session_rec.is_revoked = True
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account is inactive.")

    # Refresh Token Rotation: Rotate refresh token on every refresh
    new_raw_refresh, new_refresh_hash = create_refresh_token()
    session_rec.refresh_token_hash = new_refresh_hash
    session_rec.last_active_at = now
    db.commit()

    new_access_token = create_access_token(
        subject=user.id,
        session_id=session_rec.id,
        role=user.role,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return RefreshTokenResponse(
        access_token=new_access_token,
        refresh_token=new_raw_refresh,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

@router.post("/auth/logout")
def logout(
    request: Request,
    current_user: Optional[UserModel] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # If authorization header with Bearer token is present, revoke that session
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token_str = auth_header[7:]
        try:
            payload = jwt.decode(token_str, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
            session_id = payload.get("session_id")
            if session_id:
                session_rec = db.query(SessionModel).filter(SessionModel.id == session_id).first()
                if session_rec:
                    session_rec.is_revoked = True
                    db.commit()
        except Exception:
            pass

    return {"success": True, "message": "Session terminated successfully."}

@router.post("/auth/reauthenticate", response_model=ReauthResponse)
def reauthenticate(
    req: ReauthRequest,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    verified = False
    if req.password:
        verified = verify_password(req.password, current_user.hashed_password)
        if not verified and (current_user.hashed_password == "mock" and req.password == "password123"):
            verified = True
    elif req.code and current_user.totp_secret:
        verified = verify_totp(current_user.totp_secret, req.code)

    if not verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Reauthentication failed. Verification credentials incorrect.",
        )

    now = datetime.now(timezone.utc)
    current_user.last_authenticated_at = now
    db.commit()

    return ReauthResponse(
        success=True,
        message="Reauthentication confirmed.",
        authenticated_at=now.isoformat(),
    )

@router.get("/auth/session/status", response_model=SessionStatusResponse)
def get_session_status(current_user: UserModel = Depends(get_current_user)):
    auth_str = current_user.last_authenticated_at.isoformat() if current_user.last_authenticated_at else None
    return SessionStatusResponse(
        active=True,
        user_id=current_user.id,
        role=current_user.role,
        is_totp_enabled=bool(current_user.is_totp_enabled),
        last_authenticated_at=auth_str,
        inactivity_timeout_seconds=settings.INACTIVITY_TIMEOUT_MINUTES * 60,
        max_session_lifetime_seconds=settings.REFRESH_TOKEN_EXPIRE_HOURS * 3600,
    )

@router.get("/auth/me", response_model=UserResponse)
def get_me(current_user: UserModel = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
