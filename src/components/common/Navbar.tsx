'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MOCK_USERS } from '../../mock/users';
import { Role } from '../../types/auth';
import { Shield, UserCheck, ChevronDown, LogOut, Lock } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, switchRole, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-navy-900 border-b border-navy-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-navy-800 border border-slate-700 flex items-center justify-center text-blue-400 shadow-inner">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold tracking-wider text-lg text-white">CASETRACE</span>
              <span className="text-[10px] font-mono bg-blue-950 text-blue-400 border border-blue-800 px-1.5 py-0.2 rounded">
                PASSPORT v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans tracking-wide">
              Secure Digital Case Passport & RBAC Engine
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          {/* Active Security Context Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-900/90 border border-slate-800 rounded-md text-xs font-mono">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">CLEARANCE:</span>
            <span className="text-emerald-400 font-semibold uppercase">{currentUser.role}</span>
          </div>

          {/* Role Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 bg-navy-850 hover:bg-navy-800 border border-slate-700 px-3 py-1.5 rounded-lg text-left transition-all"
            >
              <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-blue-300">
                {currentUser.avatar}
              </div>
              <div className="hidden sm:block text-xs">
                <div className="font-semibold text-slate-200">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400">{currentUser.role}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Persona Switcher Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-2 z-50">
                <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Switch Demo Persona (7 Roles)
                </div>
                <div className="max-h-72 overflow-y-auto py-1">
                  {MOCK_USERS.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        switchRole(user.role as Role);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors ${
                        currentUser.role === user.role ? 'bg-slate-800 border-l-2 border-blue-500' : ''
                      }`}
                    >
                      <div>
                        <div className="font-medium text-slate-200 flex items-center gap-1.5">
                          {user.name}
                          {currentUser.role === user.role && (
                            <UserCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">{user.role} • {user.department}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="border-t border-slate-800 mt-1 pt-1 px-2">
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/40 rounded flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Reset / Sign Out Session
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
