import React, { useState, useEffect } from 'react';
import { getPatients, PatientData } from '../services/patientService';
import { createAppointment } from '../services/appointmentService';
import { useAuth } from '../../auth/context/AuthContext';

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAppointmentCreated: () => void;
    initialStart?: string | null;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, onAppointmentCreated, initialStart }) => {
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
        if (initialStart) {
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
    }, [initialStart]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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

            await createAppointment({
                patientId: formData.patientId,
                patientName: selectedPatient.fullName,
                patientEmail: selectedPatient.email, // Passing the email for the extension
                doctorId: user.uid,
                title: formData.title || `Consultation with ${selectedPatient.fullName}`,
                start: startISO,
                end: endISO,
                description: formData.description,
                status: 'confirmed'
            });

            onAppointmentCreated();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to schedule appointment");
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
                        <button
                            type="button" onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-all text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit" disabled={loading}
                            className={`flex-1 px-4 py-2 text-white font-bold rounded-lg transition-all text-sm shadow-md ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
                        >
                            {loading ? 'Scheduling...' : 'Confirm Appointment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AppointmentModal;
