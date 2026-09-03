'use client';

import React from 'react';
import { riskEngine } from '../../services/riskEngine';
import { ShieldAlert, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { RiskBadge } from '../common/Badge';

export const RiskScoreCard: React.FC = () => {
  const alerts = riskEngine.getMockAlerts();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-card transition-colors space-y-5">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          Real-Time Security Posture & Anomaly Detection Scorecard
        </h3>
        <span className="text-[10px] font-mono bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800 px-2 py-0.5 rounded font-bold">
          HEURISTIC RISK ENGINE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <span className="text-slate-500 text-xs block">GLOBAL SECURITY POSTURE</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">LOW RISK (15/100)</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Normal activity across all roles</span>
        </div>

        <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <span className="text-slate-500 text-xs block">ACTIVE ALERTS</span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{alerts.length} Flagged Events</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Cross-agency access monitor</span>
        </div>

        <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <span className="text-slate-500 text-xs block">FAILED RBAC EVALUATIONS</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">0 Critical Denial Surges</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Zero unauthorized breaches</span>
        </div>
      </div>

      {/* Flagged Alerts List */}
      <div className="space-y-3 font-mono text-xs">
        <span className="block text-slate-600 dark:text-slate-400 font-bold uppercase">Recent Security Alerts ({alerts.length}):</span>
        {alerts.map((alt) => (
          <div key={alt.alertId} className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="font-bold text-slate-900 dark:text-white">{alt.alertId}</span>
                <span className="text-slate-500 text-[11px]">• User: {alt.userName} ({alt.role})</span>
              </div>
              <RiskBadge level={alt.riskLevel} />
            </div>

            <div className="text-slate-700 dark:text-slate-300">{alt.reason}</div>

            <div className="bg-slate-100 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>RECOMMENDED MITIGATION: {alt.recommendedAction}</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">SCORE: {alt.riskScore}/100</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
