import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Building2, 
  CheckCircle2, 
  Clock, 
  PieChart, 
  ArrowRight, 
  Search, 
  Filter, 
  ShieldAlert, 
  FileCheck, 
  Layers, 
  BarChart3, 
  Sparkles, 
  Info, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  ExternalLink, 
  MapPin, 
  FileText, 
  ArrowUpRight 
} from 'lucide-react';
import { District, InfrastructureCategory, CitizenRequest, InvestmentSchemeData, InvestmentAnomalySignal, AnomalySignalType, InterventionType } from '../types';
import { STATE_INVESTMENT_OVERVIEW, MAJOR_GOVERNMENT_SCHEMES, ALL_INVESTMENT_ANOMALIES } from '../data/investmentData';
import { INITIAL_GOVERNMENT_PROJECTS } from '../data/initialProjects';
import { getAvailableStates, getDistrictsForState } from '../utils/geography';
import { useLanguage } from '../context/LanguageContext';

interface InvestmentIntelligenceProps {
  districts: District[];
  requests?: CitizenRequest[];
  onNavigateToEngine?: () => void;
  onNavigateToRecommendations?: (districtId?: string, category?: string) => void;
  onNavigateToIssues?: (districtId?: string, category?: string) => void;
  onNavigateToPolicyLab?: (districtId?: string, category?: InfrastructureCategory) => void;
}

// Map helper to smoothly pan/zoom when selected district changes
function MapFocusController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 0.9 });
    }
  }, [center, zoom, map]);
  return null;
}

export const InvestmentIntelligence: React.FC<InvestmentIntelligenceProps> = ({
  districts = [],
  requests = [],
  onNavigateToEngine,
  onNavigateToRecommendations,
  onNavigateToIssues,
  onNavigateToPolicyLab
}) => {
  const { t, language } = useLanguage();

  const getCategoryLabel = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'water': return t('category.water');
      case 'roads': return t('category.roads');
      case 'healthcare':
      case 'health': return t('category.health');
      case 'electricity': return t('category.electricity');
      case 'drainage': return t('category.drainage');
      case 'education': return t('category.education');
      default: return cat;
    }
  };

  // Filters
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('ALL');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');

  // Progressive Disclosure toggle for Detailed Data
  const [showDetailedData, setShowDetailedData] = useState<boolean>(false);
  const [detailSearchQuery, setDetailSearchQuery] = useState<string>('');

  // Anomaly modal state (preserved from previous version)
  const [selectedAnomalyModal, setSelectedAnomalyModal] = useState<InvestmentAnomalySignal | null>(null);

  // States list: Only actual states/UTs
  const availableStates = useMemo(() => {
    return getAvailableStates('IN', districts);
  }, [districts]);

  // Districts list strictly dependent on selectedState
  const availableDistricts = useMemo(() => {
    return getDistrictsForState(selectedState, 'IN', districts);
  }, [selectedState, districts]);

  // Reset district selection if state changes and district no longer valid
  useEffect(() => {
    if (selectedDistrictId !== 'ALL') {
      const exists = availableDistricts.some(d => d.id === selectedDistrictId);
      if (!exists) {
        setSelectedDistrictId('ALL');
      }
    }
  }, [selectedState, availableDistricts, selectedDistrictId]);

  // Format currency in Indian Crores
  const formatCr = (inr: number) => `₹${(inr / 10000000).toFixed(1)} Cr`;

  // Calculated metrics
  const totalAllocated = useMemo(() => {
    if (selectedSector !== 'ALL') {
      const schemes = MAJOR_GOVERNMENT_SCHEMES.filter(s => s.category.toLowerCase() === selectedSector.toLowerCase());
      return schemes.reduce((acc, s) => acc + s.stateAllocationInr, 0);
    }
    return STATE_INVESTMENT_OVERVIEW.allocatedInr;
  }, [selectedSector]);

  const totalSpent = useMemo(() => {
    if (selectedSector !== 'ALL') {
      const schemes = MAJOR_GOVERNMENT_SCHEMES.filter(s => s.category.toLowerCase() === selectedSector.toLowerCase());
      return schemes.reduce((acc, s) => acc + s.spentInr, 0);
    }
    return STATE_INVESTMENT_OVERVIEW.spentInr;
  }, [selectedSector]);

  const totalProjects = useMemo(() => {
    if (selectedSector !== 'ALL') {
      const schemes = MAJOR_GOVERNMENT_SCHEMES.filter(s => s.category.toLowerCase() === selectedSector.toLowerCase());
      return schemes.reduce((acc, s) => acc + s.totalProjects, 0);
    }
    return STATE_INVESTMENT_OVERVIEW.totalProjects;
  }, [selectedSector]);

  const completedProjects = useMemo(() => {
    if (selectedSector !== 'ALL') {
      const schemes = MAJOR_GOVERNMENT_SCHEMES.filter(s => s.category.toLowerCase() === selectedSector.toLowerCase());
      return schemes.reduce((acc, s) => acc + s.completedProjects, 0);
    }
    return STATE_INVESTMENT_OVERVIEW.completedProjects;
  }, [selectedSector]);

  const delayedProjects = useMemo(() => {
    if (selectedSector !== 'ALL') {
      const schemes = MAJOR_GOVERNMENT_SCHEMES.filter(s => s.category.toLowerCase() === selectedSector.toLowerCase());
      return schemes.reduce((acc, s) => acc + s.delayedProjects, 0);
    }
    return STATE_INVESTMENT_OVERVIEW.delayedProjects;
  }, [selectedSector]);

  const completionRatePct = useMemo(() => {
    if (totalProjects === 0) return 0;
    return Math.round((completedProjects / totalProjects) * 100);
  }, [completedProjects, totalProjects]);

  // Geographic investment aggregation by district
  const districtInvestments = useMemo(() => {
    // Map existing districts to deterministic tracked investment data
    const map = new Map<string, {
      id: string;
      name: string;
      state: string;
      lat: number;
      lon: number;
      investmentInr: number;
      activeProjectsCount: number;
      topSector: string;
      topSectorKey: InfrastructureCategory;
      demandCount: number;
      deficitLabel: string;
      alignmentStatus: 'ALIGNED' | 'INVESTMENT_GAP' | 'HIGH_INVESTMENT_LOW_DEMAND';
      alignmentVerdict: string;
      hasData: boolean;
    }>();

    // Baseline definitions for anchor districts
    const anchorData: Record<string, {
      investmentInr: number;
      activeProjects: number;
      topSector: string;
      topSectorKey: InfrastructureCategory;
      demandCount: number;
      deficitLabel: string;
      alignmentStatus: 'ALIGNED' | 'INVESTMENT_GAP' | 'HIGH_INVESTMENT_LOW_DEMAND';
      alignmentVerdict: string;
    }> = {
      'guntur': {
        investmentInr: 590000000, // ₹59.0 Cr
        activeProjects: 145,
        topSector: 'Water',
        topSectorKey: 'Water',
        demandCount: 4820,
        deficitLabel: 'Water access at 38% (62% deficit)',
        alignmentStatus: 'INVESTMENT_GAP',
        alignmentVerdict: 'High investment in progress, but persistent delivery delay on 25 piped water contracts leaves 37 villages in critical need.'
      },
      'vijayawada': {
        investmentInr: 449000000, // ₹44.9 Cr
        activeProjects: 110,
        topSector: 'Drainage',
        topSectorKey: 'Drainage',
        demandCount: 5120,
        deficitLabel: 'Drainage & Clinic access deficit in outer periphery',
        alignmentStatus: 'INVESTMENT_GAP',
        alignmentVerdict: 'Urban core investment is advancing, but outer rural healthcare clinics face ₹11 Cr unutilized NHM allocations.'
      },
      'kurnool': {
        investmentInr: 205000000, // ₹20.5 Cr
        activeProjects: 48,
        topSector: 'Electricity',
        topSectorKey: 'Electricity',
        demandCount: 2310,
        deficitLabel: '108% transformer overload in agrarian belts',
        alignmentStatus: 'INVESTMENT_GAP',
        alignmentVerdict: 'High citizen complaints on power dropouts despite ₹10 Cr pending sanction release.'
      },
      'krishna': {
        investmentInr: 120000000, // ₹12.0 Cr
        activeProjects: 32,
        topSector: 'Education',
        topSectorKey: 'Education',
        demandCount: 1420,
        deficitLabel: 'School lab facility & sanitation deficit',
        alignmentStatus: 'ALIGNED',
        alignmentVerdict: 'Capital deployment aligns with local infrastructure refurbishment goals.'
      },
      'nagpur': {
        investmentInr: 92000000, // ₹9.2 Cr
        activeProjects: 24,
        topSector: 'Roads',
        topSectorKey: 'Roads',
        demandCount: 1150,
        deficitLabel: 'Pothole density in industrial feeder lanes',
        alignmentStatus: 'ALIGNED',
        alignmentVerdict: 'Surface road upgrades track planned maintenance targets.'
      }
    };

    districts.forEach(d => {
      const key = d.id.toLowerCase();
      const anchor = anchorData[key];

      if (anchor) {
        map.set(d.id, {
          id: d.id,
          name: d.name,
          state: d.state || 'Andhra Pradesh',
          lat: d.lat || 16.3067,
          lon: d.lon || 80.4365,
          investmentInr: anchor.investmentInr,
          activeProjectsCount: anchor.activeProjects,
          topSector: anchor.topSector,
          topSectorKey: anchor.topSectorKey,
          demandCount: anchor.demandCount,
          deficitLabel: anchor.deficitLabel,
          alignmentStatus: anchor.alignmentStatus,
          alignmentVerdict: anchor.alignmentVerdict,
          hasData: true
        });
      } else if (d.planned_investment && d.planned_investment > 0) {
        map.set(d.id, {
          id: d.id,
          name: d.name,
          state: d.state || 'India',
          lat: d.lat || 16.5,
          lon: d.lon || 80.5,
          investmentInr: d.planned_investment,
          activeProjectsCount: Math.max(5, Math.round(d.planned_investment / 1500000)),
          topSector: 'Roads',
          topSectorKey: 'Roads',
          demandCount: Math.round(d.population ? d.population * 0.0003 : 600),
          deficitLabel: `Road quality index at ${Math.round((d.road_quality || 0.5) * 100)}%`,
          alignmentStatus: 'ALIGNED',
          alignmentVerdict: 'Capital deployment is proportionate to localized grievance volume.',
          hasData: true
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.investmentInr - a.investmentInr);
  }, [districts]);

  // Filtered district investments based on State & Sector dropdowns
  const filteredDistrictInvestments = useMemo(() => {
    return districtInvestments.filter(item => {
      if (selectedState !== 'ALL' && item.state.toLowerCase() !== selectedState.toLowerCase()) {
        return false;
      }
      if (selectedDistrictId !== 'ALL' && item.id !== selectedDistrictId) {
        return false;
      }
      if (selectedSector !== 'ALL' && item.topSector.toLowerCase() !== selectedSector.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [districtInvestments, selectedState, selectedDistrictId, selectedSector]);

  // Selected district entity for the Insight panel
  const selectedDistrictData = useMemo(() => {
    if (selectedDistrictId === 'ALL') {
      // If "ALL" is selected, highlight the top district in current filter view (or Guntur by default)
      if (filteredDistrictInvestments.length > 0) {
        return filteredDistrictInvestments[0];
      }
      return null;
    }
    return districtInvestments.find(d => d.id === selectedDistrictId) || null;
  }, [selectedDistrictId, filteredDistrictInvestments, districtInvestments]);

  // Map center calculation
  const mapCenter = useMemo<[number, number]>(() => {
    if (selectedDistrictData && selectedDistrictData.lat && selectedDistrictData.lon) {
      return [selectedDistrictData.lat, selectedDistrictData.lon];
    }
    if (filteredDistrictInvestments.length > 0) {
      return [filteredDistrictInvestments[0].lat, filteredDistrictInvestments[0].lon];
    }
    return [16.3067, 80.4365]; // Andhra Pradesh / Guntur centroid
  }, [selectedDistrictData, filteredDistrictInvestments]);

  // Sector breakdown calculations for "What is it being spent on?"
  const sectorBreakdown = useMemo(() => {
    const totalAlloc = MAJOR_GOVERNMENT_SCHEMES.reduce((sum, s) => sum + s.stateAllocationInr, 0);
    const sectors: {
      category: InfrastructureCategory;
      name: string;
      allocatedInr: number;
      spentInr: number;
      percentage: number;
      totalProjects: number;
      completedProjects: number;
      delayedProjects: number;
    }[] = [
      {
        category: 'Water',
        name: 'Water & Sanitation (JJM)',
        allocatedInr: 500000000,
        spentInr: 390000000,
        percentage: Math.round((500000000 / totalAlloc) * 1000) / 10,
        totalProjects: 120,
        completedProjects: 82,
        delayedProjects: 25
      },
      {
        category: 'Roads',
        name: 'Rural Roads (PMGSY)',
        allocatedInr: 320000000,
        spentInr: 200000000,
        percentage: Math.round((320000000 / totalAlloc) * 1000) / 10,
        totalProjects: 85,
        completedProjects: 54,
        delayedProjects: 22
      },
      {
        category: 'Healthcare',
        name: 'Healthcare Centers (NHM)',
        allocatedInr: 220000000,
        spentInr: 110000000,
        percentage: Math.round((220000000 / totalAlloc) * 1000) / 10,
        totalProjects: 45,
        completedProjects: 28,
        delayedProjects: 12
      },
      {
        category: 'Drainage',
        name: 'Urban Drainage & Sewage (SBM)',
        allocatedInr: 180000000,
        spentInr: 130000000,
        percentage: Math.round((180000000 / totalAlloc) * 1000) / 10,
        totalProjects: 60,
        completedProjects: 30,
        delayedProjects: 16
      },
      {
        category: 'Electricity',
        name: 'Power Distribution (AP Transco)',
        allocatedInr: 160000000,
        spentInr: 60000000,
        percentage: Math.round((160000000 / totalAlloc) * 1000) / 10,
        totalProjects: 30,
        completedProjects: 16,
        delayedProjects: 10
      }
    ];

    if (selectedSector !== 'ALL') {
      return sectors.filter(s => s.category.toLowerCase() === selectedSector.toLowerCase());
    }
    return sectors;
  }, [selectedSector]);

  // Sector with highest investment for the short automatic explanation
  const topSectorExplanation = useMemo(() => {
    if (sectorBreakdown.length === 0) return '';
    const top = [...sectorBreakdown].sort((a, b) => b.allocatedInr - a.allocatedInr)[0];
    return `${top.name.split(' (')[0]} accounts for the largest share (${top.percentage}%) of tracked public investment.`;
  }, [sectorBreakdown]);

  // Comparative alignment data: Investment Share % vs Citizen Demand %
  const alignmentComparisons = useMemo(() => {
    const totalComplaints = 18450;
    const totalAlloc = 1380000000;

    const data: {
      category: InfrastructureCategory;
      name: string;
      investmentPct: number;
      demandPct: number;
      status: 'ALIGNED' | 'INVESTMENT_GAP' | 'HIGH_INVESTMENT_LOW_DEMAND';
      explanation: string;
    }[] = [
      {
        category: 'Water',
        name: getCategoryLabel('Water'),
        investmentPct: 36.2,
        demandPct: 26.1, // 4,820 complaints / 18,450
        status: 'INVESTMENT_GAP',
        explanation: 'High capital allocation exists, but execution bottlenecks on 25 delayed contracts leave acute access deficits unresolved.'
      },
      {
        category: 'Healthcare',
        name: getCategoryLabel('Healthcare'),
        investmentPct: 15.9,
        demandPct: 27.7, // 5,120 complaints / 18,450
        status: 'INVESTMENT_GAP',
        explanation: 'Citizen demand represents 27.7% of all recorded grievances, yet primary health receives only 15.9% of capital allocation.'
      },
      {
        category: 'Roads',
        name: getCategoryLabel('Roads'),
        investmentPct: 23.2,
        demandPct: 21.1, // 3,890 complaints / 18,450
        status: 'ALIGNED',
        explanation: 'Investment broadly matches citizen demand volume, though quality monitoring is recommended for monsoon resilience.'
      },
      {
        category: 'Drainage',
        name: getCategoryLabel('Drainage'),
        investmentPct: 13.0,
        demandPct: 12.5, // 2,310 complaints / 18,450
        status: 'ALIGNED',
        explanation: 'Capital allocation is proportionate to grievance density in urban drainage basins.'
      },
      {
        category: 'Electricity',
        name: getCategoryLabel('Electricity'),
        investmentPct: 11.6,
        demandPct: 12.5, // 2,310 complaints / 18,450
        status: 'HIGH_INVESTMENT_LOW_DEMAND',
        explanation: 'Capital expenditure utilization remains low (37.5%), indicating funds are committed but not yet drawn down on the ground.'
      }
    ];

    if (selectedSector !== 'ALL') {
      return data.filter(d => d.category.toLowerCase() === selectedSector.toLowerCase());
    }
    return data;
  }, [t, selectedSector]);

  // High priority mismatches for "Where are the gaps?"
  const priorityGaps = useMemo(() => {
    return [
      {
        id: 'gap-water-guntur',
        location: 'Guntur Rural',
        districtId: 'guntur',
        category: 'Water' as InfrastructureCategory,
        sectorName: getCategoryLabel('Water'),
        status: 'HIGH_NEED' as const,
        whyItMatters: '₹39 Cr expended, but 37 rural habitations lack functioning piped water due to contractor stalls on 25 pipeline extensions.',
        actionTarget: 'recommendations'
      },
      {
        id: 'gap-health-vijayawada',
        location: 'Vijayawada Outer Rural',
        districtId: 'vijayawada',
        category: 'Healthcare' as InfrastructureCategory,
        sectorName: getCategoryLabel('Healthcare'),
        status: 'INVESTMENT_GAP' as const,
        whyItMatters: '14,200 residents isolated from primary health centers with 5,120 complaints logged, while ₹11 Cr in NHM capital remains unspent.',
        actionTarget: 'recommendations'
      },
      {
        id: 'gap-power-kurnool',
        location: 'Kurnool Agrarian Belt',
        districtId: 'kurnool',
        category: 'Electricity' as InfrastructureCategory,
        sectorName: getCategoryLabel('Electricity'),
        status: 'INVESTMENT_GAP' as const,
        whyItMatters: '108% transformer overload recorded during peak agricultural irrigation cycles with ₹10 Cr pending sanction release.',
        actionTarget: 'issues'
      },
      {
        id: 'gap-road-guntur',
        location: 'Guntur Highway Corridor',
        districtId: 'guntur',
        category: 'Roads' as InfrastructureCategory,
        sectorName: getCategoryLabel('Roads'),
        status: 'HIGH_NEED' as const,
        whyItMatters: '42 km asphalt constructed under PMGSY Phase 3, but citizen complaints surged +31% within 90 days from heavy rain erosion.',
        actionTarget: 'recommendations'
      }
    ];
  }, [t]);

  // Filter detailed schemes table
  const detailedFilteredSchemes = useMemo(() => {
    return MAJOR_GOVERNMENT_SCHEMES.filter(scheme => {
      if (selectedSector !== 'ALL' && scheme.category.toLowerCase() !== selectedSector.toLowerCase()) {
        return false;
      }
      if (detailSearchQuery.trim()) {
        const q = detailSearchQuery.toLowerCase();
        return scheme.schemeName.toLowerCase().includes(q) ||
               scheme.department.toLowerCase().includes(q) ||
               scheme.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [selectedSector, detailSearchQuery]);

  return (
    <div id="government-investment-page" className="space-y-8 font-sans text-[#171717] pb-12">
      
      {/* 1. HEADER & HIGH-LEVEL FILTERS */}
      <div id="investment-header-section" className="bg-[#FFFFFF] border border-[#171717]/15 p-6 md:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#171717]/10 pb-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#FAF8F5] text-[#D65A3A] border border-[#D65A3A]/30 text-[10px] font-mono font-bold tracking-wider uppercase rounded-xs">
                {t('investment.page_label') || 'Government Investment'}
              </span>
              <span className="text-xs font-mono text-[#171717]/60 uppercase tracking-wider">
                Step 4 · Check Investment
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#171717] tracking-tight">
              {t('investment.question_title') || 'Is investment aligned with need?'}
            </h1>
            <p className="text-sm sm:text-base text-[#171717]/80 leading-relaxed">
              {t('investment.page_subtitle')}
            </p>
          </div>

          {onNavigateToEngine && (
            <div className="shrink-0">
              <button
                id="btn-navigate-priority-engine"
                onClick={onNavigateToEngine}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#D65A3A] hover:bg-[#c24a2c] text-white text-xs font-mono font-bold uppercase transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer rounded-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Prioritize Interventions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Narrative Context Banner */}
        <div className="bg-[#FAF8F5] border border-[#171717]/15 p-4 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D65A3A] block">
              Why Investment Audits Matter
            </span>
            <p className="text-[#34322D] leading-relaxed">
              <strong className="text-[#171717]">HIGH NEED + LOW INVESTMENT = FUNDING DEFICIT.</strong>{' '}
              High Need + High Incomplete Investment = Execution Bottleneck. Comparing expenditure records with ground reality ensures that civic leaders can direct capital where it resolves verified community distress.
            </p>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 bg-white border border-[#171717]/15 rounded-xs shrink-0 text-[#171717] font-semibold">
            {totalProjects} Tracked Projects
          </span>
        </div>

        {/* GEOGRAPHIC & SECTOR FILTERS */}
        <div id="investment-filter-controls" className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* State Filter */}
          <div className="space-y-1">
            <label htmlFor="filter-select-state" className="text-[11px] font-mono font-bold uppercase text-[#171717]/70 block">
              {t('investment.filter_state')}
            </label>
            <select
              id="filter-select-state"
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedDistrictId('ALL');
              }}
              className="w-full px-3 py-2 bg-[#F7F5EF] border border-[#171717]/25 text-xs font-mono font-medium text-[#171717] focus:outline-none focus:border-[#D65A3A] transition-colors"
            >
              <option value="ALL">{t('investment.all_states')}</option>
              {availableStates.map(stateName => (
                <option key={stateName} value={stateName}>
                  {stateName}
                </option>
              ))}
            </select>
          </div>

          {/* District Filter */}
          <div className="space-y-1">
            <label htmlFor="filter-select-district" className="text-[11px] font-mono font-bold uppercase text-[#171717]/70 block">
              {t('investment.filter_district')}
            </label>
            <select
              id="filter-select-district"
              value={selectedDistrictId}
              onChange={(e) => setSelectedDistrictId(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7F5EF] border border-[#171717]/25 text-xs font-mono font-medium text-[#171717] focus:outline-none focus:border-[#D65A3A] transition-colors"
            >
              <option value="ALL">{t('investment.all_districts')}</option>
              {availableDistricts.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sector Filter */}
          <div className="space-y-1">
            <label htmlFor="filter-select-sector" className="text-[11px] font-mono font-bold uppercase text-[#171717]/70 block">
              {t('investment.filter_sector')}
            </label>
            <select
              id="filter-select-sector"
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7F5EF] border border-[#171717]/25 text-xs font-mono font-medium text-[#171717] focus:outline-none focus:border-[#D65A3A] transition-colors"
            >
              <option value="ALL">{t('investment.all_sectors')}</option>
              <option value="Water">{getCategoryLabel('Water')}</option>
              <option value="Roads">{getCategoryLabel('Roads')}</option>
              <option value="Healthcare">{getCategoryLabel('Healthcare')}</option>
              <option value="Drainage">{getCategoryLabel('Drainage')}</option>
              <option value="Electricity">{getCategoryLabel('Electricity')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. INVESTMENT SNAPSHOT (HERO METRICS) */}
      <div id="investment-snapshot-section" className="bg-[#FFFFFF] border border-[#171717]/15 p-6 space-y-4">
        <div className="border-b border-[#171717]/10 pb-2">
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#D65A3A] block">
            EXECUTIVE AUDIT SUMMARY
          </span>
          <h2 className="text-lg font-serif font-bold text-[#171717]">
            Public Investment Snapshot
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          {/* Total Investment */}
          <div id="metric-total-investment" className="bg-[#F7F5EF] p-4 border border-[#171717]/15 space-y-1">
            <span className="text-[10px] text-[#171717]/70 uppercase tracking-wider block font-bold">
              {t('investment.total_investment')}
            </span>
            <div className="text-2xl lg:text-3xl font-bold text-[#171717] tracking-tight">
              {formatCr(totalAllocated)}
            </div>
            <p className="text-[11px] text-[#171717]/70 leading-normal">
              {t('investment.total_investment_desc')}
            </p>
          </div>

          {/* Active Projects */}
          <div id="metric-active-projects" className="bg-[#F7F5EF] p-4 border border-[#171717]/15 space-y-1">
            <span className="text-[10px] text-[#171717]/70 uppercase tracking-wider block font-bold">
              {t('investment.active_projects')}
            </span>
            <div className="text-2xl lg:text-3xl font-bold text-[#171717] tracking-tight">
              {totalProjects}
            </div>
            <p className="text-[11px] text-[#171717]/70 leading-normal">
              {delayedProjects} delayed, {completedProjects} completed
            </p>
          </div>

          {/* Completion Rate */}
          <div id="metric-completion-rate" className="bg-[#F7F5EF] p-4 border border-[#171717]/15 space-y-1">
            <span className="text-[10px] text-[#171717]/70 uppercase tracking-wider block font-bold">
              {t('investment.completion_rate')}
            </span>
            <div className="text-2xl lg:text-3xl font-bold text-emerald-800 tracking-tight">
              {completionRatePct}%
            </div>
            <p className="text-[11px] text-[#171717]/70 leading-normal">
              {t('investment.completion_rate_desc')}
            </p>
          </div>

          {/* High-Need Areas Without Adequate Investment */}
          <div id="metric-high-need-areas" className="bg-[#F7F5EF] p-4 border border-[#171717]/15 space-y-1">
            <span className="text-[10px] text-[#D65A3A] uppercase tracking-wider block font-bold">
              {t('investment.high_need_areas')}
            </span>
            <div className="text-2xl lg:text-3xl font-bold text-[#D65A3A] tracking-tight">
              3 Districts
            </div>
            <p className="text-[11px] text-[#171717]/70 leading-normal">
              {t('investment.high_need_areas_desc')}
            </p>
          </div>
        </div>

        {/* Short explanation beneath */}
        <div className="p-3 bg-[#F7F5EF]/60 border-l-2 border-[#D65A3A] text-xs text-[#171717]/80 leading-relaxed">
          <strong>Key Takeaway:</strong> Out of {formatCr(totalAllocated)} approved state capital, {formatCr(totalSpent)} has been expended on ground projects. While {completionRatePct}% of planned infrastructure works have reached completion, 3 high-need rural pockets show sustained citizen grievance signals alongside delayed public contracts.
        </div>
      </div>

      {/* 3. WHERE IS THE MONEY GOING? (MAP + RANKED LIST) */}
      <div id="section-where-money-going" className="bg-[#FFFFFF] border border-[#171717]/15 p-6 md:p-8 space-y-6">
        <div className="border-b border-[#171717]/10 pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#D65A3A]" />
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#171717]">
              {t('investment.where_money_going')}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#171717]/70 mt-1">
            {t('investment.where_money_desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Map Column (7 cols on lg) */}
          <div className="lg:col-span-7 bg-[#F7F5EF] border border-[#171717]/20 p-2 relative h-[380px] sm:h-[440px] flex flex-col">
            <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-mono font-bold uppercase border border-[#171717]/20 shadow-xs">
              📍 Capital Distribution Map (Circle Size = Investment)
            </div>

            <MapContainer
              center={mapCenter}
              zoom={7}
              scrollWheelZoom={false}
              className="w-full h-full z-0"
              style={{ background: '#f5f5f4' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
              <MapFocusController center={mapCenter} zoom={7} />

              {filteredDistrictInvestments.map(item => {
                const isSelected = selectedDistrictData?.id === item.id;
                // Radius proportional to investment: 12px min to 28px max
                const radius = Math.max(12, Math.min(28, Math.round(item.investmentInr / 25000000)));

                return (
                  <CircleMarker
                    key={item.id}
                    center={[item.lat, item.lon]}
                    radius={radius}
                    pathOptions={{
                      color: isSelected ? '#171717' : '#D65A3A',
                      fillColor: isSelected ? '#D65A3A' : '#b45309',
                      fillOpacity: isSelected ? 0.9 : 0.65,
                      weight: isSelected ? 3 : 1.5
                    }}
                    eventHandlers={{
                      click: () => {
                        setSelectedDistrictId(item.id);
                      }
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                      <div className="text-xs font-mono p-1">
                        <strong className="block text-[#171717]">{item.name}</strong>
                        <span className="text-[#D65A3A] font-bold">{formatCr(item.investmentInr)}</span>
                        <span className="block text-[#171717]/70 text-[10px]">
                          {item.activeProjectsCount} projects · {item.topSector}
                        </span>
                      </div>
                    </Tooltip>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>

          {/* Ranked List Column (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-[#171717]/70 tracking-wider">
                  Top Districts by Tracked Capital
                </span>
                <span className="text-[11px] font-mono text-[#171717]/50">
                  {filteredDistrictInvestments.length} tracked
                </span>
              </div>

              {filteredDistrictInvestments.length === 0 ? (
                <div className="p-6 bg-[#F7F5EF] border border-[#171717]/15 text-center text-xs font-mono text-[#171717]/70">
                  {t('investment.no_investment_data')}
                </div>
              ) : (
                <div className="border border-[#171717]/15 divide-y divide-[#171717]/10 bg-white">
                  {filteredDistrictInvestments.slice(0, 5).map((item, idx) => {
                    const isSelected = selectedDistrictData?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedDistrictId(item.id)}
                        className={`p-3.5 transition-colors cursor-pointer flex items-center justify-between ${
                          isSelected ? 'bg-[#D65A3A]/10 border-l-4 border-l-[#D65A3A]' : 'hover:bg-[#F7F5EF]'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-[#171717]/40 w-4">
                              #{idx + 1}
                            </span>
                            <span className="text-sm font-bold text-[#171717]">
                              {item.name}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#171717]/70 block pl-6">
                            Top Sector: <strong>{item.topSector}</strong> · {item.activeProjectsCount} projects
                          </span>
                        </div>

                        <div className="text-right font-mono">
                          <span className="text-sm font-bold text-[#171717] block">
                            {formatCr(item.investmentInr)}
                          </span>
                          <span className="text-[10px] text-[#D65A3A] font-semibold">
                            {item.alignmentStatus === 'INVESTMENT_GAP' ? 'High Gap' : 'Aligned'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Short explanation beneath */}
            <div className="p-3 bg-[#F7F5EF] border border-[#171717]/15 text-xs text-[#171717]/80 leading-relaxed">
              <strong>Geographic Insight:</strong> Public investment is heavily concentrated along the coastal and central corridors (Guntur and Vijayawada receiving &gt;75% of state allocations), while western dryland districts remain dependent on decentralized local allocations.
            </div>
          </div>
        </div>
      </div>

      {/* 4. WHAT IS IT BEING SPENT ON? (SECTOR BREAKDOWN) */}
      <div id="section-what-spent-on" className="bg-[#FFFFFF] border border-[#171717]/15 p-6 md:p-8 space-y-6">
        <div className="border-b border-[#171717]/10 pb-3">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-[#D65A3A]" />
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#171717]">
              {t('investment.what_spent_on')}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#171717]/70 mt-1">
            {t('investment.what_spent_desc')}
          </p>
        </div>

        {/* Horizontal Bars */}
        <div className="space-y-4">
          {sectorBreakdown.map((sec) => (
            <div key={sec.category} className="p-4 bg-[#F7F5EF] border border-[#171717]/15 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-1">
                <span className="font-bold text-sm text-[#171717]">
                  {sec.name}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[#171717]/70">
                    {sec.totalProjects} projects ({sec.completedProjects} done, <span className="text-amber-700 font-bold">{sec.delayedProjects} delayed</span>)
                  </span>
                  <span className="font-bold text-sm text-[#171717]">
                    {formatCr(sec.allocatedInr)} ({sec.percentage}%)
                  </span>
                </div>
              </div>

              {/* Progress track */}
              <div className="w-full h-3.5 bg-slate-200 border border-[#171717]/15 overflow-hidden">
                <div 
                  className="h-full bg-[#171717] transition-all duration-500"
                  style={{ width: `${Math.min(100, sec.percentage * 2.5)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Short calculated explanation beneath */}
        <div className="p-3 bg-[#F7F5EF] border-l-2 border-[#D65A3A] text-xs text-[#171717]/80 leading-relaxed">
          <strong>Sectoral Insight:</strong> {topSectorExplanation} Rural road networks follow at 23.2%, while primary healthcare represents 15.9% of capital allocation.
        </div>
      </div>

      {/* 5. DOES THAT INVESTMENT ALIGN WITH CITIZEN DEMAND? (COMPARATIVE VISUALIZATION) */}
      <div id="section-investment-alignment" className="bg-[#FFFFFF] border border-[#171717]/15 p-6 md:p-8 space-y-6">
        <div className="border-b border-[#171717]/10 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#D65A3A]" />
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#171717]">
              {t('investment.is_aligned')}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#171717]/70 mt-1">
            {t('investment.is_aligned_desc')}
          </p>
        </div>

        <div className="space-y-4">
          {alignmentComparisons.map((row) => {
            const isGap = row.status === 'INVESTMENT_GAP';
            const isLowDemand = row.status === 'HIGH_INVESTMENT_LOW_DEMAND';

            return (
              <div 
                key={row.category} 
                className="p-4 bg-[#F7F5EF] border border-[#171717]/15 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#171717]/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#171717]">
                      {row.name}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isGap && (
                      <span className="px-2.5 py-0.5 bg-rose-100 text-rose-900 border border-rose-400 text-[11px] font-mono font-bold uppercase rounded-xs">
                        {t('investment.investment_gap')}
                      </span>
                    )}
                    {isLowDemand && (
                      <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-400 text-[11px] font-mono font-bold uppercase rounded-xs">
                        {t('investment.high_invest_lower_demand')}
                      </span>
                    )}
                    {!isGap && !isLowDemand && (
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-400 text-[11px] font-mono font-bold uppercase rounded-xs">
                        {t('investment.aligned')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Dual comparative bars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  {/* Public Investment Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#171717]/70 font-semibold">{t('investment.public_investment')} Share</span>
                      <span className="font-bold text-[#171717]">{row.investmentPct}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 border border-[#171717]/15 overflow-hidden">
                      <div 
                        className="h-full bg-[#171717]"
                        style={{ width: `${Math.min(100, row.investmentPct * 2.5)}%` }}
                      />
                    </div>
                  </div>

                  {/* Citizen Demand Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#D65A3A] font-semibold">{t('investment.citizen_demand')} Share</span>
                      <span className="font-bold text-[#D65A3A]">{row.demandPct}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 border border-[#171717]/15 overflow-hidden">
                      <div 
                        className="h-full bg-[#D65A3A]"
                        style={{ width: `${Math.min(100, row.demandPct * 2.5)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Derived 1-line explanation */}
                <p className="text-xs text-[#171717]/80 leading-relaxed italic">
                  "{row.explanation}"
                </p>

                {/* Action Links */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1">
                  {onNavigateToIssues && (
                    <button
                      onClick={() => onNavigateToIssues(selectedDistrictData?.id, row.category)}
                      className="text-[#D65A3A] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>{t('investment.view_related_issues')}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onNavigateToRecommendations && (
                    <button
                      onClick={() => onNavigateToRecommendations(selectedDistrictData?.id, row.category)}
                      className="text-[#171717] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>{t('investment.view_related_recs')}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. SELECTED DISTRICT INSIGHT PANEL */}
      <div id="section-selected-district-insight" className="bg-[#FFFFFF] border border-[#171717]/15 p-6 md:p-8 space-y-5">
        <div className="border-b border-[#171717]/10 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D65A3A] block">
              {t('investment.selected_district_insight')}
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#171717]">
              {selectedDistrictData ? `${selectedDistrictData.name}, ${selectedDistrictData.state}` : 'Statewide Perspective'}
            </h2>
          </div>

          {selectedDistrictData && (
            <span className={`px-2.5 py-1 text-xs font-mono font-bold uppercase border rounded-xs ${
              selectedDistrictData.alignmentStatus === 'INVESTMENT_GAP'
                ? 'bg-rose-100 text-rose-900 border-rose-400'
                : 'bg-emerald-100 text-emerald-900 border-emerald-400'
            }`}>
              {selectedDistrictData.alignmentStatus === 'INVESTMENT_GAP' ? t('investment.investment_gap') : t('investment.aligned')}
            </span>
          )}
        </div>

        {selectedDistrictData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-3 bg-[#F7F5EF] border border-[#171717]/15 space-y-1">
                <span className="text-[10px] text-[#171717]/60 uppercase block font-bold">
                  {t('investment.tracked_investment')}
                </span>
                <span className="text-lg font-bold text-[#171717] block">
                  {formatCr(selectedDistrictData.investmentInr)}
                </span>
                <span className="text-[10px] text-[#171717]/70">
                  {selectedDistrictData.activeProjectsCount} {t('investment.active_projects')}
                </span>
              </div>

              <div className="p-3 bg-[#F7F5EF] border border-[#171717]/15 space-y-1">
                <span className="text-[10px] text-[#171717]/60 uppercase block font-bold">
                  {t('investment.largest_sector')}
                </span>
                <span className="text-lg font-bold text-[#171717] block">
                  {selectedDistrictData.topSector}
                </span>
                <span className="text-[10px] text-[#171717]/70">
                  Primary infrastructure allocation
                </span>
              </div>

              <div className="p-3 bg-[#F7F5EF] border border-[#171717]/15 space-y-1">
                <span className="text-[10px] text-[#D65A3A] uppercase block font-bold">
                  {t('investment.civicpulse_signal')}
                </span>
                <span className="text-lg font-bold text-rose-800 block">
                  {selectedDistrictData.demandCount.toLocaleString()} {t('investment.citizen_reports')}
                </span>
                <span className="text-[10px] text-[#171717]/70">
                  {selectedDistrictData.deficitLabel}
                </span>
              </div>
            </div>

            {/* Concise calculated alignment verdict */}
            <div className="p-4 bg-[#F7F5EF] border-l-3 border-[#D65A3A] space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D65A3A] block">
                {t('investment.investment_alignment')} Verdict
              </span>
              <p className="text-xs sm:text-sm text-[#171717] leading-relaxed">
                {selectedDistrictData.alignmentVerdict}
              </p>
            </div>

            {/* Direct action link */}
            {onNavigateToRecommendations && (
              <div className="pt-1 flex justify-end">
                <button
                  onClick={() => onNavigateToRecommendations(selectedDistrictData.id, selectedDistrictData.topSectorKey)}
                  className="px-4 py-2 bg-[#171717] hover:bg-[#D65A3A] text-white text-xs font-mono font-bold uppercase transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{t('investment.view_related_recs')} for {selectedDistrictData.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 bg-[#F7F5EF] border border-[#171717]/15 text-center text-xs font-mono text-[#171717]/70">
            {t('investment.no_investment_data')}
          </div>
        )}
      </div>

      {/* 7. WHERE ARE THE GAPS? (PRIORITY INVESTMENT MISMATCHES) */}
      <div id="section-where-are-gaps" className="bg-[#FFFFFF] border border-[#171717]/15 p-6 md:p-8 space-y-6">
        <div className="border-b border-[#171717]/10 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#D65A3A]" />
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#171717]">
              {t('investment.where_gaps')}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#171717]/70 mt-1">
            {t('investment.attention_needed')}: Priority investment mismatches requiring closer administrative review.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {priorityGaps.map((gap) => (
            <div 
              key={gap.id}
              className="p-4 bg-[#F7F5EF] border border-[#171717]/15 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 border-b border-[#171717]/10 pb-2">
                  <span className="text-xs font-mono font-bold text-[#171717]">
                    📍 {gap.location} · {gap.sectorName}
                  </span>
                  <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase border rounded-xs ${
                    gap.status === 'HIGH_NEED' 
                      ? 'bg-rose-100 text-rose-900 border-rose-400' 
                      : 'bg-amber-100 text-amber-900 border-amber-400'
                  }`}>
                    {gap.status === 'HIGH_NEED' ? t('investment.high_need') : t('investment.investment_gap')}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#171717]/60 block">
                    {t('investment.why_it_matters')}
                  </span>
                  <p className="text-xs text-[#171717]/80 leading-relaxed">
                    {gap.whyItMatters}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#171717]/10 flex justify-end text-xs font-mono font-bold">
                {gap.actionTarget === 'recommendations' && onNavigateToRecommendations && (
                  <button
                    onClick={() => onNavigateToRecommendations(gap.districtId, gap.category)}
                    className="text-[#D65A3A] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{t('investment.view_related_recs')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {gap.actionTarget === 'issues' && onNavigateToIssues && (
                  <button
                    onClick={() => onNavigateToIssues(gap.districtId, gap.category)}
                    className="text-[#D65A3A] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{t('investment.view_related_issues')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. DETAILED DATA (PROGRESSIVE DISCLOSURE) */}
      <div id="section-detailed-data" className="bg-[#FFFFFF] border border-[#171717]/15">
        <button
          id="btn-toggle-detailed-data"
          onClick={() => setShowDetailedData(!showDetailedData)}
          className="w-full p-5 text-left flex items-center justify-between hover:bg-[#F7F5EF] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-[#D65A3A]" />
            <div>
              <h3 className="text-base font-serif font-bold text-[#171717]">
                {showDetailedData ? t('investment.hide_detailed_data') : t('investment.view_detailed_data')}
              </h3>
              <p className="text-xs text-[#171717]/60 font-mono">
                Departmental schemes, expenditure pipelines, and contractor execution audit
              </p>
            </div>
          </div>
          {showDetailedData ? (
            <ChevronUp className="w-5 h-5 text-[#171717]/60" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#171717]/60" />
          )}
        </button>

        {showDetailedData && (
          <div className="p-6 border-t border-[#171717]/15 space-y-5">
            {/* Search filter for detailed table */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-xs font-mono font-bold uppercase text-[#171717]/70">
                Tracked Schemes Table ({detailedFilteredSchemes.length} records)
              </span>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#171717]/50 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter scheme or department..."
                  value={detailSearchQuery}
                  onChange={(e) => setDetailSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#F7F5EF] border border-[#171717]/25 text-xs font-mono font-medium focus:outline-none focus:border-[#D65A3A]"
                />
              </div>
            </div>

            {/* Full schemes table */}
            <div className="overflow-x-auto border border-[#171717]/15">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead className="bg-[#171717] text-white">
                  <tr>
                    <th className="p-3 font-bold uppercase">Scheme / Department</th>
                    <th className="p-3 font-bold uppercase text-right">Allocated</th>
                    <th className="p-3 font-bold uppercase text-right">Expended</th>
                    <th className="p-3 font-bold uppercase text-right">Utilization</th>
                    <th className="p-3 font-bold uppercase text-center">Projects (Done/Delay)</th>
                    <th className="p-3 font-bold uppercase text-center">Audit Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#171717]/10 bg-white">
                  {detailedFilteredSchemes.map((scheme) => (
                    <tr key={scheme.schemeId} className="hover:bg-[#F7F5EF]/80 transition-colors">
                      <td className="p-3">
                        <strong className="text-[#171717] block">{scheme.schemeName}</strong>
                        <span className="text-[10px] text-[#171717]/60 block">{scheme.department}</span>
                      </td>
                      <td className="p-3 text-right font-bold text-[#171717]">
                        {formatCr(scheme.stateAllocationInr)}
                      </td>
                      <td className="p-3 text-right text-emerald-800 font-bold">
                        {formatCr(scheme.spentInr)}
                      </td>
                      <td className="p-3 text-right">
                        <span className={`font-bold ${scheme.utilizationPct > 80 ? 'text-emerald-700' : 'text-amber-800'}`}>
                          {scheme.utilizationPct}%
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span>{scheme.completedProjects} done / <span className="text-amber-700 font-bold">{scheme.delayedProjects} delayed</span></span>
                      </td>
                      <td className="p-3 text-center">
                        {scheme.primaryAnomaly ? (
                          <button
                            onClick={() => {
                              // Find corresponding anomaly in ALL_INVESTMENT_ANOMALIES
                              const matched: InvestmentAnomalySignal = ALL_INVESTMENT_ANOMALIES.find(a => a.id === scheme.primaryAnomaly?.id) || {
                                id: scheme.primaryAnomaly.id,
                                title: `${scheme.schemeName} Execution Anomaly`,
                                type: (scheme.primaryAnomaly.type || 'PROJECT_DELAYS_OVERRUNS') as AnomalySignalType,
                                severity: 'HIGH' as const,
                                districtId: scheme.primaryAnomaly.targetArea.toLowerCase().replace(/\s+/g, '-'),
                                districtName: scheme.primaryAnomaly.targetArea,
                                department: scheme.department,
                                schemeName: scheme.schemeName,
                                allocatedInr: scheme.stateAllocationInr,
                                spentInr: scheme.spentInr,
                                unspentInr: scheme.remainingInr,
                                projectsCount: scheme.totalProjects,
                                delayedCount: scheme.delayedProjects,
                                completedCount: scheme.completedProjects,
                                citizenComplaintsCount: scheme.citizenComplaintsCount,
                                outcomeTrend: scheme.primaryAnomaly.outcomeTrend,
                                aiInvestigationNote: `Audit required on contract execution for ${scheme.schemeName}.`,
                                recommendedActionType: 'FIX' as InterventionType
                              };
                              setSelectedAnomalyModal(matched);
                            }}
                            className="px-2 py-1 bg-[#D65A3A] hover:bg-[#c24a2c] text-white text-[10px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer"
                          >
                            Audit Details
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-bold">Standard Track</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 9. DATA SOURCE TRANSPARENCY */}
      <div id="investment-data-sources" className="p-4 bg-[#F7F5EF] border border-[#171717]/15 text-xs font-mono space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase text-[#171717]/70">
            {t('investment.data_sources')}
          </span>
          <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold uppercase rounded-xs">
            {t('investment.illustrative_badge')}
          </span>
        </div>
        <p className="text-[11px] text-[#171717]/70 leading-relaxed">
          Sourced from Open Government Data (OGD) Platform India, DARPG Monthly Grievance Reports, and Scheme Baselines (JJM, PMGSY, NHM, SBM). Ground telemetry is synchronized with CivicPulse Citizen Request feeds for public policy simulation and administrative demonstration.
        </p>
      </div>

      {/* ANOMALY INSPECTION & ACTION MODAL */}
      {selectedAnomalyModal && (
        <div className="fixed inset-0 z-50 bg-[#171717]/60 backdrop-blur-xs flex items-center justify-center p-4 font-mono">
          <div className="bg-[#F7F5EF] border-2 border-[#171717] max-w-2xl w-full p-6 space-y-4 shadow-[8px_8px_0px_#171717] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#171717] pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#D65A3A]" />
                <span className="text-sm font-bold text-[#171717] uppercase tracking-wider">
                  OFFICIAL AUDIT SIGNAL INVESTIGATION
                </span>
              </div>
              <button
                onClick={() => setSelectedAnomalyModal(null)}
                className="px-2 py-0.5 bg-[#171717] text-white font-bold text-xs hover:bg-[#D65A3A] transition-colors cursor-pointer"
              >
                ✕ CLOSE
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white border border-[#171717] space-y-1">
                <span className="text-[9px] font-bold text-[#D65A3A] uppercase">ANOMALY TITLE & SCHEME</span>
                <h3 className="text-sm font-bold text-[#171717]">{selectedAnomalyModal.title}</h3>
                <p className="text-[10px] text-[#171717]/70">Scheme: {selectedAnomalyModal.schemeName} ({selectedAnomalyModal.department})</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-[#171717] space-y-1">
                  <span className="text-[9px] font-bold text-[#171717]/60 uppercase">FINANCIAL EXPENDITURE</span>
                  <div className="text-sm font-bold text-[#171717]">{formatCr(selectedAnomalyModal.spentInr)} spent</div>
                  <span className="text-[10px] text-[#171717]/70">out of {formatCr(selectedAnomalyModal.allocatedInr)} allocated</span>
                </div>

                <div className="p-3 bg-white border border-[#171717] space-y-1">
                  <span className="text-[9px] font-bold text-[#171717]/60 uppercase">PROJECT EXECUTION</span>
                  <div className="text-sm font-bold text-amber-800">{selectedAnomalyModal.delayedCount} Delayed Projects</div>
                  <span className="text-[10px] text-[#171717]/70">{selectedAnomalyModal.completedCount} completed</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-300 space-y-1">
                <span className="text-[9px] font-bold text-amber-900 uppercase">OUTCOME TREND ANALYSIS</span>
                <p className="text-[#171717] italic">"{selectedAnomalyModal.outcomeTrend}"</p>
              </div>

              <div className="p-3 bg-[#171717] text-[#F7F5EF] space-y-1">
                <span className="text-[9px] font-bold text-amber-300 uppercase">AI RECOMMENDATION DECISION</span>
                <p className="text-white text-xs leading-relaxed">{selectedAnomalyModal.aiInvestigationNote}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#171717] flex justify-end gap-2 text-xs font-mono font-bold">
              <button
                onClick={() => setSelectedAnomalyModal(null)}
                className="px-4 py-2 bg-white border border-[#171717] hover:bg-[#171717]/10 cursor-pointer"
              >
                Dismiss Signal
              </button>

              <button
                onClick={() => {
                  setSelectedAnomalyModal(null);
                  if (onNavigateToEngine) onNavigateToEngine();
                }}
                className="px-4 py-2 bg-[#D65A3A] text-white hover:bg-[#c24a2c] shadow-[2px_2px_0px_#171717] cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Trigger {selectedAnomalyModal.recommendedActionType} Intervention in Priority Engine</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
