import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Currency } from '@/domain/types';
import { CURRENCIES } from '@/domain/types';
import { formatMoney } from '@/lib/money';
import { storage } from '@/lib/storage';
import { switchTheme } from '@/lib/themeTransition';

export type ThemePref = 'system' | 'light' | 'dark';

interface Prefs {
  theme: ThemePref;
  resolvedTheme: 'light' | 'dark';
  currency: Currency;
  setTheme: (t: ThemePref) => void;
  setCurrency: (c: Currency) => void;
  money: (value: number, opts?: { signed?: boolean; compact?: boolean }) => string;
}

const PrefsContext = createContext<Prefs | null>(null);
const media = () => window.matchMedia('(prefers-color-scheme: dark)');

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePref>(() => storage.get<ThemePref>('ck.theme', 'system'));
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const c = storage.get<string>('ck.currency', 'KZT');
    return (CURRENCIES as readonly string[]).includes(c) ? (c as Currency) : 'KZT';
  });
  const [systemDark, setSystemDark] = useState(() => media().matches);

  useEffect(() => {
    const m = media();
    // Only animates when the app follows the system theme (otherwise nothing visible changes).
    const onChange = (e: MediaQueryListEvent) =>
      storage.get<ThemePref>('ck.theme', 'system') === 'system' ? switchTheme(e.matches ? 'dark' : 'light', () => setSystemDark(e.matches)) : setSystemDark(e.matches);
    m.addEventListener('change', onChange);
    return () => m.removeEventListener('change', onChange);
  }, []);

  const resolvedTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
  }, [resolvedTheme]);

  const setTheme = useCallback((t: ThemePref) => {
    storage.set('ck.theme', t);
    const next = t === 'system' ? (media().matches ? 'dark' : 'light') : t;
    switchTheme(next, () => setThemeState(t));
  }, []);
  const setCurrency = useCallback((c: Currency) => {
    storage.set('ck.currency', c);
    setCurrencyState(c);
  }, []);
  const money = useCallback<Prefs['money']>((v, opts) => formatMoney(v, currency, opts), [currency]);

  const value = useMemo(
    () => ({ theme, resolvedTheme, currency, setTheme, setCurrency, money }),
    [theme, resolvedTheme, currency, setTheme, setCurrency, money],
  );
  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error('usePreferences must be used within <PreferencesProvider>');
  return ctx;
}
