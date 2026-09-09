"use client";

import * as React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import type { User, Role } from "../types/auth";
import { authService } from "../services/authService";
import { auditService } from "../services/auditService";

interface AuthContextType {
  currentUser: User;
  isAuthenticated: boolean;
  login: (userId: string) => void;
  logout: () => void;
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
}: React.PropsWithChildren): React.ReactElement => {
  const [currentUser, setCurrentUser] = useState<User>(
    authService.getCurrentUser(),
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  const handleLogin = (userId: string) => {
    const user = authService.login(userId);
    setCurrentUser(user);
    setIsAuthenticated(true);
    auditService.logEvent(user, "LOGIN", {
      result: "SUCCESS",
      riskLevel: "LOW",
      description: `User ${user.name} logged into CASETRACE with role ${user.role}.`,
    });
  };

  const handleLogout = () => {
    auditService.logEvent(currentUser, "LOGOUT", {
      result: "SUCCESS",
      riskLevel: "LOW",
      description: `User ${currentUser.name} logged out.`,
    });
    authService.logout();
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
