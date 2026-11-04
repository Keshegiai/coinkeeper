import type { CSSProperties, ReactNode } from 'react';
import styles from './DotRing.module.css';

interface DotRingProps {
  /** Progress, 0..1 (values above 1 are shown full). */
  value: number;
  size?: number;
  dots?: number;
  color?: string;
  children?: ReactNode;
  label: string;
}

/** Progress as a ring of LEDs lighting up clockwise from twelve o'clock. */
export function DotRing({ value, size = 120, dots = 40, color, children, label }: DotRingProps) {
  const lit = Math.round(Math.min(1, Math.max(0, value)) * dots);
  const r = size / 2 - 5;
  const dotR = Math.max(1.8, Math.min(3.6, (Math.PI * 2 * r) / dots / 3.4));
  return (
    <div className={styles.root} style={{ width: size, height: size, '--ring': color } as CSSProperties} role="img" aria-label={label}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        {Array.from({ length: dots }, (_, i) => {
          const a = (i / dots) * Math.PI * 2 - Math.PI / 2;
          return (
            <circle
              key={i}
              cx={size / 2 + r * Math.cos(a)}
              cy={size / 2 + r * Math.sin(a)}
              r={i === lit - 1 ? dotR * 1.35 : dotR}
              className={i < lit ? styles.on : styles.off}
              style={i < lit ? { animationDelay: `${i * 18}ms` } : undefined}
            />
          );
        })}
      </svg>
      {children && <div className={styles.center}>{children}</div>}
    </div>
  );
}
