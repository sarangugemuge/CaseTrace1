'use client';

import React, { useState } from 'react';
import { Document } from '../../types/document';
import { verificationService } from '../../services/verificationService';
import { ShieldCheck, Database, RefreshCw, FileCheck, CheckCircle2, ShieldAlert } from 'lucide-react';
import { IntegrityBadge } from '../common/Badge';

export const IntegrityTab: React.FC<{ documents: Document[]; caseId: string }> = ({
  documents,
  caseId,
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || 'doc-101');
  const [computedHashInput, setComputedHashInput] = useState<string>('');
  const [verificationState, setVerificationState] = useState<'IDLE' | 'VERIFIED' | 'MISMATCH'>('IDLE');

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  const handleVerify = () => {
    const hashToTest = computedHashInput.trim() || selectedDoc.sha256Hash;
    const isMatch = verificationService.verifyHash(hashToTest, selectedDoc.sha256Hash);
    setVerificationState(isMatch ? 'VERIFIED' : 'MISMATCH');
  };

  const simulatedBlock = verificationService.getBlockchainRecord(
    selectedDoc?.blockchainRecordId || 'blk-001',
    caseId,
    selectedDoc?.sha256Hash || ''
  );

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Disclaimer Card */}
      <div className="bg-navy-950 border border-emerald-900/80 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="text-emerald-400 font-bold text-sm tracking-wide">
              SIMULATED BLOCKCHAIN ANCHOR & MERKLE TREE AUDITOR
            </div>
            <div className="text-slate-400 text-[11px] mt-0.5">
              Cryptographic verification engine comparing local file SHA-256 digests against immutable anchor records.
            </div>
          </div>
        </div>
      </div>

      {/* Select Document for Verification */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
        <div className="border-b border-slate-800 pb-3">
          <label className="block text-slate-300 font-bold uppercase tracking-wider mb-2">
            Select Document Artifact to Audit:
          </label>
          <select
            value={selectedDocId}
            onChange={(e) => {
              setSelectedDocId(e.target.value);
              setVerificationState('IDLE');
              setComputedHashInput('');
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} (v{d.version} • {d.sensitivity})
              </option>
            ))}
          </select>
        </div>

        {selectedDoc && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-navy-950 p-4 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-400">REGISTERED SHA-256 HASH:</span>
                <div className="text-blue-300 bg-slate-950 p-2 rounded border border-slate-800 break-all mt-1">
                  {selectedDoc.sha256Hash}
                </div>
              </div>

              <div>
                <span className="text-slate-400">BLOCKCHAIN MERKLE ROOT ANCHOR:</span>
                <div className="text-emerald-400 bg-slate-950 p-2 rounded border border-slate-800 break-all mt-1">
                  {simulatedBlock.merkleRoot}
                </div>
              </div>
            </div>

            {/* Test Input Hash */}
            <div>
              <label className="block text-slate-400 mb-1">
                Enter SHA-256 Digest to Test (Leave blank to test registered file hash):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
                  value={computedHashInput}
                  onChange={(e) => setComputedHashInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                />
                <button
                  onClick={handleVerify}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-md"
                >
                  <ShieldCheck className="w-4 h-4" />
                  VERIFY INTEGRITY
                </button>
              </div>
            </div>

            {/* Verification State Box */}
            {verificationState !== 'IDLE' && (
              <div className="pt-3 border-t border-slate-800">
                {verificationState === 'VERIFIED' ? (
                  <div className="bg-emerald-950 border border-emerald-800 p-4 rounded-lg flex items-center gap-3 text-emerald-300 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <div>INTEGRITY STATUS: VERIFIED (BIT-EXACT MATCH)</div>
                      <div className="text-[11px] font-normal text-emerald-400/80 mt-0.5">
                        Document matches Block #{simulatedBlock.blockNumber} anchored transaction {simulatedBlock.transactionId}.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-rose-950 border border-rose-800 p-4 rounded-lg flex items-center gap-3 text-rose-300 font-bold animate-pulse">
                    <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                    <div>
                      <div>INTEGRITY MISMATCH (POSSIBLE FILE TAMPERING)</div>
                      <div className="text-[11px] font-normal text-rose-400/80 mt-0.5">
                        Provided hash does not match registered blockchain Merkle anchor. Security event logged.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
