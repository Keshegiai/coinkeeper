import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import HomePage from './pages/HomePage';
import OperationsPage from './pages/OperationsPage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';
import LogoutPage from './pages/LogoutPage';
import CashFlowPage from './pages/CashFlowPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import * as api from './services/api';

function App() {
    const { currentUser, isAuthenticated, isLoadingAuth } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isAppDataLoading, setIsAppDataLoading] = useState(true);
    const [error, setError] = useState(null);

    const sortTransactions = useCallback((ts) => {
        if (!Array.isArray(ts)) return [];
        return [...ts].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateB.getTime() !== dateA.getTime()) {
                return dateB.getTime() - dateA.getTime();
            }
            return (b.createdAt || 0) - (a.createdAt || 0);
        });
    }, []);

    const fetchData = useCallback(async () => {
        if (!isAuthenticated || !currentUser?.id) {
            setIsAppDataLoading(false);
            setTransactions([]);
            setCategories([]);
            return;
        }
        setIsAppDataLoading(true);
        setError(null);
        try {
            const [fetchedCategories, fetchedTransactions] = await Promise.all([
                api.getCategoriesAPI(),
                api.getTransactionsAPI(),
            ]);
            setCategories(Array.isArray(fetchedCategories) ? fetchedCategories : []);
            setTransactions(sortTransactions(fetchedTransactions));
        } catch (err) {
            setError(err.message || 'Не удалось загрузить данные');
        } finally {
            setIsAppDataLoading(false);
        }
    }, [isAuthenticated, currentUser, sortTransactions]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addCategory = useCallback(async (categoryDataFromForm) => {
        if (!currentUser?.id) {
            alert("Ошибка: Пользователь не определен для добавления категории.");
            return null;
        }
        try {
            const existingCategory = categories.find(cat =>
                cat.name.toLowerCase() === categoryDataFromForm.name.toLowerCase() && cat.userId === currentUser.id
            );
            if (existingCategory) {
                alert('Категория с таким именем уже существует у вас.');
                return null;
            }
            const categoryToSend = {
                name: categoryDataFromForm.name.trim(),
                icon: categoryDataFromForm.icon || "LuShapes",
                color: categoryDataFromForm.color || "#808080",
            };
            const newCategory = await api.addCategoryAPI(categoryToSend);
            if (newCategory) {
                setCategories(prev => [...prev, newCategory]);
            }
            return newCategory;
        } catch (err) {
            alert(`Ошибка добавления категории: ${err.message}`);
            return null;
        }
    }, [currentUser, categories]);

    const updateCategory = useCallback(async (categoryId, categoryDataFromForm) => {
        if (!currentUser?.id) {
            alert("Ошибка: Пользователь не определен для обновления категории.");
            return false;
        }
        try {
            const existingCategoryByName = categories.find(cat =>
                cat.name.toLowerCase() === categoryDataFromForm.name.toLowerCase() &&
                cat.id !== categoryId &&
                cat.userId === currentUser.id
            );
            if (existingCategoryByName) {
                alert('Категория с таким именем уже существует у вас.');
                return false;
            }
            const categoryToUpdate = categories.find(cat => cat.id === categoryId && cat.userId === currentUser.id);
            if (!categoryToUpdate) {
                alert('Категория для обновления не найдена или не принадлежит вам.');
                return false;
            }
            const dataToSend = {
                name: categoryDataFromForm.name.trim(),
                icon: categoryDataFromForm.icon !== undefined ? categoryDataFromForm.icon : categoryToUpdate.icon,
                color: categoryDataFromForm.color !== undefined ? categoryDataFromForm.color : categoryToUpdate.color,
            };
            const updatedCat = await api.updateCategoryAPI(categoryId, dataToSend);
            if (updatedCat) {
                setCategories(prevCategories =>
                    prevCategories.map(cat => (cat.id === categoryId ? updatedCat : cat))
                );
                setTransactions(prevTs => prevTs.map(t => {
                    if (t.category && t.category.id === categoryId) {
                        return { ...t, category: updatedCat };
                    }
                    return t;
                }));
            }
            return !!updatedCat;
        } catch (err) {
            alert(`Ошибка обновления категории: ${err.message}`);
            return false;
        }
    }, [currentUser, categories, transactions]);

    const deleteCategory = useCallback(async (categoryId) => {
        if (!currentUser?.id) {
            alert("Ошибка: Пользователь не определен для удаления категории.");
            return;
        }
        try {
            const categoryToDelete = categories.find(cat => cat.id === categoryId && cat.userId === currentUser.id);
            if (!categoryToDelete) {
                alert('Категория для удаления не найдена или не принадлежит вам.');
                return;
            }
            const isCategoryUsed = transactions.some(t => t.category.id === categoryId && t.userId === currentUser.id);
            if (isCategoryUsed) {
                alert('Нельзя удалить категорию, так как она используется в ваших транзакциях. Сначала измените или удалите соответствующие транзакции.');
                return;
            }
            await api.deleteCategoryAPI(categoryId);
            setCategories(prev => prev.filter(cat => cat.id !== categoryId));
        } catch (err) {
            alert(`Ошибка удаления категории: ${err.message}`);
        }
    }, [currentUser, categories, transactions]);

    const addTransaction = useCallback(async (formDataFromComponent) => {
        if (!currentUser?.id) {
            alert("Ошибка: Пользователь не определен для добавления транзакции.");
            return;
        }
        try {
            let categoryObject = formDataFromComponent.category;
            if (!categoryObject || !categoryObject.id) {
                categoryObject = categories.find(c => c.id === formDataFromComponent.categoryId && c.userId === currentUser.id);
            } else if (categoryObject.userId !== currentUser.id && categoryObject.id !== undefined) {
                categoryObject = categories.find(c => c.id === categoryObject.id && c.userId === currentUser.id);
            }

            if (!categoryObject) {
                alert('Выбранная категория не найдена или не принадлежит вам! Пожалуйста, выберите категорию из списка или создайте новую.');
                return;
            }
            const transactionDataForAPI = {
                type: formDataFromComponent.type,
                amount: formDataFromComponent.amount,
                category: categoryObject,
                date: formDataFromComponent.date,
                comment: formDataFromComponent.comment,
                createdAt: Date.now(),
            };
            const newTransaction = await api.addTransactionAPI(transactionDataForAPI);
            if (newTransaction) {
                setTransactions(prev => sortTransactions([newTransaction, ...prev]));
            }
        } catch (err) {
            alert(`Ошибка добавления транзакции: ${err.message}`);
        }
    }, [currentUser, categories, sortTransactions]);

    const updateTransaction = useCallback(async (transactionId, formDataFromComponent) => {
        if (!currentUser?.id) {
            alert("Ошибка: Пользователь не определен для обновления транзакции.");
            return;
        }
        try {
            let categoryObject = formDataFromComponent.category;
            if (!categoryObject || !categoryObject.id) {
                categoryObject = categories.find(c => c.id === formDataFromComponent.categoryId && c.userId === currentUser.id);
            } else if (categoryObject.userId !== currentUser.id && categoryObject.id !== undefined) {
                categoryObject = categories.find(c => c.id === categoryObject.id && c.userId === currentUser.id);
            }

            if (!categoryObject) {
                alert('Выбранная категория не найдена или не принадлежит вам! Пожалуйста, выберите категорию из списка или создайте новую.');
                return;
            }
            const transactionToUpdate = transactions.find(t => t.id === transactionId && t.userId === currentUser.id);
            if (!transactionToUpdate) {
                alert('Транзакция для обновления не найдена или не принадлежит вам.');
                return;
            }
            const transactionDataForAPI = {
                type: formDataFromComponent.type,
                amount: formDataFromComponent.amount,
                category: categoryObject,
                date: formDataFromComponent.date,
                comment: formDataFromComponent.comment,
                createdAt: transactionToUpdate.createdAt,
            };
            const updatedTransaction = await api.updateTransactionAPI(transactionId, transactionDataForAPI);
            if (updatedTransaction) {
                setTransactions(prev => sortTransactions(prev.map(t => (t.id === transactionId ? updatedTransaction : t))));
            }
        } catch (err) {
            alert(`Ошибка обновления транзакции: ${err.message}`);
        }
    }, [currentUser, categories, transactions, sortTransactions]);

    const deleteTransaction = useCallback(async (transactionId) => {
        if (!currentUser?.id) {
            alert("Ошибка: Пользователь не определен для удаления транзакции.");
            return;
        }
        try {
            const transactionToDelete = transactions.find(t => t.id === transactionId && t.userId === currentUser.id);
            if (!transactionToDelete) {
                alert('Транзакция для удаления не найдена или не принадлежит вам.');
                return;
            }
            await api.deleteTransactionAPI(transactionId);
            setTransactions(prev => prev.filter(t => t.id !== transactionId));
        } catch (err) {
            alert(`Ошибка удаления транзакции: ${err.message}`);
        }
    }, [currentUser, transactions]);

    if (isLoadingAuth) {
        return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5rem'}}>Загрузка приложения...</div>;
    }

    return (
        <Routes>
            <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
            <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<MainLayout />}>
                    <Route
                        index
                        element={
                            isAppDataLoading && isAuthenticated ? <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 70px)', fontSize: '1.2rem'}}>Загрузка данных...</div> :
                                error && isAuthenticated ? <div style={{color: 'red', textAlign: 'center', marginTop: '2rem'}}>Ошибка загрузки данных: {error}</div> :
                                    isAuthenticated ? <HomePage
                                        transactions={transactions}
                                        categories={categories}
                                        addTransaction={addTransaction}
                                        deleteTransaction={deleteTransaction}
                                        updateTransaction={updateTransaction}
                                        addCategory={addCategory}
                                    /> : null
                        }
                    />
                    <Route
                        path="operations"
                        element={
                            isAppDataLoading && isAuthenticated ? <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 70px)', fontSize: '1.2rem'}}>Загрузка операций...</div> :
                                error && isAuthenticated ? <div style={{color: 'red', textAlign: 'center', marginTop: '2rem'}}>Ошибка загрузки данных: {error}</div> :
                                    isAuthenticated ? <OperationsPage
                                        transactions={transactions}
                                        categories={categories}
                                        addTransaction={addTransaction}
                                        deleteTransaction={deleteTransaction}
                                        updateTransaction={updateTransaction}
                                        addCategory={addCategory}
                                    /> : null
                        }
                    />
                    <Route
                        path="cashflow"
                        element={
                            isAppDataLoading && isAuthenticated ? <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 70px)', fontSize: '1.2rem'}}>Загрузка аналитики...</div> :
                                error && isAuthenticated ? <div style={{color: 'red', textAlign: 'center', marginTop: '2rem'}}>Ошибка загрузки данных: {error}</div> :
                                    isAuthenticated ? <CashFlowPage transactions={transactions} /> : null
                        }
                    />
                    <Route
                        path="settings"
                        element={
                            isAppDataLoading && isAuthenticated ? <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 70px)', fontSize: '1.2rem'}}>Загрузка настроек...</div> :
                                error && isAuthenticated ? <div style={{color: 'red', textAlign: 'center', marginTop: '2rem'}}>Ошибка загрузки данных: {error}</div> :
                                    isAuthenticated ? <SettingsPage
                                        categories={categories}
                                        addCategory={addCategory}
                                        deleteCategory={deleteCategory}
                                        updateCategory={updateCategory}
                                    /> : null
                        }
                    />
                    <Route path="support" element={<SupportPage />} />
                    <Route path="logout" element={<LogoutPage />} />
                </Route>
            </Route>
            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
        </Routes>
    );
}

export default App;