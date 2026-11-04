import type { ISODate } from '@/domain/types';
import {
  addMonths,
  endOfMonth,
  formatDay,
  formatMonth,
  isValidISODate,
  parseISODate,
  startOfMonth,
  startOfWeek,
  toISODate,
  addDays,
  daysBetween,
} from './date';

export const PERIOD_PRESETS = ['week', 'month', 'year', 'all', 'custom'] as const;
export type PeriodPreset = (typeof PERIOD_PRESETS)[number];

export interface PeriodSpec {
  preset: PeriodPreset;
  /** Shift relative to the current period: -1 = previous month/week/year. */
  offset: number;
  from?: ISODate;
  to?: ISODate;
}

export interface ResolvedPeriod {
  preset: PeriodPreset;
  offset: number;
  /** `null` boundaries mean "unbounded" (all time). */
  from: ISODate | null;
  to: ISODate | null;
  label: string;
  /** Whether prev/next navigation makes sense for this preset. */
  navigable: boolean;
}

export const DEFAULT_PERIOD: PeriodSpec = { preset: 'month', offset: 0 };

export function resolvePeriod(spec: PeriodSpec, now: Date = new Date()): ResolvedPeriod {
  const { preset, offset } = spec;
  switch (preset) {
    case 'week': {
      const start = startOfWeek(now);
      start.setDate(start.getDate() + offset * 7);
      const from = toISODate(start);
      const to = addDays(from, 6);
      return {
        preset,
        offset,
        from,
        to,
        label: offset === 0 ? 'Эта неделя' : `${formatDay(from)} — ${formatDay(to)}`,
        navigable: true,
      };
    }
    case 'month': {
      const base = addMonths(startOfMonth(now), offset);
      return {
        preset,
        offset,
        from: toISODate(startOfMonth(base)),
        to: toISODate(endOfMonth(base)),
        label: formatMonth(base, base.getFullYear() !== now.getFullYear() || offset !== 0),
        navigable: true,
      };
    }
    case 'year': {
      const y = now.getFullYear() + offset;
      return { preset, offset, from: `${y}-01-01`, to: `${y}-12-31`, label: String(y), navigable: true };
    }
    case 'custom': {
      const from = spec.from && isValidISODate(spec.from) ? spec.from : null;
      const to = spec.to && isValidISODate(spec.to) ? spec.to : null;
      const [a, b] = from && to && from > to ? [to, from] : [from, to];
      return {
        preset,
        offset: 0,
        from: a,
        to: b,
        label: a && b ? `${formatDay(a, fmtFull)} — ${formatDay(b, fmtFull)}` : 'Свой период',
        navigable: false,
      };
    }
    case 'all':
    default:
      return { preset: 'all', offset: 0, from: null, to: null, label: 'Всё время', navigable: false };
  }
}

const fmtFull: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: '2-digit' };

/** The period of equal length immediately preceding `p` (for "vs previous" deltas). */
export function previousPeriod(p: ResolvedPeriod): { from: ISODate; to: ISODate } | null {
  if (!p.from || !p.to) return null;
  if (p.preset === 'month') {
    const prev = addMonths(parseISODate(p.from), -1);
    return { from: toISODate(startOfMonth(prev)), to: toISODate(endOfMonth(prev)) };
  }
  const len = daysBetween(p.from, p.to);
  return { from: addDays(p.from, -len), to: addDays(p.from, -1) };
}

export function inPeriod(date: ISODate, from: ISODate | null, to: ISODate | null): boolean {
  return (!from || date >= from) && (!to || date <= to);
}

// ---- URL (de)serialisation -------------------------------------------------

export function periodFromSearch(params: URLSearchParams): PeriodSpec {
  const raw = params.get('p');
  const preset = (PERIOD_PRESETS as readonly string[]).includes(raw ?? '') ? (raw as PeriodPreset) : DEFAULT_PERIOD.preset;
  const offset = Number.parseInt(params.get('o') ?? '0', 10);
  return {
    preset,
    offset: Number.isFinite(offset) ? offset : 0,
    from: params.get('from') ?? undefined,
    to: params.get('to') ?? undefined,
  };
}

export function periodToSearch(spec: PeriodSpec, base: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(base);
  for (const k of ['p', 'o', 'from', 'to']) next.delete(k);
  if (spec.preset !== DEFAULT_PERIOD.preset) next.set('p', spec.preset);
  if (spec.offset && spec.preset !== 'all' && spec.preset !== 'custom') next.set('o', String(spec.offset));
  if (spec.preset === 'custom') {
    if (spec.from) next.set('from', spec.from);
    if (spec.to) next.set('to', spec.to);
  }
  return next;
}
