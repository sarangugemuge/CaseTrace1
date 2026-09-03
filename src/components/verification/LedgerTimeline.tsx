'use client';

import React from 'react';
import { Database, Link as LinkIcon, ShieldCheck } from 'lucide-react';

export const LedgerTimeline: React.FC = () => {
  const blocks = [
    {
      block: 14820935,
      timestamp: '2026-09-03 08:30:12 UTC',
      caseId: 'CASE-2026-1105',
      tx: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
      prevHash: '0x00000000000000000007a89b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d',
      merkleRoot: '0xe3b0c44298fc1c149afbf4c8996fb924',
    },
    {
      block: 14820934,
      timestamp: '2026-09-02 14:15:00 UTC',
      caseId: 'CASE-2026-8942',
      tx: '0x8f2a1b94c3e801d9f4e271a5b8c9d0e1f2a3b4c5',
      prevHash: '0x00000000000000000003b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
      merkleRoot: '0x7f83b1657ff1fc53b92dc18148a1d65d',
    },
    {
      block: 14820933,
      timestamp: '2026-08-28 11:45:00 UTC',
      caseId: 'CASE-2026-4410',
      tx: '0x3c7d9e1f4a5b6c8a9b0c1d2e3f4a5b6c7d8e9f0a',
      prevHash: '0x00000000000000000001d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3',
      merkleRoot: '0x456789abcdef0123456789abcdef0123',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          Simulated Blockchain Anchor Block Explorer
        </h3>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
          IMMUTABLE LEDGER
        </span>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {blocks.map((blk) => (
          <div
            key={blk.block}
            className="bg-navy-950 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors"
          >
            <div className="flex flex-wrap justify-between items-center text-slate-400 mb-2">
              <span className="text-emerald-400 font-bold">BLOCK #{blk.block}</span>
              <span className="text-slate-500 text-[10px]">{blk.timestamp}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] text-slate-300">
              <div>
                <span className="text-slate-500">CASE:</span> {blk.caseId}
              </div>
              <div className="truncate">
                <span className="text-slate-500">MERKLE:</span> {blk.merkleRoot}
              </div>
              <div className="truncate text-blue-400">
                <span className="text-slate-500">TX:</span> {blk.tx}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
