import express from 'express';
import type { AddressInfo } from 'node:net';
import type { CitizenRequest } from '../../types.js';
import type { CitizenRequestRepository, PaginatedResult, PaginationOptions } from '../repositories/CitizenRequestRepository.js';
import { createCitizenRequestRouter } from '../routes/citizenRequestRoutes.js';
import { hasTrustedOwner, withTrustedOwner } from '../repositories/citizenRecordOwnership.js';

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
  console.log(`✅ PASS: ${message}`);
}

const aliceRequest = {
  id: 'CP-ALICE-001',
  userId: 'alice',
  ownerUid: 'alice',
  original_text: 'Water supply failure at Ward 4',
  location: 'Ward 4, Guntur',
  latitude: 16.30,
  longitude: 80.43,
} as CitizenRequest;
const bobRequest = {
  id: 'CP-BOB-001',
  userId: 'bob',
  ownerUid: 'bob',
  original_text: 'Road damage near the school',
  location: 'Ward 8, Guntur',
  latitude: 16.31,
  longitude: 80.44,
} as CitizenRequest;

async function runCitizenRequestsApiTests() {
  process.env.NODE_ENV = 'test';
  process.env.CITIZEN_RECORD_OWNER_SECRET = 'test-only-owner-signing-secret-32-bytes-minimum';
  const ownedAliceRequest = withTrustedOwner(aliceRequest, 'alice');
  const ownedBobRequest = withTrustedOwner(bobRequest, 'bob');
  const records = new Map<string, CitizenRequest>([
    [aliceRequest.id, ownedAliceRequest],
    [bobRequest.id, ownedBobRequest],
    // Legacy record has a client-era userId but no server-verified ownerUid.
    ['CP-LEGACY-001', { id: 'CP-LEGACY-001', userId: 'alice', ownerUid: 'alice' } as CitizenRequest],
  ]);

  const repository = {
    async list(options: PaginationOptions = {}): Promise<PaginatedResult<CitizenRequest>> {
      const userRecords = Array.from(records.values()).filter((record) => hasTrustedOwner(record, options.ownerUid!));
      const limit = options.limit && options.limit > 0 ? options.limit : userRecords.length;
      const items = limit > 0 ? userRecords.slice(((options.page || 1) - 1) * limit, (options.page || 1) * limit) : userRecords;
      return { items, total: userRecords.length, page: options.page || 1, limit, totalPages: limit ? Math.ceil(userRecords.length / limit) : 0 };
    },
    async getById(id: string) { return records.get(id) || null; },
    async createOwned(request: CitizenRequest, userId: string) {
      const existing = records.get(request.id);
      if (existing && !hasTrustedOwner(existing, userId)) return null;
      const owned = withTrustedOwner(request, userId);
      records.set(request.id, owned);
      return owned;
    },
    async deleteOwned(id: string, userId: string) {
      const record = records.get(id);
      if (!hasTrustedOwner(record, userId)) return false;
      return records.delete(id);
    },
    async getStatistics() { return { totalRequests: records.size, byCategory: {}, byUrgency: {}, byStatus: {} }; },
  } as unknown as CitizenRequestRepository;

  const app = express();
  app.use(express.json());
  app.use('/api/citizen-requests', createCitizenRequestRouter(repository));
  const server = app.listen(0);
  try {
    await new Promise<void>((resolve) => server.once('listening', resolve));
    const { port } = server.address() as AddressInfo;
    const baseUrl = `http://127.0.0.1:${port}/api/citizen-requests`;
    const unauthenticatedList = await fetch(baseUrl);
    assert(unauthenticatedList.status === 401, 'Unauthenticated collection reads are rejected');
    const unauthenticatedSlashList = await fetch(`${baseUrl}/`);
    assert(unauthenticatedSlashList.status === 401, 'The collection URL with a trailing slash is also protected');
    const collectionDelete = await fetch(`${baseUrl}/`, { method: 'DELETE' });
    assert(collectionDelete.status === 404 && records.has(aliceRequest.id) && records.has(bobRequest.id), 'Collection-level deletion is unavailable, including with a trailing slash');

    const unauthenticatedItem = await fetch(`${baseUrl}/${aliceRequest.id}`);
    assert(unauthenticatedItem.status === 401, 'Unauthenticated individual reads are rejected');

    const unauthenticatedDelete = await fetch(`${baseUrl}/${aliceRequest.id}`, { method: 'DELETE' });
    assert(unauthenticatedDelete.status === 401, 'Unauthenticated deletion is rejected');
    assert(records.has(aliceRequest.id), 'Unauthenticated deletion leaves the record intact');

    const invalidTokenRead = await fetch(baseUrl, { headers: { Authorization: 'Bearer test-token-invalid' } });
    assert(invalidTokenRead.status === 401, 'Invalid tokens are rejected');
    const expiredTokenDelete = await fetch(`${baseUrl}/${aliceRequest.id}`, { method: 'DELETE', headers: { Authorization: 'Bearer test-token-expired' } });
    assert(expiredTokenDelete.status === 401 && records.has(aliceRequest.id), 'Expired tokens cannot delete records');

    const anonymousPost = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'CP-ANON-001', category: 'Water', userId: 'alice', ownerUid: 'alice' }),
    });
    assert(anonymousPost.status === 401 && !records.has('CP-ANON-001'), 'Anonymous writes cannot assign an owner UID');

    const aliceHeaders = { Authorization: 'Bearer test-token-alice' };
    const aliceListResponse = await fetch(baseUrl, { headers: aliceHeaders });
    const aliceList = await aliceListResponse.json();
    assert(aliceListResponse.status === 200, 'An authenticated citizen can read their own collection');
    assert(aliceList.total === 1 && aliceList.requests[0].id === aliceRequest.id, 'Collection results are restricted to the verified owner');
    assert(aliceList.requests[0].original_text === aliceRequest.original_text && aliceList.requests[0].latitude === aliceRequest.latitude, 'The dashboard receives the owner’s full record fields needed for its detail views');
    assert(!aliceList.requests.some((record: CitizenRequest) => record.id === 'CP-LEGACY-001'), 'Legacy records with client-supplied ownerUid remain inaccessible without a server signature');

    const spoofedOwnerPost = await fetch(baseUrl, {
      method: 'POST',
      headers: { ...aliceHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'CP-ALICE-NEW', category: 'Water', userId: 'bob', ownerUid: 'bob' }),
    });
    const savedPost = await spoofedOwnerPost.json();
    assert(spoofedOwnerPost.status === 200, 'A valid Firebase token permits a citizen submission');
    assert(savedPost.request.ownerUid === 'alice' && savedPost.request.userId === 'alice', 'Server assigns ownership from the verified UID, ignoring client UID fields');

    const overwriteAttempt = await fetch(baseUrl, {
      method: 'POST',
      headers: { ...aliceHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: bobRequest.id, category: 'Water', userId: 'alice' }),
    });
    assert(overwriteAttempt.status === 404 && records.get(bobRequest.id)?.ownerUid === 'bob', 'A verified user cannot claim or overwrite another owner’s request ID');
    const legacyClaimAttempt = await fetch(baseUrl, {
      method: 'POST',
      headers: { ...aliceHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'CP-LEGACY-001', category: 'Water' }),
    });
    assert(
  legacyClaimAttempt.status === 404 &&
    records.get('CP-LEGACY-001')?.ownerUid === 'alice' &&
    !records.get('CP-LEGACY-001')?.ownerSignature,
  'A verified user cannot claim an unsigned legacy request ID'
    );
    const ownItemResponse = await fetch(`${baseUrl}/${aliceRequest.id}`, { headers: aliceHeaders });
    assert(ownItemResponse.status === 200, 'An authenticated citizen can read their own individual record');
    const otherItemResponse = await fetch(`${baseUrl}/${bobRequest.id}`, { headers: aliceHeaders });
    assert(otherItemResponse.status === 404, 'A citizen cannot read another owner’s record');
    const legacyItemResponse = await fetch(`${baseUrl}/CP-LEGACY-001`, { headers: aliceHeaders });
    assert(legacyItemResponse.status === 404, 'Ownerless legacy records cannot be retrieved using their old userId');

    // A legacy userId that happens to equal the caller UID is still untrusted.
    records.set('CP-LEGACY-SPOOF-001', { id: 'CP-LEGACY-SPOOF-001', userId: 'alice', ownerUid: 'alice' } as CitizenRequest);
    const spoofedLegacyItemResponse = await fetch(`${baseUrl}/CP-LEGACY-SPOOF-001`, { headers: aliceHeaders });
    assert(spoofedLegacyItemResponse.status === 404, 'An ownerless record with a matching legacy userId remains inaccessible');

    const crossOwnerDelete = await fetch(`${baseUrl}/${bobRequest.id}`, { method: 'DELETE', headers: aliceHeaders });
    assert(crossOwnerDelete.status === 404 && records.has(bobRequest.id), 'A citizen cannot delete another owner’s record');
    const legacyDelete = await fetch(`${baseUrl}/CP-LEGACY-001`, { method: 'DELETE', headers: aliceHeaders });
    assert(legacyDelete.status === 404 && records.has('CP-LEGACY-001'), 'An ownerless legacy record cannot be deleted by a claimed userId');
    const ownDelete = await fetch(`${baseUrl}/${aliceRequest.id}`, { method: 'DELETE', headers: aliceHeaders });
    assert(ownDelete.status === 200 && !records.has(aliceRequest.id), 'An authenticated owner can delete their own record');
  } finally {
    await new Promise<void>((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
  }
}

runCitizenRequestsApiTests().catch((err) => {
  console.error('Citizen request API tests failed:', err);
  process.exit(1);
});
