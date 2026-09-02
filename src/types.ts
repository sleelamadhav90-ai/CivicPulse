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

export type RequestStatus = 'Submitted' | 'Under Review' | 'Assigned' | 'Resolved' | 'Prioritized' | 'Funded' | 'Logged';

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
  status: 'Shortlisted' | 'Under Review' | 'Approved';
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
