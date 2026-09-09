'use client';

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { HashInspector } from '../../../components/verification/HashInspector';
import { LedgerTimeline } from '../../../components/verification/LedgerTimeline';
import {
  FileCheck,
  ShieldCheck,
  Database,
  HelpCircle,
  Key,
  Eye,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export default function VerificationPage() {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-6 shadow-card flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mb-1">
            <span>CRYPTOGRAPHIC ENGINE:</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold uppercase">
              SHA-256 HASH VERIFICATION & DEMO LEDGER
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Evidence Integrity Verification & Ledger Explorer
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
            SHA-256 Verification: Checks whether the document has changed since it was registered by comparing 64-character mathematical fingerprints bit-for-bit.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 px-3 py-2 rounded-lg">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          CRYPTOGRAPHIC PROOF ENGINE ACTIVE
        </div>
      </div>

      {/* 5-Step Evidence Integrity Workflow Bar */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-xs transition-colors font-mono text-xs">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 dark:border-navy-800 mb-4 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                Evidence Integrity Lifecycle Workflow
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
              Checks whether the digital artifact has changed since registration using FIPS 180-4 standard cryptographic hashing.
            </p>
          </div>
          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded font-bold shrink-0">
            EVIDENTIARY PROTOCOL
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
              Capture digital artifact with Case ID, metadata, and uploader clearance.
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-navy-950 p-3 rounded-lg border border-slate-200 dark:border-navy-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">2</span>
              <Key className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <div className="font-bold text-slate-900 dark:text-white text-[11px]">Generate SHA-256</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Compute authentic 64-character mathematical fingerprint at ingest.
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-navy-950 p-3 rounded-lg border border-slate-200 dark:border-navy-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">3</span>
              <Database className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="font-bold text-slate-900 dark:text-white text-[11px]">Store Record</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Save database passport record & link to chronological ledger anchor.
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

      {/* Explanatory Judicial Section */}
      <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-2.5">
          <HelpCircle className="w-4 h-4 text-blue-500" />
          <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs font-mono">
            How Document & Evidence Integrity Works (Judicial Primer)
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
          <div className="space-y-2">
            <h5 className="font-bold text-slate-900 dark:text-white font-mono flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Cryptographic Integrity: Actual SHA-256 Hash Comparison
            </h5>
            <p>
              When a document or evidence artifact is presented in court, its integrity rests on mathematical proof.
              At ingest, a <strong>SHA-256 cryptographic hash</strong> is calculated. This 64-character hexadecimal code
              is a unique mathematical fingerprint of the exact bits comprising the file.
            </p>
            <p>
              Due to the cryptographic properties of SHA-256, changing even <em>a single character or byte</em> creates an
              unpredictable, complete alteration of the hash code (the avalanche effect).
              Comparing the <strong>Original Hash</strong> with the <strong>Current Hash</strong> yields an absolute result:
              either <strong className="text-emerald-600 dark:text-emerald-400">INTEGRITY VERIFIED</strong> (identical bit-exact match)
              or <strong className="text-rose-600 dark:text-rose-400">INTEGRITY MISMATCH</strong> (tampering detected).
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-slate-900 dark:text-white font-mono flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Prototype Ledger vs. Production Blockchain
            </h5>
            <p>
              A hash alone proves that data matches a recorded number, but what prevents someone from tampering with the record itself?
              That is where <strong>ledger anchoring</strong> enters.
            </p>
            <p>
              The original hash is anchored into a sequential, timestamped ledger sequence.
              In this prototype demonstration, CaseTrace utilizes a cryptographically linked block chain
              to simulate decentralized ledger persistence without incurring external cryptocurrency network dependencies.
              Furthermore, every access attempt is immutably audited with officer identity, role clearance, and exact timestamp.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Hash Inspector */}
      <HashInspector />

      {/* Ledger Block Explorer Timeline */}
      <LedgerTimeline />
    </div>
  );
}
