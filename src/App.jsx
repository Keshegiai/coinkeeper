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
        // ... примеры транзакций ...
        { id: 't1', type: 'expense', amount: 699.99, category: {id: 'cat1', name: 'Техника'}, date: '2025-05-01', comment: 'iPhone 12 Pro' },
        { id: 't2', type: 'expense', amount: 29.00, category: {id: 'cat2', name: 'Подписки'}, date: '2025-05-03', comment: 'Youtube Premium' },
        { id: 't3', type: 'income', amount: 1200, category: {id: 'cat3', name: 'Зарплата'}, date: '2025-05-05', comment: 'Аванс' },
    ]);

    const [categories, setCategories] = useState([
        { id: 'cat1', name: 'Техника' },
        { id: 'cat2', name: 'Подписки' },
        { id: 'cat3', name: 'Зарплата' },
        { id: 'cat4', name: 'Продукты' },
        { id: 'cat5', name: 'Транспорт' },
    ]);

    const addTransaction = (transaction) => {
        setTransactions(prevTransactions => [
            { ...transaction, id: Date.now().toString() },
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

    // --- Функции для управления категориями ---
    const addCategory = (categoryName) => {
        // Проверка на существующую категорию (по имени)
        const existingCategory = categories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
        if (existingCategory) {
            alert('Категория с таким именем уже существует!');
            return existingCategory; // Возвращаем существующую, если имя совпало
        }
        const newCategory = { id: `cat${Date.now()}`, name: categoryName.trim() }; // Добавляем trim()
        setCategories(prevCategories => [...prevCategories, newCategory]);
        return newCategory;
    };

    const deleteCategory = (categoryId) => {
        // Прежде чем удалять, можно добавить проверку, используется ли категория в транзакциях
        const isCategoryUsed = transactions.some(t => t.category.id === categoryId);
        if (isCategoryUsed) {
            alert('Нельзя удалить категорию, так как она используется в транзакциях. Сначала измените транзакции.');
            return;
        }
        setCategories(prevCategories =>
            prevCategories.filter(cat => cat.id !== categoryId)
        );
    };

    const updateCategory = (updatedCategory) => { // Пока обновляем только имя
        // Проверка на существующее имя при переименовании (кроме самой себя)
        const existingCategory = categories.find(cat =>
            cat.name.toLowerCase() === updatedCategory.name.toLowerCase() && cat.id !== updatedCategory.id
        );
        if (existingCategory) {
            alert('Категория с таким именем уже существует!');
            return false; // Сигнал об ошибке
        }
        setCategories(prevCategories =>
            prevCategories.map(cat =>
                cat.id === updatedCategory.id ? { ...cat, name: updatedCategory.name.trim() } : cat
            )
        );
        // Обновляем имя категории во всех транзакциях, где она используется
        setTransactions(prevTransactions =>
            prevTransactions.map(t =>
                t.category.id === updatedCategory.id
                    ? { ...t, category: { ...t.category, name: updatedCategory.name.trim() } }
                    : t
            )
        );
        return true; // Сигнал об успехе
    };
    // --- Конец функций для категорий ---

    return (
        <Routes>
            <Route
                path="/"
                element={<MainLayout />}
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
                            addCategory={addCategory} // addCategory уже передается
                        />
                    }
                />
                <Route path="operations" element={<OperationsPage />} />
                <Route path="cashflow" element={<CashFlowPage />} />
                <Route
                    path="settings"
                    element={ // <--- Передаем props в SettingsPage
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