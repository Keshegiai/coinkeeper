import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { TransactionType } from '@/domain/types';
import { useFinanceData } from '@/features/useFinanceData';
import { usePeriod } from '@/features/transactions/usePeriod';
import { PeriodPicker } from '@/features/transactions/PeriodPicker';
import { transactionsHref } from '@/features/transactions/links';
import { CategoryIcon } from '@/features/categories/icons';
import { usePreferences } from '@/features/settings/PreferencesProvider';
import { balanceSeries, breakdownByCategory, cashFlowSeries, categoryChanges, dailyTotals, delta, filterByPeriod, totals } from '@/lib/finance';
import { previousPeriod } from '@/lib/period';
import { formatDay, parseISODate } from '@/lib/date';
import { formatPercent } from '@/lib/money';
import { cn } from '@/lib/cn';
import { Amount } from '@/ui/Amount';
import { DataState } from '@/ui/DataState';
import { EmptyState } from '@/ui/EmptyState';
import { PageHeader } from '@/ui/PageHeader';
import { Panel } from '@/ui/Panel';
import { Segmented } from '@/ui/Segmented';
import { Stat } from '@/ui/Stat';
import { BalanceChart } from '@/ui/charts/BalanceChart';
import { CalendarHeatmap } from '@/ui/charts/CalendarHeatmap';
import { DotFlowChart } from '@/ui/charts/DotFlowChart';
import { Sparkline } from '@/ui/charts/Sparkline';
import { CategoryBreakdown } from './CategoryBreakdown';
import { MonthPaceView } from './MonthPaceView';
import { computeInsights, WEEKDAYS_LONG, WEEKDAYS_SHORT } from './insights';
import styles from './AnalyticsPage.module.css';

export function AnalyticsPage() {
  const data = useFinanceData();
  return (
    <>
      <PageHeader index="03" subtitle="Куда уходят деньги" title="Аналитика" actions={<PeriodPicker />} />
      <DataState {...data}>
        <Analytics {...data} />
      </DataState>
    </>
  );
}

type FlowMode = 'flow' | 'balance';

function Analytics({ transactions, categories, categoryMap }: ReturnType<typeof useFinanceData>) {
  const { period } = usePeriod();
  const { money } = usePreferences();
  const { search } = useLocation();
  const navigate = useNavigate();
  const [structure, setStructure] = useState<TransactionType>('expense');
  const [flowMode, setFlowMode] = useState<FlowMode>('flow');

  const m = useMemo(() => {
    const cur = filterByPeriod(transactions, period.from, period.to);
    const prev = previousPeriod(period);
    const prevTx = prev ? filterByPeriod(transactions, prev.from, prev.to) : [];
    const prevTotals = prev ? totals(prevTx) : null;
    const t = totals(cur);
    const series = cashFlowSeries(cur, period.from, period.to);
    return {
      t,
      cur,
      prevTotals,
      series,
      balance: balanceSeries(transactions, period.from, period.to),
      expense: breakdownByCategory(cur, 'expense', categoryMap),
      income: breakdownByCategory(cur, 'income', categoryMap),
      insights: computeInsights(cur, period.from, period.to),
      daily: dailyTotals(transactions, 'expense'),
      changes: prev ? categoryChanges(cur, prevTx, categoryMap).slice(0, 6) : [],
    };
  }, [transactions, period, categoryMap]);

  if (!m.cur.length) {
    return (
      <Panel>
        <EmptyState title="Нет данных за период" text="Выберите другой период или добавьте операции." />
      </Panel>
    );
  }

  const slices = structure === 'expense' ? m.expense : m.income;
  const savings = m.t.income > 0 ? m.t.net / m.t.income : null;
  const maxWeekday = Math.max(1, ...m.insights.weekdayTotals);
  const maxChange = Math.max(1, ...m.changes.map((c) => Math.abs(c.diff)));
  // The pace view compares calendar months: use the period's month when it is one, otherwise today's.
  const paceMonth = period.preset === 'month' && period.from ? parseISODate(period.from) : new Date();

  return (
    <div className={cn(styles.grid, 'stagger')}>
      <Panel className={styles.kpis} aria-label="Ключевые показатели">
        <Stat
          label="Доходы"
          value={<Amount value={m.t.income} />}
          delta={m.prevTotals ? delta(m.t.income, m.prevTotals.income) : null}
          chart={<Sparkline values={m.series.buckets.map((b) => b.income)} />}
        />
        <Stat
          label="Расходы"
          value={<Amount value={m.t.expense} />}
          delta={m.prevTotals ? delta(m.t.expense, m.prevTotals.expense) : null}
          goodWhen="down"
          chart={<Sparkline values={m.series.buckets.map((b) => b.expense)} tone="accent" />}
        />
        <Stat label="Итог" value={<Amount value={m.t.net} signed tone="auto" />} delta={m.prevTotals ? delta(m.t.net, m.prevTotals.net) : null} />
        <Stat
          label="Норма сбережений"
          value={<span className={cn('dot-num', styles.bigPct, savings !== null && savings < 0 && 'accent')}>{savings === null ? '—' : formatPercent(savings)}</span>}
          footnote="Итог / доходы"
        />
      </Panel>

      <Panel
        className={styles.flow}
        index="01"
        title={`${flowMode === 'flow' ? 'Поток' : 'Баланс'} · ${period.label}`}
        action={
          <Segmented<FlowMode>
            label="Вид графика"
            size="sm"
            value={flowMode}
            onChange={setFlowMode}
            options={[
              { value: 'flow', label: 'Поток' },
              { value: 'balance', label: 'Баланс' },
            ]}
          />
        }
      >
        {flowMode === 'flow' ? (
          <DotFlowChart
            key={period.label}
            buckets={m.series.buckets}
            granularity={m.series.granularity}
            rows={9}
            onSelect={(b) => navigate(transactionsHref({ from: b.start, to: b.end }))}
          />
        ) : (
          <BalanceChart key={period.label} points={m.balance.points} granularity={m.balance.granularity} rows={12} />
        )}
      </Panel>

      <Panel
        className={styles.structure}
        index="02"
        title="Структура"
        action={
          <Segmented
            label="Структура"
            size="sm"
            value={structure}
            onChange={setStructure}
            options={[
              { value: 'expense', label: 'Расходы' },
              { value: 'income', label: 'Доходы' },
            ]}
          />
        }
      >
        <CategoryBreakdown
          key={structure}
          slices={slices}
          totalLabel={structure === 'expense' ? 'Расходы' : 'Доходы'}
          onSelect={(id) => navigate(transactionsHref({ cat: id, type: structure, search }))}
        />
      </Panel>

      <Panel className={styles.insights} index="03" title="Наблюдения">
        <dl className={styles.facts}>
          <div>
            <dt className="label">В среднем в день</dt>
            <dd>
              <Amount value={m.insights.avgDailyExpense} size="sm" />
            </dd>
          </div>
          <div>
            <dt className="label">Операций</dt>
            <dd className="dot-num" style={{ fontSize: 22 }}>
              {m.t.count}
              <span className={styles.factNote}> за {m.insights.activeDays} дн.</span>
            </dd>
          </div>
          {m.insights.largestExpense && (
            <div className={styles.factWide}>
              <dt className="label">Крупнейшая трата</dt>
              <dd className={styles.largest}>
                <Amount value={m.insights.largestExpense.amount} size="sm" />
                <span className={styles.factNote}>
                  {categoryMap.get(m.insights.largestExpense.categoryId)?.name ?? 'Без категории'} · {formatDay(m.insights.largestExpense.date)}
                  {m.insights.largestExpense.comment && ` · ${m.insights.largestExpense.comment}`}
                </span>
              </dd>
            </div>
          )}
        </dl>

        <div className={styles.weekdays}>
          <span className="label">
            Расходы по дням недели
            {m.insights.busiestWeekday && <> · пик: {WEEKDAYS_LONG[m.insights.busiestWeekday.index]}</>}
          </span>
          <div className={styles.weekBars}>
            {m.insights.weekdayTotals.map((v, i) => {
              const filled = v > 0 ? Math.max(1, Math.round((v / maxWeekday) * 10)) : 0;
              return (
                <div key={i} className={styles.weekCol} title={`${WEEKDAYS_LONG[i]}: ${money(v)}`}>
                  <div className={styles.weekDots}>
                    {Array.from({ length: 10 }, (_, k) => (
                      <span
                        key={k}
                        style={{ animationDelay: `${i * 40 + k * 25}ms` }}
                        className={cn(k < filled && styles.on, k < filled && i === m.insights.busiestWeekday?.index && styles.peak)}
                      />
                    ))}
                  </div>
                  <span className="label">{WEEKDAYS_SHORT[i]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Panel>

      <Panel className={styles.calendar} index="04" title="Календарь трат">
        <CalendarHeatmap values={m.daily} from={period.from} to={period.to} onSelect={(d) => navigate(transactionsHref({ from: d, to: d }))} />
      </Panel>

      <Panel className={styles.pace} index="05" title={`Темп · ${paceMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}`}>
        <MonthPaceView transactions={transactions} categories={categories} month={paceMonth} />
      </Panel>

      <Panel className={styles.changes} index="06" title="Что изменилось">
        {m.changes.length ? (
          <ul className={styles.changeList}>
            {m.changes.map((c) => {
              const up = c.diff > 0;
              const cells = Math.max(1, Math.round((Math.abs(c.diff) / maxChange) * 12));
              return (
                <li key={c.categoryId}>
                  <button
                    type="button"
                    className={styles.change}
                    onClick={() => navigate(transactionsHref({ cat: c.categoryId, type: 'expense', search }))}
                    title={`${c.category?.name ?? 'Без категории'}: ${money(c.previous)} → ${money(c.current)}`}
                  >
                    <span className={styles.changeName}>
                      <CategoryIcon icon={c.category?.icon ?? 'shapes'} size={14} />
                      {c.category?.name ?? 'Без категории'}
                    </span>
                    <span className={styles.changeBar} aria-hidden>
                      <span className={styles.changeHalf}>
                        {!up && Array.from({ length: cells }, (_, k) => <i key={k} className={styles.down} style={{ animationDelay: `${k * 30}ms` }} />)}
                      </span>
                      <span className={styles.changeAxis} />
                      <span className={styles.changeHalf}>
                        {up && Array.from({ length: cells }, (_, k) => <i key={k} className={styles.up} style={{ animationDelay: `${k * 30}ms` }} />)}
                      </span>
                    </span>
                    <span className={cn('mono', styles.changeValue, up && 'accent')}>{money(c.diff, { signed: true })}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState title="Не с чем сравнить" text="Выберите неделю, месяц или год — покажем, какие траты выросли, а какие сократились." />
        )}
        {m.changes.length > 0 && <p className={cn('label', styles.changeNote)}>Расходы к предыдущему периоду · красным — рост</p>}
      </Panel>
    </div>
  );
}
