import { District, CitizenRequest, InfrastructureCategory } from '../types';

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
  highPriorityCount: number;
  primaryCategory: string;
  primaryDot: '🔴' | '🟠' | '🟡' | '🟢';
  primaryDotColor: string;
  primaryBadgeLabel: string;
  topIssues: IssueDistribution[];
  aiRecommendation: string;
  urgencyLevel: 'Critical' | 'High' | 'Moderate' | 'Low';
  population: number;
  povertyIndex: number;
}

// Baseline realistic seed demand metrics per district for realistic GIS analysis
const BASELINE_DISTRICT_DEMAND: Record<string, {
  baseRequests: number;
  highPriorityRatio: number;
  issueWeights: { category: string; weight: number }[];
  recommendation: string;
}> = {
  vijayawada: {
    baseRequests: 2481,
    highPriorityRatio: 0.155, // 386 high priority
    issueWeights: [
      { category: 'Water', weight: 41 },
      { category: 'Roads', weight: 27 },
      { category: 'Drainage', weight: 18 },
      { category: 'Lighting', weight: 9 },
      { category: 'Sanitation', weight: 5 },
    ],
    recommendation: 'Prioritize drainage infrastructure and stormwater canal widening in this region to prevent recurrent monsoon flooding.',
  },
  guntur: {
    baseRequests: 1842,
    highPriorityRatio: 0.169, // ~312 high priority
    issueWeights: [
      { category: 'Water', weight: 46 },
      { category: 'Roads', weight: 24 },
      { category: 'Drainage', weight: 15 },
      { category: 'Electricity', weight: 10 },
      { category: 'Health', weight: 5 },
    ],
    recommendation: 'Deploy solar micro-piped water distribution and rehabilitate rural supply pipelines in rain-shadow blocks.',
  },
  warangal: {
    baseRequests: 1290,
    highPriorityRatio: 0.186, // ~240 high priority
    issueWeights: [
      { category: 'Health', weight: 44 },
      { category: 'Roads', weight: 26 },
      { category: 'Water', weight: 18 },
      { category: 'Drainage', weight: 8 },
      { category: 'Electricity', weight: 4 },
    ],
    recommendation: 'Upgrade Primary Health Centers with emergency telemedicine triage and trauma care ambulances.',
  },
  nashik: {
    baseRequests: 1654,
    highPriorityRatio: 0.145,
    issueWeights: [
      { category: 'Roads', weight: 48 },
      { category: 'Water', weight: 25 },
      { category: 'Electricity', weight: 14 },
      { category: 'Drainage', weight: 8 },
      { category: 'Health', weight: 5 },
    ],
    recommendation: 'Accelerate asphalt resurfacing on agricultural transit corridors and repair severe arterial road craters.',
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
    recommendation: 'Commission deep aquifer recharge wells and emergency tanker distribution in depleted groundwater blocks.',
  },
  raichur: {
    baseRequests: 980,
    highPriorityRatio: 0.13,
    issueWeights: [
      { category: 'Education', weight: 45 },
      { category: 'Water', weight: 28 },
      { category: 'Electricity', weight: 15 },
      { category: 'Roads', weight: 8 },
      { category: 'Health', weight: 4 },
    ],
    recommendation: 'Refurbish government school structural facilities and install dedicated gender-segregated sanitation blocks.',
  },
  mumbai: {
    baseRequests: 4820,
    highPriorityRatio: 0.125,
    issueWeights: [
      { category: 'Drainage', weight: 42 },
      { category: 'Roads', weight: 31 },
      { category: 'Water', weight: 14 },
      { category: 'Electricity', weight: 8 },
      { category: 'Sanitation', weight: 5 },
    ],
    recommendation: 'Desilt major stormwater outfalls and construct subterranean holding tanks in low-lying transit bottlenecks.',
  },
  delhi: {
    baseRequests: 5410,
    highPriorityRatio: 0.14,
    issueWeights: [
      { category: 'Drainage', weight: 38 },
      { category: 'Roads', weight: 29 },
      { category: 'Electricity', weight: 18 },
      { category: 'Water', weight: 10 },
      { category: 'Sanitation', weight: 5 },
    ],
    recommendation: 'Modernize stormwater drainage canals and revamp peripheral road lighting along freight transit loops.',
  },
  bengaluru: {
    baseRequests: 3670,
    highPriorityRatio: 0.13,
    issueWeights: [
      { category: 'Roads', weight: 43 },
      { category: 'Drainage', weight: 32 },
      { category: 'Water', weight: 15 },
      { category: 'Electricity', weight: 7 },
      { category: 'Health', weight: 3 },
    ],
    recommendation: 'Upgrade arterial junction drainage culverts and resurface high-density suburban tech corridor connectors.',
  },
  hyderabad: {
    baseRequests: 3210,
    highPriorityRatio: 0.12,
    issueWeights: [
      { category: 'Drainage', weight: 39 },
      { category: 'Roads', weight: 33 },
      { category: 'Water', weight: 16 },
      { category: 'Electricity', weight: 8 },
      { category: 'Health', weight: 4 },
    ],
    recommendation: 'Execute strategic nalas remodeling program to avert localized flash flooding during cloudburst spells.',
  },
  chennai: {
    baseRequests: 2890,
    highPriorityRatio: 0.14,
    issueWeights: [
      { category: 'Water', weight: 38 },
      { category: 'Drainage', weight: 34 },
      { category: 'Roads', weight: 17 },
      { category: 'Electricity', weight: 7 },
      { category: 'Sanitation', weight: 4 },
    ],
    recommendation: 'Expand desalination pipeline connectivity and clear estuarine stormwater flood gates before monsoons.',
  },
  kolkata: {
    baseRequests: 2150,
    highPriorityRatio: 0.16,
    issueWeights: [
      { category: 'Drainage', weight: 45 },
      { category: 'Roads', weight: 26 },
      { category: 'Water', weight: 16 },
      { category: 'Electricity', weight: 8 },
      { category: 'Health', weight: 5 },
    ],
    recommendation: 'Rehabilitate heritage drainage pumping stations and elevate low-lying transit carriageways.',
  },
  lucknow: {
    baseRequests: 1780,
    highPriorityRatio: 0.15,
    issueWeights: [
      { category: 'Roads', weight: 37 },
      { category: 'Water', weight: 31 },
      { category: 'Drainage', weight: 18 },
      { category: 'Electricity', weight: 9 },
      { category: 'Health', weight: 5 },
    ],
    recommendation: 'Expand municipal piped water network to peri-urban clusters and pave secondary transit roads.',
  },
  guwahati: {
    baseRequests: 1420,
    highPriorityRatio: 0.19,
    issueWeights: [
      { category: 'Drainage', weight: 51 },
      { category: 'Roads', weight: 24 },
      { category: 'Water', weight: 14 },
      { category: 'Health', weight: 7 },
      { category: 'Electricity', weight: 4 },
    ],
    recommendation: 'Reinforce riverbank embankment drainage and clear silt from natural hill streams traversing the city.',
  },
  patna: {
    baseRequests: 1890,
    highPriorityRatio: 0.17,
    issueWeights: [
      { category: 'Drainage', weight: 44 },
      { category: 'Roads', weight: 28 },
      { category: 'Water', weight: 16 },
      { category: 'Electricity', weight: 7 },
      { category: 'Health', weight: 5 },
    ],
    recommendation: 'Construct high-discharge sump wells and modern pumping stations to prevent urban water-logging.',
  },
};

/**
 * Computes aggregated demand hotspot data for a district, merging
 * baseline historical signal density with live incoming citizen requests.
 */
export function getCityDemandHotspot(
  district: District,
  liveRequests: CitizenRequest[]
): CityDemandHotspot {
  // Find live requests matching this district
  const matchedLive = liveRequests.filter(
    (r) => r.location.toLowerCase() === district.name.toLowerCase()
  );

  const baseline = BASELINE_DISTRICT_DEMAND[district.id.toLowerCase()] || {
    baseRequests: Math.round(district.population / 4500) + 600,
    highPriorityRatio: 0.14,
    issueWeights: [
      { category: 'Drainage', weight: 35 },
      { category: 'Water', weight: 30 },
      { category: 'Roads', weight: 20 },
      { category: 'Electricity', weight: 10 },
      { category: 'Education', weight: 5 },
    ],
    recommendation: `Prioritize municipal infrastructure upgrades and essential civic access in ${district.name}.`,
  };

  const totalRequests = baseline.baseRequests + matchedLive.length;
  const highPriorityLiveCount = matchedLive.filter((r) => r.severity >= 8).length;
  const totalHighPriority = Math.round(baseline.baseRequests * baseline.highPriorityRatio) + highPriorityLiveCount;

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

  // Normalize percentages to sum to roughly 100%
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

  let urgencyLevel: 'Critical' | 'High' | 'Moderate' | 'Low' = 'Moderate';
  if (totalHighPriority > 300 || primaryIssue.percentage >= 40) {
    urgencyLevel = 'Critical';
  } else if (totalHighPriority > 150 || primaryIssue.percentage >= 25) {
    urgencyLevel = 'High';
  } else if (totalHighPriority > 75) {
    urgencyLevel = 'Moderate';
  } else {
    urgencyLevel = 'Low';
  }

  return {
    districtId: district.id,
    cityName: district.name,
    state: district.state,
    zone: district.zone,
    lat: district.lat,
    lon: district.lon,
    totalCitizenRequests: totalRequests,
    highPriorityCount: totalHighPriority,
    primaryCategory: primaryIssue.category,
    primaryDot,
    primaryDotColor: primaryIssue.dotColor,
    primaryBadgeLabel: `${primaryDot} ${primaryIssue.category}`,
    topIssues,
    aiRecommendation: baseline.recommendation,
    urgencyLevel,
    population: district.population,
    povertyIndex: district.poverty_index,
  };
}
