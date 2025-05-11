import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoadingAuth } = useAuth();
    const location = useLocation();

    if (isLoadingAuth) {
        return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5rem'}}>Проверка авторизации...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;