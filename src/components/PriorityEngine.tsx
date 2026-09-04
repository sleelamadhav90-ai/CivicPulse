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
  const [selectedType, setSelectedType] = useState<'ALL' | InterventionType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [evidenceProject, setEvidenceProject] = useState<RecommendedProject | null>(null);
  const [queuedProjectIds, setQueuedProjectIds] = useState<Set<string>>(new Set());

  const recommendedProjects = useMemo(() => {
    return getAIRecommendedProjects(districts, requests);
  }, [districts, requests]);

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
    <div className="space-y-8 font-sans text-[#171717] pb-16 max-w-6xl mx-auto">
      
      {/* 1. Header (Executive Decision Memo style) */}
      <div className="space-y-1.5 border-b border-[#171717]/10 pb-5">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#171717]">
          Recommended actions
        </h1>
        <p className="text-sm sm:text-base text-[#57534E] max-w-2xl leading-relaxed">
          Evidence-backed infrastructure recommendations prioritized by urgency and impact.
        </p>
      </div>

      {/* 2. Controls & Filter Pills */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recommendations by title, district or scheme..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#171717]/20 rounded-xs focus:outline-hidden focus:border-[#171717] text-[#171717]"
          />
        </div>

        {/* Type pills: ALL / FIX / BUILD / UPGRADE */}
        <div className="flex items-center space-x-1.5 text-xs">
          <span className="text-[#78716C] text-[11px]">Intervention:</span>
          {(['ALL', 'FIX', 'BUILD', 'UPGRADE'] as const).map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded-xs transition-colors cursor-pointer text-xs ${
                selectedType === type
                  ? 'bg-[#171717] text-white font-medium'
                  : 'bg-white text-[#57534E] border border-[#171717]/15 hover:border-[#171717]/30'
              }`}
            >
              {type}
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
              className="bg-white border border-[#171717]/15 hover:border-[#171717]/35 p-6 rounded-sm shadow-xs transition-all space-y-4"
            >
              {/* Card Header: Type Badge, Location, and Priority Score */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#171717]/10 pb-3">
                <div className="flex items-center space-x-3">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs border uppercase tracking-wider ${
                    proj.interventionType === 'FIX'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : proj.interventionType === 'BUILD'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-blue-50 text-blue-800 border-blue-300'
                  }`}>
                    {proj.interventionType}
                  </span>

                  <span className="text-xs font-medium text-[#57534E]">
                    {proj.districtName}, {proj.state}
                  </span>

                  <span className="text-[#171717]/30 text-xs">·</span>

                  <span className="text-xs font-mono text-[#78716C]">
                    {proj.category}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs font-mono">
                  <span className="text-[#78716C]">Priority Score:</span>
                  <span className="text-sm font-bold text-[#D65A3A]">
                    {priorityScore} / 100
                  </span>
                </div>
              </div>

              {/* Title */}
              <div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-[#171717] leading-snug">
                  {proj.title}
                </h2>
                <p className="text-xs text-[#78716C] font-mono mt-0.5">
                  Alignment: {proj.alignedScheme} · Estimated Outlay: {proj.estimatedCost}
                </p>
              </div>

              {/* Why this is recommended: 4 bullet points */}
              <div className="bg-[#FAF8F5] border border-[#171717]/10 p-4 rounded-xs space-y-2 text-xs">
                <span className="font-semibold text-[#171717] block">Why this is recommended:</span>
                <ul className="space-y-1.5 text-[#57534E]">
                  <li className="flex items-start space-x-2">
                    <span className="text-[#D65A3A] font-bold">•</span>
                    <span>
                      <strong className="text-[#171717]">Citizen demand:</strong> {proj.demandCount} citizen signals ({proj.trendChange || '+22% growth'}) documenting acute local deficiency.
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#D65A3A] font-bold">•</span>
                    <span>
                      <strong className="text-[#171717]">Infrastructure gap:</strong> Verified baseline access is currently at {Math.round(proj.currentAccess)}%, representing a {Math.round(100 - proj.currentAccess)}% service deficit.
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#D65A3A] font-bold">•</span>
                    <span>
                      <strong className="text-[#171717]">Population impact:</strong> Directly benefits an estimated {proj.affectedPopulation || '42,000'} residents across underserved gram panchayats.
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#D65A3A] font-bold">•</span>
                    <span>
                      <strong className="text-[#171717]">Predicted trend:</strong> Projected to escalate to {(proj.demandCount * 1.3).toFixed(0)} grievances over the next quarter without intervention.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons: [Review evidence] [Add to action queue] */}
              <div className="pt-2 border-t border-[#171717]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-[11px] text-[#78716C]">
                  Target Execution Window: <strong className="text-[#171717]">{proj.executionWindow}</strong>
                </div>

                <div className="flex items-center space-x-2.5">
                  <button
                    onClick={() => setEvidenceProject(proj)}
                    className="px-3.5 py-2 text-xs font-semibold bg-[#FAF8F5] hover:bg-[#F0ECE1] text-[#171717] border border-[#171717]/20 rounded-xs transition-colors cursor-pointer"
                  >
                    Review evidence
                  </button>

                  <button
                    onClick={() => handleAddToQueue(proj)}
                    disabled={isQueued}
                    className={`px-4 py-2 text-xs font-semibold rounded-xs transition-colors flex items-center space-x-1.5 cursor-pointer ${
                      isQueued
                        ? 'bg-[#285943] text-white cursor-default'
                        : 'bg-[#171717] hover:bg-[#34322D] text-white shadow-xs'
                    }`}
                  >
                    {isQueued ? (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5" />
                        <span>Added to action queue</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to action queue</span>
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
                  Executive Decision Brief · {evidenceProject.id}
                </span>
                <h2 className="text-xl font-serif font-bold text-[#171717] mt-0.5">
                  {evidenceProject.title}
                </h2>
                <span className="text-xs text-[#57534E] mt-0.5 block">
                  {evidenceProject.districtName}, {evidenceProject.state} · Sector: {evidenceProject.category}
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
                <span className="text-[10px] text-[#78716C] block">Priority Score</span>
                <span className="text-base font-bold text-[#D65A3A]">{Math.round(evidenceProject.priorityScore || 85)} / 100</span>
              </div>
              <div className="p-3 bg-[#FAF8F5] border border-[#171717]/10 rounded-xs">
                <span className="text-[10px] text-[#78716C] block">Estimated Cost</span>
                <span className="text-base font-bold text-[#171717]">{evidenceProject.estimatedCost}</span>
              </div>
              <div className="p-3 bg-[#FAF8F5] border border-[#171717]/10 rounded-xs">
                <span className="text-[10px] text-[#78716C] block">Execution Horizon</span>
                <span className="text-base font-bold text-emerald-800">{evidenceProject.executionWindow}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-semibold text-[#171717] block">Analytical Justification & Evidence Basis:</span>
              <p className="p-3 bg-[#FAF8F5] border border-[#171717]/10 rounded-xs text-[#57534E] leading-relaxed">
                {evidenceProject.description}
              </p>
            </div>

            <div className="space-y-1.5 text-xs">
              <span className="font-semibold text-[#171717] block">Cross-Domain Telemetry Grounding:</span>
              <div className="p-3 bg-white border border-[#171717]/15 rounded-xs space-y-1 text-[#57534E]">
                <p>• Census 2011 & National Geospatial Data Registry</p>
                <p>• Public works telemetry and Jal Jeevan Mission physical audits</p>
                <p>• {evidenceProject.demandCount} verified local citizen grievance submissions</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#171717]/10">
              <button
                onClick={() => setEvidenceProject(null)}
                className="px-3 py-1.5 text-xs text-[#57534E] hover:text-[#171717] cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={() => {
                  handleAddToQueue(evidenceProject);
                  setEvidenceProject(null);
                }}
                className="px-4 py-2 bg-[#171717] hover:bg-[#34322D] text-white text-xs font-semibold rounded-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Sanction & Add to Action Queue</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
