import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { errorMessage } from '@/lib/http';
import { Button } from '@/ui/Button';
import { TextField } from '@/ui/Field';
import { useAuth } from './AuthProvider';
import { AuthLayout } from './AuthLayout';
import { PasswordField } from './PasswordField';
import { EMAIL_RE } from './validation';
import styles from './AuthForm.module.css';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const fe: typeof fieldErrors = {};
    if (!EMAIL_RE.test(email.trim())) fe.email = 'Некорректный email';
    if (!password) fe.password = 'Введите пароль';
    setFieldErrors(fe);
    if (Object.keys(fe).length) return;
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      const from = (location.state as { from?: { pathname: string; search?: string } } | null)?.from;
      navigate(from ? `${from.pathname}${from.search ?? ''}` : '/', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <AuthLayout index="IN" subtitle="С возвращением" title="Вход">
      <form className={styles.form} onSubmit={submit} noValidate>
        {error && (
          <div className={styles.alert} role="alert">
            {error}
          </div>
        )}
        <TextField label="Email" type="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} error={fieldErrors.email} />
        <PasswordField label="Пароль" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={fieldErrors.password} />
        <Button type="submit" variant="primary" size="lg" block loading={busy} iconRight={<ArrowRight size={16} />}>
          Войти
        </Button>
        <p className={styles.switch}>
          Нет аккаунта? <Link to="/register">Создать</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
