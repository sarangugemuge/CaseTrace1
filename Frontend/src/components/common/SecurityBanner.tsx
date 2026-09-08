'use client';

import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const SecurityBanner: React.FC = () => {
  return (
    <div className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs py-2 px-4 flex flex-wrap items-center justify-between gap-2 transition-colors">
      <div className="flex items-center gap-2 font-medium">
        <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800/80 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase">
          <AlertTriangle className="w-3.5 h-3.5" />
          CASETRACE DEMONSTRATION MODE
        </span>
        <span className="text-slate-600 dark:text-slate-400 hidden sm:inline">
          Simulated Digital Case Passport & RBAC Engine • No production case data should be used.
        </span>
      </div>
      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-[11px]">
        <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          MOCK SHA-256 & BLOCKCHAIN ANCHOR ACTIVE
        </span>
      </div>
    </div>
  );
};
