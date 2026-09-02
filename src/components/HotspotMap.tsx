import React, { useState, useMemo, useEffect } from 'react';
import { District, CitizenRequest, InfrastructureCategory, ScoreBreakdown, CountryCode } from '../types';
import { calculatePriorityScore, getCategoryAccess, getPriorityTier } from '../utils/scoring';
import { getCityDemandHotspot } from '../utils/demandAggregation';
import { IndiaMapCanvas, EvaluatedDistrict, MapLayerState } from './IndiaMapCanvas';
import { GLOBAL_COUNTRIES } from '../data/globalConfig';
import { 
  Layers, 
  CheckSquare, 
  Square, 
  Info, 
  Compass, 
  Sliders, 
  Database,
  Flame,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  X,
  FileText,
  BarChart2,
  Users,
  Building2,
  Sparkles
} from 'lucide-react';

interface HotspotMapProps {
  districts: District[];
  requests: CitizenRequest[];
  onSelectHotspotForPolicy: (district: District, category: InfrastructureCategory) => void;
  onOpenScoreModal: (breakdown: ScoreBreakdown, district: District, category: InfrastructureCategory) => void;
  selectedCountryCode?: CountryCode;
  onNavigateToBriefing?: () => void;
  onNavigateToEngine?: () => void;
}

const CATEGORIES: (InfrastructureCategory | 'All')[] = [
  'All', 'Water', 'Drainage', 'Roads', 'Electricity', 'Healthcare', 'Education'
];

export const HotspotMap: React.FC<HotspotMapProps> = ({
  districts,
  requests,
  onSelectHotspotForPolicy,
  onOpenScoreModal,
  selectedCountryCode = 'IN',
  onNavigateToBriefing,
  onNavigateToEngine,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<InfrastructureCategory | 'All'>('All');
  const [activeDistrictId, setActiveDistrictId] = useState<string>(districts[0]?.id || 'guntur');
  const [layersPanelOpen, setLayersPanelOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(true);

  const countryConfig = GLOBAL_COUNTRIES[selectedCountryCode] || GLOBAL_COUNTRIES['IN'];

  // Update active district if the district list changes (e.g. on country switch)
  useEffect(() => {
    if (districts.length > 0 && !districts.some(d => d.id === activeDistrictId)) {
      setActiveDistrictId(districts[0].id);
    }
  }, [districts, activeDistrictId]);

  // Map Dataset Overlays
  const [layers, setLayers] = useState<MapLayerState>({
    citizen_demand: true,
    infrastructure: true,
    population: true,
    projects: false,
    healthcare: false,
    education: false,
    roads: false,
    digital: false,
  });

  const toggleLayer = (key: keyof MapLayerState) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const districtEvaluations: EvaluatedDistrict[] = useMemo(() => {
    return districts.map((district) => {
      const targetCategory: InfrastructureCategory = selectedCategory === 'All' ? 'Water' : selectedCategory;
      const matchedRequests = requests.filter(
        (r) => r.location.toLowerCase() === district.name.toLowerCase() &&
               (selectedCategory === 'All' || r.category === selectedCategory)
      );
      const demandCount = matchedRequests.length;
      const currentAccess = getCategoryAccess(district, targetCategory);
      const breakdown = calculatePriorityScore(district, targetCategory, 8, demandCount);
      const demandHotspot = getCityDemandHotspot(district, requests);

      return {
        district,
        category: targetCategory,
        demandCount,
        currentAccess,
        breakdown,
        matchedRequests,
        demandHotspot,
        priorityTier: getPriorityTier(breakdown.total_score),
      };
    });
  }, [districts, requests, selectedCategory]);

  // Sort evaluations to find top priority areas
  const sortedEvaluations = useMemo(() => {
    return [...districtEvaluations].sort((a, b) => b.breakdown.total_score - a.breakdown.total_score);
  }, [districtEvaluations]);

  const activeEvaluation = useMemo(() => {
    return districtEvaluations.find(e => e.district.id === activeDistrictId) || sortedEvaluations[0];
  }, [districtEvaluations, activeDistrictId, sortedEvaluations]);

  const activeLayersCount = Object.values(layers).filter(Boolean).length;

  // Calculate totals for summary strip
  const totalRequestsCount = requests.length;
  const totalHotspotsCount = districtEvaluations.length * 3;
  const flaggedDistrictsCount = districtEvaluations.filter(e => e.breakdown.total_score >= 70).length;

  // Priority breakdown bar scores for active district
  const waterScore = activeEvaluation ? Math.min(100, Math.round(activeEvaluation.breakdown.gap_score ?? 91)) : 91;
  const demandScore = activeEvaluation ? Math.min(100, Math.round(activeEvaluation.breakdown.demand_score ?? 84)) : 84;
  const gapScore = activeEvaluation ? Math.min(100, Math.round(activeEvaluation.breakdown.gap_percentage ?? 78)) : 78;

  return (
    <div className="w-full min-h-[90vh] bg-[#F7F5EF] text-[#171717] font-sans flex flex-col border border-[#171717]">
      {/* 1. TOP POLICY MAP HEADER */}
      <div className="bg-[#F7F5EF] border-b-2 border-[#171717] p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-widest text-[#D65A3A]">
              <span>CIVICPULSE</span>
              <span>•</span>
              <span>POLICY MAP INTERFACE</span>
              <span>•</span>
              <span className="text-[#171717]/70">{countryConfig.flag} {countryConfig.name}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#171717]">
              WHERE SHOULD WE ACT?
            </h1>
            <p className="text-xs sm:text-sm font-sans text-[#171717]/80">
              Interactive spatial decision platform prioritizing infrastructure interventions based on citizen voice & asset gaps.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onNavigateToBriefing && (
              <button
                onClick={onNavigateToBriefing}
                className="px-3.5 py-2 bg-white border border-[#171717] font-mono text-xs font-bold uppercase tracking-wider text-[#171717] hover:bg-[#D65A3A] hover:text-white transition-all shadow-[2px_2px_0px_#171717] flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#D65A3A]" />
                <span>Gov Briefing →</span>
              </button>
            )}

            {/* Layer Popover Toggle Button */}
            <div className="relative">
              <button
                onClick={() => setLayersPanelOpen(!layersPanelOpen)}
                className={`px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-2 shadow-[2px_2px_0px_#171717] ${
                  layersPanelOpen
                    ? 'bg-[#D65A3A] text-white border-[#171717]'
                    : 'bg-white text-[#171717] border-[#171717] hover:bg-[#171717]/5'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Layers ({activeLayersCount})</span>
              </button>

              {/* LAYERS DROPDOWN POPOVER */}
              {layersPanelOpen && (
                <div className="absolute top-full right-0 mt-2 z-40 w-72 bg-[#F7F5EF] border-2 border-[#171717] shadow-[6px_6px_0px_#171717] font-mono text-xs p-3 space-y-2 rounded-lg">
                  <div className="flex items-center justify-between border-b border-[#171717]/20 pb-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-[#D65A3A]" />
                      <span className="font-bold text-[#171717] uppercase tracking-wider text-[11px]">
                        DATASET OVERLAYS
                      </span>
                    </div>
                    <button
                      onClick={() => setLayersPanelOpen(false)}
                      className="text-[10px] text-[#171717]/60 hover:text-[#171717] font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  {[
                    { key: 'citizen_demand', label: 'Citizen Demand Signals', checked: layers.citizen_demand, color: '#D65A3A' },
                    { key: 'infrastructure', label: 'Infrastructure Deficits', checked: layers.infrastructure, color: '#285943' },
                    { key: 'population', label: 'Population Heatmaps', checked: layers.population, color: '#D9A441' },
                    { key: 'projects', label: 'Government Projects', checked: layers.projects, color: '#171717' },
                    { key: 'healthcare', label: 'Healthcare Facilities', checked: layers.healthcare, color: '#285943' },
                    { key: 'education', label: 'Education Hubs', checked: layers.education, color: '#285943' },
                    { key: 'roads', label: 'Road Transit Networks', checked: layers.roads, color: '#171717' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => toggleLayer(item.key as keyof MapLayerState)}
                      className={`w-full flex items-center justify-between p-2 border transition-all cursor-pointer rounded ${
                        item.checked 
                          ? 'bg-white border-[#171717] text-[#171717] font-bold' 
                          : 'bg-[#F7F5EF] border-[#171717]/20 text-[#171717]/60 hover:border-[#171717]/40'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {item.checked ? (
                          <CheckSquare className="w-3.5 h-3.5" style={{ color: item.color }} />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-[#171717]/40" />
                        )}
                        <span className="text-[11px]">{item.label}</span>
                      </div>
                      {item.checked && (
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#171717]/10 font-mono text-xs">
          <span className="font-bold uppercase tracking-wider text-[#171717]/60 text-[11px] mr-2">
            FILTER SECTOR:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer rounded ${
                selectedCategory === cat 
                  ? 'bg-[#171717] text-[#F7F5EF] shadow-[2px_2px_0px_#D65A3A]' 
                  : 'bg-white text-[#171717] border border-[#171717]/30 hover:border-[#171717]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. MAIN POLICY MAP & PRIORITY AREAS GRID */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 relative min-h-[550px] bg-[#0f172a]">
        {/* MAP CANVAS (8 Cols on desktop) */}
        <div className="lg:col-span-8 relative h-[500px] lg:h-auto min-h-[500px] w-full">
          <IndiaMapCanvas
            evaluations={districtEvaluations}
            activeDistrictId={activeDistrictId}
            onSelectDistrict={(id) => {
              setActiveDistrictId(id);
              setInspectorOpen(true);
            }}
            selectedCategory={selectedCategory}
            layers={layers}
            onSelectHotspotForPolicy={onSelectHotspotForPolicy}
            selectedCountryCode={selectedCountryCode}
          />

          {/* Map Hotspot Tier Legend Box */}
          <div className="absolute bottom-4 left-4 z-20 bg-[#171717]/95 text-white border border-[#333] px-3.5 py-2 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] backdrop-blur-md font-mono text-xs rounded">
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#D65A3A] inline-block border border-white"></span>
                <span className="font-bold">🔴 High Demand</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#D9A441] inline-block border border-white"></span>
                <span className="font-bold">🟠 Medium</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#285943] inline-block border border-white"></span>
                <span className="font-bold">🟡 Emerging</span>
              </span>
            </div>
          </div>
        </div>

        {/* PRIORITY AREAS SIDEBAR (4 Cols on desktop) */}
        <div className="lg:col-span-4 bg-[#F7F5EF] border-t lg:border-t-0 lg:border-l-2 border-[#171717] p-5 flex flex-col justify-between space-y-4 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#171717] pb-3">
              <div>
                <h2 className="font-serif text-lg font-bold uppercase text-[#171717]">
                  PRIORITY AREAS
                </h2>
                <span className="font-mono text-[10px] text-[#171717]/60 block uppercase font-semibold">
                  Ranked by composite deficit score
                </span>
              </div>
              <span className="px-2 py-0.5 bg-[#D65A3A] text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded">
                TOP ACTION ZONES
              </span>
            </div>

            {/* Priority Areas Ranked List */}
            <div className="space-y-3">
              {sortedEvaluations.slice(0, 4).map((item, idx) => {
                const isSelected = item.district.id === activeDistrictId;
                const displayCategory = selectedCategory === 'All' ? item.category : selectedCategory;

                return (
                  <div
                    key={item.district.id}
                    onClick={() => {
                      setActiveDistrictId(item.district.id);
                      setInspectorOpen(true);
                    }}
                    className={`p-3.5 border-2 transition-all cursor-pointer rounded-lg space-y-2 ${
                      isSelected
                        ? 'bg-white border-[#171717] shadow-[4px_4px_0px_#D65A3A]'
                        : 'bg-white border-[#171717]/30 hover:border-[#171717] hover:shadow-[2px_2px_0px_#171717]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-sm text-[#D65A3A]">
                          0{idx + 1}
                        </span>
                        <span className="font-serif font-bold text-base text-[#171717]">
                          {displayCategory}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#D65A3A] bg-[#D65A3A]/10 px-2 py-0.5 border border-[#D65A3A]/30 rounded">
                        SCORE {item.breakdown.total_score}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-sans text-[#171717]/80">
                      <span>📍 {item.district.name} District</span>
                      <span className="font-mono font-semibold text-[#285943]">
                        {item.demandCount} Signals
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Guidance Prompt */}
          <div className="bg-white border border-[#171717] p-3.5 rounded-lg space-y-2 font-mono text-xs">
            <div className="flex items-center space-x-2 text-[#D65A3A] font-bold uppercase text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>POLICY DECISION HELPER</span>
            </div>
            <p className="font-sans text-xs text-[#171717]/80 leading-snug">
              Click any district pin on the physical map or selection above to open the complete Priority Inspector & Evidence Breakdown.
            </p>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SUMMARY STATS STRIP */}
      <div className="bg-[#171717] text-[#F7F5EF] p-4 font-mono text-xs border-t-2 border-[#171717]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-around gap-6 text-center">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-serif font-extrabold text-[#D65A3A]">
              {totalRequestsCount.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-300">
              CITIZEN REQUESTS INGESTED
            </span>
          </div>

          <div className="h-4 w-[1px] bg-gray-700 hidden sm:block"></div>

          <div className="flex items-center space-x-3">
            <span className="text-xl font-serif font-extrabold text-[#D9A441]">
              {totalHotspotsCount}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-300">
              CITY HOTSPOTS MONITORED
            </span>
          </div>

          <div className="h-4 w-[1px] bg-gray-700 hidden sm:block"></div>

          <div className="flex items-center space-x-3">
            <span className="text-xl font-serif font-extrabold text-[#285943] bg-white/10 px-2 py-0.5 rounded">
              {flaggedDistrictsCount}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-300">
              DISTRICTS FLAGGED FOR ACTION
            </span>
          </div>
        </div>
      </div>

      {/* 4. DISTRICT INSPECTOR DRAWER / CARD OVERLAY */}
      {inspectorOpen && activeEvaluation && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-white border-2 border-[#171717] shadow-[8px_8px_0px_#171717] p-5 rounded-xl font-sans space-y-4 max-h-[90vh] overflow-y-auto">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b-2 border-[#171717] pb-3">
            <div>
              <span className="font-mono text-[10px] font-bold uppercase text-[#D65A3A] tracking-wider block">
                DISTRICT INSPECTOR
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#171717]">
                District: {activeEvaluation.district.name}
              </h2>
            </div>
            <button
              onClick={() => setInspectorOpen(false)}
              className="p-1 hover:bg-[#171717]/10 rounded border border-[#171717] font-mono text-xs font-bold cursor-pointer"
            >
              <X className="w-4 h-4 text-[#171717]" />
            </button>
          </div>

          {/* Priority Score Gauge */}
          <div className="bg-[#F7F5EF] border border-[#171717] p-3.5 rounded-lg flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase text-[#171717]">
              Priority Score
            </span>
            <div className="font-serif text-2xl font-extrabold text-[#D65A3A]">
              {activeEvaluation.breakdown.total_score} <span className="text-xs font-sans text-[#171717]/50 font-normal">/ 100</span>
            </div>
          </div>

          {/* 🔥 Why is this a priority? */}
          <div className="space-y-3">
            <div className="flex items-center space-x-1.5 text-xs font-mono font-bold uppercase text-[#D65A3A] border-b border-[#171717]/10 pb-1">
              <Flame className="w-4 h-4 fill-[#D65A3A]" />
              <span>WHY IS THIS A PRIORITY?</span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {/* Bar Gauge 1: Water / Category access */}
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span>{activeEvaluation.category} Access Deficit</span>
                  <span className="text-[#D65A3A]">{waterScore}</span>
                </div>
                <div className="w-full bg-[#171717]/10 h-3 rounded-full overflow-hidden border border-[#171717]/20">
                  <div 
                    className="bg-[#D65A3A] h-full rounded-full transition-all duration-500"
                    style={{ width: `${waterScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Bar Gauge 2: Citizen demand */}
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span>Citizen Demand Signals</span>
                  <span className="text-[#D65A3A]">{demandScore}</span>
                </div>
                <div className="w-full bg-[#171717]/10 h-3 rounded-full overflow-hidden border border-[#171717]/20">
                  <div 
                    className="bg-[#D9A441] h-full rounded-full transition-all duration-500"
                    style={{ width: `${demandScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Bar Gauge 3: Infrastructure gap */}
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span>Infrastructure Asset Gap</span>
                  <span className="text-[#D65A3A]">{gapScore}</span>
                </div>
                <div className="w-full bg-[#171717]/10 h-3 rounded-full overflow-hidden border border-[#171717]/20">
                  <div 
                    className="bg-[#285943] h-full rounded-full transition-all duration-500"
                    style={{ width: `${gapScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* RECOMMENDED ACTION */}
          <div className="bg-[#171717] text-[#F7F5EF] p-4 rounded-lg space-y-2 border border-[#171717]">
            <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#D65A3A]">
              RECOMMENDED ACTION
            </div>
            <div className="font-serif text-base font-bold text-white">
              Expand rural {activeEvaluation.category.toLowerCase()} infrastructure & supply grid
            </div>

            <div className="pt-2 border-t border-white/20 flex items-center justify-between font-mono text-xs">
              <span className="text-gray-300">
                Est. reach: <strong className="text-white">{(activeEvaluation.district.population * 0.12).toLocaleString(undefined, { maximumFractionDigits: 0 })} citizens</strong>
              </span>
              <span className="bg-[#D65A3A] text-white px-2 py-0.5 font-bold uppercase text-[10px] rounded">
                Urgency: HIGH
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 font-mono text-xs pt-1">
            <button
              onClick={() => onOpenScoreModal(activeEvaluation.breakdown, activeEvaluation.district, activeEvaluation.category)}
              className="px-3 py-2 bg-white border border-[#171717] text-[#171717] font-bold uppercase tracking-wider hover:bg-[#171717]/10 transition-colors rounded text-center cursor-pointer"
            >
              View Evidence
            </button>

            {onNavigateToEngine ? (
              <button
                onClick={onNavigateToEngine}
                className="px-3 py-2 bg-white border border-[#171717] text-[#171717] font-bold uppercase tracking-wider hover:bg-[#171717]/10 transition-colors rounded text-center cursor-pointer"
              >
                Compare Districts
              </button>
            ) : (
              <button
                onClick={() => onSelectHotspotForPolicy(activeEvaluation.district, activeEvaluation.category)}
                className="px-3 py-2 bg-[#D65A3A] text-white font-bold uppercase tracking-wider hover:bg-[#171717] transition-colors rounded text-center cursor-pointer border border-[#171717]"
              >
                Policy Lab →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
