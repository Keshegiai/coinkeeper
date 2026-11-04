import { useState, type ComponentProps } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { TextField } from '@/ui/Field';
import styles from './AuthForm.module.css';

export function PasswordField(props: Omit<ComponentProps<typeof TextField>, 'type' | 'trailing'>) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      trailing={
        <button type="button" className={styles.eye} onClick={() => setVisible((v) => !v)} aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'}>
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      }
    />
  );
}
