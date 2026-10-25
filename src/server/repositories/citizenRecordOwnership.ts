import { createHmac, timingSafeEqual } from 'node:crypto';
import type { CitizenRequest } from '../../types.js';

const OWNER_SIGNATURE_SECRET_ENV = 'CITIZEN_RECORD_OWNER_SECRET';

export function isOwnerSecretConfigured(): boolean {
  try {
    getOwnerSecret();
    return true;
  } catch {
    return false;
  }
}

function getOwnerSecret(): string {
  let secret = process.env[OWNER_SIGNATURE_SECRET_ENV];
  if (secret) {
    secret = secret.trim();
    if (
      (secret.startsWith('"') && secret.endsWith('"') && secret.length >= 2) ||
      (secret.startsWith("'") && secret.endsWith("'") && secret.length >= 2)
    ) {
      secret = secret.slice(1, -1).trim();
    }
  }
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error(`${OWNER_SIGNATURE_SECRET_ENV} must be configured with at least 32 bytes.`);
  }
  return secret;
}

function signatureFor(id: string, ownerUid: string): Buffer {
  return createHmac('sha256', getOwnerSecret()).update(JSON.stringify([id, ownerUid])).digest();
}

/** Adds server-verifiable provenance to ownership assigned from a verified Firebase token. */
export function withTrustedOwner<T extends CitizenRequest>(request: T, ownerUid: string): T {
  return {
    ...request,
    userId: ownerUid,
    ownerUid,
    ownerSignature: signatureFor(request.id, ownerUid).toString('base64url'),
  };
}

/** Legacy ownership fields alone are not trusted because older routes stored client payload fields. */
export function hasTrustedOwner(request: CitizenRequest | null | undefined, ownerUid: string): boolean {
  if (!request || request.ownerUid !== ownerUid || !request.ownerSignature) return false;
  try {
    const actual = Buffer.from(request.ownerSignature, 'base64url');
    const expected = signatureFor(request.id, ownerUid);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
