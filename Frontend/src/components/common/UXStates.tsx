'use client';

import React from 'react';
import Link from 'next/link';
import { getRoleLabel } from '../../lib/roles';
import {
  Loader2,
  FolderLock,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  WifiOff,
  UserCheck,
} from 'lucide-react';

/**
 * Standardized Loading State with meaningful descriptive messaging and accessible status announcements.
 */
export interface LoadingStateProps {
  message?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  description,
  size = 'md',
  className = '',
}) => {
  const spinnerSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`p-8 text-center flex flex-col items-center justify-center gap-3 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl shadow-subtle ${className}`}
    >
      <Loader2 className={`${spinnerSizes[size]} text-blue-600 dark:text-blue-400 animate-spin`} />
      <div>
        <div className="font-mono text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          {message}
        </div>
        {description && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-1 max-w-sm mx-auto">
            {description}
          </p>
        )}
      </div>
      <span className="sr-only">{message}</span>
    </div>
  );
};

/**
 * Empty State: Explains why no records are present and provides clear next action steps.
 */
export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Records Found',
  description = 'No matching items were found within your current scope.',
  icon,
  actionText,
  actionHref,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-10 text-center space-y-3 font-mono shadow-subtle ${className}`}
    >
      <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-navy-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
        {icon || <FolderLock className="w-6 h-6" />}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto font-sans leading-relaxed">
          {description}
        </p>
      </div>

      {(actionText || secondaryActionText) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          {actionText && (
            actionHref ? (
              <Link
                href={actionHref}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>{actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={onAction}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>{actionText}</span>
              </button>
            )
          )}
          {secondaryActionText && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="px-3.5 py-2 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg border border-slate-300 dark:border-navy-700 transition-all"
            >
              {secondaryActionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Permission Denied State: Authoritatively explains that the current role lacks clearance,
 * provides plain-language RBAC explanation, and offers clear navigation.
 */
export interface PermissionDeniedStateProps {
  role: string;
  reason?: string;
  policyId?: string;
  caseNumber?: string;
  onReturnHref?: string;
  onReturnText?: string;
}

export const PermissionDeniedState: React.FC<PermissionDeniedStateProps> = ({
  role,
  reason = 'Your current role does not have security clearance or an active assignment for this resource.',
  policyId = 'RBAC-04-CASE-CLEARANCE',
  caseNumber,
  onReturnHref = '/dashboard/cases',
  onReturnText = 'Return to Case Directory',
}) => {
  return (
    <div
      role="alert"
      className="p-8 font-mono bg-rose-50/60 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 rounded-xl space-y-5 shadow-card"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider uppercase text-rose-700 dark:text-rose-400">
            <span>CLEARANCE POLICY DENIED</span>
            <span>•</span>
            <span>POLICY: {policyId}</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Access Restricted for Role: {getRoleLabel(role as any, 'bilingual')}
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
            {reason}
          </p>
        </div>
      </div>

      {/* Human-Readable Educational Note */}
      <div className="bg-white/80 dark:bg-navy-950/80 border border-rose-200 dark:border-rose-900/60 rounded-lg p-3.5 text-xs font-sans text-slate-600 dark:text-slate-300 space-y-1.5">
        <div className="font-bold text-slate-900 dark:text-white font-mono text-[11px] flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-blue-500" />
          <span>Role-Based Access Control (RBAC): Statutory clearance enforced.</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Under statutory protocol, access to this case document or artifact requires appropriate judicial or investigative clearance. Please contact your System Administrator if you believe this restriction is in error.
        </p>
      </div>

      {/* Action Recovery Link */}
      <div className="pt-1 flex items-center gap-3">
        <Link
          href={onReturnHref}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold rounded-lg transition-all shadow-sm inline-flex items-center gap-2"
        >
          <span>{onReturnText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

/**
 * Backend Unavailable Banner: Gracefully alerts user when FastAPI server is offline,
 * clarifying that CaseTrace is seamlessly functioning in Offline Demonstration Mode.
 */
export interface BackendUnavailableBannerProps {
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const BackendUnavailableBanner: React.FC<BackendUnavailableBannerProps> = ({
  onRetry,
  isRetrying = false,
}) => {
  return (
    <div
      role="status"
      className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900/60 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono transition-colors shadow-xs"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
          <WifiOff className="w-4 h-4" />
        </div>
        <div>
          <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <span>OFFLINE DEMONSTRATION MODE ACTIVE</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-300 font-bold uppercase">
              LOCAL STORAGE
            </span>
          </div>
          <p className="text-[11px] text-amber-800/80 dark:text-amber-400/90 font-sans mt-0.5">
            The FastAPI backend server is offline or unreachable. CaseTrace is operating using client-side security policies and local case storage. All core features remain interactive.
          </p>
        </div>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Testing...' : 'Test Connection'}</span>
        </button>
      )}
    </div>
  );
};

/**
 * Success Confirmation Banner with checkmark icon and explicit details.
 */
export interface SuccessBannerProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export const SuccessBanner: React.FC<SuccessBannerProps> = ({
  title = 'Action Successful',
  message,
  onDismiss,
  className = '',
}) => {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 p-4 rounded-xl flex items-center justify-between gap-3 text-xs font-mono shadow-xs ${className}`}
    >
      <div className="flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <div>
          <span className="font-bold uppercase tracking-wider block text-[11px]">
            {title}
          </span>
          <span className="font-sans text-xs text-emerald-800 dark:text-emerald-300">
            {message}
          </span>
        </div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 text-xs font-bold"
        >
          Dismiss
        </button>
      )}
    </div>
  );
};
