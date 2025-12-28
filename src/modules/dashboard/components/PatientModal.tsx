import React, { useState, useEffect } from 'react';
import { createPatient, updatePatient, PatientData } from '../services/patientService';

interface PatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPatientCreated: () => void;
    patientToEdit?: PatientData | null;
}

const PatientModal: React.FC<PatientModalProps> = ({ isOpen, onClose, onPatientCreated, patientToEdit }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        cedula: '',
        phone: '',
        address: '',
        birthDate: ''
    });

    useEffect(() => {
        if (patientToEdit) {
            setFormData({
                fullName: patientToEdit.fullName,
                email: patientToEdit.email,
                password: '', // Password is not editable
                cedula: patientToEdit.cedula,
                phone: patientToEdit.phone,
                address: patientToEdit.address,
                birthDate: patientToEdit.birthDate
            });
        } else {
            setFormData({
                fullName: '',
                email: '',
                password: '',
                cedula: '',
                phone: '',
                address: '',
                birthDate: ''
            });
        }
    }, [patientToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (patientToEdit && patientToEdit.id) {
                // Update mode
                const updateData: Partial<PatientData> = {
                    fullName: formData.fullName,
                    cedula: formData.cedula,
                    phone: formData.phone,
                    address: formData.address,
                    birthDate: formData.birthDate,
                };
                await updatePatient(patientToEdit.id, updateData);
            } else {
                // Create mode
                const patientData: PatientData = {
                    fullName: formData.fullName,
                    email: formData.email,
                    cedula: formData.cedula,
                    phone: formData.phone,
                    address: formData.address,
                    birthDate: formData.birthDate,
                    role: 'PATIENT'
                };
                await createPatient(patientData, formData.password);
            }
            onPatientCreated();
            onClose();
        } catch (err) {
            const error = err as Error;
            setError(error.message || "Failed to save patient");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50">
                    <h3 className="text-xl font-bold text-blue-800">
                        {patientToEdit ? 'Edit Patient' : 'New Patient Registration'}
                    </h3>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                            <input
                                name="fullName" required value={formData.fullName} onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="E.g. John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                            <input
                                name="email" type="email" required disabled={!!patientToEdit}
                                value={formData.email} onChange={handleChange}
                                className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${patientToEdit ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'}`}
                                placeholder="john@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                {patientToEdit ? 'Password (Fixed)' : 'Temp Password'}
                            </label>
                            <input
                                name="password" type="password" required={!patientToEdit} disabled={!!patientToEdit}
                                value={formData.password} onChange={handleChange}
                                className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${patientToEdit ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'}`}
                                placeholder={patientToEdit ? '••••••••' : '••••••••'}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">National ID (Cédula)</label>
                            <input
                                name="cedula" required value={formData.cedula} onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="1234567890"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                            <input
                                name="phone" required value={formData.phone} onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="+1 234 567 890"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Date of Birth</label>
                            <input
                                name="birthDate" type="date" required value={formData.birthDate} onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="md:col-span-1">
                            {/* Empty space for grid alignment or more fields */}
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Address</label>
                            <input
                                name="address" required value={formData.address} onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Street 123, City, Country"
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
                            {loading ? 'Saving...' : (patientToEdit ? 'Update Patient' : 'Register Patient')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PatientModal;
