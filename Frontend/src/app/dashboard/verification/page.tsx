'use client';

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { HashInspector } from '../../../components/verification/HashInspector';
import { LedgerTimeline } from '../../../components/verification/LedgerTimeline';
import { FileCheck, ShieldCheck, Database } from 'lucide-react';

export default function VerificationPage() {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-card flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mb-1">
            <span>CRYPTOGRAPHIC ENGINE:</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold uppercase">SHA-256 & BLOCKCHAIN LEDGER</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Integrity Verification & Ledger Explorer
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Validate document hashes bit-for-bit against simulated immutable blockchain ledger blocks.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 px-3 py-2 rounded-lg">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          CRYPTOGRAPHIC PROOF ENGINE READY
        </div>
      </div>

      <HashInspector />
      <LedgerTimeline />
    </div>
  );
}
