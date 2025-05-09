import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { LuLayoutDashboard, LuFileText, LuSettings, LuLifeBuoy, LuLogOut } from "react-icons/lu";
import { FaCoins } from "react-icons/fa"; // Или другая иконка для лого

const Sidebar = () => {
    const menuItems = [
        { name: 'Главная', icon: <LuLayoutDashboard size={20} />, path: '/' },
        { name: 'Операции', icon: <LuFileText size={20} />, path: '/operations' },
        { name: 'Настройки', icon: <LuSettings size={20} />, path: '/settings' },
    ];

    const bottomMenuItems = [
        { name: 'Поддержка', icon: <LuLifeBuoy size={20} />, path: '/support' },
        { name: 'Выйти', icon: <LuLogOut size={20} />, path: '/logout' },
    ];

    return (
        <aside className="app-sidebar">
            <div className="sidebar-header">
                <FaCoins size={28} className="logo-icon" /> {/* Размер лого иконки */}
                <h1>Coinkeeper</h1>
            </div>
            <nav className="sidebar-nav">
                <ul>
                    {menuItems.map((item) => (
                        <li key={item.name}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => (isActive ? 'active' : '')}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {item.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="sidebar-bottom">
                <ul>
                    {bottomMenuItems.map((item) => (
                        <li key={item.name}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => (isActive ? 'active-bottom-item' : '')} // Можно использовать другой класс для активного состояния нижних, если нужно
                            >
                                <span className="nav-icon">{item.icon}</span>
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