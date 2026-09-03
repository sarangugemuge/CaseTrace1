'use client';

import React from 'react';
import { Document } from '../../types/document';
import { SensitivityBadge, IntegrityBadge } from '../common/Badge';
import { FileText, Eye, ShieldAlert, Lock, Download, Share2, FileCheck } from 'lucide-react';
import { accessControlEngine } from '../../services/accessControlEngine';
import { User } from '../../types/auth';
import { CasePassport } from '../../types/case';

interface DocumentTableProps {
  documents: Document[];
  user: User;
  caseData: CasePassport;
  onSelectDocument: (doc: Document) => void;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  user,
  caseData,
  onSelectDocument,
}) => {
  return (
    <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl overflow-hidden shadow-card transition-colors">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-navy-800 flex items-center justify-between">
        <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Case Document Passport Registry ({documents.length})
        </h3>
        <span className="text-[10px] font-mono bg-blue-50 dark:bg-navy-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded font-bold">
          PURPOSE-BASED RBAC ACTIVE
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-navy-800">
            <tr>
              <th className="px-6 py-3">Document Name</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Classification</th>
              <th className="px-6 py-3">SHA-256 Digest</th>
              <th className="px-6 py-3">Integrity State</th>
              <th className="px-6 py-3 text-right">Action Trigger</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
            {documents.map((doc) => {
              const decision = accessControlEngine.evaluateAccess(user, caseData, doc, 'VIEW');

              return (
                <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-navy-850/60 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{doc.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">v{doc.version} • Uploaded by {doc.uploadedBy}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">{doc.category}</td>
                  <td className="px-6 py-4">
                    <SensitivityBadge sensitivity={doc.sensitivity} />
                  </td>
                  <td className="px-6 py-4 font-mono text-[11px] text-slate-500 dark:text-slate-400 max-w-[150px] truncate">
                    {doc.sha256Hash}
                  </td>
                  <td className="px-6 py-4">
                    <IntegrityBadge status={doc.integrityStatus} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {decision.allowed ? (
                      <button
                        onClick={() => onSelectDocument(doc)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-navy-800 hover:bg-blue-100 dark:hover:bg-navy-750 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/40 rounded text-xs font-mono font-bold transition-all shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect Document
                      </button>
                    ) : decision.requiresPurpose ? (
                      <button
                        onClick={() => onSelectDocument(doc)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 rounded text-xs font-mono font-bold transition-all"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Declare Purpose
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-mono text-[11px] font-bold">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        RESTRICTED
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
