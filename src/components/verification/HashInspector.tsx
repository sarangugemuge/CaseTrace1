'use client';

import React, { useState } from 'react';
import { verificationService } from '../../services/verificationService';
import { ShieldCheck, ShieldAlert, FileText, CheckCircle2, RefreshCw } from 'lucide-react';

export const HashInspector: React.FC = () => {
  const [inputText, setInputText] = useState('OFFICIAL_CASE_EVIDENCE_SPEC_2026_DARKLEDGE');
  const [targetHash, setTargetHash] = useState('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  const [computedHash, setComputedHash] = useState(verificationService.generateHash('OFFICIAL_CASE_EVIDENCE_SPEC_2026_DARKLEDGE'));

  const handleCompute = (val: string) => {
    setInputText(val);
    const hash = verificationService.generateHash(val);
    setComputedHash(hash);
  };

  const isMatch = verificationService.verifyHash(computedHash, targetHash);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            SHA-256 Cryptographic Hash Inspector & Verification
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulate real-time hash verification against blockchain anchor records.
          </p>
        </div>
        <span className="text-[10px] font-mono bg-blue-950 text-blue-400 border border-blue-800 px-2 py-1 rounded">
          PROTOTYPE HASH ENGINE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
            Input Content String / File Artifact Stream:
          </label>
          <textarea
            value={inputText}
            onChange={(e) => handleCompute(e.target.value)}
            rows={4}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 font-mono focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
            Expected Ledger Anchor SHA-256 Hash:
          </label>
          <input
            type="text"
            value={targetHash}
            onChange={(e) => setTargetHash(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 font-mono focus:border-blue-500 focus:outline-hidden mb-3"
          />
          <button
            onClick={() => setTargetHash(computedHash)}
            className="text-[11px] font-mono text-blue-400 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Set expected hash to current computed hash
          </button>
        </div>
      </div>

      {/* Computed Result Card */}
      <div className="bg-navy-950 border border-slate-800 rounded-lg p-4 font-mono text-xs space-y-3">
        <div>
          <span className="text-slate-400">COMPUTED SHA-256 DIGEST:</span>
          <div className="text-blue-300 bg-slate-950 p-2 rounded border border-slate-800 break-all mt-1">
            {computedHash}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-slate-400">INTEGRITY COMPARISON RESULT:</span>
          {isMatch ? (
            <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded">
              <CheckCircle2 className="w-4 h-4" />
              INTEGRITY VERIFIED (BIT-EXACT MATCH)
            </div>
          ) : (
            <div className="flex items-center gap-2 text-rose-400 font-bold bg-rose-950/80 border border-rose-800 px-3 py-1 rounded animate-pulse">
              <ShieldAlert className="w-4 h-4" />
              HASH MISMATCH (POSSIBLE TAMPERING)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
