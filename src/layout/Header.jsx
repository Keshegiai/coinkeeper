import React from 'react';
import './Header.css';
import { LuSearch, LuBell, LuUserCircle2 } from "react-icons/lu"; // Иконки

const Header = () => {
    return (
        <header className="app-header">
            <div className="header-left">
                {/* Можно добавить что-то сюда, если понадобится, например, хлебные крошки */}
            </div>
            <div className="header-right">
                <button className="header-icon-button">
                    <LuSearch size={22} />
                </button>
                <button className="header-icon-button">
                    <LuBell size={22} />
                    <span className="notification-badge">3</span> {/* Пример значка уведомления */}
                </button>
                <div className="user-profile">
                    <LuUserCircle2 size={32} /> {/* Или img для аватара */}
                    <div className="user-info">
                        <span className="user-name">Максим Кириевски</span> {/* Пример из референса */}
                        {/* <span className="user-role">Admin</span> */}
                    </div>
                    {/* Здесь можно добавить выпадающее меню по клику */}
                </div>
            </div>
        </header>
    );
};

export default Header;