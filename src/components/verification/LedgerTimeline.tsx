'use client';

import React from 'react';
import { Database, ShieldCheck } from 'lucide-react';

export const LedgerTimeline: React.FC = () => {
  const blocks = [
    {
      block: 14820934,
      tx: '0x8f2a1b94c3e801d9f4e271a5b8c9d0e1f2a3b4c5',
      time: '2026-01-14 09:00:00 UTC',
      payload: 'CASE-2026-8942 FIR Document Anchor',
      status: 'CONFIRMED (12,840 CONFIRMATIONS)',
    },
    {
      block: 14821002,
      tx: '0x7f83b1657ff1fc53b92dc18148a1d65dfc61dd30',
      time: '2026-03-01 16:45:00 UTC',
      payload: 'CASE-2026-8942 Memory Image Anchor',
      status: 'CONFIRMED (11,490 CONFIRMATIONS)',
    },
    {
      block: 14821550,
      tx: '0x3c7d9e1f4a5b6c8a9b0c1d2e3f4a5b6c7d8e9f0a',
      time: '2026-05-18 13:00:00 UTC',
      payload: 'CASE-2026-4410 Port Smuggling Record Anchor',
      status: 'CONFIRMED (8,120 CONFIRMATIONS)',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-card transition-colors space-y-4">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Simulated Blockchain Block Explorer & Ledger Stream
        </h3>
        <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold">NETWORK: CASETRACE-PRIVATE-LEDGER</span>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {blocks.map((b) => (
          <div key={b.block} className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400 text-sm">
                <span>Block #{b.block}</span>
                <span className="text-slate-400 font-normal text-xs">• {b.time}</span>
              </div>
              <div className="text-slate-700 dark:text-slate-300 mt-1 font-semibold">{b.payload}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate max-w-md">TX HASH: {b.tx}</div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 px-2.5 py-1 rounded">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {b.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
