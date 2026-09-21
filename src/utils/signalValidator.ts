/**
 * CIVICPULSE SIGNAL VALIDATION & NORMALIZATION LAYER
 *
 * Architecture:
 *   AI Extraction / Citizen Input
 *        │
 *        ▼
 *   Validation & Normalization Layer (signalValidator.ts)
 *        │
 *        ▼
 *   Evidence Bundle Generation (evidenceBundleService.ts)
 *        │
 *        ▼
 *   Deterministic Priority Engine (scoring.ts)
 *
 * This layer verifies and cleans incoming extracted signal attributes before
 * they enter the evidence bundle and deterministic scoring engine.
 * Ensures zero hallucinated inputs and safe fallbacks when fields are missing.
 */

import { InfrastructureCategory, District, CitizenRequest } from '../types';
import { DISTRICTS_REGISTRY } from '../data/districts';

export interface ValidationResult {
  isValid: boolean;
  districtMatched: boolean;
  districtName: string | null;
  categoryRecognized: boolean;
  validatedCategory: InfrastructureCategory | null;
  severityBounded: boolean;
  normalizedSeverity: number;
  scoringInputsComplete: boolean;
  validationFlags: string[];
  dataQualityScore: number; // 0 to 100
}

const VALID_CATEGORIES: InfrastructureCategory[] = [
  'Water',
  'Roads',
  'Drainage',
  'Sanitation',
  'Healthcare',
  'Health',
  'Education',
  'Electricity',
  'Other',
];

/**
 * Validates and normalizes an extracted signal or community issue record.
 */
export function validateSignalRecord(
  locationQuery?: string,
  rawCategory?: string,
  rawSeverity?: number,
  districtContext?: District
): ValidationResult {
  const flags: string[] = [];
  let qualityPoints = 0;

  // 1. District Validation
  let matchedDistrict: District | null = districtContext || null;
  if (!matchedDistrict && locationQuery) {
    const q = locationQuery.trim().toLowerCase();
    matchedDistrict = DISTRICTS_REGISTRY.find(d => 
      d.name.toLowerCase() === q || 
      d.state.toLowerCase() === q ||
      q.includes(d.name.toLowerCase()) ||
      d.name.toLowerCase().includes(q)
    ) || null;
  }

  const districtMatched = Boolean(matchedDistrict);
  if (districtMatched) {
    qualityPoints += 30;
    flags.push(`District validated: ${matchedDistrict?.name}, ${matchedDistrict?.state}`);
  } else {
    flags.push(`District unverified: '${locationQuery || 'Unknown'}'. Using default fallback region.`);
  }

  // 2. Category Recognition
  let validatedCategory: InfrastructureCategory | null = null;
  if (rawCategory) {
    const matchedCat = VALID_CATEGORIES.find(c => 
      c.toLowerCase() === rawCategory.trim().toLowerCase() ||
      rawCategory.toLowerCase().includes(c.toLowerCase()) ||
      c.toLowerCase().includes(rawCategory.toLowerCase())
    );
    if (matchedCat) {
      validatedCategory = matchedCat;
    }
  }

  const categoryRecognized = Boolean(validatedCategory);
  if (categoryRecognized) {
    qualityPoints += 30;
    flags.push(`Category verified: ${validatedCategory}`);
  } else {
    validatedCategory = 'Water'; // Safe default
    flags.push(`Category unverified: '${rawCategory || 'Unspecified'}'. Defaulted to Water.`);
  }

  // 3. Severity & Urgency Bounding
  let normalizedSeverity = 5;
  let severityBounded = true;
  if (typeof rawSeverity === 'number' && !isNaN(rawSeverity)) {
    if (rawSeverity >= 1 && rawSeverity <= 10) {
      normalizedSeverity = Math.round(rawSeverity);
      qualityPoints += 20;
      flags.push(`Urgency bounded: ${normalizedSeverity}/10`);
    } else if (rawSeverity > 10 && rawSeverity <= 100) {
      normalizedSeverity = Math.round(rawSeverity / 10);
      qualityPoints += 20;
      flags.push(`Urgency normalized: ${rawSeverity}/100 → ${normalizedSeverity}/10`);
    } else {
      severityBounded = false;
      normalizedSeverity = 5;
      flags.push(`Urgency out of bounds (${rawSeverity}). Bound to default scale 5/10.`);
    }
  } else {
    qualityPoints += 10;
    flags.push(`Urgency field omitted. Applied neutral baseline 5/10.`);
  }

  // 4. Scoring Inputs Completeness Check
  const scoringInputsComplete = Boolean(
    matchedDistrict && 
    matchedDistrict.population > 0 && 
    typeof matchedDistrict.poverty_index === 'number'
  );

  if (scoringInputsComplete) {
    qualityPoints += 20;
    flags.push('Public demographic & infrastructure baseline inputs present.');
  } else {
    flags.push('Demographic baseline incomplete; using state benchmark dataset.');
  }

  return {
    isValid: districtMatched && categoryRecognized,
    districtMatched,
    districtName: matchedDistrict?.name || null,
    categoryRecognized,
    validatedCategory,
    severityBounded,
    normalizedSeverity,
    scoringInputsComplete,
    validationFlags: flags,
    dataQualityScore: Math.min(100, qualityPoints),
  };
}

/**
 * Validates a CitizenRequest item
 */
export function validateCitizenRequest(req: CitizenRequest): ValidationResult {
  const dist = DISTRICTS_REGISTRY.find(d => d.id === req.district || d.name.toLowerCase() === (req.district || '').toLowerCase());
  const severityVal = typeof req.severity === 'number' ? req.severity : 5;
  return validateSignalRecord(req.district || req.locality, req.category, severityVal, dist);
}
