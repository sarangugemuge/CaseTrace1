'use client';

import React from 'react';
import { Document } from '../../types/document';
import { SensitivityBadge, IntegrityBadge } from '../common/Badge';
import { FileText, Eye, ShieldAlert, Lock } from 'lucide-react';
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
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          Case Document Passport Registry ({documents.length})
        </h3>
        <span className="text-[11px] font-mono text-slate-400">ROLE FILTERING ACTIVE</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-navy-950 text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-6 py-3">Document Name</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Sensitivity</th>
              <th className="px-6 py-3">SHA-256 Hash</th>
              <th className="px-6 py-3">Integrity</th>
              <th className="px-6 py-3 text-right">Access Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {documents.map((doc) => {
              const decision = accessControlEngine.evaluateAccess(user, caseData, doc, 'VIEW');

              return (
                <tr key={doc.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="font-semibold">{doc.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">v{doc.version} • {doc.uploadedBy}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-400">{doc.category}</td>
                  <td className="px-6 py-4">
                    <SensitivityBadge sensitivity={doc.sensitivity} />
                  </td>
                  <td className="px-6 py-4 font-mono text-[11px] text-slate-400 max-w-[160px] truncate">
                    {doc.sha256Hash}
                  </td>
                  <td className="px-6 py-4">
                    <IntegrityBadge status={doc.integrityStatus} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {decision.allowed ? (
                      <button
                        onClick={() => onSelectDocument(doc)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/40 rounded text-xs font-mono font-medium transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect Document
                      </button>
                    ) : decision.requiresPurpose ? (
                      <button
                        onClick={() => onSelectDocument(doc)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-700 rounded text-xs font-mono font-medium transition-all"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Declare Purpose
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-400 font-mono text-[11px]">
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
