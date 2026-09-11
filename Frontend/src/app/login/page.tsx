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
  ArrowRight,
  AlertCircle,
  Loader2,
  ArrowLeft,
  KeyRound,
  Sparkles,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth();

  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const preSelectedRole = searchParams.get('role') as Role | null;

  const [identifier, setIdentifier] = useState(
    preSelectedRole
      ? MOCK_USERS.find((u) => u.role === preSelectedRole)?.email || preSelectedRole
      : 'sarah.jenkins@casetrace.gov'
  );
  const [password, setPassword] = useState('password123');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your institutional email or user ID.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(identifier, undefined, password);
      router.replace(redirectUrl);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
      setLoading(false);
    }
  };

  const handleSelectDemoPersona = async (user: typeof MOCK_USERS[0]) => {
    setIdentifier(user.email);
    setLoading(true);
    setError(null);
    try {
      await login(user.email, user.role as Role, 'password123');
      router.replace(redirectUrl);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl space-y-6">
      {/* Header bar with Theme Toggle */}
      <div className="flex items-center justify-between pb-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-mono transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Overview</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Header card */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2 group mb-1">
          <div className="w-10 h-10 rounded-xl bg-blue-600 border border-blue-400/40 flex items-center justify-center text-white shadow-md shadow-blue-600/20 group-hover:bg-blue-500 transition-colors">
            <Shield className="w-5 h-5" />
          </div>
          <span className="font-mono font-extrabold text-xl text-slate-900 dark:text-white tracking-wider">CASETRACE</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-mono uppercase">
          Digital Case Passport Gateway
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Authenticate using authorized agency credentials to access Digital Case Passports, evidence management, and audit records.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-white dark:bg-[#0b1328] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl transition-colors">
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Institutional Identifier / Email</span>
              <span className="text-[10px] text-slate-400 font-normal">e.g. sarah.jenkins@casetrace.gov</span>
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="officer.name@casetrace.gov"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#070c1a] border border-slate-300 dark:border-slate-700/80 rounded-lg text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Authorization Password</span>
              <span className="text-[10px] text-slate-400 font-normal">Default: password123</span>
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#070c1a] border border-slate-300 dark:border-slate-700/80 rounded-lg text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
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
                <span>Authenticating Credentials...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Authorize & Enter CASETRACE</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Persona Quick-Select - Clearly marked for SIH demonstration */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              DEMO MODE • QUICK PERSONA ACCESS
            </span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">7 CLEARANCE TIERS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {MOCK_USERS.map((user) => {
              const displayLabel = getRoleLabel(user.role);
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelectDemoPersona(user)}
                  disabled={loading}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#070c1a] border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 text-left transition-all flex items-center justify-between group disabled:opacity-50"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {user.name}
                    </div>
                    <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400 truncate font-medium">
                      {displayLabel}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{user.department}</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 transition-colors" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Security Policy Notice */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-mono text-slate-500 dark:text-slate-400 leading-relaxed">
          <span className="text-amber-600 dark:text-amber-400 font-bold">ACCESS POLICY:</span> Operations are cryptographically logged and authenticated according to institutional role and case assignment.
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
