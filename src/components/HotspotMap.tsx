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
        return <Droplet className="w-3.5 h-3.5 text-blue-600" />;
      case 'Health':
        return <HeartPulse className="w-3.5 h-3.5 text-rose-600" />;
      case 'Roads':
        return <Route className="w-3.5 h-3.5 text-amber-600" />;
      case 'Education':
        return <GraduationCap className="w-3.5 h-3.5 text-purple-600" />;
      case 'Electricity':
        return <Zap className="w-3.5 h-3.5 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Bar & Filter Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-blue-50 text-blue-700 border border-blue-200">
                STEP 2 OF 4
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                National Demand Hotspots & Gap Intelligence Map
              </h2>
            </div>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Fuses citizen feedback signals with demographic indices & infrastructure baselines to pinpoint urgent regional deficits.
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTabSubView('map')}
              className={`px-3.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTabSubView === 'map' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Geographic Map
            </button>
            <button
              onClick={() => setActiveTabSubView('signals')}
              className={`px-3.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTabSubView === 'signals' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live Signal Stream ({requests.length})
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
          {/* Sector Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sector Category:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none cursor-pointer"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              State / Region:
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none cursor-pointer"
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
              <label className="text-xs font-semibold text-slate-700">
                Min Priority Score:
              </label>
              <span className="font-mono text-xs font-bold text-slate-900">{minPriorityThreshold} / 100</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={minPriorityThreshold}
              onChange={(e) => setMinPriorityThreshold(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Search Query */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Search District:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="e.g. Guntur, Warangal, Nashik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {activeTabSubView === 'map' ? (
        /* Map & Leaderboard Split View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Interactive Geographic Canvas */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[560px] shadow-xs">
            {/* Map Header Overlay */}
            <div className="flex items-center justify-between z-10 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-xs uppercase tracking-wider text-slate-700 font-bold">Interactive Map</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-mono font-medium">{filteredEvaluations.length} Hotspots Plotted</span>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs"></span>
                  <span className="text-slate-700 font-medium">Critical (&gt;75)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-slate-700 font-medium">High (60-74)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span className="text-slate-700 font-medium">Moderate (40-59)</span>
                </div>
              </div>
            </div>

            {/* Geographic SVG Projection Canvas */}
            <div className="relative w-full h-[430px] my-3 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
              {/* Subtle Grid Lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e120_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e120_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>

              {/* India Outline Silhouette Watermark */}
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full absolute inset-0 p-4 pointer-events-none opacity-20 text-slate-400"
              >
                {/* Stylized outline of India peninsular region */}
                <path
                  d="M 35 15 Q 45 8 55 12 Q 65 18 70 28 Q 75 35 72 45 Q 68 55 60 70 Q 50 88 48 92 Q 45 85 40 70 Q 32 55 30 42 Q 25 32 30 22 Z"
                  fill="currentColor"
                  stroke="#94a3b8"
                  strokeWidth="0.8"
                />
              </svg>

              {/* Hotspot Plot Nodes */}
              <div className="absolute inset-0 p-6">
                {filteredEvaluations.map((item) => {
                  const pos = projectCoordinates(item.district.lat, item.district.lon);
                  const isSelected = item.district.id === activeDistrictId;
                  const bubbleSize = Math.max(32, Math.min(68, 26 + item.demandCount * 6));

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
                          className="absolute -inset-1 rounded-full animate-ping opacity-40"
                          style={{ backgroundColor: item.priorityTier.color }}
                        ></span>
                      )}

                      {/* Hotspot Circle */}
                      <div
                        style={{
                          width: `${bubbleSize}px`,
                          height: `${bubbleSize}px`,
                          backgroundColor: isSelected ? item.priorityTier.color : `${item.priorityTier.color}25`,
                          borderColor: item.priorityTier.color,
                        }}
                        className={`rounded-full border-2 flex flex-col items-center justify-center shadow-md transition-all ${
                          isSelected ? 'ring-3 ring-blue-400 shadow-lg' : ''
                        }`}
                      >
                        <span className={`text-xs font-mono font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {item.breakdown.total_score}
                        </span>
                        {item.demandCount > 0 && (
                          <span className={`text-[9px] font-mono leading-none ${isSelected ? 'text-blue-100' : 'text-slate-600'}`}>
                            {item.demandCount}s
                          </span>
                        )}
                      </div>

                      {/* District Label Tag */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800 whitespace-nowrap shadow-sm pointer-events-none group-hover:border-blue-500 group-hover:text-blue-700 transition-colors">
                        {item.district.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Summary Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <span>
                Bubble size reflects <strong className="text-slate-800">Demand Density</strong>; color indicates <strong className="text-slate-800">Priority Score</strong>.
              </span>
              <span className="font-mono text-blue-600 font-semibold text-xs">
                Click any bubble to inspect district dossier →
              </span>
            </div>
          </div>

          {/* Right Column: Selected District Detail Dossier & Priority Leaderboard */}
          <div className="lg:col-span-4 space-y-4">
            {/* Active District Detail Card */}
            {currentActiveEvaluation && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {currentActiveEvaluation.district.name}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                        {currentActiveEvaluation.district.state}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {currentActiveEvaluation.district.lat.toFixed(4)}°N, {currentActiveEvaluation.district.lon.toFixed(4)}°E
                    </p>
                  </div>

                  <div className="text-right">
                    <div
                      className="text-2xl font-bold font-mono tracking-tight"
                      style={{ color: currentActiveEvaluation.priorityTier.color }}
                    >
                      {currentActiveEvaluation.breakdown.total_score}
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                      {currentActiveEvaluation.priorityTier.label} TIER
                    </span>
                  </div>
                </div>

                {/* Infrastructure Access Matrix */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-700 block">
                    Sector Access Baselines:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Droplet className="w-3.5 h-3.5 text-blue-600" /> Water
                        </span>
                        <span className="font-mono text-slate-900 font-bold">{currentActiveEvaluation.district.water_access}%</span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="flex items-center gap-1.5 font-medium">
                          <HeartPulse className="w-3.5 h-3.5 text-rose-600" /> Health
                        </span>
                        <span className="font-mono text-slate-900 font-bold">{currentActiveEvaluation.district.health_access}%</span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Route className="w-3.5 h-3.5 text-amber-600" /> Roads
                        </span>
                        <span className="font-mono text-slate-900 font-bold">{currentActiveEvaluation.district.road_quality}%</span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="flex items-center gap-1.5 font-medium">
                          <GraduationCap className="w-3.5 h-3.5 text-purple-600" /> Education
                        </span>
                        <span className="font-mono text-slate-900 font-bold">{currentActiveEvaluation.district.education_access}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Demographic & Capex Stats */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 font-medium">Population:</span>
                    <span className="text-slate-900 font-bold font-mono">{currentActiveEvaluation.district.population.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 font-medium">Poverty (MPI Index):</span>
                    <span className="text-rose-600 font-bold font-mono">{(currentActiveEvaluation.district.poverty_index * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 font-medium">Planned Capex:</span>
                    <span className="text-emerald-700 font-bold font-mono">₹{(currentActiveEvaluation.district.planned_investment / 10000000).toFixed(2)} Cr</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 font-medium">Citizen Signals:</span>
                    <span className="text-blue-700 font-bold font-mono">{currentActiveEvaluation.demandCount} signals</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => onSelectHotspotForPolicy(currentActiveEvaluation.district, currentActiveEvaluation.category)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs uppercase tracking-wider rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
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
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-semibold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>Mathematical Formula Audit</span>
                  </button>
                </div>
              </div>
            )}

            {/* Top National Hotspot Leaderboard */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
              <h4 className="text-xs uppercase tracking-wider text-slate-700 font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500" />
                  Top Critical Priority Ranking
                </span>
                <span className="font-mono text-slate-500 font-normal">Score /100</span>
              </h4>

              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {sortedEvaluations.slice(0, 5).map((item, rank) => (
                  <div
                    key={item.district.id}
                    onClick={() => setActiveDistrictId(item.district.id)}
                    className={`p-2.5 rounded-lg text-xs flex items-center justify-between transition-all cursor-pointer ${
                      item.district.id === activeDistrictId
                        ? 'bg-blue-50 border border-blue-300 text-blue-900 font-semibold shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold font-mono">
                        {rank + 1}
                      </span>
                      <div>
                        <span className="font-semibold text-slate-900">{item.district.name}</span>
                        <span className="text-xs text-slate-500 ml-1.5 font-mono">({item.district.state})</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500 font-mono font-medium">{item.demandCount}s</span>
                      <span
                        className="font-mono text-xs px-2 py-0.5 rounded font-bold"
                        style={{ color: item.priorityTier.color, backgroundColor: `${item.priorityTier.color}15` }}
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
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-600" />
              Live Ingested Citizen Demand Stream ({requests.length} Total)
            </h3>
            <span className="text-xs text-slate-500 font-mono font-medium">Pipeline Telemetry</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600 font-bold border-b border-slate-200">
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
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono text-xs text-slate-600 whitespace-nowrap">
                      {new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono text-xs font-semibold">
                        {req.language}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap font-medium text-slate-800">
                      <span className="flex items-center gap-1.5">
                        {getCategoryIcon(req.category)}
                        {req.category}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap font-semibold text-slate-900 font-mono">
                      {req.location}
                    </td>
                    <td className="p-3 whitespace-nowrap font-mono">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        req.severity >= 8 ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {req.severity}/10
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 max-w-md line-clamp-1 leading-relaxed">
                      {req.summary_en}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold font-mono">
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
