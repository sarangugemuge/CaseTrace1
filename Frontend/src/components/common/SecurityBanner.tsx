'use client';

import React from 'react';
import { ShieldCheck, Shield } from 'lucide-react';

export const SecurityBanner: React.FC = () => {
  return (
    <div className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs py-1.5 px-4 flex flex-wrap items-center justify-between gap-2 transition-colors">
      <div className="flex items-center gap-2 font-medium">
        <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-400 border border-blue-300 dark:border-blue-800/80 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase font-mono">
          <Shield className="w-3 h-3" />
          CASETRACE SECURE PLATFORM
        </span>
        <span className="text-slate-500 dark:text-slate-400 text-[11px] hidden sm:inline font-sans">
          Centralized Digital Case Passport • Role-Based Access Control & Evidence Lifecycle
        </span>
      </div>
      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px]">
        <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          SHA-256 INTEGRITY ANCHOR ACTIVE
        </span>
      </div>
    </div>
  );
};
