import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowRight, 
  X, 
  Building2, 
  Table as TableIcon,
  Columns as KanbanIcon,
  ShieldCheck,
  AlertCircle,
  MapPin,
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { District, InfrastructureCategory, GovernmentProject, ProjectLifecycleStatus } from '../types';
import { getAIRecommendedProjects } from '../utils/scoring';
import { useLanguage } from '../context/LanguageContext';
import { parseSearchIntent } from '../services/humanSearchService';
import { getImpactNatureBadge, calculatePercentageChange, calculateAbsoluteChange } from '../utils/impactEvidence';
import { EvidenceExplanationCard } from './EvidenceExplanationCard';
import { DISTRICTS_REGISTRY } from '../data/districts';

interface ProjectsViewProps {
  districts: District[];
  projects: GovernmentProject[];
  onUpdateProjectStatus: (projectId: string, newStatus: ProjectLifecycleStatus, note?: string) => void;
  onNavigateToImpact?: (districtId: string, category: InfrastructureCategory) => void;
  onNavigateToPolicyLab?: (districtId: string, category: InfrastructureCategory) => void;
  onNavigateToEngine?: () => void;
}

const ACTION_STAGES = [
  'Proposed',
  'Under Review',
  'Approved',
  'In Progress',
  'Completed'
] as const;

type ActionStage = typeof ACTION_STAGES[number];

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  districts,
  projects,
  onUpdateProjectStatus,
  onNavigateToImpact,
  onNavigateToPolicyLab,
  onNavigateToEngine,
}) => {
  const { t, tCategory, tStatus, tGovernmentProject, tDistrict, tState } = useLanguage();
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<GovernmentProject | null>(null);

  // Normalize projects and rank by priority score descending
  const activeProjects = useMemo(() => {
    const rawList = projects.length > 0 ? projects : getAIRecommendedProjects(districts, []).map((rec, idx) => ({
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
      progress: idx === 0 ? 15 : idx === 1 ? 55 : 0,
      department: rec.category === 'Water' 
        ? 'Rural Water Supply & Sanitation Department' 
        : rec.category === 'Health' 
        ? 'Health & Family Welfare Department' 
        : rec.category === 'Roads' 
        ? 'Public Works & Roads Department' 
        : 'Municipal Administration Department',
      officerInCharge: 'Chief Project Director',
      startDate: 'Q1 2026',
      targetDate: 'Q4 2026',
      beforeAccess: rec.category === 'Water' ? 38 : 45,
      afterAccess: idx === 1 ? 82 : undefined as unknown as number,
      description: rec.aiRecommendation,
      keyReasoning: rec.keyBulletPoints,
      aiSummary: rec.summaryReasoning,
      sourceRecommendationId: rec.id,
      history: [],
    }));

    const localizedList = rawList.map(p => tGovernmentProject(p));

    const processed = localizedList.map((p, idx) => {
      let stage: ActionStage = 'In Progress';
      let realProgress = p.progress ?? 0;
      let stageLabel = 'Implementation';

      if (p.status === 'Completed' || p.progress === 100) {
        stage = 'Completed';
        realProgress = 100;
        stageLabel = 'Delivered';
      } else if (p.status === 'In Progress') {
        stage = 'In Progress';
        realProgress = p.progress && p.progress > 0 ? p.progress : 45;
        stageLabel = 'Implementation';
      } else if (p.status === 'Approved') {
        stage = 'Approved';
        realProgress = p.progress && p.progress > 0 ? p.progress : 15;
        stageLabel = 'Procurement';
      } else if (idx % 2 === 0) {
        stage = 'Under Review';
        realProgress = 0;
        stageLabel = 'Appraisal';
      } else {
        stage = 'Proposed';
        realProgress = 0;
        stageLabel = 'Planning';
      }

      const numScore = typeof p.priorityScore === 'number' ? p.priorityScore : 61.9;
      const formattedPriority = numScore % 1 === 0 ? numScore.toFixed(0) : numScore.toFixed(1);

      let severityLabel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'STANDARD' = 'HIGH';
      if (numScore >= 85) severityLabel = 'CRITICAL';
      else if (numScore >= 70) severityLabel = 'HIGH';
      else if (numScore >= 50) severityLabel = 'MODERATE';
      else severityLabel = 'STANDARD';

      return {
        ...p,
        numPriorityScore: numScore,
        stage,
        stageLabel,
        progress: realProgress,
        displayPriorityScore: formattedPriority,
        severityLabel,
        sourceRecommendationId: p.sourceRecommendationId || `rec-${p.districtId || 'guntur'}-${p.category.toLowerCase()}`,
        formattedBudget: p.estimatedCostInr ? `₹${(p.estimatedCostInr / 10000000).toFixed(1)} Cr` : '₹12.0 Cr',
        departmentName: p.department || 'Public Works & Municipal Administration',
        interventionScope: p.description ? p.description.split('.')[0] : 'Municipal infrastructure upgrade and capacity augmentation',
      };
    });

    // Sort descending by priority score for genuine government ranking
    return processed.sort((a, b) => b.numPriorityScore - a.numPriorityScore);
  }, [projects, districts, tGovernmentProject]);

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim() && selectedCategory === 'All') return activeProjects;

    const intent = searchQuery.trim() ? parseSearchIntent(searchQuery, districts) : null;

    return activeProjects.filter(p => {
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      if (!matchesCat) return false;

      if (!intent) return true;

      if (intent.exactId && p.id.toLowerCase().includes(intent.exactId.toLowerCase())) {
        return true;
      }

      const normTitle = p.title.toLowerCase();
      const normDist = p.district.toLowerCase();
      const normDept = p.departmentName.toLowerCase();
      const normCat = p.category.toLowerCase();

      if (intent.detectedCategories.length > 0) {
        const matchesCatIntent = intent.detectedCategories.some(c => c.toLowerCase() === normCat);
        if (matchesCatIntent) {
          if (intent.detectedLocations.length > 0) {
            return intent.detectedLocations.some(l => normDist.includes(l.toLowerCase()));
          }
          return true;
        }
      }

      if (intent.detectedLocations.length > 0) {
        if (intent.detectedLocations.some(l => normDist.includes(l.toLowerCase()))) {
          return true;
        }
      }

      const q = intent.normalizedQuery;
      const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const prefixRegex = new RegExp(`(?:^|\\b|\\s)${escapedQ}`, 'i');

      const matchesWordBoundary = prefixRegex.test(p.title) || prefixRegex.test(p.district) || prefixRegex.test(p.departmentName) || prefixRegex.test(p.category);

      if (q.length < 4 ? matchesWordBoundary : (normTitle.includes(q) || normDist.includes(q) || normDept.includes(q))) {
        return true;
      }

      if (intent.keywords.length > 0) {
        return intent.keywords.some(kw => {
          if (kw.length < 4) {
            const kwEscaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const kwRegex = new RegExp(`(?:^|\\b|\\s)${kwEscaped}`, 'i');
            return kwRegex.test(p.title) || kwRegex.test(p.district) || kwRegex.test(p.departmentName) || kwRegex.test(p.category);
          }
          return normTitle.includes(kw) || normDist.includes(kw) || normDept.includes(kw) || normCat.includes(kw);
        });
      }

      return false;
    });
  }, [activeProjects, searchQuery, selectedCategory, districts]);

  return (
    <div className="space-y-6 font-sans text-[#171717] pb-16 max-w-6xl mx-auto w-full box-border">
      
      {/* 1. Page Header (Compact Government-Style Header) */}
      <header className="space-y-1.5 border-b border-[#171717]/15 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D65A3A]">
              {t('projects.priority_projects')}
            </span>
            <span className="text-[#171717]/20 select-none">•</span>
            <span className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider">
              {t('projects.decision_queue')}
            </span>
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-1 bg-white border border-[#171717]/15 p-0.5 rounded-xs shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 text-xs font-mono font-medium rounded-xs flex items-center space-x-1.5 transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#171717] text-white font-semibold'
                  : 'text-[#57534E] hover:text-[#171717]'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>{t('projects.register')}</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-2.5 py-1 text-xs font-mono font-medium rounded-xs flex items-center space-x-1.5 transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-[#171717] text-white font-semibold'
                  : 'text-[#57534E] hover:text-[#171717]'
              }`}
            >
              <KanbanIcon className="w-3.5 h-3.5" />
              <span>{t('projects.stages')}</span>
            </button>
          </div>
        </div>

        <div className="space-y-0.5">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#171717]">
            {t('projects.development_priorities')}
          </h1>
          <p className="text-xs sm:text-[13px] text-[#57534E] max-w-2xl leading-relaxed font-sans">
            {t('projects.subtitle')}
          </p>
        </div>
      </header>

      {/* 2. Search & Sector Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('projects.search_placeholder')}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#171717]/20 rounded-xs focus:outline-hidden focus:border-[#171717] text-[#171717] placeholder:text-[#78716C]"
          />
        </div>

        <div className="flex items-center space-x-1 text-xs overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[#78716C] text-[10px] font-mono uppercase tracking-wider mr-1 shrink-0">{t('filter.sector')}:</span>
          {['All', 'Water', 'Roads', 'Health', 'Electricity'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-xs transition-colors cursor-pointer text-xs font-mono whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#171717] text-white font-semibold'
                  : 'bg-white text-[#57534E] border border-[#171717]/15 hover:border-[#171717]/40'
              }`}
            >
              {cat === 'All' ? 'ALL' : tCategory(cat).toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 3. PRIORITY REGISTER (List/Table Hybrid) */}
      {viewMode === 'table' && (
        <div className="bg-white border border-[#171717]/15 rounded-xs overflow-hidden shadow-xs w-full">
          
          {/* Header Row (Desktop Only, lg+) */}
          <div className="hidden lg:grid lg:grid-cols-[minmax(0,42%)_minmax(0,14%)_minmax(0,14%)_minmax(0,15%)_minmax(0,15%)] gap-4 items-center py-2.5 px-4 bg-[#FAF8F5] border-b border-[#171717]/15 text-[10px] font-mono uppercase tracking-wider text-[#78716C] font-semibold">
            <div className="min-w-0">{t('projects.header_project')}</div>
            <div className="min-w-0">{t('metric.priority_score')}</div>
            <div className="min-w-0">{t('projects.capital_allocation')}</div>
            <div className="min-w-0">{t('projects.progress_stage')}</div>
            <div className="min-w-0 text-right">{t('projects.status')}</div>
          </div>

          {/* Data Rows */}
          <div className="divide-y divide-[#171717]/10">
            {filteredProjects.map((p, idx) => {
              const rankStr = String(idx + 1).padStart(2, '0');

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProject(p)}
                  className="p-4 lg:py-3.5 lg:px-4 hover:bg-[#FAF8F5] cursor-pointer transition-colors group border-b border-[#171717]/10 min-h-[72px] grid grid-cols-1 md:grid-cols-12 lg:grid-cols-[minmax(0,42%)_minmax(0,14%)_minmax(0,14%)_minmax(0,15%)_minmax(0,15%)] gap-3 lg:gap-4 items-center"
                >
                  {/* Column 1: Rank, Project Title, Location, Department (Desktop: 42%, Tablet: 7/12 cols) */}
                  <div className="flex items-start gap-3 min-w-0 md:col-span-7 lg:col-span-1">
                    <span className="font-mono text-xs font-bold text-[#78716C] group-hover:text-[#D65A3A] transition-colors shrink-0 pt-0.5 select-none">
                      {rankStr}
                    </span>
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <h3 className="text-xs sm:text-sm font-semibold text-[#171717] group-hover:text-[#D65A3A] transition-colors leading-snug break-words line-clamp-2">
                        {p.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#57534E]">
                        <span className="font-medium text-[#171717] flex items-center gap-1 shrink-0">
                          <MapPin className="w-3 h-3 text-[#78716C] shrink-0" />
                          {p.district} · {p.state}
                        </span>
                        <span className="text-[#171717]/20 select-none hidden sm:inline">•</span>
                        <span className="text-[#78716C] truncate max-w-full">{p.departmentName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Priority Score & Severity (Desktop: 14%, Tablet: 5/12 cols) */}
                  <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-center gap-1 min-w-0 pt-1 md:pt-0 md:col-span-5 lg:col-span-1">
                    <span className="text-[10px] font-mono text-[#78716C] uppercase md:hidden">Priority:</span>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-baseline gap-1 font-mono">
                        <span className="text-sm sm:text-base font-bold text-[#171717] tracking-tight">
                          {p.displayPriorityScore}
                        </span>
                        <span className="text-xs text-[#78716C]">/ 100</span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                        p.severityLabel === 'CRITICAL' ? 'text-[#D65A3A]' : p.severityLabel === 'HIGH' ? 'text-amber-700' : 'text-[#78716C]'
                      }`}>
                        {p.severityLabel}
                      </span>
                    </div>
                  </div>

                  {/* Column 3: Estimated Outlay (Desktop: 14%, Tablet: 4/12 cols) */}
                  <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-center gap-0.5 min-w-0 md:col-span-4 lg:col-span-1">
                    <span className="text-[10px] font-mono text-[#78716C] uppercase md:hidden">Outlay:</span>
                    <div className="flex flex-col">
                      <span className="font-mono text-xs sm:text-sm font-semibold text-[#171717] whitespace-nowrap">
                        {p.formattedBudget}
                      </span>
                      <span className="text-[10px] font-mono text-[#78716C] hidden lg:inline">Capital Allocation</span>
                    </div>
                  </div>

                  {/* Column 4: Progress & Stage (Desktop: 15%, Tablet: 4/12 cols) */}
                  <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-center gap-1 min-w-0 md:col-span-4 lg:col-span-1">
                    <span className="text-[10px] font-mono text-[#78716C] uppercase md:hidden">Progress:</span>
                    <div className="w-full space-y-1 min-w-0">
                      <div className="font-mono text-xs font-bold text-[#171717]">
                        {p.progress}%
                      </div>
                      <div className="w-full h-1.5 bg-[#E8E6DF] rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${p.progress >= 100 ? 'bg-[#285943]' : p.progress > 0 ? 'bg-[#D65A3A]' : 'bg-stone-300'}`}
                          style={{ width: `${Math.max(4, p.progress)}%` }}
                        />
                      </div>
                      <div className="text-[10px] sm:text-[11px] font-mono text-[#78716C] truncate">
                        {p.stageLabel}
                      </div>
                    </div>
                  </div>

                  {/* Column 5: Status Badge & Chevron (Desktop: 15%, Tablet: 4/12 cols) */}
                  <div className="flex items-center justify-between gap-2 min-w-0 pt-1 md:pt-0 md:col-span-4 lg:col-span-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-mono font-medium border truncate shrink-0 ${
                      p.stage === 'Completed'
                        ? 'bg-[#285943]/10 text-[#285943] border-[#285943]/30'
                        : p.stage === 'In Progress'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : p.stage === 'Approved'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : p.stage === 'Under Review'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-stone-50 text-[#57534E] border-stone-200'
                    }`}>
                      {tStatus(p.stage)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#78716C]/60 group-hover:text-[#171717] transition-colors shrink-0 ml-auto" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. KANBAN VIEW (Optional stage overview) */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {ACTION_STAGES.map((stage) => {
            const stageProjects = filteredProjects.filter(p => p.stage === stage);
            return (
              <div key={stage} className="bg-[#FAF8F5] border border-[#171717]/15 rounded-xs p-3 space-y-3">
                <div className="flex items-center justify-between border-b border-[#171717]/10 pb-2">
                  <span className="text-[11px] font-mono font-bold text-[#171717] uppercase">
                    {tStatus(stage)}
                  </span>
                  <span className="text-[10px] font-mono text-[#78716C] bg-white px-1.5 py-0.2 rounded-xs border border-[#171717]/10">
                    {stageProjects.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {stageProjects.map(p => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProject(p)}
                      className="bg-white border border-[#171717]/10 hover:border-[#171717]/30 p-3 rounded-xs shadow-2xs cursor-pointer transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[9px] font-mono text-[#D65A3A] uppercase font-bold">
                          {tCategory(p.category)}
                        </span>
                        <span className="text-[9px] font-mono font-bold text-[#171717]">
                          Score: {p.displayPriorityScore}
                        </span>
                      </div>

                      <h4 className="text-xs font-serif font-bold text-[#171717] leading-snug line-clamp-2">
                        {p.title}
                      </h4>

                      <div className="text-[10px] text-[#57534E] font-mono">
                        {p.district}, {p.state}
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-[#171717]/10 text-[10px] font-mono">
                        <span className="text-[#171717] font-bold">{p.formattedBudget}</span>
                        <span className={`${p.progress === 100 ? 'text-emerald-700 font-bold' : 'text-[#78716C]'}`}>
                          {p.progress}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. PROJECT DETAIL & EVIDENCE MODAL */}
      {selectedProject && (() => {
        const isCompleted = selectedProject.stage === 'Completed';
        const hasMeasuredOutcome = isCompleted && typeof selectedProject.afterAccess === 'number';
        const projectNature = selectedProject.id.startsWith('gov-proj-') ? 'SYNTHETIC_DEMO' : isCompleted ? 'MEASURED_OUTCOME' : 'CIVICPULSE_BASELINE';
        const natureBadge = getImpactNatureBadge(projectNature);

        const beforeSignals = selectedProject.citizenRequestsCount || 42;
        const afterSignals = hasMeasuredOutcome ? Math.max(4, Math.round(beforeSignals * 0.19)) : null;
        const signalsChangePct = calculatePercentageChange(beforeSignals, afterSignals);

        const beforeAccessVal = selectedProject.beforeAccess || 38;
        const afterAccessVal = hasMeasuredOutcome ? (selectedProject.afterAccess || 85) : null;
        const accessDelta = calculateAbsoluteChange(beforeAccessVal, afterAccessVal);

        return (
          <div className="fixed inset-0 z-50 bg-[#171717]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-[#171717]/20 rounded-xs w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl space-y-4 p-5 sm:p-6 font-sans">
              
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-[#171717]/10 pb-3.5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D65A3A]">
                      Project Detail
                    </span>
                    <span className="text-[#171717]/20 select-none">•</span>
                    <span className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border ${natureBadge.badgeClass}`}>
                      {natureBadge.label}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#171717] leading-tight">
                    {selectedProject.title}
                  </h2>
                  <div className="text-xs text-[#57534E] font-mono flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 font-medium text-[#171717]">
                      <MapPin className="w-3.5 h-3.5 text-[#78716C]" />
                      {selectedProject.district}, {selectedProject.state}
                    </span>
                    <span>·</span>
                    <span>Department: <strong>{selectedProject.departmentName}</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-1 hover:bg-[#F7F5EF] rounded-xs text-[#78716C] hover:text-[#171717] cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Priority Decision & Key Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-[#FAF8F5] border border-[#171717]/10 rounded-xs">
                  <span className="text-[10px] text-[#78716C] block uppercase font-bold">{t('metric.priority_score')}</span>
                  <span className="text-base font-bold text-[#171717] mt-0.5 block">{selectedProject.displayPriorityScore} / 100</span>
                </div>
                <div className="p-2.5 bg-[#FAF8F5] border border-[#171717]/10 rounded-xs">
                  <span className="text-[10px] text-[#78716C] block uppercase font-bold">{t('projects.capital_allocation')}</span>
                  <span className="text-base font-bold text-[#285943] mt-0.5 block">{selectedProject.formattedBudget}</span>
                </div>
                <div className="p-2.5 bg-[#FAF8F5] border border-[#171717]/10 rounded-xs">
                  <span className="text-[10px] text-[#78716C] block uppercase font-bold">{t('projects.progress_stage')}</span>
                  <span className={`text-base font-bold mt-0.5 block ${isCompleted ? 'text-[#285943]' : 'text-[#171717]'}`}>
                    {selectedProject.progress}%
                  </span>
                </div>
                <div className="p-2.5 bg-[#FAF8F5] border border-[#171717]/10 rounded-xs">
                  <span className="text-[10px] text-[#78716C] block uppercase font-bold">{t('projects.status')}</span>
                  <span className="text-base font-bold text-[#171717] mt-0.5 block">{tStatus(selectedProject.stage)}</span>
                </div>
              </div>

              {/* WHY THIS IS PRIORITIZED & EVIDENCE SUMMARY */}
              {(() => {
                const matchedDist = districts.find(d => d.id === selectedProject.districtId || d.name.toLowerCase() === selectedProject.district.toLowerCase()) || DISTRICTS_REGISTRY[0];
                return (
                  <EvidenceExplanationCard
                    district={matchedDist}
                    category={selectedProject.category}
                    compact={false}
                  />
                );
              })()}

              {/* Provenance Footer */}
              <div className="flex items-center justify-between text-[10px] font-mono text-[#78716C] px-2 py-1.5 bg-stone-50 border border-stone-200 rounded-xs">
                <span>{t('projects.provenance_note')}</span>
                <span className="text-emerald-700 font-bold">{t('projects.deterministic_lineage')}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                {onNavigateToPolicyLab && (
                  <button
                    onClick={() => {
                      onNavigateToPolicyLab(selectedProject.districtId, selectedProject.category);
                      setSelectedProject(null);
                    }}
                    className="flex-1 px-3 py-2 bg-[#171717] hover:bg-[#34322D] text-white rounded-xs text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>{t('overview.view_evidence_dossier')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {onNavigateToImpact && (
                  <button
                    onClick={() => {
                      onNavigateToImpact(selectedProject.districtId, selectedProject.category);
                      setSelectedProject(null);
                    }}
                    className="flex-1 px-3 py-2 bg-white hover:bg-[#FAF8F5] text-[#171717] border border-[#171717]/20 rounded-xs text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{t('projects.open_in_impact')}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D65A3A]" />
                  </button>
                )}
              </div>

              {/* Administrative Status Updates */}
              <div className="space-y-1.5 pt-2 border-t border-[#171717]/10">
                <span className="text-[11px] font-mono font-bold text-[#78716C] uppercase block">{t('projects.update_admin_status')}</span>
                <div className="flex flex-wrap gap-1.5">
                  {(['Approved', 'In Progress', 'Completed'] as ProjectLifecycleStatus[]).map(st => (
                    <button
                      key={st}
                      onClick={() => {
                        onUpdateProjectStatus(selectedProject.id, st);
                        setSelectedProject(null);
                      }}
                      className="px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#171717] hover:text-white text-[#171717] border border-[#171717]/20 text-xs font-mono font-medium rounded-xs transition-colors cursor-pointer"
                    >
                      {t('action.mark_as') || 'Mark as'} {tStatus(st)}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};

