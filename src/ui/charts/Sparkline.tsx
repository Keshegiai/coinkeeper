import { resample } from '@/lib/finance';
import { cn } from '@/lib/cn';
import styles from './Sparkline.module.css';

interface SparklineProps {
  values: readonly number[];
  tone?: 'fg' | 'accent';
  rows?: number;
  /** Max number of columns; longer series are summed into chunks. */
  max?: number;
  className?: string;
}

const STEP = 5;

/** A tiny dot-column histogram for stat cards. Purely decorative. */
export function Sparkline({ values, tone = 'fg', rows = 5, max = 24, className }: SparklineProps) {
  const cols = resample(values, max);
  const top = Math.max(...cols, 0);
  if (!cols.length || top <= 0) return null;
  const w = cols.length * STEP;
  const h = rows * STEP;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={cn(styles.spark, className)} aria-hidden>
      {cols.map((v, i) => {
        const lit = v > 0 ? Math.max(1, Math.round((v / top) * rows)) : 0;
        return (
          <g key={i} style={{ animationDelay: `${i * 22}ms` }} className={styles.col}>
            {Array.from({ length: rows }, (_, k) => (
              <circle
                key={k}
                cx={i * STEP + STEP / 2}
                cy={h - k * STEP - STEP / 2}
                r={1.25}
                className={k < lit ? (tone === 'accent' ? styles.accent : styles.on) : styles.off}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}
