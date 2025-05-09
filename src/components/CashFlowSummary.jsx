import React from 'react';
import { useNavigate } from 'react-router-dom';
import compStyles from './CashFlowSummary.module.css';
import pageStyles from '../pages/HomePage.module.css';
import CustomLineChart from './charts/CustomLineChart'; // <--- ИМПОРТ НОВОГО КОМПОНЕНТА

const CashFlowSummary = ({ chartData = [] }) => {
    const navigate = useNavigate();

    const handleChartClick = () => {
        navigate('/cashflow');
    };

    return (
        <section
            className={`${pageStyles.dashboardSection} ${compStyles.cashFlowSummarySection}`}
            onClick={handleChartClick}
            style={{ cursor: 'pointer' }}
            title="Посмотреть детальную статистику" // Добавим title для подсказки
        >
            <div className={`${pageStyles.sectionHeader} ${compStyles.sectionHeader}`}>
                <h2 className={pageStyles.sectionTitle}>Your cash flow</h2>
                <div className={compStyles.sectionControls}>
                    {/* Статичная легенда над графиком */}
                    <span className={`${compStyles.cashFlowLegend} ${compStyles.income}`}>
            <span className={compStyles.legendDot}></span>Income
          </span>
                    <span className={`${compStyles.cashFlowLegend} ${compStyles.expenses}`}>
            <span className={compStyles.legendDot}></span>Expenses
          </span>
                    <select
                        className={compStyles.timeFilterDropdown}
                        defaultValue="last_week"
                        onClick={(e) => e.stopPropagation()} // Предотвращаем навигацию при клике на select
                        aria-label="Выберите период"
                    >
                        <option value="last_week">Last week</option>
                        <option value="last_month">Last month</option>
                    </select>
                </div>
            </div>

            {/* Используем CustomLineChart */}
            {/* Убрали compStyles.chartContainerForSummary, т.к. CustomLineChart.jsx имеет свой .chartWrapper */}
            <CustomLineChart data={chartData} chartHeight={260} /> {/* Уменьшим высоту для главной */}

        </section>
    );
};

export default CashFlowSummary;