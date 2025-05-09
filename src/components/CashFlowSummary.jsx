import React from 'react';
import compStyles from './CashFlowSummary.module.css'; // Стили этого компонента
// Используем правильный путь для импорта стилей со страницы HomePage
import pageStyles from '../pages/HomePage.module.css'; // <--- ВОТ ИСПРАВЛЕНИЕ

const CashFlowSummary = () => {
    return (
        // Применяем общий класс секции из HomePage и специфичный класс для этой секции
        <section className={`${pageStyles.dashboardSection} ${compStyles.cashFlowSummarySection}`}>
            {/* Используем pageStyles для классов, определенных в HomePage.module.css */}
            <div className={`${pageStyles.sectionHeader} ${compStyles.sectionHeader}`}>
                <h2 className={pageStyles.sectionTitle}>Your cash flow</h2>
                <div className={compStyles.sectionControls}>
          <span className={`${compStyles.cashFlowLegend} ${compStyles.income}`}>
            <span className={compStyles.legendDot}></span>Income
          </span>
                    <span className={`${compStyles.cashFlowLegend} ${compStyles.expenses}`}>
            <span className={compStyles.legendDot}></span>Expenses
          </span>
                    <select className={compStyles.timeFilterDropdown} defaultValue="last_week">
                        <option value="last_week">Last week</option>
                        <option value="last_month">Last month</option>
                        <option value="last_3_months">Last 3 months</option>
                        <option value="all_time">All time</option>
                    </select>
                </div>
            </div>
            <div className={compStyles.chartPlaceholderSummary}>
                Chart Placeholder (e.g., Line Chart)
            </div>
        </section>
    );
};

export default CashFlowSummary;