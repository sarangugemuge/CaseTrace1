'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { caseService } from '../../../../services/caseService';
import { apiClient } from '@/lib/apiClient';
import { accessControlEngine } from '../../../../services/accessControlEngine';
import { Document } from '../../../../types/document';
import { CasePassport } from '../../../../types/case';
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
  PermissionDeniedState,
  EmptyState,
  LoadingState,
} from '../../../../components/common/UXStates';
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
  const searchParams = useSearchParams();
  const caseId = (params?.id as string) || 'CASE-2026-8942';

  const tabParam = searchParams?.get('tab');
  const validTabs = ['overview', 'documents', 'evidence', 'people', 'timeline', 'integrity', 'security'];

  const { currentUser } = useAuth();
  const [caseData, setCaseData] = useState<CasePassport | null>(() => caseService.getCaseById(caseId) || null);
  const [loadingCase, setLoadingCase] = useState(!caseData);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'documents' | 'evidence' | 'people' | 'timeline' | 'integrity' | 'security'
  >((tabParam && validTabs.includes(tabParam) ? tabParam : 'overview') as any);

  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);

  const loadCase = useCallback(async () => {
    if (!caseId) return;
    try {
      const fetched = await apiClient.getCaseById(caseId);
      if (fetched) {
        setCaseData(fetched);
      }
    } catch (err) {
      console.warn('Could not load case from apiClient, using local store:', err);
      const local = caseService.getCaseById(caseId);
      if (local) setCaseData(local);
    } finally {
      setLoadingCase(false);
    }
  }, [caseId]);

  useEffect(() => {
    loadCase();
  }, [loadCase]);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState<boolean>(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadDocuments = useCallback(async () => {
    if (!caseId) return;
    setLoadingDocs(true);
    try {
      const docs = await apiClient.getCaseDocuments(caseId);
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load case documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  }, [caseId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  if (!currentUser) return null;

  if (loadingCase && !caseData) {
    return <LoadingState message="Loading Case Passport registry..." />;
  }

  if (!caseData) {
    return (
      <div className="space-y-4">
        <EmptyState
          title="Case Passport Not Found"
          description={`The requested Case Passport ID "${caseId}" does not exist in the registry or access has been revoked.`}
          icon={<AlertTriangle className="w-6 h-6 text-rose-500" />}
          actionText="Return to Case Directory"
          actionHref="/dashboard/cases"
        />
      </div>
    );
  }

  // Evaluate Case-Level Authorization
  const caseDecision = accessControlEngine.evaluateAccess(currentUser, caseData, undefined, 'VIEW');

  if (!caseDecision.allowed) {
    return (
      <PermissionDeniedState
        role={currentUser.role}
        reason={caseDecision.reason}
        policyId={caseDecision.policyId}
        caseNumber={caseData.caseNumber}
        onReturnHref="/dashboard/cases"
        onReturnText="Return to Case Directory"
      />
    );
  }

  const handleSelectDoc = (doc: Document) => {
    setSelectedDoc(doc);
    setModalOpen(true);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', hint: 'Summary and key details', icon: FolderLock },
    { id: 'documents', label: `Documents (${documents.length})`, hint: 'Case files and filings', icon: FileText },
    { id: 'evidence', label: 'Evidence Artifacts', hint: 'Digital evidence with SHA-256 digests', icon: Shield },
    { id: 'people', label: 'People & Roles', hint: 'Assigned personnel and RBAC clearance', icon: UserCheck },
    { id: 'timeline', label: 'Chain of Custody', hint: 'Chronological record of who handled evidence', icon: Clock },
    { id: 'integrity', label: 'Integrity Verification', hint: 'Checks whether documents changed since registration', icon: FileCheck },
    { id: 'security', label: 'Security & Audit View', hint: 'Immutable access log and risk scoring', icon: ShieldAlert },
  ];

  // Silent RBAC tab visibility: show only tabs cleared for current user role
  const roleAllowedTabs: Record<string, string[]> = {
    'Senior Officer': ['overview', 'documents', 'evidence', 'people', 'timeline', 'integrity', 'security'],
    'Investigating Officer': ['overview', 'documents', 'evidence', 'people', 'timeline'],
    'Cyber Crime Investigating Officer': ['overview', 'documents', 'evidence', 'people', 'timeline', 'integrity'],
    'Forensic Officer': ['overview', 'documents', 'evidence', 'timeline', 'integrity'],
    'Prosecutor': ['overview', 'documents', 'people', 'timeline'],
    'Court User': ['overview', 'documents', 'timeline'],
    'Auditor / Security': ['overview', 'timeline', 'integrity', 'security'],
    'Admin': ['overview', 'documents', 'evidence', 'people', 'timeline', 'integrity', 'security'],
  };

  const allowedTabIds = roleAllowedTabs[currentUser.role] || ['overview', 'documents'];
  const visibleTabs = tabs.filter((t) => allowedTabIds.includes(t.id));

  // If currently selected tab is not authorized for active role, fall back to first visible tab
  useEffect(() => {
    if (!allowedTabIds.includes(activeTab)) {
      setActiveTab((visibleTabs[0]?.id as any) || 'overview');
    }
  }, [currentUser.role, allowedTabIds, activeTab, visibleTabs]);

  return (
    <div className="space-y-6">
      {/* Case Passport Flagship Header */}
      <CaseHeader
        caseData={caseData}
        onCaseUpdated={(updated) => setCaseData(updated)}
      />

      {/* Navigation Tabs (Silently filtered by RBAC) */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-2 font-mono text-xs overflow-x-auto">
        {visibleTabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              title={`${t.label}: ${t.hint}`}
              aria-label={`${t.label}: ${t.hint}`}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold transition-all whitespace-nowrap focus:outline-hidden focus:ring-2 focus:ring-blue-500 rounded-t-lg ${
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
          loadingDocs && documents.length === 0 ? (
            <LoadingState
              message="Loading case documents..."
              description="Accessing secure document store and validating cryptographic ledger hashes."
            />
          ) : (
            <DocumentTable
              documents={documents}
              user={currentUser}
              caseData={caseData}
              onSelectDocument={handleSelectDoc}
              onRefreshDocuments={loadDocuments}
            />
          )
        )}

        {activeTab === 'evidence' && (
          loadingDocs && documents.length === 0 ? (
            <LoadingState
              message="Loading evidence artifacts..."
              description="Checking digital evidence records and cryptographic SHA-256 fingerprints."
            />
          ) : (
            <EvidenceTab
              caseData={caseData}
              documents={documents}
              onRefreshDocuments={loadDocuments}
            />
          )
        )}

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
        onDocumentUpdated={() => loadDocuments()}
      />
    </div>
  );
}
