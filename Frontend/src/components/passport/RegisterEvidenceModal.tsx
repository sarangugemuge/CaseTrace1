'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/apiClient';
import { CasePassport } from '../../types/case';
import { SensitivityLevel, DocumentCategory } from '../../types/document';
import { verificationService } from '../../services/verificationService';
import {
  ShieldCheck,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Hash,
  Sparkles,
  Lock,
  Clock,
  UserCheck,
} from 'lucide-react';

interface RegisterEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: CasePassport;
  onEvidenceRegistered?: (doc: any) => void;
}

const CATEGORIES: DocumentCategory[] = [
  'EVIDENCE',
  'SYSTEM_IMAGE',
  'FORENSIC_REPORT',
  'EVIDENCE_PHOTO',
  'COURT_EXHIBIT',
];

const SENSITIVITIES: SensitivityLevel[] = [
  'CONFIDENTIAL',
  'TOP_SECRET',
  'FORENSIC',
  'INTERNAL',
  'PUBLIC',
];

export const RegisterEvidenceModal: React.FC<RegisterEvidenceModalProps> = ({
  isOpen,
  onClose,
  caseData,
  onEvidenceRegistered,
}) => {
  const { currentUser } = useAuth();

  const getSuggestedEvidenceId = () => {
    const caseSuffix = caseData?.caseNumber?.replace('CASE-', '') || '2026';
    return `EV-${caseSuffix}-${Math.floor(100 + Math.random() * 900)}`;
  };

  const [evidenceId, setEvidenceId] = useState('');
  const [evidenceName, setEvidenceName] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('EVIDENCE');
  const [sensitivity, setSensitivity] = useState<SensitivityLevel>('CONFIDENTIAL');
  const [custodyNotes, setCustodyNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [computedSha256, setComputedSha256] = useState<string>('');
  const [isHashing, setIsHashing] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState<any | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setEvidenceId(getSuggestedEvidenceId());
      setEvidenceName('');
      setCategory('EVIDENCE');
      setSensitivity('CONFIDENTIAL');
      setCustodyNotes('');
      setSelectedFile(null);
      setComputedSha256('');
      setServerError(null);
      setRegisteredSuccess(null);
      setValidationErrors({});
    }
  }, [isOpen, caseData]);

  // Compute live real SHA-256 hash when a file is selected
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    if (!evidenceName) {
      setEvidenceName(file.name.replace(/\.[^/.]+$/, '').replace(/[_.-]/g, ' '));
    }

    setIsHashing(true);
    try {
      const hash = await verificationService.computeFileHash(file);
      setComputedSha256(hash);
    } catch (err) {
      console.error('Failed to compute file SHA-256 hash:', err);
    } finally {
      setIsHashing(false);
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!evidenceId.trim()) errors.evidenceId = 'Evidence ID is required.';
    if (!evidenceName.trim()) errors.evidenceName = 'Evidence title is required.';
    if (!selectedFile && !computedSha256) {
      errors.file = 'Please upload a physical or digital artifact file to anchor.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setServerError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      // If a file is uploaded, upload it via the documents API with category=EVIDENCE
      let fileToUpload = selectedFile;
      if (!fileToUpload) {
        // Create a synthetic evidence artifact blob with custody notes
        const content = `--- CASETRACE EVIDENCE ARTIFACT ---
Case: ${caseData.caseNumber}
Evidence ID: ${evidenceId}
Title: ${evidenceName}
Category: ${category}
Sensitivity: ${sensitivity}
Registered By: ${currentUser.name} (${currentUser.role})
Timestamp: ${new Date().toISOString()}
Custody Notes: ${custodyNotes || 'Initial evidence seizure and registration'}
`;
        fileToUpload = new File([content], `${evidenceId}.dat`, { type: 'text/plain' });
      }

      const res = await apiClient.uploadDocument(
        caseData.caseId,
        fileToUpload,
        category,
        sensitivity,
        'FORENSIC_ANALYSIS',
        evidenceId
      );

      setRegisteredSuccess(res);
      if (onEvidenceRegistered) {
        onEvidenceRegistered(res);
      }
    } catch (err: any) {
      console.error('Evidence registration error:', err);
      setServerError(err.message || 'Failed to register evidence artifact. Please check input parameters.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !currentUser) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={registeredSuccess ? 'Evidence Artifact Registered' : 'Register Forensic Evidence Artifact'}
      maxWidth="max-w-2xl"
    >
      {registeredSuccess ? (
        <div className="space-y-5 font-mono text-xs p-2">
          <div className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 rounded-xl p-5 text-emerald-900 dark:text-emerald-200 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">EVIDENCE REGISTERED & CRYPTOGRAPHICALLY ANCHORED</h4>
                <p className="text-[11px] opacity-90">
                  SHA-256 fingerprint computed and anchored to Case Passport {caseData.caseNumber}.
                </p>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-navy-950/90 rounded-lg p-3.5 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
              <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400">
                <span>EVIDENCE ID: <strong className="text-slate-900 dark:text-white">{evidenceId}</strong></span>
                <span>STATUS: <strong className="text-emerald-600 dark:text-emerald-400">VERIFIED</strong></span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">
                  AUTHORITATIVE SHA-256 HASH DIGEST:
                </span>
                <code className="text-blue-600 dark:text-blue-400 break-all text-[11px] bg-slate-100 dark:bg-navy-900 p-2 rounded block font-bold">
                  {registeredSuccess.sha256Hash || computedSha256}
                </code>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 flex justify-between pt-1">
                <span>BLOCKCHAIN RECORD: <strong>{registeredSuccess.blockchainRecordId || 'blk-pending'}</strong></span>
                <span>CUSTODIAN: <strong>{currentUser.name}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
            >
              Done & View Evidence
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          {serverError && (
            <div className="bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Top metadata summary */}
          <div className="bg-slate-50 dark:bg-navy-950 p-3 rounded-lg border border-slate-200 dark:border-navy-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">CASE PASSPORT:</span>
              <span className="font-bold text-slate-900 dark:text-white">{caseData.caseNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-slate-500 dark:text-slate-400">UPLOADER:</span>
              <span className="font-bold text-slate-900 dark:text-white">{currentUser.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-400 font-bold uppercase">
                {currentUser.role}
              </span>
            </div>
          </div>

          {/* Form grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="register-evidence-id" className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                Evidence ID <span className="text-rose-500">*</span>
              </label>
              <input
                id="register-evidence-id"
                type="text"
                value={evidenceId}
                aria-required="true"
                aria-invalid={!!validationErrors.evidenceId}
                aria-describedby={validationErrors.evidenceId ? "reg-ev-id-error" : undefined}
                onChange={(e) => setEvidenceId(e.target.value)}
                placeholder="e.g. EV-8942-004"
                className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-800 rounded-lg p-2 text-slate-900 dark:text-slate-200 font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
              {validationErrors.evidenceId && (
                <p id="reg-ev-id-error" className="text-rose-500 text-[10px] mt-0.5">{validationErrors.evidenceId}</p>
              )}
            </div>

            <div>
              <label htmlFor="register-artifact-category" className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                Artifact Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="register-artifact-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-800 rounded-lg p-2 text-slate-900 dark:text-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="register-evidence-name" className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
              Evidence Title / Artifact Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="register-evidence-name"
              type="text"
              value={evidenceName}
              aria-required="true"
              aria-invalid={!!validationErrors.evidenceName}
              aria-describedby={validationErrors.evidenceName ? "reg-ev-name-error" : undefined}
              onChange={(e) => setEvidenceName(e.target.value)}
              placeholder="e.g. Encrypted SSD Forensic Clone (C2 Command Node)"
              className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-800 rounded-lg p-2 text-slate-900 dark:text-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            {validationErrors.evidenceName && (
              <p id="reg-ev-name-error" className="text-rose-500 text-[10px] mt-0.5">{validationErrors.evidenceName}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="register-security-sensitivity" className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                Security Classification <span className="text-rose-500">*</span>
              </label>
              <select
                id="register-security-sensitivity"
                value={sensitivity}
                onChange={(e) => setSensitivity(e.target.value as SensitivityLevel)}
                className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-800 rounded-lg p-2 text-slate-900 dark:text-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {SENSITIVITIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-sans">
                Access is controlled according to the user&apos;s role (RBAC).
              </p>
            </div>

            <div>
              <label htmlFor="register-verification-status" className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                Verification Status
              </label>
              <input
                id="register-verification-status"
                type="text"
                value="VERIFIED (GENESIS INGEST)"
                disabled
                className="w-full bg-slate-200 dark:bg-navy-900 border border-slate-300 dark:border-navy-800 rounded-lg p-2 text-slate-600 dark:text-slate-400 font-bold opacity-80"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-sans">
                Checks whether the document has changed since registration.
              </p>
            </div>
          </div>

          {/* File Upload Zone */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
              Digital Evidence File / Data Payload <span className="text-rose-500">*</span>
            </label>
            <div className="border-2 border-dashed border-slate-300 dark:border-navy-700 hover:border-blue-500 dark:hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 rounded-xl p-4 text-center transition-colors bg-slate-50/50 dark:bg-navy-950/50">
              <input
                type="file"
                id="evidence-file-input"
                onChange={handleFileChange}
                className="sr-only"
              />
              <label
                htmlFor="evidence-file-input"
                className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
              >
                <Upload className="w-6 h-6 text-blue-500" />
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedFile ? selectedFile.name : 'Click to select file or drag and drop'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {selectedFile
                    ? `${(selectedFile.size / 1024).toFixed(1)} KB • Click to change file`
                    : 'PDF, IMG, E01, PCAP, RAW, CSV, or documents (up to 50MB)'}
                </span>
              </label>
            </div>
            {validationErrors.file && (
              <p className="text-rose-500 text-[10px] mt-0.5">{validationErrors.file}</p>
            )}
          </div>

          {/* Real-time Computed SHA-256 Digest Preview */}
          {isHashing ? (
            <div className="bg-slate-100 dark:bg-navy-950 p-2.5 rounded-lg border border-slate-200 dark:border-navy-800 text-slate-500 flex items-center gap-2" role="status" aria-live="polite">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-spin" />
              <span>Computing authentic SHA-256 cryptographic digest...</span>
            </div>
          ) : computedSha256 ? (
            <div className="bg-emerald-50/70 dark:bg-navy-950 p-2.5 rounded-lg border border-emerald-300 dark:border-emerald-800 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-emerald-800 dark:text-emerald-400 font-bold">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  AUTHENTIC SHA-256 FINGERPRINT READY
                </span>
                <span>FIPS 180-4 COMPLIANT</span>
              </div>
              <code className="text-blue-600 dark:text-blue-400 break-all text-[11px] block font-bold">
                {computedSha256}
              </code>
            </div>
          ) : null}

          {/* Custody Notes */}
          <div>
            <label htmlFor="register-custody-notes" className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
              Chain of Custody / Ingest Notes (Optional)
            </label>
            <textarea
              id="register-custody-notes"
              rows={2}
              value={custodyNotes}
              onChange={(e) => setCustodyNotes(e.target.value)}
              placeholder="e.g. Seized from suspect server room during execution of search warrant. Read-only write blocker utilized."
              className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-800 rounded-lg p-2 text-slate-900 dark:text-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-navy-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors focus:ring-2 focus:ring-slate-400 focus:outline-hidden"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || isHashing}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50 focus:ring-2 focus:ring-blue-400 focus:outline-hidden"
            >
              <ShieldCheck className="w-4 h-4" />
              {submitting ? 'Anchoring Evidence...' : 'Anchor & Register Evidence'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
