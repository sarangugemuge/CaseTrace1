'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MOCK_USERS } from '../../mock/users';
import { Role } from '../../types/auth';
import { riskEngine } from '../../services/riskEngine';
import { ThemeToggle } from './ThemeToggle';
import { Shield, UserCheck, ChevronDown, LogOut, Lock, Search, Bell, X } from 'lucide-react';
import Link from 'next/link';

export const Navbar: React.FC = () => {
  const { currentUser, switchRole, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const alerts = riskEngine.getMockAlerts();

  return (
    <header className="bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white sticky top-0 z-40 shadow-xs transition-colors">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Platform Identifier */}
        <Link href="/dashboard" className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-blue-600 dark:bg-navy-800 border border-blue-500 dark:border-slate-700 flex items-center justify-center text-white dark:text-blue-400 shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold tracking-wider text-base text-slate-900 dark:text-white">CASETRACE</span>
              <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-1.5 py-0.2 rounded font-bold">
                PASSPORT v2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wide hidden sm:block">
              Secure Digital Case Passport & RBAC Engine
            </p>
          </div>
        </Link>

        {/* Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-sm relative items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Global search cases, documents, hashes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-blue-500 font-mono"
          />
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Active Security Context Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-md text-xs font-mono">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-slate-500 dark:text-slate-400">CLEARANCE:</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold uppercase">{currentUser.role}</span>
          </div>

          {/* Theme Switcher Button */}
          <ThemeToggle />

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              aria-label="Security Notifications"
              className="p-2 rounded-lg bg-slate-100 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-800 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center">
                  {alerts.length}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl shadow-xl p-4 z-50 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-2">
                  <span className="font-bold text-slate-900 dark:text-white uppercase text-[11px]">Security Alerts ({alerts.length})</span>
                  <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-4 h-4" /></button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {alerts.map((alt) => (
                    <div key={alt.alertId} className="bg-slate-50 dark:bg-navy-950 p-2.5 rounded border border-slate-200 dark:border-navy-800">
                      <div className="text-amber-700 dark:text-amber-400 font-bold text-[10px]">{alt.alertId} • {alt.riskLevel}</div>
                      <div className="text-slate-700 dark:text-slate-300 text-[11px] mt-0.5">{alt.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Role Persona Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 bg-slate-100 dark:bg-navy-850 hover:bg-slate-200 dark:hover:bg-navy-800 border border-slate-200 dark:border-navy-800 px-3 py-1.5 rounded-lg text-left transition-all"
            >
              <div className="w-7 h-7 rounded bg-blue-600 dark:bg-slate-800 border border-blue-500 dark:border-slate-700 font-mono font-bold text-xs text-white dark:text-blue-300 flex items-center justify-center">
                {currentUser.avatar}
              </div>
              <div className="hidden sm:block text-xs">
                <div className="font-bold text-slate-900 dark:text-slate-200">{currentUser.name}</div>
                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{currentUser.role}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </button>

            {/* Persona Switcher Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-lg shadow-xl py-2 z-50">
                <div className="px-3 py-1.5 border-b border-slate-200 dark:border-navy-800 text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Active Persona (7 System Roles)
                </div>
                <div className="max-h-72 overflow-y-auto py-1">
                  {MOCK_USERS.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        switchRole(user.role as Role);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-navy-800/80 transition-colors ${
                        currentUser.role === user.role ? 'bg-blue-50 dark:bg-navy-850 border-l-2 border-blue-600 dark:border-blue-400' : ''
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                          {user.name}
                          {currentUser.role === user.role && (
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 inline" />
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{user.role} • {user.department}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="border-t border-slate-200 dark:border-navy-800 mt-1 pt-1 px-2">
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded flex items-center gap-2 font-mono"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Reset Session
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
