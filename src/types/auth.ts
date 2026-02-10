export type Role = 'developer' | 'coordinator' | 'facilitator';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: Role;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export interface WhitelistUser {
  email: string;
  role: Role;
}
