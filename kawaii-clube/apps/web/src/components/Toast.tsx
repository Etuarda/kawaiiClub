import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Check } from 'lucide-react';
const Context = createContext<((text: string) => void) | null>(null);
/** Feedback curto e não bloqueante, anunciado por leitores de tela. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [text, setText] = useState(''); const [visible, setVisible] = useState(false); const timer = useRef<number>(undefined);
  const show = useCallback((next: string) => {
    setText(next); setVisible(true); window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setVisible(false), 3400);
  }, []);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return <Context.Provider value={show}>{children}
    <div className={`toast ${visible ? 'show' : ''}`} role="status" aria-live="polite">{text && <><Check size={15} aria-hidden="true" /><span>{text}</span></>}</div>
  </Context.Provider>;
}
export function useToast() { const ctx = useContext(Context); if (!ctx) throw new Error('ToastProvider ausente.'); return ctx; }
