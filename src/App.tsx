import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './modules/shared/layouts/MainLayout';
import Dashboard from './modules/dashboard/pages/Dashboard';
import Patients from './modules/dashboard/pages/Patients';
import PatientDetail from './modules/dashboard/pages/PatientDetail';
import LoginPage from './modules/auth/pages/LoginPage';
import { AuthProvider } from './modules/auth/context/AuthContext';
import ProtectedRoute from './modules/shared/components/ProtectedRoute';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    {/* Protected Routes */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN', 'SECRETARY']}>
                                <MainLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="appointments" element={<div>Appointments Page</div>} />
                        <Route path="patients" element={<Patients />} />
                        <Route path="patients/:cedula" element={<PatientDetail />} />
                    </Route>

                    {/* Patient Portal - specific role protection */}
                    <Route
                        path="/patient-portal"
                        element={
                            <ProtectedRoute allowedRoles={['PATIENT']}>
                                <div>Patient Portal</div>
                            </ProtectedRoute>
                        }
                    />

                    <Route path="*" element={<div>Not Found</div>} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
