'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { MOCK_USERS } from '../mock/users';
import { Role } from '../types/auth';
import { Shield, ArrowRight, Lock, CheckCircle2, XCircle } from 'lucide-react';
import { ROLE_PERMISSIONS } from '../types/rolePermissions';

export default function Home() {
  const { currentUser, switchRole } = useAuth();

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      {/* Hero Welcome */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-card relative overflow-hidden transition-colors">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-full text-blue-700 dark:text-blue-400 font-mono text-xs font-semibold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            SECURE DIGITAL CASE PASSPORT ARCHITECTURE
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-4xl">
            CASETRACE Control & Authorization Gateway
          </h1>
          <p className="text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed text-sm">
            Core Principle: <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">ONE CASE → ONE DIGITAL CASE PASSPORT → MULTIPLE SECURE VIEWS</span>. Access decisions dynamically combine User Role, Case Assignment, Document Sensitivity, and Declared Purpose.
          </p>

          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold rounded-lg text-xs tracking-wider uppercase flex items-center gap-2 shadow-md transition-all"
            >
              Enter Dashboard as ({currentUser.role})
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Role Persona Switcher Matrix */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-card space-y-4 transition-colors">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 rounded">
              DEMO MODE • EVALUATION SIMULATION
            </span>
            <span className="text-xs font-mono text-slate-400">7 SPECIALIZED SYSTEM ROLES</span>
          </div>
          <h2 className="text-base font-bold font-mono text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Select Active Demo Persona
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Click any demo persona to immediately simulate credentials. All access policies are authoritatively verified server-side by the FastAPI backend.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_USERS.map((user) => {
            const isCurrent = currentUser.role === user.role;
            const perms = ROLE_PERMISSIONS[user.role as Role];

            return (
              <div
                key={user.id}
                onClick={() => switchRole(user.role as Role)}
                className={`cursor-pointer rounded-xl p-4 border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-blue-50/50 dark:bg-navy-850 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                    : 'bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-lg bg-blue-600 dark:bg-slate-800 border border-blue-500 dark:border-slate-700 font-mono font-bold text-sm text-white dark:text-blue-400 flex items-center justify-center">
                      {user.avatar}
                    </div>
                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <div className="mt-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</h3>
                    <p className="text-xs font-mono text-blue-600 dark:text-blue-400 font-semibold">{user.role}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{user.department}</p>
                  </div>

                  {/* Concise Can / Cannot Preview */}
                  {perms && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-[10px]">
                      <div className="space-y-0.5">
                        <div className="font-mono font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Can:</span>
                        </div>
                        <ul className="text-slate-600 dark:text-slate-300 space-y-0.5 pl-3 list-disc">
                          {perms.can.slice(0, 2).map((c: string, i: number) => (
                            <li key={i} className="truncate" title={c}>{c}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-0.5 pt-1">
                        <div className="font-mono font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                          <XCircle className="w-2.5 h-2.5" />
                          <span>Cannot:</span>
                        </div>
                        <ul className="text-slate-600 dark:text-slate-300 space-y-0.5 pl-3 list-disc">
                          {perms.cannot.slice(0, 2).map((c: string, i: number) => (
                            <li key={i} className="truncate" title={c}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
