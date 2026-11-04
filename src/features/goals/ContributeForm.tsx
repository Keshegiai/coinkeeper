import { useState, type FormEvent } from 'react';
import type { Goal } from '@/domain/types';
import { CURRENCY_META, parseAmount } from '@/lib/money';
import { cn } from '@/lib/cn';
import { usePreferences } from '@/features/settings/PreferencesProvider';
import { Button } from '@/ui/Button';
import { Segmented } from '@/ui/Segmented';
import { useContribute } from './hooks';
import { planGoal } from './math';
import styles from './GoalForm.module.css';

type Mode = 'add' | 'withdraw';

const roundNice = (v: number) => {
  if (v <= 0) return 0;
  const p = 10 ** Math.max(0, Math.floor(Math.log10(v)) - 1);
  return Math.ceil(v / p) * p;
};

export function ContributeForm({ goal, initialMode = 'add', onDone }: { goal: Goal; initialMode?: Mode; onDone: () => void }) {
  const { currency, money } = usePreferences();
  const contribute = useContribute();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const plan = planGoal(goal);

  const quick =
    mode === 'add'
      ? [...new Set([plan.perMonth ? roundNice(plan.perMonth) : 0, roundNice(goal.target * 0.05), roundNice(goal.target * 0.1), plan.remaining].filter((v) => v > 0))].sort((a, b) => a - b)
      : [...new Set([roundNice(goal.saved * 0.1), goal.saved].filter((v) => v > 0))];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = parseAmount(amount);
    if (!amount.trim() || Number.isNaN(v) || v <= 0) return setError('Введите сумму больше нуля');
    if (mode === 'withdraw' && v > goal.saved) return setError(`Отложено только ${money(goal.saved)}`);
    contribute.mutate({ goal, amount: mode === 'add' ? v : -v });
    onDone();
  };

  return (
    <form className={styles.money} onSubmit={submit} noValidate>
      <Segmented
        label="Действие"
        block
        value={mode}
        onChange={(m) => {
          setMode(m);
          setError(null);
        }}
        options={[
          { value: 'add', label: 'Пополнить' },
          { value: 'withdraw', label: 'Снять' },
        ]}
      />
      <label className={styles.amountBox}>
        <span className="sr-only">Сумма</span>
        <span className={cn('dot-num', styles.sign, mode === 'withdraw' && 'accent')}>{mode === 'add' ? '+' : '−'}</span>
        <input
          autoFocus
          className={cn('dot-num', styles.amountInput)}
          inputMode="decimal"
          placeholder="0"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value.replace(/[^\d.,\s]/g, ''));
            setError(null);
          }}
          aria-invalid={!!error || undefined}
        />
        <span className={styles.currency}>{CURRENCY_META[currency].symbol}</span>
      </label>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {quick.length > 0 && (
        <div className={styles.quick}>
          {quick.map((v) => (
            <button key={v} type="button" className={styles.chip} onClick={() => setAmount(String(v))}>
              {v === plan.remaining && mode === 'add' ? `Остаток · ${money(v)}` : v === goal.saved && mode === 'withdraw' ? `Всё · ${money(v)}` : money(v)}
            </button>
          ))}
        </div>
      )}
      <p className="label">
        {money(goal.saved)} из {money(goal.target)}
        {plan.perMonth ? ` · план ${money(plan.perMonth)}/мес` : ''}
      </p>
      <div className={styles.footer}>
        <span />
        <Button type="submit" variant={mode === 'add' ? 'accent' : 'primary'} size="lg">
          {mode === 'add' ? 'Пополнить' : 'Снять'}
        </Button>
      </div>
    </form>
  );
}
