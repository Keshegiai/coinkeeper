import React, { useState, useEffect, useRef } from 'react';
import Select, { components } from 'react-select';
import styles from './TransactionForm.module.css';
import { FiPlusCircle } from 'react-icons/fi';

const TransactionForm = ({ onSubmit, onCancel, categories, addCategory, initialData }) => {
    const [type, setType] = useState(initialData?.type || 'expense');
    const [amount, setAmount] = useState(initialData?.amount || '');

    const getInitialCategoryOption = (data, cats) => {
        if (data?.category) {
            return { value: data.category.id, label: data.category.name, color: data.category.color };
        }
        if (data?.categoryId) {
            const foundCat = cats.find(c => c.id === data.categoryId);
            if (foundCat) {
                return { value: foundCat.id, label: foundCat.name, color: foundCat.color };
            }
        }
        return null;
    };

    const [selectedCategoryOption, setSelectedCategoryOption] = useState(() => getInitialCategoryOption(initialData, categories));

    const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
    const [comment, setComment] = useState(initialData?.comment || '');

    const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryColor, setNewCategoryColor] = useState('#808080');
    const [isAddingCategory, setIsAddingCategory] = useState(false);

    const newCategoryNameInputRef = useRef(null);

    useEffect(() => {
        if (initialData) {
            setType(initialData.type);
            setAmount(initialData.amount);
            setSelectedCategoryOption(getInitialCategoryOption(initialData, categories));
            setDate(initialData.date);
            setComment(initialData.comment);
        } else {
            setType('expense');
            setAmount('');
            setSelectedCategoryOption(null);
            setDate(new Date().toISOString().split('T')[0]);
            setComment('');
        }
        setShowNewCategoryForm(false);
        setNewCategoryName('');
        setNewCategoryColor('#808080');
        setIsAddingCategory(false);
    }, [initialData, categories]);

    useEffect(() => {
        if (showNewCategoryForm && newCategoryNameInputRef.current) {
            newCategoryNameInputRef.current.focus();
        }
    }, [showNewCategoryForm]);

    const categoryOptions = categories.map(cat => ({
        value: cat.id,
        label: cat.name,
        color: cat.color || '#cccccc'
    }));

    const handleAddNewCategoryToggle = () => {
        setShowNewCategoryForm(!showNewCategoryForm);
        if (!showNewCategoryForm) {
            setSelectedCategoryOption(null);
        }
    };

    const handleSaveNewCategory = async () => {
        if (!newCategoryName.trim()) {
            alert('Название новой категории не может быть пустым.');
            return;
        }
        setIsAddingCategory(true);
        const newCatData = {
            name: newCategoryName.trim(),
            color: newCategoryColor,
        };
        const addedCategory = await addCategory(newCatData);
        setIsAddingCategory(false);

        if (addedCategory) {
            const newOption = { value: addedCategory.id, label: addedCategory.name, color: addedCategory.color };
            setSelectedCategoryOption(newOption);
            setShowNewCategoryForm(false);
            setNewCategoryName('');
            setNewCategoryColor('#808080');
        } else {
            alert('Не удалось создать категорию. Возможно, категория с таким именем уже существует или произошла ошибка API.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) {
            alert('Пожалуйста, введите корректную сумму.');
            return;
        }
        if (!selectedCategoryOption || !selectedCategoryOption.value) {
            alert('Пожалуйста, выберите категорию.');
            return;
        }

        const finalCategoryObject = {
            id: selectedCategoryOption.value,
            name: selectedCategoryOption.label,
            color: selectedCategoryOption.color
        };

        onSubmit({
            id: initialData?.id,
            type,
            amount: parseFloat(amount),
            category: finalCategoryObject,
            categoryId: finalCategoryObject.id,
            date,
            comment,
        });
    };

    const formatOptionLabel = ({ label, color }) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{
                backgroundColor: color,
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                marginRight: '8px',
                display: 'inline-block',
                border: '1px solid var(--border-primary)'
            }}></span>
            {label}
        </div>
    );

    const customReactSelectStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: 'var(--background-secondary)',
            borderColor: state.isFocused ? 'var(--border-accent)' : 'var(--border-secondary)',
            boxShadow: state.isFocused ? `0 0 0 1px var(--border-accent)` : 'none',
            '&:hover': {
                borderColor: state.isFocused ? 'var(--border-accent)' : 'var(--border-secondary)',
            },
            color: 'var(--text-primary)',
            transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: 'var(--background-secondary)',
            color: 'var(--text-primary)',
            zIndex: 3,
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? 'var(--text-accent)' : state.isFocused ? 'var(--background-tertiary)' : 'var(--background-secondary)',
            color: state.isSelected ? 'var(--text-on-accent)' : 'var(--text-primary)',
            '&:active': {
                backgroundColor: 'var(--text-accent)',
            },
            display: 'flex',
            alignItems: 'center',
        }),
        singleValue: (base, state) => ({
            ...base,
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center'
        }),
        input: (base) => ({
            ...base,
            color: 'var(--text-primary)',
        }),
        placeholder: (base) => ({
            ...base,
            color: 'var(--text-tertiary)',
        }),
        clearIndicator: (base, state) => ({
            ...base,
            color: state.isFocused ? 'var(--text-accent)' : 'var(--text-tertiary)',
            '&:hover': {
                color: state.isFocused ? 'var(--text-accent)' : 'var(--text-primary)',
            }
        }),
        dropdownIndicator: (base, state) => ({
            ...base,
            color: state.isFocused ? 'var(--text-accent)' : 'var(--text-tertiary)',
            '&:hover': {
                color: state.isFocused ? 'var(--text-accent)' : 'var(--text-primary)',
            }
        }),
        indicatorSeparator: (base) => ({
            ...base,
            backgroundColor: 'var(--border-secondary)',
        }),
        noOptionsMessage: (base) => ({
            ...base,
            color: 'var(--text-tertiary)',
        }),
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.typeToggle}>
                <button
                    type="button"
                    className={`${styles.toggleButton} ${type === 'expense' ? styles.activeExpense : ''}`}
                    onClick={() => setType('expense')}
                >
                    Расход
                </button>
                <button
                    type="button"
                    className={`${styles.toggleButton} ${type === 'income' ? styles.activeIncome : ''}`}
                    onClick={() => setType('income')}
                >
                    Доход
                </button>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="amount">Сумма</label>
                <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="category-select">Категория</label>
                {!showNewCategoryForm ? (
                    <>
                        <Select
                            id="category-select"
                            options={categoryOptions}
                            value={selectedCategoryOption}
                            onChange={setSelectedCategoryOption}
                            placeholder="Выберите категорию..."
                            formatOptionLabel={formatOptionLabel}
                            styles={customReactSelectStyles}
                            isClearable
                            noOptionsMessage={(obj) => obj.inputValue ? 'Категория не найдена' : 'Нет доступных категорий'}
                        />
                        <button
                            type="button"
                            onClick={handleAddNewCategoryToggle}
                            className={styles.toggleNewCategoryButton}
                        >
                            <FiPlusCircle size={14} style={{ marginRight: '4px' }} />
                            Добавить новую категорию
                        </button>
                    </>
                ) : (
                    <div className={styles.newCategoryForm}>
                        <input
                            type="text"
                            ref={newCategoryNameInputRef}
                            placeholder="Название новой категории"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className={styles.newCategoryInput}
                            required
                        />
                        <div className={styles.newCategoryColorAndActions}>
                            <div className={styles.newCategoryColorPickerInline}>
                                <label htmlFor="newCatColorFormInline">Цвет:</label>
                                <input
                                    type="color"
                                    id="newCatColorFormInline"
                                    value={newCategoryColor}
                                    onChange={(e) => setNewCategoryColor(e.target.value)}
                                    className={styles.inlineColorInputSmall}
                                />
                            </div>
                            <div className={styles.newCategoryButtons}>
                                <button
                                    type="button"
                                    onClick={handleSaveNewCategory}
                                    className={`${styles.buttonSmall} ${styles.saveButtonSmall}`}
                                    disabled={isAddingCategory}
                                >
                                    {isAddingCategory ? 'Сохранение...' : 'Сохранить'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddNewCategoryToggle}
                                    className={`${styles.buttonSmall} ${styles.cancelButtonSmall}`}
                                    disabled={isAddingCategory}
                                >
                                    Отмена
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="date">Дата</label>
                <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="comment">Комментарий (необязательно)</label>
                <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="3"
                ></textarea>
            </div>

            <div className={styles.formActions}>
                <button type="button" onClick={onCancel} className={`${styles.button} ${styles.cancelButton}`}>
                    Отмена
                </button>
                <button type="submit" className={`${styles.button} ${styles.submitButton}`} disabled={isAddingCategory}>
                    {initialData ? 'Сохранить' : 'Добавить'}
                </button>
            </div>
        </form>
    );
};

export default TransactionForm;