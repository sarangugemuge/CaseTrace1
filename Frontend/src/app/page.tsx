'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/common/ThemeToggle';
import {
  Shield,
  FolderLock,
  FileCheck,
  ShieldCheck,
  ArrowRight,
  Menu,
  X,
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b19] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden transition-colors flex flex-col justify-between">
      {/* Background Subtle Grid Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(rgba(100, 116, 139, 0.4) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Navigation Bar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 dark:bg-[#070b19]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 shadow-sm py-3'
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
                Evidence Integrity & Access Governance
              </p>
            </div>
          </Link>

          {/* Desktop Right Actions */}
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
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-[#0a1024] border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-5 space-y-3 shadow-lg">
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg text-center border border-slate-300 dark:border-slate-700 font-mono"
              >
                Sign In
              </Link>
              <Link
                href={!isLoading && isAuthenticated ? "/dashboard" : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg text-center flex items-center justify-center gap-2 font-mono"
              >
                <span>Open CASETRACE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Dominant Hero Section */}
        <section className="relative pt-36 pb-16 lg:pt-44 lg:pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/80 rounded-full text-blue-700 dark:text-blue-400 font-mono text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Digital Case Passport & Evidence Integrity Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
            CASETRACE
          </h1>

          <p className="text-lg sm:text-xl font-semibold text-blue-600 dark:text-blue-400 font-mono tracking-wide">
            Secure Digital Case Passport
          </p>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
            A secure platform for managing case records, evidence, documents, and investigation history with controlled access and complete traceability.
          </p>

          {/* Primary Action Buttons */}
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
        </section>

        {/* Key Capabilities Section */}
        <section className="py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800/60">
          <div className="text-center mb-8">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Key Capabilities
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-3 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <FolderLock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Secure Case Records</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                Centralized digital case dossiers linking incident reports, assigned personnel, clearance levels, and investigation status.
              </p>
            </div>

            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-3 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Evidence & Document Management</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                Verifiable document versioning with authoritative SHA-256 cryptographic integrity anchors and secure evidence storage.
              </p>
            </div>

            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-3 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Complete Audit Trail</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                Tamper-evident, chronological chain of custody and access logging complying with statutory evidence standards.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Institutional Minimal Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
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
