import React, { useState, useEffect } from 'react';
import styles from './DateRangeFilter.module.css';

const DateRangeFilter = ({ onFilterApply, initialStartDate, initialEndDate }) => {
    const [startDate, setStartDate] = useState(initialStartDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(initialEndDate || new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (initialStartDate) {
            setStartDate(initialStartDate);
        }
        if (initialEndDate) {
            setEndDate(initialEndDate);
        }
    }, [initialStartDate, initialEndDate]);

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