'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FolderLock,
  FileCheck,
  ShieldAlert,
  Settings,
  Shield,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname() || '/dashboard';
  const { currentUser } = useAuth();
  const role = currentUser.role;

  // Role-aware navigation items
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
    <aside className="w-64 bg-navy-950 border-r border-navy-850 flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Role Badge Section */}
        <div className="bg-navy-900 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
            Active Security Clearance
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-white tracking-wide">{currentUser.role}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">{currentUser.department}</div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          <div className="px-2 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">
            Navigation Menu
          </div>
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="border-t border-slate-800 pt-3 text-[11px] font-mono text-slate-400 space-y-1">
        <div>STATUS: <span className="text-emerald-400 font-bold">ONLINE</span></div>
        <div>SIMULATED BACKEND</div>
      </div>
    </aside>
  );
};
