import React from 'react';
import styles from './Header.module.css';
import { LuSearch, LuBell, LuMenu, LuLogOut, LuSun, LuMoon } from "react-icons/lu";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ toggleMobileSidebar }) => {
    const { currentUser, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className={styles.appHeader}>
            <div className={styles.headerLeft}>
                <button
                    className={`${styles.headerIconButton} ${styles.mobileMenuButton}`}
                    onClick={toggleMobileSidebar}
                    aria-label="Открыть меню"
                >
                    <LuMenu size={22} />
                </button>
            </div>
            <div className={styles.headerRight}>
                <button className={`${styles.headerIconButton} ${styles.searchButtonDesktop}`} aria-label="Search">
                    <LuSearch size={20} />
                </button>

                <button
                    className={styles.headerIconButton}
                    onClick={toggleTheme}
                    title={theme === 'light' ? 'Переключить на темную тему' : 'Переключить на светлую тему'}
                    aria-label="Переключить тему"
                >
                    {theme === 'light' ? <LuMoon size={20} /> : <LuSun size={20} />}
                </button>

                <button className={styles.headerIconButton} aria-label="Notifications">
                    <LuBell size={20} />
                </button>

                {currentUser ? (
                    <div className={styles.userProfileContainer}>
                        <FaUserCircle size={28} className={styles.userAvatarIcon} />
                        <span className={styles.userName}>{currentUser.name || currentUser.email}</span>
                        <button onClick={handleLogout} className={`${styles.headerIconButton} ${styles.logoutButton}`} title="Выйти">
                            <LuLogOut size={20} />
                        </button>
                    </div>
                ) : (
                    <Link to="/login" className={styles.loginLink}>Войти</Link>
                )}
            </div>
        </header>
    );
};

export default Header;