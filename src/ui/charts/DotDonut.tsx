import { useMemo, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import styles from './DotDonut.module.css';

export interface DonutSlice {
  id: string;
  value: number;
  color: string;
}

interface DotDonutProps {
  slices: DonutSlice[];
  /** Rendered in the hole; receives the hovered slice (or null for the total). */
  center: (active: DonutSlice | null) => ReactNode;
  highlight?: string | null;
  onHighlight?: (id: string | null) => void;
  onSelect?: (id: string) => void;
  label: string;
  rings?: number;
}

const SIZE = 240;
const PITCH = 9.6;
const DOT = 3.3;
/** Angular gap (fraction of a turn) left empty between neighbouring slices. */
const GAP = 0.008;

/**
 * A donut drawn as concentric rings of dots — each ring is a little "glyph"
 * track. Slices sweep clockwise from twelve o'clock.
 */
export function DotDonut({ slices, center, highlight: controlled, onHighlight, onSelect, label, rings = 5 }: DotDonutProps) {
  const [own, setOwn] = useState<string | null>(null);
  const highlight = controlled !== undefined ? controlled : own;
  const setHl = onHighlight ?? setOwn;

  const dots = useMemo(() => {
    const total = slices.reduce((s, x) => s + x.value, 0) || 1;
    const bounds: Array<{ slice: DonutSlice; a: number; b: number }> = [];
    let acc = 0;
    for (const s of slices) {
      const a = acc;
      acc += s.value / total;
      bounds.push({ slice: s, a, b: acc });
    }
    const out: Array<{ x: number; y: number; slice: DonutSlice | null; f: number; key: string }> = [];
    const outer = SIZE / 2 - DOT - 2;
    for (let k = 0; k < rings; k++) {
      const rad = outer - k * PITCH;
      const count = Math.max(12, Math.floor((2 * Math.PI * rad) / PITCH));
      for (let j = 0; j < count; j++) {
        const f = (j + 0.5) / count;
        const ang = f * 2 * Math.PI - Math.PI / 2;
        const hit = bounds.find((bd) => f >= bd.a && f < bd.b);
        const inGap = hit && slices.length > 1 && (f - hit.a < GAP || hit.b - f < GAP);
        out.push({ x: SIZE / 2 + rad * Math.cos(ang), y: SIZE / 2 + rad * Math.sin(ang), slice: hit && !inGap ? hit.slice : null, f, key: `${k}-${j}` });
      }
    }
    return out;
  }, [slices, rings]);

  const active = slices.find((s) => s.id === highlight) ?? null;

  return (
    <div className={styles.root} onMouseLeave={() => setHl(null)}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={styles.svg} role="img" aria-label={label}>
        {dots.map((d) => (
          <circle
            key={d.key}
            cx={d.x}
            cy={d.y}
            r={DOT}
            className={cn(styles.dot, !d.slice && styles.off, highlight && d.slice && d.slice.id !== highlight && styles.dim, onSelect && d.slice && styles.clickable)}
            style={{ fill: d.slice?.color, animationDelay: `${Math.round(d.f * 700)}ms` }}
            onMouseEnter={() => setHl(d.slice?.id ?? null)}
            onClick={() => d.slice && onSelect?.(d.slice.id)}
          />
        ))}
      </svg>
      <div className={styles.center}>{center(active)}</div>
    </div>
  );
}
