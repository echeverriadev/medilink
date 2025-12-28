import { collection, addDoc, getDocs, query, where, updateDoc, doc, limit } from "firebase/firestore";
import { db } from "../../../config/firebase";

export interface Consultation {
    id?: string;
    appointmentId: string;
    patientId: string;
    doctorId: string;
    date: string;
    observations: string;
    exams: string;
    medications: string;
    createdAt: string;
}

export const createConsultation = async (data: Omit<Consultation, 'id' | 'createdAt'>) => {
    try {
        const consultationData = {
            ...data,
            createdAt: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, "consultations"), consultationData);
        return { id: docRef.id, ...consultationData };
    } catch (error) {
        console.error("Error creating consultation:", error);
        throw error;
    }
};

export const updateConsultation = async (id: string, data: Partial<Consultation>) => {
    try {
        const consultationRef = doc(db, "consultations", id);
        await updateDoc(consultationRef, data);
    } catch (error) {
        console.error("Error updating consultation:", error);
        throw error;
    }
};

export const getConsultationByAppointment = async (appointmentId: string) => {
    try {
        const q = query(
            collection(db, "consultations"),
            where("appointmentId", "==", appointmentId),
            limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;

        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Consultation;
    } catch (error) {
        console.error("Error fetching consultation by appointment:", error);
        throw error;
    }
};

export const getPatientConsultations = async (patientId: string) => {
    try {
        const q = query(
            collection(db, "consultations"),
            where("patientId", "==", patientId)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Consultation[];

        return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
        console.error("Error fetching patient consultations:", error);
        throw error;
    }
};
