'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { MOCK_USERS } from '../../../mock/users';
import { Settings, Shield, UserCheck, Lock, Sliders, Database, Server } from 'lucide-react';
import { PermissionDeniedState } from '../../../components/common/UXStates';

export default function AdminPage() {
  const { currentUser } = useAuth();
  const isAuthorized = currentUser.role === 'Admin' || currentUser.role === 'Senior Officer';

  if (!isAuthorized) {
    return (
      <div className="max-w-3xl mx-auto my-8">
        <PermissionDeniedState
          role={currentUser.role}
          reason={`Your current demo role "${currentUser.role}" (${currentUser.name}) lacks clearance to access the System Governance and Policy Console. Administrative actions are restricted exclusively to Admin and Senior Officer personas.`}
          policyId="POL-ADMIN-RESTRICTED-01"
          onReturnHref="/dashboard"
          onReturnText="Return to Dashboard"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-card flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mb-1">
            <span>SYSTEM GOVERNANCE:</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold uppercase">ADMINISTRATIVE ACCESS</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Role & Security Policy Console
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            System Administration: Access is controlled according to the user&apos;s role (RBAC). Configure user personas, system rules, and backend fallback configurations.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-3 py-2 rounded-lg font-bold">
          <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          POLICY ENGINE v2.4 ACTIVE
        </div>
      </div>

      {/* Role Management Matrix */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-card transition-colors space-y-4">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
          <h2 className="text-sm font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Configured System User Personas ({MOCK_USERS.length})
          </h2>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">7 ACTIVE ROLES</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th scope="col" className="px-4 py-3">User Name</th>
                <th scope="col" className="px-4 py-3">Security Role</th>
                <th scope="col" className="px-4 py-3">Department</th>
                <th scope="col" className="px-4 py-3">Designation</th>
                <th scope="col" className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {MOCK_USERS.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-blue-600 dark:bg-slate-800 text-white dark:text-blue-400 text-[10px] font-mono font-bold flex items-center justify-center">
                      {user.avatar}
                    </div>
                    {user.name}
                  </td>
                  <td className="px-4 py-3 text-blue-600 dark:text-blue-400 font-bold">{user.role}</td>
                  <td className="px-4 py-3 text-slate-500">{user.department}</td>
                  <td className="px-4 py-3 text-slate-500">{user.designation}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded text-[10px]">
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Backend Integration Status */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-card transition-colors space-y-4">
        <h2 className="text-sm font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2">
          <Server className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          Backend API & Service Layer Status
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 p-4 rounded-lg space-y-1">
            <span className="text-slate-500 text-[10px]">FASTAPI REST BACKEND</span>
            <div className="font-bold text-slate-900 dark:text-white">http://localhost:8000/api</div>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">HEALTH: ONLINE / FALLBACK READY</span>
          </div>

          <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 p-4 rounded-lg space-y-1">
            <span className="text-slate-500 text-[10px]">SQLITE / POSTGRESQL DB</span>
            <div className="font-bold text-slate-900 dark:text-white">casetrace.db (ORM)</div>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">SEEDED WITH 7 PERSONAS</span>
          </div>

          <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 p-4 rounded-lg space-y-1">
            <span className="text-slate-500 text-[10px]">FRONTEND DEMO LAYER</span>
            <div className="font-bold text-slate-900 dark:text-white">Next.js 14 App Router</div>
            <span className="text-blue-600 dark:text-blue-400 font-bold text-[10px]">TRANSPARENT FALLBACK ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
