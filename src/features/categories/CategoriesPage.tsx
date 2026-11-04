import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { Category } from '@/domain/types';
import { useFinanceData } from '@/features/useFinanceData';
import { usePreferences } from '@/features/settings/PreferencesProvider';
import { addMonths, startOfMonth, toISODate, formatMonth } from '@/lib/date';
import { formatPercent } from '@/lib/money';
import { cn } from '@/lib/cn';
import { Button } from '@/ui/Button';
import { DataState } from '@/ui/DataState';
import { Dialog } from '@/ui/Dialog';
import { EmptyState } from '@/ui/EmptyState';
import { PageHeader } from '@/ui/PageHeader';
import { SegmentMeter } from '@/ui/charts/SegmentMeter';
import { CategoryForm } from './CategoryForm';
import { CategoryIcon } from './icons';
import styles from './CategoriesPage.module.css';

type Editing = { mode: 'new' } | { mode: 'edit'; category: Category } | null;

export function CategoriesPage() {
  const data = useFinanceData();
  const [editing, setEditing] = useState<Editing>(null);
  return (
    <>
      <PageHeader
        index="04"
        subtitle="Структура и лимиты"
        title="Категории"
        actions={
          <Button variant="accent" icon={<Plus size={14} />} onClick={() => setEditing({ mode: 'new' })}>
            Категория
          </Button>
        }
      />
      <DataState {...data}>
        <Categories {...data} onEdit={(c) => setEditing({ mode: 'edit', category: c })} onNew={() => setEditing({ mode: 'new' })} editing={editing} close={() => setEditing(null)} />
      </DataState>
    </>
  );
}

function Categories({
  transactions,
  categories,
  onEdit,
  onNew,
  editing,
  close,
}: ReturnType<typeof useFinanceData> & { onEdit: (c: Category) => void; onNew: () => void; editing: Editing; close: () => void }) {
  const { money } = usePreferences();

  const stats = useMemo(() => {
    const from = toISODate(startOfMonth(new Date()));
    const to = toISODate(new Date(addMonths(startOfMonth(new Date()), 1).getTime() - 86_400_000));
    const map = new Map<string, { count: number; month: number }>();
    for (const t of transactions) {
      const s = map.get(t.categoryId) ?? { count: 0, month: 0 };
      s.count += 1;
      if (t.type === 'expense' && t.date >= from && t.date <= to) s.month += t.amount;
      map.set(t.categoryId, s);
    }
    return map;
  }, [transactions]);

  const editingUsage = editing?.mode === 'edit' ? (stats.get(editing.category.id)?.count ?? 0) : 0;

  return (
    <>
      {categories.length ? (
        <ul className={styles.grid}>
          {categories.map((c, i) => {
            const s = stats.get(c.id) ?? { count: 0, month: 0 };
            const ratio = c.budget ? s.month / c.budget : 0;
            return (
              <li key={c.id}>
                <button className={styles.card} onClick={() => onEdit(c)} aria-label={`Изменить категорию ${c.name}`}>
                  <div className={styles.cardTop}>
                    <span className={styles.icon} style={{ ['--cat' as string]: c.color }}>
                      <CategoryIcon icon={c.icon} size={20} />
                    </span>
                    <span className={cn('label', styles.code)}>{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <div className={styles.cardBody}>
                    <span className={styles.name}>{c.name}</span>
                    <span className={cn('label', styles.meta)}>
                      {s.count} опер. · {formatMonth(new Date(), false)} {money(s.month)}
                    </span>
                  </div>
                  {c.budget ? (
                    <div className={styles.budget}>
                      <SegmentMeter ratio={ratio} segments={16} label={`Бюджет ${c.name}: ${formatPercent(ratio)}`} />
                      <span className={cn('label', styles.budgetLabel, ratio > 1 && 'accent')}>
                        {formatPercent(ratio)} из {money(c.budget)}
                      </span>
                    </div>
                  ) : (
                    <span className={cn('label', styles.noBudget)}>Без лимита</span>
                  )}
                </button>
              </li>
            );
          })}
          <li>
            <button className={cn(styles.card, styles.addCard)} onClick={onNew}>
              <Plus size={22} strokeWidth={1.5} />
              <span className="label">Новая категория</span>
            </button>
          </li>
        </ul>
      ) : (
        <EmptyState
          title="Категорий пока нет"
          text="Создайте категории, чтобы группировать операции и задавать бюджеты."
          action={
            <Button variant="accent" icon={<Plus size={14} />} onClick={onNew}>
              Создать категорию
            </Button>
          }
        />
      )}
      <p className={cn('label', styles.footnote)}>
        Подсказка: бюджеты отображаются на <Link to="/">обзоре</Link> и сбрасываются каждый месяц.
      </p>

      <Dialog open={!!editing} onClose={close} index={editing?.mode === 'edit' ? 'ED' : 'NEW'} title={editing?.mode === 'edit' ? 'Категория' : 'Новая категория'}>
        {editing && <CategoryForm key={editing.mode === 'edit' ? editing.category.id : 'new'} initial={editing.mode === 'edit' ? editing.category : undefined} usage={editingUsage} onDone={close} />}
      </Dialog>
    </>
  );
}
