import { useMemo, useState } from 'react';
import type { Category, TransactionType } from '@/domain/types';
import { useFinanceData } from '@/features/useFinanceData';
import { usePeriod } from '@/features/transactions/usePeriod';
import { PeriodPicker } from '@/features/transactions/PeriodPicker';
import { CategoryIcon } from '@/features/categories/icons';
import { usePreferences } from '@/features/settings/PreferencesProvider';
import { breakdownByCategory, cashFlowSeries, delta, filterByPeriod, totals, type CategorySlice } from '@/lib/finance';
import { previousPeriod } from '@/lib/period';
import { formatDay } from '@/lib/date';
import { formatPercent } from '@/lib/money';
import { cn } from '@/lib/cn';
import { Amount } from '@/ui/Amount';
import { DataState } from '@/ui/DataState';
import { EmptyState } from '@/ui/EmptyState';
import { PageHeader } from '@/ui/PageHeader';
import { Panel } from '@/ui/Panel';
import { Segmented } from '@/ui/Segmented';
import { Stat } from '@/ui/Stat';
import { DotFlowChart } from '@/ui/charts/DotFlowChart';
import { Waffle } from '@/ui/charts/Waffle';
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

function Analytics({ transactions, categoryMap }: ReturnType<typeof useFinanceData>) {
  const { period } = usePeriod();
  const { money } = usePreferences();
  const [structure, setStructure] = useState<TransactionType>('expense');

  const m = useMemo(() => {
    const cur = filterByPeriod(transactions, period.from, period.to);
    const prev = previousPeriod(period);
    const prevTotals = prev ? totals(filterByPeriod(transactions, prev.from, prev.to)) : null;
    const t = totals(cur);
    return {
      t,
      cur,
      prevTotals,
      series: cashFlowSeries(cur, period.from, period.to),
      expense: breakdownByCategory(cur, 'expense', categoryMap),
      income: breakdownByCategory(cur, 'income', categoryMap),
      insights: computeInsights(cur, period.from, period.to),
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

  return (
    <div className={styles.grid}>
      <Panel className={styles.kpis} aria-label="Ключевые показатели">
        <Stat label="Доходы" value={<Amount value={m.t.income} />} delta={m.prevTotals ? delta(m.t.income, m.prevTotals.income) : null} />
        <Stat label="Расходы" value={<Amount value={m.t.expense} />} delta={m.prevTotals ? delta(m.t.expense, m.prevTotals.expense) : null} goodWhen="down" />
        <Stat label="Итог" value={<Amount value={m.t.net} signed tone="auto" />} delta={m.prevTotals ? delta(m.t.net, m.prevTotals.net) : null} />
        <Stat
          label="Норма сбережений"
          value={
            <span className={cn('dot-num', styles.bigPct, savings !== null && savings < 0 && 'accent')}>{savings === null ? '—' : formatPercent(savings)}</span>
          }
          footnote="Итог / доходы"
        />
      </Panel>

      <Panel className={styles.flow} index="01" title={`Поток · ${period.label}`}>
        <DotFlowChart buckets={m.series.buckets} granularity={m.series.granularity} rows={9} />
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
        <Breakdown slices={slices} money={money} />
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
                      <span key={k} className={cn(k < filled && styles.on, k < filled && i === m.insights.busiestWeekday?.index && styles.peak)} />
                    ))}
                  </div>
                  <span className="label">{WEEKDAYS_SHORT[i]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Panel>
    </div>
  );
}

function Breakdown({ slices, money }: { slices: CategorySlice[]; money: (v: number) => string }) {
  const [hl, setHl] = useState<string | null>(null);
  if (!slices.length) return <EmptyState title="Нет данных" />;
  const color = (c: Category | undefined) => c?.color ?? '#8A8A8A';
  return (
    <div className={styles.breakdown}>
      <Waffle
        slices={slices.map((s) => ({ id: s.categoryId, share: s.share, color: color(s.category) }))}
        highlight={hl}
        onHighlight={setHl}
        label={slices.map((s) => `${s.category?.name ?? 'Без категории'} ${formatPercent(s.share)}`).join(', ')}
      />
      <ul className={styles.legend} onMouseLeave={() => setHl(null)}>
        {slices.map((s) => (
          <li key={s.categoryId} className={cn(styles.legendRow, hl && hl !== s.categoryId && styles.dim)} onMouseEnter={() => setHl(s.categoryId)}>
            <span className={styles.swatch} style={{ background: color(s.category) }} />
            <CategoryIcon icon={s.category?.icon ?? 'shapes'} size={15} />
            <span className={styles.legendName}>{s.category?.name ?? 'Без категории'}</span>
            <span className={cn('mono', styles.legendCount)}>×{s.count}</span>
            <span className={cn('mono', styles.legendPct)}>{formatPercent(s.share)}</span>
            <span className={cn('mono', styles.legendAmt)}>{money(s.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
