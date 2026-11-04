import { useMemo, useState, type KeyboardEvent } from 'react';
import type { BalancePoint, Granularity } from '@/lib/finance';
import { formatDay, parseISODate } from '@/lib/date';
import { usePreferences } from '@/features/settings/PreferencesProvider';
import { cn } from '@/lib/cn';
import { ChartTooltip } from './ChartTooltip';
import { useElementWidth } from './useElementWidth';
import styles from './BalanceChart.module.css';

interface BalanceChartProps {
  points: BalancePoint[];
  granularity: Granularity;
  rows?: number;
  /** Tighter dots, no axis labels — for the hero card. */
  compact?: boolean;
  label?: string;
}

interface Col {
  key: string;
  start: string;
  end: string;
  balance: number;
  net: number;
}

/**
 * Running balance as a dot-matrix area: every column fills from the zero line
 * up (or down, in red) to the balance level, with a bright "head" dot on top —
 * a level meter frozen in time.
 */
export function BalanceChart({ points, granularity, rows = 9, compact, label = 'Баланс' }: BalanceChartProps) {
  const { money } = usePreferences();
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const step = compact ? 9 : 11;

  // Merge buckets when there are more columns than fit at a comfortable pitch.
  const cols = useMemo<Col[]>(() => {
    const max = Math.max(8, Math.floor(width / (compact ? 8 : 9)));
    if (!width || points.length <= max) return points;
    const size = Math.ceil(points.length / max);
    const out: Col[] = [];
    for (let i = 0; i < points.length; i += size) {
      const chunk = points.slice(i, i + size);
      out.push({
        key: chunk[0]!.key,
        start: chunk[0]!.start,
        end: chunk.at(-1)!.end,
        balance: chunk.at(-1)!.balance,
        net: chunk.reduce((s, p) => s + p.net, 0),
      });
    }
    return out;
  }, [points, width, compact]);

  const n = cols.length;
  const lo = Math.min(0, ...cols.map((c) => c.balance));
  const hi = Math.max(0, ...cols.map((c) => c.balance));
  const range = hi - lo || 1;
  const level = (v: number) => Math.round(((v - lo) / range) * (rows - 1));
  const zero = level(0);
  const colStep = n ? width / n : 0;
  const r = Math.max(1.3, Math.min(colStep, step) * 0.3);
  const height = rows * step;
  const yOf = (k: number) => height - step / 2 - k * step;

  const merged = n !== points.length;
  const fmt = (c: Col) => {
    if (granularity === 'month' && !merged) return parseISODate(c.start).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    if (c.start === c.end) return formatDay(c.start, { day: 'numeric', month: 'short', weekday: 'short' });
    return `${formatDay(c.start)} — ${formatDay(c.end)}`;
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!n) return;
    if (e.key === 'ArrowRight') setActive((a) => Math.min(n - 1, (a ?? -1) + 1));
    else if (e.key === 'ArrowLeft') setActive((a) => Math.max(0, (a ?? n) - 1));
    else return;
    e.preventDefault();
  };

  const act = active !== null ? cols[active] : undefined;
  const last = cols.at(-1);
  const first = cols[0];

  return (
    <figure className={cn(styles.figure, compact && styles.compact)}>
      <div
        ref={ref}
        className={styles.plot}
        tabIndex={0}
        role="img"
        aria-label={`${label}: ${first ? money(first.balance) : ''} → ${last ? money(last.balance) : ''}. Стрелки — по датам.`}
        onKeyDown={onKeyDown}
        onMouseLeave={() => setActive(null)}
        onBlur={() => setActive(null)}
        style={{ height }}
      >
        {width > 0 && n > 0 && (
          <svg width={width} height={height} className={styles.svg} aria-hidden>
            {cols.map((c, i) => {
              const cx = colStep * i + colStep / 2;
              const lv = level(c.balance);
              const neg = c.balance < 0;
              const [a, b] = lv >= zero ? [zero, lv] : [lv, zero];
              return (
                <g
                  key={c.key}
                  className={cn(styles.col, active !== null && active !== i && styles.dim)}
                  style={{ animationDelay: `${Math.min(i * (900 / n), 900)}ms` }}
                  onMouseEnter={() => setActive(i)}
                >
                  <rect x={colStep * i} y={0} width={colStep} height={height} fill="transparent" />
                  {Array.from({ length: rows }, (_, k) => {
                    const on = k >= a && k <= b;
                    const head = k === lv;
                    return (
                      <circle
                        key={k}
                        cx={cx}
                        cy={yOf(k)}
                        r={head ? r * 1.25 : r}
                        className={cn(!on ? styles.off : head ? (neg ? styles.headNeg : styles.head) : neg ? styles.fillNeg : styles.fill)}
                      />
                    );
                  })}
                </g>
              );
            })}
            {lo < 0 && <line x1={0} x2={width} y1={yOf(zero)} y2={yOf(zero)} className={styles.zero} />}
            {act && <line x1={colStep * active! + colStep / 2} x2={colStep * active! + colStep / 2} y1={0} y2={height} className={styles.cross} />}
          </svg>
        )}
        {act && (
          <ChartTooltip
            x={colStep * active! + colStep / 2}
            width={width}
            title={fmt(act)}
            rows={[
              { key: 'b', label: 'Баланс', value: money(act.balance), tone: act.balance < 0 ? 'accent' : 'fg' },
              { key: 'n', label: 'Изменение', value: money(act.net, { signed: true }), tone: act.net < 0 ? 'accent' : 'muted' },
            ]}
          />
        )}
      </div>
      {!compact && first && last && (
        <div className={styles.ticks} aria-hidden>
          <span className="label">{fmt(first)}</span>
          <span className="label">{fmt(last)}</span>
        </div>
      )}
    </figure>
  );
}
