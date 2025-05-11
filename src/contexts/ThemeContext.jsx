import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { log, logAction, logStateChange, logEffect } from '../utils/logger';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        logEffect('ThemeProvider', 'Initial Theme Load Attempt');
        const storedTheme = localStorage.getItem('appTheme');
        if (storedTheme) {
            log('[ThemeProvider] Found theme in localStorage:', storedTheme);
            return storedTheme;
        }
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            log('[ThemeProvider] Using system preference: dark');
            return 'dark';
        }
        log('[ThemeProvider] Defaulting to light theme');
        return 'light';
    });

    useEffect(() => {
        logEffect('ThemeProvider', 'Theme Persistence Effect', { theme });
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('appTheme', theme);
        log(`[ThemeProvider] Theme set to "${theme}" and saved to localStorage.`);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        logAction('ThemeProvider', 'toggleTheme', { currentTheme: theme });
        setTheme(prevTheme => {
            const newTheme = prevTheme === 'light' ? 'dark' : 'light';
            logStateChange('ThemeProvider', 'theme', newTheme, prevTheme);
            return newTheme;
        });
    }, [theme]);

    const value = useMemo(() => ({
        theme,
        toggleTheme,
    }), [theme, toggleTheme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};