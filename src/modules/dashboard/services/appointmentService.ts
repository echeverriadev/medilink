import { collection, doc, getDocs, query, where, addDoc, updateDoc, deleteDoc, orderBy } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { generateGoogleCalendarLink } from "../../shared/utils/calendarUtils";

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

        // Trigger Email Extension logic
        // We add a document to the 'mail' collection (default for the extension)
        const googleLink = generateGoogleCalendarLink(data.title, data.description, data.start, data.end);

        await addDoc(collection(db, "mail"), {
            to: data.patientEmail,
            message: {
                subject: `Appointment Confirmed: ${data.title}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
                        <h2 style="color: #2563eb;">Your appointment is confirmed!</h2>
                        <p>Hello <b>${data.patientName}</b>,</p>
                        <p>An appointment has been scheduled for you:</p>
                        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0;"><b>Date:</b> ${new Date(data.start).toLocaleDateString()}</p>
                            <p style="margin: 4px 0;"><b>Time:</b> ${new Date(data.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            <p style="margin: 4px 0;"><b>Details:</b> ${data.description || 'General Checkup'}</p>
                        </div>
                        <p>You can add this to your calendar using the button below:</p>
                        <a href="${googleLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">
                            Add to Google Calendar
                        </a>
                        <p style="margin-top: 24px; color: #64748b; font-size: 14px;">
                            See you soon,<br>
                            The MediLink Team
                        </p>
                    </div>
                `
            }
        });

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
