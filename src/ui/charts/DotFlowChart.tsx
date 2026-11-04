import { useMemo, useState, type KeyboardEvent } from 'react';
import type { FlowBucket, Granularity } from '@/lib/finance';
import { formatDay, parseISODate } from '@/lib/date';
import { usePreferences } from '@/features/settings/PreferencesProvider';
import { cn } from '@/lib/cn';
import { useElementWidth } from './useElementWidth';
import styles from './DotFlowChart.module.css';

interface DotFlowChartProps {
  buckets: FlowBucket[];
  granularity: Granularity;
  rows?: number;
  label?: string;
}

const ROW_STEP = 11;
const AXIS_GAP = 10;

/**
 * Diverging dot-matrix histogram: income rises above the axis (foreground),
 * expenses drop below it (signal red). Every column is a time bucket.
 */
export function DotFlowChart({ buckets, granularity, rows = 7, label = 'Денежный поток' }: DotFlowChartProps) {
  const { money } = usePreferences();
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);

  const max = useMemo(() => Math.max(1, ...buckets.flatMap((b) => [b.income, b.expense])), [buckets]);
  const n = buckets.length;
  const colStep = n ? width / n : 0;
  const r = Math.max(1.2, Math.min(colStep, ROW_STEP) * 0.32);
  const height = rows * 2 * ROW_STEP + AXIS_GAP;
  const axisY = rows * ROW_STEP + AXIS_GAP / 2;

  const dotsFor = (v: number) => (v <= 0 ? 0 : Math.max(1, Math.round((v / max) * rows)));
  const fmtBucket = (b: FlowBucket) =>
    granularity === 'day'
      ? formatDay(b.start, { day: 'numeric', month: 'short', weekday: 'short' })
      : parseISODate(b.start).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  const fmtTick = (b: FlowBucket) =>
    granularity === 'day' ? formatDay(b.start) : parseISODate(b.start).toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '');

  const onKeyDown = (e: KeyboardEvent) => {
    if (!n) return;
    if (e.key === 'ArrowRight') setActive((a) => Math.min(n - 1, (a ?? -1) + 1));
    else if (e.key === 'ArrowLeft') setActive((a) => Math.max(0, (a ?? n) - 1));
    else if (e.key === 'Home') setActive(0);
    else if (e.key === 'End') setActive(n - 1);
    else return;
    e.preventDefault();
  };

  const tickIdx = n <= 1 ? [0] : n <= 8 ? buckets.map((_, i) => i) : [0, Math.floor((n - 1) / 2), n - 1];
  const activeBucket = active !== null ? buckets[active] : undefined;
  const totalIncome = buckets.reduce((s, b) => s + b.income, 0);
  const totalExpense = buckets.reduce((s, b) => s + b.expense, 0);

  return (
    <figure className={styles.figure}>
      <div
        ref={ref}
        className={styles.plot}
        tabIndex={0}
        role="img"
        aria-label={`${label}: доходы ${money(totalIncome)}, расходы ${money(totalExpense)}. Стрелки — детали по периодам.`}
        onKeyDown={onKeyDown}
        onMouseLeave={() => setActive(null)}
        onBlur={() => setActive(null)}
      >
        {width > 0 && (
          <svg width={width} height={height} className={styles.svg} aria-hidden>
            <line x1={0} x2={width} y1={axisY} y2={axisY} className={styles.axis} />
            {buckets.map((b, i) => {
              const cx = colStep * i + colStep / 2;
              const up = dotsFor(b.income);
              const down = dotsFor(b.expense);
              const isActive = active === i;
              return (
                <g key={b.key} className={cn(styles.col, active !== null && !isActive && styles.dim)} onMouseEnter={() => setActive(i)}>
                  <rect x={colStep * i} y={0} width={colStep} height={height} fill="transparent" />
                  {Array.from({ length: rows }, (_, k) => (
                    <circle
                      key={`u${k}`}
                      cx={cx}
                      cy={axisY - AXIS_GAP / 2 - ROW_STEP / 2 - k * ROW_STEP}
                      r={r}
                      className={k < up ? styles.income : styles.off}
                    />
                  ))}
                  {Array.from({ length: rows }, (_, k) => (
                    <circle
                      key={`d${k}`}
                      cx={cx}
                      cy={axisY + AXIS_GAP / 2 + ROW_STEP / 2 + k * ROW_STEP}
                      r={r}
                      className={k < down ? styles.expense : styles.off}
                    />
                  ))}
                </g>
              );
            })}
          </svg>
        )}
        {activeBucket && width > 0 && (
          <div
            className={styles.tooltip}
            style={{ left: Math.min(Math.max(colStep * active! + colStep / 2, 90), width - 90) }}
            aria-live="polite"
          >
            <span className="label">{fmtBucket(activeBucket)}</span>
            <span className={styles.tipRow}>
              <i className={styles.keyIncome} /> {money(activeBucket.income)}
            </span>
            <span className={styles.tipRow}>
              <i className={styles.keyExpense} /> {money(activeBucket.expense)}
            </span>
          </div>
        )}
      </div>
      <div className={styles.ticks} aria-hidden>
        {tickIdx.map((i) => {
          const b = buckets[i];
          if (!b) return null;
          return (
            <span key={b.key} style={{ left: colStep * i + colStep / 2 }} className={cn('label', styles.tick)}>
              {fmtTick(b)}
            </span>
          );
        })}
      </div>
      <figcaption className={styles.legend}>
        <span className={styles.legendItem}>
          <i className={styles.keyIncome} /> Доходы
        </span>
        <span className={styles.legendItem}>
          <i className={styles.keyExpense} /> Расходы
        </span>
      </figcaption>
    </figure>
  );
}
