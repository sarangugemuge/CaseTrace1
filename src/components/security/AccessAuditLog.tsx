'use client';

import React from 'react';
import { AuditEntry } from '../../types/audit';
import { ShieldCheck, ShieldAlert, FileText, User } from 'lucide-react';
import { RiskBadge } from '../common/Badge';

export const AccessAuditLog: React.FC<{ logs: AuditEntry[] }> = ({ logs }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          System Audit & Access Event Trail ({logs.length})
        </h3>
        <span className="text-[11px] font-mono text-emerald-400">APPEND-ONLY IMMUTABLE LOG</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-navy-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-6 py-3">Timestamp</th>
              <th className="px-6 py-3">User Persona</th>
              <th className="px-6 py-3">Action</th>
              <th className="px-6 py-3">Case ID</th>
              <th className="px-6 py-3">Result</th>
              <th className="px-6 py-3">Risk</th>
              <th className="px-6 py-3">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {logs.map((log) => (
              <tr key={log.eventId} className="hover:bg-slate-850/50 transition-colors">
                <td className="px-6 py-3 text-slate-400 text-[11px] whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </td>
                <td className="px-6 py-3">
                  <div className="font-semibold text-white">{log.userName}</div>
                  <div className="text-[10px] text-slate-400">{log.role}</div>
                </td>
                <td className="px-6 py-3 text-blue-400 font-bold">{log.action}</td>
                <td className="px-6 py-3 text-slate-400">{log.caseId || 'SYSTEM'}</td>
                <td className="px-6 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] ${
                      log.result === 'SUCCESS'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : log.result === 'DENIED'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {log.result}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <RiskBadge level={log.riskLevel} />
                </td>
                <td className="px-6 py-3 text-slate-300 text-[11px] max-w-xs truncate">
                  {log.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
