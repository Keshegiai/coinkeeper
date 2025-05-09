import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import './MainLayout.css';

const MainLayout = () => {
    return (
        <div className="app-container">
            <Sidebar />
            <div className="main-content-area">
                <Header />
                <main className="content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;