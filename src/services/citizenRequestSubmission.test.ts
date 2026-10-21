import assert from 'node:assert/strict';
import type { CitizenRequest } from '../types.js';
import { submitCitizenRequest } from './citizenRequestSubmission.js';

const request = { id: 'CP-TEST-001', original_text: 'Water outage' } as CitizenRequest;

async function run() {
  let calls = 0;
  const httpFailure = await submitCitizenRequest(request, 'test-token', async () => {
    calls += 1;
    return { ok: false, status: 503, json: async () => ({ success: false, error: { message: 'Storage unavailable' } }) };
  }).then(() => null, (error: Error) => error);
  assert.equal(calls, 1, 'HTTP failure sends one request');
  assert.equal(httpFailure?.message, 'Storage unavailable', 'HTTP failure returns the server error');

  const networkFailure = await submitCitizenRequest(request, 'test-token', async () => {
    throw new TypeError('Network unavailable');
  }).then(() => null, (error: Error) => error);
  assert.equal(networkFailure?.message, 'Could not reach CivicPulse. Check your connection and try again.', 'Network failure is reported clearly');

  const unauthorized = await submitCitizenRequest(request, null, async () => ({
    ok: false,
    status: 401,
    json: async () => ({ success: false }),
  })).then(() => null, (error: Error) => error);
  assert.match(unauthorized?.message || '', /sign-in could not be verified/i, 'Authentication failure is reported as an error');

  const saved = { ...request, ownerUid: 'verified-owner' } as CitizenRequest;
  const result = await submitCitizenRequest(request, 'test-token', async (_url, init) => {
    assert.equal(init.method, 'POST', 'Successful save uses POST');
    assert.equal((init.headers as Record<string, string>).Authorization, 'Bearer test-token', 'Successful save sends the Firebase token');
    return { ok: true, status: 200, json: async () => ({ success: true, request: saved }) };
  });
  assert.equal(result, saved, 'Only the server-confirmed record is returned for receipt display');

  const falseSuccess = await submitCitizenRequest(request, 'test-token', async () => ({
    ok: true,
    status: 200,
    json: async () => ({ success: false }),
  })).then(() => null, (error: Error) => error);
  assert.match(falseSuccess?.message || '', /could not save/i, 'A response without server success confirmation is rejected');

  const missingSavedRequest = await submitCitizenRequest(request, 'test-token', async () => ({
    ok: true,
    status: 200,
    json: async () => ({ success: true }),
  })).then(() => null, (error: Error) => error);
  assert.equal(missingSavedRequest?.name, 'CitizenRequestSubmissionError', 'A success response without the saved request is rejected');

  const nullBody = await submitCitizenRequest(request, 'test-token', async () => ({
    ok: true,
    status: 200,
    json: async () => null,
  })).then(() => null, (error: Error) => error);
  assert.equal(nullBody?.name, 'CitizenRequestSubmissionError', 'A null response body becomes a submission error');

  const malformedJson = await submitCitizenRequest(request, 'test-token', async () => ({
    ok: true,
    status: 200,
    json: async () => { throw new SyntaxError('Invalid JSON'); },
  })).then(() => null, (error: Error) => error);
  assert.equal(malformedJson?.name, 'CitizenRequestSubmissionError', 'Malformed JSON becomes a submission error');

  console.log('✅ Citizen request submission tests passed');
}

run().catch((error) => {
  console.error('Citizen request submission tests failed:', error);
  process.exit(1);
});
