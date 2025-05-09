import React from 'react';
import './HomePage.module.css'; // Можем переиспользовать стили для обертки и заголовка

const CashFlowPage = () => {
    return (
        <div className="page-content-wrapper"> {/* Используем класс из HomePage.module.css */}
            <h1 className="page-main-title">Аналитика Денежного Потока</h1> {/* Используем класс из HomePage.module.css */}
            <p>Здесь будет отображаться подробная статистика, фильтры и графики по вашему денежному потоку.</p>
            <div className="chart-placeholder" style={{height: '400px', marginTop: '2rem'}}>
                Placeholder for Detailed Cash Flow Charts and Data
            </div>
        </div>
    );
};

export default CashFlowPage;