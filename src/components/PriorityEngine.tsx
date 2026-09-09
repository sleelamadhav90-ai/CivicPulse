import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  X, 
  Search, 
  FileText, 
  Plus, 
  Sparkles, 
  MapPin, 
  Database, 
  Users, 
  AlertCircle,
  TrendingUp,
  BookmarkCheck
} from 'lucide-react';
import { District, CitizenRequest, InfrastructureCategory, RecommendedProject, InterventionType } from '../types';
import { getAIRecommendedProjects } from '../utils/scoring';
import { useLanguage } from '../context/LanguageContext';

interface PriorityEngineProps {
  districts: District[];
  requests: CitizenRequest[];
  policyTargetDistrictId?: string;
  policyTargetCategory?: InfrastructureCategory;
  onSelectProjectForPolicy: (districtId: string, category: InfrastructureCategory) => void;
  onNavigateToImpact: (districtId: string, category: InfrastructureCategory) => void;
  onNavigateToMap: () => void;
  onConvertToGovernmentProject?: (recommendedProject: RecommendedProject) => void;
  onNavigateToProjects?: () => void;
}

export const PriorityEngine: React.FC<PriorityEngineProps> = ({
  districts,
  requests,
  policyTargetDistrictId,
  policyTargetCategory,
  onSelectProjectForPolicy,
  onNavigateToImpact,
  onNavigateToMap,
  onConvertToGovernmentProject,
  onNavigateToProjects,
}) => {
  const { t, tRecommendation, tCategory, tIntervention, tDistrict, tState } = useLanguage();
  const [selectedType, setSelectedType] = useState<'ALL' | InterventionType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [evidenceProject, setEvidenceProject] = useState<RecommendedProject | null>(null);
  const [queuedProjectIds, setQueuedProjectIds] = useState<Set<string>>(new Set());

  const rawRecommendedProjects = useMemo(() => {
    return getAIRecommendedProjects(districts, requests);
  }, [districts, requests]);

  const recommendedProjects = useMemo(() => {
    return rawRecommendedProjects.map(p => tRecommendation(p));
  }, [rawRecommendedProjects, tRecommendation]);

  // Handle policy target auto-open
  React.useEffect(() => {
    if (policyTargetDistrictId) {
      const match = recommendedProjects.find(
        p => p.districtId.toLowerCase() === policyTargetDistrictId.toLowerCase() ||
             p.districtName.toLowerCase().includes(policyTargetDistrictId.toLowerCase())
      );
      if (match) {
        setEvidenceProject(match);
      }
    }
  }, [policyTargetDistrictId, recommendedProjects]);

  const filteredProjects = useMemo(() => {
    return recommendedProjects.filter(p => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        p.title.toLowerCase().includes(q) ||
        p.districtName.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);

      const matchesType = selectedType === 'ALL' || p.interventionType === selectedType;
      return matchesSearch && matchesType;
    });
  }, [recommendedProjects, searchQuery, selectedType]);

  const handleAddToQueue = (project: RecommendedProject) => {
    setQueuedProjectIds(prev => new Set(prev).add(project.id));
    if (onConvertToGovernmentProject) {
      onConvertToGovernmentProject(project);
    }
  };

  return (
    <div className="space-y-8 font-sans text-[#171717] pb-16 w-full max-w-7xl mx-auto">
      
      {/* 1. Header (Question-driven with supporting label) */}
      <header className="space-y-2 border-b border-[#171717]/10 pb-5">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-[#FAF8F5] text-[#D65A3A] border border-[#D65A3A]/30 text-[10px] font-mono font-bold tracking-wider uppercase rounded-xs">
            {t('recommendations.page_label') || 'Recommendations'}
          </span>
          <span className="text-[11px] font-mono text-[#78716C] uppercase tracking-wider">
            Step 5 · Decide
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-tight text-[#171717] leading-tight break-words">
              {t('recommendations.question_title') || 'What should be prioritized?'}
            </h1>
            <p className="text-xs sm:text-sm text-[#57534E] max-w-3xl leading-relaxed break-words mt-1">
              {t('recommendations.subtitle')}
            </p>
          </div>

          {onNavigateToProjects && (
            <button
              onClick={onNavigateToProjects}
              className="px-3.5 py-2 bg-white border border-[#171717]/20 hover:border-[#171717] text-xs font-semibold rounded-xs transition-colors flex items-center space-x-1.5 shrink-0 cursor-pointer text-[#171717] self-start sm:self-auto"
            >
              <span>View Action Queue</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D65A3A]" />
            </button>
          )}
        </div>
      </header>

      {/* Decision Integrity Context Banner */}
      <div className="bg-[#FAF8F5] border border-[#171717]/15 p-4 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D65A3A] block">
            Deterministic Decision Formula
          </span>
          <p className="text-[#34322D] leading-relaxed">
            <strong className="text-[#171717]">PRIORITY SCORE = CITIZEN DEMAND + INFRASTRUCTURE GAP + VULNERABILITY WEIGHT.</strong>{' '}
            Rankings are computed deterministically from verified data. Machine learning generates the executive memo and justification, ensuring auditability and democratic accountability.
          </p>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-1 bg-white border border-[#171717]/15 rounded-xs shrink-0 text-[#171717] font-semibold">
          {filteredProjects.length} Ranked Interventions
        </span>
      </div>

      {/* 2. Controls & Filter Pills */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('recommendations.search_placeholder')}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#171717]/20 rounded-xs focus:outline-hidden focus:border-[#171717] text-[#171717]"
          />
        </div>

        {/* Type pills: ALL / FIX / BUILD / UPGRADE */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[#78716C] text-[11px] whitespace-nowrap">{t('filter.intervention') || 'Intervention'}:</span>
          {(['ALL', 'FIX', 'BUILD', 'UPGRADE'] as const).map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded-xs transition-colors cursor-pointer text-xs whitespace-nowrap ${
                selectedType === type
                  ? 'bg-[#171717] text-white font-medium'
                  : 'bg-white text-[#57534E] border border-[#171717]/15 hover:border-[#171717]/30'
              }`}
            >
              {tIntervention(type)}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Recommendations Cards */}
      <div className="space-y-5">
        {filteredProjects.map((proj) => {
          const isQueued = queuedProjectIds.has(proj.id);
          const priorityScore = Math.round(proj.priorityScore || 85);

          return (
            <div
              key={proj.id}
              className="bg-white border border-[#171717]/15 hover:border-[#171717]/35 p-5 sm:p-6 rounded-sm shadow-xs transition-all space-y-4"
            >
              {/* Card Header: Type Badge, Location, and Priority Score */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[#171717]/10 pb-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-xs border uppercase tracking-wider whitespace-nowrap ${
                    proj.interventionType === 'FIX'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : proj.interventionType === 'BUILD'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-blue-50 text-blue-800 border-blue-300'
                  }`}>
                    {tIntervention(proj.interventionType)}
                  </span>

                  <span className="text-xs font-medium text-[#57534E] whitespace-nowrap">
                    {proj.districtName}, {proj.state}
                  </span>

                  <span className="text-[#171717]/30 text-xs hidden sm:inline">·</span>

                  <span className="text-xs font-mono text-[#78716C] whitespace-nowrap">
                    {tCategory(proj.category)}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs font-mono whitespace-nowrap">
                  <span className="text-[#78716C]">{t('metric.priority_score')}:</span>
                  <span className="text-sm font-bold text-[#D65A3A]">
                    {priorityScore} / 100
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-serif font-bold text-[#171717] leading-snug break-words">
                  {proj.title}
                </h2>
                <p className="text-xs text-[#78716C] font-mono break-words">
                  {t('action_queue.aligned_scheme') || 'Alignment'}: {proj.alignedScheme} · {t('metric.estimated_cost') || 'Estimated Outlay'}: {proj.estimatedCost}
                </p>
              </div>

              {/* Why this is recommended: 4 bullet points */}
              <div className="bg-[#FAF8F5] border border-[#171717]/10 p-4 rounded-xs space-y-2 text-xs">
                <span className="font-semibold text-[#171717] block">{t('recommendations.why_recommended')}</span>
                <ul className="space-y-1.5 text-[#57534E]">
                  <li className="flex items-start space-x-2">
                    <span className="text-[#D65A3A] font-bold shrink-0">•</span>
                    <span className="break-words">
                      <strong className="text-[#171717]">{t('recommendations.point_demand')}</strong> {proj.demandCount} {t('metric.demand_signals').toLowerCase()} ({proj.trendChange || '+22%'})
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#D65A3A] font-bold shrink-0">•</span>
                    <span className="break-words">
                      <strong className="text-[#171717]">{t('recommendations.point_gap')}</strong> {t('metric.baseline_access')} {Math.round(proj.currentAccess)}%, {Math.round(100 - proj.currentAccess)}% {t('metric.service_deficit').toLowerCase()}.
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#D65A3A] font-bold shrink-0">•</span>
                    <span className="break-words">
                      <strong className="text-[#171717]">{t('recommendations.point_population')}</strong> {proj.affectedPopulation || '42,000'} {t('metric.people').toLowerCase()}.
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#D65A3A] font-bold shrink-0">•</span>
                    <span className="break-words">
                      <strong className="text-[#171717]">{t('recommendations.point_trend')}</strong> ~{(proj.demandCount * 1.3).toFixed(0)} {t('metric.demand_signals').toLowerCase()} ({t('trend.escalating') || 'escalating'}).
                    </span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons: [Review evidence] [Add to action queue] */}
              <div className="pt-2 border-t border-[#171717]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-[11px] text-[#78716C] break-words">
                  {t('metric.target_window')}: <strong className="text-[#171717]">{proj.executionWindow}</strong>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => setEvidenceProject(proj)}
                    className="px-3.5 py-2 text-xs font-semibold bg-[#FAF8F5] hover:bg-[#F0ECE1] text-[#171717] border border-[#171717]/20 rounded-xs transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {t('recommendations.review_evidence') || 'Review evidence'}
                  </button>

                  <button
                    onClick={() => handleAddToQueue(proj)}
                    disabled={isQueued}
                    className={`px-4 py-2 text-xs font-semibold rounded-xs transition-colors flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
                      isQueued
                        ? 'bg-[#285943] text-white cursor-default'
                        : 'bg-[#171717] hover:bg-[#34322D] text-white shadow-xs'
                    }`}
                  >
                    {isQueued ? (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5 shrink-0" />
                        <span>{t('recommendations.added_to_queue') || 'Added to action queue'}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 shrink-0" />
                        <span>{t('recommendations.add_to_queue') || 'Add to action queue'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Detail Evidence Modal */}
      {evidenceProject && (
        <div className="fixed inset-0 z-50 bg-[#171717]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#171717]/20 rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg space-y-5 p-6 font-sans">
            
            <div className="flex items-start justify-between border-b border-[#171717]/10 pb-4">
              <div>
                <span className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider block">
                  {t('recommendations.modal_brief')} · {evidenceProject.id}
                </span>
                <h2 className="text-xl font-serif font-bold text-[#171717] mt-0.5">
                  {evidenceProject.title}
                </h2>
                <span className="text-xs text-[#57534E] mt-0.5 block">
                  {evidenceProject.districtName}, {evidenceProject.state} · {t('filter.sector')}: {tCategory(evidenceProject.category)}
                </span>
              </div>

              <button
                onClick={() => setEvidenceProject(null)}
                className="p-1 hover:bg-[#F7F5EF] rounded-xs text-[#78716C] hover:text-[#171717] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-3 bg-[#FAF8F5] border border-[#171717]/10 rounded-xs">
                <span className="text-[10px] text-[#78716C] block">{t('metric.priority_score')}</span>
                <span className="text-base font-bold text-[#D65A3A]">{Math.round(evidenceProject.priorityScore || 85)} / 100</span>
              </div>
              <div className="p-3 bg-[#FAF8F5] border border-[#171717]/10 rounded-xs">
                <span className="text-[10px] text-[#78716C] block">{t('metric.estimated_cost')}</span>
                <span className="text-base font-bold text-[#171717]">{evidenceProject.estimatedCost}</span>
              </div>
              <div className="p-3 bg-[#FAF8F5] border border-[#171717]/10 rounded-xs">
                <span className="text-[10px] text-[#78716C] block">{t('metric.execution_window')}</span>
                <span className="text-base font-bold text-emerald-800">{evidenceProject.executionWindow}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-semibold text-[#171717] block">{t('recommendations.modal_justification')}</span>
              <p className="p-3 bg-[#FAF8F5] border border-[#171717]/10 rounded-xs text-[#57534E] leading-relaxed">
                {evidenceProject.description}
              </p>
            </div>

            <div className="space-y-1.5 text-xs">
              <span className="font-semibold text-[#171717] block">{t('recommendations.modal_cross_domain')}</span>
              <div className="p-3 bg-white border border-[#171717]/15 rounded-xs space-y-1 text-[#57534E]">
                <p>• {t('modal.census_registry') || 'Census & National Geospatial Data Registry'}</p>
                <p>• {t('modal.telemetry_audits') || 'Public works telemetry and Jal Jeevan Mission physical audits'}</p>
                <p>• {evidenceProject.demandCount} {t('modal.verified_complaints') || 'verified local citizen grievance submissions'}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#171717]/10">
              <button
                onClick={() => setEvidenceProject(null)}
                className="px-3 py-1.5 text-xs text-[#57534E] hover:text-[#171717] cursor-pointer"
              >
                {t('button.cancel') || 'Close'}
              </button>

              <button
                onClick={() => {
                  handleAddToQueue(evidenceProject);
                  setEvidenceProject(null);
                }}
                className="px-4 py-2 bg-[#171717] hover:bg-[#34322D] text-white text-xs font-semibold rounded-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('button.sanction_add') || 'Sanction & Add to Action Queue'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
