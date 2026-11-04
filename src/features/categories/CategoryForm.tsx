import { useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import type { Category } from '@/domain/types';
import { CURRENCY_META, parseAmount } from '@/lib/money';
import { cn } from '@/lib/cn';
import { usePreferences } from '@/features/settings/PreferencesProvider';
import { Button } from '@/ui/Button';
import { TextField } from '@/ui/Field';
import { useConfirm } from '@/ui/Confirm';
import { useToast } from '@/ui/Toast';
import { CATEGORY_COLORS, CATEGORY_ICONS, CategoryIcon, ICON_KEYS, normalizeIcon } from './icons';
import { useCreateCategory, useDeleteCategory, useUpdateCategory } from './hooks';
import styles from './CategoryForm.module.css';

interface Props {
  initial?: Category;
  usage: number;
  onDone: () => void;
}

export function CategoryForm({ initial, usage, onDone }: Props) {
  const { currency } = usePreferences();
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const remove = useDeleteCategory();
  const confirm = useConfirm();
  const toast = useToast();

  const [name, setName] = useState(initial?.name ?? '');
  const [icon, setIcon] = useState(normalizeIcon(initial?.icon));
  const [color, setColor] = useState(initial?.color ?? CATEGORY_COLORS[0]!);
  const [budget, setBudget] = useState(initial?.budget ? String(initial.budget) : '');
  const [errors, setErrors] = useState<{ name?: string; budget?: string }>({});

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = 'Введите название';
    else if (name.trim().length > 32) errs.name = 'Не длиннее 32 символов';
    const b = budget.trim() ? parseAmount(budget) : null;
    if (b !== null && (Number.isNaN(b) || b <= 0)) errs.budget = 'Положительное число или пусто';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const draft = { name: name.trim(), icon, color, budget: b };
    const result = initial ? await update.mutateAsync({ ...initial, ...draft }).catch(() => null) : await create.mutateAsync(draft).catch(() => null);
    if (result) {
      toast({ message: initial ? 'Категория обновлена' : 'Категория создана' });
      onDone();
    }
  };

  const onDelete = async () => {
    if (!initial) return;
    if (usage > 0) {
      toast({ message: `Категория используется в ${usage} операциях — сначала перенесите их`, tone: 'error' });
      return;
    }
    if (await confirm({ title: `Удалить «${initial.name}»?`, confirmLabel: 'Удалить', danger: true })) {
      remove.mutate(initial);
      onDone();
    }
  };

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.preview}>
        <span className={styles.previewIcon} style={{ ['--cat' as string]: color }}>
          <CategoryIcon icon={icon} size={26} />
        </span>
        <TextField
          label="Название"
          value={name}
          maxLength={32}
          autoFocus
          placeholder="Например, Кафе"
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          fieldClassName={styles.nameField}
        />
      </div>

      <fieldset className={styles.fieldset}>
        <legend className="label">Иконка</legend>
        <div className={styles.icons} role="radiogroup" aria-label="Иконка">
          {ICON_KEYS.map((k) => {
            const Icon = CATEGORY_ICONS[k];
            return (
              <button key={k} type="button" role="radio" aria-checked={icon === k} aria-label={k} className={cn(styles.iconBtn, icon === k && styles.on)} onClick={() => setIcon(k)}>
                <Icon size={18} strokeWidth={1.6} />
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className="label">Цвет</legend>
        <div className={styles.colors} role="radiogroup" aria-label="Цвет">
          {CATEGORY_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={color.toLowerCase() === c.toLowerCase()}
              aria-label={c}
              className={cn(styles.swatch, color.toLowerCase() === c.toLowerCase() && styles.on)}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
          <label className={styles.custom} title="Свой цвет">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} aria-label="Свой цвет" />
          </label>
        </div>
      </fieldset>

      <TextField
        label="Месячный бюджет"
        hint="Оставьте пустым, если лимит не нужен"
        inputMode="decimal"
        placeholder="—"
        value={budget}
        onChange={(e) => setBudget(e.target.value.replace(/[^\d.,\s]/g, ''))}
        error={errors.budget}
        trailing={<span className="mono">{CURRENCY_META[currency].symbol}</span>}
      />

      <div className={styles.footer}>
        {initial ? (
          <Button variant="danger" icon={<Trash2 size={14} />} onClick={onDelete} title={usage ? `Используется в ${usage} операциях` : undefined}>
            Удалить
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" variant="primary" size="lg" loading={create.isPending || update.isPending}>
          {initial ? 'Сохранить' : 'Создать'}
        </Button>
      </div>
    </form>
  );
}
