import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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
    // Ensure persistence is set immediately on initialization
    void setPersistence(auth, browserLocalPersistence);
  } catch (err) {
    console.warn('[CivicPulse Firebase] Initialization notice:', err);
  }
}

export { auth };

/**
 * Sign in with Email and Password using Firebase Auth.
 */
export async function signInWithEmail(email: string, pass: string): Promise<User | null> {
  if (!auth) {
    throw new Error('FIREBASE_NOT_CONFIGURED: Missing client credentials.');
  }
  console.log('[CivicPulse Auth] Initiating Email Sign-In...');
  const result = await signInWithEmailAndPassword(auth, email, pass);
  console.log('[CivicPulse Auth] Email sign-in successful:', result.user.email);
  return result.user;
}

/**
 * Create a new account with Email and Password using Firebase Auth.
 */
export async function signUpWithEmail(email: string, pass: string): Promise<User | null> {
  if (!auth) {
    throw new Error('FIREBASE_NOT_CONFIGURED: Missing client credentials.');
  }
  console.log('[CivicPulse Auth] Initiating Email Sign-Up...');
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  console.log('[CivicPulse Auth] Email sign-up successful:', result.user.email);
  return result.user;
}

/**
 * Sign in with Google using Firebase Auth.
 */
export async function signInWithGoogle(): Promise<User | null> {
  if (!auth) {
    throw new Error('FIREBASE_NOT_CONFIGURED: Missing client credentials.');
  }

  console.log('[CivicPulse Auth] Initiating Google Sign-In (Popup)...');
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log('[CivicPulse Auth] Popup sign-in successful:', result.user.email);
    return result.user;
  } catch (err: any) {
    const code = err?.code || '';
    console.warn('[CivicPulse Auth] Popup sign-in failed/blocked:', code, err.message);
    
    // If popup is strictly blocked by browser policy, fallback to redirect
    if (code === 'auth/popup-blocked') {
      console.log('[CivicPulse Auth] Popup blocked, falling back to Redirect mode...');
      try {
        await signInWithRedirect(auth, googleProvider);
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
  return onAuthStateChanged(auth, callback, (error) => {
    console.error('[CivicPulse Auth] onAuthStateChanged error:', error);
    callback(null);
  });
}
