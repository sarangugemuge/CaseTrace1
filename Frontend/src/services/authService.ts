import { User, Role } from '../types/auth';
import { MOCK_USERS } from '../mock/users';

const STORAGE_KEY = 'casetrace_current_user';

export const authService = {
  getUsers(): User[] {
    return MOCK_USERS;
  },

  getCurrentUser(): User {
    if (typeof window === 'undefined') {
      return MOCK_USERS[0]; // Senior Officer default SSR
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as User;
        const found = MOCK_USERS.find((u) => u.id === parsed.id || u.role === parsed.role);
        if (found) return found;
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }
    // Default to Senior Officer
    return MOCK_USERS[0];
  },

  login(userId: string): User {
    const user = MOCK_USERS.find((u) => u.id === userId) || MOCK_USERS[0];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
    return user;
  },

  switchDemoRole(role: Role): User {
    const user = MOCK_USERS.find((u) => u.role === role) || MOCK_USERS[0];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
    return user;
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return true;
    return !!localStorage.getItem(STORAGE_KEY);
  },
};
