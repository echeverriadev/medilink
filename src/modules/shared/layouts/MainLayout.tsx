import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/context/AuthContext';

import logo from '../../../assets/logo.png';

const MainLayout = () => {
    const { t } = useTranslation();
    const { userData, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const displayName = userData?.name && userData?.surname
        ? `${userData.role === 'DOCTOR' ? 'Dr. ' : ''}${userData.name} ${userData.surname}`
        : 'Doctor';

    const userRole = userData?.role || 'User';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path: string) => {
        return location.pathname.startsWith(path);
    };

    const getLinkClass = (path: string) => {
        const baseClass = "block px-4 py-2 rounded-md transition-colors";
        const activeClass = "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-medium";
        const inactiveClass = "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400";

        return `${baseClass} ${isActive(path) ? activeClass : inactiveClass}`;
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 shadow-md flex-shrink-0 hidden md:flex flex-col border-r dark:border-gray-700">
                <div className="p-4 border-b dark:border-gray-700 flex justify-center">
                    <img src={logo} alt="MediLink Logo" className="h-20 object-contain" />
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        to="/dashboard"
                        className={getLinkClass('/dashboard')}
                    >
                        {t('common.dashboard')}
                    </Link>
                    <Link
                        to="/patients"
                        className={getLinkClass('/patients')}
                    >
                        {t('common.patients')}
                    </Link>
                    <Link
                        to="/appointments"
                        className={getLinkClass('/appointments')}
                    >
                        {t('common.appointments')}
                    </Link>
                </nav>
                <div className="p-4 border-t dark:border-gray-700">
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
                                {displayName.charAt(0)}
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium dark:text-gray-200 truncate">{displayName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userRole.toLowerCase()}</p>
                            </div>
                            <svg className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-1 animate-in fade-in slide-in-from-bottom-2">
                                <Link
                                    to="/settings"
                                    onClick={() => setIsDropdownOpen(false)}
                                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    {t('settings.title')}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    {t('common.logout')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 shadow-sm z-10 p-4 flex justify-between items-center md:hidden">
                    <img src={logo} alt="MediLink Logo" className="h-8 object-contain" />
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 dark:text-gray-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                        </svg>
                    </button>
                </header>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-xl flex flex-col transition-transform transform translate-x-0" onClick={e => e.stopPropagation()}>
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <img src={logo} alt="MediLink Logo" className="h-12 object-contain" />
                                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 dark:text-gray-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('/dashboard')}>
                                    {t('common.dashboard')}
                                </Link>
                                <Link to="/patients" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('/patients')}>
                                    {t('common.patients')}
                                </Link>
                                <Link to="/appointments" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass('/appointments')}>
                                    {t('common.appointments')}
                                </Link>
                            </nav>
                            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
                                        {displayName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium dark:text-gray-200 truncate">{displayName}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userRole.toLowerCase()}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Link to="/settings" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md">
                                        {t('settings.title')}
                                    </Link>
                                    <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md font-medium">
                                        {t('common.logout')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
