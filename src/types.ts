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
  planned_investment: number; // in INR (e.g. 5000000 = 50 Lakhs)
  existing_facilities: {
    phc_clinics: number;
    water_plants: number;
    schools: number;
    paved_roads_km: number;
  };
  zone: 'South' | 'West' | 'North' | 'East' | 'Central';
}

export type InfrastructureCategory = 'Water' | 'Health' | 'Roads' | 'Education' | 'Electricity';

export interface CitizenRequest {
  id: string;
  timestamp: string;
  original_text: string;
  language: string;
  category: InfrastructureCategory;
  location: string; // Normalized district name
  severity: number; // 1 to 10
  summary_en: string;
  urgency_reasoning?: string;
  affected_group?: string;
  audio_url?: string;
  source_type: 'voice' | 'text' | 'sample';
  status: 'Logged' | 'Under Review' | 'Prioritized' | 'Funded' | 'Resolved';
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
