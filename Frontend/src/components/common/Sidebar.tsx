'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Tooltip } from './Tooltip';
import {
  LayoutDashboard,
  FolderLock,
  FileCheck,
  ShieldAlert,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname() || '/dashboard';
  const { currentUser } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!currentUser) return null;
  const role = currentUser.role;

  const navItems = [
    {
      name: 'Dashboard Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: [
        'Senior Officer',
        'Investigating Officer',
        'Forensic Officer',
        'Prosecutor',
        'Court User',
        'Auditor / Security',
        'Admin',
      ],
    },
    {
      name: 'Case Passports',
      href: '/dashboard/cases',
      icon: FolderLock,
      roles: [
        'Senior Officer',
        'Investigating Officer',
        'Forensic Officer',
        'Prosecutor',
        'Court User',
        'Auditor / Security',
        'Admin',
      ],
    },
    {
      name: 'Integrity Verification',
      href: '/dashboard/verification',
      icon: FileCheck,
      roles: [
        'Senior Officer',
        'Forensic Officer',
        'Prosecutor',
        'Court User',
        'Auditor / Security',
        'Admin',
      ],
    },
    {
      name: 'Security Audit & Logs',
      href: '/dashboard/audit',
      icon: ShieldAlert,
      roles: [
        'Senior Officer',
        'Prosecutor',
        'Auditor / Security',
        'Admin',
      ],
    },
    {
      name: 'Admin & System Config',
      href: '/dashboard/admin',
      icon: Settings,
      roles: ['Admin', 'Senior Officer'],
    },
  ];

  const visibleNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside
      className={`bg-white dark:bg-navy-900 border-r border-slate-200 dark:border-navy-800 flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)] transition-all duration-200 ${
        collapsed ? 'w-16 items-center px-2' : 'w-64'
      }`}
    >
      <div className="space-y-5 w-full">
        {/* Collapse Toggle Control */}
        <div className="flex items-center justify-end pb-2 border-b border-slate-200 dark:border-navy-800">
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle Sidebar Navigation"
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-850 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Role Clearance Card */}
        {!collapsed && (
          <div className="bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-lg p-3">
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Active Clearance
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="text-xs font-bold text-slate-900 dark:text-white tracking-wide font-mono uppercase truncate">{currentUser.role}</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">{currentUser.department}</div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1 w-full">
          {!collapsed && (
            <div className="px-2 py-1 text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Navigation Menu
            </div>
          )}
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            const navLink = (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  collapsed ? 'justify-center px-2' : ''
                } ${
                  isActive
                    ? 'bg-blue-50 dark:bg-navy-850 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-950 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );

            return collapsed ? (
              <Tooltip key={item.name} content={item.name} position="right">
                {navLink}
              </Tooltip>
            ) : (
              navLink
            );
          })}
        </nav>
      </div>

      {/* Footer Status info */}
      {!collapsed && (
        <div className="border-t border-slate-200 dark:border-navy-800 pt-3 text-[11px] font-mono text-slate-500 dark:text-slate-400 space-y-1 w-full">
          <div className="flex justify-between items-center">
            <span>NETWORK:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">ONLINE</span>
          </div>
          <div className="flex justify-between items-center">
            <span>ENGINE:</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">RBAC v2.0</span>
          </div>
        </div>
      )}
    </aside>
  );
};
