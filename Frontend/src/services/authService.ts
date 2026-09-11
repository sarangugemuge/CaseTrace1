import { User, Role } from '../types/auth';
import { MOCK_USERS } from '../mock/users';

const USER_STORAGE_KEY = 'casetrace_current_user';
const ACCESS_TOKEN_KEY = 'casetrace_access_token';
const REFRESH_TOKEN_KEY = 'casetrace_refresh_token';
const LAST_ACTIVE_KEY = 'casetrace_last_active_timestamp';
const TOKEN_EXPIRY_KEY = 'casetrace_token_expires_at';

export const authService = {
  getUsers(): User[] {
    return MOCK_USERS;
  },

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;

    const stored = localStorage.getItem(USER_STORAGE_KEY) || sessionStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as User;
        const found = MOCK_USERS.find(
          (u) => u.id === parsed.id || u.email === parsed.email || u.role === parsed.role
        );
        if (found) {
          return found;
        }
        if (parsed && parsed.role) return parsed;
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }
    return null;
  },

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getToken(): string | null {
    return this.getAccessToken();
  },

  updateLastActive(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
  },

  getLastActive(): number {
    if (typeof window === 'undefined') return Date.now();
    const stored = sessionStorage.getItem(LAST_ACTIVE_KEY);
    return stored ? parseInt(stored, 10) : Date.now();
  },

  isInactive(timeoutMinutes: number = 15): boolean {
    if (typeof window === 'undefined') return false;
    const lastActive = this.getLastActive();
    const diffMs = Date.now() - lastActive;
    return diffMs > timeoutMinutes * 60 * 1000;
  },

  isAccessTokenExpired(skewSeconds: number = 30): boolean {
    if (typeof window === 'undefined') return true;
    const expiryStr = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryStr) return false;
    const expiryMs = parseInt(expiryStr, 10);
    return Date.now() >= expiryMs - skewSeconds * 1000;
  },

  saveSession(
    user: User,
    accessToken?: string,
    refreshToken?: string,
    expiresInSeconds: number = 600
  ): void {
    if (typeof window === 'undefined') return;

    const userJson = JSON.stringify(user);
    sessionStorage.setItem(USER_STORAGE_KEY, userJson);
    localStorage.setItem(USER_STORAGE_KEY, userJson);

    if (accessToken) {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }

    const expiryTime = Date.now() + expiresInSeconds * 1000;
    sessionStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    this.updateLastActive();
  },

  updateTokens(accessToken: string, refreshToken: string, expiresInSeconds: number = 600): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

    const expiryTime = Date.now() + expiresInSeconds * 1000;
    sessionStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    this.updateLastActive();
  },

  login(identifier: string, role?: Role, token?: string, refreshToken?: string): User {
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

    this.saveSession(user, token || `jwt-demo-${Date.now()}`, refreshToken, 600);
    return user;
  },

  switchDemoRole(role: Role, token?: string): User {
    const user = MOCK_USERS.find((u) => u.role === role) || MOCK_USERS[0];
    this.saveSession(user, token || `jwt-demo-${Date.now()}`, undefined, 600);
    return user;
  },

  clearSession(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(USER_STORAGE_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(LAST_ACTIVE_KEY);
    sessionStorage.removeItem(TOKEN_EXPIRY_KEY);

    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  logout(): void {
    this.clearSession();
  },

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const user = this.getCurrentUser();
    if (!user) return false;
    if (this.isInactive(15)) {
      this.clearSession();
      return false;
    }
    return true;
  },
};
