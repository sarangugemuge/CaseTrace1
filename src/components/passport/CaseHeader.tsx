'use client';

import React from 'react';
import { CasePassport } from '../../types/case';
import { Shield, FileText, Lock } from 'lucide-react';
import { SensitivityBadge } from '../common/Badge';

interface CaseHeaderProps {
  caseData: CasePassport;
}

export const CaseHeader: React.FC<CaseHeaderProps> = ({ caseData }) => {
  return (
    <div className="bg-navy-900 border border-slate-800 rounded-xl p-6 shadow-md mb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-xs bg-blue-950 text-blue-400 border border-blue-800 px-2.5 py-0.5 rounded font-semibold tracking-wide">
              {caseData.caseNumber}
            </span>
            <SensitivityBadge sensitivity={caseData.classification as any} />
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              DIGITAL PASSPORT ANCHORED
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">{caseData.title}</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">{caseData.description}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs font-mono space-y-1 min-w-[220px]">
          <div className="text-slate-400 flex justify-between">
            <span>LEAD INVESTIGATOR:</span>
            <span className="text-slate-200 font-semibold">{caseData.leadInvestigator}</span>
          </div>
          <div className="text-slate-400 flex justify-between">
            <span>DEPARTMENT:</span>
            <span className="text-slate-200">{caseData.department}</span>
          </div>
          <div className="text-slate-400 flex justify-between">
            <span>STAGE:</span>
            <span className="text-blue-400 font-semibold">{caseData.caseStage}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
