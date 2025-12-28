import { Outlet, Link, useNavigate } from 'react-router-dom';
import { auth } from '../../../config/firebase';
import { signOut } from 'firebase/auth';

const PatientPortalLayout = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow-sm p-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold text-blue-600">MediLink Patient Portal</h1>
                    <nav className="flex items-center gap-6 text-sm font-bold text-gray-500">
                        <Link to="/patient-portal" className="hover:text-blue-600 transition-colors">My Appointments</Link>
                        <button onClick={handleLogout} className="text-red-500 hover:text-red-700 transition-colors">Logout</button>
                    </nav>
                </div>
            </header>
            <main className="flex-1 py-10 px-4">
                <Outlet />
            </main>
        </div>
    );
};

export default PatientPortalLayout;
