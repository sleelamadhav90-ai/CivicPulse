import { 
  calculateAbsoluteChange, 
  calculatePercentageChange, 
  calculateGapReduction,
  buildImpactEvidenceFromProject,
  buildHypotheticalImpactSimulation,
  getImpactNatureBadge
} from './impactEvidence';
import { GovernmentProject, ImpactEvidenceNature } from '../types';
import { DISTRICTS_REGISTRY } from '../data/districts';
import { INITIAL_CITIZEN_REQUESTS } from '../data/initialRequests';
import { calculatePriorityScore } from './scoring';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('--- RUNNING STEP 2D-2 IMPACT EVIDENCE REGRESSION SUITE ---\n');

// 1. Missing post-intervention data
console.log('[Test 1] Missing post-intervention data must return null, never fabricate values');
const missingPostSig = calculateAbsoluteChange(100, null);
const missingPostPct = calculatePercentageChange(100, null);
const missingPostGap = calculateGapReduction(40, null, 100);
assert(missingPostSig === null, 'calculateAbsoluteChange with null post-value must return null');
assert(missingPostPct === null, 'calculatePercentageChange with null post-value must return null');
assert(missingPostGap === null, 'calculateGapReduction with null post-value must return null');

// 2. Measured outcome
console.log('\n[Test 2] Measured outcome calculation integrity');
const measuredDeltaSig = calculateAbsoluteChange(120, 24);
const measuredDeltaPct = calculatePercentageChange(120, 24);
const measuredGapRed = calculateGapReduction(35, 85, 100);
assert(measuredDeltaSig === -96, `Expected absolute change -96, got ${measuredDeltaSig}`);
assert(measuredDeltaPct === -80, `Expected percentage change -80%, got ${measuredDeltaPct}`);
assert(measuredGapRed === 76.9, `Expected gap reduction 76.9%, got ${measuredGapRed}`);

// 3. Hypothetical scenario vs Measured Outcome separation
console.log('\n[Test 3] Hypothetical scenario must never be merged or confused with Measured Outcome');
const sim = buildHypotheticalImpactSimulation({
  districtId: 'dist-01',
  districtName: 'Guntur',
  state: 'Andhra Pradesh',
  category: 'Water',
  interventionType: 'UPGRADE',
  intensity: 'Medium',
  baselineAccessPct: 38,
  baselineSignals: 42,
  baselineScore: 61.9,
  simulatedAccessGainPct: 35,
  simulatedSignalReductionPct: 60,
  simulatedScoreDeescalation: 25,
  targetBeneficiaries: 45000,
  estimatedCostCr: 6.5
});
assert(sim.nature === 'HYPOTHETICAL_SCENARIO', 'Simulation nature must strictly be HYPOTHETICAL_SCENARIO');
assert(sim.status === 'HYPOTHETICAL', 'Simulation status must be HYPOTHETICAL');
assert(sim.provenance.sourceType === 'DETERMINISTIC_ENGINE', 'Simulation provenance sourceType must be DETERMINISTIC_ENGINE');

// 4. Synthetic demo outcome
console.log('\n[Test 4] Synthetic demo outcome detection');
const demoProject: GovernmentProject = {
  id: 'gov-proj-water-guntur-01',
  title: 'Demonstration Pipeline Extension',
  district: 'Guntur',
  districtId: 'dist-01',
  state: 'Andhra Pradesh',
  category: 'Water',
  priorityScore: 61.9,
  citizenRequestsCount: 42,
  population: 45000,
  estimatedCostInr: 12000000,
  status: 'Completed',
  progress: 100,
  department: 'Rural Water Supply',
  officerInCharge: 'Chief Engineer',
  startDate: '2026-01-01',
  targetDate: '2026-06-30',
  beforeAccess: 35,
  afterAccess: 85,
  description: 'Demonstration pipeline extension for rural wards.',
  keyReasoning: ['Water salinity deficit', 'High demand density'],
  aiSummary: 'Prioritized water expansion project.',
  history: []
};
const demoEvidence = buildImpactEvidenceFromProject(demoProject);
assert(demoEvidence.status === 'COMPLETED' || demoEvidence.status === 'MEASURED', 'Completed project evidence status must be COMPLETED or MEASURED');
assert(demoEvidence.nature === 'SYNTHETIC_DEMO', 'gov-proj ID must resolve to SYNTHETIC_DEMO nature');

// 5. Public benchmark
console.log('\n[Test 5] Public benchmark badge & classification');
const benchmarkBadge = getImpactNatureBadge('PUBLIC_BENCHMARK');
assert(benchmarkBadge.label === 'Public Benchmark', 'Badge for PUBLIC_BENCHMARK must be "Public Benchmark"');
const measuredBadge = getImpactNatureBadge('MEASURED_OUTCOME');
assert(measuredBadge.label === 'Measured Outcome', 'Badge for MEASURED_OUTCOME must be "Measured Outcome"');

// 6. Project without impact data
console.log('\n[Test 6] Project in progress without completion data');
const inProgressProject: GovernmentProject = {
  id: 'gov-action-roads-02',
  title: 'Ongoing Arterial Repair',
  district: 'Warangal',
  districtId: 'dist-02',
  state: 'Telangana',
  category: 'Roads',
  priorityScore: 78.4,
  citizenRequestsCount: 65,
  population: 80000,
  estimatedCostInr: 25000000,
  status: 'In Progress',
  progress: 45,
  department: 'Public Works Department',
  officerInCharge: 'Divisional Engineer',
  startDate: '2026-03-01',
  targetDate: '2026-11-30',
  beforeAccess: 40,
  afterAccess: 80,
  description: 'Arterial road reconstruction.',
  keyReasoning: ['Pothole hazards'],
  aiSummary: 'High priority transit corridor.',
  history: []
};
const inProgressEvidence = buildImpactEvidenceFromProject(inProgressProject);
assert(inProgressEvidence.status === 'IN_PROGRESS', 'In-progress project must have status IN_PROGRESS');
assert(inProgressEvidence.metrics[0].postInterventionValue === undefined || inProgressEvidence.metrics[0].postInterventionValue === null, 'Post intervention value must be undefined/null when project in progress');

// 7. Provenance preservation
console.log('\n[Test 7] Provenance preservation in Evidence Bundles');
assert(demoEvidence.metrics[0].provenance.sourceName.length > 0, 'Source provenance preserved on metric');
assert(demoEvidence.provenance.sourceName.length > 0, 'Source provenance preserved on bundle');

// 8. Recommendation Lineage Preservation
console.log('\n[Test 8] Action and Recommendation ID Lineage preservation');
const linkedProject: GovernmentProject = {
  ...demoProject,
  sourceRecommendationId: 'rec-dist-01-water',
  actionId: 'act-10492'
};
const linkedEvidence = buildImpactEvidenceFromProject(linkedProject);
assert(linkedEvidence.recommendationId === 'rec-dist-01-water', 'recommendationId must be preserved in bundle');
assert(linkedEvidence.actionId === 'act-10492', 'actionId must be preserved in bundle');

// 9. Guntur Water Score Regression Test (Must be exactly 61.9)
console.log('\n[Test 9] Guntur Water Priority Score calculation regression (Target: 61.9)');
const gunturDistrict = DISTRICTS_REGISTRY.find(d => d.id === 'guntur' || d.id === 'dist-01' || d.name === 'Guntur');
assert(!!gunturDistrict, 'Guntur district must exist in DISTRICTS_REGISTRY');
if (gunturDistrict) {
  const gunturWaterRequests = INITIAL_CITIZEN_REQUESTS.filter(r => 
    (r.district === 'Guntur' || r.district === gunturDistrict.name) && r.category === 'Water'
  );
  const avgSeverity = gunturWaterRequests.length > 0 
    ? Math.round(gunturWaterRequests.reduce((acc, r) => acc + (r.severity || 5), 0) / gunturWaterRequests.length) 
    : 8;
  const scoreResult = calculatePriorityScore(gunturDistrict, 'Water', avgSeverity, gunturWaterRequests.length);
  console.log(`Guntur Water Priority Score: ${scoreResult.total_score}`);
  assert(scoreResult.total_score === 61.9, `Guntur Water Priority Score MUST be 61.9, got ${scoreResult.total_score}`);
}

console.log('\n🎉 ALL 9 REGRESSION TESTS & GUNTUR WATER SCORE TEST PASSED SUCCESSFULLY!');
