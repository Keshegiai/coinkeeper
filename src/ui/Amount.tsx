import { usePreferences } from '@/features/settings/PreferencesProvider';
import { formatAmount, CURRENCY_META } from '@/lib/money';
import { cn } from '@/lib/cn';
import styles from './Amount.module.css';

interface AmountProps {
  value: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  signed?: boolean;
  tone?: 'default' | 'muted' | 'accent' | 'auto';
  className?: string;
}

/** Dot-matrix figure with a small mono currency mark. */
export function Amount({ value, size = 'md', signed, tone = 'default', className }: AmountProps) {
  const { currency } = usePreferences();
  const sign = signed ? (value > 0 ? '+' : value < 0 ? '−' : '') : value < 0 ? '−' : '';
  const resolvedTone = tone === 'auto' ? (value < 0 ? 'accent' : 'default') : tone;
  return (
    <span className={cn(styles.amount, styles[size], styles[resolvedTone], className)}>
      <span className="sr-only">
        {sign}
        {formatAmount(Math.abs(value))}
      </span>
      <span className="dot-num" aria-hidden>
        {sign}
        {/* Doto's space is a full cell wide — render digit groups with a tight gap instead. */}
        {formatAmount(Math.abs(value))
          .split(' ')
          .map((g, i) => (
            <span key={i} className={i ? styles.group : undefined}>
              {g}
            </span>
          ))}
      </span>
      <span className={styles.currency}>{CURRENCY_META[currency].symbol}</span>
    </span>
  );
}
