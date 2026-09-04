import React, { useState, useMemo } from 'react';
import { District, CitizenRequest, InfrastructureCategory, ScoreBreakdown, CountryCode } from '../types';
import { calculatePriorityScore, getCategoryAccess, getPriorityTier } from '../utils/scoring';
import { getCityDemandHotspot, filterRequestsByTime, CityDemandHotspot } from '../utils/demandAggregation';
import { IndiaMapCanvas, EvaluatedDistrict, MapLayerState, getReportEvidence, ReportEvidence } from './IndiaMapCanvas';
import { 
  Layers, 
  X, 
  ChevronDown,
  Search, 
  Clock, 
  Eye, 
  FileText, 
  SlidersHorizontal,
  Info,
  MapPin,
  Volume2
} from 'lucide-react';

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
  const [selectedCategory, setSelectedCategory] = useState<InfrastructureCategory | 'All'>('All');
  const [timeFilter, setTimeFilter] = useState<TimeFilterRange>('30d');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected location: Default to null / drawer closed so the hero map is cleanly displayed first
  const [activeDistrictId, setActiveDistrictId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showDrawerDetails, setShowDrawerDetails] = useState(false);

  // Dropdown visibility states
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

  // Filter requests by time window
  const timeFilteredRequests = useMemo(() => {
    return filterRequestsByTime(requests, timeFilter);
  }, [requests, timeFilter]);

  // Evaluate districts using category-aware demand aggregation
  const districtEvaluations: EvaluatedDistrict[] = useMemo(() => {
    return districts.map((district) => {
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
          return matchDist && matchCat;
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
  }, [districts, timeFilteredRequests, selectedCategory]);

  // Active district evaluation
  const activeEvaluation = useMemo(() => {
    if (!activeDistrictId) return null;
    return districtEvaluations.find(e => e.district.id === activeDistrictId) || null;
  }, [districtEvaluations, activeDistrictId]);

  // Search filter list for quick jump
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return districts.filter(d => 
      d.name.toLowerCase().includes(q) || 
      d.state.toLowerCase().includes(q) || 
      d.zone.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [districts, searchQuery]);

  const handleSelectSearchedDistrict = (districtId: string) => {
    setActiveDistrictId(districtId);
    setIsDrawerOpen(true);
    setSearchQuery('');
  };

  const handleOpenEvidence = (district: District, category: string, hotspot: CityDemandHotspot) => {
    const evidence = getReportEvidence(district, category, hotspot);
    setEvidenceModalData({ district, category, hotspot, evidence });
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#121417] font-sans text-[#171717] overflow-hidden select-none">
      
      {/* 1. CONSOLIDATED ONE-ROW COMPACT MAP TOOLBAR */}
      <header className="bg-[#FAF8F5] border-b border-[#171717]/15 px-3 py-2 sm:px-4 sm:py-2 z-20 shrink-0 flex items-center justify-between gap-2 text-xs font-mono">
        
        {/* Left: District Inspector Label & Clean Dropdowns */}
        <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto no-scrollbar">
          <span className="font-serif font-bold text-xs sm:text-sm tracking-tight text-[#171717] whitespace-nowrap">
            DISTRICT INSPECTOR
          </span>

          <span className="text-stone-300 hidden sm:inline">•</span>

          {/* Category Dropdown: [ All issues ▼ ] */}
          <div className="relative">
            <button 
              onClick={() => {
                setCategoryDropdownOpen(!categoryDropdownOpen);
                setTimeDropdownOpen(false);
                setLayersDropdownOpen(false);
              }}
              className="bg-white border border-[#171717]/20 px-2.5 py-1 rounded-xs flex items-center space-x-1.5 hover:border-[#171717]/50 transition-colors cursor-pointer text-[#171717] font-medium"
            >
              <span>{selectedCategory === 'All' ? 'All issues' : selectedCategory}</span>
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
                    <span>{cat === 'All' ? 'All issues' : cat}</span>
                    {selectedCategory === cat && <span className="text-[#D65A3A] font-bold">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Time Window Dropdown: [ 30 days ▼ ] */}
          <div className="relative">
            <button 
              onClick={() => {
                setTimeDropdownOpen(!timeDropdownOpen);
                setCategoryDropdownOpen(false);
                setLayersDropdownOpen(false);
              }}
              className="bg-white border border-[#171717]/20 px-2.5 py-1 rounded-xs flex items-center space-x-1.5 hover:border-[#171717]/50 transition-colors cursor-pointer text-[#171717]"
            >
              <Clock className="w-3 h-3 text-stone-500" />
              <span>{timeFilter === 'all' ? 'All time' : timeFilter === '7d' ? '7 days' : timeFilter === '30d' ? '30 days' : '90 days'}</span>
              <ChevronDown className="w-3 h-3 text-stone-500" />
            </button>
            {timeDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 w-36 bg-white border border-[#171717]/20 shadow-xl rounded-xs z-50 py-1 font-mono text-xs">
                {[
                  { id: '7d', label: '7 days' },
                  { id: '30d', label: '30 days' },
                  { id: '90d', label: '90 days' },
                  { id: 'all', label: 'All time' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => { 
                      setTimeFilter(t.id as TimeFilterRange); 
                      setTimeDropdownOpen(false); 
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-stone-100 flex items-center justify-between cursor-pointer ${
                      timeFilter === t.id ? 'bg-orange-50 font-bold text-[#D65A3A]' : 'text-stone-800'
                    }`}
                  >
                    <span>{t.label}</span>
                    {timeFilter === t.id && <span className="text-[#D65A3A] font-bold">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Layers Dropdown: [ Layers ▼ ] */}
          <div className="relative">
            <button 
              onClick={() => {
                setLayersDropdownOpen(!layersDropdownOpen);
                setCategoryDropdownOpen(false);
                setTimeDropdownOpen(false);
              }}
              className="bg-white border border-[#171717]/20 px-2.5 py-1 rounded-xs flex items-center space-x-1.5 hover:border-[#171717]/50 transition-colors cursor-pointer text-[#171717]"
            >
              <Layers className="w-3 h-3 text-stone-500" />
              <span>Layers</span>
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
                  <span className="font-medium text-[#171717]">Civic signals</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-stone-50 rounded">
                  <input 
                    type="checkbox" 
                    checked={activeLayers.infrastructure} 
                    onChange={() => toggleLayer('infrastructure')}
                    className="accent-[#171717]"
                  />
                  <span className="font-medium text-[#171717]">Infrastructure assets</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-stone-50 rounded">
                  <input 
                    type="checkbox" 
                    checked={activeLayers.populationVulnerability} 
                    onChange={() => toggleLayer('populationVulnerability')}
                    className="accent-[#285943]"
                  />
                  <span className="font-medium text-[#171717]">Population vulnerability</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-stone-50 rounded">
                  <input 
                    type="checkbox" 
                    checked={activeLayers.governmentProjects} 
                    onChange={() => toggleLayer('governmentProjects')}
                    className="accent-blue-600"
                  />
                  <span className="font-medium text-[#171717]">Government projects</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Right: Search Location Input with Dropdown */}
        <div className="relative shrink-0">
          <div className="flex items-center bg-white border border-[#171717]/20 rounded-xs px-2 py-1 text-xs focus-within:border-[#171717]">
            <Search className="w-3.5 h-3.5 text-[#78716C] mr-1.5 shrink-0" />
            <input
              type="text"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-28 sm:w-40 text-[#171717] placeholder:text-[#A8A29E]"
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

      {/* 2. HERO MAP WORKSPACE (OCCUPIES 85-92% OF THE SCREEN) */}
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
                    <span>Pop. {(activeEvaluation.district.population / 100000).toFixed(1)}L</span>
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
                  <span className="text-[10px] font-mono uppercase text-[#78716C] block">Priority Index</span>
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
                  {activeEvaluation.priorityTier.label}
                </span>
              </div>

              {/* Main Issue & Request Volume */}
              <div className="bg-white p-3 border border-[#171717]/15 rounded-xs space-y-1 text-xs">
                <div className="font-bold text-[#171717] flex items-center justify-between">
                  <span>{selectedCategory === 'All' ? activeEvaluation.demandHotspot.primaryCategory : selectedCategory} Sector</span>
                  <span className="font-mono text-[11px] text-[#D65A3A] font-bold">
                    {activeEvaluation.demandCount.toLocaleString()} signals
                  </span>
                </div>
                <div className="text-[11px] text-[#57534E] flex items-center gap-1 font-mono">
                  <span className="text-emerald-700 font-bold">↑ 22%</span>
                  <span>this month</span>
                  <span className="text-stone-300">•</span>
                  <span>Gap: {100 - Math.round(activeEvaluation.currentAccess)}%</span>
                </div>
              </div>

              {/* One Important Evidence Point */}
              {activeEvaluation.demandHotspot.representativeQuote && (
                <div className="bg-[#FAF0E6]/70 border border-[#D65A3A]/25 p-2.5 rounded-xs space-y-1 text-xs">
                  <div className="text-[9px] font-mono font-bold text-[#D65A3A] uppercase tracking-wider flex items-center gap-1">
                    <Volume2 className="w-3 h-3" />
                    <span>Citizen Voice ({activeEvaluation.demandHotspot.representativeQuote.language})</span>
                  </div>
                  <div className="italic text-[11px] text-[#171717]">
                    "{activeEvaluation.demandHotspot.representativeQuote.english || activeEvaluation.demandHotspot.representativeQuote.text}"
                  </div>
                </div>
              )}

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
                  <span>View issue</span>
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
                  <span>View recommendation</span>
                </button>
              </div>

              {/* Progressive Disclosure: Details & Telemetry Toggle */}
              <div className="pt-2 border-t border-[#171717]/10">
                <button
                  onClick={() => setShowDrawerDetails(!showDrawerDetails)}
                  className="w-full text-left text-[11px] font-mono font-medium text-stone-600 hover:text-black flex items-center justify-between p-1 cursor-pointer"
                >
                  <span>{showDrawerDetails ? 'Hide details' : 'View details & telemetry'}</span>
                  <span>{showDrawerDetails ? '▲' : '▼'}</span>
                </button>

                {showDrawerDetails && (
                  <div className="mt-2 space-y-2 text-xs font-mono animate-in fade-in duration-100">
                    <div className="bg-white p-2.5 border border-[#171717]/15 rounded-xs space-y-1">
                      <div className="text-[10px] text-stone-500 uppercase">AI Strategic Recommendation</div>
                      <p className="text-[11px] text-stone-800 leading-relaxed font-sans">
                        {activeEvaluation.demandHotspot.aiRecommendation}
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenEvidence(activeEvaluation.district, selectedCategory === 'All' ? 'Water' : selectedCategory, activeEvaluation.demandHotspot)}
                      className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 py-1.5 px-2 rounded-xs text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-blue-600" />
                      <span>Open Field Evidence Dossier</span>
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
                <span className="text-[10px] text-[#D65A3A] font-bold uppercase">Field Telemetry Evidence</span>
                <h3 className="text-lg font-serif font-bold">{evidenceModalData.district.name} ({evidenceModalData.category})</h3>
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
                <span className="text-[9px] text-stone-400 uppercase block">Supervisor</span>
                <span className="font-bold">{evidenceModalData.evidence.officer}</span>
              </div>
              <div className="bg-white p-2 border border-stone-200 rounded">
                <span className="text-[9px] text-stone-400 uppercase block">Department</span>
                <span className="font-bold">{evidenceModalData.evidence.department}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-200">
              <span className="text-[10px] text-stone-500">Confidence: {evidenceModalData.evidence.signalConfidence}%</span>
              <button
                onClick={() => setEvidenceModalData(null)}
                className="bg-[#171717] text-white px-3 py-1 rounded-xs font-bold cursor-pointer hover:bg-stone-800"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
