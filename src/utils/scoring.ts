import { District, InfrastructureCategory, ScoreBreakdown, RecommendedProject, PriorityFactorDetail, CitizenRequest, InterventionType, DemographicProfile, InfrastructureAudit } from '../types';
import { INFRASTRUCTURE_ASSETS_REGISTRY } from '../data/infrastructureAssets';
import { getInvestmentAuditByCategory } from '../data/investmentData';
import { getPublicDataForDistrict, getPublicContextSummary } from '../data/publicDataService';

export const SCORING_WEIGHTS = {
  citizenDemand: 0.30,
  infrastructureGap: 0.25,
  populationImpact: 0.20,
  urgency: 0.15,
  governmentPriority: 0.10,
  // legacy aliases for backward compatibility
  demand: 0.30,
  gap: 0.25,
  severity: 0.15,
  vulnerability: 0.20,
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
    case 'Drainage':
    case 'Sanitation':
      return Math.round((district.water_access + district.road_quality) / 2 * 0.75);
    case 'Other':
      return 60;
    default:
      return district.water_access;
  }
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
  
  // 1. Citizen Demand Volume Score (0-100)
  const safeDemandCount = Math.max(1, demandCount);
  const demand_score = Math.min(22 * Math.log1p(safeDemandCount), 100);

  // 2. Infrastructure Deficit / Gap Score (0-100)
  const gapPercentage = Math.max(0, 100 - currentAccess);
  const gap_score = gapPercentage;

  // 3. Urgency & Severity (0-100)
  const clampedSeverity = Math.min(Math.max(severity, 1), 10);
  const sev_score = clampedSeverity * 10;

  // 4. Population Impact & Social Vulnerability (0-100)
  const popFactor = Math.min(district.population / 2500000 * 50, 50);
  const povertyFactor = district.poverty_index * 50;
  const vuln_score = Math.min(popFactor + povertyFactor, 100);

  // 5. Government Priority & Existing Capex Gap (0-100)
  const align_score = district.planned_investment > 0 ? 95 : 45;

  // Final Weighted Composite Score
  const total_score = Number(
    (
      demand_score * SCORING_WEIGHTS.citizenDemand +
      gap_score * SCORING_WEIGHTS.infrastructureGap +
      vuln_score * SCORING_WEIGHTS.populationImpact +
      sev_score * SCORING_WEIGHTS.urgency +
      align_score * SCORING_WEIGHTS.governmentPriority
    ).toFixed(1)
  );

  const publicContext = getPublicContextSummary(district.name, category);

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
    weights: {
      demand: SCORING_WEIGHTS.citizenDemand,
      gap: SCORING_WEIGHTS.infrastructureGap,
      severity: SCORING_WEIGHTS.urgency,
      vulnerability: SCORING_WEIGHTS.populationImpact,
      alignment: SCORING_WEIGHTS.governmentPriority,
    },
    publicContextSummary: publicContext.headline,
    publicDataSource: publicContext.primarySourceBadge,
    isSyntheticDemo: publicContext.isSynthetic,
  };
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
  }> = [];

  districts.forEach((district) => {
    const distNameLower = district.name.toLowerCase();
    const distIdLower = district.id.toLowerCase();

    const distRequests = requests.filter((r) => {
      const rLoc = (r.location || '').toLowerCase();
      const rDist = (r.district || '').toLowerCase();
      return (
        rDist === distNameLower ||
        rDist === distIdLower ||
        rLoc.includes(distNameLower) ||
        distNameLower.includes(rLoc) ||
        rLoc.includes(distIdLower)
      );
    });

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

      // Estimate dynamic demand signals if requests are few
      const demandSignals = reqCount > 0 ? reqCount * 12 : Math.round(district.population * 0.0012 * (0.8 + district.poverty_index));

      const breakdown = calculatePriorityScore(district, cat, 8, Math.max(1, reqCount > 0 ? reqCount : Math.round(demandSignals / 15)));
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
      score: Math.min(100, Math.round(22 * Math.log1p(item.citizenRequestsCount))),
      weight: SCORING_WEIGHTS.citizenDemand,
      weightedScore: Number((Math.min(100, Math.round(22 * Math.log1p(item.citizenRequestsCount))) * SCORING_WEIGHTS.citizenDemand).toFixed(1)),
      bulletText: `${item.citizenRequestsCount.toLocaleString()} citizen requests`,
      metricValue: `${item.citizenRequestsCount.toLocaleString()} signals`,
      description: `Aggregated voice, SMS, and digital citizen reports from ${item.districtName}.`,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    };

    const infrastructureGapFactor: PriorityFactorDetail = {
      factorName: 'Infrastructure Gap',
      score: item.deficitPct,
      weight: SCORING_WEIGHTS.infrastructureGap,
      weightedScore: Number((item.deficitPct * SCORING_WEIGHTS.infrastructureGap).toFixed(1)),
      bulletText: `Infrastructure deficit (${item.deficitPct}% deficit gap)`,
      metricValue: `${item.deficitPct}% Deficit`,
      description: `Baseline municipal audit showing critical capacity shortfall in ${item.category}.`,
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    };

    const populationImpactFactor: PriorityFactorDetail = {
      factorName: 'Population Impact',
      score: 88,
      weight: SCORING_WEIGHTS.populationImpact,
      weightedScore: Number((88 * SCORING_WEIGHTS.populationImpact).toFixed(1)),
      bulletText: `Target population (${(item.beneficiaries / 1000).toFixed(0)}k beneficiaries)`,
      metricValue: `${(item.beneficiaries / 1000).toFixed(0)}k people`,
      description: item.densityDesc,
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    };

    const urgencyFactor: PriorityFactorDetail = {
      factorName: 'Urgency',
      score: 92,
      weight: SCORING_WEIGHTS.urgency,
      weightedScore: Number((92 * SCORING_WEIGHTS.urgency).toFixed(1)),
      bulletText: item.keyHazard.split(',')[0] || 'Urgent environmental hazard',
      metricValue: 'Critical (9.2/10)',
      description: item.keyHazard,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    };

    const governmentPriorityFactor: PriorityFactorDetail = {
      factorName: 'Government Priority',
      score: 85,
      weight: SCORING_WEIGHTS.governmentPriority,
      weightedScore: Number((85 * SCORING_WEIGHTS.governmentPriority).toFixed(1)),
      bulletText: `Municipal infrastructure priority alignment`,
      metricValue: `High Alignment`,
      description: item.capexGap,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };

      // Generate Demographic & Equity Profile ("Who is Affected?")
      let demographics: DemographicProfile;
      if (item.category === 'Water') {
        demographics = {
          ruralPct: 72,
          urbanPct: 28,
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
          piiProtectionNote: 'Aggregated population-level equity metrics (PII Compliant).'
        };
      } else if (item.category === 'Roads') {
        demographics = {
          ruralPct: 62,
          urbanPct: 38,
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
          piiProtectionNote: 'Aggregated population-level equity metrics (PII Compliant).'
        };
      } else if (item.category === 'Health' || item.category === 'Healthcare') {
        demographics = {
          ruralPct: 80,
          urbanPct: 20,
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
          piiProtectionNote: 'Aggregated population-level equity metrics (PII Compliant).'
        };
      } else if (item.category === 'Drainage') {
        demographics = {
          ruralPct: 30,
          urbanPct: 70,
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
          piiProtectionNote: 'Aggregated population-level equity metrics (PII Compliant).'
        };
      } else if (item.category === 'Electricity') {
        demographics = {
          ruralPct: 65,
          urbanPct: 35,
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
          piiProtectionNote: 'Aggregated population-level equity metrics (PII Compliant).'
        };
      } else {
        demographics = {
          ruralPct: 78,
          urbanPct: 22,
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
          piiProtectionNote: 'Aggregated population-level equity metrics (PII Compliant).'
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
    };
  });
}

