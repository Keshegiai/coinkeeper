import { Moon, Sun } from 'lucide-react';
import { usePreferences } from '@/features/settings/PreferencesProvider';
import { Button } from '@/ui/Button';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = usePreferences();
  const next = resolvedTheme === 'dark' ? 'light' : 'dark';
  return (
    <Button
      variant="ghost"
      size="sm"
      icon={resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      onClick={() => setTheme(next)}
      aria-label={next === 'dark' ? 'Включить тёмную тему' : 'Включить светлую тему'}
      title="Тема"
    />
  );
}
