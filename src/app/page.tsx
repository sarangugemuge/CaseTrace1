'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { MOCK_USERS } from '../mock/users';
import { Role } from '../types/auth';
import { Shield, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const { currentUser, switchRole } = useAuth();

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-8">
      {/* Hero Welcome */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-950 border border-blue-800 rounded-full text-blue-400 font-mono text-xs font-semibold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            SECURE DIGITAL CASE PASSPORT ARCHITECTURE
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            CASETRACE Control & Authorization Gateway
          </h1>
          <p className="text-slate-300 max-w-3xl leading-relaxed text-sm">
            Core Principle: <span className="font-mono text-blue-400 font-bold">ONE CASE → ONE DIGITAL CASE PASSPORT → MULTIPLE SECURE VIEWS</span>. Access decisions dynamically combine User Role, Case Assignment, Document Sensitivity, and Declared Purpose.
          </p>

          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold rounded-lg text-xs tracking-wider uppercase flex items-center gap-2 shadow-lg transition-all"
            >
              Enter Dashboard as ({currentUser.role})
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Role Persona Switcher Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Select Active Demo Persona (7 Specialized Roles)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Click any persona to immediately re-evaluate all access permissions across the entire platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_USERS.map((user) => {
            const isCurrent = currentUser.role === user.role;

            return (
              <div
                key={user.id}
                onClick={() => switchRole(user.role as Role)}
                className={`cursor-pointer rounded-xl p-4 border transition-all ${
                  isCurrent
                    ? 'bg-navy-850 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                    : 'bg-navy-950 border-slate-800 hover:border-slate-700 hover:bg-navy-900'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 font-mono font-bold text-sm text-blue-400 flex items-center justify-center">
                    {user.avatar}
                  </div>
                  {isCurrent && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <h3 className="text-sm font-bold text-white">{user.name}</h3>
                  <p className="text-xs font-mono text-blue-400 font-semibold">{user.role}</p>
                  <p className="text-[11px] text-slate-400 mt-1 truncate">{user.department}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
