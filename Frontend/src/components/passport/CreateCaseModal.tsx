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
} from 'lucide-react';

interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaseCreated?: (newCase: CasePassport) => void;
}

const INCIDENT_CATEGORIES = [
  'Financial Fraud & Wire Syndicate',
  'Ransomware & System Extortion',
  'Data Theft & Exfiltration',
  'Critical Infrastructure Intrusion',
  'Identity Theft & Impersonation',
  'Narcotics & Contraband Smuggling',
  'Cyber Warfare & State-Sponsored APT',
  'General Cyber Crime Investigation',
];

const JURISDICTIONS = [
  'Central Cyber Crime Branch, New Delhi',
  'Cyber & Financial Investigation Division, Mumbai',
  'Cyber Forensic Command, Bengaluru',
  'Cyber Crime Police Station, Hyderabad',
  'Economic Offences Wing, Chennai',
  'State Special Operations Group, Kolkata',
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
  const [incidentCategory, setIncidentCategory] = useState(INCIDENT_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState(JURISDICTIONS[0]);
  const [incidentDate, setIncidentDate] = useState(todayStr);
  const [incidentTime, setIncidentTime] = useState('10:30');
  const [priority, setPriority] = useState<CasePriority>('HIGH');
  const [classification, setClassification] = useState<CaseClassification>('CONFIDENTIAL');
  const [leadInvestigator, setLeadInvestigator] = useState('');
  const [assignedTeam, setAssignedTeam] = useState('Cyber Investigation Team Alpha');

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [createdCase, setCreatedCase] = useState<CasePassport | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCaseNumber(getSuggestedCaseNumber());
      setTitle('');
      setIncidentCategory(INCIDENT_CATEGORIES[0]);
      setDescription('');
      setDepartment(JURISDICTIONS[0]);
      setIncidentDate(todayStr);
      setIncidentTime('10:30');
      setPriority('HIGH');
      setClassification('CONFIDENTIAL');
      setLeadInvestigator(currentUser?.name || 'Insp. Rajesh Kumar');
      setAssignedTeam('Cyber Investigation Team Alpha');
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
      errors.title = 'Incident title is required.';
    } else if (trimmedTitle.length < 3) {
      errors.title = 'Title must be at least 3 characters long.';
    }

    if (!description.trim()) {
      errors.description = 'Incident description is required.';
    }

    if (!department.trim()) {
      errors.department = 'Jurisdiction / department is required.';
    }

    if (!incidentDate) {
      errors.incidentDate = 'Incident date is required.';
    } else if (new Date(incidentDate) > new Date(todayStr)) {
      errors.incidentDate = 'Incident date cannot be in the future.';
    }

    if (!leadInvestigator.trim()) {
      errors.leadInvestigator = 'Lead Investigating Officer name is required.';
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
        description: `${description.trim()}\n\n[Category: ${incidentCategory} | Time: ${incidentTime} | Assigned Team: ${assignedTeam}]`,
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
      console.error('Incident creation failed:', err);
      const msg = err.message || 'Failed to record incident and initialize passport.';
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
      title="Add New Incident & Initialize Case Passport"
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
                Incident record created, cryptographic SHA-256 integrity anchor registered, and audit event logged.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl p-4 space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-200 dark:border-navy-800 pb-2">
              <span className="text-slate-500">CASE NUMBER:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{createdCase.caseNumber}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 dark:border-navy-800 pb-2">
              <span className="text-slate-500">INCIDENT TITLE:</span>
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
              <span className="text-slate-500 text-[11px]">INTEGRITY ANCHOR:</span>
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
              Open Digital Case Passport
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Incident Creation Form */
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 p-3 rounded-lg flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-blue-900 dark:text-blue-200">
              <p className="font-bold">Official Incident Intake & Passport Creation</p>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5 font-sans">
                Initializing a new Digital Case Passport records the incident facts, creates a cryptographic Genesis hash, and initiates the immutable chain-of-custody audit log.
              </p>
            </div>
          </div>

          {serverError && (
            <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 p-3 rounded-lg flex items-start gap-2.5 text-rose-700 dark:text-rose-400" role="alert">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="text-[11px]">
                <span className="font-bold">Intake Error: </span>
                <span>{serverError}</span>
              </div>
            </div>
          )}

          {/* Row 1: Case Number & Incident Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="create-case-number" className="text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px]">
                  Case / Incident ID <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setCaseNumber(getSuggestedCaseNumber())}
                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 focus:outline-hidden rounded"
                >
                  <Sparkles className="w-3 h-3" /> Auto-Generate
                </button>
              </div>
              <input
                id="create-case-number"
                type="text"
                placeholder="CASE-2026-XXXX"
                value={caseNumber}
                onChange={(e) => {
                  setCaseNumber(e.target.value);
                  if (validationErrors.caseNumber) {
                    setValidationErrors((prev) => ({ ...prev, caseNumber: '' }));
                  }
                }}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500 uppercase font-mono"
              />
              {validationErrors.caseNumber && (
                <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">{validationErrors.caseNumber}</p>
              )}
            </div>

            <div>
              <label htmlFor="create-case-category" className="block text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px] mb-1">
                Incident Category / Type <span className="text-rose-500">*</span>
              </label>
              <select
                id="create-case-category"
                value={incidentCategory}
                onChange={(e) => setIncidentCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500 font-sans"
              >
                {INCIDENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Incident Title */}
          <div>
            <label htmlFor="create-case-title" className="block text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px] mb-1">
              Incident Title / Operation Codename <span className="text-rose-500">*</span>
            </label>
            <input
              id="create-case-title"
              type="text"
              placeholder="e.g. Operation CyberStrike Banking Malware Syndicate"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (validationErrors.title) {
                  setValidationErrors((prev) => ({ ...prev, title: '' }));
                }
              }}
              className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500 font-sans"
            />
            {validationErrors.title && (
              <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">{validationErrors.title}</p>
            )}
          </div>

          {/* Row 3: Description */}
          <div>
            <label htmlFor="create-case-description" className="block text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px] mb-1">
              Incident Facts & Summary <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="create-case-description"
              rows={3}
              placeholder="Provide a factual summary of alleged offences, victims, suspected actors, and initial evidence gathered..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (validationErrors.description) {
                  setValidationErrors((prev) => ({ ...prev, description: '' }));
                }
              }}
              className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500 font-sans leading-relaxed"
            />
            {validationErrors.description && (
              <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">{validationErrors.description}</p>
            )}
          </div>

          {/* Row 4: Date, Time & Jurisdiction */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label htmlFor="create-case-date" className="block text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px] mb-1">
                Incident Date <span className="text-rose-500">*</span>
              </label>
              <input
                id="create-case-date"
                type="date"
                max={todayStr}
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label htmlFor="create-case-time" className="block text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px] mb-1">
                Incident Time
              </label>
              <input
                id="create-case-time"
                type="time"
                value={incidentTime}
                onChange={(e) => setIncidentTime(e.target.value)}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label htmlFor="create-case-dept" className="block text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px] mb-1">
                Jurisdiction / Branch <span className="text-rose-500">*</span>
              </label>
              <select
                id="create-case-dept"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500 font-sans"
              >
                {JURISDICTIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 5: Priority, Classification, Lead Investigator */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label htmlFor="create-case-priority" className="block text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px] mb-1">
                Priority Tier
              </label>
              <select
                id="create-case-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as CasePriority)}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500 font-mono"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <div>
              <label htmlFor="create-case-classification" className="block text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px] mb-1">
                Sensitivity Classification
              </label>
              <select
                id="create-case-classification"
                value={classification}
                onChange={(e) => setClassification(e.target.value as CaseClassification)}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500 font-mono"
              >
                <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                <option value="TOP_SECRET">TOP_SECRET</option>
                <option value="SECRET">SECRET</option>
                <option value="RESTRICTED">RESTRICTED</option>
              </select>
            </div>

            <div>
              <label htmlFor="create-case-lead" className="block text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px] mb-1">
                Lead Investigating Officer <span className="text-rose-500">*</span>
              </label>
              <input
                id="create-case-lead"
                type="text"
                placeholder="e.g. Insp. Rajesh Kumar"
                value={leadInvestigator}
                onChange={(e) => {
                  setLeadInvestigator(e.target.value);
                  if (validationErrors.leadInvestigator) {
                    setValidationErrors((prev) => ({ ...prev, leadInvestigator: '' }));
                  }
                }}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500 font-sans"
              />
              {validationErrors.leadInvestigator && (
                <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">{validationErrors.leadInvestigator}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-navy-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-2 transition-all shadow-md"
            >
              <FolderPlus className={`w-4 h-4 ${submitting ? 'animate-spin' : ''}`} />
              {submitting ? 'Anchoring Incident...' : 'Create Case Passport'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
