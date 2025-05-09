// src/App.jsx
import React from 'react';
import MainLayout from './layout/MainLayout';
import HomePage from './pages/HomePage';
import './App.css'; // или index.css для глобальных стилей

function App() {
    return (
        <MainLayout>
            <HomePage />
        </MainLayout>
    );
}

export default App;