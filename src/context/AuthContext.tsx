import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { User } from 'firebase/auth';
import { 
  signInWithGoogle as firebaseSignIn, 
  signOutUser as firebaseSignOut, 
  getCurrentIdToken, 
  onAuthChange,
  isFirebaseConfigured 
} from '../services/firebase.js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isFirebaseConfigured: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  getIdToken: async () => null,
  error: null,
  clearError: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setError(null);
    try {
      await firebaseSignIn();
    } catch (err: any) {
      const msg = err?.message || 'Authentication failed';
      console.warn('[CivicPulse Auth Error]:', msg);
      setError(msg);
      throw err;
    }
  };

  const handleSignOut = async () => {
    setError(null);
    try {
      await firebaseSignOut();
      setUser(null);
    } catch (err: any) {
      setError(err?.message || 'Sign out failed');
    }
  };

  const clearError = () => setError(null);

  const value = useMemo(() => ({
    user,
    loading,
    isFirebaseConfigured,
    signInWithGoogle: handleSignIn,
    signOut: handleSignOut,
    getIdToken: getCurrentIdToken,
    error,
    clearError,
  }), [user, loading, error]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}
