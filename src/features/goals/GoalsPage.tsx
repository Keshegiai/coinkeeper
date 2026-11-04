import { useState } from 'react';
import { ArrowDownLeft, Pencil, Plus } from 'lucide-react';
import type { Goal } from '@/domain/types';
import { formatDay } from '@/lib/date';
import { errorMessage } from '@/lib/http';
import { formatPercent } from '@/lib/money';
import { cn } from '@/lib/cn';
import { usePreferences } from '@/features/settings/PreferencesProvider';
import { CategoryIcon } from '@/features/categories/icons';
import { Amount } from '@/ui/Amount';
import { Button } from '@/ui/Button';
import { DataState } from '@/ui/DataState';
import { Dialog } from '@/ui/Dialog';
import { EmptyState } from '@/ui/EmptyState';
import { PageHeader } from '@/ui/PageHeader';
import { Panel } from '@/ui/Panel';
import { DotRing } from '@/ui/charts/DotRing';
import { ContributeForm } from './ContributeForm';
import { GOAL_TEMPLATES, GoalForm, type GoalTemplate } from './GoalForm';
import { useGoals } from './hooks';
import { planGoal, pluralMonths } from './math';
import styles from './GoalsPage.module.css';

type Modal = { kind: 'form'; goal?: Goal; template?: GoalTemplate } | { kind: 'money'; goal: Goal; mode: 'add' | 'withdraw' } | null;

export function GoalsPage() {
  const q = useGoals();
  const [modal, setModal] = useState<Modal>(null);
  const close = () => setModal(null);
  return (
    <>
      <PageHeader
        index="04"
        subtitle="Копим на важное"
        title="Цели"
        actions={
          <Button variant="accent" icon={<Plus size={14} />} onClick={() => setModal({ kind: 'form' })}>
            Новая цель
          </Button>
        }
      />
      <DataState isLoading={q.isPending} error={q.error ? errorMessage(q.error) : null} retry={() => void q.refetch()}>
        <Goals goals={q.goals} open={setModal} />
      </DataState>
      <Dialog
        open={!!modal}
        onClose={close}
        size="sm"
        index={modal?.kind === 'money' ? 'GO' :modal?.goal ? 'ED' : 'NEW'}
        title={modal?.kind === 'money' ? modal.goal.name : modal?.goal ? 'Изменить цель' : 'Новая цель'}
      >
        {modal?.kind === 'form' && <GoalForm key={modal.goal?.id ?? modal.template?.name ?? 'new'} initial={modal.goal} template={modal.template} onDone={close} />}
        {modal?.kind === 'money' && <ContributeForm key={modal.goal.id} goal={modal.goal} initialMode={modal.mode} onDone={close} />}
      </Dialog>
    </>
  );
}

function Goals({ goals, open }: { goals: Goal[]; open: (m: Modal) => void }) {
  const { money } = usePreferences();

  if (!goals.length) {
    return (
      <Panel>
        <EmptyState
          title="Целей пока нет"
          text="Поставьте цель — мы посчитаем, сколько откладывать в месяц, и покажем прогресс кольцом."
          action={
            <div className={styles.templates}>
              {GOAL_TEMPLATES.map((t) => (
                <button key={t.name} type="button" className={styles.template} onClick={() => open({ kind: 'form', template: t })}>
                  <CategoryIcon icon={t.icon} size={15} />
                  {t.name}
                </button>
              ))}
              <Button size="sm" variant="accent" icon={<Plus size={14} />} onClick={() => open({ kind: 'form' })}>
                Своя цель
              </Button>
            </div>
          }
        />
      </Panel>
    );
  }

  const saved = goals.reduce((s, g) => s + g.saved, 0);
  const target = goals.reduce((s, g) => s + g.target, 0);
  const done = goals.filter((g) => planGoal(g).done).length;
  const monthly = goals.reduce((s, g) => s + (planGoal(g).perMonth ?? 0), 0);

  return (
    <div className={cn(styles.grid, 'stagger')}>
      <Panel className={cn('inverse', styles.summary)} index="Σ" title="Всего накоплено">
        <div className={styles.summaryBody}>
          <DotRing value={target ? saved / target : 0} size={168} dots={56} label={`Накоплено ${formatPercent(target ? saved / target : 0)} от всех целей`}>
            <span className={cn('dot-num', styles.ringPct)}>{formatPercent(target ? saved / target : 0)}</span>
          </DotRing>
          <div className={styles.summaryNums}>
            <Amount value={saved} size="lg" />
            <span className="label">из {money(target)}</span>
            <dl className={styles.summaryFacts}>
              <div>
                <dt className="label">Достигнуто</dt>
                <dd className="dot-num">
                  {done}/{goals.length}
                </dd>
              </div>
              {monthly > 0 && (
                <div>
                  <dt className="label">Откладывать в месяц</dt>
                  <dd className="mono">{money(monthly)}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </Panel>

      {goals.map((g, i) => (
        <GoalCard key={g.id} goal={g} index={i + 1} open={open} />
      ))}

      <button type="button" className={styles.addCard} onClick={() => open({ kind: 'form' })}>
        <Plus size={22} strokeWidth={1.6} />
        <span className="label">Новая цель</span>
      </button>
    </div>
  );
}

function GoalCard({ goal, index, open }: { goal: Goal; index: number; open: (m: Modal) => void }) {
  const { money } = usePreferences();
  const plan = planGoal(goal);
  return (
    <Panel
      className={cn(styles.card, plan.done && styles.done)}
      index={String(index).padStart(2, '0')}
      title={
        <span className={styles.cardTitle}>
          <CategoryIcon icon={goal.icon} size={14} />
          {goal.name}
        </span>
      }
      action={<Button size="sm" variant="ghost" icon={<Pencil size={14} />} aria-label={`Изменить «${goal.name}»`} onClick={() => open({ kind: 'form', goal })} />}
    >
      <div className={styles.cardBody}>
        <DotRing value={plan.progress} size={124} dots={40} color={goal.color} label={`${goal.name}: ${formatPercent(plan.progress)}`}>
          <span className={cn('dot-num', styles.cardPct)}>{formatPercent(plan.progress)}</span>
        </DotRing>
        <div className={styles.cardNums}>
          <Amount value={goal.saved} size="sm" />
          <span className="label">из {money(goal.target)}</span>
          <span className={cn('label', styles.status, plan.overdue && 'accent')}>
            {plan.done
              ? 'Достигнута ✓'
              : plan.overdue
                ? `Срок прошёл · ${formatDay(goal.deadline!, { day: 'numeric', month: 'short', year: 'numeric' })}`
                : plan.perMonth !== null && plan.monthsLeft !== null
                  ? `${money(plan.perMonth)}/мес · ${pluralMonths(plan.monthsLeft)}`
                  : `Осталось ${money(plan.remaining)}`}
          </span>
        </div>
      </div>
      <div className={styles.cardActions}>
        <Button variant={plan.done ? 'outline' : 'accent'} size="sm" icon={<Plus size={14} />} onClick={() => open({ kind: 'money', goal, mode: 'add' })}>
          Пополнить
        </Button>
        <Button variant="ghost" size="sm" icon={<ArrowDownLeft size={14} />} disabled={goal.saved <= 0} onClick={() => open({ kind: 'money', goal, mode: 'withdraw' })}>
          Снять
        </Button>
      </div>
    </Panel>
  );
}
