'use client';

import React from 'react';
import { ShieldCheck, Database, Link as LinkIcon } from 'lucide-react';

interface BlockchainBadgeProps {
  blockNumber: number;
  transactionId: string;
  merkleRoot: string;
}

export const BlockchainBadge: React.FC<BlockchainBadgeProps> = ({
  blockNumber,
  transactionId,
  merkleRoot,
}) => {
  return (
    <div className="bg-slate-50 dark:bg-navy-950 border border-emerald-300 dark:border-emerald-900/60 rounded-lg p-4 font-mono text-xs text-slate-700 dark:text-slate-300 flex flex-wrap items-center justify-between gap-4 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            CRYPTOGRAPHIC INTEGRITY ANCHOR LEDGER
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">Anchor #{blockNumber} • Root Hash: {merkleRoot.slice(0, 18)}...</div>
        </div>
      </div>

      <div className="text-right text-[10px]">
        <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1 justify-end">
          <LinkIcon className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          ANCHOR ID: <span className="text-blue-600 dark:text-blue-400 truncate max-w-[140px] font-bold">{transactionId}</span>
        </div>
        <div className="text-emerald-700 dark:text-emerald-500 font-semibold">STATUS: SHA-256 ANCHOR ACTIVE</div>
      </div>
    </div>
  );
};
