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
    <div className="relative w-full h-[calc(100vh-2rem)] flex flex-col bg-[#f4f1ea] border border-[#1a237e]">
      {/* Top Filter Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-1 items-center bg-[#f4f1ea]/95 backdrop-blur border border-[#1a237e] p-1 shadow-[4px_4px_0px_rgba(26,35,126,0.2)]">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-[10px] sm:text-xs font-sans uppercase tracking-widest font-semibold transition-colors ${
              selectedCategory === cat 
                ? 'bg-[#1a237e] text-[#f4f1ea]' 
                : 'text-[#1a237e]/70 hover:bg-[#1a237e]/10 hover:text-[#1a237e]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Map Canvas */}
      <div className="flex-1 w-full h-full z-10 bg-[#f4f1ea]">
        <IndiaMapCanvas
          evaluations={districtEvaluations}
          activeDistrictId={activeDistrictId}
          onSelectDistrict={setActiveDistrictId}
          selectedCategory={selectedCategory}
          onSelectHotspotForPolicy={onSelectHotspotForPolicy}
        />
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-8 left-4 z-20 bg-[#f4f1ea]/95 backdrop-blur border border-[#1a237e] p-5 shadow-[4px_4px_0px_rgba(26,35,126,0.2)] flex flex-col gap-3">
        <h4 className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#1a237e] border-b border-[#1a237e]/20 pb-2">
          Infrastructure Urgency
        </h4>
        <div className="flex flex-col gap-3 font-sans text-xs uppercase tracking-widest text-[#1a237e]">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-4 h-4">
               <span className="absolute w-4 h-4 bg-[#c84b31] opacity-40 rounded-full animate-ping"></span>
               <span className="relative w-2 h-2 bg-[#c84b31] rounded-full"></span>
            </div>
            Critical Action
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-[#d97706] rounded-full ml-0.5"></span> High Demand
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-[#2e7d32] rounded-full ml-0.5"></span> Monitored
          </div>
        </div>
      </div>
    </div>
  );
};
