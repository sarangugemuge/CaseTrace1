'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../lib/apiClient';
import { AuditSummary } from '../../types/audit';
import { NotificationItem } from '../../types/notification';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Activity,
  XCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { RiskBadge } from '../common/Badge';
import Link from 'next/link';

export const RiskScoreCard: React.FC = () => {
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [alerts, setAlerts] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sum, notifs] = await Promise.all([
        apiClient.getAuditSummary(),
        apiClient.getNotifications(),
      ]);
      setSummary(sum);
      // Filter critical and warning alerts
      const securityAlerts = notifs.filter(
        (n) => n.severity === 'CRITICAL' || n.severity === 'WARNING'
      );
      setAlerts(securityAlerts);
    } catch (e) {
      console.warn('Failed to fetch audit summary from API, using fallback:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-card transition-colors space-y-5">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Concise Audit Summary & Anomaly Scorecard
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Real-time telemetry aggregated directly from authoritative audit records. Access is controlled according to the user's role.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            aria-label="Refresh audit metrics"
            title="Refresh audit metrics"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-navy-850 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <span className="text-[10px] font-mono bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-400 border border-blue-300 dark:border-blue-800 px-2 py-0.5 rounded font-bold">
            REAL DATABASE METRICS
          </span>
        </div>
      </div>

      {/* 5 Concise Real-Data Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono text-xs">
        {/* Total Events */}
        <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">Total Recent Events</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
            {summary ? summary.totalRecentEvents : '...'}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Tracked audit stream</span>
        </div>

        {/* Successful Accesses */}
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-emerald-800 dark:text-emerald-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Successful Accesses
          </span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">
            {summary ? summary.successfulAccesses : '...'}
          </div>
          <span className="text-[10px] text-emerald-700/80 dark:text-emerald-500 mt-1 block font-sans">Access allowed by role</span>
        </div>

        {/* Denied Attempts */}
        <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-rose-800 dark:text-rose-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-600" />
            Denied Attempts
          </span>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1.5">
            {summary ? summary.deniedAttempts : '...'}
          </div>
          <span className="text-[10px] text-rose-700/80 dark:text-rose-500 mt-1 block font-sans">Blocked: role restricted</span>
        </div>

        {/* Evidence Verifications */}
        <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-blue-800 dark:text-blue-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
            <FileCheck className="w-3 h-3 text-blue-600" />
            Evidence Verifications
          </span>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1.5">
            {summary ? summary.evidenceVerificationEvents : '...'}
          </div>
          <span className="text-[10px] text-blue-700/80 dark:text-blue-500 mt-1 block font-sans">SHA-256 hash checks</span>
        </div>

        {/* High-Risk Events */}
        <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3.5 flex flex-col justify-between col-span-2 md:col-span-1">
          <span className="text-amber-800 dark:text-amber-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            High-Risk Events
          </span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1.5">
            {summary ? summary.highRiskEvents : '...'}
          </div>
          <span className="text-[10px] text-amber-700/80 dark:text-amber-500 mt-1 block font-sans">Flagged security alerts</span>
        </div>
      </div>

      {/* Flagged Alerts List from real events */}
      <div className="space-y-3 font-mono text-xs pt-1">
        <div className="flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Active Security Incidents & Alerts ({alerts.length}):
          </span>
          <span className="text-[10px] text-slate-400">ROLE-SCOPED OVERSIGHT</span>
        </div>

        {alerts.length === 0 ? (
          <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 text-center text-slate-500 font-sans text-xs">
            No active security incidents or high-risk flags in your authorized scope.
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((alt) => (
              <div
                key={alt.id}
                className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 space-y-1.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="font-bold text-slate-900 dark:text-white">{alt.title}</span>
                    <span className="text-slate-500 text-[11px] font-sans">• {alt.caseNumber || alt.caseId}</span>
                  </div>
                  <RiskBadge level={alt.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH'} />
                </div>

                <div className="text-slate-700 dark:text-slate-300 font-sans text-xs">{alt.message}</div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-slate-400">{new Date(alt.timestamp).toLocaleString()}</span>
                  <Link
                    href={alt.targetUrl}
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>Investigate Incident</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

