import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'aloja-te:demo-session';

interface DemoSession {
  name: string;
  email: string;
}

interface DemoAuthContextValue {
  session: DemoSession | null;
  login: (email: string) => void;
  logout: () => void;
}

const DemoAuthContext = createContext<DemoAuthContextValue | undefined>(undefined);

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<DemoSession | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as DemoSession) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  }, [session]);

  const login = useCallback((email: string) => {
    const name = email.split('@')[0]?.replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Anfitrión demo';
    setSession({ name, email });
  }, []);

  const logout = useCallback(() => setSession(null), []);

  const value = useMemo<DemoAuthContextValue>(() => ({ session, login, logout }), [session, login, logout]);
  return <DemoAuthContext.Provider value={value}>{children}</DemoAuthContext.Provider>;
}

export function useDemoAuth(): DemoAuthContextValue {
  const ctx = useContext(DemoAuthContext);
  if (!ctx) throw new Error('useDemoAuth debe usarse dentro de DemoAuthProvider');
  return ctx;
}

export default DemoAuthContext;
