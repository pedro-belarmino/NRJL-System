import { createContext } from 'react';
import type { AuthState } from '../../types/auth';

export interface AuthContextType extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
