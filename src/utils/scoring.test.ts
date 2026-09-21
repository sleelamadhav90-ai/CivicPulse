import { DISTRICTS_REGISTRY } from '../data/districts';
import {
  calculatePriorityScore,
  calculateScoreTrace,
  calculateScoreSensitivity,
  SCORING_CONFIG,
  getScoreComponentContributions
} from './scoring';
import { District } from '../types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

console.log('--- RUNNING DETERMINISTIC PRIORITY SCORING ENGINE UNIT TESTS ---');

const baseDistrict: District = DISTRICTS_REGISTRY[0] || {
  id: 'test_district',
  name: 'Test District',
  state: 'Test State',
  lat: 20.0,
  lon: 78.0,
  population: 1500000,
  poverty_index: 0.25,
  water_access: 60,
  health_access: 55,
  road_quality: 50,
  education_access: 65,
  planned_investment: 100000000,
  existing_facilities: { phc_clinics: 10, water_plants: 5, schools: 20, paved_roads_km: 100 },
  zone: 'Central',
};

// -------------------------------------------------------------
// Test 1 — Minimum Inputs
// -------------------------------------------------------------
console.log('\n[Test 1] Minimum Inputs Bound');
const minDistrict: District = {
  ...baseDistrict,
  population: 0,
  poverty_index: 0,
  water_access: 100,
  health_access: 100,
  road_quality: 100,
  education_access: 100,
  planned_investment: 0,
};
const minResult = calculatePriorityScore(minDistrict, 'Water', 1, 1);
assert(
  minResult.total_score >= 0 && minResult.total_score <= 100,
  `Min score must be in range [0, 100], got ${minResult.total_score}`
);
assert(!isNaN(minResult.total_score), 'Min score must not be NaN');

// -------------------------------------------------------------
// Test 2 — Maximum Inputs
// -------------------------------------------------------------
console.log('\n[Test 2] Maximum Inputs Bound');
const maxDistrict: District = {
  ...baseDistrict,
  population: 10000000,
  poverty_index: 1.0,
  water_access: 0,
  health_access: 0,
  road_quality: 0,
  education_access: 0,
  planned_investment: 500000000,
};
const maxResult = calculatePriorityScore(maxDistrict, 'Water', 10, 100000);
assert(
  maxResult.total_score >= 0 && maxResult.total_score <= 100,
  `Max score must be in range [0, 100], got ${maxResult.total_score}`
);
assert(!isNaN(maxResult.total_score), 'Max score must not be NaN');

// -------------------------------------------------------------
// Test 3 — Demand Increase
// -------------------------------------------------------------
console.log('\n[Test 3] Demand Signal Monotonicity');
const lowDemandResult = calculatePriorityScore(baseDistrict, 'Water', 5, 2);
const highDemandResult = calculatePriorityScore(baseDistrict, 'Water', 5, 200);
assert(
  highDemandResult.demand_score > lowDemandResult.demand_score,
  `Demand score should increase with report volume: ${highDemandResult.demand_score} > ${lowDemandResult.demand_score}`
);
assert(
  highDemandResult.scoreTrace!.demand.contribution > lowDemandResult.scoreTrace!.demand.contribution,
  'Demand contribution must increase when demand increases'
);

// -------------------------------------------------------------
// Test 4 — Infrastructure Gap Increase
// -------------------------------------------------------------
console.log('\n[Test 4] Infrastructure Access Deficit Monotonicity');
const highAccessDistrict = { ...baseDistrict, water_access: 90 };
const lowAccessDistrict = { ...baseDistrict, water_access: 20 };
const highAccessResult = calculatePriorityScore(highAccessDistrict, 'Water', 5, 10);
const lowAccessResult = calculatePriorityScore(lowAccessDistrict, 'Water', 5, 10);
assert(
  lowAccessResult.gap_score > highAccessResult.gap_score,
  `Infrastructure deficit score should increase when access decreases: ${lowAccessResult.gap_score} > ${highAccessResult.gap_score}`
);
assert(
  lowAccessResult.scoreTrace!.gap.contribution > highAccessResult.scoreTrace!.gap.contribution,
  'Gap contribution must increase for higher access deficit'
);

// -------------------------------------------------------------
// Test 5 — Urgency Increase
// -------------------------------------------------------------
console.log('\n[Test 5] Hazard Urgency Monotonicity');
const lowUrgencyResult = calculatePriorityScore(baseDistrict, 'Water', 2, 10);
const highUrgencyResult = calculatePriorityScore(baseDistrict, 'Water', 9, 10);
assert(
  highUrgencyResult.sev_score > lowUrgencyResult.sev_score,
  `Severity score should increase with urgency rating: ${highUrgencyResult.sev_score} > ${lowUrgencyResult.sev_score}`
);
assert(
  highUrgencyResult.scoreTrace!.urgency.contribution > lowUrgencyResult.scoreTrace!.urgency.contribution,
  'Urgency contribution must increase when severity rating increases'
);

// -------------------------------------------------------------
// Test 6 — Government Priority Independence
// -------------------------------------------------------------
console.log('\n[Test 6] Government Priority Specificity');
const noCapexDistrict = { ...baseDistrict, planned_investment: 0 };
const activeCapexDistrict = { ...baseDistrict, planned_investment: 50000000 };
const noCapexResult = calculatePriorityScore(noCapexDistrict, 'Water', 6, 15);
const activeCapexResult = calculatePriorityScore(activeCapexDistrict, 'Water', 6, 15);

assert(
  activeCapexResult.scoreTrace!.governmentPriority.contribution > noCapexResult.scoreTrace!.governmentPriority.contribution,
  'Active capex allocation must yield higher government priority contribution'
);
assert(
  noCapexResult.scoreTrace!.demand.contribution === activeCapexResult.scoreTrace!.demand.contribution,
  'Demand contribution must remain identical when capex changes'
);
assert(
  noCapexResult.scoreTrace!.gap.contribution === activeCapexResult.scoreTrace!.gap.contribution,
  'Gap contribution must remain identical when capex changes'
);
assert(
  noCapexResult.scoreTrace!.populationImpact.contribution === activeCapexResult.scoreTrace!.populationImpact.contribution,
  'Population impact contribution must remain identical when capex changes'
);
assert(
  noCapexResult.scoreTrace!.urgency.contribution === activeCapexResult.scoreTrace!.urgency.contribution,
  'Urgency contribution must remain identical when capex changes'
);

// -------------------------------------------------------------
// Test 7 — Weight Integrity (Sum = 1.00)
// -------------------------------------------------------------
console.log('\n[Test 7] Weight Model Integrity (0.30 + 0.25 + 0.20 + 0.15 + 0.10 = 1.00)');
const weightSum = Number((
  SCORING_CONFIG.weights.citizenDemand +
  SCORING_CONFIG.weights.infrastructureGap +
  SCORING_CONFIG.weights.populationImpact +
  SCORING_CONFIG.weights.urgency +
  SCORING_CONFIG.weights.governmentPriority
).toFixed(6));
assert(weightSum === 1.00, `Weights sum must equal exactly 1.00, got ${weightSum}`);

// -------------------------------------------------------------
// Test 8 — Component Contribution Sum Equality
// -------------------------------------------------------------
console.log('\n[Test 8] Component Contribution Sum Verification');
const testBreakdown = calculatePriorityScore(baseDistrict, 'Healthcare', 7, 25);
const contribs = getScoreComponentContributions(testBreakdown);
const contribSum = Number((
  contribs.demandContrib +
  contribs.gapContrib +
  contribs.vulnContrib +
  contribs.urgencyContrib +
  contribs.govContrib
).toFixed(1));
const diff = Math.abs(contribSum - testBreakdown.total_score);
assert(
  diff <= 0.2,
  `Sum of contributions (${contribSum}) must match total score (${testBreakdown.total_score}) within 0.2 tolerance`
);

// -------------------------------------------------------------
// Test 9 — Invalid & Out-of-Bounds Input Handling
// -------------------------------------------------------------
console.log('\n[Test 9] Out-of-Bounds & Malformed Input Handling');
const negativeDemandResult = calculatePriorityScore(baseDistrict, 'Roads', -10, -50);
assert(!isNaN(negativeDemandResult.total_score), 'Negative demand must not produce NaN');
assert(negativeDemandResult.demand_count >= 1, 'Negative demand must clamp to minimum bound');

const overUrgencyResult = calculatePriorityScore(baseDistrict, 'Roads', 999, 10);
assert(!isNaN(overUrgencyResult.total_score), 'Excessive urgency must not produce NaN');
assert(overUrgencyResult.sev_score <= 100, 'Urgency score must clamp to maximum 100');

const trace = calculateScoreTrace(baseDistrict, 'Water', 8, 30);
const sensitivity = calculateScoreSensitivity(trace);
assert(!!sensitivity.dominantPillar, 'Sensitivity analysis must return a dominant pillar factor');
assert(sensitivity.dominantPercentage > 0, 'Dominant percentage must be positive');

console.log('\n🎉 ALL 9 PRIORITY SCORING ENGINE TESTS PASSED SUCCESSFULLY!\n');
