import { usePreferences } from '@/features/settings/PreferencesProvider';
import { formatAmount, CURRENCY_META } from '@/lib/money';
import { cn } from '@/lib/cn';
import { useCountUp } from './motion/useCountUp';
import styles from './Amount.module.css';

interface AmountProps {
  value: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  signed?: boolean;
  tone?: 'default' | 'muted' | 'accent' | 'auto';
  /** Count up to the value like a settling counter. */
  animate?: boolean;
  className?: string;
}

/** Dot-matrix figure with a small mono currency mark. */
export function Amount({ value, size = 'md', signed, tone = 'default', animate = true, className }: AmountProps) {
  const { currency } = usePreferences();
  const shown = useCountUp(value, { enabled: animate, duration: size === 'xl' ? 1400 : 900 });
  const signOf = (v: number) => (signed ? (v > 0 ? '+' : v < 0 ? '−' : '') : v < 0 ? '−' : '');
  const resolvedTone = tone === 'auto' ? (value < 0 ? 'accent' : 'default') : tone;
  // Keep the decimals of the final value while counting so the width doesn't jitter.
  const decimals = Number.isInteger(Math.round(value * 100) / 100) ? 0 : 2;
  return (
    <span className={cn(styles.amount, styles[size], styles[resolvedTone], className)}>
      <span className="sr-only">
        {signOf(value)}
        {formatAmount(Math.abs(value))}
      </span>
      <span className="dot-num" aria-hidden>
        {signOf(shown)}
        {/* Doto's space is a full cell wide — render digit groups with a tight gap instead. */}
        {formatAmount(Math.abs(shown), { decimals })
          .split(' ')
          .map((g, i) => (
            <span key={i} className={i ? styles.group : undefined}>
              {g}
            </span>
          ))}
      </span>
      <span className={styles.currency} aria-hidden>
        {CURRENCY_META[currency].symbol}
      </span>
    </span>
  );
}
