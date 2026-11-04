import type { ISODate, TransactionType } from '@/domain/types';

/** A link to the transactions screen pre-filtered to a date range / category / type. */
export function transactionsHref({
  from,
  to,
  cat,
  type,
  search,
}: {
  from?: ISODate | null;
  to?: ISODate | null;
  cat?: string;
  type?: TransactionType;
  /** Keep the current period params when no explicit range is given. */
  search?: string;
}) {
  const p = new URLSearchParams(from || to ? '' : search ?? '');
  if (from || to) {
    p.set('p', 'custom');
    if (from) p.set('from', from);
    if (to) p.set('to', to);
  }
  if (cat) p.set('cat', cat);
  if (type) p.set('type', type);
  const qs = p.toString();
  return `/transactions${qs ? `?${qs}` : ''}`;
}
