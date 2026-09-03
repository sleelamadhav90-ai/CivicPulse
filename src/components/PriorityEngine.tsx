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
    <div className="space-y-8 animate-in fade-in duration-300 font-sans text-slate-900 max-w-7xl mx-auto">
      {/* Top Banner & Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium mb-1">
              <span className="font-semibold text-blue-700">CivicPulse</span>
              <span>•</span>
              <span>Decide</span>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Recommendations
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              Answers <span className="font-semibold text-slate-900 font-sans">"Where should the government intervene, and why?"</span> by translating citizen signals and asset audits directly into actionable decision briefs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setMainTab('portal')}
              className={`px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                mainTab === 'portal'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Recommendations ({recommendedProjects.length})</span>
            </button>

            <button
              onClick={() => setMainTab('queue')}
              className={`px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                mainTab === 'queue'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-500" />
              <span>Action Queue ({actionQueue.length})</span>
            </button>
          </div>
        </div>

        {/* Governance Flow */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-600">
          <span className="font-semibold text-slate-900">Decision Chain:</span>
          <span className="text-slate-500">1. Signals Ingested → 2. Issue Clustered → 3. Audit Comparison → 4. Recommendation Generated → 5. Action Queue Sanction</span>
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-500">
            <Info className="w-3.5 h-3.5" />
            Illustrative Demo Dataset
          </span>
        </div>
      </div>

      {mainTab === 'portal' && (
        <div className="space-y-6">
          {/* Top Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-900 mr-1">Intervention Type:</span>
              {[
                { id: 'ALL', label: 'All Interventions' },
                { id: 'BUILD', label: '🏗 Build (New)' },
                { id: 'FIX', label: '🔧 Fix (Repair)' },
                { id: 'UPGRADE', label: '⬆ Upgrade' },
                { id: 'POLICY', label: '📋 Policy' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setInterventionFilter(item.id as any)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                    interventionFilter === item.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search region or intervention..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>
          </div>

          {/* Actionable Recommendation Cards Grid */}
          <div className="grid grid-cols-1 gap-6">
            {filteredProjects.map((project) => {
              const inQueue = actionQueue.some((item) => item.recommendationId === project.id);
              const isHigh = project.priorityScore >= 85;

              return (
                <div
                  key={project.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col space-y-5 hover:border-slate-300 transition-colors"
                >
                  {/* Card Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded ${
                          isHigh ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {isHigh ? '🔴 HIGH PRIORITY' : '🟠 MEDIUM PRIORITY'}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-800 rounded">
                          {project.interventionType}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-xs">
                        <span className="font-bold text-slate-900">{project.districtName}, {project.state}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          Priority {project.priorityScore}/100
                        </span>
                      </div>
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 leading-snug pt-1">
                      {project.title}
                    </h2>
                  </div>

                  {/* Metric Chips Row */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                    <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-md font-semibold">
                      {project.citizenRequestsCount.toLocaleString()} citizen requests
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-md font-semibold">
                      {project.targetBeneficiaries.toLocaleString()} residents affected
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-md font-semibold">
                      {project.affectedAreasCount} villages/wards
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-md font-semibold text-blue-900 bg-blue-50">
                      ₹{(project.estimatedBudgetInr / 10000000).toFixed(0)} Cr related investment
                    </span>
                  </div>

                  {/* Why This Matters */}
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-900 block">
                      Why this matters
                    </span>
                    <ul className="text-xs text-slate-700 space-y-1 font-sans list-disc pl-4 leading-relaxed">
                      <li>Citizen reports increased 42% over the last 6 weeks regarding {project.category.toLowerCase()} availability.</li>
                      <li>Existing infrastructure facility is present but main systems operate below 40% capacity or non-functional.</li>
                      <li>₹11.2 Cr remains unspent in the related scheme allocation.</li>
                    </ul>
                  </div>

                  {/* Recommended Intervention Box */}
                  <div className="p-4 bg-blue-50/80 rounded-lg border border-blue-200 space-y-1.5">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-blue-600" />
                      Recommended Intervention
                    </span>
                    <p className="text-xs text-blue-950 font-medium leading-relaxed">
                      <strong className="uppercase">{project.interventionType}:</strong> {project.aiRecommendation}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEvidenceModalProject(project)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-slate-600" />
                        <span>Evidence →</span>
                      </button>

                      <button
                        onClick={() => setImpactModalProject(project)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-slate-600" />
                        <span>Compare alternatives →</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleToggleActionQueue(project)}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                        inQueue
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {inQueue ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added to Action Queue</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Action Queue →</span>
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
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Action Queue
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Track municipal intervention decisions from initial identification to completion.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center">
                  <span className="text-[10px] text-slate-500 uppercase block font-medium">Total Queued</span>
                  <span className="font-bold text-slate-900">{actionQueue.length} Actions</span>
                </div>
                <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center">
                  <span className="text-[10px] text-slate-500 uppercase block font-medium">Estimated Budget</span>
                  <span className="font-bold text-blue-700 font-mono">
                    ₹{(actionQueue.reduce((acc, i) => acc + i.estimatedBudgetInr, 0) / 10000000).toFixed(1)} Cr
                  </span>
                </div>
              </div>
            </div>

            {/* Action Queue 5 Stage Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { status: 'Shortlisted', label: 'Identified', badge: 'bg-slate-100 text-slate-800' },
                { status: 'Under Review', label: 'Under Review', badge: 'bg-blue-50 text-blue-800' },
                { status: 'Approved', label: 'Approved', badge: 'bg-emerald-50 text-emerald-800' },
                { status: 'In Progress', label: 'In Progress', badge: 'bg-purple-50 text-purple-800' },
                { status: 'Completed', label: 'Completed', badge: 'bg-slate-900 text-white' },
              ].map((col) => {
                const items = actionQueue.filter((i) => {
                  if (col.status === 'Shortlisted') return i.status === 'Shortlisted' || !i.status;
                  return i.status === col.status;
                });

                return (
                  <div key={col.status} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-slate-900">
                        {col.label}
                      </span>
                      <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${col.badge}`}>
                        {items.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {items.length === 0 ? (
                        <div className="p-4 bg-white border border-dashed border-slate-200 rounded-lg text-center text-[11px] text-slate-400">
                          Empty
                        </div>
                      ) : (
                        items.map((item) => (
                          <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs space-y-2 text-xs">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-blue-700">{item.districtName}</span>
                              <span className="font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                                P-{item.priorityScore}
                              </span>
                            </div>

                            <h4 className="font-bold text-slate-900 text-xs leading-snug">
                              {item.title}
                            </h4>

                            <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between pt-1 border-t border-slate-100">
                              <span>Reach: {item.targetBeneficiaries.toLocaleString()}</span>
                              <span className="font-bold text-slate-900">₹{(item.estimatedBudgetInr / 10000000).toFixed(1)} Cr</span>
                            </div>

                            {/* Status controls */}
                            <div className="flex flex-wrap items-center gap-1 pt-1 text-[10px]">
                              {col.status !== 'Shortlisted' && (
                                <button
                                  onClick={() => handleUpdateQueueStatus(item.id, 'Shortlisted')}
                                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors cursor-pointer"
                                >
                                  ← Back
                                </button>
                              )}
                              {col.status === 'Shortlisted' && (
                                <button
                                  onClick={() => handleUpdateQueueStatus(item.id, 'Under Review')}
                                  className="w-full py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors cursor-pointer text-center"
                                >
                                  Review →
                                </button>
                              )}
                              {col.status === 'Under Review' && (
                                <button
                                  onClick={() => handleUpdateQueueStatus(item.id, 'Approved')}
                                  className="w-full py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded transition-colors cursor-pointer text-center"
                                >
                                  Approve →
                                </button>
                              )}
                              {col.status === 'Approved' && (
                                <button
                                  onClick={() => handleUpdateQueueStatus(item.id, 'In Progress')}
                                  className="w-full py-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded transition-colors cursor-pointer text-center"
                                >
                                  Start Progress →
                                </button>
                              )}
                              {col.status === 'In Progress' && (
                                <button
                                  onClick={() => handleUpdateQueueStatus(item.id, 'Completed')}
                                  className="w-full py-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded transition-colors cursor-pointer text-center"
                                >
                                  Complete ✓
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
