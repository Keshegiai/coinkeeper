import { useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react';
import type { MonthPace } from '@/lib/finance';
import { usePreferences } from '@/features/settings/PreferencesProvider';
import { cn } from '@/lib/cn';
import { ChartTooltip, type TooltipRow } from './ChartTooltip';
import { useElementWidth } from './useElementWidth';
import styles from './PaceChart.module.css';

interface PaceChartProps {
  pace: MonthPace;
  /** First day of the month being shown. */
  month: Date;
  /** Optional spending ceiling (sum of budgets) drawn as a dotted rule. */
  limit?: number | null;
  height?: number;
}

const PAD_X = 6;
const PAD_TOP = 18;
const PAD_BOTTOM = 8;

/** 1, 2 or 5 × 10ⁿ — axis steps people can read at a glance. */
function niceStep(raw: number) {
  if (raw <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(raw));
  const m = raw / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
}

interface Pt {
  x: number;
  y: number;
}

/** Points along a polyline, evenly spaced — turns a line into a row of LEDs. */
function dotted(points: Pt[], spacing: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]!;
    const b = points[i + 1]!;
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const steps = Math.max(1, Math.round(len / spacing));
    for (let s = 0; s < steps; s++) out.push({ x: a.x + ((b.x - a.x) * s) / steps, y: a.y + ((b.y - a.y) * s) / steps });
  }
  const last = points.at(-1);
  if (last) out.push(last);
  return out;
}

/**
 * Cumulative spending this month (red) against last month (grey) on the same
 * calendar days, plus a hollow-dot projection to month end.
 */
export function PaceChart({ pace, month, limit, height = 220 }: PaceChartProps) {
  const { money } = usePreferences();
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const { days, elapsed, current, previous, spent, forecast } = pace;

  const maxY = Math.max(1, pace.previousTotal, forecast ?? 0, spent, limit ?? 0) * 1.08;
  const innerW = Math.max(0, width - PAD_X * 2);
  const innerH = height - PAD_TOP - PAD_BOTTOM;
  const x = (d: number) => PAD_X + (days > 1 ? (d / (days - 1)) * innerW : innerW / 2);
  const y = (v: number) => PAD_TOP + innerH - (v / maxY) * innerH;

  const geo = useMemo(() => {
    if (!width) return null;
    const prevPts = previous.slice(0, days).map((v, d) => ({ x: x(d), y: y(v) }));
    const curPts = current.map((v, d) => ({ x: x(d), y: y(v) }));
    const fc =
      forecast !== null && elapsed > 0
        ? dotted(
            [
              { x: x(elapsed - 1), y: y(spent) },
              { x: x(days - 1), y: y(forecast) },
            ],
            9,
          ).slice(1)
        : [];
    return { prev: dotted(prevPts, 6), cur: dotted(curPts, 5), fc };
    // x/y are derived from the deps below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, previous, current, days, elapsed, spent, forecast, maxY]);

  const monthName = month.toLocaleDateString('ru-RU', { month: 'long' });
  const prevName = new Date(month.getFullYear(), month.getMonth() - 1, 1).toLocaleDateString('ru-RU', { month: 'long' });
  const forecastAt = (d: number) =>
    forecast === null || d < elapsed ? null : spent + ((forecast - spent) * (d - elapsed + 1)) / Math.max(1, days - elapsed);

  const pick = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const d = Math.round(((e.clientX - rect.left - PAD_X) / Math.max(1, innerW)) * (days - 1));
    setActive(Math.min(days - 1, Math.max(0, d)));
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') setActive((a) => Math.min(days - 1, (a ?? -1) + 1));
    else if (e.key === 'ArrowLeft') setActive((a) => Math.max(0, (a ?? days) - 1));
    else return;
    e.preventDefault();
  };

  const rows: TooltipRow[] = [];
  if (active !== null) {
    if (active < elapsed) rows.push({ key: 'c', label: monthName, value: money(current[active] ?? 0), tone: 'accent' });
    const fa = forecastAt(active);
    if (fa !== null) rows.push({ key: 'f', label: 'Прогноз', value: money(fa), tone: 'accent', hollow: true });
    if (previous[active] !== undefined) rows.push({ key: 'p', label: prevName, value: money(previous[active]!), tone: 'muted' });
  }

  const step = niceStep(maxY / 3);
  const grid = Array.from({ length: Math.floor(maxY / step) }, (_, i) => (i + 1) * step);
  const ticks = [0, 9, 19, days - 1].filter((d, i, a) => d < days && a.indexOf(d) === i);

  return (
    <figure className={styles.figure}>
      <div
        ref={ref}
        className={styles.plot}
        style={{ height }}
        tabIndex={0}
        role="img"
        aria-label={`Расходы за ${monthName}: ${money(spent)}${forecast !== null ? `, прогноз ${money(forecast)}` : ''}; ${prevName}: ${money(pace.previousTotal)}.`}
        onMouseMove={pick}
        onMouseLeave={() => setActive(null)}
        onKeyDown={onKeyDown}
        onBlur={() => setActive(null)}
      >
        {geo && (
          <svg width={width} height={height} className={styles.svg} aria-hidden>
            {grid.map((v) => (
              <line key={v} x1={0} x2={width} y1={y(v)} y2={y(v)} className={styles.grid} />
            ))}
            <line x1={0} x2={width} y1={y(0)} y2={y(0)} className={styles.base} />
            {limit ? (
              <g>
                <line x1={0} x2={width} y1={y(limit)} y2={y(limit)} className={styles.limit} />
                <text x={width} y={y(limit) - 5} textAnchor="end" className={cn(styles.axisLabel, styles.limitLabel)}>
                  Бюджеты · {money(limit, { compact: true })}
                </text>
              </g>
            ) : null}
            {geo.prev.map((p, i) => (
              <circle key={`p${i}`} cx={p.x} cy={p.y} r={1.5} className={styles.prev} />
            ))}
            {geo.fc.map((p, i) => (
              <circle key={`f${i}`} cx={p.x} cy={p.y} r={2} className={styles.forecast} style={{ animationDelay: `${700 + i * 25}ms` }} />
            ))}
            {geo.cur.map((p, i) => (
              <circle key={`c${i}`} cx={p.x} cy={p.y} r={2.2} className={styles.cur} style={{ animationDelay: `${Math.round((i / geo.cur.length) * 700)}ms` }} />
            ))}
            {grid.map((v) => (
              <text key={v} x={0} y={y(v) - 5} className={styles.axisLabel}>
                {money(v, { compact: true })}
              </text>
            ))}
            {elapsed > 0 && elapsed < days && (
              <g className={styles.today} style={{ animationDelay: '720ms' }}>
                <circle cx={x(elapsed - 1)} cy={y(spent)} r={9} className={styles.halo} />
                <circle cx={x(elapsed - 1)} cy={y(spent)} r={4.5} className={styles.head} />
              </g>
            )}
            {active !== null && (
              <>
                <line x1={x(active)} x2={x(active)} y1={PAD_TOP - 6} y2={y(0)} className={styles.cross} />
                {active < elapsed && <circle cx={x(active)} cy={y(current[active] ?? 0)} r={4} className={styles.head} />}
                {previous[active] !== undefined && <circle cx={x(active)} cy={y(previous[active]!)} r={3} className={styles.prevActive} />}
              </>
            )}
          </svg>
        )}
        {active !== null && rows.length > 0 && (
          <ChartTooltip
            x={x(active)}
            width={width}
            top={0}
            placement="below"
            title={new Date(month.getFullYear(), month.getMonth(), active + 1).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' })}
            rows={rows}
          />
        )}
      </div>
      <div className={styles.ticks} aria-hidden>
        {ticks.map((d) => (
          <span key={d} className="label" style={{ left: x(d) }}>
            {d + 1}
          </span>
        ))}
      </div>
      <figcaption className={styles.legend}>
        <span>
          <i className={styles.keyCur} /> {monthName}
        </span>
        {forecast !== null && (
          <span>
            <i className={styles.keyFc} /> прогноз
          </span>
        )}
        <span>
          <i className={styles.keyPrev} /> {prevName}
        </span>
      </figcaption>
    </figure>
  );
}
