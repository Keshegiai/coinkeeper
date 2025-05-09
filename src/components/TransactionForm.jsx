import React, { useState, useEffect } from 'react';
import styles from './TransactionForm.module.css';

const TransactionForm = ({ onSubmit, onCancel, categories, addCategory, initialData }) => {
    const [type, setType] = useState(initialData?.type || 'expense');
    const [amount, setAmount] = useState(initialData?.amount || '');
    const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
    const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
    const [comment, setComment] = useState(initialData?.comment || '');
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        if (initialData) {
            setType(initialData.type);
            setAmount(initialData.amount);
            // Если initialData.category это объект {id, name}, а не просто id
            setCategoryId(initialData.categoryId || (initialData.category?.id || ''));
            setDate(initialData.date);
            setComment(initialData.comment);
        } else {
            // Сброс формы при открытии для новой транзакции
            setType('expense');
            setAmount('');
            setCategoryId('');
            setDate(new Date().toISOString().split('T')[0]);
            setComment('');
        }
        setShowNewCategoryInput(false);
        setNewCategoryName('');
    }, [initialData]);


    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0 || (!categoryId && !showNewCategoryInput) || (showNewCategoryInput && !newCategoryName.trim())) {
            alert('Пожалуйста, заполните тип, сумму и категорию.');
            return;
        }

        let finalCategoryId = categoryId;
        let finalCategoryName = categories.find(c => c.id === categoryId)?.name;

        if (showNewCategoryInput && newCategoryName.trim()) {
            const newCat = addCategory(newCategoryName.trim()); // addCategory должна вернуть {id, name}
            finalCategoryId = newCat.id;
            finalCategoryName = newCat.name;
        }

        onSubmit({
            id: initialData?.id, // для редактирования
            type,
            amount: parseFloat(amount),
            category: { id: finalCategoryId, name: finalCategoryName }, // Передаем объект категории
            date,
            comment,
        });
    };

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        if (value === 'add_new') {
            setShowNewCategoryInput(true);
            setCategoryId('');
        } else {
            setShowNewCategoryInput(false);
            setCategoryId(value);
        }
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
                <label htmlFor="category">Категория</label>
                {!showNewCategoryInput ? (
                    <select id="category" value={categoryId} onChange={handleCategoryChange} required={!showNewCategoryInput}>
                        <option value="" disabled>Выберите категорию</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                        <option value="add_new">-- Добавить новую --</option>
                    </select>
                ) : (
                    <div className={styles.newCategoryGroup}>
                        <input
                            type="text"
                            placeholder="Название новой категории"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            required={showNewCategoryInput}
                        />
                        <button type="button" onClick={() => {setShowNewCategoryInput(false); setCategoryId(categories[0]?.id || ''); }} className={styles.cancelNewCategory}>Отмена</button>
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
                <button type="submit" className={`${styles.button} ${styles.submitButton}`}>
                    {initialData ? 'Сохранить' : 'Добавить'}
                </button>
            </div>
        </form>
    );
};

export default TransactionForm;