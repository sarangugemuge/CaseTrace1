'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/apiClient';
import { caseService } from '../../services/caseService';
import { auditService } from '../../services/auditService';
import { riskEngine } from '../../services/riskEngine';
import { CasePassport } from '../../types/case';
import { DashboardStats } from '../../types/security';
import { SensitivityBadge } from '../../components/common/Badge';
import {
  BackendUnavailableBanner,
  EmptyState,
  LoadingState,
} from '../../components/common/UXStates';
import {
  FolderLock,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  Activity,
  Lock,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Shield,
} from 'lucide-react';
import { ROLE_PERMISSIONS } from '../../types/rolePermissions';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [cases, setCases] = useState<CasePassport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const [fetchedStats, fetchedCases] = await Promise.all([
        apiClient.getDashboardStats(currentUser),
        apiClient.getCases(currentUser),
      ]);
      setStats(fetchedStats);
      setCases(fetchedCases);
      setIsLive(true);
    } catch (err: any) {
      console.warn('Dashboard loading error, falling back to local service cache:', err);
      try {
        const fallbackCases = caseService.getCasesForUser(currentUser);
        setCases(fallbackCases);
        setIsLive(false);
      } catch (fallbackErr) {
        setError('Failed to load dashboard telemetry.');
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!currentUser) return null;

  // Fallback calculations if stats not yet loaded
  const displayCasesCount = stats?.totalAuthorizedCases ?? cases.length;
  const displayAlertsCount = stats?.integrityAlerts ?? riskEngine.getMockAlerts().length;
  const displayAnchorsText = stats && stats.pendingVerification > 0 ? `${stats.pendingVerification} PENDING` : '100%';
  const displayAnchorsSub = stats && stats.pendingVerification > 0 ? 'Pending ledger anchor' : 'Hashes bit-exact matched';

  // Activity list: prefer stats.recentActivity, fallback to auditService
  const activities = stats?.recentActivity && stats.recentActivity.length > 0
    ? stats.recentActivity.slice(0, 6)
    : auditService.getLogs().slice(0, 5).map((log) => ({
        eventId: log.eventId,
        timestamp: log.timestamp,
        action: log.action,
        caseId: log.caseId,
        caseNumber: log.caseId ? cases.find((c) => c.caseId === log.caseId)?.caseNumber : undefined,
        documentId: log.documentId,
        userName: log.userName,
        role: log.role,
        result: log.result,
        riskLevel: log.riskLevel,
        description: log.description,
      }));

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
            <span>•</span>
            <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold ${isLive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              {isLive ? 'LIVE TELEMETRY' : 'OFFLINE CACHE'}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            CaseTrace Multi-Role Command Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl font-sans">
            Real-time Digital Case Passport status, role-based case assignments, and cryptographic verification metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            aria-label="Refresh dashboard telemetry"
            title="Refresh dashboard telemetry"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-600 dark:text-slate-300 rounded-lg transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/dashboard/cases"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-2 transition-all shadow-md"
          >
            <FolderLock className="w-4 h-4" />
            Access Case Directory ({displayCasesCount})
          </Link>
        </div>
      </div>

      {/* Backend Availability Banner when operating in fallback mode */}
      {!isLive && (
        <BackendUnavailableBanner onRetry={loadData} isRetrying={loading} />
      )}

      {/* Current Demo Role & Authoritative Permission Matrix */}
      {ROLE_PERMISSIONS[currentUser.role] && (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-card space-y-4 transition-colors">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 dark:border-navy-800 pb-3.5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 rounded">
                  <Shield className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  DEMO MODE • PERSONA SIMULATION
                </span>
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500">SIH 2026 EVALUATION CONTEXT</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Current Demo Role:</span>
                <span className="text-blue-600 dark:text-blue-400">{ROLE_PERMISSIONS[currentUser.role].role}</span>
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-mono">
                  ({ROLE_PERMISSIONS[currentUser.role].personaName})
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                {ROLE_PERMISSIONS[currentUser.role].description}
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-1.5">
              <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border ${ROLE_PERMISSIONS[currentUser.role].badgeColor}`}>
                {ROLE_PERMISSIONS[currentUser.role].clearanceLevel}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                DEPT: {ROLE_PERMISSIONS[currentUser.role].department}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* CAN Column */}
            <div className="bg-emerald-50/40 dark:bg-navy-950 border border-emerald-200 dark:border-emerald-900/60 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 font-mono font-bold text-emerald-800 dark:text-emerald-400 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Can:</span>
              </div>
              <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 font-sans text-xs">
                {ROLE_PERMISSIONS[currentUser.role].can.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CANNOT Column */}
            <div className="bg-rose-50/40 dark:bg-navy-950 border border-rose-200 dark:border-rose-900/60 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 font-mono font-bold text-rose-800 dark:text-rose-400 text-xs">
                <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Cannot:</span>
              </div>
              <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 font-sans text-xs">
                {ROLE_PERMISSIONS[currentUser.role].cannot.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-600 dark:text-rose-400 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Authoritative Security Footnote */}
          <div className="pt-2 border-t border-slate-100 dark:border-navy-850 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>
                Backend Security: Authorization is evaluated authoritatively per request by FastAPI RBAC services. The client UI is not the source of truth.
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hidden sm:inline">
              FASTAPI 403 ENFORCED
            </span>
          </div>
        </div>
      )}

      {/* Error Notice if any */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl p-4 flex items-center justify-between gap-3 text-rose-700 dark:text-rose-400 text-xs font-mono">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1 bg-rose-600 text-white rounded text-[11px] font-bold hover:bg-rose-500 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Enterprise KPI Row */}
      {loading && !stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-subtle animate-pulse h-28"
            >
              <div className="h-3 w-28 bg-slate-200 dark:bg-navy-800 rounded mb-4" />
              <div className="h-7 w-16 bg-slate-200 dark:bg-navy-800 rounded mb-2" />
              <div className="h-2.5 w-32 bg-slate-200 dark:bg-navy-800 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-subtle font-mono transition-colors">
            <div className="text-slate-500 dark:text-slate-400 text-xs flex items-center justify-between font-bold uppercase">
              <span>AUTHORIZED CASES</span>
              <div className="w-8 h-8 rounded bg-blue-50 dark:bg-navy-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <FolderLock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{displayCasesCount}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Role-cleared passports</div>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-subtle font-mono transition-colors">
            <div className="text-slate-500 dark:text-slate-400 text-xs flex items-center justify-between font-bold uppercase">
              <span>BLOCKCHAIN ANCHORS</span>
              <div className="w-8 h-8 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <FileCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{displayAnchorsText}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{displayAnchorsSub}</div>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-subtle font-mono transition-colors">
            <div className="text-slate-500 dark:text-slate-400 text-xs flex items-center justify-between font-bold uppercase">
              <span>SECURITY ALERTS</span>
              <div className="w-8 h-8 rounded bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">{displayAlertsCount}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Cross-agency access flags</div>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-subtle font-mono transition-colors">
            <div className="text-slate-500 dark:text-slate-400 text-xs flex items-center justify-between font-bold uppercase">
              <span title="Role-Based Access Control: Access is controlled according to the user's role.">RBAC CLEARANCE</span>
              <div className="w-8 h-8 rounded bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-sm font-extrabold text-purple-700 dark:text-purple-300 mt-2 truncate uppercase">{currentUser.role}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-sans">Access controlled by user role</div>
          </div>
        </div>
      )}

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

        {loading && cases.length === 0 ? (
          <LoadingState
            message="Loading authorized case passports..."
            description="Retrieving digital case passports and verifying cryptographic Genesis Anchors for your role clearance."
          />
        ) : cases.length === 0 ? (
          <EmptyState
            title="No Case Passports Assigned"
            description={`No digital case passports are currently assigned or cleared for role: ${currentUser.role}. In this SIH evaluation demo, you can switch personas in the top navigation bar to inspect other cases.`}
            actionText="View Case Directory"
            actionHref="/dashboard/cases"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {cases.slice(0, 3).map((c) => (
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
        )}
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

        {activities.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800">
            No recent activity recorded for this clearance level.
          </div>
        ) : (
          <div className="space-y-2 font-mono text-xs">
            {activities.map((log) => {
              const isHighRisk = log.result === 'DENIED' || log.riskLevel === 'HIGH' || log.riskLevel === 'CRITICAL';
              const isVerification = log.action.includes('VERIF') || log.action.includes('ANCHOR');
              const actionClass = isHighRisk
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                : isVerification
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border border-blue-200 dark:border-blue-900';

              return (
                <div
                  key={log.eventId}
                  className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-[10px]">
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'RECENT'}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {log.userName || 'System'} ({log.role || 'Service'})
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${actionClass}`}>
                      {log.action}
                    </span>
                    {log.caseId && (
                      <Link
                        href={`/dashboard/cases/${log.caseId}`}
                        className="text-blue-600 dark:text-blue-400 font-bold hover:underline text-[11px]"
                      >
                        {log.caseNumber || log.caseId}
                      </Link>
                    )}
                  </div>
                  <span className="text-slate-600 dark:text-slate-400 text-[11px] truncate max-w-md">
                    {log.description}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
