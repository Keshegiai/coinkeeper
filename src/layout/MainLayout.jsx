import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import styles from './MainLayout.module.css'; // <--- ИЗМЕНЕНИЕ ИМПОРТА

const MainLayout = () => {
    return (
        <div className={styles.appContainer}> {/* <--- ИСПОЛЬЗОВАНИЕ СТИЛЕЙ */}
            <Sidebar /> {/* Sidebar использует свои модульные стили */}
            <div className={styles.mainContentArea}>
                <Header /> {/* Header использует свои модульные стили */}
                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;