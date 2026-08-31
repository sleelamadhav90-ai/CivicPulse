import React, { useState, useMemo, useEffect } from 'react';
import { District, CitizenRequest, InfrastructureCategory, ScoreBreakdown, CountryCode } from '../types';
import { calculatePriorityScore, getCategoryAccess, getPriorityTier } from '../utils/scoring';
import { getCityDemandHotspot } from '../utils/demandAggregation';
import { IndiaMapCanvas, EvaluatedDistrict, MapLayerState } from './IndiaMapCanvas';
import { GLOBAL_COUNTRIES } from '../data/globalConfig';
import { Layers, CheckSquare, Square, Info, Compass, Sliders, Database } from 'lucide-react';

interface HotspotMapProps {
  districts: District[];
  requests: CitizenRequest[];
  onSelectHotspotForPolicy: (district: District, category: InfrastructureCategory) => void;
  onOpenScoreModal: (breakdown: ScoreBreakdown, district: District, category: InfrastructureCategory) => void;
  selectedCountryCode?: CountryCode;
}

const CATEGORIES: (InfrastructureCategory | 'All')[] = [
  'All', 'Water', 'Drainage', 'Roads', 'Electricity', 'Healthcare', 'Education'
];

export const HotspotMap: React.FC<HotspotMapProps> = ({
  districts,
  requests,
  onSelectHotspotForPolicy,
  selectedCountryCode = 'IN',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<InfrastructureCategory | 'All'>('All');
  const [activeDistrictId, setActiveDistrictId] = useState<string>(districts[0]?.id || 'vijayawada');
  const [layersPanelOpen, setLayersPanelOpen] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);

  const countryConfig = GLOBAL_COUNTRIES[selectedCountryCode] || GLOBAL_COUNTRIES['IN'];

  // Update active district if the district list changes (e.g. on country switch)
  useEffect(() => {
    if (districts.length > 0 && !districts.some(d => d.id === activeDistrictId)) {
      setActiveDistrictId(districts[0].id);
    }
  }, [districts, activeDistrictId]);

  // Exact Layers specified in prompt
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
      const targetCategory: InfrastructureCategory = selectedCategory === 'All' ? 'Drainage' : selectedCategory;
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

  const activeLayersCount = Object.values(layers).filter(Boolean).length;

  return (
    <div className="relative w-full h-[calc(100vh-2rem)] flex flex-col bg-[#0f172a] border border-[#171717]">
      {/* Top Atlas Header Bar */}
      <div className="z-20 bg-[#F7F5EF] border-b border-[#171717] px-4 py-2 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center space-x-3">
          <span className="font-serif text-base font-bold text-[#171717] flex items-center gap-2">
            <span>{countryConfig.flag}</span>
            <span>{countryConfig.name.toUpperCase()} CIVIC MAP</span>
          </span>
          <span className="text-[10px] px-2 py-0.5 bg-[#D65A3A] text-white font-mono font-bold uppercase tracking-widest hidden sm:inline">
            {activeLayersCount} DATASETS ACTIVE
          </span>
          <span className="hidden lg:inline text-[11px] text-[#171717]/70 font-sans">
            {countryConfig.hierarchy.level2} / {countryConfig.hierarchy.level3} Layer
          </span>
        </div>

        {/* Category Filters & Layer Popover Toggle */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {/* Layer Popover Button in Header */}
          <div className="relative">
            <button
              onClick={() => setLayersPanelOpen(!layersPanelOpen)}
              className={`px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
                layersPanelOpen
                  ? 'bg-[#D65A3A] text-white border-[#D65A3A] shadow-sm'
                  : 'bg-white text-[#171717] border-[#171717]/30 hover:border-[#171717]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Layers</span>
              <span className="bg-[#171717] text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                {activeLayersCount}
              </span>
            </button>

            {/* LAYERS DROPDOWN POPOVER */}
            {layersPanelOpen && (
              <div className="absolute top-full right-0 mt-2 z-30 w-72 bg-[#F7F5EF] border border-[#171717] shadow-[6px_6px_0px_rgba(0,0,0,0.4)] font-mono text-xs p-3 space-y-2">
                <div className="flex items-center justify-between border-b border-[#171717]/20 pb-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-[#D65A3A]" />
                    <span className="font-bold text-[#171717] uppercase tracking-wider text-[11px]">
                      DATASET LAYERS
                    </span>
                  </div>
                  <button
                    onClick={() => setLayersPanelOpen(false)}
                    className="text-[10px] text-[#171717]/60 hover:text-[#171717] font-bold"
                  >
                    ✕ CLOSE
                  </button>
                </div>

                <div className="text-[10px] text-[#171717]/70 font-sans italic mb-2">
                  Toggle overlays to view on physical satellite canvas:
                </div>

                {[
                  { key: 'citizen_demand', label: 'Citizen Demand Signals', checked: layers.citizen_demand, color: '#D65A3A' },
                  { key: 'infrastructure', label: 'Infrastructure Deficits', checked: layers.infrastructure, color: '#285943' },
                  { key: 'population', label: 'Population Heatmaps', checked: layers.population, color: '#D9A441' },
                  { key: 'projects', label: 'Government Projects', checked: layers.projects, color: '#171717' },
                  { key: 'healthcare', label: 'Healthcare Facilities', checked: layers.healthcare, color: '#285943' },
                  { key: 'education', label: 'Education Hubs', checked: layers.education, color: '#285943' },
                  { key: 'roads', label: 'Road Transit Networks', checked: layers.roads, color: '#171717' },
                  { key: 'digital', label: 'Digital Fiber Nodes', checked: layers.digital, color: '#D65A3A' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => toggleLayer(item.key as keyof MapLayerState)}
                    className={`w-full flex items-center justify-between p-2 border transition-all cursor-pointer ${
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

          <div className="h-4 w-[1px] bg-[#171717]/20 mx-1 hidden sm:block"></div>

          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-[#171717] text-[#F7F5EF]' 
                  : 'text-[#171717] hover:bg-[#171717]/10 border border-[#171717]/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="flex-1 w-full h-full z-10 bg-[#0f172a] relative">
        <IndiaMapCanvas
          evaluations={districtEvaluations}
          activeDistrictId={activeDistrictId}
          onSelectDistrict={setActiveDistrictId}
          selectedCategory={selectedCategory}
          layers={layers}
          onSelectHotspotForPolicy={onSelectHotspotForPolicy}
          selectedCountryCode={selectedCountryCode}
        />

        {/* BOTTOM COMPACT FLOATING LEGEND STRIP */}
        <div className="absolute bottom-4 left-4 z-20 font-mono text-xs">
          <div className="bg-[#171717]/90 text-white border border-[#333] px-3 py-1.5 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] backdrop-blur-sm flex items-center gap-3">
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D65A3A] inline-block"></span>
                <span className="text-gray-200">Critical Demand</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D9A441] inline-block"></span>
                <span className="text-gray-200">High Population</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#285943] inline-block"></span>
                <span className="text-gray-200">Verified Asset</span>
              </span>
            </div>

            <button
              onClick={() => setLegendOpen(!legendOpen)}
              className="text-[10px] text-gray-400 hover:text-white underline cursor-pointer ml-2 flex items-center gap-1"
            >
              <Info className="w-3 h-3 text-[#D65A3A]" />
              <span>{legendOpen ? 'Hide Info' : 'Atlas Info'}</span>
            </button>
          </div>

          {/* Expanded Info Drawer if requested */}
          {legendOpen && (
            <div className="mt-2 bg-[#171717]/95 text-white border border-[#333] p-3 shadow-[4px_4px_0px_rgba(0,0,0,0.6)] backdrop-blur-md max-w-sm space-y-1.5 font-sans text-[11px]">
              <div className="font-mono text-[10px] font-bold text-[#D65A3A] uppercase tracking-wider">
                ATLAS FUSION STATUS
              </div>
              <p className="text-gray-300 leading-relaxed">
                Combines citizen voice signals, Jal Jeevan Mission API, PWD road asset registries, and census baselines into a single unified public map interface.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

