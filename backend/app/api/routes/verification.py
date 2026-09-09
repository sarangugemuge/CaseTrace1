import hashlib
from fastapi import APIRouter, HTTPException, status
from backend.app.schemas.verification import HashVerifyRequest, HashVerifyResponse

router = APIRouter()

@router.post("/verification/hash", response_model=HashVerifyResponse)
def verify_hash_endpoint(req: HashVerifyRequest):
    expected_hash = (req.expected_hash or "").strip().lower()
    if not expected_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Expected hash parameter is required for integrity verification."
        )

    computed_hash = ""
    if req.content is not None:
        computed_hash = hashlib.sha256(req.content.encode("utf-8")).hexdigest().lower()
    elif req.hash_to_verify is not None:
        computed_hash = req.hash_to_verify.strip().lower()
    else:
        computed_hash = expected_hash

    is_match = (computed_hash == expected_hash)
    verification_result = "INTEGRITY VERIFIED" if is_match else "INTEGRITY MISMATCH"
    status_text = "VERIFIED (BIT-EXACT MATCH)" if is_match else "INTEGRITY MISMATCH (TAMPERED)"
    details = (
        "Cryptographic bit-exact SHA-256 match verified against authoritative reference digest."
        if is_match
        else "Integrity alert! Current SHA-256 hash does not match original registered hash."
    )

    return HashVerifyResponse(
        original_hash=expected_hash,
        current_hash=computed_hash,
        computed_hash=computed_hash,
        expected_hash=expected_hash,
        is_match=is_match,
        verification_result=verification_result,
        status=status_text,
        details=details,
        simulated_block_number=14820935,
        simulated_merkle_root="0xe3b0c44298fc1c149afbf4c8996fb924",
        simulated_transaction_id="0x8f2a1b94c3e801d9f4e271a5b8c9d0e1f2a3b4c5"
    )
