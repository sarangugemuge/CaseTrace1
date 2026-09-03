'use client';

import React from 'react';
import { CasePassport } from '../../types/case';
import { SensitivityBadge } from '../common/Badge';
import {
  FileText,
  UserCheck,
  Shield,
  Calendar,
  Users,
  AlertCircle,
  Briefcase,
  Layers,
} from 'lucide-react';

export const OverviewTab: React.FC<{ caseData: CasePassport }> = ({ caseData }) => {
  return (
    <div className="space-y-6 font-sans text-slate-200">
      {/* Executive Case Summary Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            Executive Incident Briefing & Case Summary
          </h3>
          <span className="text-xs font-mono text-slate-400">PASSPORT ID: {caseData.caseId}</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-mono bg-navy-950 p-4 rounded-lg border border-slate-800">
          {caseData.description}
        </p>
      </div>

      {/* Grid of Key Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 mb-1">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            INCIDENT DATE
          </div>
          <div className="text-sm font-bold text-white font-mono">{caseData.incidentDate}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">LODGED: {new Date(caseData.createdAt).toLocaleDateString()}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 mb-1">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            INVESTIGATION STAGE
          </div>
          <div className="text-sm font-bold text-purple-400 font-mono">{caseData.caseStage}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">STATUS: {caseData.status}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 mb-1">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            CLASSIFICATION
          </div>
          <div className="mt-1">
            <SensitivityBadge sensitivity={caseData.classification as any} />
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">PRIORITY: {caseData.priority}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 mb-1">
            <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
            RECORDS COUNTS
          </div>
          <div className="text-sm font-bold text-emerald-400 font-mono">
            {caseData.documentCount} Documents • {caseData.evidenceCount} Evidence Items
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">DEPT: {caseData.department}</div>
        </div>
      </div>

      {/* Victims & Suspects Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
            <Users className="w-4 h-4 text-blue-400" />
            Identified Victims / Affected Entities ({caseData.victims.length})
          </h4>
          <ul className="space-y-2 text-xs font-mono text-slate-300">
            {caseData.victims.map((v, i) => (
              <li key={i} className="bg-navy-950 px-3 py-2 rounded border border-slate-800 flex items-center justify-between">
                <span>{v}</span>
                <span className="text-[10px] text-slate-500">PROTECTED STATUS</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            Primary Suspects / Entities of Interest ({caseData.suspects.length})
          </h4>
          <ul className="space-y-2 text-xs font-mono text-slate-300">
            {caseData.suspects.map((s, i) => (
              <li key={i} className="bg-navy-950 px-3 py-2 rounded border border-slate-800 flex items-center justify-between">
                <span className="text-rose-300 font-semibold">{s}</span>
                <span className="text-[10px] text-rose-400 bg-rose-950 border border-rose-900 px-1.5 py-0.5 rounded">
                  UNDER SUBPOENA
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
