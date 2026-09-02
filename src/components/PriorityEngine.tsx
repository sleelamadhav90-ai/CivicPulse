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
  Award,
  Hammer,
  Wrench,
  ArrowUpCircle,
  DollarSign,
  FileCheck,
  X,
  Check,
  Plus,
  Compass,
  Bookmark,
  Share2,
  Mic,
  Volume2,
  Play
} from 'lucide-react';
import { District, CitizenRequest, InfrastructureCategory, RecommendedProject, InterventionType, ActionQueueItem } from '../types';
import { getAIRecommendedProjects, getPriorityTier } from '../utils/scoring';
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

  // Main Active Tab
  const [mainTab, setMainTab] = useState<'portal' | 'queue'>('portal');

  // Filter States
  const [interventionFilter, setInterventionFilter] = useState<'ALL' | InterventionType>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [evidenceModalProject, setEvidenceModalProject] = useState<RecommendedProject | null>(null);
  const [impactModalProject, setImpactModalProject] = useState<RecommendedProject | null>(null);

  // Action Queue state
  const [actionQueue, setActionQueue] = useState<ActionQueueItem[]>([
    {
      id: 'aq-01',
      recommendationId: recommendedProjects[0]?.id || 'rec-01',
      title: recommendedProjects[0]?.title || 'Expand Rural Water Pipeline Trunk',
      districtName: recommendedProjects[0]?.districtName || 'District 1',
      districtId: recommendedProjects[0]?.districtId || 'dist-01',
      category: recommendedProjects[0]?.category || 'Water',
      interventionType: recommendedProjects[0]?.interventionType || 'BUILD',
      priorityScore: recommendedProjects[0]?.priorityScore || 91,
      status: 'Shortlisted',
      addedAt: new Date().toLocaleDateString(),
      estimatedBudgetInr: recommendedProjects[0]?.estimatedBudgetInr || 98000000,
      targetBeneficiaries: recommendedProjects[0]?.targetBeneficiaries || 42000,
    },
    {
      id: 'aq-02',
      recommendationId: recommendedProjects[1]?.id || 'rec-02',
      title: recommendedProjects[1]?.title || 'Upgrade Primary Healthcare Solar Grid',
      districtName: recommendedProjects[1]?.districtName || 'District 2',
      districtId: recommendedProjects[1]?.districtId || 'dist-02',
      category: recommendedProjects[1]?.category || 'Healthcare',
      interventionType: recommendedProjects[1]?.interventionType || 'UPGRADE',
      priorityScore: recommendedProjects[1]?.priorityScore || 87,
      status: 'Under Review',
      addedAt: new Date().toLocaleDateString(),
      estimatedBudgetInr: recommendedProjects[1]?.estimatedBudgetInr || 45000000,
      targetBeneficiaries: recommendedProjects[1]?.targetBeneficiaries || 27000,
    }
  ]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return recommendedProjects.filter((p) => {
      const matchType = interventionFilter === 'ALL' || p.interventionType === interventionFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        p.title.toLowerCase().includes(q) ||
        p.districtName.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [recommendedProjects, interventionFilter, searchQuery]);

  // Handle adding to action queue
  const handleToggleActionQueue = (project: RecommendedProject) => {
    const existing = actionQueue.find((item) => item.recommendationId === project.id);
    if (existing) {
      setActionQueue(actionQueue.filter((item) => item.recommendationId !== project.id));
    } else {
      setActionQueue([
        ...actionQueue,
        {
          id: `aq-${Date.now()}`,
          recommendationId: project.id,
          title: project.title,
          districtName: project.districtName,
          districtId: project.districtId,
          category: project.category,
          interventionType: project.interventionType,
          priorityScore: project.priorityScore,
          status: 'Shortlisted',
          addedAt: new Date().toLocaleDateString(),
          estimatedBudgetInr: project.estimatedBudgetInr,
          targetBeneficiaries: project.targetBeneficiaries,
        }
      ]);
    }
  };

  const handleUpdateQueueStatus = (id: string, newStatus: 'Shortlisted' | 'Under Review' | 'Approved') => {
    setActionQueue(actionQueue.map((item) => item.id === id ? { ...item, status: newStatus } : item));
  };

  const getCategoryIcon = (cat: InfrastructureCategory) => {
    switch (cat) {
      case 'Drainage': return <Droplets className="w-3.5 h-3.5 text-cyan-600" />;
      case 'Water': return <Droplet className="w-3.5 h-3.5 text-blue-600" />;
      case 'Roads': return <Route className="w-3.5 h-3.5 text-amber-600" />;
      case 'Electricity': return <Zap className="w-3.5 h-3.5 text-yellow-600" />;
      case 'Healthcare':
      case 'Health': return <HeartPulse className="w-3.5 h-3.5 text-rose-600" />;
      case 'Education': return <GraduationCap className="w-3.5 h-3.5 text-purple-600" />;
      default: return <Building2 className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const getInterventionBadge = (type: InterventionType) => {
    switch (type) {
      case 'BUILD':
        return (
          <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1 shadow-[1px_1px_0px_#171717]">
            <Hammer className="w-3 h-3 text-emerald-700" />
            BUILD
          </span>
        );
      case 'FIX':
        return (
          <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-[1px_1px_0px_#171717]">
            <Wrench className="w-3 h-3 text-amber-700" />
            FIX
          </span>
        );
      case 'UPGRADE':
        return (
          <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1 shadow-[1px_1px_0px_#171717]">
            <ArrowUpCircle className="w-3 h-3 text-blue-700" />
            UPGRADE
          </span>
        );
      case 'POLICY':
        return (
          <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1 shadow-[1px_1px_0px_#171717]">
            <FileCheck className="w-3 h-3 text-purple-700" />
            POLICY
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-sans text-[#171717]">
      {/* Top Banner & Header */}
      <div className="bg-white border border-[#171717] p-6 sm:p-8 shadow-[4px_4px_0px_#171717]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#171717]/15">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest bg-[#D65A3A] text-white border border-[#171717] shadow-[2px_2px_0px_#171717]">
                CIVICPULSE AI DECISION SUITE
              </span>
              <span className="text-xs font-mono text-[#171717]/60">
                • {new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171717] tracking-tight">
              Recommendations Portal
            </h1>
            <p className="text-xs sm:text-sm text-[#171717]/80 max-w-3xl leading-relaxed">
              Actionable AI interventions translating citizen signals directly into targeted municipal decisions. Explore evidence, impact forecasts, and add recommendations to your official Policy Action Queue.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setMainTab('portal')}
              className={`px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider border border-[#171717] transition-all cursor-pointer flex items-center gap-2 ${
                mainTab === 'portal'
                  ? 'bg-[#171717] text-[#F7F5EF] shadow-[2px_2px_0px_#D65A3A]'
                  : 'bg-white text-[#171717] hover:bg-[#F7F5EF] shadow-[2px_2px_0px_#171717]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D65A3A]" />
              <span>Recommendations ({recommendedProjects.length})</span>
            </button>

            <button
              onClick={() => setMainTab('queue')}
              className={`px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider border border-[#171717] transition-all cursor-pointer flex items-center gap-2 ${
                mainTab === 'queue'
                  ? 'bg-[#171717] text-[#F7F5EF] shadow-[2px_2px_0px_#D65A3A]'
                  : 'bg-[#F7F5EF] text-[#171717] hover:bg-white shadow-[2px_2px_0px_#171717]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-500" />
              <span>Action Queue ({actionQueue.length})</span>
            </button>
          </div>
        </div>

        {/* 6-Step Decision Flow Banner */}
        <div className="mt-6 p-4 bg-[#F7F5EF] border border-[#171717] shadow-[2px_2px_0px_#171717]">
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D65A3A] mb-2">
            GOVERNANCE DECISION FLOW:
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs font-mono font-bold">
            <div className="p-2 bg-white border border-[#171717]/30 flex flex-col items-center justify-center">
              <span className="text-[10px] text-[#171717]/60">01</span>
              <span className="text-[#171717]">Citizen Signals</span>
            </div>
            <div className="p-2 bg-white border border-[#171717]/30 flex flex-col items-center justify-center">
              <span className="text-[10px] text-[#171717]/60">02</span>
              <span className="text-[#171717]">AI Analysis</span>
            </div>
            <div className="p-2 bg-white border border-[#171717]/30 flex flex-col items-center justify-center">
              <span className="text-[10px] text-[#171717]/60">03</span>
              <span className="text-[#171717]">Evidence</span>
            </div>
            <div className="p-2 bg-white border border-[#171717]/30 flex flex-col items-center justify-center">
              <span className="text-[10px] text-[#171717]/60">04</span>
              <span className="text-[#D65A3A]">Intervention</span>
            </div>
            <div className="p-2 bg-white border border-[#171717]/30 flex flex-col items-center justify-center">
              <span className="text-[10px] text-[#171717]/60">05</span>
              <span className="text-[#171717]">Expected Impact</span>
            </div>
            <div className="p-2 bg-white border border-[#171717]/30 flex flex-col items-center justify-center bg-emerald-50 text-emerald-900 border-emerald-400">
              <span className="text-[10px] text-emerald-700">06</span>
              <span>Official Decision</span>
            </div>
          </div>
        </div>
      </div>

      {mainTab === 'portal' && (
        <div className="space-y-6">
          {/* Top Category / Intervention Filter Bar */}
          <div className="bg-white border border-[#171717] p-4 shadow-[3px_3px_0px_#171717] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#171717]/70 block mb-1">
                WHAT NEEDS ATTENTION? (INTERVENTION TYPES)
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'ALL', label: 'ALL INTERVENTIONS', icon: Layers },
                  { id: 'BUILD', label: '🏗 BUILD', sub: 'New / Capacity' },
                  { id: 'FIX', label: '🔧 FIX', sub: 'Failing / Repair' },
                  { id: 'UPGRADE', label: '⬆ UPGRADE', sub: 'Expansion' },
                  { id: 'POLICY', label: '📋 POLICY', sub: 'Non-construction' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setInterventionFilter(item.id as any)}
                    className={`px-3 py-1.5 font-mono text-xs font-bold uppercase transition-all cursor-pointer border border-[#171717] ${
                      interventionFilter === item.id
                        ? 'bg-[#171717] text-[#F7F5EF] shadow-[2px_2px_0px_#D65A3A]'
                        : 'bg-[#F7F5EF] text-[#171717] hover:bg-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-[#171717]/50 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search intervention or district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F7F5EF] border border-[#171717] pl-8 pr-3 py-1.5 text-xs text-[#171717] placeholder:text-[#171717]/50 focus:outline-none focus:bg-white font-mono"
              />
            </div>
          </div>

          {/* Actionable Recommendation Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProjects.map((project) => {
              const inQueue = actionQueue.some((item) => item.recommendationId === project.id);
              const isHigh = project.priorityScore >= 85;

              return (
                <div
                  key={project.id}
                  className="bg-white border border-[#171717] p-6 shadow-[4px_4px_0px_#171717] flex flex-col justify-between space-y-5 hover:shadow-[6px_6px_0px_#171717] transition-all"
                >
                  {/* Card Header */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-[#171717]/10 pb-3">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 text-[10px] font-mono font-extrabold uppercase tracking-widest border border-[#171717] shadow-[1px_1px_0px_#171717] ${
                          isHigh ? 'bg-rose-500 text-white' : 'bg-amber-400 text-[#171717]'
                        }`}>
                          {isHigh ? '🔴 HIGH PRIORITY' : '🟠 MEDIUM PRIORITY'}
                        </span>
                        {getInterventionBadge(project.interventionType)}
                      </div>

                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#171717]/80 bg-[#F7F5EF] px-2.5 py-1 border border-[#171717]">
                        {project.districtName.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#D65A3A] uppercase tracking-wider mb-1">
                        {getCategoryIcon(project.category)}
                        <span>{project.category} INFRASTRUCTURE</span>
                      </div>
                      <h2 className="text-lg font-serif font-bold text-[#171717] leading-snug">
                        {project.title}
                      </h2>
                    </div>
                  </div>

                  {/* WHY THIS? Metric Grid */}
                  <div className="p-4 bg-[#F7F5EF] border border-[#171717] space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#171717]/60 block border-b border-[#171717]/10 pb-1">
                      WHY THIS?
                    </span>
                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div>
                        <span className="text-[#171717]/60 block text-[10px]">CITIZEN REQUESTS</span>
                        <span className="font-bold text-[#171717]">{project.citizenRequestsCount.toLocaleString()} signals</span>
                      </div>
                      <div>
                        <span className="text-[#171717]/60 block text-[10px]">AFFECTED AREAS</span>
                        <span className="font-bold text-[#171717]">{project.affectedAreasCount} villages/wards</span>
                      </div>
                      <div>
                        <span className="text-[#171717]/60 block text-[10px]">INFRASTRUCTURE GAP</span>
                        <span className="font-bold text-rose-700">{project.factors.infrastructureGap.score}% Deficit</span>
                      </div>
                      <div>
                        <span className="text-[#171717]/60 block text-[10px]">VULNERABILITY</span>
                        <span className="font-bold text-[#D65A3A]">{project.vulnerabilityLabel}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI RECOMMENDATION Box */}
                  <div className="p-4 bg-white border border-[#171717] space-y-1.5 shadow-[2px_2px_0px_#171717]">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D65A3A] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#D65A3A]" />
                      AI RECOMMENDATION
                    </span>
                    <p className="text-xs text-[#171717] font-medium leading-relaxed">
                      {project.aiRecommendation}
                    </p>
                  </div>

                  {/* WHO IS AFFECTED? Demographic & Equity Profile Box */}
                  {project.demographics && (
                    <div className="p-3 bg-[#F7F5EF] border border-[#171717] space-y-2 shadow-[2px_2px_0px_#171717]">
                      <div className="flex items-center justify-between border-b border-[#171717]/15 pb-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D65A3A] flex items-center gap-1">
                          <Users className="w-3 h-3 text-[#D65A3A]" />
                          WHO IS AFFECTED?
                        </span>
                        <span className="text-[9px] font-mono bg-emerald-100 text-emerald-900 border border-emerald-400 px-1.5 py-0.2 font-bold flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3 text-emerald-700" />
                          PII Protected
                        </span>
                      </div>

                      <div className="space-y-1 text-xs font-mono">
                        <p className="text-[11px] text-[#171717] font-medium italic leading-snug">
                          "{project.demographics.equityAssessment}"
                        </p>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {project.demographics.affectedGroups.map((grp, idx) => (
                            <span key={idx} className="bg-white text-[#171717] px-1.5 py-0.5 border border-[#171717]/30 text-[9px] font-bold">
                              {grp.iconEmoji} {grp.groupName} ({grp.percentage}%)
                            </span>
                          ))}
                        </div>

                        <div className="flex justify-between items-center text-[9px] text-[#171717]/70 pt-1 border-t border-[#171717]/10">
                          <span>🌾 {project.demographics.ruralPct}% Rural / 🏙️ {project.demographics.urbanPct}% Urban</span>
                          <span className="font-bold text-amber-800">Low Income: {project.demographics.incomeTierBreakdown.lowIncomePct}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* INFRASTRUCTURE AUDIT (WHAT EXISTS VS CITIZEN GAP) */}
                  {project.infrastructureAudit && (
                    <div className="p-3 bg-white border border-[#171717] space-y-2 shadow-[2px_2px_0px_#171717]">
                      <div className="flex items-center justify-between border-b border-[#171717]/15 pb-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#171717] flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-[#D65A3A]" />
                          INFRASTRUCTURE AUDIT (CONDITION & CAPACITY)
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 border border-[#171717] bg-[#F7F5EF]">
                          {project.infrastructureAudit.condition}
                        </span>
                      </div>

                      <div className="space-y-1.5 font-mono text-xs">
                        <div className="flex justify-between items-center text-[11px] font-bold text-[#171717]">
                          <span>{project.infrastructureAudit.assetName}</span>
                          <span className="text-[#D65A3A]">{project.infrastructureAudit.capacity}</span>
                        </div>

                        <div className="p-2 bg-[#F7F5EF] border border-[#171717]/20 text-[10px] leading-relaxed">
                          <span className="font-bold block text-[#171717] mb-0.5">🔍 AI Evidence Comparison:</span>
                          <p className="text-[#171717]/80">{project.infrastructureAudit.auditFinding}</p>
                        </div>

                        <div className="p-2 bg-[#171717] text-[#F7F5EF] text-[10px] font-bold flex items-center gap-1.5">
                          <span className="text-amber-400">ACTION RATIONALE:</span>
                          <span className="text-white">{project.infrastructureAudit.interventionRationale}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* INVESTMENT & GOVERNMENT PLAN DATA AUDIT */}
                  {project.investmentAudit && (
                    <div className="p-3 bg-[#F7F5EF] border border-[#171717] space-y-2 shadow-[2px_2px_0px_#171717]">
                      <div className="flex items-center justify-between border-b border-[#171717]/15 pb-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#171717] flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-[#D65A3A]" />
                          INVESTMENT & PLAN DATA AUDIT
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 border border-[#171717] bg-white text-[#D65A3A]">
                          ₹{(project.investmentAudit.spentInr / 10000000).toFixed(1)} Cr SPENT
                        </span>
                      </div>

                      <div className="space-y-1 font-mono text-[10px]">
                        <div className="flex justify-between items-center font-bold text-[#171717]">
                          <span>{project.investmentAudit.schemeName}</span>
                          <span className="text-[#171717]/70">{project.investmentAudit.completedProjects} Done / {project.investmentAudit.delayedProjects} Stalled</span>
                        </div>

                        <p className="text-[#171717]/80 bg-white p-2 border border-[#171717]/15 leading-relaxed">
                          <span className="font-bold text-[#D65A3A]">💰 Scheme Gap Trace: </span>
                          {project.investmentAudit.auditFinding}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Quick Stats Row */}
                  <div className="grid grid-cols-3 gap-2 text-center p-2 bg-[#F7F5EF] border border-[#171717]/30 text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-[#171717]/60 block">EXPECTED REACH</span>
                      <span className="font-bold text-[#171717]">{project.targetBeneficiaries.toLocaleString()} citizens</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#171717]/60 block">URGENCY</span>
                      <span className="font-bold text-amber-700">{project.urgencyLabel}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#171717]/60 block">CONFIDENCE</span>
                      <span className="font-bold text-emerald-700">{project.confidencePct}%</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#171717]/10">
                    <button
                      onClick={() => setEvidenceModalProject(project)}
                      className="py-2 px-2 bg-white hover:bg-[#F7F5EF] border border-[#171717] font-mono font-bold text-[10px] uppercase tracking-wider text-[#171717] transition-all cursor-pointer flex items-center justify-center gap-1 shadow-[2px_2px_0px_#171717]"
                    >
                      <BarChart3 className="w-3 h-3 text-[#D65A3A]" />
                      <span>Evidence</span>
                    </button>

                    <button
                      onClick={() => setImpactModalProject(project)}
                      className="py-2 px-2 bg-[#F7F5EF] hover:bg-white border border-[#171717] font-mono font-bold text-[10px] uppercase tracking-wider text-[#171717] transition-all cursor-pointer flex items-center justify-center gap-1 shadow-[2px_2px_0px_#171717]"
                    >
                      <TrendingUp className="w-3 h-3 text-emerald-700" />
                      <span>Impact →</span>
                    </button>

                    <button
                      onClick={() => handleToggleActionQueue(project)}
                      className={`py-2 px-2 font-mono font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 border border-[#171717] ${
                        inQueue
                          ? 'bg-emerald-600 text-white shadow-[2px_2px_0px_#171717]'
                          : 'bg-[#171717] text-[#F7F5EF] hover:bg-[#171717]/90 shadow-[2px_2px_0px_#D65A3A]'
                      }`}
                    >
                      {inQueue ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Queued</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>Queue</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Tab = Queue ("MY POLICY ACTIONS") */}
      {mainTab === 'queue' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#171717] p-6 shadow-[4px_4px_0px_#171717] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#171717]/15 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D65A3A] block mb-1">
                  EXECUTIVE GOVERNANCE WORKFLOW
                </span>
                <h2 className="text-xl font-serif font-bold text-[#171717]">
                  My Policy Action Queue
                </h2>
                <p className="text-xs text-[#171717]/70 mt-1">
                  Shortlisted interventions queued by municipal leadership for formal review, funding sanction, and execution.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <div className="p-3 bg-[#F7F5EF] border border-[#171717] text-center">
                  <span className="text-[9px] text-[#171717]/60 block">TOTAL QUEUED</span>
                  <span className="font-bold text-[#171717]">{actionQueue.length} Actions</span>
                </div>
                <div className="p-3 bg-[#F7F5EF] border border-[#171717] text-center">
                  <span className="text-[9px] text-[#171717]/60 block">ESTIMATED CAPEX</span>
                  <span className="font-bold text-[#D65A3A]">
                    ₹{(actionQueue.reduce((acc, i) => acc + i.estimatedBudgetInr, 0) / 10000000).toFixed(1)} Cr
                  </span>
                </div>
              </div>
            </div>

            {/* Action Queue 3 Columns (Shortlisted / Under Review / Approved) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {[
                { status: 'Shortlisted', label: '📌 SHORTLISTED', color: 'bg-amber-50 border-amber-300' },
                { status: 'Under Review', label: '🔍 UNDER REVIEW', color: 'bg-blue-50 border-blue-300' },
                { status: 'Approved', label: '✅ APPROVED', color: 'bg-emerald-50 border-emerald-300' },
              ].map((col) => {
                const items = actionQueue.filter((i) => i.status === col.status);

                return (
                  <div key={col.status} className="bg-[#F7F5EF] border border-[#171717] p-4 shadow-[2px_2px_0px_#171717] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#171717]/20 pb-2">
                      <span className="font-mono text-xs font-extrabold uppercase text-[#171717]">
                        {col.label}
                      </span>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-white border border-[#171717]">
                        {items.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {items.length === 0 ? (
                        <div className="p-6 bg-white border border-dashed border-[#171717]/30 text-center text-xs font-mono text-[#171717]/50">
                          No actions in {col.status.toLowerCase()} queue.
                        </div>
                      ) : (
                        items.map((item) => (
                          <div key={item.id} className="bg-white border border-[#171717] p-4 shadow-[2px_2px_0px_#171717] space-y-3">
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="font-bold text-[#D65A3A] uppercase">{item.districtName}</span>
                              <span className="font-bold bg-[#F7F5EF] px-1.5 py-0.5 border border-[#171717]/30">
                                Priority {item.priorityScore}
                              </span>
                            </div>

                            <h4 className="text-xs font-serif font-bold text-[#171717]">
                              {item.title}
                            </h4>

                            <div className="text-[10px] font-mono text-[#171717]/70 flex items-center justify-between border-t border-[#171717]/10 pt-2">
                              <span>Reach: {item.targetBeneficiaries.toLocaleString()}</span>
                              <span>₹{(item.estimatedBudgetInr / 10000000).toFixed(1)} Cr</span>
                            </div>

                            {/* Move status buttons */}
                            <div className="flex items-center justify-between gap-1 pt-1 font-mono text-[9px]">
                              {item.status !== 'Shortlisted' && (
                                <button
                                  onClick={() => handleUpdateQueueStatus(item.id, 'Shortlisted')}
                                  className="px-2 py-1 bg-[#F7F5EF] hover:bg-white border border-[#171717] text-[#171717] cursor-pointer"
                                >
                                  ← Shortlist
                                </button>
                              )}
                              {item.status !== 'Under Review' && (
                                <button
                                  onClick={() => handleUpdateQueueStatus(item.id, 'Under Review')}
                                  className="px-2 py-1 bg-blue-100 hover:bg-blue-200 border border-blue-400 text-blue-900 cursor-pointer font-bold"
                                >
                                  Review
                                </button>
                              )}
                              {item.status !== 'Approved' && (
                                <button
                                  onClick={() => handleUpdateQueueStatus(item.id, 'Approved')}
                                  className="px-2 py-1 bg-emerald-600 text-white border border-[#171717] font-bold cursor-pointer"
                                >
                                  Approve →
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* EVIDENCE MODAL ("WHY CIVICPULSE RECOMMENDS THIS") */}
      {evidenceModalProject && (
        <div className="fixed inset-0 z-50 bg-[#171717]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F7F5EF] border-2 border-[#171717] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_#171717] p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#171717] pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D65A3A] block">
                  EVIDENCE & AUDIT TRAIL
                </span>
                <h3 className="text-xl font-serif font-bold text-[#171717] uppercase">
                  {evidenceModalProject.title}
                </h3>
                <div className="flex items-center gap-2 mt-1 font-mono text-xs text-[#171717]/70">
                  <span>{evidenceModalProject.districtName} District</span>
                  <span>•</span>
                  <span className="font-bold text-[#D65A3A]">Priority Score: {evidenceModalProject.priorityScore} / 100</span>
                </div>
              </div>

              <button
                onClick={() => setEvidenceModalProject(null)}
                className="p-1 bg-white hover:bg-rose-100 border border-[#171717] cursor-pointer"
              >
                <X className="w-5 h-5 text-[#171717]" />
              </button>
            </div>

            {/* WHY CIVICPULSE RECOMMENDS THIS - Progress Bars */}
            <div className="bg-white border border-[#171717] p-5 space-y-4 shadow-[2px_2px_0px_#171717]">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#171717] block border-b border-[#171717]/10 pb-2">
                WHY CIVICPULSE RECOMMENDS THIS
              </span>

              <div className="space-y-3 font-mono text-xs">
                {/* Citizen Demand */}
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>Citizen Demand Signals</span>
                    <span className="text-blue-700">{evidenceModalProject.factors.citizenDemand.score} / 100</span>
                  </div>
                  <div className="w-full h-3 bg-[#F7F5EF] border border-[#171717] overflow-hidden">
                    <div className="h-full bg-blue-600" style={{ width: `${evidenceModalProject.factors.citizenDemand.score}%` }} />
                  </div>
                </div>

                {/* Infrastructure Gap */}
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>Infrastructure Gap</span>
                    <span className="text-rose-700">{evidenceModalProject.factors.infrastructureGap.score} / 100</span>
                  </div>
                  <div className="w-full h-3 bg-[#F7F5EF] border border-[#171717] overflow-hidden">
                    <div className="h-full bg-rose-600" style={{ width: `${evidenceModalProject.factors.infrastructureGap.score}%` }} />
                  </div>
                </div>

                {/* Vulnerability */}
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>Vulnerability & Hazard Index</span>
                    <span className="text-amber-700">{evidenceModalProject.factors.urgency.score} / 100</span>
                  </div>
                  <div className="w-full h-3 bg-[#F7F5EF] border border-[#171717] overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${evidenceModalProject.factors.urgency.score}%` }} />
                  </div>
                </div>

                {/* Population Impact */}
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>Population Impact & Density</span>
                    <span className="text-purple-700">{evidenceModalProject.factors.populationImpact.score} / 100</span>
                  </div>
                  <div className="w-full h-3 bg-[#F7F5EF] border border-[#171717] overflow-hidden">
                    <div className="h-full bg-purple-600" style={{ width: `${evidenceModalProject.factors.populationImpact.score}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Citizen Signals & Infrastructure Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-[#171717] p-4 space-y-2 shadow-[2px_2px_0px_#171717]">
                <span className="text-[10px] font-mono font-bold uppercase text-[#D65A3A] block border-b border-[#171717]/10 pb-1">
                  CITIZEN SIGNALS
                </span>
                <ul className="space-y-1.5 font-mono text-xs text-[#171717]">
                  <li className="font-bold">• {evidenceModalProject.evidenceSignals.totalRequests.toLocaleString()} verified citizen requests</li>
                  <li>• {evidenceModalProject.evidenceSignals.topicMentionPct}% explicitly mention {evidenceModalProject.category.toLowerCase()} availability</li>
                  <li>• {evidenceModalProject.evidenceSignals.urgentRequestsCount} marked as urgent hazard</li>
                </ul>
              </div>

              <div className="bg-white border border-[#171717] p-4 space-y-2 shadow-[2px_2px_0px_#171717]">
                <span className="text-[10px] font-mono font-bold uppercase text-[#D65A3A] block border-b border-[#171717]/10 pb-1">
                  INFRASTRUCTURE AUDIT
                </span>
                <ul className="space-y-1.5 font-mono text-xs text-[#171717]">
                  <li className="font-bold">• {evidenceModalProject.evidenceInfrastructure.underservedAreasCount} underserved villages/wards</li>
                  <li>• {evidenceModalProject.evidenceInfrastructure.existingFacilitiesCount} existing facilities logged</li>
                  <li>• {evidenceModalProject.evidenceInfrastructure.nonFunctionalFacilitiesCount} currently non-functional</li>
                </ul>
              </div>
            </div>

            {/* DEMOGRAPHIC DATA & EQUITY PROFILE PANEL (WHO IS AFFECTED?) */}
            {evidenceModalProject.demographics && (
              <div className="bg-white border border-[#171717] p-5 space-y-3 shadow-[3px_3px_0px_#171717]">
                <div className="flex items-center justify-between border-b border-[#171717]/15 pb-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D65A3A] flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#D65A3A]" />
                    WHO IS AFFECTED? DEMOGRAPHIC & EQUITY ANALYSIS
                  </span>
                  <span className="text-[9px] font-mono bg-emerald-100 text-emerald-900 border border-emerald-400 px-2 py-0.5 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-700" />
                    PII PROTECTED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  {/* Affected Demographic Groups */}
                  <div className="space-y-2 bg-[#F7F5EF] p-3 border border-[#171717]/30">
                    <span className="text-[10px] text-[#171717]/80 font-bold uppercase block border-b border-[#171717]/10 pb-1">
                      PRIMARY IMPACTED POPULATION
                    </span>
                    <div className="space-y-2">
                      {evidenceModalProject.demographics.affectedGroups.map((group, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between font-bold text-[#171717]">
                            <span className="flex items-center gap-1">
                              <span>{group.iconEmoji}</span> {group.groupName}
                            </span>
                            <span className="text-[#D65A3A]">{group.percentage}%</span>
                          </div>
                          <p className="text-[10px] text-[#171717]/70 italic font-sans">
                            "{group.impactNote}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Density & Income Breakdown */}
                  <div className="space-y-2 bg-[#F7F5EF] p-3 border border-[#171717]/30">
                    <span className="text-[10px] text-[#171717]/80 font-bold uppercase block border-b border-[#171717]/10 pb-1">
                      EQUITY & VULNERABILITY METRICS
                    </span>

                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between font-bold">
                        <span>Rural vs Urban:</span>
                        <span>🌾 {evidenceModalProject.demographics.ruralPct}% Rural / 🏙️ {evidenceModalProject.demographics.urbanPct}% Urban</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Low-Income Household (BPL):</span>
                        <span className="text-amber-800">{evidenceModalProject.demographics.incomeTierBreakdown.lowIncomePct}% Concentration</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#171717]/10 space-y-1">
                      <span className="text-[9px] text-[#171717]/70 font-bold block">VULNERABILITY FLAGS:</span>
                      <div className="flex flex-wrap gap-1">
                        {evidenceModalProject.demographics.vulnerabilityIndicators.map((vuln, idx) => (
                          <span key={idx} className={`px-1.5 py-0.5 text-[9px] font-bold border ${vuln.badgeColor}`}>
                            ⚠️ {vuln.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-[#F7F5EF] border border-[#171717]/40 text-[11px] font-mono space-y-1">
                  <span className="text-[9px] font-bold text-[#D65A3A] uppercase block">EQUITY ASSESSMENT:</span>
                  <p className="text-[#171717] italic">"{evidenceModalProject.demographics.equityAssessment}"</p>
                </div>
              </div>
            )}

            {/* INFRASTRUCTURE DATA AUDIT PANEL ("WHAT EXISTS? WHAT CONDITION/CAPACITY?") */}
            {evidenceModalProject.infrastructureAudit && (
              <div className="bg-[#171717] text-[#F7F5EF] border border-[#171717] p-5 space-y-3 shadow-[3px_3px_0px_#D65A3A] font-mono">
                <div className="flex items-center justify-between border-b border-white/20 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#D65A3A] flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#D65A3A]" />
                    INFRASTRUCTURE ASSET AUDIT & ACTION TYPE JUSTIFICATION
                  </span>
                  <span className="text-[9px] bg-white text-[#171717] px-2 py-0.5 font-bold">
                    {evidenceModalProject.infrastructureAudit.condition}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white/10 p-2.5 border border-white/10 space-y-1">
                    <span className="text-[9px] text-[#D65A3A] uppercase block font-bold">ASSET & LOCATION</span>
                    <span className="font-bold text-white block">{evidenceModalProject.infrastructureAudit.assetName}</span>
                    <span className="text-[10px] text-slate-300">{evidenceModalProject.infrastructureAudit.location}</span>
                  </div>
                  <div className="bg-white/10 p-2.5 border border-white/10 space-y-1">
                    <span className="text-[9px] text-[#D65A3A] uppercase block font-bold">CAPACITY & UTILIZATION</span>
                    <span className="font-bold text-white block">{evidenceModalProject.infrastructureAudit.capacity}</span>
                    <span className="text-[10px] text-amber-300">Utilization: {evidenceModalProject.infrastructureAudit.utilizationPct}%</span>
                  </div>
                  <div className="bg-white/10 p-2.5 border border-white/10 space-y-1">
                    <span className="text-[9px] text-[#D65A3A] uppercase block font-bold">PROXIMITY & COVERAGE</span>
                    <span className="font-bold text-white block">{evidenceModalProject.infrastructureAudit.nearestFacilityDistanceKm} km nearest</span>
                    <span className="text-[10px] text-slate-300">~{evidenceModalProject.infrastructureAudit.travelTimeMinutes} min travel time</span>
                  </div>
                </div>

                <div className="p-3 bg-white text-[#171717] space-y-1 text-xs">
                  <span className="text-[9px] font-bold text-[#D65A3A] uppercase block tracking-wider">
                    COMPARE CITIZEN COMPLAINT VS INFRASTRUCTURE REALITY
                  </span>
                  <p className="font-medium text-[11px] leading-relaxed">
                    {evidenceModalProject.infrastructureAudit.auditFinding}
                  </p>
                </div>

                <div className="p-3 bg-[#D65A3A] text-white space-y-1 text-xs font-bold shadow-[2px_2px_0px_#ffffff]">
                  <span className="text-[9px] uppercase tracking-wider block text-amber-100">
                    INTERVENTION DECISION TYPE ({evidenceModalProject.infrastructureAudit.interventionType})
                  </span>
                  <p className="text-white text-[11px] leading-relaxed">
                    {evidenceModalProject.infrastructureAudit.interventionRationale}
                  </p>
                </div>
              </div>
            )}

            {/* INVESTMENT & GOVERNMENT PLAN DATA AUDIT PANEL */}
            {evidenceModalProject.investmentAudit && (
              <div className="bg-[#171717] text-[#F7F5EF] border border-[#171717] p-5 space-y-3 shadow-[3px_3px_0px_#D65A3A] font-mono">
                <div className="flex items-center justify-between border-b border-white/20 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#D65A3A] flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-[#D65A3A]" />
                    INVESTMENT & PLAN DATA AUDIT (SCHEME CAPITAL & GAP TRACE)
                  </span>
                  <span className="text-[9px] bg-amber-400 text-[#171717] px-2 py-0.5 font-bold">
                    ₹{(evidenceModalProject.investmentAudit.spentInr / 10000000).toFixed(1)} Cr EXPENDED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white/10 p-2.5 border border-white/10 space-y-1">
                    <span className="text-[9px] text-[#D65A3A] uppercase block font-bold">SCHEME & DEPT</span>
                    <span className="font-bold text-white block">{evidenceModalProject.investmentAudit.schemeName}</span>
                    <span className="text-[10px] text-slate-300">{evidenceModalProject.investmentAudit.department}</span>
                  </div>
                  <div className="bg-white/10 p-2.5 border border-white/10 space-y-1">
                    <span className="text-[9px] text-[#D65A3A] uppercase block font-bold">EXPENDITURE VS ALLOCATION</span>
                    <span className="font-bold text-white block">₹{(evidenceModalProject.investmentAudit.spentInr / 10000000).toFixed(1)} Cr Spent</span>
                    <span className="text-[10px] text-amber-300">Unspent: ₹{(evidenceModalProject.investmentAudit.unutilizedInr / 10000000).toFixed(1)} Cr</span>
                  </div>
                  <div className="bg-white/10 p-2.5 border border-white/10 space-y-1">
                    <span className="text-[9px] text-[#D65A3A] uppercase block font-bold">PROJECT TRACK RECORD</span>
                    <span className="font-bold text-white block">{evidenceModalProject.investmentAudit.completedProjects} Completed</span>
                    <span className="text-[10px] text-amber-400 font-bold">{evidenceModalProject.investmentAudit.delayedProjects} Stalled Contracts</span>
                  </div>
                </div>

                <div className="p-3 bg-white text-[#171717] space-y-1 text-xs">
                  <span className="text-[9px] font-bold text-[#D65A3A] uppercase block tracking-wider">
                    COMPARE SCHEME SPENDING VS CITIZEN GROUND NEED
                  </span>
                  <p className="font-medium text-[11px] leading-relaxed">
                    {evidenceModalProject.investmentAudit.auditFinding}
                  </p>
                </div>

                <div className="p-3 bg-[#D65A3A] text-white space-y-1 text-xs font-bold shadow-[2px_2px_0px_#ffffff]">
                  <span className="text-[9px] uppercase tracking-wider block text-amber-100">
                    INVESTMENT GAP RATIONALE:
                  </span>
                  <p className="text-white text-[11px] leading-relaxed font-normal">
                    {evidenceModalProject.investmentAudit.investmentGapRationale}
                  </p>
                </div>
              </div>
            )}

            {/* ORIGINAL CITIZEN VOICE SIGNALS */}
            <div className="bg-[#171717] text-[#F7F5EF] border border-[#171717] p-5 space-y-3 shadow-[3px_3px_0px_#D65A3A]">
              <div className="flex items-center justify-between border-b border-[#F7F5EF]/20 pb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D65A3A] flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-[#D65A3A]" />
                  ORIGINAL CITIZEN VOICE SIGNALS ({evidenceModalProject.evidenceSignals.totalRequests} VOICE REPORTS)
                </span>
                <span className="text-[9px] font-mono bg-emerald-700 text-white px-2 py-0.5 font-bold">
                  AI Summarizes Voice, Doesn't Replace It
                </span>
              </div>

              <p className="text-xs text-[#F7F5EF]/80 font-serif italic">
                Listen to raw, authentic citizen audio voice signals captured across villages in {evidenceModalProject.districtName}:
              </p>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="bg-white/10 p-3 border border-white/20 rounded space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-amber-300 font-bold">
                    <span className="flex items-center gap-1">
                      <Play className="w-3 h-3 text-[#D65A3A] fill-[#D65A3A]" />
                      VOICE RECORDING #0482 • TELUGU (తెలుగు)
                    </span>
                    <span>00:18 • {evidenceModalProject.districtName} Rural</span>
                  </div>
                  <p className="text-white italic text-xs font-serif leading-relaxed">
                    "మా గ్రామంలో రెండు వారాలుగా మంచినీటి సరఫరా నిలిచిపోయింది. పిల్లలు, పెద్దలు తాగునీటి కోసం తీవ్ర ఇబ్బందులు పడుతున్నారు..."
                  </p>
                  <div className="text-[10px] text-slate-300 font-sans pt-1 border-t border-white/10">
                    <strong>English Translation:</strong> "Drinking water supply has stopped in our village for two weeks. Children and elderly are facing severe hardship fetching potable water..."
                  </div>
                </div>

                <div className="bg-white/10 p-3 border border-white/20 rounded space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-amber-300 font-bold">
                    <span className="flex items-center gap-1">
                      <Play className="w-3 h-3 text-[#D65A3A] fill-[#D65A3A]" />
                      VOICE RECORDING #0819 • HINDI (हिंदी)
                    </span>
                    <span>00:24 • {evidenceModalProject.districtName} Sector 4</span>
                  </div>
                  <p className="text-white italic text-xs font-serif leading-relaxed">
                    "हमारे इलाके में पानी का मुख्य पाइप पूरी तरह से टूट गया है और 4 दिनों से गंदा पानी सड़कों पर बह रहा है..."
                  </p>
                  <div className="text-[10px] text-slate-300 font-sans pt-1 border-t border-white/10">
                    <strong>English Translation:</strong> "The main water pipeline in our area has burst completely and contaminated water is leaking onto streets for 4 days..."
                  </div>
                </div>
              </div>
            </div>

            {/* "WHY THIS OVER THAT?" Feature Matrix */}
            <div className="bg-white border border-[#171717] p-5 space-y-3 shadow-[3px_3px_0px_#171717]">
              <div className="flex items-center justify-between border-b border-[#171717]/10 pb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#171717] flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#D65A3A]" />
                  WHY THIS OVER THAT? (SECTOR COMPARISON)
                </span>
                <span className="text-[10px] font-mono bg-[#D65A3A] text-white px-2 py-0.5 font-bold">
                  Transparent Tradeoffs
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#171717] bg-[#F7F5EF]">
                      <th className="p-2 border-r border-[#171717]">CRITERIA</th>
                      <th className="p-2 border-r border-[#171717] bg-emerald-100 font-extrabold text-emerald-900">
                        {evidenceModalProject.category.toUpperCase()} ⭐
                      </th>
                      <th className="p-2 border-r border-[#171717]">HEALTHCARE</th>
                      <th className="p-2">ROADS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#171717]/20">
                      <td className="p-2 font-bold border-r border-[#171717]">Citizen Demand</td>
                      <td className="p-2 border-r border-[#171717] bg-emerald-50 font-bold text-emerald-900">{evidenceModalProject.factors.citizenDemand.score}</td>
                      <td className="p-2 border-r border-[#171717]">84</td>
                      <td className="p-2">76</td>
                    </tr>
                    <tr className="border-b border-[#171717]/20">
                      <td className="p-2 font-bold border-r border-[#171717]">Infrastructure Gap</td>
                      <td className="p-2 border-r border-[#171717] bg-emerald-50 font-bold text-emerald-900">{evidenceModalProject.factors.infrastructureGap.score}</td>
                      <td className="p-2 border-r border-[#171717]">79</td>
                      <td className="p-2">72</td>
                    </tr>
                    <tr className="border-b border-[#171717]/20">
                      <td className="p-2 font-bold border-r border-[#171717]">Vulnerability</td>
                      <td className="p-2 border-r border-[#171717] bg-emerald-50 font-bold text-emerald-900">{evidenceModalProject.factors.urgency.score}</td>
                      <td className="p-2 border-r border-[#171717]">88</td>
                      <td className="p-2">61</td>
                    </tr>
                    <tr className="border-b border-[#171717]/20">
                      <td className="p-2 font-bold border-r border-[#171717]">Population Impact</td>
                      <td className="p-2 border-r border-[#171717] bg-emerald-50 font-bold text-emerald-900">{evidenceModalProject.factors.populationImpact.score}</td>
                      <td className="p-2 border-r border-[#171717]">81</td>
                      <td className="p-2">74</td>
                    </tr>
                    <tr className="bg-[#F7F5EF] font-black border-t border-[#171717]">
                      <td className="p-2 border-r border-[#171717]">OVERALL SCORE</td>
                      <td className="p-2 border-r border-[#171717] bg-emerald-200 text-emerald-950 font-mono text-sm">
                        {evidenceModalProject.priorityScore} ↑ RECOMMENDED
                      </td>
                      <td className="p-2 border-r border-[#171717] text-slate-700">87</td>
                      <td className="p-2 text-slate-700">82</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={() => {
                  setEvidenceModalProject(null);
                  onNavigateToMap();
                }}
                className="py-2.5 px-4 bg-white hover:bg-[#F7F5EF] border border-[#171717] font-mono text-xs font-bold uppercase text-[#171717] cursor-pointer shadow-[2px_2px_0px_#171717]"
              >
                [ View District ]
              </button>

              <button
                onClick={() => {
                  handleToggleActionQueue(evidenceModalProject);
                  setEvidenceModalProject(null);
                }}
                className="py-2.5 px-5 bg-[#171717] hover:bg-[#171717]/90 border border-[#171717] font-mono text-xs font-bold uppercase text-[#F7F5EF] cursor-pointer shadow-[2px_2px_0px_#D65A3A]"
              >
                + Add to Action Queue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPACT PREVIEW MODAL ("IF THIS IS IMPLEMENTED") */}
      {impactModalProject && (
        <div className="fixed inset-0 z-50 bg-[#171717]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F7F5EF] border-2 border-[#171717] max-w-xl w-full shadow-[8px_8px_0px_#171717] p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-[#171717] pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-700 block">
                  IMPACT PREVIEW FORECAST
                </span>
                <h3 className="text-xl font-serif font-bold text-[#171717]">
                  {impactModalProject.title}
                </h3>
                <p className="text-xs font-mono text-[#171717]/70 mt-1">
                  {impactModalProject.districtName} District
                </p>
              </div>

              <button
                onClick={() => setImpactModalProject(null)}
                className="p-1 bg-white hover:bg-rose-100 border border-[#171717] cursor-pointer"
              >
                <X className="w-5 h-5 text-[#171717]" />
              </button>
            </div>

            <div className="text-center space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-widest bg-[#171717] text-[#F7F5EF] px-3 py-1 inline-block">
                IF THIS IS IMPLEMENTED
              </span>

              {/* 3 Prominent Stat Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-white border border-[#171717] shadow-[2px_2px_0px_#171717] text-center">
                  <span className="text-xl font-serif font-bold text-[#D65A3A] block">
                    {impactModalProject.targetBeneficiaries.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-mono uppercase text-[#171717]/70 font-bold block mt-1">
                    CITIZENS REACHED
                  </span>
                </div>

                <div className="p-4 bg-white border border-[#171717] shadow-[2px_2px_0px_#171717] text-center">
                  <span className="text-xl font-serif font-bold text-[#171717] block">
                    {impactModalProject.affectedAreasCount}
                  </span>
                  <span className="text-[10px] font-mono uppercase text-[#171717]/70 font-bold block mt-1">
                    VILLAGES COVERED
                  </span>
                </div>

                <div className="p-4 bg-white border border-[#171717] shadow-[2px_2px_0px_#171717] text-center">
                  <span className="text-xl font-serif font-bold text-amber-700 block">
                    {impactModalProject.vulnerabilityLabel}
                  </span>
                  <span className="text-[10px] font-mono uppercase text-[#171717]/70 font-bold block mt-1">
                    VULNERABILITY
                  </span>
                </div>
              </div>
            </div>

            {/* Expected Impact Forecast Numbers */}
            <div className="bg-white border border-[#171717] p-5 space-y-3 shadow-[2px_2px_0px_#171717]">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#171717] block border-b border-[#171717]/10 pb-2">
                EXPECTED OUTCOMES (SIMULATED)
              </span>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="flex justify-between items-center p-2 bg-[#F7F5EF] border border-[#171717]/30">
                  <span className="font-bold text-[#171717]">{impactModalProject.category} Access Uplift</span>
                  <span className="font-extrabold text-emerald-700">+{impactModalProject.expectedImpact.accessIncreasePct}%</span>
                </div>

                <div className="flex justify-between items-center p-2 bg-[#F7F5EF] border border-[#171717]/30">
                  <span className="font-bold text-[#171717]">Municipal Service Coverage</span>
                  <span className="font-extrabold text-blue-700">+{impactModalProject.expectedImpact.coverageIncreasePct}%</span>
                </div>

                <div className="flex justify-between items-center p-2 bg-[#F7F5EF] border border-[#171717]/30">
                  <span className="font-bold text-[#171717]">Unresolved Citizen Grievances</span>
                  <span className="font-extrabold text-rose-700">-{impactModalProject.expectedImpact.demandReductionPct}%</span>
                </div>
              </div>

              <p className="text-[10px] font-mono text-[#171717]/60 italic pt-1">
                Note: AI/data-based estimates calibrated by CivicPulse Priority Engine, not guaranteed outcomes.
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setImpactModalProject(null)}
                className="py-2.5 px-4 bg-white border border-[#171717] font-mono text-xs font-bold uppercase cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={() => {
                  setImpactModalProject(null);
                  onNavigateToImpact(impactModalProject.districtId, impactModalProject.category);
                }}
                className="py-2.5 px-5 bg-[#D65A3A] text-white border border-[#171717] font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_#171717] cursor-pointer"
              >
                Full Impact Simulator →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
