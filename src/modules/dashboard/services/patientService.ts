import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, doc, setDoc, getDocs, query, where } from "firebase/firestore";
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
    phone: string;
    address: string;
    birthDate: string;
    role: 'PATIENT';
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
            phone: data.phone,
            address: data.address,
            birthDate: data.birthDate,
            role: 'PATIENT',
            createdAt: new Date().toISOString()
        });

        // 3. Sign out the secondary app user immediately so it doesn't persist
        await signOut(secondaryAuth);

        return { uid, ...data };
    } catch (error: any) {
        console.error("Error creating patient:", error);
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
    } catch (error: any) {
        console.error("Error fetching patients:", error);
        throw error;
    }
};
