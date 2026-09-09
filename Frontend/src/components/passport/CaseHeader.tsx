'use client';

import React from 'react';
import { CasePassport } from '../../types/case';
import { ShieldCheck, Lock, FileText, Calendar, Building, User } from 'lucide-react';
import { SensitivityBadge } from '../common/Badge';

interface CaseHeaderProps {
  caseData: CasePassport;
}

export const CaseHeader: React.FC<CaseHeaderProps> = ({ caseData }) => {
  return (
    <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-6 shadow-card transition-colors mb-6">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-400 border border-blue-300 dark:border-blue-800 px-3 py-1 rounded font-bold tracking-wide">
              {caseData.caseNumber}
            </span>
            <SensitivityBadge sensitivity={caseData.classification as any} />
            <span
              className="text-xs font-mono text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-bold bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 px-2.5 py-0.5 rounded"
              title="Cryptographically sealed and tamper-evident: Genesis block record prevents retroactive alteration."
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              BLOCKCHAIN ANCHORED
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{caseData.title}</h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">{caseData.description}</p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              INCIDENT: <strong className="text-slate-900 dark:text-slate-200">{caseData.incidentDate}</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              DEPT: <strong className="text-slate-900 dark:text-slate-200">{caseData.department}</strong>
            </span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-lg p-4 text-xs font-mono space-y-2.5 min-w-[240px]">
          <div className="text-slate-500 dark:text-slate-400 flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-1.5">
            <span>PRIORITY:</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold uppercase">{caseData.priority}</span>
          </div>
          <div className="text-slate-500 dark:text-slate-400 flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-1.5">
            <span>STAGE:</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">{caseData.caseStage}</span>
          </div>
          <div className="text-slate-500 dark:text-slate-400 flex justify-between items-center">
            <span>LEAD OFFICER:</span>
            <span className="text-slate-900 dark:text-slate-200 font-bold">{caseData.leadInvestigator}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
