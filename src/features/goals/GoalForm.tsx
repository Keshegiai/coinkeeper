import { useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import type { Goal } from '@/domain/types';
import { CURRENCY_META, formatAmount, parseAmount } from '@/lib/money';
import { addMonths, isValidISODate, today, toISODate } from '@/lib/date';
import { cn } from '@/lib/cn';
import { usePreferences } from '@/features/settings/PreferencesProvider';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/features/categories/icons';
import catStyles from '@/features/categories/CategoryForm.module.css';
import { Button } from '@/ui/Button';
import { TextField } from '@/ui/Field';
import { useConfirm } from '@/ui/Confirm';
import { useToast } from '@/ui/Toast';
import { useDeleteGoal, useSaveGoal } from './hooks';
import { planGoal, pluralMonths } from './math';
import styles from './GoalForm.module.css';

export const GOAL_ICONS = ['savings', 'plane', 'home', 'car', 'gift', 'study', 'phone', 'heart', 'game', 'health', 'baby', 'invest', 'wallet', 'shirt', 'music', 'pet'] as const;

export interface GoalTemplate {
  name: string;
  icon: (typeof GOAL_ICONS)[number];
  months: number;
}

export const GOAL_TEMPLATES: GoalTemplate[] = [
  { name: 'Подушка безопасности', icon: 'savings', months: 12 },
  { name: 'Отпуск', icon: 'plane', months: 6 },
  { name: 'Новый телефон', icon: 'phone', months: 4 },
  { name: 'Обучение', icon: 'study', months: 9 },
];

interface Props {
  initial?: Goal;
  template?: GoalTemplate;
  onDone: () => void;
}

export function GoalForm({ initial, template, onDone }: Props) {
  const { currency, money } = usePreferences();
  const save = useSaveGoal();
  const remove = useDeleteGoal();
  const confirm = useConfirm();
  const toast = useToast();

  const [name, setName] = useState(initial?.name ?? template?.name ?? '');
  const [target, setTarget] = useState(initial ? formatAmount(initial.target).replace(/\s/g, '') : '');
  const [saved, setSaved] = useState(initial ? formatAmount(initial.saved).replace(/\s/g, '') : '');
  const [deadline, setDeadline] = useState(
    initial?.deadline ?? (template ? toISODate(addMonths(new Date(), template.months)) : ''),
  );
  const [icon, setIcon] = useState<string>(initial?.icon ?? template?.icon ?? 'savings');
  const [color, setColor] = useState(initial?.color ?? '#D71921');
  const [errors, setErrors] = useState<{ name?: string; target?: string; saved?: string; deadline?: string }>({});

  const t = parseAmount(target);
  const s = saved.trim() ? parseAmount(saved) : 0;
  const preview = Number.isFinite(t) && t > 0 && Number.isFinite(s) ? planGoal({ target: t, saved: s, deadline: isValidISODate(deadline) ? deadline : null }) : null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = 'Как назовём цель?';
    if (!target.trim() || Number.isNaN(t) || t <= 0) errs.target = 'Положительная сумма';
    if (Number.isNaN(s) || s < 0) errs.saved = 'Число не меньше нуля';
    if (deadline && !isValidISODate(deadline)) errs.deadline = 'Некорректная дата';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const draft = { name: name.trim(), target: t, saved: s, deadline: deadline || null, icon, color };
    const result = await save.mutateAsync({ draft, base: initial }).catch(() => null);
    if (result) {
      toast({ message: initial ? 'Цель обновлена' : 'Цель создана' });
      onDone();
    }
  };

  const onDelete = async () => {
    if (!initial) return;
    if (await confirm({ title: `Удалить цель «${initial.name}»?`, message: 'Накопленная сумма просто перестанет отслеживаться.', confirmLabel: 'Удалить', danger: true })) {
      remove.mutate(initial);
      onDone();
    }
  };

  const sym = <span className="mono">{CURRENCY_META[currency].symbol}</span>;

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <TextField label="Название" value={name} maxLength={40} autoFocus={!initial} placeholder="Например, Отпуск" onChange={(e) => setName(e.target.value)} error={errors.name} />

      <div className={styles.row}>
        <TextField
          label="Сколько нужно"
          inputMode="decimal"
          placeholder="0"
          value={target}
          onChange={(e) => setTarget(e.target.value.replace(/[^\d.,\s]/g, ''))}
          error={errors.target}
          trailing={sym}
        />
        <TextField
          label="Уже отложено"
          inputMode="decimal"
          placeholder="0"
          value={saved}
          onChange={(e) => setSaved(e.target.value.replace(/[^\d.,\s]/g, ''))}
          error={errors.saved}
          trailing={sym}
        />
      </div>

      <TextField
        label="К какой дате"
        type="date"
        min={today()}
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        error={errors.deadline}
        hint="Необязательно — но так мы посчитаем, сколько откладывать в месяц"
      />

      {preview && (
        <p className={cn('label', styles.preview)} aria-live="polite">
          {preview.done
            ? 'Цель уже достигнута'
            : preview.perMonth !== null && preview.monthsLeft !== null
              ? `≈ ${money(preview.perMonth)} в месяц · ${pluralMonths(preview.monthsLeft)}`
              : `Осталось ${money(preview.remaining)}`}
        </p>
      )}

      <fieldset className={catStyles.fieldset}>
        <legend className="label">Иконка</legend>
        <div className={catStyles.icons} role="radiogroup" aria-label="Иконка">
          {GOAL_ICONS.map((k) => {
            const Icon = CATEGORY_ICONS[k];
            return (
              <button key={k} type="button" role="radio" aria-checked={icon === k} aria-label={k} className={cn(catStyles.iconBtn, icon === k && catStyles.on)} onClick={() => setIcon(k)}>
                <Icon size={18} strokeWidth={1.6} />
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className={catStyles.fieldset}>
        <legend className="label">Цвет кольца</legend>
        <div className={catStyles.colors} role="radiogroup" aria-label="Цвет">
          {CATEGORY_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={color.toLowerCase() === c.toLowerCase()}
              aria-label={c}
              className={cn(catStyles.swatch, color.toLowerCase() === c.toLowerCase() && catStyles.on)}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </fieldset>

      <div className={styles.footer}>
        {initial ? (
          <Button variant="danger" icon={<Trash2 size={14} />} onClick={onDelete}>
            Удалить
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" variant="primary" size="lg" loading={save.isPending}>
          {initial ? 'Сохранить' : 'Создать цель'}
        </Button>
      </div>
    </form>
  );
}
