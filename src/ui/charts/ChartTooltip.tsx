import type { ReactNode } from 'react';
import styles from './ChartTooltip.module.css';

export interface TooltipRow {
  key: string;
  label: ReactNode;
  value: ReactNode;
  tone?: 'fg' | 'accent' | 'muted';
  hollow?: boolean;
}

/** Inverse floating card shared by all charts. `x` is clamped by the caller's width. */
export function ChartTooltip({
  x,
  width,
  title,
  rows,
  top = 0,
  placement = 'above',
}: {
  x: number;
  width: number;
  title: ReactNode;
  rows: TooltipRow[];
  top?: number;
  /** `below` hangs the card from `top` instead of sitting on it. */
  placement?: 'above' | 'below';
}) {
  const half = 88;
  const left = width < half * 2 ? width / 2 : Math.min(Math.max(x, half), width - half);
  return (
    <div className={styles.tooltip} data-placement={placement} style={{ left, top }} aria-live="polite">
      <span className={styles.title}>{title}</span>
      {rows.map((r) => (
        <span key={r.key} className={styles.row}>
          <i className={styles.key} data-tone={r.tone ?? 'fg'} data-hollow={r.hollow || undefined} />
          <span className={styles.rowLabel}>{r.label}</span>
          <span className={styles.rowValue}>{r.value}</span>
        </span>
      ))}
    </div>
  );
}
