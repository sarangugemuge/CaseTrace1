'use client';

import React from 'react';
import { HashInspector } from '../../../components/verification/HashInspector';
import { LedgerTimeline } from '../../../components/verification/LedgerTimeline';
import { FileCheck } from 'lucide-react';

export default function VerificationPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-navy-900 border border-slate-800 rounded-xl p-6 shadow-lg flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>INTEGRITY VERIFICATION SERVICE</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Cryptographic SHA-256 & Blockchain Ledger Inspector
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Verify case evidence artifacts against immutable Merkle tree anchor blocks.
          </p>
        </div>
      </div>

      {/* Interactive Hash Inspector */}
      <HashInspector />

      {/* Ledger Block Explorer Timeline */}
      <LedgerTimeline />
    </div>
  );
}
