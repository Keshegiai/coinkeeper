import { useState } from 'react';
import type { CategorySlice } from '@/lib/finance';
import { formatPercent } from '@/lib/money';
import { cn } from '@/lib/cn';
import { usePreferences } from '@/features/settings/PreferencesProvider';
import { CategoryIcon } from '@/features/categories/icons';
import { Amount } from '@/ui/Amount';
import { EmptyState } from '@/ui/EmptyState';
import { DotDonut } from '@/ui/charts/DotDonut';
import styles from './CategoryBreakdown.module.css';

const FALLBACK = '#8A8A8A';

interface Props {
  slices: CategorySlice[];
  /** Show at most this many legend rows; the rest fold into "Остальное". */
  limit?: number;
  onSelect?: (categoryId: string) => void;
  totalLabel?: string;
  layout?: 'side' | 'stack';
}

/** Dot donut + interactive legend: hovering either side highlights the other. */
export function CategoryBreakdown({ slices, limit, onSelect, totalLabel = 'Всего', layout = 'side' }: Props) {
  const { money } = usePreferences();
  const [hl, setHl] = useState<string | null>(null);
  if (!slices.length) return <EmptyState title="Нет данных" />;

  const total = slices.reduce((s, x) => s + x.amount, 0);
  const shown = limit && slices.length > limit ? slices.slice(0, limit - 1) : slices;
  const rest = limit && slices.length > limit ? slices.slice(limit - 1) : [];
  const restAmount = rest.reduce((s, x) => s + x.amount, 0);
  const name = (s: CategorySlice) => s.category?.name ?? 'Без категории';
  const active = slices.find((s) => s.categoryId === hl);

  return (
    <div className={cn(styles.root, styles[layout])}>
      <DotDonut
        slices={slices.map((s) => ({ id: s.categoryId, value: s.amount, color: s.category?.color ?? FALLBACK }))}
        highlight={hl}
        onHighlight={setHl}
        onSelect={onSelect}
        label={slices.map((s) => `${name(s)} ${formatPercent(s.share)}`).join(', ')}
        center={() =>
          active ? (
            <>
              <span className={cn('label', styles.centerLabel)}>{name(active)}</span>
              <span className={cn('dot-num', styles.centerPct)}>{formatPercent(active.share)}</span>
              <span className={cn('mono', styles.centerSub)}>{money(active.amount)}</span>
            </>
          ) : (
            <>
              <span className={cn('label', styles.centerLabel)}>{totalLabel}</span>
              <Amount value={total} size="sm" />
              <span className={cn('mono', styles.centerSub)}>{slices.length} кат.</span>
            </>
          )
        }
      />
      <ul className={styles.legend} onMouseLeave={() => setHl(null)}>
        {shown.map((s) => {
          const Row = onSelect ? 'button' : 'div';
          return (
            <li key={s.categoryId}>
              <Row
                type={onSelect ? 'button' : undefined}
                className={cn(styles.row, hl && hl !== s.categoryId && styles.dim, onSelect && styles.clickable)}
                onMouseEnter={() => setHl(s.categoryId)}
                onFocus={() => setHl(s.categoryId)}
                onBlur={() => setHl(null)}
                onClick={onSelect ? () => onSelect(s.categoryId) : undefined}
              >
                <span className={styles.swatch} style={{ background: s.category?.color ?? FALLBACK }} />
                <CategoryIcon icon={s.category?.icon ?? 'shapes'} size={15} />
                <span className={styles.name}>{name(s)}</span>
                <span className={cn('mono', styles.pct)}>{formatPercent(s.share)}</span>
                <span className={cn('mono', styles.amt)}>{money(s.amount)}</span>
              </Row>
            </li>
          );
        })}
        {rest.length > 0 && (
          <li>
            <div className={cn(styles.row, hl && styles.dim)}>
              <span className={styles.swatch} />
              <span />
              <span className={styles.name}>Остальное · {rest.length}</span>
              <span className={cn('mono', styles.pct)}>{formatPercent(total ? restAmount / total : 0)}</span>
              <span className={cn('mono', styles.amt)}>{money(restAmount)}</span>
            </div>
          </li>
        )}
      </ul>
    </div>
  );
}
