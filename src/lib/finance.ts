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

// ---- Series for charts -----------------------------------------------------

export interface BalancePoint extends FlowBucket {
  /** Running balance at the end of the bucket. */
  balance: number;
  net: number;
}

/**
 * Running balance across a period, starting from everything that happened
 * before it (so the line sits at the real account level, not at zero).
 * Future buckets are dropped — a flat line into next week says nothing.
 */
export function balanceSeries(
  all: readonly Transaction[],
  from: ISODate | null,
  to: ISODate | null,
  now: ISODate = today(),
): { granularity: Granularity; opening: number; points: BalancePoint[] } {
  const end = to && to < now ? to : now;
  const opening = from ? totals(all.filter((t) => t.date < from)).net : 0;
  const { granularity, buckets } = cashFlowSeries(filterByPeriod(all, from, end), from, end);
  let bal = opening;
  const points = buckets.map((b) => {
    const net = b.income - b.expense;
    bal += net;
    return { ...b, income: round2(b.income), expense: round2(b.expense), net: round2(net), balance: round2(bal) };
  });
  return { granularity, opening: round2(opening), points };
}

/** Sum of one transaction type per calendar day. */
export function dailyTotals(ts: readonly Transaction[], type: Transaction['type'] = 'expense'): Map<ISODate, number> {
  const out = new Map<ISODate, number>();
  for (const t of ts) if (t.type === type) out.set(t.date, round2((out.get(t.date) ?? 0) + t.amount));
  return out;
}

export interface MonthPace {
  /** Days in the month. */
  days: number;
  /** Days that have already happened (0 for a future month, `days` for a past one). */
  elapsed: number;
  /** Cumulative spending by day, for elapsed days only. */
  current: number[];
  /** Cumulative spending by day for the whole previous month. */
  previous: number[];
  spent: number;
  /** Previous month's spending by the same day-of-month. */
  previousToDate: number;
  previousTotal: number;
  /** Projection to month end; `null` once the month is over (or hasn't started). */
  forecast: number | null;
}

function cumulativeByDay(ts: readonly Transaction[], monthStart: Date, days: number): number[] {
  const prefix = toISODate(monthStart).slice(0, 8);
  const perDay = Array.from({ length: days }, () => 0);
  for (const t of ts) {
    if (t.type !== 'expense' || !t.date.startsWith(prefix)) continue;
    const d = Number(t.date.slice(8, 10)) - 1;
    if (d >= 0 && d < days) perDay[d]! += t.amount;
  }
  let acc = 0;
  return perDay.map((v) => (acc = round2(acc + v)));
}

/** How this month's spending compares with last month at the same point in time. */
export function monthPace(ts: readonly Transaction[], month: Date = new Date(), now: Date = new Date()): MonthPace {
  const start = startOfMonth(month);
  const days = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  const prevStart = addMonths(start, -1);
  const prevDays = new Date(prevStart.getFullYear(), prevStart.getMonth() + 1, 0).getDate();

  const monthKey = start.getFullYear() * 12 + start.getMonth();
  const nowKey = now.getFullYear() * 12 + now.getMonth();
  const elapsed = monthKey < nowKey ? days : monthKey > nowKey ? 0 : now.getDate();

  const full = cumulativeByDay(ts, start, days);
  const previous = cumulativeByDay(ts, prevStart, prevDays);
  const current = full.slice(0, elapsed);
  const spent = current.at(-1) ?? 0;
  const previousTotal = previous.at(-1) ?? 0;
  const previousToDate = elapsed ? previous[Math.min(elapsed, prevDays) - 1] ?? 0 : 0;
  // Project the rest of the month from last month's rhythm when we have it (rent on the 1st
  // shouldn't be extrapolated 30 times); fall back to the current daily average.
  let forecast: number | null = null;
  if (elapsed > 0 && elapsed < days) {
    const rest = previousTotal > 0 ? Math.max(0, previousTotal - previousToDate) * ((days - elapsed) / Math.max(1, prevDays - Math.min(elapsed, prevDays))) : (spent / elapsed) * (days - elapsed);
    forecast = Math.round(spent + rest);
  }
  return { days, elapsed, current, previous, spent, previousToDate, previousTotal, forecast };
}

export interface CategoryChange {
  categoryId: string;
  category: Category | undefined;
  current: number;
  previous: number;
  diff: number;
}

/** Per-category movement between two sets of transactions, biggest swings first. */
export function categoryChanges(
  current: readonly Transaction[],
  previous: readonly Transaction[],
  categories: ReadonlyMap<string, Category>,
  type: Transaction['type'] = 'expense',
): CategoryChange[] {
  const sum = (ts: readonly Transaction[]) => {
    const m = new Map<string, number>();
    for (const t of ts) if (t.type === type) m.set(t.categoryId, (m.get(t.categoryId) ?? 0) + t.amount);
    return m;
  };
  const a = sum(current);
  const b = sum(previous);
  return [...new Set([...a.keys(), ...b.keys()])]
    .map((id) => {
      const cur = round2(a.get(id) ?? 0);
      const prev = round2(b.get(id) ?? 0);
      return { categoryId: id, category: categories.get(id), current: cur, previous: prev, diff: round2(cur - prev) };
    })
    .filter((c) => c.diff !== 0)
    .sort((x, y) => Math.abs(y.diff) - Math.abs(x.diff));
}

/** Squeeze a series into at most `max` points (sum or keep-last per chunk). */
export function resample(values: readonly number[], max: number, mode: 'sum' | 'last' = 'sum'): number[] {
  if (values.length <= max || max <= 0) return [...values];
  const size = Math.ceil(values.length / max);
  const out: number[] = [];
  for (let i = 0; i < values.length; i += size) {
    const chunk = values.slice(i, i + size);
    out.push(mode === 'sum' ? chunk.reduce((s, v) => s + v, 0) : chunk.at(-1)!);
  }
  return out;
}
