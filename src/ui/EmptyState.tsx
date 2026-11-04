import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

const GLYPH = ['01110', '10001', '10101', '10001', '01110'];

export function EmptyState({ title, text, action }: { title: string; text?: ReactNode; action?: ReactNode }) {
  return (
    <div className={styles.root}>
      <svg viewBox="0 0 50 50" width="56" height="56" aria-hidden className={styles.glyph}>
        {GLYPH.flatMap((row, y) =>
          [...row].map((c, x) => <circle key={`${x}-${y}`} cx={5 + x * 10} cy={5 + y * 10} r={3.2} className={c === '1' ? styles.on : styles.off} />),
        )}
      </svg>
      <p className={styles.title}>{title}</p>
      {text && <p className={styles.text}>{text}</p>}
      {action}
    </div>
  );
}

export function Loader({ label = 'Загрузка' }: { label?: string }) {
  return (
    <div className={styles.loader} role="status" aria-label={label}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ animationDelay: `${i * 90}ms` }} />
      ))}
    </div>
  );
}
