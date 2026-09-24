import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

/**
 * Firebase Admin SDK Initialization Module
 * Provides server-side token verification and Firestore connectivity.
 * Compatible with Vercel serverless execution (re-uses existing App instance).
 * Never hardcodes secrets: strictly reads environment variables.
 */

export function getFirebaseAdminApp(): App | null {
  const apps = getApps();
  if (apps.length > 0 && apps[0]) {
    return apps[0];
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim() || process.env.VITE_FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();

  try {
    if (serviceAccountJson) {
      // 1. Full JSON service account string
      const parsed = JSON.parse(serviceAccountJson);
      return initializeApp({
        credential: cert(parsed),
        projectId: parsed.project_id || projectId,
      });
    } else if (projectId && clientEmail && rawPrivateKey) {
      // 2. Distinct environment variables (common in Vercel)
      const privateKey = rawPrivateKey.replace(/\\n/g, '\n');
      return initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      });
    } else if (projectId) {
      // 3. Application Default Credentials (e.g. Cloud Run, GCP environment)
      return initializeApp({
        projectId,
      });
    }
  } catch (err: any) {
    console.warn('[CivicPulse Firebase Admin] Initialization notice:', err?.message || err);
  }

  return null;
}

export function isFirebaseAdminConfigured(): boolean {
  if (getApps().length > 0) return true;
  return Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) ||
    process.env.FIREBASE_PROJECT_ID
  );
}

export function getFirestoreDb(): Firestore | null {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  try {
    return getFirestore(app);
  } catch (err) {
    console.warn('[CivicPulse Firestore] Could not get Firestore instance:', err);
    return null;
  }
}

export interface DecodedAuthToken {
  uid: string;
  email?: string;
  emailVerified?: boolean;
}

/**
 * Verifies a Firebase ID token.
 * Extracts the authoritative decoded UID from the token.
 * In unit testing mode (NODE_ENV=test), supports structured test tokens.
 */
export async function verifyFirebaseIdToken(token: string): Promise<DecodedAuthToken> {
  if (!token || typeof token !== 'string') {
    throw new Error('TOKEN_MISSING: Missing or invalid authorization token format.');
  }

  // Unit Test Mock Token Handler (allows comprehensive unit tests without live network calls)
  if (process.env.NODE_ENV === 'test' && token.startsWith('test-token-')) {
    const uid = token.replace('test-token-', '');
    if (token === 'test-token-expired' || token === 'test-token-invalid') {
      throw new Error('TOKEN_EXPIRED_OR_INVALID: Token has expired or signature is invalid.');
    }
    return {
      uid: uid || 'test-user-default',
      email: `${uid}@civicpulse.test`,
      emailVerified: true,
    };
  }

  const app = getFirebaseAdminApp();
  if (!app) {
    // If running in development without Firebase credentials, allow dev fallback only if explicitly configured
    if (process.env.NODE_ENV === 'development' && token === 'dev-anonymous-token') {
      return { uid: 'dev-authenticated-citizen', email: 'citizen@civicpulse.local' };
    }
    throw new Error('FIREBASE_ADMIN_UNCONFIGURED: Server Firebase Admin SDK is not configured.');
  }

  const auth = getAuth(app);
  const decoded = await auth.verifyIdToken(token);
  return {
    uid: decoded.uid,
    email: decoded.email,
    emailVerified: decoded.email_verified,
  };
}
