import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth"
import { auth, db } from "../firebase/config";
import { doc, setDoc, Timestamp, getDoc } from "firebase/firestore";
import { isEmailAuthorized, getUserRole, type UserRole } from "../service/authoriseEmailService";

type AuthContextType = {
    user: User | null;
    loading: boolean;
    isAuthorized: boolean;
    role: UserRole | null;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAuthorized: false,
    role: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            try {
                if (currentUser && currentUser.email) {
                    const authorized = await isEmailAuthorized(currentUser.email);
                    setIsAuthorized(authorized);

                    if (authorized) {
                        const userRole = await getUserRole(currentUser.email);
                        setRole(userRole);

                        const userRef = doc(db, "users", currentUser.uid);
                        const snapshot = await getDoc(userRef);

                        if (!snapshot.exists()) {
                            await setDoc(userRef, {
                                uid: currentUser.uid,
                                displayName: currentUser.displayName,
                                email: currentUser.email,
                                photoURL: currentUser.photoURL,
                                createdAt: Timestamp.now(),
                                role: userRole,
                            });
                        }
                    } else {
                        setRole(null);
                    }

                    setUser(currentUser);
                } else {
                    setUser(null);
                    setIsAuthorized(false);
                    setRole(null);
                }
            } catch (error) {
                console.error("Auth status error: ", error);
                setUser(null);
                setIsAuthorized(false);
                setRole(null);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, isAuthorized, role }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
