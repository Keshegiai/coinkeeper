import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import styles from './Panel.module.css';

interface PanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  index?: string;
  title?: ReactNode;
  action?: ReactNode;
  flush?: boolean;
  as?: 'section' | 'div' | 'article';
}

/** The basic surface. Header uses a numbered mono label: "01 / Баланс". */
export function Panel({ index, title, action, flush, as: Tag = 'section', className, children, ...rest }: PanelProps) {
  return (
    <Tag className={cn(styles.panel, flush && styles.flush, className)} {...rest}>
      {(title || action) && (
        <header className={styles.header}>
          {title && (
            <h2 className={cn('label', styles.title)}>
              {index && <span className={styles.index}>{index}</span>}
              {title}
            </h2>
          )}
          {action && <div className={styles.action}>{action}</div>}
        </header>
      )}
      {children}
    </Tag>
  );
}
