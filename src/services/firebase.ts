/// <reference types="vite/client" />
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithRedirect,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence,
  getRedirectResult,
  User,
  Auth
} from 'firebase/auth';
/**
 * Firebase Client Configuration
 * Uses Vite client environment variables (VITE_FIREBASE_*).
 * Strictly avoids hardcoded credentials.
 */
const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
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

/**
 * Sign in with Google using redirect.
 * Firebase's auth state listener detects the signed-in user after redirect.
 */
export async function signInWithGoogle(): Promise<void> {
  if (!auth) {
    throw new Error(
      'FIREBASE_NOT_CONFIGURED: Firebase Authentication is not configured with client credentials.'
    );
  }

  await setPersistence(auth, browserLocalPersistence);
  await signInWithRedirect(auth, googleProvider);
}
/**
 * Process a pending Google sign-in redirect.
 */
export async function processGoogleRedirect(): Promise<void> {
  if (!auth) return;

  try {
    await setPersistence(auth, browserLocalPersistence);
    await getRedirectResult(auth);
  } catch (err) {
    console.error(
      '[CivicPulse] Google redirect processing failed:',
      err
    );
    throw err;
  }
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
export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
