import { memo } from 'react';
import type { Category, Transaction } from '@/domain/types';
import { groupByDay } from '@/lib/finance';
import { relativeDayLabel } from '@/lib/date';
import { cn } from '@/lib/cn';
import { usePreferences } from '@/features/settings/PreferencesProvider';
import { CategoryIcon } from '@/features/categories/icons';
import { useTransactionEditor } from './TransactionEditor';
import styles from './TransactionList.module.css';

interface Props {
  transactions: readonly Transaction[];
  categories: ReadonlyMap<string, Category>;
  grouped?: boolean;
}

export function TransactionList({ transactions, categories, grouped = true }: Props) {
  const { money } = usePreferences();
  if (!grouped) {
    return (
      <ul className={styles.list}>
        {transactions.map((t) => (
          <Row key={t.id} t={t} category={categories.get(t.categoryId)} showDate />
        ))}
      </ul>
    );
  }
  return (
    <div className={styles.groups}>
      {groupByDay(transactions).map((g) => {
        const net = g.items.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0);
        return (
          <section key={g.date} className={styles.group} aria-label={relativeDayLabel(g.date)}>
            <header className={styles.dayHeader}>
              <span className="label">{relativeDayLabel(g.date)}</span>
              <span className={cn('label', styles.dayNet)}>{money(net, { signed: true })}</span>
            </header>
            <ul className={styles.list}>
              {g.items.map((t) => (
                <Row key={t.id} t={t} category={categories.get(t.categoryId)} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

const Row = memo(function Row({ t, category, showDate }: { t: Transaction; category: Category | undefined; showDate?: boolean }) {
  const { money } = usePreferences();
  const { openEdit } = useTransactionEditor();
  const pending = t.id.startsWith('tmp-');
  return (
    <li>
      <button className={cn(styles.row, pending && styles.pending)} onClick={() => !pending && openEdit(t)} aria-label={`Изменить: ${category?.name ?? 'Без категории'}, ${money(t.amount)}`}>
        <span className={styles.icon} style={{ ['--cat' as string]: category?.color ?? 'var(--fg-3)' }}>
          <CategoryIcon icon={category?.icon ?? 'shapes'} size={17} />
        </span>
        <span className={styles.text}>
          <span className={styles.name}>{category?.name ?? 'Без категории'}</span>
          <span className={styles.meta}>
            {showDate && <span>{relativeDayLabel(t.date)}</span>}
            {showDate && t.comment && <span aria-hidden>·</span>}
            {t.comment && <span className={styles.comment}>{t.comment}</span>}
          </span>
        </span>
        <span className={cn(styles.amount, t.type === 'income' ? styles.income : styles.expense)}>
          {money(t.type === 'income' ? t.amount : -t.amount, { signed: true })}
        </span>
      </button>
    </li>
  );
});
