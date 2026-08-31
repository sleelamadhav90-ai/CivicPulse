import React, { useState, useMemo } from 'react';
import { 
  Cpu, 
  Sparkles, 
  Layers, 
  Droplets, 
  Droplet, 
  Route, 
  Zap, 
  HeartPulse, 
  GraduationCap, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Scale, 
  Users, 
  Building2, 
  FileText, 
  TrendingUp, 
  ChevronRight, 
  Sliders, 
  Info,
  Flame,
  BarChart3,
  Search,
  ShieldCheck,
  Award
} from 'lucide-react';
import { District, CitizenRequest, InfrastructureCategory, RecommendedProject } from '../types';
import { getAIRecommendedProjects, SCORING_WEIGHTS, getPriorityTier } from '../utils/scoring';
import { CivicRelationshipFlow } from './CivicRelationshipFlow';

interface PriorityEngineProps {
  districts: District[];
  requests: CitizenRequest[];
  onSelectProjectForPolicy: (districtId: string, category: InfrastructureCategory) => void;
  onNavigateToImpact: (districtId: string, category: InfrastructureCategory) => void;
  onNavigateToMap: () => void;
  onConvertToGovernmentProject?: (recommendedProject: RecommendedProject) => void;
  onNavigateToProjects?: () => void;
}

export const PriorityEngine: React.FC<PriorityEngineProps> = ({
  districts,
  requests,
  onSelectProjectForPolicy,
  onNavigateToImpact,
  onNavigateToMap,
  onConvertToGovernmentProject,
  onNavigateToProjects,
}) => {
  // Generate prioritized projects list
  const recommendedProjects = useMemo(() => {
    return getAIRecommendedProjects(districts, requests);
  }, [districts, requests]);

  // Selected project for deep-dive reasoning
  const [selectedProjectId, setSelectedProjectId] = useState<string>(recommendedProjects[0]?.id || 'rec-01');
  const [sectorFilter, setSectorFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentProject = useMemo(() => {
    return recommendedProjects.find((p) => p.id === selectedProjectId) || recommendedProjects[0];
  }, [recommendedProjects, selectedProjectId]);

  const filteredProjects = useMemo(() => {
    return recommendedProjects.filter((p) => {
      const matchSector = sectorFilter === 'All' || p.category === sectorFilter;
      const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.districtName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.state.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSector && matchSearch;
    });
  }, [recommendedProjects, sectorFilter, searchQuery]);

  const getCategoryIcon = (cat: InfrastructureCategory) => {
    switch (cat) {
      case 'Drainage':
        return <Droplets className="w-4 h-4 text-cyan-600" />;
      case 'Water':
        return <Droplet className="w-4 h-4 text-blue-600" />;
      case 'Roads':
        return <Route className="w-4 h-4 text-amber-600" />;
      case 'Electricity':
        return <Zap className="w-4 h-4 text-yellow-600" />;
      case 'Healthcare':
      case 'Health':
        return <HeartPulse className="w-4 h-4 text-rose-600" />;
      case 'Education':
        return <GraduationCap className="w-4 h-4 text-purple-600" />;
      default:
        return <Building2 className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Formula & Engine Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-0.5 text-xs font-black uppercase tracking-wider rounded-md bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5 font-mono">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                DPI ALGORITHMIC CORE
              </span>
              <span className="text-xs text-slate-500 font-medium">
                • Auditable Mathematical Governance
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              AI Priority Engine
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
              CivicPulse does not simply count raw complaints. The Priority Engine combines citizen voice with demographic density, infrastructure access deficits, risk urgency, and capex budgets to rank capital projects deterministically.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onNavigateToMap}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Flame className="w-4 h-4 text-rose-500" />
              <span>GIS Demand Hotspots</span>
            </button>
            <button
              onClick={() => onSelectProjectForPolicy(currentProject.districtId, currentProject.category)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Simulate in Policy Lab</span>
            </button>
          </div>
        </div>

        {/* Priority Score Mathematical Formula Banner */}
        <div className="mt-6 p-5 bg-slate-900 text-white rounded-xl shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-blue-400" />
              PRIORITY SCORE CALCULATION FORMULA
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
              Deterministic Weights = 100%
            </span>
          </div>

          {/* Formula Display */}
          <div className="p-4 bg-slate-800/90 rounded-lg border border-slate-700/80 font-mono text-xs sm:text-sm text-slate-200 overflow-x-auto">
            <div className="font-bold text-amber-300 mb-1">
              Priority Score (0–100) =
            </div>
            <div className="pl-4 space-y-1 text-slate-300">
              <span className="text-blue-400 font-bold">Citizen Demand (30%)</span> +{' '}
              <span className="text-rose-400 font-bold">Infrastructure Gap (25%)</span> +{' '}
              <span className="text-purple-400 font-bold">Population Impact (20%)</span> +{' '}
              <span className="text-amber-400 font-bold">Urgency (15%)</span> +{' '}
              <span className="text-emerald-400 font-bold">Government Priority (10%)</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 italic">
            Connecting citizen voice + municipal data + infrastructure capital works without subjective bias.
          </p>
        </div>
      </div>

      {/* Relational Flow Diagram: Citizen Signals -> Public Data -> Public Decisions */}
      <CivicRelationshipFlow />

      {/* Main Split Layout: AI Recommended Projects Leaderboard + Deep Reasoning Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): AI Recommended Projects Leaderboard */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  AI Recommended Projects
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ranked by composite priority score. Click any project to inspect mathematical reasoning.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                {filteredProjects.length} Projects Ranked
              </span>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search project or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto text-xs">
                {['All', 'Drainage', 'Water', 'Electricity', 'Roads', 'Health'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSectorFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap text-xs ${
                      sectorFilter === cat
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Recommended Projects Table / Cards */}
            <div className="space-y-3">
              {filteredProjects.map((project) => {
                const isSelected = project.id === selectedProjectId;
                const tier = getPriorityTier(project.priorityScore);

                return (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-400 shadow-xs ring-1 ring-blue-400'
                        : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        {/* Rank Badge */}
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-sm font-mono shadow-2xs shrink-0">
                          {project.medal}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1 font-mono">
                              {getCategoryIcon(project.category)}
                              {project.category}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs font-semibold text-slate-600">
                              {project.districtName}, {project.state}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">
                            {project.title}
                          </h3>
                        </div>
                      </div>

                      {/* Priority Score Badge */}
                      <div className="text-right shrink-0">
                        <div className="text-lg font-black font-mono tracking-tight" style={{ color: tier.color }}>
                          {project.priorityScore}
                          <span className="text-xs text-slate-400 font-normal font-sans">/100</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase font-mono border ${tier.badgeBg} ${tier.badgeText} ${tier.borderColor}`}>
                          {project.priorityTier}
                        </span>
                      </div>
                    </div>

                    {/* Quick Reasoning Snippet */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-600">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-semibold text-blue-700 flex items-center gap-1 font-mono">
                          <Users className="w-3.5 h-3.5" />
                          {project.citizenRequestsCount.toLocaleString()} requests
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="font-semibold text-rose-700 font-mono">
                          {project.factors.infrastructureGap.metricValue}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="font-medium text-slate-700">
                          ₹{(project.estimatedBudgetInr / 10000000).toFixed(1)} Cr Capex
                        </span>
                      </div>

                      <span className="text-blue-600 font-bold text-xs flex items-center gap-1 hover:underline">
                        Why high priority?
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): "Why is this high priority?" Deep Reasoning Dossier */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            {/* Header: Why is this high priority? */}
            <div className="pb-4 border-b border-slate-100">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 mb-1 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                REASONING BREAKDOWN
              </span>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Why is this high priority?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Project #{currentProject.rank}: <strong className="text-slate-800">{currentProject.title}</strong> ({currentProject.districtName})
              </p>
            </div>

            {/* Prominent Question & Answer Visual Box */}
            <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl shadow-xs space-y-4 font-mono">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-sans font-bold">
                Direct Connection of Citizen Voice + Data:
              </div>

              <div className="space-y-2 text-xs sm:text-sm font-semibold">
                {currentProject.keyBulletPoints.map((point, idx) => (
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

              {/* Priority Outcome Banner */}
              <div className="pt-3 border-t border-slate-700/80 flex items-center justify-between">
                <span className="text-xs font-sans text-slate-300">
                  Calculated Output:
                </span>
                <span className="text-sm font-black px-3 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  → HIGH PRIORITY ({currentProject.priorityScore}/100)
                </span>
              </div>
            </div>

            {/* Five Factors Breakdown Cards */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span>The 5 Formula Components</span>
                <span className="font-mono text-slate-500 font-normal">Weights</span>
              </h4>

              {/* Factor 1: Citizen Demand */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    1. Citizen Demand (30% Weight)
                  </span>
                  <span className="font-mono font-bold text-blue-700">
                    {currentProject.factors.citizenDemand.metricValue}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {currentProject.factors.citizenDemand.description}
                </p>
              </div>

              {/* Factor 2: Infrastructure Gap */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                    2. Infrastructure Gap (25% Weight)
                  </span>
                  <span className="font-mono font-bold text-rose-700">
                    {currentProject.factors.infrastructureGap.metricValue}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {currentProject.factors.infrastructureGap.description}
                </p>
              </div>

              {/* Factor 3: Population Impact */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                    3. Population Impact (20% Weight)
                  </span>
                  <span className="font-mono font-bold text-purple-700">
                    {currentProject.factors.populationImpact.metricValue}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {currentProject.factors.populationImpact.description}
                </p>
              </div>

              {/* Factor 4: Urgency */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                    4. Urgency & Safety (15% Weight)
                  </span>
                  <span className="font-mono font-bold text-amber-700">
                    {currentProject.factors.urgency.metricValue}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {currentProject.factors.urgency.description}
                </p>
              </div>

              {/* Factor 5: Government Priority */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    5. Government Priority (10% Weight)
                  </span>
                  <span className="font-mono font-bold text-emerald-700">
                    {currentProject.factors.governmentPriority.metricValue}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {currentProject.factors.governmentPriority.description}
                </p>
              </div>
            </div>

            {/* AI Policy Recommendation Banner */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Gemini AI Policy Synthesis
                </span>
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                  {currentProject.timelineMonths} Mo Timeline
                </span>
              </div>
              <p className="text-xs text-slate-800 font-medium italic leading-relaxed">
                "{currentProject.aiRecommendation}"
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              {onConvertToGovernmentProject && (
                <button
                  onClick={() => onConvertToGovernmentProject(currentProject)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Convert to Government Project</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => onSelectProjectForPolicy(currentProject.districtId, currentProject.category)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Ministerial Policy Brief</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigateToImpact(currentProject.districtId, currentProject.category)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Simulate ROI & Access Uplift</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
