import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../auth/context/AuthContext';
import { updateUserSettings } from '../services/settingsService';

const SettingsPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { theme, setTheme } = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();

    const changeLanguage = async (lng: 'en' | 'es') => {
        i18n.changeLanguage(lng);
        if (user) {
            try {
                await updateUserSettings(user.uid, { language: lng });
            } catch (error) {
                console.error("Failed to sync language preference", error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <div className="max-w-3xl mx-auto p-6 md:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('settings.title')}</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{t('settings.subtitle')}</p>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Settings Content */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">

                    {/* Appearance Section */}
                    <div className="p-8 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                    {t('settings.appearance.title')}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('settings.appearance.subtitle')}</p>
                            </div>

                            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${theme === 'light'
                                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                        }`}
                                >
                                    {t('settings.appearance.light')}
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${theme === 'dark'
                                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                        }`}
                                >
                                    {t('settings.appearance.dark')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Language Section */}
                    <div className="p-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                    </svg>
                                    {t('settings.language.title')}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('settings.language.subtitle')}</p>
                            </div>

                            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                                <button
                                    onClick={() => changeLanguage('en')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${i18n.language.startsWith('en')
                                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                        }`}
                                >
                                    {t('settings.language.english')}
                                </button>
                                <button
                                    onClick={() => changeLanguage('es')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${i18n.language.startsWith('es')
                                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                        }`}
                                >
                                    {t('settings.language.spanish')}
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
