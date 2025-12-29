import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const MainLayout = () => {
    const { t } = useTranslation();

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 shadow-md flex-shrink-0 hidden md:flex flex-col border-r dark:border-gray-700">
                <div className="p-4 border-b dark:border-gray-700">
                    <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">MediLink</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors"
                    >
                        {t('common.dashboard')}
                    </Link>
                    <Link
                        to="/patients"
                        className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors"
                    >
                        {t('common.patients')}
                    </Link>
                    <Link
                        to="/appointments"
                        className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors"
                    >
                        {t('common.appointments')}
                    </Link>
                    <Link
                        to="/settings"
                        className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors"
                    >
                        {t('settings.title')}
                    </Link>
                </nav>
                <div className="p-4 border-t dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                        <div>
                            <p className="text-sm font-medium dark:text-gray-200">Dr. Smith</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 shadow-sm z-10 p-4 flex justify-between items-center md:hidden">
                    <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">MediLink</h1>
                    <button className="p-2 text-gray-600 dark:text-gray-300">Menu</button>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
