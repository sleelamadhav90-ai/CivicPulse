import { JsonCitizenRequestRepository } from '../repositories/JsonCitizenRequestRepository.js';
import { DISTRICTS_REGISTRY } from '../../data/districts.js';
import { 
  calculatePriorityScore, 
  calculateScoreTrace, 
  getAIRecommendedProjects, 
  SCORING_CONFIG,
  getScoreComponentContributions
} from '../../utils/scoring.js';
import type { CitizenRequest, District } from '../../types.js';
import fs from 'fs';
import path from 'path';

process.env.CITIZEN_RECORD_OWNER_SECRET = 'test-secret-at-least-32-bytes-long-for-hmac!';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

console.log('=== VERIFICATION TEST SUITE: DUPLICATE PREVENTION & DETERMINISTIC SCORING ===\n');

// -------------------------------------------------------------------------
// TEST 1: Duplicate Submission & Idempotency in Persistence Layer
// -------------------------------------------------------------------------
console.log('--- TEST 1: Duplicate Submission Prevention (Idempotent Writes) ---');
const testDbFile = path.join(process.cwd(), 'test_duplicate_prevention.json');
if (fs.existsSync(testDbFile)) fs.unlinkSync(testDbFile);

const repo = new JsonCitizenRequestRepository(testDbFile);
const userId = 'citizen-test-uid-42';

const reportA: CitizenRequest = {
  id: 'CP-2026-TEST-0001',
  request_id: 'CP-2026-TEST-0001',
  userId,
  created_at: new Date().toISOString(),
  timestamp: new Date().toISOString(),
  original_text: 'Burst water main in Sector 4',
  language: 'English',
  translated_text: 'Burst water main in Sector 4',
  category: 'Water',
  subcategory: 'Pipeline burst',
  issue_title: 'Water — Pipeline burst',
  location: 'Vijayawada Rural',
  state: 'Andhra Pradesh',
  district: 'Vijayawada Rural',
  severity: 8,
  severity_label: 'High',
  summary: 'Burst water main in Sector 4',
  summary_en: 'Burst water main in Sector 4',
  urgency: 'HIGH',
  status: 'Received',
  source_type: 'text',
};

// First submission
const saved1 = await repo.createOwned(reportA, userId);
assert(saved1 !== null, 'First submission of reportA succeeded');

// Rapid double-click retry with the same stable request ID
const saved2 = await repo.createOwned(reportA, userId);
assert(saved2 !== null, 'Second submission with identical trackingId handled safely');

// Verify that exactly ONE record exists in storage
const listAfterDoubleSubmit = await repo.list({ ownerUid: userId });
assert(listAfterDoubleSubmit.total === 1, `Expected exactly 1 record after double submission, found ${listAfterDoubleSubmit.total}`);
assert(listAfterDoubleSubmit.items.length === 1, `Expected items array length 1, got ${listAfterDoubleSubmit.items.length}`);

// -------------------------------------------------------------------------
// TEST 2: Preserving Legitimate Separate Submissions
// -------------------------------------------------------------------------
console.log('\n--- TEST 2: Preserving Legitimate Separate Submissions ---');
const reportB: CitizenRequest = {
  id: 'CP-2026-TEST-0002',
  request_id: 'CP-2026-TEST-0002',
  userId,
  created_at: new Date().toISOString(),
  timestamp: new Date().toISOString(),
  original_text: 'Deep crater pothole outside primary school',
  language: 'English',
  translated_text: 'Deep crater pothole outside primary school',
  category: 'Roads',
  subcategory: 'Pothole corridor',
  issue_title: 'Roads — Pothole corridor',
  location: 'Guntur',
  state: 'Andhra Pradesh',
  district: 'Guntur',
  severity: 7,
  severity_label: 'High',
  summary: 'Deep crater pothole outside primary school',
  summary_en: 'Deep crater pothole outside primary school',
  urgency: 'HIGH',
  status: 'Received',
  source_type: 'text',
};

const savedB = await repo.createOwned(reportB, userId);
assert(savedB !== null, 'Submission of separate reportB succeeded');

const listAfterBoth = await repo.list({ ownerUid: userId });
assert(listAfterBoth.total === 2, `Expected exactly 2 distinct records, found ${listAfterBoth.total}`);
assert(listAfterBoth.items.some(r => r.id === 'CP-2026-TEST-0001'), 'Report A persists');
assert(listAfterBoth.items.some(r => r.id === 'CP-2026-TEST-0002'), 'Report B persists');

// Clean up test file
if (fs.existsSync(testDbFile)) fs.unlinkSync(testDbFile);

// -------------------------------------------------------------------------
// TEST 3: Scoring Logic & Zero-Demand Pillar Verification
// -------------------------------------------------------------------------
console.log('\n--- TEST 3: Scoring Logic: Zero Demand Signals Must Yield 0 Demand Score ---');
const district = DISTRICTS_REGISTRY.find(d => d.name.toLowerCase() === 'guntur') || DISTRICTS_REGISTRY[0];

// Zero demand scenario
const zeroDemandScore = calculatePriorityScore(district, 'Water', 7, 0);
assert(zeroDemandScore.demand_count === 0, `demand_count must be 0, got ${zeroDemandScore.demand_count}`);
assert(zeroDemandScore.demand_score === 0, `demand_score must be 0, got ${zeroDemandScore.demand_score}`);

const zeroContribs = getScoreComponentContributions(zeroDemandScore);
assert(zeroContribs.demandContrib === 0, `demand contribution must be 0.00, got ${zeroContribs.demandContrib}`);

// Positive demand scenario (e.g. 15 signals)
const positiveDemandScore = calculatePriorityScore(district, 'Water', 7, 15);
assert(positiveDemandScore.demand_count === 15, `demand_count must be 15, got ${positiveDemandScore.demand_count}`);
assert(positiveDemandScore.demand_score > 0, `demand_score must be > 0, got ${positiveDemandScore.demand_score}`);

const posContribs = getScoreComponentContributions(positiveDemandScore);
assert(posContribs.demandContrib > 0, `demand contribution must be > 0, got ${posContribs.demandContrib}`);
assert(positiveDemandScore.total_score > zeroDemandScore.total_score, 'Total priority score with 15 reports must exceed score with 0 reports');

// -------------------------------------------------------------------------
// TEST 4: No Hallucinated Signals in AI Recommended Projects
// -------------------------------------------------------------------------
console.log('\n--- TEST 4: AI Recommended Projects: Zero Hallucinated Signals ---');
const sampleDistricts: District[] = [
  {
    id: 'test_empty_district',
    name: 'Empty District',
    state: 'Test State',
    lat: 15.0,
    lon: 75.0,
    population: 2000000,
    poverty_index: 0.35,
    water_access: 40,
    health_access: 50,
    road_quality: 45,
    education_access: 60,
    planned_investment: 0,
    existing_facilities: { phc_clinics: 5, water_plants: 2, schools: 10, paved_roads_km: 50 },
    zone: 'South'
  }
];

// No requests submitted at all for this district
const recommendedWithZero = getAIRecommendedProjects(sampleDistricts, []);
assert(recommendedWithZero.length > 0, 'Generates candidates based on infrastructure deficit');

for (const proj of recommendedWithZero) {
  assert(
    proj.citizenRequestsCount === 0,
    `Project ${proj.id} must have 0 citizen requests count, got ${proj.citizenRequestsCount}`
  );
  assert(
    proj.factors.citizenDemand.score === 0,
    `Citizen demand factor score must be 0 when reports=0, got ${proj.factors.citizenDemand.score}`
  );
  assert(
    proj.factors.citizenDemand.weightedScore === 0,
    `Citizen demand weighted score must be 0 when reports=0, got ${proj.factors.citizenDemand.weightedScore}`
  );
}

// Now provide 1 verified request for Water in Empty District
const singleRequest: CitizenRequest = {
  ...reportA,
  district: 'Empty District',
  location: 'Empty District',
  category: 'Water'
};

const recommendedWithOne = getAIRecommendedProjects(sampleDistricts, [singleRequest]);
const waterProject = recommendedWithOne.find(p => p.category === 'Water');
assert(waterProject !== undefined, 'Water project exists');
assert(
  waterProject!.citizenRequestsCount === 1,
  `Water project must reflect exactly 1 verified citizen signal, got ${waterProject!.citizenRequestsCount}`
);
assert(
  waterProject!.factors.citizenDemand.score > 0,
  `Water project demand factor score must be > 0 with 1 signal, got ${waterProject!.factors.citizenDemand.score}`
);

console.log('\n🎉 ALL VERIFICATION TESTS PASSED PERFECTLY!\n');
