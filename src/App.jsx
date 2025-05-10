import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import HomePage from './pages/HomePage';
import OperationsPage from './pages/OperationsPage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';
import LogoutPage from './pages/LogoutPage';
import CashFlowPage from './pages/CashFlowPage';
import * as api from './services/api';

function App() {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const sortTransactions = (ts) => {
        return ts.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);

            if (dateB.getTime() !== dateA.getTime()) {
                return dateB.getTime() - dateA.getTime();
            }
            return (b.createdAt || 0) - (a.createdAt || 0);
        });
    };

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [fetchedCategories, fetchedTransactions] = await Promise.all([
                api.getCategoriesAPI(),
                api.getTransactionsAPI(),
            ]);
            setCategories(fetchedCategories || []);
            setTransactions(fetchedTransactions || []);
        } catch (err) {
            console.error("Fetch data error:", err);
            setError(err.message || 'Не удалось загрузить данные');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addCategory = async (categoryDataFromForm) => {
        try {
            const existingCategory = categories.find(cat => cat.name.toLowerCase() === categoryDataFromForm.name.toLowerCase());
            if (existingCategory) {
                alert('Категория с таким именем уже существует!');
                return existingCategory;
            }
            const categoryToSend = {
                name: categoryDataFromForm.name.trim(),
                icon: categoryDataFromForm.icon || "LuShapes",
                color: categoryDataFromForm.color || "#808080"
            };
            const newCategory = await api.addCategoryAPI(categoryToSend);
            setCategories(prev => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
            return newCategory;
        } catch (err) {
            console.error("Add category error:", err);
            alert(`Ошибка добавления категории: ${err.message}`);
            return null;
        }
    };

    const updateCategory = async (categoryId, categoryDataFromForm) => {
        try {
            const existingCategoryByName = categories.find(cat =>
                cat.name.toLowerCase() === categoryDataFromForm.name.toLowerCase() && cat.id !== categoryId
            );
            if (existingCategoryByName) {
                alert('Категория с таким именем уже существует!');
                return false;
            }
            const categoryToUpdate = categories.find(cat => cat.id === categoryId);
            if (!categoryToUpdate) {
                alert('Категория для обновления не найдена');
                return false;
            }
            const dataToSend = {
                name: categoryDataFromForm.name.trim(),
                icon: categoryDataFromForm.icon !== undefined ? categoryDataFromForm.icon : categoryToUpdate.icon,
                color: categoryDataFromForm.color !== undefined ? categoryDataFromForm.color : categoryToUpdate.color,
            };
            const updatedCat = await api.updateCategoryAPI(categoryId, dataToSend);
            const updatedCategories = categories.map(cat => (cat.id === categoryId ? updatedCat : cat)).sort((a, b) => a.name.localeCompare(b.name));
            setCategories(updatedCategories);
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
                alert('Нельзя удалить категорию, так как она используется в транзакциях. Сначала измените или удалите соответствующие транзакции.');
                return;
            }
            await api.deleteCategoryAPI(categoryId);
            setCategories(prev => prev.filter(cat => cat.id !== categoryId));
        } catch (err) {
            console.error("Delete category error:", err);
            alert(`Ошибка удаления категории: ${err.message}`);
        }
    };

    const addTransaction = async (formDataFromComponent) => {
        try {
            const categoryObject = categories.find(c => c.id === formDataFromComponent.category.id);
            if (!categoryObject) {
                alert('Выбранная категория не найдена! Пожалуйста, выберите категорию из списка или создайте новую.');
                return;
            }
            const transactionDataForAPI = {
                type: formDataFromComponent.type,
                amount: formDataFromComponent.amount,
                category: categoryObject,
                date: formDataFromComponent.date,
                comment: formDataFromComponent.comment,
                createdAt: Date.now()
            };
            const newTransaction = await api.addTransactionAPI(transactionDataForAPI);
            setTransactions(prev => sortTransactions([newTransaction, ...prev]));
        } catch (err) {
            console.error("Add transaction error:", err);
            alert(`Ошибка добавления транзакции: ${err.message}`);
        }
    };

    const updateTransaction = async (transactionId, formDataFromComponent) => {
        try {
            const categoryObject = categories.find(c => c.id === formDataFromComponent.category.id);
            if (!categoryObject) {
                alert('Выбранная категория не найдена! Пожалуйста, выберите категорию из списка или создайте новую.');
                return;
            }
            const transactionToUpdate = transactions.find(t => t.id === transactionId);
            if (!transactionToUpdate) {
                alert('Транзакция для обновления не найдена');
                return;
            }
            const transactionDataForAPI = {
                type: formDataFromComponent.type,
                amount: formDataFromComponent.amount,
                category: categoryObject,
                date: formDataFromComponent.date,
                comment: formDataFromComponent.comment,
                createdAt: transactionToUpdate.createdAt
            };
            const updatedTransaction = await api.updateTransactionAPI(transactionId, transactionDataForAPI);
            setTransactions(prev => sortTransactions(prev.map(t => (t.id === transactionId ? updatedTransaction : t))));
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
                            updateTransaction={updateTransaction}
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
                            updateCategory={updateCategory}
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