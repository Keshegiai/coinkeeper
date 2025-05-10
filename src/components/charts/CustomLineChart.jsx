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

const INCOME_COLOR = '#34D399';
const EXPENSES_COLOR = '#A0A3BD';


const CustomLineChart = ({ data, chartHeight = 300 }) => {
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={xAxisDateFormatter}
                        fontSize={11}
                        stroke="#6b7280"
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
                        stroke="#6b7280"
                        axisLine={false}
                        tickLine={false}
                        width={50}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                            fontSize: '12px',
                            padding: '10px 14px',
                        }}
                        itemStyle={{ color: '#111827', paddingTop: '2px', paddingBottom: '2px' }}
                        labelStyle={{ color: '#374151', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}
                        formatter={(value, name) => [`$${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, name]}
                        labelFormatter={tooltipLabelFormatter}
                    />
                    <Legend
                        verticalAlign="top"
                        height={36}
                        wrapperStyle={{fontSize: "13px", color: "#374151"}}
                        iconSize={10}
                    />
                    <Line
                        type="monotone"
                        dataKey="income"
                        stroke={INCOME_COLOR}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: INCOME_COLOR, strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: INCOME_COLOR, stroke: '#fff', strokeWidth: 2 }}
                        name="Доход"
                    />
                    <Line
                        type="monotone"
                        dataKey="expenses"
                        stroke={EXPENSES_COLOR}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: EXPENSES_COLOR, strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: EXPENSES_COLOR, stroke: '#fff', strokeWidth: 2 }}
                        name="Расход"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CustomLineChart;