'use client';

import React from 'react';
import { auditService } from '../../services/auditService';
import { Clock, ShieldCheck, ShieldAlert, FileText, User } from 'lucide-react';
import { RiskBadge } from '../common/Badge';

export const TimelineTab: React.FC<{ caseId: string }> = ({ caseId }) => {
  const allLogs = auditService.getLogs();
  const caseLogs = allLogs.filter((l) => !l.caseId || l.caseId === caseId);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          Chronological Audit & Chain of Activity Timeline ({caseId})
        </h3>
        <span className="text-[11px] text-emerald-400 font-mono">LIVE IMMUTABLE EVENT STREAM</span>
      </div>

      <div className="relative border-l border-blue-900/60 ml-4 space-y-6">
        {caseLogs.map((log, idx) => (
          <div key={log.eventId || idx} className="ml-6 relative">
            <span
              className={`absolute -left-[31px] top-1 w-3 h-3 rounded-full border-2 border-slate-900 ring-4 ${
                log.result === 'SUCCESS'
                  ? 'bg-emerald-500 ring-emerald-950'
                  : log.result === 'DENIED'
                  ? 'bg-rose-500 ring-rose-950'
                  : 'bg-amber-500 ring-amber-950'
              }`}
            />

            <div className="bg-navy-950 border border-slate-800 rounded-lg p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-slate-400 border-b border-slate-850 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{log.userName}</span>
                  <span className="text-blue-400">({log.role})</span>
                  <span className="text-slate-500 font-mono text-[10px]">• {new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <RiskBadge level={log.riskLevel} />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-slate-200">
                  <span className="text-blue-400 font-bold uppercase">{log.action}:</span>{' '}
                  {log.description}
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                    log.result === 'SUCCESS'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                >
                  {log.result}
                </span>
              </div>

              {log.purpose && (
                <div className="text-[11px] text-amber-300/90 bg-amber-950/30 p-2 rounded border border-amber-900/40">
                  <span className="text-amber-400 font-bold">DECLARED PURPOSE:</span> {log.purpose}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
