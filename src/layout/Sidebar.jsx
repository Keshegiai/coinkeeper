import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css'; // Импортируем CSS-модуль

// Убедись, что все используемые иконки импортированы и работают
import {
    LuLayoutDashboard,
    LuFileText,
    LuSettings,
    LuLifeBuoy,
    LuLogOut
} from "react-icons/lu";
import { FaCoins } from "react-icons/fa";
// Используй рабочую иконку для Cash Flow, например FiActivity, если LuAreaChart не работает
import { FiActivity } from "react-icons/fi";


const Sidebar = () => {
    const menuItems = [
        { name: 'Главная', icon: <LuLayoutDashboard size={20} />, path: '/' },
        { name: 'Операции', icon: <LuFileText size={20} />, path: '/operations' },
        { name: 'Cash Flow', icon: <FiActivity size={20} />, path: '/cashflow' }, // Используем FiActivity или другую рабочую иконку
        { name: 'Настройки', icon: <LuSettings size={20} />, path: '/settings' },
    ];

    const bottomMenuItems = [
        { name: 'Поддержка', icon: <LuLifeBuoy size={20} />, path: '/support' },
        { name: 'Выйти', icon: <LuLogOut size={20} />, path: '/logout' },
    ];

    return (
        <aside className={styles.appSidebar}>
            <div className={styles.sidebarHeader}>
                <FaCoins size={28} className={styles.logoIcon} />
                <h1>Coinkeeper</h1> {/* h1 будет стилизован через .sidebarHeader h1 в CSS-модуле */}
            </div>

            <nav className={styles.sidebarNav}>
                <ul>
                    {menuItems.map((item) => (
                        <li key={item.name}>
                            <NavLink
                                to={item.path}
                                // Применяем базовый класс и условно класс 'active'
                                className={({ isActive }) =>
                                    isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                                }
                            >
                                <span className={styles.navIcon}>{item.icon}</span>
                                {item.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className={styles.sidebarBottom}>
                <ul>
                    {bottomMenuItems.map((item) => (
                        <li key={item.name}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                                }
                            >
                                <span className={styles.navIcon}>{item.icon}</span>
                                {item.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;