import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { Role, UserProfile } from '../types/auth';

const ALLOWED_DOMAIN = '@escoteiros';

export const loginWithGoogle = async (): Promise<UserProfile> => {
  const provider = new GoogleAuthProvider();
  // Force selection of account
  provider.setCustomParameters({ prompt: 'select_account' });

  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  if (!user.email) {
    await signOut(auth);
    throw new Error('No email associated with this Google account.');
  }

  // Domain restriction
  if (!user.email.endsWith(ALLOWED_DOMAIN)) {
    await signOut(auth);
    throw new Error(`Access restricted. Only ${ALLOWED_DOMAIN} emails are allowed.`);
  }

  // Whitelist and Role validation
  try {
    const role = await fetchUserRole(user.email);
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role,
    };
  } catch (error) {
    await signOut(auth);
    throw error;
  }
};

export const fetchUserRole = async (email: string): Promise<Role> => {
  const docRef = doc(db, 'allowed_users', email);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('User not whitelisted in the system.');
  }

  const data = docSnap.data();
  if (!data.role) {
    throw new Error('User has no assigned role.');
  }

  return data.role as Role;
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const addToWhitelist = async (email: string, role: Role): Promise<void> => {
  const docRef = doc(db, 'allowed_users', email);
  await setDoc(docRef, { email, role });
};

export const mapFirebaseUserToProfile = async (user: FirebaseUser): Promise<UserProfile | null> => {
  if (!user.email || !user.email.endsWith(ALLOWED_DOMAIN)) {
    return null;
  }

  try {
    const role = await fetchUserRole(user.email);
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role,
    };
  } catch {
    return null;
  }
};
