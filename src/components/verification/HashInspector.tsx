'use client';

import React, { useState } from 'react';
import { verificationService } from '../../services/verificationService';
import { ShieldCheck, AlertTriangle, FileCheck, CheckCircle, RefreshCw } from 'lucide-react';

export const HashInspector: React.FC = () => {
  const [contentInput, setContentInput] = useState('OFFICIAL_CASE_PAYLOAD_FIR_2026');
  const [targetHash, setTargetHash] = useState('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  const [computedHash, setComputedHash] = useState('');
  const [verificationResult, setVerificationResult] = useState<{ isMatch: boolean; status: string } | null>(null);

  const handleComputeHash = () => {
    const computed = verificationService.generateHash(contentInput);
    setComputedHash(computed);
    const match = verificationService.verifyHash(computed, targetHash);
    setVerificationResult({
      isMatch: match,
      status: match ? 'VERIFIED (BIT-EXACT MATCH)' : 'INTEGRITY MISMATCH (TAMPERED ARTIFACT)',
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-card transition-colors space-y-5">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Interactive Cryptographic SHA-256 Inspector & Validator
        </h3>
        <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded font-bold">
          BIT-LEVEL ACCURACY
        </span>
      </div>

      <div className="space-y-4 font-mono text-xs">
        <div>
          <label className="block text-slate-700 dark:text-slate-300 mb-1">Evidence Payload / Raw Document Content:</label>
          <textarea
            value={contentInput}
            onChange={(e) => setContentInput(e.target.value)}
            rows={3}
            className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-200 focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-slate-700 dark:text-slate-300 mb-1">Expected Blockchain Ledger SHA-256 Digest:</label>
          <input
            type="text"
            value={targetHash}
            onChange={(e) => setTargetHash(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-200 font-bold focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <button
          onClick={handleComputeHash}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-2 shadow-md transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Compute SHA-256 & Execute Bit-Level Verification
        </button>

        {computedHash && (
          <div className="bg-slate-50 dark:bg-navy-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
            <div>
              <span className="text-slate-500 block text-[10px]">COMPUTED SHA-256:</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold break-all">{computedHash}</span>
            </div>
          </div>
        )}

        {verificationResult && (
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 font-bold ${
              verificationResult.isMatch
                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-300 animate-pulse'
            }`}
          >
            {verificationResult.isMatch ? (
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <div>
              <div className="text-sm">{verificationResult.status}</div>
              <div className="text-[11px] font-normal opacity-85 mt-0.5">
                {verificationResult.isMatch
                  ? 'Cryptographic integrity verified. Document matches ledger anchor bit-for-bit.'
                  : 'WARNING: Document has been modified or corrupted since initial registration!'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
