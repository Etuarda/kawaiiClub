import { useEffect, useId, useRef, type FormEvent, type MouseEvent, type ReactNode, type SyntheticEvent } from 'react';
import { X } from 'lucide-react';
interface DialogProps {
  open: boolean; onClose: () => void; overline: string; title: ReactNode; children: ReactNode;
  footer?: ReactNode; onSubmit?: (e: FormEvent<HTMLFormElement>) => void; wide?: boolean;
}
/** Abre/fecha um <dialog> nativo: foco preso, Esc e clique no fundo chamam onClose, foco volta à origem. */
export function useNativeDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (open && !el.open) el.showModal(); else if (!open && el.open) el.close();
  }, [open]);
  return {
    ref,
    onCancel: (e: SyntheticEvent) => { e.preventDefault(); onClose(); },
    onClick: (e: MouseEvent<HTMLDialogElement>) => { if (e.target === e.currentTarget) onClose(); }
  };
}
export function Dialog({ open, onClose, overline, title, children, footer, onSubmit, wide }: DialogProps) {
  const dialog = useNativeDialog(open, onClose); const titleId = useId();
  return <dialog {...dialog} className={`modal ${wide ? 'wide' : ''}`} aria-labelledby={titleId}>
    {open && <form className="am" noValidate onSubmit={e => { e.preventDefault(); onSubmit?.(e); }}>
      <button type="button" className="icon-btn am-close" aria-label="Fechar" onClick={onClose}><X size={17} /></button>
      <p className="overline">{overline}</p><h2 id={titleId} className="am-title">{title}</h2>
      <div className="am-body">{children}</div>
      {footer && <div className="am-foot">{footer}</div>}
    </form>}
  </dialog>;
}
