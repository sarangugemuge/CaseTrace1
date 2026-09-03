from pydantic import BaseModel
from typing import Optional

class HashVerifyRequest(BaseModel):
    content: Optional[str] = None
    hash_to_verify: Optional[str] = None
    expected_hash: str

class HashVerifyResponse(BaseModel):
    computed_hash: str
    expected_hash: str
    is_match: bool
    status: str
    simulated_block_number: int = 14820935
    simulated_merkle_root: str = "0xe3b0c44298fc1c149afbf4c8996fb924"
    simulated_transaction_id: str = "0x8f2a1b94c3e801d9f4e271a5b8c9d0e1f2a3b4c5"
