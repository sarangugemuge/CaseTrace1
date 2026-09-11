'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { SecurityBanner } from './SecurityBanner';
import { Shield } from 'lucide-react';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const { isAuthenticated, isLoading, currentUser } = useAuth();

  const isLandingPage = pathname === '/';
  const isLoginPage = pathname === '/login';
  const isPublicPage = isLandingPage || isLoginPage;

  useEffect(() => {
    if (!isLoading) {
      if (!isPublicPage && (!isAuthenticated || !currentUser)) {
        // Direct unauthorized access to dashboard -> redirect to login
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (isLoginPage && isAuthenticated && currentUser) {
        // Authenticated user accessing /login -> redirect to dashboard
        router.replace('/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, currentUser, isPublicPage, isLoginPage, pathname, router]);

  // Public pages render directly without dashboard chrome
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Protected route loading state during initial client session hydration
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070b19] flex flex-col items-center justify-center text-slate-300 space-y-4 font-mono">
        <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/50 flex items-center justify-center text-blue-400 animate-pulse">
          <Shield className="w-6 h-6" />
        </div>
        <div className="text-xs text-slate-400 tracking-wider">
          VERIFYING CASETRACE AUTHORIZATION & CLEARANCE...
        </div>
      </div>
    );
  }

  // Unauthenticated user attempting to view protected route: render redirecting screen
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-[#070b19] flex flex-col items-center justify-center text-slate-300 space-y-4 font-mono">
        <div className="text-xs text-slate-500 tracking-wider">
          REDIRECTING TO CASETRACE AUTHENTICATION GATEWAY...
        </div>
      </div>
    );
  }

  // Authenticated user on protected dashboard route
  return (
    <>
      <SecurityBanner />
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {children}
        </main>
      </div>
    </>
  );
};
