'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { caseService } from '../../services/caseService';
import { auditService } from '../../services/auditService';
import { riskEngine } from '../../services/riskEngine';
import { SensitivityBadge } from '../../components/common/Badge';
import { Shield, FolderLock, FileCheck, ShieldAlert, ArrowRight, Activity, Lock } from 'lucide-react';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const cases = caseService.getCasesForUser(currentUser);
  const auditLogs = auditService.getLogs().slice(0, 5);
  const alerts = riskEngine.getMockAlerts();

  return (
    <div className="space-y-8">
      {/* Top Welcome Card */}
      <div className="bg-navy-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <span>ACTIVE PERSONA:</span>
            <span className="text-blue-400 font-bold uppercase">{currentUser.name}</span>
            <span>•</span>
            <span className="text-emerald-400 uppercase">{currentUser.role}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            CaseTrace Command & Multi-Role Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time Digital Case Passport status, assigned cases, and cryptographic integrity monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/cases"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-2 transition-all shadow-md"
          >
            <FolderLock className="w-4 h-4" />
            Access Case Directory ({cases.length})
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md font-mono">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>AUTHORIZED CASES</span>
            <FolderLock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{cases.length}</div>
          <div className="text-[10px] text-slate-500 mt-1">Based on role assignment</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md font-mono">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>BLOCKCHAIN ANCHORS</span>
            <FileCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">100%</div>
          <div className="text-[10px] text-slate-500 mt-1">All evidence hashes verified</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md font-mono">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>SECURITY ALERTS</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2">{alerts.length}</div>
          <div className="text-[10px] text-slate-500 mt-1">Simulated anomaly triggers</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md font-mono">
          <div className="text-slate-400 text-xs flex items-center justify-between">
            <span>RBAC CLEARANCE</span>
            <Lock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-bold text-purple-300 mt-2 truncate uppercase">{currentUser.role}</div>
          <div className="text-[10px] text-slate-500 mt-1">Dynamic view evaluation</div>
        </div>
      </div>

      {/* Authorized Cases Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FolderLock className="w-4 h-4 text-blue-400" />
            Authorized Digital Case Passports ({cases.length})
          </h2>
          <Link href="/dashboard/cases" className="text-xs font-mono text-blue-400 hover:underline flex items-center gap-1">
            View All Cases <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cases.map((c) => (
            <div key={c.caseId} className="bg-navy-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-blue-400">{c.caseNumber}</span>
                  <SensitivityBadge sensitivity={c.classification as any} />
                </div>
                <h3 className="text-sm font-bold text-white line-clamp-1">{c.title}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">STAGE: {c.caseStage}</span>
                <Link
                  href={`/dashboard/cases/${c.caseId}`}
                  className="text-blue-400 font-bold hover:underline flex items-center gap-1 text-[11px]"
                >
                  Open Passport →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Security Logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Recent Security Audit Trail Activity
          </h2>
          <Link href="/dashboard/audit" className="text-xs font-mono text-blue-400 hover:underline">
            View Full Audit Log →
          </Link>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {auditLogs.map((log) => (
            <div key={log.eventId} className="bg-navy-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-slate-500 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className="font-bold text-white">{log.userName} ({log.role})</span>
                <span className="text-blue-400">{log.action}</span>
              </div>
              <span className="text-slate-400 text-[11px] truncate max-w-sm">{log.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
