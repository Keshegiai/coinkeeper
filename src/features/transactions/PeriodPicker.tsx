import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PeriodPreset } from '@/lib/period';
import { today, addDays } from '@/lib/date';
import { Segmented } from '@/ui/Segmented';
import { Button } from '@/ui/Button';
import { cn } from '@/lib/cn';
import { usePeriod } from './usePeriod';
import styles from './PeriodPicker.module.css';

const OPTIONS: Array<{ value: PeriodPreset; label: string }> = [
  { value: 'week', label: 'Нед' },
  { value: 'month', label: 'Мес' },
  { value: 'year', label: 'Год' },
  { value: 'all', label: 'Всё' },
  { value: 'custom', label: 'Свой' },
];

export function PeriodPicker({ className }: { className?: string }) {
  const { spec, period, setSpec } = usePeriod();

  return (
    <div className={cn(styles.root, className)}>
      <Segmented
        label="Период"
        size="sm"
        value={spec.preset}
        options={OPTIONS}
        onChange={(preset) =>
          setSpec(
            preset === 'custom'
              ? { preset, offset: 0, from: period.from ?? addDays(today(), -29), to: period.to ?? today() }
              : { preset, offset: 0 },
          )
        }
      />
      {period.navigable ? (
        <div className={styles.nav}>
          <Button variant="ghost" size="sm" icon={<ChevronLeft size={16} />} aria-label="Предыдущий период" onClick={() => setSpec({ ...spec, offset: spec.offset - 1 })} />
          <span className={styles.label} aria-live="polite">
            {period.label}
          </span>
          <Button
            variant="ghost"
            size="sm"
            icon={<ChevronRight size={16} />}
            aria-label="Следующий период"
            disabled={spec.offset >= 0}
            onClick={() => setSpec({ ...spec, offset: spec.offset + 1 })}
          />
        </div>
      ) : spec.preset === 'custom' ? (
        <div className={styles.custom}>
          <input
            type="date"
            className={styles.date}
            aria-label="С"
            value={spec.from ?? ''}
            onChange={(e) => setSpec({ ...spec, from: e.target.value })}
          />
          <span className={styles.dash}>—</span>
          <input type="date" className={styles.date} aria-label="По" value={spec.to ?? ''} onChange={(e) => setSpec({ ...spec, to: e.target.value })} />
        </div>
      ) : (
        <span className={styles.label}>{period.label}</span>
      )}
    </div>
  );
}
