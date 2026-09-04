export type CountryCode = 'IN' | 'BR' | 'ZA' | 'RU' | 'CN';

export interface AdminHierarchy {
  level1: string; // e.g. "Country"
  level2: string; // e.g. "State" / "Province"
  level3: string; // e.g. "District" / "Municipality"
  level4: string; // e.g. "City / Village" / "Ward" / "Bairro"
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flagEmoji: string;
}

export interface CountryConnector {
  id: string;
  name: string;
  category: 'demographics' | 'infrastructure' | 'investment' | 'voice' | 'governance';
  status: 'Connected' | 'Configured' | 'Available';
  provider: string;
  endpoint: string;
  lastSync: string;
  recordsCount: string;
}

export interface CountryConfig {
  code: CountryCode;
  name: string;
  flag: string;
  tagline: string;
  currencySymbol: string;
  currencyCode: string;
  currencyRateToInr: number; // For budget conversions
  hierarchy: AdminHierarchy;
  languages: LanguageOption[];
  connectors: CountryConnector[];
  coordinates: { lat: number; lng: number; zoom: number };
  sampleCities: string[];
  totalPopulation: string;
  signalCount: string;
  defaultCategories: string[];
}

export interface UniversalCivicSchema {
  requestId: string; // e.g. "CP-GLOBAL-9021"
  countryCode: CountryCode;
  region: string;
  location: string;
  category: string;
  problem: string;
  severity: number; // 1-10
  affectedPopulation: number;
  timestamp: string;
  evidenceType: 'Audio Voice' | 'Text SMS' | 'Photo Report' | 'WhatsApp';
  originalLanguage: string;
  originalText: string;
  canonicalEnglishText: string;
  infrastructureGapPct: number;
  priorityScore: number;
  status: RequestStatus;
}

export interface District {
  id: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
  population: number;
  poverty_index: number; // 0.0 to 1.0
  water_access: number; // 0 to 100
  health_access: number; // 0 to 100
  road_quality: number; // 0 to 100
  education_access: number; // 0 to 100
  planned_investment: number; // in local currency
  existing_facilities: {
    phc_clinics: number;
    water_plants: number;
    schools: number;
    paved_roads_km: number;
  };
  zone: string;
}

export type InfrastructureCategory = 
  | 'Drainage'
  | 'Roads' 
  | 'Water' 
  | 'Electricity' 
  | 'Healthcare' 
  | 'Health'
  | 'Sanitation' 
  | 'Education' 
  | 'Other';

export type AssetCondition = '🟢 Good' | '⚠️ Poor' | '⚠️ Damaged' | '🔴 Critical' | '❌ Non-functional';

export interface InfrastructureAsset {
  id: string;
  name: string; // e.g. "Primary Health Centre (PHC)", "Government High School", "Water Filtration Plant #3"
  category: InfrastructureCategory;
  districtId: string;
  districtName: string;
  location: string; // e.g. "Village Mangalagiri / Ward 12"
  capacity: string; // e.g. "30 beds", "500 students", "100,000 L", "8.5 km", "12 MVA Substation"
  condition: AssetCondition;
  utilizationPct: number; // e.g. 92, 115, 45, 98
  nearestFacilityDistanceKm?: number; // e.g. 18.2 km
  travelTimeMinutes?: number; // e.g. 45 min
  staffOrEquipmentStatus?: string; // e.g. "2 Medical Officers missing, 1 Oxygen Concentrator broken"
  coverageRadiusKm?: number;
  servedPopulation: number;
  lastInspectedDate?: string;
}

export interface InfrastructureAudit {
  assetName: string;
  assetCategory: InfrastructureCategory;
  location: string;
  capacity: string;
  condition: AssetCondition;
  utilizationPct: number;
  nearestFacilityDistanceKm?: number;
  travelTimeMinutes?: number;
  servedPopulation: number;
  auditFinding: string;
  interventionRationale: string;
  interventionType: InterventionType;
}

export type RequestStatus = 'Submitted' | 'Under Review' | 'Assigned' | 'Resolved' | 'Prioritized' | 'Funded' | 'Logged';

export interface DemographicGroupImpact {
  groupName: string; // e.g. "Students (Ages 5-18)", "Elderly Residents (60+)", "Women & Primary Caregivers", "Daily-Wage Workers"
  percentage: number; // e.g. 42
  impactNote: string; // e.g. "School attendance disrupted & delayed water collection"
  iconEmoji: string; // e.g. "🎒"
}

export interface DemographicProfile {
  ruralPct: number; // e.g. 62
  urbanPct: number; // e.g. 38
  affectedGroups: DemographicGroupImpact[];
  incomeTierBreakdown: {
    lowIncomePct: number; // e.g. 68
    middleIncomePct: number; // e.g. 26
    highIncomePct: number; // e.g. 6
  };
  vulnerabilityIndicators: {
    label: string;
    badgeColor: string;
  }[];
  equityAssessment: string; // e.g. "Disproportionately impacts 18 rural villages where 74% of households lack private vehicle access."
  piiProtectionNote?: string;
}

export interface AIAnalysisResult {
  category: string;
  problem: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affected_infrastructure: string;
  estimated_impact: 'Low' | 'Medium' | 'High' | 'Critical';
  recommended_action: string;
}

export interface CitizenRequest {
  id: string; // e.g. "CP-10482"
  timestamp: string;
  original_text: string;
  language: string;
  category: InfrastructureCategory;
  issue_title?: string; // e.g. "Street Lighting"
  location: string; // e.g. "Vijayawada"
  severity: number; // 1 to 10
  priority_tier?: 'Low' | 'Medium' | 'High' | 'Critical';
  summary_en: string;
  urgency_reasoning?: string;
  affected_group?: string;
  audio_url?: string;
  source_type: 'voice' | 'text' | 'sample';
  status: RequestStatus;

  // AI Analysis (Feature 2)
  problem?: string;
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affected_infrastructure?: string;
  estimated_impact?: 'Low' | 'Medium' | 'High' | 'Critical';
  recommended_action?: string;
  ai_analysis?: AIAnalysisResult;
}

export interface ScoreBreakdown {
  demand_score: number;
  gap_score: number;
  sev_score: number;
  vuln_score: number;
  align_score: number;
  total_score: number;
  demand_count: number;
  current_access: number;
  gap_percentage: number;
  weights: {
    demand: number;
    gap: number;
    severity: number;
    vulnerability: number;
    alignment: number;
  };
}

export interface PriorityFactorDetail {
  factorName: 'Citizen Demand' | 'Infrastructure Gap' | 'Population Impact' | 'Urgency' | 'Government Priority';
  score: number; // 0-100 scale
  weight: number; // e.g. 0.30
  weightedScore: number; // score * weight
  bulletText: string; // e.g. "2,481 citizen requests"
  metricValue: string; // e.g. "2,481 signals"
  description: string; // e.g. "Multilingual voice & text complaint clustering from Ward 12 & 14"
  badgeColor: string;
}

export type InterventionType = 'BUILD' | 'FIX' | 'UPGRADE' | 'POLICY';

export interface ActionQueueItem {
  id: string;
  recommendationId: string;
  title: string;
  districtName: string;
  districtId: string;
  category: InfrastructureCategory;
  interventionType: InterventionType;
  priorityScore: number;
  status: 'Shortlisted' | 'Under Review' | 'Approved' | 'In Progress' | 'Completed';
  addedAt: string;
  estimatedBudgetInr: number;
  targetBeneficiaries: number;
}

export interface RecommendedProject {
  id: string;
  rank: number;
  medal: string; // "🥇 1", "🥈 2", "🥉 3", "#4", etc.
  title: string;
  category: InfrastructureCategory;
  interventionType: InterventionType;
  districtName: string;
  districtId: string;
  state: string;
  priorityScore: number; // e.g. 94
  priorityTier: 'Critical' | 'High' | 'Moderate' | 'Stable';
  citizenRequestsCount: number;
  affectedAreasCount: number;
  vulnerabilityLabel: 'CRITICAL' | 'HIGH' | 'MODERATE';
  confidencePct: number;
  expectedReach: number;
  urgencyLabel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  summaryReasoning: string;
  factors: {
    citizenDemand: PriorityFactorDetail;
    infrastructureGap: PriorityFactorDetail;
    populationImpact: PriorityFactorDetail;
    urgency: PriorityFactorDetail;
    governmentPriority: PriorityFactorDetail;
  };
  keyBulletPoints: string[]; // ["2,481 citizen requests", "+ High population density", "+ Poor infrastructure index", "+ Frequent flooding reports", "+ Existing investment gap"]
  aiRecommendation: string;
  estimatedBudgetInr: number;
  targetBeneficiaries: number;
  timelineMonths: number;
  // Evidence metrics for official credibility
  evidenceSignals: {
    totalRequests: number;
    topicMentionPct: number;
    urgentRequestsCount: number;
  };
  evidenceInfrastructure: {
    underservedAreasCount: number;
    existingFacilitiesCount: number;
    nonFunctionalFacilitiesCount: number;
  };
  // Expected impact preview metrics
  expectedImpact: {
    accessIncreasePct: number;
    coverageIncreasePct: number;
    demandReductionPct: number;
  };
  // Demographic & equity breakdown ("Who is Affected?")
  demographics?: DemographicProfile;
  // Infrastructure Data Audit ("What exists? What condition/capacity?")
  infrastructureAudit?: InfrastructureAudit;
  infrastructureAssetsList?: InfrastructureAsset[];
  // Investment & Government Plan Data Audit ("What has been planned & spent?")
  investmentAudit?: InvestmentAuditSummary;
}

export interface PolicyBrief {
  id: string;
  district: string;
  category: InfrastructureCategory;
  timestamp: string;
  priority_score: number;
  demand_count: number;
  current_access: number;
  population: number;
  poverty_index: number;
  brief_text: string;
}

export type ProjectLifecycleStatus = 'Recommended' | 'Approved' | 'In Progress' | 'Completed';

export interface ProjectHistoryEntry {
  status: ProjectLifecycleStatus;
  timestamp: string;
  note: string;
  actor: string;
}

export interface GovernmentProject {
  id: string;
  title: string;
  district: string;
  districtId: string;
  state: string;
  category: InfrastructureCategory;
  priorityScore: number;
  citizenRequestsCount: number;
  population: number;
  estimatedCostInr: number;
  status: ProjectLifecycleStatus;
  progress: number; // 0 to 100
  department: string;
  officerInCharge: string;
  startDate: string;
  targetDate: string;
  completedDate?: string;
  beforeAccess: number;
  afterAccess: number;
  description: string;
  keyReasoning: string[];
  aiSummary: string;
  sourceRecommendationId?: string;
  history: ProjectHistoryEntry[];
}

export interface ImpactProject {
  id: string;
  district: string;
  category: InfrastructureCategory;
  title: string;
  investment_inr: number;
  before_access: number;
  after_access: number;
  before_requests: number;
  after_requests: number;
  before_score: number;
  after_score: number;
  population_benefited: number;
  completion_date: string;
  status: 'Completed' | 'In Progress' | 'Proposed';
}

// ==========================================
// INVESTMENT & GOVERNMENT PLAN DATA TYPES
// ==========================================

export type InvestmentQuadrantType = 
  | 'RED_HIGH_NEED_LOW_INVESTMENT'      // 🔴 High Need + Low Investment (Severe Gap)
  | 'YELLOW_HIGH_INVESTMENT_POOR_OUTCOME'// 🟡 High Investment + Poor Outcomes (Audit / Fix Required)
  | 'GREEN_HIGH_NEED_ADEQUATE_INVESTMENT'// 🟢 High Need + Adequate Investment (On Track / Monitor)
  | 'GREY_LOW_NEED_LOW_INVESTMENT';      // ⚪ Low Need + Low Investment (Baseline)

export type AnomalySignalType = 
  | 'HIGH_SPENT_LOW_COMPLETION'        // ₹39 Cr spent but only 40% completed
  | 'PROJECT_DELAYS_OVERRUNS'          // Repeated timelines extended
  | 'UNUTILIZED_FUNDS'                 // Large allocated balance unreleased/unspent
  | 'HIGH_COMPLAINTS_POST_COMPLETION'  // Project completed but complaints surged
  | 'FUNDING_MISMATCH'                 // High demand area receives minimal allocation
  | 'DUPLICATE_SCHEME_OVERLAP';        // Multiple schemes targeting same sector

export interface InvestmentAnomalySignal {
  id: string;
  title: string;
  type: AnomalySignalType;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  districtId: string;
  districtName: string;
  department: string;
  schemeName: string;
  allocatedInr: number;
  spentInr: number;
  unspentInr: number;
  projectsCount: number;
  completedCount: number;
  delayedCount: number;
  citizenComplaintsCount: number;
  outcomeTrend: string; // e.g. "Road complaints increased +31% despite ₹20 Cr expenditure"
  aiInvestigationNote: string;
  recommendedActionType: InterventionType;
}

export interface InvestmentSchemeData {
  schemeId: string;
  schemeName: string; // e.g. "Jal Jeevan Mission (JJM)", "Pradhan Mantri Gram Sadak Yojana (PMGSY)"
  department: string;
  category: InfrastructureCategory;
  stateAllocationInr: number;
  releasedInr: number;
  spentInr: number;
  remainingInr: number;
  utilizationPct: number; // e.g. 78%
  totalProjects: number;
  completedProjects: number;
  delayedProjects: number;
  pendingProjects: number;
  citizenComplaintsCount: number;
  quadrant: InvestmentQuadrantType;
  primaryAnomaly?: InvestmentAnomalySignal;
}

export interface InvestmentAuditSummary {
  schemeName: string;
  department: string;
  allocatedInr: number;
  releasedInr: number;
  spentInr: number;
  unutilizedInr: number;
  totalProjects: number;
  completedProjects: number;
  delayedProjects: number;
  citizenComplaints: number;
  auditFinding: string;
  investmentGapRationale: string;
  quadrant: InvestmentQuadrantType;
}

