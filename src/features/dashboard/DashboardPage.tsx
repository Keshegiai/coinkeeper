import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import { useUser } from '@/features/auth/AuthProvider';
import { useFinanceData } from '@/features/useFinanceData';
import { usePeriod } from '@/features/transactions/usePeriod';
import { PeriodPicker } from '@/features/transactions/PeriodPicker';
import { TransactionList } from '@/features/transactions/TransactionList';
import { useTransactionEditor } from '@/features/transactions/TransactionEditor';
import { CategoryIcon } from '@/features/categories/icons';
import { usePreferences } from '@/features/settings/PreferencesProvider';
import { budgetStatuses, cashFlowSeries, delta, filterByPeriod, totals } from '@/lib/finance';
import { previousPeriod } from '@/lib/period';
import { formatMonth, formatDay } from '@/lib/date';
import { formatPercent } from '@/lib/money';
import { cn } from '@/lib/cn';
import { Amount } from '@/ui/Amount';
import { Button, buttonClass } from '@/ui/Button';
import { DataState } from '@/ui/DataState';
import { EmptyState } from '@/ui/EmptyState';
import { PageHeader } from '@/ui/PageHeader';
import { Panel } from '@/ui/Panel';
import { Stat } from '@/ui/Stat';
import { DotFlowChart } from '@/ui/charts/DotFlowChart';
import { SegmentMeter } from '@/ui/charts/SegmentMeter';
import styles from './DashboardPage.module.css';

function greeting(h = new Date().getHours()) {
  if (h < 5) return 'Доброй ночи';
  if (h < 12) return 'Доброе утро';
  if (h < 18) return 'Добрый день';
  return 'Добрый вечер';
}

export function DashboardPage() {
  const user = useUser();
  const data = useFinanceData();
  return (
    <>
      <PageHeader index="01" subtitle={`${greeting()}, ${user.name.split(' ')[0] || 'друг'}`} title="Обзор" actions={<PeriodPicker />} />
      <DataState {...data}>
        <Dashboard {...data} />
      </DataState>
    </>
  );
}

function Dashboard({ transactions, categories, categoryMap }: ReturnType<typeof useFinanceData>) {
  const { period } = usePeriod();
  const { money } = usePreferences();
  const { openNew } = useTransactionEditor();
  const { search } = useLocation();

  const m = useMemo(() => {
    const inPeriod = filterByPeriod(transactions, period.from, period.to);
    const prev = previousPeriod(period);
    const prevTotals = prev ? totals(filterByPeriod(transactions, prev.from, prev.to)) : null;
    const cur = totals(inPeriod);
    const all = totals(transactions);
    return {
      cur,
      all,
      deltaIncome: prevTotals ? delta(cur.income, prevTotals.income) : null,
      deltaExpense: prevTotals ? delta(cur.expense, prevTotals.expense) : null,
      savingsRate: cur.income > 0 ? cur.net / cur.income : null,
      series: cashFlowSeries(inPeriod, period.from, period.to),
      recent: inPeriod.slice(0, 6),
      budgets: budgetStatuses(transactions, categories),
      firstDate: transactions.at(-1)?.date,
    };
  }, [transactions, categories, period]);

  if (!transactions.length) {
    return (
      <Panel>
        <EmptyState
          title="Пока пусто"
          text="Добавьте первую операцию — доход или расход. Горячая клавиша: N."
          action={
            <Button variant="accent" icon={<Plus size={14} />} onClick={() => openNew()}>
              Первая операция
            </Button>
          }
        />
      </Panel>
    );
  }

  return (
    <div className={styles.grid}>
      <Panel className={cn('inverse', styles.hero)} index="01" title="Баланс">
        <div className={styles.heroBody}>
          <Amount value={m.all.net} size="xl" />
          <p className={styles.heroMeta}>
            <span>{m.all.count} операций</span>
            {m.firstDate && <span>с {formatDay(m.firstDate, { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
          </p>
        </div>
        <div className={styles.heroActions}>
          <Button variant="accent" icon={<Plus size={14} />} onClick={() => openNew({ type: 'expense' })}>
            Расход
          </Button>
          <Button variant="outline" icon={<Plus size={14} />} onClick={() => openNew({ type: 'income' })}>
            Доход
          </Button>
        </div>
      </Panel>

      <Panel className={styles.stats} index="02" title={period.label}>
        <Stat label="Доходы" value={<Amount value={m.cur.income} />} delta={m.deltaIncome} goodWhen="up" />
        <Stat label="Расходы" value={<Amount value={m.cur.expense} />} delta={m.deltaExpense} goodWhen="down" />
        <Stat
          label="Итог"
          value={<Amount value={m.cur.net} signed tone="auto" />}
          footnote={m.savingsRate !== null ? `Сбережено ${formatPercent(Math.max(0, m.savingsRate))}` : undefined}
        />
      </Panel>

      <Panel className={styles.flow} index="03" title="Денежный поток" action={<Link to={{ pathname: '/analytics', search }} className={buttonClass({ variant: 'ghost', size: 'sm' })}>Аналитика <ArrowRight size={14} /></Link>}>
        {m.series.buckets.length ? (
          <DotFlowChart buckets={m.series.buckets} granularity={m.series.granularity} />
        ) : (
          <EmptyState title="Нет данных за период" />
        )}
      </Panel>

      <Panel className={styles.recent} index="04" title="Последние операции" flush action={<Link to={{ pathname: '/transactions', search }} className={buttonClass({ variant: 'ghost', size: 'sm' })}>Все <ArrowRight size={14} /></Link>}>
        <div className={styles.recentBody}>
          {m.recent.length ? <TransactionList transactions={m.recent} categories={categoryMap} grouped={false} /> : <EmptyState title="Нет операций за период" />}
        </div>
      </Panel>

      <Panel className={styles.budgets} index="05" title={`Бюджеты · ${formatMonth(new Date(), false)}`}>
        {m.budgets.length ? (
          <ul className={styles.budgetList}>
            {m.budgets.map((b) => (
              <li key={b.category.id} className={styles.budget}>
                <div className={styles.budgetHead}>
                  <span className={styles.budgetName}>
                    <CategoryIcon icon={b.category.icon} size={15} />
                    {b.category.name}
                  </span>
                  <span className={cn('mono', styles.budgetNums, b.ratio > 1 && 'accent')}>
                    {money(b.spent)} <span className={styles.budgetOf}>/ {money(b.budget)}</span>
                  </span>
                </div>
                <SegmentMeter ratio={b.ratio} label={`${b.category.name}: ${formatPercent(b.ratio)} бюджета`} />
                <span className={cn('label', styles.budgetFoot, b.remaining < 0 && 'accent')}>
                  {b.remaining >= 0 ? `Осталось ${money(b.remaining)}` : `Перерасход ${money(-b.remaining)}`}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Бюджеты не заданы"
            text="Установите месячный лимит для категории — и следите за ним здесь."
            action={
              <Link to="/categories" className={buttonClass({ size: 'sm' })}>
                К категориям
              </Link>
            }
          />
        )}
      </Panel>
    </div>
  );
}
