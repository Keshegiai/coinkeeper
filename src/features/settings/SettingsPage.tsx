import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Download, LogOut, Monitor, Moon, Sun } from 'lucide-react';
import { CURRENCIES, type Currency } from '@/domain/types';
import { useAuth, useUser } from '@/features/auth/AuthProvider';
import { useFinanceData } from '@/features/useFinanceData';
import { transactionsToCsv, downloadFile } from '@/lib/csv';
import { CURRENCY_META } from '@/lib/money';
import { today } from '@/lib/date';
import { Button, buttonClass } from '@/ui/Button';
import { PageHeader } from '@/ui/PageHeader';
import { Panel } from '@/ui/Panel';
import { Segmented } from '@/ui/Segmented';
import { useConfirm } from '@/ui/Confirm';
import { usePreferences, type ThemePref } from './PreferencesProvider';
import styles from './SettingsPage.module.css';

const SHORTCUTS = [
  ['Ctrl K', 'Поиск и команды'],
  ['N', 'Новая операция'],
  ['/', 'Поиск по операциям'],
  ['Esc', 'Закрыть окно'],
  ['← →', 'Навигация по графику'],
];

export function SettingsPage() {
  const user = useUser();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { theme, setTheme, currency, setCurrency } = usePreferences();
  const { transactions, categoryMap } = useFinanceData();

  const onLogout = async () => {
    if (await confirm({ title: 'Выйти из аккаунта?', confirmLabel: 'Выйти' })) {
      logout();
      navigate('/login', { replace: true });
    }
  };

  return (
    <>
      <PageHeader index="06" subtitle="Профиль и интерфейс" title="Настройки" />
      <div className={styles.grid}>
        <Panel index="01" title="Профиль" className={styles.profile}>
          <div className={styles.user}>
            <span className={styles.avatar}>
              <span className="dot-num">{(user.name || user.email).charAt(0).toUpperCase()}</span>
            </span>
            <div className={styles.userText}>
              <span className={styles.userName}>{user.name || 'Без имени'}</span>
              <span className="label">{user.email}</span>
            </div>
          </div>
          <Button variant="danger" icon={<LogOut size={14} />} onClick={onLogout}>
            Выйти
          </Button>
        </Panel>

        <Panel index="02" title="Оформление">
          <Row title="Тема" hint="Системная следует настройкам устройства">
            <Segmented<ThemePref>
              label="Тема"
              value={theme}
              onChange={setTheme}
              options={[
                { value: 'system', label: <Monitor size={14} />, title: 'Системная' },
                { value: 'light', label: <Sun size={14} />, title: 'Светлая' },
                { value: 'dark', label: <Moon size={14} />, title: 'Тёмная' },
              ]}
            />
          </Row>
          <Row title="Валюта" hint="Символ в интерфейсе. Суммы не конвертируются.">
            <Segmented<Currency>
              label="Валюта"
              value={currency}
              onChange={setCurrency}
              options={CURRENCIES.map((c) => ({ value: c, label: CURRENCY_META[c].symbol, title: CURRENCY_META[c].label }))}
            />
          </Row>
        </Panel>

        <Panel index="03" title="Данные">
          <Row title="Категории и бюджеты" hint="Иконки, цвета и месячные лимиты">
            <Link to="/categories" className={buttonClass()}>
              Открыть <ArrowRight size={14} />
            </Link>
          </Row>
          <Row title="Экспорт" hint={`${transactions.length} операций в CSV (UTF-8, открывается в Excel)`}>
            <Button
              icon={<Download size={14} />}
              disabled={!transactions.length}
              onClick={() => downloadFile(`coinkeeper-all-${today()}.csv`, transactionsToCsv(transactions, categoryMap))}
            >
              Скачать
            </Button>
          </Row>
        </Panel>

        <Panel index="04" title="Горячие клавиши">
          <ul className={styles.shortcuts}>
            {SHORTCUTS.map(([k, v]) => (
              <li key={k}>
                <kbd>{k}</kbd>
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <p className={styles.version}>
        <span className="dot-num">COINKEEPER</span> <span className="label">v2.1</span>
      </p>
    </>
  );
}

function Row({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className={styles.row}>
      <div>
        <p className={styles.rowTitle}>{title}</p>
        {hint && <p className={styles.rowHint}>{hint}</p>}
      </div>
      {children}
    </div>
  );
}
