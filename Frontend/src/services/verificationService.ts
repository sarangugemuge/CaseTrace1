import { BlockchainRecord } from '../types/security';

export const verificationService = {
  // Simulated SHA-256 Hash Generator (Deterministic pseudo-hash for prototype strings)
  generateHash(input: string): string {
    let hash1 = 0x811c9dc5;
    let hash2 = 0x01000193;

    for (let i = 0; i < input.length; i++) {
      const charCode = input.charCodeAt(i);
      hash1 ^= charCode;
      hash1 = Math.imul(hash1, 16777619);
      hash2 ^= charCode;
      hash2 = Math.imul(hash2, 3100319);
    }

    const hex1 = (hash1 >>> 0).toString(16).padStart(8, '0');
    const hex2 = (hash2 >>> 0).toString(16).padStart(8, '0');
    const hex3 = Math.abs(hash1 ^ hash2).toString(16).padStart(8, '0');
    const hex4 = Math.abs(hash1 + hash2).toString(16).padStart(8, '0');

    // 64-character hex string imitating SHA-256
    return (hex1 + hex2 + hex3 + hex4 + hex1 + hex2 + hex3 + hex4).slice(0, 64);
  },

  verifyHash(calculatedHash: string, recordedHash: string): boolean {
    if (!calculatedHash || !recordedHash) return false;
    return calculatedHash.toLowerCase() === recordedHash.toLowerCase();
  },

  getBlockchainRecord(recordId: string, caseId: string, hash: string): BlockchainRecord {
    return {
      recordId,
      caseId,
      documentId: 'doc-101',
      sha256Hash: hash,
      timestamp: '2026-09-03T09:00:00Z',
      blockNumber: 14820934,
      previousHash: '0x00000000000000000007a89b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d',
      merkleRoot: '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      transactionId: `0x${this.generateHash(recordId + caseId)}`,
      anchorStatus: 'CONFIRMED_ON_BLOCKCHAIN',
    };
  },

  registerBlockchainAnchor(caseId: string, sha256Hash: string): BlockchainRecord {
    const recordId = `blk-${Date.now().toString().slice(-4)}`;
    return {
      recordId,
      caseId,
      sha256Hash,
      timestamp: new Date().toISOString(),
      blockNumber: 14820935 + Math.floor(Math.random() * 100),
      previousHash: `0x${this.generateHash(caseId + 'prev')}`,
      merkleRoot: `0x${sha256Hash.slice(0, 32)}`,
      transactionId: `0x${this.generateHash(caseId + sha256Hash + Date.now())}`,
      anchorStatus: 'CONFIRMED_ON_BLOCKCHAIN',
    };
  },
};
