import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Transaction, TransactionDraft } from '@/domain/types';
import { Dialog } from '@/ui/Dialog';
import { TransactionForm } from './TransactionForm';

interface EditorState {
  mode: 'new' | 'edit';
  transaction?: Transaction;
  /** Pre-filled values for a new operation (e.g. when repeating one). */
  defaults?: Partial<TransactionDraft>;
  /** Bumped on every open so repeated "new" dialogs remount fresh. */
  seq: number;
}

interface EditorApi {
  openNew: (defaults?: EditorState['defaults']) => void;
  openEdit: (t: Transaction) => void;
  /** Open a new operation pre-filled from an existing one, dated today. */
  duplicate: (t: Transaction) => void;
}

const EditorContext = createContext<EditorApi | null>(null);

export const isTypingTarget = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

/** One editor dialog for the whole app — opened from the header, FAB, rows, or the `N` key. */
export function TransactionEditorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EditorState | null>(null);
  const seq = useRef(0);
  const openNew = useCallback((defaults?: EditorState['defaults']) => setState({ mode: 'new', defaults, seq: ++seq.current }), []);
  const openEdit = useCallback((transaction: Transaction) => setState({ mode: 'edit', transaction, seq: ++seq.current }), []);
  const duplicate = useCallback(
    (t: Transaction) => setState({ mode: 'new', defaults: { type: t.type, amount: t.amount, categoryId: t.categoryId, comment: t.comment }, seq: ++seq.current }),
    [],
  );
  const close = useCallback(() => setState(null), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      if (document.querySelector('dialog[open]')) return;
      if (e.key === 'n' || e.key === 'т') {
        e.preventDefault();
        openNew();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openNew]);

  const api = useMemo(() => ({ openNew, openEdit, duplicate }), [openNew, openEdit, duplicate]);
  return (
    <EditorContext.Provider value={api}>
      {children}
      <Dialog
        open={!!state}
        onClose={close}
        index={state?.mode === 'edit' ? 'ED' : 'NEW'}
        title={state?.mode === 'edit' ? 'Изменить операцию' : state?.defaults?.amount ? 'Повтор операции' : 'Новая операция'}
      >
        {state && (
          <TransactionForm
            key={state.seq}
            initial={state.transaction}
            defaults={state.defaults}
            onDone={close}
            onDuplicate={duplicate}
          />
        )}
      </Dialog>
    </EditorContext.Provider>
  );
}

export function useTransactionEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useTransactionEditor must be used within <TransactionEditorProvider>');
  return ctx;
}
