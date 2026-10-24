import { DISTRICTS_REGISTRY } from '../data/districts';
import {
  calculatePriorityScore,
  calculateScoreTrace,
  calculateScoreSensitivity,
  SCORING_CONFIG,
  getScoreComponentContributions,
  getPriorityTier
} from './scoring';
import { District } from '../types';
import { matchesDistrict } from './districtMatcher';

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
assert(negativeDemandResult.demand_count >= 0, 'Negative demand must clamp to minimum bound of 0');
assert(negativeDemandResult.demand_score === 0, 'Negative or 0 demand must produce exactly 0 demand score');

const overUrgencyResult = calculatePriorityScore(baseDistrict, 'Roads', 999, 10);
assert(!isNaN(overUrgencyResult.total_score), 'Excessive urgency must not produce NaN');
assert(overUrgencyResult.sev_score <= 100, 'Urgency score must clamp to maximum 100');

const trace = calculateScoreTrace(baseDistrict, 'Water', 8, 30);
const sensitivity = calculateScoreSensitivity(trace);
assert(!!sensitivity.dominantPillar, 'Sensitivity analysis must return a dominant pillar factor');
assert(sensitivity.dominantPercentage > 0, 'Dominant percentage must be positive');

// -------------------------------------------------------------
// Test 11 — Specific Regression Tests for Code for Communities 2.0 Audit
// -------------------------------------------------------------
console.log('\n[Test 11] Code for Communities 2.0 Audit Regression Requirements');

// 1. Zero reports produce zero demand
const r0 = calculatePriorityScore(baseDistrict, 'Water', 5, 0);
assert(r0.demand_score === 0, 'Audit Requirement 1: Zero reports produce zero demand');

// 2. One report produces a demand score of approximately 15.25 before weighting (22 * ln(2) = 15.24925)
const r1 = calculatePriorityScore(baseDistrict, 'Water', 5, 1);
const expectedOneReportDemand = Number((22 * Math.log(2)).toFixed(2));
assert(
  Math.abs(r1.demand_score - expectedOneReportDemand) <= 0.1,
  `Audit Requirement 2: One report yields demand score ~15.25 (got ${r1.demand_score})`
);

// 3. Increasing report counts increase demand monotonically
const r10 = calculatePriorityScore(baseDistrict, 'Water', 5, 10);
const r100 = calculatePriorityScore(baseDistrict, 'Water', 5, 100);
assert(r10.demand_score > r1.demand_score && r100.demand_score > r10.demand_score, 'Audit Requirement 3: Increasing report counts increase demand monotonically');

// 4. Each pillar's weighted contribution is correct
const traceTest = calculateScoreTrace(baseDistrict, 'Water', 7, 10);
assert(Math.abs(traceTest.demand.contribution - Number((traceTest.demand.normalized * traceTest.demand.weight).toFixed(2))) < 0.01, 'Audit Requirement 4: Demand weighted contribution correct');
assert(Math.abs(traceTest.gap.contribution - Number((traceTest.gap.normalized * traceTest.gap.weight).toFixed(2))) < 0.01, 'Audit Requirement 4: Gap weighted contribution correct');

// 5. Displayed total equals sum of five weighted contributions
const sumContributions = Number((
  traceTest.demand.contribution +
  traceTest.gap.contribution +
  traceTest.populationImpact.contribution +
  traceTest.urgency.contribution +
  traceTest.governmentPriority.contribution
).toFixed(1));
assert(Math.abs(sumContributions - traceTest.finalScore) <= 0.2, 'Audit Requirement 5: Displayed total equals sum of weighted contributions');

// 6. Genuinely higher total ranks above lower total
const lowScoreResult = calculatePriorityScore(baseDistrict, 'Water', 2, 0, 95);
const highScoreResult = calculatePriorityScore(baseDistrict, 'Water', 9, 500, 10);
assert(highScoreResult.total_score > lowScoreResult.total_score, 'Audit Requirement 6: Genuinely higher total ranks above lower total');

// 7. Missing data is not silently treated as verified favorable data (e.g. 0 access deficit or missing capex defaults honestly)
const missingCapexDistrict = { ...baseDistrict, planned_investment: 0 };
const missingCapexTrace = calculateScoreTrace(missingCapexDistrict, 'Water', 5, 5);
assert(missingCapexTrace.governmentPriority.normalized === SCORING_CONFIG.governmentPriority.unbudgetedCapexScore, 'Audit Requirement 7: Missing capex is honestly represented as unbudgeted gap rather than active capex');

// 8. Reports from similarly named districts are not cross-assigned (Patna vs Bhawanipatna)
const patnaDist = { id: 'patna', name: 'Patna', state: 'Bihar', lat: 25.59, lon: 85.13, population: 5800000, poverty_index: 0.35, water_access: 45, health_access: 50, road_quality: 50, education_access: 50, planned_investment: 0, existing_facilities: { phc_clinics: 5, water_plants: 2, schools: 10, paved_roads_km: 50 }, zone: 'East' };
const sampleReportForBhawanipatna = { district: 'Bhawanipatna', location: 'Bhawanipatna, Odisha' };
assert(!matchesDistrict(sampleReportForBhawanipatna, patnaDist), 'Audit Requirement 8: Bhawanipatna report must NOT match Patna district');

// 9. Repeated rendering or refreshing does not change scores when underlying data is unchanged (purity/idempotency)
const scoreRun1 = calculatePriorityScore(baseDistrict, 'Water', 6, 20);
const scoreRun2 = calculatePriorityScore(baseDistrict, 'Water', 6, 20);
assert(scoreRun1.total_score === scoreRun2.total_score, 'Audit Requirement 9: Scoring function is pure and idempotent');

// 10. Hardcoded UI values cannot contradict the authoritative scoring breakdown
const auditBreakdown = calculatePriorityScore(baseDistrict, 'Water', 6, 20);
const authoritativeSum = getScoreComponentContributions(auditBreakdown);
assert(authoritativeSum.totalScore === auditBreakdown.total_score, 'Audit Requirement 10: Authoritative score breakdown matches total score');

// -------------------------------------------------------------
// Test 12 — Priority Score vs Hazard Severity Scale Separation
// -------------------------------------------------------------
console.log('\n[Test 12] Priority Score vs Hazard Severity Scale Separation');
// Hazard severity is 1 to 10 scale (where 8 is high urgency)
// Priority score is 0 to 100 composite 5-pillar scale
const sev8Breakdown = calculatePriorityScore(baseDistrict, 'Roads', 8, 15);
assert(
  sev8Breakdown.total_score !== 8,
  `Priority score must not simply equal raw severity rating (8); got composite score ${sev8Breakdown.total_score}`
);
assert(
  sev8Breakdown.total_score > 8,
  `Composite priority score for severity 8 report in populated district must be on 0-100 scale, got ${sev8Breakdown.total_score}`
);
assert(
  sev8Breakdown.sev_score === 80,
  `Normalized urgency for severity 8 should be 80 on 0-100 scale (8 * 10), got ${sev8Breakdown.sev_score}`
);

// -------------------------------------------------------------
// Test 13 — "Other civic issue" Category Baseline & Scoring
// -------------------------------------------------------------
console.log('\n[Test 13] Other Civic Issue Category Access and Scoring');
const otherBreakdown = calculatePriorityScore(baseDistrict, 'Other', 7, 5);
assert(
  otherBreakdown.current_access === 60,
  `'Other' category should have baseline access of 60%, got ${otherBreakdown.current_access}%`
);
assert(
  otherBreakdown.gap_score === 40,
  `'Other' category should have baseline gap of 40%, got ${otherBreakdown.gap_score}%`
);
assert(
  otherBreakdown.total_score >= 0 && otherBreakdown.total_score <= 100,
  `'Other' category priority score must be valid [0-100], got ${otherBreakdown.total_score}`
);

// -------------------------------------------------------------
// Test 14 — Priority Tier Classification Bounds
// -------------------------------------------------------------
console.log('\n[Test 14] Priority Tier Classification Bounds');
const criticalTier = getPriorityTier(85);
assert(criticalTier.label === 'Critical', `Score 85 should be Critical, got ${criticalTier.label}`);
const highTier = getPriorityTier(70);
assert(highTier.label === 'High', `Score 70 should be High, got ${highTier.label}`);
const moderateTier = getPriorityTier(50);
assert(moderateTier.label === 'Moderate', `Score 50 should be Moderate, got ${moderateTier.label}`);
const stableTier = getPriorityTier(30);
assert(stableTier.label === 'Stable', `Score 30 should be Stable, got ${stableTier.label}`);

// -------------------------------------------------------------
// Test 15 — Four Required Examples Re-Test & Validation
// -------------------------------------------------------------
console.log('\n[Test 15] Re-Testing Four Required Examples');

const examples = [
  { name: 'Peeling paint', category: 'Government' as const, severity: 3, text: 'Peeling paint on public library wall' },
  { name: 'Residential pothole', category: 'Roads' as const, severity: 7, text: 'Residential pothole on street' },
  { name: 'Major water outage', category: 'Water' as const, severity: 9, text: 'Major water outage affecting entire ward for 4 days' },
  { name: 'Live electrical cable', category: 'Electricity' as const, severity: 10, text: 'Live electrical cable hanging over a busy pedestrian walkway' },
];

examples.forEach((ex, idx) => {
  const breakdown = calculatePriorityScore(baseDistrict, ex.category, ex.severity, 2);
  const tier = getPriorityTier(breakdown.total_score, ex.severity);
  const contribs = getScoreComponentContributions(breakdown);
  console.log(`\nExample ${idx + 1}: ${ex.name}`);
  console.log(`  - Category: ${ex.category}`);
  console.log(`  - Severity: ${ex.severity}/10`);
  console.log(`  - Data Sources: District Registry (${baseDistrict.name}), Sector Access Baseline`);
  console.log(`  - Normalized Factor Inputs: Demand=${breakdown.demand_score}, Gap=${breakdown.gap_score}, Vuln=${breakdown.vuln_score}, Urgency=${breakdown.sev_score}, CapEx=${breakdown.align_score}`);
  console.log(`  - Weighted Contributions: Demand=${contribs.demandContrib}, Gap=${contribs.gapContrib}, Vuln=${contribs.vulnContrib}, Urgency=${contribs.urgencyContrib}, CapEx=${contribs.govContrib}`);
  console.log(`  - Composite Score: ${breakdown.total_score} / 100`);
  console.log(`  - Priority Tier: ${tier.label}`);

  assert(Math.abs(contribs.totalScore - breakdown.total_score) < 0.2, `${ex.name} sum of contributions must match composite score`);
  assert(breakdown.total_score >= 0 && breakdown.total_score <= 100, `${ex.name} composite score must be within [0, 100]`);
  assert(tier.label !== undefined, `${ex.name} must resolve a valid priority tier`);
});

// Specific Regression Check: Major water outage scenario receives severity 9 and High priority tier
const waterOutageBreakdown = calculatePriorityScore(baseDistrict, 'Water', 9, 2);
const waterOutageTier = getPriorityTier(waterOutageBreakdown.total_score, 9);
assert(waterOutageBreakdown.sev_score === 90, 'Major water outage severity score must normalize to 90');
assert(waterOutageTier.label === 'High' || waterOutageTier.label === 'Critical', 'Major water outage with severity 9 must be at least High priority tier');

console.log('\n🎉 ALL PRIORITY SCORING ENGINE TESTS PASSED SUCCESSFULLY!\n');


