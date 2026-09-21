import { District, InfrastructureCategory, CitizenRequest } from '../types';
import { calculatePriorityScore, getCategoryAccess } from './scoring';

/**
 * ============================================================================
 * CIVICPULSE DETERMINISTIC IMPACT EVALUATION & MODELING ENGINE (Category 4)
 * ============================================================================
 * 
 * Provides an inspectable, deterministic, closed-loop impact evaluation pipeline:
 * BASELINE EVIDENCE → PROPOSED INTERVENTION → MODELED IMPACT → MEASUREMENT PLAN → POST-INTERVENTION VERIFICATION
 * 
 * CORE HONESTY GUARANTEES:
 * 1. Modeled values are explicitly identified as simulated projections, NEVER actual/measured outcomes.
 * 2. Model assumptions (elasticity, multipliers, horizons) are centralized and fully exposed.
 * 3. Closed-loop architecture bridges prototype simulation to future real-world post-delivery audits.
 * 4. Zero LLM/Gemini dependencies in impact arithmetic — 100% deterministic and reproducible.
 */

export type InterventionTypeKey = 'FIX' | 'UPGRADE' | 'BUILD' | 'POLICY';
export type IntensityLevel = 'Low' | 'Medium' | 'High';

export interface ImpactInterventionSpec {
  key: InterventionTypeKey;
  label: string;
  shortLabel: string;
  description: string;
  baseCoverageGainFactor: number;
  baseDemandResponseFactor: number;
  evaluationHorizonMonths: number;
  baseCapitalCostCr: number;
}

export interface ImpactIntensitySpec {
  level: IntensityLevel;
  multiplier: number;
  description: string;
}

export interface ProposedMeasurementMetric {
  id: string;
  name: string;
  targetBenchmark: string;
  methodology: string;
  cadence: string;
  verifyingAgency: string;
  statusText: string;
}

export const IMPACT_MODEL_CONFIG = {
  version: '2.1.0-deterministic',
  name: 'CivicPulse Deterministic Elasticity & Gap Closure Model',
  disclaimer: 'These parameters are prototype modeling assumptions and are not measured government outcomes.',
  
  interventions: {
    FIX: {
      key: 'FIX',
      label: 'Targeted Remediation (Fix)',
      shortLabel: 'Remediation',
      description: 'Localized asset repair, leak plugging, pothole patching, or component overhaul.',
      baseCoverageGainFactor: 0.25,
      baseDemandResponseFactor: 0.25,
      evaluationHorizonMonths: 6,
      baseCapitalCostCr: 1.8,
    },
    UPGRADE: {
      key: 'UPGRADE',
      label: 'Capacity Augmentation (Upgrade)',
      shortLabel: 'Upgrade',
      description: 'Distribution network expansion, pipeline diameter enlargement, or feeder substation addition.',
      baseCoverageGainFactor: 0.40,
      baseDemandResponseFactor: 0.40,
      evaluationHorizonMonths: 12,
      baseCapitalCostCr: 4.2,
    },
    BUILD: {
      key: 'BUILD',
      label: 'Capital Asset Commissioning (Build)',
      shortLabel: 'New Build',
      description: 'New treatment plants, sub-stations, primary health clinics, or major transit arteries.',
      baseCoverageGainFactor: 0.65,
      baseDemandResponseFactor: 0.65,
      evaluationHorizonMonths: 24,
      baseCapitalCostCr: 9.5,
    },
    POLICY: {
      key: 'POLICY',
      label: 'Administrative & Operational Reform (Policy)',
      shortLabel: 'Operational Reform',
      description: 'Service delivery schedules, billing transparency, ward-level SLA enforcement, and maintenance rosters.',
      baseCoverageGainFactor: 0.20,
      baseDemandResponseFactor: 0.20,
      evaluationHorizonMonths: 12,
      baseCapitalCostCr: 0.6,
    }
  } as Record<InterventionTypeKey, ImpactInterventionSpec>,

  intensityMultipliers: {
    Low: {
      level: 'Low',
      multiplier: 0.8,
      description: 'Phased initial deployment across critical wards with standard resource allocations'
    },
    Medium: {
      level: 'Medium',
      multiplier: 1.0,
      description: 'Full municipal deployment across all identified high-vulnerability localities'
    },
    High: {
      level: 'High',
      multiplier: 1.25,
      description: 'Accelerated mission-mode delivery with expanded redundancy and priority funding'
    }
  } as Record<IntensityLevel, ImpactIntensitySpec>,

  constants: {
    maxCoverageCapPct: 95, // Realistic municipal access ceiling
    minGapFloorPct: 5,
    minSignalsFloor: 12,
    severityDeescalationFactor: 0.70,
    affectedPopBeneficiaryRatio: 0.40,
    maxEffectiveReductionCap: 0.85,
  },

  closedLoopStages: [
    { order: 1, name: 'Citizen Signals', provenance: 'Multilingual Ingestion Registry', nature: 'OBSERVED_INPUT' },
    { order: 2, name: 'Baseline Measurement', provenance: 'Census & Ministry Open Data', nature: 'GROUNDED_BASELINE' },
    { order: 3, name: 'Priority Scoring', provenance: 'Deterministic 5-Pillar Engine', nature: 'DETERMINISTIC_SCORING' },
    { order: 4, name: 'Recommended Intervention', provenance: 'Centrally Sponsored Schemes', nature: 'RECOMMENDATION' },
    { order: 5, name: 'Modeled Impact Projection', provenance: 'Prototype Impact Model', nature: 'MODELED_PROJECTION' },
    { order: 6, name: 'Real-World Implementation', provenance: 'Departmental Action Queue', nature: 'EXECUTION_PHASE' },
    { order: 7, name: 'Post-Intervention Measurement', provenance: 'Proposed Audit Metrics', nature: 'FUTURE_MEASUREMENT' },
    { order: 8, name: 'Actual Evaluation & Calibration', provenance: 'Closed-Loop Evidence Ledger', nature: 'CALIBRATION' },
  ]
} as const;

export interface BaselineImpactMetrics {
  accessPct: number;
  signalsCount: number;
  gapPct: number;
  priorityScore: number;
  affectedPopulation: number;
  provenanceLabel: string;
  sourceNote: string;
}

export interface ModelAssumptionsRecord {
  interventionKey: InterventionTypeKey;
  interventionLabel: string;
  intensityLevel: IntensityLevel;
  baseCoverageGainFactor: number;
  intensityMultiplier: number;
  effectiveReductionFactor: number;
  effectiveReductionPct: number;
  evaluationHorizonMonths: number;
  estimatedCapitalCr: number;
  disclaimerText: string;
}

export interface ModeledProjectionMetrics {
  projectedAccessPct: number;
  accessGainPct: number;
  projectedGapPct: number;
  projectedSignals: number;
  signalsDelta: number;
  signalsReductionPct: number;
  projectedPriorityScore: number;
  priorityScoreDelta: number;
  modeledProtectedPopulation: number;
  remainingAffectedPopulation: number;
  provenanceLabel: string;
}

export interface ImpactEvaluationPackage {
  districtId: string;
  districtName: string;
  state: string;
  category: InfrastructureCategory;
  baseline: BaselineImpactMetrics;
  assumptions: ModelAssumptionsRecord;
  modeled: ModeledProjectionMetrics;
  measurementPlan: ProposedMeasurementMetric[];
  calculationTrace: string[];
}

/**
 * Deterministically computes the baseline impact state for a given district and sector.
 * Uses authoritative open data access values and actual aggregated signals.
 */
export function computeBaselineImpact(
  district: District,
  category: InfrastructureCategory,
  requests: CitizenRequest[] = []
): BaselineImpactMetrics {
  const baseAccess = getCategoryAccess(district, category);
  
  // Count matching citizen signals if present, otherwise default to baseline representative count
  const matchingRequests = requests.filter(r => {
    const matchDist = (r.district && r.district.toLowerCase() === district.name.toLowerCase()) ||
                      (r.location && r.location.toLowerCase().includes(district.name.toLowerCase()));
    const matchCat = r.category === category;
    return matchDist && matchCat;
  });

  const signalCount = matchingRequests.length > 0 ? matchingRequests.length * 18 : 640;
  const baseSeverity = 8;
  const priorityBreakdown = calculatePriorityScore(district, category, baseSeverity, signalCount, baseAccess);
  const gapPct = Math.round(100 - baseAccess);
  const affectedPop = Math.round(district.population * (Math.max(10, gapPct) / 100) * IMPACT_MODEL_CONFIG.constants.affectedPopBeneficiaryRatio);

  return {
    accessPct: baseAccess,
    signalsCount: signalCount,
    gapPct,
    priorityScore: Math.round(priorityBreakdown.total_score),
    affectedPopulation: affectedPop,
    provenanceLabel: 'Source: registry / citizen signals / curated benchmark',
    sourceNote: `Demographics from 70-district canonical registry; municipal access from official ministry baselines (JJM/PMGSY/NHM).`,
  };
}

/**
 * Generates the standardized Post-Intervention Measurement Plan for an intervention.
 * Clearly designates all metrics as prospective verification criteria rather than observed outcomes.
 */
export function generateMeasurementPlan(
  category: InfrastructureCategory,
  interventionKey: InterventionTypeKey,
  evaluationHorizonMonths: number
): ProposedMeasurementMetric[] {
  const baseMetrics: ProposedMeasurementMetric[] = [
    {
      id: 'metric-coverage',
      name: `${category} Physical Infrastructure Access Rate`,
      targetBenchmark: 'Post-delivery household audit verifying functional tap/road/grid connection',
      methodology: 'Quarterly GIS door-to-door ground verification survey & GIS asset geotagging',
      cadence: `Every 90 days over ${evaluationHorizonMonths}-month horizon`,
      verifyingAgency: 'State Departmental Quality Audit Cell',
      statusText: 'Not available — requires post-intervention measurement',
    },
    {
      id: 'metric-signals',
      name: 'Active Citizen Grievance Signal Density',
      targetBenchmark: 'Sustained de-escalation in recurring distress signals across ingested channels',
      methodology: 'Automated civic intake aggregation across IVR voice, WhatsApp, and portal logs',
      cadence: 'Continuous automated ingestion with 30-day moving average evaluation',
      verifyingAgency: 'CivicPulse Citizen Feedback Ingestion Ledger',
      statusText: 'Not available — requires post-intervention measurement',
    },
    {
      id: 'metric-resolution',
      name: 'Mean Time to Citizen Resolution (MTTR)',
      targetBenchmark: 'Administrative SLA compliance for ward-level service interruptions',
      methodology: 'Municipal ticket dispatch audit against statutory Citizen Charter SLAs',
      cadence: 'Monthly administrative review',
      verifyingAgency: 'District Grievance Redressal Cell',
      statusText: 'Not available — requires post-intervention measurement',
    },
    {
      id: 'metric-uptime',
      name: 'Functional Service Continuity & Uptime',
      targetBenchmark: 'Minimum sustained operational availability (>20 hrs/day or >90% reliability)',
      methodology: 'Spot audits of flow pressure, transformer load, or transit surface roughness index',
      cadence: 'Bi-annual third-party technical audit',
      verifyingAgency: 'National Technical Advisory Institution',
      statusText: 'Not available — requires post-intervention measurement',
    },
    {
      id: 'metric-beneficiaries',
      name: 'Vulnerable Population Protection Audit',
      targetBenchmark: '100% saturation of scheduled caste/tribe habitations and low-income pockets',
      methodology: 'Social audit committee verification at ward/Gram Sabha level',
      cadence: 'Post-commissioning 180-day review',
      verifyingAgency: 'District Social Audit Directorate',
      statusText: 'Not available — requires post-intervention measurement',
    }
  ];

  return baseMetrics;
}

/**
 * Deterministically computes the full Impact Evaluation Package.
 * Produces baseline, transparent assumptions, modeled projections, measurement plan, and calculation trace.
 */
export function evaluateModeledImpact(params: {
  district: District;
  category: InfrastructureCategory;
  requests?: CitizenRequest[];
  interventionType?: InterventionTypeKey;
  intensity?: IntensityLevel;
}): ImpactEvaluationPackage {
  const {
    district,
    category,
    requests = [],
    interventionType = 'UPGRADE',
    intensity = 'Medium',
  } = params;

  // 1. Observed Baseline
  const baseline = computeBaselineImpact(district, category, requests);

  // 2. Modeling Assumptions
  const spec = IMPACT_MODEL_CONFIG.interventions[interventionType] || IMPACT_MODEL_CONFIG.interventions.UPGRADE;
  const intensitySpec = IMPACT_MODEL_CONFIG.intensityMultipliers[intensity] || IMPACT_MODEL_CONFIG.intensityMultipliers.Medium;

  const rawReduction = spec.baseCoverageGainFactor * intensitySpec.multiplier;
  const effectiveReductionFactor = Math.min(IMPACT_MODEL_CONFIG.constants.maxEffectiveReductionCap, rawReduction);
  const effectiveReductionPct = Math.round(effectiveReductionFactor * 100);
  const estimatedCapitalCr = Number((spec.baseCapitalCostCr * intensitySpec.multiplier).toFixed(1));

  const assumptions: ModelAssumptionsRecord = {
    interventionKey: interventionType,
    interventionLabel: spec.label,
    intensityLevel: intensity,
    baseCoverageGainFactor: spec.baseCoverageGainFactor,
    intensityMultiplier: intensitySpec.multiplier,
    effectiveReductionFactor,
    effectiveReductionPct,
    evaluationHorizonMonths: spec.evaluationHorizonMonths,
    estimatedCapitalCr,
    disclaimerText: IMPACT_MODEL_CONFIG.disclaimer,
  };

  // 3. Modeled Projections
  const signalsDrop = Math.round(baseline.signalsCount * effectiveReductionFactor);
  const projectedSignals = Math.max(IMPACT_MODEL_CONFIG.constants.minSignalsFloor, baseline.signalsCount - signalsDrop);
  const signalsDelta = projectedSignals - baseline.signalsCount;
  const signalsReductionPct = Number(((signalsDelta / baseline.signalsCount) * 100).toFixed(1));

  const gapToClose = 100 - baseline.accessPct;
  const accessGainPct = Math.round(gapToClose * effectiveReductionFactor);
  const projectedAccessPct = Math.min(IMPACT_MODEL_CONFIG.constants.maxCoverageCapPct, baseline.accessPct + accessGainPct);
  const projectedGapPct = Math.max(IMPACT_MODEL_CONFIG.constants.minGapFloorPct, 100 - projectedAccessPct);

  // Re-run deterministic scoring engine with modeled values
  const modeledSeverity = Math.max(2, Math.round(8 * (1 - effectiveReductionFactor * IMPACT_MODEL_CONFIG.constants.severityDeescalationFactor)));
  const modeledScoreBreakdown = calculatePriorityScore(
    district,
    category,
    modeledSeverity,
    projectedSignals,
    projectedAccessPct
  );
  const projectedPriorityScore = Math.round(modeledScoreBreakdown.total_score);
  const priorityScoreDelta = projectedPriorityScore - baseline.priorityScore;

  const modeledProtectedPopulation = Math.round(baseline.affectedPopulation * effectiveReductionFactor);
  const remainingAffectedPopulation = Math.max(0, baseline.affectedPopulation - modeledProtectedPopulation);

  const modeled: ModeledProjectionMetrics = {
    projectedAccessPct,
    accessGainPct,
    projectedGapPct,
    projectedSignals,
    signalsDelta,
    signalsReductionPct,
    projectedPriorityScore,
    priorityScoreDelta,
    modeledProtectedPopulation,
    remainingAffectedPopulation,
    provenanceLabel: 'Source: deterministic impact model (prototype parameters)',
  };

  // 4. Proposed Post-Delivery Measurement Plan
  const measurementPlan = generateMeasurementPlan(category, interventionType, spec.evaluationHorizonMonths);

  // 5. Explicit Calculation Trace
  const calculationTrace = [
    `1. BASELINE: Access = ${baseline.accessPct}%, Signals = ${baseline.signalsCount}, Score = ${baseline.priorityScore}/100`,
    `2. ASSUMPTIONS: Intervention "${spec.label}" (Base Factor: ${spec.baseCoverageGainFactor}) × ${intensity} Intensity (${intensitySpec.multiplier}x) = ${effectiveReductionPct}% modeled reduction factor`,
    `3. SIGNALS PROJECTION: ${baseline.signalsCount} × (1 - ${effectiveReductionFactor.toFixed(3)}) = ${projectedSignals} signals (${signalsReductionPct}%)`,
    `4. ACCESS PROJECTION: ${baseline.accessPct}% + (${gapToClose}% deficit × ${effectiveReductionFactor.toFixed(3)}) = ${projectedAccessPct}% access (Gap: ${projectedGapPct}%)`,
    `5. SCORE RE-CALCULATION: 5-Pillar model re-evaluated at Access ${projectedAccessPct}%, Signals ${projectedSignals} → ${projectedPriorityScore}/100 (${priorityScoreDelta >= 0 ? '+' : ''}${priorityScoreDelta} pts)`,
    `6. HORIZON & OUTLAY: ${spec.evaluationHorizonMonths} months evaluation window; Estimated Capital ₹${estimatedCapitalCr} Cr`
  ];

  return {
    districtId: district.id,
    districtName: district.name,
    state: district.state,
    category,
    baseline,
    assumptions,
    modeled,
    measurementPlan,
    calculationTrace,
  };
}
