'use client';

import React from 'react';
import { CasePassport } from '../../types/case';
import { SensitivityBadge } from '../common/Badge';
import { Shield, FileText, UserCheck, Activity } from 'lucide-react';

export const OverviewTab: React.FC<{ caseData: CasePassport }> = ({ caseData }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-subtle transition-colors">
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase flex items-center justify-between">
            <span>TOTAL EVIDENCE ARTIFACTS</span>
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-2">{caseData.evidenceCount}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{caseData.documentCount} Registered Documents</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-subtle transition-colors">
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase flex items-center justify-between">
            <span>ASSIGNED PERSONNEL</span>
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-2">{caseData.assignedUsers.length}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Multi-agency clearance active</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-subtle transition-colors">
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase flex items-center justify-between">
            <span>INTEGRITY ANCHOR</span>
            <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 mt-2 truncate">{caseData.blockchainAnchorId}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Immutable Root Hash Verified</div>
        </div>
      </div>

      {/* Case Details Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-card transition-colors space-y-4">
        <h3 className="text-sm font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Case Overview & Intelligence Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
          <div className="space-y-3">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">CASE NUMBER:</span>
              <span className="text-slate-900 dark:text-white font-bold">{caseData.caseNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">INCIDENT DATE:</span>
              <span className="text-slate-900 dark:text-white">{caseData.incidentDate}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">PRIORITY:</span>
              <span className="text-rose-600 dark:text-rose-400 font-bold uppercase">{caseData.priority}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">IDENTIFIED SUSPECTS:</span>
              <span className="text-slate-900 dark:text-white font-semibold">{caseData.suspects.join(', ')}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">PRIMARY VICTIMS / ENTITIES:</span>
              <span className="text-slate-900 dark:text-white font-semibold">{caseData.victims.join(', ')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
