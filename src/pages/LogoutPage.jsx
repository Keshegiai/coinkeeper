import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './HomePage.module.css';
import { logAction } from '../utils/logger';

const LogoutPage = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        logAction('LogoutPage', 'User Logout Sequence Started');
        logout();
        navigate('/login');
    }, [logout, navigate]);

    return (
        <div className={styles.pageContentWrapper}>
            <h1 className={styles.pageMainTitle}>Выход...</h1>
            <p>Вы будете перенаправлены на страницу входа.</p>
        </div>
    );
};

export default LogoutPage;