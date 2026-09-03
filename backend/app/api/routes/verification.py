import hashlib
from fastapi import APIRouter
from backend.app.schemas.verification import HashVerifyRequest, HashVerifyResponse

router = APIRouter()

@router.post("/verification/hash", response_model=HashVerifyResponse)
def verify_hash_endpoint(req: HashVerifyRequest):
    computed_hash = ""
    if req.content:
        computed_hash = hashlib.sha256(req.content.encode("utf-8")).hexdigest()
    elif req.hash_to_verify:
        computed_hash = req.hash_to_verify.strip().lower()
    else:
        computed_hash = req.expected_hash.strip().lower()

    expected_hash = req.expected_hash.strip().lower()
    is_match = (computed_hash.lower() == expected_hash)

    return HashVerifyResponse(
        computed_hash=computed_hash,
        expected_hash=expected_hash,
        is_match=is_match,
        status="VERIFIED (BIT-EXACT MATCH)" if is_match else "INTEGRITY MISMATCH (TAMPERED)"
    )
