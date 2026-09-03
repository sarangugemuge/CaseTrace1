'use client';

import React from 'react';
import { ShieldCheck, UserCheck, Clock } from 'lucide-react';

export const ChainOfCustody: React.FC<{ caseId: string }> = ({ caseId }) => {
  const events = [
    {
      time: '2026-01-14 09:00:00 UTC',
      actor: 'Insp. Sarah Jenkins',
      role: 'Investigating Officer',
      action: 'Initial FIR document uploaded & SHA-256 anchored.',
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
    {
      time: '2026-03-01 16:45:00 UTC',
      actor: 'Dr. Alex Mercer',
      role: 'Forensic Officer',
      action: 'Volatile Memory Image acquired & registered on simulated blockchain.',
      hash: 'bf5b79647228807d8955219488a08c02c636f1c407559ed5a4bb8e84a20b0805',
    },
    {
      time: '2026-05-18 13:00:00 UTC',
      actor: 'Atty. Marcus Thorne',
      role: 'Prosecutor',
      action: 'Formal Indictment Charge Sheet attached to Digital Case Passport.',
      hash: '89abcde0123456789abcdef0123456789abcdef0123456789abcdef012345678',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-card my-6 transition-colors">
      <h3 className="text-sm font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        Forensic Chain of Custody & Immutability Audit Trail ({caseId})
      </h3>
      <div className="relative border-l border-purple-300 dark:border-purple-900/60 ml-4 space-y-6">
        {events.map((evt, idx) => (
          <div key={idx} className="ml-6 relative">
            <span className="absolute -left-[31px] top-0 w-3 h-3 bg-purple-600 dark:bg-purple-500 rounded-full border-2 border-white dark:border-slate-900 ring-4 ring-purple-100 dark:ring-purple-950" />
            <div className="bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs font-mono">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-purple-700 dark:text-purple-300 font-semibold">{evt.actor} ({evt.role})</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">{evt.time}</span>
              </div>
              <div className="text-slate-800 dark:text-slate-200 mb-2">{evt.action}</div>
              <div className="text-[10px] bg-slate-100 dark:bg-slate-950 p-1.5 rounded border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 truncate flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400 inline shrink-0" />
                HASH: {evt.hash}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
