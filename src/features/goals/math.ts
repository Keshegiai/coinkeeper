import type { Goal, ISODate } from '@/domain/types';
import { parseISODate, today } from '@/lib/date';
import { round2 } from '@/lib/money';

export interface GoalPlan {
  progress: number;
  remaining: number;
  done: boolean;
  overdue: boolean;
  /** Whole months left until the deadline (at least 1 while it's in the future). */
  monthsLeft: number | null;
  /** How much to put aside each month to make the deadline. */
  perMonth: number | null;
}

export function planGoal(g: Pick<Goal, 'target' | 'saved' | 'deadline'>, now: ISODate = today()): GoalPlan {
  const remaining = round2(Math.max(0, g.target - g.saved));
  const done = g.target > 0 && g.saved >= g.target;
  const progress = g.target > 0 ? Math.min(1, Math.max(0, g.saved / g.target)) : 0;
  if (!g.deadline) return { progress, remaining, done, overdue: false, monthsLeft: null, perMonth: null };
  const overdue = !done && g.deadline < now;
  const a = parseISODate(now);
  const b = parseISODate(g.deadline);
  let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() > a.getDate()) months += 1;
  const monthsLeft = overdue ? 0 : Math.max(1, months);
  return { progress, remaining, done, overdue, monthsLeft, perMonth: done || overdue ? null : round2(remaining / monthsLeft) };
}

export function pluralMonths(n: number) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return `${n} месяц`;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return `${n} месяца`;
  return `${n} месяцев`;
}
