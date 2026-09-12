import { CitizenRequest, DataProvenance, ProvenanceDisplayLabel, District } from '../types';
import { getPublicDataForDistrict } from '../data/publicDataService';

/**
 * Data Provenance System for CivicPulse
 * 
 * Provides centralized, honest provenance tracking across all application data layers:
 * - Public Data Snapshots (data.gov.in / ministerial open data)
 * - CivicPulse Prototype Baselines (district infrastructure baselines)
 * - Citizen Signals (actual user submissions)
 * - CivicPulse Demo Signals (curated illustrative submissions)
 * - Deterministic Calculations (5-pillar mathematical engine)
 */

export function getProvenanceForCitizenRequest(request: CitizenRequest): DataProvenance {
  const isActualCitizen = request.source_origin === 'CIVICPULSE_USER';
  
  if (isActualCitizen) {
    const isAiExtracted = Boolean(request.ai_analysis || request.translated_text || request.category);
    return {
      sourceType: 'CITIZEN_SUBMISSION',
      sourceName: 'Citizen Intake Portal',
      sourceYear: request.timestamp ? new Date(request.timestamp).getFullYear() : 2026,
      isSyntheticDemo: false,
      isLive: false, // Session-recorded or stored request
      displayLabel: isAiExtracted ? 'AI-Extracted Citizen Signal' : 'Citizen Signal',
      notes: 'Submitted via citizen voice/text intake interface with consent.',
    };
  }

  return {
    sourceType: 'SYNTHETIC_DEMO',
    sourceName: 'CivicPulse Illustrative Seed Dataset',
    sourceYear: 2026,
    isSyntheticDemo: true,
    isLive: false,
    displayLabel: 'CivicPulse Demo Signal',
    notes: 'Curated scenario for demonstration and offline algorithmic verification.',
  };
}

export function getProvenanceForPublicIndicator(indicator: {
  source?: string;
  year?: number;
  isSynthetic?: boolean;
  datasetName?: string;
  sourceType?: 'DIRECT_PUBLIC_DATA' | 'PUBLIC_BENCHMARK' | 'CURATED_PROTOTYPE' | 'MODELED_INTERPOLATED' | 'DETERMINISTIC_CALCULATION' | 'CITIZEN_SIGNAL' | 'AI_EXTRACTED';
}): DataProvenance {
  const isSynthetic = Boolean(indicator.isSynthetic);
  let displayLabel: ProvenanceDisplayLabel = 'Public Data Snapshot';
  if (isSynthetic) {
    displayLabel = 'Baseline Interpolated';
  } else if (indicator.sourceType === 'DIRECT_PUBLIC_DATA') {
    displayLabel = 'Direct Public Data';
  } else if (indicator.sourceType === 'PUBLIC_BENCHMARK') {
    displayLabel = 'Public Benchmark';
  } else if (indicator.sourceType === 'CURATED_PROTOTYPE') {
    displayLabel = 'CivicPulse Prototype Baseline';
  }

  const isPrototypeOrSynthetic = isSynthetic || indicator.sourceType === 'CURATED_PROTOTYPE';

  return {
    sourceType: isPrototypeOrSynthetic ? 'CIVICPULSE_BASELINE' : 'PUBLIC_OPEN_DATA',
    sourceName: indicator.source || 'Open Government Data (data.gov.in)',
    sourceYear: indicator.year || 2024,
    isSyntheticDemo: isPrototypeOrSynthetic,
    isLive: false,
    displayLabel,
    datasetOrScheme: indicator.datasetName,
    notes: indicator.sourceType === 'CURATED_PROTOTYPE'
      ? 'Curated prototype baseline for contextual demonstration and algorithm evaluation.'
      : isSynthetic
      ? 'Interpolated baseline for district benchmark context.'
      : indicator.sourceType === 'PUBLIC_BENCHMARK'
      ? 'Public sector reference benchmark retrieved from published open data portals and ministry reports.'
      : 'Direct open government dataset record traceable to published official annexure tables.',
  };
}

export function getProvenanceForDistrictBaseline(
  districtName: string,
  category?: string
): DataProvenance {
  return {
    sourceType: 'CIVICPULSE_BASELINE',
    sourceName: 'CivicPulse Municipal Access Baseline',
    sourceYear: 2024,
    isSyntheticDemo: false,
    isLive: false,
    displayLabel: 'CivicPulse Prototype Baseline',
    notes: `Standard municipal infrastructure baseline for ${districtName}${category ? ` (${category})` : ''}.`,
  };
}

export function getProvenanceForScoring(): DataProvenance {
  return {
    sourceType: 'DETERMINISTIC_ENGINE',
    sourceName: '5-Pillar Priority Formula',
    sourceYear: 2026,
    isSyntheticDemo: false,
    isLive: false,
    displayLabel: 'Deterministic Calculation',
    notes: 'Computed deterministically from citizen demand volume, infrastructure gap, demographic impact, urgency, and capex alignment.',
  };
}

export type DistrictDataDepth = 'Deep Local Baseline' | 'Open Government Data' | 'Baseline Interpolated';

export interface DistrictDataDepthInfo {
  tier: DistrictDataDepth;
  badgeLabel: string;
  badgeClass: string;
  description: string;
}

const COMPLETE_BASELINE_DISTRICTS = [
  'guntur',
  'vijayawada',
  'visakhapatnam',
  'kurnool',
  'nagpur',
  'nanded',
  'solapur',
  'chittoor'
];

const LEVEL_2_OGD_DISTRICTS = [
  'warangal',
  'hyderabad',
  'nashik',
  'patna',
  'gaya',
  'jaipur',
  'bengaluru',
  'chennai',
  'kolkata',
  'lucknow'
];

export function getDistrictDataDepth(districtIdOrName: string): DistrictDataDepthInfo {
  const normalized = districtIdOrName.toLowerCase().replace(/[^a-z]/g, '');
  const isL1 = COMPLETE_BASELINE_DISTRICTS.some(d => normalized.includes(d));

  if (isL1) {
    return {
      tier: 'Deep Local Baseline',
      badgeLabel: 'Level 1 · Deep Local Baseline',
      badgeClass: 'bg-emerald-50 text-emerald-800 border border-emerald-300',
      description: 'Comprehensive cross-domain open data benchmarks & physical infrastructure baselines verified.'
    };
  }

  const isL2 = LEVEL_2_OGD_DISTRICTS.some(d => normalized.includes(d));

  if (isL2) {
    return {
      tier: 'Open Government Data',
      badgeLabel: 'Level 2 · Open Government Data',
      badgeClass: 'bg-sky-50 text-sky-800 border border-sky-300',
      description: 'Verified open government data indicators (data.gov.in / ministerial snapshots).'
    };
  }

  return {
    tier: 'Baseline Interpolated',
    badgeLabel: 'Level 3 · Baseline Interpolated',
    badgeClass: 'bg-stone-100 text-stone-700 border border-stone-300',
    description: 'Standard interpolated demographic and sectoral baseline benchmark.'
  };
}

export function formatSignalProvenanceSummary(
  totalCount: number,
  citizenCount: number,
  demoCount: number
): string {
  if (citizenCount === 0) {
    return `${totalCount} signals analysed (${demoCount} illustrative baseline signals)`;
  }
  return `${totalCount} signals analysed (${citizenCount} citizen signal${citizenCount === 1 ? '' : 's'}, ${demoCount} illustrative baseline signals)`;
}

export function getProvenanceBadgeStyles(label: ProvenanceDisplayLabel): {
  bg: string;
  text: string;
  border: string;
} {
  switch (label) {
    case 'Citizen Signal':
    case 'AI-Extracted Citizen Signal':
      return { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' };
    case 'Direct Public Data':
    case 'Public Data Snapshot':
      return { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-300' };
    case 'Public Benchmark':
      return { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-300' };
    case 'CivicPulse Prototype Baseline':
    case 'Baseline Interpolated':
      return { bg: 'bg-stone-100', text: 'text-stone-800', border: 'border-stone-300' };
    case 'CivicPulse Demo Signal':
    case 'Illustrative Demo Data':
      return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' };
    case 'Deterministic Calculation':
      return { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-300' };
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-300' };
  }
}
