'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/apiClient';
import { caseService } from '../../services/caseService';
import { auditService } from '../../services/auditService';
import { riskEngine } from '../../services/riskEngine';
import { accessControlEngine } from '../../services/accessControlEngine';
import { getRoleLabel, getRoleHindiLabel } from '../../lib/roles';
import { CasePassport } from '../../types/case';
import { DashboardStats } from '../../types/security';
import { SensitivityBadge } from '../../components/common/Badge';
import { CreateCaseModal } from '../../components/passport/CreateCaseModal';
import {
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
  Shield,
  Plus,
  Clock,
} from 'lucide-react';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [cases, setCases] = useState<CasePassport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

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
    } catch (err: any) {
      try {
        const fallbackCases = caseService.getCasesForUser(currentUser);
        setCases(fallbackCases);
      } catch (fallbackErr) {
        setError('Failed to load dashboard data.');
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!currentUser) return null;

  const canCreate = accessControlEngine.canCreateCase(currentUser);
  const displayRole = getRoleLabel(currentUser.role);

  const displayCasesCount = stats?.totalAuthorizedCases ?? cases.length;
  const displayAlertsCount = stats?.integrityAlerts ?? 0;
  const displayAnchorsText = stats && stats.pendingVerification > 0 ? `${stats.pendingVerification} PENDING` : '100%';
  const displayAnchorsSub = stats && stats.pendingVerification > 0 ? 'Pending verification' : 'Digests verified bit-exact';

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

  const handleCaseCreated = (newCase: CasePassport) => {
    setCases((prev) => [newCase, ...prev.filter((c) => c.caseId !== newCase.caseId)]);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Command Header */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold text-slate-800 dark:text-slate-200">{currentUser.name}</span>
            <span>•</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold uppercase">{displayRole}</span>
            <span className="text-slate-500 dark:text-slate-400 font-sans">({getRoleHindiLabel(currentUser.role)})</span>
            <span>•</span>
            <span>{currentUser.department}</span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            CaseTrace Command Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl font-sans">
            Centralized case passports, evidentiary integrity verification, and access governance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadData}
            aria-label="Refresh dashboard data"
            title="Refresh dashboard data"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-600 dark:text-slate-300 rounded-lg transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {canCreate && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-2 transition-all shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Incident</span>
            </button>
          )}

          <Link
            href="/dashboard/cases"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 font-mono text-xs font-bold rounded-lg flex items-center gap-2 transition-all border border-slate-200 dark:border-slate-700"
          >
            <FolderLock className="w-4 h-4" />
            <span>Case Directory ({displayCasesCount})</span>
          </Link>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl p-4 flex items-center justify-between gap-3 text-rose-700 dark:text-rose-400 text-xs font-mono">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
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

      {/* Metric Cards Row */}
      {loading && !stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 animate-pulse h-28"
            >
              <div className="h-3 w-28 bg-slate-200 dark:bg-navy-800 rounded mb-4" />
              <div className="h-7 w-16 bg-slate-200 dark:bg-navy-800 rounded mb-2" />
              <div className="h-2.5 w-32 bg-slate-200 dark:bg-navy-800 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 font-mono shadow-xs transition-colors">
            <div className="text-slate-500 dark:text-slate-400 text-xs flex items-center justify-between font-bold uppercase">
              <span>AUTHORIZED CASES</span>
              <div className="w-8 h-8 rounded bg-blue-50 dark:bg-navy-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <FolderLock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{displayCasesCount}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Available under active clearance</div>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 font-mono shadow-xs transition-colors">
            <div className="text-slate-500 dark:text-slate-400 text-xs flex items-center justify-between font-bold uppercase">
              <span>INTEGRITY ANCHORS</span>
              <div className="w-8 h-8 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <FileCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{displayAnchorsText}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{displayAnchorsSub}</div>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 font-mono shadow-xs transition-colors">
            <div className="text-slate-500 dark:text-slate-400 text-xs flex items-center justify-between font-bold uppercase">
              <span>SECURITY ALERTS</span>
              <div className="w-8 h-8 rounded bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">{displayAlertsCount}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Security flags & access blocks</div>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 font-mono shadow-xs transition-colors">
            <div className="text-slate-500 dark:text-slate-400 text-xs flex items-center justify-between font-bold uppercase">
              <span>ROLE CLEARANCE</span>
              <div className="w-8 h-8 rounded bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xs font-bold text-purple-700 dark:text-purple-300 mt-2 truncate uppercase">{displayRole}</div>
            <div className="text-[11px] text-blue-600 dark:text-blue-400 font-sans mt-0.5 truncate font-medium">{getRoleHindiLabel(currentUser.role)}</div>
          </div>

        </div>
      )}

      {/* Authorized Cases Preview Grid */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-6 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-3">
          <h2 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <FolderLock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Active Digital Case Passports ({cases.length})
          </h2>
          <Link href="/dashboard/cases" className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            View All Passports <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading && cases.length === 0 ? (
          <LoadingState
            message="Loading authorized case passports..."
            description="Retrieving digital case passports and verifying integrity status for your role clearance."
          />
        ) : cases.length === 0 ? (
          <EmptyState
            title="No Case Passports Assigned"
            description={`No digital case passports are currently assigned or cleared for your account (${displayRole}).`}
            actionText={canCreate ? "Add New Incident" : "View Case Directory"}
            actionHref={canCreate ? undefined : "/dashboard/cases"}
            onAction={canCreate ? () => setCreateModalOpen(true) : undefined}
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

      {/* Recent Activity & Audit Events */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-6 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-3">
          <h2 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Recent Case & Custody Activity
          </h2>
          <Link href="/dashboard/audit" className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            View Audit Log <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-navy-800">
          {activities.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
              No recent activity recorded.
            </div>
          ) : (
            activities.map((act) => (
              <div key={act.eventId} className="py-3 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{act.action}</span>
                    {act.caseNumber && (
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">{act.caseNumber}</span>
                    )}
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      act.result === 'SUCCESS'
                        ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                    }`}>
                      {act.result}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs font-sans truncate">{act.description}</p>
                </div>
                <div className="text-right font-mono text-[10px] text-slate-400 shrink-0">
                  <div>{act.userName}</div>
                  <div>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal for Add New Incident */}
      {canCreate && (
        <CreateCaseModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCaseCreated={handleCaseCreated}
        />
      )}
    </div>
  );
}
