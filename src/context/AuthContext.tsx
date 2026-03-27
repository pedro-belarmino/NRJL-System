import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth"
import { auth, db } from "../firebase/config";
import { doc, setDoc, Timestamp, getDoc } from "firebase/firestore";

export type ProfileRole = "coordenador" | "facilitador" | "desenvolvedor";

type AuthContextType = {
    user: User | null;
    profile: ProfileRole | null;
    loading: boolean;
    isAuthorized: boolean;
    error: string | null;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    isAuthorized: false,
    error: null,
});

const ALLOWED_DOMAIN = "@escoteiros.org.br";
const SUPERUSER_EMAIL = "pedro.belarmino@escoteiros.org.br";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<ProfileRole | null>(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setError(null);
            if (currentUser && currentUser.email) {
                const isSuperUser = currentUser.email === SUPERUSER_EMAIL;
                const hasAllowedDomain = currentUser.email.endsWith(ALLOWED_DOMAIN);

                if (!hasAllowedDomain && !isSuperUser) {
                    setError(`Apenas emails com o domínio ${ALLOWED_DOMAIN} são permitidos.`);
                    await signOut(auth);
                    setUser(null);
                    setProfile(null);
                    setIsAuthorized(false);
                    setLoading(false);
                    return;
                }

                try {
                    // Check if user is in allowed_users collection
                    const allowedUserRef = doc(db, "allowed_users", currentUser.email);
                    const allowedUserSnap = await getDoc(allowedUserRef);

                    if (allowedUserSnap.exists() || isSuperUser) {
                        const userData = allowedUserSnap.data();
                        const userRole: ProfileRole = isSuperUser ? "desenvolvedor" : (userData?.role as ProfileRole || "facilitador");

                        setProfile(userRole);
                        setIsAuthorized(true);

                        // Save or update user in 'users' collection for general info
                        const userRef = doc(db, "users", currentUser.uid);
                        await setDoc(userRef, {
                            uid: currentUser.uid,
                            displayName: currentUser.displayName,
                            email: currentUser.email,
                            photoURL: currentUser.photoURL,
                            role: userRole,
                            lastLogin: Timestamp.now(),
                        }, { merge: true });

                        setUser(currentUser);
                    } else {
                        setError("Seu e-mail não está na lista de usuários autorizados.");
                        await signOut(auth);
                        setUser(null);
                        setProfile(null);
                        setIsAuthorized(false);
                    }
                } catch (err) {
                    console.error("Error fetching user data:", err);
                    setError("Erro ao verificar autorização.");
                    await signOut(auth);
                }
            } else {
                setUser(null);
                setProfile(null);
                setIsAuthorized(false);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, profile, loading, isAuthorized, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
