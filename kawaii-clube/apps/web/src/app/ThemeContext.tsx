import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Moon, Sun } from 'lucide-react';
type Theme = 'light' | 'dark';
const KEY = 'kawaii-theme';
const Context = createContext<{ theme: Theme; toggle: () => void } | null>(null);
/** O sistema começa claro e só escurece pelo botão de tema, como na referência. Preferência só deste navegador. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => { try { return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light'; } catch { return 'light'; } });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem(KEY, theme); } catch {/* sem armazenamento */}
  }, [theme]);
  const value = useMemo(() => ({ theme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') }), [theme]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useTheme() { const ctx = useContext(Context); if (!ctx) throw new Error('ThemeProvider ausente.'); return ctx; }
export function ThemeButton({ className = 'icon-btn', withLabel = false }: { className?: string; withLabel?: boolean }) {
  const { theme, toggle } = useTheme(); const dark = theme === 'dark'; const label = dark ? 'Modo claro' : 'Modo noturno';
  return <button type="button" className={className} onClick={toggle} aria-label={withLabel ? undefined : `Ativar ${label.toLowerCase()}`}>
    {dark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}{withLabel && <span>{label}</span>}
  </button>;
}
