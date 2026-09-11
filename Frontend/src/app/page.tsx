'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { MOCK_USERS } from '../mock/users';
import { Role } from '../types/auth';
import { ROLE_PERMISSIONS } from '../types/rolePermissions';
import {
  Shield,
  Lock,
  FileCheck,
  FileText,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Database,
  Key,
  Server,
  Scale,
  Fingerprint,
  AlertTriangle,
  FolderLock,
  Activity,
  Cpu,
  History,
  Menu,
  X,
  Copy,
  Check,
  ShieldAlert,
  Users,
  FileSpreadsheet,
  Binary,
  HardDrive,
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hero interactive preview state
  const [heroActiveTab, setHeroActiveTab] = useState<'overview' | 'evidence' | 'custody' | 'audit'>('overview');

  // Evidence integrity simulation state
  const [integrityState, setIntegrityState] = useState<'verified' | 'tampered'>('verified');
  const [copiedHash, setCopiedHash] = useState(false);

  // Role showcase preview state (Local demo inspection only - does NOT affect auth)
  const [selectedDemoRole, setSelectedDemoRole] = useState<Role>('Senior Officer');

  // Navbar scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const originalHash = '8f4c2b9a76d1e4359870abce4219ef84129038475628192aebc0495817263540';
  const tamperedHash = '3a1f9e8027b5c4d16892e0ab417f52ca890214537689210bcda9874102938471';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const selectedPerms = ROLE_PERMISSIONS[selectedDemoRole] || ROLE_PERMISSIONS['Senior Officer'];

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* Background Subtle Grid Texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{ 
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }} 
      />

      {/* -------------------------------------------------- */}
      {/* 1. NAVIGATION BAR                                  */}
      {/* -------------------------------------------------- */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#070b19]/90 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/20 py-3'
            : 'bg-transparent border-b border-slate-800/30 py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Wordmark */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-blue-600 border border-blue-400/40 flex items-center justify-center text-white shadow-md shadow-blue-600/20 group-hover:bg-blue-500 transition-colors">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold tracking-wider text-base text-white">CASETRACE</span>
                <span className="text-[10px] font-mono bg-blue-950/80 text-blue-400 border border-blue-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  PASSPORT v2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wide hidden sm:block">
                Secure Evidence & Case Passport Platform
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <a href="#platform" className="hover:text-blue-400 transition-colors">Platform</a>
            <a href="#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</a>
            <a href="#integrity" className="hover:text-blue-400 transition-colors">Integrity</a>
            <a href="#roles" className="hover:text-blue-400 transition-colors">Roles</a>
            <a href="#security" className="hover:text-blue-400 transition-colors">Security</a>
            <a href="#technology" className="hover:text-blue-400 transition-colors">Technology</a>
          </div>

          {/* Right Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <div className="px-2.5 py-1.5 rounded-md bg-slate-900/90 border border-slate-700/60 text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-blue-400" />
              <span>RBAC v2.0</span>
            </div>

            <Link
              href="/login"
              className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-850 rounded-lg transition-colors border border-transparent hover:border-slate-700 font-mono"
            >
              Sign In
            </Link>

            <Link
              href={isAuthenticated ? "/dashboard" : "/login"}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm shadow-blue-600/30 flex items-center gap-1.5 transition-all font-mono"
            >
              <span>Open CASETRACE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0a1024] border-b border-slate-800 px-4 pt-3 pb-5 space-y-3">
            <div className="flex flex-col space-y-2 text-sm font-medium text-slate-300">
              <a 
                href="#platform" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-slate-850 hover:text-white"
              >
                Platform
              </a>
              <a 
                href="#how-it-works" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-slate-850 hover:text-white"
              >
                How It Works
              </a>
              <a 
                href="#integrity" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-slate-850 hover:text-white"
              >
                Evidence Integrity
              </a>
              <a 
                href="#roles" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-slate-850 hover:text-white"
              >
                Role-Based Access
              </a>
              <a 
                href="#security" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-slate-850 hover:text-white"
              >
                Security & Governance
              </a>
              <a 
                href="#technology" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-slate-850 hover:text-white"
              >
                Technology Stack
              </a>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-semibold rounded-lg text-center border border-slate-700"
              >
                Sign In
              </Link>
              <Link
                href={isAuthenticated ? "/dashboard" : "/login"}
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

      {/* -------------------------------------------------- */}
      {/* 2. HERO SECTION                                    */}
      {/* -------------------------------------------------- */}
      <section className="relative pt-32 pb-20 lg:pt-36 lg:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Mission Headline & Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-950/70 border border-blue-800/80 rounded-full text-blue-400 font-mono text-xs font-semibold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>Digital Justice & Evidence Infrastructure</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              One Case.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-400">
                One Secure Digital Passport.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              CASETRACE centralizes case information, evidence, documents, access control, integrity verification, and audit activity into one secure digital case passport.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs sm:text-sm text-slate-400 leading-normal flex items-start gap-3">
              <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p>
                <strong className="text-slate-200">Institutional Governance:</strong> Give every authorized participant the right information, with the right level of access, at the right time.
              </p>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href={isAuthenticated ? "/dashboard" : "/login"}
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold rounded-lg text-xs tracking-wider uppercase flex items-center gap-2.5 shadow-lg shadow-blue-600/25 transition-all hover:translate-y-[-1px]"
              >
                <span>Open CASETRACE</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#platform"
                className="px-5 py-3.5 bg-slate-900 hover:bg-slate-850 text-slate-200 font-mono font-semibold rounded-lg text-xs tracking-wider border border-slate-700/80 hover:border-slate-600 flex items-center gap-2 transition-colors"
              >
                <span>Explore the Platform</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>

            {/* Public Governance Statement (No session or user-specific data) */}
            <div className="pt-2 flex items-center gap-3 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-1.5 text-blue-400">
                <Shield className="w-3.5 h-3.5" />
                <span>ROLE-BASED ACCESS GOVERNANCE</span>
              </div>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">7 Specialized Judicial & Law Enforcement Clearance Levels</span>
            </div>
          </div>

          {/* Right Column: Hero Visual - Digital Case Passport Dossier (Static Product Demonstration) */}
          <div className="lg:col-span-6">
            <div className="bg-[#0c1427] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/50 space-y-4 relative">
              {/* Top indicator bar */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-900/60 border border-blue-700/50 flex items-center justify-center text-blue-400">
                    <FolderLock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-white">CASE-2026-8942</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/70 border border-amber-800 text-amber-400">
                        DEMO CASE
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">Operation DarkLedge • Financial Crimes</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    INTEGRITY VERIFIED
                  </span>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">SHA-256 BIT-EXACT</p>
                </div>
              </div>

              {/* Passport Snapshot Telemetry */}
              <div className="grid grid-cols-3 gap-2 py-1">
                <div className="bg-[#111c35] border border-slate-800/80 rounded-lg p-2.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Evidence Files</span>
                  <span className="text-base font-bold font-mono text-white">14 Registered</span>
                </div>
                <div className="bg-[#111c35] border border-slate-800/80 rounded-lg p-2.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Custody Log</span>
                  <span className="text-base font-bold font-mono text-white">28 Events</span>
                </div>
                <div className="bg-[#111c35] border border-slate-800/80 rounded-lg p-2.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Clearance Tier</span>
                  <span className="text-base font-bold font-mono text-blue-400">Level 4+</span>
                </div>
              </div>

              {/* Interactive Passport Tab Preview Controls */}
              <div className="flex border-b border-slate-800/80 gap-2 text-xs font-mono">
                {(['overview', 'evidence', 'custody', 'audit'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setHeroActiveTab(tab)}
                    className={`pb-2 px-1 text-[11px] uppercase tracking-wider font-semibold border-b-2 transition-all ${
                      heroActiveTab === tab
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content Display */}
              <div className="min-h-[220px] bg-[#090f1f] rounded-xl border border-slate-800/60 p-3.5 text-xs">
                {heroActiveTab === 'overview' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Primary Investigator:</span>
                      <span className="text-slate-200 font-semibold">Insp. Sarah Jenkins (Financial Crimes)</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Judicial Filing Status:</span>
                      <span className="text-amber-400 font-mono font-medium">PRE-TRIAL EVIDENTIARY REVIEW</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Genesis Passport Anchor:</span>
                      <span className="text-slate-400 font-mono text-[10px]">0x8e71b2...9f4a (Block #1042)</span>
                    </div>
                    <div className="p-2.5 rounded bg-blue-950/40 border border-blue-900/50 text-[11px] text-slate-300">
                      <div className="flex items-center gap-1.5 text-blue-400 font-bold mb-1">
                        <Scale className="w-3.5 h-3.5" />
                        <span>Judicial Integrity Notice</span>
                      </div>
                      This digital case passport binds all evidentiary filings to immutable SHA-256 digests. Tamper detection executes automatically on every access event.
                    </div>
                  </div>
                )}

                {heroActiveTab === 'evidence' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="font-mono text-slate-200 truncate">forensic_memory_dump.raw</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-1.5 py-0.5 rounded">
                        SHA-256 MATCH
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800">
                      <div className="flex items-center gap-2 truncate">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-mono text-slate-200 truncate">offshore_wire_ledger.csv</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-1.5 py-0.5 rounded">
                        SHA-256 MATCH
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800">
                      <div className="flex items-center gap-2 truncate">
                        <Binary className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="font-mono text-slate-200 truncate">cctv_vault_corridor.mp4</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-1.5 py-0.5 rounded">
                        SHA-256 MATCH
                      </span>
                    </div>
                  </div>
                )}

                {heroActiveTab === 'custody' && (
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-slate-200 font-semibold">Evidence Registered & Hashed (Initial Intake)</p>
                        <p className="text-slate-500 font-mono text-[10px]">Det. Sarah Jenkins • Recorded</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-slate-200 font-semibold">Transferred to Forensic Lab for Bitstream Copy</p>
                        <p className="text-slate-500 font-mono text-[10px]">Dr. Alex Mercer • Verified</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-slate-200 font-semibold">Judicial Discovery Docket Prepared</p>
                        <p className="text-slate-500 font-mono text-[10px]">Atty. Marcus Thorne • Filed</p>
                      </div>
                    </div>
                  </div>
                )}

                {heroActiveTab === 'audit' && (
                  <div className="space-y-2 font-mono text-[11px]">
                    <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800 text-slate-300 flex justify-between items-center">
                      <span className="text-emerald-400">[200 OK] ACCESS_GRANTED</span>
                      <span className="text-slate-500 text-[10px]">PURPOSE: FORENSIC_ANALYSIS</span>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800 text-slate-300 flex justify-between items-center">
                      <span className="text-blue-400">[VERIFY] SHA256_CHECK</span>
                      <span className="text-slate-500 text-[10px]">DIGEST_VERIFIED_EXACT</span>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800 text-slate-300 flex justify-between items-center">
                      <span className="text-amber-400">[AUDIT] ACCESS_LOGGED</span>
                      <span className="text-slate-500 text-[10px]">MUTATION: IMMUTABLE_APPEND</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Quick Launch Link */}
              <div className="pt-1 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">
                  Product demonstration view
                </span>
                <Link
                  href={isAuthenticated ? "/dashboard/cases" : "/login"}
                  className="text-blue-400 hover:text-blue-300 font-mono font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>Inspect in Dashboard</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* 3. PROBLEM SECTION                                 */}
      {/* -------------------------------------------------- */}
      <section id="problem" className="py-20 border-t border-slate-800/60 bg-[#0a1022]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-semibold text-rose-400 tracking-wider uppercase">
              The Critical Challenge
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Case information shouldn't be scattered.
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              From fragmented records to one trusted case view. Traditional evidence workflows leave investigations vulnerable to confusion, unauthorized access, and evidentiary disputes in court.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* The Fragmented Reality */}
            <div className="bg-[#0e162c] border border-rose-950/60 rounded-xl p-6 sm:p-8 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-950/50 border border-rose-800/60 rounded-md text-rose-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>The Fragmented Reality</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Siloed Systems & Manual Vulnerabilities
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Traditional investigations distribute sensitive evidence across disconnected drives, email attachments, paper logs, and disparate departmental software.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span><strong>Fragmented Case Context:</strong> Evidence scattered across folders with no unified status.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span><strong>Integrity Vulnerabilities:</strong> No cryptographic proof that a document was not silently altered.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span><strong>Broken Chain of Custody:</strong> Paper sign-outs and handoffs lack tamper-evident timestamping.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span><strong>Curiosity Access:</strong> Staff can view sensitive records without declared judicial justification.</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-lg text-[11px] font-mono text-rose-300">
                RESULT: Trial challenges, compromised evidence admissibility, and administrative chaos.
              </div>
            </div>

            {/* The CASETRACE Standard */}
            <div className="bg-[#0e162c] border border-blue-900/60 rounded-xl p-6 sm:p-8 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-950/50 border border-blue-800/60 rounded-md text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>The CASETRACE Standard</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Unified Digital Case Passport & Verifiable Integrity
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Every case receives a single digital passport anchoring all exhibits, personnel, custody events, and audit logs into a single authoritative record.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Single Source of Truth:</strong> One centralized passport synthesizes all case artifacts and timeline events.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>SHA-256 Mathematical Fingerprint:</strong> Instant bit-level verification detects even single-bit modifications.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Immutable Custody Ledger:</strong> Every transfer and review is permanently timestamped with user signature.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Mandatory Purpose Gating:</strong> High-sensitivity files require declared operational necessity.</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg text-[11px] font-mono text-emerald-300">
                RESULT: Courtroom-ready evidence integrity, transparent accountability, and multi-agency trust.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* 4. SOLUTION SECTION: DIGITAL CASE PASSPORT         */}
      {/* -------------------------------------------------- */}
      <section id="platform" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono font-semibold text-blue-400 tracking-wider uppercase">
            Architectural Core Principle
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Introducing the Digital Case Passport.
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            A single authoritative entity that orchestrates all aspects of an investigation across law enforcement, forensics, prosecution, and the judiciary.
          </p>
        </div>

        {/* Visual Conceptual Centerpiece: ONE CASE -> PASSPORT -> MULTIPLE VIEWS */}
        <div className="bg-[#0b1224] border border-slate-800 rounded-2xl p-6 sm:p-10 space-y-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative">
            {/* Step 1: One Case */}
            <div className="w-full md:w-1/4 bg-[#101a33] border border-slate-700/80 rounded-xl p-5 text-center space-y-2">
              <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider block">ORIGIN</span>
              <div className="w-12 h-12 mx-auto rounded-lg bg-blue-900/50 border border-blue-700 flex items-center justify-center text-blue-400">
                <FolderLock className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">ONE CASE</h4>
              <p className="text-xs text-slate-400">Real-world investigation registered with unique jurisdictional ID.</p>
            </div>

            {/* Connecting Arrow */}
            <div className="hidden md:flex items-center text-slate-600">
              <ArrowRight className="w-6 h-6 text-blue-400 animate-pulse" />
            </div>

            {/* Step 2: Digital Case Passport (Centerpiece) */}
            <div className="w-full md:w-2/5 bg-gradient-to-b from-[#152347] to-[#0d162d] border-2 border-blue-500/60 rounded-xl p-6 text-center space-y-3 shadow-xl shadow-blue-950/50 relative">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-950 border border-blue-500/60 text-blue-300 text-[10px] font-mono font-bold uppercase">
                <Shield className="w-3 h-3 text-blue-400" />
                CENTRAL AUTHORITY
              </div>
              <h4 className="text-lg font-extrabold text-white tracking-wide">
                ONE DIGITAL CASE PASSPORT
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Centralizes identity, assigned personnel, digital evidence, cryptographic digests, chain of custody, and tamper-evident audit logs.
              </p>
              <div className="grid grid-cols-3 gap-1.5 pt-2 text-[10px] font-mono text-slate-300">
                <span className="bg-slate-900/80 p-1.5 rounded border border-slate-800">Metadata</span>
                <span className="bg-slate-900/80 p-1.5 rounded border border-slate-800">SHA-256</span>
                <span className="bg-slate-900/80 p-1.5 rounded border border-slate-800">RBAC Gate</span>
              </div>
            </div>

            {/* Connecting Arrow */}
            <div className="hidden md:flex items-center text-slate-600">
              <ArrowRight className="w-6 h-6 text-blue-400 animate-pulse" />
            </div>

            {/* Step 3: Multiple Secure Views */}
            <div className="w-full md:w-1/4 bg-[#101a33] border border-slate-700/80 rounded-xl p-5 text-center space-y-2">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">GOVERNANCE</span>
              <div className="w-12 h-12 mx-auto rounded-lg bg-cyan-950/60 border border-cyan-700 flex items-center justify-center text-cyan-400">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">MULTIPLE SECURE VIEWS</h4>
              <p className="text-xs text-slate-400">Tailored perspectives filtered by clearance, role, and declared purpose.</p>
            </div>
          </div>

          {/* 9 Integrated Pillars of the Passport */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">
              What Each Digital Case Passport Synthesizes
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2.5 text-center">
              {[
                { name: 'Case Info', icon: FolderLock },
                { name: 'People', icon: Users },
                { name: 'Evidence', icon: HardDrive },
                { name: 'Documents', icon: FileText },
                { name: 'Timeline', icon: History },
                { name: 'Permissions', icon: Key },
                { name: 'Integrity', icon: FileCheck },
                { name: 'Audit Logs', icon: ShieldAlert },
                { name: 'Security', icon: Shield },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col items-center gap-1.5"
                  >
                    <Icon className="w-4 h-4 text-blue-400" />
                    <span className="text-[11px] font-medium text-slate-300 truncate w-full">{item.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* 5. KEY CAPABILITIES (8 FEATURE CARDS)              */}
      {/* -------------------------------------------------- */}
      <section id="capabilities" className="py-20 border-t border-slate-800/60 bg-[#090f20]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-semibold text-blue-400 tracking-wider uppercase">
              Platform Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Everything important about a case. In one place.
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              High-integrity infrastructure engineered specifically for law enforcement, digital forensics, prosecution, and the court registry.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#0e162b] border border-slate-800 hover:border-blue-500/40 rounded-xl p-5 space-y-3 transition-all hover:translate-y-[-2px]">
              <div className="w-10 h-10 rounded-lg bg-blue-950/70 border border-blue-800 flex items-center justify-center text-blue-400">
                <FolderLock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Digital Case Passport</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Centralize case identity, status, personnel, evidence, documents, and chronological timeline into one structured dossier.
              </p>
            </div>

            <div className="bg-[#0e162b] border border-slate-800 hover:border-blue-500/40 rounded-xl p-5 space-y-3 transition-all hover:translate-y-[-2px]">
              <div className="w-10 h-10 rounded-lg bg-blue-950/70 border border-blue-800 flex items-center justify-center text-blue-400">
                <HardDrive className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Secure Evidence Management</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Organize evidence and documents with controlled access, detailed metadata, sensitivity tags, and intake verification.
              </p>
            </div>

            <div className="bg-[#0e162b] border border-slate-800 hover:border-blue-500/40 rounded-xl p-5 space-y-3 transition-all hover:translate-y-[-2px]">
              <div className="w-10 h-10 rounded-lg bg-blue-950/70 border border-blue-800 flex items-center justify-center text-blue-400">
                <Fingerprint className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">SHA-256 Integrity Verification</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Use cryptographic hashes to verify whether a registered document mathematically matches its original intake fingerprint.
              </p>
            </div>

            <div className="bg-[#0e162b] border border-slate-800 hover:border-blue-500/40 rounded-xl p-5 space-y-3 transition-all hover:translate-y-[-2px]">
              <div className="w-10 h-10 rounded-lg bg-blue-950/70 border border-blue-800 flex items-center justify-center text-blue-400">
                <History className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Chain of Custody</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track evidence activity chronologically from registration and transfer to verification and access with officer signatures.
              </p>
            </div>

            <div className="bg-[#0e162b] border border-slate-800 hover:border-blue-500/40 rounded-xl p-5 space-y-3 transition-all hover:translate-y-[-2px]">
              <div className="w-10 h-10 rounded-lg bg-blue-950/70 border border-blue-800 flex items-center justify-center text-blue-400">
                <Key className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Role-Based Access</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Provide different levels of access based on user role, case assignment, document sensitivity, and declared purpose.
              </p>
            </div>

            <div className="bg-[#0e162b] border border-slate-800 hover:border-blue-500/40 rounded-xl p-5 space-y-3 transition-all hover:translate-y-[-2px]">
              <div className="w-10 h-10 rounded-lg bg-blue-950/70 border border-blue-800 flex items-center justify-center text-blue-400">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Audit Trail</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Maintain a traceable, append-only record of important case, document, evidence, and security activities for oversight.
              </p>
            </div>

            <div className="bg-[#0e162b] border border-slate-800 hover:border-blue-500/40 rounded-xl p-5 space-y-3 transition-all hover:translate-y-[-2px]">
              <div className="w-10 h-10 rounded-lg bg-blue-950/70 border border-blue-800 flex items-center justify-center text-blue-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Security Monitoring</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review access decisions, risk levels, restricted activity, and integrity verification flags across all multi-agency workflows.
              </p>
            </div>

            <div className="bg-[#0e162b] border border-slate-800 hover:border-blue-500/40 rounded-xl p-5 space-y-3 transition-all hover:translate-y-[-2px]">
              <div className="w-10 h-10 rounded-lg bg-blue-950/70 border border-blue-800 flex items-center justify-center text-blue-400">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Secure Object Storage</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Support MinIO/S3-compatible storage for controlled, authenticated document storage and streaming retrieval.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* 6. HOW IT WORKS (8-STEP WORKFLOW)                   */}
      {/* -------------------------------------------------- */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono font-semibold text-blue-400 tracking-wider uppercase">
            Operational Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            From evidence to verified record.
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            A continuous, mathematically verifiable pipeline ensuring legal admissibility from initial crime intake to final trial verdict.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              step: '01',
              title: 'Case Created',
              desc: 'Senior Officers initialize digital case identity, classification, and lead investigators.',
              icon: FolderLock,
            },
            {
              step: '02',
              title: 'Digital Case Passport',
              desc: 'Authoritative passport generated with unique immutable case identity schema.',
              icon: Shield,
            },
            {
              step: '03',
              title: 'Evidence Added',
              desc: 'Digital files, forensic captures, and legal briefs ingested with assigned sensitivity.',
              icon: HardDrive,
            },
            {
              step: '04',
              title: 'SHA-256 Digest Computed',
              desc: 'Server-side cryptographic checksum calculated immediately upon upload.',
              icon: Fingerprint,
            },
            {
              step: '05',
              title: 'Access Control',
              desc: '4-factor evaluation checks role, assignment, document classification, and declared purpose.',
              icon: Key,
            },
            {
              step: '06',
              title: 'Chain of Custody',
              desc: 'Chronological custody events permanently recorded with officer IDs and timestamps.',
              icon: History,
            },
            {
              step: '07',
              title: 'Audit Trail',
              desc: 'Append-only ledger logs every view, verification, download, and clearance check.',
              icon: Activity,
            },
            {
              step: '08',
              title: 'Verification',
              desc: 'Bit-exact mathematical comparison confirms files remain 100% unaltered for court.',
              icon: FileCheck,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#0b1326] border border-slate-800 rounded-xl p-5 space-y-3 relative group hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-500 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900">
                    STEP {item.step}
                  </span>
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-white">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* 7. EVIDENCE INTEGRITY SECTION (INTERACTIVE DEMO)   */}
      {/* -------------------------------------------------- */}
      <section id="integrity" className="py-20 border-t border-slate-800/60 bg-[#090f20]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-semibold text-emerald-400 tracking-wider uppercase">
              Cryptographic Guarantees
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Know when evidence has changed.
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              CASETRACE uses SHA-256 hashing to create a cryptographic fingerprint for registered documents. During verification, the current document can be compared against its stored integrity record.
            </p>
          </div>

          {/* Interactive Verification UI Simulator */}
          <div className="max-w-4xl mx-auto bg-[#0c1427] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Authoritative Hash Inspector Mockup
                </span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>exhibit_04_financial_audit.pdf</span>
                </h3>
              </div>

              {/* Simulation Toggles */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIntegrityState('verified')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    integrityState === 'verified'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Verify Original Document
                </button>
                <button
                  onClick={() => setIntegrityState('tampered')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    integrityState === 'tampered'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Simulate 1-Bit Alteration
                </button>
              </div>
            </div>

            {/* Hash Comparison Matrix */}
            <div className="space-y-4">
              <div className="bg-[#070b18] p-3.5 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>REGISTERED BENCHMARK DIGEST (STORED AT INTAKE):</span>
                  <button
                    onClick={() => copyToClipboard(originalHash)}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-slate-200 break-all select-all font-semibold">
                  {originalHash}
                </div>
              </div>

              <div className="bg-[#070b18] p-3.5 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>LIVE COMPUTED OBJECT DIGEST (STREAMED FROM S3):</span>
                  <span className="text-[10px] text-slate-500 font-mono">CALCULATED IN 8ms</span>
                </div>
                <div
                  className={`font-mono text-xs break-all select-all font-semibold ${
                    integrityState === 'verified' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {integrityState === 'verified' ? originalHash : tamperedHash}
                </div>
              </div>
            </div>

            {/* Verification Verdict Banner */}
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                integrityState === 'verified'
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}
            >
              {integrityState === 'verified' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 text-xs">
                <div className="font-mono font-bold uppercase tracking-wider">
                  {integrityState === 'verified'
                    ? 'VERDICT: INTEGRITY VERIFIED (100% BIT-EXACT MATCH)'
                    : 'VERDICT: INTEGRITY MISMATCH (TAMPER DETECTED)'}
                </div>
                <p className="leading-relaxed opacity-90">
                  {integrityState === 'verified'
                    ? 'The current document object is bit-exact to the digital benchmark recorded during police registration. Admissible as uncompromised evidence.'
                    : 'A single byte discrepancy in the file payload caused an avalanche change in the SHA-256 calculation. Immediate security incident flagged in audit ledger.'}
                </p>
              </div>
            </div>

            {/* Technical Context Note */}
            <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-4 flex items-center justify-between">
              <span className="font-mono">
                SHA-256 provides deterministic mathematical verification. Genesis anchoring demonstrated via simulated append-only ledger prototype.
              </span>
              <Link
                href={isAuthenticated ? "/dashboard/verification" : "/login"}
                className="text-blue-400 hover:text-blue-300 font-mono font-semibold shrink-0 ml-4 flex items-center gap-1"
              >
                <span>Live Verification Console</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* 8. ROLE-BASED ACCESS SECTION (DEMO SPECIFICATIONS)  */}
      {/* -------------------------------------------------- */}
      <section id="roles" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono font-semibold text-blue-400 tracking-wider uppercase">
            Access Governance
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            One case. Different responsibilities. Controlled access.
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            CASETRACE is designed so authorized users see only the information relevant to their responsibilities. All policies are authoritatively enforced on the server.
          </p>
        </div>

        {/* Access Decision Formula Visual */}
        <div className="bg-[#0b1328] border border-slate-800 rounded-xl p-4 sm:p-6 text-center space-y-3">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            4-FACTOR ACCESS DECISION FORMULA
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-mono font-bold">
            <span className="px-3 py-1.5 bg-[#121c38] border border-blue-800/70 text-blue-300 rounded-lg">User Role</span>
            <span className="text-slate-500">+</span>
            <span className="px-3 py-1.5 bg-[#121c38] border border-blue-800/70 text-blue-300 rounded-lg">Case Assignment</span>
            <span className="text-slate-500">+</span>
            <span className="px-3 py-1.5 bg-[#121c38] border border-blue-800/70 text-blue-300 rounded-lg">Document Sensitivity</span>
            <span className="text-slate-500">+</span>
            <span className="px-3 py-1.5 bg-[#121c38] border border-blue-800/70 text-blue-300 rounded-lg">Declared Purpose</span>
            <span className="text-slate-500">=</span>
            <span className="px-3.5 py-1.5 bg-emerald-950 border border-emerald-700 text-emerald-300 rounded-lg shadow-sm">
              Access Decision
            </span>
          </div>
        </div>

        {/* Demo Persona Selector Matrix (Preview Only - Clearly Labeled) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-blue-950 border border-blue-800 text-blue-400 rounded">
                  DEMO MODE • ROLE CLEARANCE SPECIFICATIONS
                </span>
              </div>
              <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                Select Persona to Inspect Clearance Profile
              </h3>
              <p className="text-xs text-slate-400">
                Inspect the specific institutional permissions and clearance boundaries assigned to each role.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 hidden sm:block">7 SYSTEM ROLES</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {MOCK_USERS.map((user) => {
              const isSelected = selectedDemoRole === user.role;
              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedDemoRole(user.role as Role)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-900/50 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                      : 'bg-[#0b1328] border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 font-mono font-bold text-xs text-blue-400 flex items-center justify-center">
                        {user.avatar}
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      )}
                    </div>
                    <div className="text-xs font-bold text-white truncate">{user.name}</div>
                    <div className="text-[11px] font-mono text-blue-400 font-medium truncate">{user.role}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Persona Clearance Detail Card */}
          <div className="bg-[#0b1328] border border-blue-900/70 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-base sm:text-lg font-bold text-white">{selectedPerms.personaName}</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-blue-950 border border-blue-800 text-blue-400 rounded">
                    {selectedPerms.role}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {selectedPerms.designation} • {selectedPerms.department}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">Clearance Level</span>
                  <span className="text-xs font-mono font-bold text-amber-400">{selectedPerms.clearanceLevel}</span>
                </div>
                <Link
                  href={`/login?role=${encodeURIComponent(selectedPerms.role)}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <span>Sign In as ({selectedPerms.role})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Permissions Breakdown: Can vs Cannot */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Authorized Capabilities:</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {selectedPerms.can.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-900/50 p-2 rounded border border-slate-800/80">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-rose-400">
                  <XCircle className="w-4 h-4" />
                  <span>Restricted Boundaries:</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {selectedPerms.cannot.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-900/50 p-2 rounded border border-slate-800/80">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* 9. SECURITY & GOVERNANCE SECTION                    */}
      {/* -------------------------------------------------- */}
      <section id="security" className="py-20 border-t border-slate-800/60 bg-[#090f20]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-semibold text-blue-400 tracking-wider uppercase">
              Defense in Depth
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Security and accountability by design.
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Architected with strict zero-trust principles. Every request is token-authenticated, authorization-verified, and permanently logged.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'JWT Bearer Tokens',
                desc: 'Stateless cryptographic tokens signed with HS256 algorithm enforcing short session expiration.',
                icon: Key,
              },
              {
                title: 'RBAC Access Gate',
                desc: 'Server-authoritative evaluation checks role, assignment, and sensitivity on every route.',
                icon: Shield,
              },
              {
                title: 'SHA-256 Checksums',
                desc: 'Bit-exact mathematical digests generated during ingest to detect unauthorized file tampering.',
                icon: Fingerprint,
              },
              {
                title: 'Purpose-Gated Access',
                desc: 'Viewing sensitive or forensic artifacts requires explicitly declared judicial purpose logging.',
                icon: Scale,
              },
              {
                title: 'Append-Only Audit Log',
                desc: 'Historical records cannot be modified or deleted, preserving verifiable event chronology.',
                icon: History,
              },
              {
                title: 'Isolated Object Storage',
                desc: 'Binary payloads stored in MinIO/S3 private buckets with mediated tokenized streaming.',
                icon: Server,
              },
              {
                title: 'Dynamic Risk Engine',
                desc: 'Automated calculation flags suspicious cross-jurisdiction access and repeated clearance denials.',
                icon: AlertTriangle,
              },
              {
                title: 'Case-Level Isolation',
                desc: 'Strict multi-tenancy ensures personnel cannot view cases outside their official assignment.',
                icon: FolderLock,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#0b1428] border border-slate-800/80 rounded-xl p-5 space-y-2.5"
                >
                  <Icon className="w-5 h-5 text-blue-400" />
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* 10. TRUST & INSTITUTIONAL PRINCIPLES               */}
      {/* -------------------------------------------------- */}
      <section id="about" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono font-semibold text-blue-400 tracking-wider uppercase">
            Institutional Values
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Built around the integrity of the case.
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Four non-negotiable principles guiding every architectural decision within the CASETRACE platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#0b1328] border border-slate-800 rounded-xl p-6 space-y-3">
            <span className="text-xs font-mono font-bold text-blue-400">01 / CONTEXT</span>
            <h3 className="text-base font-bold text-white">Single Source of Case Context</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              All important case information can be brought together through one Digital Case Passport, preventing information loss across disparate agency silos.
            </p>
          </div>

          <div className="bg-[#0b1328] border border-slate-800 rounded-xl p-6 space-y-3">
            <span className="text-xs font-mono font-bold text-emerald-400">02 / INTEGRITY</span>
            <h3 className="text-base font-bold text-white">Evidence Integrity</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Documents can be verified against cryptographic integrity records, ensuring digital exhibits presented to the judge match the initial seizure byte-for-byte.
            </p>
          </div>

          <div className="bg-[#0b1328] border border-slate-800 rounded-xl p-6 space-y-3">
            <span className="text-xs font-mono font-bold text-cyan-400">03 / GOVERNANCE</span>
            <h3 className="text-base font-bold text-white">Controlled Access</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Access is governed according to role, assignment, sensitivity, and declared purpose, eliminating unauthorized curiosity viewing.
            </p>
          </div>

          <div className="bg-[#0b1328] border border-slate-800 rounded-xl p-6 space-y-3">
            <span className="text-xs font-mono font-bold text-amber-400">04 / ACCOUNTABILITY</span>
            <h3 className="text-base font-bold text-white">Complete Accountability</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every important activity is recorded through an immutable, chronological audit trail, guaranteeing transparent institutional oversight.
            </p>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* 11. TECHNOLOGY STACK SECTION                        */}
      {/* -------------------------------------------------- */}
      <section id="technology" className="py-20 border-t border-slate-800/60 bg-[#090f20]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-semibold text-blue-400 tracking-wider uppercase">
              Full-Stack Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Built on a modern full-stack foundation.
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Enterprise technology stack combining high-throughput asynchronous Python microservices with responsive React interfaces.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#0b1428] border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-blue-400 font-mono text-xs font-bold">
                <Cpu className="w-4 h-4" />
                <span>FRONTEND LAYER</span>
              </div>
              <h4 className="text-base font-bold text-white">Next.js & Tailwind CSS</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Next.js 14 App Router, React 18, TypeScript 5.6, and Tailwind CSS delivering responsive, accessible dark-mode UI.
              </p>
            </div>

            <div className="bg-[#0b1428] border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold">
                <Server className="w-4 h-4" />
                <span>BACKEND MICROSERVICES</span>
              </div>
              <h4 className="text-base font-bold text-white">FastAPI & Python</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Asynchronous Python 3.10+ web framework featuring Pydantic request validation, dependency injection, and OpenAPI documentation.
              </p>
            </div>

            <div className="bg-[#0b1428] border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
                <Database className="w-4 h-4" />
                <span>DATA PERSISTENCE</span>
              </div>
              <h4 className="text-base font-bold text-white">PostgreSQL & SQLite</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                SQLAlchemy 2.0 ORM with PostgreSQL production pool management and automatic SQLite zero-setup development fallback.
              </p>
            </div>

            <div className="bg-[#0b1428] border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold">
                <HardDrive className="w-4 h-4" />
                <span>STORAGE LAYER</span>
              </div>
              <h4 className="text-base font-bold text-white">MinIO / S3 Object Storage</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                S3-compatible object storage isolating binary files from application databases with encrypted bucket policies.
              </p>
            </div>

            <div className="bg-[#0b1428] border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold">
                <Shield className="w-4 h-4" />
                <span>CRYPTOGRAPHY & RBAC</span>
              </div>
              <h4 className="text-base font-bold text-white">JWT & SHA-256 Digest</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cryptographic SHA-256 streaming verification, HS256 signed JWT authorization, and server-authoritative permission matrices.
              </p>
            </div>

            <div className="bg-[#0b1428] border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold">
                <FileCheck className="w-4 h-4" />
                <span>AUTOMATED VERIFICATION</span>
              </div>
              <h4 className="text-base font-bold text-white">Pytest & HTTPX</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                59 comprehensive automated test suites covering unit logic, RBAC gate isolation, S3 storage mocks, and 15-step E2E scenarios.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* 12. FINAL CALL TO ACTION (CTA)                      */}
      {/* -------------------------------------------------- */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-b from-[#0e1730] to-[#0a1022] border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="w-12 h-12 mx-auto rounded-xl bg-blue-600/20 border border-blue-500/50 flex items-center justify-center text-blue-400">
            <Shield className="w-6 h-6" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Turn every case into a trusted digital record.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Centralize case information, protect evidence integrity, control access, and maintain accountability with CASETRACE.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={isAuthenticated ? "/dashboard" : "/login"}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold rounded-lg text-xs tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:translate-y-[-1px]"
            >
              <span>Open CASETRACE</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#platform"
              className="px-5 py-3.5 bg-slate-900 hover:bg-slate-850 text-slate-300 font-mono font-semibold rounded-lg text-xs tracking-wider border border-slate-700/80 transition-colors"
            >
              Explore Platform
            </a>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* 13. INSTITUTIONAL FOOTER                            */}
      {/* -------------------------------------------------- */}
      <footer className="border-t border-slate-800/80 bg-[#050813] py-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left: Brand Wordmark */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 border border-blue-400/40 flex items-center justify-center text-white">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="font-mono font-extrabold text-sm text-white tracking-wider">CASETRACE</span>
                <p className="text-[11px] text-slate-400">
                  Secure Digital Case Passport & Evidence Integrity Platform
                </p>
              </div>
            </div>

            {/* Middle: Navigation Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 font-medium text-slate-300">
              <a href="#platform" className="hover:text-white transition-colors">Platform</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
              <a href="#integrity" className="hover:text-white transition-colors">Security</a>
              <a href="#roles" className="hover:text-white transition-colors">Roles</a>
              <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            </div>
          </div>

          <div className="border-t border-slate-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
            <p>Built for secure, accountable digital case workflows.</p>
            <p>© {new Date().getFullYear()} CASETRACE • Open Source • MIT License</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
