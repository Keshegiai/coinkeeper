import { useMemo, useState } from 'react';
import type { ISODate } from '@/domain/types';
import { addDays, daysBetween, formatDay, parseISODate, startOfWeek, toISODate, today } from '@/lib/date';
import { usePreferences } from '@/features/settings/PreferencesProvider';
import { cn } from '@/lib/cn';
import { ChartTooltip } from './ChartTooltip';
import { useElementWidth } from './useElementWidth';
import styles from './CalendarHeatmap.module.css';

interface CalendarHeatmapProps {
  values: ReadonlyMap<ISODate, number>;
  from: ISODate | null;
  to: ISODate | null;
  onSelect?: (date: ISODate) => void;
  label?: string;
}

const LEFT = 22;
const TOP = 16;
const MAX_WEEKS = 53;
const MIN_CELL = 11;
const WEEKDAY_LABELS = ['Пн', '', 'Ср', '', 'Пт', '', ''];

/**
 * A year-at-a-glance dot calendar: one column per week, one dot per day. Dot
 * size encodes how much was spent; the heaviest days light up red.
 */
export function CalendarHeatmap({ values, from, to, onSelect, label = 'Расходы по дням' }: CalendarHeatmapProps) {
  const { money } = usePreferences();
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<{ date: ISODate; x: number; y: number } | null>(null);

  // On narrow screens show only the most recent weeks that fit at a legible size.
  const fitWeeks = width ? Math.max(8, Math.min(MAX_WEEKS, Math.floor((width - LEFT) / MIN_CELL))) : MAX_WEEKS;

  const model = useMemo(() => {
    const now = today();
    const end = to && to < now ? to : now;
    // Always fill the available width with history up to the period's end, so a single month
    // still reads in context; days outside the selected period are dimmed.
    const endWeekStart = toISODate(startOfWeek(parseISODate(end)));
    const start = addDays(endWeekStart, -(fitWeeks - 1) * 7);
    const gridStart = toISODate(startOfWeek(parseISODate(start)));
    const weeks = Math.ceil(daysBetween(gridStart, end) / 7);

    const inRange = [...values.entries()].filter(([d]) => d >= start && d <= end).map(([, v]) => v);
    const inPeriod = [...values.entries()].filter(([d]) => (!from || d >= from) && d <= end).map(([, v]) => v);
    const max = Math.max(1, ...inRange);
    const sorted = [...inRange].sort((a, b) => a - b);
    // Top ~10% of spending days get the signal colour.
    const hot = sorted.length >= 5 ? sorted[Math.floor(sorted.length * 0.9)]! : Infinity;

    const months: Array<{ week: number; label: string }> = [];
    let lastMonth = -1;
    for (let w = 0; w < weeks; w++) {
      const d = parseISODate(addDays(gridStart, w * 7 + 6));
      if (d.getMonth() !== lastMonth) {
        lastMonth = d.getMonth();
        // Skip a label that would collide with the next one.
        if (months.length && w - months.at(-1)!.week < 3) months.pop();
        months.push({ week: w, label: d.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '') });
      }
    }
    const total = inPeriod.reduce((s, v) => s + v, 0);
    return { start, end, gridStart, weeks, max, hot, months, total, activeDays: inPeriod.filter((v) => v > 0).length };
  }, [values, from, to, fitWeeks]);

  const avail = Math.max(0, width - LEFT);
  const cell = Math.max(MIN_CELL, Math.min(18, avail / model.weeks));
  const plotW = LEFT + cell * model.weeks;
  const plotH = TOP + cell * 7;
  const maxR = cell * 0.42;
  const minR = Math.max(1.4, cell * 0.12);

  const cells: Array<{ date: ISODate; x: number; y: number; v: number; out: boolean }> = [];
  for (let w = 0; w < model.weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const date = addDays(model.gridStart, w * 7 + d);
      if (date < model.start || date > model.end) continue;
      cells.push({ date, x: LEFT + w * cell + cell / 2, y: TOP + d * cell + cell / 2, v: values.get(date) ?? 0, out: !!from && date < from });
    }
  }

  const act = active ? values.get(active.date) ?? 0 : 0;

  return (
    <figure className={styles.figure}>
      <div ref={ref} className={styles.measure}>
        <div className={styles.plot} style={{ width: plotW, height: plotH }} onMouseLeave={() => setActive(null)}>
          {width > 0 && (
            <svg width={plotW} height={plotH} role="img" aria-label={`${label}: ${money(model.total)} за ${model.activeDays} дн.`}>
              {model.months.map((m) => (
                <text key={m.week} x={LEFT + m.week * cell} y={10} className={styles.month}>
                  {m.label}
                </text>
              ))}
              {WEEKDAY_LABELS.map((l, i) =>
                l ? (
                  <text key={i} x={0} y={TOP + i * cell + cell / 2 + 3} className={styles.month}>
                    {l}
                  </text>
                ) : null,
              )}
              {cells.map((c, i) => {
                const r = c.v > 0 ? minR + (maxR - minR) * Math.sqrt(c.v / model.max) : minR * 0.8;
                return (
                  <g key={c.date} className={cn(styles.cell, c.out && styles.outside)} style={{ animationDelay: `${Math.min(i * 2, 700)}ms` }}>
                    <rect
                      x={c.x - cell / 2}
                      y={c.y - cell / 2}
                      width={cell}
                      height={cell}
                      fill="transparent"
                      className={cn(onSelect && styles.clickable)}
                      onMouseEnter={() => setActive({ date: c.date, x: c.x, y: c.y })}
                      onClick={() => onSelect?.(c.date)}
                    />
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r={r}
                      className={cn(styles.dot, c.v <= 0 ? styles.zero : c.v >= model.hot ? styles.hot : styles.on, active?.date === c.date && styles.active)}
                    />
                  </g>
                );
              })}
            </svg>
          )}
          {active && (
            <ChartTooltip
              x={active.x}
              top={active.y - cell / 2}
              width={plotW}
              title={formatDay(active.date, { day: 'numeric', month: 'long', weekday: 'short' })}
              rows={[{ key: 'v', label: 'Расходы', value: act ? money(act) : 'нет', tone: act >= model.hot ? 'accent' : 'fg' }]}
            />
          )}
        </div>
      </div>
      <figcaption className={styles.legend}>
        <span className="label">Меньше</span>
        {[0.15, 0.35, 0.6, 1].map((k) => (
          <svg key={k} width={14} height={14} aria-hidden>
            <circle cx={7} cy={7} r={2 + 4.4 * k} className={k === 1 ? styles.hot : styles.on} />
          </svg>
        ))}
        <span className="label">Больше</span>
        {onSelect && <span className={cn('label', styles.hint)}>Клик по дню — операции</span>}
      </figcaption>
    </figure>
  );
}
