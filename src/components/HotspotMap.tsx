import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Filter, 
  Search, 
  Flame, 
  Droplet, 
  HeartPulse, 
  Route, 
  GraduationCap, 
  Zap,
  TrendingUp, 
  ShieldAlert, 
  Layers, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Users,
  Radio,
  FileText
} from 'lucide-react';
import { District, CitizenRequest, InfrastructureCategory, ScoreBreakdown } from '../types';
import { calculatePriorityScore, getCategoryAccess, getPriorityTier } from '../utils/scoring';

interface HotspotMapProps {
  districts: District[];
  requests: CitizenRequest[];
  onSelectHotspotForPolicy: (district: District, category: InfrastructureCategory) => void;
  onOpenScoreModal: (breakdown: ScoreBreakdown, district: District, category: InfrastructureCategory) => void;
}

export const HotspotMap: React.FC<HotspotMapProps> = ({
  districts,
  requests,
  onSelectHotspotForPolicy,
  onOpenScoreModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<InfrastructureCategory | 'All'>('All');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [minPriorityThreshold, setMinPriorityThreshold] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeDistrictId, setActiveDistrictId] = useState<string>(districts[0]?.id || 'guntur');
  const [activeTabSubView, setActiveTabSubView] = useState<'map' | 'signals'>('map');

  // Compute stats and scores for each district based on category & citizen requests
  const districtEvaluations = useMemo(() => {
    return districts.map((district) => {
      // Get category to evaluate (or highest deficit category if 'All')
      const targetCategory: InfrastructureCategory = selectedCategory === 'All' ? 'Water' : selectedCategory;
      
      // Count citizen requests matching this district
      const matchedRequests = requests.filter(
        (r) => r.location.toLowerCase() === district.name.toLowerCase() &&
               (selectedCategory === 'All' || r.category === selectedCategory)
      );
      const demandCount = matchedRequests.length;

      // Extract access score
      const currentAccess = getCategoryAccess(district, targetCategory);

      // Deterministic calculation
      const breakdown = calculatePriorityScore(
        district,
        targetCategory,
        8, // baseline urgency proxy
        demandCount
      );

      return {
        district,
        category: targetCategory,
        demandCount,
        currentAccess,
        breakdown,
        matchedRequests,
        priorityTier: getPriorityTier(breakdown.total_score),
      };
    });
  }, [districts, requests, selectedCategory]);

  // Filtered districts
  const filteredEvaluations = useMemo(() => {
    return districtEvaluations.filter((item) => {
      const matchSearch = item.district.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.district.state.toLowerCase().includes(searchQuery.toLowerCase());
      const matchState = selectedState === 'All' || item.district.state === selectedState;
      const matchScore = item.breakdown.total_score >= minPriorityThreshold;
      return matchSearch && matchState && matchScore;
    });
  }, [districtEvaluations, searchQuery, selectedState, minPriorityThreshold]);

  // Sort by priority score descending
  const sortedEvaluations = useMemo(() => {
    return [...filteredEvaluations].sort((a, b) => b.breakdown.total_score - a.breakdown.total_score);
  }, [filteredEvaluations]);

  // Currently inspected district
  const currentActiveEvaluation = useMemo(() => {
    return districtEvaluations.find((e) => e.district.id === activeDistrictId) || districtEvaluations[0];
  }, [districtEvaluations, activeDistrictId]);

  // Unique states
  const uniqueStates = useMemo(() => {
    return Array.from(new Set(districts.map((d) => d.state)));
  }, [districts]);

  // Map projection coordinates helper:
  // India bounds: Lat ~8 to 32 (range 24), Lon ~68 to 90 (range 22)
  const projectCoordinates = (lat: number, lon: number) => {
    const minLat = 7.5;
    const maxLat = 32.5;
    const minLon = 68.0;
    const maxLon = 90.0;

    const x = ((lon - minLon) / (maxLon - minLon)) * 100;
    // Invert Y because SVG coordinates go down from top
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;

    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  const getCategoryIcon = (category: InfrastructureCategory) => {
    switch (category) {
      case 'Water':
        return <Droplet className="w-3.5 h-3.5 text-sky-400" />;
      case 'Health':
        return <HeartPulse className="w-3.5 h-3.5 text-rose-400" />;
      case 'Roads':
        return <Route className="w-3.5 h-3.5 text-amber-400" />;
      case 'Education':
        return <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />;
      case 'Electricity':
        return <Zap className="w-3.5 h-3.5 text-yellow-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Bar & Filter Strip */}
      <div className="bg-[#111318] border border-slate-800 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="px-2 py-0.5 text-[9px] uppercase tracking-widest font-mono rounded bg-white/5 text-slate-400 border border-white/10">
                MODULE 02
              </span>
              <h2 className="text-xl font-light tracking-tight text-white">
                National Demand Hotspots & Gap Intelligence Map
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Fuses citizen feedback signals with demographic indices & infrastructure baselines to pinpoint urgent regional deficits.
            </p>
          </div>

          <div className="flex bg-[#0c0d10] p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTabSubView('map')}
              className={`px-3 py-1 text-xs uppercase tracking-wider rounded transition-all cursor-pointer ${
                activeTabSubView === 'map' ? 'bg-white/10 text-white font-medium shadow-sm' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Geographic Map
            </button>
            <button
              onClick={() => setActiveTabSubView('signals')}
              className={`px-3 py-1 text-xs uppercase tracking-wider rounded transition-all cursor-pointer ${
                activeTabSubView === 'signals' ? 'bg-white/10 text-white font-medium shadow-sm' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Live Signal Stream ({requests.length})
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {/* Sector Category */}
          <div>
            <label className="block text-[9px] uppercase tracking-widest text-slate-500 font-medium mb-1">
              Sector Category:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full bg-[#0c0d10] border border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 focus:ring-1 focus:ring-slate-400 focus:outline-none cursor-pointer"
            >
              <option value="All">All Categories (Aggregate)</option>
              <option value="Water">Water Supply & Sanitation</option>
              <option value="Health">Healthcare & Clinics</option>
              <option value="Roads">Arterial Roads & Transport</option>
              <option value="Education">Education & School Infra</option>
            </select>
          </div>

          {/* State Filter */}
          <div>
            <label className="block text-[9px] uppercase tracking-widest text-slate-500 font-medium mb-1">
              State / Region:
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-[#0c0d10] border border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 focus:ring-1 focus:ring-slate-400 focus:outline-none cursor-pointer"
            >
              <option value="All">All States ({uniqueStates.length})</option>
              {uniqueStates.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Min Priority Threshold Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[9px] uppercase tracking-widest text-slate-500 font-medium">
                Min Priority Score:
              </label>
              <span className="font-mono text-xs font-light text-slate-200">{minPriorityThreshold} / 100</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={minPriorityThreshold}
              onChange={(e) => setMinPriorityThreshold(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>

          {/* Search Query */}
          <div>
            <label className="block text-[9px] uppercase tracking-widest text-slate-500 font-medium mb-1">
              Search District:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="e.g. Guntur, Warangal, Nashik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0c0d10] border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:ring-1 focus:ring-slate-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {activeTabSubView === 'map' ? (
        /* Map & Leaderboard Split View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Interactive Geographic Canvas */}
          <div className="lg:col-span-8 bg-[#111318] border border-slate-800 rounded-lg p-6 relative overflow-hidden flex flex-col justify-between min-h-[560px]">
            {/* Map Header Overlay */}
            <div className="flex items-center justify-between z-10 bg-[#0c0d10] p-3 rounded-lg border border-slate-800">
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">Coordinate Grid</span>
                <span className="text-slate-600">•</span>
                <span className="text-[11px] text-slate-500 font-mono">{filteredEvaluations.length} Hotspots Plotted</span>
              </div>
              <div className="flex items-center space-x-3 text-[10px] uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]"></span>
                  <span className="text-slate-400">Critical (&gt;75)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-slate-400">High (60-74)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  <span className="text-slate-400">Moderate (40-59)</span>
                </div>
              </div>
            </div>

            {/* Geographic SVG Projection Canvas */}
            <div className="relative w-full h-[430px] my-3 rounded-lg bg-[#0c0d10] border border-slate-800/80 overflow-hidden flex items-center justify-center">
              {/* Subtle Grid Lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>

              {/* India Outline Silhouette Watermark */}
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full absolute inset-0 p-4 pointer-events-none opacity-15 text-slate-600"
              >
                {/* Stylized outline of India peninsular region */}
                <path
                  d="M 35 15 Q 45 8 55 12 Q 65 18 70 28 Q 75 35 72 45 Q 68 55 60 70 Q 50 88 48 92 Q 45 85 40 70 Q 32 55 30 42 Q 25 32 30 22 Z"
                  fill="currentColor"
                  stroke="#334155"
                  strokeWidth="0.5"
                />
              </svg>

              {/* Hotspot Plot Nodes */}
              <div className="absolute inset-0 p-6">
                {filteredEvaluations.map((item) => {
                  const pos = projectCoordinates(item.district.lat, item.district.lon);
                  const isSelected = item.district.id === activeDistrictId;
                  const bubbleSize = Math.max(28, Math.min(68, 24 + item.demandCount * 6));

                  return (
                    <div
                      key={item.district.id}
                      onClick={() => setActiveDistrictId(item.district.id)}
                      style={{
                        left: `${pos.x}%`,
                        top: `${pos.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      className={`absolute cursor-pointer transition-all duration-300 group z-20 ${
                        isSelected ? 'scale-115 z-30' : 'hover:scale-110'
                      }`}
                    >
                      {/* Pulse Ring for Critical Hotspots */}
                      {item.breakdown.total_score >= 70 && (
                        <span
                          className="absolute -inset-1 rounded-full animate-ping opacity-30"
                          style={{ backgroundColor: item.priorityTier.color }}
                        ></span>
                      )}

                      {/* Hotspot Circle */}
                      <div
                        style={{
                          width: `${bubbleSize}px`,
                          height: `${bubbleSize}px`,
                          backgroundColor: `${item.priorityTier.color}20`,
                          borderColor: item.priorityTier.color,
                        }}
                        className={`rounded-full border flex flex-col items-center justify-center shadow-lg transition-all backdrop-blur-xs ${
                          isSelected ? 'ring-2 ring-white/50 shadow-2xl' : ''
                        }`}
                      >
                        <span className="text-[11px] font-mono font-medium text-white leading-tight">
                          {item.breakdown.total_score}
                        </span>
                        {item.demandCount > 0 && (
                          <span className="text-[8px] font-mono text-slate-400 leading-none">
                            {item.demandCount}s
                          </span>
                        )}
                      </div>

                      {/* District Label Tag */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-1.5 py-0.5 bg-[#0c0d10] border border-slate-800 rounded text-[9px] font-mono text-slate-400 whitespace-nowrap shadow-md pointer-events-none group-hover:text-white group-hover:border-slate-600 transition-colors">
                        {item.district.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Summary Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/60 text-[11px] text-slate-500">
              <span>
                Bubble size reflects <strong className="text-slate-300 font-normal">Demand Density</strong>; color indicates <strong className="text-slate-300 font-normal">Priority Index</strong>.
              </span>
              <span className="font-mono text-slate-400 text-[10px] uppercase tracking-wider">
                Click bubble to inspect dossier
              </span>
            </div>
          </div>

          {/* Right Column: Selected District Detail Dossier & Priority Leaderboard */}
          <div className="lg:col-span-4 space-y-4">
            {/* Active District Detail Card */}
            {currentActiveEvaluation && (
              <div className="bg-[#111318] border border-slate-800 rounded-lg p-5 space-y-4">
                <div className="flex items-start justify-between pb-3 border-b border-slate-800/60">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-light text-white">
                        {currentActiveEvaluation.district.name}
                      </h3>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-mono border border-white/10">
                        {currentActiveEvaluation.district.state}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {currentActiveEvaluation.district.lat.toFixed(4)}°N, {currentActiveEvaluation.district.lon.toFixed(4)}°E
                    </p>
                  </div>

                  <div className="text-right">
                    <div
                      className="text-2xl font-extralight font-mono tracking-tight"
                      style={{ color: currentActiveEvaluation.priorityTier.color }}
                    >
                      {currentActiveEvaluation.breakdown.total_score}
                    </div>
                    <span className="text-[9px] uppercase tracking-widest font-mono text-slate-400">
                      {currentActiveEvaluation.priorityTier.label} TIER
                    </span>
                  </div>
                </div>

                {/* Infrastructure Access Matrix */}
                <div className="space-y-2">
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-medium block">
                    Sector Access Baselines (%):
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-[#0c0d10] rounded-lg border border-slate-800/80">
                      <div className="flex justify-between items-center text-slate-400">
                        <span className="flex items-center gap-1.5 text-[11px]">
                          <Droplet className="w-3 h-3 text-slate-400" /> Water
                        </span>
                        <span className="font-mono text-slate-200 font-medium">{currentActiveEvaluation.district.water_access}%</span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-[#0c0d10] rounded-lg border border-slate-800/80">
                      <div className="flex justify-between items-center text-slate-400">
                        <span className="flex items-center gap-1.5 text-[11px]">
                          <HeartPulse className="w-3 h-3 text-slate-400" /> Health
                        </span>
                        <span className="font-mono text-slate-200 font-medium">{currentActiveEvaluation.district.health_access}%</span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-[#0c0d10] rounded-lg border border-slate-800/80">
                      <div className="flex justify-between items-center text-slate-400">
                        <span className="flex items-center gap-1.5 text-[11px]">
                          <Route className="w-3 h-3 text-slate-400" /> Roads
                        </span>
                        <span className="font-mono text-slate-200 font-medium">{currentActiveEvaluation.district.road_quality}%</span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-[#0c0d10] rounded-lg border border-slate-800/80">
                      <div className="flex justify-between items-center text-slate-400">
                        <span className="flex items-center gap-1.5 text-[11px]">
                          <GraduationCap className="w-3 h-3 text-slate-400" /> Education
                        </span>
                        <span className="font-mono text-slate-200 font-medium">{currentActiveEvaluation.district.education_access}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Demographic & Capex Stats */}
                <div className="p-3 bg-[#0c0d10] rounded-lg border border-slate-800 text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 uppercase tracking-wider text-[9px]">Population:</span>
                    <span className="text-slate-200 font-medium">{currentActiveEvaluation.district.population.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 uppercase tracking-wider text-[9px]">Poverty (MPI):</span>
                    <span className="text-rose-400 font-medium">{(currentActiveEvaluation.district.poverty_index * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 uppercase tracking-wider text-[9px]">Planned Capex:</span>
                    <span className="text-emerald-400 font-medium">₹{(currentActiveEvaluation.district.planned_investment / 10000000).toFixed(2)} Cr</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 uppercase tracking-wider text-[9px]">Signals Logged:</span>
                    <span className="text-slate-200 font-medium">{currentActiveEvaluation.demandCount} signals</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => onSelectHotspotForPolicy(currentActiveEvaluation.district, currentActiveEvaluation.category)}
                    className="w-full py-2 bg-slate-100 hover:bg-white text-slate-900 font-semibold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Open in AI Policy Lab</span>
                  </button>

                  <button
                    onClick={() =>
                      onOpenScoreModal(
                        currentActiveEvaluation.breakdown,
                        currentActiveEvaluation.district,
                        currentActiveEvaluation.category
                      )
                    }
                    className="w-full py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-medium text-[10px] uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Layers className="w-3 h-3 text-slate-400" />
                    <span>Mathematical Audit Dossier</span>
                  </button>
                </div>
              </div>
            )}

            {/* Top National Hotspot Leaderboard */}
            <div className="bg-[#111318] border border-slate-800 rounded-lg p-4 space-y-3">
              <h4 className="text-[9px] uppercase tracking-widest text-slate-500 font-medium flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3 h-3 text-slate-400" />
                  Top Critical Priority Ranking
                </span>
                <span className="font-mono">Score /100</span>
              </h4>

              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {sortedEvaluations.slice(0, 5).map((item, rank) => (
                  <div
                    key={item.district.id}
                    onClick={() => setActiveDistrictId(item.district.id)}
                    className={`p-2.5 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer ${
                      item.district.id === activeDistrictId
                        ? 'bg-white/10 border border-white/20 text-white'
                        : 'bg-[#0c0d10] hover:bg-white/[0.02] border border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="w-4 h-4 rounded bg-white/5 text-slate-400 flex items-center justify-center text-[9px] font-mono">
                        {rank + 1}
                      </span>
                      <div>
                        <span className="font-medium text-slate-200">{item.district.name}</span>
                        <span className="text-[10px] text-slate-500 ml-1.5 font-mono">({item.district.state})</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-500 font-mono">{item.demandCount}s</span>
                      <span
                        className="font-mono text-xs px-1.5 py-0.5 rounded font-medium"
                        style={{ color: item.priorityTier.color }}
                      >
                        {item.breakdown.total_score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Live Citizen Signal Feed Sub-View */
        <div className="bg-[#111318] border border-slate-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <h3 className="text-sm font-light text-white uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-slate-400" />
              Live Ingested Citizen Demand Stream ({requests.length} Total)
            </h3>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Pipeline Telemetry</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-[9px] uppercase tracking-widest text-slate-500 font-medium border-b border-slate-800">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">Language</th>
                  <th className="p-3">Sector</th>
                  <th className="p-3">District</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">English Summary</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10 font-mono text-[9px] uppercase tracking-wider">
                        {req.language}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap font-medium text-slate-200">
                      <span className="flex items-center gap-1.5">
                        {getCategoryIcon(req.category)}
                        {req.category}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap font-medium text-slate-200 font-mono">
                      {req.location}
                    </td>
                    <td className="p-3 whitespace-nowrap font-mono">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        req.severity >= 8 ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      }`}>
                        {req.severity}/10
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 max-w-md line-clamp-1 leading-relaxed">
                      {req.summary_en}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] uppercase tracking-widest font-mono">
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
