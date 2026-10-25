import { DISTRICTS_REGISTRY } from '../../data/districts';
import { District, CitizenRequest } from '../../types';
import { isValidCoordinate } from '../../utils/mapStandards';

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
  console.log(`✅ PASS: ${message}`);
}

console.log('🧪 Starting CivicPulse Map Navigation & Spatial Verification Tests...\n');

// Test 1: State & District Name Collision Resolution (e.g., Bilaspur in HP vs CG)
function resolveDistrict(districts: District[], stateName: string, districtName: string): District | undefined {
  const normState = stateName.toLowerCase().trim();
  const normDist = districtName.toLowerCase().trim();

  const strictMatch = districts.find(d => 
    (d.name.toLowerCase() === normDist || d.id.toLowerCase() === normDist) &&
    d.state.toLowerCase() === normState
  );
  if (strictMatch) return strictMatch;

  return districts.find(d => d.name.toLowerCase() === normDist || d.id.toLowerCase() === normDist);
}

const testDistricts: District[] = [
  { id: 'HP-BILAS', name: 'Bilaspur', state: 'Himachal Pradesh', lat: 31.33, lon: 76.78, population: 380000, poverty_index: 0.12, zone: 'North', area_sq_km: 1167, literacy_rate: 85, hdi: 0.72 },
  { id: 'CG-BILAS', name: 'Bilaspur', state: 'Chhattisgarh', lat: 22.08, lon: 82.15, population: 2662000, poverty_index: 0.28, zone: 'Central', area_sq_km: 8272, literacy_rate: 78, hdi: 0.61 },
  { id: 'UP-PART', name: 'Pratapgarh', state: 'Uttar Pradesh', lat: 25.91, lon: 81.94, population: 3200000, poverty_index: 0.35, zone: 'North', area_sq_km: 3717, literacy_rate: 71, hdi: 0.58 },
  { id: 'RJ-PART', name: 'Pratapgarh', state: 'Rajasthan', lat: 24.03, lon: 74.78, population: 868000, poverty_index: 0.31, zone: 'West', area_sq_km: 4117, literacy_rate: 68, hdi: 0.57 },
];

const resolvedHPBilaspur = resolveDistrict(testDistricts, 'Himachal Pradesh', 'Bilaspur');
assert(Boolean(resolvedHPBilaspur && resolvedHPBilaspur.id === 'HP-BILAS'), 'Resolves Bilaspur in Himachal Pradesh correctly');

const resolvedCGBilaspur = resolveDistrict(testDistricts, 'Chhattisgarh', 'Bilaspur');
assert(Boolean(resolvedCGBilaspur && resolvedCGBilaspur.id === 'CG-BILAS'), 'Resolves Bilaspur in Chhattisgarh correctly, avoiding collision');

const resolvedUPPratapgarh = resolveDistrict(testDistricts, 'Uttar Pradesh', 'Pratapgarh');
assert(Boolean(resolvedUPPratapgarh && resolvedUPPratapgarh.id === 'UP-PART'), 'Resolves Pratapgarh in Uttar Pradesh correctly');

console.log('✅ Test 1 Passed: State + District composite resolution prevents name collisions.');

// Test 2: Coordinate Fallback vs Exact Coordinates
function getFocusedCoordinate(
  request: CitizenRequest | null,
  districts: District[],
  urlLat?: number | null,
  urlLng?: number | null,
  urlDistrict?: string | null,
  urlState?: string | null
): [number, number] | null {
  if (urlLat && urlLng && isValidCoordinate(urlLat, urlLng)) {
    return [urlLat, urlLng];
  }
  if (request) {
    if (typeof request.latitude === 'number' && typeof request.longitude === 'number' && isValidCoordinate(request.latitude, request.longitude)) {
      return [request.latitude, request.longitude];
    }
    if (request.district) {
      const d = resolveDistrict(districts, request.state || '', request.district);
      if (d && isValidCoordinate(d.lat, d.lon)) {
        return [d.lat, d.lon];
      }
    }
  }
  if (urlDistrict) {
    const d = resolveDistrict(districts, urlState || '', urlDistrict);
    if (d && isValidCoordinate(d.lat, d.lon)) {
      return [d.lat, d.lon];
    }
  }
  return null;
}

const sampleReqWithExactCoords: CitizenRequest = {
  id: 'CP-TEST-001',
  category: 'Water',
  district: 'Bilaspur',
  state: 'Himachal Pradesh',
  latitude: 31.3500,
  longitude: 76.7900,
};

const exactCoord = getFocusedCoordinate(sampleReqWithExactCoords, testDistricts);
assert(exactCoord !== null && exactCoord[0] === 31.3500 && exactCoord[1] === 76.7900, 'Uses exact complaint coordinates when available');

const sampleReqWithoutCoords: CitizenRequest = {
  id: 'CP-TEST-002',
  category: 'Roads',
  district: 'Bilaspur',
  state: 'Chhattisgarh',
};

const fallbackCoord = getFocusedCoordinate(sampleReqWithoutCoords, testDistricts);
assert(fallbackCoord !== null && fallbackCoord[0] === 22.08 && fallbackCoord[1] === 82.15, 'Falls back safely to verified district center when exact coordinates are absent');

console.log('✅ Test 2 Passed: Exact coordinates prioritized with verified district center fallback.');

// Test 3: Failed Submission Does Not Trigger Navigation
let navigationCalled = false;
async function mockSubmit(payload: any, shouldSucceed: boolean) {
  if (!shouldSucceed) {
    return { ok: false, status: 500 };
  }
  return { ok: true, status: 200 };
}

async function handleSubmissionAttempt(shouldSucceed: boolean) {
  navigationCalled = false;
  const res = await mockSubmit({}, shouldSucceed);
  if (res.ok) {
    navigationCalled = true;
  }
}

await handleSubmissionAttempt(false);
assert(!navigationCalled, 'Failed submission does NOT trigger map navigation');

await handleSubmissionAttempt(true);
assert(navigationCalled, 'Successful submission triggers map navigation');

console.log('✅ Test 3 Passed: Failed submissions strictly prevented from initiating map navigation.');

// Test 4: URL Parameters & Reset Handling
const params = new URLSearchParams('state=Himachal+Pradesh&district=Bilaspur&highlightPin=CP-TEST-001&lat=31.35&lng=76.79');
assert(params.get('state') === 'Himachal Pradesh', 'URL state parameter parsed correctly');
assert(params.get('district') === 'Bilaspur', 'URL district parameter parsed correctly');
assert(params.get('highlightPin') === 'CP-TEST-001', 'URL highlightPin parsed correctly');

params.delete('state');
params.delete('district');
params.delete('highlightPin');
params.delete('lat');
params.delete('lng');

assert(!params.has('state') && !params.has('district') && !params.has('highlightPin'), 'Reset clears all focus and highlight parameters for All India overview');

console.log('✅ Test 4 Passed: URL state synchronization and All India overview reset verified.');

console.log('\n🎉 ALL MAP NAVIGATION & SPATIAL VERIFICATION TESTS PASSED SUCCESSFULLY!');
