import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import homePageStyles from './HomePage.module.css';
import styles from './CashFlowPage.module.css';
import DateRangeFilter from '../components/DateRangeFilter';
import CustomLineChart from '../components/charts/CustomLineChart';

const CashFlowPage = ({ transactions = [] }) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const getInitialDateRange = () => {
        const urlStartDate = searchParams.get('startDate');
        const urlEndDate = searchParams.get('endDate');

        if (urlStartDate && urlEndDate) {
            return { startDate: urlStartDate, endDate: urlEndDate };
        }

        const savedRange = localStorage.getItem('cashFlowDateRange');
        if (savedRange) {
            try {
                const parsedRange = JSON.parse(savedRange);
                if (parsedRange.startDate && parsedRange.endDate) {
                    return parsedRange;
                }
            } catch (e) {
                console.error("Failed to parse saved date range from localStorage", e);
            }
        }
        const today = new Date();
        const endDate = today.toISOString().split('T')[0];
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        return { startDate, endDate };
    };

    const [dateRange, setDateRange] = useState(getInitialDateRange());

    useEffect(() => {
        localStorage.setItem('cashFlowDateRange', JSON.stringify(dateRange));
        if (dateRange.startDate && dateRange.endDate) {
            setSearchParams({ startDate: dateRange.startDate, endDate: dateRange.endDate }, { replace: true });
        }
    }, [dateRange, setSearchParams]);

    const filteredTransactions = useMemo(() => {
        if (!dateRange.startDate || !dateRange.endDate) {
            return transactions;
        }
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
        if (!filteredTransactions || filteredTransactions.length === 0) return [];

        const dailyData = {};

        filteredTransactions.forEach(t => {
            const dateKey = new Date(t.date).toISOString().split('T')[0];
            if (!dailyData[dateKey]) {
                dailyData[dateKey] = { date: dateKey, income: 0, expenses: 0 };
            }
            if (t.type === 'income') {
                dailyData[dateKey].income += t.amount;
            } else if (t.type === 'expense') {
                dailyData[dateKey].expenses += t.amount;
            }
        });

        return Object.values(dailyData)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [filteredTransactions]);

    const processPieChartData = (type) => {
        if (!filteredTransactions || filteredTransactions.length === 0) return [];
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

            <DateRangeFilter
                onFilterApply={handleFilterApply}
                initialStartDate={dateRange.startDate}
                initialEndDate={dateRange.endDate}
            />

            <section className={`${styles.chartSection} ${styles.lineChartSectionCustom}`}>
                <h2 className={styles.chartTitle}>Динамика доходов и расходов</h2>
                <CustomLineChart data={lineChartData} chartHeight={350} />
            </section>

            <div className={styles.chartsGrid}>
                <section className={styles.chartSection}>
                    <h2 className={styles.chartTitle}>Расходы по категориям</h2>
                    {expenseDataForPieChart.length > 0 ? (
                        <div className={styles.chartContainer}>
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