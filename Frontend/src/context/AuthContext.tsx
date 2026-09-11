"use client";

import * as React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import type { User, Role, LoginResult } from "../types/auth";
import { authService } from "../services/authService";
import { auditService } from "../services/auditService";
import { apiClient } from "../lib/apiClient";

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionWarning: boolean;
  login: (identifier: string, role?: Role, password?: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  switchRole: (role: Role) => void;
  extendSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
}: React.PropsWithChildren): React.ReactElement => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionWarning, setSessionWarning] = useState<boolean>(false);

  // Sync state on client mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    const authenticated = authService.isAuthenticated();
    if (user && authenticated) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      authService.updateLastActive();
    } else {
      setCurrentUser(null);
      setIsAuthenticated(false);
      authService.clearSession();
    }
    setIsLoading(false);
  }, []);

  // Inactivity tracking & session lifecycle
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleUserActivity = () => {
      authService.updateLastActive();
      if (sessionWarning) {
        setSessionWarning(false);
      }
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    // Inactivity heartbeat: check every 15 seconds
    const intervalId = setInterval(() => {
      // 1. If 15 minutes inactive -> log out
      if (authService.isInactive(15)) {
        handleLogout();
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          window.location.href = "/login?reason=inactivity";
        }
        return;
      }

      // 2. If 13 minutes inactive -> show subtle "Session expires soon" prompt
      if (authService.isInactive(13)) {
        setSessionWarning(true);
      } else {
        setSessionWarning(false);
      }

      // 3. Pre-emptive token refresh if access token expired
      if (authService.isAccessTokenExpired(30) && authService.getRefreshToken()) {
        apiClient.refreshToken().catch(() => {});
      }
    }, 15000);

    // Best-effort browser exit cleanup
    const handleBeforeUnload = () => {
      const token = authService.getAccessToken();
      if (token && navigator.sendBeacon) {
        navigator.sendBeacon("/api/auth/logout");
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      clearInterval(intervalId);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isAuthenticated, sessionWarning]);

  const handleLogin = async (
    identifier: string,
    role?: Role,
    password: string = "password123"
  ): Promise<LoginResult> => {
    try {
      const result = await apiClient.login(identifier, role, password);

      if (result.user) {
        setCurrentUser(result.user);
        setIsAuthenticated(true);
        auditService.logEvent(result.user, "LOGIN", {
          result: "SUCCESS",
          riskLevel: "LOW",
          description: `User ${result.user.name} logged into CASETRACE with clearance ${result.user.role}.`,
        });
      }
      return result;
    } catch (err: any) {
      // Fallback for offline simulation
      if (err.message && err.message !== "Failed to fetch") {
        throw err;
      }
      const user = authService.login(identifier, role);
      setCurrentUser(user);
      setIsAuthenticated(true);
      auditService.logEvent(user, "LOGIN", {
        result: "SUCCESS",
        riskLevel: "LOW",
        description: `User ${user.name} logged into CASETRACE with role ${user.role}.`,
      });
      return { user };
    }
  };

  const handleLogout = async () => {
    if (currentUser) {
      auditService.logEvent(currentUser, "LOGOUT", {
        result: "SUCCESS",
        riskLevel: "LOW",
        description: `User ${currentUser.name} signed out of session.`,
      });
    }
    await apiClient.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setSessionWarning(false);
  };

  const handleSwitchRole = (role: Role) => {
    const user = authService.switchDemoRole(role);
    setCurrentUser(user);
    setIsAuthenticated(true);
    auditService.logEvent(user, "LOGIN", {
      result: "SUCCESS",
      riskLevel: "LOW",
      description: `Clearance persona switched to ${user.name} (${user.role}).`,
    });
  };

  const extendSession = async () => {
    authService.updateLastActive();
    setSessionWarning(false);
    await apiClient.refreshToken();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isLoading,
        sessionWarning,
        login: handleLogin,
        logout: handleLogout,
        switchRole: handleSwitchRole,
        extendSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
