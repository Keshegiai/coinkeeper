import React, { useState, useEffect } from 'react';
import styles from './DateRangeFilter.module.css';

const DateRangeFilter = ({ onFilterApply, initialStartDate, initialEndDate }) => {
    const [startDate, setStartDate] = useState(initialStartDate || '');
    const [endDate, setEndDate] = useState(initialEndDate || '');
    const [isAllTime, setIsAllTime] = useState(!initialStartDate && !initialEndDate);

    useEffect(() => {
        setStartDate(initialStartDate || '');
        setEndDate(initialEndDate || '');
        setIsAllTime(!initialStartDate && !initialEndDate);
    }, [initialStartDate, initialEndDate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isAllTime) {
            onFilterApply({ startDate: '', endDate: '' });
        } else if (startDate && endDate && new Date(startDate) <= new Date(endDate)) {
            onFilterApply({ startDate, endDate });
        } else {
            alert('Пожалуйста, выберите корректный диапазон дат или опцию "За все время".');
        }
    };

    const handleAllTimeChange = (e) => {
        const checked = e.target.checked;
        setIsAllTime(checked);
        if (checked) {
            setStartDate('');
            setEndDate('');
            onFilterApply({ startDate: '', endDate: '' });
        } else {
            const today = new Date();
            const defaultEndDate = today.toISOString().split('T')[0];
            const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
            setStartDate(defaultStartDate);
            setEndDate(defaultEndDate);
            onFilterApply({ startDate: defaultStartDate, endDate: defaultEndDate });
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
                    onChange={(e) => { setStartDate(e.target.value); setIsAllTime(false); }}
                    className={styles.dateInput}
                    required={!isAllTime}
                    disabled={isAllTime}
                />
            </div>
            <div className={styles.inputGroup}>
                <label htmlFor="endDate">По:</label>
                <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setIsAllTime(false); }}
                    className={styles.dateInput}
                    required={!isAllTime}
                    disabled={isAllTime}
                />
            </div>
            <div className={styles.allTimeToggle}>
                <input
                    type="checkbox"
                    id="allTime"
                    checked={isAllTime}
                    onChange={handleAllTimeChange}
                />
                <label htmlFor="allTime">За все время</label>
            </div>
            {!isAllTime && (
                <button type="submit" className={styles.applyButton}>Применить</button>
            )}
        </form>
    );
};

export default DateRangeFilter;