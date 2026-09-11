'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { apiClient } from '../../../lib/apiClient';
import { caseService } from '../../../services/caseService';
import { accessControlEngine } from '../../../services/accessControlEngine';
import { getRoleLabel } from '../../../lib/roles';
import { CasePassport } from '../../../types/case';
import { SensitivityBadge } from '../../../components/common/Badge';
import { CreateCaseModal } from '../../../components/passport/CreateCaseModal';
import {
  BackendUnavailableBanner,
  EmptyState,
  LoadingState,
  SuccessBanner,
} from '../../../components/common/UXStates';
import {
  FolderLock,
  Search,
  ArrowRight,
  Plus,
  Lock,
  CheckCircle2,
} from 'lucide-react';

export default function CasesPage() {
  const { currentUser } = useAuth();
  const [cases, setCases] = useState<CasePassport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [justCreatedMessage, setJustCreatedMessage] = useState<string | null>(null);
  const [isLive, setIsLive] = useState<boolean>(true);

  const loadCases = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const conn = await apiClient.checkBackendConnection();
      setIsLive(conn.isOnline);
      const fetched = await apiClient.getCases(currentUser);
      setCases(fetched);
    } catch (err) {
      console.warn('Falling back to local case service:', err);
      setIsLive(false);
      setCases(caseService.getCasesForUser(currentUser));
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  if (!currentUser) return null;

  const canCreate = accessControlEngine.canCreateCase(currentUser);

  const handleCaseCreated = (newCase: CasePassport) => {
    setCases((prev) => [newCase, ...prev.filter((c) => c.caseId !== newCase.caseId)]);
    setJustCreatedMessage(`Passport for ${newCase.caseNumber} initialized successfully.`);
    setTimeout(() => {
      setJustCreatedMessage(null);
    }, 6000);
  };

  let displayedCases = cases;

  if (stageFilter !== 'ALL') {
    displayedCases = displayedCases.filter((c) => c.caseStage === stageFilter);
  }

  if (search) {
    const q = search.toLowerCase();
    displayedCases = displayedCases.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.caseNumber.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.leadInvestigator.toLowerCase().includes(q)
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl p-6 shadow-card flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mb-1">
            <span>ROLE CLEARANCE:</span>
            <span className="text-emerald-700 dark:text-emerald-400 uppercase font-bold">
              {getRoleLabel(currentUser.role)}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Digital Case Passport Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse, initialize, and inspect active legal and investigation passports authorized for your clearance.
          </p>
        </div>

        {/* Action & Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              aria-label="Search case number, title, synopsis, or lead investigator"
              placeholder="Search case # or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <select
            value={stageFilter}
            aria-label="Filter cases by investigation stage"
            onChange={(e) => setStageFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:border-blue-500 focus:outline-hidden"
          >
            <option value="ALL">All Stages</option>
            <option value="FIR_LODGED">FIR Lodged</option>
            <option value="EVIDENCE_COLLECTION">Evidence Collection</option>
            <option value="FORENSIC_ANALYSIS">Forensic Analysis</option>
            <option value="CHARGE_SHEET_PREPARED">Charge Sheet Prepared</option>
            <option value="TRIALS_ONGOING">Trials Ongoing</option>
            <option value="VERDICT_RENDERED">Verdict Rendered</option>
          </select>

          {/* Entry Point for Case Creation */}
          {canCreate ? (
            <button
              onClick={() => setCreateModalOpen(true)}
              aria-label="Add New Incident"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-2 transition-all shadow-md shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Incident</span>
            </button>
          ) : (
            <div
              title="Authorization required to create new incident reports"
              className="px-3 py-1.5 bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400 rounded-lg flex items-center gap-1.5 text-[11px] font-mono cursor-not-allowed border border-slate-200 dark:border-navy-700"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Creation: Restricted</span>
            </div>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {justCreatedMessage && (
        <SuccessBanner
          title="Case Passport Initialized"
          message={justCreatedMessage}
          onDismiss={() => setJustCreatedMessage(null)}
        />
      )}

      {/* Case Passports Grid */}
      {loading && cases.length === 0 ? (
        <LoadingState
          message="Loading digital case passports..."
          description="Accessing case registry and checking role clearance (RBAC: Access is controlled according to the user's role)."
        />
      ) : displayedCases.length === 0 ? (
        <EmptyState
          title={search || stageFilter !== 'ALL' ? 'No Matching Cases Found' : 'No Case Passports Assigned'}
          description={
            search || stageFilter !== 'ALL'
              ? `No case passports matched your query "${search || 'All keywords'}" at stage "${stageFilter}". Try adjusting keywords or resetting your search filter.`
              : `No digital case passports are currently assigned to role ${currentUser.role}. Access is controlled according to the user's role (RBAC). In Demo Mode, you can switch personas via the top navbar.`
          }
          icon={<FolderLock className="w-6 h-6" />}
          actionText={canCreate && !search ? 'New Case Passport' : undefined}
          onAction={canCreate && !search ? () => setCreateModalOpen(true) : undefined}
          secondaryActionText={search || stageFilter !== 'ALL' ? 'Reset All Filters' : undefined}
          onSecondaryAction={
            search || stageFilter !== 'ALL'
              ? () => {
                  setSearch('');
                  setStageFilter('ALL');
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedCases.map((c) => (
            <div
              key={c.caseId}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-card flex flex-col justify-between space-y-4 hover:border-slate-400 dark:hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    {c.caseNumber}
                  </span>
                  <SensitivityBadge sensitivity={c.classification as any} />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                  {c.title}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {c.description}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-mono">
                <div className="text-slate-500 dark:text-slate-400 flex justify-between">
                  <span>LEAD:</span>
                  <span className="text-slate-900 dark:text-slate-200 font-semibold truncate max-w-[180px] text-right">
                    {c.leadInvestigator}
                  </span>
                </div>
                <div className="text-slate-500 dark:text-slate-400 flex justify-between">
                  <span>STAGE:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{c.caseStage}</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400 flex justify-between">
                  <span>DOCUMENTS:</span>
                  <span className="text-slate-900 dark:text-white font-bold">
                    {c.documentCount ?? 0} Registered
                  </span>
                </div>

                <Link
                  href={`/dashboard/cases/${c.caseId}`}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-md mt-2"
                >
                  Inspect Passport View
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog for New Case Passport */}
      <CreateCaseModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCaseCreated={handleCaseCreated}
      />
    </div>
  );
}
