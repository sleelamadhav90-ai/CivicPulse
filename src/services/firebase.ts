import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup,
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

const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyD3s6Gl7Js5kA5cA_N3cYGqmDwp1Ld25bk',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'civicpulse-13c03.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'civicpulse-13c03',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'civicpulse-13c03.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '352885978716',
  appId: env.VITE_FIREBASE_APP_ID || '1:352885978716:web:7a6d575fe3a2b356889899',
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
    // Ensure persistence is set immediately
    void setPersistence(auth, browserLocalPersistence);
  } catch (err) {
    console.warn('[CivicPulse Firebase] Initialization notice:', err);
  }
}

export { auth };

/**
 * Sign in with Google.
 * Uses Popup by default for smoother UX on Vercel/Desktop.
 * Falls back to Redirect only if explicitly required or if popup is blocked (handled in UI).
 */
export async function signInWithGoogle(): Promise<User | null> {
  if (!auth) {
    throw new Error('FIREBASE_NOT_CONFIGURED: Missing client credentials.');
  }

  console.log('[CivicPulse Auth] Initiating Google Sign-In (Popup)...');
  try {
    await setPersistence(auth, browserLocalPersistence);
    const result = await signInWithPopup(auth, googleProvider);
    console.log('[CivicPulse Auth] Popup sign-in successful:', result.user.email);
    return result.user;
  } catch (err: any) {
    const code = err?.code || '';
    console.warn('[CivicPulse Auth] Popup sign-in failed/blocked:', code, err.message);
    
    // If popup is blocked or closed, or we are in a restrictive environment, fallback to redirect
    if (code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      console.log('[CivicPulse Auth] Falling back to Redirect mode...');
      try {
        await signInWithRedirect(auth, googleProvider);
        // Execution stops here as the page redirects
        return null;
      } catch (redirectErr: any) {
        console.error('[CivicPulse Auth] Redirect initiation failed:', redirectErr.code, redirectErr.message);
        throw redirectErr;
      }
    }
    
    throw err;
  }
}

/**
 * Process a pending Google sign-in redirect result.
 */
export async function processGoogleRedirect(): Promise<User | null> {
  if (!auth) return null;

  try {
    const result = await getRedirectResult(auth);
    if (result) {
      console.log('[CivicPulse Auth] Redirect result processed:', result.user.email);
      return result.user;
    }
    return null;
  } catch (err: any) {
    console.error('[CivicPulse Auth] Redirect processing failed:', err.code, err.message);
    throw err;
  }
}

export async function signOutUser(): Promise<void> {
  if (!auth) return;
  console.log('[CivicPulse Auth] Signing out...');
  await signOut(auth);
}

export async function getCurrentIdToken(forceRefresh = false): Promise<string | null> {
  if (!auth || !auth.currentUser) return null;
  return auth.currentUser.getIdToken(forceRefresh);
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
