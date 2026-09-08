'use client';

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Document } from '../../types/document';
import { CasePassport } from '../../types/case';
import { User } from '../../types/auth';
import { accessControlEngine, AccessAction } from '../../services/accessControlEngine';
import { auditService } from '../../services/auditService';
import { riskEngine } from '../../services/riskEngine';
import { SensitivityBadge, IntegrityBadge, RiskBadge } from '../common/Badge';
import { PurposeAccessModal } from './PurposeAccessModal';
import { ShareModal } from './ShareModal';
import { apiClient } from '../../lib/apiClient';
import {
  FileText,
  Eye,
  Download,
  Share2,
  ShieldAlert,
  CheckCircle2,
  FileCheck,
  RefreshCw,
  HardDrive,
} from 'lucide-react';
import { AccessDecision } from '../../types/security';

interface DocumentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  caseData: CasePassport;
  user: User;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  isOpen,
  onClose,
  document,
  caseData,
  user,
}) => {
  const [pendingAction, setPendingAction] = useState<AccessAction | null>(null);
  const [declaredPurpose, setDeclaredPurpose] = useState<string>('');
  const [purposeModalOpen, setPurposeModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [lastDecision, setLastDecision] = useState<AccessDecision | null>(null);

  const [viewingPreview, setViewingPreview] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [verifyNotice, setVerifyNotice] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!document) return null;

  const triggerAction = async (action: AccessAction, customPurpose?: string) => {
    const purposeToUse = customPurpose || declaredPurpose;
    const decision = accessControlEngine.evaluateAccess(user, caseData, document, action, purposeToUse);
    setLastDecision(decision);

    if (decision.requiresPurpose && !purposeToUse) {
      setPendingAction(action);
      setPurposeModalOpen(true);
      return;
    }

    const riskAssessment = riskEngine.assessAccessRisk(user, caseData, document, purposeToUse);

    if (decision.allowed) {
      auditService.logEvent(user, action === 'VIEW' ? 'DOCUMENT_VIEW' : action === 'DOWNLOAD' ? 'DOCUMENT_DOWNLOAD' : action === 'SHARE' ? 'DOCUMENT_SHARE' : 'INTEGRITY_VERIFICATION', {
        caseId: caseData.caseId,
        documentId: document.id,
        purpose: purposeToUse || 'Standard Authorization',
        result: 'SUCCESS',
        riskLevel: decision.riskLevel,
        description: `Action '${action}' granted on '${document.name}' under policy ${decision.policyId}.`,
      });

      if (action === 'VIEW') {
        setViewingPreview(true);
      } else if (action === 'DOWNLOAD') {
        try {
          const blob = await apiClient.downloadDocument(document.id, purposeToUse || 'INVESTIGATION');
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = window.document.createElement('a');
            a.href = url;
            a.download = document.name;
            a.click();
            URL.revokeObjectURL(url);
            setDownloadNotice(`SECURE DOWNLOAD COMPLETE: '${document.name}' downloaded from S3 storage.`);
          }
        } catch (err: any) {
          setDownloadNotice(`DOWNLOAD ERROR: ${err.message}`);
        }
      } else if (action === 'SHARE') {
        setShareModalOpen(true);
      } else if (action === 'VERIFY') {
        setIsVerifying(true);
        setVerifyNotice(null);
        try {
          const vRes = await apiClient.verifyDocumentIntegrity(document.id);
          if (vRes.match) {
            setVerifyNotice(`✓ INTEGRITY VERIFIED (SHA-256 MATCH): ${vRes.details}`);
          } else {
            setVerifyNotice(`⚠ INTEGRITY ALERT (${vRes.status}): ${vRes.details}`);
          }
        } catch (vErr: any) {
          setVerifyNotice(`VERIFICATION ERROR: ${vErr.message}`);
        } finally {
          setIsVerifying(false);
        }
      }
    } else {
      auditService.logEvent(user, 'ACCESS_DENIED', {
        caseId: caseData.caseId,
        documentId: document.id,
        purpose: purposeToUse || 'Unspecified',
        result: 'DENIED',
        riskLevel: decision.riskLevel,
        description: `Action '${action}' DENIED on '${document.name}'. Reason: ${decision.reason}`,
      });

      if (decision.riskLevel === 'CRITICAL' || decision.riskLevel === 'HIGH') {
        riskEngine.recordAlert({
          userId: user.id,
          userName: user.name,
          role: user.role,
          caseId: caseData.caseId,
          documentId: document.id,
          riskScore: riskAssessment.riskScore,
          riskLevel: decision.riskLevel,
          reason: decision.reason,
          recommendedAction: riskAssessment.recommendedAction,
        });
      }
    }
  };

  const handlePurposeSubmitted = (purposeStr: string) => {
    setDeclaredPurpose(purposeStr);
    if (pendingAction) {
      triggerAction(pendingAction, purposeStr);
      setPendingAction(null);
    }
  };

  const handleShareExecuted = (recipientRole: string, sharePurpose: string, expirationHours: number) => {
    auditService.logEvent(user, 'DOCUMENT_SHARE', {
      caseId: caseData.caseId,
      documentId: document.id,
      purpose: sharePurpose,
      result: 'SUCCESS',
      riskLevel: 'MEDIUM',
      description: `Issued temporary share grant for ${document.name} to role '${recipientRole}' expiring in ${expirationHours}h.`,
    });
    setShareNotice(`SHARE REQUEST CREATED: Temporary grant issued to ${recipientRole} (${expirationHours}h validity).`);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`Document Passport: ${document.name}`}>
        <div className="space-y-5 font-mono text-xs text-slate-800 dark:text-slate-200">
          {/* Metadata Grid */}
          <div className="bg-slate-50 dark:bg-navy-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-850">
              <span className="text-slate-500 dark:text-slate-400">CLASSIFICATION:</span>
              <SensitivityBadge sensitivity={document.sensitivity} />
            </div>
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span className="text-slate-500">CATEGORY / TYPE:</span>
              <span>{document.category} ({document.type})</span>
            </div>
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span className="text-slate-500">VERSION:</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">v{document.version}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span className="text-slate-500">UPLOADED BY:</span>
              <span>{document.uploadedBy} ({new Date(document.uploadedAt).toLocaleDateString()})</span>
            </div>
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-850">
              <span className="text-slate-500 flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-blue-500" />
                S3 OBJECT KEY:
              </span>
              <span className="font-bold text-[11px] text-slate-900 dark:text-slate-100 max-w-[220px] truncate">
                {document.storageKey || `cases/${caseData.caseId}/${document.id}/${document.name}`}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-850">
              <span className="text-slate-500 block mb-1">AUTHORITATIVE SHA-256 DIGEST:</span>
              <div className="text-blue-700 dark:text-blue-300 text-[11px] bg-slate-100 dark:bg-slate-950 p-2 rounded border border-slate-300 dark:border-slate-800 break-all font-bold">
                {document.sha256Hash}
              </div>
            </div>
          </div>

          {/* Action Triggers */}
          <div>
            <span className="block text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider mb-2">
              Request Document Action:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => triggerAction('VIEW')}
                className="p-2.5 bg-blue-50 dark:bg-blue-600/20 hover:bg-blue-100 dark:hover:bg-blue-600/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/40 rounded flex flex-col items-center gap-1 transition-all"
              >
                <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>VIEW</span>
              </button>
              <button
                onClick={() => triggerAction('DOWNLOAD')}
                className="p-2.5 bg-emerald-50 dark:bg-emerald-600/20 hover:bg-emerald-100 dark:hover:bg-emerald-600/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 rounded flex flex-col items-center gap-1 transition-all"
              >
                <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>DOWNLOAD</span>
              </button>
              <button
                onClick={() => triggerAction('SHARE')}
                className="p-2.5 bg-purple-50 dark:bg-purple-600/20 hover:bg-purple-100 dark:hover:bg-purple-600/40 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/40 rounded flex flex-col items-center gap-1 transition-all"
              >
                <Share2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>SHARE</span>
              </button>
              <button
                disabled={isVerifying}
                onClick={() => triggerAction('VERIFY')}
                className="p-2.5 bg-amber-50 dark:bg-amber-600/20 hover:bg-amber-100 dark:hover:bg-amber-600/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 rounded flex flex-col items-center gap-1 transition-all disabled:opacity-50"
              >
                {isVerifying ? <RefreshCw className="w-4 h-4 animate-spin text-amber-600" /> : <FileCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                <span>{isVerifying ? 'VERIFYING...' : 'VERIFY'}</span>
              </button>
            </div>
          </div>

          {/* Access Decision Banner */}
          {lastDecision && (
            <div
              className={`p-4 rounded-xl border ${
                lastDecision.allowed
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-300 animate-pulse'
              }`}
            >
              <div className="flex items-center justify-between font-bold mb-1">
                <span className="flex items-center gap-1.5 uppercase">
                  {lastDecision.allowed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  )}
                  {lastDecision.allowed ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                </span>
                <RiskBadge level={lastDecision.riskLevel} />
              </div>
              <p className="text-[11px] mt-1 opacity-90">{lastDecision.reason}</p>
            </div>
          )}

          {/* Action Notifications */}
          {downloadNotice && (
            <div className="bg-emerald-100 dark:bg-emerald-950 p-3 rounded border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-[11px]">
              {downloadNotice}
            </div>
          )}
          {shareNotice && (
            <div className="bg-purple-100 dark:bg-purple-950 p-3 rounded border border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-300 text-[11px]">
              {shareNotice}
            </div>
          )}
          {verifyNotice && (
            <div className="bg-amber-100 dark:bg-amber-950 p-3 rounded border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-[11px]">
              {verifyNotice}
            </div>
          )}

          {/* Document Preview Panel */}
          {viewingPreview && lastDecision?.allowed && (
            <div className="bg-slate-100 dark:bg-slate-950 p-5 rounded-xl border border-slate-300 dark:border-slate-800 relative overflow-hidden space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="font-bold text-slate-900 dark:text-white uppercase text-xs">DOCUMENT PREVIEW CONTAINER</span>
                <IntegrityBadge status={document.integrityStatus} />
              </div>

              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans bg-white dark:bg-slate-900/90 p-4 rounded border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="font-mono text-blue-600 dark:text-blue-400 font-bold">{"[OFFICIAL INVESTIGATION RECORD]"}</div>
                <p>
                  Secure payload container for artifact{' '}
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{document.name}</span> in Case{' '}
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{caseData.caseNumber}</span>.
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  Storage Key: {document.storageKey || 'metadata-only'} | SHA-256: {document.sha256Hash.slice(0, 16)}...
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <PurposeAccessModal
        isOpen={purposeModalOpen}
        onClose={() => setPurposeModalOpen(false)}
        document={document}
        onSubmitPurpose={handlePurposeSubmitted}
      />

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        document={document}
        onShare={handleShareExecuted}
      />
    </>
  );
};
