'use client';

import React, { useState } from 'react';
import { Document } from '../../types/document';
import { SensitivityBadge, IntegrityBadge } from '../common/Badge';
import { FileText, Eye, ShieldAlert, Lock, Upload, Trash2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { accessControlEngine } from '../../services/accessControlEngine';
import { User } from '../../types/auth';
import { CasePassport } from '../../types/case';
import { apiClient } from '../../lib/apiClient';
import { Modal } from '../common/Modal';

interface DocumentTableProps {
  documents: Document[];
  user: User;
  caseData: CasePassport;
  onSelectDocument: (doc: Document) => void;
  onRefreshDocuments?: () => void;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  user,
  caseData,
  onSelectDocument,
  onRefreshDocuments,
}) => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>('EVIDENCE');
  const [sensitivity, setSensitivity] = useState<string>('CONFIDENTIAL');
  const [purpose, setPurpose] = useState<string>('INVESTIGATION');
  const [description, setDescription] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

  const canUpload = ['Senior Officer', 'Investigating Officer', 'Forensic Officer', 'Admin'].includes(user.role);
  const canDelete = ['Senior Officer', 'Admin'].includes(user.role);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadMessage(null);

    try {
      await apiClient.uploadDocument(
        caseData.caseId,
        selectedFile,
        category,
        sensitivity,
        purpose,
        undefined,
        description.trim() || undefined,
        notes.trim() || undefined
      );
      setUploadMessage({ type: 'success', text: `Document '${selectedFile.name}' uploaded and registered securely.` });
      setSelectedFile(null);
      setDescription('');
      setNotes('');
      setTimeout(() => {
        setUploadModalOpen(false);
        setUploadMessage(null);
        if (onRefreshDocuments) onRefreshDocuments();
      }, 1200);
    } catch (err: any) {
      setUploadMessage({ type: 'error', text: err.message || 'Upload failed. Please check storage connection.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDoc = async (docId: string, docName: string) => {
    if (!window.confirm(`Are you sure you want to delete document '${docName}'? This action is auditable.`)) {
      return;
    }
    setDeletingDocId(docId);
    try {
      await apiClient.deleteDocument(docId);
      if (onRefreshDocuments) onRefreshDocuments();
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    } finally {
      setDeletingDocId(null);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl overflow-hidden shadow-card transition-colors">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-navy-800 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Case Document Passport Registry ({documents.length})
          </h3>
          
          <div className="flex items-center gap-2">
            {canUpload && (
              <button
                onClick={() => setUploadModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-mono font-bold transition-all shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Document
              </button>
            )}
            <span className="text-[10px] font-mono bg-blue-50 dark:bg-navy-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded font-bold">
              PURPOSE-BASED RBAC ACTIVE
            </span>
          </div>
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
                      <div className="flex items-center justify-end gap-2">
                        {decision.allowed ? (
                          <button
                            onClick={() => onSelectDocument(doc)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-navy-800 hover:bg-blue-100 dark:hover:bg-navy-750 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/40 rounded text-xs font-mono font-bold transition-all shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Inspect
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

                        {canDelete && (
                          <button
                            disabled={deletingDocId === doc.id}
                            onClick={() => handleDeleteDoc(doc.id, doc.name)}
                            className="p-1.5 bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded transition-all"
                            title="Delete Document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Document Modal */}
      <Modal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} title="Upload Secure Document Artifact">
        <form onSubmit={handleUploadSubmit} className="space-y-4 font-mono text-xs text-slate-800 dark:text-slate-200">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">
              Select Document File
            </label>
            <input
              type="file"
              required
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full p-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded text-slate-900 dark:text-white"
              >
                <option value="EVIDENCE">EVIDENCE</option>
                <option value="FORENSIC_REPORT">FORENSIC REPORT</option>
                <option value="FINANCIAL_AUDIT">FINANCIAL AUDIT</option>
                <option value="FIRST_INFORMATION_REPORT">FIR</option>
                <option value="COURT_EXHIBIT">COURT EXHIBIT</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">
                Sensitivity Level
              </label>
              <select
                value={sensitivity}
                onChange={(e) => setSensitivity(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded text-slate-900 dark:text-white"
              >
                <option value="PUBLIC">PUBLIC</option>
                <option value="INTERNAL">INTERNAL</option>
                <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                <option value="TOP_SECRET">TOP SECRET</option>
                <option value="FORENSIC">FORENSIC</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Memory dump artifact from workstation WS-04"
              className="w-full p-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">
              Chain of Custody Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Tamper-evident evidence seal #AZ-9921 intact upon receipt."
              rows={2}
              className="w-full p-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">
              Purpose of Upload
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. INVESTIGATION, LEGAL_REVIEW"
              className="w-full p-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded text-slate-900 dark:text-white"
            />
          </div>

          {uploadMessage && (
            <div className={`p-3 rounded border text-xs flex items-center gap-2 ${
              uploadMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300'
            }`}>
              {uploadMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{uploadMessage.text}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-navy-800">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 rounded font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold flex items-center gap-2 disabled:opacity-50"
            >
              {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {isUploading ? 'Uploading Artifact...' : 'Upload Artifact'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
