'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { MOCK_USERS } from '../../mock/users';
import { Role } from '../../types/auth';
import { riskEngine } from '../../services/riskEngine';
import { apiClient } from '../../lib/apiClient';
import { GlobalSearchResponse } from '../../types/search';
import { ThemeToggle } from './ThemeToggle';
import { getRoleLabel } from '../../lib/roles';
import {
  Shield,
  UserCheck,
  ChevronDown,
  LogOut,
  Lock,
  Search,
  Bell,
  X,
  Loader2,
  FolderLock,
  FileText,
  ShieldCheck,
  Hash,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { NotificationItem } from '../../types/notification';
import { SecuritySettingsModal } from '../security/SecuritySettingsModal';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const { currentUser, switchRole, logout, sessionWarning, extendSession } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    apiClient.getNotifications()
      .then((res) => {
        if (isMounted) setNotifications(res);
      })
      .catch((err) => {
        console.warn('Failed to load notifications:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // Global Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GlobalSearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounce search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Execute global search when debounced query or active user changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSearchResults(null);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    let isMounted = true;
    setIsSearching(true);
    setSearchError(null);

    apiClient
      .searchGlobal(debouncedQuery)
      .then((res) => {
        if (isMounted) {
          setSearchResults(res);
          setIsSearching(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Global search error:', err);
          setSearchError('Search failed to complete. Please try again.');
          setIsSearching(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery, currentUser]);

  // Dismiss dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectResult = (url: string) => {
    setSearchOpen(false);
    router.push(url);
  };

  if (!currentUser) return null;

  return (
    <>
      {/* Subtle Session Expiration Warning Notification */}
      {sessionWarning && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-xs font-mono text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3 shadow-xs sticky top-0 z-50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
            <span>
              <strong>Security Notice:</strong> Your authenticated session is nearing inactivity expiration.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => extendSession()}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold tracking-wide transition-colors cursor-pointer"
            >
              Extend Session
            </button>
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="px-2.5 py-1 bg-slate-200 dark:bg-navy-800 hover:bg-slate-300 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 rounded text-[11px] transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      <header className="bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white sticky top-0 z-40 shadow-xs transition-colors">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Platform Identifier */}
        <Link href="/dashboard" className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-blue-600 dark:bg-navy-800 border border-blue-500 dark:border-slate-700 flex items-center justify-center text-white dark:text-blue-400 shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold tracking-wider text-base text-slate-900 dark:text-white">CASETRACE</span>
              <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-1.5 py-0.2 rounded font-bold">
                PASSPORT v2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wide hidden sm:block">
              Digital Case Passport • Access controlled by user role (RBAC)
            </p>
          </div>
        </Link>

        {/* Global Search Bar */}
        <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-md relative items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            aria-label="Global search across cases, documents, evidence artifacts, and SHA-256 hashes"
            placeholder="Global search cases, documents, hashes..."
            value={searchQuery}
            onFocus={() => {
              if (searchQuery.trim().length >= 2) setSearchOpen(true);
            }}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim().length >= 2) {
                setSearchOpen(true);
              }
            }}
            className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-800 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-blue-500 font-mono transition-colors"
          />
          {isSearching ? (
            <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin absolute right-3 pointer-events-none" />
          ) : searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults(null);
                setSearchOpen(false);
              }}
              className="p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-2.5 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}

          {/* Grouped Results Popover Dropdown */}
          {searchOpen && debouncedQuery.length >= 2 && (
            <div className="absolute top-full left-0 mt-2 w-full min-w-[380px] sm:min-w-[440px] bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl shadow-2xl z-50 overflow-hidden font-mono text-xs">
              {/* Header */}
              <div className="px-3.5 py-2 bg-slate-50 dark:bg-navy-950 border-b border-slate-200 dark:border-navy-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span className="font-bold tracking-wider uppercase truncate max-w-[220px]">
                  Search Results for &ldquo;{debouncedQuery}&rdquo;
                </span>
                {isSearching ? (
                  <span className="flex items-center gap-1 text-blue-500 shrink-0">
                    <Loader2 className="w-3 h-3 animate-spin" /> Searching...
                  </span>
                ) : (
                  <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0">
                    {searchResults?.totalResults || 0} MATCH{searchResults?.totalResults === 1 ? '' : 'ES'}
                  </span>
                )}
              </div>

              {/* Scrollable Results Body */}
              <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-navy-800/60">
                {/* Initial Loading Indicator */}
                {isSearching && !searchResults && (
                  <div className="p-6 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    <span className="text-[11px]">Searching cases, documents, evidence, and hashes...</span>
                  </div>
                )}

                {/* Error Banner */}
                {searchError && (
                  <div className="p-4 text-center text-rose-500 flex items-center justify-center gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{searchError}</span>
                  </div>
                )}

                {/* Empty State */}
                {!isSearching && searchResults && searchResults.totalResults === 0 && (
                  <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                    <div className="font-bold text-slate-700 dark:text-slate-300 text-xs">No matching records found</div>
                    <div className="text-[11px] mt-1 text-slate-400">
                      No cases, documents, evidence IDs, or hashes matched &ldquo;{debouncedQuery}&rdquo; within your clearance level.
                    </div>
                  </div>
                )}

                {/* Group 1: Cases */}
                {searchResults && searchResults.cases.length > 0 && (
                  <div className="p-2">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FolderLock className="w-3.5 h-3.5 text-blue-500" />
                      <span>Cases ({searchResults.cases.length})</span>
                    </div>
                    <div className="mt-1 space-y-1">
                      {searchResults.cases.map((c) => (
                        <button
                          key={c.caseId}
                          onClick={() => handleSelectResult(`/dashboard/cases/${c.caseId}`)}
                          className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors flex items-center justify-between group"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {c.caseNumber}
                              </span>
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                  c.status === 'ACTIVE'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                                }`}
                              >
                                {c.status}
                              </span>
                              {c.classification && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40">
                                  {c.classification}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-0.5">
                              {c.title}
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Group 2: Documents */}
                {searchResults && searchResults.documents.length > 0 && (
                  <div className="p-2">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-500" />
                      <span>Documents ({searchResults.documents.length})</span>
                    </div>
                    <div className="mt-1 space-y-1">
                      {searchResults.documents.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => handleSelectResult(`/dashboard/cases/${d.caseId}?tab=documents`)}
                          className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors flex items-center justify-between group"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                {d.name}
                              </span>
                              {d.sensitivity && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shrink-0">
                                  {d.sensitivity}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              Case: <span className="text-slate-700 dark:text-slate-300 font-medium">{d.caseNumber || d.caseId}</span>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Group 3: Evidence */}
                {searchResults && searchResults.evidence.length > 0 && (
                  <div className="p-2">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Evidence ({searchResults.evidence.length})</span>
                    </div>
                    <div className="mt-1 space-y-1">
                      {searchResults.evidence.map((e) => (
                        <button
                          key={e.evidenceId}
                          onClick={() => handleSelectResult(`/dashboard/cases/${e.caseId}?tab=evidence`)}
                          className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors flex items-center justify-between group"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {e.evidenceId}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                                {e.verificationStatus}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-0.5">
                              {e.name}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              Case: <span className="text-slate-700 dark:text-slate-300 font-medium">{e.caseNumber || e.caseId}</span>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Group 4: Hash Matches */}
                {searchResults && searchResults.hashes.length > 0 && (
                  <div className="p-2">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-purple-500" />
                      <span>Hash Matches ({searchResults.hashes.length})</span>
                    </div>
                    <div className="mt-1 space-y-1">
                      {searchResults.hashes.map((h, idx) => (
                        <button
                          key={`${h.hash}-${idx}`}
                          onClick={() => handleSelectResult(`/dashboard/cases/${h.caseId}?tab=integrity`)}
                          className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors flex items-center justify-between group"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-purple-600 dark:text-purple-400 font-mono text-[11px] truncate">
                                {h.hash.length > 24 ? `${h.hash.slice(0, 12)}...${h.hash.slice(-10)}` : h.hash}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 shrink-0">
                                {h.matchType}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-0.5">
                              {h.itemName}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              Case: <span className="text-slate-700 dark:text-slate-300 font-medium">{h.caseNumber || h.caseId}</span>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-3.5 py-1.5 bg-slate-50 dark:bg-navy-950 border-t border-slate-200 dark:border-navy-800 flex items-center justify-between text-[10px] text-slate-400">
                <span>
                  Press <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-navy-800 rounded font-bold">ESC</kbd> to close
                </span>
                <span>Click any record to navigate</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Active Security Context Indicator */}
          <div
            title="Role-Based Access Control (RBAC): Access is controlled according to the user's role and case assignments."
            className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-md text-xs font-mono"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-slate-500 dark:text-slate-400">CLEARANCE:</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold uppercase">{getRoleLabel(currentUser.role)}</span>
            <span className="text-[10px] text-slate-400 border-l border-slate-200 dark:border-navy-800 pl-1.5 hidden xl:inline">Role-governed access</span>
          </div>

          {/* Theme Switcher Button */}
          <ThemeToggle />

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              aria-label="Security Notifications & Alerts"
              title="View security and case notifications"
              className="p-2 rounded-lg bg-slate-100 dark:bg-navy-850 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-800 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-blue-600 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-84 sm:w-92 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl shadow-2xl p-4 z-50 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="font-bold text-slate-900 dark:text-white uppercase text-[11px]">
                      Notifications ({notifications.length})
                    </span>
                  </div>
                  <button onClick={() => setNotifOpen(false)} aria-label="Close notifications" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-slate-500 dark:text-slate-400 text-xs font-sans space-y-1">
                      <div className="font-bold text-slate-700 dark:text-slate-300">No New Notifications</div>
                      <div className="text-[11px] text-slate-400 max-w-xs mx-auto">
                        You have no unread security alerts or pending verifications. New case assignments and integrity alerts will appear here.
                      </div>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const severityColors: Record<string, string> = {
                        CRITICAL: 'border-rose-300 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400',
                        WARNING: 'border-amber-300 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400',
                        SUCCESS: 'border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400',
                        INFO: 'border-blue-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300',
                      };
                      const colorClass = severityColors[notif.severity] || severityColors.INFO;

                      return (
                        <div
                          key={notif.id}
                          onClick={() => {
                            setNotifOpen(false);
                            router.push(notif.targetUrl);
                          }}
                          className={`cursor-pointer p-3 rounded-lg border transition-all hover:shadow-xs hover:border-blue-500 ${colorClass}`}
                        >
                          <div className="flex items-center justify-between gap-1 text-[10px] font-bold">
                            <span className="truncate uppercase">{notif.title}</span>
                            <span className="text-slate-400 font-normal shrink-0">
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="text-slate-600 dark:text-slate-300 font-sans text-xs mt-1 leading-snug">
                            {notif.message}
                          </div>
                          {notif.caseNumber && (
                            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 dark:border-navy-800">
                              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{notif.caseNumber}</span>
                              <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1 font-bold">
                                View details →
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Role Persona Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 bg-slate-100 dark:bg-navy-850 hover:bg-slate-200 dark:hover:bg-navy-800 border border-slate-200 dark:border-navy-800 px-3 py-1.5 rounded-lg text-left transition-all shadow-sm"
              title="Active Institutional Persona"
            >
              <div className="w-7 h-7 rounded bg-blue-600 dark:bg-slate-800 border border-blue-500 dark:border-slate-700 font-mono font-bold text-xs text-white dark:text-blue-300 flex items-center justify-center">
                {currentUser.avatar}
              </div>
              <div className="hidden sm:block text-xs">
                <div className="font-bold text-slate-900 dark:text-slate-200">
                  {currentUser.name}
                </div>
                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{getRoleLabel(currentUser.role)}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </button>

            {/* Persona Switcher Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-88 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl shadow-2xl p-4 z-50 font-sans space-y-3">
                {/* User Info Header */}
                <div className="pb-3 border-b border-slate-200 dark:border-navy-800">
                  <div className="font-bold text-sm text-slate-900 dark:text-white">{currentUser.name}</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">{currentUser.email}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{currentUser.department} • {currentUser.designation}</div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-[11px] font-mono font-bold">
                    <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span>{getRoleLabel(currentUser.role, 'bilingual')}</span>
                  </div>
                </div>

                {/* Clean Role Selector Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase font-semibold flex items-center justify-between">
                    <span>Active Role Clearance</span>
                    <span className="text-[10px] text-slate-400">SIH Evaluation</span>
                  </label>
                  <select
                    value={currentUser.role}
                    onChange={(e) => {
                      switchRole(e.target.value as Role);
                      setDropdownOpen(false);
                    }}
                    aria-label="Select institutional role clearance"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Senior Officer">वरिष्ठ अन्वेषण अधिकारी (Senior Investigating Officer)</option>
                    <option value="Investigating Officer">अन्वेषण अधिकारी (Investigating Officer)</option>
                    <option value="Cyber Crime Investigating Officer">साइबर अपराध अन्वेषण अधिकारी (Cyber Crime Investigating Officer)</option>
                    <option value="Forensic Officer">डिजिटल फोरेंसिक अधिकारी (Digital Forensics Officer)</option>
                    <option value="Prosecutor">सरकारी अभियोजक (Public Prosecutor)</option>
                    <option value="Court User">न्यायिक अधिकारी (Judicial Officer)</option>
                    <option value="Auditor / Security">सुरक्षा एवं लेखा-परीक्षण अधिकारी (Security & Audit Officer)</option>
                    <option value="Admin">प्रणाली प्रशासक (System Administrator)</option>
                  </select>
                </div>

                {/* 2FA Status & Security Settings */}
                <div className="border-t border-slate-200 dark:border-navy-800 pt-2 space-y-1.5">
                  <div className="flex items-center justify-between px-2 py-1 text-xs font-mono">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">Two-Factor Auth:</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      currentUser.isTotpEnabled
                        ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-navy-950 text-slate-500 border border-slate-200 dark:border-navy-800'
                    }`}>
                      {currentUser.isTotpEnabled ? 'Active (TOTP)' : 'Disabled'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setSecurityModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-lg flex items-center justify-between font-mono transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      Security & 2FA Settings
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>

                {/* Sign Out Button */}
                <div className="border-t border-slate-200 dark:border-navy-800 pt-2">
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                      router.push('/login');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center gap-2 font-mono transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out / Reset Session
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>

    <SecuritySettingsModal
      isOpen={securityModalOpen}
      onClose={() => setSecurityModalOpen(false)}
    />
  </>
);
};
