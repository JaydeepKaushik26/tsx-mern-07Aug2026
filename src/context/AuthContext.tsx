import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { login as apiLogin, logout as apiLogout, refresh as apiRefresh } from '../api/authApi';
import type { AuthTokens } from '../api/authApi';
import { decodeJwtPayload } from '../utils/jwt';

interface StoredSession {
  accessToken: string;
  refreshToken: string;
  user: { id: string; username: string };
}

interface AuthState {
  user: string | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);
const STORAGE_KEY = 'sw-app-auth-session';

// Refresh a little before actual expiry so the user is never logged out mid-session.
const REFRESH_SKEW_MS = 5_000;

function toSession(tokens: AuthTokens): StoredSession {
  return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user: tokens.user };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshTimer = useRef<number | undefined>(undefined);
  const sessionRef = useRef<StoredSession | null>(session);
  sessionRef.current = session;

  const persist = useCallback((next: StoredSession | null) => {
    setSession(next);
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const scheduleSilentRefresh = useCallback(
    (current: StoredSession) => {
      window.clearTimeout(refreshTimer.current);
      const payload = decodeJwtPayload(current.accessToken);
      if (!payload) return;
      const delay = Math.max(payload.exp * 1000 - Date.now() - REFRESH_SKEW_MS, 0);

      refreshTimer.current = window.setTimeout(async () => {
        try {
          const tokens = await apiRefresh(current.refreshToken);
          const next = toSession(tokens);
          persist(next);
          scheduleSilentRefresh(next);
        } catch {
          persist(null);
        }
      }, delay);
    },
    [persist]
  );

  const logout = useCallback(() => {
    window.clearTimeout(refreshTimer.current);
    const current = sessionRef.current;
    if (current) void apiLogout(current.refreshToken).catch(() => undefined);
    persist(null);
  }, [persist]);

  useEffect(() => {
    if (session) scheduleSilentRefresh(session);
    return () => window.clearTimeout(refreshTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const tokens = await apiLogin(username, password);
        const next = toSession(tokens);
        persist(next);
        scheduleSilentRefresh(next);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Login failed.');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [persist, scheduleSilentRefresh]
  );

  const value = useMemo<AuthState>(
    () => ({
      user: session?.user.username ?? null,
      accessToken: session?.accessToken ?? null,
      isAuthenticated: Boolean(session),
      isLoading,
      error,
      login,
      logout,
    }),
    [session, isLoading, error, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
