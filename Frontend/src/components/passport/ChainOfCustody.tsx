'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../lib/apiClient';
import { AuditEntry } from '../../types/audit';
import { CasePassport } from '../../types/case';
import { Document } from '../../types/document';
import {
  Clock,
  ShieldCheck,
  UserCheck,
  FileText,
  Lock,
  ArrowDown,
  ArrowUp,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Hash,
  Database,
  Eye,
  Key,
  FolderLock,
  ShieldAlert,
  Inbox,
  Sparkles,
} from 'lucide-react';
import { EmptyState, LoadingState } from '../common/UXStates';

interface ChainOfCustodyProps {
  caseId: string;
  caseData?: CasePassport;
}

// 7-Stage Lifecycle Sequence Mapping
function mapActionToStage(action: string, purpose?: string): {
  stageNumber: number;
  stageName: string;
  badgeClass: string;
} {
  const act = (action || '').toUpperCase();
  const purp = (purpose || '').toUpperCase();

  if (act.includes('CASE_CREATED') || act.includes('EVIDENCE_REGISTERED') || act.includes('INITIAL')) {
    return {
      stageNumber: 1,
      stageName: 'Evidence Registered',
      badgeClass: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    };
  }
  if (act.includes('UPLOAD') || act.includes('ACQUIRED') || act.includes('VERSION_CREATED')) {
    return {
      stageNumber: 2,
      stageName: 'Uploaded / Acquired',
      badgeClass: 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    };
  }
  if (act.includes('TRANSFER') || act.includes('SHARE') || act.includes('ASSIGNMENT')) {
    return {
      stageNumber: 3,
      stageName: 'Transferred',
      badgeClass: 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    };
  }
  if (purp.includes('LEGAL_REVIEW') || purp.includes('COURT') || act.includes('REVIEW')) {
    return {
      stageNumber: 4,
      stageName: 'Reviewed',
      badgeClass: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    };
  }
  if (act.includes('VERIF') || act.includes('INTEGRITY') || act.includes('AUDIT_CHECK')) {
    return {
      stageNumber: 5,
      stageName: 'Verified',
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    };
  }
  if (act.includes('DOWNLOAD') || act.includes('VIEW') || act.includes('ACCESS')) {
    return {
      stageNumber: 6,
      stageName: 'Accessed',
      badgeClass: 'bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
    };
  }
  return {
    stageNumber: 7,
    stageName: 'Current Status',
    badgeClass: 'bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  };
}

export const ChainOfCustody: React.FC<ChainOfCustodyProps> = ({ caseId, caseData }) => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & sorting
  const [selectedDocFilter, setSelectedDocFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Default chronological ascending

  const loadCustodyData = useCallback(async () => {
    if (!caseId) return;
    setLoading(true);
    setError(null);

    try {
      const [auditData, docData] = await Promise.all([
        apiClient.getCaseAuditLogs(caseId),
        apiClient.getCaseDocuments(caseId).catch(() => []),
      ]);

      setLogs(auditData || []);
      setDocuments(docData || []);
    } catch (err: any) {
      console.error('Failed to load chain of custody records:', err);
      setError(err.message || 'Failed to load custody records from database.');
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    loadCustodyData();
  }, [loadCustodyData]);

  // Filter logs by document if requested
  const filteredLogs = logs.filter((l) => {
    if (selectedDocFilter === 'all') return true;
    return l.documentId === selectedDocFilter;
  });

  // Sort logs strictly by timestamp
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
  });

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* 7-Stage Chronological Lifecycle Sequence Header */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-5 shadow-xs transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-navy-800 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
              Complete Evidence Lifecycle Sequence
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2.5 py-0.5 rounded font-bold">
              CHRONOLOGICAL SEQUENCE
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-navy-950 text-slate-500 border border-slate-200 dark:border-navy-800 px-2 py-0.5 rounded font-bold flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              IMMUTABLE AUDIT TRAIL
            </span>
          </div>
        </div>

        {/* Horizontal Sequence Flow */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {[
            { num: 1, name: 'Evidence Registered', desc: 'Intake & Genesis', color: 'border-blue-500 text-blue-600' },
            { num: 2, name: 'Uploaded / Acquired', desc: 'SHA-256 Digest', color: 'border-purple-500 text-purple-600' },
            { num: 3, name: 'Transferred', desc: 'Custody Hand-off', color: 'border-indigo-500 text-indigo-600' },
            { num: 4, name: 'Reviewed', desc: 'Judicial Exam', color: 'border-amber-500 text-amber-600' },
            { num: 5, name: 'Verified', desc: 'Bit-Exact Match', color: 'border-emerald-500 text-emerald-600' },
            { num: 6, name: 'Accessed', desc: 'Monitored Purpose', color: 'border-cyan-500 text-cyan-600' },
            { num: 7, name: 'Current Status', desc: caseData?.status || 'ACTIVE', color: 'border-slate-500 text-slate-700 dark:text-slate-300' },
          ].map((s) => (
            <div
              key={s.num}
              className="bg-slate-50 dark:bg-navy-950 p-2.5 rounded-lg border border-slate-200 dark:border-navy-800 text-center"
            >
              <div className="w-5 h-5 mx-auto rounded-full bg-slate-200 dark:bg-navy-800 font-bold text-[10px] text-slate-700 dark:text-slate-300 flex items-center justify-center mb-1">
                {s.num}
              </div>
              <div className="font-bold text-slate-900 dark:text-white text-[10px] truncate">{s.name}</div>
              <div className="text-[9px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chain of Custody Timeline Card */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-6 shadow-card transition-colors space-y-5">
        {/* Controls Bar: Filters, Sort, Refresh */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-navy-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Forensic Chain of Custody & Audit Log ({caseId})
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
              Chain of Custody: Chronological record of who handled, viewed, or transferred this evidence. Populated from unalterable database audit entries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Artifact Filter */}
            {documents.length > 0 && (
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-lg px-2.5 py-1">
                <Filter className="w-3 h-3 text-slate-400" />
                <select
                  value={selectedDocFilter}
                  aria-label="Filter custody trail by evidence artifact"
                  onChange={(e) => setSelectedDocFilter(e.target.value)}
                  className="bg-transparent text-slate-900 dark:text-slate-200 text-xs focus:outline-hidden"
                >
                  <option value="all">All Case Events ({logs.length})</option>
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name.length > 25 ? `${d.name.slice(0, 22)}...` : d.name} ({d.id})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort Order Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              aria-label={sortOrder === 'asc' ? 'Switch to Newest First' : 'Switch to Oldest First (Chronological)'}
              className="flex items-center gap-1 bg-slate-100 dark:bg-navy-850 hover:bg-slate-200 dark:hover:bg-navy-800 border border-slate-200 dark:border-navy-800 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
              title={sortOrder === 'asc' ? 'Switch to Newest First' : 'Switch to Oldest First (Chronological)'}
            >
              {sortOrder === 'asc' ? (
                <>
                  <ArrowDown className="w-3.5 h-3.5 text-purple-500" />
                  <span>Oldest First (Intake $\rightarrow$ Latest)</span>
                </>
              ) : (
                <>
                  <ArrowUp className="w-3.5 h-3.5 text-purple-500" />
                  <span>Newest First (Latest $\rightarrow$ Intake)</span>
                </>
              )}
            </button>

            {/* Refresh Button */}
            <button
              onClick={loadCustodyData}
              disabled={loading}
              aria-label="Refresh custody records"
              className="p-1.5 bg-slate-100 dark:bg-navy-850 hover:bg-slate-200 dark:hover:bg-navy-800 border border-slate-200 dark:border-navy-800 rounded-lg text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-50"
              title="Refresh Custody Trail"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <LoadingState
            message="Loading chronological custody events..."
            description="Querying immutable audit logs and compiling the sequential chain of custody."
          />
        ) : error ? (
          /* Error State */
          <div className="p-5 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <div className="font-bold text-xs">Failed to load custody records</div>
              <div className="text-[11px] mt-0.5">{error}</div>
            </div>
          </div>
        ) : sortedLogs.length === 0 ? (
          /* Empty State (Never Fabricated) */
          <EmptyState
            title={selectedDocFilter !== 'all' ? 'No Events for Selected Artifact' : 'No Custody Events Recorded'}
            description={
              selectedDocFilter !== 'all'
                ? 'No custodial transactions or access attempts have been logged specifically for this artifact yet. Try viewing all case events.'
                : 'No custodial transactions or access attempts have been logged for this case passport yet. Events are appended automatically whenever artifacts are registered, reviewed, verified, or accessed.'
            }
            icon={<Clock className="w-6 h-6 text-slate-400" />}
            secondaryActionText={selectedDocFilter !== 'all' ? 'Show All Case Events' : undefined}
            onSecondaryAction={selectedDocFilter !== 'all' ? () => setSelectedDocFilter('all') : undefined}
          />
        ) : (
          /* Chronological Timeline Stream */
          <div className="relative border-l-2 border-purple-300 dark:border-purple-900/60 ml-4 pl-6 space-y-5 my-2">
            {sortedLogs.map((evt, idx) => {
              const stageInfo = mapActionToStage(evt.action, typeof evt.purpose === 'string' ? evt.purpose : undefined);
              const relatedDoc = documents.find((d) => d.id === evt.documentId);
              const isSuccess = evt.result === 'SUCCESS';
              const isBlocked = evt.result === 'DENIED' || evt.result === 'FLAGGED';

              return (
                <div key={evt.eventId || idx} className="relative group">
                  {/* Timeline Node Bullet */}
                  <span
                    className={`absolute -left-[33px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-navy-900 ring-4 transition-all ${
                      isBlocked
                        ? 'bg-rose-600 ring-rose-100 dark:ring-rose-950'
                        : stageInfo.stageNumber === 5
                        ? 'bg-emerald-600 ring-emerald-100 dark:ring-emerald-950'
                        : 'bg-purple-600 ring-purple-100 dark:ring-purple-950'
                    }`}
                  />

                  {/* Event Card */}
                  <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl p-4 space-y-3 group-hover:border-slate-300 dark:group-hover:border-navy-700 transition-colors">
                    {/* Top Row: Action, Stage Badge, Status & Timestamp */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 dark:border-navy-800/80 pb-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          {evt.action.replace(/_/g, ' ')}
                        </span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase border ${stageInfo.badgeClass}`}
                        >
                          Stage {stageInfo.stageNumber}: {stageInfo.stageName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase border ${
                            isSuccess
                              ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                              : isBlocked
                              ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                              : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                          }`}
                        >
                          {evt.result}
                        </span>

                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(evt.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Actor, Role & Purpose Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-[11px]">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 text-[10px] block">PERSON / ACTOR:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-blue-500" />
                          {evt.userName}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 dark:text-slate-500 text-[10px] block">OFFICIAL ROLE:</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-slate-200 dark:bg-navy-850 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-navy-700 inline-block mt-0.5">
                          {evt.role}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 dark:text-slate-500 text-[10px] block">PURPOSE / REASON:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {evt.purpose ? String(evt.purpose).replace(/_/g, ' ') : 'OFFICIAL_DUTY'}
                        </span>
                      </div>
                    </div>

                    {/* Description / Summary */}
                    {evt.description && (
                      <div className="text-[11px] text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-navy-900/70 p-2.5 rounded border border-slate-200/80 dark:border-navy-800/80">
                        {evt.description}
                      </div>
                    )}

                    {/* Cryptographic Hash / Artifact Anchor Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-navy-800/60">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {evt.documentId && (
                          <span className="bg-slate-200/70 dark:bg-navy-850 px-1.5 py-0.5 rounded font-mono text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-navy-700 shrink-0">
                            DOC ID: {evt.documentId}
                          </span>
                        )}
                        {relatedDoc?.sha256Hash ? (
                          <span className="truncate font-mono text-blue-600 dark:text-blue-400">
                            SHA-256: {relatedDoc.sha256Hash}
                          </span>
                        ) : (
                          <span className="truncate font-mono text-slate-400">
                            EVENT REF: {evt.eventId}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 font-mono text-slate-400 shrink-0">
                        <Lock className="w-3 h-3 text-emerald-500" />
                        <span>IMMUTABLE RECORD</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Read-Only Immutability Notice for Judicial Reference */}
      <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
        <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-slate-900 dark:text-white font-mono text-[11px] uppercase tracking-wider">
            Evidentiary Immutability Guarantee
          </div>
          <p className="text-[11px] leading-relaxed">
            All events recorded in this chain of custody are immutably preserved in the CaseTrace security audit database.
            No user, officer, or administrator can alter or delete historical custody entries from the interface.
            Each event is cryptographically anchored to guarantee strict non-repudiation in court proceedings.
          </p>
        </div>
      </div>
    </div>
  );
};
