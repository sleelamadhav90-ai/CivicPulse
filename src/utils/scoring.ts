import {
  District,
  InfrastructureCategory,
  ScoreBreakdown,
  RecommendedProject,
  PriorityFactorDetail,
  CitizenRequest,
  InterventionType,
  DemographicProfile,
  InfrastructureAudit,
  EvidenceBundle,
  ScoreTrace,
  SensitivityAnalysis,
  PillarInfluence
} from '../types';
import { INFRASTRUCTURE_ASSETS_REGISTRY } from '../data/infrastructureAssets';
import { getInvestmentAuditByCategory } from '../data/investmentData';
import { getPublicDataForDistrict, getPublicContextSummary } from '../data/publicDataService';
import { buildEvidenceBundle } from './evidenceBundleService';
import { DISTRICTS_REGISTRY } from '../data/districts';
import { matchesDistrict } from './districtMatcher';

/**
 * Centralized Model Configuration & Normalization Parameters
 *
 * NOTE: CivicPulse uses a deterministic prototype decision-support model.
 * These parameters are configurable initial heuristics designed for transparent prioritization.
 * Production deployment would require empirical stakeholder calibration and domain backtesting.
 */
export const SCORING_CONFIG = {
  /** Pillar weights summing to exactly 1.00 (100%) */
  weights: {
    citizenDemand: 0.30,      // 30%: Logarithmic volume scaling of citizen reports
    infrastructureGap: 0.25,  // 25%: Direct measure of physical deficit (100 - access%)
    populationImpact: 0.20,   // 20%: Combined target beneficiary population & poverty index
    urgency: 0.15,            // 15%: Extracted hazard severity and urgency rating
    governmentPriority: 0.10, // 10%: Planned capital expenditure & policy alignment signal
  },

  /** Demand pillar normalization heuristics */
  demand: {
    /** Logarithmic multiplier mapping raw report count to 0-100 scale. Reduces surge dominance. */
    logCoefficient: 22,
    /** Minimum raw count bound to ensure non-zero valid log evaluation */
    minSignalCount: 1,
    /** Maximum normalized demand pillar score */
    maxDemandScore: 100,
  },

  /** Prototype baseline infrastructure assumptions when sector indicators are missing or derived */
  infrastructure: {
    /** Baseline electricity grid access (%) prototype heuristic */
    defaultElectricityAccess: 58,
    /** Default general facility access (%) prototype heuristic */
    defaultOtherAccess: 60,
    /** Default fallback access percentage */
    defaultFallbackAccess: 50,
    /** Derivative scaling factor for sanitation/drainage computed from water and road averages */
    drainageSanitationDerivativeFactor: 0.75,
  },

  /** Urgency & Hazard severity bounds */
  urgency: {
    minSeverity: 1,
    maxSeverity: 10,
    normalizedMultiplier: 10, // Maps 1-10 severity scale to 0-100
  },

  /** Population Impact & Social Vulnerability parameters */
  populationImpact: {
    /** Reference benchmark population denominator (2.5M population district baseline) */
    populationScaleDenominator: 2500000,
    /** Max contribution points from population volume */
    maxPopulationPoints: 50,
    /** Max contribution points from poverty index (0.00-1.00) */
    maxPovertyPoints: 50,
  },

  /** Government Priority signal parameters */
  governmentPriority: {
    /** Score signal when active planned capital expenditure exists in district (planned_investment > 0) */
    activeCapexScore: 95,
    /** Score signal when district has an unbudgeted capex gap (planned_investment == 0) */
    unbudgetedCapexScore: 45,
  },
};

export const SCORING_WEIGHTS = {
  citizenDemand: SCORING_CONFIG.weights.citizenDemand,
  infrastructureGap: SCORING_CONFIG.weights.infrastructureGap,
  populationImpact: SCORING_CONFIG.weights.populationImpact,
  urgency: SCORING_CONFIG.weights.urgency,
  governmentPriority: SCORING_CONFIG.weights.governmentPriority,
  // legacy aliases for backward compatibility
  demand: SCORING_CONFIG.weights.citizenDemand,
  gap: SCORING_CONFIG.weights.infrastructureGap,
  severity: SCORING_CONFIG.weights.urgency,
  vulnerability: SCORING_CONFIG.weights.populationImpact,
  alignment: SCORING_CONFIG.weights.governmentPriority,
};

export function getCategoryAccess(district: District, category: InfrastructureCategory): number {
  switch (category) {
    case 'Water':
      return district.water_access;
    case 'Healthcare':
    case 'Health':
      return district.health_access;
    case 'Roads':
      return district.road_quality;
    case 'Education':
      return district.education_access;
    case 'Electricity':
      return SCORING_CONFIG.infrastructure.defaultElectricityAccess;
    case 'Drainage':
    case 'Sanitation':
      return Math.round(
        ((district.water_access + district.road_quality) / 2) *
          SCORING_CONFIG.infrastructure.drainageSanitationDerivativeFactor
      );
    case 'Other':
      return SCORING_CONFIG.infrastructure.defaultOtherAccess;
    default:
      return district.water_access ?? SCORING_CONFIG.infrastructure.defaultFallbackAccess;
  }
}

/**
 * Generates an explicit, audit-ready ScoreTrace object detailing:
 * INPUT → NORMALIZATION → WEIGHT → CONTRIBUTION
 */
export function calculateScoreTrace(
  district: District,
  category: InfrastructureCategory,
  severity: number,
  demandCount: number,
  overrideAccess?: number
): ScoreTrace {
  const currentAccess = overrideAccess !== undefined ? overrideAccess : getCategoryAccess(district, category);
  
  // 1. Citizen Demand
  const safeDemandCount = Math.max(SCORING_CONFIG.demand.minSignalCount, Math.floor(demandCount || 0));
  const demandNormalized = Math.min(
    SCORING_CONFIG.demand.maxDemandScore,
    SCORING_CONFIG.demand.logCoefficient * Math.log1p(safeDemandCount)
  );
  const demandWeight = SCORING_CONFIG.weights.citizenDemand;
  const demandContribution = Number((demandNormalized * demandWeight).toFixed(2));

  // 2. Infrastructure Deficit / Gap
  const gapRaw = Math.max(0, 100 - currentAccess);
  const gapNormalized = gapRaw;
  const gapWeight = SCORING_CONFIG.weights.infrastructureGap;
  const gapContribution = Number((gapNormalized * gapWeight).toFixed(2));

  // 3. Population Impact & Social Vulnerability
  const popRaw = district.population || 0;
  const povertyRaw = district.poverty_index || 0;
  const popPart = Math.min(
    (popRaw / SCORING_CONFIG.populationImpact.populationScaleDenominator) *
      SCORING_CONFIG.populationImpact.maxPopulationPoints,
    SCORING_CONFIG.populationImpact.maxPopulationPoints
  );
  const povertyPart = povertyRaw * SCORING_CONFIG.populationImpact.maxPovertyPoints;
  const populationNormalized = Math.min(100, popPart + povertyPart);
  const populationWeight = SCORING_CONFIG.weights.populationImpact;
  const populationContribution = Number((populationNormalized * populationWeight).toFixed(2));

  // 4. Urgency & Hazard Severity
  const clampedSeverity = Math.min(
    Math.max(severity || SCORING_CONFIG.urgency.minSeverity, SCORING_CONFIG.urgency.minSeverity),
    SCORING_CONFIG.urgency.maxSeverity
  );
  const urgencyNormalized = clampedSeverity * SCORING_CONFIG.urgency.normalizedMultiplier;
  const urgencyWeight = SCORING_CONFIG.weights.urgency;
  const urgencyContribution = Number((urgencyNormalized * urgencyWeight).toFixed(2));

  // 5. Government Priority & Planned Investment Signal
  const plannedInvestment = district.planned_investment || 0;
  const governmentPriorityNormalized = plannedInvestment > 0
    ? SCORING_CONFIG.governmentPriority.activeCapexScore
    : SCORING_CONFIG.governmentPriority.unbudgetedCapexScore;
  const governmentPriorityWeight = SCORING_CONFIG.weights.governmentPriority;
  const governmentPriorityContribution = Number((governmentPriorityNormalized * governmentPriorityWeight).toFixed(2));

  // Final Composite Score (computed with exact full precision)
  const exactSum =
    demandNormalized * demandWeight +
    gapNormalized * gapWeight +
    populationNormalized * populationWeight +
    urgencyNormalized * urgencyWeight +
    governmentPriorityNormalized * governmentPriorityWeight;
  const finalScore = Math.min(100, Math.max(0, Number(exactSum.toFixed(1))));

  return {
    demand: {
      raw: safeDemandCount,
      normalized: Number(demandNormalized.toFixed(1)),
      weight: demandWeight,
      contribution: demandContribution,
    },
    gap: {
      raw: `${currentAccess}% Access (${gapRaw}% Gap)`,
      normalized: Number(gapNormalized.toFixed(1)),
      weight: gapWeight,
      contribution: gapContribution,
    },
    populationImpact: {
      raw: { population: popRaw, povertyIndex: povertyRaw },
      normalized: Number(populationNormalized.toFixed(1)),
      weight: populationWeight,
      contribution: populationContribution,
    },
    urgency: {
      raw: clampedSeverity,
      normalized: Number(urgencyNormalized.toFixed(1)),
      weight: urgencyWeight,
      contribution: urgencyContribution,
    },
    governmentPriority: {
      raw: { plannedInvestment },
      normalized: Number(governmentPriorityNormalized.toFixed(1)),
      weight: governmentPriorityWeight,
      contribution: governmentPriorityContribution,
    },
    finalScore,
  };
}

/**
 * Calculates a deterministic sensitivity & relative influence breakdown of a ScoreTrace
 */
export function calculateScoreSensitivity(trace: ScoreTrace): SensitivityAnalysis {
  const total = trace.finalScore || 1;
  const influences: PillarInfluence[] = [
    {
      pillarKey: 'citizenDemand',
      label: 'Citizen Demand Volume',
      weightPct: SCORING_CONFIG.weights.citizenDemand * 100,
      normalizedScore: trace.demand.normalized,
      contribution: trace.demand.contribution,
      relativeInfluencePct: Number(((trace.demand.contribution / total) * 100).toFixed(1)),
    },
    {
      pillarKey: 'infrastructureGap',
      label: 'Infrastructure Access Deficit',
      weightPct: SCORING_CONFIG.weights.infrastructureGap * 100,
      normalizedScore: trace.gap.normalized,
      contribution: trace.gap.contribution,
      relativeInfluencePct: Number(((trace.gap.contribution / total) * 100).toFixed(1)),
    },
    {
      pillarKey: 'populationImpact',
      label: 'Population & Vulnerability Impact',
      weightPct: SCORING_CONFIG.weights.populationImpact * 100,
      normalizedScore: trace.populationImpact.normalized,
      contribution: trace.populationImpact.contribution,
      relativeInfluencePct: Number(((trace.populationImpact.contribution / total) * 100).toFixed(1)),
    },
    {
      pillarKey: 'urgency',
      label: 'Hazard Severity & Urgency',
      weightPct: SCORING_CONFIG.weights.urgency * 100,
      normalizedScore: trace.urgency.normalized,
      contribution: trace.urgency.contribution,
      relativeInfluencePct: Number(((trace.urgency.contribution / total) * 100).toFixed(1)),
    },
    {
      pillarKey: 'governmentPriority',
      label: 'Planned Capex & Policy Signal',
      weightPct: SCORING_CONFIG.weights.governmentPriority * 100,
      normalizedScore: trace.governmentPriority.normalized,
      contribution: trace.governmentPriority.contribution,
      relativeInfluencePct: Number(((trace.governmentPriority.contribution / total) * 100).toFixed(1)),
    },
  ];

  const sorted = [...influences].sort((a, b) => b.contribution - a.contribution);
  const top = sorted[0];

  return {
    dominantPillar: top.label,
    dominantContribution: top.contribution,
    dominantPercentage: top.relativeInfluencePct,
    pillarInfluences: influences,
  };
}

/**
 * Calculates deterministic, mathematical Priority Score (0-100)
 * Priority = Citizen Demand + Infrastructure Gap + Population Impact + Urgency + Government Priority
 */
export function calculatePriorityScore(
  district: District,
  category: InfrastructureCategory,
  severity: number, // 1 to 10
  demandCount: number,
  overrideAccess?: number
): ScoreBreakdown {
  const currentAccess = overrideAccess !== undefined ? overrideAccess : getCategoryAccess(district, category);
  const trace = calculateScoreTrace(district, category, severity, demandCount, overrideAccess);
  const sensitivity = calculateScoreSensitivity(trace);
  const publicContext = getPublicContextSummary(district.name, category);

  return {
    demand_score: trace.demand.normalized,
    gap_score: trace.gap.normalized,
    sev_score: trace.urgency.normalized,
    vuln_score: trace.populationImpact.normalized,
    align_score: trace.governmentPriority.normalized,
    total_score: trace.finalScore,
    demand_count: Number(trace.demand.raw),
    current_access: currentAccess,
    gap_percentage: Math.max(0, 100 - currentAccess),
    weights: {
      demand: SCORING_CONFIG.weights.citizenDemand,
      gap: SCORING_CONFIG.weights.infrastructureGap,
      severity: SCORING_CONFIG.weights.urgency,
      vulnerability: SCORING_CONFIG.weights.populationImpact,
      alignment: SCORING_CONFIG.weights.governmentPriority,
    },
    publicContextSummary: publicContext.headline,
    publicDataSource: publicContext.primarySourceBadge,
    isSyntheticDemo: publicContext.isSynthetic,
    scoreTrace: trace,
    sensitivity,
  };
}

/**
 * Computes exact contribution values for each pillar of the 5-pillar mathematical score model.
 * Traceable formula: Score = (Demand × 30%) + (Gap × 25%) + (Impact × 20%) + (Urgency × 15%) + (Gov × 10%)
 */
export function getScoreComponentContributions(breakdown: ScoreBreakdown) {
  const demandContrib = Number((breakdown.demand_score * SCORING_WEIGHTS.citizenDemand).toFixed(2));
  const gapContrib = Number((breakdown.gap_score * SCORING_WEIGHTS.infrastructureGap).toFixed(2));
  const vulnContrib = Number((breakdown.vuln_score * SCORING_WEIGHTS.populationImpact).toFixed(2));
  const urgencyContrib = Number((breakdown.sev_score * SCORING_WEIGHTS.urgency).toFixed(2));
  const govContrib = Number((breakdown.align_score * SCORING_WEIGHTS.governmentPriority).toFixed(2));
  return {
    demandContrib,
    gapContrib,
    vulnContrib,
    urgencyContrib,
    govContrib,
    totalScore: breakdown.total_score,
  };
}

/**
 * Constructs an explicit, traceably grounded Issue Evidence Explanation Object
 * containing actual signals, public data context, and provenance metadata from the codebase.
 */
export function getIssueEvidenceExplanation(
  district: District,
  category: InfrastructureCategory,
  requests: CitizenRequest[],
  breakdown?: ScoreBreakdown
) {
  const effectiveBreakdown = breakdown || calculatePriorityScore(district, category, 6, Math.max(1, requests.length));
  const contributions = getScoreComponentContributions(effectiveBreakdown);
  const bundle = buildEvidenceBundle(district, category, requests);

  const matchingSignals = requests.filter(r => matchesDistrict(r, district) && r.category === category);
  const sampleSignalExcerpts = matchingSignals.slice(0, 3).map(r => r.summary_en || r.translated_text || r.original_text || r.description || `Grievance signal regarding ${category} in ${r.locality || district.name}`);

  return {
    citizenDemand: {
      signalsCount: effectiveBreakdown.demand_count,
      demandScore: effectiveBreakdown.demand_score,
      weightPct: 30,
      contribution: contributions.demandContrib,
      sampleExcerpts: sampleSignalExcerpts,
      sourceType: matchingSignals.length > 0 ? 'Live User Submitted Signal' : 'Curated Prototype Base Signal',
    },
    infrastructureGap: {
      currentAccessPct: effectiveBreakdown.current_access,
      deficitPct: effectiveBreakdown.gap_percentage,
      gapScore: effectiveBreakdown.gap_score,
      weightPct: 25,
      contribution: contributions.gapContrib,
      publicBenchmarkSummary: effectiveBreakdown.publicContextSummary || 'Benchmark survey access index',
      primaryDataSource: effectiveBreakdown.publicDataSource || 'Census of India / Ministry Open Data',
    },
    populationImpact: {
      districtPopulation: district.population,
      povertyIndex: district.poverty_index,
      vulnScore: effectiveBreakdown.vuln_score,
      weightPct: 20,
      contribution: contributions.vulnContrib,
      estimatedBeneficiaries: Math.round(district.population * (effectiveBreakdown.gap_percentage / 100) * 0.4),
    },
    urgency: {
      severityScore: effectiveBreakdown.sev_score,
      weightPct: 15,
      contribution: contributions.urgencyContrib,
      urgencyLabel: effectiveBreakdown.sev_score >= 80 ? 'CRITICAL' : effectiveBreakdown.sev_score >= 60 ? 'HIGH' : 'MODERATE',
    },
    governmentPriority: {
      alignScore: effectiveBreakdown.align_score,
      weightPct: 10,
      contribution: contributions.govContrib,
      capexStatus: district.planned_investment > 0 ? `Active CapEx (₹${(district.planned_investment / 10000000).toFixed(1)} Cr)` : 'Unbudgeted CapEx Gap',
    },
    totalScore: effectiveBreakdown.total_score,
    scoreTrace: effectiveBreakdown.scoreTrace,
    sensitivity: effectiveBreakdown.sensitivity,
    evidenceBundle: bundle,
    dataSources: [
      { name: 'Citizen Ingestion Gateway', label: 'Citizen-Submitted Signal', year: '2026', isSynthetic: matchingSignals.length === 0 },
      { name: effectiveBreakdown.publicDataSource || 'Open Data Benchmark', label: 'Curated Open Data Benchmark', year: '2024-2025', isSynthetic: effectiveBreakdown.isSyntheticDemo ?? true },
      { name: 'CivicPulse Deterministic Engine', label: 'Deterministic Score Formula', year: '2026', isSynthetic: false },
    ],
  };
}

/**
 * Calculates deterministic Priority Score directly consuming a validated EvidenceBundle (Step 2C-5B).
 * Guarantees 100% mathematical identity with calculatePriorityScore.
 */
export function calculatePriorityScoreFromBundle(
  bundle: EvidenceBundle,
  overrideSeverity?: number,
  overrideDemandCount?: number
): ScoreBreakdown {
  const districtObj = DISTRICTS_REGISTRY.find(
    d => d.id.toLowerCase() === bundle.district.id.toLowerCase() || d.name.toLowerCase() === bundle.district.name.toLowerCase()
  ) || {
    id: bundle.district.id,
    name: bundle.district.name,
    state: bundle.district.state,
    lat: bundle.district.lat,
    lon: bundle.district.lon,
    population: bundle.district.population,
    poverty_index: bundle.vulnerability.povertyIndex.value,
    water_access: bundle.infrastructure.baselineAccess?.value || 50,
    health_access: 50,
    road_quality: 50,
    education_access: 50,
    planned_investment: bundle.investment.districtPlannedCapex?.valueInr || 0,
    existing_facilities: { phc_clinics: 0, water_plants: 0, schools: 0, paved_roads_km: 0 },
    zone: bundle.district.zone || 'Central'
  };

  const effectiveSeverity = overrideSeverity !== undefined 
    ? overrideSeverity 
    : (bundle.citizenDemand.averageSeverity || 6);

  const effectiveDemandCount = overrideDemandCount !== undefined 
    ? overrideDemandCount 
    : Math.max(1, bundle.citizenDemand.totalSignals);

  const overrideAccess = bundle.infrastructure.baselineAccess?.value;

  return calculatePriorityScore(districtObj, bundle.category, effectiveSeverity, effectiveDemandCount, overrideAccess);
}

export function getPriorityTier(score: number): {
  label: 'Critical' | 'High' | 'Moderate' | 'Stable';
  color: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
} {
  if (score >= 80) {
    return {
      label: 'Critical',
      color: '#f43f5e',
      badgeBg: 'bg-rose-50',
      badgeText: 'text-rose-700',
      borderColor: 'border-rose-300',
    };
  }
  if (score >= 65) {
    return {
      label: 'High',
      color: '#f97316',
      badgeBg: 'bg-amber-50',
      badgeText: 'text-amber-700',
      borderColor: 'border-amber-300',
    };
  }
  if (score >= 45) {
    return {
      label: 'Moderate',
      color: '#eab308',
      badgeBg: 'bg-yellow-50',
      badgeText: 'text-yellow-700',
      borderColor: 'border-yellow-300',
    };
  }
  return {
    label: 'Stable',
    color: '#10b981',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    borderColor: 'border-emerald-300',
  };
}

/**
 * Returns structured AI Recommended Projects directly connecting
 * citizen voice + data + infrastructure planning.
 */
export function getAIRecommendedProjects(districts: District[], requests: CitizenRequest[]): RecommendedProject[] {
  if (!districts || districts.length === 0) return [];

  const categories: InfrastructureCategory[] = ['Drainage', 'Water', 'Electricity', 'Roads', 'Health', 'Education'];

  const candidates: Array<{
    id: string;
    title: string;
    category: InfrastructureCategory;
    interventionType: InterventionType;
    districtId: string;
    districtName: string;
    state: string;
    priorityScore: number;
    citizenRequestsCount: number;
    affectedAreasCount: number;
    vulnerabilityLabel: 'CRITICAL' | 'HIGH' | 'MODERATE';
    confidencePct: number;
    expectedReach: number;
    urgencyLabel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    densityDesc: string;
    deficitPct: number;
    keyHazard: string;
    capexGap: string;
    aiRecommendation: string;
    budgetInr: number;
    beneficiaries: number;
    timelineMonths: number;
    keyBulletPoints: string[];
    breakdown: ScoreBreakdown;
  }> = [];

  districts.forEach((district) => {
    const distRequests = requests.filter((r) => matchesDistrict(r, district));

    categories.forEach((cat) => {
      const catRequests = distRequests.filter((r) => r.category === cat);
      const reqCount = catRequests.length;

      let deficitPct = 50;
      if (cat === 'Water') deficitPct = Math.max(10, Math.min(95, 100 - district.water_access));
      else if (cat === 'Roads') deficitPct = Math.max(10, Math.min(95, 100 - district.road_quality));
      else if (cat === 'Health' || cat === 'Healthcare') deficitPct = Math.max(10, Math.min(95, 100 - district.health_access));
      else if (cat === 'Education') deficitPct = Math.max(10, Math.min(95, 100 - district.education_access));
      else if (cat === 'Drainage') deficitPct = Math.max(10, Math.min(95, Math.round((100 - district.water_access) * 1.1)));
      else if (cat === 'Electricity') deficitPct = Math.max(10, Math.min(95, Math.round((100 - district.road_quality) * 0.9 + 15)));

      // Calculate demand signals based on real request count or baseline demographic density
      const demandSignals = reqCount > 0 ? reqCount : Math.max(1, Math.round(district.population * 0.00015 * (0.8 + district.poverty_index)));
      const avgSeverity = catRequests.length > 0
        ? Math.round(catRequests.reduce((acc, r) => acc + (r.severity || 5), 0) / catRequests.length)
        : 6;

      const breakdown = calculatePriorityScore(district, cat, avgSeverity, Math.max(1, demandSignals));
      const priorityScore = breakdown.total_score;

      let title = '';
      let keyHazard = '';
      let aiRecommendation = '';

      if (cat === 'Drainage') {
        title = `Upgrade Stormwater Drainage & Flood Outfalls`;
        keyHazard = `Frequent monsoon waterlogging, stagnant sewer overflow & low-lying flood risks`;
        aiRecommendation = `Prioritize automated underground stormwater outfalls and culvert deepening across dense municipal wards in ${district.name}.`;
      } else if (cat === 'Water') {
        title = `Piped Water Trunk Extension & RO Filtration Hubs`;
        keyHazard = `Severe drinking water salinity, dry-outs, and piped access deficit`;
        aiRecommendation = `Deploy solar-powered deep membrane filtration hubs and expand pipeline reach across panchayats in ${district.name}.`;
      } else if (cat === 'Roads') {
        title = `All-Weather Bituminous Surfacing & Transit Corridors`;
        keyHazard = `Pothole hazards, soil road collapses, transit delays & agricultural crop spoilage`;
        aiRecommendation = `Reconstruct critical transit corridors with reinforced paver shoulders and side drainage culverts in ${district.name}.`;
      } else if (cat === 'Electricity') {
        title = `Smart Connected LED Grid & Safety Lighting Corridors`;
        keyHazard = `Night dark spots, public safety concerns & arterial transit blindspots`;
        aiRecommendation = `Install connected smart LED poles with automatic dusk sensors along main arterial bypasses in ${district.name}.`;
      } else if (cat === 'Health' || cat === 'Healthcare') {
        title = `Primary Healthcare Solar Backup & Mobile Diagnostic Vans`;
        keyHazard = `Frequent grid outages affecting vaccine cold-chains & maternal emergency care delays`;
        aiRecommendation = `Equip rural clinics in ${district.name} with solar battery backups and deploy tele-diagnostic mobile vans.`;
      } else {
        title = `School Sanitation Blocks & Solar Digital Learning Hubs`;
        keyHazard = `Sanitation facility deficits leading to student dropouts and digital learning divide`;
        aiRecommendation = `Construct dedicated bio-sanitation facilities and install solar smart classroom displays in schools in ${district.name}.`;
      }

      const beneficiaries = Math.round(district.population * (0.2 + (deficitPct / 300)));
      const budgetInr = Math.round((district.population * 35) + (deficitPct * 600000));
      const timelineMonths = priorityScore > 85 ? 14 : priorityScore > 75 ? 10 : 8;

      let interventionType: InterventionType = 'BUILD';
      if (cat === 'Water') interventionType = deficitPct > 60 ? 'BUILD' : 'UPGRADE';
      else if (cat === 'Roads') interventionType = deficitPct > 55 ? 'FIX' : 'BUILD';
      else if (cat === 'Drainage') interventionType = 'FIX';
      else if (cat === 'Electricity') interventionType = 'UPGRADE';
      else if (cat === 'Health' || cat === 'Healthcare') interventionType = priorityScore > 80 ? 'UPGRADE' : 'POLICY';
      else if (cat === 'Education') interventionType = 'POLICY';

      const affectedAreas = Math.max(6, Math.round(district.population / 45000));
      const confidence = Math.min(96, Math.max(88, Math.round(85 + (priorityScore / 10))));

      candidates.push({
        id: `rec-${district.id}-${cat.toLowerCase()}`,
        title,
        category: cat,
        interventionType,
        districtId: district.id,
        districtName: district.name,
        state: district.state,
        priorityScore,
        citizenRequestsCount: demandSignals,
        affectedAreasCount: affectedAreas,
        vulnerabilityLabel: priorityScore > 85 ? 'CRITICAL' : priorityScore > 75 ? 'HIGH' : 'MODERATE',
        confidencePct: confidence,
        expectedReach: beneficiaries,
        urgencyLabel: priorityScore > 85 ? 'CRITICAL' : priorityScore > 75 ? 'HIGH' : 'MEDIUM',
        densityDesc: `${(district.population / 1000000).toFixed(2)}M Population (${(district.poverty_index * 100).toFixed(0)}% poverty index)`,
        deficitPct,
        keyHazard,
        capexGap: `Municipal capex gap identified in baseline audit`,
        aiRecommendation,
        budgetInr,
        beneficiaries,
        timelineMonths,
        breakdown,
        keyBulletPoints: [
          `${demandSignals.toLocaleString()} citizen demand signals`,
          `+ ${affectedAreas} villages/wards severely affected`,
          `+ ${deficitPct}% ${cat.toLowerCase()} access deficit`,
          `+ ${priorityScore > 80 ? 'CRITICAL' : 'HIGH'} vulnerability score`,
          `+ High AI confidence (${confidence}%)`
        ]
      });
    });
  });

  // Sort candidates by priority score descending
  candidates.sort((a, b) => b.priorityScore - a.priorityScore);

  // Take top candidates ensuring district diversity (max 2 per district)
  const selected: typeof candidates = [];
  const districtCounts: Record<string, number> = {};

  for (const item of candidates) {
    const count = districtCounts[item.districtId] || 0;
    if (count < 2) {
      selected.push(item);
      districtCounts[item.districtId] = count + 1;
    }
    if (selected.length >= 8) break;
  }

  // Map to final RecommendedProject schema
  return selected.map((item, index) => {
    const rank = index + 1;
    const medal = rank === 1 ? '🥇 1' : rank === 2 ? '🥈 2' : rank === 3 ? '🥉 3' : `#${rank}`;
    const tier = getPriorityTier(item.priorityScore);

    const citizenDemandFactor: PriorityFactorDetail = {
      factorName: 'Citizen Demand',
      score: item.breakdown.demand_score,
      weight: SCORING_WEIGHTS.citizenDemand,
      weightedScore: Number((item.breakdown.demand_score * SCORING_WEIGHTS.citizenDemand).toFixed(1)),
      bulletText: `${item.citizenRequestsCount.toLocaleString()} citizen requests`,
      metricValue: `${item.citizenRequestsCount.toLocaleString()} signals`,
      description: `Aggregated voice, SMS, and digital citizen reports from ${item.districtName}.`,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    };

    const infrastructureGapFactor: PriorityFactorDetail = {
      factorName: 'Infrastructure Gap',
      score: item.breakdown.gap_score,
      weight: SCORING_WEIGHTS.infrastructureGap,
      weightedScore: Number((item.breakdown.gap_score * SCORING_WEIGHTS.infrastructureGap).toFixed(1)),
      bulletText: `Infrastructure deficit (${item.deficitPct}% deficit gap)`,
      metricValue: `${item.deficitPct}% Deficit`,
      description: `Baseline municipal audit showing critical capacity shortfall in ${item.category}.`,
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    };

    const populationImpactFactor: PriorityFactorDetail = {
      factorName: 'Population Impact',
      score: item.breakdown.vuln_score,
      weight: SCORING_WEIGHTS.populationImpact,
      weightedScore: Number((item.breakdown.vuln_score * SCORING_WEIGHTS.populationImpact).toFixed(1)),
      bulletText: `Target population (${(item.beneficiaries / 1000).toFixed(0)}k beneficiaries)`,
      metricValue: `${(item.beneficiaries / 1000).toFixed(0)}k people`,
      description: item.densityDesc,
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    };

    const urgencyFactor: PriorityFactorDetail = {
      factorName: 'Urgency',
      score: item.breakdown.sev_score,
      weight: SCORING_WEIGHTS.urgency,
      weightedScore: Number((item.breakdown.sev_score * SCORING_WEIGHTS.urgency).toFixed(1)),
      bulletText: item.keyHazard.split(',')[0] || 'Urgent environmental hazard',
      metricValue: `Severity (${(item.breakdown.sev_score / 10).toFixed(1)}/10)`,
      description: item.keyHazard,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    };

    const governmentPriorityFactor: PriorityFactorDetail = {
      factorName: 'Government Priority',
      score: item.breakdown.align_score,
      weight: SCORING_WEIGHTS.governmentPriority,
      weightedScore: Number((item.breakdown.align_score * SCORING_WEIGHTS.governmentPriority).toFixed(1)),
      bulletText: `Municipal infrastructure priority alignment`,
      metricValue: item.breakdown.align_score > 50 ? 'High Alignment' : 'Unaligned / CapEx Gap',
      description: item.capexGap,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };

      // Generate Demographic & Equity Profile ("Who is Affected?")
      // Note: These are representative socioeconomic baselines from national sector averages
      const DEMOGRAPHIC_DISCLAIMER = 'Representative demographic profile based on national sector baselines. District-specific census stratification being integrated.';
      let demographics: DemographicProfile;
      if (item.category === 'Water') {
        demographics = {
          ruralPct: 72,
          urbanPct: 28,
          provenanceLabel: 'Illustrative Equity Profile',
          isIllustrativeBaseline: true,
          affectedGroups: [
            { groupName: 'Women & Primary Caregivers', percentage: 46, impactNote: 'Spend 2.5 hrs/day fetching drinking water from distant pumps', iconEmoji: '👩' },
            { groupName: 'Children & Students', percentage: 31, impactNote: 'School attendance drops due to waterborne illnesses', iconEmoji: '🎒' },
            { groupName: 'Elderly Residents (60+)', percentage: 23, impactNote: 'High physical strain carrying heavy water containers', iconEmoji: '👵' },
          ],
          incomeTierBreakdown: { lowIncomePct: 74, middleIncomePct: 22, highIncomePct: 4 },
          vulnerabilityIndicators: [
            { label: 'High Rural Poverty', badgeColor: 'bg-rose-100 text-rose-800 border-rose-300' },
            { label: 'Severe Ground Water Salinity', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300' },
          ],
          equityAssessment: `Disproportionately impacts 12 rural villages where 78% of households lack indoor piped water.`,
          piiProtectionNote: DEMOGRAPHIC_DISCLAIMER
        };
      } else if (item.category === 'Roads') {
        demographics = {
          ruralPct: 62,
          urbanPct: 38,
          provenanceLabel: 'Illustrative Equity Profile',
          isIllustrativeBaseline: true,
          affectedGroups: [
            { groupName: 'Students & Bus Commuters', percentage: 42, impactNote: 'Missed school buses and unsafe bicycle transit through potholes', iconEmoji: '🎒' },
            { groupName: 'Farmers & Daily-Wage Laborers', percentage: 35, impactNote: 'Agricultural crop spoilage during transit delays', iconEmoji: '🌾' },
            { groupName: 'Elderly Patients & Ambulances', percentage: 23, impactNote: '2.4x delay in emergency medical transit to regional hospital', iconEmoji: '🚑' },
          ],
          incomeTierBreakdown: { lowIncomePct: 68, middleIncomePct: 26, highIncomePct: 6 },
          vulnerabilityIndicators: [
            { label: 'Public Transit Dependent', badgeColor: 'bg-blue-100 text-blue-800 border-blue-300' },
            { label: 'Single Access Route Corridor', badgeColor: 'bg-purple-100 text-purple-800 border-purple-300' },
          ],
          equityAssessment: `High impact on students and elderly residents relying on public bus routes across ${item.affectedAreasCount} underserved villages.`,
          piiProtectionNote: DEMOGRAPHIC_DISCLAIMER
        };
      } else if (item.category === 'Health' || item.category === 'Healthcare') {
        demographics = {
          ruralPct: 80,
          urbanPct: 20,
          provenanceLabel: 'Illustrative Equity Profile',
          isIllustrativeBaseline: true,
          affectedGroups: [
            { groupName: 'Maternal & Infant Patients', percentage: 38, impactNote: 'Stockout of essential prenatal supplements & pediatric vaccines', iconEmoji: '👶' },
            { groupName: 'Elderly Chronic Care Patients', percentage: 34, impactNote: 'Unable to secure monthly diabetes & hypertension medication', iconEmoji: '👵' },
            { groupName: 'Agricultural Daily Laborers', percentage: 28, impactNote: 'Untreated occupational injuries due to doctor absence', iconEmoji: '👨‍🌾' },
          ],
          incomeTierBreakdown: { lowIncomePct: 82, middleIncomePct: 15, highIncomePct: 3 },
          vulnerabilityIndicators: [
            { label: 'Zero Private Care Alternatives', badgeColor: 'bg-rose-100 text-rose-800 border-rose-300' },
            { label: 'High BPL Population Concentration', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300' },
          ],
          equityAssessment: `Critical health deficit in low-income rural blocks where 82% rely exclusively on public primary health centers.`,
          piiProtectionNote: DEMOGRAPHIC_DISCLAIMER
        };
      } else if (item.category === 'Drainage') {
        demographics = {
          ruralPct: 30,
          urbanPct: 70,
          provenanceLabel: 'Illustrative Equity Profile',
          isIllustrativeBaseline: true,
          affectedGroups: [
            { groupName: 'Low-Income Ward Residents', percentage: 52, impactNote: 'Flash monsoon flooding & sewage water entering informal housing', iconEmoji: '🏘️' },
            { groupName: 'Small Marketplace Vendors', percentage: 28, impactNote: 'Stagnant waterlogging causing market closures and stock loss', iconEmoji: '🏪' },
            { groupName: 'Schoolchildren & Pedestrians', percentage: 20, impactNote: 'Hazardous walking paths due to open sewer overflow', iconEmoji: '🎒' },
          ],
          incomeTierBreakdown: { lowIncomePct: 71, middleIncomePct: 24, highIncomePct: 5 },
          vulnerabilityIndicators: [
            { label: 'High Urban Density Slums', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300' },
            { label: 'Monsoon Outfall Hazard', badgeColor: 'bg-rose-100 text-rose-800 border-rose-300' },
          ],
          equityAssessment: `Concentrated in dense low-income urban wards lacking automated stormwater outfalls.`,
          piiProtectionNote: DEMOGRAPHIC_DISCLAIMER
        };
      } else if (item.category === 'Electricity') {
        demographics = {
          ruralPct: 65,
          urbanPct: 35,
          provenanceLabel: 'Illustrative Equity Profile',
          isIllustrativeBaseline: true,
          affectedGroups: [
            { groupName: 'Smallholder Farmers', percentage: 45, impactNote: 'Transformer coil burnout causing pump motor failure & crop drying', iconEmoji: '⚡' },
            { groupName: 'Students Preparing for Exams', percentage: 30, impactNote: 'Unannounced feeder outages during evening study hours', iconEmoji: '📚' },
            { groupName: 'Women & Night Pedestrians', percentage: 25, impactNote: 'Unlit highway bypass corridors raising public safety risks', iconEmoji: '🌙' },
          ],
          incomeTierBreakdown: { lowIncomePct: 62, middleIncomePct: 32, highIncomePct: 6 },
          vulnerabilityIndicators: [
            { label: 'Feeder Overload Deficit', badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
            { label: 'Agricultural Power Spike Hazard', badgeColor: 'bg-purple-100 text-purple-800 border-purple-300' },
          ],
          equityAssessment: `High agricultural impact on smallholder farmers suffering pump motor burnouts.`,
          piiProtectionNote: DEMOGRAPHIC_DISCLAIMER
        };
      } else {
        demographics = {
          ruralPct: 78,
          urbanPct: 22,
          provenanceLabel: 'Illustrative Equity Profile',
          isIllustrativeBaseline: true,
          affectedGroups: [
            { groupName: 'Female Students (Ages 10-16)', percentage: 48, impactNote: 'Absence of dedicated sanitation facilities leads to high dropout rates', iconEmoji: '👧' },
            { groupName: 'First-Generation Learners', percentage: 32, impactNote: 'Lack of digital classroom displays and evening lighting', iconEmoji: '📚' },
            { groupName: 'Primary Educators', percentage: 20, impactNote: 'Inadequate basic infrastructure for quality classroom instruction', iconEmoji: '👩‍🏫' },
          ],
          incomeTierBreakdown: { lowIncomePct: 79, middleIncomePct: 18, highIncomePct: 3 },
          vulnerabilityIndicators: [
            { label: 'Female Student Retention Risk', badgeColor: 'bg-rose-100 text-rose-800 border-rose-300' },
            { label: 'Rural Digital Divide', badgeColor: 'bg-blue-100 text-blue-800 border-blue-300' },
          ],
          equityAssessment: `Addressing sanitation and digital gaps directly improves female student retention and rural literacy.`,
          piiProtectionNote: DEMOGRAPHIC_DISCLAIMER
        };
      }

      // Generate Infrastructure Audit ("What exists? What condition/capacity?")
      let infrastructureAudit: InfrastructureAudit;
      if (item.interventionType === 'BUILD') {
        infrastructureAudit = {
          assetName: item.category === 'Healthcare' || item.category === 'Health' ? 'Primary Health Centre (PHC)' : item.category === 'Water' ? 'Water Pumping & Storage Hub' : item.category === 'Roads' ? 'Paved Access Road' : 'Community Infrastructure Facility',
          assetCategory: item.category,
          location: `${item.districtName} Rural Belt (Sector 4)`,
          capacity: item.category === 'Healthcare' || item.category === 'Health' ? '0 local beds' : item.category === 'Water' ? '0 piped connections' : '0 paved km',
          condition: '❌ Non-functional',
          utilizationPct: 0,
          nearestFacilityDistanceKm: 18.2,
          travelTimeMinutes: 45,
          servedPopulation: item.beneficiaries,
          auditFinding: `Nearest facility is 18.2 km away (~45 min transit time) serving ${item.beneficiaries.toLocaleString()} residents without local coverage.`,
          interventionRationale: `NO LOCAL INFRASTRUCTURE → 🏗 BUILD: New facility required because ${item.beneficiaries.toLocaleString()} residents have zero local access within a 15 km radius, while regional facilities operate at capacity.`,
          interventionType: 'BUILD'
        };
      } else if (item.interventionType === 'FIX') {
        infrastructureAudit = {
          assetName: item.category === 'Roads' ? 'MDR-44 Hospital Transit Route' : item.category === 'Water' ? 'RO Filtration Plant #2' : 'Substation Feeder Line',
          assetCategory: item.category,
          location: `${item.districtName} Ward Corridor`,
          capacity: item.category === 'Roads' ? '8 km stretch' : '50,000 L/day',
          condition: '⚠️ Damaged',
          utilizationPct: 95,
          nearestFacilityDistanceKm: 0,
          travelTimeMinutes: 28,
          servedPopulation: item.beneficiaries,
          auditFinding: `Infrastructure exists but is severely damaged with 48+ major structural defects causing 2.4x transit delays and emergency hazards.`,
          interventionRationale: `INFRASTRUCTURE BROKEN → 🔧 FIX: Structural overhaul required to repair heavy monsoon damage, restore safety compliance, and eliminate emergency transit bottlenecks.`,
          interventionType: 'FIX'
        };
      } else if (item.interventionType === 'UPGRADE') {
        infrastructureAudit = {
          assetName: item.category === 'Water' ? 'Overhead Water Reservoir Tank' : item.category === 'Electricity' ? '33/11kV Substation' : 'Government Primary School',
          assetCategory: item.category,
          location: `${item.districtName} Sector 9`,
          capacity: item.category === 'Water' ? '100,000 L design limit' : '12 MVA capacity',
          condition: '🔴 Critical',
          utilizationPct: 115,
          nearestFacilityDistanceKm: 3.5,
          travelTimeMinutes: 10,
          servedPopulation: item.beneficiaries,
          auditFinding: `Facility is operating at 115% capacity overload with severe demand outpacing original design specifications.`,
          interventionRationale: `CAPACITY EXCEEDED → ⬆ UPGRADE: Capacity expansion required to expand throughput by 40% and prevent structural/feeder failure under peak load.`,
          interventionType: 'UPGRADE'
        };
      } else { // POLICY
        infrastructureAudit = {
          assetName: item.category === 'Healthcare' || item.category === 'Health' ? 'Primary Health Center (30 beds)' : 'Public Utility & Distribution Center',
          assetCategory: item.category,
          location: `${item.districtName} Sector 2`,
          capacity: '30 beds (Good Physical Condition)',
          condition: '🟢 Good',
          utilizationPct: 78,
          nearestFacilityDistanceKm: 2.1,
          travelTimeMinutes: 8,
          servedPopulation: item.beneficiaries,
          auditFinding: `Physical facility condition and bed capacity are good (78% utilization), but 2 Medical Officers are missing and vaccine stockouts disrupt patient care.`,
          interventionRationale: `INFRASTRUCTURE ADEQUATE BUT SERVICE FAILING → 📋 POLICY: Operational policy overhaul, staffing deployment, and inventory supply chain reform required without CapEx construction.`,
          interventionType: 'POLICY'
        };
      }

    return {
      id: item.id,
      rank,
      medal,
      title: item.title,
      category: item.category,
      interventionType: item.interventionType,
      districtName: item.districtName,
      districtId: item.districtId,
      state: item.state,
      priorityScore: item.priorityScore,
      priorityTier: tier.label,
      citizenRequestsCount: item.citizenRequestsCount,
      affectedAreasCount: item.affectedAreasCount,
      vulnerabilityLabel: item.vulnerabilityLabel,
      confidencePct: item.confidencePct,
      expectedReach: item.beneficiaries,
      urgencyLabel: item.urgencyLabel,
      summaryReasoning: `Prioritized for ${item.districtName} (${item.state}) due to complaint signals (${item.citizenRequestsCount.toLocaleString()}), ${item.deficitPct}% ${item.category} access deficit, and urgent local risk.`,
      factors: {
        citizenDemand: citizenDemandFactor,
        infrastructureGap: infrastructureGapFactor,
        populationImpact: populationImpactFactor,
        urgency: urgencyFactor,
        governmentPriority: governmentPriorityFactor,
      },
      keyBulletPoints: item.keyBulletPoints,
      aiRecommendation: item.aiRecommendation,
      estimatedBudgetInr: item.budgetInr,
      targetBeneficiaries: item.beneficiaries,
      timelineMonths: item.timelineMonths,
      evidenceSignals: {
        totalRequests: item.citizenRequestsCount,
        topicMentionPct: Math.min(88, Math.round(55 + (item.deficitPct / 3))),
        urgentRequestsCount: Math.round(item.citizenRequestsCount * 0.24),
      },
      evidenceInfrastructure: {
        underservedAreasCount: item.affectedAreasCount,
        existingFacilitiesCount: Math.max(4, Math.round(item.affectedAreasCount * 0.75)),
        nonFunctionalFacilitiesCount: Math.max(2, Math.round(item.affectedAreasCount * 0.35)),
      },
      expectedImpact: {
        accessIncreasePct: Math.round(item.deficitPct * 0.52),
        coverageIncreasePct: Math.round(item.deficitPct * 0.38),
        demandReductionPct: Math.min(85, Math.round(18 + (item.priorityScore * 0.4))),
      },
      demographics,
      infrastructureAudit,
      publicDataIndicators: getPublicDataForDistrict(item.districtName, item.category).map(ind => ({
        indicator: ind.indicator,
        value: ind.value,
        unit: ind.unit,
        source: ind.source,
        year: ind.year,
        datasetName: ind.datasetName,
        isSynthetic: ind.isSyntheticDemo,
      })),
      investmentAudit: getInvestmentAuditByCategory(item.category),
      // Step 2C-5B: Unified Evidence Bundle
      evidenceBundle: buildEvidenceBundle(item.districtId, item.category, requests),
    };
  });
}

