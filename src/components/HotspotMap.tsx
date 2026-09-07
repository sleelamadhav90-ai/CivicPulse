import React, { useState, useMemo, useEffect } from 'react';
import { District, CitizenRequest, InfrastructureCategory, ScoreBreakdown, CountryCode } from '../types';
import { calculatePriorityScore, getCategoryAccess, getPriorityTier } from '../utils/scoring';
import { getCityDemandHotspot, filterRequestsByTime, CityDemandHotspot } from '../utils/demandAggregation';
import { IndiaMapCanvas, EvaluatedDistrict, MapLayerState, getReportEvidence, ReportEvidence } from './IndiaMapCanvas';
import { 
  getAvailableStates, 
  getDistrictsForState, 
  getLocalitiesForDistrict 
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
  Database
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
      
      const breakdown = calculatePriorityScore(district, targetCategory, demandCount, currentAccess);

      const matchedRequests = timeFilteredRequests.filter(
        (r) => {
          const loc = (r.location || '').toLowerCase();
          const dist = (r.district || '').toLowerCase();
          const matchDist = dist === district.name.toLowerCase() || loc.includes(district.name.toLowerCase());
          const matchCat = selectedCategory === 'All' || r.category === selectedCategory;
          const matchLocality = selectedLocality === 'ALL' || (r.locality && r.locality.toLowerCase() === selectedLocality.toLowerCase()) || loc.includes(selectedLocality.toLowerCase());
          return matchDist && matchCat && matchLocality;
        }
      );

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

  const hasActiveFilters = 
    selectedState !== 'ALL' || 
    selectedDistrict !== 'ALL' || 
    selectedLocality !== 'ALL' || 
    selectedCategory !== 'All' || 
    timeFilter !== '30d' ||
    searchQuery.trim() !== '';

  return (
    <div className="flex flex-col w-full h-full bg-[#121417] font-sans text-[#171717] overflow-hidden select-none">
      
      {/* 1. CONSOLIDATED ONE-ROW COMPACT MAP TOOLBAR */}
      <header className="bg-[#FAF8F5] border-b border-[#171717]/15 px-3 py-2 sm:px-4 sm:py-2 z-20 shrink-0 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        
        {/* Left: District Inspector Label & Cascading Geographic Dropdowns */}
        <div className="flex items-center space-x-2 sm:space-x-2.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="font-serif font-bold text-xs sm:text-sm tracking-tight text-[#171717] whitespace-nowrap">
            {t('map.inspect_hotspot')}
          </span>

          <span className="text-stone-300 hidden sm:inline">•</span>

          {/* 1. STATE DROPDOWN (Strictly States / UTs) */}
          <div className="relative">
            <button 
              onClick={() => {
                const next = !stateDropdownOpen;
                closeAllDropdowns();
                setStateDropdownOpen(next);
              }}
              className="bg-white border border-[#171717]/20 px-2.5 py-1 rounded-xs flex items-center space-x-1.5 hover:border-[#171717]/50 transition-colors cursor-pointer text-[#171717] font-medium"
            >
              <span className="text-stone-500 font-normal">{t('state')}:</span>
              <span className="font-bold truncate max-w-[110px]">{selectedState === 'ALL' ? t('filter.all_states') : selectedState}</span>
              <ChevronDown className="w-3 h-3 text-stone-500 shrink-0" />
            </button>
            {stateDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 w-56 max-h-72 overflow-y-auto bg-white border border-[#171717]/20 shadow-xl rounded-xs z-50 py-1 font-mono text-xs">
                <button
                  onClick={() => handleSelectState('ALL')}
                  className={`w-full text-left px-3 py-1.5 hover:bg-stone-100 flex items-center justify-between cursor-pointer ${
                    selectedState === 'ALL' ? 'bg-orange-50 font-bold text-[#D65A3A]' : 'text-stone-800'
                  }`}
                >
                  <span>{t('filter.all_states_uts')}</span>
                  {selectedState === 'ALL' && <span className="text-[#D65A3A] font-bold">✓</span>}
                </button>
                <div className="border-t border-stone-100 my-1"></div>
                {availableStates.map(st => (
                  <button
                    key={st}
                    onClick={() => handleSelectState(st)}
                    className={`w-full text-left px-3 py-1.5 hover:bg-stone-100 flex items-center justify-between cursor-pointer ${
                      selectedState === st ? 'bg-orange-50 font-bold text-[#D65A3A]' : 'text-stone-800'
                    }`}
                  >
                    <span>{st}</span>
                    {selectedState === st && <span className="text-[#D65A3A] font-bold">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. DISTRICT DROPDOWN (Strictly for selected state) */}
          <div className="relative">
            <button 
              onClick={() => {
                const next = !districtDropdownOpen;
                closeAllDropdowns();
                setDistrictDropdownOpen(next);
              }}
              className="bg-white border border-[#171717]/20 px-2.5 py-1 rounded-xs flex items-center space-x-1.5 hover:border-[#171717]/50 transition-colors cursor-pointer text-[#171717] font-medium"
            >
              <span className="text-stone-500 font-normal">{t('district')}:</span>
              <span className="font-bold truncate max-w-[110px]">{selectedDistrict === 'ALL' ? t('filter.all_districts') : selectedDistrict}</span>
              <ChevronDown className="w-3 h-3 text-stone-500 shrink-0" />
            </button>
            {districtDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 w-56 max-h-72 overflow-y-auto bg-white border border-[#171717]/20 shadow-xl rounded-xs z-50 py-1 font-mono text-xs">
                <button
                  onClick={() => handleSelectDistrict('ALL')}
                  className={`w-full text-left px-3 py-1.5 hover:bg-stone-100 flex items-center justify-between cursor-pointer ${
                    selectedDistrict === 'ALL' ? 'bg-orange-50 font-bold text-[#D65A3A]' : 'text-stone-800'
                  }`}
                >
                  <span>{selectedState !== 'ALL' ? `${t('filter.all_districts')} (${selectedState})` : t('filter.all_districts')}</span>
                  {selectedDistrict === 'ALL' && <span className="text-[#D65A3A] font-bold">✓</span>}
                </button>
                <div className="border-t border-stone-100 my-1"></div>
                {availableDistricts.map(d => (
                  <button
                    key={d.name}
                    onClick={() => handleSelectDistrict(d.name, d.id)}
                    className={`w-full text-left px-3 py-1.5 hover:bg-stone-100 flex items-center justify-between cursor-pointer ${
                      selectedDistrict === d.name ? 'bg-orange-50 font-bold text-[#D65A3A]' : 'text-stone-800'
                    }`}
                  >
                    <span>{d.name}</span>
                    {selectedDistrict === d.name && <span className="text-[#D65A3A] font-bold">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. CITY / TOWN / LOCALITY DROPDOWN */}
          <div className="relative">
            <button 
              onClick={() => {
                if (selectedDistrict === 'ALL') return;
                const next = !localityDropdownOpen;
                closeAllDropdowns();
                setLocalityDropdownOpen(next);
              }}
              disabled={selectedDistrict === 'ALL'}
              className={`border px-2.5 py-1 rounded-xs flex items-center space-x-1.5 transition-colors font-medium ${
                selectedDistrict === 'ALL'
                  ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-white border-[#171717]/20 text-[#171717] hover:border-[#171717]/50 cursor-pointer'
              }`}
            >
              <span className="text-stone-500 font-normal">{t('locality')}:</span>
              <span className="font-bold truncate max-w-[100px]">{selectedLocality === 'ALL' ? t('filter.all_locations') : selectedLocality}</span>
              <ChevronDown className="w-3 h-3 text-stone-500 shrink-0" />
            </button>
            {localityDropdownOpen && availableLocalities.length > 0 && (
              <div className="absolute left-0 top-full mt-1 w-52 max-h-64 overflow-y-auto bg-white border border-[#171717]/20 shadow-xl rounded-xs z-50 py-1 font-mono text-xs">
                <button
                  onClick={() => handleSelectLocality('ALL')}
                  className={`w-full text-left px-3 py-1.5 hover:bg-stone-100 flex items-center justify-between cursor-pointer ${
                    selectedLocality === 'ALL' ? 'bg-orange-50 font-bold text-[#D65A3A]' : 'text-stone-800'
                  }`}
                >
                  <span>{t('filter.all_locations_in', { district: selectedDistrict })}</span>
                  {selectedLocality === 'ALL' && <span className="text-[#D65A3A] font-bold">✓</span>}
                </button>
                <div className="border-t border-stone-100 my-1"></div>
                {availableLocalities.map(loc => (
                  <button
                    key={loc}
                    onClick={() => handleSelectLocality(loc)}
                    className={`w-full text-left px-3 py-1.5 hover:bg-stone-100 flex items-center justify-between cursor-pointer ${
                      selectedLocality === loc ? 'bg-orange-50 font-bold text-[#D65A3A]' : 'text-stone-800'
                    }`}
                  >
                    <span>{loc}</span>
                    {selectedLocality === loc && <span className="text-[#D65A3A] font-bold">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4. Category Dropdown: [ All issues ▼ ] */}
          <div className="relative">
            <button 
              onClick={() => {
                const next = !categoryDropdownOpen;
                closeAllDropdowns();
                setCategoryDropdownOpen(next);
              }}
              className="bg-white border border-[#171717]/20 px-2.5 py-1 rounded-xs flex items-center space-x-1.5 hover:border-[#171717]/50 transition-colors cursor-pointer text-[#171717] font-medium"
            >
              <span>{selectedCategory === 'All' ? t('filter.all_issues') : tCategory(selectedCategory)}</span>
              <ChevronDown className="w-3 h-3 text-stone-500" />
            </button>
            {categoryDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-[#171717]/20 shadow-xl rounded-xs z-50 py-1 font-mono text-xs">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { 
                      setSelectedCategory(cat); 
                      setCategoryDropdownOpen(false); 
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-stone-100 flex items-center justify-between cursor-pointer ${
                      selectedCategory === cat ? 'bg-orange-50 font-bold text-[#D65A3A]' : 'text-stone-800'
                    }`}
                  >
                    <span>{cat === 'All' ? t('filter.all_issues') : tCategory(cat)}</span>
                    {selectedCategory === cat && <span className="text-[#D65A3A] font-bold">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 5. Time Window Dropdown: [ 30 days ▼ ] */}
          <div className="relative">
            <button 
              onClick={() => {
                const next = !timeDropdownOpen;
                closeAllDropdowns();
                setTimeDropdownOpen(next);
              }}
              className="bg-white border border-[#171717]/20 px-2.5 py-1 rounded-xs flex items-center space-x-1.5 hover:border-[#171717]/50 transition-colors cursor-pointer text-[#171717]"
            >
              <Clock className="w-3 h-3 text-stone-500" />
              <span>{timeFilter === 'all' ? t('time.all_time') : timeFilter === '7d' ? t('time.7_days') : timeFilter === '30d' ? t('time.30_days') : t('time.90_days')}</span>
              <ChevronDown className="w-3 h-3 text-stone-500" />
            </button>
            {timeDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 w-36 bg-white border border-[#171717]/20 shadow-xl rounded-xs z-50 py-1 font-mono text-xs">
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
                    className={`w-full text-left px-3 py-1.5 hover:bg-stone-100 flex items-center justify-between cursor-pointer ${
                      timeFilter === item.id ? 'bg-orange-50 font-bold text-[#D65A3A]' : 'text-stone-800'
                    }`}
                  >
                    <span>{item.label}</span>
                    {timeFilter === item.id && <span className="text-[#D65A3A] font-bold">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 6. Layers Dropdown: [ Layers ▼ ] */}
          <div className="relative">
            <button 
              onClick={() => {
                const next = !layersDropdownOpen;
                closeAllDropdowns();
                setLayersDropdownOpen(next);
              }}
              className="bg-white border border-[#171717]/20 px-2.5 py-1 rounded-xs flex items-center space-x-1.5 hover:border-[#171717]/50 transition-colors cursor-pointer text-[#171717]"
            >
              <Layers className="w-3 h-3 text-stone-500" />
              <span>{t('layers.title')}</span>
              <ChevronDown className="w-3 h-3 text-stone-500" />
            </button>
            {layersDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-[#171717]/20 shadow-xl rounded-xs z-50 p-2 font-mono text-xs space-y-1.5">
                <label className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-stone-50 rounded">
                  <input 
                    type="checkbox" 
                    checked={activeLayers.citizenDemand} 
                    onChange={() => toggleLayer('citizenDemand')}
                    className="accent-[#D65A3A]"
                  />
                  <span className="font-medium text-[#171717]">{t('layers.civic_signals')}</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-stone-50 rounded">
                  <input 
                    type="checkbox" 
                    checked={activeLayers.infrastructure} 
                    onChange={() => toggleLayer('infrastructure')}
                    className="accent-[#171717]"
                  />
                  <span className="font-medium text-[#171717]">{t('layers.infrastructure')}</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-stone-50 rounded">
                  <input 
                    type="checkbox" 
                    checked={activeLayers.populationVulnerability} 
                    onChange={() => toggleLayer('populationVulnerability')}
                    className="accent-[#285943]"
                  />
                  <span className="font-medium text-[#171717]">{t('layers.vulnerability')}</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-stone-50 rounded">
                  <input 
                    type="checkbox" 
                    checked={activeLayers.governmentProjects} 
                    onChange={() => toggleLayer('governmentProjects')}
                    className="accent-blue-600"
                  />
                  <span className="font-medium text-[#171717]">{t('layers.projects')}</span>
                </label>
              </div>
            )}
          </div>

          {/* Quick Reset button if filters active */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              title="Reset all geographic and category filters"
              className="text-[#D65A3A] hover:text-black transition-colors px-1.5 py-1 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t('filter.reset')}</span>
            </button>
          )}
        </div>

        {/* Right: Search Location Input with Dropdown */}
        <div className="relative shrink-0">
          <div className="flex items-center bg-white border border-[#171717]/20 rounded-xs px-2 py-1 text-xs focus-within:border-[#171717]">
            <Search className="w-3.5 h-3.5 text-[#78716C] mr-1.5 shrink-0" />
            <input
              type="text"
              placeholder={t('map.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-28 sm:w-36 text-[#171717] placeholder:text-[#A8A29E]"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-black cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="absolute right-0 top-full mt-1 w-60 bg-white border border-[#171717]/20 shadow-xl rounded-xs z-50 p-1 font-mono text-xs">
              {searchResults.map(d => (
                <button
                  key={d.id}
                  onClick={() => handleSelectSearchedDistrict(d.id)}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#FAF8F5] rounded-xs flex items-center justify-between text-[#171717] cursor-pointer"
                >
                  <div>
                    <div className="font-bold">{d.name}</div>
                    <div className="text-[10px] text-[#78716C]">{d.state}</div>
                  </div>
                  <span className="text-[10px] text-[#D65A3A] font-bold">Inspect →</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* 2. HERO MAP WORKSPACE (OCCUPIES FULL VIEWPORT) */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        
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
          />
        </div>

        {/* 3. PROGRESSIVE CONTEXTUAL DRAWER (OVERLAYS MAP ON HOTSPOT CLICK WITHOUT SQUEEZING CANVAS) */}
        {isDrawerOpen && activeEvaluation && (
          <aside className="absolute right-0 top-0 bottom-0 w-full sm:w-[340px] bg-[#FAF8F5]/98 backdrop-blur-md border-l border-[#171717]/20 shadow-2xl z-30 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-150">
            <div className="p-4 space-y-3.5">
              
              {/* Header with Close button */}
              <div className="flex items-start justify-between border-b border-[#171717]/15 pb-2.5">
                <div>
                  <h2 className="text-xl font-serif font-bold text-[#171717] tracking-tight">
                    {activeEvaluation.district.name}
                  </h2>
                  <div className="text-xs text-[#57534E] flex items-center gap-1 mt-0.5 font-mono">
                    <span>{activeEvaluation.district.state}</span>
                    <span className="text-stone-300">•</span>
                    <span>{t('map.pop_lakhs', { count: (activeEvaluation.district.population / 100000).toFixed(1) })}</span>
                  </div>
                </div>
                <button
                  onClick={() => { 
                    setIsDrawerOpen(false); 
                    setActiveDistrictId(null); 
                  }}
                  className="p-1 rounded-xs text-[#78716C] hover:text-[#171717] hover:bg-stone-200/60 transition-colors cursor-pointer"
                  title="Close Inspector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Priority Index Score */}
              <div className="flex items-baseline justify-between bg-white p-3 border border-[#171717]/15 rounded-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#78716C] block">{t('map.priority_index')}</span>
                  <div className="flex items-baseline space-x-1 mt-0.5">
                    <span className="text-2xl font-serif font-bold text-[#171717]">
                      {activeEvaluation.demandHotspot.categoryScore || activeEvaluation.breakdown.total_score}
                    </span>
                    <span className="text-xs text-[#78716C] font-mono">/ 100</span>
                  </div>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  activeEvaluation.breakdown.total_score >= 70
                    ? 'bg-[#ef4444] text-white'
                    : activeEvaluation.breakdown.total_score >= 40
                    ? 'bg-[#f97316] text-white'
                    : 'bg-[#285943] text-white'
                }`}>
                  {tPriority(activeEvaluation.priorityTier.label)}
                </span>
              </div>

              {/* Main Issue & Request Volume */}
              <div className="bg-white p-3 border border-[#171717]/15 rounded-xs space-y-1 text-xs">
                <div className="font-bold text-[#171717] flex items-center justify-between">
                  <span>{selectedCategory === 'All' ? tCategory(activeEvaluation.demandHotspot.primaryCategory) : tCategory(selectedCategory)} {t('map.sector')}</span>
                  <span className="font-mono text-[11px] text-[#D65A3A] font-bold">
                    {activeEvaluation.demandCount.toLocaleString()} {t('map.signals_unit')}
                  </span>
                </div>
                <div className="text-[11px] text-[#57534E] flex items-center gap-1 font-mono">
                  <span className="text-emerald-700 font-bold">↑ 22%</span>
                  <span>{t('time.this_month')}</span>
                  <span className="text-stone-300">•</span>
                  <span>{t('map.gap_label')} {100 - Math.round(activeEvaluation.currentAccess)}%</span>
                </div>
              </div>

              {/* One Important Evidence Point */}
              {activeEvaluation.demandHotspot.representativeQuote && (
                <div className="bg-[#FAF0E6]/70 border border-[#D65A3A]/25 p-2.5 rounded-xs space-y-1 text-xs">
                  <div className="text-[9px] font-mono font-bold text-[#D65A3A] uppercase tracking-wider flex items-center gap-1">
                    <Volume2 className="w-3 h-3" />
                    <span>{t('map.citizen_voice')} ({activeEvaluation.demandHotspot.representativeQuote.language})</span>
                  </div>
                  <div className="italic text-[11px] text-[#171717]">
                    "{activeEvaluation.demandHotspot.representativeQuote.english || activeEvaluation.demandHotspot.representativeQuote.text}"
                  </div>
                </div>
              )}

              {/* Public Data Context (data.gov.in / IMD / WHO) */}
              {(() => {
                const targetCat = selectedCategory === 'All' ? activeEvaluation.demandHotspot.primaryCategory : selectedCategory;
                const publicIndicators = getPublicDataForDistrict(activeEvaluation.district.name, targetCat);
                if (publicIndicators.length === 0) return null;
                const primaryInd = publicIndicators[0];
                return (
                  <div className="bg-slate-50 border border-slate-300 p-2.5 rounded-xs space-y-1 text-xs font-mono">
                    <div className="flex items-center justify-between text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                      <span className="flex items-center gap-1 text-blue-900">
                        <Database className="w-2.5 h-2.5" />
                        <span>{t('map.public_context')}</span>
                      </span>
                      <span className="text-slate-600 font-sans">
                        {t('map.source_label')} {primaryInd.source} ({primaryInd.year})
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-900">
                      {primaryInd.indicator}: {primaryInd.value} {primaryInd.unit}
                    </div>
                    {primaryInd.contextSummary && (
                      <div className="text-[10px] text-slate-600 font-sans leading-tight">
                        {primaryInd.contextSummary}
                      </div>
                    )}
                    {primaryInd.isSyntheticDemo && (
                      <div className="text-[8px] text-amber-700 italic">
                        *Illustrative demo dataset for non-cataloged metrics
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Primary Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    if (onNavigateToCommunityIssues) {
                      onNavigateToCommunityIssues(activeEvaluation.district.id, selectedCategory === 'All' ? undefined : selectedCategory);
                    }
                  }}
                  className="bg-[#171717] hover:bg-[#292824] text-white py-2 px-2 text-[11px] font-mono font-bold transition-colors rounded-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#D65A3A]" />
                  <span>{t('map.explore_issues')}</span>
                </button>

                <button
                  onClick={() => {
                    if (onNavigateToRecommendations) {
                      onNavigateToRecommendations(activeEvaluation.district.id, selectedCategory === 'All' ? undefined : selectedCategory);
                    } else {
                      onSelectHotspotForPolicy(activeEvaluation.district, activeEvaluation.category);
                    }
                  }}
                  className="bg-white hover:bg-stone-50 text-[#171717] border border-[#171717]/30 py-2 px-2 text-[11px] font-mono font-bold transition-colors rounded-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>{t('map.synthesize_project')}</span>
                </button>
              </div>

              {/* Progressive Disclosure: Details & Telemetry Toggle */}
              <div className="pt-2 border-t border-[#171717]/10">
                <button
                  onClick={() => setShowDrawerDetails(!showDrawerDetails)}
                  className="w-full text-left text-[11px] font-mono font-medium text-stone-600 hover:text-black flex items-center justify-between p-1 cursor-pointer"
                >
                  <span>{showDrawerDetails ? t('map.hide_details') : t('map.view_details_telemetry')}</span>
                  <span>{showDrawerDetails ? '▲' : '▼'}</span>
                </button>

                {showDrawerDetails && (
                  <div className="mt-2 space-y-2 text-xs font-mono animate-in fade-in duration-100">
                    <div className="bg-white p-2.5 border border-[#171717]/15 rounded-xs space-y-1">
                      <div className="text-[10px] text-stone-500 uppercase">{t('map.ai_recommendation')}</div>
                      <p className="text-[11px] text-stone-800 leading-relaxed font-sans">
                        {activeEvaluation.demandHotspot.aiRecommendation}
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenEvidence(activeEvaluation.district, selectedCategory === 'All' ? 'Water' : selectedCategory, activeEvaluation.demandHotspot)}
                      className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 py-1.5 px-2 rounded-xs text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-blue-600" />
                      <span>{t('map.open_evidence_dossier')}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FAF8F5] border border-[#171717]/20 rounded-xs shadow-2xl max-w-lg w-full p-5 space-y-4 font-mono text-xs text-[#171717]">
            <div className="flex items-start justify-between border-b border-[#171717]/15 pb-2">
              <div>
                <span className="text-[10px] text-[#D65A3A] font-bold uppercase">{t('map.field_evidence_title')}</span>
                <h3 className="text-lg font-serif font-bold">{evidenceModalData.district.name} ({tCategory(evidenceModalData.category)})</h3>
              </div>
              <button 
                onClick={() => setEvidenceModalData(null)}
                className="p-1 hover:bg-stone-200 rounded text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 bg-white p-3 border border-[#171717]/15 rounded-xs">
              <div className="text-xs font-bold">{evidenceModalData.evidence.title}</div>
              <p className="text-stone-600 text-[11px] font-sans">{evidenceModalData.evidence.sub}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-white p-2 border border-stone-200 rounded">
                <span className="text-[9px] text-stone-400 uppercase block">{t('evidence.supervisor')}</span>
                <span className="font-bold">{evidenceModalData.evidence.officer}</span>
              </div>
              <div className="bg-white p-2 border border-stone-200 rounded">
                <span className="text-[9px] text-stone-400 uppercase block">{t('evidence.department')}</span>
                <span className="font-bold">{evidenceModalData.evidence.department}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-200">
              <span className="text-[10px] text-stone-500">{t('evidence.confidence')}: {evidenceModalData.evidence.signalConfidence}%</span>
              <button
                onClick={() => setEvidenceModalData(null)}
                className="bg-[#171717] text-white px-3 py-1 rounded-xs font-bold cursor-pointer hover:bg-stone-800"
              >
                {t('map.close_dossier')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
