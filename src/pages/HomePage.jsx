import React from 'react';
import './HomePage.css'; // Стили для этой страницы

const HomePage = () => {
    return (
        <div className="page-content-wrapper"> {/* Общий контейнер для контента страницы */}
            <h1 className="page-main-title">Your dashboard</h1>
            <p>Основное содержимое Coinkeeper будет здесь.</p>
            {/* Здесь будут карточки, графики и т.д. */}

            {/* Пример будущих секций */}
            {/*
      <div className="widgets-grid">
        <div className="widget-card">
          <h3>Cash balance</h3>
          <p className="widget-amount">$3240.21</p>
        </div>
        <div className="widget-card">
          <h3>Total spent</h3>
          <p className="widget-amount">$250.80</p>
        </div>
        <div className="widget-card">
          <h3>Savings</h3>
          <p className="widget-amount">$810.32</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2 className="section-title">Your cash flow</h2>
        {/* График здесь */}
            {/*</div>
      */}
        </div>
    );
};

export default HomePage;