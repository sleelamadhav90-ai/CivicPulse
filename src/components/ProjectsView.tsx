import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Droplet, 
  Droplets,
  Route, 
  HeartPulse, 
  Zap,
  GraduationCap, 
  Search, 
  Filter, 
  Wallet, 
  Users, 
  ArrowUpRight, 
  Sparkles,
  Calendar,
  Building,
  ArrowRight,
  ShieldCheck,
  Cpu,
  FileText,
  Activity,
  Check,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  PlusCircle,
  X,
  History,
  Scale
} from 'lucide-react';
import { District, InfrastructureCategory, GovernmentProject, ProjectLifecycleStatus } from '../types';
import { getPriorityTier, getAIRecommendedProjects } from '../utils/scoring';

interface ProjectsViewProps {
  districts: District[];
  projects: GovernmentProject[];
  onUpdateProjectStatus: (projectId: string, newStatus: ProjectLifecycleStatus, note?: string) => void;
  onNavigateToImpact: (districtId: string, category: InfrastructureCategory) => void;
  onNavigateToPolicyLab: (districtId: string, category: InfrastructureCategory) => void;
  onNavigateToEngine: () => void;
}

const LIFECYCLE_STATUSES: ProjectLifecycleStatus[] = ['Recommended', 'Approved', 'In Progress', 'Completed'];

import { SitePlanRenderer } from './SitePlanRenderer';

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  districts,
  projects,
  onUpdateProjectStatus,
  onNavigateToImpact,
  onNavigateToPolicyLab,
  onNavigateToEngine,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeDistrictIds = useMemo(() => new Set(districts.map((d) => d.id.toLowerCase())), [districts]);
  const activeDistrictNames = useMemo(() => new Set(districts.map((d) => d.name.toLowerCase())), [districts]);

  const activeProjects = useMemo(() => {
    const matched = projects.filter(
      (p) => activeDistrictIds.has(p.districtId.toLowerCase()) || activeDistrictNames.has(p.district.toLowerCase())
    );

    if (matched.length > 0) return matched;

    // Fallback generated government projects for selected country's districts
    return getAIRecommendedProjects(districts, []).map((rec, idx) => ({
      id: `gov-${rec.id}`,
      title: rec.title,
      district: rec.districtName,
      districtId: rec.districtId,
      state: rec.state,
      category: rec.category,
      priorityScore: rec.priorityScore,
      citizenRequestsCount: rec.citizenRequestsCount,
      population: rec.targetBeneficiaries,
      estimatedCostInr: rec.estimatedBudgetInr,
      status: (idx === 0 ? 'Approved' : idx === 1 ? 'In Progress' : 'Recommended') as ProjectLifecycleStatus,
      progress: idx === 0 ? 25 : idx === 1 ? 60 : 0,
      department: 'Public Works & Municipal Administration',
      officerInCharge: 'Chief Project Director',
      startDate: 'Q1 2026',
      targetDate: 'Q4 2026',
      beforeAccess: Math.max(10, 100 - rec.factors.infrastructureGap.score),
      afterAccess: 90,
      description: rec.aiRecommendation,
      keyReasoning: rec.keyBulletPoints,
      aiSummary: rec.summaryReasoning,
      sourceRecommendationId: rec.id,
      history: [
        {
          status: 'Recommended' as ProjectLifecycleStatus,
          timestamp: new Date().toISOString(),
          note: `Flagged by AI Priority Engine for ${rec.districtName}`,
          actor: 'CivicPulse AI Engine',
        },
      ],
    }));
  }, [projects, districts, activeDistrictIds, activeDistrictNames]);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(activeProjects[0]?.id || 'gov-proj-01');
  const [statusChangeModal, setStatusChangeModal] = useState<{
    project: GovernmentProject;
    targetStatus: ProjectLifecycleStatus;
  } | null>(null);
  const [statusNote, setStatusNote] = useState<string>('');

  // Selected project for deep inspection
  const selectedProject = useMemo(() => {
    return activeProjects.find((p) => p.id === selectedProjectId) || activeProjects[0];
  }, [activeProjects, selectedProjectId]);

  // Filtering
  const filteredProjects = useMemo(() => {
    return activeProjects.filter((p) => {
      const matchCat = filterCategory === 'All' || p.category === filterCategory;
      const matchStatus = filterStatus === 'All' || p.status === filterStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = q === '' || 
        p.title.toLowerCase().includes(q) || 
        p.district.toLowerCase().includes(q) || 
        p.state.toLowerCase().includes(q) || 
        p.department.toLowerCase().includes(q);
      return matchCat && matchStatus && matchSearch;
    });
  }, [activeProjects, filterCategory, filterStatus, searchQuery]);

  // Lifecycle Summary Counts
  const recommendedCount = activeProjects.filter((p) => p.status === 'Recommended').length;
  const approvedCount = activeProjects.filter((p) => p.status === 'Approved').length;
  const inProgressCount = activeProjects.filter((p) => p.status === 'In Progress').length;
  const completedCount = activeProjects.filter((p) => p.status === 'Completed').length;

  const totalCapex = activeProjects.reduce((acc, p) => acc + p.estimatedCostInr, 0);
  const totalBeneficiaries = activeProjects.reduce((acc, p) => acc + p.population, 0);

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
      case 'Health':
      case 'Healthcare':
        return <HeartPulse className="w-4 h-4 text-rose-600" />;
      case 'Education':
        return <GraduationCap className="w-4 h-4 text-purple-600" />;
      default:
        return <Building2 className="w-4 h-4 text-slate-600" />;
    }
  };

  const getStatusBadgeClass = (status: ProjectLifecycleStatus) => {
    switch (status) {
      case 'Recommended':
        return 'bg-purple-50 text-purple-700 border-purple-300';
      case 'Approved':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'In Progress':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
    }
  };

  const handleStatusChangeClick = (project: GovernmentProject, newStatus: ProjectLifecycleStatus) => {
    if (project.status === newStatus) return;
    setStatusChangeModal({ project, targetStatus: newStatus });
    setStatusNote(
      newStatus === 'Approved'
        ? `Administrative and financial sanction accorded with ₹${(project.estimatedCostInr / 10000000).toFixed(1)} Cr outlay.`
        : newStatus === 'In Progress'
        ? `Tender awarded and field civil works commenced under ${project.department}.`
        : newStatus === 'Completed'
        ? `Final third-party quality inspection cleared. Project commissioned for public use.`
        : `Reverted to AI recommendation review.`
    );
  };

  const confirmStatusChange = () => {
    if (statusChangeModal) {
      onUpdateProjectStatus(statusChangeModal.project.id, statusChangeModal.targetStatus, statusNote);
      setStatusChangeModal(null);
      setStatusNote('');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Header & Lifecycle Chain Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-0.5 text-xs font-black uppercase tracking-wider rounded-md bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5 font-mono">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                FEATURE 5: GOVERNMENT PROJECTS
              </span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                • Administrative Conversion & Execution
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Government Capital Projects
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
              Convert AI-ranked recommendations directly into sanctioned municipal projects. Move initiatives seamlessly across the four-stage governance lifecycle: Recommended ➔ Approved ➔ In Progress ➔ Completed.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onNavigateToEngine}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>AI Priority Engine</span>
            </button>
            <button
              onClick={() => onNavigateToPolicyLab(selectedProject.districtId, selectedProject.category)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>AI Policy Briefs</span>
            </button>
          </div>
        </div>

        {/* 4-Stage Governance Chain Visualizer */}
        <div className="p-5 bg-slate-900 text-white rounded-xl shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-400" />
              THE CIVICPULSE CIVIC CHAIN
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
              End-to-End Governance Pipeline
            </span>
          </div>

          {/* Stepper Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-sans">
            {/* Step 1: Complaint */}
            <div className="p-3.5 rounded-lg bg-slate-800/90 border border-slate-700 flex items-start space-x-3">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center font-black text-xs shrink-0 font-mono">
                1
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-200">Citizen Complaints</div>
                <p className="text-[11px] text-slate-400">Multilingual voice & text ingestion</p>
                <div className="text-[10px] font-mono text-blue-400 pt-0.5 font-semibold">1,248+ Signals Ingested</div>
              </div>
            </div>

            {/* Step 2: AI Analysis */}
            <div className="p-3.5 rounded-lg bg-slate-800/90 border border-slate-700 flex items-start space-x-3">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center font-black text-xs shrink-0 font-mono">
                2
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-200">AI Analysis</div>
                <p className="text-[11px] text-slate-400">Gemini clustering & deficit audit</p>
                <div className="text-[10px] font-mono text-purple-400 pt-0.5 font-semibold">5-Pillar Priority Formula</div>
              </div>
            </div>

            {/* Step 3: Recommendation */}
            <div className="p-3.5 rounded-lg bg-slate-800/90 border border-slate-700 flex items-start space-x-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black text-xs shrink-0 font-mono">
                3
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-200">Recommendation</div>
                <p className="text-[11px] text-slate-400">Ranked projects & capex sizing</p>
                <div className="text-[10px] font-mono text-amber-400 pt-0.5 font-semibold">94/100 Composite Score</div>
              </div>
            </div>

            {/* Step 4: Government Project */}
            <div className="p-3.5 rounded-lg bg-slate-800/90 border border-emerald-500/50 flex items-start space-x-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-black text-xs shrink-0 font-mono">
                4
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-emerald-300">Government Project</div>
                <p className="text-[11px] text-slate-300">Sanction, tendering & execution</p>
                <div className="text-[10px] font-mono text-emerald-400 pt-0.5 font-bold">Approved → In Progress → Done</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Recommended */}
        <div 
          onClick={() => setFilterStatus(filterStatus === 'Recommended' ? 'All' : 'Recommended')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            filterStatus === 'Recommended' ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-300' : 'bg-white border-slate-200 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-purple-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              Recommended
            </span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">
            {recommendedCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Pending official sanction</p>
        </div>

        {/* Approved */}
        <div 
          onClick={() => setFilterStatus(filterStatus === 'Approved' ? 'All' : 'Approved')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            filterStatus === 'Approved' ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300' : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-blue-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Approved
            </span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">
            {approvedCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Sanctioned & budget allocated</p>
        </div>

        {/* In Progress */}
        <div 
          onClick={() => setFilterStatus(filterStatus === 'In Progress' ? 'All' : 'In Progress')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            filterStatus === 'In Progress' ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300' : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-amber-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              In Progress
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">
            {inProgressCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Under active construction</p>
        </div>

        {/* Completed */}
        <div 
          onClick={() => setFilterStatus(filterStatus === 'Completed' ? 'All' : 'Completed')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            filterStatus === 'Completed' ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300' : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-emerald-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              Completed
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">
            {completedCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Commissioned & audited</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search project, district, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto text-xs">
            {['All', 'Drainage', 'Water', 'Electricity', 'Roads', 'Health', 'Education'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterCategory === cat
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Status Filter Dropdown */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All Statuses ({activeProjects.length})</option>
            <option value="Recommended">● Recommended ({recommendedCount})</option>
            <option value="Approved">● Approved ({approvedCount})</option>
            <option value="In Progress">● In Progress ({inProgressCount})</option>
            <option value="Completed">● Completed ({completedCount})</option>
          </select>
        </div>
      </div>

      {/* Main Split Layout: Projects Cards List + Deep Inspection Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Projects List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-4">
            {filteredProjects.map((project) => {
              const isSelected = project.id === selectedProject.id;
              const tier = getPriorityTier(project.priorityScore);

              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`bg-white border rounded-2xl p-5 sm:p-6 shadow-xs transition-all cursor-pointer space-y-4 ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-100 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Top Row: Category, City, Priority */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-600 flex items-center gap-1 font-mono">
                          {getCategoryIcon(project.category)}
                          {project.category}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-semibold text-slate-700">
                          {project.district}, {project.state}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                        {project.title}
                      </h3>
                    </div>

                    {/* Priority Score Box */}
                    <div className="text-right shrink-0">
                      <div className="text-base sm:text-lg font-black font-mono" style={{ color: tier.color }}>
                        {project.priorityScore}
                        <span className="text-xs text-slate-400 font-normal font-sans">/100</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase font-mono border ${tier.badgeBg} ${tier.badgeText} ${tier.borderColor}`}>
                        {tier.label}
                      </span>
                    </div>
                  </div>

                  {/* Core 4-Pill Key Metadata Box (Requests, Population, Estimated Cost, Timeline) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Priority</span>
                      <span className="font-black text-slate-900">{project.priorityScore}/100</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Requests</span>
                      <span className="font-bold text-blue-700">{project.citizenRequestsCount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Population</span>
                      <span className="font-bold text-purple-700">{(project.population / 1000).toFixed(0)}k</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Est. Cost</span>
                      <span className="font-bold text-emerald-700">₹{(project.estimatedCostInr / 10000000).toFixed(1)} Cr</span>
                    </div>
                  </div>

                  {/* Status Interactive Control (The exact 4-radio state requested) */}
                  <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span className="uppercase tracking-wider text-[10px] text-slate-500">Government Lifecycle Status</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${getStatusBadgeClass(project.status)}`}>
                        ● {project.status}
                      </span>
                    </div>

                    {/* Radio Options List */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {LIFECYCLE_STATUSES.map((status) => {
                        const isActive = project.status === status;
                        return (
                          <button
                            key={status}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChangeClick(project, status);
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-start space-x-1.5 cursor-pointer border ${
                              isActive
                                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                            }`}
                          >
                            <span className="text-sm">{isActive ? '●' : '○'}</span>
                            <span className="text-[11px] truncate">{status}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Description & Progress */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Execution Progress Bar */}
                  {project.status !== 'Recommended' && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span>Execution Progress</span>
                        <span className="font-mono font-bold">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            project.progress === 100 ? 'bg-emerald-500' : project.progress > 40 ? 'bg-blue-600' : 'bg-amber-500'
                          }`}
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (5 cols): Deep Government Project Dossier */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#f4f1ea] border-2 border-[#1a237e] shadow-[4px_4px_0px_#1a237e] p-6 space-y-6 relative overflow-hidden">
            {/* Header */}
            <div className="pb-4 border-b-2 border-[#1a237e] space-y-2 relative z-10">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#c84b31] flex items-center gap-1.5 bg-[#1a237e]/5 px-2 py-1 border border-[#1a237e]/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  PROJECT DOSSIER
                </span>
                <span className="text-[10px] font-mono text-[#1a237e]/60 tracking-widest uppercase">
                  ID: {selectedProject.id.split('-')[0]}
                </span>
              </div>
              <h3 className="text-2xl font-serif font-black text-[#1a237e] tracking-tight uppercase leading-tight">
                {selectedProject.title}
              </h3>
              <p className="text-xs text-[#1a237e]/80 font-mono">
                {selectedProject.district}, {selectedProject.state} • DEPT: <strong className="text-[#1a237e]">{selectedProject.department}</strong>
              </p>
            </div>

            {/* Architectural Site Plan Layout */}
            <div className="space-y-2">
               <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1a237e] flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#c84b31]" />
                Architectural Master Plan
              </h4>
              {(() => {
                const matchedDist = districts.find(d => 
                  d.id === selectedProject.districtId || 
                  (selectedProject.district && d.name.toLowerCase() === selectedProject.district.toLowerCase())
                );
                const safeLat = (matchedDist && typeof matchedDist.lat === 'number' && !isNaN(matchedDist.lat) && isFinite(matchedDist.lat)) ? matchedDist.lat : 16.5062;
                const safeLon = (matchedDist && typeof matchedDist.lon === 'number' && !isNaN(matchedDist.lon) && isFinite(matchedDist.lon)) ? matchedDist.lon : 80.6480;
                return (
                  <SitePlanRenderer 
                    category={selectedProject.category} 
                    seed={selectedProject.id}
                    lat={safeLat}
                    lon={safeLon}
                  />
                );
              })()}
            </div>

            {/* Prominent Lifecycle Status Box */}
            <div className="p-4 border-2 border-[#1a237e] bg-white text-[#1a237e] space-y-4 relative shadow-[2px_2px_0px_rgba(26,35,126,0.2)]">
              <div className="flex items-center justify-between border-b border-[#1a237e]/20 pb-3">
                <span className="text-xs font-mono uppercase text-[#1a237e]/60 font-bold tracking-widest">
                  Current Status
                </span>
                <span className={`px-2.5 py-0.5 text-xs font-mono font-bold uppercase border ${
                  selectedProject.status === 'Recommended' ? 'bg-[#1a237e]/10 text-[#1a237e] border-[#1a237e]/40' :
                  selectedProject.status === 'Approved' ? 'bg-[#c84b31]/10 text-[#c84b31] border-[#c84b31]/40' :
                  selectedProject.status === 'In Progress' ? 'bg-[#d97706]/10 text-[#d97706] border-[#d97706]/40' :
                  'bg-[#2e7d32]/10 text-[#2e7d32] border-[#2e7d32]/40'
                }`}>
                  ● {selectedProject.status}
                </span>
              </div>

              {/* Status Radio Flow in Dark Box */}
              <div className="space-y-2">
                <div className="text-[10px] text-[#1a237e]/70 font-sans tracking-widest uppercase font-bold">
                  Click to transition status:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {LIFECYCLE_STATUSES.map((st) => {
                    const isActive = selectedProject.status === st;
                    return (
                      <button
                        key={st}
                        onClick={() => handleStatusChangeClick(selectedProject, st)}
                        className={`p-2 text-[10px] font-mono font-bold flex items-center justify-between transition-all cursor-pointer border-2 ${
                          isActive
                            ? 'bg-[#1a237e] text-[#f4f1ea] border-[#1a237e] shadow-[2px_2px_0px_#c84b31]'
                            : 'bg-white text-[#1a237e]/60 border-[#1a237e]/20 hover:border-[#1a237e] hover:text-[#1a237e]'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 uppercase tracking-widest">
                          <span>{isActive ? '●' : '○'}</span>
                          <span>{st}</span>
                        </span>
                        {isActive && <Check className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Officer in Charge */}
              <div className="pt-3 border-t border-[#1a237e]/20 flex items-center justify-between text-xs font-mono uppercase tracking-widest">
                <span className="text-[#1a237e]/60 font-bold text-[9px]">Nodal Officer:</span>
                <span className="font-bold text-[#1a237e]">{selectedProject.officerInCharge}</span>
              </div>
            </div>

            {/* The Complaint → AI Analysis → Recommendation → Project Chain Details */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1a237e] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#c84b31]" />
                Audit Trail & Evidence Chain
              </h4>

              <div className="p-4 bg-white border border-[#1a237e]/20 text-xs space-y-3">
                <div className="font-bold text-[#1a237e] uppercase tracking-widest font-sans text-[10px] border-b border-[#1a237e]/10 pb-2">Why was this sanctioned?</div>
                <div className="space-y-2 text-[#1a237e]/80 font-mono text-[11px] leading-relaxed">
                  {selectedProject.keyReasoning.map((item, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <span className="text-[#c84b31] font-bold mt-0.5">▪</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Status History Timeline */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1a237e] flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-[#c84b31]" />
                Administrative Log
              </h4>

              <div className="space-y-2">
                {selectedProject.history.map((h, i) => (
                  <div key={i} className="p-3 bg-white border-l-2 border-[#1a237e] border-t border-b border-r border-[#1a237e]/10 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 text-[9px] font-bold font-mono uppercase border ${
                          h.status === 'Recommended' ? 'bg-[#1a237e]/5 text-[#1a237e] border-[#1a237e]/20' :
                          h.status === 'Approved' ? 'bg-[#c84b31]/5 text-[#c84b31] border-[#c84b31]/20' :
                          h.status === 'In Progress' ? 'bg-[#d97706]/5 text-[#d97706] border-[#d97706]/20' :
                          'bg-[#2e7d32]/5 text-[#2e7d32] border-[#2e7d32]/20'
                        }`}>
                        {h.status}
                      </span>
                      <span className="text-[10px] text-[#1a237e]/50 font-mono tracking-widest">
                        {new Date(h.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[#1a237e] font-medium font-sans text-[11px]">{h.note}</p>
                    <div className="text-[9px] text-[#1a237e]/50 italic font-mono uppercase tracking-widest">By: {h.actor}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t-2 border-[#1a237e] border-dashed">
              <button
                onClick={() => onNavigateToPolicyLab(selectedProject.districtId, selectedProject.category)}
                className="w-full py-3 bg-[#1a237e] hover:bg-[#c84b31] text-[#f4f1ea] font-bold text-[10px] uppercase tracking-[0.2em] shadow-[2px_2px_0px_#c84b31] hover:shadow-[2px_2px_0px_#1a237e] transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#1a237e]"
              >
                <FileText className="w-4 h-4" />
                <span>Open Policy Brief</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigateToImpact(selectedProject.districtId, selectedProject.category)}
                className="w-full py-3 bg-white hover:bg-[#1a237e]/5 text-[#1a237e] border border-[#1a237e] font-bold text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <TrendingUp className="w-4 h-4 text-[#2e7d32]" />
                <span>Verify Access Uplift ({selectedProject.beforeAccess}% → {selectedProject.afterAccess}%)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Confirming Status Change */}
      {statusChangeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600">
                  CONFIRM STATUS UPDATE
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  Update Project Status
                </h3>
              </div>
              <button
                onClick={() => setStatusChangeModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="text-slate-500 font-semibold">Project:</div>
              <div className="font-bold text-slate-900 text-sm">{statusChangeModal.project.title}</div>
              <div className="flex items-center gap-2 pt-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase border ${getStatusBadgeClass(statusChangeModal.project.status)}`}>
                  {statusChangeModal.project.status}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase border ${getStatusBadgeClass(statusChangeModal.targetStatus)}`}>
                  ● {statusChangeModal.targetStatus}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Administrative Order / Officer Note:</label>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                placeholder="Enter sanction memo number or milestone update..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setStatusChangeModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Update Status</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
