import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { errorMessage } from '@/lib/http';
import { cn } from '@/lib/cn';
import { Button } from '@/ui/Button';
import { TextField } from '@/ui/Field';
import { createDefaultCategories } from '@/features/categories/defaults';
import { useAuth } from './AuthProvider';
import { AuthLayout } from './AuthLayout';
import { PasswordField } from './PasswordField';
import { passwordScore, validateRegister, type RegisterInput } from './validation';
import styles from './AuthForm.module.css';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [v, setV] = useState<RegisterInput>({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<ReturnType<typeof validateRegister>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const score = passwordScore(v.password);

  const set = (k: keyof RegisterInput) => (e: ChangeEvent<HTMLInputElement>) => setV((x) => ({ ...x, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validateRegister(v);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    setError(null);
    try {
      const user = await register({ name: v.name, email: v.email, password: v.password });
      await createDefaultCategories(user.id).catch(() => undefined);
      navigate('/', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <AuthLayout index="NEW" subtitle="Займёт минуту" title="Аккаунт">
      <form className={styles.form} onSubmit={submit} noValidate>
        {error && (
          <div className={styles.alert} role="alert">
            {error}
          </div>
        )}
        <TextField label="Имя" autoComplete="name" autoFocus value={v.name} onChange={set('name')} error={errors.name} />
        <TextField label="Email" type="email" autoComplete="email" value={v.email} onChange={set('email')} error={errors.email} />
        <PasswordField label="Пароль" autoComplete="new-password" value={v.password} onChange={set('password')} error={errors.password} hint="8+ символов, буквы разного регистра и цифры" />
        {v.password && (
          <div className={cn(styles.strength, score < 2 && styles.weak)} aria-label={`Надёжность пароля: ${score} из 4`}>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={cn(i < score && styles.on)} />
            ))}
          </div>
        )}
        <PasswordField label="Повторите пароль" autoComplete="new-password" value={v.confirm} onChange={set('confirm')} error={errors.confirm} />
        <Button type="submit" variant="primary" size="lg" block loading={busy} iconRight={<ArrowRight size={16} />}>
          Создать аккаунт
        </Button>
        <p className={styles.switch}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
