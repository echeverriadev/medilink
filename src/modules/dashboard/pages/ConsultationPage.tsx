import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { getDoctorAppointments, updateAppointment, Appointment } from '../services/appointmentService';
import { createConsultation, getConsultationByAppointment } from '../services/consultationService';

const ConsultationPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        observations: '',
        exams: '',
        medications: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!id || !user) return;
            try {
                // In a real app we might want a direct getAppointment, but we reuse getDoctorAppointments for now
                const appointments = await getDoctorAppointments(user.uid);
                const currentApt = appointments.find(a => a.id === id);

                if (!currentApt) {
                    setError("Appointment not found");
                    return;
                }
                setAppointment(currentApt);

                // Check if consultation already exists
                const existing = await getConsultationByAppointment(id);
                if (existing) {
                    setFormData({
                        observations: existing.observations,
                        exams: existing.exams,
                        medications: existing.medications
                    });
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load consultation data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!appointment || !user || !id) return;

        setSaving(true);
        try {
            await createConsultation({
                appointmentId: id,
                patientId: appointment.patientId,
                doctorId: user.uid,
                date: appointment.start,
                observations: formData.observations,
                exams: formData.exams,
                medications: formData.medications
            });

            // Mark appointment as completed
            await updateAppointment(id, { status: 'completed' });

            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError("Failed to save consultation");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading consultation context...</div>;
    if (error || !appointment) return <div className="p-8 text-center text-red-500">{error || "Critical error"}</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wider mb-2 inline-block">
                            Medical Consultation
                        </span>
                        <h2 className="text-3xl font-bold text-gray-900">Patient: {appointment.patientName}</h2>
                        <p className="text-gray-500 mt-1">{new Date(appointment.start).toLocaleDateString()} at {new Date(appointment.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-2xl transition-all"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 gap-8">
                        {/* Observations section */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                General Observations
                            </label>
                            <textarea
                                required
                                value={formData.observations}
                                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                                className="w-full p-6 bg-gray-50 border-0 rounded-3xl focus:ring-2 focus:ring-blue-500 min-h-[150px] text-gray-700 leading-relaxed text-lg"
                                placeholder="Describe symptoms, evolution, and physical findings..."
                            />
                        </div>

                        {/* Medications and Exams side-by-side */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.022.547l-2.387 4.774a1 1 0 001.022 1.547l1.022-.547 2.387-.477a6 6 0 003.86-.517l.318-.158a6 6 0 013.86-.517l1.32.264a2 2 0 001.022-.547l2.387-4.774z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 10l5.5 5.5m0-5.5L10 15.5" />
                                    </svg>
                                    Medications / Prescription
                                </label>
                                <textarea
                                    value={formData.medications}
                                    onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                                    className="w-full p-6 bg-gray-50 border-0 rounded-3xl focus:ring-2 focus:ring-blue-500 min-h-[120px] text-gray-700"
                                    placeholder="List prescribed medicines and dosage..."
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Required Laboratory / Exams
                                </label>
                                <textarea
                                    value={formData.exams}
                                    onChange={(e) => setFormData({ ...formData, exams: e.target.value })}
                                    className="w-full p-6 bg-gray-50 border-0 rounded-3xl focus:ring-2 focus:ring-blue-500 min-h-[120px] text-gray-700"
                                    placeholder="List required blood tests, imaging, etc..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="flex-1 px-8 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all text-lg shadow-sm"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className={`flex-[2] px-8 py-4 text-white font-bold rounded-2xl transition-all text-lg shadow-lg ${saving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-95'
                                }`}
                        >
                            {saving ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Saving Clinical Record...
                                </span>
                            ) : 'Save & Complete Consultation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConsultationPage;
