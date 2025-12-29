import React, { useState, useEffect } from 'react';
import { getPatients, PatientData } from '../services/patientService';
import { createAppointment, updateAppointment, deleteAppointment, Appointment, AppointmentType, APPOINTMENT_COLORS, createRecurringAppointments } from '../services/appointmentService';
import { useAuth } from '../../auth/context/AuthContext';
import { pushEventToGoogleCalendar, deleteEventFromGoogleCalendar } from '../services/googleCalendarService';
import { isGoogleConnected } from '../services/googleAuthService';
import { useTranslation } from 'react-i18next';

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAppointmentCreated: () => void;
    initialStart?: string | null;
    appointmentToEdit?: Appointment | null;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, onAppointmentCreated, initialStart, appointmentToEdit }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState<PatientData[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        patientId: '',
        title: '',
        type: 'consulta' as AppointmentType,
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        isRecurring: false,
        frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
        repetitions: 4
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
                type: appointmentToEdit.type || 'consulta',
                description: appointmentToEdit.description,
                date: dateStr,
                startTime,
                endTime,
                isRecurring: false, // Editing as single instance
                frequency: 'weekly',
                repetitions: 4
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
        if (!window.confirm(t('appointments.modal.cancelConfirm'))) return;

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
        if (!window.confirm(t('appointments.modal.deleteConfirm'))) return;

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
                patientPhone: selectedPatient.phone,
                doctorId: user.uid,
                doctorEmail: user.email || '',
                title: formData.title || `${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} with ${selectedPatient.fullName}`,
                type: formData.type,
                color: APPOINTMENT_COLORS[formData.type],
                start: startISO,
                end: endISO,
                description: formData.description,
                status: (appointmentToEdit?.status || 'confirmed') as 'confirmed' | 'cancelled' | 'scheduled' | 'completed'
            };

            let appointmentsToSync: Appointment[] = [];

            if (appointmentToEdit?.id) {
                const updated = await updateAppointment(appointmentToEdit.id, appointmentData);
                appointmentsToSync = [updated];
            } else if (formData.isRecurring) {
                appointmentsToSync = await createRecurringAppointments(appointmentData, formData.frequency, formData.repetitions);
            } else {
                const created = await createAppointment(appointmentData);
                appointmentsToSync = [created];
            }

            // Automatic push/update to Google Calendar if connected
            if (isGoogleConnected()) {
                for (const apt of appointmentsToSync) {
                    try {
                        // Include the existing googleEventId if updating
                        const appointmentWithGoogleId = {
                            ...apt,
                            googleEventId: appointmentToEdit?.googleEventId || apt.googleEventId
                        };

                        const googleEventId = await pushEventToGoogleCalendar(appointmentWithGoogleId);

                        // If it's a new event or the ID changed, update Firestore
                        if (googleEventId && googleEventId !== (appointmentToEdit?.googleEventId || apt.googleEventId)) {
                            await updateAppointment(apt.id!, { googleEventId });
                        }
                    } catch (syncError) {
                        console.error(`Failed to sync appointment ${apt.id} with Google Calendar:`, syncError);
                    }
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-blue-50 dark:bg-blue-900/20">
                    <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300">{t('appointments.modal.title')}</h3>
                    <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-3 rounded-lg text-sm border border-red-100 dark:border-red-900/30">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('appointments.modal.patient')}</label>
                            <select
                                name="patientId" required value={formData.patientId} onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                            >
                                <option value="">{t('appointments.modal.selectPatient')}</option>
                                {patients.map(p => (
                                    <option key={p.id} value={p.id}>{p.fullName} ({p.cedula})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('appointments.modal.apptTitle')}</label>
                            <input
                                name="title" value={formData.title} onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                placeholder="E.g. Monthly Checkup"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('appointments.modal.type')}</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {(['consulta', 'cirugia', 'vacuna', 'exonerada'] as AppointmentType[]).map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type })}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition-all border-2 ${formData.type === type
                                            ? 'bg-white dark:bg-gray-800 border-blue-500 text-blue-700 dark:text-blue-400 shadow-sm'
                                            : 'bg-gray-50 dark:bg-gray-700 border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: APPOINTMENT_COLORS[type] }}
                                            ></span>
                                            {type}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('appointments.modal.recurring')}</label>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, isRecurring: !formData.isRecurring })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.isRecurring ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isRecurring ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            {formData.isRecurring && !appointmentToEdit && (
                                <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">{t('appointments.modal.frequency')}</label>
                                        <select
                                            name="frequency"
                                            value={formData.frequency}
                                            onChange={handleChange}
                                            className="w-full px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                        >
                                            <option value="daily">{t('appointments.modal.frequencies.daily')}</option>
                                            <option value="weekly">{t('appointments.modal.frequencies.weekly')}</option>
                                            <option value="monthly">{t('appointments.modal.frequencies.monthly')}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">{t('appointments.modal.repetitions')}</label>
                                        <input
                                            name="repetitions"
                                            type="number"
                                            min="2"
                                            max="24"
                                            value={formData.repetitions}
                                            onChange={handleChange}
                                            className="w-full px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('appointments.modal.date')}</label>
                                <input
                                    name="date" type="date" required value={formData.date} onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('appointments.modal.startTime')}</label>
                                <input
                                    name="startTime" type="time" required value={formData.startTime} onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('appointments.modal.endTime')}</label>
                                <input
                                    name="endTime" type="time" required value={formData.endTime} onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('appointments.modal.description')}</label>
                            <textarea
                                name="description" value={formData.description} onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] dark:text-white"
                                placeholder="Patient reported some discomfort in..."
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                        {appointmentToEdit && appointmentToEdit.status !== 'cancelled' && (
                            <button
                                type="button" onClick={handleCancel} disabled={loading}
                                className="px-4 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-bold rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-all text-sm border border-orange-100 dark:border-orange-900/30"
                            >
                                {t('appointments.modal.cancelAppt')}
                            </button>
                        )}
                        {appointmentToEdit && (
                            <button
                                type="button" onClick={handleDelete} disabled={loading}
                                className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-all text-sm border border-red-100 dark:border-red-900/30"
                            >
                                {t('appointments.modal.deleteAppt')}
                            </button>
                        )}
                        <button
                            type="button" onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-sm"
                        >
                            {t('appointments.modal.close')}
                        </button>
                        <button
                            type="submit" disabled={loading}
                            className={`flex-1 px-4 py-2 text-white font-bold rounded-lg transition-all text-sm shadow-md ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
                        >
                            {loading ? t('appointments.modal.processing') : appointmentToEdit ? t('appointments.modal.update') : t('appointments.modal.confirm')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AppointmentModal;
