import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Transaction, TransactionDraft } from '@/domain/types';
import { sortTransactions } from '@/lib/finance';
import { errorMessage } from '@/lib/http';
import { useUser } from '@/features/auth/AuthProvider';
import { useToast } from '@/ui/Toast';
import * as api from './api';

export const transactionsKey = (userId: string) => ['transactions', userId] as const;

export function useTransactions() {
  const user = useUser();
  const query = useQuery({
    queryKey: transactionsKey(user.id),
    queryFn: ({ signal }) => api.list(user.id, signal),
    select: sortTransactions,
  });
  return { ...query, transactions: query.data ?? EMPTY };
}
const EMPTY: Transaction[] = [];

/**
 * All writes are optimistic: the UI updates instantly and rolls back with a toast
 * if the server rejects the change.
 */
function useOptimistic() {
  const user = useUser();
  const qc = useQueryClient();
  const key = transactionsKey(user.id);
  const toast = useToast();

  const snapshot = async (mutate: (prev: Transaction[]) => Transaction[]) => {
    await qc.cancelQueries({ queryKey: key });
    const prev = qc.getQueryData<Transaction[]>(key) ?? [];
    qc.setQueryData<Transaction[]>(key, mutate(prev));
    return { prev };
  };
  const rollback = (e: unknown, _v: unknown, ctx?: { prev: Transaction[] }) => {
    if (ctx) qc.setQueryData(key, ctx.prev);
    toast({ message: errorMessage(e), tone: 'error' });
  };
  const settle = () => qc.invalidateQueries({ queryKey: key });
  return { user, qc, key, toast, snapshot, rollback, settle };
}

export function useCreateTransaction() {
  const { user, qc, key, snapshot, rollback, settle } = useOptimistic();
  return useMutation({
    mutationFn: (draft: TransactionDraft) => api.create(user.id, draft),
    onMutate: async (draft) => {
      const tmpId = `tmp-${crypto.randomUUID()}`;
      const ctx = await snapshot((prev) => [{ ...draft, id: tmpId, userId: user.id, createdAt: Date.now() }, ...prev]);
      return { ...ctx, tmpId };
    },
    onSuccess: (created, _draft, ctx) => {
      qc.setQueryData<Transaction[]>(key, (xs = []) => xs.map((t) => (t.id === ctx.tmpId ? created : t)));
    },
    onError: rollback,
    onSettled: settle,
  });
}

export function useUpdateTransaction() {
  const { snapshot, rollback, settle } = useOptimistic();
  return useMutation({
    mutationFn: api.update,
    onMutate: (next) => snapshot((prev) => prev.map((t) => (t.id === next.id ? next : t))),
    onError: rollback,
    onSettled: settle,
  });
}

export function useDeleteTransaction() {
  const { toast, snapshot, rollback, settle } = useOptimistic();
  const create = useCreateTransaction();
  return useMutation({
    mutationFn: (t: Transaction) => api.remove(t.id),
    onMutate: (t) => snapshot((prev) => prev.filter((x) => x.id !== t.id)),
    onSuccess: (_r, t) => {
      const { type, amount, categoryId, date, comment } = t;
      toast({
        message: 'Операция удалена',
        action: { label: 'Вернуть', onClick: () => create.mutate({ type, amount, categoryId, date, comment }) },
      });
    },
    onError: rollback,
    onSettled: settle,
  });
}

/** Totals over all time — used for the "balance" figure. */
export function useBalance(transactions: readonly Transaction[]) {
  return useMemo(() => transactions.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0), [transactions]);
}
