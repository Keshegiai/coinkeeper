import React, { createContext, useState, useContext, useEffect } from 'react';
import * as authApi from '../services/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        if (token && userData) {
            try {
                setCurrentUser(JSON.parse(userData));
            } catch (e) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await authApi.loginUserAPI({ email, password });
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('userData', JSON.stringify(response.user));
            setCurrentUser(response.user);
            return response.user;
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const newUser = await authApi.registerUserAPI(userData);
            return newUser;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setCurrentUser(null);
    };

    const value = {
        currentUser,
        isAuthenticated: !!currentUser,
        isLoadingAuth: isLoading,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};