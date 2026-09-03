'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { caseService } from '../../../services/caseService';
import { SensitivityBadge } from '../../../components/common/Badge';
import { FolderLock, Search, Filter, ArrowRight } from 'lucide-react';

export default function CasesDirectoryPage() {
  const { currentUser } = useAuth();
  const allCases = caseService.getCasesForUser(currentUser);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedClassification, setSelectedClassification] = useState('ALL');

  const filteredCases = allCases.filter((c) => {
    const matchesSearch =
      c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.leadInvestigator.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
    const matchesPriority = selectedPriority === 'ALL' || c.priority === selectedPriority;
    const matchesClassification = selectedClassification === 'ALL' || c.classification === selectedClassification;

    return matchesSearch && matchesStatus && matchesPriority && matchesClassification;
  });

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="bg-navy-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <FolderLock className="w-4 h-4 text-blue-400" />
            <span>DIGITAL CASE PASSPORT DIRECTORY</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight font-sans">
            Authorized Digital Case Directory
          </h1>
          <p className="text-slate-400 mt-1">
            Showing cases authorized for role clearance:{' '}
            <span className="text-emerald-400 font-bold uppercase">{currentUser.role}</span>
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search case #, title, investigator, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-hidden w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">STATUS:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="IN_COURT">IN_COURT</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">PRIORITY:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
            >
              <option value="ALL">ALL PRIORITIES</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">CLASSIFICATION:</span>
            <select
              value={selectedClassification}
              onChange={(e) => setSelectedClassification(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
            >
              <option value="ALL">ALL CLASSIFICATIONS</option>
              <option value="CONFIDENTIAL">CONFIDENTIAL</option>
              <option value="TOP_SECRET">TOP_SECRET</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-navy-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">Case ID & Title</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Status / Priority</th>
                <th className="px-6 py-3">Classification</th>
                <th className="px-6 py-3">Lead Investigator</th>
                <th className="px-6 py-3">Last Updated</th>
                <th className="px-6 py-3">Records</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredCases.map((c) => (
                <tr key={c.caseId} className="hover:bg-slate-850/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-blue-400">{c.caseNumber}</div>
                    <div className="font-semibold text-white font-sans mt-0.5">{c.title}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{c.department}</td>
                  <td className="px-6 py-4">
                    <span className="text-emerald-400 font-bold">{c.status}</span>
                    <div className="text-[10px] text-slate-500">{c.priority} PRIORITY</div>
                  </td>
                  <td className="px-6 py-4">
                    <SensitivityBadge sensitivity={c.classification as any} />
                  </td>
                  <td className="px-6 py-4 text-slate-300">{c.leadInvestigator}</td>
                  <td className="px-6 py-4 text-slate-400 text-[11px]">
                    {new Date(c.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-bold text-blue-300">
                    {c.documentCount} Docs • {c.evidenceCount} Evd
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/cases/${c.caseId}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/40 rounded font-semibold transition-all"
                    >
                      OPEN CASE PASSPORT <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
