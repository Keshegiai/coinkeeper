import React, { useState, useEffect } from 'react'; // Добавляем useState, useEffect
import Header from './Header';
import Sidebar from './Sidebar';
import { Outlet, useLocation } from 'react-router-dom'; // Добавляем useLocation
import styles from './MainLayout.module.css';

const MainLayout = () => {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const location = useLocation(); // Для закрытия сайдбара при смене роута

    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    const closeMobileSidebar = () => {
        setIsMobileSidebarOpen(false);
    };

    // Закрываем мобильный сайдбар при изменении URL (переходе на другую страницу)
    useEffect(() => {
        closeMobileSidebar();
    }, [location]);

    return (
        <div className={`${styles.appContainer} ${isMobileSidebarOpen ? styles.mobileSidebarActive : ''}`}>
            <Sidebar
                isMobileSidebarOpen={isMobileSidebarOpen}
                closeMobileSidebar={closeMobileSidebar} // Передаем для возможного закрытия изнутри сайдбара
            />
            {/* Оверлей для затемнения контента, когда сайдбар открыт на мобильном */}
            {isMobileSidebarOpen && (
                <div className={styles.mobileOverlay} onClick={closeMobileSidebar}></div>
            )}
            <div className={styles.mainContentArea}>
                <Header toggleMobileSidebar={toggleMobileSidebar} /> {/* Передаем функцию в Header */}
                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;