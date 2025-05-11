import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import * as authApi from '../services/authApi';
import { log, logAction, logStateChange, logEffect, logError } from '../utils/logger';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    useEffect(() => {
        logEffect('AuthProvider', 'Initial Auth Check');
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        if (token && userData) {
            try {
                const parsedUser = JSON.parse(userData);
                logStateChange('AuthProvider', 'currentUser', parsedUser, null);
                setCurrentUser(parsedUser);
            } catch (e) {
                logError('AuthProvider', 'Initial Auth Check', e, { issue: 'Failed to parse user data' });
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
            }
        } else {
            log('[AuthProvider] No token or user data in localStorage.');
        }
        setIsLoadingAuth(false);
    }, []);

    const login = useCallback(async (email, password) => {
        logAction('AuthProvider', 'login', { email });
        try {
            const response = await authApi.loginUserAPI({ email, password });
            logStateChange('AuthProvider', 'currentUser', response.user, currentUser);
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('userData', JSON.stringify(response.user));
            setCurrentUser(response.user);
            return response.user;
        } catch (error) {
            logError('AuthProvider', 'login', error, { email });
            throw error;
        }
    }, [currentUser]);

    const register = useCallback(async (userData) => {
        logAction('AuthProvider', 'register', { email: userData.email, name: userData.name });
        try {
            const newUser = await authApi.registerUserAPI(userData);
            log('[AuthProvider] Registration successful for user:', newUser);
            return newUser;
        } catch (error) {
            logError('AuthProvider', 'register', error, { userData });
            throw error;
        }
    }, []);

    const logout = useCallback(() => {
        logAction('AuthProvider', 'logout', { user: currentUser });
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        logStateChange('AuthProvider', 'currentUser', null, currentUser);
        setCurrentUser(null);
    }, [currentUser]);

    const value = useMemo(() => ({
        currentUser,
        isAuthenticated: !!currentUser,
        isLoadingAuth,
        login,
        register,
        logout,
    }), [currentUser, isLoadingAuth, login, register, logout]);

    return <AuthContext.Provider value={value}>{!isLoadingAuth && children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};