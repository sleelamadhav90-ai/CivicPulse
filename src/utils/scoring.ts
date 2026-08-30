import { District, InfrastructureCategory, ScoreBreakdown } from '../types';

export const SCORING_WEIGHTS = {
  demand: 0.35,
  gap: 0.25,
  severity: 0.15,
  vulnerability: 0.15,
  alignment: 0.10,
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
      return 58; // baseline grid stability
    case 'Sanitation':
      return Math.round((district.water_access + district.health_access) / 2);
    case 'Other':
      return 60;
    default:
      return district.water_access;
  }
}

/**
 * Calculates deterministic, mathematical Priority Score (0-100)
 * Separates AI understanding from auditable governance calculation.
 */
export function calculatePriorityScore(
  district: District,
  category: InfrastructureCategory,
  severity: number, // 1 to 10
  demandCount: number,
  overrideAccess?: number
): ScoreBreakdown {
  const currentAccess = overrideAccess !== undefined ? overrideAccess : getCategoryAccess(district, category);
  
  // 1. Infrastructure Deficit / Gap Score (0-100)
  const gapPercentage = Math.max(0, 100 - currentAccess);
  const gap_score = gapPercentage;

  // 2. Demand Signal Volume (Logarithmic scale: 1 req ≈ 13.8 pts, 10 reqs ≈ 48 pts, 50 reqs ≈ 78.6 pts, 140+ reqs ≈ 100 pts)
  const safeDemandCount = Math.max(1, demandCount);
  const demand_score = Math.min(20 * Math.log1p(safeDemandCount), 100);

  // 3. Urgency & Severity (0-100)
  const clampedSeverity = Math.min(Math.max(severity, 1), 10);
  const sev_score = clampedSeverity * 10;

  // 4. Social Vulnerability & Poverty Index (0-100)
  const vuln_score = Math.min(district.poverty_index * 100, 100);

  // 5. Policy & Investment Alignment (0-100)
  const align_score = district.planned_investment > 0 ? 100 : 40;

  // Final Weighted Composite Score
  const total_score = Number(
    (
      demand_score * SCORING_WEIGHTS.demand +
      gap_score * SCORING_WEIGHTS.gap +
      sev_score * SCORING_WEIGHTS.severity +
      vuln_score * SCORING_WEIGHTS.vulnerability +
      align_score * SCORING_WEIGHTS.alignment
    ).toFixed(1)
  );

  return {
    demand_score: Number(demand_score.toFixed(1)),
    gap_score: Number(gap_score.toFixed(1)),
    sev_score: Number(sev_score.toFixed(1)),
    vuln_score: Number(vuln_score.toFixed(1)),
    align_score: Number(align_score.toFixed(1)),
    total_score: Math.min(100, Math.max(0, total_score)),
    demand_count: safeDemandCount,
    current_access: currentAccess,
    gap_percentage: gapPercentage,
    weights: SCORING_WEIGHTS,
  };
}

export function getPriorityTier(score: number): {
  label: 'Critical' | 'High' | 'Moderate' | 'Stable';
  color: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
} {
  if (score >= 75) {
    return {
      label: 'Critical',
      color: '#f43f5e',
      badgeBg: 'bg-rose-500/15',
      badgeText: 'text-rose-400',
      borderColor: 'border-rose-500/30',
    };
  }
  if (score >= 60) {
    return {
      label: 'High',
      color: '#f97316',
      badgeBg: 'bg-amber-500/15',
      badgeText: 'text-amber-400',
      borderColor: 'border-amber-500/30',
    };
  }
  if (score >= 40) {
    return {
      label: 'Moderate',
      color: '#eab308',
      badgeBg: 'bg-yellow-500/15',
      badgeText: 'text-yellow-400',
      borderColor: 'border-yellow-500/30',
    };
  }
  return {
    label: 'Stable',
    color: '#10b981',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
  };
}
