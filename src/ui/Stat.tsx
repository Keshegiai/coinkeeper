import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatPercent } from '@/lib/money';
import styles from './Stat.module.css';

interface StatProps {
  label: string;
  value: ReactNode;
  /** Relative change vs previous period. */
  delta?: number | null;
  /** Whether an increase is good (income) or bad (expense). */
  goodWhen?: 'up' | 'down';
  footnote?: ReactNode;
  /** Small decorative chart shown next to the value. */
  chart?: ReactNode;
  className?: string;
}

export function Stat({ label, value, delta, goodWhen = 'up', footnote, chart, className }: StatProps) {
  const hasDelta = typeof delta === 'number' && Number.isFinite(delta);
  const up = hasDelta && delta! > 0;
  const bad = hasDelta && delta !== 0 && (goodWhen === 'up' ? !up : up);
  return (
    <div className={cn(styles.stat, className)}>
      <span className="label">{label}</span>
      <div className={styles.value}>
        {value}
        {chart && <span className={styles.chart}>{chart}</span>}
      </div>
      <div className={styles.foot}>
        {hasDelta && (
          <span className={cn(styles.delta, bad && styles.bad)} title="К предыдущему периоду">
            {delta === 0 ? '±' : up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {formatPercent(Math.abs(delta!))}
          </span>
        )}
        {footnote && <span className={styles.footnote}>{footnote}</span>}
      </div>
    </div>
  );
}
