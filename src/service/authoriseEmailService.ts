import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

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
