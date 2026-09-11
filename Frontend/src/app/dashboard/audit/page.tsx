'use client';

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getRoleLabel } from '../../../lib/roles';
import { AccessAuditLog } from '../../../components/security/AccessAuditLog';
import { RiskScoreCard } from '../../../components/security/RiskScoreCard';
import { ShieldAlert, Activity } from 'lucide-react';

export default function AuditPage() {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-card flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mb-1">
            <span>OVERSIGHT & AUDIT STREAM:</span>
            <span className="text-purple-700 dark:text-purple-400 font-bold uppercase">
              {getRoleLabel(currentUser.role, 'bilingual')} CLEARANCE
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Security Audit Trail & Risk Operations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
            Immutable Audit Trail: Tamper-evident activity log that cannot be modified or deleted once recorded. Access is controlled according to the user's role (RBAC).
          </p>
        </div>
      </div>

      <RiskScoreCard />
      <AccessAuditLog />
    </div>
  );
}
