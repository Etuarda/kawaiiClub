import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { authenticateDemo, type DemoSession } from '../../infrastructure/demo-auth.ts';
export type { DemoSession };
interface SessionContext { session: DemoSession | null; login: (email: string, password: string) => Promise<DemoSession>; logout: () => void }
const Context = createContext<SessionContext | null>(null);
const KEY = 'kawaii-demo-session-v2';
const ALT_KEY = 'kawaii_session';
function readSession(): DemoSession | null {
  try {
    const data = localStorage.getItem(KEY) || localStorage.getItem(ALT_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data) as DemoSession;
    if (parsed.role === 'ADMIN') return { ...parsed, name: 'Ellen Kois', initials: 'EK' };
    return parsed;
  } catch { return null; }
}
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<DemoSession | null>(readSession);
  const value = useMemo<SessionContext>(() => ({
    session,
    async login(email, password) {
      const next = await authenticateDemo(email, password);
      setSession(next);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
        localStorage.setItem(ALT_KEY, JSON.stringify(next));
      } catch {/* armazenamento bloqueado: sessão só em memória */}
      return next;
    },
    logout() {
      setSession(null);
      try {
        localStorage.removeItem(KEY);
        localStorage.removeItem(ALT_KEY);
      } catch {/* sem armazenamento */}
    }
  }), [session]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useSession(): SessionContext { const ctx = useContext(Context); if (!ctx) throw new Error('AuthProvider ausente.'); return ctx; }
export const homeFor = (s: DemoSession) => s.role === 'ADMIN' ? '/admin' : '/app/inicio';
