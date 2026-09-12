import { DISTRICTS_REGISTRY } from '../data/districts';

/**
 * Escapes regex special characters in a string.
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Normalizes an alphanumeric identifier for strict equality checks.
 * Strips whitespace, hyphens, underscores, and punctuation.
 */
function normalizeStrict(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Checks if a candidate text contains the target district name or ID as a distinct,
 * word-bounded token or phrase.
 * Prevents substring false-matches like 'Visakhapatnam' -> 'Patna' or 'Bhawanipatna' -> 'Patna'.
 */
function matchesDistrictToken(text: string, targetName: string, targetId: string): boolean {
  if (!text) return false;

  // Word-boundary pattern for target district name (handles multi-word names like 'South 24 Parganas')
  const nameParts = targetName.trim().split(/\s+/).map(escapeRegExp);
  const namePattern = new RegExp(`(?:^|[^a-zA-Z0-9])${nameParts.join('\\s+')}(?:$|[^a-zA-Z0-9])`, 'i');
  if (namePattern.test(text)) {
    return true;
  }

  // Word-boundary pattern for readable target ID (e.g. 'south_24_parganas' -> 'south 24 parganas')
  const idReadable = targetId.replace(/_/g, ' ').trim();
  if (idReadable.toLowerCase() !== targetName.toLowerCase()) {
    const idParts = idReadable.split(/\s+/).map(escapeRegExp);
    const idPattern = new RegExp(`(?:^|[^a-zA-Z0-9])${idParts.join('\\s+')}(?:$|[^a-zA-Z0-9])`, 'i');
    if (idPattern.test(text)) {
      return true;
    }
  }

  return false;
}

/**
 * Authoritative, deterministic helper to check if a citizen request belongs to a specific district.
 *
 * Matching Priority:
 * 1. Exact district ID match
 * 2. Exact normalized district-name match
 * 3. Explicit district field token/phrase match
 * 4. Safe token/phrase matching inside location or locality (word-bounded)
 * 5. Otherwise NO district match (never guesses, never uses fuzzy matching)
 */
export function matchesDistrict(
  request: { district?: string | null; location?: string | null; locality?: string | null },
  targetDistrict: { id: string; name: string }
): boolean {
  const reqDist = (request.district || '').trim();
  const targetId = targetDistrict.id.toLowerCase();
  const targetName = targetDistrict.name.toLowerCase();

  // 1. Exact district ID match
  if (reqDist && normalizeStrict(reqDist) === normalizeStrict(targetId)) {
    return true;
  }

  // 2. Exact normalized district-name match
  if (reqDist && normalizeStrict(reqDist) === normalizeStrict(targetName)) {
    return true;
  }

  // 3. Explicit district field token/phrase match
  if (reqDist) {
    if (matchesDistrictToken(reqDist, targetDistrict.name, targetDistrict.id)) {
      return true;
    }

    // If the request explicitly declares a known DIFFERENT registered district,
    // do NOT fall through to location matching (respect explicit district attribution).
    const otherDist = DISTRICTS_REGISTRY.find(d =>
      d.id !== targetDistrict.id && (
        normalizeStrict(reqDist) === normalizeStrict(d.id) ||
        normalizeStrict(reqDist) === normalizeStrict(d.name) ||
        matchesDistrictToken(reqDist, d.name, d.id)
      )
    );
    if (otherDist) {
      return false;
    }
  }

  // 4. Safe token/phrase matching inside location or locality
  const loc = request.location || '';
  const locality = request.locality || '';
  if (matchesDistrictToken(loc, targetDistrict.name, targetDistrict.id)) {
    return true;
  }
  if (matchesDistrictToken(locality, targetDistrict.name, targetDistrict.id)) {
    return true;
  }

  // 5. Otherwise NO district match
  return false;
}
