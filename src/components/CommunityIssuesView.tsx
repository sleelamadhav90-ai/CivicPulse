import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowRight, 
  Droplets, 
  Route, 
  HeartPulse, 
  Zap, 
  Search, 
  X, 
  Layers, 
  Building2, 
  CheckCircle2, 
  Sparkles,
  ArrowDown
} from 'lucide-react';
import { CitizenRequest, InfrastructureCategory, GovernmentProject } from '../types';

export interface CommunityIssue {
  id: string;
  rank: string;
  title: string;
  category: InfrastructureCategory;
  location: string;
  districtId: string;
  requestCount: number;
  trend: string;
  severity: 'Critical' | 'High' | 'Moderate';
  affectedCommunities: number;
  infrastructureName: string;
  relatedScheme: string;
  sampleRequests?: CitizenRequest[];
}

interface CommunityIssuesViewProps {
  requests: CitizenRequest[];
  governmentProjects: GovernmentProject[];
  onNavigateToRecommendations?: () => void;
}

export const INITIAL_COMMUNITY_ISSUES: CommunityIssue[] = [
  {
    id: 'ISSUE-WAT-001',
    rank: '01',
    title: 'Water access deficit & pipeline pressure collapse',
    category: 'Water',
    location: 'Guntur, Andhra Pradesh',
    districtId: 'guntur',
    requestCount: 742,
    trend: '+22% this month',
    severity: 'Critical',
    affectedCommunities: 14,
    infrastructureName: 'Overhead Tank & Trunk Feeder #4',
    relatedScheme: 'Jal Jeevan Mission (JJM)',
  },
  {
    id: 'ISSUE-RD-002',
    rank: '02',
    title: 'Arterial hospital access corridor craters & washouts',
    category: 'Roads',
    location: 'Patna, Bihar',
    districtId: 'dist-01',
    requestCount: 512,
    trend: '+18% this month',
    severity: 'High',
    affectedCommunities: 9,
    infrastructureName: 'MDR-44 Arterial Hospital Road',
    relatedScheme: 'PMGSY Rural Connectivity',
  },
  {
    id: 'ISSUE-HC-003',
    rank: '03',
    title: 'Primary health sub-centre staffing & drug shortages',
    category: 'Health',
    location: 'Nashik, Maharashtra',
    districtId: 'dist-04',
    requestCount: 389,
    trend: '+15% this month',
    severity: 'High',
    affectedCommunities: 7,
    infrastructureName: 'Rural PHC & Maternity Wing',
    relatedScheme: 'National Health Mission (NHM)',
  },
  {
    id: 'ISSUE-POW-004',
    rank: '04',
    title: 'Agricultural power transformer breakdown cycle',
    category: 'Electricity',
    location: 'Gaya, Bihar',
    districtId: 'dist-01',
    requestCount: 294,
    trend: '+29% this month',
    severity: 'Moderate',
    affectedCommunities: 11,
    infrastructureName: 'Sub-station 33/11kV Distribution Grid',
    relatedScheme: 'Revamped Distribution Sector Scheme',
  },
  {
    id: 'ISSUE-SAN-005',
    rank: '05',
    title: 'Stormwater culvert siltation & open drainage overflow',
    category: 'Drainage',
    location: 'Solapur, Maharashtra',
    districtId: 'dist-04',
    requestCount: 218,
    trend: '+11% this month',
    severity: 'Moderate',
    affectedCommunities: 5,
    infrastructureName: 'Municipal South Drain Trunk',
    relatedScheme: 'Swachh Bharat Mission (Urban)',
  },
];

export const CommunityIssuesView: React.FC<CommunityIssuesViewProps> = ({
  requests,
  governmentProjects,
  onNavigateToRecommendations,
}) => {
  const [issuesList, setIssuesList] = useState<CommunityIssue[]>(INITIAL_COMMUNITY_ISSUES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeIssueModal, setActiveIssueModal] = useState<CommunityIssue | null>(null);

  // Ingest custom citizen requests dynamically into issues list
  useEffect(() => {
    const custom = requests.filter(r => r.id.startsWith('CP-2026-'));
    if (custom.length > 0) {
      setIssuesList(prev => {
        const updated = [...prev];
        custom.forEach(req => {
          const matchIdx = updated.findIndex(iss => 
            iss.category === req.category && 
            iss.location.toLowerCase().includes(req.location.toLowerCase().split(',')[0].trim())
          );
          if (matchIdx >= 0) {
            const cur = updated[matchIdx];
            const already = cur.sampleRequests?.some(sr => sr.id === req.id);
            if (!already) {
              updated[matchIdx] = {
                ...cur,
                requestCount: cur.requestCount + 1,
                sampleRequests: [req, ...(cur.sampleRequests || [])],
              };
            }
          }
        });
        return updated;
      });
    }
  }, [requests]);

  const filteredIssues = useMemo(() => {
    return issuesList.filter(iss => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || 
        iss.title.toLowerCase().includes(q) ||
        iss.location.toLowerCase().includes(q) ||
        iss.category.toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'ALL' || iss.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [issuesList, searchQuery, selectedCategory]);

  return (
    <div className="space-y-10 font-sans text-[#171717] pb-16 max-w-6xl mx-auto">
      
      {/* 1. PAGE HEADER & AGGREGATION EXPLANATION */}
      <div className="space-y-6 border-b border-[#171717]/10 pb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#171717]">
            Community issues
          </h1>
          <p className="text-sm sm:text-base text-[#57534E] mt-1 max-w-2xl leading-relaxed">
            Individual reports become meaningful when many people describe the same underlying problem.
          </p>
        </div>

        {/* Simple visual flow: 2,841 requests -> 327 community issues -> 42 priority hotspots */}
        <div className="bg-white border border-[#171717]/15 p-5 rounded-sm shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            {/* Step 1 */}
            <div className="flex-1">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-[#171717] block">
                {requests.length.toLocaleString()}
              </span>
              <span className="text-xs text-[#57534E] font-medium block mt-0.5">
                individual requests
              </span>
              <span className="text-[11px] text-[#78716C] block">
                Raw citizen voice & text notes
              </span>
            </div>

            <div className="text-[#78716C] px-2 shrink-0">
              <span className="hidden sm:inline text-lg font-mono">→</span>
              <ArrowDown className="sm:hidden w-4 h-4 text-[#78716C] my-1" />
            </div>

            {/* Step 2 */}
            <div className="flex-1">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-[#D65A3A] block">
                327
              </span>
              <span className="text-xs text-[#57534E] font-medium block mt-0.5">
                community issues
              </span>
              <span className="text-[11px] text-[#78716C] block">
                Clustered by locality & failure type
              </span>
            </div>

            <div className="text-[#78716C] px-2 shrink-0">
              <span className="hidden sm:inline text-lg font-mono">→</span>
              <ArrowDown className="sm:hidden w-4 h-4 text-[#78716C] my-1" />
            </div>

            {/* Step 3 */}
            <div className="flex-1">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-[#171717] block">
                42
              </span>
              <span className="text-xs text-[#57534E] font-medium block mt-0.5">
                priority hotspots
              </span>
              <span className="text-[11px] text-[#78716C] block">
                Cross-referenced with asset audits
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & CONTROLS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter community issues by location, title or keyword..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#171717]/20 rounded-xs focus:outline-hidden focus:border-[#171717] text-[#171717]"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-[#78716C] text-[11px]">Sector:</span>
          {['ALL', 'Water', 'Roads', 'Health', 'Electricity'].map((cat) => (
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

      {/* 3. CLEAN RANKED LIST */}
      <div className="space-y-3">
        {filteredIssues.map((issue) => (
          <div
            key={issue.id}
            className="bg-white border border-[#171717]/15 hover:border-[#171717]/35 p-5 rounded-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start space-x-4">
              <span className="font-mono text-base font-bold text-[#78716C] shrink-0 pt-0.5">
                {issue.rank}
              </span>

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono font-bold text-[#D65A3A] uppercase tracking-wider">
                    {issue.category}
                  </span>
                  <span className="text-[#171717]/30 text-xs">·</span>
                  <span className="text-xs font-medium text-[#57534E]">
                    {issue.location}
                  </span>
                </div>

                <h3 className="text-base font-serif font-bold text-[#171717]">
                  {issue.title}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#57534E] pt-0.5">
                  <span className="font-mono font-semibold text-[#171717]">
                    {issue.requestCount} related requests
                  </span>
                  <span className="text-[#171717]/30">·</span>
                  <span className={`font-medium ${
                    issue.severity === 'Critical' ? 'text-[#D65A3A]' : 'text-amber-800'
                  }`}>
                    {issue.severity} severity
                  </span>
                  <span className="text-[#171717]/30">·</span>
                  <span className="text-emerald-800 font-mono text-[11px]">
                    {issue.trend}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#171717]/10">
              <button
                onClick={() => setActiveIssueModal(issue)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-[#FAF8F5] hover:bg-[#F0ECE1] text-[#171717] border border-[#171717]/20 rounded-xs transition-colors cursor-pointer"
              >
                Explore
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {activeIssueModal && (
        <div className="fixed inset-0 z-50 bg-[#171717]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#171717]/20 rounded-sm w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-lg space-y-5 p-6 font-sans">
            
            <div className="flex items-start justify-between border-b border-[#171717]/10 pb-4">
              <div>
                <span className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider block">
                  Community Issue Cluster · {activeIssueModal.id}
                </span>
                <h2 className="text-xl font-serif font-bold text-[#171717] mt-0.5">
                  {activeIssueModal.title}
                </h2>
                <span className="text-xs text-[#57534E] mt-0.5 block">
                  {activeIssueModal.location}
                </span>
              </div>

              <button
                onClick={() => setActiveIssueModal(null)}
                className="p-1 hover:bg-[#F7F5EF] rounded-xs text-[#78716C] hover:text-[#171717] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-3 bg-[#FAF8F5] border border-[#171717]/10 rounded-xs">
                <span className="text-[10px] text-[#78716C] block">Citizen Signals</span>
                <span className="text-base font-bold text-[#171717]">{activeIssueModal.requestCount}</span>
              </div>
              <div className="p-3 bg-[#FAF8F5] border border-[#171717]/10 rounded-xs">
                <span className="text-[10px] text-[#78716C] block">Severity</span>
                <span className="text-base font-bold text-[#D65A3A]">{activeIssueModal.severity}</span>
              </div>
              <div className="p-3 bg-[#FAF8F5] border border-[#171717]/10 rounded-xs">
                <span className="text-[10px] text-[#78716C] block">Monthly Demand</span>
                <span className="text-base font-bold text-emerald-800">{activeIssueModal.trend}</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="font-semibold text-[#171717] block">Underlying Public Asset:</span>
              <p className="p-3 bg-[#FAF8F5] border border-[#171717]/10 rounded-xs text-[#57534E]">
                {activeIssueModal.infrastructureName} · Aligned with {activeIssueModal.relatedScheme}
              </p>
            </div>

            {activeIssueModal.sampleRequests && activeIssueModal.sampleRequests.length > 0 && (
              <div className="space-y-1.5 text-xs">
                <span className="font-semibold text-[#171717] block">Recently ingested citizen signals ({activeIssueModal.sampleRequests.length}):</span>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {activeIssueModal.sampleRequests.map(sr => (
                    <div key={sr.id} className="p-2.5 bg-white border border-[#171717]/10 rounded-xs text-[11px] text-[#57534E]">
                      <div className="flex justify-between font-mono text-[10px] text-[#78716C] mb-0.5">
                        <span>{sr.id}</span>
                        <span>{sr.location}</span>
                      </div>
                      <p className="italic">"{sr.summary_en || sr.original_text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-[#171717]/10">
              <button
                onClick={() => setActiveIssueModal(null)}
                className="px-3 py-1.5 text-xs text-[#57534E] hover:text-[#171717] cursor-pointer"
              >
                Close
              </button>

              {onNavigateToRecommendations && (
                <button
                  onClick={() => {
                    setActiveIssueModal(null);
                    onNavigateToRecommendations();
                  }}
                  className="px-4 py-2 bg-[#171717] hover:bg-[#34322D] text-white text-xs font-semibold rounded-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>View official recommendation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
