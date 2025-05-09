import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import './MainLayout.css'; // Создадим этот файл для стилей позже

const MainLayout = ({ children }) => {
    return (
        <div className="app-container">
            <Sidebar />
            <div className="main-content-area">
                <Header />
                <main className="content">
                    {children} {/* Здесь будет отображаться содержимое страницы */}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;