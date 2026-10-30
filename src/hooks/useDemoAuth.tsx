import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiClient } from '@/api/client';
import { setSessionToken } from '@/api/sessionToken';

const STORAGE_KEY = 'aloja-te:demo-session';

export interface DemoSession {
  name: string;
  email: string;
  /** UUID del usuario autenticado (antes se usaba como anfitrionId). */
  usuarioId: string;
  token: string;
}

interface DemoAuthContextValue {
  session: DemoSession | null;
  /** @deprecated usar usuarioId */
  anfitrionId: string | null;
  login: (email: string, contrasena: string) => Promise<void>;
  logout: () => void;
}

const DemoAuthContext = createContext<DemoAuthContextValue | undefined>(undefined);

interface SesionApiResponse {
  token: string;
  usuarioId: string;
  estado: string;
  contexto: string;
  permisos?: string[];
}

function normalizeSession(raw: unknown): DemoSession | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Partial<DemoSession> & { anfitrionId?: string };
  if (!value.email || !value.name || !value.token) return null;
  const usuarioId = value.usuarioId ?? value.anfitrionId;
  if (!usuarioId) return null;
  return {
    name: value.name,
    email: value.email,
    usuarioId,
    token: value.token,
  };
}

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<DemoSession | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? normalizeSession(JSON.parse(raw)) : null;
      if (parsed) setSessionToken(parsed.token);
      return parsed;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      setSessionToken(session.token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setSessionToken(null);
    }
  }, [session]);

  const login = useCallback(async (email: string, contrasena: string) => {
    const respuesta = await apiClient.post<SesionApiResponse>('/sesiones', {
      email: email.trim(),
      contrasena,
    });
    const name =
      email.split('@')[0]?.replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ||
      'Anfitrión';
    setSession({
      name,
      email: email.trim(),
      usuarioId: respuesta.usuarioId,
      token: respuesta.token,
    });
  }, []);

  const logout = useCallback(() => setSession(null), []);

  const value = useMemo<DemoAuthContextValue>(
    () => ({
      session,
      anfitrionId: session?.usuarioId ?? null,
      login,
      logout,
    }),
    [session, login, logout],
  );

  return <DemoAuthContext.Provider value={value}>{children}</DemoAuthContext.Provider>;
}

export function useDemoAuth(): DemoAuthContextValue {
  const ctx = useContext(DemoAuthContext);
  if (!ctx) throw new Error('useDemoAuth debe usarse dentro de DemoAuthProvider');
  return ctx;
}

export default DemoAuthContext;
