import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, doc, setDoc, getDocs, query, where, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";

// Secondary Firebase app to create users without changing the current session
const firebaseConfig = {
    apiKey: "AIzaSyCH48Ott3SjOtZKV7rZMAM5e5tLUK9RLto",
    authDomain: "medilink-2b336.firebaseapp.com",
    projectId: "medilink-2b336",
    appId: "1:16432908234:web:cc5549061141f8c8f5b133",
};

const secondaryApp = !getApps().some(app => app.name === 'secondary')
    ? initializeApp(firebaseConfig, 'secondary')
    : getApp('secondary');

const secondaryAuth = getAuth(secondaryApp);

export interface PatientData {
    id?: string;
    fullName: string;
    email: string;
    cedula: string;
    phone: string;
    address: string;
    birthDate: string;
    role: 'PATIENT';
    createdAt?: string;
    updatedAt?: string;
}

export const createPatient = async (data: PatientData, password: string) => {
    try {
        // 1. Create user in Firebase Auth using the secondary instance
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, data.email, password);
        const uid = userCredential.user.uid;

        // 2. Add metadata to Firestore users collection
        await setDoc(doc(db, "users", uid), {
            fullName: data.fullName,
            email: data.email,
            cedula: data.cedula,
            phone: data.phone,
            address: data.address,
            birthDate: data.birthDate,
            role: 'PATIENT',
            createdAt: new Date().toISOString()
        });

        // 3. Sign out the secondary app user immediately so it doesn't persist
        await signOut(secondaryAuth);

        return { uid, ...data };
    } catch (error) {
        console.error("Error creating patient:", error);
        throw error;
    }
};

export const updatePatient = async (id: string, data: Partial<PatientData>) => {
    try {
        const patientRef = doc(db, "users", id);
        const updateData = {
            ...data,
            updatedAt: new Date().toISOString()
        };
        await updateDoc(patientRef, updateData);
    } catch (error) {
        console.error("Error updating patient:", error);
        throw error;
    }
};

export const deletePatient = async (id: string) => {
    try {
        // Note: For now we only delete the Firestore record. 
        // Real deletion from Firebase Auth requires Cloud Functions or Admin SDK.
        await deleteDoc(doc(db, "users", id));
    } catch (error) {
        console.error("Error deleting patient:", error);
        throw error;
    }
};

export const getPatients = async () => {
    try {
        const q = query(collection(db, "users"), where("role", "==", "PATIENT"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as PatientData[];
    } catch (error) {
        console.error("Error fetching patients:", error);
        throw error;
    }
};

export const getPatientByCedula = async (cedula: string) => {
    try {
        const q = query(collection(db, "users"), where("cedula", "==", cedula), where("role", "==", "PATIENT"));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;

        const doc = querySnapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data()
        } as PatientData;
    } catch (error) {
        console.error("Error fetching patient by cedula:", error);
        throw error;
    }
};
