type FirebaseAuthErrorLike = { code?: unknown };

export const SIGN_IN_REDIRECT_TIMEOUT_MESSAGE = 'Google sign-in did not redirect. Please try again. If this continues, check the Firebase and Vercel sign-in settings.';

export function resolveFirebaseAuthDomain(
  configuredDomain: string | undefined,
  projectId: string | undefined,
  appHostname?: string
): string {
  const hostname = appHostname?.toLowerCase();
  if (hostname?.endsWith('.vercel.app')) return hostname;
  return configuredDomain || (projectId ? `${projectId}.firebaseapp.com` : '');
}

export function firebaseAuthErrorCode(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null;
  const code = (error as FirebaseAuthErrorLike).code;
  return typeof code === 'string' ? code : null;
}

export function firebaseAuthErrorMessage(error: unknown): string {
  switch (firebaseAuthErrorCode(error)) {
    case 'auth/popup-blocked':
      return 'Google sign-in was blocked before it started. Refresh CivicPulse and try again. If this continues, the deployed page may still be using an older sign-in build.';
    case 'auth/unauthorized-domain':
      return 'Google sign-in is not enabled for this CivicPulse domain. The site administrator needs to add the production domain in Firebase Authentication settings.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled for this Firebase project.';
    case 'auth/web-storage-unsupported':
    case 'auth/unsupported-persistence-type':
      return 'This browser could not keep the sign-in session. Try again in a browser with site storage enabled.';
    default:
      return 'Google sign-in could not be completed. Please try again.';
  }
}

export async function startGoogleRedirectFlow<Auth, Provider, Persistence>(
  auth: Auth,
  provider: Provider,
  persistences: readonly Persistence[],
  setPersistence: (auth: Auth, persistence: Persistence) => Promise<unknown>,
  signInWithRedirect: (auth: Auth, provider: Provider) => Promise<unknown>
): Promise<void> {
  let persistenceReady = false;
  for (let index = 0; index < persistences.length; index += 1) {
    try {
      await setPersistence(auth, persistences[index]);
      persistenceReady = true;
      break;
    } catch (error) {
      const code = firebaseAuthErrorCode(error);
      const canTrySessionPersistence = code === 'auth/web-storage-unsupported' || code === 'auth/unsupported-persistence-type';
      if (!canTrySessionPersistence || index === persistences.length - 1) throw error;
    }
  }
  if (!persistenceReady) throw new Error('No supported browser persistence is available.');
  await signInWithRedirect(auth, provider);
}

export function createRedirectResultReader<Auth, Result>(
  auth: Auth,
  getRedirectResult: (auth: Auth) => Promise<Result>
): () => Promise<Result> {
  let resultPromise: Promise<Result> | undefined;
  return () => {
    resultPromise ??= getRedirectResult(auth);
    return resultPromise;
  };
}

export async function consumeGoogleRedirectResult<User, Result extends { user?: User }>(
  readResult: () => Promise<Result | null>,
  onAuthenticated: (user: User) => void,
  onError: (error: unknown) => void
): Promise<void> {
  try {
    const result = await readResult();
    if (result?.user) onAuthenticated(result.user);
  } catch (error) {
    onError(error);
  }
}

export function applyFirebaseAuthState<User>(
  user: User | null,
  setUser: (user: User | null) => void,
  setLoading: (loading: boolean) => void
): void {
  setUser(user);
  setLoading(false);
}

/**
 * Firebase redirect sign-in normally navigates away before its promise settles.
 * Bound the UI wait so a blocked or stalled navigation cannot leave the form
 * permanently disabled. The page unloads normally when redirect succeeds.
 */
export async function runRedirectSignInAttempt(
  signIn: () => Promise<void>,
  setLoading: (loading: boolean) => void,
  timeoutMs = 30_000
): Promise<void> {
  setLoading(true);
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      signIn(),
      new Promise<never>((_resolve, reject) => {
        timeout = setTimeout(() => reject(new Error(SIGN_IN_REDIRECT_TIMEOUT_MESSAGE)), timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
    setLoading(false);
  }
}
