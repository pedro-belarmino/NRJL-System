import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config/firebase';
import type { AuthState } from '../../types/auth';
import { mapFirebaseUserToProfile, loginWithGoogle, logoutUser } from '../../services/authService';
import { AuthContext } from './AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const login = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const userProfile = await loginWithGoogle();
      setState({ user: userProfile, loading: false, error: null });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setState({ user: null, loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
      setState({ user: null, loading: false, error: null });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userProfile = await mapFirebaseUserToProfile(firebaseUser);
          if (userProfile) {
            setState({ user: userProfile, loading: false, error: null });
          } else {
            await logoutUser();
            setState({ user: null, loading: false, error: 'Access denied. Account not authorized.' });
          }
        } catch {
          await logoutUser();
          setState({ user: null, loading: false, error: 'Authentication error.' });
        }
      } else {
        setState({ user: null, loading: false, error: null });
      }
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo(() => ({
    ...state,
    login,
    logout,
  }), [state, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
