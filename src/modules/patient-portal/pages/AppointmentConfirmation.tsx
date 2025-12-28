import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Appointment } from '../../dashboard/services/appointmentService';

const AppointmentConfirmation: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<'idle' | 'success' | 'cancelled' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAppointment = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, 'appointments', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setAppointment({ id: docSnap.id, ...docSnap.data() } as Appointment);
                } else {
                    setError('Appointment not found');
                }
            } catch (err) {
                console.error('Error fetching appointment:', err);
                setError('Failed to load appointment details');
            } finally {
                setLoading(false);
            }
        };
        fetchAppointment();
    }, [id]);

    const handleAction = async (newStatus: 'confirmed' | 'cancelled') => {
        if (!id) return;
        setLoading(true);
        try {
            const docRef = doc(db, 'appointments', id);
            await updateDoc(docRef, { status: newStatus });
            setStatus(newStatus === 'confirmed' ? 'success' : 'cancelled');
        } catch (err) {
            console.error('Error updating status:', err);
            setError('Failed to update appointment status');
        } finally {
            setLoading(false);
        }
    };

    if (loading && status === 'idle') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <div className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4 border-4 border-t-transparent rounded-full"></div>
                    <p className="text-gray-500 font-medium">Loading appointment details...</p>
                </div>
            </div>
        );
    }

    if (error || !appointment) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <div className="bg-red-100 p-3 rounded-full w-fit mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
                    <p className="text-gray-500">{error || 'Appointment record not found.'}</p>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center animate-fadeIn">
                    <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4 text-green-600">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Confirmed!</h2>
                    <p className="text-gray-500">Your medical appointment is confirmed. We look forward to seeing you!</p>
                </div>
            </div>
        );
    }

    if (status === 'cancelled') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center animate-fadeIn">
                    <div className="bg-orange-100 p-3 rounded-full w-fit mx-auto mb-4 text-orange-600">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Appointment Cancelled</h2>
                    <p className="text-gray-500">The appointment has been removed from the schedule.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
                <div className="bg-blue-600 p-8 text-white text-center">
                    <h1 className="text-2xl font-bold">MediLink</h1>
                    <p className="text-blue-100 text-sm mt-1">Medical Appointment Confirmation</p>
                </div>
                <div className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date & Time</p>
                                <p className="text-gray-800 font-semibold italic">
                                    {new Date(appointment.start).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} at {new Date(appointment.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Appointment for</p>
                                <p className="text-gray-800 font-semibold italic">{appointment.patientName}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleAction('cancelled')}
                            disabled={loading}
                            className="px-6 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleAction('confirmed')}
                            disabled={loading}
                            className="px-6 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentConfirmation;
