// src/components/charts/CustomLineChart.jsx
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
import styles from './CustomLineChart.module.css'; // Создадим этот файл для возможных стилей контейнера

// Цвета для линий графика (согласуем с легендой в CashFlowSummary)
const INCOME_COLOR = '#34D399';  // Зеленый/бирюзовый
const EXPENSES_COLOR = '#A0A3BD'; // Серо-голубой (как на скриншоте для линии расходов)
// Если хочешь более явный красный для расходов: const EXPENSES_COLOR = '#ef4444';

const CustomLineChart = ({ data, chartHeight = 300 }) => { // Принимаем данные и высоту как props
                                                           // Форматтер для оси Y (K для тысяч, M для миллионов)
    const yAxisFormatter = (value) => {
        if (value === 0) return '0';
        if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(0)}K`;
        return value.toString();
    };

    // Форматтер для даты на оси X (например, "14 Июл")
    const xAxisDateFormatter = (dateString) => {
        try {
            // Проверяем, является ли dateString валидной датой перед форматированием
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString; // Возвращаем исходную строку, если это не дата (например, 'Jul 14')
            }
            return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
        } catch (error) {
            return dateString; // Возвращаем исходную строку в случае ошибки
        }
    };

    // Форматтер для метки во всплывающей подсказке (Tooltip)
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
                        right: 25, // Немного места справа
                        left: -20, // Сдвигаем YAxis немного влево, если текст длинный
                        bottom: 30, // Больше места снизу для наклоненных дат
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={xAxisDateFormatter}
                        fontSize={11} // Чуть меньше шрифт для оси
                        stroke="#6b7280"
                        axisLine={false}
                        tickLine={false}
                        angle={-35} // Наклоняем подписи дат
                        textAnchor="end" // Выравнивание наклоненных подписей
                        dy={10} // Сдвиг вниз для наклоненных подписей
                        interval="preserveStartEnd" // Показываем первую и последнюю метку, остальные Recharts может пропускать
                    />
                    <YAxis
                        tickFormatter={yAxisFormatter}
                        fontSize={11}
                        stroke="#6b7280"
                        axisLine={false}
                        tickLine={false}
                        width={50} // Явно задаем ширину оси Y
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