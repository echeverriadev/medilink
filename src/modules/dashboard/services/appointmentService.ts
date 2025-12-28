import { collection, doc, getDocs, getDoc, query, where, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import emailjs from '@emailjs/browser';
import { generateGoogleCalendarLink } from "../../shared/utils/calendarUtils";

// EmailJS Configuration from environment variables
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export type AppointmentType = 'consulta' | 'cirugia' | 'vacuna' | 'exonerada';

export const APPOINTMENT_COLORS: Record<AppointmentType, string> = {
    consulta: '#3b82f6', // blue-500
    cirugia: '#ef4444',  // red-500
    vacuna: '#10b981',   // emerald-500
    exonerada: '#f59e0b' // amber-500
};

export interface Appointment {
    id?: string;
    patientId: string;
    patientName: string;
    patientEmail: string;
    doctorId: string;
    doctorEmail: string;
    title: string;
    type: AppointmentType;
    color: string;
    start: string;
    end: string;
    description: string;
    status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
    googleEventId?: string;
    createdAt: string;
}

export const createAppointment = async (data: Omit<Appointment, 'id' | 'createdAt'>) => {
    try {
        const appointmentData = {
            ...data,
            createdAt: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, "appointments"), appointmentData);

        const googleLink = generateGoogleCalendarLink(data.title, data.description, data.start, data.end);

        const templateParams = {
            patient_name: data.patientName,
            patient_email: data.patientEmail,
            notification_emails: data.patientEmail, // Send only to patient
            appointment_title: data.title,
            appointment_date: new Date(data.start).toLocaleDateString(),
            appointment_time: new Date(data.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            appointment_description: data.description || 'General Checkup',
            calendar_link: googleLink
        };

        if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
            emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                templateParams,
                EMAILJS_PUBLIC_KEY
            ).then(
                (response) => {
                    console.log('Emails successfully sent!', response.status, response.text);
                },
                (err) => {
                    console.error('Failed to send emails:', err);
                }
            );
        } else {
            console.warn('EmailJS credentials not found in .env. Emails skipped.');
        }

        return { id: docRef.id, ...appointmentData };
    } catch (error) {
        console.error("Error creating appointment:", error);
        throw error;
    }
};

export const getDoctorAppointments = async (doctorId: string) => {
    try {
        const q = query(
            collection(db, "appointments"),
            where("doctorId", "==", doctorId)
            // Removed orderBy to avoid mandatory composite index during initial setup
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Appointment[];

        // Sort in memory instead
        return data.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    } catch (error) {
        console.error("Error fetching doctor appointments:", error);
        throw error;
    }
};

export const getPatientAppointments = async (patientId: string) => {
    try {
        const q = query(
            collection(db, "appointments"),
            where("patientId", "==", patientId)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Appointment[];

        // Sort in memory instead to avoid index requirements
        return data.sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
    } catch (error) {
        console.error("Error fetching patient appointments:", error);
        throw error;
    }
};

export const updateAppointment = async (id: string, data: Partial<Appointment>): Promise<Appointment> => {
    try {
        const appointmentRef = doc(db, "appointments", id);
        await updateDoc(appointmentRef, data);

        // Fetch the full updated document to return it
        const updatedDoc = await getDoc(appointmentRef);
        return { id: updatedDoc.id, ...updatedDoc.data() } as Appointment;
    } catch (error) {
        console.error("Error updating appointment:", error);
        throw error;
    }
};

export const deleteAppointment = async (id: string) => {
    try {
        await deleteDoc(doc(db, "appointments", id));
    } catch (error) {
        console.error("Error deleting appointment:", error);
        throw error;
    }
};
