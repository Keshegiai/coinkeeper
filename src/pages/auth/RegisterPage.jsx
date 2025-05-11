import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AuthPage.module.css';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

const PasswordStrengthIndicator = ({ password }) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]+/.test(password);
    const hasMinLength = password.length >= 8;

    const criteria = [
        { label: "Минимум 8 символов", met: hasMinLength },
        { label: "Одна заглавная буква", met: hasUpperCase },
        { label: "Одна строчная буква", met: hasLowerCase },
        { label: "Одна цифра", met: hasNumber },
        { label: "Один спецсимвол", met: hasSpecialChar },
    ];

    if (!password) return null;

    return (
        <div className={styles.passwordStrengthIndicator}>
            {criteria.map((criterion, index) => (
                <div key={index} className={`${styles.criterion} ${criterion.met ? styles.met : styles.unmet}`}>
                    {criterion.met ? <FiCheckCircle className={styles.iconMet} /> : <FiXCircle className={styles.iconUnmet} />}
                    <span>{criterion.label}</span>
                </div>
            ))}
        </div>
    );
};

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [passwordFocus, setPasswordFocus] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const validateEmail = (emailToValidate) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToValidate);
    };

    const validatePassword = (passwordToValidate) => {
        const errors = [];
        if (passwordToValidate.length < 8) {
            errors.push("Пароль должен быть не менее 8 символов.");
        }
        if (!/[A-Z]/.test(passwordToValidate)) {
            errors.push("Пароль должен содержать хотя бы одну заглавную букву.");
        }
        if (!/[a-z]/.test(passwordToValidate)) {
            errors.push("Пароль должен содержать хотя бы одну строчную букву.");
        }
        if (!/[0-9]/.test(passwordToValidate)) {
            errors.push("Пароль должен содержать хотя бы одну цифру.");
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]+/.test(passwordToValidate)) {
            errors.push("Пароль должен содержать хотя бы один специальный символ.");
        }
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name || !email || !password || !confirmPassword) {
            setError('Все поля обязательны для заполнения.');
            return;
        }
        if (!validateEmail(email)) {
            setError('Введите корректный email.');
            return;
        }

        const passwordValidationErrors = validatePassword(password);
        if (passwordValidationErrors.length > 0) {
            setError(passwordValidationErrors.join(' '));
            return;
        }

        if (password !== confirmPassword) {
            setError('Пароли не совпадают.');
            return;
        }

        setIsLoading(true);
        try {
            await register({ name, email, password });
            alert('Регистрация успешна! Теперь вы можете войти.');
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Ошибка регистрации. Возможно, пользователь с таким email уже существует.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authFormWrapper}>
                <h1 className={styles.authTitle}>Регистрация в Coinkeeper</h1>
                {error && <p className={styles.errorMessage}>{error}</p>}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name">Имя</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className={styles.inputField}
                        />
                    </div>
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
                            onFocus={() => setPasswordFocus(true)}
                            onBlur={() => setPasswordFocus(false)}
                            required
                            className={styles.inputField}
                        />
                        {passwordFocus && <PasswordStrengthIndicator password={password} />}
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword">Подтвердите пароль</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className={styles.inputField}
                        />
                    </div>
                    <button type="submit" className={styles.submitButton} disabled={isLoading}>
                        {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>
                <p className={styles.switchFormText}>
                    Уже есть аккаунт? <Link to="/login" className={styles.switchFormLink}>Войти</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;