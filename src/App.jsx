import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import HomePage from './pages/HomePage';
import OperationsPage from './pages/OperationsPage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';
import LogoutPage from './pages/LogoutPage';
// import NotFoundPage from './pages/NotFoundPage'; // Для страницы 404 в будущем

//import './App.css'; // Если есть специфичные стили для App, можно раскомментировать

function App() {
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="operations" element={<OperationsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="support" element={<SupportPage />} />
                <Route path="logout" element={<LogoutPage />} />
                {/* <Route path="*" element={<NotFoundPage />} /> */}
            </Route>
            {/* Другие роуты, например, для страницы входа без MainLayout: */}
            {/* <Route path="/login" element={<LoginPage />} /> */}
        </Routes>
    );
}

export default App;