import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import styles from './Field.module.css';

interface FieldShellProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  id: string;
  children: ReactNode;
  className?: string;
}

function FieldShell({ label, hint, error, id, children, className }: FieldShellProps) {
  return (
    <div className={cn(styles.field, error && styles.invalid, className)}>
      {label && (
        <label htmlFor={id} className={cn('label', styles.label)}>
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-msg`} className={styles.error} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-msg`} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  leading?: ReactNode;
  trailing?: ReactNode;
  fieldClassName?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, leading, trailing, className, fieldClassName, id: idProp, ...rest },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  return (
    <FieldShell label={label} hint={hint} error={error} id={id} className={fieldClassName}>
      <div className={cn(styles.control, className)}>
        {leading && <span className={styles.adornment}>{leading}</span>}
        <input
          ref={ref}
          id={id}
          className={styles.input}
          aria-invalid={!!error || undefined}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          {...rest}
        />
        {trailing && <span className={styles.adornment}>{trailing}</span>}
      </div>
    </FieldShell>
  );
});

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  fieldClassName?: string;
}

export function SelectField({ label, hint, error, className, fieldClassName, id: idProp, children, ...rest }: SelectFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  return (
    <FieldShell label={label} hint={hint} error={error} id={id} className={fieldClassName}>
      <div className={cn(styles.control, className)}>
        <select id={id} className={cn(styles.input, styles.select)} aria-invalid={!!error || undefined} {...rest}>
          {children}
        </select>
        <ChevronDown size={14} className={styles.chevron} aria-hidden />
      </div>
    </FieldShell>
  );
}
