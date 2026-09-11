'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { ROLE_PERMISSIONS } from '../types/rolePermissions';
import { Role } from '../types/auth';
import {
  Shield,
  Lock,
  FileCheck,
  FileText,
  ArrowRight,
  ChevronDown,
  Scale,
  FolderLock,
  Activity,
  History,
  Menu,
  X,
  ShieldCheck,
  Users,
  CheckCircle2,
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const rolesList = Object.values(ROLE_PERMISSIONS);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b19] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden transition-colors">
      {/* Background Subtle Grid Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(rgba(100, 116, 139, 0.4) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Navigation Bar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 dark:bg-[#070b19]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 shadow-sm shadow-slate-900/5 py-3'
            : 'bg-transparent border-b border-slate-200/50 dark:border-slate-800/30 py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Wordmark */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-blue-600 border border-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-600/20 group-hover:bg-blue-500 transition-colors">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold tracking-wider text-base text-slate-900 dark:text-white">CASETRACE</span>
                <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  DIGITAL CASE PASSPORT
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wide hidden sm:block">
                Secure Digital Case Passport & Evidence Integrity Platform
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-300">
            <a href="#platform" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Platform</a>
            <a href="#how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">How It Works</a>
            <a href="#security" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Security</a>
            <a href="#roles" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Roles</a>
          </div>

          {/* Right Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            <Link
              href="/login"
              className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 font-mono"
            >
              Sign In
            </Link>

            <Link
              href={!isLoading && isAuthenticated ? "/dashboard" : "/login"}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm shadow-blue-600/30 flex items-center gap-1.5 transition-all font-mono"
            >
              <span>Open CASETRACE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button & Theme */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-[#0a1024] border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-5 space-y-3 shadow-lg">
            <div className="flex flex-col space-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <a
                href="#platform"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              >
                Platform
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              >
                How It Works
              </a>
              <a
                href="#security"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              >
                Security
              </a>
              <a
                href="#roles"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              >
                Roles
              </a>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg text-center border border-slate-300 dark:border-slate-700"
              >
                Sign In
              </Link>
              <Link
                href={!isLoading && isAuthenticated ? "/dashboard" : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg text-center flex items-center justify-center gap-2"
              >
                <span>Open CASETRACE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/80 rounded-full text-blue-700 dark:text-blue-400 font-mono text-xs font-semibold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure Digital Case Passport & Evidence Integrity Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            CASETRACE
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Centralize case information, evidence, documents, access control, integrity verification, and audit activity in one secure digital case passport.
          </p>

          {/* Primary Actions */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={!isLoading && isAuthenticated ? "/dashboard" : "/login"}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold rounded-xl text-xs tracking-wider uppercase flex items-center gap-2.5 shadow-lg shadow-blue-600/25 transition-all hover:translate-y-[-1px]"
            >
              <span>OPEN CASETRACE</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="px-6 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-semibold rounded-xl text-xs tracking-wider border border-slate-300 dark:border-slate-700 flex items-center gap-2 transition-colors shadow-xs"
            >
              <span>SIGN IN</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section id="platform" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800/60">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono uppercase">
            Platform Capabilities
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Unified digital lifecycle for investigation, forensic evidence, and judicial proceedings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FolderLock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Digital Case Passport</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Consolidate case synopsis, incident chronology, assigned investigation personnel, and registered evidence into a single structured digital dossier.
            </p>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">SHA-256 Integrity Verification</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Server-side cryptographic hash computation on upload and modification. Instant bit-exact comparison against registered baseline digests to detect unauthorized alterations.
            </p>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Chain of Custody & Audit</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Automated chronological logging of uploads, version updates, views, verifications, and downloads with actor, timestamp, and purpose tracking.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800/60">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono uppercase">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            From initial incident intake to courtroom presentation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">STEP 01</div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Incident Registration</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Investigating officers record case details, incident facts, priority, and assign teams to create a case passport.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">STEP 02</div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Evidence Upload & Hashing</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Files are validated, hashed server-side with SHA-256, stored in secure object storage, and registered to the passport.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">STEP 03</div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Role Access Governance</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Granular access control policies evaluate user role, case assignment, document classification, and declared purpose.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">STEP 04</div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Integrity & Admissibility</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Authoritative bit-level integrity verification and chain of custody tracking support courtroom evidentiary review.
            </p>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800/60">
        <div className="bg-gradient-to-r from-blue-900/10 via-slate-900/5 to-purple-900/10 dark:from-blue-950/40 dark:via-navy-900 dark:to-purple-950/30 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-10 space-y-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-blue-600 dark:text-blue-400 font-bold uppercase">
              <Shield className="w-4 h-4" />
              <span>Evidence Security Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Cryptographic Integrity & Separation of Storage
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              CASETRACE stores structured metadata, case linkages, and version history in relational databases, while raw binary evidence files (images, audio, video, PDFs, disk images) are securely stored in S3-compatible object storage. Every modification produces a traceable version and audit log.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 font-mono text-xs">
            <div className="p-4 rounded-xl bg-white/70 dark:bg-navy-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="text-emerald-600 dark:text-emerald-400 font-bold">SHA-256 VERIFICATION</div>
              <p className="text-[11px] text-slate-500 font-sans">Authoritative server-side hash generation and comparison for evidence integrity.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/70 dark:bg-navy-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="text-blue-600 dark:text-blue-400 font-bold">EVIDENCE VERSIONING</div>
              <p className="text-[11px] text-slate-500 font-sans">Historical versions retained with editor, timestamp, previous hash, and change reason.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/70 dark:bg-navy-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="text-purple-600 dark:text-purple-400 font-bold">CHAIN OF CUSTODY</div>
              <p className="text-[11px] text-slate-500 font-sans">Comprehensive audit stream of every intake, transfer, verification, and access.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800/60">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono uppercase">
            Institutional Role Governance
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Tailored clearance tiers aligned with law enforcement, forensic science, and judicial operations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rolesList.map((item) => (
            <div
              key={item.role}
              className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-2 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white font-mono">{item.displayLabel}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">{item.description}</p>
              <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                CLEARANCE: {item.clearanceLevel}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-slate-900 dark:text-white">CASETRACE</span>
            <span>•</span>
            <span>Secure Digital Case Passport & Evidence Integrity Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Sign In</Link>
            <Link href={!isLoading && isAuthenticated ? "/dashboard" : "/login"} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Open CASETRACE</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
