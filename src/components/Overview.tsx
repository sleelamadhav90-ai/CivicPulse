import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Sparkles, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  Droplets, 
  Droplet,
  Route, 
  Lightbulb, 
  HeartPulse, 
  GraduationCap,
  PlusCircle,
  BarChart3,
  Flame,
  ShieldCheck,
  Cpu,
  Award,
  ChevronDown,
  ChevronUp,
  Zap
} from 'lucide-react';
import { District, CitizenRequest, RecommendedProject } from '../types';
import { calculatePriorityScore, getPriorityTier, getAIRecommendedProjects } from '../utils/scoring';
import { ArchitectureBlueprint } from './ArchitectureBlueprint';
import { CivicRelationshipFlow } from './CivicRelationshipFlow';

interface OverviewProps {
  districts: District[];
  requests: CitizenRequest[];
  onNavigate: (tab: 'map' | 'blocks' | 'overview' | 'engine' | 'submit' | 'insights' | 'projects' | 'impact' | 'settings') => void;
  onSelectDistrictForPolicy: (districtId: string, category: 'Water' | 'Health' | 'Roads' | 'Education' | 'Drainage' | 'Electricity') => void;
}

export const Overview: React.FC<OverviewProps> = ({
  districts,
  requests,
  onNavigate,
  onSelectDistrictForPolicy,
}) => {
  // Top aggregate baseline statistics
  const totalBaseRequests = 12480 + (requests.length - 8);
  const highPriorityCount = 1284;
  const resolvedCount = 8921;

  // AI Recommended Projects generated from Priority Engine
  const recommendedProjects = getAIRecommendedProjects(districts, requests);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>('rec-01');

  // Calculate high-demand districts
  const rankedDistricts = districts.map((d) => {
    const waterScore = calculatePriorityScore(d, 'Water', 8, requests.filter(r => r.location.toLowerCase() === d.name.toLowerCase() && r.category === 'Water').length + 8).total_score;
    const roadScore = calculatePriorityScore(d, 'Roads', 7, requests.filter(r => r.location.toLowerCase() === d.name.toLowerCase() && r.category === 'Roads').length + 6).total_score;
    const healthScore = calculatePriorityScore(d, 'Health', 9, requests.filter(r => r.location.toLowerCase() === d.name.toLowerCase() && r.category === 'Health').length + 5).total_score;
    const maxScore = Math.max(waterScore, roadScore, healthScore);
    const topCategory: 'Water' | 'Roads' | 'Health' = waterScore >= roadScore && waterScore >= healthScore ? 'Water' : roadScore >= healthScore ? 'Roads' : 'Health';

    return {
      ...d,
      maxScore,
      topCategory,
      tier: getPriorityTier(maxScore),
    };
  }).sort((a, b) => b.maxScore - a.maxScore);

  const topDistricts = rankedDistricts.slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-sans">
      {/* Hero Header */}
      <div className="bg-white border border-[#171717] p-6 sm:p-8 shadow-[6px_6px_0px_#171717]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-widest text-white bg-[#D65A3A]">
                <Sparkles className="w-3.5 h-3.5" />
                RELATIONAL CIVIC INTELLIGENCE
              </span>
              <span className="text-xs text-[#171717]/70 font-mono hidden sm:inline">
                • Public Signals → Public Data → Public Decisions
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#171717] tracking-tight uppercase">
              CIVICPULSE OVERVIEW
            </h1>
            <p className="text-base sm:text-lg font-serif font-semibold text-[#D65A3A]">
              Don't make the UI cards the star. Make the relationships between things the star.
            </p>
            <p className="text-xs sm:text-sm text-[#171717]/80 max-w-3xl leading-relaxed font-sans">
              CivicPulse connects citizen voice signals with census demography, Jal Jeevan Mission API access deficits, and PWD road registries to deterministically prioritize capital infrastructure works.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 font-mono text-xs">
            <button
              onClick={() => onNavigate('map')}
              className="w-full sm:w-auto px-5 py-3 bg-[#171717] hover:bg-[#D65A3A] text-white font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_#171717]"
            >
              <MapPin className="w-4 h-4 text-[#D65A3A]" />
              <span>Open Civic Map</span>
            </button>
            <button
              onClick={() => onNavigate('blocks')}
              className="w-full sm:w-auto px-5 py-3 bg-[#F7F5EF] hover:bg-[#171717]/10 text-[#171717] font-bold border border-[#171717] uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Cpu className="w-4 h-4 text-[#285943]" />
              <span>8 Modular Blocks</span>
            </button>
          </div>
        </div>
      </div>

      {/* CORE PHILOSOPHY FEATURE: THE RELATIONSHIP GRAPH FLOW */}
      <CivicRelationshipFlow />

      {/* 3 Core Metric Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono">
        {/* Requests Card */}
        <div 
          onClick={() => onNavigate('submit')}
          className="bg-white border border-[#171717] hover:border-[#D65A3A] p-5 shadow-[4px_4px_0px_#171717] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between border-b border-[#171717]/10 pb-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#171717]/70">
              CITIZEN VOICE SIGNALS
            </span>
            <div className="w-7 h-7 bg-[#D65A3A] text-white flex items-center justify-center font-bold">
              <Radio className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-serif font-bold text-[#171717]">
              {totalBaseRequests.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-[#285943] bg-[#285943]/10 px-2 py-0.5 border border-[#285943]/30">
              +142 THIS WEEK
            </span>
          </div>
          <p className="mt-2 text-[11px] font-sans text-[#171717]/80">
            Multilingual voice & text reports across 12 target districts
          </p>
        </div>

        {/* High Priority Card */}
        <div 
          onClick={() => onNavigate('engine')}
          className="bg-white border border-[#171717] hover:border-[#D65A3A] p-5 shadow-[4px_4px_0px_#171717] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between border-b border-[#171717]/10 pb-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#171717]/70">
              HIGH PRIORITY DEFICITS
            </span>
            <div className="w-7 h-7 bg-[#D65A3A] text-white flex items-center justify-center font-bold">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-serif font-bold text-[#D65A3A]">
              {highPriorityCount.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-[#D65A3A] bg-[#D65A3A]/10 px-2 py-0.5 border border-[#D65A3A]/30">
              SCORE ≥ 70 / 100
            </span>
          </div>
          <p className="mt-2 text-[11px] font-sans text-[#171717]/80">
            Critical infrastructure hot spots needing urgent capital allocation
          </p>
        </div>

        {/* Resolved Card */}
        <div 
          onClick={() => onNavigate('projects')}
          className="bg-white border border-[#171717] hover:border-[#285943] p-5 shadow-[4px_4px_0px_#171717] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between border-b border-[#171717]/10 pb-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#171717]/70">
              COMMISSIONED CAPITAL WORKS
            </span>
            <div className="w-7 h-7 bg-[#285943] text-white flex items-center justify-center font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-serif font-bold text-[#285943]">
              {resolvedCount.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-[#285943] bg-[#285943]/10 px-2 py-0.5 border border-[#285943]/30">
              71.5% RESOLUTION
            </span>
          </div>
          <p className="mt-2 text-[11px] font-sans text-[#171717]/80">
            Completed pipeline works verified with closed-loop surveys
          </p>
        </div>
      </div>

      {/* FEATURE 4 HIGHLIGHT: AI Recommended Projects Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-xs font-mono font-bold uppercase rounded bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                FEATURE 4: AI PRIORITY ENGINE
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">•</span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">Priority = Demand + Gap + Density + Urgency + Policy</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              AI Recommended Projects
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Instead of simple complaint counts, CivicPulse calculates multi-factor priority scores connecting citizen voice + municipal data + infrastructure planning.
            </p>
          </div>

          <button
            onClick={() => onNavigate('engine')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition-colors"
          >
            <span>Open Priority Engine</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* AI Recommended Projects Table / Cards with Click-to-Reasoning */}
        <div className="space-y-4">
          {recommendedProjects.slice(0, 3).map((project) => {
            const isExpanded = expandedProjectId === project.id;
            const tier = getPriorityTier(project.priorityScore);

            return (
              <div 
                key={project.id}
                className="border border-slate-200 rounded-xl overflow-hidden transition-all bg-slate-50/40 hover:bg-slate-50"
              >
                {/* Main Row */}
                <div 
                  onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-start sm:items-center space-x-3.5">
                    {/* Medal / Rank */}
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-base font-mono shadow-2xs shrink-0">
                      {project.medal}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 font-mono">
                          {project.category}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-semibold text-slate-600">
                          {project.districtName}, {project.state}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                        {project.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                    <div className="text-left sm:text-right">
                      <div className="text-lg sm:text-xl font-black font-mono tracking-tight" style={{ color: tier.color }}>
                        {project.priorityScore}
                        <span className="text-xs text-slate-400 font-normal font-sans">/100</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase font-mono border ${tier.badgeBg} ${tier.badgeText} ${tier.borderColor}`}>
                        {project.priorityTier}
                      </span>
                    </div>

                    <button 
                      className="px-3 py-1.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-xs font-bold text-slate-700 hover:text-blue-700 rounded-lg flex items-center gap-1 shadow-2xs transition-colors"
                    >
                      <span>{isExpanded ? 'Hide' : 'Why high priority?'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded "Why is this high priority?" Drawer */}
                {isExpanded && (
                  <div className="p-5 bg-white border-t border-slate-200 space-y-4 animate-in fade-in duration-200">
                    <div className="p-4 bg-slate-900 text-white rounded-xl font-mono text-xs sm:text-sm space-y-3 shadow-xs">
                      <div className="text-xs font-sans uppercase font-bold text-slate-400">
                        Why is this high priority?
                      </div>

                      <div className="space-y-1.5 font-semibold">
                        {project.keyBulletPoints.map((point, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <span className="text-blue-400 font-bold text-base">
                              {idx === 0 ? '•' : '+'}
                            </span>
                            <span className={idx === 0 ? 'text-white font-bold' : 'text-slate-200'}>
                              {point.replace(/^\+\s*/, '')}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between text-xs font-sans">
                        <span className="text-slate-300">Composite Priority Calculation:</span>
                        <span className="font-mono font-black text-rose-300 bg-rose-500/20 px-2.5 py-0.5 rounded border border-rose-500/40">
                          → HIGH PRIORITY ({project.priorityScore}/100)
                        </span>
                      </div>
                    </div>

                    {/* AI Recommendation & Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <div className="text-xs text-slate-600 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                        <span><strong>AI Action:</strong> {project.aiRecommendation}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <button
                          onClick={() => {
                            onSelectDistrictForPolicy(project.districtId, project.category);
                            onNavigate('insights');
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Policy Memo</span>
                        </button>
                        <button
                          onClick={() => onNavigate('projects')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>Gov Projects</span>
                        </button>
                        <button
                          onClick={() => onNavigate('engine')}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>Priority Engine</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Demand Hotspots (Interactive Map Preview) + Top Infrastructure Needs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left / Center (7 cols): Demand Hotspots */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Demand Hotspots
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Deterministic infrastructure priority index across active administrative zones
              </p>
            </div>
            <button
              onClick={() => onNavigate('map')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Open Full GIS Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Interactive Hotspot District Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {topDistricts.map((d) => (
              <div
                key={d.id}
                onClick={() => {
                  onSelectDistrictForPolicy(d.id, d.topCategory);
                  onNavigate('map');
                }}
                className="p-4 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                    {d.name}
                  </span>
                  <span 
                    className="text-xs px-2 py-0.5 rounded-md font-mono font-bold"
                    style={{ backgroundColor: `${d.tier.color}15`, color: d.tier.color }}
                  >
                    {d.maxScore}/100
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                  <span>{d.state}</span>
                  <span>•</span>
                  <span>Pop: {(d.population / 100000).toFixed(1)}L</span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium flex items-center gap-1.5">
                    {d.topCategory === 'Water' && <Droplets className="w-3.5 h-3.5 text-blue-600" />}
                    {d.topCategory === 'Roads' && <Route className="w-3.5 h-3.5 text-amber-600" />}
                    {d.topCategory === 'Health' && <HeartPulse className="w-3.5 h-3.5 text-rose-600" />}
                    Deficit in {d.topCategory}
                  </span>
                  <span className="font-mono font-bold text-rose-600">
                    {d.topCategory === 'Water' ? `${100 - d.water_access}% gap` : d.topCategory === 'Roads' ? `${100 - d.road_quality}% gap` : `${100 - d.health_access}% gap`}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Map Bar Action */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="text-xs text-slate-700">
                <strong className="text-slate-900 block font-semibold">{districts.length} Cities & Municipal Districts Fully Mapped</strong>
                Weighted formula incorporates citizen density, poverty index, and baseline access.
              </div>
            </div>
            <button
              onClick={() => onNavigate('map')}
              className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-slate-100 text-blue-700 font-bold text-xs rounded-lg border border-blue-300 shadow-2xs transition-colors shrink-0 cursor-pointer"
            >
              Explore GIS Hotspots
            </button>
          </div>
        </div>

        {/* Right (5 cols): Top Infrastructure Needs */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Top Infrastructure Needs
              </h2>
              <span className="text-xs font-semibold text-slate-500 font-mono">
                Aggregated %
              </span>
            </div>

            {/* Need Ranking List */}
            <div className="mt-4 space-y-4">
              {/* 1. Water Supply */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-mono font-bold text-xs">1</span>
                    <Droplets className="w-4 h-4 text-blue-600" />
                    Water Supply
                  </span>
                  <span className="font-mono font-bold text-blue-600">32%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '32%' }}></div>
                </div>
                <span className="text-[11px] text-slate-500">Piped supply shortages, contamination, borewell failures</span>
              </div>

              {/* 2. Roads */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center font-mono font-bold text-xs">2</span>
                    <Route className="w-4 h-4 text-amber-600" />
                    Roads & Connectivity
                  </span>
                  <span className="font-mono font-bold text-amber-600">24%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '24%' }}></div>
                </div>
                <span className="text-[11px] text-slate-500">Unpaved rural corridors, monsoon pothole damages</span>
              </div>

              {/* 3. Street Lighting & Power */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-yellow-100 text-yellow-700 flex items-center justify-center font-mono font-bold text-xs">3</span>
                    <Lightbulb className="w-4 h-4 text-yellow-600" />
                    Street Lighting & Power
                  </span>
                  <span className="font-mono font-bold text-yellow-600">18%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-yellow-500 h-full rounded-full" style={{ width: '18%' }}></div>
                </div>
                <span className="text-[11px] text-slate-500">Dark transit corridors, women safety hazards, grid outages</span>
              </div>

              {/* 4. Healthcare */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center font-mono font-bold text-xs">4</span>
                    <HeartPulse className="w-4 h-4 text-rose-600" />
                    Healthcare Facilities
                  </span>
                  <span className="font-mono font-bold text-rose-600">14%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: '14%' }}></div>
                </div>
                <span className="text-[11px] text-slate-500">Primary health clinic sub-centers, maternal care access</span>
              </div>

              {/* 5. Education */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center font-mono font-bold text-xs">5</span>
                    <GraduationCap className="w-4 h-4 text-purple-600" />
                    Education & Sanitation
                  </span>
                  <span className="font-mono font-bold text-purple-600">12%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: '12%' }}></div>
                </div>
                <span className="text-[11px] text-slate-500">School sanitation blocks, digital lab infrastructure</span>
              </div>
            </div>
          </div>

          {/* Primary View AI Insights Button */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <button
              onClick={() => onNavigate('insights')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer group"
            >
              <Sparkles className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
              <span>View AI Policy Briefs & Memos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-center text-[11px] text-slate-500">
              Generates instant executive briefs tailored for ministerial budget proposals
            </p>
          </div>
        </div>
      </div>

      {/* Architecture & Extensibility Section */}
      <ArchitectureBlueprint onNavigate={onNavigate} />

      {/* 4-Step Closed-Loop Explanation Card (Understanding in 5-10 seconds) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-blue-400 font-bold">
              The Digital Public Infrastructure Loop
            </span>
            <h3 className="text-lg font-bold text-white mt-1">
              How CivicPulse Turns Voice into Verified Infrastructure
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 w-fit">
            Deterministic & Auditable
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div 
            onClick={() => onNavigate('submit')}
            className="p-4 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-400 transition-all cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold font-mono text-xs flex items-center justify-center">1</span>
              <Radio className="w-4 h-4 text-blue-400" />
            </div>
            <h4 className="font-bold text-sm text-white">1. Submit & Listen</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Citizens report issues in regional dialects (Telugu, Hindi, Marathi) via voice or text.
            </p>
          </div>

          {/* Step 2 */}
          <div 
            onClick={() => onNavigate('engine')}
            className="p-4 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-400 transition-all cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold font-mono text-xs flex items-center justify-center">2</span>
              <Cpu className="w-4 h-4 text-rose-400" />
            </div>
            <h4 className="font-bold text-sm text-white">2. AI Priority Engine</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Demand + Deficits + Population + Urgency + Capex = 0–100 auditable priority score.
            </p>
          </div>

          {/* Step 3 */}
          <div 
            onClick={() => onNavigate('insights')}
            className="p-4 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-400 transition-all cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold font-mono text-xs flex items-center justify-center">3</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <h4 className="font-bold text-sm text-white">3. AI Policy Insights</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gemini crafts formal executive memos with ROI, engineering roadmaps, and budget allocation.
            </p>
          </div>

          {/* Step 4 */}
          <div 
            onClick={() => onNavigate('impact')}
            className="p-4 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-400 transition-all cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold font-mono text-xs flex items-center justify-center">4</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="font-bold text-sm text-white">4. Impact Simulator</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Simulates how capital works eliminate deficits, resolve citizen requests, and boost regional access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

