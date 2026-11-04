import type { Currency } from '@/domain/types';

export const CURRENCY_META: Record<Currency, { symbol: string; label: string }> = {
  KZT: { symbol: '₸', label: 'Тенге' },
  USD: { symbol: '$', label: 'Доллар США' },
  EUR: { symbol: '€', label: 'Евро' },
  RUB: { symbol: '₽', label: 'Рубль' },
};

const formatters = new Map<string, Intl.NumberFormat>();
function nf(fractionDigits: number, compact: boolean) {
  const key = `${fractionDigits}|${compact}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: compact ? 0 : fractionDigits,
      maximumFractionDigits: fractionDigits,
      ...(compact ? { notation: 'compact', compactDisplay: 'short' } : {}),
    });
    formatters.set(key, f);
  }
  return f;
}

/**
 * Format just the number: "128 450,50". Uses a regular space as the group separator
 * (ru-RU emits U+202F, which the dot-matrix display font doesn't ship).
 */
export function formatAmount(value: number, { decimals, compact = false }: { decimals?: number; compact?: boolean } = {}) {
  const digits = decimals ?? (Number.isInteger(round2(value)) ? 0 : 2);
  return nf(digits, compact).format(value).replace(/[\u202F\u00A0]/g, ' ');
}

export function formatMoney(value: number, currency: Currency, opts?: { signed?: boolean; compact?: boolean }) {
  const sign = opts?.signed ? (value > 0 ? '+' : value < 0 ? '−' : '') : value < 0 ? '−' : '';
  return `${sign}${formatAmount(Math.abs(value), { compact: opts?.compact })} ${CURRENCY_META[currency].symbol}`;
}

export const round2 = (n: number) => Math.round(n * 100) / 100;

/** Parse user input like "1 250,5" or "1250.50". Returns NaN for garbage. */
export function parseAmount(input: string): number {
  const normalized = input.replace(/[\s\u00A0\u202F]/g, '').replace(',', '.');
  if (!/^\d+(\.\d{0,2})?$/.test(normalized)) return Number.NaN;
  return Number(normalized);
}

export function formatPercent(ratio: number, digits = 0) {
  if (!Number.isFinite(ratio)) return '—';
  return `${(ratio * 100).toFixed(digits).replace('.', ',')}%`;
}
