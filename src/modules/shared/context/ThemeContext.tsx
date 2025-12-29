import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

import { useAuth } from '../../auth/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { getUserSettings, updateUserSettings } from '../services/settingsService';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { i18n } = useTranslation();
    const [theme, setThemeState] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('theme');
        return (savedTheme as Theme) || 'light';
    });

    // Sync theme with DOM and localStorage
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Fetch user settings from Firestore on login
    useEffect(() => {
        const fetchSettings = async () => {
            if (user) {
                const settings = await getUserSettings(user.uid);
                if (settings) {
                    if (settings.theme) setThemeState(settings.theme);
                    if (settings.language && settings.language !== i18n.language) {
                        i18n.changeLanguage(settings.language);
                    }
                }
            }
        };
        fetchSettings();
    }, [user, i18n]);

    const setTheme = async (newTheme: Theme) => {
        setThemeState(newTheme);
        if (user) {
            try {
                await updateUserSettings(user.uid, { theme: newTheme });
            } catch (error) {
                console.error("Failed to sync theme preference", error);
            }
        }
    };

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
