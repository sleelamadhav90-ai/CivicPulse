import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Search, 
  Flame, 
  Droplet, 
  Droplets,
  HeartPulse, 
  Route, 
  GraduationCap, 
  Zap,
  Layers, 
  Sparkles, 
  Users, 
  Radio, 
  FileText, 
  Globe2, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { District, CitizenRequest, InfrastructureCategory, ScoreBreakdown } from '../types';
import { calculatePriorityScore, getCategoryAccess, getPriorityTier } from '../utils/scoring';
import { getCityDemandHotspot } from '../utils/demandAggregation';
import { IndiaMapCanvas, EvaluatedDistrict } from './IndiaMapCanvas';

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
  const [activeDistrictId, setActiveDistrictId] = useState<string>(districts[0]?.id || 'vijayawada');
  const [activeTabSubView, setActiveTabSubView] = useState<'map' | 'signals'>('map');
  const [activeCardTab, setActiveCardTab] = useState<'demand' | 'baselines'>('demand');

  // Compute stats, scores and demand aggregations for each district
  const districtEvaluations: EvaluatedDistrict[] = useMemo(() => {
    return districts.map((district) => {
      // Get category to evaluate
      const targetCategory: InfrastructureCategory = selectedCategory === 'All' ? 'Drainage' : selectedCategory;
      
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

      // Compute aggregated demand hotspot metrics
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
    return Array.from(new Set(districts.map((d) => d.state))).sort();
  }, [districts]);

  return (
    <div className="space-y-6">
      {/* Control Bar & Filter Strip */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider rounded-md bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-600" />
                DEMAND HOTSPOTS ENGINE
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                National Deficit & Aggregated Demand Hotspots Map
              </h2>
            </div>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Aggregating citizen voice and text signals across <strong className="text-slate-900 font-semibold">{districts.length} Indian cities</strong> to cluster top municipal demands, identify critical deficit hotspots, and generate real-time AI infrastructure recommendations.
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTabSubView('map')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTabSubView === 'map' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Geographic Map ({districts.length} Cities)
            </button>
            <button
              onClick={() => setActiveTabSubView('signals')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Sector Category:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="All">All Categories (Aggregate Deficit)</option>
              <option value="Drainage">🌊 Drainage & Stormwater</option>
              <option value="Water">💧 Water Supply & Sanitation</option>
              <option value="Health">🏥 Healthcare & Clinics</option>
              <option value="Roads">🛣️ Arterial Roads & Transport</option>
              <option value="Electricity">⚡ Power Grid & Street Lighting</option>
              <option value="Education">🎓 Education & Schools</option>
            </select>
          </div>

          {/* State Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              State / Region:
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="All">All States & Territories ({uniqueStates.length})</option>
              {uniqueStates.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Min Priority Threshold Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Min Priority Score:
              </label>
              <span className="font-mono text-xs font-extrabold text-blue-700">{minPriorityThreshold} / 100</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={minPriorityThreshold}
              onChange={(e) => setMinPriorityThreshold(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
            />
          </div>

          {/* Search Query */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Search City / District:
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="e.g. Vijayawada, Delhi, Mumbai, Guntur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {activeTabSubView === 'map' ? (
        /* Map & Aggregated Hotspot Dossier Split View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Interactive Geographic Canvas */}
          <div className="lg:col-span-7 space-y-3">
            <IndiaMapCanvas
              evaluations={filteredEvaluations}
              activeDistrictId={activeDistrictId}
              onSelectDistrict={(districtId) => setActiveDistrictId(districtId)}
              selectedCategory={selectedCategory}
              onSelectHotspotForPolicy={onSelectHotspotForPolicy}
            />

            {/* Quick Summary Footer */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                <span>
                  Showing <strong className="text-slate-900">{filteredEvaluations.length} aggregated demand hotspots</strong> with citizen complaint clusters.
                </span>
              </div>
              <span className="font-mono text-blue-600 font-semibold text-xs flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Click any city to inspect aggregated demand breakdown →
              </span>
            </div>
          </div>

          {/* Right Column: Demand Hotspot Dossier Card & Priority Leaderboard */}
          <div className="lg:col-span-5 space-y-4">
            {/* Active District Demand Hotspot Card */}
            {currentActiveEvaluation && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-xs transition-all">
                {/* Header: City Title & Mode Toggles */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-600 flex items-center gap-1 mb-1">
                      <Flame className="w-3.5 h-3.5 text-rose-500" />
                      DEMAND HOTSPOT TELEMETRY
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                      {currentActiveEvaluation.district.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {currentActiveEvaluation.district.state} • {currentActiveEvaluation.district.zone} Zone
                    </p>
                  </div>

                  {/* Priority / Deficit Badge */}
                  <div className="text-right">
                    <span className="text-xs px-2.5 py-1 rounded-lg font-black bg-rose-50 text-rose-700 border border-rose-200 inline-block font-mono">
                      {currentActiveEvaluation.demandHotspot.primaryBadgeLabel}
                    </span>
                    <div className="text-[11px] font-mono text-slate-400 mt-1">
                      Score: <strong className="text-slate-800">{currentActiveEvaluation.breakdown.total_score}/100</strong>
                    </div>
                  </div>
                </div>

                {/* Sub-Tabs: Demand Telemetry vs Infrastructure Access */}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                  <button
                    onClick={() => setActiveCardTab('demand')}
                    className={`flex-1 py-1.5 font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeCardTab === 'demand'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-rose-500" />
                    <span>Demand Breakdown</span>
                  </button>
                  <button
                    onClick={() => setActiveCardTab('baselines')}
                    className={`flex-1 py-1.5 font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeCardTab === 'baselines'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>Sector Access Matrix</span>
                  </button>
                </div>

                {activeCardTab === 'demand' ? (
                  /* Demand Hotspots Aggregated View */
                  <div className="space-y-4">
                    {/* Citizen Requests & High Priority Stats Box */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <span className="text-xs text-slate-500 font-semibold block">
                          Citizen Requests
                        </span>
                        <div className="text-2xl font-black font-mono text-slate-900 tracking-tight">
                          {currentActiveEvaluation.demandHotspot.totalCitizenRequests.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Aggregated signals
                        </span>
                      </div>

                      <div className="p-3.5 bg-rose-50/50 border border-rose-200 rounded-xl space-y-1">
                        <span className="text-xs text-rose-700 font-semibold block">
                          High Priority
                        </span>
                        <div className="text-2xl font-black font-mono text-rose-600 tracking-tight">
                          {currentActiveEvaluation.demandHotspot.highPriorityCount.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-rose-600 font-bold flex items-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" /> Urgent escalation
                        </span>
                      </div>
                    </div>

                    {/* Top Issues Section */}
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          Top Issues
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 font-semibold">
                          Distribution %
                        </span>
                      </div>

                      {/* Top Issues Breakdown Bars */}
                      <div className="space-y-2.5">
                        {currentActiveEvaluation.demandHotspot.topIssues.map((issue) => (
                          <div key={issue.category} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                                <span
                                  className="w-2 h-2 rounded-full inline-block"
                                  style={{ backgroundColor: issue.dotColor }}
                                />
                                {issue.category}
                              </span>
                              <span className="font-mono font-bold text-slate-900">
                                {issue.percentage}%
                              </span>
                            </div>
                            {/* Visual Progress Bar */}
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min(100, Math.max(8, issue.percentage))}%`,
                                  backgroundColor: issue.dotColor,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Recommendation Section */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-200 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          AI Recommendation
                        </span>
                        <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          Gemini 2.5 Policy Model
                        </span>
                      </div>

                      <div className="p-3.5 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 border border-blue-200 rounded-xl">
                        <p className="text-xs font-semibold text-slate-800 leading-relaxed italic">
                          "{currentActiveEvaluation.demandHotspot.aiRecommendation}"
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Infrastructure Access Matrix & Capex View */
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                        Sector Access Baselines:
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="flex justify-between items-center text-slate-700">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Droplets className="w-3.5 h-3.5 text-cyan-600" /> Drainage
                            </span>
                            <span className="font-mono text-slate-900 font-bold">
                              {Math.max(20, Math.round(currentActiveEvaluation.district.water_access * 0.85))}%
                            </span>
                          </div>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="flex justify-between items-center text-slate-700">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Droplet className="w-3.5 h-3.5 text-blue-600" /> Water
                            </span>
                            <span className="font-mono text-slate-900 font-bold">
                              {currentActiveEvaluation.district.water_access}%
                            </span>
                          </div>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="flex justify-between items-center text-slate-700">
                            <span className="flex items-center gap-1.5 font-medium">
                              <HeartPulse className="w-3.5 h-3.5 text-rose-600" /> Health
                            </span>
                            <span className="font-mono text-slate-900 font-bold">
                              {currentActiveEvaluation.district.health_access}%
                            </span>
                          </div>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="flex justify-between items-center text-slate-700">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Route className="w-3.5 h-3.5 text-amber-600" /> Roads
                            </span>
                            <span className="font-mono text-slate-900 font-bold">
                              {currentActiveEvaluation.district.road_quality}%
                            </span>
                          </div>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="flex justify-between items-center text-slate-700">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Zap className="w-3.5 h-3.5 text-yellow-600" /> Electricity
                            </span>
                            <span className="font-mono text-slate-900 font-bold">
                              {Math.min(98, Math.round(currentActiveEvaluation.district.education_access * 0.95))}%
                            </span>
                          </div>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="flex justify-between items-center text-slate-700">
                            <span className="flex items-center gap-1.5 font-medium">
                              <GraduationCap className="w-3.5 h-3.5 text-purple-600" /> Education
                            </span>
                            <span className="font-mono text-slate-900 font-bold">
                              {currentActiveEvaluation.district.education_access}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Demographic & Capex Stats */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 font-medium">Population:</span>
                        <span className="text-slate-900 font-bold font-mono">
                          {currentActiveEvaluation.district.population.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 font-medium">Poverty (MPI Index):</span>
                        <span className="text-rose-600 font-bold font-mono">
                          {(currentActiveEvaluation.district.poverty_index * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 font-medium">Planned Capex:</span>
                        <span className="text-emerald-700 font-bold font-mono">
                          ₹{(currentActiveEvaluation.district.planned_investment / 10000000).toFixed(2)} Cr
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => onSelectHotspotForPolicy(currentActiveEvaluation.district, currentActiveEvaluation.category)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Simulate Policy in AI Lab</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() =>
                      onOpenScoreModal(
                        currentActiveEvaluation.breakdown,
                        currentActiveEvaluation.district,
                        currentActiveEvaluation.category
                      )
                    }
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-semibold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>Mathematical Formula Audit</span>
                  </button>
                </div>
              </div>
            )}

            {/* Top Critical Hotspots Ranking */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
              <h4 className="text-xs uppercase tracking-wider text-slate-700 font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-500" />
                  Top Critical Demand Hotspots
                </span>
                <span className="font-mono text-slate-500 font-normal">Signals Volume</span>
              </h4>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {sortedEvaluations.slice(0, 5).map((item, rank) => (
                  <div
                    key={item.district.id}
                    onClick={() => setActiveDistrictId(item.district.id)}
                    className={`p-2.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
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
                      <span className="font-mono text-[11px] font-bold text-slate-700">
                        {item.demandHotspot.primaryBadgeLabel}
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded font-bold bg-slate-200/80 text-slate-800">
                        {item.demandHotspot.totalCitizenRequests.toLocaleString()} reqs
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Live Signal Ingestion Stream View */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                Raw Citizen Signal Ingestion Telemetry Stream
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time multi-modal grievances ingested via voice notes, WhatsApp text, and SMS hotlines.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1 rounded-lg font-bold">
              {requests.length} Total Processed Signals
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-2.5 text-xs shadow-2xs"
              >
                <div className="flex items-start justify-between">
                  <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase bg-blue-100 text-blue-800 font-mono">
                    {req.location}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      req.severity >= 8
                        ? 'bg-rose-100 text-rose-800'
                        : req.severity >= 6
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    Severity {req.severity}/10
                  </span>
                </div>

                <p className="text-slate-800 font-medium italic line-clamp-2">
                  "{req.original_text}"
                </p>

                <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-700">Category:</span>
                    <span className="font-mono text-slate-900">{req.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-700">Language:</span>
                    <span className="font-mono text-slate-900">{req.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-700">Source:</span>
                    <span className="font-mono capitalize text-slate-900">{req.source_type} Signal</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
