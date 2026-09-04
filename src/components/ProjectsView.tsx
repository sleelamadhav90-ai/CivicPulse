import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  X, 
  Building2, 
  SlidersHorizontal,
  Table as TableIcon,
  Columns as KanbanIcon
} from 'lucide-react';
import { District, InfrastructureCategory, GovernmentProject, ProjectLifecycleStatus } from '../types';
import { getAIRecommendedProjects } from '../utils/scoring';

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
  onNavigateToEngine,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<GovernmentProject | null>(null);

  // Normalize projects to the 5 requested stages
  const activeProjects = useMemo(() => {
    const list = projects.length > 0 ? projects : getAIRecommendedProjects(districts, []).map((rec, idx) => ({
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
      progress: idx === 0 ? 30 : idx === 1 ? 65 : 10,
      department: 'Public Works & Municipal Administration',
      officerInCharge: 'Chief Project Director',
      startDate: 'Q1 2026',
      targetDate: 'Q4 2026',
      beforeAccess: 45,
      afterAccess: 90,
      description: rec.aiRecommendation,
      keyReasoning: rec.keyBulletPoints,
      aiSummary: rec.summaryReasoning,
      sourceRecommendationId: rec.id,
      history: [],
    }));

    return list.map((p, idx) => {
      // Map existing status to one of the 5 requested columns
      let stage: ActionStage = 'In Progress';
      if (p.status === 'Completed' || p.progress === 100) stage = 'Completed';
      else if (p.status === 'In Progress') stage = 'In Progress';
      else if (p.status === 'Approved') stage = 'Approved';
      else if (idx % 2 === 0) stage = 'Under Review';
      else stage = 'Proposed';

      return {
        ...p,
        stage,
        formattedBudget: p.estimatedCostInr ? `₹${(p.estimatedCostInr / 10000000).toFixed(1)} Cr` : '₹12.4 Cr',
        departmentName: p.department || 'Public Works & Municipal Engineering',
      };
    });
  }, [projects, districts]);

  const filteredProjects = useMemo(() => {
    return activeProjects.filter(p => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        p.title.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.departmentName.toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [activeProjects, searchQuery, selectedCategory]);

  return (
    <div className="space-y-8 font-sans text-[#171717] pb-16 max-w-6xl mx-auto">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#171717]/10 pb-5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#171717]">
            Action queue
          </h1>
          <p className="text-sm text-[#57534E] mt-1">
            Tracking what administrative officials and engineering divisions are actively executing.
          </p>
        </div>

        {/* View Toggle (Table vs Kanban) */}
        <div className="flex items-center space-x-1 bg-white border border-[#171717]/15 p-1 rounded-xs">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 text-xs font-medium rounded-xs flex items-center space-x-1.5 transition-colors cursor-pointer ${
              viewMode === 'table'
                ? 'bg-[#171717] text-white font-semibold'
                : 'text-[#57534E] hover:text-[#171717]'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1 text-xs font-medium rounded-xs flex items-center space-x-1.5 transition-colors cursor-pointer ${
              viewMode === 'kanban'
                ? 'bg-[#171717] text-white font-semibold'
                : 'text-[#57534E] hover:text-[#171717]'
            }`}
          >
            <KanbanIcon className="w-3.5 h-3.5" />
            <span>Kanban</span>
          </button>
        </div>
      </div>

      {/* 2. Controls & Sector filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, departments or districts..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#171717]/20 rounded-xs focus:outline-hidden focus:border-[#171717] text-[#171717]"
          />
        </div>

        <div className="flex items-center space-x-1 text-xs">
          <span className="text-[#78716C] text-[11px] mr-1">Sector:</span>
          {['All', 'Water', 'Roads', 'Health', 'Electricity'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-xs transition-colors cursor-pointer text-xs ${
                selectedCategory === cat
                  ? 'bg-[#171717] text-white font-medium'
                  : 'bg-white text-[#57534E] border border-[#171717]/15 hover:border-[#171717]/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white border border-[#171717]/15 rounded-sm overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#171717]/10 bg-[#FAF8F5] text-[#78716C] font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-4 font-semibold">Project Name</th>
                  <th className="py-2.5 px-3 font-semibold">District</th>
                  <th className="py-2.5 px-3 font-semibold">Department</th>
                  <th className="py-2.5 px-3 font-semibold">Budget</th>
                  <th className="py-2.5 px-4 font-semibold">Progress</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#171717]/10">
                {filteredProjects.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedProject(p)}
                    className="hover:bg-[#FAF8F5] cursor-pointer transition-colors group"
                  >
                    {/* Project name */}
                    <td className="py-3 px-4 max-w-sm">
                      <div className="font-medium text-[#171717] group-hover:text-[#D65A3A] transition-colors leading-snug">
                        {p.title}
                      </div>
                      <div className="text-[10px] font-mono text-[#78716C] mt-0.5">
                        {p.id} · {p.category}
                      </div>
                    </td>

                    {/* District */}
                    <td className="py-3 px-3 text-[#57534E] whitespace-nowrap">
                      {p.district}, {p.state}
                    </td>

                    {/* Department */}
                    <td className="py-3 px-3 text-[#57534E] max-w-xs truncate">
                      {p.departmentName}
                    </td>

                    {/* Budget */}
                    <td className="py-3 px-3 font-mono font-medium text-[#171717] whitespace-nowrap">
                      {p.formattedBudget}
                    </td>

                    {/* Progress */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="w-28 space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-[#78716C]">
                          <span>{p.progress || 25}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#E8E6DF] rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${p.progress && p.progress >= 90 ? 'bg-[#285943]' : 'bg-[#D65A3A]'}`}
                            style={{ width: `${p.progress || 25}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-medium border ${
                        p.stage === 'Completed'
                          ? 'bg-[#285943]/10 text-[#285943] border-[#285943]/20'
                          : p.stage === 'In Progress'
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : p.stage === 'Approved'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : p.stage === 'Under Review'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-[#F7F5EF] text-[#57534E] border-[#171717]/15'
                      }`}>
                        {p.stage}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. KANBAN VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {ACTION_STAGES.map((stage) => {
            const stageProjects = filteredProjects.filter(p => p.stage === stage);
            return (
              <div key={stage} className="bg-[#FAF8F5] border border-[#171717]/15 rounded-xs p-3 space-y-3">
                <div className="flex items-center justify-between border-b border-[#171717]/10 pb-2">
                  <span className="text-[11px] font-mono font-bold text-[#171717] uppercase">
                    {stage}
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
                      <span className="text-[9px] font-mono text-[#D65A3A] uppercase font-bold block">
                        {p.category}
                      </span>
                      <h4 className="text-xs font-serif font-bold text-[#171717] leading-snug">
                        {p.title}
                      </h4>
                      <div className="text-[10px] text-[#57534E]">
                        {p.district}, {p.state}
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-[#171717]/10 text-[10px] font-mono">
                        <span className="text-[#171717] font-bold">{p.formattedBudget}</span>
                        <span className="text-[#78716C]">{p.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-[#171717]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#171717]/20 rounded-sm w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-lg space-y-5 p-6 font-sans">
            
            <div className="flex items-start justify-between border-b border-[#171717]/10 pb-4">
              <div>
                <span className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider block">
                  Action Queue Item · {selectedProject.id}
                </span>
                <h2 className="text-xl font-serif font-bold text-[#171717] mt-0.5">
                  {selectedProject.title}
                </h2>
                <span className="text-xs text-[#57534E] mt-0.5 block">
                  {selectedProject.district}, {selectedProject.state} · Department: {selectedProject.departmentName}
                </span>
              </div>

              <button
                onClick={() => setSelectedProject(null)}
                className="p-1 hover:bg-[#F7F5EF] rounded-xs text-[#78716C] hover:text-[#171717] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-3 bg-[#FAF8F5] border border-[#171717]/10 rounded-xs">
                <span className="text-[10px] text-[#78716C] block">Budget</span>
                <span className="text-base font-bold text-[#171717]">{selectedProject.formattedBudget}</span>
              </div>
              <div className="p-3 bg-[#FAF8F5] border border-[#171717]/10 rounded-xs">
                <span className="text-[10px] text-[#78716C] block">Status</span>
                <span className="text-base font-bold text-[#D65A3A]">{selectedProject.stage}</span>
              </div>
              <div className="p-3 bg-[#FAF8F5] border border-[#171717]/10 rounded-xs">
                <span className="text-[10px] text-[#78716C] block">Progress</span>
                <span className="text-base font-bold text-[#285943]">{selectedProject.progress || 25}%</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="font-semibold text-[#171717] block">Administrative Scope & Description:</span>
              <p className="p-3 bg-[#FAF8F5] border border-[#171717]/10 rounded-xs text-[#57534E] leading-relaxed">
                {selectedProject.description || 'Targeted infrastructure engineering response sanctioned under municipal priority allocation.'}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#171717]/10">
              <span className="text-xs font-semibold text-[#171717] block">Update Status:</span>
              <div className="flex flex-wrap gap-1.5">
                {(['Approved', 'In Progress', 'Completed'] as ProjectLifecycleStatus[]).map(st => (
                  <button
                    key={st}
                    onClick={() => {
                      onUpdateProjectStatus(selectedProject.id, st);
                      setSelectedProject(null);
                    }}
                    className="px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#171717] hover:text-white text-[#171717] border border-[#171717]/20 text-xs font-medium rounded-xs transition-colors cursor-pointer"
                  >
                    Mark as {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-[#171717]/10">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 bg-[#171717] text-white text-xs font-semibold rounded-xs cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
