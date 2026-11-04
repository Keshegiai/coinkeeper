import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { User } from '@/domain/types';
import { setAuthToken } from '@/lib/http';
import { storage } from '@/lib/storage';
import * as api from './api';

const SESSION_KEY = 'ck.session';

type RegisterInput = { name: string; email: string; password: string };

function loadSession(): api.Session | null {
  const s = storage.get<api.Session | null>(SESSION_KEY, null);
  if (s?.token && s.user?.id) return s;
  // Migrate the v1 storage format.
  const token = storage.get<string | null>('authToken', null) ?? localStorage.getItem('authToken');
  const user = storage.get<User | null>('userData', null);
  if (token && user?.id) {
    const migrated = { token, user };
    storage.set(SESSION_KEY, migrated);
    storage.remove('authToken');
    storage.remove('userData');
    return migrated;
  }
  return null;
}

interface AuthValue {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [session, setSession] = useState<api.Session | null>(() => {
    const s = loadSession();
    setAuthToken(s?.token ?? null);
    return s;
  });

  const apply = useCallback((s: api.Session | null) => {
    setAuthToken(s?.token ?? null);
    if (s) storage.set(SESSION_KEY, s);
    else storage.remove(SESSION_KEY);
    setSession(s);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const s = await api.login(email, password);
      apply(s);
      return s.user;
    },
    [apply],
  );
  const register = useCallback(
    async (input: RegisterInput) => {
      const s = await api.register(input);
      apply(s);
      return s.user;
    },
    [apply],
  );
  const logout = useCallback(() => {
    apply(null);
    qc.clear();
  }, [apply, qc]);

  const value = useMemo(() => ({ user: session?.user ?? null, login, register, logout }), [session, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

/** For screens rendered behind <RequireAuth>. */
export function useUser(): User {
  const { user } = useAuth();
  if (!user) throw new Error('useUser called without an authenticated user');
  return user;
}
