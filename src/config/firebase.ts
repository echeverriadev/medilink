import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Replace these with your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "REDACTED_SECRET",
    authDomain: "medilink-2b336.firebaseapp.com",
    projectId: "medilink-2b336",
    appId: "1:16432908234:web:cc5549061141f8c8f5b133",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
