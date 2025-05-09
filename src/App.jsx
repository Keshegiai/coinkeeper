import React, { useState } from 'react'; // <--- Добавляем useState
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import HomePage from './pages/HomePage';
import OperationsPage from './pages/OperationsPage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';
import LogoutPage from './pages/LogoutPage';
import CashFlowPage from './pages/CashFlowPage';

function App() {
    const [transactions, setTransactions] = useState([
        // Пример начальных данных, чтобы было что отображать. Потом можно убрать.
        { id: 't1', type: 'expense', amount: 699.99, category: 'Техника', date: '2025-05-01', comment: 'iPhone 12 Pro' },
        { id: 't2', type: 'expense', amount: 29.00, category: 'Подписки', date: '2025-05-03', comment: 'Youtube Premium' },
        { id: 't3', type: 'income', amount: 1200, category: 'Зарплата', date: '2025-05-05', comment: 'Аванс' },
    ]);

    const [categories, setCategories] = useState([ // Начальный список категорий
        { id: 'cat1', name: 'Техника' },
        { id: 'cat2', name: 'Подписки' },
        { id: 'cat3', name: 'Зарплата' },
        { id: 'cat4', name: 'Продукты' },
        { id: 'cat5', name: 'Транспорт' },
    ]);

    const addTransaction = (transaction) => {
        setTransactions(prevTransactions => [
            { ...transaction, id: Date.now().toString() }, // Простой генератор ID
            ...prevTransactions
        ]);
    };

    const deleteTransaction = (transactionId) => {
        setTransactions(prevTransactions =>
            prevTransactions.filter(t => t.id !== transactionId)
        );
    };

    const updateTransaction = (updatedTransaction) => {
        setTransactions(prevTransactions =>
            prevTransactions.map(t =>
                t.id === updatedTransaction.id ? updatedTransaction : t
            )
        );
    };

    const addCategory = (categoryName) => {
        const newCategory = { id: `cat${Date.now()}`, name: categoryName };
        setCategories(prevCategories => [...prevCategories, newCategory]);
        return newCategory; // Возвращаем созданную категорию, чтобы сразу использовать ее ID
    };


    return (
        <Routes>
            <Route
                path="/"
                element={
                    <MainLayout
                        // Передаем addTransaction в MainLayout, если кнопка добавления будет в Header
                        // Или напрямую в HomePage, если кнопка там
                        // Для примера, предположим, что форма будет открываться с HomePage
                    />
                }
            >
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
                <Route path="operations" element={<OperationsPage />} /> {/* Можно будет тоже передать транзакции */}
                <Route path="cashflow" element={<CashFlowPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="support" element={<SupportPage />} />
                <Route path="logout" element={<LogoutPage />} />
            </Route>
        </Routes>
    );
}

export default App;