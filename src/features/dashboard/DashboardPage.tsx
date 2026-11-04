import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import { useUser } from '@/features/auth/AuthProvider';
import { useFinanceData } from '@/features/useFinanceData';
import { usePeriod } from '@/features/transactions/usePeriod';
import { PeriodPicker } from '@/features/transactions/PeriodPicker';
import { TransactionList } from '@/features/transactions/TransactionList';
import { useTransactionEditor } from '@/features/transactions/TransactionEditor';
import { transactionsHref } from '@/features/transactions/links';
import { CategoryIcon } from '@/features/categories/icons';
import { CategoryBreakdown } from '@/features/analytics/CategoryBreakdown';
import { MonthPaceView } from '@/features/analytics/MonthPaceView';
import { GoalsPreview } from '@/features/goals/GoalsPreview';
import { usePreferences } from '@/features/settings/PreferencesProvider';
import { balanceSeries, breakdownByCategory, budgetStatuses, cashFlowSeries, delta, filterByPeriod, totals } from '@/lib/finance';
import { previousPeriod } from '@/lib/period';
import { addDays, formatMonth, formatDay, today } from '@/lib/date';
import { formatPercent } from '@/lib/money';
import { cn } from '@/lib/cn';
import { Amount } from '@/ui/Amount';
import { Button, buttonClass } from '@/ui/Button';
import { DataState } from '@/ui/DataState';
import { EmptyState } from '@/ui/EmptyState';
import { PageHeader } from '@/ui/PageHeader';
import { Panel } from '@/ui/Panel';
import { Segmented } from '@/ui/Segmented';
import { Stat } from '@/ui/Stat';
import { BalanceChart } from '@/ui/charts/BalanceChart';
import { DotFlowChart } from '@/ui/charts/DotFlowChart';
import { SegmentMeter } from '@/ui/charts/SegmentMeter';
import { Sparkline } from '@/ui/charts/Sparkline';
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

type FlowMode = 'flow' | 'balance';

function Dashboard({ transactions, categories, categoryMap }: ReturnType<typeof useFinanceData>) {
  const { period } = usePeriod();
  const { money } = usePreferences();
  const { openNew } = useTransactionEditor();
  const { search } = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<FlowMode>('flow');

  const m = useMemo(() => {
    const inPeriod = filterByPeriod(transactions, period.from, period.to);
    const prev = previousPeriod(period);
    const prevTotals = prev ? totals(filterByPeriod(transactions, prev.from, prev.to)) : null;
    const cur = totals(inPeriod);
    const all = totals(transactions);
    const series = cashFlowSeries(inPeriod, period.from, period.to);
    const last30 = balanceSeries(transactions, addDays(today(), -29), today());
    const monthAgo = last30.points[0] ? last30.points[0].balance - last30.points[0].net : 0;
    return {
      cur,
      all,
      deltaIncome: prevTotals ? delta(cur.income, prevTotals.income) : null,
      deltaExpense: prevTotals ? delta(cur.expense, prevTotals.expense) : null,
      savingsRate: cur.income > 0 ? cur.net / cur.income : null,
      series,
      balance: balanceSeries(transactions, period.from, period.to),
      last30,
      change30: all.net - monthAgo,
      breakdown: breakdownByCategory(inPeriod, 'expense', categoryMap),
      recent: inPeriod.slice(0, 8),
      budgets: budgetStatuses(transactions, categories),
      firstDate: transactions.at(-1)?.date,
    };
  }, [transactions, categories, categoryMap, period]);

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

  const linkAction = (to: string, label: string) => (
    <Link to={to} className={buttonClass({ variant: 'ghost', size: 'sm' })}>
      {label} <ArrowRight size={14} />
    </Link>
  );

  return (
    <div className={cn(styles.grid, 'stagger')}>
      <Panel className={cn('inverse', styles.hero)} index="01" title="Баланс" action={<span className={cn('label', styles.live)}>● Live</span>}>
        <div className={styles.heroBody}>
          <Amount value={m.all.net} size="xl" />
          <p className={styles.heroMeta}>
            <span className={cn(m.change30 < 0 && 'accent')}>{money(m.change30, { signed: true })} за 30 дней</span>
            <span>{m.all.count} операций</span>
            {m.firstDate && (
              <span>
                с{' '}
                {formatDay(m.firstDate, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            )}
          </p>
        </div>
        <div className={styles.heroChart}>
          <BalanceChart points={m.last30.points} granularity="day" rows={6} compact label="Баланс за 30 дней" />
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
        <Stat
          label="Доходы"
          value={<Amount value={m.cur.income} />}
          delta={m.deltaIncome}
          goodWhen="up"
          chart={<Sparkline values={m.series.buckets.map((b) => b.income)} />}
        />
        <Stat
          label="Расходы"
          value={<Amount value={m.cur.expense} />}
          delta={m.deltaExpense}
          goodWhen="down"
          chart={<Sparkline values={m.series.buckets.map((b) => b.expense)} tone="accent" />}
        />
        <Stat
          label="Итог"
          value={<Amount value={m.cur.net} signed tone="auto" />}
          footnote={m.savingsRate !== null ? `Сбережено ${formatPercent(Math.max(0, m.savingsRate))}` : undefined}
        />
      </Panel>

      <Panel
        className={styles.flow}
        index="03"
        title={mode === 'flow' ? 'Денежный поток' : 'Динамика баланса'}
        action={
          <>
            <Segmented<FlowMode>
              label="Вид графика"
              size="sm"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'flow', label: 'Поток' },
                { value: 'balance', label: 'Баланс' },
              ]}
            />
            <span className={styles.hideSm}>{linkAction(`/analytics${search}`, 'Аналитика')}</span>
          </>
        }
      >
        {mode === 'flow' ? (
          m.series.buckets.length ? (
            <DotFlowChart
              key={period.label}
              buckets={m.series.buckets}
              granularity={m.series.granularity}
              onSelect={(b) => navigate(transactionsHref({ from: b.start, to: b.end }))}
            />
          ) : (
            <EmptyState title="Нет данных за период" />
          )
        ) : m.balance.points.length ? (
          <BalanceChart key={period.label} points={m.balance.points} granularity={m.balance.granularity} />
        ) : (
          <EmptyState title="Период ещё не начался" />
        )}
      </Panel>

      <Panel className={styles.pace} index="04" title={`Темп · ${formatMonth(new Date(), false)}`} action={linkAction('/analytics', 'Подробнее')}>
        <MonthPaceView transactions={transactions} categories={categories} month={new Date()} height={190} />
      </Panel>

      <Panel className={styles.structure} index="05" title="Куда ушли деньги">
        <CategoryBreakdown
          slices={m.breakdown}
          limit={5}
          layout="stack"
          totalLabel="Расходы"
          onSelect={(id) => navigate(transactionsHref({ cat: id, type: 'expense', search }))}
        />
      </Panel>

      <Panel className={styles.recent} index="06" title="Последние операции" flush action={linkAction(`/transactions${search}`, 'Все')}>
        <div className={styles.recentBody}>
          {m.recent.length ? (
            <TransactionList transactions={m.recent} categories={categoryMap} grouped={false} />
          ) : (
            <EmptyState title="Нет операций за период" />
          )}
        </div>
      </Panel>

      <div className={styles.side}>
        <Panel index="07" title={`Бюджеты · ${formatMonth(new Date(), false)}`}>
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

        <GoalsPreview index="08" />
      </div>
    </div>
  );
}
