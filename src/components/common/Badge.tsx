'use client';

import React from 'react';
import { SensitivityLevel, IntegrityStatus } from '../../types/document';
import { RiskLevel } from '../../types/security';

interface SensitivityBadgeProps {
  sensitivity: SensitivityLevel;
}

export const SensitivityBadge: React.FC<SensitivityBadgeProps> = ({ sensitivity }) => {
  const styles: Record<SensitivityLevel, string> = {
    PUBLIC: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    INTERNAL: 'bg-blue-50 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/80',
    CONFIDENTIAL: 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/80 font-medium',
    TOP_SECRET: 'bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/80 font-bold tracking-wide',
    FORENSIC: 'bg-purple-50 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/80 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-mono border uppercase tracking-wider ${
        styles[sensitivity] || styles.PUBLIC
      }`}
    >
      {sensitivity}
    </span>
  );
};

interface IntegrityBadgeProps {
  status: IntegrityStatus;
}

export const IntegrityBadge: React.FC<IntegrityBadgeProps> = ({ status }) => {
  const styles: Record<IntegrityStatus, string> = {
    VERIFIED: 'bg-emerald-50 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-medium',
    TAMPER_SUSPECTED: 'bg-rose-50 dark:bg-rose-950/90 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700 font-bold animate-pulse',
    UNVERIFIED: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono border tracking-wide ${
        styles[status]
      }`}
    >
      {status === 'VERIFIED' && '✓ ANCHORED & VERIFIED'}
      {status === 'TAMPER_SUSPECTED' && '⚠ HASH MISMATCH (TAMPERED)'}
      {status === 'UNVERIFIED' && 'UNCHECKED'}
    </span>
  );
};

interface RiskBadgeProps {
  level: RiskLevel;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  const styles: Record<RiskLevel, string> = {
    LOW: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    MEDIUM: 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    HIGH: 'bg-orange-50 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-800',
    CRITICAL: 'bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800 font-bold animate-pulse',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono border uppercase ${
        styles[level]
      }`}
    >
      {level} RISK
    </span>
  );
};
