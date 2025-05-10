import React from 'react';
import styles from './Header.module.css';
import { LuSearch, LuBell, LuChevronDown, LuMenu } from "react-icons/lu"; // <--- Добавляем LuMenu
import { FaUserCircle } from "react-icons/fa";

// Принимаем toggleMobileSidebar как проп
const Header = ({ toggleMobileSidebar }) => {
    return (
        <header className={styles.appHeader}>
            <div className={styles.headerLeft}>
                {/* Кнопка "бургер" для мобильных */}
                <button
                    className={`${styles.headerIconButton} ${styles.mobileMenuButton}`}
                    onClick={toggleMobileSidebar}
                    aria-label="Открыть меню"
                >
                    <LuMenu size={22} />
                </button>
                {/* Сюда можно вернуть название страницы или хлебные крошки, если они нужны на десктопе */}
            </div>
            <div className={styles.headerRight}>
                <button className={`${styles.headerIconButton} ${styles.searchButtonDesktop}`} aria-label="Search"> {/* Добавим класс для скрытия на мобильных если нужно */}
                    <LuSearch size={20} />
                </button>
                <button className={styles.headerIconButton} aria-label="Notifications">
                    <LuBell size={20} />
                    <span className={styles.notificationBadge}>3</span>
                </button>
                <div className={styles.userProfileContainer}>
                    <FaUserCircle size={28} className={styles.userAvatarIcon} />
                    <span className={styles.userName}>Maksim Kirievski</span> {/* Этот текст можно скрыть на очень маленьких экранах */}
                    <button className={`${styles.headerIconButton} ${styles.userProfileDropdown}`} aria-label="User menu">
                        <LuChevronDown size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;