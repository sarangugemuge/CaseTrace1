'use client';

import React from 'react';
import { CasePassport } from '../../types/case';
import { FileText, ShieldCheck, Lock } from 'lucide-react';
import { SensitivityBadge } from '../common/Badge';

export const EvidenceTab: React.FC<{ caseData: CasePassport }> = ({ caseData }) => {
  const artifacts = [
    {
      id: 'ART-001',
      name: 'Encrypted HDD Forensic Image #1',
      type: 'E01 Raw Forensic Dump',
      hash: 'bf5b79647228807d8955219488a08c02c636f1c407559ed5a4bb8e84a20b0805',
      sensitivity: 'FORENSIC',
      status: 'VERIFIED ON CHAIN',
    },
    {
      id: 'ART-002',
      name: 'Wire Transfer Log Export (2025 Q4)',
      type: 'CSV / Financial Records',
      hash: '7f83b1657ff1fc53b92dc18148a1d65dfc61dd3002532966737170495f80185d',
      sensitivity: 'CONFIDENTIAL',
      status: 'VERIFIED ON CHAIN',
    },
    {
      id: 'ART-003',
      name: 'Volatile RAM Artifact Capture',
      type: 'MEMRAW Memory File',
      hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
      sensitivity: 'TOP_SECRET',
      status: 'VERIFIED ON CHAIN',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-card transition-colors space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <h3 className="text-sm font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          Physical & Digital Forensic Artifacts ({artifacts.length})
        </h3>
        <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          CRYPTOGRAPHIC HARDENING ACTIVE
        </span>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {artifacts.map((item) => (
          <div key={item.id} className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</span>
                <SensitivityBadge sensitivity={item.sensitivity as any} />
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">{item.type} • ID: {item.id}</div>
              <div className="text-[10px] text-blue-600 dark:text-blue-400 bg-slate-100 dark:bg-slate-950 p-1.5 rounded border border-slate-200 dark:border-slate-800 mt-2 break-all">
                SHA-256: {item.hash}
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 px-2.5 py-1 rounded">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
