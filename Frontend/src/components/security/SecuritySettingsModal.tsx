'use client';

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/apiClient';
import { TotpSetupData } from '../../types/auth';
import {
  ShieldCheck,
  ShieldAlert,
  Key,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  RefreshCw,
  QrCode,
  Lock,
} from 'lucide-react';

interface SecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, setup2fa, enable2fa, disable2fa } = useAuth();

  const [setupData, setSetupData] = useState<TotpSetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Disable 2FA state
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);

  const handleStartSetup = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await setup2fa();
      setSetupData(data);
      setVerificationCode('');
      setRecoveryCodes(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to initiate two-factor enrollment.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length < 6) {
      setError('Please enter the 6-digit code displayed in your authenticator app.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await enable2fa(verificationCode.trim());
      setRecoveryCodes(res.recoveryCodes);
      setSuccessMsg('Two-Factor Authentication is now active on your institutional account.');
      setSetupData(null);
    } catch (err: any) {
      setError(err?.message || 'Invalid verification code. Please check your authenticator and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await disable2fa(confirmPassword);
      setSuccessMsg('Two-Factor Authentication has been disabled.');
      setShowDisableConfirm(false);
      setConfirmPassword('');
      setRecoveryCodes(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to disable 2FA. Verify password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateRecoveryCodes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.regenerateRecoveryCodes();
      setRecoveryCodes(res.recoveryCodes);
      setSuccessMsg('New backup recovery codes generated. Previous codes are now invalidated.');
    } catch (err: any) {
      setError(err?.message || 'Failed to regenerate recovery codes. Reauthentication may be required.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCodes = () => {
    if (recoveryCodes) {
      navigator.clipboard.writeText(recoveryCodes.join('\n'));
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 3000);
    }
  };

  if (!currentUser) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Security Governance & Authentication Settings"
      maxWidth="max-w-xl"
    >
      <div className="space-y-6 font-sans text-xs">
        {/* Status Alerts */}
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-300 flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-300 flex items-center gap-2 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 2FA Status Card */}
        <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                currentUser.isTotpEnabled
                  ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400'
              }`}>
                {currentUser.isTotpEnabled ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                  Two-Factor Authentication (TOTP)
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  RFC 6238 Time-based One-Time Password for institutional access verification.
                </p>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
              currentUser.isTotpEnabled
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
            }`}>
              {currentUser.isTotpEnabled ? 'Active' : 'Disabled'}
            </span>
          </div>

          {/* If 2FA is Not Enabled and Not Enrolling */}
          {!currentUser.isTotpEnabled && !setupData && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleStartSetup}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-mono font-bold rounded-lg transition-all flex items-center gap-2 shadow-sm"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <QrCode className="w-3.5 h-3.5" />}
                <span>Configure Authenticator 2FA</span>
              </button>
            </div>
          )}

          {/* Active 2FA Controls */}
          {currentUser.isTotpEnabled && (
            <div className="pt-2 border-t border-slate-200 dark:border-navy-800 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleRegenerateRecoveryCodes}
                disabled={loading}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 font-mono text-[11px] rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Regenerate Recovery Codes</span>
              </button>

              {!showDisableConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDisableConfirm(true)}
                  className="px-3 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-mono text-[11px] rounded-lg transition-colors"
                >
                  Disable 2FA
                </button>
              ) : (
                <form onSubmit={handleDisable2fa} className="w-full pt-3 flex items-center gap-2">
                  <input
                    type="password"
                    placeholder="Enter password to confirm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-mono text-[11px] font-bold rounded-lg"
                  >
                    Confirm Disable
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDisableConfirm(false);
                      setConfirmPassword('');
                    }}
                    className="px-2 py-1.5 text-slate-500 font-mono text-[11px]"
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Enrollment Step: Show QR Code & Prompt for Code */}
        {setupData && !currentUser.isTotpEnabled && (
          <div className="bg-white dark:bg-navy-900 border border-blue-200 dark:border-blue-900 rounded-xl p-5 space-y-4 animate-in fade-in duration-200">
            <h4 className="font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider text-xs">
              Step 1: Scan QR Code with Authenticator
            </h4>
            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
              Open your authenticator application (Google Authenticator, Microsoft Authenticator, or Aegis) and scan this QR code:
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 p-4 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800">
              {/* QR Code */}
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <img
                  src={setupData.qrCode}
                  alt="2FA TOTP QR Code"
                  className="w-40 h-40"
                />
              </div>

              {/* Manual Entry Key */}
              <div className="space-y-2 text-center sm:text-left">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">
                  Manual Entry Secret Key
                </span>
                <div className="p-2 bg-white dark:bg-navy-900 rounded border border-slate-200 dark:border-navy-800 font-mono font-bold tracking-widest text-blue-600 dark:text-blue-400 text-xs select-all">
                  {setupData.manualEntryKey}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  Issuer: {setupData.issuer}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmEnable} className="space-y-3 pt-2">
              <label htmlFor="modal-verify-input" className="block font-mono text-slate-700 dark:text-slate-300 font-bold text-xs">
                Step 2: Enter Verification Code
              </label>
              <div className="flex gap-2">
                <input
                  id="modal-verify-input"
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="000000"
                  required
                  className="w-36 text-center px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg font-mono text-base tracking-widest text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-mono font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Verify & Activate 2FA</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Display Recovery Codes When Generated */}
        {recoveryCodes && (
          <div className="bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl p-5 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold font-mono">
                <Key className="w-4 h-4" />
                <span>Single-Use Backup Recovery Codes</span>
              </div>
              <button
                type="button"
                onClick={handleCopyCodes}
                className="px-2.5 py-1 bg-amber-200 dark:bg-amber-900 hover:bg-amber-300 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-100 rounded text-[11px] font-mono font-bold flex items-center gap-1 transition-colors"
              >
                {copiedCodes ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCodes ? 'Copied!' : 'Copy All'}</span>
              </button>
            </div>

            <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed font-sans">
              Save these one-time recovery codes securely. Each code can be used exactly once if you lose access to your authenticator application.
            </p>

            <div className="grid grid-cols-2 gap-2 p-3 bg-white dark:bg-navy-950 rounded-lg border border-amber-200 dark:border-amber-900/80 font-mono text-xs text-slate-800 dark:text-slate-200">
              {recoveryCodes.map((code, idx) => (
                <div key={idx} className="p-1.5 bg-slate-50 dark:bg-navy-900 rounded text-center tracking-wider font-semibold select-all">
                  {code}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statutory Session Governance Parameters */}
        <div className="pt-2 border-t border-slate-200 dark:border-navy-800 text-[11px] font-mono text-slate-500 dark:text-slate-400 space-y-1.5 leading-relaxed">
          <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-blue-500" />
            <span>SESSION LIFETIME & TIMEOUT GOVERNANCE</span>
          </div>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>Short-lived access token: 10 minutes</li>
            <li>Inactivity timeout: 15 minutes of uninterrupted idle</li>
            <li>Maximum session lifetime: 8 hours with continuous refresh rotation</li>
            <li>Reauthentication mandatory for sensitive actions</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};
