'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { MOCK_USERS } from '../../mock/users';
import { Role } from '../../types/auth';
import { getRoleLabel } from '../../lib/roles';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Fingerprint,
  RefreshCw,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, verify2fa, is2faPending, cancel2fa, isAuthenticated } = useAuth();

  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const preSelectedRole = searchParams.get('role') as Role | null;
  const reason = searchParams.get('reason');

  // Step 1: Credentials
  const [identifier, setIdentifier] = useState(
    preSelectedRole
      ? MOCK_USERS.find((u) => u.role === preSelectedRole)?.email || preSelectedRole
      : 'rajesh.kumar@casetrace.gov.in'
  );
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Two-Factor Authentication
  const [totpCode, setTotpCode] = useState('');
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);

  // Shared UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preSelectedRole) {
      const user = MOCK_USERS.find((u) => u.role === preSelectedRole);
      if (user) {
        setIdentifier(user.email);
      }
    }
  }, [preSelectedRole]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, redirectUrl, router]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your institutional email or officer identifier.');
      return;
    }
    if (!password) {
      setError('Please enter your authorization password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await login(identifier, undefined, password);
      if (res.requires2fa) {
        setTotpCode('');
        setLoading(false);
        return;
      }
      router.replace(redirectUrl);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify your credentials.');
      setLoading(false);
    }
  };

  const handle2faSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = totpCode.trim();
    if (!cleanCode) {
      setError(useRecoveryCode ? 'Please enter a valid backup recovery code.' : 'Please enter your 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await verify2fa(cleanCode, useRecoveryCode);
      router.replace(redirectUrl);
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Please check the code and try again.');
      setLoading(false);
    }
  };

  const handleSelectRole = (user: typeof MOCK_USERS[0]) => {
    setIdentifier(user.email);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="w-full max-w-lg space-y-6">
      {/* Navigation & Theme Header */}
      <div className="flex items-center justify-between pb-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-mono transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Official Portal</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Official Identity & Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center gap-2.5 mb-1">
          <div className="w-11 h-11 rounded-xl bg-blue-600 border border-blue-400/40 flex items-center justify-center text-white shadow-lg shadow-blue-600/25">
            <Shield className="w-6 h-6" />
          </div>
          <div className="text-left">
            <div className="font-mono font-extrabold text-xl text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
              <span>CASETRACE</span>
              <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                GOV.IN
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-medium">
              सुरक्षित डिजिटल केस पासपोर्ट प्रणाली
            </div>
          </div>
        </div>

        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight font-sans">
          Secure Judicial & Investigative Gateway
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
          Authorized law enforcement, digital forensics, public prosecutors, and judicial officers only.
        </p>
      </div>

      {/* Main Authentication Container */}
      <div className="bg-white dark:bg-[#0b1328] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl transition-colors">
        
        {/* Inactivity Notice */}
        {reason === 'inactivity' && !error && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-lg text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Session expired due to statutory inactivity timeout. Please re-authenticate.</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div role="alert" className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ================= STEP 2: TWO-FACTOR AUTHENTICATION ================= */}
        {is2faPending ? (
          <form onSubmit={handle2faSubmit} className="space-y-5 animate-in fade-in duration-200">
            <div className="bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl p-4 space-y-1.5 text-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-2">
                <Fingerprint className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
                Two-Factor Verification
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-sans">
                {useRecoveryCode
                  ? 'Enter an unused one-time backup recovery code (e.g. CT-XXXX-XXXX).'
                  : 'Enter the 6-digit TOTP code generated by your registered authenticator application.'}
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="totp-input" className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>{useRecoveryCode ? 'Recovery Code' : '6-Digit TOTP Code'}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {useRecoveryCode ? 'Format: CT-XXXX-XXXX' : '30-Second Rolling Key'}
                </span>
              </label>

              <input
                id="totp-input"
                type="text"
                autoFocus
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                placeholder={useRecoveryCode ? 'CT-8921-4401' : '••••••'}
                maxLength={useRecoveryCode ? 16 : 6}
                required
                className="w-full text-center px-4 py-3 bg-slate-50 dark:bg-[#070c1a] border border-slate-300 dark:border-slate-700/80 rounded-lg text-lg font-mono tracking-widest text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-mono font-bold text-xs rounded-lg tracking-wider uppercase flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Token...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify & Access CaseTrace</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-1 text-xs font-mono">
              <button
                type="button"
                onClick={() => {
                  setUseRecoveryCode(!useRecoveryCode);
                  setTotpCode('');
                  setError(null);
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                {useRecoveryCode ? 'Use 6-digit Authenticator app' : 'Use backup recovery code'}
              </button>

              <button
                type="button"
                onClick={cancel2fa}
                className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:underline cursor-pointer"
              >
                Cancel & Re-enter
              </button>
            </div>
          </form>
        ) : (
          /* ================= STEP 1: CREDENTIALS ================= */
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="identifier-input" className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Institutional Email / Identifier</span>
                <span className="text-[10px] text-slate-400 font-normal">e.g. officer@casetrace.gov.in</span>
              </label>
              <input
                id="identifier-input"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="officer.name@casetrace.gov.in"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#070c1a] border border-slate-300 dark:border-slate-700/80 rounded-lg text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password-input" className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Statutory Password</span>
                <span className="text-[10px] text-slate-400 font-normal">Seeded: password123</span>
              </label>
              <div className="relative">
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-[#070c1a] border border-slate-300 dark:border-slate-700/80 rounded-lg text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-mono font-bold text-xs rounded-lg tracking-wider uppercase flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating Identity...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Secure Login & Clearance Check</span>
                </>
              )}
            </button>

            {/* Quick Institutional Role Preset Dropdown */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-1.5">
              <label htmlFor="role-preset-select" className="text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Select Officer Clearance</span>
                <span className="text-[10px] text-slate-400 font-normal">Pre-configured Personas</span>
              </label>
              <select
                id="role-preset-select"
                defaultValue=""
                onChange={(e) => {
                  const selectedUser = MOCK_USERS.find((u) => u.id === e.target.value);
                  if (selectedUser) {
                    handleSelectRole(selectedUser);
                  }
                }}
                disabled={loading}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070c1a] border border-slate-300 dark:border-slate-700/80 rounded-lg text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500 transition-colors cursor-pointer"
              >
                <option value="" disabled>Select Officer Profile...</option>
                {MOCK_USERS.map((user) => (
                  <option key={user.id} value={user.id}>
                    {getRoleLabel(user.role, 'bilingual')} — {user.name}
                  </option>
                ))}
              </select>
            </div>
          </form>
        )}

        {/* Institutional Statutory Footer Notice */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 text-[10px] font-mono text-slate-500 dark:text-slate-400 space-y-1 leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>STATUTORY SECURITY COMPLIANCE</span>
          </div>
          <p>
            Access is logged in immutable cryptographic audit trails pursuant to the Bharatiya Sakshya Adhiniyam & IT Act. Unauthorized access is strictly prohibited.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b19] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative transition-colors">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(rgba(100, 116, 139, 0.4) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <Suspense
        fallback={
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Loading Authentication Gateway...</span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
