'use client';

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Document } from '../../types/document';
import { Role } from '../../types/auth';
import { getRoleLabel } from '../../lib/roles';
import { Share2, CheckCircle } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  onShare: (recipientRole: Role, purpose: string, expirationHours: number) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  document,
  onShare,
}) => {
  const [recipientRole, setRecipientRole] = useState<Role>('Prosecutor');
  const [purpose, setPurpose] = useState('LEGAL_REVIEW');
  const [expiration, setExpiration] = useState(24);

  if (!document) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onShare(recipientRole, purpose, expiration);
    onClose();
  };

  const roles: Role[] = [
    'Senior Officer',
    'Investigating Officer',
    'Cyber Crime Investigating Officer',
    'Forensic Officer',
    'Prosecutor',
    'Court User',
    'Auditor / Security',
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Case Document (Authorized Grant)">
      <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 p-3 rounded-lg text-blue-900 dark:text-blue-200">
          <p className="font-bold flex items-center gap-1.5">
            <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Share Authorized Artifact Access
          </p>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
            Sharing <span className="text-slate-900 dark:text-white font-bold">{document.name}</span> with another role clearance tier will issue a temporary, time-bound access grant logged in the audit trail.
          </p>
        </div>

        <div>
          <label className="block text-slate-700 dark:text-slate-300 mb-1">Target Recipient Role Clearance:</label>
          <select
            value={recipientRole}
            onChange={(e) => setRecipientRole(e.target.value as Role)}
            className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-200"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {getRoleLabel(r, 'bilingual')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-700 dark:text-slate-300 mb-1">Authorization Purpose:</label>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-200"
          />
        </div>

        <div>
          <label className="block text-slate-700 dark:text-slate-300 mb-1">Access Grant Expiration (Hours):</label>
          <select
            value={expiration}
            onChange={(e) => setExpiration(Number(e.target.value))}
            className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-slate-200"
          >
            <option value={4}>4 Hours (Emergency Access)</option>
            <option value={24}>24 Hours (Standard Grant)</option>
            <option value={72}>72 Hours (Extended Court Subpoena)</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            Issue Temporary Access Share
          </button>
        </div>
      </form>
    </Modal>
  );
};
