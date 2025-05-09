import React from 'react';
import styles from './Header.module.css'; // <--- ИЗМЕНЕНИЕ ИМПОРТА
import { LuSearch, LuBell, LuChevronDown } from "react-icons/lu";
import { FaUserCircle } from "react-icons/fa";

const Header = () => {
    return (
        <header className={styles.appHeader}> {/* <--- ИСПОЛЬЗОВАНИЕ СТИЛЕЙ */}
            <div className={styles.headerLeft}>
            </div>
            <div className={styles.headerRight}>
                <button className={styles.headerIconButton} aria-label="Search">
                    <LuSearch size={20} />
                </button>
                <button className={styles.headerIconButton} aria-label="Notifications">
                    <LuBell size={20} />
                    <span className={styles.notificationBadge}>3</span>
                </button>
                <div className={styles.userProfileContainer}>
                    <FaUserCircle size={28} className={styles.userAvatarIcon} />
                    <span className={styles.userName}>Maksim Kirievski</span>
                    <button className={`${styles.headerIconButton} ${styles.userProfileDropdown}`} aria-label="User menu"> {/* <--- Несколько классов */}
                        <LuChevronDown size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;