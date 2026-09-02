import React, { useState, useMemo } from 'react';
import { 
  Cpu, 
  Sparkles, 
  TrendingUp, 
  MapPin, 
  AlertTriangle, 
  Layers, 
  RotateCcw, 
  ArrowRight, 
  X, 
  Search, 
  Compass, 
  BarChart3, 
  CheckCircle2, 
  Zap, 
  Droplet, 
  Route, 
  HeartPulse, 
  GraduationCap, 
  Building2, 
  Flame, 
  Filter, 
  ShieldAlert, 
  Activity, 
  FileText,
  Link2,
  Users,
  GitMerge,
  Split,
  Check,
  MessageSquare,
  Mic,
  Camera,
  Globe,
  Radio,
  ChevronRight,
  HelpCircle,
  FolderTree,
  ShieldCheck,
  DollarSign
} from 'lucide-react';
import { District, CitizenRequest, InfrastructureCategory, DemographicProfile, InfrastructureAudit, InvestmentAuditSummary } from '../types';
import { getInvestmentAuditByCategory } from '../data/investmentData';

export type PatternCategory = 'ALL' | 'Emerging' | 'Trend' | 'Cluster' | 'Cross-Domain' | 'Anomaly' | 'Recurring';

export interface PatternItem {
  id: string;
  title: string;
  type: 'Emerging' | 'Trend' | 'Cluster' | 'Cross-Domain' | 'Anomaly' | 'Recurring';
  priorityLabel: 'CRITICAL' | 'HIGH' | 'MODERATE';
  districtName: string;
  districtId: string;
  state: string;
  category: InfrastructureCategory;
  summary: string;
  metrics: {
    changePct?: string;
    affectedVillagesCount: number;
    nearbyFailuresCount?: number;
    citizenSignalsCount: number;
    confidencePct: number;
    timeframe: string;
    baselineRate?: string;
    currentRate?: string;
  };
  details: {
    what: string;
    where: string;
    whoIsAffected: string;
    whatItIndicates: string;
  };
  monthlyTrendData?: { month: string; count: number }[];
  crossDomainPair?: { primary: string; secondary: string; correlation: string };
  recommendedAction: string;
}

export interface CommunityIssueCluster {
  id: string;
  code: string; // e.g. #CP-1042
  title: string;
  category: InfrastructureCategory;
  requestCount: number;
  villagesCount: number;
  languagesCount: number;
  monthlyChangePct: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MODERATE';
  urgencyColor: string;
  timeframe: string;
  sources: {
    voicePct: number;
    textPct: number;
    photoPct: number;
  };
  aiSubClustering: {
    label: string;
    count: number;
    percentage: number;
  }[];
  geographicVillages: {
    villageName: string;
    requestCount: number;
  }[];
  geographicHotspotSummary: {
    title: string;
    coreRequestsCount: number;
    villagesCount: number;
    affectedPopulation: string;
  };
  evidenceRequests: {
    id: string;
    originalText: string;
    language: string;
    sourceType: '🎙️ Voice' | '💬 Text' | '📷 Photo';
    location: string;
    matchedSubCategory: string;
  }[];
  isVerifiedByOfficial?: boolean;
  mergedWith?: string[];
  splitFrom?: string;
  demographics?: DemographicProfile;
  infrastructureAudit?: InfrastructureAudit;
  investmentAudit?: InvestmentAuditSummary;
}

interface PatternIntelligenceProps {
  districts: District[];
  requests: CitizenRequest[];
  onNavigateToMap: () => void;
  onNavigateToRecommendations: () => void;
  onNavigateToPolicyLab: (districtId: string, category: InfrastructureCategory) => void;
}

export const PatternIntelligence: React.FC<PatternIntelligenceProps> = ({
  districts,
  requests,
  onNavigateToMap,
  onNavigateToRecommendations,
  onNavigateToPolicyLab,
}) => {
  // Top View Switcher: Aggregation Portal vs Advanced Pattern Feed
  const [activeViewMode, setActiveViewMode] = useState<'aggregation' | 'patterns'>('aggregation');

  // Filter & Search for Pattern Feed
  const [activeFilter, setActiveFilter] = useState<PatternCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPatternModal, setSelectedPatternModal] = useState<PatternItem | null>(null);

  // Selected Cluster Modal Inspection View
  const [selectedCluster, setSelectedCluster] = useState<CommunityIssueCluster | null>(null);

  // Human-in-the-Loop Merge/Split Interactivity State
  const [clustersList, setClustersList] = useState<CommunityIssueCluster[]>([
    {
      id: 'cluster-water',
      code: '#CP-1042',
      title: 'Water Supply Disruption',
      category: 'Water',
      requestCount: 1842,
      villagesCount: 12,
      languagesCount: 8,
      monthlyChangePct: '+43%',
      urgency: 'CRITICAL',
      urgencyColor: 'bg-rose-600 text-white',
      timeframe: 'Last 30 days',
      sources: { voicePct: 61, textPct: 31, photoPct: 8 },
      aiSubClustering: [
        { label: 'Water unavailable', count: 742, percentage: 40.3 },
        { label: 'Irregular supply', count: 483, percentage: 26.2 },
        { label: 'Pipeline problems', count: 361, percentage: 19.6 },
        { label: 'Contaminated water', count: 156, percentage: 8.5 },
        { label: 'Other related signals', count: 100, percentage: 5.4 },
      ],
      geographicVillages: [
        { villageName: 'Village A (Ramanagaram)', requestCount: 82 },
        { villageName: 'Village B (Kankipadu)', requestCount: 67 },
        { villageName: 'Village C (Penamaluru)', requestCount: 54 },
        { villageName: 'Village D (Gannavaram)', requestCount: 51 },
        { villageName: 'Village E (Pedaparupudi)', requestCount: 46 },
      ],
      geographicHotspotSummary: {
        title: 'WATER SHORTAGE HOTSPOT',
        coreRequestsCount: 300,
        villagesCount: 5,
        affectedPopulation: '18,400 residents',
      },
      evidenceRequests: [
        { id: 'REQ-001', originalText: "There's no drinking water in our village.", language: 'English', sourceType: '🎙️ Voice', location: 'Ramanagaram', matchedSubCategory: 'Water unavailable' },
        { id: 'REQ-002', originalText: "Water hasn't come for 5 days.", language: 'English', sourceType: '💬 Text', location: 'Kankipadu', matchedSubCategory: 'Water unavailable' },
        { id: 'REQ-003', originalText: "Pipeline near the school is broken.", language: 'English', sourceType: '📷 Photo', location: 'Penamaluru', matchedSubCategory: 'Pipeline problems' },
        { id: 'REQ-004', originalText: "குடிநீர் வரவில்லை, பைப்லைன் உடைந்துவிட்டது.", language: 'Tamil (தமிழ்)', sourceType: '💬 Text', location: 'Gannavaram', matchedSubCategory: 'Water unavailable' },
        { id: 'REQ-005', originalText: "हमारे गांव में पानी की समस्या है, 5 दिन से पानी नहीं आया।", language: 'Hindi (हिंदी)', sourceType: '🎙️ Voice', location: 'Pedaparupudi', matchedSubCategory: 'Water unavailable' },
        { id: 'REQ-006', originalText: "మా గ్రామంలో రెండు వారాలుగా మంచినీటి సరఫరా నిలిచిపోయింది.", language: 'Telugu (తెలుగు)', sourceType: '🎙️ Voice', location: 'Ramanagaram', matchedSubCategory: 'Water unavailable' },
        { id: 'REQ-007', originalText: "Water supply is irregular near primary school.", language: 'English', sourceType: '💬 Text', location: 'Kankipadu', matchedSubCategory: 'Irregular supply' },
      ],
      isVerifiedByOfficial: false,
      demographics: {
        ruralPct: 72,
        urbanPct: 28,
        affectedGroups: [
          { groupName: 'Women & Primary Caregivers', percentage: 46, impactNote: 'Spend 2.5 hrs/day fetching drinking water from distant pumps', iconEmoji: '👩' },
          { groupName: 'Children & Students', percentage: 31, impactNote: 'School attendance drops due to waterborne illnesses', iconEmoji: '🎒' },
          { groupName: 'Elderly Residents (60+)', percentage: 23, impactNote: 'High physical strain carrying heavy water containers', iconEmoji: '👵' },
        ],
        incomeTierBreakdown: { lowIncomePct: 74, middleIncomePct: 22, highIncomePct: 4 },
        vulnerabilityIndicators: [
          { label: 'High Rural Poverty (74% BPL)', badgeColor: 'bg-rose-100 text-rose-800 border-rose-300' },
          { label: 'Severe Ground Salinity', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300' },
        ],
        equityAssessment: 'Disproportionately impacts 12 rural villages where 78% of households lack indoor piped water.',
        piiProtectionNote: 'Aggregated population-level equity metrics (PII Compliant).'
      }
    },
    {
      id: 'cluster-roads',
      code: '#CP-1088',
      title: 'Road Conditions & Pothole Damage',
      category: 'Roads',
      requestCount: 923,
      villagesCount: 8,
      languagesCount: 6,
      monthlyChangePct: '+21%',
      urgency: 'HIGH',
      urgencyColor: 'bg-amber-600 text-white',
      timeframe: 'Last 30 days',
      sources: { voicePct: 45, textPct: 38, photoPct: 17 },
      aiSubClustering: [
        { label: 'Severe Potholes', count: 412, percentage: 44.6 },
        { label: 'Missing Asphalt Layer', count: 280, percentage: 30.3 },
        { label: 'Bridge Approach Damage', count: 141, percentage: 15.3 },
        { label: 'Washed-out Shoulder', count: 90, percentage: 9.8 },
      ],
      geographicVillages: [
        { villageName: 'Corridor Alpha (Guntur West)', requestCount: 120 },
        { villageName: 'Corridor Beta (Mangalagiri)', requestCount: 98 },
        { villageName: 'Corridor Gamma (Tadepalle)', requestCount: 75 },
        { villageName: 'Corridor Delta (Tenali Road)', requestCount: 62 },
      ],
      geographicHotspotSummary: {
        title: 'ARTERIAL ROAD DETERIORATION HOTSPOT',
        coreRequestsCount: 355,
        villagesCount: 4,
        affectedPopulation: '22,000 residents & freight commuters',
      },
      evidenceRequests: [
        { id: 'REQ-101', originalText: "Road romba damage aagiduchu, school pakkam potholes irukku.", language: 'Tanglish', sourceType: '💬 Text', location: 'Guntur West', matchedSubCategory: 'Severe Potholes' },
        { id: 'REQ-102', originalText: "Big craters on hospital transit road causing ambulance delays.", language: 'English', sourceType: '📷 Photo', location: 'Mangalagiri', matchedSubCategory: 'Missing Asphalt Layer' },
        { id: 'REQ-103', originalText: "రోడ్డు చాలా అధ్వానంగా ఉంది, వాహనాలు వెళ్ళలేవు.", language: 'Telugu (తెలుగు)', sourceType: '🎙️ Voice', location: 'Tadepalle', matchedSubCategory: 'Severe Potholes' },
      ],
      isVerifiedByOfficial: false,
      demographics: {
        ruralPct: 62,
        urbanPct: 38,
        affectedGroups: [
          { groupName: 'Students & Bus Commuters', percentage: 42, impactNote: 'Missed school buses & unsafe bicycle travel through craters', iconEmoji: '🎒' },
          { groupName: 'Daily-Wage Workers & Farmers', percentage: 35, impactNote: 'Agricultural crop spoilage during transit delays', iconEmoji: '🌾' },
          { groupName: 'Elderly Patients & Ambulances', percentage: 23, impactNote: '2.4x delay in emergency medical transit to district hospital', iconEmoji: '🚑' },
        ],
        incomeTierBreakdown: { lowIncomePct: 68, middleIncomePct: 26, highIncomePct: 6 },
        vulnerabilityIndicators: [
          { label: 'Public Transit Dependent', badgeColor: 'bg-blue-100 text-blue-800 border-blue-300' },
          { label: 'Single Transit Corridor', badgeColor: 'bg-purple-100 text-purple-800 border-purple-300' },
        ],
        equityAssessment: 'High impact on students and elderly residents relying on public buses across 8 underserved villages.',
        piiProtectionNote: 'Aggregated population-level equity metrics (PII Compliant).'
      }
    },
    {
      id: 'cluster-healthcare',
      code: '#CP-1104',
      title: 'Healthcare Facility Access & Supply',
      category: 'Healthcare',
      requestCount: 612,
      villagesCount: 6,
      languagesCount: 5,
      monthlyChangePct: '+14%',
      urgency: 'HIGH',
      urgencyColor: 'bg-[#D65A3A] text-white',
      timeframe: 'Last 30 days',
      sources: { voicePct: 70, textPct: 22, photoPct: 8 },
      aiSubClustering: [
        { label: 'Essential Medicine Stockout', count: 240, percentage: 39.2 },
        { label: 'Medical Staff Absence', count: 185, percentage: 30.2 },
        { label: 'Diagnostic Equipment Failure', count: 110, percentage: 18.0 },
        { label: 'Ambulance Response Delay', count: 77, percentage: 12.6 },
      ],
      geographicVillages: [
        { villageName: 'PHC Block 1 (Vijayawada Rural)', requestCount: 110 },
        { villageName: 'PHC Block 2 (Mylavaram)', requestCount: 88 },
        { villageName: 'PHC Block 3 (Ibrahimpatnam)', requestCount: 64 },
      ],
      geographicHotspotSummary: {
        title: 'PRIMARY HEALTH CARE DEFICIT HOTSPOT',
        coreRequestsCount: 262,
        villagesCount: 3,
        affectedPopulation: '14,500 rural patients',
      },
      evidenceRequests: [
        { id: 'REQ-201', originalText: "No doctor available at PHC since Monday.", language: 'English', sourceType: '🎙️ Voice', location: 'Vijayawada Rural', matchedSubCategory: 'Medical Staff Absence' },
        { id: 'REQ-202', originalText: "PHC में दवाइयां नहीं हैं, बाहर से खरीदनी पड़ रही हैं।", language: 'Hindi (हिंदी)', sourceType: '💬 Text', location: 'Mylavaram', matchedSubCategory: 'Essential Medicine Stockout' },
      ],
      isVerifiedByOfficial: false,
      demographics: {
        ruralPct: 80,
        urbanPct: 20,
        affectedGroups: [
          { groupName: 'Maternal & Infant Patients', percentage: 38, impactNote: 'Stockout of essential prenatal supplements & pediatric vaccines', iconEmoji: '👶' },
          { groupName: 'Elderly Chronic Patients', percentage: 34, impactNote: 'Unable to secure monthly diabetes & hypertension medication', iconEmoji: '👵' },
          { groupName: 'Agricultural Laborers', percentage: 28, impactNote: 'Untreated occupational injuries due to PHC doctor absence', iconEmoji: '👨‍🌾' },
        ],
        incomeTierBreakdown: { lowIncomePct: 82, middleIncomePct: 15, highIncomePct: 3 },
        vulnerabilityIndicators: [
          { label: 'Zero Private Care Access', badgeColor: 'bg-rose-100 text-rose-800 border-rose-300' },
          { label: 'High BPL Concentration (82%)', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300' },
        ],
        equityAssessment: 'Critical healthcare deficit in low-income rural blocks where 82% rely exclusively on public primary health centers.',
        piiProtectionNote: 'Aggregated population-level equity metrics (PII Compliant).'
      }
    },
    {
      id: 'cluster-[#04]',
      code: '#CP-1132',
      title: 'Agricultural Electricity Grid Spikes',
      category: 'Electricity',
      requestCount: 480,
      villagesCount: 5,
      languagesCount: 4,
      monthlyChangePct: '+18%',
      urgency: 'MODERATE',
      urgencyColor: 'bg-amber-500 text-black',
      timeframe: 'Last 30 days',
      sources: { voicePct: 55, textPct: 40, photoPct: 5 },
      aiSubClustering: [
        { label: 'Low Voltage & Voltage Spikes', count: 210, percentage: 43.8 },
        { label: 'Transformer Coil Burnout', count: 160, percentage: 33.3 },
        { label: 'Unannounced Feeder Outages', count: 110, percentage: 22.9 },
      ],
      geographicVillages: [
        { villageName: 'Farming Sector North', requestCount: 95 },
        { villageName: 'Farming Sector East', requestCount: 82 },
      ],
      geographicHotspotSummary: {
        title: 'AGRICULTURAL POWER FEEDER HOTSPOT',
        coreRequestsCount: 177,
        villagesCount: 2,
        affectedPopulation: '9,200 farming households',
      },
      evidenceRequests: [
        { id: 'REQ-301', originalText: "Voltage fluctuating continuously, pump motors getting burnt.", language: 'English', sourceType: '🎙️ Voice', location: 'Farming Sector North', matchedSubCategory: 'Low Voltage & Voltage Spikes' },
      ],
      isVerifiedByOfficial: false,
      demographics: {
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
          { label: 'Agricultural Voltage Spike Hazard', badgeColor: 'bg-purple-100 text-purple-800 border-purple-300' },
        ],
        equityAssessment: 'High agricultural impact on smallholder farmers suffering pump motor burnouts.',
        piiProtectionNote: 'Aggregated population-level equity metrics (PII Compliant).'
      }
    },
    {
      id: 'cluster-[#05]',
      code: '#CP-1150',
      title: 'Urban Drainage & Waste Stagnation',
      category: 'Drainage',
      requestCount: 310,
      villagesCount: 4,
      languagesCount: 4,
      monthlyChangePct: '+29%',
      urgency: 'HIGH',
      urgencyColor: 'bg-[#D65A3A] text-white',
      timeframe: 'Last 30 days',
      sources: { voicePct: 40, textPct: 50, photoPct: 10 },
      aiSubClustering: [
        { label: 'Stormwater Drain Blockage', count: 140, percentage: 45.2 },
        { label: 'Overflowing Municipal Dumps', count: 110, percentage: 35.5 },
        { label: 'Stagnant Sewage Overflow', count: 60, percentage: 19.3 },
      ],
      geographicVillages: [
        { villageName: 'Municipal Ward 4', requestCount: 78 },
        { villageName: 'Municipal Ward 7', requestCount: 62 },
      ],
      geographicHotspotSummary: {
        title: 'STORM DRAIN OVERFLOW HOTSPOT',
        coreRequestsCount: 140,
        villagesCount: 2,
        affectedPopulation: '12,800 urban residents',
      },
      evidenceRequests: [
        { id: 'REQ-401', originalText: "Drain blocked near market, stink and mosquito breeding.", language: 'English', sourceType: '📷 Photo', location: 'Municipal Ward 4', matchedSubCategory: 'Stormwater Drain Blockage' },
      ],
      isVerifiedByOfficial: false,
      demographics: {
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
        equityAssessment: 'Concentrated in dense low-income urban wards lacking automated stormwater outfalls.',
        piiProtectionNote: 'Aggregated population-level equity metrics (PII Compliant).'
      }
    }
  ]);

  // Action: Merge Sub-issues
  const handleMergeSubIssues = (clusterId: string) => {
    setClustersList((prev) =>
      prev.map((c) => {
        if (c.id === clusterId) {
          return {
            ...c,
            aiSubClustering: [
              { label: 'Unified Water Supply Interruption (Merged)', count: 1225, percentage: 66.5 },
              { label: 'Pipeline Infrastructure Damage', count: 361, percentage: 19.6 },
              { label: 'Contaminated Water Quality', count: 156, percentage: 8.5 },
              { label: 'Other related signals', count: 100, percentage: 5.4 },
            ],
            mergedWith: ['Irregular supply merged into Water unavailable']
          };
        }
        return c;
      })
    );
    if (selectedCluster && selectedCluster.id === clusterId) {
      setSelectedCluster((prev) => prev ? {
        ...prev,
        aiSubClustering: [
          { label: 'Unified Water Supply Interruption (Merged)', count: 1225, percentage: 66.5 },
          { label: 'Pipeline Infrastructure Damage', count: 361, percentage: 19.6 },
          { label: 'Contaminated Water Quality', count: 156, percentage: 8.5 },
          { label: 'Other related signals', count: 100, percentage: 5.4 },
        ],
        mergedWith: ['Irregular supply merged into Water unavailable']
      } : null);
    }
  };

  // Action: Split Sub-issue
  const handleSplitSubIssue = (clusterId: string) => {
    setClustersList((prev) =>
      prev.map((c) => {
        if (c.id === clusterId) {
          return {
            ...c,
            aiSubClustering: c.aiSubClustering.filter(s => s.label !== 'Contaminated water'),
            splitFrom: 'Contaminated Water split into dedicated Environmental Health Ticket #CP-901'
          };
        }
        return c;
      })
    );
    if (selectedCluster && selectedCluster.id === clusterId) {
      setSelectedCluster((prev) => prev ? {
        ...prev,
        aiSubClustering: prev.aiSubClustering.filter(s => s.label !== 'Contaminated water'),
        splitFrom: 'Contaminated Water split into dedicated Environmental Health Ticket #CP-901'
      } : null);
    }
  };

  // Action: Verify Cluster
  const handleVerifyCluster = (clusterId: string) => {
    setClustersList((prev) =>
      prev.map((c) => (c.id === clusterId ? { ...c, isVerifiedByOfficial: true } : c))
    );
    if (selectedCluster && selectedCluster.id === clusterId) {
      setSelectedCluster((prev) => prev ? { ...prev, isVerifiedByOfficial: true } : null);
    }
  };

  const mainDistrict = districts[0] || { name: 'Primary District', id: 'dist-01', state: 'State Region', population: 2400000 };
  const secondDistrict = districts[1] || { name: 'Secondary District', id: 'dist-02', state: 'State Region', population: 1800000 };
  const thirdDistrict = districts[2] || { name: 'Tertiary District', id: 'dist-03', state: 'State Region', population: 1200000 };

  // Patterns list
  const detectedPatterns: PatternItem[] = useMemo(() => {
    return [
      {
        id: 'pat-01',
        title: `Water Complaint Surge in Rural ${mainDistrict.name}`,
        type: 'Emerging',
        priorityLabel: 'CRITICAL',
        districtName: mainDistrict.name,
        districtId: mainDistrict.id,
        state: mainDistrict.state,
        category: 'Water',
        summary: `Water complaints are clustering around 12 villages in ${mainDistrict.name} district following a pipeline pressure breakdown.`,
        metrics: {
          changePct: '+43%',
          affectedVillagesCount: 12,
          nearbyFailuresCount: 3,
          citizenSignalsCount: 1842,
          confidencePct: 91,
          timeframe: 'Last 30 Days',
          baselineRate: '120 req/wk',
          currentRate: '420 req/wk',
        },
        details: {
          what: 'Unfiltered ground turbidity and broken distribution valves causing acute water supply interruption.',
          where: `12 contiguous rural villages in northern ${mainDistrict.name} within a 15 km radius.`,
          whoIsAffected: '42,000 rural residents, 14 local primary schools, and 3 rural health clinics.',
          whatItIndicates: 'Rapid structural deterioration of the 15-year-old rural water pipeline trunk.',
        },
        monthlyTrendData: [
          { month: 'Apr', count: 110 },
          { month: 'May', count: 135 },
          { month: 'Jun', count: 190 },
          { month: 'Jul', count: 320 },
          { month: 'Aug', count: 680 },
          { month: 'Sep', count: 1842 },
        ],
        recommendedAction: 'Prioritize expansion & trunk pipe replacement across 12 identified villages (BUILD / UPGRADE intervention).',
      },
      {
        id: 'pat-02',
        title: `Cross-Domain Link: Poor Road Transit & Missed Healthcare Access`,
        type: 'Cross-Domain',
        priorityLabel: 'HIGH',
        districtName: secondDistrict.name,
        districtId: secondDistrict.id,
        state: secondDistrict.state,
        category: 'Healthcare',
        summary: `Villages with severe road pothole damage correlate with 2.4× higher missed emergency healthcare complaints.`,
        metrics: {
          changePct: '+2.4x Correlation',
          affectedVillagesCount: 18,
          nearbyFailuresCount: 5,
          citizenSignalsCount: 2310,
          confidencePct: 88,
          timeframe: 'Last 60 Days',
        },
        details: {
          what: 'Citizen complaints reveal emergency ambulances cannot reach rural health posts due to washed-out road corridors.',
          where: `Eastern rural block of ${secondDistrict.name} connecting to Regional Hospital.`,
          whoIsAffected: '56,000 citizens needing maternal and urgent trauma care transport.',
          whatItIndicates: 'Healthcare access issues in this zone are driven primarily by transit infrastructure deficits rather than clinic staffing shortages.',
        },
        crossDomainPair: {
          primary: 'Road Connectivity Deficit (78%)',
          secondary: 'Emergency Healthcare Delays (84%)',
          correlation: '0.86 Strong Positive Correlation',
        },
        recommendedAction: 'Repair critical 18 km hospital access road before expanding local hospital ward bed capacity (FIX intervention).',
      },
      {
        id: 'pat-03',
        title: `Sudden Waste Management Anomaly in ${thirdDistrict.name} Urban Center`,
        type: 'Anomaly',
        priorityLabel: 'CRITICAL',
        districtName: thirdDistrict.name,
        districtId: thirdDistrict.id,
        state: thirdDistrict.state,
        category: 'Drainage',
        summary: `Solid waste complaints surged +332% over 14 days following municipal contractor collection route changes.`,
        metrics: {
          changePct: '+332%',
          affectedVillagesCount: 8,
          nearbyFailuresCount: 2,
          citizenSignalsCount: 1240,
          confidencePct: 94,
          timeframe: 'Last 14 Days',
          baselineRate: '40 req/wk',
          currentRate: '173 req/wk',
        },
        details: {
          what: 'Uncollected refuse overflowing into primary stormwater drains causing localized flash flooding.',
          where: `Wards 4, 7, and 12 of ${thirdDistrict.name} Municipal Sector.`,
          whoIsAffected: '31,000 urban households and commercial market vendors.',
          whatItIndicates: 'Abrupt operational failure in outsourced municipal refuse collection contract.',
        },
        recommendedAction: 'Deploy emergency municipal sanitation trucks and review contractor SLA compliance (POLICY intervention).',
      },
    ];
  }, [mainDistrict, secondDistrict, thirdDistrict]);

  const filteredPatterns = useMemo(() => {
    return detectedPatterns.filter((pat) => {
      const matchFilter = activeFilter === 'ALL' || pat.type === activeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        pat.title.toLowerCase().includes(q) ||
        pat.summary.toLowerCase().includes(q) ||
        pat.districtName.toLowerCase().includes(q) ||
        pat.category.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [detectedPatterns, activeFilter, searchQuery]);

  const getCategoryIcon = (cat: InfrastructureCategory) => {
    switch (cat) {
      case 'Water': return <Droplet className="w-4 h-4 text-blue-600" />;
      case 'Roads': return <Route className="w-4 h-4 text-amber-600" />;
      case 'Drainage': return <Activity className="w-4 h-4 text-cyan-600" />;
      case 'Electricity': return <Zap className="w-4 h-4 text-yellow-600" />;
      case 'Healthcare':
      case 'Health': return <HeartPulse className="w-4 h-4 text-rose-600" />;
      case 'Education': return <GraduationCap className="w-4 h-4 text-purple-600" />;
      default: return <Building2 className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-sans text-[#171717]">
      {/* BRAND HEADER & VIEW SWITCHER */}
      <div className="bg-white border border-[#171717] p-6 sm:p-8 shadow-[4px_4px_0px_#171717] space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#171717]/15">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest bg-[#171717] text-[#F7F5EF] border border-[#171717]">
                CIVICPULSE • COMMUNITY SIGNALS PORTAL
              </span>
              <span className="text-xs font-mono text-[#171717]/70 font-bold">
                • 2,841 CITIZEN REQUESTS ➔ 327 CIVIC ISSUES ➔ 42 HOTSPOTS
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#171717] tracking-tight uppercase">
              Civic Signal Aggregation & Issue Clustering
            </h1>
            <p className="text-xs sm:text-sm text-[#171717]/80 max-w-3xl leading-relaxed">
              Combining thousands of raw multilingual citizen complaints into unified, community-level civic issues. Removing duplicate noise while strictly preserving original evidence.
            </p>
          </div>

          {/* Core Elevator Pitch Citation Quote Box */}
          <div className="p-4 bg-[#F7F5EF] border-2 border-[#171717] shadow-[3px_3px_0px_#171717] max-w-sm font-mono text-[11px] leading-snug space-y-1">
            <span className="font-bold text-[#D65A3A] uppercase block text-[10px] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              THE CIVICPULSE PRINCIPLE:
            </span>
            <p className="italic text-[#171717]">
              "CivicPulse aggregates thousands of multilingual citizen requests into unified community-level civic issues, removing duplicate noise while preserving original evidence."
            </p>
          </div>
        </div>

        {/* View Selection Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            onClick={() => setActiveViewMode('aggregation')}
            className={`px-4 py-2 font-mono text-xs font-bold uppercase transition-all cursor-pointer border border-[#171717] flex items-center gap-2 ${
              activeViewMode === 'aggregation'
                ? 'bg-[#171717] text-[#F7F5EF] shadow-[2px_2px_0px_#D65A3A]'
                : 'bg-[#F7F5EF] text-[#171717] hover:bg-white'
            }`}
          >
            <FolderTree className="w-4 h-4 text-[#D65A3A]" />
            <span>01. Civic Signal Aggregation (327 Issues)</span>
          </button>

          <button
            onClick={() => setActiveViewMode('patterns')}
            className={`px-4 py-2 font-mono text-xs font-bold uppercase transition-all cursor-pointer border border-[#171717] flex items-center gap-2 ${
              activeViewMode === 'patterns'
                ? 'bg-[#171717] text-[#F7F5EF] shadow-[2px_2px_0px_#D65A3A]'
                : 'bg-[#F7F5EF] text-[#171717] hover:bg-white'
            }`}
          >
            <Cpu className="w-4 h-4 text-[#D65A3A]" />
            <span>02. Advanced Pattern & Anomaly Feed</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: CIVIC SIGNAL AGGREGATION & COMMUNITY ISSUES */}
      {activeViewMode === 'aggregation' && (
        <div className="space-y-8">
          {/* Visual Aggregation Funnel Banner */}
          <div className="bg-[#171717] text-[#F7F5EF] p-6 border-2 border-[#171717] shadow-[5px_5px_0px_#D65A3A] space-y-4">
            <div className="flex items-center justify-between border-b border-white/20 pb-3 font-mono">
              <span className="text-xs font-bold text-amber-300 uppercase flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#D65A3A]" />
                COMMUNITY SIGNAL CONVERGENCE PIPELINE
              </span>
              <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 font-bold">
                REAL-TIME AGGREGATION ACTIVE
              </span>
            </div>

            {/* 3-Step Aggregation Funnel Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center font-mono">
              <div className="p-4 bg-white/10 border border-white/20 space-y-1">
                <span className="text-2xl font-serif font-black text-amber-300 block">2,841</span>
                <span className="text-xs font-bold uppercase text-white block">Individual Requests</span>
                <span className="text-[10px] text-white/70 block">Voice, Text & Photos in 8 Languages</span>
              </div>

              <div className="p-4 bg-white/20 border-2 border-[#D65A3A] space-y-1 relative">
                <div className="text-xs font-bold text-[#D65A3A] uppercase tracking-wider">↓ AI AGGREGATION ↓</div>
                <span className="text-2xl font-serif font-black text-white block">327</span>
                <span className="text-xs font-bold uppercase text-white block">Community Issues</span>
                <span className="text-[10px] text-amber-300 block">Semantic Clusters Formed</span>
              </div>

              <div className="p-4 bg-white/10 border border-white/20 space-y-1">
                <span className="text-2xl font-serif font-black text-rose-400 block">42</span>
                <span className="text-xs font-bold uppercase text-white block">Major Hotspots</span>
                <span className="text-[10px] text-white/70 block">Priority Infrastructure Gaps</span>
              </div>
            </div>
          </div>

          {/* COMMUNITY ISSUES LIST / PORTAL */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#171717]/15 pb-2 font-mono">
              <span className="text-xs font-bold uppercase text-[#171717]">
                COMMUNITY CIVIC ISSUES (TOP ACTIVE CLUSTERS)
              </span>
              <span className="text-[10px] bg-[#F7F5EF] text-[#171717] px-2 py-0.5 border border-[#171717] font-bold">
                SORTED BY CITIZEN SIGNAL VOLUME
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clustersList.map((cluster) => (
                <div
                  key={cluster.id}
                  className="bg-white border-2 border-[#171717] p-5 shadow-[4px_4px_0px_#171717] space-y-4 flex flex-col justify-between hover:shadow-[6px_6px_0px_#171717] transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-[#171717]/10 pb-2">
                      <span className={`px-2 py-0.5 font-mono text-[10px] font-extrabold uppercase border border-[#171717] ${cluster.urgencyColor}`}>
                        {cluster.urgency} ISSUE
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[#171717]/70 bg-[#F7F5EF] px-2 py-0.5 border border-[#171717]">
                        {cluster.code}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#D65A3A] uppercase">
                        {getCategoryIcon(cluster.category)}
                        <span>{cluster.category} CATEGORY</span>
                      </div>
                      <h3 className="text-lg font-serif font-bold text-[#171717] leading-tight">
                        {cluster.title}
                      </h3>
                    </div>

                    {/* Volume Stats */}
                    <div className="p-3 bg-[#F7F5EF] border border-[#171717] font-mono text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-base text-[#171717]">{cluster.requestCount.toLocaleString()} requests</span>
                        <span className="font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 border border-rose-300 text-[10px]">
                          {cluster.monthlyChangePct} this month
                        </span>
                      </div>

                      <div className="flex justify-between text-[10px] text-[#171717]/80 pt-1 border-t border-[#171717]/10">
                        <span>📍 {cluster.villagesCount} villages</span>
                        <span>🌐 {cluster.languagesCount} languages</span>
                        <span>🗓️ {cluster.timeframe}</span>
                      </div>
                    </div>

                    {/* WHO IS AFFECTED? Demographic Preview Box */}
                    {cluster.demographics && (
                      <div className="p-3 bg-white border border-[#171717] font-mono text-[11px] space-y-1.5 shadow-[2px_2px_0px_#171717]">
                        <div className="flex items-center justify-between border-b border-[#171717]/10 pb-1 text-[10px] font-bold text-[#D65A3A] uppercase">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-[#D65A3A]" />
                            WHO IS AFFECTED?
                          </span>
                          <span className="text-[#171717]/70 font-bold">
                            {cluster.demographics.ruralPct}% Rural | {cluster.demographics.urbanPct}% Urban
                          </span>
                        </div>
                        <p className="text-[#171717] text-[10px] leading-snug line-clamp-2 italic">
                          "{cluster.demographics.equityAssessment}"
                        </p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {cluster.demographics.affectedGroups.slice(0, 2).map((grp, idx) => (
                            <span key={idx} className="bg-[#F7F5EF] text-[#171717] px-1.5 py-0.5 border border-[#171717]/30 text-[9px] font-bold">
                              {grp.iconEmoji} {grp.groupName} ({grp.percentage}%)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Official Verification Stamp status if applicable */}
                    {cluster.isVerifiedByOfficial && (
                      <div className="p-2 bg-emerald-100 text-emerald-900 border border-emerald-500 font-mono text-[10px] font-bold flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          VERIFIED BY DISTRICT OFFICIAL
                        </span>
                        <span>✓ STAMPED</span>
                      </div>
                    )}
                  </div>

                  {/* Explore Button */}
                  <button
                    onClick={() => setSelectedCluster(cluster)}
                    className="w-full py-2.5 bg-[#171717] hover:bg-[#D65A3A] text-white font-mono text-xs font-bold uppercase border border-[#171717] cursor-pointer transition-all shadow-[2px_2px_0px_#171717] flex items-center justify-center gap-2"
                  >
                    <span>Explore Cluster ({cluster.requestCount})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* HOW REQUESTS WERE COMBINED DEMO BANNER */}
          <div className="bg-[#F7F5EF] border-2 border-[#171717] p-6 shadow-[4px_4px_0px_#171717] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#171717]/20 pb-3 font-mono">
              <div>
                <span className="text-[10px] font-bold text-[#D65A3A] uppercase tracking-widest block">
                  TRANSPARENCY & TRUST ENGINE
                </span>
                <h3 className="text-lg font-serif font-bold text-[#171717]">
                  How 6 Native Citizen Requests Converged Into 1 Civic Signal
                </h3>
              </div>
              <span className="text-[10px] bg-white border border-[#171717] px-2 py-1 font-bold">
                SEMANTIC MATCHING EXPLAINER
              </span>
            </div>

            {/* 6 Request Convergence Flow Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 bg-white border border-[#171717] space-y-1">
                <span className="text-[9px] font-bold text-[#D65A3A] uppercase">REQUEST 001 • VOICE 🎙️</span>
                <p className="font-serif italic text-xs">"There's no drinking water in our village."</p>
                <span className="text-[9px] text-emerald-800 font-bold bg-emerald-100 px-1">Mapped to Water Supply</span>
              </div>

              <div className="p-3 bg-white border border-[#171717] space-y-1">
                <span className="text-[9px] font-bold text-[#D65A3A] uppercase">REQUEST 002 • TEXT 💬</span>
                <p className="font-serif italic text-xs">"Water hasn't come for 5 days."</p>
                <span className="text-[9px] text-emerald-800 font-bold bg-emerald-100 px-1">Mapped to Water Supply</span>
              </div>

              <div className="p-3 bg-white border border-[#171717] space-y-1">
                <span className="text-[9px] font-bold text-[#D65A3A] uppercase">REQUEST 003 • PHOTO 📷</span>
                <p className="font-serif italic text-xs">"Pipeline near the school is broken."</p>
                <span className="text-[9px] text-emerald-800 font-bold bg-emerald-100 px-1">Mapped to Water Supply</span>
              </div>

              <div className="p-3 bg-white border border-[#171717] space-y-1">
                <span className="text-[9px] font-bold text-[#D65A3A] uppercase">REQUEST 004 • TAMIL (தமிழ்)</span>
                <p className="font-serif italic text-xs">"குடிநீர் வரவில்லை."</p>
                <span className="text-[9px] text-emerald-800 font-bold bg-emerald-100 px-1">Mapped to Water Supply</span>
              </div>

              <div className="p-3 bg-white border border-[#171717] space-y-1">
                <span className="text-[9px] font-bold text-[#D65A3A] uppercase">REQUEST 005 • HINDI (हिंदी)</span>
                <p className="font-serif italic text-xs">"हमारे गांव में पानी की समस्या है।"</p>
                <span className="text-[9px] text-emerald-800 font-bold bg-emerald-100 px-1">Mapped to Water Supply</span>
              </div>

              <div className="p-3 bg-white border border-[#171717] space-y-1">
                <span className="text-[9px] font-bold text-[#D65A3A] uppercase">REQUEST 006 • ENGLISH</span>
                <p className="font-serif italic text-xs">"Water supply is irregular near primary school."</p>
                <span className="text-[9px] text-emerald-800 font-bold bg-emerald-100 px-1">Mapped to Water Supply</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: ADVANCED PATTERN FEED */}
      {activeViewMode === 'patterns' && (
        <div className="space-y-6">
          {/* Filter Tabs & Search Bar */}
          <div className="bg-white border border-[#171717] p-4 shadow-[3px_3px_0px_#171717] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#171717]/70 block mb-1">
                PATTERN INTELLIGENCE FILTERS
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'ALL', label: 'ALL PATTERNS' },
                  { id: 'Emerging', label: '🔴 EMERGING' },
                  { id: 'Cross-Domain', label: '🔗 CROSS-DOMAIN' },
                  { id: 'Anomaly', label: '🚨 ANOMALIES' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveFilter(item.id as PatternCategory)}
                    className={`px-3 py-1.5 font-mono text-xs font-bold uppercase transition-all cursor-pointer border border-[#171717] ${
                      activeFilter === item.id
                        ? 'bg-[#171717] text-[#F7F5EF] shadow-[2px_2px_0px_#D65A3A]'
                        : 'bg-[#F7F5EF] text-[#171717] hover:bg-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-[#171717]/50 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search patterns or districts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F7F5EF] border border-[#171717] pl-8 pr-3 py-1.5 text-xs text-[#171717] placeholder:text-[#171717]/50 focus:outline-none focus:bg-white font-mono"
              />
            </div>
          </div>

          {/* Pattern Feed Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPatterns.map((pat) => (
              <div
                key={pat.id}
                className="bg-white border border-[#171717] p-6 shadow-[4px_4px_0px_#171717] flex flex-col justify-between space-y-5 hover:shadow-[6px_6px_0px_#171717] transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#171717]/10 pb-3">
                    <span className="px-2.5 py-0.5 text-[10px] font-mono font-extrabold uppercase bg-rose-600 text-white border border-[#171717] shadow-[1px_1px_0px_#171717]">
                      🔴 {pat.type.toUpperCase()}
                    </span>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#171717]/80 bg-[#F7F5EF] px-2.5 py-1 border border-[#171717]">
                      {pat.districtName.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#D65A3A] uppercase tracking-wider mb-1">
                      {getCategoryIcon(pat.category)}
                      <span>{pat.category} CATEGORY</span>
                    </div>
                    <h3 className="text-lg font-serif font-bold text-[#171717] leading-snug">
                      {pat.title}
                    </h3>
                  </div>
                </div>

                <div className="p-4 bg-[#F7F5EF] border border-[#171717] space-y-3">
                  <p className="text-xs font-medium text-[#171717] leading-relaxed">
                    {pat.summary}
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-2 border-t border-[#171717]/15">
                    <div>
                      <span className="text-[9px] text-[#171717]/60 block font-bold">SIGNAL SPIKE</span>
                      <span className="font-extrabold text-[#D65A3A]">{pat.metrics.changePct || pat.metrics.citizenSignalsCount}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#171717]/60 block font-bold">AFFECTED HABITATIONS</span>
                      <span className="font-bold text-[#171717]">{pat.metrics.affectedVillagesCount} villages</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#171717]/60 block font-bold">AI CONFIDENCE</span>
                      <span className="font-extrabold text-emerald-700">{pat.metrics.confidencePct}%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#171717]/10">
                  <button
                    onClick={() => setSelectedPatternModal(pat)}
                    className="py-2.5 px-3 bg-white hover:bg-[#F7F5EF] border border-[#171717] font-mono text-xs font-bold uppercase text-[#171717] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#171717]"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-[#D65A3A]" />
                    <span>Investigate Pattern →</span>
                  </button>

                  <button
                    onClick={onNavigateToRecommendations}
                    className="py-2.5 px-3 bg-[#171717] hover:bg-[#171717]/90 border border-[#171717] font-mono text-xs font-bold uppercase text-[#F7F5EF] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#D65A3A]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#D65A3A]" />
                    <span>Recommendations →</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DETAILED CLUSTER INSPECTION MODAL ("HOW REQUESTS WERE COMBINED") */}
      {selectedCluster && (
        <div className="fixed inset-0 z-50 bg-[#171717]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F7F5EF] border-2 border-[#171717] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-[10px_10px_0px_#171717] p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b-2 border-[#171717] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-[#D65A3A] text-white font-mono text-[10px] font-bold uppercase border border-[#171717]">
                    CIVIC SIGNAL CLUSTER INSPECTION
                  </span>
                  <span className="font-mono text-xs font-bold text-[#171717]/70">
                    {selectedCluster.code}
                  </span>
                </div>

                <h2 className="text-2xl font-serif font-black text-[#171717] uppercase">
                  {selectedCluster.title}
                </h2>

                <div className="flex flex-wrap items-center gap-3 mt-1 font-mono text-xs text-[#171717]/80">
                  <span className="font-bold">{selectedCluster.requestCount.toLocaleString()} requests</span>
                  <span>•</span>
                  <span>{selectedCluster.villagesCount} villages</span>
                  <span>•</span>
                  <span>{selectedCluster.languagesCount} languages</span>
                  <span>•</span>
                  <span className="text-rose-700 font-bold">{selectedCluster.monthlyChangePct} increase</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedCluster(null)}
                className="p-1 bg-white hover:bg-rose-100 border border-[#171717] cursor-pointer"
              >
                <X className="w-6 h-6 text-[#171717]" />
              </button>
            </div>

            {/* HUMAN-IN-THE-LOOP CONTROL BAR (MERGE / SPLIT / VERIFY) */}
            <div className="p-4 bg-white border-2 border-[#171717] shadow-[3px_3px_0px_#171717] space-y-3">
              <div className="flex items-center justify-between border-b border-[#171717]/15 pb-2 font-mono">
                <span className="text-xs font-bold text-[#D65A3A] uppercase flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#D65A3A]" />
                  HUMAN-IN-THE-LOOP DECISION CONTROLS
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-900 px-2 py-0.5 border border-blue-400 font-bold">
                  OFFICIAL REVIEW ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
                <button
                  onClick={() => handleMergeSubIssues(selectedCluster.id)}
                  className="p-2.5 bg-[#F7F5EF] hover:bg-amber-100 text-[#171717] border border-[#171717] font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-[1px_1px_0px_#171717]"
                >
                  <GitMerge className="w-4 h-4 text-[#D65A3A]" />
                  <span>Merge Similar Issues</span>
                </button>

                <button
                  onClick={() => handleSplitSubIssue(selectedCluster.id)}
                  className="p-2.5 bg-[#F7F5EF] hover:bg-amber-100 text-[#171717] border border-[#171717] font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-[1px_1px_0px_#171717]"
                >
                  <Split className="w-4 h-4 text-purple-700" />
                  <span>Split Sub-Issue</span>
                </button>

                <button
                  onClick={() => handleVerifyCluster(selectedCluster.id)}
                  className={`p-2.5 border font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-[1px_1px_0px_#171717] ${
                    selectedCluster.isVerifiedByOfficial
                      ? 'bg-emerald-600 text-white border-[#171717]'
                      : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-600'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{selectedCluster.isVerifiedByOfficial ? 'Verified ✓' : 'Mark as Verified'}</span>
                </button>
              </div>

              {selectedCluster.mergedWith && (
                <div className="p-2 bg-amber-50 border border-amber-300 font-mono text-[10px] font-bold text-amber-900">
                  ⚡ Action Log: {selectedCluster.mergedWith.join(', ')}
                </div>
              )}

              {selectedCluster.splitFrom && (
                <div className="p-2 bg-purple-50 border border-purple-300 font-mono text-[10px] font-bold text-purple-900">
                  ✂️ Action Log: {selectedCluster.splitFrom}
                </div>
              )}
            </div>

            {/* 2-COLUMN BREAKDOWN: AI SUB-CLUSTERING & SOURCES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: AI Clustering Breakdown */}
              <div className="bg-white border-2 border-[#171717] p-4 space-y-3 shadow-[3px_3px_0px_#171717] font-mono">
                <span className="text-xs font-bold text-[#171717] uppercase block border-b border-[#171717]/15 pb-2">
                  AI SUB-CATEGORY BREAKDOWN
                </span>

                <div className="space-y-2.5 text-xs">
                  {selectedCluster.aiSubClustering.map((sub, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>{sub.label}</span>
                        <span className="text-[#D65A3A]">{sub.count} ({sub.percentage}%)</span>
                      </div>
                      <div className="w-full h-2 bg-[#F7F5EF] border border-[#171717]">
                        <div
                          className="h-full bg-[#D65A3A]"
                          style={{ width: `${sub.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Signal Sources Breakdown */}
              <div className="bg-white border-2 border-[#171717] p-4 space-y-3 shadow-[3px_3px_0px_#171717] font-mono">
                <span className="text-xs font-bold text-[#171717] uppercase block border-b border-[#171717]/15 pb-2">
                  INGESTION SOURCES
                </span>

                <div className="space-y-3 text-xs">
                  <div className="p-2.5 bg-[#F7F5EF] border border-[#171717] flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <Mic className="w-4 h-4 text-amber-600" />
                      🎙️ Spoken Voice Messages
                    </span>
                    <span className="text-amber-700">{selectedCluster.sources.voicePct}%</span>
                  </div>

                  <div className="p-2.5 bg-[#F7F5EF] border border-[#171717] flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      💬 Multilingual Text Chat
                    </span>
                    <span className="text-blue-700">{selectedCluster.sources.textPct}%</span>
                  </div>

                  <div className="p-2.5 bg-[#F7F5EF] border border-[#171717] flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-emerald-600" />
                      📷 Photo Reports
                    </span>
                    <span className="text-emerald-700">{selectedCluster.sources.photoPct}%</span>
                  </div>

                  <div className="p-2 bg-white border border-[#171717]/30 text-[10px] text-[#171717]/70 font-bold text-center">
                    TIME RANGE: LAST 30 DAYS (CONTINUOUS SAMPLING)
                  </div>
                </div>
              </div>
            </div>

            {/* WHO IS AFFECTED? DEMOGRAPHIC & EQUITY PROFILE PANEL */}
            {selectedCluster.demographics && (
              <div className="bg-white border-2 border-[#171717] p-5 space-y-4 shadow-[4px_4px_0px_#171717] font-mono">
                <div className="flex items-center justify-between border-b border-[#171717]/15 pb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#D65A3A]" />
                    <div>
                      <span className="text-xs font-extrabold text-[#D65A3A] uppercase block tracking-wider">
                        DEMOGRAPHIC DATA & EQUITY PROFILE (WHO IS AFFECTED?)
                      </span>
                      <p className="text-[10px] text-[#171717]/70">
                        Analyzing population groups and vulnerability indicators without exposing personal identifiers.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-400 px-2 py-0.5 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    PII COMPLIANT
                  </span>
                </div>

                {/* Grid of Demographics */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left Column: Affected Demographic Groups with Impact Notes */}
                  <div className="lg:col-span-7 space-y-3">
                    <span className="text-[10px] text-[#171717]/80 font-bold uppercase block border-b border-[#171717]/10 pb-1">
                      AFFECTED POPULATION GROUPS & DIRECT IMPACT
                    </span>
                    <div className="space-y-2.5">
                      {selectedCluster.demographics.affectedGroups.map((group, idx) => (
                        <div key={idx} className="p-3 bg-[#F7F5EF] border border-[#171717] space-y-1.5 shadow-[1px_1px_0px_#171717]">
                          <div className="flex justify-between items-center text-xs font-bold text-[#171717]">
                            <span className="flex items-center gap-1.5">
                              <span className="text-sm">{group.iconEmoji}</span>
                              {group.groupName}
                            </span>
                            <span className="text-[#D65A3A]">{group.percentage}% of affected population</span>
                          </div>
                          <div className="w-full h-2 bg-white border border-[#171717]">
                            <div className="h-full bg-[#D65A3A]" style={{ width: `${group.percentage}%` }} />
                          </div>
                          <p className="text-[10px] text-[#171717]/80 font-sans italic pt-0.5">
                            "{group.impactNote}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Urban/Rural Split & Income Tier Breakdown & Vulnerabilities */}
                  <div className="lg:col-span-5 space-y-3">
                    {/* Rural vs Urban Bar */}
                    <div className="p-3 bg-[#F7F5EF] border border-[#171717] space-y-2">
                      <span className="text-[10px] font-bold text-[#171717]/80 uppercase block">POPULATION DENSITY SPLIT</span>
                      <div className="flex justify-between text-xs font-bold text-[#171717]">
                        <span>🌾 Rural: {selectedCluster.demographics.ruralPct}%</span>
                        <span>🏙️ Urban: {selectedCluster.demographics.urbanPct}%</span>
                      </div>
                      <div className="w-full h-3 bg-white border border-[#171717] flex overflow-hidden">
                        <div className="h-full bg-emerald-600" style={{ width: `${selectedCluster.demographics.ruralPct}%` }} />
                        <div className="h-full bg-blue-600" style={{ width: `${selectedCluster.demographics.urbanPct}%` }} />
                      </div>
                    </div>

                    {/* Income Tier Breakdown */}
                    <div className="p-3 bg-[#F7F5EF] border border-[#171717] space-y-2">
                      <span className="text-[10px] font-bold text-[#171717]/80 uppercase block">INCOME TIER DISTRIBUTION</span>
                      <div className="grid grid-cols-3 gap-1 text-center text-[10px] font-bold">
                        <div className="bg-amber-100 p-1.5 border border-amber-300">
                          <span className="block text-amber-900">LOW (BPL)</span>
                          <span className="text-xs text-amber-950 font-extrabold">{selectedCluster.demographics.incomeTierBreakdown.lowIncomePct}%</span>
                        </div>
                        <div className="bg-blue-100 p-1.5 border border-blue-300">
                          <span className="block text-blue-900">MIDDLE</span>
                          <span className="text-xs text-blue-950 font-extrabold">{selectedCluster.demographics.incomeTierBreakdown.middleIncomePct}%</span>
                        </div>
                        <div className="bg-slate-100 p-1.5 border border-slate-300">
                          <span className="block text-slate-800">HIGH</span>
                          <span className="text-xs text-slate-900 font-extrabold">{selectedCluster.demographics.incomeTierBreakdown.highIncomePct}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Vulnerability Badges */}
                    <div className="p-3 bg-[#F7F5EF] border border-[#171717] space-y-1.5">
                      <span className="text-[10px] font-bold text-[#171717]/80 uppercase block">VULNERABILITY INDICATORS</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCluster.demographics.vulnerabilityIndicators.map((vuln, idx) => (
                          <span key={idx} className={`px-2 py-0.5 text-[10px] font-bold border ${vuln.badgeColor}`}>
                            ⚠️ {vuln.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Equity Assessment & Privacy Protection Note */}
                <div className="p-3 bg-[#171717] text-white border border-[#171717] space-y-1.5 shadow-[2px_2px_0px_#D65A3A]">
                  <span className="text-[10px] text-[#D65A3A] font-bold uppercase tracking-wider block">
                    EQUITY ASSESSMENT & DECISION RECOMMENDATION
                  </span>
                  <p className="text-xs font-serif leading-relaxed text-amber-100">
                    {selectedCluster.demographics.equityAssessment}
                  </p>
                  <div className="text-[9px] text-slate-400 border-t border-white/20 pt-1 font-mono flex items-center justify-between">
                    <span>🔒 Privacy Shield: Aggregated census demographic indicators used.</span>
                    <span>No personal identifiers stored or displayed.</span>
                  </div>
                </div>
              </div>
            )}

            {/* INFRASTRUCTURE DATA AUDIT PANEL ("WHAT EXISTS? WHAT CONDITION/CAPACITY?") */}
            {selectedCluster.infrastructureAudit && (
              <div className="bg-white border-2 border-[#171717] p-5 space-y-4 shadow-[4px_4px_0px_#171717] font-mono">
                <div className="flex items-center justify-between border-b border-[#171717]/15 pb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#D65A3A]" />
                    <div>
                      <span className="text-xs font-extrabold text-[#171717] uppercase block tracking-wider">
                        INFRASTRUCTURE ASSET AUDIT (CONDITION & CAPACITY)
                      </span>
                      <p className="text-[10px] text-[#171717]/70">
                        Cross-referencing citizen request signals against official asset registries & capacity metrics.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#171717] text-[#F7F5EF] px-2 py-0.5 font-bold">
                    ASSET LOGGED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-[#F7F5EF] p-3 border border-[#171717] space-y-1">
                    <span className="text-[9px] text-[#D65A3A] uppercase block font-bold">EXISTING INFRASTRUCTURE</span>
                    <span className="font-bold text-[#171717] block">{selectedCluster.infrastructureAudit.assetName}</span>
                    <span className="text-[10px] text-[#171717]/70">{selectedCluster.infrastructureAudit.location}</span>
                  </div>
                  <div className="bg-[#F7F5EF] p-3 border border-[#171717] space-y-1">
                    <span className="text-[9px] text-[#D65A3A] uppercase block font-bold">CONDITION & CAPACITY</span>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#171717]">{selectedCluster.infrastructureAudit.capacity}</span>
                      <span className="text-[9px] bg-white border border-[#171717] px-1 py-0.2 font-bold">
                        {selectedCluster.infrastructureAudit.condition}
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-800 font-bold block">Utilization: {selectedCluster.infrastructureAudit.utilizationPct}%</span>
                  </div>
                  <div className="bg-[#F7F5EF] p-3 border border-[#171717] space-y-1">
                    <span className="text-[9px] text-[#D65A3A] uppercase block font-bold">PROXIMITY & TRAVEL TIME</span>
                    <span className="font-bold text-[#171717] block">{selectedCluster.infrastructureAudit.nearestFacilityDistanceKm} km distance</span>
                    <span className="text-[10px] text-[#171717]/70">~{selectedCluster.infrastructureAudit.travelTimeMinutes} min travel time</span>
                  </div>
                </div>

                <div className="p-3 bg-[#F7F5EF] border border-[#171717] space-y-1 text-xs">
                  <span className="text-[9px] font-bold text-[#D65A3A] uppercase block tracking-wider">
                    CITIZEN CLAIM VS INFRASTRUCTURE REALITY EVIDENCE
                  </span>
                  <p className="text-[#171717] font-medium leading-relaxed">
                    {selectedCluster.infrastructureAudit.auditFinding}
                  </p>
                </div>

                <div className="p-3 bg-[#171717] text-[#F7F5EF] space-y-1 text-xs font-bold shadow-[2px_2px_0px_#D65A3A]">
                  <span className="text-[9px] text-amber-400 uppercase tracking-wider block">
                    RECOMMENDED ACTION TYPE: {selectedCluster.infrastructureAudit.interventionType}
                  </span>
                  <p className="text-white text-[11px] font-normal leading-relaxed">
                    {selectedCluster.infrastructureAudit.interventionRationale}
                  </p>
                </div>
              </div>
            )}

            {/* GOVERNMENT SCHEME & INVESTMENT TRACE PANEL */}
            {(() => {
              const inv = selectedCluster.investmentAudit || getInvestmentAuditByCategory(selectedCluster.category);
              return (
                <div className="bg-white border-2 border-[#171717] p-5 space-y-4 shadow-[4px_4px_0px_#171717] font-mono">
                  <div className="flex items-center justify-between border-b border-[#171717]/15 pb-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-[#D65A3A]" />
                      <div>
                        <span className="text-xs font-extrabold text-[#171717] uppercase block tracking-wider">
                          GOVERNMENT PLAN & SCHEME INVESTMENT TRACE
                        </span>
                        <p className="text-[10px] text-[#171717]/70">
                          Cross-referencing citizen cluster demand against active government allocations & spending.
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-[#D65A3A] text-white px-2 py-0.5 font-bold">
                      SCHEME AUDIT
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-[#F7F5EF] p-3 border border-[#171717] space-y-1">
                      <span className="text-[9px] text-[#D65A3A] uppercase block font-bold">SCHEME & DEPARTMENT</span>
                      <span className="font-bold text-[#171717] block">{inv.schemeName}</span>
                      <span className="text-[10px] text-[#171717]/70">{inv.department}</span>
                    </div>

                    <div className="bg-[#F7F5EF] p-3 border border-[#171717] space-y-1">
                      <span className="text-[9px] text-[#D65A3A] uppercase block font-bold">STATE EXPENDITURE</span>
                      <span className="font-bold text-[#171717] block">₹{(inv.spentInr / 10000000).toFixed(1)} Cr Expended</span>
                      <span className="text-[10px] text-emerald-800 font-bold">Allocated: ₹{(inv.allocatedInr / 10000000).toFixed(1)} Cr</span>
                    </div>

                    <div className="bg-[#F7F5EF] p-3 border border-[#171717] space-y-1">
                      <span className="text-[9px] text-[#D65A3A] uppercase block font-bold">DELAYS & STALLED CONTRACTS</span>
                      <span className="font-bold text-amber-800 block">{inv.delayedProjects} Projects Stalled</span>
                      <span className="text-[10px] text-[#171717]/70">{inv.completedProjects} Completed</span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#171717] text-[#F7F5EF] space-y-1 text-xs">
                    <span className="text-[9px] font-bold text-amber-300 uppercase block tracking-wider">
                      INVESTMENT GAP FINDING:
                    </span>
                    <p className="text-white font-normal text-[11px] leading-relaxed">
                      {inv.auditFinding}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* GEOGRAPHIC AGGREGATION MAP / HOTSPOT BREAKDOWN */}
            <div className="bg-[#171717] text-[#F7F5EF] border-2 border-[#171717] p-5 space-y-4 shadow-[4px_4px_0px_#D65A3A] font-mono">
              <div className="flex items-center justify-between border-b border-white/20 pb-2">
                <span className="text-xs font-bold text-amber-300 uppercase flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#D65A3A]" />
                  GEOGRAPHIC MULTI-VILLAGE AGGREGATION
                </span>
                <span className="text-[10px] bg-rose-700 text-white px-2 py-0.5 font-bold">
                  HOTSPOT DETECTED
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Villages List */}
                <div className="lg:col-span-7 space-y-1.5 text-xs">
                  <span className="text-[10px] text-white/70 font-bold uppercase block">VILLAGE COMPLAINT BREAKDOWN:</span>
                  {selectedCluster.geographicVillages.map((v, idx) => (
                    <div key={idx} className="p-2 bg-white/10 border border-white/20 flex justify-between">
                      <span>{v.villageName}</span>
                      <span className="font-extrabold text-amber-300">{v.requestCount} complaints</span>
                    </div>
                  ))}
                </div>

                {/* Hotspot Visual Card */}
                <div className="lg:col-span-5 p-4 bg-white text-[#171717] border-2 border-amber-400 text-center space-y-2">
                  <span className="text-[10px] font-bold text-[#D65A3A] uppercase block">
                    {selectedCluster.geographicHotspotSummary.title}
                  </span>
                  <div className="text-xl font-serif font-black text-[#171717]">
                    {selectedCluster.geographicHotspotSummary.coreRequestsCount} Core Complaints
                  </div>
                  <p className="text-xs font-bold text-[#171717]/80">
                    Across {selectedCluster.geographicHotspotSummary.villagesCount} contiguous villages impact {selectedCluster.geographicHotspotSummary.affectedPopulation}
                  </p>
                </div>
              </div>
            </div>

            {/* UNDERLYING CITIZEN EVIDENCE DRILL-DOWN LIST */}
            <div className="bg-white border-2 border-[#171717] p-5 space-y-4 shadow-[4px_4px_0px_#171717] font-mono">
              <div className="flex items-center justify-between border-b border-[#171717]/15 pb-2">
                <div>
                  <span className="text-xs font-bold text-[#D65A3A] uppercase block">
                    MULTILINGUAL EVIDENCE DRILL-DOWN
                  </span>
                  <p className="text-[10px] text-[#171717]/70">
                    Inspect original citizen reports across native languages to verify AI semantic clustering accuracy.
                  </p>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-400 px-2 py-0.5 font-bold">
                  7 EVIDENTIARY SAMPLES SHOWN
                </span>
              </div>

              <div className="space-y-2.5 text-xs max-h-60 overflow-y-auto pr-1">
                {selectedCluster.evidenceRequests.map((req) => (
                  <div key={req.id} className="p-3 bg-[#F7F5EF] border border-[#171717] space-y-1 shadow-[1px_1px_0px_#171717]">
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#171717]/70 pb-1 border-b border-[#171717]/10">
                      <span>{req.id} • {req.sourceType} • {req.language}</span>
                      <span className="text-[#D65A3A]">Matched: {req.matchedSubCategory}</span>
                    </div>
                    <p className="font-serif italic text-sm text-[#171717]">"{req.originalText}"</p>
                    <div className="text-[9px] text-[#171717]/60 pt-0.5">📍 Location: {req.location}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* FULL INTELLIGENCE CHAIN ARCHITECTURE FLOW */}
            <div className="p-5 bg-[#F7F5EF] border-2 border-[#171717] space-y-3 font-mono text-xs shadow-[3px_3px_0px_#171717]">
              <span className="text-[10px] font-bold text-[#D65A3A] uppercase tracking-wider block border-b border-[#171717]/15 pb-1">
                FULL INTELLIGENCE ARCHITECTURE CHAIN
              </span>

              <div className="grid grid-cols-1 md:grid-cols-6 gap-1 text-center font-bold text-[10px]">
                <div className="p-2 bg-white border border-[#171717]">
                  <span className="text-[#D65A3A] block">01. Citizen</span>
                  <span>1,842 Requests</span>
                </div>
                <div className="p-2 bg-white border border-[#171717]">
                  <span className="text-[#D65A3A] block">02. Aggregation</span>
                  <span>Community Issue</span>
                </div>
                <div className="p-2 bg-white border border-[#171717]">
                  <span className="text-[#D65A3A] block">03. Cluster</span>
                  <span>12 Villages</span>
                </div>
                <div className="p-2 bg-white border border-[#171717]">
                  <span className="text-[#D65A3A] block">04. Pattern</span>
                  <span>+43% Surge</span>
                </div>
                <div className="p-2 bg-white border border-[#171717]">
                  <span className="text-[#D65A3A] block">05. Priority</span>
                  <span>94/100 Score</span>
                </div>
                <div className="p-2 bg-[#171717] text-[#F7F5EF] border border-[#171717]">
                  <span className="text-amber-300 block">06. Action</span>
                  <span>Policy Rec</span>
                </div>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-[#171717]/20 font-mono text-xs">
              <button
                onClick={() => setSelectedCluster(null)}
                className="py-2.5 px-4 bg-white border border-[#171717] font-bold uppercase cursor-pointer shadow-[2px_2px_0px_#171717]"
              >
                [ Close Cluster Inspector ]
              </button>

              <button
                onClick={() => {
                  setSelectedCluster(null);
                  onNavigateToRecommendations();
                }}
                className="py-2.5 px-5 bg-[#D65A3A] text-white border border-[#171717] font-bold uppercase cursor-pointer shadow-[2px_2px_0px_#171717] flex items-center gap-1.5"
              >
                <span>Generate Recommended Policy Intervention →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PATTERN EVIDENCE MODAL FOR PATTERN FEED */}
      {selectedPatternModal && (
        <div className="fixed inset-0 z-50 bg-[#171717]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F7F5EF] border-2 border-[#171717] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_#171717] p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-[#171717] pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D65A3A] block">
                  AI PATTERN EVIDENCE BREAKDOWN
                </span>
                <h3 className="text-xl font-serif font-bold text-[#171717]">
                  {selectedPatternModal.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedPatternModal(null)}
                className="p-1 bg-white hover:bg-rose-100 border border-[#171717] cursor-pointer"
              >
                <X className="w-5 h-5 text-[#171717]" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-white border border-[#171717] p-4 space-y-1 shadow-[2px_2px_0px_#171717]">
                <span className="font-bold text-[#D65A3A] uppercase text-[10px] block">WHAT IS HAPPENING?</span>
                <p className="text-[#171717] leading-relaxed">{selectedPatternModal.details.what}</p>
              </div>

              <div className="bg-white border border-[#171717] p-4 space-y-1 shadow-[2px_2px_0px_#171717]">
                <span className="font-bold text-[#D65A3A] uppercase text-[10px] block">WHERE IS IT HAPPENING?</span>
                <p className="text-[#171717] leading-relaxed">{selectedPatternModal.details.where}</p>
              </div>

              <div className="bg-white border border-[#171717] p-4 space-y-1 shadow-[2px_2px_0px_#171717]">
                <span className="font-bold text-[#D65A3A] uppercase text-[10px] block">WHO IS AFFECTED?</span>
                <p className="text-[#171717] leading-relaxed">{selectedPatternModal.details.whoIsAffected}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setSelectedPatternModal(null);
                  onNavigateToRecommendations();
                }}
                className="py-2.5 px-5 bg-[#D65A3A] text-white border border-[#171717] font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_#171717] cursor-pointer"
              >
                Go to Recommendations →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
