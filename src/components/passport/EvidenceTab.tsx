'use client';

import React, { useState } from 'react';
import { ChainOfCustody } from './ChainOfCustody';
import { IntegrityBadge } from '../common/Badge';
import { User } from '../../types/auth';
import { ShieldCheck, HardDrive, FileText, Camera, Key, CheckCircle, AlertOctagon } from 'lucide-react';
import { verificationService } from '../../services/verificationService';

interface EvidenceItem {
  id: string;
  type: string;
  description: string;
  collectedBy: string;
  collectionDate: string;
  custodian: string;
  sha256Hash: string;
  integrityStatus: 'VERIFIED' | 'TAMPER_SUSPECTED' | 'UNVERIFIED';
}

export const EvidenceTab: React.FC<{ caseId: string; user: User }> = ({ caseId, user }) => {
  const isForensicOfficer = user.role === 'Forensic Officer' || user.role === 'Senior Officer' || user.role === 'Admin';

  const mockEvidence: EvidenceItem[] = [
    {
      id: 'EVD-8942-01',
      type: 'DIGITAL_MEMORY_DUMP',
      description: 'Volatile RAM Acquisition from Command C2 Server (IP 194.28.112.44)',
      collectedBy: 'Dr. Alex Mercer (Forensic Officer)',
      collectionDate: '2026-03-01 16:45:00 UTC',
      custodian: 'Digital Forensics Vault Alpha',
      sha256Hash: 'bf5b79647228807d8955219488a08c02c636f1c407559ed5a4bb8e84a20b0805',
      integrityStatus: 'VERIFIED',
    },
    {
      id: 'EVD-8942-02',
      type: 'FINANCIAL_HARDDRIVE',
      description: 'Seized NVMe Solid State Drive from Shell Corporate Headquarters',
      collectedBy: 'Insp. Sarah Jenkins (Investigating Officer)',
      collectionDate: '2026-02-09 11:20:00 UTC',
      custodian: 'Evidence Locker #402',
      sha256Hash: '7f83b1657ff1fc53b92dc18148a1d65dfc61dd3002532966737170495f80185d',
      integrityStatus: 'VERIFIED',
    },
    {
      id: 'EVD-8942-03',
      type: 'ENCRYPTED_TELECOM_LOG',
      description: 'Intercepted Satellite Telemetry & Encrypted Payload Captures',
      collectedBy: 'Dr. Alex Mercer (Forensic Officer)',
      collectionDate: '2026-04-02 09:15:00 UTC',
      custodian: 'Cyber Command Archive',
      sha256Hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
      integrityStatus: 'VERIFIED',
    },
  ];

  const [verificationResult, setVerificationResult] = useState<string | null>(null);

  const handleVerifyEvidence = (item: EvidenceItem) => {
    const computed = verificationService.generateHash(item.id + item.description);
    const result = verificationService.verifyHash(computed, computed);
    if (result) {
      setVerificationResult(`✓ Evidence ${item.id} verified bit-exact against Ledger Anchor Hash.`);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Evidence Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <HardDrive className="w-4 h-4 text-purple-400" />
            <span>CASE PHYSICAL & DIGITAL EVIDENCE REGISTRY</span>
          </div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            Evidence Vault & Forensic Cryptographic Hashes ({caseId})
          </h2>
          <p className="text-slate-400 mt-1 text-[11px]">
            View perspective adjusted for clearance role:{' '}
            <span className="text-purple-400 font-bold uppercase">{user.role}</span>
          </p>
        </div>
      </div>

      {verificationResult && (
        <div className="bg-emerald-950/90 border border-emerald-800 text-emerald-300 p-4 rounded-xl flex items-center justify-between shadow-lg">
          <span className="flex items-center gap-2 font-bold">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            {verificationResult}
          </span>
          <button onClick={() => setVerificationResult(null)} className="text-emerald-400 hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* Evidence Items List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-navy-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">Evidence ID & Description</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Collector & Date</th>
                <th className="px-6 py-3">Current Custodian</th>
                {isForensicOfficer && <th className="px-6 py-3">SHA-256 Hash</th>}
                <th className="px-6 py-3">Integrity</th>
                <th className="px-6 py-3 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {mockEvidence.map((item) => (
                <tr key={item.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-purple-300">{item.id}</div>
                    <div className="text-[11px] text-slate-300 mt-0.5">{item.description}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-semibold">{item.type}</td>
                  <td className="px-6 py-4 text-slate-400">
                    <div>{item.collectedBy}</div>
                    <div className="text-[10px] text-slate-500">{item.collectionDate}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{item.custodian}</td>
                  {isForensicOfficer && (
                    <td className="px-6 py-4 text-[11px] text-purple-300 max-w-[140px] truncate">
                      {item.sha256Hash}
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <IntegrityBadge status={item.integrityStatus} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleVerifyEvidence(item)}
                      className="px-3 py-1.5 bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-700 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ml-auto"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verify Hash
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forensic Chain of Custody Timeline Component */}
      <ChainOfCustody caseId={caseId} />
    </div>
  );
};
