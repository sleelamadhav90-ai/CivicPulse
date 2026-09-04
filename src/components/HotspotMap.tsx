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
    <div className="w-full min-h-[90vh] bg-[#F7F5EF] text-[#171717] font-sans flex flex-col border border-[#171717] rounded-lg overflow-hidden shadow-sm">
      {/* 1. TOP POLICY MAP HEADER */}
      <div className="bg-[#F7F5EF] border-b border-[#171717]/20 p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-[11px] font-mono font-bold uppercase tracking-widest text-[#D65A3A]">
              <span>CIVICPULSE INTELLIGENCE</span>
              <span>•</span>
              <span className="text-[#171717]/70">{countryConfig.flag} {countryConfig.name}</span>
            </div>
            <div className="flex items-baseline space-x-3">
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
                CIVIC PRIORITY MAP
              </h1>
              <span className="font-mono text-xs text-[#171717]/60 font-semibold">
                India · {activeEvaluation?.district.state || 'Andhra Pradesh'} · {selectedCategory === 'All' ? 'All Sectors' : selectedCategory}
              </span>
            </div>
            <p className="text-xs font-sans text-[#171717]/80 max-w-2xl">
              Spatial decision intelligence platform prioritizing public infrastructure interventions based on citizen demand signals and asset gaps.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onNavigateToBriefing && (
              <button
                onClick={onNavigateToBriefing}
                className="px-3 py-1.5 bg-white border border-[#171717]/30 font-mono text-xs font-bold uppercase tracking-wider text-[#171717] hover:bg-[#D65A3A] hover:text-white hover:border-[#D65A3A] transition-all shadow-sm flex items-center gap-2 cursor-pointer rounded"
              >
                <FileText className="w-3.5 h-3.5 text-[#D65A3A]" />
                <span>Gov Briefing →</span>
              </button>
            )}

            {/* Layer Popover Toggle Button */}
            <div className="relative">
              <button
                onClick={() => setLayersPanelOpen(!layersPanelOpen)}
                className={`px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-2 rounded shadow-sm ${
                  layersPanelOpen
                    ? 'bg-[#171717] text-white border-[#171717]'
                    : 'bg-white text-[#171717] border-[#171717]/30 hover:border-[#171717]'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-[#D65A3A]" />
                <span>Layers ({activeLayersCount})</span>
              </button>

              {/* LAYERS DROPDOWN POPOVER */}
              {layersPanelOpen && (
                <div className="absolute top-full right-0 mt-2 z-40 w-72 bg-[#F7F5EF] border border-[#171717]/30 shadow-lg font-mono text-xs p-3 space-y-2 rounded-lg backdrop-blur-md">
                  <div className="flex items-center justify-between border-b border-[#171717]/15 pb-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-[#D65A3A]" />
                      <span className="font-bold text-[#171717] uppercase tracking-wider text-[11px]">
                        MAP LAYERS
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
                          ? 'bg-white border-[#171717]/40 text-[#171717] font-bold shadow-sm' 
                          : 'bg-[#F7F5EF] border-[#171717]/15 text-[#171717]/60 hover:border-[#171717]/30'
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

        {/* INDIA ADMINISTRATIVE HIERARCHY BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="bg-white/80 border border-[#171717]/20 px-3 py-1.5 font-mono text-xs flex flex-wrap items-center gap-2 rounded-md shadow-sm text-[#171717]">
            <span className="font-bold text-[#D65A3A] uppercase tracking-wider text-[10px] flex items-center gap-1">
              <span>🇮🇳</span> HIERARCHY:
            </span>

            {/* State Select */}
            <span className="text-[#171717]/60 font-medium">State:</span>
            <select
              value={activeEvaluation?.district.state || 'Andhra Pradesh'}
              onChange={(e) => {
                const targetState = e.target.value;
                const matchedDistrict = districts.find(d => d.state === targetState);
                if (matchedDistrict) {
                  setActiveDistrictId(matchedDistrict.id);
                }
              }}
              className="bg-[#F7F5EF] text-[#171717] font-bold px-2 py-0.5 text-xs border border-[#171717]/30 rounded cursor-pointer hover:border-[#171717]"
            >
              {Array.from(new Set(districts.map(d => d.state))).map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>

            <span className="text-[#171717]/40">→</span>
            <span className="text-[#171717]/60 font-medium">District:</span>
            <select
              value={activeDistrictId}
              onChange={(e) => setActiveDistrictId(e.target.value)}
              className="bg-[#F7F5EF] text-[#171717] font-bold px-2 py-0.5 text-xs border border-[#171717]/30 rounded cursor-pointer hover:border-[#171717]"
            >
              {districts
                .filter(d => d.state === (activeEvaluation?.district.state || 'Andhra Pradesh'))
                .map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
            </select>

            <span className="text-[#171717]/40">→</span>
            <span className="text-[#171717]/60 font-medium">Block:</span>
            <span className="bg-[#F7F5EF] px-2 py-0.5 text-[#171717] font-bold border border-[#171717]/20 rounded text-[11px]">
              {activeEvaluation?.district.name} North
            </span>

            <span className="text-[#171717]/40">→</span>
            <span className="text-[#171717]/60 font-medium">Village/Ward:</span>
            <span className="bg-[#F7F5EF] px-2 py-0.5 text-[#171717] font-bold border border-[#171717]/20 rounded text-[11px]">
              Ward 14 (Pumping Grid)
            </span>
          </div>

          {/* Category Filters Bar */}
          <div className="flex flex-wrap items-center gap-1 font-mono text-xs">
            <span className="font-bold uppercase tracking-wider text-[#171717]/50 text-[10px] mr-1">
              SECTOR:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer rounded ${
                  selectedCategory === cat 
                    ? 'bg-[#171717] text-[#F7F5EF] shadow-sm font-bold' 
                    : 'bg-white text-[#171717] border border-[#171717]/20 hover:border-[#171717]/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. MAIN POLICY MAP + INTEGRATED DISTRICT INSPECTOR LAYOUT */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 relative min-h-[580px] bg-[#F7F5EF]">
        {/* MAP CANVAS (68% width on desktop) */}
        <div className="lg:col-span-8 relative h-[520px] lg:h-auto min-h-[520px] w-full border-r border-[#171717]/20">
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
        </div>

        {/* INTEGRATED DISTRICT INSPECTOR SIDEBAR (32% width on desktop) */}
        <div className="lg:col-span-4 bg-[#F7F5EF] p-4 sm:p-5 flex flex-col justify-between space-y-4 overflow-y-auto">
          {activeEvaluation ? (
            <div className="space-y-4">
              {/* Inspector Header */}
              <div className="border-b border-[#171717]/20 pb-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold uppercase text-[#D65A3A] tracking-wider flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#D65A3A]"></span>
                    DISTRICT INSPECTOR
                  </span>
                  <span className="font-mono text-[10px] bg-[#171717] text-white px-2 py-0.5 font-bold uppercase rounded">
                    {activeEvaluation.priorityTier.label} PRIORITY
                  </span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#171717]">
                  {activeEvaluation.district.name} District
                </h2>
                <span className="font-mono text-xs text-[#171717]/60 block">
                  State: {activeEvaluation.district.state} · Pop: {(activeEvaluation.district.population / 100000).toFixed(1)}L
                </span>
              </div>

              {/* Priority Score Gauge */}
              <div className="bg-white border border-[#171717]/30 p-3.5 rounded-lg flex items-center justify-between shadow-sm">
                <div>
                  <span className="font-mono text-[11px] font-bold uppercase text-[#171717] block">
                    Composite Priority Score
                  </span>
                  <span className="text-[11px] font-sans text-[#171717]/60">
                    Ranked #{sortedEvaluations.findIndex(e => e.district.id === activeDistrictId) + 1} of {districts.length} districts
                  </span>
                </div>
                <div className="font-serif text-3xl font-extrabold text-[#D65A3A]">
                  {activeEvaluation.breakdown.total_score} <span className="text-xs font-sans text-[#171717]/50 font-normal">/ 100</span>
                </div>
              </div>

              {/* Why is this a priority? */}
              <div className="space-y-2.5">
                <div className="flex items-center space-x-1.5 text-xs font-mono font-bold uppercase text-[#D65A3A]">
                  <Flame className="w-3.5 h-3.5 fill-[#D65A3A]" />
                  <span>WHY THIS DISTRICT IS PRIORITIZED</span>
                </div>

                <div className="space-y-2 font-mono text-xs bg-white border border-[#171717]/20 p-3 rounded-lg shadow-sm">
                  {/* Gauge 1: Category access */}
                  <div>
                    <div className="flex justify-between text-[11px] font-bold mb-1">
                      <span>{activeEvaluation.category} Access Deficit</span>
                      <span className="text-[#D65A3A]">{waterScore}%</span>
                    </div>
                    <div className="w-full bg-[#171717]/10 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#D65A3A] h-full rounded-full transition-all duration-500"
                        style={{ width: `${waterScore}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Gauge 2: Citizen demand */}
                  <div>
                    <div className="flex justify-between text-[11px] font-bold mb-1">
                      <span>Citizen Demand Signals</span>
                      <span className="text-[#D9A441]">{demandScore}%</span>
                    </div>
                    <div className="w-full bg-[#171717]/10 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#D9A441] h-full rounded-full transition-all duration-500"
                        style={{ width: `${demandScore}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Gauge 3: Infrastructure gap */}
                  <div>
                    <div className="flex justify-between text-[11px] font-bold mb-1">
                      <span>Infrastructure Asset Gap</span>
                      <span className="text-[#285943]">{gapScore}%</span>
                    </div>
                    <div className="w-full bg-[#171717]/10 h-2 rounded-full overflow-hidden">
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
                <div className="font-serif text-base font-bold text-white leading-snug">
                  Expand rural {activeEvaluation.category.toLowerCase()} infrastructure & supply grid
                </div>

                <div className="pt-2 border-t border-white/20 flex items-center justify-between font-mono text-xs">
                  <span className="text-gray-300 text-[11px]">
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
                  className="px-3 py-2 bg-white border border-[#171717]/30 text-[#171717] font-bold uppercase tracking-wider hover:bg-[#171717]/10 transition-colors rounded text-center cursor-pointer shadow-sm"
                >
                  View Evidence
                </button>

                {onNavigateToEngine ? (
                  <button
                    onClick={onNavigateToEngine}
                    className="px-3 py-2 bg-white border border-[#171717]/30 text-[#171717] font-bold uppercase tracking-wider hover:bg-[#171717]/10 transition-colors rounded text-center cursor-pointer shadow-sm"
                  >
                    Compare
                  </button>
                ) : (
                  <button
                    onClick={() => onSelectHotspotForPolicy(activeEvaluation.district, activeEvaluation.category)}
                    className="px-3 py-2 bg-[#D65A3A] text-white font-bold uppercase tracking-wider hover:bg-[#171717] transition-colors rounded text-center cursor-pointer shadow-sm"
                  >
                    Policy Lab →
                  </button>
                )}
              </div>

              {/* Quick Jump Priority Districts List */}
              <div className="pt-3 border-t border-[#171717]/15 space-y-2">
                <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#171717]/60">
                  TOP ACTION ZONES IN {activeEvaluation.district.state.toUpperCase()}
                </div>
                <div className="space-y-1.5">
                  {sortedEvaluations.slice(0, 3).map((item, idx) => {
                    const isSelected = item.district.id === activeDistrictId;
                    return (
                      <div
                        key={item.district.id}
                        onClick={() => setActiveDistrictId(item.district.id)}
                        className={`p-2 border transition-all cursor-pointer rounded flex items-center justify-between text-xs ${
                          isSelected
                            ? 'bg-white border-[#171717] font-bold shadow-sm'
                            : 'bg-white/60 border-[#171717]/20 text-[#171717]/80 hover:bg-white hover:border-[#171717]/40'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[10px] text-[#D65A3A] font-bold">0{idx + 1}</span>
                          <span className="font-sans font-medium">{item.district.name}</span>
                        </div>
                        <span className="font-mono text-[11px] font-bold text-[#D65A3A]">
                          SCORE {item.breakdown.total_score}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-[#171717]/60 font-mono text-xs">
              Select a district on the map to inspect priority evidence.
            </div>
          )}
        </div>
      </div>

      {/* 3. BOTTOM SUMMARY STATS STRIP */}
      <div className="bg-[#171717] text-[#F7F5EF] p-3 font-mono text-xs border-t border-[#171717]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-around gap-4 text-center">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-serif font-extrabold text-[#D65A3A]">
              {totalRequestsCount.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">
              CITIZEN REQUESTS INGESTED
            </span>
          </div>

          <div className="h-3 w-[1px] bg-gray-700 hidden sm:block"></div>

          <div className="flex items-center space-x-2">
            <span className="text-lg font-serif font-extrabold text-[#D9A441]">
              {totalHotspotsCount}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">
              CITY HOTSPOTS MONITORED
            </span>
          </div>

          <div className="h-3 w-[1px] bg-gray-700 hidden sm:block"></div>

          <div className="flex items-center space-x-2">
            <span className="text-lg font-serif font-extrabold text-[#285943] bg-white/10 px-2 py-0.5 rounded">
              {flaggedDistrictsCount}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">
              DISTRICTS FLAGGED FOR ACTION
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
