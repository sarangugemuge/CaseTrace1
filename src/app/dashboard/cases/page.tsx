'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { caseService } from '../../../services/caseService';
import { SensitivityBadge } from '../../../components/common/Badge';
import { FolderLock, Search, Filter, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CasesPage() {
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');

  let cases = caseService.getCasesForUser(currentUser);

  if (stageFilter !== 'ALL') {
    cases = cases.filter((c) => c.caseStage === stageFilter);
  }

  if (search) {
    const q = search.toLowerCase();
    cases = cases.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.caseNumber.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-card flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mb-1">
            <span>ROLE CLEARANCE:</span>
            <span className="text-emerald-700 dark:text-emerald-400 uppercase font-bold">{currentUser.role}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Digital Case Passport Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse and inspect active legal and investigation passports authorized for your security role.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search case # or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 focus:border-blue-500 focus:outline-hidden"
          >
            <option value="ALL">All Stages</option>
            <option value="FORENSIC_ANALYSIS">Forensic Analysis</option>
            <option value="EVIDENCE_COLLECTION">Evidence Collection</option>
            <option value="TRIALS_ONGOING">Trials Ongoing</option>
          </select>
        </div>
      </div>

      {/* Case Passports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases.map((c) => (
          <div
            key={c.caseId}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-card flex flex-col justify-between space-y-4 hover:border-slate-400 dark:hover:border-slate-700 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{c.caseNumber}</span>
                <SensitivityBadge sensitivity={c.classification as any} />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">{c.title}</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">{c.description}</p>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-mono">
              <div className="text-slate-500 dark:text-slate-400 flex justify-between">
                <span>LEAD:</span>
                <span className="text-slate-900 dark:text-slate-200 font-semibold">{c.leadInvestigator}</span>
              </div>
              <div className="text-slate-500 dark:text-slate-400 flex justify-between">
                <span>STAGE:</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">{c.caseStage}</span>
              </div>
              <div className="text-slate-500 dark:text-slate-400 flex justify-between">
                <span>DOCUMENTS:</span>
                <span className="text-slate-900 dark:text-white font-bold">{c.documentCount} Registered</span>
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
    </div>
  );
}
