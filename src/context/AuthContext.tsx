import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { User } from 'firebase/auth';
import {
  auth,
  signInWithGoogle as firebaseSignInWithGoogle,
  signInWithEmail as firebaseSignInWithEmail,
  signUpWithEmail as firebaseSignUpWithEmail,
  signOutUser as firebaseSignOut,
  getCurrentIdToken,
  isFirebaseConfigured,
  processGoogleRedirect
} from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
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
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
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
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Use Firebase's authoritative onAuthStateChanged listener as single source of truth
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (!isMounted) return;
        console.log('[CivicPulse Auth] Authoritative onAuthStateChanged:', firebaseUser?.email || 'Unauthenticated');
        setUser(firebaseUser);
        setLoading(false);
      },
      (authErr) => {
        console.error('[CivicPulse Auth] onAuthStateChanged error:', authErr);
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      }
    );

    // Handle any pending Google redirect result without overriding the listener
    void (async () => {
      try {
        const redirectUser = await processGoogleRedirect();
        if (redirectUser && isMounted) {
          console.log('[CivicPulse Auth] Processed Google redirect result:', redirectUser.email);
          setUser(redirectUser);
        }
      } catch (err: any) {
        if (isMounted && err?.code !== 'auth/popup-closed-by-user') {
          console.warn('[CivicPulse Auth] Redirect result notice:', err?.message || err);
        }
      }
    })();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleSignInWithEmail = async (email: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      const resultUser = await firebaseSignInWithEmail(email, pass);
      if (resultUser) {
        setUser(resultUser);
      }
    } catch (err: any) {
      let msg = err?.message || 'Email sign-in failed.';
      const code = err?.code || '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        msg = 'Invalid email or password. Please check your credentials.';
      } else if (code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (code === 'auth/too-many-requests') {
        msg = 'Too many failed login attempts. Please try again later.';
      }
      console.warn('[CivicPulse Auth] Email sign-in failed:', code, msg);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpWithEmail = async (email: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      const createdUser = await firebaseSignUpWithEmail(email, pass);
      if (createdUser) {
        setUser(createdUser);
      }
    } catch (err: any) {
      let msg = err?.message || 'Account creation failed.';
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        msg = 'An account with this email address already exists. Please sign in instead.';
      } else if (code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters long.';
      } else if (code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      console.warn('[CivicPulse Auth] Email sign-up failed:', code, msg);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSignInWithGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const googleUser = await firebaseSignInWithGoogle();
      if (googleUser) {
        setUser(googleUser);
      }
    } catch (err: any) {
      let msg = err?.message || 'Google sign-in failed.';
      const code = err?.code || '';
      if (code === 'auth/unauthorized-domain') {
        msg = `Domain Unauthorized: Please add "${window.location.hostname}" to Firebase Console → Authentication → Settings → Authorized domains.`;
      } else if (code === 'auth/popup-closed-by-user') {
        msg = 'Sign-in window was closed before completing authentication.';
      } else if (code === 'auth/popup-blocked') {
        msg = 'The sign-in popup was blocked by your browser. Please allow popups and try again.';
      }
      console.warn('[CivicPulse Auth] Google sign-in failed:', code, msg);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setError(null);
    setLoading(true);
    try {
      await firebaseSignOut();
      setUser(null);
    } catch (err: any) {
      console.warn('[CivicPulse Auth] Sign out notice:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value = useMemo(() => ({
    user,
    loading,
    isFirebaseConfigured,
    signInWithGoogle: handleSignInWithGoogle,
    signInWithEmail: handleSignInWithEmail,
    signUpWithEmail: handleSignUpWithEmail,
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
