'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { caseService } from '../../../../services/caseService';
import { auditService } from '../../../../services/auditService';
import { verificationService } from '../../../../services/verificationService';
import { riskEngine } from '../../../../services/riskEngine';
import { CaseHeader } from '../../../../components/passport/CaseHeader';
import { ViewSelector, TabId } from '../../../../components/passport/ViewSelector';
import { DocumentTable } from '../../../../components/passport/DocumentTable';
import { OverviewTab } from '../../../../components/passport/OverviewTab';
import { EvidenceTab } from '../../../../components/passport/EvidenceTab';
import { PeopleTab } from '../../../../components/passport/PeopleTab';
import { IntegrityTab } from '../../../../components/passport/IntegrityTab';
import { TimelineTab } from '../../../../components/passport/TimelineTab';
import { DocumentDetailModal } from '../../../../components/passport/DocumentDetailModal';
import { BlockchainBadge } from '../../../../components/passport/BlockchainBadge';
import { AccessAuditLog } from '../../../../components/security/AccessAuditLog';
import { RiskScoreCard } from '../../../../components/security/RiskScoreCard';
import { Document } from '../../../../types/document';
import { Role } from '../../../../types/auth';
import { ShieldAlert, Activity } from 'lucide-react';

export default function CasePassportPage() {
  const params = useParams();
  const caseId = (params?.id as string) || 'CASE-2026-8942';

  const { currentUser } = useAuth();
  const { caseData, documents } = caseService.getCasePassport(caseId);

  // Role default tab mapping
  const getDefaultTabForRole = (role: Role): TabId => {
    switch (role) {
      case 'Forensic Officer':
        return 'evidence';
      case 'Prosecutor':
      case 'Court User':
        return 'documents';
      case 'Auditor / Security':
        return 'security';
      default:
        return 'overview';
    }
  };

  const [activeTab, setActiveTab] = useState<TabId>(getDefaultTabForRole(currentUser.role));
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Re-sync tab when currentUser role changes
  useEffect(() => {
    setActiveTab(getDefaultTabForRole(currentUser.role));
  }, [currentUser.role]);

  if (!caseData) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 font-mono">
        Case Record Not Found: {caseId}
      </div>
    );
  }

  const handleSelectDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setDetailModalOpen(true);
  };

  const simulatedBlock = verificationService.getBlockchainRecord(
    caseData.blockchainAnchorId,
    caseData.caseId,
    documents[0]?.sha256Hash || 'e3b0c44298fc1c149afbf'
  );

  const logs = auditService.getLogs().filter((l) => !l.caseId || l.caseId === caseData.caseId);
  const riskAssessment = riskEngine.assessAccessRisk(currentUser, caseData);
  const alerts = riskEngine.getMockAlerts().filter((a) => !a.caseId || a.caseId === caseData.caseId);

  return (
    <div className="space-y-6">
      {/* Central Case Header */}
      <CaseHeader caseData={caseData} />

      {/* Blockchain Anchor Status Badge */}
      <BlockchainBadge
        blockNumber={simulatedBlock.blockNumber}
        transactionId={simulatedBlock.transactionId}
        merkleRoot={simulatedBlock.merkleRoot}
      />

      {/* Role-Aware Tab Switcher */}
      <ViewSelector
        currentRole={currentUser.role}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content Rendering */}
      {activeTab === 'overview' && <OverviewTab caseData={caseData} />}

      {activeTab === 'documents' && (
        <DocumentTable
          documents={documents}
          user={currentUser}
          caseData={caseData}
          onSelectDocument={handleSelectDocument}
        />
      )}

      {activeTab === 'evidence' && <EvidenceTab caseId={caseData.caseId} user={currentUser} />}

      {activeTab === 'timeline' && <TimelineTab caseId={caseData.caseId} />}

      {activeTab === 'people' && (
        <PeopleTab assignedUserIds={caseData.assignedUsers} currentUser={currentUser} />
      )}

      {activeTab === 'integrity' && <IntegrityTab documents={documents} caseId={caseData.caseId} />}

      {activeTab === 'access_history' && <AccessAuditLog logs={logs} />}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <RiskScoreCard assessment={riskAssessment} />
          
          {/* Security Alerts List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Active Anomaly & Security Risk Alerts ({alerts.length})
              </h3>
            </div>
            <div className="space-y-3">
              {alerts.map((alt) => (
                <div key={alt.alertId} className="bg-navy-950 border border-amber-900/60 rounded-lg p-4 space-y-1">
                  <div className="flex justify-between items-center text-amber-400 font-bold">
                    <span>{alt.alertId} • {alt.riskLevel} RISK ({alt.riskScore}/100)</span>
                    <span className="text-[10px] text-slate-500">{new Date(alt.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-slate-200">{alt.reason}</div>
                  <div className="text-[11px] text-blue-300">Action: {alt.recommendedAction}</div>
                </div>
              ))}
            </div>
          </div>

          <AccessAuditLog logs={logs} />
        </div>
      )}

      {/* Document Detail Action & Purpose Modal */}
      <DocumentDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        document={selectedDocument}
        caseData={caseData}
        user={currentUser}
      />
    </div>
  );
}
