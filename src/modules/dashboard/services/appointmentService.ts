import { collection, doc, getDocs, query, where, addDoc, updateDoc, deleteDoc, orderBy } from "firebase/firestore";
import { db } from "../../../config/firebase";
import emailjs from '@emailjs/browser';
import { generateGoogleCalendarLink } from "../../shared/utils/calendarUtils";

// EmailJS Configuration from environment variables
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export interface Appointment {
    id?: string;
    patientId: string;
    patientName: string;
    patientEmail: string; // Added to support notifications
    doctorId: string;
    title: string; // For FullCalendar
    start: string; // ISO string
    end: string; // ISO string
    description: string;
    status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
    createdAt: string;
}

export const createAppointment = async (data: Omit<Appointment, 'id' | 'createdAt'>) => {
    try {
        const appointmentData = {
            ...data,
            createdAt: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, "appointments"), appointmentData);

        // EmailJS logic for free tier notifications
        const googleLink = generateGoogleCalendarLink(data.title, data.description, data.start, data.end);

        const templateParams = {
            patient_name: data.patientName,
            patient_email: data.patientEmail,
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
                    console.log('Email successfully sent!', response.status, response.text);
                },
                (err) => {
                    console.error('Failed to send email:', err);
                }
            );
        } else {
            console.warn('EmailJS credentials not found in .env. Email skipped.');
        }

        return { id: docRef.id, ...appointmentData };
    } catch (error: any) {
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
    } catch (error: any) {
        console.error("Error fetching doctor appointments:", error);
        throw error;
    }
};

export const getPatientAppointments = async (patientId: string) => {
    try {
        const q = query(
            collection(db, "appointments"),
            where("patientId", "==", patientId),
            orderBy("start", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Appointment[];
    } catch (error: any) {
        console.error("Error fetching patient appointments:", error);
        throw error;
    }
};

export const updateAppointment = async (id: string, data: Partial<Appointment>) => {
    try {
        const appointmentRef = doc(db, "appointments", id);
        await updateDoc(appointmentRef, data);
    } catch (error: any) {
        console.error("Error updating appointment:", error);
        throw error;
    }
};

export const deleteAppointment = async (id: string) => {
    try {
        await deleteDoc(doc(db, "appointments", id));
    } catch (error: any) {
        console.error("Error deleting appointment:", error);
        throw error;
    }
};
