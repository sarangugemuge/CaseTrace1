'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldAlert, Clock } from 'lucide-react';

export type StatusType = 'SUCCESS' | 'WARNING' | 'DANGER' | 'INFO';

interface StatusIndicatorProps {
  status: StatusType;
  label: string;
  sublabel?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, label, sublabel }) => {
  const styles: Record<StatusType, { bg: string; border: string; text: string; icon: any }> = {
    SUCCESS: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/80',
      border: 'border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-800 dark:text-emerald-300',
      icon: CheckCircle2,
    },
    WARNING: {
      bg: 'bg-amber-50 dark:bg-amber-950/80',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-800 dark:text-amber-300',
      icon: AlertTriangle,
    },
    DANGER: {
      bg: 'bg-rose-50 dark:bg-rose-950/80',
      border: 'border-rose-200 dark:border-rose-800',
      text: 'text-rose-800 dark:text-rose-300',
      icon: ShieldAlert,
    },
    INFO: {
      bg: 'bg-blue-50 dark:bg-blue-950/80',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-300',
      icon: Clock,
    },
  };

  const current = styles[status];
  const Icon = current.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs font-mono font-medium ${current.bg} ${current.border} ${current.text}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <div>
        <span>{label}</span>
        {sublabel && <span className="opacity-75 block text-[10px]">{sublabel}</span>}
      </div>
    </div>
  );
};
