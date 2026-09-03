'use client';

import React from 'react';
import { SensitivityLevel, IntegrityStatus } from '../../types/document';
import { RiskLevel } from '../../types/security';

interface SensitivityBadgeProps {
  sensitivity: SensitivityLevel;
}

export const SensitivityBadge: React.FC<SensitivityBadgeProps> = ({ sensitivity }) => {
  const styles: Record<SensitivityLevel, string> = {
    PUBLIC: 'bg-slate-800 text-slate-300 border-slate-700',
    INTERNAL: 'bg-blue-950 text-blue-300 border-blue-800',
    CONFIDENTIAL: 'bg-amber-950 text-amber-300 border-amber-800',
    TOP_SECRET: 'bg-rose-950 text-rose-300 border-rose-800 font-bold',
    FORENSIC: 'bg-purple-950 text-purple-300 border-purple-800 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono border uppercase tracking-wider ${
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
    VERIFIED: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
    TAMPER_SUSPECTED: 'bg-rose-950/80 text-rose-300 border-rose-800 animate-pulse',
    UNVERIFIED: 'bg-slate-800 text-slate-400 border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border tracking-wide ${
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
    LOW: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    MEDIUM: 'bg-amber-950 text-amber-300 border-amber-800',
    HIGH: 'bg-orange-950 text-orange-300 border-orange-800',
    CRITICAL: 'bg-rose-950 text-rose-300 border-rose-800 font-bold animate-pulse',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border uppercase ${
        styles[level]
      }`}
    >
      {level} RISK
    </span>
  );
};
