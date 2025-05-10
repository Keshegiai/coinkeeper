import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';
import {
    LuLayoutDashboard,
    LuFileText,
    LuSettings,
    LuLifeBuoy,
    LuLogOut,
    LuX
} from "react-icons/lu";
import { FaCoins } from "react-icons/fa";
import { FiActivity } from "react-icons/fi";

const Sidebar = ({ isMobileSidebarOpen, closeMobileSidebar }) => {
    const menuItems = [
        { name: 'Главная', icon: <LuLayoutDashboard size={20} />, path: '/' },
        { name: 'Операции', icon: <LuFileText size={20} />, path: '/operations' },
        { name: 'Cash Flow', icon: <FiActivity size={20} />, path: '/cashflow' },
        { name: 'Настройки', icon: <LuSettings size={20} />, path: '/settings' },
    ];

    const bottomMenuItems = [
        { name: 'Поддержка', icon: <LuLifeBuoy size={20} />, path: '/support' },
        { name: 'Выйти', icon: <LuLogOut size={20} />, path: '/logout' },
    ];

    return (
        <aside className={`${styles.appSidebar} ${isMobileSidebarOpen ? styles.mobileOpen : ''} ${styles.forMobile}`}>
            <div className={styles.sidebarHeader}>
                <button className={styles.mobileCloseButton} onClick={closeMobileSidebar} aria-label="Закрыть меню">
                    <LuX size={24} />
                </button>
                <FaCoins size={28} className={styles.logoIcon} />
                <h1>Coinkeeper</h1>
            </div>

            <nav className={styles.sidebarNav}>
                <ul>
                    {menuItems.map((item) => (
                        <li key={item.name}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                                }
                                title={item.name}
                                onClick={isMobileSidebarOpen ? closeMobileSidebar : undefined}
                            >
                                <span className={styles.navIcon}>{item.icon}</span>
                                <span className={styles.navLinkText}>{item.name}</span>
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
                                title={item.name}
                                onClick={isMobileSidebarOpen ? closeMobileSidebar : undefined}
                            >
                                <span className={styles.navIcon}>{item.icon}</span>
                                <span className={styles.navLinkText}>{item.name}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;