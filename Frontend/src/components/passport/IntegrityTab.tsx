'use client';

import React from 'react';
import { CasePassport } from '../../types/case';
import { HashInspector } from '../verification/HashInspector';
import { BlockchainBadge } from './BlockchainBadge';

export const IntegrityTab: React.FC<{ caseData: CasePassport }> = ({ caseData }) => {
  return (
    <div className="space-y-6">
      <BlockchainBadge
        blockNumber={14820934}
        transactionId="0x8f2a1b94c3e801d9f4e271a5b8c9d0e1f2a3b4c5"
        merkleRoot="0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      />
      <HashInspector />
    </div>
  );
};
