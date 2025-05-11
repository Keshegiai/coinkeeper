import React, { useState, useEffect } from 'react';
import styles from './DateRangeFilter.module.css';
import { LuCalendarDays } from 'react-icons/lu';

const DateRangeFilter = ({ onFilterApply, initialStartDate, initialEndDate, showPresets = true }) => {
    const [startDate, setStartDate] = useState(initialStartDate || '');
    const [endDate, setEndDate] = useState(initialEndDate || '');
    const [activePreset, setActivePreset] = useState('');

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const calculatePresetDates = (preset) => {
        let newStart = '';
        let newEnd = '';
        const todayForCalc = new Date();
        const todayStrForCalc = todayForCalc.toISOString().split('T')[0];

        switch (preset) {
            case 'last7days': {
                const sevenDaysAgo = new Date(todayForCalc);
                sevenDaysAgo.setDate(todayForCalc.getDate() - 6);
                newStart = sevenDaysAgo.toISOString().split('T')[0];
                newEnd = todayStrForCalc;
                break;
            }
            case 'thisMonth': {
                const firstDayOfMonth = new Date(todayForCalc.getFullYear(), todayForCalc.getMonth(), 1);
                newStart = firstDayOfMonth.toISOString().split('T')[0];
                newEnd = todayStrForCalc;
                break;
            }
            case 'allTime': {
                newStart = '';
                newEnd = '';
                break;
            }
            default:
                break;
        }
        return { startDate: newStart, endDate: newEnd };
    };

    useEffect(() => {
        if (initialStartDate === '' && initialEndDate === '') {
            setActivePreset('allTime');
        } else {
            const thisMonthDates = calculatePresetDates('thisMonth');
            if (initialStartDate === thisMonthDates.startDate && initialEndDate === thisMonthDates.endDate) {
                setActivePreset('thisMonth');
            } else {
                const last7DaysDates = calculatePresetDates('last7days');
                if (initialStartDate === last7DaysDates.startDate && initialEndDate === last7DaysDates.endDate) {
                    setActivePreset('last7days');
                } else if (initialStartDate && initialEndDate) {
                    setActivePreset('custom');
                } else {
                    setActivePreset('');
                }
            }
        }
        setStartDate(initialStartDate || '');
        setEndDate(initialEndDate || '');
    }, [initialStartDate, initialEndDate]);


    const handlePresetClick = (preset) => {
        setActivePreset(preset);
        const dates = calculatePresetDates(preset);
        setStartDate(dates.startDate);
        setEndDate(dates.endDate);
        onFilterApply(dates);
    };

    const handleDateChange = (date, type) => {
        setActivePreset('custom');
        if (type === 'start') {
            setStartDate(date);
        } else {
            setEndDate(date);
        }
    };

    const applyCustomRange = () => {
        if (startDate && endDate && new Date(startDate) <= new Date(endDate)) {
            onFilterApply({ startDate, endDate });
            setActivePreset('custom');
        } else if (startDate && endDate) {
            alert('Дата начала не может быть позже даты окончания.');
        } else {
            alert('Пожалуйста, выберите обе даты для пользовательского диапазона.');
        }
    };

    return (
        <div className={styles.filterContainer}>
            {showPresets && (
                <div className={styles.presetButtons}>
                    <button
                        type="button"
                        onClick={() => handlePresetClick('last7days')}
                        className={`${styles.presetButton} ${activePreset === 'last7days' ? styles.active : ''}`}
                    >
                        За 7 дней
                    </button>
                    <button
                        type="button"
                        onClick={() => handlePresetClick('thisMonth')}
                        className={`${styles.presetButton} ${activePreset === 'thisMonth' ? styles.active : ''}`}
                    >
                        За месяц
                    </button>
                    <button
                        type="button"
                        onClick={() => handlePresetClick('allTime')}
                        className={`${styles.presetButton} ${activePreset === 'allTime' ? styles.active : ''}`}
                    >
                        За все время
                    </button>
                </div>
            )}
            <div className={styles.dateInputsContainer}>
                <div className={styles.dateInputGroup}>
                    <label htmlFor="startDateFilter" className={styles.dateInputLabel}>С:</label>
                    <div className={styles.inputWithIcon}>
                        <input
                            type="date"
                            id="startDateFilter"
                            value={startDate}
                            onChange={(e) => handleDateChange(e.target.value, 'start')}
                            className={styles.dateInput}
                            disabled={activePreset === 'allTime'}
                            max={endDate || todayStr}
                        />
                        <LuCalendarDays className={styles.dateInputIcon} />
                    </div>
                </div>
                <div className={styles.dateInputGroup}>
                    <label htmlFor="endDateFilter" className={styles.dateInputLabel}>По:</label>
                    <div className={styles.inputWithIcon}>
                        <input
                            type="date"
                            id="endDateFilter"
                            value={endDate}
                            onChange={(e) => handleDateChange(e.target.value, 'end')}
                            className={styles.dateInput}
                            disabled={activePreset === 'allTime'}
                            min={startDate || undefined}
                            max={todayStr}
                        />
                        <LuCalendarDays className={styles.dateInputIcon} />
                    </div>
                </div>
                {(activePreset === 'custom' && startDate && endDate) && (
                    <button type="button" onClick={applyCustomRange} className={styles.applyButton}>Применить</button>
                )}
            </div>
        </div>
    );
};

export default DateRangeFilter;