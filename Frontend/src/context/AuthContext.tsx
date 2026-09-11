"use client";

import * as React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import type { User, Role } from "../types/auth";
import { authService } from "../services/authService";
import { auditService } from "../services/auditService";
import { apiClient } from "../lib/apiClient";

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, role?: Role, password?: string) => Promise<User>;
  logout: () => void;
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
}: React.PropsWithChildren): React.ReactElement => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Only check localStorage on client mount to prevent SSR hydration mismatch
    const user = authService.getCurrentUser();
    const authenticated = authService.isAuthenticated();
    if (user && authenticated) {
      setCurrentUser(user);
      setIsAuthenticated(true);
    } else {
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async (
    identifier: string,
    role?: Role,
    password: string = "password123"
  ): Promise<User> => {
    try {
      const user = await apiClient.login(identifier, role, password);
      setCurrentUser(user);
      setIsAuthenticated(true);
      auditService.logEvent(user, "LOGIN", {
        result: "SUCCESS",
        riskLevel: "LOW",
        description: `User ${user.name} logged into CASETRACE with role ${user.role}.`,
      });
      return user;
    } catch {
      const user = authService.login(identifier, role);
      setCurrentUser(user);
      setIsAuthenticated(true);
      auditService.logEvent(user, "LOGIN", {
        result: "SUCCESS",
        riskLevel: "LOW",
        description: `User ${user.name} logged into CASETRACE with role ${user.role}.`,
      });
      return user;
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      auditService.logEvent(currentUser, "LOGOUT", {
        result: "SUCCESS",
        riskLevel: "LOW",
        description: `User ${currentUser.name} logged out.`,
      });
    }
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const handleSwitchRole = (role: Role) => {
    const user = authService.switchDemoRole(role);
    setCurrentUser(user);
    setIsAuthenticated(true);
    auditService.logEvent(user, "LOGIN", {
      result: "SUCCESS",
      riskLevel: "LOW",
      description: `Demo Persona switched to ${user.name} (${user.role}).`,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isLoading,
        login: handleLogin,
        logout: handleLogout,
        switchRole: handleSwitchRole,
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
