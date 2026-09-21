import { 
  IMPACT_MODEL_CONFIG, 
  evaluateModeledImpact, 
  computeBaselineImpact,
  InterventionTypeKey,
  IntensityLevel 
} from './impactModel';
import { DISTRICTS_REGISTRY } from '../data/districts';
import { District } from '../types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('--- RUNNING IMPACT EVALUATION & MODELING ENGINE DETERMINISTIC TEST SUITE ---\n');

const testDistrict = DISTRICTS_REGISTRY.find(d => d.id === 'guntur') || DISTRICTS_REGISTRY[0];

// Test 1: Determinism - Same input produces identical projection
console.log('[Test 1] Determinism: Identical inputs must yield strictly identical projections');
const run1 = evaluateModeledImpact({
  district: testDistrict,
  category: 'Water',
  interventionType: 'UPGRADE',
  intensity: 'Medium',
});
const run2 = evaluateModeledImpact({
  district: testDistrict,
  category: 'Water',
  interventionType: 'UPGRADE',
  intensity: 'Medium',
});
assert(JSON.stringify(run1.modeled) === JSON.stringify(run2.modeled), 'Run 1 and Run 2 modeled metrics must match identically');
assert(JSON.stringify(run1.baseline) === JSON.stringify(run2.baseline), 'Run 1 and Run 2 baseline metrics must match identically');
assert(JSON.stringify(run1.assumptions) === JSON.stringify(run2.assumptions), 'Run 1 and Run 2 assumptions must match identically');

// Test 2: Monotonicity - Increasing intervention magnitude produces consistent modeled direction
console.log('\n[Test 2] Monotonicity: Increasing intervention intensity must increase access gain and decrease signals');
const low = evaluateModeledImpact({ district: testDistrict, category: 'Water', interventionType: 'UPGRADE', intensity: 'Low' });
const med = evaluateModeledImpact({ district: testDistrict, category: 'Water', interventionType: 'UPGRADE', intensity: 'Medium' });
const high = evaluateModeledImpact({ district: testDistrict, category: 'Water', interventionType: 'UPGRADE', intensity: 'High' });

assert(low.modeled.projectedAccessPct <= med.modeled.projectedAccessPct, 'Access with Low intensity <= Medium intensity');
assert(med.modeled.projectedAccessPct <= high.modeled.projectedAccessPct, 'Access with Medium intensity <= High intensity');
assert(low.modeled.projectedSignals >= med.modeled.projectedSignals, 'Signals with Low intensity >= Medium intensity');
assert(med.modeled.projectedSignals >= high.modeled.projectedSignals, 'Signals with Medium intensity >= High intensity');
assert(low.modeled.projectedPriorityScore >= med.modeled.projectedPriorityScore, 'Priority score with Low intensity >= Medium intensity');

// Test 3: Baseline Immutability - Baseline values must not be mutated
console.log('\n[Test 3] Baseline Immutability: Underlying district and baseline object must remain unmutated');
const districtClone = JSON.parse(JSON.stringify(testDistrict));
const baselineBefore = computeBaselineImpact(testDistrict, 'Water');
evaluateModeledImpact({ district: testDistrict, category: 'Water', interventionType: 'BUILD', intensity: 'High' });
assert(JSON.stringify(testDistrict) === JSON.stringify(districtClone), 'Input district object must not be mutated');
const baselineAfter = computeBaselineImpact(testDistrict, 'Water');
assert(JSON.stringify(baselineBefore) === JSON.stringify(baselineAfter), 'Baseline calculation must remain unmutated');

// Test 4: Clear Distinction - Modeled values are distinct from baseline and have explicit labels
console.log('\n[Test 4] Distinction: Modeled values must be clearly labeled and distinguished from baseline');
assert(run1.baseline.provenanceLabel.includes('registry') || run1.baseline.provenanceLabel.includes('baseline'), 'Baseline provenance must point to registry/baseline');
assert(run1.modeled.provenanceLabel.includes('deterministic impact model'), 'Modeled provenance must explicitly state deterministic impact model');
assert(!run1.modeled.provenanceLabel.toLowerCase().includes('actual outcome'), 'Modeled provenance must NEVER claim actual outcome');
assert(!run1.modeled.provenanceLabel.toLowerCase().includes('measured result'), 'Modeled provenance must NEVER claim measured result');

// Test 5: Number Sanity - No NaN, undefined, or infinite outputs
console.log('\n[Test 5] Number Sanity: No NaN, null, or out-of-range metrics');
const categories: ('Water' | 'Roads' | 'Health' | 'Electricity' | 'Sanitation' | 'Drainage')[] = ['Water', 'Roads', 'Health', 'Electricity', 'Sanitation', 'Drainage'];
for (const cat of categories) {
  const result = evaluateModeledImpact({ district: testDistrict, category: cat, interventionType: 'FIX', intensity: 'Low' });
  assert(!isNaN(result.modeled.projectedAccessPct), `${cat}: projectedAccessPct must not be NaN`);
  assert(!isNaN(result.modeled.projectedSignals), `${cat}: projectedSignals must not be NaN`);
  assert(!isNaN(result.modeled.projectedPriorityScore), `${cat}: projectedPriorityScore must not be NaN`);
  assert(!isNaN(result.assumptions.estimatedCapitalCr), `${cat}: estimatedCapitalCr must not be NaN`);
  assert(result.modeled.projectedAccessPct >= 0 && result.modeled.projectedAccessPct <= 100, `${cat}: projectedAccessPct must be in [0, 100]`);
}

// Test 6: Boundary Handling - Safe execution with extreme inputs
console.log('\n[Test 6] Boundary Handling: District with 0 or 100% access');
const zeroAccessDist: District = {
  ...testDistrict,
  id: 'zero-test',
  name: 'Zero Access District',
  water_access: 0,
  health_access: 0,
  road_quality: 0,
  education_access: 0,
};
const resZero = evaluateModeledImpact({ district: zeroAccessDist, category: 'Water', interventionType: 'BUILD', intensity: 'High' });
assert(resZero.modeled.projectedAccessPct > 0, 'Zero access district must project positive access gain');
assert(resZero.modeled.projectedAccessPct <= 95, 'Zero access district must respect 95% ceiling');

const fullAccessDist: District = {
  ...testDistrict,
  id: 'full-test',
  name: 'Full Access District',
  water_access: 100,
  health_access: 100,
  road_quality: 100,
  education_access: 100,
};
const resFull = evaluateModeledImpact({ district: fullAccessDist, category: 'Water', interventionType: 'FIX', intensity: 'Low' });
assert(resFull.modeled.projectedAccessPct <= 100, 'Full access district projected access must not exceed 100%');
assert(!isNaN(resFull.modeled.signalsReductionPct), 'Full access district signals reduction must not be NaN');

// Test 7: Parameter Transparency - Assumptions exposed accurately
console.log('\n[Test 7] Parameter Transparency: Assumptions must be accurately exposed and verifiable');
const buildHigh = evaluateModeledImpact({ district: testDistrict, category: 'Water', interventionType: 'BUILD', intensity: 'High' });
assert(buildHigh.assumptions.baseCoverageGainFactor === 0.65, 'BUILD baseCoverageGainFactor must be 0.65');
assert(buildHigh.assumptions.intensityMultiplier === 1.25, 'High intensityMultiplier must be 1.25');
assert(buildHigh.assumptions.evaluationHorizonMonths === 24, 'BUILD evaluationHorizonMonths must be 24');
assert(buildHigh.assumptions.disclaimerText === IMPACT_MODEL_CONFIG.disclaimer, 'Disclaimer text must match config exactly');

// Test 8: Proposed Measurement Plan Completeness
console.log('\n[Test 8] Measurement Plan Completeness: Must provide structured post-delivery criteria');
assert(run1.measurementPlan.length >= 5, 'Measurement plan must include at least 5 metrics');
for (const plan of run1.measurementPlan) {
  assert(Boolean(plan.name && plan.methodology && plan.cadence && plan.verifyingAgency), `Metric ${plan.id} must have complete audit spec`);
  assert(plan.statusText.includes('Not available') || plan.statusText.includes('post-intervention'), `Metric status must state post-intervention requirement`);
}

// Test 9: Closed Loop Stages Representation
console.log('\n[Test 9] Closed Loop Architecture: 8 structured stages');
assert(IMPACT_MODEL_CONFIG.closedLoopStages.length === 8, 'Closed loop model must contain 8 stages');
assert(IMPACT_MODEL_CONFIG.closedLoopStages[4].nature === 'MODELED_PROJECTION', 'Stage 5 must be MODELED_PROJECTION');
assert(IMPACT_MODEL_CONFIG.closedLoopStages[6].nature === 'FUTURE_MEASUREMENT', 'Stage 7 must be FUTURE_MEASUREMENT');

console.log('\n🎉 ALL 9 IMPACT EVALUATION TESTS PASSED SUCCESSFULLY!');
