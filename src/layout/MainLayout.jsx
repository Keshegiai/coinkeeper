import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { Outlet, useLocation } from 'react-router-dom';
import styles from './MainLayout.module.css';

const MainLayout = () => {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const location = useLocation();

    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    const closeMobileSidebar = () => {
        setIsMobileSidebarOpen(false);
    };

    useEffect(() => {
        closeMobileSidebar();
    }, [location]);

    return (
        <div className={`${styles.appContainer} ${isMobileSidebarOpen ? styles.mobileSidebarActive : ''}`}>
            <Sidebar
                isMobileSidebarOpen={isMobileSidebarOpen}
                closeMobileSidebar={closeMobileSidebar}
            />
            {isMobileSidebarOpen && (
                <div className={styles.mobileOverlay} onClick={closeMobileSidebar}></div>
            )}
            <div className={styles.mainContentArea}>
                <Header toggleMobileSidebar={toggleMobileSidebar} />
                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;