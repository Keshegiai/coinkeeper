import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowUpRight,
  ChartColumn,
  CornerDownLeft,
  Download,
  LayoutGrid,
  List,
  Monitor,
  Moon,
  Search,
  Settings,
  Sun,
  Tag,
  Target,
} from 'lucide-react';
import type { Transaction } from '@/domain/types';
import { useFinanceData } from '@/features/useFinanceData';
import { useTransactionEditor } from '@/features/transactions/TransactionEditor';
import { usePreferences } from '@/features/settings/PreferencesProvider';
import { CategoryIcon } from '@/features/categories/icons';
import { transactionsToCsv, downloadFile } from '@/lib/csv';
import { formatDay, today } from '@/lib/date';
import { cn } from '@/lib/cn';
import styles from './CommandPalette.module.css';

interface Command {
  id: string;
  group: 'Действия' | 'Разделы' | 'Операции' | 'Тема';
  label: string;
  hint?: string;
  icon: ReactNode;
  keywords?: string;
  run: () => void;
}

const PaletteContext = createContext<(() => void) | null>(null);

/** ⌘K / Ctrl+K anywhere: jump to a screen, run an action or find an operation. */
export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openPalette = useCallback(() => setOpen(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K' || e.key === 'л' || e.key === 'Л')) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <PaletteContext.Provider value={openPalette}>
      {children}
      {open && <Palette onClose={() => setOpen(false)} />}
    </PaletteContext.Provider>
  );
}

export function useCommandPalette() {
  const ctx = useContext(PaletteContext);
  if (!ctx) throw new Error('useCommandPalette must be used within <CommandPaletteProvider>');
  return ctx;
}

const norm = (s: string) => s.toLocaleLowerCase('ru').replace(/ё/g, 'е');

function Palette({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const navigate = useNavigate();
  const { openNew, openEdit } = useTransactionEditor();
  const { setTheme, money } = usePreferences();
  const { transactions, categoryMap } = useFinanceData();
  const [q, setQ] = useState('');
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
    const onCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    el?.addEventListener('cancel', onCancel);
    return () => el?.removeEventListener('cancel', onCancel);
  }, [onClose]);

  const commands = useMemo<Command[]>(() => {
    const go = (to: string) => () => navigate(to);
    return [
      { id: 'new-expense', group: 'Действия', label: 'Новый расход', hint: 'N', icon: <ArrowDownRight size={16} />, keywords: 'добавить трата', run: () => openNew({ type: 'expense' }) },
      { id: 'new-income', group: 'Действия', label: 'Новый доход', icon: <ArrowUpRight size={16} />, keywords: 'добавить зарплата', run: () => openNew({ type: 'income' }) },
      {
        id: 'export',
        group: 'Действия',
        label: 'Экспорт всех операций в CSV',
        icon: <Download size={16} />,
        keywords: 'скачать выгрузка excel',
        run: () => downloadFile(`coinkeeper-${today()}.csv`, transactionsToCsv(transactions, categoryMap)),
      },
      { id: 'nav-home', group: 'Разделы', label: 'Обзор', hint: '01', icon: <LayoutGrid size={16} />, keywords: 'главная дашборд баланс', run: go('/') },
      { id: 'nav-tx', group: 'Разделы', label: 'Операции', hint: '02', icon: <List size={16} />, keywords: 'история список', run: go('/transactions') },
      { id: 'nav-an', group: 'Разделы', label: 'Аналитика', hint: '03', icon: <ChartColumn size={16} />, keywords: 'графики статистика отчёт', run: go('/analytics') },
      { id: 'nav-goals', group: 'Разделы', label: 'Цели', hint: '04', icon: <Target size={16} />, keywords: 'накопления копилка', run: go('/goals') },
      { id: 'nav-cat', group: 'Разделы', label: 'Категории', hint: '05', icon: <Tag size={16} />, keywords: 'бюджеты лимиты', run: go('/categories') },
      { id: 'nav-set', group: 'Разделы', label: 'Настройки', icon: <Settings size={16} />, keywords: 'валюта профиль выход', run: go('/settings') },
      { id: 'theme-light', group: 'Тема', label: 'Светлая тема', icon: <Sun size={16} />, keywords: 'theme light', run: () => setTheme('light') },
      { id: 'theme-dark', group: 'Тема', label: 'Тёмная тема', icon: <Moon size={16} />, keywords: 'theme dark ночь', run: () => setTheme('dark') },
      { id: 'theme-system', group: 'Тема', label: 'Как в системе', icon: <Monitor size={16} />, keywords: 'theme system авто', run: () => setTheme('system') },
    ];
  }, [navigate, openNew, setTheme, transactions, categoryMap]);

  const results = useMemo(() => {
    const needle = norm(q.trim());
    const cmds = needle ? commands.filter((c) => norm(`${c.label} ${c.keywords ?? ''}`).includes(needle)) : commands;
    let txs: Transaction[] = [];
    if (needle.length >= 2) {
      const digits = needle.replace(/\s/g, '');
      txs = transactions
        .filter((t) => {
          const cat = categoryMap.get(t.categoryId)?.name ?? '';
          return norm(`${t.comment} ${cat}`).includes(needle) || (/^\d+$/.test(digits) && String(t.amount).includes(digits));
        })
        .slice(0, 7);
    }
    const txCommands: Command[] = txs.map((t) => {
      const cat = categoryMap.get(t.categoryId);
      return {
        id: `tx-${t.id}`,
        group: 'Операции',
        label: t.comment || cat?.name || 'Операция',
        hint: `${t.type === 'income' ? '+' : '−'}${money(t.amount)} · ${formatDay(t.date)}`,
        icon: <CategoryIcon icon={cat?.icon ?? 'shapes'} size={16} />,
        run: () => openEdit(t),
      };
    });
    return [...cmds, ...txCommands];
  }, [q, commands, transactions, categoryMap, money, openEdit]);

  const safeCursor = Math.min(cursor, Math.max(0, results.length - 1));

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${safeCursor}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [safeCursor]);

  const run = (c: Command | undefined) => {
    if (!c) return;
    onClose();
    // Let the palette unmount before opening another dialog.
    requestAnimationFrame(() => c.run());
  };

  let lastGroup = '';

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-label="Командная палитра"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.panel}>
        <div className={styles.search}>
          <Search size={18} aria-hidden />
          <input
            autoFocus
            className={styles.input}
            placeholder="Команда, раздел или поиск по операциям…"
            value={q}
            role="combobox"
            aria-expanded
            aria-controls="cmdk-list"
            aria-activedescendant={results[safeCursor] ? `cmdk-${results[safeCursor].id}` : undefined}
            onChange={(e) => {
              setQ(e.target.value);
              setCursor(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setCursor((c) => Math.min(results.length - 1, c + 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setCursor((c) => Math.max(0, c - 1));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                run(results[safeCursor]);
              }
            }}
          />
          <kbd className={styles.kbd}>Esc</kbd>
        </div>
        <ul id="cmdk-list" ref={listRef} className={styles.list} role="listbox" aria-label="Результаты">
          {results.length === 0 && <li className={styles.empty}>Ничего не найдено</li>}
          {results.map((c, i) => {
            const header = c.group !== lastGroup ? c.group : null;
            lastGroup = c.group;
            return (
              <li key={c.id} role="presentation">
                {header && <div className={cn('label', styles.group)}>{header}</div>}
                <div
                  id={`cmdk-${c.id}`}
                  role="option"
                  aria-selected={i === safeCursor}
                  data-idx={i}
                  className={cn(styles.item, i === safeCursor && styles.active)}
                  onMouseMove={() => setCursor(i)}
                  onClick={() => run(c)}
                >
                  <span className={styles.icon}>{c.icon}</span>
                  <span className={styles.itemLabel}>{c.label}</span>
                  {c.hint && <span className={styles.hint}>{c.hint}</span>}
                  {i === safeCursor && <CornerDownLeft size={14} className={styles.enter} aria-hidden />}
                </div>
              </li>
            );
          })}
        </ul>
        <footer className={cn('label', styles.footer)}>
          <span>
            <kbd className={styles.kbd}>↑</kbd> <kbd className={styles.kbd}>↓</kbd> выбор
          </span>
          <span>
            <kbd className={styles.kbd}>Enter</kbd> выполнить
          </span>
          <span className={styles.footerRight}>
            <kbd className={styles.kbd}>Ctrl</kbd> <kbd className={styles.kbd}>K</kbd>
          </span>
        </footer>
      </div>
    </dialog>
  );
}
