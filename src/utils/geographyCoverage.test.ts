import { DISTRICTS_REGISTRY } from '../data/districts';
import { getCoverageStatistics, INDIA_STATES_AND_UTS } from './geography';
import { getDistrictDataDepth, getDistrictCoverageTier } from './provenance';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Error]: ${message}`);
  }
}

console.log('🧪 Starting Geographic Coverage & Registry Integrity Tests...\n');

// 1. Uniqueness & Required Field Audit
const seenIds = new Set<string>();
const seenNameState = new Set<string>();

for (const dist of DISTRICTS_REGISTRY) {
  assert(Boolean(dist.id && dist.id.trim()), `District missing ID: ${dist.name}`);
  assert(!seenIds.has(dist.id), `Duplicate district ID detected: ${dist.id}`);
  seenIds.add(dist.id);

  const key = `${dist.name.toLowerCase()}-${dist.state.toLowerCase()}`;
  assert(!seenNameState.has(key), `Duplicate district name & state combination: ${dist.name} (${dist.state})`);
  seenNameState.add(key);

  assert(Boolean(dist.state && dist.state.trim()), `District missing state: ${dist.id}`);
  assert(typeof dist.lat === 'number' && !isNaN(dist.lat), `Invalid latitude for ${dist.id}`);
  assert(typeof dist.lon === 'number' && !isNaN(dist.lon), `Invalid longitude for ${dist.id}`);
  assert(typeof dist.population === 'number' && dist.population > 0, `Invalid population for ${dist.id}`);
  assert(typeof dist.poverty_index === 'number' && dist.poverty_index >= 0 && dist.poverty_index <= 1, `Invalid poverty index for ${dist.id}`);
}

console.log(`✅ Test 1 Passed: ${DISTRICTS_REGISTRY.length} districts verified for field completeness and key uniqueness.`);

// 2. India 36 States & UTs Representation Check
const stats = getCoverageStatistics(DISTRICTS_REGISTRY);

assert(stats.totalStatesAndUTs === 36, `Expected 36 States & UTs total, got ${stats.totalStatesAndUTs}`);
assert(stats.representedStatesAndUTs === 36, `Expected all 36 States & UTs represented, got ${stats.representedStatesAndUTs}`);
assert(stats.statesCount === 28, `Expected 28 States represented, got ${stats.statesCount}`);
assert(stats.utsCount === 8, `Expected 8 UTs represented, got ${stats.utsCount}`);
assert(stats.missingStatesAndUTs.length === 0, `Missing States/UTs detected: ${stats.missingStatesAndUTs.join(', ')}`);
assert(stats.coveragePercentage === 100, `Expected 100% representation across 36 States/UTs, got ${stats.coveragePercentage}%`);

console.log(`✅ Test 2 Passed: 100% geographic representation across all 28 States & 8 Union Territories (36/36).`);

// 3. Data Tiering Audit
assert(stats.deepBaselineCount === 5, `Expected 5 Deep Baseline districts, got ${stats.deepBaselineCount}`);
assert(stats.expandedBaselineCount === 10, `Expected 10 Expanded Baseline districts, got ${stats.expandedBaselineCount}`);
assert(stats.regionalCoverageCount === stats.totalDistricts - 15, `Expected ${stats.totalDistricts - 15} Regional Coverage districts, got ${stats.regionalCoverageCount}`);

const requiredL1 = ['vijayawada', 'guntur', 'visakhapatnam', 'kurnool', 'solapur'];
for (const id of requiredL1) {
  const tier = getDistrictCoverageTier(id);
  assert(tier === 'deep-baseline', `District ${id} must have tier 'deep-baseline', got ${tier}`);
}

const requiredL2 = ['warangal', 'hyderabad', 'nashik', 'patna', 'gaya', 'jaipur', 'bengaluru', 'chennai', 'kolkata', 'lucknow'];
for (const id of requiredL2) {
  const tier = getDistrictCoverageTier(id);
  assert(tier === 'expanded-baseline', `District ${id} must have tier 'expanded-baseline', got ${tier}`);
}

console.log(`✅ Test 3 Passed: Data depth tiering verified (5 Deep, 10 Expanded, ${stats.regionalCoverageCount} Regional Coverage).`);

console.log('\n🎉 ALL GEOGRAPHIC COVERAGE TESTS PASSED SUCCESSFULLY!');
