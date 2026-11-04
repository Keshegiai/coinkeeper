import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export function buttonClass({
  variant = 'outline',
  size = 'md',
  block,
  iconOnly,
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; block?: boolean; iconOnly?: boolean; className?: string } = {}) {
  return cn(styles.button, styles[variant], styles[size], block && styles.block, iconOnly && styles.iconOnly, className);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, icon, iconRight, loading, block, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  const iconOnly = !children && !!icon;
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClass({ variant, size, block, iconOnly, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className={styles.spinner} aria-hidden /> : icon}
      {children && <span>{children}</span>}
      {iconRight}
    </button>
  );
});
