'use client';

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Document } from '../../types/document';
import { AccessPurpose } from '../../types/audit';
import { ShieldAlert, Key, CheckCircle } from 'lucide-react';

interface PurposeAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  onSubmitPurpose: (purpose: AccessPurpose | string) => void;
}

export const PurposeAccessModal: React.FC<PurposeAccessModalProps> = ({
  isOpen,
  onClose,
  document,
  onSubmitPurpose,
}) => {
  const [selectedPurpose, setSelectedPurpose] = useState<AccessPurpose>('INVESTIGATION');
  const [customNotes, setCustomNotes] = useState('');

  if (!document) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPurpose = customNotes ? `${selectedPurpose} - ${customNotes}` : selectedPurpose;
    onSubmitPurpose(finalPurpose);
    onClose();
  };

  const purposes: { value: AccessPurpose; label: string }[] = [
    { value: 'INVESTIGATION', label: 'Official Criminal Investigation' },
    { value: 'FORENSIC_ANALYSIS', label: 'Digital Forensic Extraction & Verification' },
    { value: 'LEGAL_REVIEW', label: 'Prosecutorial Review & Indictment Preparation' },
    { value: 'COURT_PROCEEDING', label: 'Judicial Evidence Filing & Subpoena' },
    { value: 'AUDIT', label: 'Security & Compliance Inspection' },
    { value: 'ADMINISTRATION', label: 'System Governance' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mandatory Purpose Declaration">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-amber-950/40 border border-amber-800/80 p-3 rounded-lg flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200">
            <p className="font-semibold">Access Justification Required</p>
            <p className="mt-0.5 text-amber-300/80">
              Document <span className="font-mono font-bold text-white">{document.name}</span> has classification level{' '}
              <span className="font-mono uppercase font-bold text-amber-400">{document.sensitivity}</span>. Declared purpose will be immutably recorded in the security audit trail.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
            Select Official Access Purpose:
          </label>
          <select
            value={selectedPurpose}
            onChange={(e) => setSelectedPurpose(e.target.value as AccessPurpose)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:border-blue-500 focus:outline-hidden"
          >
            {purposes.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label} ({p.value})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
            Case Reference / Justification Note (Optional):
          </label>
          <textarea
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            rows={3}
            placeholder="e.g. Subpoena reference #COURT-892 or Forensic Extraction Task Order"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded text-xs font-mono flex items-center gap-1.5 transition-colors shadow-md"
          >
            <CheckCircle className="w-4 h-4" />
            Sign & Confirm Purpose
          </button>
        </div>
      </form>
    </Modal>
  );
};
