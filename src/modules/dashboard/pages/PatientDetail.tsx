import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatientByCedula, PatientData } from '../services/patientService';

const PatientDetail: React.FC = () => {
    const { cedula } = useParams<{ cedula: string }>();
    const navigate = useNavigate();
    const [patient, setPatient] = useState<PatientData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'history' | 'visits' | 'exams'>('history');

    useEffect(() => {
        const fetchPatient = async () => {
            if (!cedula) return;
            try {
                const data = await getPatientByCedula(cedula);
                setPatient(data);
            } catch (error) {
                console.error("Error fetching patient details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPatient();
    }, [cedula]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <svg className="animate-spin h-10 w-10 text-blue-600" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-500 font-medium">Loading patient record...</p>
                </div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
                <h3 className="text-xl font-bold text-gray-800">Patient not found</h3>
                <p className="text-gray-500 mt-2">The record with ID {cedula} does not exist in our database.</p>
                <button
                    onClick={() => navigate('/patients')}
                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md"
                >
                    Back to Patients
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header / Profile Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-24"></div>
                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12">
                        <div className="flex items-end gap-6">
                            <div className="w-24 h-24 bg-white rounded-2xl shadow-lg border-4 border-white flex items-center justify-center text-4xl font-bold text-blue-600">
                                {patient.fullName.charAt(0)}
                            </div>
                            <div className="mb-2">
                                <h2 className="text-3xl font-bold text-gray-800">{patient.fullName}</h2>
                                <div className="flex items-center gap-3 mt-1 text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-4 0a2 2 0 014 0" />
                                        </svg>
                                        ID: {patient.cedula}
                                    </span>
                                    <span>•</span>
                                    <span>{patient.email}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mb-2">
                            <button className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-all">Edit Profile</button>
                            <button className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md">New Visit</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Personal info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Personal Data
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <p className="text-xs font-bold text-gray-400 uppercase">Phone</p>
                                <p className="text-sm text-gray-800 font-medium">{patient.phone}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <p className="text-xs font-bold text-gray-400 uppercase">Birth Date</p>
                                <p className="text-sm text-gray-800 font-medium">{patient.birthDate}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <p className="text-xs font-bold text-gray-400 uppercase">Address</p>
                                <p className="text-sm text-gray-800 font-medium">{patient.address}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 italic text-blue-800 text-sm">
                        "Patient shows good progress in recent consultation. Follow up recommended in 3 months."
                    </div>
                </div>

                {/* Right Column: History and Tabs */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex border-b border-gray-100">
                            {(['history', 'visits', 'exams'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-8 py-4 text-sm font-bold transition-all border-b-2 capitalize ${activeTab === tab
                                            ? 'text-blue-600 border-blue-600'
                                            : 'text-gray-400 border-transparent hover:text-gray-600'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="p-8">
                            {activeTab === 'history' && (
                                <div className="space-y-8">
                                    <div className="relative pl-8 border-l-2 border-dashed border-gray-100">
                                        <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.1)]"></div>
                                        <div>
                                            <p className="text-xs font-bold text-blue-600 mb-1">Dec 27, 2025</p>
                                            <h4 className="text-lg font-bold text-gray-800">Registration & Initial Profile</h4>
                                            <p className="text-gray-600 mt-2 text-sm">
                                                Patient profile created by administrative staff. Basic clinical data recorded.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-gray-400 font-medium">No medical visits recorded yet.</p>
                                        <button className="mt-4 text-blue-600 text-sm font-bold hover:underline">Add first consultation</button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'visits' && (
                                <div className="text-center py-12 text-gray-400">
                                    Consultation list placeholder.
                                </div>
                            )}

                            {activeTab === 'exams' && (
                                <div className="text-center py-12 text-gray-400">
                                    Medical exams and laboratory results placeholder.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDetail;
