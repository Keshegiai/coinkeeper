import { useMemo, useRef, useState, type FormEvent } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import type { Transaction, TransactionType } from '@/domain/types';
import { addDays, isValidISODate, today } from '@/lib/date';
import { CURRENCY_META, formatAmount, parseAmount } from '@/lib/money';
import { cn } from '@/lib/cn';
import { usePreferences } from '@/features/settings/PreferencesProvider';
import { useCategories, useCreateCategory } from '@/features/categories/hooks';
import { CATEGORY_COLORS, CategoryIcon } from '@/features/categories/icons';
import { Button } from '@/ui/Button';
import { TextField } from '@/ui/Field';
import { Segmented } from '@/ui/Segmented';
import { useConfirm } from '@/ui/Confirm';
import { useCreateTransaction, useDeleteTransaction, useTransactions, useUpdateTransaction } from './hooks';
import styles from './TransactionForm.module.css';

interface Props {
  initial?: Transaction;
  defaultType?: TransactionType;
  onDone: () => void;
}

type Errors = Partial<Record<'amount' | 'categoryId' | 'date', string>>;

export const MAX_AMOUNT = 1_000_000_000;

export function validateTransaction(input: { amount: string; categoryId: string; date: string }): Errors {
  const errors: Errors = {};
  const amount = parseAmount(input.amount);
  if (!input.amount.trim()) errors.amount = 'Введите сумму';
  else if (Number.isNaN(amount)) errors.amount = 'Только число, до 2 знаков после запятой';
  else if (amount <= 0) errors.amount = 'Сумма должна быть больше нуля';
  else if (amount > MAX_AMOUNT) errors.amount = 'Слишком большая сумма';
  if (!input.categoryId) errors.categoryId = 'Выберите категорию';
  if (!isValidISODate(input.date)) errors.date = 'Некорректная дата';
  return errors;
}

export function TransactionForm({ initial, defaultType = 'expense', onDone }: Props) {
  const { currency } = usePreferences();
  const { categories } = useCategories();
  const { transactions } = useTransactions();
  const create = useCreateTransaction();
  const update = useUpdateTransaction();
  const remove = useDeleteTransaction();
  const createCategory = useCreateCategory();
  const confirm = useConfirm();

  const [type, setType] = useState<TransactionType>(initial?.type ?? defaultType);
  const [amount, setAmount] = useState(initial ? formatAmount(initial.amount).replace(/\s/g, '') : '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');
  const [date, setDate] = useState(initial?.date ?? today());
  const [comment, setComment] = useState(initial?.comment ?? '');
  const [errors, setErrors] = useState<Errors>({});
  const [newCat, setNewCat] = useState<string | null>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const catBusy = useRef(false);

  // Most-used categories for this type float to the top.
  const sortedCategories = useMemo(() => {
    const freq = new Map<string, number>();
    for (const t of transactions) if (t.type === type) freq.set(t.categoryId, (freq.get(t.categoryId) ?? 0) + 1);
    return [...categories].sort((a, b) => (freq.get(b.id) ?? 0) - (freq.get(a.id) ?? 0) || a.name.localeCompare(b.name, 'ru'));
  }, [categories, transactions, type]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validateTransaction({ amount, categoryId, date });
    setErrors(errs);
    if (Object.keys(errs).length) {
      if (errs.amount) amountRef.current?.focus();
      return;
    }
    const draft = { type, amount: parseAmount(amount), categoryId, date, comment: comment.trim() };
    if (initial) update.mutate({ ...initial, ...draft });
    else create.mutate(draft);
    onDone();
  };

  const onDelete = async () => {
    if (!initial) return;
    const ok = await confirm({ title: 'Удалить операцию?', message: 'Её можно будет вернуть в течение нескольких секунд.', confirmLabel: 'Удалить', danger: true });
    if (ok) {
      remove.mutate(initial);
      onDone();
    }
  };

  const addCategory = async () => {
    const name = newCat?.trim();
    if (catBusy.current) return;
    if (!name) return setNewCat(null);
    catBusy.current = true;
    const color = CATEGORY_COLORS[(categories.length + 3) % CATEGORY_COLORS.length]!;
    const created = await createCategory.mutateAsync({ name, icon: type === 'income' ? 'salary' : 'shapes', color }).catch(() => null);
    if (created) {
      setCategoryId(created.id);
      setErrors((e) => ({ ...e, categoryId: undefined }));
    }
    catBusy.current = false;
    setNewCat(null);
  };

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <Segmented
        label="Тип операции"
        block
        value={type}
        onChange={setType}
        options={[
          { value: 'expense', label: 'Расход' },
          { value: 'income', label: 'Доход' },
        ]}
      />

      <div className={cn(styles.amountBox, errors.amount && styles.invalid)}>
        <label htmlFor="tx-amount" className="label">
          Сумма
        </label>
        <div className={styles.amountRow}>
          <span className={cn('dot-num', styles.sign, type === 'expense' && 'accent')}>{type === 'income' ? '+' : '−'}</span>
          <input
            ref={amountRef}
            id="tx-amount"
            className={cn('dot-num', styles.amountInput)}
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            autoFocus={!initial}
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value.replace(/[^\d.,\s]/g, ''));
              if (errors.amount) setErrors((x) => ({ ...x, amount: undefined }));
            }}
            aria-invalid={!!errors.amount || undefined}
            aria-describedby={errors.amount ? 'tx-amount-err' : undefined}
          />
          <span className={styles.currency}>{CURRENCY_META[currency].symbol}</span>
        </div>
        {errors.amount && (
          <p id="tx-amount-err" className={styles.error} role="alert">
            {errors.amount}
          </p>
        )}
      </div>

      <fieldset className={styles.fieldset}>
        <legend className="label">Категория</legend>
        <div className={styles.chips} role="radiogroup" aria-label="Категория">
          {sortedCategories.map((c) => {
            const checked = c.id === categoryId;
            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={checked}
                className={cn(styles.chip, checked && styles.chipOn)}
                onClick={() => {
                  setCategoryId(c.id);
                  setErrors((x) => ({ ...x, categoryId: undefined }));
                }}
              >
                <span className={styles.chipDot} style={{ background: c.color }} />
                <CategoryIcon icon={c.icon} size={14} />
                {c.name}
                {checked && <Check size={12} />}
              </button>
            );
          })}
          {newCat === null ? (
            <button type="button" className={cn(styles.chip, styles.chipAdd)} onClick={() => setNewCat('')}>
              <Plus size={14} /> Новая
            </button>
          ) : (
            <span className={styles.newCat}>
              <input
                autoFocus
                className={styles.newCatInput}
                placeholder="Название"
                aria-label="Название новой категории"
                value={newCat}
                maxLength={32}
                onChange={(e) => setNewCat(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void addCategory();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    e.stopPropagation();
                    catBusy.current = true;
                    setNewCat(null);
                    queueMicrotask(() => (catBusy.current = false));
                  }
                }}
                onBlur={() => void addCategory()}
              />
            </span>
          )}
        </div>
        {errors.categoryId && (
          <p className={styles.error} role="alert">
            {errors.categoryId}
          </p>
        )}
      </fieldset>

      <div className={styles.row}>
        <TextField
          label="Дата"
          type="date"
          value={date}
          max={addDays(today(), 365)}
          onChange={(e) => setDate(e.target.value)}
          error={errors.date}
          fieldClassName={styles.dateField}
        />
        <div className={styles.quickDates}>
          {[
            { label: 'Сегодня', v: today() },
            { label: 'Вчера', v: addDays(today(), -1) },
          ].map((q) => (
            <button key={q.label} type="button" className={cn(styles.quick, date === q.v && styles.quickOn)} onClick={() => setDate(q.v)}>
              {q.label}
            </button>
          ))}
        </div>
      </div>

      <TextField label="Комментарий" placeholder="Необязательно" value={comment} maxLength={140} onChange={(e) => setComment(e.target.value)} />

      <div className={styles.footer}>
        {initial ? (
          <Button variant="danger" icon={<Trash2 size={14} />} onClick={onDelete}>
            Удалить
          </Button>
        ) : (
          <span className={cn('label', styles.kbdHint)}>
            <kbd>Enter</kbd> сохранить · <kbd>Esc</kbd> закрыть
          </span>
        )}
        <Button type="submit" variant="primary" size="lg">
          {initial ? 'Сохранить' : 'Добавить'}
        </Button>
      </div>
    </form>
  );
}
