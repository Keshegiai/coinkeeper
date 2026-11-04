import type { ISODate, Transaction } from '@/domain/types';
import { daysBetween, parseISODate, today } from '@/lib/date';

export interface Insights {
  avgDailyExpense: number;
  largestExpense: Transaction | null;
  busiestWeekday: { index: number; amount: number } | null;
  weekdayTotals: number[];
  activeDays: number;
}

/** Monday-first weekday totals and a few headline numbers for a set of transactions. */
export function computeInsights(ts: readonly Transaction[], from: ISODate | null, to: ISODate | null): Insights {
  const expenses = ts.filter((t) => t.type === 'expense');
  const weekdayTotals = Array.from({ length: 7 }, () => 0);
  let largest: Transaction | null = null;
  for (const t of expenses) {
    weekdayTotals[(parseISODate(t.date).getDay() + 6) % 7]! += t.amount;
    if (!largest || t.amount > largest.amount) largest = t;
  }
  const dates = ts.map((t) => t.date).sort();
  const start = from ?? dates[0];
  // Don't average over days that haven't happened yet.
  const end = to && to < today() ? to : today();
  const span = start && start <= end ? daysBetween(start, end) : 1;
  const total = expenses.reduce((s, t) => s + t.amount, 0);
  const maxIdx = weekdayTotals.reduce((best, v, i, arr) => (v > arr[best]! ? i : best), 0);
  return {
    avgDailyExpense: total / Math.max(1, span),
    largestExpense: largest,
    busiestWeekday: total > 0 ? { index: maxIdx, amount: weekdayTotals[maxIdx]! } : null,
    weekdayTotals,
    activeDays: new Set(ts.map((t) => t.date)).size,
  };
}

export const WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
export const WEEKDAYS_LONG = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье'];
