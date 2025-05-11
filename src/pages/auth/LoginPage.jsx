import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AuthPage.module.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        if (!email || !password) {
            setError('Email и пароль обязательны для заполнения.');
            setIsLoading(false);
            return;
        }
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Ошибка входа. Проверьте учетные данные.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authFormWrapper}>
                <h1 className={styles.authTitle}>Вход в Coinkeeper</h1>
                {error && <p className={styles.errorMessage}>{error}</p>}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={styles.inputField}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="password">Пароль</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={styles.inputField}
                        />
                    </div>
                    <button type="submit" className={styles.submitButton} disabled={isLoading}>
                        {isLoading ? 'Вход...' : 'Войти'}
                    </button>
                </form>
                <p className={styles.switchFormText}>
                    Еще нет аккаунта? <Link to="/register" className={styles.switchFormLink}>Зарегистрироваться</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;