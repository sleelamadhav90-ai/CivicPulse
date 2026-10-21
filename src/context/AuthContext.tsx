import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { User } from 'firebase/auth';
import { 
  signInWithGoogle as firebaseSignIn, 
  signOutUser as firebaseSignOut, 
  getCurrentIdToken, 
  onAuthChange,
  getGoogleRedirectResult,
  isFirebaseConfigured 
} from '../services/firebase.js';
import { applyFirebaseAuthState, consumeGoogleRedirectResult, firebaseAuthErrorCode, firebaseAuthErrorMessage } from '../services/firebaseAuthFlow.js';

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

    let active = true;
    const unsubscribe = onAuthChange(
      (firebaseUser) => {
        if (!active) return;
        applyFirebaseAuthState(firebaseUser, setUser, setLoading);
      },
      (authError) => {
        if (!active) return;
        console.warn('[CivicPulse Auth Error]', firebaseAuthErrorCode(authError) || 'unknown');
        setError(firebaseAuthErrorMessage(authError));
        setLoading(false);
      }
    );

    void consumeGoogleRedirectResult(
      getGoogleRedirectResult,
      (firebaseUser) => {
        if (active) setUser(firebaseUser);
      },
      (authError) => {
        if (!active) return;
        console.warn('[CivicPulse Auth Error]', firebaseAuthErrorCode(authError) || 'unknown');
        setError(firebaseAuthErrorMessage(authError));
      }
    )
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    setError(null);
    try {
      await firebaseSignIn();
    } catch (err: any) {
      const msg = firebaseAuthErrorMessage(err);
      console.warn('[CivicPulse Auth Error]', firebaseAuthErrorCode(err) || 'unknown');
      setError(msg);
      throw new Error(msg);
    }
  };

  const handleSignOut = async () => {
    setError(null);
    try {
      await firebaseSignOut();
      setUser(null);
    } catch (err: any) {
      console.warn('[CivicPulse Auth Error]', firebaseAuthErrorCode(err) || 'unknown');
      setError('Sign-out could not be completed. Please try again.');
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
