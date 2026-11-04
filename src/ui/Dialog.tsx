import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import styles from './Dialog.module.css';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  index?: string;
  children: ReactNode;
  size?: 'sm' | 'md';
}

/**
 * Native <dialog>: focus trapping, Esc-to-close, inert background and top-layer
 * rendering for free. On phones it becomes a bottom sheet.
 */
export function Dialog({ open, onClose, title, index, children, size = 'md' }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleClose = () => onCloseRef.current();
    const handleCancel = (e: Event) => {
      e.preventDefault();
      onCloseRef.current();
    };
    el.addEventListener('close', handleClose);
    el.addEventListener('cancel', handleCancel);
    return () => {
      el.removeEventListener('close', handleClose);
      el.removeEventListener('cancel', handleCancel);
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className={cn(styles.dialog, styles[size])}
      aria-labelledby={titleId}
      onMouseDown={(e) => {
        // Click on the backdrop (the <dialog> itself, outside the panel) closes.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {open && (
        <div className={styles.panel}>
          <header className={styles.header}>
            <h2 id={titleId} className={cn('label', styles.title)}>
              {index && <span className={styles.index}>{index}</span>}
              {title}
            </h2>
            <button className={styles.close} onClick={onClose} aria-label="Закрыть">
              <X size={18} />
            </button>
          </header>
          <div className={styles.body}>{children}</div>
        </div>
      )}
    </dialog>
  );
}
