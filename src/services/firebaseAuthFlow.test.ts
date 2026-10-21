import {
  createRedirectResultReader,
  consumeGoogleRedirectResult,
  applyFirebaseAuthState,
  firebaseAuthErrorCode,
  firebaseAuthErrorMessage,
  resolveFirebaseAuthDomain,
  runRedirectSignInAttempt,
  SIGN_IN_REDIRECT_TIMEOUT_MESSAGE,
  startGoogleRedirectFlow,
} from './firebaseAuthFlow.js';

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

async function runFirebaseAuthFlowTests() {
  const events: string[] = [];
  const auth = { id: 'auth' };
  const provider = { id: 'google' };
  const localPersistence = { id: 'local' };
  const sessionPersistence = { id: 'session' };

  await startGoogleRedirectFlow(
    auth,
    provider,
    [localPersistence, sessionPersistence],
    async (receivedAuth, receivedPersistence) => {
      assert(receivedAuth === auth && receivedPersistence === localPersistence, 'Redirect flow prefers local persistence when available');
      events.push('persistence');
    },
    async (receivedAuth, receivedProvider) => {
      assert(receivedAuth === auth && receivedProvider === provider, 'Redirect flow uses the shared Google provider and Firebase auth instance');
      events.push('redirect');
    }
  );
  assert(events.join(',') === 'persistence,redirect', 'Persistence is configured before starting the full-page redirect');

  const persistenceFallback: string[] = [];
  await startGoogleRedirectFlow(
    auth,
    provider,
    [localPersistence, sessionPersistence],
    async (_receivedAuth, receivedPersistence) => {
      if (receivedPersistence === localPersistence) {
        persistenceFallback.push('local-unavailable');
        throw { code: 'auth/unsupported-persistence-type' };
      }
      persistenceFallback.push('session');
    },
    async () => { persistenceFallback.push('redirect'); }
  );
  assert(persistenceFallback.join(',') === 'local-unavailable,session,redirect', 'Redirect falls back to session storage if persistent storage is unavailable');

  let redirectStartedAfterPersistenceFailure = false;
  try {
    await startGoogleRedirectFlow(
      auth,
      provider,
      [localPersistence, sessionPersistence],
      async () => { throw new Error('storage unavailable'); },
      async () => { redirectStartedAfterPersistenceFailure = true; }
    );
  } catch {
    // The error is intentionally propagated to AuthContext for a visible message.
  }
  assert(!redirectStartedAfterPersistenceFailure, 'Redirect does not start when browser persistence cannot be established');

  const result = { user: { uid: 'firebase-user' } };
  let redirectResultReads = 0;
  const readRedirectResult = createRedirectResultReader(auth, async (receivedAuth) => {
    assert(receivedAuth === auth, 'Redirect result is read from the configured Firebase auth instance');
    redirectResultReads += 1;
    return result;
  });
  const [firstResult, secondResult] = await Promise.all([readRedirectResult(), readRedirectResult()]);
  assert(firstResult === result && secondResult === result, 'Redirect result is shared across repeated initialization calls');
  assert(redirectResultReads === 1, 'Redirect result is consumed once, including under React StrictMode');

  assert(
    resolveFirebaseAuthDomain('civicpulse-13c03.firebaseapp.com', 'civicpulse-13c03', 'civic-pulse-pr-123-slm15.vercel.app') === 'civic-pulse-pr-123-slm15.vercel.app',
    'Vercel deployments use their current hostname for the same-domain Firebase auth proxy'
  );
  assert(
    resolveFirebaseAuthDomain('custom-auth.example.com', 'civicpulse-13c03', 'localhost') === 'custom-auth.example.com',
    'Non-Vercel hosts preserve their explicitly configured auth domain'
  );
  assert(
    resolveFirebaseAuthDomain(undefined, 'civicpulse-13c03') === 'civicpulse-13c03.firebaseapp.com',
    'Firebase project host remains the fallback when no app hostname is available'
  );

  const redirectedUser = { uid: 'redirect-user' };
  let currentUser: typeof redirectedUser | null = null;
  let redirectError: unknown;
  await consumeGoogleRedirectResult<typeof redirectedUser, { user: typeof redirectedUser }>(
    async () => ({ user: redirectedUser }),
    (user) => { currentUser = user; },
    (error) => { redirectError = error; }
  );
  assert(currentUser === redirectedUser && !redirectError, 'A successful redirect result updates the authenticated-user state');

  const redirectFailure = { code: 'auth/network-request-failed' };
  await consumeGoogleRedirectResult(
    async () => { throw redirectFailure; },
    () => {},
    (error) => { redirectError = error; }
  );
  assert(redirectError === redirectFailure, 'Redirect-result errors are delivered to the authentication context');

  let listenerUser: typeof redirectedUser | null | undefined;
  let authLoading = true;
  applyFirebaseAuthState(redirectedUser, (user) => { listenerUser = user; }, (loading) => { authLoading = loading; });
  assert(listenerUser === redirectedUser && !authLoading, 'Firebase auth-state events update the user and release auth loading');

  assert(firebaseAuthErrorCode({ code: 'auth/unauthorized-domain', message: 'private error text' }) === 'auth/unauthorized-domain', 'Auth diagnostics expose only the Firebase error code');
  assert(firebaseAuthErrorMessage({ code: 'auth/unauthorized-domain' }).includes('add the production domain'), 'Unauthorized domains get an actionable message');
  assert(firebaseAuthErrorMessage({ code: 'auth/operation-not-allowed' }).includes('not enabled'), 'Disabled Google provider gets an actionable message');
  assert(firebaseAuthErrorMessage({ code: 'auth/popup-blocked' }).includes('older sign-in build'), 'Popup-blocked errors explain the likely stale-build cause without browser-permission advice');
  assert(!firebaseAuthErrorMessage({ code: 'auth/unknown', message: 'private error text' }).includes('private error text'), 'Unexpected Firebase details are not shown to users');

  let loading = false;
  await runRedirectSignInAttempt(async () => {}, (value) => { loading = value; }, 50);
  assert(!loading, 'A resolved sign-in attempt clears the loading state');

  let rejectedAttemptLoading = false;
  try {
    await runRedirectSignInAttempt(async () => { throw new Error('sign-in failed'); }, (value) => { rejectedAttemptLoading = value; }, 50);
  } catch {
    // Failure should propagate to the form while still releasing its spinner.
  }
  assert(!rejectedAttemptLoading, 'A rejected sign-in attempt clears the loading state');

  let stalledAttemptLoading = false;
  let timeoutMessage = '';
  try {
    await runRedirectSignInAttempt(() => new Promise<void>(() => {}), (value) => { stalledAttemptLoading = value; }, 5);
  } catch (error) {
    timeoutMessage = error instanceof Error ? error.message : '';
  }
  assert(!stalledAttemptLoading, 'A stalled redirect attempt releases the loading state');
  assert(timeoutMessage === SIGN_IN_REDIRECT_TIMEOUT_MESSAGE, 'A stalled redirect reports an actionable timeout error');

  console.log('✅ Firebase redirect flow, persistence order, result handling, and safe error messages passed.');
}

runFirebaseAuthFlowTests().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
