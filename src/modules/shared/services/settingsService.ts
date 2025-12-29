import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';

export interface UserSettings {
    theme: 'light' | 'dark';
    language: 'en' | 'es';
}

export const DEFAULT_SETTINGS: UserSettings = {
    theme: 'light',
    language: 'es'
};

export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
    try {
        const settingsDoc = await getDoc(doc(db, 'user_settings', userId));
        if (settingsDoc.exists()) {
            return settingsDoc.data() as UserSettings;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user settings:", error);
        return null;
    }
};

export const updateUserSettings = async (userId: string, settings: Partial<UserSettings>) => {
    try {
        const docRef = doc(db, 'user_settings', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            await updateDoc(docRef, settings);
        } else {
            await setDoc(docRef, { ...DEFAULT_SETTINGS, ...settings });
        }
    } catch (error) {
        console.error("Error updating user settings:", error);
        throw error;
    }
};
