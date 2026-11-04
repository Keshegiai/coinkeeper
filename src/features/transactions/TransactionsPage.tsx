import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Plus, Search, X } from 'lucide-react';
import type { TransactionType } from '@/domain/types';
import { useFinanceData } from '@/features/useFinanceData';
import { filterByPeriod, totals } from '@/lib/finance';
import { transactionsToCsv, downloadFile } from '@/lib/csv';
import { today } from '@/lib/date';
import { Amount } from '@/ui/Amount';
import { Button } from '@/ui/Button';
import { DataState } from '@/ui/DataState';
import { EmptyState } from '@/ui/EmptyState';
import { SelectField } from '@/ui/Field';
import { PageHeader } from '@/ui/PageHeader';
import { Panel } from '@/ui/Panel';
import { Segmented } from '@/ui/Segmented';
import { PeriodPicker } from './PeriodPicker';
import { TransactionList } from './TransactionList';
import { useTransactionEditor, isTypingTarget } from './TransactionEditor';
import { usePeriod } from './usePeriod';
import styles from './TransactionsPage.module.css';

const PAGE = 60;
type TypeFilter = 'all' | TransactionType;

export function TransactionsPage() {
  const data = useFinanceData();
  const { openNew } = useTransactionEditor();
  return (
    <>
      <PageHeader
        index="02"
        subtitle="История"
        title="Операции"
        actions={
          <Button variant="accent" icon={<Plus size={14} />} onClick={() => openNew()}>
            Добавить
          </Button>
        }
      />
      <DataState {...data}>
        <Transactions {...data} />
      </DataState>
    </>
  );
}

function Transactions({ transactions, categories, categoryMap }: ReturnType<typeof useFinanceData>) {
  const [params, setParams] = useSearchParams();
  const { period } = usePeriod();
  const searchRef = useRef<HTMLInputElement>(null);

  const q = params.get('q') ?? '';
  const type = (['income', 'expense'].includes(params.get('type') ?? '') ? params.get('type') : 'all') as TypeFilter;
  const cat = params.get('cat') ?? '';
  const deferredQ = useDeferredValue(q);

  const setParam = (key: string, value: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );

  // `/` focuses search, like on most power-user tools.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !isTypingTarget(e.target) && !document.querySelector('dialog[open]')) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filtered = useMemo(() => {
    const needle = deferredQ.trim().toLocaleLowerCase('ru');
    return filterByPeriod(transactions, period.from, period.to).filter((t) => {
      if (type !== 'all' && t.type !== type) return false;
      if (cat && t.categoryId !== cat) return false;
      if (!needle) return true;
      const name = categoryMap.get(t.categoryId)?.name ?? '';
      return (
        t.comment.toLocaleLowerCase('ru').includes(needle) ||
        name.toLocaleLowerCase('ru').includes(needle) ||
        String(t.amount).includes(needle.replace(',', '.'))
      );
    });
  }, [transactions, period, type, cat, deferredQ, categoryMap]);

  // Paging resets whenever the filter set changes (derived, no effect needed).
  const filterKey = `${period.from}|${period.to}|${type}|${cat}|${deferredQ}`;
  const [paging, setPaging] = useState({ key: filterKey, limit: PAGE });
  const limit = paging.key === filterKey ? paging.limit : PAGE;

  const sum = useMemo(() => totals(filtered), [filtered]);
  const hasFilters = !!(q || cat || type !== 'all');

  const exportCsv = () => downloadFile(`coinkeeper-${period.from ?? 'all'}-${period.to ?? today()}.csv`, transactionsToCsv(filtered, categoryMap));

  return (
    <div className={styles.layout}>
      <div className={styles.toolbar}>
        <label className={styles.search}>
          <Search size={16} aria-hidden />
          <input
            ref={searchRef}
            type="search"
            placeholder="Поиск по комментарию, категории, сумме"
            value={q}
            onChange={(e) => setParam('q', e.target.value)}
            aria-label="Поиск операций"
          />
          {q ? (
            <button onClick={() => setParam('q', '')} aria-label="Очистить поиск" className={styles.clear}>
              <X size={14} />
            </button>
          ) : (
            <kbd className={styles.kbd}>/</kbd>
          )}
        </label>
        <Segmented<TypeFilter>
          label="Тип"
          size="sm"
          value={type}
          onChange={(v) => setParam('type', v === 'all' ? '' : v)}
          options={[
            { value: 'all', label: 'Все' },
            { value: 'expense', label: 'Расходы' },
            { value: 'income', label: 'Доходы' },
          ]}
        />
        <SelectField aria-label="Категория" value={cat} onChange={(e) => setParam('cat', e.target.value)} className={styles.catSelect}>
          <option value="">Все категории</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </SelectField>
      </div>

      <div className={styles.periodRow}>
        <PeriodPicker />
        {hasFilters && (
          <Button variant="ghost" size="sm" icon={<X size={14} />} onClick={() => setParams((p) => { const n = new URLSearchParams(p); ['q', 'type', 'cat'].forEach((k) => n.delete(k)); return n; }, { replace: true })}>
            Сбросить фильтры
          </Button>
        )}
      </div>

      <Panel className={styles.summary} aria-label="Итоги по выборке">
        <div className={styles.sumItem}>
          <span className="label">Найдено</span>
          <span className="dot-num" style={{ fontSize: 28 }}>
            {sum.count}
          </span>
        </div>
        <div className={styles.sumItem}>
          <span className="label">Доходы</span>
          <Amount value={sum.income} size="sm" />
        </div>
        <div className={styles.sumItem}>
          <span className="label">Расходы</span>
          <Amount value={sum.expense} size="sm" />
        </div>
        <div className={styles.sumItem}>
          <span className="label">Итог</span>
          <Amount value={sum.net} size="sm" signed tone="auto" />
        </div>
        <Button size="sm" icon={<Download size={14} />} onClick={exportCsv} disabled={!filtered.length} className={styles.export}>
          CSV
        </Button>
      </Panel>

      <Panel>
        {filtered.length ? (
          <>
            <TransactionList transactions={filtered.slice(0, limit)} categories={categoryMap} />
            {filtered.length > limit && (
              <div className={styles.more}>
                <Button onClick={() => setPaging({ key: filterKey, limit: limit + PAGE })}>Показать ещё · {filtered.length - limit}</Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState title={hasFilters ? 'Ничего не найдено' : 'Нет операций за период'} text={hasFilters ? 'Попробуйте изменить фильтры или период.' : 'Выберите другой период или добавьте операцию.'} />
        )}
      </Panel>
    </div>
  );
}
