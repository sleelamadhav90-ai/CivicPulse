import React, { useState } from 'react';
import { 
  Cpu, 
  Layers, 
  MapPin, 
  Volume2, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Filter, 
  Combine, 
  Split, 
  ShieldCheck, 
  DollarSign, 
  Building2, 
  MessageSquare,
  FileText,
  Clock,
  Zap,
  Tag
} from 'lucide-react';
import { CitizenRequest, InfrastructureCategory, GovernmentProject } from '../types';

export interface CommunityIssue {
  id: string;
  title: string;
  category: InfrastructureCategory;
  location: string;
  districtId: string;
  requestCount: number;
  affectedCommunitiesCount: number;
  languagesRepresented: string[];
  trendLabel: string; // e.g. "+38% over 3 weeks"
  severityScore: number; // 1-10
  confidencePct: number; // 0-100
  relatedInfrastructureName: string;
  relatedInfrastructureCondition: string;
  relatedInvestmentInr: number; // e.g. 390000000 (₹39 Cr)
  relatedSchemeName: string;
  aiVerified: boolean;
  sampleRequests: CitizenRequest[];
}

interface CommunityIssuesViewProps {
  requests: CitizenRequest[];
  governmentProjects: GovernmentProject[];
  onNavigateToRecommendations?: () => void;
}

export const INITIAL_COMMUNITY_ISSUES: CommunityIssue[] = [
  {
    id: 'ISSUE-WAT-001',
    title: '3-Day Pipeline Failure & Severe Drinking Water Outage',
    category: 'Water',
    location: 'Tadepalle & Mangalagiri Rural Ward 9 & 12',
    districtId: 'guntur',
    requestCount: 1842,
    affectedCommunitiesCount: 12,
    languagesRepresented: ['Telugu', 'Hindi', 'English'],
    trendLabel: '+42% over 2 weeks',
    severityScore: 9,
    confidencePct: 96,
    relatedInfrastructureName: 'Overhead Water Tank & Pumping Station #3',
    relatedInfrastructureCondition: '🔴 Critical (34% leakage)',
    relatedInvestmentInr: 390000000,
    relatedSchemeName: 'Jal Jeevan Mission (JJM)',
    aiVerified: true,
    sampleRequests: []
  },
  {
    id: 'ISSUE-HC-002',
    title: 'Primary Health Centre Staff Absentees & Vaccine Shortage',
    category: 'Health',
    location: 'Mylavaram Rural Block B',
    districtId: 'guntur',
    requestCount: 420,
    affectedCommunitiesCount: 8,
    languagesRepresented: ['Telugu', 'English'],
    trendLabel: '+18% over 1 month',
    severityScore: 8,
    confidencePct: 91,
    relatedInfrastructureName: 'Mylavaram Sub-Centre Hospital',
    relatedInfrastructureCondition: '🔴 Critical (Doctor absent 4 days/wk)',
    relatedInvestmentInr: 120000000,
    relatedSchemeName: 'National Health Mission (NHM)',
    aiVerified: true,
    sampleRequests: []
  },
  {
    id: 'ISSUE-RD-003',
    title: 'Arterial Corridor Pothole Craters & Ambulance Delays',
    category: 'Roads',
    location: 'Mangalagiri Corridor MDR-44',
    districtId: 'guntur',
    requestCount: 310,
    affectedCommunitiesCount: 15,
    languagesRepresented: ['Telugu', 'Marathi', 'Hindi'],
    trendLabel: '+31% post-monsoon',
    severityScore: 8,
    confidencePct: 94,
    relatedInfrastructureName: 'MDR-44 Arterial Hospital Access Road',
    relatedInfrastructureCondition: '⚠️ Damaged (48 major craters)',
    relatedInvestmentInr: 250000000,
    relatedSchemeName: 'PMGSY Rural Roads',
    aiVerified: true,
    sampleRequests: []
  },
  {
    id: 'ISSUE-DRN-004',
    title: 'Stormwater Drain Silt Blockage & Open Sewage Overflow',
    category: 'Drainage',
    location: 'Vijayawada Municipal Ward 4',
    districtId: 'vijayawada',
    requestCount: 268,
    affectedCommunitiesCount: 6,
    languagesRepresented: ['Telugu', 'Hindi'],
    trendLabel: '+55% during monsoon rain',
    severityScore: 9,
    confidencePct: 98,
    relatedInfrastructureName: 'Main Municipal Stormwater Outfall Drain',
    relatedInfrastructureCondition: '🔴 Critical (70% silt blockage)',
    relatedInvestmentInr: 85000000,
    relatedSchemeName: 'Swachh Bharat Urban Drainage',
    aiVerified: true,
    sampleRequests: []
  }
];

export const CommunityIssuesView: React.FC<CommunityIssuesViewProps> = ({
  requests,
  governmentProjects,
  onNavigateToRecommendations
}) => {
  const [issuesList, setIssuesList] = useState<CommunityIssue[]>(INITIAL_COMMUNITY_ISSUES);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalIssue, setActiveModalIssue] = useState<CommunityIssue | null>(null);
  const [modalMode, setModalMode] = useState<'evidence' | 'requests' | 'merge' | 'split' | null>(null);
  const [selectedIssueIdsForMerge, setSelectedIssueIdsForMerge] = useState<string[]>([]);

  const filteredIssues = issuesList.filter(issue => {
    const matchesCategory = selectedCategory === 'ALL' || issue.category === selectedCategory;
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.relatedInfrastructureName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalRawRequestsAggregated = 2841;
  const totalCommunityIssuesCount = 327;
  const totalMajorHotspotsCount = 42;

  const handleVerifyAI = (issueId: string) => {
    setIssuesList(prev => prev.map(item => {
      if (item.id === issueId) {
        return { ...item, aiVerified: !item.aiVerified };
      }
      return item;
    }));
  };

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-12">
      {/* Official Header */}
      <div className="bg-slate-900 text-white p-5 border-b-2 border-slate-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-700 text-white text-[10px] font-mono font-bold px-2 py-0.5 tracking-wider uppercase">
              STAGE 2: ISSUE AGGREGATION
            </span>
            <span className="text-slate-400 text-xs font-mono">
              • Semantic Clustering & Hotspot Synthesis
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white mt-1">
            Community-Level Issues & Hotspots
          </h1>
          <p className="text-xs text-slate-300 mt-0.5 max-w-3xl">
            Aggregates thousands of raw citizen signals into distinct community issues. Enables municipal officials to inspect underlying evidence, merge/split clusters, and verify AI classification.
          </p>
        </div>

        {onNavigateToRecommendations && (
          <button
            onClick={onNavigateToRecommendations}
            className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium px-4 py-2 transition-colors flex items-center gap-1.5 cursor-pointer border border-blue-600 font-mono shrink-0"
          >
            <span>Proceed to AI Recommendations</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 3-Step Aggregation Funnel Banner */}
      <div className="bg-white border border-slate-300 p-4 shadow-xs font-mono text-xs">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
          AGGREGATION FUNNEL ARCHITECTURE
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Raw Ingested Signals</span>
              <span className="text-base font-bold text-slate-900">{totalRawRequestsAggregated.toLocaleString()} Requests</span>
            </div>
            <MessageSquare className="w-5 h-5 text-slate-400" />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-blue-800 uppercase block">Clustered Issues</span>
              <span className="text-base font-bold text-blue-950">{totalCommunityIssuesCount} Community Issues</span>
            </div>
            <Layers className="w-5 h-5 text-blue-700" />
          </div>

          <div className="p-3 bg-red-50 border border-red-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-red-800 uppercase block font-bold">Critical Action Hotspots</span>
              <span className="text-base font-bold text-red-950">{totalMajorHotspotsCount} Priority Hotspots</span>
            </div>
            <AlertTriangle className="w-5 h-5 text-red-700" />
          </div>
        </div>
      </div>

      {/* Primary Question Banner */}
      <div className="bg-slate-100 border border-slate-300 p-3.5 text-xs text-slate-800 flex items-center justify-between font-mono">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-blue-900">PRIMARY QUESTION:</span>
          <span>"What systemic community issues emerge when thousands of individual requests are grouped by proximity & category?"</span>
        </div>
        <span className="text-[11px] text-slate-600 font-bold">
          4 Active Major Hotspots Listed
        </span>
      </div>

      {/* Search & Category Toolbar */}
      <div className="bg-white border border-slate-300 p-3 flex flex-col md:flex-row items-center justify-between gap-3 font-mono text-xs shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search issue title, location, or infrastructure..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-700"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-bold uppercase text-[10px]">Filter Sector:</span>
          {['ALL', 'Water', 'Health', 'Roads', 'Drainage'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-[11px] border cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white border-slate-900 font-bold'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Community Issues List */}
      <div className="space-y-4">
        {filteredIssues.map((issue) => (
          <div key={issue.id} className="bg-white border border-slate-300 p-5 shadow-xs space-y-4 font-sans hover:border-slate-400 transition-colors">
            {/* Card Top Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 font-mono text-xs">
                  <span className="font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5">
                    {issue.id}
                  </span>
                  <span className="bg-slate-900 text-white font-bold px-2 py-0.5 text-[10px] uppercase">
                    {issue.category}
                  </span>
                  <span className="text-slate-600 font-bold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {issue.location}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {issue.title}
                </h3>
              </div>

              {/* Status & Verification Badge */}
              <div className="flex items-center space-x-3 font-mono text-xs shrink-0">
                <button
                  onClick={() => handleVerifyAI(issue.id)}
                  className={`px-2.5 py-1 border font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                    issue.aiVerified 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  }`}
                  title="Click to toggle official AI classification verification"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>{issue.aiVerified ? 'AI Verified' : 'Unverified AI'}</span>
                </button>

                <span className={`px-2.5 py-1 border font-bold ${
                  issue.severityScore >= 8 ? 'bg-red-50 text-red-800 border-red-300' : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}>
                  Severity {issue.severityScore}/10
                </span>
              </div>
            </div>

            {/* Metrics Breakdown Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs bg-slate-50 p-3 border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Citizen Requests</span>
                <span className="text-sm font-bold text-slate-900">{issue.requestCount.toLocaleString()} signals</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Communities Affected</span>
                <span className="text-sm font-bold text-slate-900">{issue.affectedCommunitiesCount} villages / wards</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Languages Represented</span>
                <span className="text-xs font-bold text-slate-900">{issue.languagesRepresented.join(', ')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Trend / Velocity</span>
                <span className="text-xs font-bold text-red-700">{issue.trendLabel}</span>
              </div>
            </div>

            {/* Related Infrastructure & Investment Evidence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  RELATED INFRASTRUCTURE FACILITY
                </span>
                <div className="font-bold text-slate-900">{issue.relatedInfrastructureName}</div>
                <div className="text-[11px] text-slate-600">Condition: {issue.relatedInfrastructureCondition}</div>
              </div>

              <div className="p-3 bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  EXISTING GOVERNMENT INVESTMENT CONTEXT
                </span>
                <div className="font-bold text-slate-900">
                  ₹{(issue.relatedInvestmentInr / 10000000).toFixed(1)} Cr Allocated ({issue.relatedSchemeName})
                </div>
                <div className="text-[11px] text-amber-700 font-bold">
                  ⚠️ Audit Warning: High expenditure but zero outage resolution
                </div>
              </div>
            </div>

            {/* Action Bar (View Evidence, View Requests, Merge, Split) */}
            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => { setActiveModalIssue(issue); setModalMode('evidence'); }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-3 py-1.5 border border-slate-300 cursor-pointer flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>View Evidence (12)</span>
                </button>

                <button
                  onClick={() => { setActiveModalIssue(issue); setModalMode('requests'); }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-3 py-1.5 border border-slate-300 cursor-pointer flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
                  <span>View Individual Requests ({issue.requestCount})</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => { setActiveModalIssue(issue); setModalMode('merge'); }}
                  className="bg-white hover:bg-slate-100 text-slate-800 font-medium px-2.5 py-1.5 border border-slate-300 cursor-pointer flex items-center gap-1 text-[11px]"
                >
                  <Combine className="w-3.5 h-3.5 text-blue-700" />
                  <span>Merge Issue</span>
                </button>

                <button
                  onClick={() => { setActiveModalIssue(issue); setModalMode('split'); }}
                  className="bg-white hover:bg-slate-100 text-slate-800 font-medium px-2.5 py-1.5 border border-slate-300 cursor-pointer flex items-center gap-1 text-[11px]"
                >
                  <Split className="w-3.5 h-3.5 text-amber-700" />
                  <span>Split Issue</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Dialog for Evidence / Requests / Merge / Split */}
      {activeModalIssue && modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border-2 border-slate-800 shadow-xl max-w-2xl w-full p-6 space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-300 pb-3 font-mono">
              <div>
                <span className="text-xs text-blue-900 font-bold uppercase">
                  {modalMode === 'evidence' && '📋 Citizen & Infrastructure Evidence Pack'}
                  {modalMode === 'requests' && '💬 Individual Citizen Request Stream'}
                  {modalMode === 'merge' && '🔀 Merge Duplicate Issues'}
                  {modalMode === 'split' && '✂️ Split Issue Clusters'}
                </span>
                <h3 className="text-base font-bold text-slate-900">{activeModalIssue.title}</h3>
              </div>
              <button
                onClick={() => { setActiveModalIssue(null); setModalMode(null); }}
                className="text-slate-500 hover:text-slate-900 text-sm font-bold border border-slate-300 px-2 py-1"
              >
                Close ✕
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-96 overflow-y-auto">
              {modalMode === 'evidence' && (
                <div className="space-y-2 font-mono">
                  <div className="p-3 bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900">EVIDENCE ITEM 1: Voice Recording Audio Evidence</span>
                    <p className="text-slate-700 font-sans italic">"మా గ్రామంలో మూడు రోజులుగా తాగునీటి సరఫరా పూర్తిగా నిలిచిపోయింది..."</p>
                    <div className="text-[11px] text-slate-500">Language: Telugu | Source: Voice Telephony | Confidence: 96%</div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900">EVIDENCE ITEM 2: Infrastructure Inspector Telemetry Audit</span>
                    <p className="text-slate-700 font-sans">Water Tank #3 main pump impellers rusted; pipeline leakage measured at 34%.</p>
                  </div>
                </div>
              )}

              {modalMode === 'requests' && (
                <div className="space-y-2">
                  <p className="text-slate-600 font-mono text-[11px]">
                    Showing sample citizen signals that were aggregated into this issue cluster:
                  </p>
                  {requests.slice(0, 3).map((req) => (
                    <div key={req.id} className="p-3 bg-slate-50 border border-slate-200 space-y-1 font-mono">
                      <div className="flex justify-between font-bold text-blue-900 text-[11px]">
                        <span>{req.id} • {req.location}</span>
                        <span>{req.language}</span>
                      </div>
                      <p className="font-sans text-slate-900">{req.summary_en}</p>
                    </div>
                  ))}
                </div>
              )}

              {modalMode === 'merge' && (
                <div className="space-y-3 font-mono">
                  <p className="text-slate-700 font-sans">
                    Select another issue from Guntur to merge with <strong>{activeModalIssue.title}</strong> into a single combined incident record:
                  </p>
                  <div className="p-3 border border-slate-200 bg-slate-50 space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-blue-700" defaultChecked />
                      <span className="font-bold text-slate-900">ISSUE-WAT-002: Pipe leakage at Mangalagiri Sector 4</span>
                    </label>
                  </div>
                </div>
              )}

              {modalMode === 'split' && (
                <div className="space-y-3 font-mono">
                  <p className="text-slate-700 font-sans">
                    Specify parameters to split this cluster into two distinct sub-issues:
                  </p>
                  <div className="space-y-2">
                    <label className="block text-slate-700 font-bold">Sub-Issue 1 Target Village:</label>
                    <input type="text" defaultValue="Tadepalle Ward 9" className="w-full p-2 bg-slate-50 border border-slate-300 text-xs" />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-300 flex justify-end font-mono text-xs gap-2">
              <button
                onClick={() => { setActiveModalIssue(null); setModalMode(null); }}
                className="bg-slate-200 text-slate-800 font-bold px-4 py-2 hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => { setActiveModalIssue(null); setModalMode(null); }}
                className="bg-slate-900 text-white font-bold px-4 py-2 hover:bg-slate-800"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
