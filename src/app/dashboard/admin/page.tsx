'use client';

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { MOCK_USERS } from '../../../mock/users';
import { Settings, ShieldCheck, UserCheck, Lock } from 'lucide-react';
import { Role } from '../../../types/auth';

export default function AdminPage() {
  const { currentUser, switchRole } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-navy-900 border border-slate-800 rounded-xl p-6 shadow-lg flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <Settings className="w-4 h-4 text-purple-400" />
            <span>ADMINISTRATION & SYSTEM GOVERNANCE</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            User Persona & Access Control Policy Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage system roles, clearances, assigned cases, and active user sessions.
          </p>
        </div>
        <span className="text-xs font-mono bg-purple-950 text-purple-300 border border-purple-800 px-3 py-1 rounded font-bold uppercase">
          ADMIN CONSOLE
        </span>
      </div>

      {/* Users & Roles Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-400" />
            Configured Demo Users & Role Clearances ({MOCK_USERS.length})
          </h3>
          <span className="text-[11px] font-mono text-slate-400">7 SYSTEM ROLES ACTIVE</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-navy-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">User Name & Email</th>
                <th className="px-6 py-3">Assigned Role</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Assigned Cases</th>
                <th className="px-6 py-3 text-right">Switch Persona</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {MOCK_USERS.map((usr) => (
                <tr key={usr.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{usr.name}</div>
                    <div className="text-[10px] text-slate-400">{usr.email}</div>
                  </td>
                  <td className="px-6 py-4 text-blue-400 font-bold">{usr.role}</td>
                  <td className="px-6 py-4 text-slate-400">{usr.department}</td>
                  <td className="px-6 py-4 text-emerald-400 font-bold">{usr.assignedCaseIds.length} Cases</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => switchRole(usr.role as Role)}
                      className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all ${
                        currentUser.role === usr.role
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 cursor-default'
                          : 'bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/40'
                      }`}
                    >
                      {currentUser.role === usr.role ? '✓ Active Session' : 'Switch Persona'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
