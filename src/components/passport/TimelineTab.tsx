'use client';

import React from 'react';
import { CasePassport } from '../../types/case';
import { LedgerTimeline } from '../verification/LedgerTimeline';
import { ChainOfCustody } from './ChainOfCustody';

export const TimelineTab: React.FC<{ caseData: CasePassport }> = ({ caseData }) => {
  return (
    <div className="space-y-6">
      <ChainOfCustody caseId={caseData.caseId} />
      <LedgerTimeline />
    </div>
  );
};
