import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../../auth/context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

import logo from '../../../assets/logo.png';

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user, role, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center animate-pulse">
                    <img src={logo} alt="Loading..." className="h-24 w-auto mb-4 object-contain" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        // Redirect to login but save the current location they were trying to access
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
        // role exists but is not authorized
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100 max-w-md">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h2>
                    <p className="text-gray-600 mb-6">
                        You do not have permission to access this page. Please contact your administrator if you believe this is an error.
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
