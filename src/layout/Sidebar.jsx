import React, { useState } from 'react';
import './Sidebar.css';
// Пример иконок из react-icons (выбери подходящие)
import { LuLayoutDashboard, LuFileText, LuSettings, LuLifeBuoy, LuLogOut } from "react-icons/lu"; // Пример
import { FaCoins } from "react-icons/fa"; // Иконка для лого

const Sidebar = () => {
    const [activeItem, setActiveItem] = useState('Главная'); // Пример активного элемента

    const menuItems = [
        { id: 'Главная', name: 'Главная', icon: <LuLayoutDashboard size={20} /> },
        { id: 'Операции', name: 'Операции', icon: <LuFileText size={20} /> },
        // Добавь другие пункты меню по аналогии с референсом
        // { name: 'Invoices', icon: <SomeIcon /> },
        // { name: 'Your funds', icon: <SomeIcon /> },
        { id: 'Настройки', name: 'Настройки', icon: <LuSettings size={20} /> },
    ];

    const bottomMenuItems = [
        { id: 'Поддержка', name: 'Поддержка', icon: <LuLifeBuoy size={20} /> },
        { id: 'Выйти', name: 'Выйти', icon: <LuLogOut size={20} /> },
    ];

    return (
        <aside className="app-sidebar">
            <div className="sidebar-header">
                <FaCoins size={30} className="logo-icon" />
                <h1>Coinkeeper</h1>
            </div>
            <nav className="sidebar-nav">
                <ul>
                    {menuItems.map((item) => (
                        <li key={item.id}>
                            <a
                                href="#" // Замени на Link из react-router-dom в будущем
                                className={activeItem === item.id ? 'active' : ''}
                                onClick={() => setActiveItem(item.id)}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {item.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="sidebar-bottom">
                <ul>
                    {bottomMenuItems.map((item) => (
                        <li key={item.id}>
                            <a
                                href="#"
                                onClick={() => setActiveItem(item.id)} // Можно не менять активный для нижних
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {item.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;