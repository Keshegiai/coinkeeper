import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Transaction, TransactionType } from '@/domain/types';
import { Dialog } from '@/ui/Dialog';
import { TransactionForm } from './TransactionForm';

interface EditorState {
  mode: 'new' | 'edit';
  transaction?: Transaction;
  defaults?: { type?: TransactionType };
}

interface EditorApi {
  openNew: (defaults?: EditorState['defaults']) => void;
  openEdit: (t: Transaction) => void;
}

const EditorContext = createContext<EditorApi | null>(null);

export const isTypingTarget = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

/** One editor dialog for the whole app — opened from the header, FAB, rows, or the `N` key. */
export function TransactionEditorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EditorState | null>(null);
  const openNew = useCallback((defaults?: EditorState['defaults']) => setState({ mode: 'new', defaults }), []);
  const openEdit = useCallback((transaction: Transaction) => setState({ mode: 'edit', transaction }), []);
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

  const api = useMemo(() => ({ openNew, openEdit }), [openNew, openEdit]);
  return (
    <EditorContext.Provider value={api}>
      {children}
      <Dialog
        open={!!state}
        onClose={close}
        index={state?.mode === 'edit' ? 'ED' : 'NEW'}
        title={state?.mode === 'edit' ? 'Изменить операцию' : 'Новая операция'}
      >
        {state && (
          <TransactionForm
            key={state.transaction?.id ?? 'new'}
            initial={state.transaction}
            defaultType={state.defaults?.type}
            onDone={close}
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
