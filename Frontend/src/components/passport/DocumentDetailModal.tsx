'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Document, DocumentVersion, SensitivityLevel, DocumentCategory } from '../../types/document';
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
  History,
  Edit,
  Upload,
  ArrowRight,
  GitCompare,
  FileCode,
  Image as ImageIcon,
  Video,
  File,
  AlertCircle
} from 'lucide-react';
import { AccessDecision } from '../../types/security';

interface DocumentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  caseData: CasePassport;
  user: User;
  onDocumentUpdated?: (updatedDoc: Document) => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  isOpen,
  onClose,
  document: initialDoc,
  caseData,
  user,
  onDocumentUpdated,
}) => {
  const [document, setDocument] = useState<Document | null>(initialDoc);
  const [activeTab, setActiveTab] = useState<'details' | 'preview' | 'history' | 'edit'>('details');

  const [pendingAction, setPendingAction] = useState<AccessAction | null>(null);
  const [declaredPurpose, setDeclaredPurpose] = useState<string>('');
  const [purposeModalOpen, setPurposeModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [lastDecision, setLastDecision] = useState<AccessDecision | null>(null);

  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [verifyNotice, setVerifyNotice] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Version Upload State
  const [isUploadingVersion, setIsUploadingVersion] = useState(false);
  const [newVersionFile, setNewVersionFile] = useState<File | null>(null);
  const [changeReason, setChangeReason] = useState('');
  const [versionError, setVersionError] = useState<string | null>(null);
  const [versionSuccess, setVersionSuccess] = useState(false);

  // Metadata Edit State
  const [editCategory, setEditCategory] = useState<DocumentCategory>(document?.category || 'EVIDENCE');
  const [editSensitivity, setEditSensitivity] = useState<SensitivityLevel>(document?.sensitivity || 'CONFIDENTIAL');
  const [editDescription, setEditDescription] = useState(document?.description || '');
  const [editNotes, setEditNotes] = useState(document?.notes || '');
  const [isSavingMetadata, setIsSavingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [metadataSuccess, setMetadataSuccess] = useState(false);

  useEffect(() => {
    setDocument(initialDoc);
    if (initialDoc) {
      setEditCategory(initialDoc.category);
      setEditSensitivity(initialDoc.sensitivity);
      setEditDescription(initialDoc.description || '');
      setEditNotes(initialDoc.notes || '');
    }
  }, [initialDoc]);

  if (!document) return null;

  const canEditOrVersion = ['Senior Officer', 'Investigating Officer', 'Forensic Officer', 'Admin'].includes(user.role);

  const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(document.name) || document.mimeType?.startsWith('image/');
  const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(document.name) || document.mimeType?.startsWith('video/');
  const isPdf = /\.pdf$/i.test(document.name) || document.mimeType === 'application/pdf';
  const isText = /\.(txt|json|csv|log|md|xml)$/i.test(document.name) || document.mimeType?.startsWith('text/');

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
      auditService.logEvent(
        user,
        action === 'VIEW'
          ? 'DOCUMENT_VIEW'
          : action === 'DOWNLOAD'
          ? 'DOCUMENT_DOWNLOAD'
          : action === 'SHARE'
          ? 'DOCUMENT_SHARE'
          : 'INTEGRITY_VERIFICATION',
        {
          caseId: caseData.caseId,
          documentId: document.id,
          purpose: purposeToUse || 'Standard Authorization',
          result: 'SUCCESS',
          riskLevel: decision.riskLevel,
          description: `Action '${action}' granted on '${document.name}' under policy ${decision.policyId}.`,
        }
      );

      if (action === 'VIEW') {
        setActiveTab('preview');
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
            setDownloadNotice(`SECURE DOWNLOAD COMPLETE: '${document.name}' downloaded from repository.`);
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
            setDocument((prev) => (prev ? { ...prev, integrityStatus: 'VERIFIED' } : null));
          } else {
            setVerifyNotice(`⚠ INTEGRITY ALERT (${vRes.status}): ${vRes.details}`);
            setDocument((prev) => (prev ? { ...prev, integrityStatus: 'TAMPER_SUSPECTED' } : null));
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

  const handleUploadNewVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionFile) {
      setVersionError('Please select a file to upload as the new version.');
      return;
    }
    if (!changeReason.trim()) {
      setVersionError('Please provide a mandatory change reason / audit summary.');
      return;
    }

    setIsUploadingVersion(true);
    setVersionError(null);

    try {
      const updatedDoc = await apiClient.addDocumentVersion(
        document.id,
        newVersionFile,
        changeReason.trim(),
        'INVESTIGATION'
      );
      setDocument(updatedDoc);
      setVersionSuccess(true);
      setNewVersionFile(null);
      setChangeReason('');
      if (onDocumentUpdated) onDocumentUpdated(updatedDoc);
      setTimeout(() => {
        setVersionSuccess(false);
      }, 2000);
    } catch (err: any) {
      setVersionError(err.message || 'Failed to upload new version.');
    } finally {
      setIsUploadingVersion(false);
    }
  };

  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMetadata(true);
    setMetadataError(null);

    try {
      const updatedDoc = await apiClient.updateDocumentMetadata(
        document.id,
        {
          category: editCategory,
          sensitivity: editSensitivity,
          description: editDescription.trim() || undefined,
          notes: editNotes.trim() || undefined,
        },
        'INVESTIGATION'
      );
      setDocument(updatedDoc);
      setMetadataSuccess(true);
      if (onDocumentUpdated) onDocumentUpdated(updatedDoc);
      setTimeout(() => {
        setMetadataSuccess(false);
      }, 2000);
    } catch (err: any) {
      setMetadataError(err.message || 'Failed to update metadata.');
    } finally {
      setIsSavingMetadata(false);
    }
  };

  const previewUrl = apiClient.getDocumentViewUrl(document.id);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`Document Passport: ${document.name}`}>
        <div className="space-y-4 font-sans text-xs text-slate-800 dark:text-slate-200">
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-navy-800 font-mono text-xs">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-1.5 px-4 py-2 font-bold border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              Overview & Details
            </button>
            <button
              onClick={() => {
                setActiveTab('preview');
                triggerAction('VIEW');
              }}
              className={`flex items-center gap-1.5 px-4 py-2 font-bold border-b-2 transition-colors ${
                activeTab === 'preview'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              File Preview
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-4 py-2 font-bold border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              Versioning & What Changed ({document.versionHistory?.length || 1})
            </button>
            {canEditOrVersion && (
              <button
                onClick={() => setActiveTab('edit')}
                className={`flex items-center gap-1.5 px-4 py-2 font-bold border-b-2 transition-colors ${
                  activeTab === 'edit'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Edit className="w-4 h-4" />
                Edit Metadata
              </button>
            )}
          </div>

          {/* TAB 1: OVERVIEW & DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Metadata Grid */}
              <div className="bg-slate-50 dark:bg-navy-950 p-4 rounded-xl border border-slate-200 dark:border-navy-800 space-y-2.5 font-mono">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-navy-800">
                  <span className="text-slate-500 dark:text-slate-400">CLASSIFICATION:</span>
                  <SensitivityBadge sensitivity={document.sensitivity} />
                </div>
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                  <span className="text-slate-500">CATEGORY / TYPE:</span>
                  <span className="font-semibold">{document.category} ({document.type})</span>
                </div>
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                  <span className="text-slate-500">CURRENT VERSION:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">v{document.version}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                  <span className="text-slate-500">UPLOADED BY:</span>
                  <span>{document.uploadedBy} ({new Date(document.uploadedAt).toLocaleDateString()})</span>
                </div>
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                  <span className="text-slate-500">INTEGRITY STATUS:</span>
                  <IntegrityBadge status={document.integrityStatus} />
                </div>
                {document.description && (
                  <div className="pt-2 border-t border-slate-200 dark:border-navy-800">
                    <span className="text-slate-500 block mb-0.5">DESCRIPTION:</span>
                    <p className="text-slate-800 dark:text-slate-200 font-sans text-xs">{document.description}</p>
                  </div>
                )}
                {document.notes && (
                  <div className="pt-2 border-t border-slate-200 dark:border-navy-800">
                    <span className="text-slate-500 block mb-0.5">NOTES:</span>
                    <p className="text-slate-800 dark:text-slate-200 font-sans text-xs">{document.notes}</p>
                  </div>
                )}
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-navy-800">
                  <span className="text-slate-500 flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 text-blue-500" />
                    STORAGE KEY:
                  </span>
                  <span className="font-bold text-[11px] text-slate-900 dark:text-slate-100 max-w-[240px] truncate" title={document.storageKey}>
                    {document.storageKey || `cases/${caseData.caseId}/${document.id}/${document.name}`}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-navy-800">
                  <span className="text-slate-500 block mb-1">AUTHORITATIVE SHA-256 DIGEST:</span>
                  <div className="text-blue-700 dark:text-blue-300 text-[11px] bg-slate-100 dark:bg-slate-950 p-2 rounded border border-slate-300 dark:border-slate-800 break-all font-bold">
                    {document.sha256Hash}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div>
                <span className="block text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider mb-2 font-mono text-[11px]">
                  Request Document Action:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                  <button
                    onClick={() => triggerAction('VIEW')}
                    className="p-2.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 rounded-lg flex flex-col items-center gap-1 transition-all"
                  >
                    <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>VIEW</span>
                  </button>
                  <button
                    onClick={() => triggerAction('DOWNLOAD')}
                    className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-lg flex flex-col items-center gap-1 transition-all"
                  >
                    <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>DOWNLOAD</span>
                  </button>
                  <button
                    onClick={() => triggerAction('SHARE')}
                    className="p-2.5 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800 rounded-lg flex flex-col items-center gap-1 transition-all"
                  >
                    <Share2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>SHARE</span>
                  </button>
                  <button
                    disabled={isVerifying}
                    onClick={() => triggerAction('VERIFY')}
                    className="p-2.5 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 rounded-lg flex flex-col items-center gap-1 transition-all disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                    ) : (
                      <FileCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    )}
                    <span>{isVerifying ? 'VERIFYING...' : 'VERIFY'}</span>
                  </button>
                </div>
              </div>

              {/* Access Decision Banner */}
              {lastDecision && (
                <div
                  className={`p-3 rounded-lg border font-mono ${
                    lastDecision.allowed
                      ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-300'
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
                  <p className="text-[11px] opacity-90">{lastDecision.reason}</p>
                </div>
              )}

              {/* Action Notifications */}
              {downloadNotice && (
                <div className="bg-emerald-100 dark:bg-emerald-950/80 p-3 rounded-lg border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-[11px] font-mono">
                  {downloadNotice}
                </div>
              )}
              {shareNotice && (
                <div className="bg-purple-100 dark:bg-purple-950/80 p-3 rounded-lg border border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-300 text-[11px] font-mono">
                  {shareNotice}
                </div>
              )}
              {verifyNotice && (
                <div className="bg-amber-100 dark:bg-amber-950/80 p-3 rounded-lg border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-[11px] font-mono">
                  {verifyNotice}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INLINE FILE PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-2">
                <span className="font-bold text-slate-800 dark:text-white uppercase font-mono text-xs">
                  Inline Artifact Preview: {document.name}
                </span>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 text-[11px] font-mono rounded bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-blue-600 dark:text-blue-400 flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Open Raw Tab
                </a>
              </div>

              <div className="bg-slate-100 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 p-3 min-h-[320px] max-h-[460px] overflow-auto flex items-center justify-center">
                {isImage && (
                  <img
                    src={previewUrl}
                    alt={document.name}
                    className="max-h-[420px] max-w-full rounded object-contain shadow"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                )}

                {isVideo && (
                  <video controls className="max-h-[420px] max-w-full rounded shadow">
                    <source src={previewUrl} type={document.mimeType || 'video/mp4'} />
                    Your browser does not support HTML5 video streaming.
                  </video>
                )}

                {isPdf && (
                  <iframe
                    src={previewUrl}
                    title={document.name}
                    className="w-full h-[420px] rounded border border-slate-300 dark:border-navy-700"
                  />
                )}

                {!isImage && !isVideo && !isPdf && (
                  <div className="text-center py-8 space-y-3 max-w-md">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
                      <File className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{document.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Binary forensic artifact ({document.type}, {document.fileSize || 0} bytes). Direct inline preview is available via secure download.
                      </p>
                    </div>
                    <button
                      onClick={() => triggerAction('DOWNLOAD')}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-semibold shadow-sm transition-colors"
                    >
                      Download Artifact ({document.fileSize || 0} B)
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: VERSION HISTORY & WHAT CHANGED */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {/* What Changed Highlight Card */}
              {document.versionHistory && document.versionHistory.length > 1 && (
                <div className="p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-3">
                  <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold font-mono">
                    <GitCompare className="w-4 h-4" />
                    <span>WHAT CHANGED? (LATEST DIFF SUMMARY)</span>
                  </div>

                  {(() => {
                    const latest = document.versionHistory[document.versionHistory.length - 1];
                    const previous = document.versionHistory[document.versionHistory.length - 2];
                    return (
                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                          <span>MODIFIED BY: <strong className="text-slate-900 dark:text-slate-200">{latest.uploadedBy}</strong></span>
                          <span>TIMESTAMP: {new Date(latest.uploadedAt).toLocaleString()}</span>
                        </div>

                        <div className="p-2.5 rounded bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-1">
                          <span className="text-[11px] text-slate-500 block">CHANGE REASON / AUDIT JUSTIFICATION:</span>
                          <p className="font-sans text-xs text-slate-800 dark:text-slate-200 font-medium">
                            {latest.changeReason || latest.changeSummary || 'Forensic revision submitted.'}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                          <div className="p-2 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60">
                            <span className="text-rose-700 dark:text-rose-400 font-bold block mb-0.5">
                              PREVIOUS HASH (v{previous.versionNumber}):
                            </span>
                            <span className="break-all font-mono text-slate-700 dark:text-slate-300">
                              {latest.previousHash || previous.sha256Hash}
                            </span>
                          </div>

                          <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold block mb-0.5">
                              NEW HASH (v{latest.versionNumber}):
                            </span>
                            <span className="break-all font-mono text-slate-700 dark:text-slate-300">
                              {latest.sha256Hash}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Version History Timeline */}
              <div className="space-y-2.5">
                <span className="font-bold text-slate-700 dark:text-slate-300 font-mono block">
                  VERSION TIMELINE & LEDGER
                </span>
                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  {(document.versionHistory && document.versionHistory.length > 0
                    ? document.versionHistory
                    : [
                        {
                          versionNumber: document.version,
                          uploadedAt: document.uploadedAt,
                          uploadedBy: document.uploadedBy,
                          sha256Hash: document.sha256Hash,
                          fileSize: `${document.fileSize || 0} B`,
                          changeSummary: 'Initial evidence ingestion',
                          changeReason: 'Initial evidence ingestion',
                        },
                      ]
                  )
                    .slice()
                    .reverse()
                    .map((ver, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 font-mono text-xs space-y-1.5"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            v{ver.versionNumber}
                          </span>
                          <span className="text-slate-500 text-[11px]">
                            {new Date(ver.uploadedAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-300">
                          Officer: <strong className="text-slate-900 dark:text-slate-100">{ver.uploadedBy}</strong> • Size: {ver.fileSize}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate" title={ver.sha256Hash}>
                          SHA-256: {ver.sha256Hash}
                        </div>
                        <div className="text-[11px] text-slate-700 dark:text-slate-300 font-sans italic bg-white dark:bg-navy-900 p-1.5 rounded border border-slate-200 dark:border-navy-800">
                          &quot;{ver.changeReason || ver.changeSummary || 'Revision update'}&quot;
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Upload New Version Form */}
              {canEditOrVersion && (
                <form
                  onSubmit={handleUploadNewVersion}
                  className="p-4 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 space-y-3"
                >
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white font-mono">
                    <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>UPLOAD NEW VERSION (v{(document.version || 1) + 1})</span>
                  </div>

                  {versionError && (
                    <div className="p-2.5 rounded bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
                      {versionError}
                    </div>
                  )}
                  {versionSuccess && (
                    <div className="p-2.5 rounded bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs">
                      ✓ Version v{document.version} committed and SHA-256 recorded.
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Select Revised Evidence / Document File *
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setNewVersionFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-700 dark:text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 dark:file:bg-blue-950 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Change Reason / Justification *
                    </label>
                    <textarea
                      value={changeReason}
                      onChange={(e) => setChangeReason(e.target.value)}
                      placeholder="e.g. Corrected forensic timestamp signature after deep carver pass."
                      rows={2}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUploadingVersion}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isUploadingVersion ? 'Uploading & Computing Hash...' : 'Commit New Version'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: EDIT METADATA */}
          {activeTab === 'edit' && canEditOrVersion && (
            <form onSubmit={handleSaveMetadata} className="space-y-4">
              <div className="bg-slate-50 dark:bg-navy-950 p-4 rounded-xl border border-slate-200 dark:border-navy-800 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white font-mono text-xs uppercase">
                  Modify Document Metadata
                </h4>

                {metadataError && (
                  <div className="p-2.5 rounded bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
                    {metadataError}
                  </div>
                )}
                {metadataSuccess && (
                  <div className="p-2.5 rounded bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs">
                    ✓ Metadata updated and audit trail logged.
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Evidence Category
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as DocumentCategory)}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="EVIDENCE">EVIDENCE</option>
                      <option value="FIRST_INFORMATION_REPORT">FIRST INFORMATION REPORT</option>
                      <option value="INVESTIGATION_NOTE">INVESTIGATION NOTE</option>
                      <option value="FORENSIC_REPORT">FORENSIC REPORT</option>
                      <option value="EVIDENCE_PHOTO">EVIDENCE PHOTO</option>
                      <option value="WITNESS_STATEMENT">WITNESS STATEMENT</option>
                      <option value="CHARGE_SHEET">CHARGE SHEET</option>
                      <option value="COURT_SUBMISSION">COURT SUBMISSION</option>
                      <option value="FINANCIAL_AUDIT">FINANCIAL AUDIT</option>
                      <option value="SYSTEM_IMAGE">SYSTEM IMAGE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Sensitivity Level
                    </label>
                    <select
                      value={editSensitivity}
                      onChange={(e) => setEditSensitivity(e.target.value as SensitivityLevel)}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                      <option value="TOP_SECRET">TOP SECRET</option>
                      <option value="INTERNAL">INTERNAL</option>
                      <option value="PUBLIC">PUBLIC</option>
                      <option value="FORENSIC">FORENSIC</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Artifact Description
                  </label>
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Brief description of the evidence artifact"
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Chain of Custody / Laboratory Notes
                  </label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Forensic custody notes, bag serial numbers, or laboratory annotations"
                    rows={2}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingMetadata}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                  >
                    {isSavingMetadata ? 'Saving Changes...' : 'Save Metadata & Log Audit'}
                  </button>
                </div>
              </div>
            </form>
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
