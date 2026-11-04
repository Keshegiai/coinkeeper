import { Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import { formatPercent } from '@/lib/money';
import { cn } from '@/lib/cn';
import { usePreferences } from '@/features/settings/PreferencesProvider';
import { buttonClass } from '@/ui/Button';
import { EmptyState } from '@/ui/EmptyState';
import { Panel } from '@/ui/Panel';
import { DotRing } from '@/ui/charts/DotRing';
import { useGoals } from './hooks';
import { planGoal } from './math';
import styles from './GoalsPreview.module.css';

/** Compact goal list for the dashboard. */
export function GoalsPreview({ index, className }: { index: string; className?: string }) {
  const { goals, isPending } = useGoals();
  const { money } = usePreferences();
  const top = [...goals].sort((a, b) => Number(planGoal(a).done) - Number(planGoal(b).done)).slice(0, 3);

  return (
    <Panel
      className={className}
      index={index}
      title="Цели"
      action={
        <Link to="/goals" className={buttonClass({ variant: 'ghost', size: 'sm' })}>
          Все <ArrowRight size={14} />
        </Link>
      }
    >
      {isPending ? null : top.length ? (
        <ul className={styles.list}>
          {top.map((g) => {
            const p = planGoal(g);
            return (
              <li key={g.id}>
                <Link to="/goals" className={styles.row}>
                  <DotRing value={p.progress} size={46} dots={20} color={g.color} label={`${g.name}: ${formatPercent(p.progress)}`} />
                  <span className={styles.text}>
                    <span className={styles.name}>{g.name}</span>
                    <span className="label">
                      {money(g.saved)} / {money(g.target)}
                    </span>
                  </span>
                  <span className={cn('dot-num', styles.pct, p.done && 'accent')}>{formatPercent(p.progress)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          title="Копите на что-то?"
          text="Поставьте цель — покажем прогресс и сколько откладывать в месяц."
          action={
            <Link to="/goals" className={buttonClass({ size: 'sm' })}>
              <Plus size={14} /> Цель
            </Link>
          }
        />
      )}
    </Panel>
  );
}
