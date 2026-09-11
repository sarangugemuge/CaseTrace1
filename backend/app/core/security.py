import hashlib
import secrets
import io
import base64
from datetime import datetime, timedelta, timezone
from typing import Optional, Any, Tuple, List, Dict
import pyotp
import qrcode
from jose import jwt, JWTError
from backend.app.core.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return get_password_hash(plain_password) == hashed_password

def get_password_hash(password: str) -> str:
    # Salted SHA-256 password hash using secret
    salt = settings.JWT_SECRET
    return hashlib.sha256((password + salt).encode("utf-8")).hexdigest()

def hash_token(token: str) -> str:
    # Secure hash of token for database storage
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

def create_access_token(
    subject: str | Any,
    session_id: Optional[str] = None,
    role: Optional[str] = None,
    expires_delta: Optional[timedelta] = None
) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "access",
    }
    if session_id:
        to_encode["session_id"] = str(session_id)
    if role:
        to_encode["role"] = str(role)

    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_temp_2fa_token(subject: str | Any) -> str:
    """Short-lived 5-minute token issued between valid password check and TOTP verification."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=5)
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "2fa_pending",
    }
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.ALGORITHM)

def verify_temp_2fa_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "2fa_pending":
            return None
        return payload.get("sub")
    except JWTError:
        return None

def create_refresh_token() -> Tuple[str, str]:
    """Generates a cryptographically strong refresh token and its SHA-256 hash."""
    raw_token = secrets.token_urlsafe(48)
    token_hash = hash_token(raw_token)
    return raw_token, token_hash

# ==================== TOTP TWO-FACTOR AUTHENTICATION ====================

def generate_totp_secret() -> str:
    """Generates a standard Base32 TOTP secret."""
    return pyotp.random_base32()

def get_totp_uri(secret: str, email: str, issuer_name: Optional[str] = None) -> str:
    """Generates an otpauth:// URI for scanning with authenticator apps."""
    issuer = issuer_name or settings.TOTP_ISSUER_NAME
    totp = pyotp.TOTP(secret)
    return totp.provisioning_uri(name=email, issuer_name=issuer)

def verify_totp(secret: str, code: str) -> bool:
    """Verifies a 6-digit TOTP code against the secret (allowing 1 step tolerance = 30s)."""
    if not secret or not code:
        return False
    try:
        totp = pyotp.TOTP(secret)
        # valid_window=1 allows 1 step before/after (drift tolerance)
        return totp.verify(code.strip().replace(" ", ""), valid_window=1)
    except Exception:
        return False

def generate_qr_code_base64(uri: str) -> str:
    """Generates a base64-encoded PNG Data URI for the TOTP provisioning QR code."""
    img = qrcode.make(uri)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    img_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{img_b64}"

# ==================== SINGLE-USE BACKUP RECOVERY CODES ====================

def generate_recovery_codes(count: int = 8) -> Tuple[List[str], List[Dict[str, Any]]]:
    """
    Generates single-use recovery codes.
    Returns:
      plain_codes: list of strings (e.g. ['CT-8921-4401', ...]) to display once to user.
      stored_hashes: list of dicts [{'code_hash': ..., 'used': False, 'used_at': None}] to save in DB.
    """
    plain_codes = []
    stored_hashes = []
    for _ in range(count):
        part1 = secrets.randbelow(9000) + 1000
        part2 = secrets.randbelow(9000) + 1000
        code = f"CT-{part1}-{part2}"
        plain_codes.append(code)
        stored_hashes.append({
            "code_hash": hash_token(code),
            "used": False,
            "used_at": None,
        })
    return plain_codes, stored_hashes

def verify_and_consume_recovery_code(
    plain_code: str, stored_codes: Optional[List[Dict[str, Any]]]
) -> Tuple[bool, List[Dict[str, Any]]]:
    """
    Validates a recovery code. If valid and unused, marks it as used and returns True with updated list.
    If invalid or already used, returns False.
    """
    if not stored_codes or not plain_code:
        return False, stored_codes or []

    code_clean = plain_code.strip().upper()
    hashed_input = hash_token(code_clean)
    now_str = datetime.now(timezone.utc).isoformat()

    found = False
    updated_codes = []
    for entry in stored_codes:
        if entry.get("code_hash") == hashed_input and not entry.get("used"):
            found = True
            updated_codes.append({
                **entry,
                "used": True,
                "used_at": now_str,
            })
        else:
            updated_codes.append(entry)

    return found, updated_codes
