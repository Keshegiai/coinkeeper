import type { ReactNode } from 'react';
import styles from './PageHeader.module.css';

export function PageHeader({ index, title, subtitle, actions }: { index: string; title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className={styles.root}>
      <div className={styles.titleBlock}>
        <span className="label">
          <span className={styles.index}>[{index}]</span> {subtitle}
        </span>
        <h1 className={styles.title}>
          <span className="dotted" aria-hidden>
            {title}
          </span>
          <span className="sr-only">{title}</span>
        </h1>
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
