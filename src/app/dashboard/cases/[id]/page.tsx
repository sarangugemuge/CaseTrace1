'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { caseService } from '../../../../services/caseService';
import { accessControlEngine } from '../../../../services/accessControlEngine';
import { Document } from '../../../../types/document';
import { CaseHeader } from '../../../../components/passport/CaseHeader';
import { DocumentTable } from '../../../../components/passport/DocumentTable';
import { DocumentDetailModal } from '../../../../components/passport/DocumentDetailModal';
import { OverviewTab } from '../../../../components/passport/OverviewTab';
import { EvidenceTab } from '../../../../components/passport/EvidenceTab';
import { PeopleTab } from '../../../../components/passport/PeopleTab';
import { IntegrityTab } from '../../../../components/passport/IntegrityTab';
import { TimelineTab } from '../../../../components/passport/TimelineTab';
import { SecurityViewTab } from '../../../../components/passport/SecurityViewTab';
import {
  FolderLock,
  FileText,
  Shield,
  UserCheck,
  Clock,
  ShieldAlert,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';

export default function CasePassportDetailPage() {
  const params = useParams();
  const caseId = (params?.id as string) || 'CASE-2026-8942';

  const { currentUser } = useAuth();
  const caseData = caseService.getCaseById(caseId);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'documents' | 'evidence' | 'people' | 'timeline' | 'integrity' | 'security'
  >('overview');

  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  if (!caseData) {
    return (
      <div className="p-8 font-mono text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl">
        <AlertTriangle className="w-6 h-6 mb-2" />
        <h2 className="text-lg font-bold">CASE PASSPORT NOT FOUND</h2>
        <p className="text-xs mt-1">The requested Case Passport ID {caseId} does not exist or access has been revoked.</p>
      </div>
    );
  }

  // Evaluate Case-Level Authorization
  const caseDecision = accessControlEngine.evaluateAccess(currentUser, caseData, undefined, 'VIEW');

  if (!caseDecision.allowed) {
    return (
      <div className="p-8 font-mono text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 rounded-xl space-y-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-rose-600 dark:text-rose-400 shrink-0" />
          <div>
            <h2 className="text-lg font-bold">ACCESS DENIED FOR ROLE: {currentUser.role}</h2>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">{caseDecision.reason}</p>
          </div>
        </div>
        <div className="text-[11px] bg-slate-900 text-slate-200 p-3 rounded font-mono">
          POLICY VIOLATION: {caseDecision.policyId} • UNASSIGNED PERSONA
        </div>
      </div>
    );
  }

  const documents = caseService.getCaseDocuments(caseId);

  const handleSelectDoc = (doc: Document) => {
    setSelectedDoc(doc);
    setModalOpen(true);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FolderLock },
    { id: 'documents', label: `Documents (${documents.length})`, icon: FileText },
    { id: 'evidence', label: 'Evidence Artifacts', icon: Shield },
    { id: 'people', label: 'People & Roles', icon: UserCheck },
    { id: 'timeline', label: 'Chain of Custody', icon: Clock },
    { id: 'integrity', label: 'Integrity Verification', icon: FileCheck },
    { id: 'security', label: 'Security & Audit View', icon: ShieldAlert },
  ];

  return (
    <div className="space-y-6">
      {/* Case Passport Flagship Header */}
      <CaseHeader caseData={caseData} />

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-2 font-mono text-xs overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-navy-900/50'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div className="pt-2">
        {activeTab === 'overview' && <OverviewTab caseData={caseData} />}

        {activeTab === 'documents' && (
          <DocumentTable
            documents={documents}
            user={currentUser}
            caseData={caseData}
            onSelectDocument={handleSelectDoc}
          />
        )}

        {activeTab === 'evidence' && <EvidenceTab caseData={caseData} />}

        {activeTab === 'people' && <PeopleTab caseData={caseData} />}

        {activeTab === 'timeline' && <TimelineTab caseData={caseData} />}

        {activeTab === 'integrity' && <IntegrityTab caseData={caseData} />}

        {activeTab === 'security' && <SecurityViewTab caseData={caseData} />}
      </div>

      {/* Interactive Document Inspection Modal */}
      <DocumentDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        document={selectedDoc}
        caseData={caseData}
        user={currentUser}
      />
    </div>
  );
}
