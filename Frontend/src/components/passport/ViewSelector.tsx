'use client';

import React from 'react';
import { Role } from '../../types/auth';

export type TabId =
  | 'overview'
  | 'documents'
  | 'evidence'
  | 'timeline'
  | 'people'
  | 'integrity'
  | 'access_history'
  | 'security';

interface ViewSelectorProps {
  currentRole: Role;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export const ViewSelector: React.FC<ViewSelectorProps> = ({
  currentRole,
  activeTab,
  onTabChange,
}) => {
  // Tabs allowed per role
  const roleTabPermissions: Record<Role, TabId[]> = {
    'Senior Officer': ['overview', 'documents', 'evidence', 'timeline', 'people', 'integrity', 'access_history', 'security'],
    'Investigating Officer': ['overview', 'documents', 'evidence', 'timeline', 'people'],
    'Cyber Crime Investigating Officer': ['overview', 'documents', 'evidence', 'timeline', 'people', 'integrity'],
    'Forensic Officer': ['evidence', 'overview', 'documents', 'integrity', 'timeline'],
    'Prosecutor': ['documents', 'overview', 'people', 'timeline', 'access_history'],
    'Court User': ['documents', 'overview', 'timeline'],
    'Auditor / Security': ['security', 'overview', 'access_history', 'integrity'],
    'Admin': ['overview', 'documents', 'evidence', 'timeline', 'people', 'integrity', 'access_history', 'security'],
  };

  const allTabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'documents', label: 'Documents' },
    { id: 'evidence', label: 'Evidence' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'people', label: 'People' },
    { id: 'integrity', label: 'Integrity' },
    { id: 'access_history', label: 'Access History' },
    { id: 'security', label: 'Security View' },
  ];

  const allowedTabsForRole = roleTabPermissions[currentRole] || roleTabPermissions['Senior Officer'];
  const visibleTabs = allTabs.filter((t) => allowedTabsForRole.includes(t.id));

  return (
    <div className="flex border-b border-slate-800 space-x-1 overflow-x-auto pb-2 mb-6">
      {visibleTabs.map((t) => {
        const isActive = activeTab === t.id;

        return (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`px-4 py-2 text-xs font-mono rounded-t-lg transition-all whitespace-nowrap ${
              isActive
                ? 'bg-blue-600/20 text-blue-400 border-t-2 border-blue-500 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
};
