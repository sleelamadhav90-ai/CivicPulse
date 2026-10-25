import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { User } from 'firebase/auth';
import {
  signInWithGoogle as firebaseSignIn,
  signOutUser as firebaseSignOut,
  getCurrentIdToken,
  onAuthChange,
  isFirebaseConfigured,
  processGoogleRedirect
} from '../services/firebase';

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

    let isMounted = true;
    let timeoutId: any = null;

    const complete = () => {
      if (isMounted) {
        setLoading(false);
        if (timeoutId) clearTimeout(timeoutId);
      }
    };

    // Robust listener for any auth state changes (sign-in, sign-out, session restore)
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (!isMounted) return;
      console.log('[CivicPulse Auth] Listener detected state:', firebaseUser?.email || 'Anonymous');
      setUser(firebaseUser);
      complete();
    });

    // Check for redirect result (standard Firebase initialization step)
    // We run this in parallel with the listener; either one finishing is enough to show the UI
    void (async () => {
      try {
        const result = await processGoogleRedirect();
        if (result && isMounted) {
          console.log('[CivicPulse Auth] Redirect user detected:', result.email);
          setUser(result);
        }
      } catch (err: any) {
        if (isMounted && err?.code !== 'auth/popup-closed-by-user') {
          console.error('[CivicPulse Auth] Redirect error:', err);
          setError(err?.message || 'Authentication redirect failed');
        }
      } finally {
        complete();
      }
    })();

    // Safety timeout: Never leave the user on "Checking..." for more than 4.5 seconds.
    // If Firebase is blocked or slow, we proceed in an unauthenticated/anonymous state.
    timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('[CivicPulse Auth] Initialization exceeded threshold. Forcing ready state.');
        setLoading(false);
      }
    }, 4500);

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    setError(null);
    console.log('[CivicPulse Auth] Sign-in requested');
    try {
      await firebaseSignIn();
    } catch (err: any) {
      let msg = err?.message || 'Authentication failed';
      const code = err?.code || '';

      if (code === 'auth/unauthorized-domain') {
        msg = `Domain Unauthorized: Please add "${window.location.hostname}" to your Firebase Console → Authentication → Settings → Authorized domains.`;
      } else if (code === 'auth/popup-closed-by-user') {
        msg = 'Sign-in window closed before completion.';
      } else if (code === 'auth/popup-blocked') {
        msg = 'The sign-in popup was blocked by your browser. Please allow popups and try again.';
      } else if (code === 'auth/operation-not-allowed') {
        msg = 'Google Sign-In is not enabled in the Firebase Console.';
      }

      console.warn('[CivicPulse Auth Error]:', code, msg);
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
