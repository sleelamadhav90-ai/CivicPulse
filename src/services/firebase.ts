/// <reference types="vite/client" />
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  signOut, 
  onAuthStateChanged, 
  User, 
  Auth,
  UserCredential,
} from 'firebase/auth';
import { createRedirectResultReader, firebaseAuthDomainMismatch, resolveFirebaseAuthDomain, startGoogleRedirectFlow } from './firebaseAuthFlow.js';
/**
 * Firebase Client Configuration
 * Uses Vite client environment variables (VITE_FIREBASE_*).
 * Strictly avoids hardcoded credentials.
 */
const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || '',
  authDomain: resolveFirebaseAuthDomain(
    env.VITE_FIREBASE_AUTH_DOMAIN,
    env.VITE_FIREBASE_PROJECT_ID
  ),
  projectId: env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('placeholder') &&
  !firebaseConfig.apiKey.includes('your-')
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch (err) {
    console.warn('[CivicPulse Firebase] Client initialization failed:', err);
  }
}

export { auth };

const readGoogleRedirectResult: () => Promise<UserCredential | null> = auth
  ? createRedirectResultReader(auth, getRedirectResult)
  : async () => null;

/**
 * Resolve the result (or error) from a completed Google redirect once at app startup.
 */
export function getGoogleRedirectResult(): Promise<UserCredential | null> {
  return readGoogleRedirectResult();
}

/**
 * Sign in with Google using redirect.
 * The auth state listener and getRedirectResult complete the sign-in after redirect.
 */
export async function signInWithGoogle(): Promise<void> {
  if (!auth) {
    throw new Error('FIREBASE_NOT_CONFIGURED: Firebase Authentication is not configured with client credentials.');
  }

  if (typeof window !== 'undefined' && firebaseAuthDomainMismatch(firebaseConfig.authDomain, window.location.hostname)) {
    throw Object.assign(new Error('Firebase authDomain must match the stable site hostname.'), {
      code: 'auth/auth-domain-mismatch',
    });
  }

  await startGoogleRedirectFlow(
    auth,
    googleProvider,
    [browserLocalPersistence, browserSessionPersistence],
    setPersistence,
    signInWithRedirect
  );
}

/**
 * Sign out current authenticated user.
 */
export async function signOutUser(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}

/**
 * Retrieves the current Firebase ID token (force refresh if needed).
 */
export async function getCurrentIdToken(forceRefresh = false): Promise<string | null> {
  if (!auth || !auth.currentUser) return null;
  return auth.currentUser.getIdToken(forceRefresh);
}

/**
 * Subscribe to authentication state changes.
 */
export function onAuthChange(
  callback: (user: User | null) => void,
  onError?: (error: Error) => void
): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback, onError);
}
