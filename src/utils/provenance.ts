import { CitizenRequest, DataProvenance, ProvenanceDisplayLabel, District } from '../types';

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
}): DataProvenance {
  return {
    sourceType: 'PUBLIC_OPEN_DATA',
    sourceName: indicator.source || 'Open Government Data (data.gov.in)',
    sourceYear: indicator.year || 2024,
    isSyntheticDemo: Boolean(indicator.isSynthetic),
    isLive: false,
    displayLabel: 'Public Data Snapshot',
    datasetOrScheme: indicator.datasetName,
    notes: 'Static benchmark snapshot retrieved from open government datasets.',
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

export type DistrictDataDepth = 'Complete Baseline' | 'Standard Baseline' | 'Basic Demographics Only';

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

export function getDistrictDataDepth(districtIdOrName: string): DistrictDataDepthInfo {
  const normalized = districtIdOrName.toLowerCase().replace(/[^a-z]/g, '');
  const isComplete = COMPLETE_BASELINE_DISTRICTS.some(d => normalized.includes(d));

  if (isComplete) {
    return {
      tier: 'Complete Baseline',
      badgeLabel: 'Complete Baseline (Primary Audit District)',
      badgeClass: 'bg-emerald-50 text-emerald-800 border border-emerald-300',
      description: 'Comprehensive cross-domain open data benchmarks & physical infrastructure telemetry verified.'
    };
  }

  return {
    tier: 'Standard Baseline',
    badgeLabel: 'Standard Baseline (National Registry)',
    badgeClass: 'bg-stone-100 text-stone-700 border border-stone-300',
    description: 'Standard district demographic indicators and sector access baseline.'
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
    case 'Public Data Snapshot':
      return { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-300' };
    case 'CivicPulse Prototype Baseline':
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
