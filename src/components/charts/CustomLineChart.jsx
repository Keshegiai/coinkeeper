import React from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';
import styles from './CustomLineChart.module.css';
import { useTheme } from '../../contexts/ThemeContext';

const CustomLineChart = ({ data, chartHeight = 300 }) => {
    const { theme } = useTheme();

    const yAxisFormatter = (value) => {
        if (value === 0) return '0';
        if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(0)}K`;
        return value.toString();
    };

    const xAxisDateFormatter = (dateString) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString;
            }
            return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
        } catch (error) {
            return dateString;
        }
    };

    const tooltipLabelFormatter = (label) => {
        try {
            const date = new Date(label);
            if (isNaN(date.getTime())) {
                return label;
            }
            return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        } catch (error) {
            return label;
        }
    };

    const incomeColor = theme === 'dark' ? 'var(--color-income-dark-theme, #34D399)' : 'var(--color-income-light-theme, #10b981)';
    const expensesColor = theme === 'dark' ? 'var(--color-expense-dark-theme, #F87171)' : 'var(--color-expense-light-theme, #ef4444)';
    const gridColor = theme === 'dark' ? 'var(--border-primary, #374151)' : 'var(--border-primary, #e5e7eb)';
    const axisTextColor = theme === 'dark' ? 'var(--text-tertiary, #9CA3AF)' : 'var(--text-tertiary, #6b7280)';
    const tooltipBg = theme === 'dark' ? 'var(--background-secondary, #1F2937)' : 'var(--background-secondary, #FFFFFF)';
    const tooltipBorder = theme === 'dark' ? 'var(--border-secondary, #4B5563)' : 'var(--border-primary, #e0e0e0)';
    const tooltipTextColor = theme === 'dark' ? 'var(--text-primary, #F9FAFB)' : 'var(--text-primary, #111827)';
    const tooltipLabelColor = theme === 'dark' ? 'var(--text-secondary, #D1D5DB)' : 'var(--text-secondary, #374151)';
    const legendTextColor = theme === 'dark' ? 'var(--text-secondary, #D1D5DB)' : 'var(--text-secondary, #374151)';


    if (!data || data.length === 0) {
        return (
            <div className={styles.noDataPlaceholder} style={{ height: `${chartHeight}px` }}>
                Нет данных для построения графика.
            </div>
        );
    }

    return (
        <div className={styles.chartWrapper} style={{ height: `${chartHeight}px` }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 25,
                        left: -20,
                        bottom: 30,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={xAxisDateFormatter}
                        fontSize={11}
                        stroke={axisTextColor}
                        axisLine={false}
                        tickLine={false}
                        angle={-35}
                        textAnchor="end"
                        dy={10}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        tickFormatter={yAxisFormatter}
                        fontSize={11}
                        stroke={axisTextColor}
                        axisLine={false}
                        tickLine={false}
                        width={50}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: tooltipBg,
                            border: `1px solid ${tooltipBorder}`,
                            borderRadius: '8px',
                            boxShadow: 'var(--shadow-modal)',
                            fontSize: '12px',
                            padding: '10px 14px',
                        }}
                        itemStyle={{ color: tooltipTextColor, paddingTop: '2px', paddingBottom: '2px' }}
                        labelStyle={{ color: tooltipLabelColor, fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}
                        formatter={(value, name) => [`$${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, name]}
                        labelFormatter={tooltipLabelFormatter}
                        cursor={{ stroke: axisTextColor, strokeWidth: 1, strokeDasharray: '3 3' }}
                    />
                    <Legend
                        verticalAlign="top"
                        height={36}
                        wrapperStyle={{fontSize: "13px", color: legendTextColor, paddingBottom: "10px"}}
                        iconSize={10}
                    />
                    <Line
                        type="monotone"
                        dataKey="income"
                        stroke={incomeColor}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: incomeColor, strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: incomeColor, stroke: tooltipBg, strokeWidth: 2 }}
                        name="Доход"
                    />
                    <Line
                        type="monotone"
                        dataKey="expenses"
                        stroke={expensesColor}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: expensesColor, strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: expensesColor, stroke: tooltipBg, strokeWidth: 2 }}
                        name="Расход"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CustomLineChart;