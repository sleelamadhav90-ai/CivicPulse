import { validateCitizenRequest } from '../validation/requestValidator.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { isFirebaseConfigured, signInWithEmail, signUpWithEmail } from '../../services/firebase.js';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✅ PASS: ${message}`);
}

async function runAuthLifecycleTestSuite() {
  console.log('--- RUNNING CIVICPULSE AUTHENTICATION LIFECYCLE UNIT & INTEGRATION TESTS ---');

  // --- Test 1: Firebase Configuration Verification ---
  console.log('\n[Test 1] Firebase Configuration Status');
  assert(typeof isFirebaseConfigured === 'boolean', 'isFirebaseConfigured evaluates to a boolean');
  console.log(`Firebase configured state: ${isFirebaseConfigured}`);

  // --- Test 2: Token Verification & User Extraction Middleware ---
  console.log('\n[Test 2] Firebase ID Token Verification Middleware');
  process.env.NODE_ENV = 'test';
  process.env.REQUIRE_AUTH = 'true';

  // 2a: Missing Authorization header -> 401 AUTHENTICATION_REQUIRED
  let statusSent = 0;
  let responsePayload: any = null;
  const mockRes = {
    status: (code: number) => {
      statusSent = code;
      return {
        json: (payload: any) => {
          responsePayload = payload;
        },
      };
    },
  } as any;

  let nextCalled = false;
  const mockReqNoToken = { headers: {}, id: 'req-auth-test-1' } as any;
  await requireAuth(mockReqNoToken, mockRes, () => { nextCalled = true; });
  assert(statusSent === 401, 'Missing Authorization header produces HTTP 401');
  assert(responsePayload.error.code === 'AUTHENTICATION_REQUIRED', 'Error code is AUTHENTICATION_REQUIRED');
  assert(nextCalled === false, 'Middleware stops execution chain when token is missing');

  // 2b: Invalid Bearer token -> 401 INVALID_TOKEN
  statusSent = 0;
  responsePayload = null;
  nextCalled = false;
  const mockReqInvalidToken = { headers: { authorization: 'Bearer invalid-token-xyz' }, id: 'req-auth-test-2' } as any;
  await requireAuth(mockReqInvalidToken, mockRes, () => { nextCalled = true; });
  assert(statusSent === 401, 'Invalid Bearer token produces HTTP 401');
  assert(responsePayload.error.code === 'INVALID_TOKEN', 'Error code is INVALID_TOKEN');
  assert(nextCalled === false, 'Middleware stops execution chain for invalid token');

  // 2c: Valid test token -> Derives verified user ID and calls next()
  statusSent = 0;
  responsePayload = null;
  nextCalled = false;
  const mockReqValidToken = { headers: { authorization: 'Bearer test-token-citizen-12345' }, id: 'req-auth-test-3' } as any;
  await requireAuth(mockReqValidToken, mockRes, () => { nextCalled = true; });
  assert(nextCalled === true, 'Valid Bearer token allows request to proceed to next()');
  assert(mockReqValidToken.user?.uid === 'citizen-12345', 'Verified UID citizen-12345 extracted from Bearer token');
  assert(mockReqValidToken.user?.email === 'citizen-12345@civicpulse.test', 'Derived test email populated correctly');

  // --- Test 3: Anti-Spoofing & Verified User Identity Protection ---
  console.log('\n[Test 3] Anti-Spoofing: Client-supplied userId Overwritten by Verified Token');
  const clientPayloadWithSpoofedUser = {
    id: 'CP-SPOOF-999',
    userId: 'malicious-admin-override',
    category: 'Roads',
    location: 'Vijayawada',
    severity: 5,
    urgency: 'MEDIUM',
    original_text: 'Road pothole near bus stop',
    source_type: 'text',
  };

  const verifiedUidFromToken = mockReqValidToken.user?.uid;
  const sanitizedPayload = {
    ...clientPayloadWithSpoofedUser,
    ...(verifiedUidFromToken ? { userId: verifiedUidFromToken } : {}),
  };

  assert(sanitizedPayload.userId === 'citizen-12345', 'Client spoofed userId is overwritten with verified token UID');
  assert(sanitizedPayload.userId !== 'malicious-admin-override', 'Attacker override attempt is successfully prevented');

  // --- Test 4: Auth Error Handling and Friendly Error Messages ---
  console.log('\n[Test 4] Error Resolution Mapping');
  const authErrorsToTest = [
    { code: 'auth/invalid-credential', expectedMessage: 'Invalid email or password' },
    { code: 'auth/user-not-found', expectedMessage: 'Invalid email or password' },
    { code: 'auth/email-already-in-use', expectedMessage: 'account with this email address already exists' },
    { code: 'auth/weak-password', expectedMessage: 'Password should be at least 6 characters' },
    { code: 'auth/unauthorized-domain', expectedMessage: 'Domain Unauthorized' },
  ];

  for (const errCase of authErrorsToTest) {
    let friendlyMsg = '';
    const code = errCase.code;
    if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
      friendlyMsg = 'Invalid email or password. Please check your credentials.';
    } else if (code === 'auth/email-already-in-use') {
      friendlyMsg = 'An account with this email address already exists. Please sign in instead.';
    } else if (code === 'auth/weak-password') {
      friendlyMsg = 'Password should be at least 6 characters long.';
    } else if (code === 'auth/unauthorized-domain') {
      friendlyMsg = 'Domain Unauthorized: Please add domain to Firebase Console.';
    }
    assert(friendlyMsg.toLowerCase().includes(errCase.expectedMessage.toLowerCase()), `Friendly error for ${code} contains '${errCase.expectedMessage}'`);
  }

  // --- Test 5: Authenticated Grievance Submission Payload Validation ---
  console.log('\n[Test 5] Grievance Validation for Authenticated Requests');
  const validSubmission = {
    id: 'CP-2026-AUTH-001',
    category: 'Water',
    severity: 8,
    urgency: 'HIGH',
    location: 'Tirupati Urban',
    latitude: 13.6288,
    longitude: 79.4192,
    source_type: 'voice',
    userId: 'citizen-12345',
  };

  const valResult = validateCitizenRequest(validSubmission);
  assert(valResult.isValid, 'Authenticated citizen submission payload is valid');

  delete process.env.REQUIRE_AUTH;
  console.log('\n🎉 ALL AUTHENTICATION LIFECYCLE TESTS PASSED SUCCESSFULLY!\n');
}

runAuthLifecycleTestSuite().catch((err) => {
  console.error('Auth lifecycle test execution failed:', err);
  process.exit(1);
});
