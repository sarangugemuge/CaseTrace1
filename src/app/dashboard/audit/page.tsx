'use client';

import React, { useState } from 'react';
import { auditService } from '../../../services/auditService';
import { AccessAuditLog } from '../../../components/security/AccessAuditLog';
import { ShieldAlert, Trash2, Filter } from 'lucide-react';

export default function AuditPage() {
  const [logs, setLogs] = useState(auditService.getLogs());
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const filteredLogs = logs.filter((l) => {
    if (selectedFilter === 'ALL') return true;
    return l.result === selectedFilter || l.action === selectedFilter;
  });

  const handleClear = () => {
    auditService.clearLogs();
    setLogs(auditService.getLogs());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-navy-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <ShieldAlert className="w-4 h-4 text-blue-400" />
            <span>SECURITY & SYSTEM AUDIT TRAIL</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Append-Only Immutability Audit Event Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            All user actions, document views, access denials, and risk anomalies are recorded here.
          </p>
        </div>

        <button
          onClick={handleClear}
          className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Reset Prototype Local Logs
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex items-center justify-between font-mono text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400">FILTER BY RESULT:</span>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
          >
            <option value="ALL">ALL EVENTS</option>
            <option value="SUCCESS">SUCCESS GRANTED</option>
            <option value="DENIED">DENIED ATTEMPTS</option>
            <option value="FLAGGED">SECURITY ALERTS / FLAGGED</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <AccessAuditLog logs={filteredLogs} />
    </div>
  );
}
