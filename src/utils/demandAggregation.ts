import { District, CitizenRequest, InfrastructureCategory } from '../types';
import { DEPARTMENT_GRIEVANCE_BASELINES, STATE_GRIEVANCE_BASELINES } from '../data/governmentBaselineData';

export interface IssueDistribution {
  category: string;
  percentage: number;
  count: number;
  severity: 'Critical' | 'High' | 'Moderate' | 'Low';
  iconName: string;
  dotColor: string; // e.g. '#ef4444' for 🔴, '#f97316' for 🟠, '#eab308' for 🟡, '#10b981' for 🟢
}

export interface CityDemandHotspot {
  districtId: string;
  cityName: string;
  state: string;
  zone: string;
  lat: number;
  lon: number;
  totalCitizenRequests: number;
  categoryRequests: number;
  highPriorityCount: number;
  userRequestsCount?: number;
  demoRequestsCount?: number;
  baselineDemandVolume?: number;
  primaryCategory: string;
  primaryDot: '🔴' | '🟠' | '🟡' | '🟢';
  primaryDotColor: string;
  primaryBadgeLabel: string;
  topIssues: IssueDistribution[];
  aiRecommendation: string;
  urgencyLevel: 'Critical' | 'High' | 'Moderate' | 'Low';
  population: number;
  povertyIndex: number;
  hasCategorySignal: boolean;
  categoryScore: number;
  representativeQuote?: {
    text: string;
    english: string;
    language: string;
    locality?: string;
    severity: number;
    urgency: string;
  };
}

// Baseline realistic seed demand metrics per district for realistic GIS analysis
const BASELINE_DISTRICT_DEMAND: Record<string, {
  baseRequests: number;
  highPriorityRatio: number;
  issueWeights: { category: string; weight: number }[];
  recommendation: string;
}> = {
  // WATER-DOMINANT BELTS
  jodhpur: {
    baseRequests: 1820,
    highPriorityRatio: 0.22,
    issueWeights: [
      { category: 'Water', weight: 65 },
      { category: 'Roads', weight: 15 },
      { category: 'Electricity', weight: 12 },
      { category: 'Drainage', weight: 5 },
      { category: 'Health', weight: 3 },
    ],
    recommendation: 'Expand emergency solar deep-aquifer tubewell grids and commission RO desalination plants for saline desert groundwater.',
  },
  barmer: {
    baseRequests: 1640,
    highPriorityRatio: 0.24,
    issueWeights: [
      { category: 'Water', weight: 68 },
      { category: 'Health', weight: 16 },
      { category: 'Electricity', weight: 10 },
      { category: 'Roads', weight: 6 },
    ],
    recommendation: 'Rehabilitate fractured Narmada canal feeder pipelines and deploy mobile water purification units in desert clusters.',
  },
  solapur: {
    baseRequests: 1910,
    highPriorityRatio: 0.18,
    issueWeights: [
      { category: 'Water', weight: 58 },
      { category: 'Roads', weight: 18 },
      { category: 'Drainage', weight: 12 },
      { category: 'Electricity', weight: 8 },
      { category: 'Health', weight: 4 },
    ],
    recommendation: 'Augment Ujjani reservoir canal storage and enforce micro-drip irrigation to avert seasonal drinking supply collapses.',
  },
  latur: {
    baseRequests: 1720,
    highPriorityRatio: 0.21,
    issueWeights: [
      { category: 'Water', weight: 62 },
      { category: 'Health', weight: 15 },
      { category: 'Roads', weight: 12 },
      { category: 'Electricity', weight: 8 },
      { category: 'Drainage', weight: 3 },
    ],
    recommendation: 'Desilt Manjara river basin recharge structures and restore electrified rural mini-piped supply schemes.',
  },
  nalgonda: {
    baseRequests: 1480,
    highPriorityRatio: 0.19,
    issueWeights: [
      { category: 'Water', weight: 56 },
      { category: 'Health', weight: 20 },
      { category: 'Roads', weight: 12 },
      { category: 'Electricity', weight: 8 },
      { category: 'Drainage', weight: 4 },
    ],
    recommendation: 'Repair non-operational community RO defluoridation filtration plants across fluoride-endemic rural mandals.',
  },
  anantapur: {
    baseRequests: 2150,
    highPriorityRatio: 0.23,
    issueWeights: [
      { category: 'Water', weight: 61 },
      { category: 'Roads', weight: 16 },
      { category: 'Health', weight: 12 },
      { category: 'Electricity', weight: 8 },
      { category: 'Drainage', weight: 3 },
    ],
    recommendation: 'Expedite Handri-Neeva Sujala Sravanthi canal water interlinking and construct check dams in Rayalaseema arid pockets.',
  },
  prakasam: {
    baseRequests: 1520,
    highPriorityRatio: 0.18,
    issueWeights: [
      { category: 'Water', weight: 54 },
      { category: 'Roads', weight: 20 },
      { category: 'Health', weight: 14 },
      { category: 'Electricity', weight: 8 },
      { category: 'Drainage', weight: 4 },
    ],
    recommendation: 'Accelerate Veligonda project surface water trunk distribution to replace fluoride-laden groundwater in western mandals.',
  },
  guntur: {
    baseRequests: 1842,
    highPriorityRatio: 0.17,
    issueWeights: [
      { category: 'Water', weight: 48 },
      { category: 'Roads', weight: 22 },
      { category: 'Drainage', weight: 16 },
      { category: 'Electricity', weight: 9 },
      { category: 'Health', weight: 5 },
    ],
    recommendation: 'Rehabilitate damaged feeder water mains in Tenali and expand Jal Jeevan piped distribution in upland mandals.',
  },
  raichur: {
    baseRequests: 1390,
    highPriorityRatio: 0.18,
    issueWeights: [
      { category: 'Water', weight: 52 },
      { category: 'Education', weight: 22 },
      { category: 'Electricity', weight: 14 },
      { category: 'Roads', weight: 8 },
      { category: 'Health', weight: 4 },
    ],
    recommendation: 'Restore tail-end Tungabhadra distributary canal flow and desilt community percolation tanks in Manvi taluk.',
  },
  gaya: {
    baseRequests: 2130,
    highPriorityRatio: 0.22,
    issueWeights: [
      { category: 'Water', weight: 52 },
      { category: 'Drainage', weight: 21 },
      { category: 'Electricity', weight: 14 },
      { category: 'Roads', weight: 8 },
      { category: 'Health', weight: 5 },
    ],
    recommendation: 'Deploy deep aquifer solar pumps in rocky zones and restore Har Ghar Nal Ka Jal pump motors in Wazirganj.',
  },

  // ROADS & FREIGHT ARTERIAL CORRIDORS
  kanpur_dehat: {
    baseRequests: 1690,
    highPriorityRatio: 0.20,
    issueWeights: [
      { category: 'Roads', weight: 64 },
      { category: 'Electricity', weight: 18 },
      { category: 'Water', weight: 10 },
      { category: 'Health', weight: 5 },
      { category: 'Drainage', weight: 3 },
    ],
    recommendation: 'Rebuild cratered Akbarpur-Rura arterial road with heavy asphalt and widen culverts to avert freight rollovers.',
  },
  sitapur: {
    baseRequests: 1780,
    highPriorityRatio: 0.19,
    issueWeights: [
      { category: 'Roads', weight: 60 },
      { category: 'Electricity', weight: 18 },
      { category: 'Health', weight: 11 },
      { category: 'Water', weight: 8 },
      { category: 'Drainage', weight: 3 },
    ],
    recommendation: 'Resurface heavy-freight sugar mill transit corridors between Biswan and Laharpur with durable bituminous layers.',
  },
  muzaffarpur: {
    baseRequests: 2280,
    highPriorityRatio: 0.21,
    issueWeights: [
      { category: 'Roads', weight: 54 },
      { category: 'Health', weight: 22 },
      { category: 'Drainage', weight: 14 },
      { category: 'Water', weight: 6 },
      { category: 'Electricity', weight: 4 },
    ],
    recommendation: 'Rebuild flood-damaged river embankment bypasses in Kanti and construct permanent concrete causeways.',
  },
  murshidabad: {
    baseRequests: 2140,
    highPriorityRatio: 0.18,
    issueWeights: [
      { category: 'Roads', weight: 52 },
      { category: 'Drainage', weight: 24 },
      { category: 'Water', weight: 12 },
      { category: 'Health', weight: 8 },
      { category: 'Electricity', weight: 4 },
    ],
    recommendation: 'Rehabilitate State Highway connecting Berhampore and Domkal to accommodate high-volume jute freight.',
  },
  nashik: {
    baseRequests: 1654,
    highPriorityRatio: 0.16,
    issueWeights: [
      { category: 'Roads', weight: 54 },
      { category: 'Water', weight: 20 },
      { category: 'Electricity', weight: 14 },
      { category: 'Drainage', weight: 8 },
      { category: 'Health', weight: 4 },
    ],
    recommendation: 'Accelerate asphalt resurfacing on agricultural transit corridors and repair severe arterial road craters.',
  },
  belagavi: {
    baseRequests: 1890,
    highPriorityRatio: 0.17,
    issueWeights: [
      { category: 'Roads', weight: 51 },
      { category: 'Water', weight: 21 },
      { category: 'Electricity', weight: 15 },
      { category: 'Drainage', weight: 8 },
      { category: 'Health', weight: 5 },
    ],
    recommendation: 'Reinforce subsiding bridge approaches along Krishna river crossings in Chikkodi-Nipani corridor.',
  },
  kurnool: {
    baseRequests: 1720,
    highPriorityRatio: 0.18,
    issueWeights: [
      { category: 'Roads', weight: 53 },
      { category: 'Water', weight: 25 },
      { category: 'Electricity', weight: 12 },
      { category: 'Health', weight: 7 },
      { category: 'Drainage', weight: 3 },
    ],
    recommendation: 'Rebuild collapsed culverts and resurface Adoni-Yemmiganur roadway to restore vital RTC bus transit.',
  },

  // ELECTRICITY / GRID STABILITY
  hardoi: {
    baseRequests: 1620,
    highPriorityRatio: 0.21,
    issueWeights: [
      { category: 'Electricity', weight: 62 },
      { category: 'Roads', weight: 20 },
      { category: 'Water', weight: 10 },
      { category: 'Health', weight: 5 },
      { category: 'Drainage', weight: 3 },
    ],
    recommendation: 'Replace burnt 250 kVA distribution transformers in Sandila and modernize rural 11 kV transmission line protection.',
  },
  purnia: {
    baseRequests: 1580,
    highPriorityRatio: 0.19,
    issueWeights: [
      { category: 'Electricity', weight: 56 },
      { category: 'Roads', weight: 22 },
      { category: 'Health', weight: 12 },
      { category: 'Water', weight: 6 },
      { category: 'Drainage', weight: 4 },
    ],
    recommendation: 'Install voltage stabilizer substations to support agricultural tube wells and expand feeder segregation.',
  },
  palamu: {
    baseRequests: 1450,
    highPriorityRatio: 0.23,
    issueWeights: [
      { category: 'Electricity', weight: 58 },
      { category: 'Health', weight: 20 },
      { category: 'Water', weight: 12 },
      { category: 'Roads', weight: 7 },
      { category: 'Drainage', weight: 3 },
    ],
    recommendation: 'Restore lightning-damaged rural substations in Daltonganj and replace broken wooden transmission poles.',
  },
  kalahandi: {
    baseRequests: 1380,
    highPriorityRatio: 0.22,
    issueWeights: [
      { category: 'Electricity', weight: 54 },
      { category: 'Health', weight: 24 },
      { category: 'Water', weight: 12 },
      { category: 'Roads', weight: 7 },
      { category: 'Drainage', weight: 3 },
    ],
    recommendation: 'Rectify low-voltage grid sag in Bhawanipatna rural mandals and replace dangling 11 kV agricultural power lines.',
  },

  // HEALTHCARE ACCESS
  madhubani: {
    baseRequests: 2180,
    highPriorityRatio: 0.25,
    issueWeights: [
      { category: 'Health', weight: 64 },
      { category: 'Roads', weight: 16 },
      { category: 'Drainage', weight: 12 },
      { category: 'Water', weight: 5 },
      { category: 'Electricity', weight: 3 },
    ],
    recommendation: 'Deploy permanent medical officers to Jhanjharpur PHC and operationalize 24/7 maternal obstetrics ward.',
  },
  bahraich: {
    baseRequests: 1940,
    highPriorityRatio: 0.26,
    issueWeights: [
      { category: 'Health', weight: 66 },
      { category: 'Roads', weight: 16 },
      { category: 'Water', weight: 10 },
      { category: 'Electricity', weight: 5 },
      { category: 'Drainage', weight: 3 },
    ],
    recommendation: 'Replenish critical emergency stocks of anti-snake venom (ASV) and rabies immunoglobulins at Nanpara border CHC.',
  },
  dhubri: {
    baseRequests: 1560,
    highPriorityRatio: 0.23,
    issueWeights: [
      { category: 'Health', weight: 60 },
      { category: 'Drainage', weight: 20 },
      { category: 'Roads', weight: 12 },
      { category: 'Water', weight: 5 },
      { category: 'Electricity', weight: 3 },
    ],
    recommendation: 'Re-equip Bilasipara riverine hospital with mobile X-Ray and blood diagnostic analyzers to combat post-flood outbreaks.',
  },
  warangal: {
    baseRequests: 1290,
    highPriorityRatio: 0.19,
    issueWeights: [
      { category: 'Health', weight: 52 },
      { category: 'Roads', weight: 24 },
      { category: 'Water', weight: 14 },
      { category: 'Drainage', weight: 6 },
      { category: 'Electricity', weight: 4 },
    ],
    recommendation: 'Upgrade Primary Health Centers with emergency telemedicine triage and 24/7 advanced life support ambulances.',
  },

  // SANITATION & URBAN DRAINAGE
  bareilly: {
    baseRequests: 1850,
    highPriorityRatio: 0.17,
    issueWeights: [
      { category: 'Drainage', weight: 52 },
      { category: 'Roads', weight: 22 },
      { category: 'Electricity', weight: 12 },
      { category: 'Water', weight: 10 },
      { category: 'Sanitation', weight: 4 },
    ],
    recommendation: 'Execute comprehensive desilting of major stormwater nalas in Nawabganj and prevent sewage overflow into residential streets.',
  },
  south_24_parganas: {
    baseRequests: 2420,
    highPriorityRatio: 0.19,
    issueWeights: [
      { category: 'Drainage', weight: 56 },
      { category: 'Roads', weight: 20 },
      { category: 'Water', weight: 14 },
      { category: 'Health', weight: 6 },
      { category: 'Electricity', weight: 4 },
    ],
    recommendation: 'Dredge silted tidal sluice gates along Matla river in Canning to eliminate persistent monsoonal market flooding.',
  },
  mumbai: {
    baseRequests: 4820,
    highPriorityRatio: 0.14,
    issueWeights: [
      { category: 'Drainage', weight: 52 },
      { category: 'Roads', weight: 28 },
      { category: 'Water', weight: 10 },
      { category: 'Electricity', weight: 6 },
      { category: 'Sanitation', weight: 4 },
    ],
    recommendation: 'Desilt Mithi river intake culverts along LBS Marg and widen micro-drains to prevent arterial commuter disruption.',
  },
  bengaluru: {
    baseRequests: 3670,
    highPriorityRatio: 0.14,
    issueWeights: [
      { category: 'Roads', weight: 42 },
      { category: 'Drainage', weight: 34 },
      { category: 'Electricity', weight: 14 },
      { category: 'Water', weight: 7 },
      { category: 'Health', weight: 3 },
    ],
    recommendation: 'Clear construction debris from Varthur storm channel and restore street lighting cables in Peenya Industrial Area.',
  },
  hyderabad: {
    baseRequests: 3210,
    highPriorityRatio: 0.13,
    issueWeights: [
      { category: 'Drainage', weight: 42 },
      { category: 'Roads', weight: 32 },
      { category: 'Electricity', weight: 16 },
      { category: 'Water', weight: 7 },
      { category: 'Health', weight: 3 },
    ],
    recommendation: 'Execute Strategic Nala Development Program remodeling at Kukatpally and restore high-mast traffic lighting.',
  },
  vijayawada: {
    baseRequests: 2481,
    highPriorityRatio: 0.16,
    issueWeights: [
      { category: 'Drainage', weight: 38 },
      { category: 'Water', weight: 32 },
      { category: 'Roads', weight: 18 },
      { category: 'Electricity', weight: 8 },
      { category: 'Sanitation', weight: 4 },
    ],
    recommendation: 'Prioritize canal bank drainage desilting and reconstruct storm-damaged street lighting circuits in Gunadala.',
  },
};

/**
 * Filter requests by time window
 */
export function filterRequestsByTime(
  requests: CitizenRequest[],
  timeRange: '7d' | '30d' | '90d' | 'all' = 'all'
): CitizenRequest[] {
  if (timeRange === 'all') return requests;
  const now = Date.now();
  const limits: Record<'7d' | '30d' | '90d', number> = {
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
  };
  const maxAge = limits[timeRange];
  return requests.filter((r) => {
    const t = new Date(r.timestamp).getTime();
    return now - t <= maxAge;
  });
}

/**
 * Computes aggregated demand hotspot data for a district, merging
 * baseline historical signal density with live incoming citizen requests.
 * Fully supports category-specific signal calculation and time filtering!
 */
export function getCityDemandHotspot(
  district: District,
  liveRequests: CitizenRequest[],
  selectedCategory: InfrastructureCategory | 'All' = 'All'
): CityDemandHotspot {
  const districtNameLower = district.name.toLowerCase();
  const districtIdLower = district.id.toLowerCase();
  const stateLower = district.state.toLowerCase();

  // Find live requests matching this district
  const matchedLive = liveRequests.filter((r) => {
    const rLoc = (r.location || '').toLowerCase();
    const rDist = (r.district || '').toLowerCase();
    const rState = (r.state || '').toLowerCase();

    return (
      rDist === districtNameLower ||
      rDist === districtIdLower ||
      rLoc.includes(districtNameLower) ||
      (rLoc.includes(districtIdLower) && rState === stateLower)
    );
  });

  const baseline = BASELINE_DISTRICT_DEMAND[districtIdLower] || {
    baseRequests: Math.round(district.population / 4500) + 500,
    highPriorityRatio: 0.14,
    issueWeights: [
      { category: 'Drainage', weight: 30 },
      { category: 'Water', weight: 28 },
      { category: 'Roads', weight: 24 },
      { category: 'Electricity', weight: 12 },
      { category: 'Health', weight: 6 },
    ],
    recommendation: `Prioritize essential public infrastructure upgrades and citizen service access in ${district.name}.`,
  };

  const totalRequests = baseline.baseRequests + matchedLive.length;

  // Calculate category-specific request counts and weights
  const targetCategoryName = selectedCategory === 'All' ? null : selectedCategory;
  const categoryWeightObj = targetCategoryName
    ? baseline.issueWeights.find((w) => w.category === targetCategoryName)
    : null;
  const categoryBasePct = categoryWeightObj ? categoryWeightObj.weight : 0;

  const matchedLiveForCategory = targetCategoryName
    ? matchedLive.filter((r) => r.category === targetCategoryName)
    : matchedLive;

  const categoryRequests = targetCategoryName
    ? Math.round((baseline.baseRequests * categoryBasePct) / 100) + matchedLiveForCategory.length
    : totalRequests;

  // Determine if this district has a notable signal for this category
  // A district has notable signal if it has live requests for that category, OR its baseline weight is >= 25%
  const hasCategorySignal = targetCategoryName
    ? matchedLiveForCategory.length > 0 || categoryBasePct >= 25
    : true;

  // Compute issue category distribution percentages
  const issueCounts: Record<string, number> = {};
  baseline.issueWeights.forEach((item) => {
    issueCounts[item.category] = Math.round((baseline.baseRequests * item.weight) / 100);
  });

  // Blend in live requests
  matchedLive.forEach((req) => {
    const cat = req.category || 'Other';
    issueCounts[cat] = (issueCounts[cat] || 0) + 1;
  });

  // Calculate percentages
  const topIssues: IssueDistribution[] = Object.entries(issueCounts)
    .map(([category, count]) => {
      const percentage = Math.round((count / totalRequests) * 100);
      let severity: 'Critical' | 'High' | 'Moderate' | 'Low' = 'Moderate';
      let dotColor = '#3b82f6';

      if (percentage >= 35) {
        severity = 'Critical';
        dotColor = '#ef4444'; // 🔴
      } else if (percentage >= 20) {
        severity = 'High';
        dotColor = '#f97316'; // 🟠
      } else if (percentage >= 10) {
        severity = 'Moderate';
        dotColor = '#eab308'; // 🟡
      } else {
        severity = 'Low';
        dotColor = '#10b981'; // 🟢
      }

      return {
        category,
        percentage,
        count,
        severity,
        iconName: category.toLowerCase(),
        dotColor,
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  // Normalize percentages
  const totalPct = topIssues.reduce((acc, curr) => acc + curr.percentage, 0);
  if (totalPct > 0 && totalPct !== 100 && topIssues.length > 0) {
    const diff = 100 - totalPct;
    topIssues[0].percentage += diff;
  }

  const primaryIssue = topIssues[0] || {
    category: 'Water',
    percentage: 40,
    count: totalRequests,
    severity: 'Critical' as const,
    iconName: 'water',
    dotColor: '#ef4444',
  };

  let primaryDot: '🔴' | '🟠' | '🟡' | '🟢' = '🔴';
  if (primaryIssue.percentage >= 35) primaryDot = '🔴';
  else if (primaryIssue.percentage >= 20) primaryDot = '🟠';
  else if (primaryIssue.percentage >= 10) primaryDot = '🟡';
  else primaryDot = '🟢';

  // Calculate high priority
  const highPriorityLiveCount = matchedLiveForCategory.filter((r) => r.severity >= 8).length;
  const totalHighPriority =
    Math.round(categoryRequests * baseline.highPriorityRatio) + highPriorityLiveCount;

  // Category priority score (0-100 scale)
  // Higher if high category percentage or high severity live reports exist
  const effectivePct = targetCategoryName ? categoryBasePct : primaryIssue.percentage;
  const liveBonus = matchedLiveForCategory.length * 4;
  const categoryScore = Math.min(
    98,
    Math.round(effectivePct * 1.1 + (district.poverty_index * 25) + liveBonus)
  );

  let urgencyLevel: 'Critical' | 'High' | 'Moderate' | 'Low' = 'Moderate';
  if (categoryScore >= 70 || totalHighPriority > 250) {
    urgencyLevel = 'Critical';
  } else if (categoryScore >= 50 || totalHighPriority > 120) {
    urgencyLevel = 'High';
  } else if (categoryScore >= 30) {
    urgencyLevel = 'Moderate';
  } else {
    urgencyLevel = 'Low';
  }

  // Find representative quote for this district & category
  const candidateReq =
    matchedLiveForCategory.find((r) => r.original_text && r.summary_en) ||
    matchedLive.find((r) => r.original_text && r.summary_en);

  const representativeQuote = candidateReq
    ? {
        text: candidateReq.original_text,
        english: candidateReq.summary_en,
        language: candidateReq.language,
        locality: candidateReq.locality || candidateReq.location,
        severity: candidateReq.severity,
        urgency: candidateReq.urgency || 'HIGH',
      }
    : undefined;

  return {
    districtId: district.id,
    cityName: district.name,
    state: district.state,
    zone: district.zone,
    lat: district.lat,
    lon: district.lon,
    totalCitizenRequests: totalRequests,
    categoryRequests,
    highPriorityCount: totalHighPriority,
    userRequestsCount: matchedLive.filter(r => r.source_origin === 'CIVICPULSE_USER').length,
    demoRequestsCount: matchedLive.filter(r => r.source_origin !== 'CIVICPULSE_USER').length,
    baselineDemandVolume: baseline.baseRequests,
    primaryCategory: targetCategoryName || primaryIssue.category,
    primaryDot,
    primaryDotColor: primaryIssue.dotColor,
    primaryBadgeLabel: `${primaryDot} ${targetCategoryName || primaryIssue.category}`,
    topIssues,
    aiRecommendation: baseline.recommendation,
    urgencyLevel,
    population: district.population,
    povertyIndex: district.poverty_index,
    hasCategorySignal,
    categoryScore,
    representativeQuote,
  };
}

/**
 * Universal Demand Breakdown Interface (Step 2C-4)
 * Explicitly distinguishes four independent demand layers:
 * A. CivicPulse actual citizen submissions
 * B. CivicPulse illustrative demo/seed signals
 * C. Government-published grievance baseline (DARPG / OGD aggregate statistics)
 * D. Combined analytical demand context
 */
export interface DemandBreakdown {
  userSubmittedDemand: number;
  seedDemoDemand: number;
  governmentGrievanceBaseline: number;
  totalCitizenSignals: number;
  combinedAnalyticalDemand: number;
  methodologyNote: string;
}

/**
 * Calculates separated demand breakdown across citizen, demo, and government baseline layers.
 * Guarantees zero double-counting between macro-level government statistical digests
 * and micro-level citizen signals.
 */
export function calculateDemandBreakdown(
  requests: CitizenRequest[],
  districtOrStateId?: string,
  category?: InfrastructureCategory
): DemandBreakdown {
  let filteredRequests = requests;
  if (districtOrStateId) {
    const norm = districtOrStateId.toLowerCase();
    filteredRequests = filteredRequests.filter(r => 
      (r.district && r.district.toLowerCase().includes(norm)) ||
      (r.state && r.state.toLowerCase().includes(norm)) ||
      (r.location && r.location.toLowerCase().includes(norm))
    );
  }
  if (category) {
    filteredRequests = filteredRequests.filter(r => r.category === category);
  }

  const userSubmittedDemand = filteredRequests.filter(r => r.source_origin === 'CIVICPULSE_USER').length;
  const seedDemoDemand = filteredRequests.filter(r => r.source_origin !== 'CIVICPULSE_USER').length;
  const totalCitizenSignals = userSubmittedDemand + seedDemoDemand;

  let govGrievanceCount = 0;
  if (category) {
    const dept = DEPARTMENT_GRIEVANCE_BASELINES.find(d => d.category === category);
    govGrievanceCount = dept ? dept.received_count : 0;
  } else if (districtOrStateId) {
    const stateBaseline = Object.values(STATE_GRIEVANCE_BASELINES).find(s => 
      s.state.toLowerCase().includes(districtOrStateId.toLowerCase())
    );
    govGrievanceCount = stateBaseline ? stateBaseline.total_received : 0;
  } else {
    govGrievanceCount = DEPARTMENT_GRIEVANCE_BASELINES.reduce((sum, d) => sum + d.received_count, 0);
  }

  return {
    userSubmittedDemand,
    seedDemoDemand,
    governmentGrievanceBaseline: govGrievanceCount,
    totalCitizenSignals,
    combinedAnalyticalDemand: totalCitizenSignals + govGrievanceCount,
    methodologyNote: 'Government grievance baselines (macro statistics) and CivicPulse citizen submissions (micro signals) are maintained as separate data streams to eliminate double-counting.',
  };
}

