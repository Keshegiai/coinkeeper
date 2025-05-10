import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import HomePage from './pages/HomePage';
import OperationsPage from './pages/OperationsPage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';
import LogoutPage from './pages/LogoutPage';
import CashFlowPage from './pages/CashFlowPage';

// Импортируем все функции API
import * as api from './services/api';

function App() {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Состояние загрузки
    const [error, setError] = useState(null);       // Состояние ошибки

    // Функция для загрузки всех данных
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [fetchedCategories, fetchedTransactions] = await Promise.all([
                api.getCategoriesAPI(),
                api.getTransactionsAPI(),
            ]);
            setCategories(fetchedCategories);
            setTransactions(fetchedTransactions);
        } catch (err) {
            console.error("Fetch data error:", err);
            setError(err.message || 'Не удалось загрузить данные');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Загружаем данные при первом рендере
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Функции для категорий ---
    const addCategory = async (categoryData) => { // categoryData = { name, icon, color } (icon, color - позже)
        try {
            // Проверка на существующую категорию по имени (можно оставить или убрать, если API это делает)
            const existingCategory = categories.find(cat => cat.name.toLowerCase() === categoryData.name.toLowerCase());
            if (existingCategory) {
                alert('Категория с таким именем уже существует!');
                return existingCategory; // Возвращаем существующую
            }

            const newCategory = await api.addCategoryAPI({ name: categoryData.name.trim(), icon: categoryData.icon || '', color: categoryData.color || '' });
            setCategories(prev => [...prev, newCategory]);
            return newCategory;
        } catch (err) {
            console.error("Add category error:", err);
            alert(`Ошибка добавления категории: ${err.message}`);
            // Возвращаем null или undefined в случае ошибки, чтобы форма знала
            return null;
        }
    };

    const updateCategory = async (categoryId, categoryData) => {
        try {
            // Проверка на дубликат имени при обновлении (если API не делает)
            const existingCategory = categories.find(cat =>
                cat.name.toLowerCase() === categoryData.name.toLowerCase() && cat.id !== categoryId
            );
            if (existingCategory) {
                alert('Категория с таким именем уже существует!');
                return false;
            }

            const updatedCat = await api.updateCategoryAPI(categoryId, categoryData);
            setCategories(prev => prev.map(cat => (cat.id === categoryId ? updatedCat : cat)));
            // Обновить категорию во всех транзакциях
            setTransactions(prevTs => prevTs.map(t =>
                t.category.id === categoryId ? { ...t, category: updatedCat } : t
            ));
            return true;
        } catch (err) {
            console.error("Update category error:", err);
            alert(`Ошибка обновления категории: ${err.message}`);
            return false;
        }
    };

    const deleteCategory = async (categoryId) => {
        try {
            const isCategoryUsed = transactions.some(t => t.category.id === categoryId);
            if (isCategoryUsed) {
                alert('Нельзя удалить категорию, так как она используется в транзакциях.');
                return;
            }
            await api.deleteCategoryAPI(categoryId);
            setCategories(prev => prev.filter(cat => cat.id !== categoryId));
        } catch (err) {
            console.error("Delete category error:", err);
            alert(`Ошибка удаления категории: ${err.message}`);
        }
    };

    // --- Функции для транзакций ---
    const addTransaction = async (transactionData) => {
        // transactionData = { type, amount, category (объект {id, name, icon, color}), date, comment }
        try {
            const newTransaction = await api.addTransactionAPI(transactionData);
            setTransactions(prev => [newTransaction, ...prev]); // Добавляем в начало списка
        } catch (err) {
            console.error("Add transaction error:", err);
            alert(`Ошибка добавления транзакции: ${err.message}`);
        }
    };

    const updateTransaction = async (transactionId, transactionData) => {
        try {
            const updatedTransaction = await api.updateTransactionAPI(transactionId, transactionData);
            setTransactions(prev => prev.map(t => (t.id === transactionId ? updatedTransaction : t)));
        } catch (err) {
            console.error("Update transaction error:", err);
            alert(`Ошибка обновления транзакции: ${err.message}`);
        }
    };

    const deleteTransaction = async (transactionId) => {
        try {
            await api.deleteTransactionAPI(transactionId);
            setTransactions(prev => prev.filter(t => t.id !== transactionId));
        } catch (err) {
            console.error("Delete transaction error:", err);
            alert(`Ошибка удаления транзакции: ${err.message}`);
        }
    };

    // Отображение загрузки или ошибки на все приложение (можно улучшить)
    if (isLoading) {
        return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5rem'}}>Загрузка данных...</div>;
    }
    if (error) {
        return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5rem', color: 'red'}}>Ошибка: {error}</div>;
    }

    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route
                    index
                    element={
                        <HomePage
                            transactions={transactions}
                            categories={categories}
                            addTransaction={addTransaction}
                            deleteTransaction={deleteTransaction}
                            updateTransaction={updateTransaction} // Передаем функцию обновления
                            addCategory={addCategory}
                        />
                    }
                />
                <Route path="operations" element={<OperationsPage transactions={transactions} categories={categories} />} />
                <Route path="cashflow" element={<CashFlowPage transactions={transactions} />} />
                <Route
                    path="settings"
                    element={
                        <SettingsPage
                            categories={categories}
                            addCategory={addCategory}
                            deleteCategory={deleteCategory}
                            updateCategory={updateCategory} // Передаем функцию обновления
                        />
                    }
                />
                <Route path="support" element={<SupportPage />} />
                <Route path="logout" element={<LogoutPage />} />
            </Route>
        </Routes>
    );
}

export default App;