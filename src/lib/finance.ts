import type { Category, ISODate, Transaction } from '@/domain/types';
import { addMonths, daysBetween, parseISODate, startOfMonth, toISODate, addDays, today } from './date';
import { inPeriod } from './period';
import { round2 } from './money';

export interface Totals {
  income: number;
  expense: number;
  net: number;
  count: number;
}

export function filterByPeriod(ts: readonly Transaction[], from: ISODate | null, to: ISODate | null) {
  return ts.filter((t) => inPeriod(t.date, from, to));
}

export function totals(ts: readonly Transaction[]): Totals {
  let income = 0;
  let expense = 0;
  for (const t of ts) {
    if (t.type === 'income') income += t.amount;
    else expense += t.amount;
  }
  return { income: round2(income), expense: round2(expense), net: round2(income - expense), count: ts.length };
}

/** Relative change; `null` when there's no meaningful baseline. */
export function delta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return (current - previous) / Math.abs(previous);
}

export interface CategorySlice {
  categoryId: string;
  category: Category | undefined;
  amount: number;
  share: number;
  count: number;
}

export function breakdownByCategory(
  ts: readonly Transaction[],
  type: Transaction['type'],
  categories: ReadonlyMap<string, Category>,
): CategorySlice[] {
  const acc = new Map<string, { amount: number; count: number }>();
  let total = 0;
  for (const t of ts) {
    if (t.type !== type) continue;
    const cur = acc.get(t.categoryId) ?? { amount: 0, count: 0 };
    cur.amount += t.amount;
    cur.count += 1;
    acc.set(t.categoryId, cur);
    total += t.amount;
  }
  return [...acc.entries()]
    .map(([categoryId, v]) => ({
      categoryId,
      category: categories.get(categoryId),
      amount: round2(v.amount),
      count: v.count,
      share: total ? v.amount / total : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export type Granularity = 'day' | 'month';

export interface FlowBucket {
  key: string;
  start: ISODate;
  end: ISODate;
  income: number;
  expense: number;
}

/**
 * Bucket transactions into a continuous series (gaps are zero-filled) so charts
 * show the passage of time honestly. Daily up to ~2 months, monthly beyond.
 */
export function cashFlowSeries(
  ts: readonly Transaction[],
  from: ISODate | null,
  to: ISODate | null,
): { granularity: Granularity; buckets: FlowBucket[] } {
  const dates = ts.map((t) => t.date).sort();
  const start = from ?? dates[0] ?? today();
  const end = to ?? (dates.at(-1) && dates.at(-1)! > today() ? dates.at(-1)! : today());
  if (start > end) return { granularity: 'day', buckets: [] };

  const granularity: Granularity = daysBetween(start, end) <= 62 ? 'day' : 'month';
  const buckets: FlowBucket[] = [];
  const index = new Map<string, FlowBucket>();

  if (granularity === 'day') {
    for (let d = start; d <= end; d = addDays(d, 1)) {
      const b = { key: d, start: d, end: d, income: 0, expense: 0 };
      buckets.push(b);
      index.set(d, b);
    }
  } else {
    let cursor = startOfMonth(parseISODate(start));
    const last = parseISODate(end);
    while (cursor <= last) {
      const s = toISODate(cursor);
      const next = addMonths(cursor, 1);
      const e = addDays(toISODate(next), -1);
      const b = { key: s.slice(0, 7), start: s < start ? start : s, end: e > end ? end : e, income: 0, expense: 0 };
      buckets.push(b);
      index.set(b.key, b);
      cursor = next;
    }
  }

  for (const t of ts) {
    if (!inPeriod(t.date, start, end)) continue;
    const b = index.get(granularity === 'day' ? t.date : t.date.slice(0, 7));
    if (!b) continue;
    if (t.type === 'income') b.income += t.amount;
    else b.expense += t.amount;
  }
  return { granularity, buckets };
}

export interface BudgetStatus {
  category: Category;
  budget: number;
  spent: number;
  ratio: number;
  remaining: number;
}

export function budgetStatuses(ts: readonly Transaction[], categories: readonly Category[], month: Date = new Date()) {
  const from = toISODate(startOfMonth(month));
  const to = addDays(toISODate(addMonths(startOfMonth(month), 1)), -1);
  const spentBy = new Map<string, number>();
  for (const t of ts) {
    if (t.type === 'expense' && inPeriod(t.date, from, to)) {
      spentBy.set(t.categoryId, (spentBy.get(t.categoryId) ?? 0) + t.amount);
    }
  }
  return categories
    .filter((c): c is Category & { budget: number } => typeof c.budget === 'number' && c.budget > 0)
    .map<BudgetStatus>((c) => {
      const spent = round2(spentBy.get(c.id) ?? 0);
      return { category: c, budget: c.budget, spent, ratio: spent / c.budget, remaining: round2(c.budget - spent) };
    })
    .sort((a, b) => b.ratio - a.ratio);
}

/** Newest first; ties broken by creation time. */
export function sortTransactions<T extends Pick<Transaction, 'date' | 'createdAt'>>(ts: readonly T[]): T[] {
  return [...ts].sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : a.date < b.date ? 1 : -1));
}

export function groupByDay<T extends Pick<Transaction, 'date'>>(ts: readonly T[]): Array<{ date: ISODate; items: T[] }> {
  const groups: Array<{ date: ISODate; items: T[] }> = [];
  for (const t of ts) {
    const last = groups.at(-1);
    if (last && last.date === t.date) last.items.push(t);
    else groups.push({ date: t.date, items: [t] });
  }
  return groups;
}
