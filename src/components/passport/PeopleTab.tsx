'use client';

import React from 'react';
import { User, Role } from '../../types/auth';
import { MOCK_USERS } from '../../mock/users';
import { Users, Shield, UserCheck, Lock } from 'lucide-react';

interface PeopleTabProps {
  assignedUserIds: string[];
  currentUser: User;
}

export const PeopleTab: React.FC<PeopleTabProps> = ({ assignedUserIds, currentUser }) => {
  const isRestrictedRole = currentUser.role === 'Court User';

  const participants = MOCK_USERS.filter((u) => assignedUserIds.includes(u.id));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg space-y-4">
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          Authorized Case Personnel & Chain of Command ({participants.length})
        </h3>
        {isRestrictedRole && (
          <span className="text-[10px] font-mono text-amber-400 bg-amber-950 border border-amber-800 px-2 py-0.5 rounded flex items-center gap-1">
            <Lock className="w-3 h-3" />
            OFFICER IDENTITIES MASKED FOR COURT VIEW
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-navy-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-6 py-3">Personnel Name</th>
              <th className="px-6 py-3">System Role</th>
              <th className="px-6 py-3">Department</th>
              <th className="px-6 py-3">Designation</th>
              <th className="px-6 py-3 text-right">Clearance Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {participants.map((person) => (
              <tr key={person.id} className="hover:bg-slate-850/50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 font-bold text-blue-400 flex items-center justify-center">
                    {person.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-white">
                      {isRestrictedRole && person.role !== 'Prosecutor' && person.role !== 'Court User'
                        ? `Officer [ID: ${person.id.toUpperCase()}]`
                        : person.name}
                    </div>
                    <div className="text-[10px] text-slate-400">{person.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-blue-400 font-semibold">{person.role}</td>
                <td className="px-6 py-4 text-slate-400">{person.department}</td>
                <td className="px-6 py-4 text-slate-300">{person.designation}</td>
                <td className="px-6 py-4 text-right">
                  <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded text-[11px] font-bold">
                    <UserCheck className="w-3.5 h-3.5" />
                    AUTHORIZED
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
