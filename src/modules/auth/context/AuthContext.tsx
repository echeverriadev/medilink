import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../config/firebase';

export type UserRole = 'DOCTOR' | 'PATIENT' | 'SECRETARY' | 'ADMIN';

export interface UserData {
    role: UserRole;
    name?: string;
    surname?: string;
    email?: string;
}

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    role: UserRole | null;
    loading: boolean;
    error: string | null;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true);
            setError(null);

            if (firebaseUser) {
                setUser(firebaseUser);
                try {
                    // Fetch user details from Firestore
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setUserData({
                            role: data.role as UserRole,
                            name: data.name,
                            surname: data.surname,
                            email: data.email
                        });
                    } else {
                        setUserData(null);
                        setError('User profile not found');
                    }
                } catch (err) {
                    console.error("Error fetching user role:", err);
                    setError('Failed to fetch user role');
                }
            } else {
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        try {
            await auth.signOut();
            setUser(null);
            setUserData(null);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, userData, role: userData?.role || null, loading, error, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
