import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDoctorAppointments, Appointment } from '../services/appointmentService';
import { getPatients } from '../services/patientService';
import { initiateGoogleLogin, handleGoogleRedirect, isGoogleConnected, disconnectGoogle } from '../services/googleAuthService';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [stats, setStats] = useState({
        totalPatients: 0,
        appointmentsToday: 0,
        upcomingToday: 0,
        cancelledCount: 0,
        cancelledPercentage: 0
    });
    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCalendarConnected, setIsCalendarConnected] = useState(false);

    useEffect(() => {
        // Handle Google OAuth redirect
        if (handleGoogleRedirect()) {
            setIsCalendarConnected(true);
        } else {
            setIsCalendarConnected(isGoogleConnected());
        }
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            try {
                const [appointments, patients] = await Promise.all([
                    getDoctorAppointments(user.uid),
                    getPatients()
                ]);

                const now = new Date();
                const todayStr = now.toISOString().split('T')[0];

                const todayAppointments = appointments.filter(apt =>
                    apt.start.startsWith(todayStr)
                );

                const upcoming = todayAppointments.filter(apt =>
                    new Date(apt.start) > now && apt.status !== 'cancelled'
                ).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

                const cancelledCount = appointments.filter(apt => apt.status === 'cancelled').length;
                const totalApts = appointments.length;
                const cancelledPercentage = totalApts > 0 ? (cancelledCount / totalApts) * 100 : 0;

                setStats({
                    totalPatients: patients.length,
                    appointmentsToday: todayAppointments.length,
                    upcomingToday: upcoming.length,
                    cancelledCount,
                    cancelledPercentage
                });

                setUpcomingAppointments(upcoming);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin h-8 w-8 text-blue-600 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('common.dashboard')}</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('dashboard.welcome', { name: user?.displayName || user?.email?.split('@')[0] || 'User' })}</p>
                    </div>

                    {/* Google Calendar Connection Indicator */}
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 ml-4 transition-colors">
                        <div className={`w-2.5 h-2.5 rounded-full ${isCalendarConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                        <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-tight">
                            {isCalendarConnected ? t('dashboard.calendar.synced') : t('dashboard.calendar.sync')}
                        </span>
                        {isCalendarConnected ? (
                            <button
                                onClick={() => { disconnectGoogle(); setIsCalendarConnected(false); }}
                                className="ml-1 p-1 text-gray-400 hover:text-red-500 transition-colors"
                                title={t('dashboard.calendar.disconnect')}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        ) : (
                            <button
                                onClick={initiateGoogleLogin}
                                className="ml-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all text-[10px] font-black uppercase"
                            >
                                {t('dashboard.calendar.button')}
                            </button>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => navigate('/appointments')}
                    className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md active:scale-95"
                >
                    {t('dashboard.newAppointment')}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">{t('dashboard.stats.totalPatients')}</h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalPatients}</p>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
                        <span>{t('dashboard.stats.activeRecords')}</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">{t('dashboard.stats.appointmentsToday')}</h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.appointmentsToday}</p>
                        </div>
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                        <span>{stats.upcomingToday} {t('dashboard.stats.upcoming')}</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">{t('dashboard.stats.cancelled')}</h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.cancelledCount}</p>
                        </div>
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-red-600 dark:text-red-400 text-sm font-medium">
                        <span>{stats.cancelledPercentage.toFixed(1)}{t('dashboard.stats.percentTotal')}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">{t('dashboard.upcoming.title')}</h3>
                    <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full uppercase">{t('dashboard.upcoming.nextInLine')}</span>
                </div>
                <div className="p-0">
                    {upcomingAppointments.length > 0 ? (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {upcomingAppointments.map((apt) => (
                                <div key={apt.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex justify-between items-center group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            {new Date(apt.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 dark:text-white">{apt.patientName}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{apt.title}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                            }`}>
                                            {apt.status}
                                        </span>
                                        <button
                                            onClick={() => navigate(`/appointments/${apt.id}/consultation`)}
                                            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm opacity-0 group-hover:opacity-100 flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            {t('dashboard.upcoming.attend')}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-300 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">{t('dashboard.upcoming.empty')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
