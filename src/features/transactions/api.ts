import type { Transaction, TransactionDraft } from '@/domain/types';
import { request } from '@/lib/http';

/** Shape on the wire. Older records embed the whole category object. */
type RawTransaction = Omit<Transaction, 'categoryId' | 'comment' | 'createdAt'> & {
  categoryId?: string;
  category?: { id: string };
  comment?: string | null;
  createdAt?: number;
};

export function normalizeTransaction(raw: RawTransaction): Transaction {
  return {
    id: String(raw.id),
    userId: String(raw.userId),
    type: raw.type === 'income' ? 'income' : 'expense',
    amount: Number(raw.amount) || 0,
    categoryId: String(raw.categoryId ?? raw.category?.id ?? ''),
    date: raw.date,
    comment: raw.comment ?? '',
    createdAt: raw.createdAt ?? 0,
  };
}

export async function list(userId: string, signal?: AbortSignal) {
  const rows = await request<RawTransaction[]>('/transactions', { where: { userId }, signal });
  return rows.map(normalizeTransaction);
}

export async function create(userId: string, draft: TransactionDraft) {
  const row = await request<RawTransaction>('/transactions', {
    method: 'POST',
    body: { ...draft, userId, createdAt: Date.now() },
  });
  return normalizeTransaction(row);
}

export async function update(t: Transaction) {
  // PUT replaces the record — this also migrates legacy rows to `categoryId`.
  const row = await request<RawTransaction>(`/transactions/${t.id}`, { method: 'PUT', body: { ...t } });
  return normalizeTransaction(row);
}

export async function remove(id: string) {
  await request<unknown>(`/transactions/${id}`, { method: 'DELETE' });
}
