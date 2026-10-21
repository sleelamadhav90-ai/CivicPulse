import type { CitizenRequest } from '../types.js';

type FetchResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

type FetchLike = (input: string, init: RequestInit) => Promise<FetchResponse>;

type SubmissionResponse = {
  success?: unknown;
  request?: unknown;
  error?: { message?: unknown };
};

export class CitizenRequestSubmissionError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'CitizenRequestSubmissionError';
  }
}

/** Resolve only after the API confirms it persisted the request. */
export async function submitCitizenRequest(
  request: CitizenRequest,
  idToken: string | null,
  fetcher: FetchLike = fetch
): Promise<CitizenRequest> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (idToken) headers.Authorization = `Bearer ${idToken}`;

  let response: FetchResponse;
  try {
    response = await fetcher('/api/citizen-requests', {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });
  } catch {
    throw new CitizenRequestSubmissionError('Could not reach CivicPulse. Check your connection and try again.');
  }

  let payload: SubmissionResponse | null = null;
  try {
    const body: unknown = await response.json();
    if (body && typeof body === 'object' && !Array.isArray(body)) {
      payload = body as SubmissionResponse;
    }
  } catch {
    // A malformed or empty response cannot confirm persistence.
  }

  if (!response.ok || payload?.success !== true || !payload.request || typeof payload.request !== 'object' || Array.isArray(payload.request)) {
    const message = typeof payload?.error?.message === 'string'
      ? payload.error.message
      : response.status === 401
        ? 'Your sign-in could not be verified. Sign in again, then retry your report.'
        : 'CivicPulse could not save your report. Please try again.';
    throw new CitizenRequestSubmissionError(message, response.status);
  }

  return payload.request as CitizenRequest;
}
