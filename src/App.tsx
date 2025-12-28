import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './modules/shared/layouts/MainLayout';
import Dashboard from './modules/dashboard/pages/Dashboard';
import LoginPage from './modules/auth/pages/LoginPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Navigate to="/login" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="*" element={<div>Not Found</div>} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
