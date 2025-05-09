import React, { useState, useMemo } from 'react';
import homePageStyles from './HomePage.module.css';
import styles from './CashFlowPage.module.css';
import DateRangeFilter from '../components/DateRangeFilter';
import CustomLineChart from '../components/charts/CustomLineChart'; // <--- ИМПОРТ НОВОГО КОМПОНЕНТА
// Импорты для PieChart (если будешь их реализовывать)
// import { PieChart, Pie, Cell, Tooltip, Legend as PieLegend } from 'recharts';

const CashFlowPage = ({ transactions = [] }) => {
    const getInitialDateRange = () => {
        const today = new Date();
        const endDate = today.toISOString().split('T')[0];
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        return { startDate, endDate };
    };

    const [dateRange, setDateRange] = useState(getInitialDateRange());

    const filteredTransactions = useMemo(() => {
        // ... (логика filteredTransactions остается без изменений) ...
        if (!dateRange.startDate || !dateRange.endDate) return transactions;
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= start && transactionDate <= end;
        });
    }, [transactions, dateRange]);

    const lineChartData = useMemo(() => {
        // ... (логика lineChartData остается без изменений) ...
        if (!filteredTransactions.length) return [];
        const dailyData = {};
        filteredTransactions.forEach(t => {
            const date = t.date;
            if (!dailyData[date]) {
                dailyData[date] = { income: 0, expenses: 0 };
            }
            if (t.type === 'income') {
                dailyData[date].income += t.amount;
            } else if (t.type === 'expense') {
                dailyData[date].expenses += t.amount;
            }
        });
        return Object.entries(dailyData)
            .map(([date, values]) => ({ date, ...values }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [filteredTransactions]);

    const processPieChartData = (type) => {
        // ... (логика processPieChartData остается) ...
        const relevantTransactions = filteredTransactions.filter(t => t.type === type);
        const dataMap = relevantTransactions.reduce((acc, transaction) => {
            const categoryName = transaction.category?.name || 'Без категории';
            acc[categoryName] = (acc[categoryName] || 0) + transaction.amount;
            return acc;
        }, {});
        return Object.entries(dataMap).map(([name, value]) => ({ name, value }));
    };

    const expenseDataForPieChart = useMemo(() => processPieChartData('expense'), [filteredTransactions]);
    const incomeDataForPieChart = useMemo(() => processPieChartData('income'), [filteredTransactions]);

    const handleFilterApply = (newDateRange) => {
        setDateRange(newDateRange);
    };

    return (
        <div className={homePageStyles.pageContentWrapper}>
            <div className={styles.pageHeader}>
                <h1 className={homePageStyles.pageMainTitle}>Аналитика Денежного Потока</h1>
            </div>

            <DateRangeFilter onFilterApply={handleFilterApply} />

            {/* Используем CustomLineChart */}
            <section className={`${styles.chartSection} ${styles.lineChartSectionCustom}`}> {/* Добавил кастомный класс для отступов если нужно */}
                <h2 className={styles.chartTitle}>Динамика доходов и расходов</h2>
                {/* Убрали chartContainerLarge, т.к. CustomLineChart имеет свой .chartWrapper */}
                <CustomLineChart data={lineChartData} chartHeight={350} /> {/* Задаем высоту для этой страницы */}
            </section>

            <div className={styles.chartsGrid}>
                <section className={styles.chartSection}>
                    <h2 className={styles.chartTitle}>Расходы по категориям</h2>
                    {expenseDataForPieChart.length > 0 ? (
                        <div className={styles.chartContainer}> {/* Оставляем для PieChart заглушек */}
                            <p>PieChart для расходов будет здесь. Данные:</p>
                            <pre>{JSON.stringify(expenseDataForPieChart, null, 2)}</pre>
                        </div>
                    ) : (
                        <p className={styles.noDataMessage}>Нет данных о расходах за выбранный период.</p>
                    )}
                </section>

                <section className={styles.chartSection}>
                    <h2 className={styles.chartTitle}>Доходы по категориям</h2>
                    {incomeDataForPieChart.length > 0 ? (
                        <div className={styles.chartContainer}>
                            <p>PieChart для доходов будет здесь. Данные:</p>
                            <pre>{JSON.stringify(incomeDataForPieChart, null, 2)}</pre>
                        </div>
                    ) : (
                        <p className={styles.noDataMessage}>Нет данных о доходах за выбранный период.</p>
                    )}
                </section>
            </div>
        </div>
    );
};

export default CashFlowPage;