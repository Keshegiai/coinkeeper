import type { ISODate } from '@/domain/types';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Format a Date as YYYY-MM-DD in the *local* timezone.
 * (`toISOString()` uses UTC and shifts the day for anyone east/west of Greenwich —
 * that was a real off-by-one bug in the previous version.)
 */
export function toISODate(d: Date): ISODate {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Parse YYYY-MM-DD as a local-midnight Date. */
export function parseISODate(s: ISODate): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export const today = (): ISODate => toISODate(new Date());

export function addDays(s: ISODate, days: number): ISODate {
  const d = parseISODate(s);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function addMonths(d: Date, months: number): Date {
  const r = new Date(d.getFullYear(), d.getMonth() + months, 1);
  const last = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate();
  r.setDate(Math.min(d.getDate(), last));
  return r;
}

export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
export const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

/** Monday-based week start. */
export function startOfWeek(d: Date): Date {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = (r.getDay() + 6) % 7;
  r.setDate(r.getDate() - dow);
  return r;
}

/** Inclusive number of days between two ISO dates. */
export function daysBetween(from: ISODate, to: ISODate): number {
  const ms = parseISODate(to).getTime() - parseISODate(from).getTime();
  return Math.round(ms / 86_400_000) + 1;
}

export const isValidISODate = (s: string): s is ISODate =>
  /^\d{4}-\d{2}-\d{2}$/.test(s) && toISODate(parseISODate(s)) === s;

const LOCALE = 'ru-RU';

export function formatDay(s: ISODate, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) {
  return parseISODate(s).toLocaleDateString(LOCALE, opts).replace('.', '');
}

export function formatMonth(d: Date, withYear = true) {
  const m = d.toLocaleDateString(LOCALE, { month: 'long' });
  return withYear ? `${m} ${d.getFullYear()}` : m;
}

/** Human label for a day header: "Сегодня", "Вчера", or "4 ноября, вт". */
export function relativeDayLabel(s: ISODate, now: ISODate = today()): string {
  if (s === now) return 'Сегодня';
  if (s === addDays(now, -1)) return 'Вчера';
  const d = parseISODate(s);
  const sameYear = d.getFullYear() === parseISODate(now).getFullYear();
  return d.toLocaleDateString(LOCALE, {
    day: 'numeric',
    month: 'long',
    weekday: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}
