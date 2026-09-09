'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/apiClient';
import { CasePassport, CasePriority, CaseClassification } from '../../types/case';
import {
  FolderPlus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Lock,
} from 'lucide-react';

interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaseCreated?: (newCase: CasePassport) => void;
}

const DEPARTMENTS = [
  'Financial Crimes Division',
  'Digital Forensics Lab',
  'Cyber Warfare & Infrastructure Protection',
  'Narcotics & Tactical Taskforce',
  'Executive Crime Command',
  'Internal Affairs & Oversight',
];

export const CreateCaseModal: React.FC<CreateCaseModalProps> = ({
  isOpen,
  onClose,
  onCaseCreated,
}) => {
  const router = useRouter();
  const { currentUser } = useAuth();

  const getSuggestedCaseNumber = () =>
    `CASE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const todayStr = new Date().toISOString().split('T')[0];

  const [caseNumber, setCaseNumber] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [incidentDate, setIncidentDate] = useState(todayStr);
  const [priority, setPriority] = useState<CasePriority>('HIGH');
  const [classification, setClassification] = useState<CaseClassification>('CONFIDENTIAL');
  const [leadInvestigator, setLeadInvestigator] = useState('');

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [createdCase, setCreatedCase] = useState<CasePassport | null>(null);

  // Initialize form defaults on open
  useEffect(() => {
    if (isOpen) {
      setCaseNumber(getSuggestedCaseNumber());
      setTitle('');
      setDescription('');
      setDepartment(DEPARTMENTS[0]);
      setIncidentDate(todayStr);
      setPriority('HIGH');
      setClassification('CONFIDENTIAL');
      setLeadInvestigator(currentUser.name || 'Cmdr. Robert Vance');
      setValidationErrors({});
      setServerError(null);
      setCreatedCase(null);
    }
  }, [isOpen, currentUser]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    const trimmedNumber = caseNumber.trim();
    if (!trimmedNumber) {
      errors.caseNumber = 'Case number is required.';
    } else if (!/^CASE-\d{4}-\w+$/i.test(trimmedNumber)) {
      errors.caseNumber = 'Format should be CASE-YYYY-XXXX (e.g. CASE-2026-4401).';
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      errors.title = 'Case title is required.';
    } else if (trimmedTitle.length < 3) {
      errors.title = 'Title must be at least 3 characters long.';
    }

    if (!description.trim()) {
      errors.description = 'Case summary/description is required.';
    }

    if (!department.trim()) {
      errors.department = 'Department is required.';
    }

    if (!incidentDate) {
      errors.incidentDate = 'Incident date is required.';
    } else if (new Date(incidentDate) > new Date(todayStr)) {
      errors.incidentDate = 'Incident date cannot be in the future.';
    }

    if (!leadInvestigator.trim()) {
      errors.leadInvestigator = 'Lead Investigator name is required.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setServerError(null);

    try {
      const payload: Partial<CasePassport> = {
        caseNumber: caseNumber.trim().toUpperCase(),
        caseId: caseNumber.trim().toUpperCase(),
        title: title.trim(),
        description: description.trim(),
        department: department.trim(),
        incidentDate,
        priority,
        classification,
        leadInvestigator: leadInvestigator.trim(),
        status: 'ACTIVE',
        caseStage: 'FIR_LODGED',
      };

      const newCase = await apiClient.createCase(payload);
      setCreatedCase(newCase);
      if (onCaseCreated) {
        onCaseCreated(newCase);
      }
    } catch (err: any) {
      console.error('Case creation failed:', err);
      const msg = err.message || 'Failed to initialize digital case passport.';
      setServerError(msg);

      if (msg.toLowerCase().includes('already exists')) {
        setValidationErrors((prev) => ({
          ...prev,
          caseNumber: 'A case with this identifier already exists.',
        }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleNavigateToNewCase = () => {
    if (createdCase) {
      onClose();
      router.push(`/dashboard/cases/${createdCase.caseId}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Initialize Digital Case Passport"
      maxWidth="max-w-2xl"
    >
      {createdCase ? (
        /* Success Confirmation View */
        <div className="space-y-6 font-mono py-2 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Digital Case Passport Initialized
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-sans">
                Passport record immutably created and anchored to the security ledger with Genesis verification seal.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl p-4 space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-200 dark:border-navy-800 pb-2">
              <span className="text-slate-500">CASE NUMBER:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{createdCase.caseNumber}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 dark:border-navy-800 pb-2">
              <span className="text-slate-500">TITLE:</span>
              <span className="font-bold text-slate-900 dark:text-white max-w-sm text-right truncate">
                {createdCase.title}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 dark:border-navy-800 pb-2">
              <span className="text-slate-500">CLASSIFICATION:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{createdCase.classification}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 dark:border-navy-800 pb-2">
              <span className="text-slate-500">LEAD INVESTIGATOR:</span>
              <span className="font-bold text-slate-900 dark:text-slate-200">{createdCase.leadInvestigator}</span>
            </div>
            <div className="space-y-1 pt-1">
              <span className="text-slate-500 text-[11px]">BLOCKCHAIN GENESIS ANCHOR:</span>
              <div className="p-2 bg-white dark:bg-navy-900 rounded border border-slate-200 dark:border-navy-800 text-[11px] text-emerald-600 dark:text-emerald-400 break-all select-all font-mono">
                {createdCase.blockchainAnchorId}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold rounded-lg transition-colors"
            >
              Return to Directory
            </button>
            <button
              type="button"
              onClick={handleNavigateToNewCase}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-2 transition-all shadow-md"
            >
              Inspect New Passport
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Case Creation Form */
        <form onSubmit={handleSubmit} className="space-y-5 font-mono text-xs">
          {/* Security Banner */}
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 p-3 rounded-lg flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-blue-900 dark:text-blue-200">
              <p className="font-bold">Authoritative Passport Registration</p>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5 font-sans">
                Initializing a new digital case passport automatically stamps a cryptographic SHA-256 genesis anchor and logs your active clearance in the immutable chain of custody. Creates an initial tamper-evident fingerprint for this case record that cannot be secretly altered.
              </p>
            </div>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 p-3 rounded-lg flex items-start gap-2.5 text-rose-700 dark:text-rose-400" role="alert">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="text-[11px]">
                <span className="font-bold">Creation Error: </span>
                <span>{serverError}</span>
              </div>
            </div>
          )}

          {/* Two-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Case Number */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="create-case-number" className="text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px]">
                  Case Number <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setCaseNumber(getSuggestedCaseNumber())}
                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 focus:outline-hidden focus:ring-1 focus:ring-blue-500 rounded"
                  aria-label="Auto-suggest a randomized case passport number"
                >
                  <Sparkles className="w-3 h-3" /> Auto-Suggest
                </button>
              </div>
              <input
                id="create-case-number"
                type="text"
                placeholder="CASE-2026-XXXX"
                value={caseNumber}
                aria-required="true"
                aria-invalid={!!validationErrors.caseNumber}
                aria-describedby={validationErrors.caseNumber ? "case-number-error" : undefined}
                onChange={(e) => {
                  setCaseNumber(e.target.value);
                  if (validationErrors.caseNumber) {
                    setValidationErrors((prev) => ({ ...prev, caseNumber: '' }));
                  }
                }}
                className={`w-full bg-slate-50 dark:bg-navy-950 border ${
                  validationErrors.caseNumber
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500'
                } rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 uppercase font-mono`}
              />
              {validationErrors.caseNumber && (
                <p id="case-number-error" className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">
                  {validationErrors.caseNumber}
                </p>
              )}
            </div>

            {/* Incident Date */}
            <div>
              <label htmlFor="create-case-date" className="block text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px] mb-1">
                Incident Date <span className="text-rose-500">*</span>
              </label>
              <input
                id="create-case-date"
                type="date"
                max={todayStr}
                value={incidentDate}
                aria-required="true"
                aria-invalid={!!validationErrors.incidentDate}
                aria-describedby={validationErrors.incidentDate ? "incident-date-error" : undefined}
                onChange={(e) => {
                  setIncidentDate(e.target.value);
                  if (validationErrors.incidentDate) {
                    setValidationErrors((prev) => ({ ...prev, incidentDate: '' }));
                  }
                }}
                className={`w-full bg-slate-50 dark:bg-navy-950 border ${
                  validationErrors.incidentDate
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500'
                } rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 font-mono`}
              />
              {validationErrors.incidentDate && (
                <p id="incident-date-error" className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">
                  {validationErrors.incidentDate}
                </p>
              )}
            </div>
          </div>

          {/* Case Title */}
          <div>
            <label htmlFor="create-case-title" className="block text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px] mb-1">
              Case Title / Operation Codename <span className="text-rose-500">*</span>
            </label>
            <input
              id="create-case-title"
              type="text"
              placeholder="e.g. Operation DarkLedge Financial Fraud"
              value={title}
              aria-required="true"
              aria-invalid={!!validationErrors.title}
              aria-describedby={validationErrors.title ? "case-title-error" : undefined}
              onChange={(e) => {
                setTitle(e.target.value);
                if (validationErrors.title) {
                  setValidationErrors((prev) => ({ ...prev, title: '' }));
                }
              }}
              className={`w-full bg-slate-50 dark:bg-navy-950 border ${
                validationErrors.title
                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500'
              } rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 font-sans`}
            />
            {validationErrors.title && (
              <p id="case-title-error" className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">
                {validationErrors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="create-case-description" className="block text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px] mb-1">
              Case Synopsis & Summary <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="create-case-description"
              rows={3}
              placeholder="Comprehensive summary of alleged offences, primary entities, and initial intelligence..."
              value={description}
              aria-required="true"
              aria-invalid={!!validationErrors.description}
              aria-describedby={validationErrors.description ? "case-desc-error" : undefined}
              onChange={(e) => {
                setDescription(e.target.value);
                if (validationErrors.description) {
                  setValidationErrors((prev) => ({ ...prev, description: '' }));
                }
              }}
              className={`w-full bg-slate-50 dark:bg-navy-950 border ${
                validationErrors.description
                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500'
              } rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 font-sans leading-relaxed`}
            />
            {validationErrors.description && (
              <p id="case-desc-error" className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">
                {validationErrors.description}
              </p>
            )}
          </div>

          {/* Department & Lead Investigator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="create-case-dept" className="block text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px] mb-1">
                Investigating Department <span className="text-rose-500">*</span>
              </label>
              <select
                id="create-case-dept"
                value={department}
                aria-required="true"
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="create-case-lead" className="block text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px] mb-1">
                Lead Investigator <span className="text-rose-500">*</span>
              </label>
              <input
                id="create-case-lead"
                type="text"
                placeholder="e.g. Insp. Sarah Jenkins"
                value={leadInvestigator}
                aria-required="true"
                aria-invalid={!!validationErrors.leadInvestigator}
                aria-describedby={validationErrors.leadInvestigator ? "case-lead-error" : undefined}
                onChange={(e) => {
                  setLeadInvestigator(e.target.value);
                  if (validationErrors.leadInvestigator) {
                    setValidationErrors((prev) => ({ ...prev, leadInvestigator: '' }));
                  }
                }}
                className={`w-full bg-slate-50 dark:bg-navy-950 border ${
                  validationErrors.leadInvestigator
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500'
                } rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 font-sans`}
              />
              {validationErrors.leadInvestigator && (
                <p id="case-lead-error" className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">
                  {validationErrors.leadInvestigator}
                </p>
              )}
            </div>
          </div>

          {/* Priority & Classification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="create-case-priority" className="block text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px] mb-1">
                Priority Tier
              </label>
              <select
                id="create-case-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as CasePriority)}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
              >
                <option value="CRITICAL">CRITICAL (Top-Level Interdiction)</option>
                <option value="HIGH">HIGH (Standard Major Felony)</option>
                <option value="MEDIUM">MEDIUM (Intermediate Inquiry)</option>
                <option value="LOW">LOW (Administrative / Minor)</option>
              </select>
            </div>

            <div>
              <label htmlFor="create-case-classification" className="block text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px] mb-1">
                Security Classification
              </label>
              <select
                id="create-case-classification"
                value={classification}
                onChange={(e) => setClassification(e.target.value as CaseClassification)}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
              >
                <option value="TOP_SECRET">TOP_SECRET (Strict compartmentalization)</option>
                <option value="SECRET">SECRET (Protected criminal intelligence)</option>
                <option value="CONFIDENTIAL">CONFIDENTIAL (Standard agency confidential)</option>
                <option value="RESTRICTED">RESTRICTED (Controlled circulation)</option>
              </select>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-sans">
                Access is controlled according to the user&apos;s role (RBAC) and security clearance tier.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-navy-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold rounded-lg transition-colors focus:ring-2 focus:ring-slate-400 focus:outline-hidden"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-2 transition-all shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-hidden"
            >
              <FolderPlus className={`w-4 h-4 ${submitting ? 'animate-spin' : ''}`} />
              {submitting ? 'Anchoring Case...' : 'Initialize Case Passport'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
