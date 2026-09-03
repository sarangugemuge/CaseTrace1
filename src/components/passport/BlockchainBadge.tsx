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
    <div className="bg-navy-950 border border-emerald-900/60 rounded-lg p-4 font-mono text-xs text-slate-300 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="text-emerald-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            SIMULATED BLOCKCHAIN IMMUTABLE ANCHOR
          </div>
          <div className="text-[10px] text-slate-400">Block #{blockNumber} • Merkle Root: {merkleRoot.slice(0, 18)}...</div>
        </div>
      </div>

      <div className="text-right text-[10px]">
        <div className="text-slate-400 flex items-center gap-1 justify-end">
          <LinkIcon className="w-3 h-3 text-blue-400" />
          TX: <span className="text-blue-400 truncate max-w-[140px]">{transactionId}</span>
        </div>
        <div className="text-emerald-500 font-semibold">STATUS: CONFIRMED ON LEDGER</div>
      </div>
    </div>
  );
};
