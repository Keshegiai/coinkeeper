import React from 'react';
import { useNavigate } from 'react-router-dom';
import compStyles from './CashFlowSummary.module.css';
import pageStyles from '../pages/HomePage.module.css';
import CustomLineChart from './charts/CustomLineChart';

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
            title="Посмотреть детальную статистику"
        >
            <div className={`${pageStyles.sectionHeader} ${compStyles.sectionHeader}`}>
                <h2 className={pageStyles.sectionTitle}>Your cash flow</h2>
                <div className={compStyles.sectionControls}>
                    <span className={`${compStyles.cashFlowLegend} ${compStyles.income}`}>
                        <span className={compStyles.legendDot}></span>Income
                    </span>
                    <span className={`${compStyles.cashFlowLegend} ${compStyles.expenses}`}>
                        <span className={compStyles.legendDot}></span>Expenses
                    </span>
                    <select
                        className={compStyles.timeFilterDropdown}
                        defaultValue="this_month"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Выберите период"
                    >
                        <option value="this_month">This month</option>
                        <option value="last_7_days">Last 7 days</option>
                        <option value="last_30_days">Last 30 days</option>
                    </select>
                </div>
            </div>

            <CustomLineChart data={chartData} chartHeight={260} />

        </section>
    );
};

export default CashFlowSummary;