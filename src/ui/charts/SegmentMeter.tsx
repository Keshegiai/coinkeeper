import { cn } from '@/lib/cn';
import styles from './SegmentMeter.module.css';

interface SegmentMeterProps {
  ratio: number;
  segments?: number;
  label: string;
  className?: string;
}

/** A row of discrete cells, like a battery/volume indicator. Turns red past 100%. */
export function SegmentMeter({ ratio, segments = 24, label, className }: SegmentMeterProps) {
  const over = ratio > 1;
  const warn = !over && ratio >= 0.85;
  const filled = over ? segments : Math.round(Math.max(0, ratio) * segments);
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(ratio * 100)}
      className={cn(styles.meter, over && styles.over, warn && styles.warn, className)}
      style={{ gridTemplateColumns: `repeat(${segments}, 1fr)` }}
    >
      {Array.from({ length: segments }, (_, i) => (
        <span key={i} className={cn(styles.cell, i < filled && styles.on)} />
      ))}
    </div>
  );
}
