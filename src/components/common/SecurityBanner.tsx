'use client';

import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const SecurityBanner: React.FC = () => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-300 text-xs py-2 px-4 flex flex-wrap items-center justify-between gap-2 shadow-inner">
      <div className="flex items-center gap-2 font-medium">
        <span className="inline-flex items-center gap-1 bg-amber-950/80 text-amber-400 border border-amber-800/80 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase">
          <AlertTriangle className="w-3.5 h-3.5" />
          CASETRACE DEMONSTRATION MODE
        </span>
        <span className="text-slate-400 hidden sm:inline">
          Simulated Digital Case Passport & RBAC Engine • No production case data should be used.
        </span>
      </div>
      <div className="flex items-center gap-3 text-slate-400 text-[11px]">
        <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          MOCK SHA-256 & BLOCKCHAIN ANCHOR ACTIVE
        </span>
      </div>
    </div>
  );
};
