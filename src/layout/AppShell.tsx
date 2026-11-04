import { NavLink, Outlet, Link } from 'react-router-dom';
import { ChartColumn, LayoutGrid, List, Plus, Tag } from 'lucide-react';
import { useTransactionEditor } from '@/features/transactions/TransactionEditor';
import { useAuth } from '@/features/auth/AuthProvider';
import { Button } from '@/ui/Button';
import { cn } from '@/lib/cn';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import styles from './AppShell.module.css';

const NAV = [
  { to: '/', label: 'Обзор', code: '01', icon: LayoutGrid, end: true },
  { to: '/transactions', label: 'Операции', code: '02', icon: List },
  { to: '/analytics', label: 'Аналитика', code: '03', icon: ChartColumn },
  { to: '/categories', label: 'Категории', code: '04', icon: Tag },
] as const;

export function AppShell() {
  const { openNew } = useTransactionEditor();
  const { user } = useAuth();
  const initial = (user?.name || user?.email || '?').trim().charAt(0).toUpperCase();

  return (
    <div className={styles.shell}>
      <a href="#main" className={styles.skip}>
        К содержимому
      </a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.brand} aria-label="Coinkeeper — на главную">
            <Logo />
          </Link>

          <nav className={styles.nav} aria-label="Основная навигация">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={'end' in item} className={({ isActive }) => cn(styles.navLink, isActive && styles.active)}>
                <span className={styles.navCode}>{item.code}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className={styles.actions}>
            <Button variant="accent" size="sm" icon={<Plus size={14} />} onClick={() => openNew()} className={styles.addDesktop} title="Новая операция (N)">
              Операция
            </Button>
            <ThemeToggle />
            <NavLink
              to="/settings"
              className={({ isActive }) => cn(styles.avatar, isActive && styles.avatarActive)}
              aria-label="Настройки профиля"
              title="Настройки"
            >
              <span className="dot-num">{initial}</span>
            </NavLink>
          </div>
        </div>
      </header>

      <main id="main" className={styles.main}>
        <Outlet />
      </main>

      <nav className={styles.bottomNav} aria-label="Навигация">
        {NAV.slice(0, 2).map((item) => (
          <BottomLink key={item.to} {...item} />
        ))}
        <button className={styles.fab} onClick={() => openNew()} aria-label="Новая операция">
          <Plus size={24} strokeWidth={2} />
        </button>
        {NAV.slice(2).map((item) => (
          <BottomLink key={item.to} {...item} />
        ))}
      </nav>
    </div>
  );
}

function BottomLink({ to, label, icon: Icon, ...rest }: (typeof NAV)[number]) {
  return (
    <NavLink to={to} end={'end' in rest} className={({ isActive }) => cn(styles.bottomLink, isActive && styles.bottomActive)}>
      <Icon size={20} strokeWidth={1.6} aria-hidden />
      <span>{label}</span>
    </NavLink>
  );
}

