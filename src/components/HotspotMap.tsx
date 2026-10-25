import React, { useState, useMemo, useEffect } from 'react';
import { District, CitizenRequest, InfrastructureCategory, ScoreBreakdown, CountryCode } from '../types';
import { calculatePriorityScore, getCategoryAccess, getPriorityTier } from '../utils/scoring';
import { getCityDemandHotspot, filterRequestsByTime, CityDemandHotspot } from '../utils/demandAggregation';
import { matchesDistrict } from '../utils/districtMatcher';
import { IndiaMapCanvas, EvaluatedDistrict, MapLayerState, getReportEvidence, ReportEvidence } from './IndiaMapCanvas';
import { 
  getAvailableStates, 
  getDistrictsForState, 
  getLocalitiesForDistrict,
  getCoverageStatistics 
} from '../utils/geography';
import { 
  Layers, 
  X, 
  ChevronDown,
  Search, 
  Clock, 
  Eye, 
  FileText, 
  MapPin,
  Volume2,
  RotateCcw,
  Info,
  Building2,
  Database,
  ShieldAlert
} from 'lucide-react';
import { getPublicDataForDistrict } from '../data/publicDataService';
import { useLanguage } from '../context/LanguageContext';

interface HotspotMapProps {
  districts: District[];
  requests: CitizenRequest[];
  onSelectHotspotForPolicy: (district: District, category: InfrastructureCategory) => void;
  onOpenScoreModal: (breakdown: ScoreBreakdown, district: District, category: InfrastructureCategory) => void;
  selectedCountryCode?: CountryCode;
  onNavigateToBriefing?: () => void;
  onNavigateToEngine?: () => void;
  onNavigateToCommunityIssues?: (districtId?: string, category?: string) => void;
  onNavigateToRecommendations?: (districtId?: string, category?: string) => void;
}

const CATEGORIES: (InfrastructureCategory | 'All')[] = [
  'All', 'Water', 'Roads', 'Electricity', 'Health', 'Drainage', 'Sanitation'
];

type TimeFilterRange = '7d' | '30d' | '90d' | 'all';

export const HotspotMap: React.FC<HotspotMapProps> = ({
  districts,
  requests,
  onSelectHotspotForPolicy,
  onOpenScoreModal,
  selectedCountryCode = 'IN',
  onNavigateToBriefing,
  onNavigateToEngine,
  onNavigateToCommunityIssues,
  onNavigateToRecommendations,
}) => {
  const { t, tCategory, tPriority } = useLanguage();

  // Cascading Geography States
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedLocality, setSelectedLocality] = useState<string>('ALL');

  // Category & Time
  const [selectedCategory, setSelectedCategory] = useState<InfrastructureCategory | 'All'>('All');
  const [timeFilter, setTimeFilter] = useState<TimeFilterRange>('30d');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected location & drawer
  const [activeDistrictId, setActiveDistrictId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showDrawerDetails, setShowDrawerDetails] = useState(false);

  // Dropdown visibility states
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false);
  const [localityDropdownOpen, setLocalityDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
  const [layersDropdownOpen, setLayersDropdownOpen] = useState(false);
  
  // Evidence modal state
  const [evidenceModalData, setEvidenceModalData] = useState<{
    district: District;
    category: string;
    hotspot: CityDemandHotspot;
    evidence: ReportEvidence;
  } | null>(null);

  // Map layer states
  const [activeLayers, setActiveLayers] = useState({
    citizenDemand: true,
    infrastructure: false,
    populationVulnerability: false,
    governmentProjects: false,
  });

  const toggleLayer = (layerKey: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const mapCanvasLayers: MapLayerState = {
    citizen_demand: activeLayers.citizenDemand,
    infrastructure: activeLayers.infrastructure,
    population: activeLayers.populationVulnerability,
    projects: activeLayers.governmentProjects,
    healthcare: false,
    education: false,
    roads: false,
    digital: false,
  };

  // 1. Authoritative States list strictly for current country
  const availableStates = useMemo(() => {
    return getAvailableStates(selectedCountryCode, districts);
  }, [selectedCountryCode, districts]);

  // 2. Cascading Districts strictly for the selected state
  const availableDistricts = useMemo(() => {
    return getDistrictsForState(selectedState, selectedCountryCode, districts);
  }, [selectedState, selectedCountryCode, districts]);

  // 3. Cascading Localities strictly for the selected district
  const availableLocalities = useMemo(() => {
    return getLocalitiesForDistrict(selectedDistrict, selectedState, requests);
  }, [selectedDistrict, selectedState, requests]);

  // Cascading Handlers
  const handleSelectState = (st: string) => {
    setSelectedState(st);
    setSelectedDistrict('ALL');
    setSelectedLocality('ALL');
    setStateDropdownOpen(false);

    // If a state is selected, find the first registered district in that state to focus on, or clear
    if (st !== 'ALL') {
      const firstDist = districts.find(d => d.state.toLowerCase() === st.toLowerCase());
      if (firstDist) {
        setActiveDistrictId(firstDist.id);
      }
    } else {
      setActiveDistrictId(null);
      setIsDrawerOpen(false);
    }
  };

  const handleSelectDistrict = (distName: string, distId?: string) => {
    setSelectedDistrict(distName);
    setSelectedLocality('ALL');
    setDistrictDropdownOpen(false);

    if (distName !== 'ALL') {
      const match = districts.find(d => 
        (distId && d.id === distId) || 
        d.name.toLowerCase() === distName.toLowerCase() ||
        d.id.toLowerCase() === distName.toLowerCase()
      );
      if (match) {
        setActiveDistrictId(match.id);
        setIsDrawerOpen(true);
      } else if (distId) {
        setActiveDistrictId(distId);
      }
    }
  };

  const handleSelectLocality = (loc: string) => {
    setSelectedLocality(loc);
    setLocalityDropdownOpen(false);
  };

  const handleResetFilters = () => {
    setSelectedState('ALL');
    setSelectedDistrict('ALL');
    setSelectedLocality('ALL');
    setSelectedCategory('All');
    setTimeFilter('30d');
    setSearchQuery('');
    setActiveDistrictId(null);
    setIsDrawerOpen(false);
  };

  // Close dropdowns on outside click helper
  const closeAllDropdowns = () => {
    setStateDropdownOpen(false);
    setDistrictDropdownOpen(false);
    setLocalityDropdownOpen(false);
    setCategoryDropdownOpen(false);
    setTimeDropdownOpen(false);
    setLayersDropdownOpen(false);
  };

  // Filter requests by time window
  const timeFilteredRequests = useMemo(() => {
    return filterRequestsByTime(requests, timeFilter);
  }, [requests, timeFilter]);

  // Geographic filtering of districts
  const filteredDistricts = useMemo(() => {
    let list = districts;
    if (selectedState !== 'ALL') {
      list = list.filter(d => d.state.toLowerCase() === selectedState.toLowerCase());
    }
    if (selectedDistrict !== 'ALL') {
      list = list.filter(d => 
        d.name.toLowerCase() === selectedDistrict.toLowerCase() ||
        d.id.toLowerCase() === selectedDistrict.toLowerCase()
      );
    }
    return list;
  }, [districts, selectedState, selectedDistrict]);

  // Evaluate districts using category-aware demand aggregation
  const districtEvaluations: EvaluatedDistrict[] = useMemo(() => {
    return filteredDistricts.map((district) => {
      const targetCategory: InfrastructureCategory = selectedCategory === 'All' ? 'Water' : selectedCategory;
      
      // Calculate hotspot metrics specific to the selected category and time window
      const demandHotspot = getCityDemandHotspot(district, timeFilteredRequests, selectedCategory);
      const currentAccess = getCategoryAccess(district, targetCategory);
      const demandCount = selectedCategory === 'All' ? demandHotspot.totalCitizenRequests : demandHotspot.categoryRequests;

      const matchedRequests = timeFilteredRequests.filter(
        (r) => {
          const matchDist = matchesDistrict(r, district);
          const matchCat = selectedCategory === 'All' || r.category === selectedCategory;
          const loc = (r.location || '').toLowerCase();
          const matchLocality = selectedLocality === 'ALL' || (r.locality && r.locality.toLowerCase() === selectedLocality.toLowerCase()) || loc.includes(selectedLocality.toLowerCase());
          return matchDist && matchCat && matchLocality;
        }
      );

      const avgSeverity = matchedRequests.length > 0
        ? Math.round(matchedRequests.reduce((acc, r) => acc + (r.severity || 5), 0) / matchedRequests.length)
        : (demandHotspot.urgencyLevel === 'Critical' ? 9 : demandHotspot.urgencyLevel === 'High' ? 7 : 5);

      const breakdown = calculatePriorityScore(district, targetCategory, avgSeverity, demandCount, currentAccess);

      return {
        district,
        category: targetCategory,
        demandCount,
        currentAccess,
        breakdown,
        matchedRequests,
        demandHotspot,
        priorityTier: getPriorityTier(demandHotspot.categoryScore || breakdown.total_score),
      };
    });
  }, [filteredDistricts, timeFilteredRequests, selectedCategory, selectedLocality]);

  // Active district evaluation
  const activeEvaluation = useMemo(() => {
    if (!activeDistrictId) return districtEvaluations[0] || null;
    return districtEvaluations.find(e => e.district.id === activeDistrictId) || 
           districtEvaluations[0] || null;
  }, [districtEvaluations, activeDistrictId]);

  // Sync filters and focus when URL parameters are present or district is selected via map
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlState = params.get('state');
    const urlDistrict = params.get('district');
    const urlLocality = params.get('locality');
    const urlHighlightPin = params.get('highlightPin');

    if (urlState && urlState !== 'ALL') {
      setSelectedState(urlState);
    }
    if (urlDistrict && urlDistrict !== 'ALL') {
      setSelectedDistrict(urlDistrict);
      // Find the district ID from the name if possible
      const distMatch = districts.find(d => d.name.toLowerCase() === urlDistrict.toLowerCase());
      if (distMatch) {
        setActiveDistrictId(distMatch.id);
        setIsDrawerOpen(true);
      }
    }
    if (urlLocality && urlLocality !== 'ALL') {
      setSelectedLocality(urlLocality);
    }
    
    // If specifically highlighted from a receipt, ensure drawer is open
    if (urlHighlightPin && !activeDistrictId && urlDistrict) {
      const distMatch = districts.find(d => d.name.toLowerCase() === urlDistrict.toLowerCase());
      if (distMatch) {
        setActiveDistrictId(distMatch.id);
        setIsDrawerOpen(true);
      }
    }
  }, [districts]);

  // Sync filters when district is selected via map interaction
  useEffect(() => {
    if (activeDistrictId) {
      const dist = districts.find(d => d.id === activeDistrictId);
      if (dist) {
        setSelectedState(dist.state);
        setSelectedDistrict(dist.name);
      }
    }
  }, [activeDistrictId, districts]);

  // Search filter list for quick jump
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return districts.filter(d => 
      d.name.toLowerCase().includes(q) || 
      d.state.toLowerCase().includes(q) || 
      d.zone.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [districts, searchQuery]);

  const handleSelectSearchedDistrict = (districtId: string) => {
    const found = districts.find(d => d.id === districtId);
    if (found) {
      setSelectedState(found.state);
      setSelectedDistrict(found.name);
      setSelectedLocality('ALL');
      setActiveDistrictId(districtId);
      setIsDrawerOpen(true);
    }
    setSearchQuery('');
  };

  const handleOpenEvidence = (district: District, category: string, hotspot: CityDemandHotspot) => {
    const evidence = getReportEvidence(district, category, hotspot);
    setEvidenceModalData({ district, category, hotspot, evidence });
  };

  const coverageStats = useMemo(() => getCoverageStatistics(districts), [districts]);

  const hasActiveFilters = 
    selectedState !== 'ALL' || 
    selectedDistrict !== 'ALL' || 
    selectedLocality !== 'ALL' || 
    selectedCategory !== 'All' || 
    timeFilter !== '30d' ||
    searchQuery.trim() !== '';

  // Calculate focused pin from URL if present
  const urlParams = useMemo(() => new URLSearchParams(window.location.search), [window.location.search]);
  const focusedPinId = urlParams.get('highlightPin');
  const focusedCoordinate = useMemo<[number, number] | null>(() => {
    const lat = parseFloat(urlParams.get('lat') || '');
    const lng = parseFloat(urlParams.get('lng') || '');
    if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
    return null;
  }, [urlParams]);

  return (
    <div className="flex flex-col w-full h-full max-w-full bg-slate-50 font-sans text-slate-900 overflow-hidden select-none">
      
      {/* 1. CONSOLIDATED ONE-ROW COMPACT RESPONSIVE MAP TOOLBAR */}
      <header className="bg-white border-b border-slate-200 px-3 py-2 sm:px-4 sm:py-3 z-20 shrink-0 flex flex-wrap items-center justify-between gap-2 sm:gap-3 text-sm font-sans max-w-full">
        
        {/* Left: District Inspector Label & Cascading Geographic Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0 flex-1 py-0.5">
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold tracking-tight rounded">
              {t('map.page_label') || 'India Overview'}
            </span>
            <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 whitespace-nowrap hidden xs:inline">
              {t('map.question_title') || 'Where is development needed?'}
            </span>
          </div>

          <span className="text-slate-300 hidden md:inline">•</span>

          {/* 1. STATE DROPDOWN (Strictly States / UTs) */}
          <div className="relative shrink-0">
            <button 
              onClick={() => {
                const next = !stateDropdownOpen;
                closeAllDropdowns();
                setStateDropdownOpen(next);
              }}
              className="bg-white border border-slate-200 px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center space-x-1.5 sm:space-x-2 hover:border-slate-400 transition-colors cursor-pointer text-slate-700 font-medium"
              title={selectedState === 'ALL' ? t('filter.all_states') : selectedState}
            >
              <span className="text-slate-400 font-normal hidden sm:inline">{t('state')}:</span>
              <span className="font-bold truncate max-w-[70px] sm:max-w-[100px] md:max-w-[130px]">{selectedState === 'ALL' ? t('filter.all_states') : selectedState}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>
            {stateDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 w-[min(240px,calc(100vw-2rem))] max-h-72 overflow-y-auto bg-white border border-slate-200 shadow-xl rounded-xl z-50 py-1 font-sans text-xs">
                <button
                  onClick={() => handleSelectState('ALL')}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                    selectedState === 'ALL' ? 'bg-orange-50 font-bold text-orange-600' : 'text-slate-800'
                  }`}
                >
                  <span className="truncate">{t('filter.all_states_uts')}</span>
                  {selectedState === 'ALL' && <span className="text-orange-600 font-bold">✓</span>}
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                {availableStates.map(st => (
                  <button
                    key={st}
                    onClick={() => handleSelectState(st)}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                      selectedState === st ? 'bg-orange-50 font-bold text-orange-600' : 'text-slate-800'
                    }`}
                  >
                    <span className="truncate">{st}</span>
                    {selectedState === st && <span className="text-orange-600 font-bold">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. DISTRICT DROPDOWN (Strictly for selected state) */}
          <div className="relative shrink-0">
            <button 
              onClick={() => {
                const next = !districtDropdownOpen;
                closeAllDropdowns();
                setDistrictDropdownOpen(next);
              }}
              className="bg-white border border-slate-200 px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center space-x-1.5 sm:space-x-2 hover:border-slate-400 transition-colors cursor-pointer text-slate-700 font-medium"
              title={selectedDistrict === 'ALL' ? t('filter.all_districts') : selectedDistrict}
            >
              <span className="text-slate-400 font-normal hidden sm:inline">{t('district')}:</span>
              <span className="font-bold truncate max-w-[70px] sm:max-w-[100px] md:max-w-[130px]">{selectedDistrict === 'ALL' ? t('filter.all_districts') : selectedDistrict}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>
            {districtDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 w-[min(240px,calc(100vw-2rem))] max-h-72 overflow-y-auto bg-white border border-slate-200 shadow-xl rounded-xl z-50 py-1 font-sans text-xs">
                <button
                  onClick={() => handleSelectDistrict('ALL')}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                    selectedDistrict === 'ALL' ? 'bg-orange-50 font-bold text-orange-600' : 'text-slate-800'
                  }`}
                >
                  <span className="truncate">{selectedState !== 'ALL' ? `${t('filter.all_districts')} (${selectedState})` : t('filter.all_districts')}</span>
                  {selectedDistrict === 'ALL' && <span className="text-orange-600 font-bold">✓</span>}
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                {availableDistricts.map(d => (
                  <button
                    key={d.name}
                    onClick={() => handleSelectDistrict(d.name, d.id)}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                      selectedDistrict === d.name ? 'bg-orange-50 font-bold text-orange-600' : 'text-slate-800'
                    }`}
                  >
                    <span className="truncate">{d.name}</span>
                    {selectedDistrict === d.name && <span className="text-orange-600 font-bold">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. CITY / TOWN / LOCALITY DROPDOWN */}
          <div className="relative shrink-0">
            <button 
              onClick={() => {
                if (selectedDistrict === 'ALL') return;
                const next = !localityDropdownOpen;
                closeAllDropdowns();
                setLocalityDropdownOpen(next);
              }}
              disabled={selectedDistrict === 'ALL'}
              className={`border px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center space-x-1.5 sm:space-x-2 transition-colors font-medium shadow-sm ${
                selectedDistrict === 'ALL'
                  ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400 cursor-pointer'
              }`}
              title={selectedLocality === 'ALL' ? t('filter.all_locations') : selectedLocality}
            >
              <span className="text-slate-400 font-normal hidden sm:inline">{t('locality')}:</span>
              <span className="font-bold truncate max-w-[65px] sm:max-w-[90px] md:max-w-[120px]">{selectedLocality === 'ALL' ? t('filter.all_locations') : selectedLocality}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>
            {localityDropdownOpen && availableLocalities.length > 0 && (
              <div className="absolute left-0 top-full mt-1 w-[min(220px,calc(100vw-2rem))] max-h-64 overflow-y-auto bg-white border border-slate-200 shadow-xl rounded-xl z-50 py-1 font-sans text-xs">
                <button
                  onClick={() => handleSelectLocality('ALL')}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                    selectedLocality === 'ALL' ? 'bg-orange-50 font-bold text-orange-600' : 'text-slate-800'
                  }`}
                >
                  <span className="truncate">{t('filter.all_locations_in', { district: selectedDistrict })}</span>
                  {selectedLocality === 'ALL' && <span className="text-orange-600 font-bold">✓</span>}
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                {availableLocalities.map(loc => (
                  <button
                    key={loc}
                    onClick={() => handleSelectLocality(loc)}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                      selectedLocality === loc ? 'bg-orange-50 font-bold text-orange-600' : 'text-slate-800'
                    }`}
                  >
                    <span className="truncate">{loc}</span>
                    {selectedLocality === loc && <span className="text-orange-600 font-bold">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4. Category Dropdown: [ All issues ▼ ] */}
          <div className="relative shrink-0">
            <button 
              onClick={() => {
                const next = !categoryDropdownOpen;
                closeAllDropdowns();
                setCategoryDropdownOpen(next);
              }}
              className="bg-white border border-slate-200 px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center space-x-1.5 sm:space-x-2 hover:border-slate-400 transition-colors cursor-pointer text-slate-700 font-medium shadow-sm"
            >
              <span className="truncate max-w-[80px] sm:max-w-[110px]">{selectedCategory === 'All' ? t('filter.all_issues') : tCategory(selectedCategory)}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>
            {categoryDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-slate-200 shadow-xl rounded-xl z-50 py-1 font-sans text-xs">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { 
                      setSelectedCategory(cat); 
                      setCategoryDropdownOpen(false); 
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                      selectedCategory === cat ? 'bg-orange-50 font-bold text-orange-600' : 'text-slate-800'
                    }`}
                  >
                    <span className="truncate">{cat === 'All' ? t('filter.all_issues') : tCategory(cat)}</span>
                    {selectedCategory === cat && <span className="text-orange-600 font-bold">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 5. Time Window Dropdown: [ 30 days ▼ ] */}
          <div className="relative shrink-0">
            <button 
              onClick={() => {
                const next = !timeDropdownOpen;
                closeAllDropdowns();
                setTimeDropdownOpen(next);
              }}
              className="bg-white border border-slate-200 px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center space-x-1.5 sm:space-x-2 hover:border-slate-400 transition-colors cursor-pointer text-slate-700 font-medium shadow-sm"
            >
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate max-w-[65px] sm:max-w-[85px]">{timeFilter === 'all' ? t('time.all_time') : timeFilter === '7d' ? t('time.7_days') : timeFilter === '30d' ? t('time.30_days') : t('time.90_days')}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>
            {timeDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 w-40 bg-white border border-slate-200 shadow-xl rounded-xl z-50 py-1 font-sans text-xs">
                {[
                  { id: '7d', label: t('time.7_days') },
                  { id: '30d', label: t('time.30_days') },
                  { id: '90d', label: t('time.90_days') },
                  { id: 'all', label: t('time.all_time') },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => { 
                      setTimeFilter(item.id as TimeFilterRange); 
                      setTimeDropdownOpen(false); 
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                      timeFilter === item.id ? 'bg-orange-50 font-bold text-orange-600' : 'text-slate-800'
                    }`}
                  >
                    <span>{item.label}</span>
                    {timeFilter === item.id && <span className="text-orange-600 font-bold">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 6. Layers Dropdown: [ Layers ▼ ] */}
          <div className="relative shrink-0">
            <button 
              onClick={() => {
                const next = !layersDropdownOpen;
                closeAllDropdowns();
                setLayersDropdownOpen(next);
              }}
              className="bg-white border border-slate-200 px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center space-x-1.5 sm:space-x-2 hover:border-slate-400 transition-colors cursor-pointer text-slate-700 font-medium shadow-sm"
            >
              <Layers className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="hidden sm:inline">{t('layers.title')}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>
            {layersDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-slate-200 shadow-xl rounded-xl z-50 p-2 font-sans text-xs space-y-1.5">
                <label className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-slate-50 rounded-lg">
                  <input 
                    type="checkbox" 
                    checked={activeLayers.citizenDemand} 
                    onChange={() => toggleLayer('citizenDemand')}
                    className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="font-medium text-slate-900">{t('layers.civic_signals')}</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-slate-50 rounded-lg">
                  <input 
                    type="checkbox" 
                    checked={activeLayers.infrastructure} 
                    onChange={() => toggleLayer('infrastructure')}
                    className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                  />
                  <span className="font-medium text-slate-900">{t('layers.infrastructure')}</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-slate-50 rounded-lg">
                  <input 
                    type="checkbox" 
                    checked={activeLayers.populationVulnerability} 
                    onChange={() => toggleLayer('populationVulnerability')}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-medium text-slate-900">{t('layers.vulnerability')}</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-slate-50 rounded-lg">
                  <input 
                    type="checkbox" 
                    checked={activeLayers.governmentProjects} 
                    onChange={() => toggleLayer('governmentProjects')}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium text-slate-900">{t('layers.projects')}</span>
                </label>
              </div>
            )}
          </div>

          {/* Quick Reset button if filters active */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              title="Reset all geographic and category filters"
              className="text-orange-600 hover:text-slate-900 transition-colors px-2 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('filter.reset')}</span>
            </button>
          )}
        </div>

        {/* Right: Search Location Input with Dropdown */}
        <div className="relative shrink-0 min-w-0">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus-within:border-slate-400 shadow-sm">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder={t('map.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-32 sm:w-40 md:w-48 text-slate-900 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-300 hover:text-slate-600 cursor-pointer ml-1.5">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="absolute right-0 top-full mt-1.5 w-[min(300px,calc(100vw-2rem))] bg-white border border-slate-200 shadow-2xl rounded-xl z-50 p-1.5 font-sans text-sm">
              {searchResults.map(d => (
                <button
                  key={d.id}
                  onClick={() => handleSelectSearchedDistrict(d.id)}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center justify-between text-slate-900 cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold truncate">{d.name}</div>
                    <div className="text-xs text-slate-500 truncate">{d.state}</div>
                  </div>
                  <span className="text-xs text-orange-600 font-bold shrink-0">Inspect →</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* 1.5 INDIA GEOGRAPHIC COVERAGE SUB-BAR */}
      <div className="bg-slate-900 text-slate-300 text-xs font-sans px-3 py-2.5 sm:px-4 z-15 shrink-0 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-slate-800 w-full max-w-full overflow-hidden">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 min-w-0">
          <span className="flex items-center gap-1.5 font-bold text-amber-400 text-[10px] shrink-0">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            National coverage
          </span>
          <span className="bg-slate-800 text-white px-2.5 py-1 rounded font-bold border border-slate-700 shrink-0">
            {coverageStats.representedStatesAndUTs} / {coverageStats.totalStatesAndUTs} States and union territories
          </span>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <span className="text-slate-100 shrink-0 hidden sm:inline font-medium">
            <strong className="text-white">{coverageStats.totalDistricts}</strong> districts with available data
          </span>
          <span className="text-slate-400 text-[11px] shrink-0 hidden md:inline">
            • Data availability varies by district
          </span>
        </div>
        <div className="hidden 2xl:flex items-center gap-2 text-[10px] text-slate-400 shrink-0">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Geographic representation across all 36 Indian States and UTs with transparent provenance.</span>
        </div>
      </div>

      {/* 2. HERO MAP WORKSPACE (OCCUPIES FULL VIEWPORT) */}
      <div className="flex-1 w-full min-h-0 relative overflow-hidden bg-[#121417]">
        
        {/* Full Viewport Canvas */}
        <div className="w-full h-full absolute inset-0">
            <IndiaMapCanvas
              evaluations={districtEvaluations}
              activeDistrictId={activeDistrictId || ''}
              onSelectDistrict={(id) => {
                setActiveDistrictId(id);
                setIsDrawerOpen(true);
              }}
              selectedCategory={selectedCategory}
              layers={mapCanvasLayers}
              onSelectHotspotForPolicy={onSelectHotspotForPolicy}
              selectedCountryCode={selectedCountryCode}
              onOpenEvidenceModal={handleOpenEvidence}
              focusedCoordinate={focusedCoordinate}
              focusedPinId={focusedPinId}
            />
        </div>

        {/* 3. PROGRESSIVE CONTEXTUAL DRAWER (OVERLAYS MAP ON HOTSPOT CLICK WITHOUT SQUEEZING CANVAS) */}
        {isDrawerOpen && activeEvaluation && (
          <aside className="absolute right-0 top-0 bottom-0 w-full sm:w-[360px] max-w-full bg-white/98 backdrop-blur-md border-l border-slate-200 shadow-2xl z-30 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="p-5 space-y-5">
              
              {/* Header with Close button */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-2xl font-sans font-bold text-slate-900 tracking-tight">
                    {activeEvaluation.district.name}
                  </h2>
                  <div className="text-sm text-slate-500 flex items-center gap-2 mt-1 font-sans">
                    <span className="font-medium">{activeEvaluation.district.state}</span>
                    <span className="text-slate-300">•</span>
                    <span>{t('map.pop_lakhs', { count: (activeEvaluation.district.population / 100000).toFixed(1) })} population</span>
                  </div>
                </div>
                <button
                  onClick={() => { 
                    setIsDrawerOpen(false); 
                    setActiveDistrictId(null); 
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Close Inspector"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Priority Index Score */}
              <div className="flex items-baseline justify-between bg-slate-50 p-4 border border-slate-100 rounded-xl">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block">Priority index</span>
                  <div className="flex items-baseline space-x-1 mt-1">
                    <span className="text-3xl font-bold text-slate-900">
                      {activeEvaluation.demandHotspot.categoryScore || activeEvaluation.breakdown.total_score}
                    </span>
                    <span className="text-sm text-slate-400">/ 100</span>
                  </div>
                </div>
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                  activeEvaluation.breakdown.total_score >= 70
                    ? 'bg-red-600 text-white shadow-sm shadow-red-200'
                    : activeEvaluation.breakdown.total_score >= 40
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                    : 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                }`}>
                  {tPriority(activeEvaluation.priorityTier.label)}
                </span>
              </div>

              {/* Main Issue & Request Volume */}
              <div className="bg-white p-4 border border-slate-100 rounded-xl shadow-sm space-y-1.5 text-sm">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>{selectedCategory === 'All' ? tCategory(activeEvaluation.demandHotspot.primaryCategory) : tCategory(selectedCategory)} sector</span>
                  <span className="font-sans text-orange-600 font-bold">
                    {activeEvaluation.demandCount.toLocaleString()} signals
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2 font-sans">
                  <span className="text-emerald-600 font-bold">↑ 22% increase</span>
                  <span className="text-slate-300">•</span>
                  <span>{t('time.this_month')}</span>
                  <span className="text-slate-300">•</span>
                  <span>Gap: {100 - Math.round(activeEvaluation.currentAccess)}%</span>
                </div>
              </div>

              {/* One Important Evidence Point */}
              {activeEvaluation.matchedRequests && activeEvaluation.matchedRequests.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-slate-500 block">Citizen voice</span>
                  {activeEvaluation.matchedRequests.slice(0, 3).map((req, idx) => (
                    <div key={req.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-sm shadow-sm">
                    <div className="text-[10px] font-bold text-orange-600 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5" />
                        {req.language} submission
                      </span>
                      {req.translated_text && <span className="text-[9px] text-slate-400 lowercase">Translation available</span>}
                    </div>
                      <div className="text-slate-900 leading-relaxed font-sans font-medium italic">
                        "{req.original_text}"
                      </div>
                      {req.translated_text && (
                        <div className="text-xs text-slate-500 font-sans border-t border-slate-200 pt-2 mt-2 leading-relaxed">
                          <span className="font-bold text-[10px] uppercase text-slate-400 block mb-1">English translation:</span>
                          {req.translated_text}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Public Data Context (data.gov.in / IMD / WHO) */}
              {(() => {
                const targetCat = selectedCategory === 'All' ? activeEvaluation.demandHotspot.primaryCategory : selectedCategory;
                const publicIndicators = getPublicDataForDistrict(activeEvaluation.district.name, targetCat);
                if (publicIndicators.length === 0) return null;
                const primaryInd = publicIndicators[0];
                return (
                  <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl space-y-2 text-sm">
                    <div className="flex items-center justify-between text-[10px] text-blue-600 uppercase tracking-widest font-bold">
                      <span className="flex items-center gap-1.5">
                        <Database className="w-3 h-3" />
                        <span>Public context</span>
                      </span>
                      <span className="font-sans font-normal text-blue-400">
                        Source: {primaryInd.source} ({primaryInd.year})
                      </span>
                    </div>
                    <div className="text-sm font-bold text-blue-900">
                      {primaryInd.indicator}: {primaryInd.value} {primaryInd.unit}
                    </div>
                    {primaryInd.contextSummary && (
                      <div className="text-xs text-blue-800/70 font-sans leading-relaxed">
                        {primaryInd.contextSummary}
                      </div>
                    )}
                    {primaryInd.isSyntheticDemo && (
                      <div className="text-[9px] text-blue-400 italic">
                        *Illustrative demo dataset for non-cataloged metrics
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Primary Action Buttons */}
              <div className="grid grid-cols-1 gap-2.5 pt-2">
                <button
                  onClick={() => {
                    if (onNavigateToCommunityIssues) {
                      onNavigateToCommunityIssues(activeEvaluation.district.id, selectedCategory === 'All' ? undefined : selectedCategory);
                    }
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 text-xs font-sans font-bold uppercase tracking-widest transition-all rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-orange-400" />
                  <span>Explore issues</span>
                </button>

                <button
                  onClick={() => {
                    if (onNavigateToRecommendations) {
                      onNavigateToRecommendations(activeEvaluation.district.id, selectedCategory === 'All' ? undefined : selectedCategory);
                    } else {
                      onSelectHotspotForPolicy(activeEvaluation.district, activeEvaluation.category);
                    }
                  }}
                  className="w-full bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 py-3 px-4 text-xs font-sans font-bold uppercase tracking-widest transition-all rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <span>Synthesize project →</span>
                </button>
              </div>

              {/* Progressive Disclosure: Details & Telemetry Toggle */}
              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => setShowDrawerDetails(!showDrawerDetails)}
                  className="w-full text-left text-xs font-sans font-bold text-slate-500 hover:text-slate-900 flex items-center justify-between p-1 transition-colors cursor-pointer"
                >
                  <span>{showDrawerDetails ? 'Hide technical telemetry' : 'View technical telemetry'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showDrawerDetails ? 'rotate-180' : ''}`} />
                </button>

                {showDrawerDetails && (
                  <div className="mt-3 space-y-3 text-xs font-sans animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">AI Analysis Summary</div>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {activeEvaluation.demandHotspot.aiRecommendation}
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenEvidence(activeEvaluation.district, selectedCategory === 'All' ? 'Water' : selectedCategory, activeEvaluation.demandHotspot)}
                      className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-2.5 px-4 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span>Open evidence dossier</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </aside>
        )}

      </div>

      {/* Field Telemetry Evidence Modal */}
      {evidenceModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div className="space-y-1">
                <span className="text-[10px] text-orange-600 font-bold uppercase tracking-widest block">
                  {t('map.field_evidence_title')}
                </span>
                <h3 className="text-xl font-sans font-bold text-slate-900 leading-tight">
                  {evidenceModalData.district.name} · {tCategory(evidenceModalData.category)}
                </h3>
              </div>
              <button 
                onClick={() => setEvidenceModalData(null)}
                className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-2 bg-orange-50/30 p-5 rounded-xl border border-orange-100 shadow-inner">
                <div className="text-sm font-bold text-slate-900">{evidenceModalData.evidence.title}</div>
                <p className="text-slate-600 text-sm leading-relaxed italic">
                  "{evidenceModalData.evidence.sub}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                    {t('evidence.supervisor')}
                  </span>
                  <span className="font-bold text-slate-800 text-sm">{evidenceModalData.evidence.officer}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                    {t('evidence.department')}
                  </span>
                  <span className="font-bold text-slate-800 text-sm truncate">{evidenceModalData.evidence.department}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-semibold text-slate-500">
                    Confidence score: <span className="text-emerald-600">{evidenceModalData.evidence.signalConfidence}%</span>
                  </span>
                </div>
                <button
                  onClick={() => setEvidenceModalData(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-slate-200 cursor-pointer"
                >
                  {t('map.close_dossier')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
