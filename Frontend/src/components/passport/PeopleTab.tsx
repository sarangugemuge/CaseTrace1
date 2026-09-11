'use client';

import React from 'react';
import { CasePassport } from '../../types/case';
import { UserCheck, Shield } from 'lucide-react';
import { MOCK_USERS } from '../../mock/users';
import { getRoleLabel, getRoleHindiLabel } from '../../lib/roles';

export const PeopleTab: React.FC<{ caseData: CasePassport }> = ({ caseData }) => {
  const assigned = MOCK_USERS.filter((u) => caseData.assignedUsers.includes(u.id));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-card transition-colors space-y-4">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h3 className="text-sm font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Assigned Case Personnel & Clearance Matrix ({assigned.length})
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Authorized officers, prosecutors, and forensic experts assigned to this Digital Case Passport.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assigned.map((person) => (
          <div key={person.id} className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 dark:bg-slate-800 border border-blue-500 dark:border-slate-700 font-mono font-bold text-white dark:text-blue-400 flex items-center justify-center shrink-0">
              {person.avatar}
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">{person.name}</div>
              <div className="text-xs font-mono text-blue-600 dark:text-blue-400 font-semibold">
                {getRoleLabel(person.role)}
                <span className="text-slate-500 dark:text-slate-400 font-sans ml-1.5 font-normal">
                  ({getRoleHindiLabel(person.role)})
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">{person.department} • {person.designation}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

