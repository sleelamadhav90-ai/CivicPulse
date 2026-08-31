import React, { useState, useMemo } from 'react';
import { District, CitizenRequest, InfrastructureCategory, ScoreBreakdown } from '../types';
import { calculatePriorityScore, getCategoryAccess, getPriorityTier } from '../utils/scoring';
import { getCityDemandHotspot } from '../utils/demandAggregation';
import { IndiaMapCanvas, EvaluatedDistrict } from './IndiaMapCanvas';
import { Layers } from 'lucide-react';

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

  return (
    <div className="relative w-full h-[calc(100vh-2rem)] flex flex-col bg-[#faf9f6]">
      {/* Top Filter Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-1 items-center bg-white/90 backdrop-blur border border-[#2d2d2d]/10 p-1 shadow-sm">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-[10px] sm:text-xs font-sans uppercase tracking-widest font-semibold transition-colors ${
              selectedCategory === cat 
                ? 'bg-[#2d2d2d] text-[#faf9f6]' 
                : 'text-[#57534e] hover:bg-[#2d2d2d]/5 hover:text-[#2d2d2d]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Map Canvas */}
      <div className="flex-1 w-full h-full z-10 border border-[#2d2d2d]/10 bg-[#faf9f6]">
        <IndiaMapCanvas
          evaluations={districtEvaluations}
          activeDistrictId={activeDistrictId}
          onSelectDistrict={setActiveDistrictId}
          selectedCategory={selectedCategory}
          onSelectHotspotForPolicy={onSelectHotspotForPolicy}
        />
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-8 left-4 z-20 bg-white/90 backdrop-blur border border-[#2d2d2d]/10 p-4 shadow-sm flex flex-col gap-3">
        <h4 className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#2d2d2d] border-b border-[#2d2d2d]/10 pb-2">
          Infrastructure Urgency
        </h4>
        <div className="flex flex-col gap-2 font-sans text-[10px] uppercase tracking-widest text-[#57534e]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#bc4749]"></span> Critical
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#e07a5f]"></span> High Demand
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#386641]"></span> Monitored
          </div>
        </div>
      </div>
    </div>
  );
};
