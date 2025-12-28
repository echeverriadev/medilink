import React, { useState, useEffect } from 'react';
import { getPatients, PatientData } from '../services/patientService';
import { createAppointment, updateAppointment, deleteAppointment, Appointment } from '../services/appointmentService';
import { useAuth } from '../../auth/context/AuthContext';
import { pushEventToGoogleCalendar, deleteEventFromGoogleCalendar } from '../services/googleCalendarService';
import { isGoogleConnected } from '../services/googleAuthService';

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAppointmentCreated: () => void;
    initialStart?: string | null;
    appointmentToEdit?: Appointment | null;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, onAppointmentCreated, initialStart, appointmentToEdit }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState<PatientData[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        patientId: '',
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: ''
    });

    useEffect(() => {
        const fetchPatients = async () => {
            const data = await getPatients();
            setPatients(data);
        };
        if (isOpen) fetchPatients();
    }, [isOpen]);

    useEffect(() => {
        if (appointmentToEdit) {
            const date = new Date(appointmentToEdit.start);
            const dateStr = date.toISOString().split('T')[0];
            const startTime = date.toTimeString().substring(0, 5);
            const endDate = new Date(appointmentToEdit.end);
            const endTime = endDate.toTimeString().substring(0, 5);

            setFormData({
                patientId: appointmentToEdit.patientId,
                title: appointmentToEdit.title,
                description: appointmentToEdit.description,
                date: dateStr,
                startTime,
                endTime
            });
        } else if (initialStart) {
            const date = new Date(initialStart);
            const dateStr = date.toISOString().split('T')[0];
            const startTime = date.toTimeString().substring(0, 5);

            // Default 30 min later
            const endDate = new Date(date.getTime() + 30 * 60000);
            const endTime = endDate.toTimeString().substring(0, 5);

            setFormData(prev => ({
                ...prev,
                date: dateStr,
                startTime,
                endTime
            }));
        }
    }, [appointmentToEdit, initialStart]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCancel = async () => {
        if (!appointmentToEdit?.id) return;
        if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

        setLoading(true);
        try {
            await updateAppointment(appointmentToEdit.id, { status: 'cancelled' });

            // Sync removal from Google Calendar if connected
            if (isGoogleConnected() && appointmentToEdit.googleEventId) {
                await deleteEventFromGoogleCalendar(appointmentToEdit.googleEventId);
            }

            onAppointmentCreated();
            onClose();
        } catch (err) {
            const error = err as Error;
            setError(error.message || "Failed to cancel appointment");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!appointmentToEdit?.id) return;
        if (!window.confirm("Are you sure you want to PERMANENTLY DELETE this appointment? This will free up the slot in your agenda.")) return;

        setLoading(true);
        try {
            // Delete from Google Calendar first if connected
            if (isGoogleConnected() && appointmentToEdit.googleEventId) {
                await deleteEventFromGoogleCalendar(appointmentToEdit.googleEventId);
            }

            await deleteAppointment(appointmentToEdit.id);
            onAppointmentCreated();
            onClose();
        } catch (err) {
            const error = err as Error;
            setError(error.message || "Failed to delete appointment");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            const selectedPatient = patients.find(p => p.id === formData.patientId);
            if (!selectedPatient) throw new Error("Please select a patient");

            const startISO = new Date(`${formData.date}T${formData.startTime}`).toISOString();
            const endISO = new Date(`${formData.date}T${formData.endTime}`).toISOString();

            const appointmentData = {
                patientId: formData.patientId,
                patientName: selectedPatient.fullName,
                patientEmail: selectedPatient.email,
                doctorId: user.uid,
                doctorEmail: user.email || '',
                title: formData.title || `Consultation with ${selectedPatient.fullName}`,
                start: startISO,
                end: endISO,
                description: formData.description,
                status: (appointmentToEdit?.status || 'confirmed') as 'confirmed' | 'cancelled' | 'scheduled' | 'completed'
            };

            let savedAppointment: Appointment;
            if (appointmentToEdit?.id) {
                savedAppointment = await updateAppointment(appointmentToEdit.id, appointmentData);
            } else {
                savedAppointment = await createAppointment(appointmentData);
            }

            // Automatic push/update to Google Calendar if connected
            if (isGoogleConnected()) {
                try {
                    // Include the existing googleEventId if updating
                    const appointmentWithGoogleId = {
                        ...savedAppointment,
                        googleEventId: appointmentToEdit?.googleEventId || savedAppointment.googleEventId
                    };

                    const googleEventId = await pushEventToGoogleCalendar(appointmentWithGoogleId);

                    // If it's a new event or the ID changed, update Firestore
                    if (googleEventId && googleEventId !== appointmentToEdit?.googleEventId) {
                        await updateAppointment(savedAppointment.id!, { googleEventId });
                    }
                } catch (syncError) {
                    console.error("Failed to sync with Google Calendar:", syncError);
                }
            }

            onAppointmentCreated();
            onClose();
        } catch (err) {
            const error = err as Error;
            setError(error.message || "Failed to save appointment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50">
                    <h3 className="text-xl font-bold text-blue-800">Schedule Appointment</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Patient</label>
                            <select
                                name="patientId" required value={formData.patientId} onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                <option value="">Select a patient...</option>
                                {patients.map(p => (
                                    <option key={p.id} value={p.id}>{p.fullName} ({p.cedula})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Appointment Title (Optional)</label>
                            <input
                                name="title" value={formData.title} onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="E.g. Monthly Checkup"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                                <input
                                    name="date" type="date" required value={formData.date} onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Start Time</label>
                                <input
                                    name="startTime" type="time" required value={formData.startTime} onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">End Time</label>
                                <input
                                    name="endTime" type="time" required value={formData.endTime} onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Description / Notes</label>
                            <textarea
                                name="description" value={formData.description} onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                                placeholder="Patient reported some discomfort in..."
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex gap-3">
                        {appointmentToEdit && appointmentToEdit.status !== 'cancelled' && (
                            <button
                                type="button" onClick={handleCancel} disabled={loading}
                                className="px-4 py-2 bg-orange-50 text-orange-600 font-bold rounded-lg hover:bg-orange-100 transition-all text-sm border border-orange-100"
                            >
                                Cancel Appointment
                            </button>
                        )}
                        {appointmentToEdit && (
                            <button
                                type="button" onClick={handleDelete} disabled={loading}
                                className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-all text-sm border border-red-100"
                            >
                                Delete Permanently
                            </button>
                        )}
                        <button
                            type="button" onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-all text-sm"
                        >
                            Close
                        </button>
                        <button
                            type="submit" disabled={loading}
                            className={`flex-1 px-4 py-2 text-white font-bold rounded-lg transition-all text-sm shadow-md ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
                        >
                            {loading ? 'Processing...' : appointmentToEdit ? 'Update Appointment' : 'Confirm Appointment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AppointmentModal;
