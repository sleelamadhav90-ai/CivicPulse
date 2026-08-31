import React, { useState, useMemo } from 'react';
import { District, CitizenRequest, InfrastructureCategory, ScoreBreakdown } from '../types';
import { calculatePriorityScore, getCategoryAccess, getPriorityTier } from '../utils/scoring';
import { getCityDemandHotspot } from '../utils/demandAggregation';
import { IndiaMapCanvas, EvaluatedDistrict, MapLayerState } from './IndiaMapCanvas';
import { Layers, CheckSquare, Square, Info, Compass, Sliders, Database } from 'lucide-react';

interface HotspotMapProps {
  districts: District[];
  requests: CitizenRequest[];
  onSelectHotspotForPolicy: (district: District, category: InfrastructureCategory) => void;
  onOpenScoreModal: (breakdown: ScoreBreakdown, district: District, category: InfrastructureCategory) => void;
}

const CATEGORIES: (InfrastructureCategory | 'All')[] = [
  'All', 'Water', 'Drainage', 'Roads', 'Electricity', 'Healthcare', 'Education'
];

export const HotspotMap: React.FC<HotspotMapProps> = ({
  districts,
  requests,
  onSelectHotspotForPolicy,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<InfrastructureCategory | 'All'>('All');
  const [activeDistrictId, setActiveDistrictId] = useState<string>(districts[0]?.id || 'vijayawada');
  const [layersPanelOpen, setLayersPanelOpen] = useState(true);

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
    <div className="relative w-full h-[calc(100vh-2rem)] flex flex-col bg-[#F7F5EF] border border-[#171717]">
      {/* Top Atlas Header Bar */}
      <div className="z-20 bg-[#F7F5EF] border-b border-[#171717] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center space-x-3">
          <span className="font-serif text-base font-bold text-[#171717]">
            OPEN CIVIC MAP & ATLAS
          </span>
          <span className="text-[10px] px-2 py-0.5 bg-[#D65A3A] text-white font-mono font-bold uppercase tracking-widest">
            {activeLayersCount} DATASETS COMBINED
          </span>
          <span className="hidden md:inline text-[11px] text-[#171717]/70 font-sans">
            India Stack × Bloomberg Data Viz
          </span>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1 items-center">
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
      <div className="flex-1 w-full h-full z-10 bg-[#F7F5EF] relative">
        <IndiaMapCanvas
          evaluations={districtEvaluations}
          activeDistrictId={activeDistrictId}
          onSelectDistrict={setActiveDistrictId}
          selectedCategory={selectedCategory}
          layers={layers}
          onSelectHotspotForPolicy={onSelectHotspotForPolicy}
        />

        {/* ATLAS LAYERS TOGGLE PANEL */}
        <div className="absolute top-4 left-4 z-20 w-72 bg-[#F7F5EF] border border-[#171717] shadow-[4px_4px_0px_#171717] font-mono text-xs">
          <div className="p-3 bg-white border-b border-[#171717] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#D65A3A]" />
              <span className="font-bold text-[#171717] uppercase tracking-wider text-[11px]">
                PUBLIC DATASET LAYERS
              </span>
            </div>
            <button
              onClick={() => setLayersPanelOpen(!layersPanelOpen)}
              className="text-[10px] text-[#171717]/70 hover:text-[#171717] underline cursor-pointer"
            >
              {layersPanelOpen ? 'Collapse' : 'Expand'}
            </button>
          </div>

          {layersPanelOpen && (
            <div className="p-3 space-y-2 bg-[#F7F5EF]">
              <div className="text-[10px] text-[#171717]/60 font-sans italic border-b border-[#171717]/10 pb-1 mb-2">
                Turn layers on/off to combine public infrastructure datasets:
              </div>

              {[
                { key: 'citizen_demand', label: 'Citizen Demand', checked: layers.citizen_demand, color: '#D65A3A' },
                { key: 'infrastructure', label: 'Infrastructure', checked: layers.infrastructure, color: '#285943' },
                { key: 'population', label: 'Population', checked: layers.population, color: '#D9A441' },
                { key: 'projects', label: 'Government Projects', checked: layers.projects, color: '#171717' },
                { key: 'healthcare', label: 'Healthcare', checked: layers.healthcare, color: '#285943' },
                { key: 'education', label: 'Education', checked: layers.education, color: '#285943' },
                { key: 'roads', label: 'Roads', checked: layers.roads, color: '#171717' },
                { key: 'digital', label: 'Digital Connectivity', checked: layers.digital, color: '#D65A3A' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => toggleLayer(item.key as keyof MapLayerState)}
                  className={`w-full flex items-center justify-between p-1.5 border transition-all cursor-pointer ${
                    item.checked 
                      ? 'bg-white border-[#171717] text-[#171717] font-bold' 
                      : 'bg-[#F7F5EF] border-[#171717]/20 text-[#171717]/60'
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
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Legend & Atlas Fusion Statement */}
        <div className="absolute bottom-6 left-4 z-20 bg-[#F7F5EF] border border-[#171717] p-4 shadow-[4px_4px_0px_#171717] font-mono text-xs max-w-sm hidden sm:block">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#D65A3A] border-b border-[#171717]/20 pb-1 mb-2">
            ATLAS FUSION STATUS
          </div>
          <div className="text-[11px] text-[#171717]/80 leading-relaxed font-sans mb-3">
            Combines citizen voice signals, Jal Jeevan Mission API, PWD road asset registries, and census baselines into a single unified public map interface.
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono border-t border-[#171717]/10 pt-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#D65A3A]"></span> Critical Demand
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#D9A441]"></span> High Population
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#285943]"></span> Verified Asset
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

