import { en } from '../translations/en';
import { hi } from '../translations/hi';
import { te } from '../translations/te';
import { ta } from '../translations/ta';
import { kn } from '../translations/kn';
import { mr } from '../translations/mr';
import { bn } from '../translations/bn';
import { or } from '../translations/or';
import { DISTRICTS_REGISTRY } from '../data/districts';
import { INITIAL_CITIZEN_REQUESTS } from '../data/initialRequests';
import { matchesDistrict } from './districtMatcher';
import { INITIAL_COMMUNITY_ISSUES, resolveIssueDistrict, CommunityIssue } from '../components/CommunityIssuesView';
import { calculatePriorityScore, SCORING_WEIGHTS } from './scoring';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

console.log('--- RUNNING STEP 2E-2 MULTILINGUAL & AGGREGATION REGRESSION SUITE ---');

// 1. Localization Parity Test (Coverage across all 8 languages)
console.log('\n[Test 1] Complete Localization Coverage Across All 8 Languages');
const dicts: Record<string, Record<string, string>> = { en, hi, te, ta, kn, mr, bn, or };
const enKeys = Object.keys(en);
const targetCount = enKeys.length;
assert(targetCount > 0, `English dictionary must have keys, got ${targetCount}`);

for (const [langCode, dict] of Object.entries(dicts)) {
  const dictKeys = Object.keys(dict);
  const missingKeys = enKeys.filter(k => !(k in dict));
  const extraKeys = dictKeys.filter(k => !(k in en));
  assert(
    dictKeys.length === targetCount && missingKeys.length === 0 && extraKeys.length === 0,
    `Language '${langCode}' must match English ${targetCount}/${targetCount} keys (count: ${dictKeys.length}, missing: ${missingKeys.length}, extra: ${extraKeys.length})`
  );
}

// 2. District Matcher Regression Test (No Substring False Matches)
console.log('\n[Test 2] Deterministic District Matcher Regressions');
const patnaDistrict = DISTRICTS_REGISTRY.find(d => d.id === 'patna');
assert(!!patnaDistrict, 'Patna must exist in DISTRICTS_REGISTRY');

const gunturDistrict = DISTRICTS_REGISTRY.find(d => d.id === 'guntur');
assert(!!gunturDistrict, 'Guntur must exist in DISTRICTS_REGISTRY');

const kalahandiDistrict = DISTRICTS_REGISTRY.find(d => d.id === 'kalahandi');
assert(!!kalahandiDistrict, 'Kalahandi must exist in DISTRICTS_REGISTRY');

if (patnaDistrict && gunturDistrict && kalahandiDistrict) {
  // A. Visakhapatnam must NOT match Patna
  const visakhapatnamMatch = matchesDistrict(
    { district: 'Visakhapatnam', location: 'Visakhapatnam' },
    patnaDistrict
  );
  assert(!visakhapatnamMatch, 'Visakhapatnam request must NOT match Patna district');

  // B. Bhawanipatna (in Kalahandi) must NOT match Patna
  const bhawanipatnaMatch = matchesDistrict(
    { district: 'Kalahandi', location: 'Bhawanipatna, Kalahandi' },
    patnaDistrict
  );
  assert(!bhawanipatnaMatch, 'Bhawanipatna request must NOT match Patna district');

  // C. Patna must match Patna
  const patnaMatch = matchesDistrict(
    { district: 'Patna', location: 'Kankarbagh, Patna' },
    patnaDistrict
  );
  assert(patnaMatch, 'Patna request must match Patna district');

  // D. Guntur must match Guntur
  const gunturMatch = matchesDistrict(
    { district: 'Guntur', location: 'Old Guntur Market Yard, Guntur' },
    gunturDistrict
  );
  assert(gunturMatch, 'Guntur request must match Guntur district');

  // E. Kalahandi must match Kalahandi
  const kalahandiMatch = matchesDistrict(
    { district: 'Kalahandi', location: 'Bhawanipatna, Kalahandi' },
    kalahandiDistrict
  );
  assert(kalahandiMatch, 'Kalahandi request must match Kalahandi district');
}

// 3. Community Issue Target District Resolution
console.log('\n[Test 3] Community Issues Authoritative District Resolution');
const initialIssues = INITIAL_COMMUNITY_ISSUES;
assert(initialIssues.length === 5, 'INITIAL_COMMUNITY_ISSUES must contain 5 baseline issues');

for (const issue of initialIssues) {
  const resolved = resolveIssueDistrict(issue);
  assert(!!resolved, `Issue ${issue.id} must resolve to a valid district object`);
  assert(!!resolved?.id && !!resolved?.name, `Issue ${issue.id} resolved district must have id and name`);
}

const gunturWaterIssue = initialIssues.find(i => i.id === 'ISSUE-WAT-001')!;
const gunturResolved = resolveIssueDistrict(gunturWaterIssue)!;
assert(gunturResolved.id === 'guntur', `ISSUE-WAT-001 must resolve to district 'guntur', got '${gunturResolved.id}'`);

const patnaRoadsIssue = initialIssues.find(i => i.id === 'ISSUE-RD-002')!;
const patnaResolved = resolveIssueDistrict(patnaRoadsIssue)!;
assert(patnaResolved.id === 'patna', `ISSUE-RD-002 must resolve to district 'patna', got '${patnaResolved.id}'`);

// 4. Invariants Verification
console.log('\n[Test 4] System Invariants Audit');

// A. 52 Districts invariant (5 Level 1, 10 Level 2, 37 Level 3)
import { getDistrictDataDepth } from './provenance';

const totalDistricts = DISTRICTS_REGISTRY.length;
let l1 = 0;
let l2 = 0;
let l3 = 0;
for (const d of DISTRICTS_REGISTRY) {
  const depth = getDistrictDataDepth(d.id);
  if (depth.badgeLabel.startsWith('Level 1')) l1++;
  else if (depth.badgeLabel.startsWith('Level 2')) l2++;
  else l3++;
}
assert(totalDistricts === 52, `Must have exactly 52 districts in registry, found ${totalDistricts}`);
assert(l1 === 5, `Must have 5 Level 1 districts, found ${l1}`);
assert(l2 === 10, `Must have 10 Level 2 districts, found ${l2}`);
assert(l3 === 37, `Must have 37 Level 3 districts, found ${l3}`);

// B. Scoring Weights invariant (30/25/20/15/10)
assert(SCORING_WEIGHTS.citizenDemand === 0.30, 'Citizen Demand weight must be 0.30');
assert(SCORING_WEIGHTS.infrastructureGap === 0.25, 'Infrastructure Gap weight must be 0.25');
assert(SCORING_WEIGHTS.populationImpact === 0.20, 'Population Impact weight must be 0.20');
assert(SCORING_WEIGHTS.urgency === 0.15, 'Urgency weight must be 0.15');
assert(SCORING_WEIGHTS.governmentPriority === 0.10, 'Government Priority weight must be 0.10');

// C. Guntur Water Priority Score = 61.9
const gunturWaterRequests = INITIAL_CITIZEN_REQUESTS.filter(r => 
  (r.district === 'Guntur' || r.district === gunturDistrict?.name) && r.category === 'Water'
);
const avgSeverity = gunturWaterRequests.length > 0 
  ? Math.round(gunturWaterRequests.reduce((acc, r) => acc + (r.severity || 5), 0) / gunturWaterRequests.length) 
  : 8;
const gunturScoreResult = calculatePriorityScore(gunturDistrict!, 'Water', avgSeverity, gunturWaterRequests.length);
assert(
  gunturScoreResult.total_score === 61.9,
  `Guntur Water Priority Score must remain 61.9, got ${gunturScoreResult.total_score}`
);

// D. Priority Score Scale Invariant (0 - 100)
assert(
  gunturScoreResult.total_score >= 0 && gunturScoreResult.total_score <= 100,
  'Priority Score must be on a 0–100 scale'
);

console.log('\n🎉 ALL STEP 2E-2 REGRESSION TESTS COMPLETED SUCCESSFULLY!');
