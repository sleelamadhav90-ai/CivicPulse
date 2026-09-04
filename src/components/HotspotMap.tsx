import React, { useState, useMemo } from 'react';
import { District, CitizenRequest, InfrastructureCategory, ScoreBreakdown, CountryCode } from '../types';
import { calculatePriorityScore, getCategoryAccess, getPriorityTier } from '../utils/scoring';
import { getCityDemandHotspot, filterRequestsByTime, CityDemandHotspot } from '../utils/demandAggregation';
import { IndiaMapCanvas, EvaluatedDistrict, MapLayerState, getReportEvidence, ReportEvidence } from './IndiaMapCanvas';
import { 
  Layers, 
  ArrowRight, 
  X, 
  ChevronRight, 
  ChevronLeft,
  CheckSquare, 
  Square, 
  MapPin, 
  AlertCircle,
  Search,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  SlidersHorizontal,
  Info,
  ShieldCheck,
  Building,
  Volume2,
  Calendar,
  UserCheck
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
  const [activeDistrictId, setActiveDistrictId] = useState<string>(districts[0]?.id || 'guntur');
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  
  // Evidence modal state
  const [evidenceModalData, setEvidenceModalData] = useState<{
    district: District;
    category: string;
    hotspot: CityDemandHotspot;
    evidence: ReportEvidence;
  } | null>(null);

  // 4 Primary Layers matching the prompt requirements
  const [activeLayers, setActiveLayers] = useState({
    citizenDemand: true,
    infrastructure: true,
    populationVulnerability: true,
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
    return districtEvaluations.find(e => e.district.id === activeDistrictId) || districtEvaluations[0];
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
      
      {/* 1. COMPACT HERO FILTER BAR (TOP) */}
      <header className="bg-[#FAF8F5] border-b border-[#171717]/15 px-3 py-2 sm:px-4 sm:py-2.5 z-20 shrink-0 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        
        {/* Left: Branding & Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-2 mr-2">
            <span className="font-serif font-bold text-sm tracking-tight text-[#171717]">
              DISTRICT INSPECTOR
            </span>
            <span className="text-[10px] font-mono bg-[#D65A3A]/10 text-[#D65A3A] px-2 py-0.5 rounded-full font-bold border border-[#D65A3A]/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D65A3A] animate-pulse"></span>
              LIVE GIS
            </span>
          </div>

          {/* Category Pills */}
          <div className="flex items-center space-x-1 overflow-x-auto py-0.5 no-scrollbar">
            {CATEGORIES.map(cat => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 text-xs font-mono font-medium rounded-xs transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#171717] text-white shadow-xs font-semibold'
                      : 'bg-white text-[#57534E] border border-[#171717]/15 hover:border-[#171717]/40 hover:bg-stone-50'
                  }`}
                >
                  {cat === 'All' ? '🌐 All Sectors' : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Layers, Time Window, Search, & Synthetic Badge */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          {/* Quick Search */}
          <div className="relative">
            <div className="flex items-center bg-white border border-[#171717]/20 rounded-xs px-2 py-1 text-xs focus-within:border-[#171717] focus-within:ring-1 focus-within:ring-[#171717]">
              <Search className="w-3.5 h-3.5 text-[#78716C] mr-1.5 shrink-0" />
              <input
                type="text"
                placeholder="Find district or town..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs w-28 sm:w-36 text-[#171717] placeholder:text-[#A8A29E]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-black">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Search Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-[#171717]/20 shadow-xl rounded-xs z-50 p-1 font-mono text-xs">
                {searchResults.map(d => (
                  <button
                    key={d.id}
                    onClick={() => handleSelectSearchedDistrict(d.id)}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#FAF8F5] rounded-xs flex items-center justify-between text-[#171717] cursor-pointer"
                  >
                    <div>
                      <div className="font-bold">{d.name}</div>
                      <div className="text-[10px] text-[#78716C]">{d.state} • {d.zone} Zone</div>
                    </div>
                    <span className="text-[10px] text-[#D65A3A] font-bold">Inspect →</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Time Window Filter */}
          <div className="flex items-center bg-white border border-[#171717]/20 rounded-xs p-0.5 font-mono text-[11px]">
            <span className="text-[#78716C] px-1.5 flex items-center gap-1">
              <Clock className="w-3 h-3" />
            </span>
            {(['7d', '30d', '90d', 'all'] as TimeFilterRange[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFilter(tf)}
                className={`px-2 py-0.5 rounded-2xs transition-colors cursor-pointer ${
                  timeFilter === tf
                    ? 'bg-[#171717] text-white font-bold'
                    : 'text-[#57534E] hover:text-black'
                }`}
              >
                {tf === 'all' ? 'ALL' : tf.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Layer Controls Dropdown/Pills */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleLayer('citizenDemand')}
              className={`px-2 py-1 rounded-xs border text-[11px] font-mono transition-colors flex items-center space-x-1 cursor-pointer ${
                activeLayers.citizenDemand
                  ? 'bg-[#D65A3A]/10 text-[#D65A3A] border-[#D65A3A]/40 font-bold'
                  : 'bg-white text-[#78716C] border-[#171717]/15'
              }`}
              title="Toggle Citizen Demand Telemetry"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${activeLayers.citizenDemand ? 'bg-[#D65A3A]' : 'bg-stone-300'}`}></span>
              <span>Signals</span>
            </button>

            <button
              onClick={() => toggleLayer('infrastructure')}
              className={`px-2 py-1 rounded-xs border text-[11px] font-mono transition-colors flex items-center space-x-1 cursor-pointer ${
                activeLayers.infrastructure
                  ? 'bg-[#171717] text-white border-[#171717] font-bold'
                  : 'bg-white text-[#78716C] border-[#171717]/15'
              }`}
              title="Toggle Public Infrastructure Assets"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${activeLayers.infrastructure ? 'bg-white' : 'bg-stone-300'}`}></span>
              <span>Assets</span>
            </button>

            <button
              onClick={() => toggleLayer('populationVulnerability')}
              className={`px-2 py-1 rounded-xs border text-[11px] font-mono transition-colors flex items-center space-x-1 cursor-pointer ${
                activeLayers.populationVulnerability
                  ? 'bg-[#285943]/10 text-[#285943] border-[#285943]/40 font-bold'
                  : 'bg-white text-[#78716C] border-[#171717]/15'
              }`}
              title="Toggle Population & Vulnerability Index"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${activeLayers.populationVulnerability ? 'bg-[#285943]' : 'bg-stone-300'}`}></span>
              <span>Vulnerability</span>
            </button>
          </div>

          {/* Synthetic Data Notice Badge */}
          <div className="hidden lg:flex items-center text-[10px] font-mono bg-stone-200/80 text-stone-600 px-2 py-1 rounded border border-stone-300">
            <Info className="w-3 h-3 mr-1 text-stone-500" />
            <span>Synthetic GIS Data</span>
          </div>

        </div>
      </header>

      {/* 2. HERO MAP WORKSPACE (OCCUPIES 85-92% OF THE SCREEN) */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        
        {/* Full Viewport Canvas */}
        <div className="w-full h-full absolute inset-0">
          <IndiaMapCanvas
            evaluations={districtEvaluations}
            activeDistrictId={activeDistrictId}
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

        {/* Floating Button to Re-open Inspector if closed */}
        {!isDrawerOpen && (
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="absolute top-4 right-4 z-20 bg-[#FAF8F5] hover:bg-white text-[#171717] border border-[#171717]/30 px-3.5 py-2 rounded-xs shadow-xl flex items-center space-x-2 font-mono text-xs font-bold uppercase transition-all cursor-pointer"
          >
            <span>District Inspector</span>
            <ChevronLeft className="w-4 h-4 text-[#D65A3A]" />
          </button>
        )}

        {/* 3. CONTEXTUAL RIGHT DRAWER (360PX - 380PX, COLLAPSIBLE, DOES NOT SQUEEZE MAP) */}
        {isDrawerOpen && activeEvaluation && (
          <aside className="absolute right-0 top-0 bottom-0 w-full sm:w-[370px] bg-[#FAF8F5]/98 backdrop-blur-md border-l border-[#171717]/20 shadow-2xl z-30 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            
            <div className="p-4 sm:p-5 space-y-4">
              
              {/* Drawer Header */}
              <div className="flex items-start justify-between border-b border-[#171717]/15 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D65A3A]">
                      TELEMETRY DOSSIER
                    </span>
                    <span className="text-[10px] font-mono text-[#78716C]">
                      • {activeEvaluation.district.zone} ZONE
                    </span>
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-[#171717] tracking-tight">
                    {activeEvaluation.district.name}
                  </h2>
                  <div className="text-xs text-[#57534E] flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#78716C]" />
                    <span>{activeEvaluation.district.state}, India</span>
                    <span className="text-gray-400">•</span>
                    <span>Pop. {(activeEvaluation.district.population / 100000).toFixed(1)}L</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-xs text-[#78716C] hover:text-[#171717] hover:bg-stone-200/60 transition-colors cursor-pointer"
                  title="Close Inspector"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Priority & Urgency Score Card */}
              <div className="bg-white border border-[#171717]/15 p-3.5 rounded-xs shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D65A3A] animate-pulse"></span>
                    <span className="font-mono text-xs font-bold text-[#171717] uppercase">
                      {selectedCategory === 'All' ? 'Composite Demand' : `${selectedCategory} Sector`}
                    </span>
                  </div>
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                    activeEvaluation.breakdown.total_score >= 70
                      ? 'bg-[#D65A3A] text-white'
                      : activeEvaluation.breakdown.total_score >= 40
                      ? 'bg-[#D9A441] text-black'
                      : 'bg-[#285943] text-white'
                  }`}>
                    {activeEvaluation.priorityTier.label}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1 border-t border-[#171717]/10">
                  <div>
                    <span className="text-3xl font-serif font-bold text-[#171717]">
                      {activeEvaluation.demandHotspot.categoryScore || activeEvaluation.breakdown.total_score}
                    </span>
                    <span className="text-xs text-[#78716C] font-mono"> / 100</span>
                    <span className="text-[10px] text-[#78716C] block">Priority Index Score</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-mono font-bold text-[#D65A3A]">
                      {activeEvaluation.demandCount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#78716C] block">Citizen Signals Ingested</span>
                  </div>
                </div>
              </div>

              {/* Category-Specific Detailed Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-white p-2.5 border border-[#171717]/15 rounded-xs">
                  <span className="text-[10px] text-[#78716C] block uppercase">Infrastructure Gap</span>
                  <span className="text-sm font-bold text-[#171717]">
                    {100 - Math.round(activeEvaluation.currentAccess)}% Deficit
                  </span>
                  <div className="w-full bg-stone-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div 
                      className="bg-[#D65A3A] h-full"
                      style={{ width: `${Math.min(100, 100 - activeEvaluation.currentAccess)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white p-2.5 border border-[#171717]/15 rounded-xs">
                  <span className="text-[10px] text-[#78716C] block uppercase">Vulnerability Metric</span>
                  <span className="text-sm font-bold text-[#171717]">
                    {(activeEvaluation.district.poverty_index * 100).toFixed(0)}% MPI Index
                  </span>
                  <div className="w-full bg-stone-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div 
                      className="bg-[#285943] h-full"
                      style={{ width: `${Math.min(100, activeEvaluation.district.poverty_index * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Representative Citizen Voice Quote */}
              {activeEvaluation.demandHotspot.representativeQuote ? (
                <div className="bg-[#FAF0E6]/60 border border-[#D65A3A]/30 p-3 rounded-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#D65A3A] font-bold uppercase">
                    <span className="flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Citizen Voice • {activeEvaluation.demandHotspot.representativeQuote.language}</span>
                    </span>
                    <span className="bg-[#D65A3A] text-white px-1.5 py-0.2 rounded-2xs text-[9px]">
                      VERIFIED AUDIO
                    </span>
                  </div>
                  
                  {/* Original Vernacular */}
                  <div className="font-serif italic text-xs text-[#171717] bg-white/60 p-2 rounded border border-[#171717]/10">
                    "{activeEvaluation.demandHotspot.representativeQuote.text}"
                  </div>

                  {/* English Translation */}
                  <div className="text-[11px] text-[#44403C]">
                    <strong className="text-[#171717]">Summary: </strong>
                    {activeEvaluation.demandHotspot.representativeQuote.english}
                  </div>

                  <div className="text-[10px] font-mono text-[#78716C] pt-1 flex items-center justify-between border-t border-[#171717]/10">
                    <span>Locality: {activeEvaluation.demandHotspot.representativeQuote.locality}</span>
                    <span className="text-[#D65A3A] font-bold">Urgency: {activeEvaluation.demandHotspot.representativeQuote.urgency}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-stone-50 border border-[#171717]/15 p-3 rounded-xs text-xs text-[#78716C]">
                  Citizen signals actively streaming for this sector.
                </div>
              )}

              {/* Top Issues Breakdown in this District */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-[#171717]">
                    Sector Distribution
                  </span>
                  <span className="text-[10px] font-mono text-[#78716C]">
                    {activeEvaluation.demandHotspot.topIssues.length} Categories
                  </span>
                </div>

                <div className="space-y-1.5 bg-white border border-[#171717]/15 p-2.5 rounded-xs">
                  {activeEvaluation.demandHotspot.topIssues.slice(0, 4).map((issue) => (
                    <div key={issue.category} className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5">
                          <span 
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: issue.dotColor }}
                          ></span>
                          <span className="font-medium text-[#171717]">{issue.category}</span>
                        </span>
                        <span className="font-mono text-[11px] text-[#78716C]">
                          {issue.percentage}% ({issue.count} req)
                        </span>
                      </div>
                      <div className="w-full bg-stone-100 h-1 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${issue.percentage}%`,
                            backgroundColor: issue.dotColor 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Strategic Recommendation */}
              <div className="bg-white border border-[#171717]/15 p-3 rounded-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#171717]">
                    Executive Recommendation
                  </span>
                  <span className="text-[10px] font-mono bg-[#171717] text-white px-1.5 py-0.2 rounded">
                    GEMINI FLASH
                  </span>
                </div>
                <p className="text-xs text-[#44403C] leading-relaxed">
                  {activeEvaluation.demandHotspot.aiRecommendation}
                </p>
              </div>

            </div>

            {/* Action Buttons (Sticky at Bottom of Drawer) */}
            <div className="p-4 bg-stone-100/90 border-t border-[#171717]/15 space-y-2 shrink-0">
              <div className="grid grid-cols-2 gap-2">
                
                {/* View Community Issues */}
                <button
                  onClick={() => {
                    if (onNavigateToCommunityIssues) {
                      onNavigateToCommunityIssues(activeEvaluation.district.id, selectedCategory === 'All' ? undefined : selectedCategory);
                    }
                  }}
                  className="bg-white hover:bg-stone-50 text-[#171717] border border-[#171717]/30 py-2 px-2 text-[11px] font-mono font-bold uppercase transition-colors rounded-xs flex items-center justify-center gap-1 cursor-pointer"
                  title="View individual citizen reports in this district"
                >
                  <FileText className="w-3.5 h-3.5 text-[#D65A3A]" />
                  <span>Citizen Issues</span>
                </button>

                {/* View Field Telemetry Evidence */}
                <button
                  onClick={() => handleOpenEvidence(activeEvaluation.district, selectedCategory === 'All' ? 'Water' : selectedCategory, activeEvaluation.demandHotspot)}
                  className="bg-white hover:bg-stone-50 text-[#171717] border border-[#171717]/30 py-2 px-2 text-[11px] font-mono font-bold uppercase transition-colors rounded-xs flex items-center justify-center gap-1 cursor-pointer"
                  title="Inspect field evidence and engineering sanction logs"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>Field Evidence</span>
                </button>
              </div>

              {/* Draft Policy Brief / Recommendations */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (onNavigateToEngine) {
                      onNavigateToEngine();
                    }
                  }}
                  className="flex-1 bg-stone-200 hover:bg-stone-300 text-[#171717] border border-[#171717]/20 py-2 px-2 text-[11px] font-mono font-bold uppercase transition-colors rounded-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#285943]" />
                  <span>Priority Engine</span>
                </button>

                <button
                  onClick={() => onSelectHotspotForPolicy(activeEvaluation.district, activeEvaluation.category)}
                  className="flex-1 bg-[#171717] hover:bg-[#D65A3A] text-white py-2 px-2 text-[11px] font-mono font-bold uppercase tracking-wider transition-colors rounded-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Policy Lab →</span>
                </button>
              </div>
            </div>

          </aside>
        )}

      </div>

      {/* 4. FIELD TELEMETRY & EVIDENCE MODAL */}
      {evidenceModalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-[#171717] shadow-2xl max-w-xl w-full rounded-xs overflow-hidden text-[#171717] font-mono animate-in zoom-in-95 duration-150">
            
            {/* Modal Top Bar */}
            <div className="bg-[#171717] text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#D65A3A]" />
                <span className="font-bold text-xs uppercase tracking-wider">
                  FIELD VERIFICATION DOSSIER • {evidenceModalData.evidence.reportId}
                </span>
              </div>
              <button 
                onClick={() => setEvidenceModalData(null)}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div>
                <span className="text-[10px] text-[#78716C] uppercase block">Subject Investigation</span>
                <h3 className="font-serif font-bold text-lg text-[#171717]">
                  {evidenceModalData.evidence.title}
                </h3>
                <div className="text-xs text-[#57534E] flex items-center gap-2 mt-0.5">
                  <span className="font-bold text-[#D65A3A]">{evidenceModalData.district.name}, {evidenceModalData.district.state}</span>
                  <span>•</span>
                  <span>Category: {evidenceModalData.category}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold">{evidenceModalData.evidence.signalConfidence}% Confidence</span>
                </div>
              </div>

              {/* Assessment summary */}
              <div className="bg-white border border-[#171717]/15 p-3 rounded-xs space-y-1">
                <span className="text-[10px] text-[#78716C] uppercase block font-bold">Field Inspection Finding:</span>
                <p className="font-sans text-xs text-[#171717] leading-relaxed">
                  {evidenceModalData.evidence.sub}
                </p>
              </div>

              {/* Administrative Officers & Sanction */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 border border-[#171717]/15 rounded-xs space-y-0.5">
                  <div className="flex items-center gap-1 text-[10px] text-[#78716C] uppercase">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Officer In-Charge</span>
                  </div>
                  <div className="font-bold text-[#171717]">{evidenceModalData.evidence.officer}</div>
                  <div className="text-[10px] text-[#78716C]">{evidenceModalData.evidence.department}</div>
                </div>

                <div className="bg-white p-3 border border-[#171717]/15 rounded-xs space-y-0.5">
                  <div className="flex items-center gap-1 text-[10px] text-[#78716C] uppercase">
                    <Calendar className="w-3.5 h-3.5 text-[#D65A3A]" />
                    <span>Inspection Date & Status</span>
                  </div>
                  <div className="font-bold text-[#171717]">{evidenceModalData.evidence.actionDate}</div>
                  <div className="text-[10px] text-amber-800 font-bold">{evidenceModalData.evidence.status}</div>
                </div>
              </div>

              {/* Grounded Corroborating Signals */}
              <div className="bg-stone-100 p-3 rounded-xs border border-stone-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#78716C] uppercase block">Corroborating Telemetry</span>
                  <span className="font-bold text-[#171717]">
                    {evidenceModalData.hotspot.categoryRequests} Citizen Reports Recorded
                  </span>
                </div>
                <button
                  onClick={() => {
                    const d = evidenceModalData.district;
                    const c = evidenceModalData.category;
                    setEvidenceModalData(null);
                    if (onNavigateToCommunityIssues) {
                      onNavigateToCommunityIssues(d.id, c);
                    }
                  }}
                  className="bg-[#171717] text-white hover:bg-[#D65A3A] px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xs cursor-pointer flex items-center gap-1"
                >
                  <span>Browse Raw Reports</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-[#FAF8F5] border-t border-[#171717]/15 px-5 py-3 flex justify-end">
              <button
                onClick={() => setEvidenceModalData(null)}
                className="bg-white hover:bg-stone-100 text-[#171717] border border-[#171717]/30 px-4 py-1.5 text-xs font-bold uppercase rounded-xs cursor-pointer"
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
