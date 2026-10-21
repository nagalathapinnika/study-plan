import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentProfile } from '../types.js';
import { api, getToken, setToken, clearToken } from '../services/api.js';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.js';
import { firestoreSync } from '../services/firestoreSync.js';

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfileState: (p: StudentProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      const storedToken = getToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await api.getMe();
        setUser(data.user);
        setProfile(data.profile);
      } catch (err) {
        console.warn('Session expired or invalid token:', err);
        clearToken();
        setTokenState(null);
        setUser(null);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await api.login({ email, password: pass });
      setToken(data.token);
      setTokenState(data.token);
      setUser(data.user);
      setProfile(data.profile);
      if (auth.currentUser) {
        firestoreSync.syncUserProfile(data.user, data.profile).catch(() => {});
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await userCredential.user.getIdToken();
      const data = await api.googleLogin(idToken);
      setToken(data.token);
      setTokenState(data.token);
      setUser(data.user);
      setProfile(data.profile);
      firestoreSync.syncUserProfile(data.user, data.profile).catch((err) => {
        console.warn('Firestore user profile sync error:', err);
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: any) => {
    setIsLoading(true);
    try {
      const data = await api.register(formData);
      setToken(data.token);
      setTokenState(data.token);
      setUser(data.user);
      setProfile(data.profile);
      if (auth.currentUser) {
        firestoreSync.syncUserProfile(data.user, data.profile).catch(() => {});
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearToken();
    setTokenState(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await api.getProfile();
      setUser(res.user);
      setProfile(res.profile);
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const updateProfileState = (p: StudentProfile) => {
    setProfile(p);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshProfile,
        updateProfileState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
