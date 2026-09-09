'use client';

import React from 'react';
import { CasePassport } from '../../types/case';
import { HashInspector } from '../verification/HashInspector';
import { BlockchainBadge } from './BlockchainBadge';
import {
  ShieldCheck,
  HelpCircle,
  Key,
  Eye,
  CheckCircle2,
  FileText,
  Database,
} from 'lucide-react';

export const IntegrityTab: React.FC<{ caseData: CasePassport }> = ({ caseData }) => {
  return (
    <div className="space-y-6 font-mono text-xs">
      {/* 5-Step Evidence Integrity Workflow Bar */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-xs transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-navy-800 mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
              Evidence Integrity Lifecycle Workflow
            </span>
          </div>
          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded font-bold">
            CASE ANCHOR ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          <div className="bg-slate-50 dark:bg-navy-950 p-3 rounded-lg border border-slate-200 dark:border-navy-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">1</span>
              <FileText className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="font-bold text-slate-900 dark:text-white text-[11px]">Register Evidence</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Ingest artifact with Case ID, metadata, and officer identity.
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-navy-950 p-3 rounded-lg border border-slate-200 dark:border-navy-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">2</span>
              <Key className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <div className="font-bold text-slate-900 dark:text-white text-[11px]">Generate SHA-256</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Compute authoritative 64-character mathematical fingerprint at intake.
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-navy-950 p-3 rounded-lg border border-slate-200 dark:border-navy-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">3</span>
              <Database className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="font-bold text-slate-900 dark:text-white text-[11px]">Store Record</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Persist database passport record & link to chronological ledger anchor.
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-navy-950 p-3 rounded-lg border border-slate-200 dark:border-navy-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">4</span>
              <Eye className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="font-bold text-slate-900 dark:text-white text-[11px]">Track Access</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Immutably log every view, download, and verification event with RBAC.
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-navy-950 p-3 rounded-lg border border-slate-200 dark:border-navy-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">5</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="font-bold text-slate-900 dark:text-white text-[11px]">Verify Integrity</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Compare current file bit-for-bit with original hash to detect tampering.
            </div>
          </div>
        </div>
      </div>

      {/* Case Genesis Blockchain Anchor Badge */}
      <BlockchainBadge
        blockNumber={14820934}
        transactionId={caseData?.blockchainAnchorId || '0x8f2a1b94c3e801d9f4e271a5b8c9d0e1f2a3b4c5'}
        merkleRoot="0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      />

      {/* Explanatory Judicial Section */}
      <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl p-5 space-y-4 font-mono">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-2.5">
          <HelpCircle className="w-4 h-4 text-blue-500" />
          <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
            How Document & Evidence Integrity Works (Judicial Reference)
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
          <div className="space-y-2">
            <h5 className="font-bold text-slate-900 dark:text-white font-mono flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Cryptographic Integrity: Actual SHA-256 Hash Comparison
            </h5>
            <p>
              When evidence is registered, the system calculates a <strong>SHA-256 cryptographic digest</strong>.
              This 64-character hexadecimal string acts like an exact digital fingerprint of the file.
            </p>
            <p>
              Under the mathematical properties of SHA-256, changing even <em>a single character, byte, or timestamp</em> completely alters the entire code (known as the avalanche effect).
              If the <strong>Original Hash</strong> matches the <strong>Current Hash</strong>, the evidence is mathematically proven to be identical and unaltered.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-slate-900 dark:text-white font-mono flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Prototype Ledger vs. Production Blockchain
            </h5>
            <p>
              To ensure that even an administrator cannot quietly replace the registered hash, the hash is anchored with a timestamp into a <strong>tamper-evident chronological ledger block</strong>.
            </p>
            <p>
              In this prototype demonstration, CaseTrace utilizes a deterministic cryptographically chained record to demonstrate ledger immutability without requiring a live public cryptocurrency network.
              Every verification event is immutably audited with officer identity, role clearance, and exact timestamp.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Hash Validator */}
      <HashInspector />
    </div>
  );
};
