import { useMemo } from 'react';
import type { Category, Transaction } from '@/domain/types';
import { budgetStatuses, delta, monthPace } from '@/lib/finance';
import { formatPercent } from '@/lib/money';
import { cn } from '@/lib/cn';
import { usePreferences } from '@/features/settings/PreferencesProvider';
import { Amount } from '@/ui/Amount';
import { PaceChart } from '@/ui/charts/PaceChart';
import styles from './MonthPaceView.module.css';

interface Props {
  transactions: readonly Transaction[];
  categories: readonly Category[];
  /** Any date inside the month to show. */
  month: Date;
  height?: number;
}

/** "Are we spending faster than last month?" — headline numbers + the pace chart. */
export function MonthPaceView({ transactions, categories, month, height }: Props) {
  const { money } = usePreferences();
  const first = useMemo(() => new Date(month.getFullYear(), month.getMonth(), 1), [month]);
  const pace = useMemo(() => monthPace(transactions, first), [transactions, first]);
  // Budgets only cover some categories, so compare them with spending in those categories only.
  const budget = useMemo(() => {
    const st = budgetStatuses(transactions, categories, first);
    return st.length ? { limit: st.reduce((s, b) => s + b.budget, 0), spent: st.reduce((s, b) => s + b.spent, 0) } : null;
  }, [transactions, categories, first]);

  const vsPrev = pace.elapsed ? delta(pace.spent, pace.previousToDate) : null;
  const finished = pace.elapsed === pace.days;
  const daysLeft = pace.days - pace.elapsed;
  // Today still counts as a day you can spend on.
  const dailyLeft = budget && pace.elapsed > 0 && !finished ? Math.floor(Math.max(0, budget.limit - budget.spent) / (daysLeft + 1)) : null;

  return (
    <div className={styles.root}>
      <dl className={styles.facts}>
        <div>
          <dt className="label">Потрачено</dt>
          <dd>
            <Amount value={pace.spent} size="sm" />
          </dd>
        </div>
        {pace.forecast !== null && (
          <div>
            <dt className="label">Прогноз на месяц</dt>
            <dd>
              <Amount value={pace.forecast} size="sm" tone={pace.previousTotal && pace.forecast > pace.previousTotal ? 'accent' : 'default'} />
            </dd>
          </div>
        )}
        <div>
          <dt className="label">{finished ? 'К прошлому месяцу' : 'К прошлому месяцу на этот день'}</dt>
          <dd className={cn(styles.chip, vsPrev !== null && vsPrev > 0 && styles.bad)}>
            {vsPrev === null ? '—' : `${vsPrev > 0 ? '+' : vsPrev < 0 ? '−' : '±'}${formatPercent(Math.abs(vsPrev))}`}
            <span className={styles.chipNote}>{vsPrev === null ? '' : vsPrev > 0 ? 'тратите быстрее' : vsPrev < 0 ? 'тратите медленнее' : 'так же'}</span>
          </dd>
        </div>
        {dailyLeft !== null && (
          <div>
            <dt className="label">По бюджетам · в день</dt>
            <dd className={cn('mono', styles.daily, dailyLeft === 0 && 'accent')}>{money(dailyLeft)}</dd>
          </div>
        )}
      </dl>
      <PaceChart pace={pace} month={first} height={height} />
    </div>
  );
}
