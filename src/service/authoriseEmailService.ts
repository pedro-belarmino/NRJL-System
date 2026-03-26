import { doc, getDoc, getDocs, collection, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export type UserRole = 'developer' | 'coordinator' | 'facilitator';

export interface AllowedUser {
    email: string;
    role: UserRole;
}

const allowedUsersCollection = collection(db, "allowed_users");

/**
 * Checks if the user's email is authorized according to the policy:
 * 1. Only users with emails ending in '@escoteiros' (e.g., @escoteiros.org.br or @escoteiros.org) are allowed.
 * 2. The email must be present in the 'allowed_users' collection in Firestore.
 */
export const isEmailAuthorized = async (email: string | null): Promise<boolean> => {
    if (!email) return false;

    // Robust check for the '@escoteiros' domain as per memory instructions
    const isEscoteiro = email.endsWith('@escoteiros.org.br') ||
                        email.endsWith('@escoteiros.org') ||
                        email.endsWith('@escoteiros.com.br');

    // Fallback to memory's literal requirement if the above are not inclusive enough
    const matchesMemoryLiteral = email.split('@')[1]?.startsWith('escoteiros');

    if (!isEscoteiro && !matchesMemoryLiteral) {
        return false;
    }

    try {
        // Document ID is the user's email as per memory
        const userRef = doc(db, "allowed_users", email);
        const snapshot = await getDoc(userRef);
        return snapshot.exists();
    } catch (error) {
        console.error("Error checking if email is authorized: ", error);
        return false;
    }
};

/**
 * Fetches the user's role from the 'allowed_users' collection.
 */
export const getUserRole = async (email: string): Promise<UserRole | null> => {
    try {
        const userRef = doc(db, "allowed_users", email);
        const snapshot = await getDoc(userRef);
        if (snapshot.exists()) {
            return snapshot.data().role as UserRole;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user role: ", error);
        return null;
    }
};

/**
 * Fetches all authorized users.
 */
export const getAllowedUsers = async (): Promise<AllowedUser[]> => {
    try {
        const querySnapshot = await getDocs(allowedUsersCollection);
        return querySnapshot.docs.map(doc => ({
            email: doc.id,
            role: doc.data().role as UserRole
        }));
    } catch (error) {
        console.error("Error fetching allowed users: ", error);
        return [];
    }
};

/**
 * Adds or updates an authorized user.
 */
export const addAllowedUser = async (email: string, role: UserRole): Promise<void> => {
    try {
        const userRef = doc(db, "allowed_users", email);
        await setDoc(userRef, { role });
    } catch (error) {
        console.error("Error adding allowed user: ", error);
        throw error;
    }
};

/**
 * Removes an authorized user.
 */
export const removeAllowedUser = async (email: string): Promise<void> => {
    try {
        const userRef = doc(db, "allowed_users", email);
        await deleteDoc(userRef);
    } catch (error) {
        console.error("Error removing allowed user: ", error);
        throw error;
    }
};
