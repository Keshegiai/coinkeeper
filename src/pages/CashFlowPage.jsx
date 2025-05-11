import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import homePageStyles from './HomePage.module.css';
import styles from './CashFlowPage.module.css';
import DateRangeFilter from '../components/DateRangeFilter';
import CustomLineChart from '../components/charts/CustomLineChart';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { logAction, logStateChange, logEffect } from '../utils/logger';


const COLORS_EXPENSE_DARK = ['#F472B6', '#EC4899', '#DB2777', '#BE185D', '#9D174D', '#831843'];
const COLORS_INCOME_DARK = ['#2DD4BF', '#34D399', '#10B981', '#059669', '#047857', '#065F46'];
const COLORS_EXPENSE_LIGHT = ['#EC4899', '#DB2777', '#BE185D', '#9D174D', '#831843', '#701A75'];
const COLORS_INCOME_LIGHT = ['#10B981', '#059669', '#047857', '#065F46', '#064E3B', '#022C22'];


const CustomPieChart = ({ data, title, type }) => {
    const { theme } = useTheme();
    const COLORS = type === 'expense'
        ? (theme === 'dark' ? COLORS_EXPENSE_DARK : COLORS_EXPENSE_LIGHT)
        : (theme === 'dark' ? COLORS_INCOME_DARK : COLORS_INCOME_LIGHT);

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent * 100 < 7) return null;

        return (
            <text x={x} y={y} fill={theme === 'dark' ? 'var(--background-secondary)' : '#FFFFFF'} textAnchor="middle" dominantBaseline="central" fontSize="10px" fontWeight="bold">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const legendPayload = data.map((entry, index) => ({
        value: `${entry.name} (${entry.value.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })})`,
        type: 'square',
        id: entry.name,
        color: COLORS[index % COLORS.length],
    }));

    const legendTextColor = theme === 'dark' ? 'var(--text-secondary)' : 'var(--text-secondary)';


    if (!data || data.length === 0) {
        return <p className={styles.noDataMessage}>Нет данных о {type === 'expense' ? 'расходах' : 'доходах'} за выбранный период.</p>;
    }

    return (
        <div className={styles.pieChartWrapper}>
            <h2 className={styles.chartTitle}>{title}</h2>
            <ResponsiveContainer width="100%" height={350}>
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        innerRadius={40}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        paddingAngle={1}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={theme === 'dark' ? 'var(--background-secondary)' : 'var(--background-secondary)'} strokeWidth={1}/>
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value, name) => [value.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }), name]}
                        contentStyle={{
                            backgroundColor: theme === 'dark' ? 'var(--background-tertiary)' : 'var(--background-secondary)',
                            borderColor: theme === 'dark' ? 'var(--border-secondary)' : 'var(--border-primary)',
                            color: theme === 'dark' ? 'var(--text-primary)' : 'var(--text-primary)',
                        }}
                    />
                    <Legend
                        payload={legendPayload}
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        iconSize={10}
                        wrapperStyle={{ color: legendTextColor, fontSize: '12px', lineHeight: '20px', paddingLeft: '20px' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};


const CashFlowPage = ({ transactions = [] }) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const getInitialDateRange = () => {
        const urlStartDate = searchParams.get('startDate');
        const urlEndDate = searchParams.get('endDate');
        const urlAllTime = searchParams.get('allTime');

        if (urlAllTime === 'true') {
            return { startDate: '', endDate: '', allTime: true };
        }

        if (urlStartDate && urlEndDate) {
            return { startDate: urlStartDate, endDate: urlEndDate, allTime: false };
        }

        const today = new Date();
        const endDate = today.toISOString().split('T')[0];
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        return { startDate, endDate, allTime: false };
    };

    const [dateRange, setDateRange] = useState(getInitialDateRange());

    useEffect(() => {
        logEffect('CashFlowPage', 'URL Sync Effect', {dateRange});
        const params = {};
        if (dateRange.allTime) {
            params.allTime = 'true';
        } else {
            if (dateRange.startDate) params.startDate = dateRange.startDate;
            if (dateRange.endDate) params.endDate = dateRange.endDate;
        }
        setSearchParams(params, { replace: true });
    }, [dateRange, setSearchParams]);

    const filteredTransactions = useMemo(() => {
        logEffect('CashFlowPage', 'Memo: filteredTransactions', { numTransactions: transactions.length, dateRange });
        if (dateRange.allTime || (!dateRange.startDate && !dateRange.endDate)) {
            return transactions;
        }
        if (!dateRange.startDate || !dateRange.endDate) {
            return [];
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
        logEffect('CashFlowPage', 'Memo: lineChartData', { numFilteredTransactions: filteredTransactions.length });
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
        logEffect('CashFlowPage', `Memo: processPieChartData (${type})`, { numFilteredTransactions: filteredTransactions.length });
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
        logAction('CashFlowPage', 'handleFilterApply', { newDateRange });
        setDateRange(prev => {
            const newState = { ...newDateRange, allTime: !newDateRange.startDate && !newDateRange.endDate };
            logStateChange('CashFlowPage', 'dateRange', newState, prev);
            return newState;
        });
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
                <CustomLineChart data={lineChartData} chartHeight={350} />
            </section>

            <div className={styles.chartsGrid}>
                <section className={styles.chartSection}>
                    <CustomPieChart data={expenseDataForPieChart} title="Расходы по категориям" type="expense" />
                </section>

                <section className={styles.chartSection}>
                    <CustomPieChart data={incomeDataForPieChart} title="Доходы по категориям" type="income" />
                </section>
            </div>
        </div>
    );
};

export default CashFlowPage;