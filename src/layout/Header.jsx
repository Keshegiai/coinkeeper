import React from 'react';
import './Header.css';
import { LuSearch, LuBell, LuChevronDown } from "react-icons/lu"; // LuChevronDown для выпадающего списка
import { FaUserCircle } from "react-icons/fa"; // Используем эту иконку пользователя

const Header = () => {
    return (
        <header className="app-header">
            <div className="header-left">
                {/* Здесь может быть, например, название текущей страницы или хлебные крошки, если понадобится */}
            </div>
            <div className="header-right">
                <button className="header-icon-button" aria-label="Search">
                    <LuSearch size={20} /> {/* Размер иконки */}
                </button>
                <button className="header-icon-button" aria-label="Notifications">
                    <LuBell size={20} />
                    <span className="notification-badge">3</span>
                </button>
                <div className="user-profile-container">
                    <FaUserCircle size={28} className="user-avatar-icon" /> {/* Размер аватара */}
                    <span className="user-name">Maksim Kirievski</span> {/* Имя из скриншота */}
                    <button className="header-icon-button user-profile-dropdown" aria-label="User menu">
                        <LuChevronDown size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;