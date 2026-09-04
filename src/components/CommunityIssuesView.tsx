import React, { useState } from 'react';
import { 
  Layers, 
  MapPin, 
  Search, 
  ArrowRight, 
  Droplets,
  Route,
  HeartPulse,
  Filter, 
  Combine, 
  Split, 
  ShieldCheck, 
  DollarSign, 
  Building2, 
  MessageSquare,
  FileText,
  TrendingUp,
  AlertTriangle,
  Info
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
  trendLabel: string;
  severityScore: number;
  confidencePct: number;
  relatedInfrastructureName: string;
  relatedInfrastructureCondition: string;
  relatedInvestmentInr: number;
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
    location: 'Gaya, Bihar (Tadepalle & Ward 9)',
    districtId: 'dist-01',
    requestCount: 1842,
    affectedCommunitiesCount: 12,
    languagesRepresented: ['Telugu', 'Hindi', 'English'],
    trendLabel: '↑ 37% over 2 weeks',
    severityScore: 9,
    confidencePct: 96,
    relatedInfrastructureName: 'Overhead Water Tank & Pumping Station #3',
    relatedInfrastructureCondition: 'Critical (34% leakage)',
    relatedInvestmentInr: 390000000,
    relatedSchemeName: 'Jal Jeevan Mission (JJM)',
    aiVerified: true,
    sampleRequests: []
  },
  {
    id: 'ISSUE-RD-002',
    title: 'Arterial Corridor Potholes & Emergency Access Delays',
    category: 'Roads',
    location: 'Pune & Solapur Corridor MDR-44',
    districtId: 'dist-04',
    requestCount: 684,
    affectedCommunitiesCount: 8,
    languagesRepresented: ['Marathi', 'Hindi'],
    trendLabel: '↑ 21% post-monsoon',
    severityScore: 8,
    confidencePct: 94,
    relatedInfrastructureName: 'MDR-44 Arterial Hospital Access Road',
    relatedInfrastructureCondition: 'Damaged (48 major craters)',
    relatedInvestmentInr: 250000000,
    relatedSchemeName: 'PMGSY Rural Roads',
    aiVerified: true,
    sampleRequests: []
  },
  {
    id: 'ISSUE-HC-003',
    title: 'Primary Health Centre Staff Absentees & Solar Power Outages',
    category: 'Health',
    location: 'Ranchi & Mylavaram Sub-Centre',
    districtId: 'dist-03',
    requestCount: 315,
    affectedCommunitiesCount: 6,
    languagesRepresented: ['Hindi', 'English'],
    trendLabel: '↑ 16% over 1 month',
    severityScore: 8,
    confidencePct: 91,
    relatedInfrastructureName: 'Mylavaram Sub-Centre Hospital',
    relatedInfrastructureCondition: 'Critical (Doctor absent 4 days/wk)',
    relatedInvestmentInr: 120000000,
    relatedSchemeName: 'National Health Mission (NHM)',
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

  const filteredIssues = issuesList.filter(issue => {
    const matchesCategory = selectedCategory === 'ALL' || issue.category === selectedCategory;
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.relatedInfrastructureName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleVerifyAI = (issueId: string) => {
    setIssuesList(prev => prev.map(item => {
      if (item.id === issueId) {
        return { ...item, aiVerified: !item.aiVerified };
      }
      return item;
    }));
  };

  return (
    <div className="space-y-8 font-sans text-[#171717] pb-12 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#171717]/20 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold mb-2">
            <span className="px-2 py-0.5 bg-[#D65A3A] text-white uppercase text-[10px]">
              DIGITAL PUBLIC GOODS × CIVIC INTELLIGENCE
            </span>
            <span className="text-[#171717]/40">•</span>
            <span className="text-[#171717]/70 uppercase text-[10px]">
              Built for India. Designed to scale across public systems.
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#171717]">
            Community Issues
          </h1>
          <p className="text-sm font-sans text-[#171717]/80 mt-1">
            <span className="font-bold text-[#171717]">2,841 citizen requests</span> have been grouped into <span className="font-bold text-[#171717]">327 community issues</span>.
          </p>
        </div>

        {onNavigateToRecommendations && (
          <button
            onClick={onNavigateToRecommendations}
            className="px-4 py-2.5 bg-[#D65A3A] hover:bg-[#c34e2f] text-white font-sans font-bold text-xs rounded transition-colors shadow-[2px_2px_0px_#171717] border border-[#171717] flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>View Recommendations</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 3-Step Aggregation Funnel Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3">
          Signal Aggregation Funnel
        </span>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 font-sans text-slate-900">
          <div className="flex-1 w-full bg-white border border-slate-200 rounded-lg p-4 shadow-2xs text-center md:text-left">
            <span className="text-3xl font-bold font-mono text-slate-900 block">2,841</span>
            <span className="text-xs font-medium text-slate-600 mt-0.5 block">Citizen requests</span>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-400 hidden md:block shrink-0" />

          <div className="flex-1 w-full bg-blue-50/80 border border-blue-200 rounded-lg p-4 shadow-2xs text-center md:text-left">
            <span className="text-3xl font-bold font-mono text-blue-900 block">327</span>
            <span className="text-xs font-semibold text-blue-800 mt-0.5 block">Community issues</span>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-400 hidden md:block shrink-0" />

          <div className="flex-1 w-full bg-red-50/80 border border-red-200 rounded-lg p-4 shadow-2xs text-center md:text-left">
            <span className="text-3xl font-bold font-mono text-red-900 block">42</span>
            <span className="text-xs font-semibold text-red-800 mt-0.5 block">Priority hotspots</span>
          </div>
        </div>
      </div>

      {/* Top Emerging Issues Summary Cards */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">
          Top Emerging Issues
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-bold flex items-center gap-1.5 text-slate-900 text-sm">
                💧 Water supply
              </span>
              <span className="font-mono text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                ↑ 37%
              </span>
            </div>
            <p className="text-slate-600 font-mono text-[11px]">
              1,842 requests · 12 villages
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-bold flex items-center gap-1.5 text-slate-900 text-sm">
                🛣️ Road accessibility
              </span>
              <span className="font-mono text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                ↑ 21%
              </span>
            </div>
            <p className="text-slate-600 font-mono text-[11px]">
              684 requests · 8 villages
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-bold flex items-center gap-1.5 text-slate-900 text-sm">
                🏥 Healthcare access
              </span>
              <span className="font-mono text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                ↑ 16%
              </span>
            </div>
            <p className="text-slate-600 font-mono text-[11px]">
              315 requests · 6 villages
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-xl shadow-xs text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search issue title, location, or facility..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-medium">Filter sector:</span>
          {['ALL', 'Water', 'Roads', 'Health'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.map((issue) => (
          <div key={issue.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2 text-xs font-mono mb-1">
                  <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded border border-slate-200">
                    {issue.id}
                  </span>
                  <span className="font-semibold text-blue-700">
                    {issue.category}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-sans">{issue.location}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {issue.title}
                </h3>
              </div>

              <div className="flex items-center space-x-2 text-xs font-mono shrink-0">
                <button
                  onClick={() => handleVerifyAI(issue.id)}
                  className={`px-2.5 py-1 rounded font-semibold border transition-colors cursor-pointer ${
                    issue.aiVerified 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
                  <span>{issue.aiVerified ? 'AI Verified' : 'Unverified'}</span>
                </button>

                <span className={`px-2.5 py-1 rounded font-bold ${
                  issue.severityScore >= 8 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  Severity {issue.severityScore}/10
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-sans block">Citizen Requests</span>
                <span className="font-bold text-slate-900">{issue.requestCount.toLocaleString()} signals</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-sans block">Communities Affected</span>
                <span className="font-bold text-slate-900">{issue.affectedCommunitiesCount} villages</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-sans block">Languages</span>
                <span className="font-medium text-slate-800">{issue.languagesRepresented.join(', ')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-sans block">Velocity Trend</span>
                <span className="font-bold text-red-600">{issue.trendLabel}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                  Related Facility
                </span>
                <div className="font-bold text-slate-900">{issue.relatedInfrastructureName}</div>
                <div className="text-slate-600 font-mono text-[11px]">Condition: {issue.relatedInfrastructureCondition}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                  Government Investment Context
                </span>
                <div className="font-bold text-slate-900">
                  ₹{(issue.relatedInvestmentInr / 10000000).toFixed(1)} Cr Allocated ({issue.relatedSchemeName})
                </div>
                <div className="text-amber-800 font-medium">
                  High expenditure but zero outage resolution
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => { setActiveModalIssue(issue); setModalMode('evidence'); }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded text-[11px] transition-colors cursor-pointer"
                >
                  View Evidence
                </button>
                <button
                  onClick={() => { setActiveModalIssue(issue); setModalMode('requests'); }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded text-[11px] transition-colors cursor-pointer"
                >
                  View Requests ({issue.requestCount})
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => { setActiveModalIssue(issue); setModalMode('merge'); }}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded text-[11px] transition-colors cursor-pointer"
                >
                  Merge Issue
                </button>
                <button
                  onClick={() => { setActiveModalIssue(issue); setModalMode('split'); }}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded text-[11px] transition-colors cursor-pointer"
                >
                  Split Issue
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Dialog for Evidence / Requests / Merge / Split */}
      {activeModalIssue && modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs text-blue-600 font-semibold uppercase">
                  {modalMode === 'evidence' && 'Citizen & Infrastructure Evidence'}
                  {modalMode === 'requests' && 'Individual Citizen Request Stream'}
                  {modalMode === 'merge' && 'Merge Duplicate Issues'}
                  {modalMode === 'split' && 'Split Issue Clusters'}
                </span>
                <h3 className="text-base font-bold text-slate-900">{activeModalIssue.title}</h3>
              </div>
              <button
                onClick={() => { setActiveModalIssue(null); setModalMode(null); }}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-96 overflow-y-auto">
              {modalMode === 'evidence' && (
                <div className="space-y-2">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900">Voice Telephony Evidence</span>
                    <p className="text-slate-700 italic">"మా గ్రామంలో మూడు రోజులుగా తాగునీటి సరఫరా పూర్తిగా నిలిచిపోయింది..."</p>
                    <div className="text-[11px] text-slate-500 font-mono">Language: Telugu | Source: Voice Telephony | Confidence: 96%</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900">Infrastructure Inspector Telemetry Audit</span>
                    <p className="text-slate-700">Water Tank #3 main pump impellers rusted; pipeline leakage measured at 34%.</p>
                  </div>
                </div>
              )}

              {modalMode === 'requests' && (
                <div className="space-y-2">
                  <p className="text-slate-600 font-medium">
                    Sample citizen signals aggregated into this issue cluster:
                  </p>
                  {requests.slice(0, 3).map((req) => (
                    <div key={req.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 font-mono">
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
                <div className="space-y-3">
                  <p className="text-slate-700">
                    Select another issue to merge with <strong>{activeModalIssue.title}</strong>:
                  </p>
                  <div className="p-3 border border-slate-200 bg-slate-50 rounded-lg">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
                      <span className="font-bold text-slate-900">ISSUE-WAT-002: Pipe leakage at Gaya Sector 4</span>
                    </label>
                  </div>
                </div>
              )}

              {modalMode === 'split' && (
                <div className="space-y-3">
                  <p className="text-slate-700">
                    Specify parameters to split this cluster into two distinct sub-issues:
                  </p>
                  <div className="space-y-1">
                    <label className="block text-slate-700 font-bold">Sub-Issue 1 Target Location:</label>
                    <input type="text" defaultValue="Gaya Ward 9" className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs" />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end text-xs gap-2">
              <button
                onClick={() => { setActiveModalIssue(null); setModalMode(null); }}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => { setActiveModalIssue(null); setModalMode(null); }}
                className="px-4 py-2 bg-slate-900 text-white font-semibold rounded hover:bg-slate-800 cursor-pointer"
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
