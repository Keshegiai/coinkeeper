import React, { useState } from 'react';
import styles from './DateRangeFilter.module.css';

const DateRangeFilter = ({ onFilterApply }) => {
    // Устанавливаем начальные значения: первый день текущего месяца и текущий день
    const getInitialStartDate = () => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    };
    const getInitialEndDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    const [startDate, setStartDate] = useState(getInitialStartDate());
    const [endDate, setEndDate] = useState(getInitialEndDate());

    const handleSubmit = (e) => {
        e.preventDefault();
        if (startDate && endDate && new Date(startDate) <= new Date(endDate)) {
            onFilterApply({ startDate, endDate });
        } else {
            alert('Пожалуйста, выберите корректный диапазон дат.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.filterContainer}>
            <div className={styles.inputGroup}>
                <label htmlFor="startDate">С:</label>
                <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={styles.dateInput}
                    required
                />
            </div>
            <div className={styles.inputGroup}>
                <label htmlFor="endDate">По:</label>
                <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={styles.dateInput}
                    required
                />
            </div>
            <button type="submit" className={styles.applyButton}>Применить</button>
        </form>
    );
};

export default DateRangeFilter;