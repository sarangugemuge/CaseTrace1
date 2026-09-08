'use client';

import React from 'react';
import { CasePassport } from '../../types/case';
import { RiskScoreCard } from '../security/RiskScoreCard';
import { AccessAuditLog } from '../security/AccessAuditLog';

export const SecurityViewTab: React.FC<{ caseData: CasePassport }> = ({ caseData }) => {
  return (
    <div className="space-y-6">
      <RiskScoreCard />
      <AccessAuditLog filterCaseId={caseData.caseId} />
    </div>
  );
};
