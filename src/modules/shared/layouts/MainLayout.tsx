import { Outlet, Link } from 'react-router-dom';

const MainLayout = () => {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md flex-shrink-0 hidden md:flex flex-col">
                <div className="p-4 border-b">
                    <h1 className="text-2xl font-bold text-blue-600">MediLink</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/patients"
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
                    >
                        Patients
                    </Link>
                    <Link
                        to="/appointments"
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
                    >
                        Appointments
                    </Link>
                </nav>
                <div className="p-4 border-t">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                        <div>
                            <p className="text-sm font-medium">Dr. Smith</p>
                            <p className="text-xs text-gray-500">Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm z-10 p-4 flex justify-between items-center md:hidden">
                    <h1 className="text-xl font-bold text-blue-600">MediLink</h1>
                    <button className="p-2 text-gray-600">Menu</button>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
