import React from 'react';
import './HomePage.css'; // Создадим файл стилей

const HomePage = () => {
    return (
        <div className="homepage-content">
            <h1 className="page-title">Your dashboard</h1>
            <p>Основное содержимое Coinkeeper будет здесь.</p>
            {/* Здесь будут карточки, графики и т.д. */}
        </div>
    );
};

export default HomePage;