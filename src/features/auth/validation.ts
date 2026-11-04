export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** 0..4 — length, mixed case, digit, symbol. */
export function passwordScore(p: string): number {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (/[a-zа-я]/.test(p) && /[A-ZА-Я]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^\p{L}\d]/u.test(p)) s++;
  return s;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirm: string;
}

export function validateRegister(v: RegisterInput) {
  const e: Partial<Record<keyof RegisterInput, string>> = {};
  if (!v.name.trim()) e.name = 'Как к вам обращаться?';
  if (!EMAIL_RE.test(v.email.trim())) e.email = 'Некорректный email';
  if (v.password.length < 8) e.password = 'Минимум 8 символов';
  else if (passwordScore(v.password) < 2) e.password = 'Добавьте цифры, заглавные буквы или символы';
  if (v.confirm !== v.password) e.confirm = 'Пароли не совпадают';
  return e;
}
