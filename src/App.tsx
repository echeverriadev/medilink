import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './modules/shared/layouts/MainLayout';
import Dashboard from './modules/dashboard/pages/Dashboard';
import Patients from './modules/dashboard/pages/Patients';
import PatientDetail from './modules/dashboard/pages/PatientDetail';
import Appointments from './modules/dashboard/pages/Appointments';
import PatientPortalLayout from './modules/patient-portal/layouts/PatientPortalLayout';
import PatientAppointments from './modules/patient-portal/pages/PatientAppointments';
import LoginPage from './modules/auth/pages/LoginPage';
import AppointmentConfirmation from './modules/patient-portal/pages/AppointmentConfirmation';

import ProtectedRoute from './modules/shared/components/ProtectedRoute';
import ConsultationPage from './modules/dashboard/pages/ConsultationPage';
import SettingsPage from './modules/shared/pages/SettingsPage';

function App() {
    return (

        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/confirm-appointment/:id" element={<AppointmentConfirmation />} />

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
                    <Route path="appointments" element={<Appointments />} />
                    <Route path="appointments/:id/consultation" element={<ConsultationPage />} />
                    <Route path="patients" element={<Patients />} />
                    <Route path="patients/:cedula" element={<PatientDetail />} />
                    <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* Patient Portal - specific role protection */}
                <Route
                    path="/patient-portal"
                    element={
                        <ProtectedRoute allowedRoles={['PATIENT']}>
                            <PatientPortalLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<PatientAppointments />} />
                </Route>

                <Route path="*" element={<div>Not Found</div>} />
            </Routes>
        </Router>
    );

}

export default App;
