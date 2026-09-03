'use client';

import React, { useState } from 'react';
import { auditService } from '../../services/auditService';
import { Activity, Search, ShieldCheck, ShieldAlert, Filter } from 'lucide-react';
import { RiskBadge } from '../common/Badge';

export const AccessAuditLog: React.FC<{ filterCaseId?: string }> = ({ filterCaseId }) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  let logs = auditService.getLogs();

  if (filterCaseId) {
    logs = logs.filter((l) => l.caseId === filterCaseId);
  }

  if (roleFilter !== 'ALL') {
    logs = logs.filter((l) => l.role === roleFilter);
  }

  if (search) {
    const q = search.toLowerCase();
    logs = logs.filter(
      (l) =>
        l.userName.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        (l.caseId && l.caseId.toLowerCase().includes(q))
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-card transition-colors space-y-4">
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-3">
        <h3 className="text-sm font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Immutable Security Audit Stream & Access History ({logs.length})
        </h3>

        {/* Filters */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter audit logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-900 dark:text-slate-200"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-slate-200"
          >
            <option value="ALL">All Roles</option>
            <option value="Senior Officer">Senior Officer</option>
            <option value="Investigating Officer">Investigating Officer</option>
            <option value="Forensic Officer">Forensic Officer</option>
            <option value="Prosecutor">Prosecutor</option>
            <option value="Court User">Court User</option>
            <option value="Auditor / Security">Auditor / Security</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-4 py-2.5">Timestamp</th>
              <th className="px-4 py-2.5">User Persona</th>
              <th className="px-4 py-2.5">Action Event</th>
              <th className="px-4 py-2.5">Case / Doc</th>
              <th className="px-4 py-2.5">Result</th>
              <th className="px-4 py-2.5">Risk Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {logs.map((log) => (
              <tr key={log.eventId} className="hover:bg-slate-50 dark:hover:bg-slate-850/50">
                <td className="px-4 py-3 text-[11px] text-slate-500 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                  {log.userName}
                  <span className="block text-[10px] text-slate-500 font-normal">{log.role}</span>
                </td>
                <td className="px-4 py-3 font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">{log.action}</td>
                <td className="px-4 py-3 text-[11px] text-slate-500 whitespace-nowrap">
                  {log.caseId || 'GLOBAL'} {log.documentId ? `(${log.documentId})` : ''}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                      log.result === 'SUCCESS' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {log.result === 'SUCCESS' ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                    {log.result}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <RiskBadge level={log.riskLevel} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
