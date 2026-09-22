import fs from 'fs';
import path from 'path';
import { JsonCitizenRequestRepository } from '../repositories/JsonCitizenRequestRepository.js';
import { PostgresCitizenRequestRepository } from '../repositories/PostgresCitizenRequestRepository.js';
import { validateCitizenRequest, validateProcessFeedback } from '../validation/requestValidator.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';
import { MemoryCache } from '../cache/memoryCache.js';
import { validateConfig } from '../config.js';
import { requestIdMiddleware } from '../middleware/requestId.js';
import { errorHandler, AppError } from '../middleware/errorHandler.js';
import type { CitizenRequest } from '../../types.js';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✅ PASS: ${message}`);
}

async function runScalabilityAndArchitectureTestSuite() {
  console.log('--- RUNNING DEPLOYABILITY & SCALABILITY ARCHITECTURE UNIT TESTS ---');

  const testStorePath = path.join(process.cwd(), 'civicpulse_test_requests_tmp.json');
  if (fs.existsSync(testStorePath)) {
    fs.unlinkSync(testStorePath);
  }

  // --- Test 1: Persistence Abstraction (JsonCitizenRequestRepository) ---
  console.log('\n[Test 1] Persistence Abstraction: Repository Lifecycle & Operations');
  const repo = new JsonCitizenRequestRepository(testStorePath);

  const testRequest: CitizenRequest = {
    id: 'CP-TEST-001',
    request_id: 'CP-TEST-001',
    timestamp: new Date().toISOString(),
    original_text: 'Major pipeline rupture flooding low-income residential colony.',
    language: 'English',
    category: 'Water',
    location: 'Guntur Rural',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    severity: 8,
    urgency: 'HIGH',
    summary_en: 'Severe water distribution pipeline rupture.',
    source_type: 'voice',
    status: 'Received',
  };

  const created = await repo.create(testRequest);
  assert(created.id === 'CP-TEST-001', 'Created request id matches input');

  const fetched = await repo.getById('CP-TEST-001');
  assert(fetched !== null && fetched.category === 'Water', 'getById retrieves exact persisted record');

  const notFound = await repo.getById('NON-EXISTENT');
  assert(notFound === null, 'getById returns null for non-existent record');

  // Verify delete operation
  const deleteNonExistent = await repo.delete('NON-EXISTENT');
  assert(deleteNonExistent === false, 'delete returns false for non-existent record');

  const deleteExisting = await repo.delete('CP-TEST-001');
  assert(deleteExisting === true, 'delete returns true for successfully deleted record');

  const postDeleteFetch = await repo.getById('CP-TEST-001');
  assert(postDeleteFetch === null, 'getById returns null after deletion');

  // Re-create testRequest to maintain baseline
  await repo.create(testRequest);

  // Insert additional records to test pagination & filtering
  for (let i = 2; i <= 25; i++) {
    await repo.create({
      ...testRequest,
      id: `CP-TEST-${String(i).padStart(3, '0')}`,
      category: i % 2 === 0 ? 'Roads' : 'Health',
      district: i % 3 === 0 ? 'Warangal' : 'Guntur',
      urgency: i % 4 === 0 ? 'CRITICAL' : 'MEDIUM',
    });
  }

  // --- Test 2: Pagination Boundaries & Math ---
  console.log('\n[Test 2] Pagination: Structured Result Slicing');
  const page1 = await repo.list({ page: 1, limit: 10 });
  assert(page1.items.length === 10, 'Page 1 limit 10 returns exactly 10 items');
  assert(page1.total === 25, 'Total record count matches 25');
  assert(page1.totalPages === 3, 'Total pages for 25 items at limit 10 is 3');
  assert(page1.page === 1, 'Current page reflects 1');

  const page3 = await repo.list({ page: 3, limit: 10 });
  assert(page3.items.length === 5, 'Page 3 returns remainder 5 items');

  // Filter by category
  const roadsOnly = await repo.list({ category: 'Roads' });
  assert(roadsOnly.items.every((r) => r.category === 'Roads'), 'Category filter returns strictly Roads items');

  // --- Test 3: Repository Statistics & Health ---
  console.log('\n[Test 3] Telemetry & Persistence Health Check');
  const stats = await repo.getStatistics();
  assert(stats.totalRequests === 25, 'Total requests count matches 25');
  assert(stats.byCategory['Roads'] > 0, 'Roads category aggregate count is positive');

  const health = await repo.healthCheck();
  assert(health.status === 'healthy', 'Repository health reports healthy');
  assert(health.type === 'json-file', 'Repository type reports json-file');
  assert(health.recordCount === 25, 'Health check reflects actual record count');

  // --- Test 4: PostgreSQL Adapter Interface Compliance ---
  console.log('\n[Test 4] PostgreSQL Migration Architecture Adapter');
  const pgRepo = new PostgresCitizenRequestRepository();
  const pgHealth = await pgRepo.healthCheck();
  assert(pgHealth.type === 'postgresql', 'PostgreSQL adapter reports postgresql type');
  assert(pgHealth.status === 'degraded', 'Unconfigured database URL reports safe degraded status without crashing');

  // --- Test 5: API Input Validation (requestValidator) ---
  console.log('\n[Test 5] Input Validation at API Boundary');
  const validPayload = {
    id: 'CP-VALID-999',
    category: 'Water',
    severity: 7,
    urgency: 'HIGH',
    location: 'Vijayawada Rural',
    latitude: 16.5062,
    longitude: 80.648,
    source_type: 'voice',
  };
  const valResult1 = validateCitizenRequest(validPayload);
  assert(valResult1.isValid, 'Valid citizen request payload passes validation');

  const invalidPayload = {
    id: '', // missing ID
    category: 'InvalidSector123', // invalid category
    severity: 15, // out of range
    urgency: 'ULTRA_EXTREME', // invalid urgency
    latitude: 120, // out of range latitude
    longitude: -200, // out of range longitude
    source_type: 'teleport', // invalid source type
  };
  const valResult2 = validateCitizenRequest(invalidPayload);
  assert(!valResult2.isValid, 'Invalid payload fails validation');
  assert(valResult2.errors.some((e) => e.field === 'id'), 'Missing ID triggers error');
  assert(valResult2.errors.some((e) => e.field === 'category'), 'Invalid category triggers error');
  assert(valResult2.errors.some((e) => e.field === 'severity'), 'Out of range severity triggers error');
  assert(valResult2.errors.some((e) => e.field === 'latitude'), 'Out of range latitude triggers error');

  // Feedback input validation
  const emptyFeedback = validateProcessFeedback({});
  assert(!emptyFeedback.isValid, 'Empty feedback payload fails validation');

  const validFeedback = validateProcessFeedback({ text: 'No water supply in colony', language: 'Telugu' });
  assert(validFeedback.isValid, 'Valid text feedback passes validation');

  // --- Test 6: In-Memory Rate Limiting ---
  console.log('\n[Test 6] Rate Limiting Abuse Protection');
  // 6a: Default disabled rate limiting passes all requests
  const defaultLimiter = createRateLimiter({
    windowMs: 1000,
    maxRequests: 3,
    name: 'test-default-limiter',
    forceEnable: false,
  });

  const dummyReq = { headers: {}, ip: '192.168.1.100' } as any;
  let statusSent = 0;
  const dummyRes = {
    setHeader: () => {},
    status: (s: number) => {
      statusSent = s;
      return { json: () => {} };
    },
  } as any;

  let nextCalls = 0;
  const nextFn = () => {
    nextCalls++;
  };

  // When disabled by default, exceeding maxRequests does NOT block
  for (let i = 0; i < 5; i++) {
    defaultLimiter(dummyReq, dummyRes, nextFn);
  }
  assert(nextCalls === 5, 'Rate limiter is disabled by default (RATE_LIMIT_ENABLED=false) and bypasses');

  // 6b: Explicitly enabled rate limiting enforces thresholds
  const enabledLimiter = createRateLimiter({
    windowMs: 1000,
    maxRequests: 3,
    name: 'test-enabled-limiter',
    forceEnable: true,
  });

  nextCalls = 0;
  statusSent = 0;
  enabledLimiter(dummyReq, dummyRes, nextFn); // Req 1
  enabledLimiter(dummyReq, dummyRes, nextFn); // Req 2
  enabledLimiter(dummyReq, dummyRes, nextFn); // Req 3
  assert(nextCalls === 3, 'When enabled, first 3 requests within threshold execute next()');

  enabledLimiter(dummyReq, dummyRes, nextFn); // Req 4 (exceeded)
  assert(statusSent === 429, 'When enabled, fourth request exceeding limit triggers HTTP 429');

  // --- Test 7: Memory Cache LRU & TTL ---
  console.log('\n[Test 7] Bounded Memory Cache LRU & TTL');
  const testCache = new MemoryCache<string>({
    maxEntries: 3,
    defaultTtlMs: 200,
  });

  testCache.set('key1', 'val1');
  testCache.set('key2', 'val2');
  testCache.set('key3', 'val3');
  assert(testCache.get('key1') === 'val1', 'Cache retrieves inserted key1');

  // Insert 4th item to trigger LRU eviction (key2 will be oldest because key1 was accessed)
  testCache.set('key4', 'val4');
  assert(testCache.get('key2') === undefined, 'Oldest unaccessed key2 is evicted under bounded capacity');
  assert(testCache.get('key4') === 'val4', 'Newly inserted key4 is present');

  const cacheStats = testCache.getStats();
  assert(cacheStats.evictions === 1, 'Cache records exactly 1 eviction');
  assert(cacheStats.hits > 0, 'Cache records hits correctly');

  // --- Test 8: Configuration Validation (JSON Default & Optional DATABASE_URL) ---
  console.log('\n[Test 8] Configuration Validation: Default JSON Persistence & Optional DATABASE_URL');
  
  // 8a: Default empty environment -> json persistence, rateLimitEnabled: false, DATABASE_URL optional
  const defaultEnvConfig = validateConfig({});
  assert(defaultEnvConfig.isValid, 'Default configuration with no env vars is valid');
  assert(defaultEnvConfig.config.persistenceType === 'json', 'Default persistenceType is strictly json');
  assert(defaultEnvConfig.config.rateLimitEnabled === false, 'Default rateLimitEnabled is strictly false');
  assert(defaultEnvConfig.config.databaseUrl === undefined, 'databaseUrl is undefined and optional by default');

  // 8b: Explicit PERSISTENCE_TYPE=json without DATABASE_URL -> completely valid
  const jsonExplicitConfig = validateConfig({ PERSISTENCE_TYPE: 'json', DATABASE_URL: '' });
  assert(jsonExplicitConfig.isValid, 'PERSISTENCE_TYPE=json is valid without DATABASE_URL');
  assert(jsonExplicitConfig.config.persistenceType === 'json', 'Configured persistenceType is json');

  // 8c: PERSISTENCE_TYPE=postgres WITHOUT DATABASE_URL -> invalid, requires DATABASE_URL
  const pgMissingUrl = validateConfig({ PERSISTENCE_TYPE: 'postgres' });
  assert(!pgMissingUrl.isValid, 'PERSISTENCE_TYPE=postgres without DATABASE_URL fails validation');
  assert(pgMissingUrl.errors.some((e) => e.includes('DATABASE_URL is required')), 'Error indicates DATABASE_URL is required for postgres');

  // 8d: PERSISTENCE_TYPE=postgres WITH DATABASE_URL -> valid
  const pgValid = validateConfig({ PERSISTENCE_TYPE: 'postgres', DATABASE_URL: 'postgresql://admin:secret@localhost:5432/civicpulse' });
  assert(pgValid.isValid, 'PERSISTENCE_TYPE=postgres with DATABASE_URL is valid');
  assert(pgValid.config.persistenceType === 'postgres', 'Configured persistenceType is postgres');

  // 8e: RATE_LIMIT_ENABLED toggling
  const rateLimitTrue = validateConfig({ RATE_LIMIT_ENABLED: 'true' });
  assert(rateLimitTrue.config.rateLimitEnabled === true, 'RATE_LIMIT_ENABLED=true enables rate limiter');
  const rateLimitFalse = validateConfig({ RATE_LIMIT_ENABLED: 'false' });
  assert(rateLimitFalse.config.rateLimitEnabled === false, 'RATE_LIMIT_ENABLED=false disables rate limiter');

  // --- Test 9: Request ID Middleware & Latency Tracking ---
  console.log('\n[Test 9] Request Traceability: Request ID and Response Time Measurement');
  const req1 = { headers: {}, on: () => {} } as any;
  const headersSet1: Record<string, any> = {};
  const res1 = {
    setHeader: (k: string, v: any) => {
      headersSet1[k] = v;
    },
    writeHead: function () {
      return this;
    },
    on: () => {},
  } as any;

  requestIdMiddleware(req1, res1, () => {});
  assert(typeof req1.id === 'string' && req1.id.startsWith('cp-'), 'Generates valid default trace ID');
  assert(headersSet1['X-Request-Id'] === req1.id, 'Sets X-Request-Id response header matching req.id');

  // Safe upstream ID propagation
  const req2 = { headers: { 'x-request-id': 'client-trace-abc-123' }, on: () => {} } as any;
  const headersSet2: Record<string, any> = {};
  const res2 = {
    setHeader: (k: string, v: any) => {
      headersSet2[k] = v;
    },
    writeHead: function () {
      return this;
    },
    on: () => {},
  } as any;
  requestIdMiddleware(req2, res2, () => {});
  assert(req2.id === 'client-trace-abc-123', 'Safely adopts valid upstream X-Request-Id');

  // Unsafe upstream ID sanitization (rejects malicious chars / injections)
  const req3 = { headers: { 'x-request-id': 'bad<script>alert(1)</script>' }, on: () => {} } as any;
  const headersSet3: Record<string, any> = {};
  const res3 = {
    setHeader: (k: string, v: any) => {
      headersSet3[k] = v;
    },
    writeHead: function () {
      return this;
    },
    on: () => {},
  } as any;
  requestIdMiddleware(req3, res3, () => {});
  assert(req3.id !== 'bad<script>alert(1)</script>' && req3.id.startsWith('cp-'), 'Rejects and sanitizes invalid upstream X-Request-Id');

  // Response time calculation
  res1.writeHead(200);
  assert(typeof headersSet1['X-Response-Time'] === 'string' && headersSet1['X-Response-Time'].endsWith('ms'), 'Sets X-Response-Time header with ms suffix');

  // --- Test 10: Error Handler Sanitization (No Secrets / Internal Paths Leaked) ---
  console.log('\n[Test 10] Error Handling: Centralized JSON Error & Secrets Sanitization');
  let errStatus = 0;
  let errPayload: any = null;
  const dummyErrRes = {
    status: (s: number) => {
      errStatus = s;
      return {
        json: (p: any) => {
          errPayload = p;
        },
      };
    },
  } as any;
  const dummyErrReq = { id: 'test-trace-999' } as any;

  // Custom AppError
  const customErr = new AppError('Invalid category selection', 400, 'INVALID_CATEGORY', { allowed: ['Water', 'Roads'] });
  errorHandler(customErr, dummyErrReq, dummyErrRes, () => {});
  assert(errStatus === 400, 'AppError preserves custom HTTP status code 400');
  assert(errPayload.error.code === 'INVALID_CATEGORY', 'Preserves custom error code');
  assert(errPayload.requestId === 'test-trace-999', 'Error payload includes request ID');
  assert(errPayload.error.details.allowed.length === 2, 'Error payload preserves structured details');

  // Leak prevention: strip simulated Gemini API key and internal path from error message
  const leakyErr = new Error('Failed to query Gemini with key AIzaSyA123456789012345678901234567890b in /usr/local/app/src/server.ts');
  errorHandler(leakyErr, dummyErrReq, dummyErrRes, () => {});
  assert(errStatus === 500, 'Generic Error defaults to HTTP 500');
  assert(!errPayload.error.message.includes('AIzaSy'), 'Error handler redacts Gemini API key pattern');
  assert(!errPayload.error.message.includes('/usr/local/app'), 'Error handler redacts internal filesystem paths');

  // --- Test 11: Rate Limiter Standard & RFC Headers ---
  console.log('\n[Test 11] Rate Limiter Standard & Legacy Header Compliance');
  const headersSetLimiter: Record<string, any> = {};
  const dummyResLimiter = {
    setHeader: (k: string, v: any) => {
      headersSetLimiter[k] = v;
    },
    status: () => ({ json: () => {} }),
  } as any;
  const testLimiter = createRateLimiter({
    windowMs: 60000,
    maxRequests: 50,
    name: 'test-header-limiter',
    forceEnable: true,
  });
  testLimiter({ headers: {}, ip: '10.0.0.1' } as any, dummyResLimiter, () => {});
  assert(headersSetLimiter['RateLimit-Limit'] === 50, 'Sets standard RateLimit-Limit');
  assert(headersSetLimiter['RateLimit-Remaining'] === 49, 'Sets standard RateLimit-Remaining');
  assert(headersSetLimiter['X-RateLimit-Limit'] === 50, 'Sets legacy X-RateLimit-Limit');
  assert(headersSetLimiter['X-RateLimit-Remaining'] === 49, 'Sets legacy X-RateLimit-Remaining');
  assert(headersSetLimiter['RateLimit-Reset'] >= 1, 'Sets RateLimit-Reset in seconds');

  // Cleanup test temporary file
  if (fs.existsSync(testStorePath)) {
    fs.unlinkSync(testStorePath);
  }

  console.log('\n🎉 ALL 11 DEPLOYABILITY & SCALABILITY ARCHITECTURE TESTS PASSED SUCCESSFULLY!\n');
}

runScalabilityAndArchitectureTestSuite().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
