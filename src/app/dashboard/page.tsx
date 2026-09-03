'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { caseService } from '../../services/caseService';
import { auditService } from '../../services/auditService';
import { riskEngine } from '../../services/riskEngine';
import { SensitivityBadge } from '../../components/common/Badge';
import { FolderLock, FileCheck, ShieldAlert, ArrowRight, Activity, Lock, ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const cases = caseService.getCasesForUser(currentUser);
  const auditLogs = auditService.getLogs().slice(0, 5);
  const alerts = riskEngine.getMockAlerts();

  return (
    <div className="space-y-6">
      {/* Command & Control Header */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-6 shadow-card flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mb-1">
            <span>ACTIVE PERSONA:</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold uppercase">{currentUser.name}</span>
            <span>•</span>
            <span className="text-emerald-700 dark:text-emerald-400 uppercase font-bold">{currentUser.role}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            CaseTrace Multi-Role Command Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl font-sans">
            Real-time Digital Case Passport status, role-based case assignments, and cryptographic verification metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/cases"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-2 transition-all shadow-md"
          >
            <FolderLock className="w-4 h-4" />
            Access Case Directory ({cases.length})
          </Link>
        </div>
      </div>

      {/* Enterprise KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-subtle font-mono transition-colors">
          <div className="text-slate-500 dark:text-slate-400 text-xs flex items-center justify-between font-bold uppercase">
            <span>AUTHORIZED CASES</span>
            <div className="w-8 h-8 rounded bg-blue-50 dark:bg-navy-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FolderLock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{cases.length}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Role-cleared passports</div>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-subtle font-mono transition-colors">
          <div className="text-slate-500 dark:text-slate-400 text-xs flex items-center justify-between font-bold uppercase">
            <span>BLOCKCHAIN ANCHORS</span>
            <div className="w-8 h-8 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">100%</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Hashes bit-exact matched</div>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-subtle font-mono transition-colors">
          <div className="text-slate-500 dark:text-slate-400 text-xs flex items-center justify-between font-bold uppercase">
            <span>SECURITY ALERTS</span>
            <div className="w-8 h-8 rounded bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">{alerts.length}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Cross-agency access flags</div>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-subtle font-mono transition-colors">
          <div className="text-slate-500 dark:text-slate-400 text-xs flex items-center justify-between font-bold uppercase">
            <span>RBAC CLEARANCE</span>
            <div className="w-8 h-8 rounded bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-extrabold text-purple-700 dark:text-purple-300 mt-2 truncate uppercase">{currentUser.role}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Dynamic view active</div>
        </div>
      </div>

      {/* Authorized Cases Preview Grid */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-6 shadow-card space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-3">
          <h2 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <FolderLock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Authorized Digital Case Passports ({cases.length})
          </h2>
          <Link href="/dashboard/cases" className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            View All Passports <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cases.map((c) => (
            <div key={c.caseId} className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{c.caseNumber}</span>
                  <SensitivityBadge sensitivity={c.classification as any} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{c.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{c.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-navy-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 dark:text-slate-400">STAGE: <strong className="text-slate-900 dark:text-slate-200">{c.caseStage}</strong></span>
                <Link
                  href={`/dashboard/cases/${c.caseId}`}
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 text-xs"
                >
                  Open Passport →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Audit Trail Activity */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-6 shadow-card space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-3">
          <h2 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Recent Security Audit Trail Activity
          </h2>
          <Link href="/dashboard/audit" className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline">
            View Full Audit Stream →
          </Link>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {auditLogs.map((log) => (
            <div key={log.eventId} className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-slate-500 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className="font-bold text-slate-900 dark:text-white">{log.userName} ({log.role})</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">{log.action}</span>
              </div>
              <span className="text-slate-600 dark:text-slate-400 text-[11px] truncate max-w-sm">{log.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
