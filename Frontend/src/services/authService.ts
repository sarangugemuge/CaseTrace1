import { User, Role } from '../types/auth';
import { MOCK_USERS } from '../mock/users';

const STORAGE_KEY = 'casetrace_current_user';
const TOKEN_KEY = 'casetrace_auth_token';

export const authService = {
  getUsers(): User[] {
    return MOCK_USERS;
  },

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as User;
        const found = MOCK_USERS.find(
          (u) => u.id === parsed.id || u.email === parsed.email || u.role === parsed.role
        );
        if (found) return found;
        if (parsed && parsed.role) return parsed;
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }
    return null;
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  login(identifier: string, role?: Role, token?: string): User {
    const cleanId = identifier.trim().toLowerCase();
    const user =
      MOCK_USERS.find(
        (u) =>
          u.id.toLowerCase() === cleanId ||
          u.email.toLowerCase() === cleanId ||
          u.role.toLowerCase() === cleanId
      ) ||
      (role ? MOCK_USERS.find((u) => u.role === role) : null) ||
      MOCK_USERS[0];

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_KEY, token || `jwt-demo-${Date.now()}`);
    }
    return user;
  },

  switchDemoRole(role: Role, token?: string): User {
    const user = MOCK_USERS.find((u) => u.role === role) || MOCK_USERS[0];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_KEY, token || `jwt-demo-${Date.now()}`);
    }
    return user;
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(STORAGE_KEY);
  },
};
