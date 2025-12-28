import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { getPatientAppointments, Appointment } from '../../dashboard/services/appointmentService';
import { generateGoogleCalendarLink, downloadICSFile } from '../../shared/utils/calendarUtils';

const PatientAppointments: React.FC = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            if (!user) return;
            try {
                const data = await getPatientAppointments(user.uid);
                setAppointments(data);
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, [user]);

    if (loading) return <div className="p-8 text-center">Loading appointments...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">My Appointments</h1>
                <p className="text-gray-500 mt-2">View your clinical history and scheduled consultations</p>
            </header>

            {appointments.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-700">No appointments found</h3>
                    <p className="text-gray-500 mt-2">You haven't scheduled any consultations yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {appointments.map((apt) => {
                        const date = new Date(apt.start);
                        const isUpcoming = date > new Date();

                        return (
                            <div key={apt.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-all">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${isUpcoming ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {isUpcoming ? 'Upcoming' : 'Past'}
                                        </span>
                                        <span className="text-xs text-gray-400">{date.toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-800">{apt.title}</h4>
                                    <p className="text-sm text-gray-500">Time: {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>

                                {isUpcoming && (
                                    <div className="flex flex-wrap gap-2">
                                        <a
                                            href={generateGoogleCalendarLink(apt.title, apt.description, apt.start, apt.end)}
                                            target="_blank" rel="noopener noreferrer"
                                            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <img src="https://www.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_31_2x.png" className="w-4 h-4" alt="Google" />
                                            Add to Google
                                        </a>
                                        <button
                                            onClick={() => downloadICSFile(apt.title, apt.description, apt.start, apt.end)}
                                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-2"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Download .ics
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PatientAppointments;
