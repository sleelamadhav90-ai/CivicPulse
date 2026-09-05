import React, { useState, useMemo } from 'react';
import { 
  ArrowRight, 
  Droplets, 
  Route, 
  HeartPulse, 
  Zap, 
  Mic, 
  FileEdit, 
  Radio, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  TrendingUp,
  AlertCircle,
  X,
  FileText,
  Volume2,
  Database
} from 'lucide-react';
import { District, CitizenRequest, InfrastructureCategory } from '../types';
import { NavTab } from './Sidebar';
import { calculatePriorityScore, getCategoryAccess, getPriorityTier } from '../utils/scoring';
import { getCityDemandHotspot } from '../utils/demandAggregation';
import { IndiaMapCanvas, EvaluatedDistrict, MapLayerState } from './IndiaMapCanvas';
import { getPublicDataForDistrict } from '../data/publicDataService';

interface OverviewProps {
  districts: District[];
  requests: CitizenRequest[];
  onNavigate: (tab: NavTab) => void;
  onSelectDistrictForPolicy?: (districtId: string, category: InfrastructureCategory) => void;
  onSelectCategoryForReporting?: (category: InfrastructureCategory) => void;
  onStartVoiceSubmission?: () => void;
  onStartWriteSubmission?: () => void;
}

export const Overview: React.FC<OverviewProps> = ({
  districts,
  requests,
  onNavigate,
  onSelectDistrictForPolicy,
  onStartVoiceSubmission,
  onStartWriteSubmission,
}) => {
  const [selectedHotspotId, setSelectedHotspotId] = useState<string>(districts[0]?.id || 'guntur');
  const [activeDrawerIssue, setActiveDrawerIssue] = useState<{
    title: string;
    category: InfrastructureCategory;
    location: string;
    districtId: string;
    signalCount: number;
    trend: string;
    severity: string;
    statusNote: string;
    publicFinding?: string;
    recommendedAction?: string;
  } | null>(null);

  // Compute summary metrics
  const totalRequests = requests.length;
  const communityIssuesCount = 327;
  const priorityDistrictsCount = 42;
  const openActionsCount = 18;

  // Prepare evaluations for the map
  const evaluations: EvaluatedDistrict[] = useMemo(() => {
    return districts.map((district) => {
      const category: InfrastructureCategory = 'Water';
      const demandHotspot = getCityDemandHotspot(district, requests);
      const accessScore = getCategoryAccess(district, category);
      const demandCount = demandHotspot.totalCitizenRequests;
      const breakdown = calculatePriorityScore(district, category, demandCount, accessScore);
      const tier = getPriorityTier(breakdown.total_score);

      const matchedRequests = requests.filter(
        r => r.location.toLowerCase().includes(district.name.toLowerCase()) || 
             r.location.toLowerCase().includes(district.state.toLowerCase())
      );

      return {
        district,
        category,
        demandCount,
        currentAccess: accessScore,
        breakdown,
        matchedRequests,
        demandHotspot,
        priorityTier: tier,
      };
    });
  }, [districts, requests]);

  const mapLayers: MapLayerState = {
    citizen_demand: true,
    infrastructure: true,
    population: true,
    projects: false,
    healthcare: false,
    education: false,
    roads: false,
    digital: false,
  };

  // 3-4 Top Priority issues with progressive disclosure
  const priorityIssues = [
    {
      category: 'Water' as InfrastructureCategory,
      title: 'Water access deficit & pipeline pressure collapse',
      location: 'Guntur, Andhra Pradesh',
      districtId: 'guntur',
      statusNote: 'High and rising citizen demand in peri-urban wards',
      signalCount: 742,
      trend: '+22% this month',
      severity: 'Critical',
      publicFinding: 'Jal Jeevan Mission (JJM) data records 31.6% non-tap reliance with acute summer aquifer drawdown.',
      recommendedAction: 'Sanction 18.4 km trunk line booster pump & secondary reservoir feeder under JJM priority funds.',
    },
    {
      category: 'Roads' as InfrastructureCategory,
      title: 'Arterial hospital corridor craters & flood washout',
      location: 'Patna, Bihar',
      districtId: 'dist-01',
      statusNote: 'Emergency transit bottleneck affecting ambulance access',
      signalCount: 512,
      trend: '+18% this month',
      severity: 'High',
      publicFinding: 'PMGSY GIS audit shows pavement roughness index (IRI 5.8) exceeding safety tolerances.',
      recommendedAction: 'Execute fast-track hot-mix resurfacing on MDR-44 hospital approach road.',
    },
    {
      category: 'Health' as InfrastructureCategory,
      title: 'Primary health sub-centre staffing & cold chain shortfalls',
      location: 'Nashik, Maharashtra',
      districtId: 'dist-04',
      statusNote: 'Patient grievances concentrated in tribal blocks',
      signalCount: 389,
      trend: '+15% this month',
      severity: 'High',
      publicFinding: 'National Health Mission facility audit indicates 118% bed occupancy and medical officer vacancies.',
      recommendedAction: 'Deploy mobile healthcare van and install solar cold-chain backup for vaccine stocks.',
    },
    {
      category: 'Electricity' as InfrastructureCategory,
      title: 'Agricultural power transformer breakdown cycle',
      location: 'Gaya, Bihar',
      districtId: 'dist-01',
      statusNote: 'Recurring outage pattern during irrigation cycles',
      signalCount: 294,
      trend: '+29% this month',
      severity: 'Moderate',
      publicFinding: 'CEA feeder telemetry records 6.4 daily agricultural feeder trips during paddy transplantation.',
      recommendedAction: 'Replace overloaded 63 kVA transformers with 100 kVA units under RDSS scheme.',
    },
  ];

  return (
    <div className="space-y-10 font-sans text-[#171717] pb-16 max-w-5xl mx-auto">
      
      {/* 1. CITIZEN INTAKE BAR: Clean, compact, non-intrusive */}
      <section className="bg-[#FAF8F5] border border-[#171717]/15 p-4 sm:p-5 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-mono font-bold text-[#D65A3A] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D65A3A]"></span>
            <span>Citizen Service Portal</span>
          </div>
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#171717] mt-0.5">
            Report a local infrastructure issue
          </h2>
          <p className="text-xs text-[#57534E] mt-0.5">
            Voice or text in your dialect — automatically translated and prioritized for officials.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onStartVoiceSubmission ? onStartVoiceSubmission() : onNavigate('submit')}
            className="px-3.5 py-2 bg-[#D65A3A] hover:bg-[#c24e2f] text-white text-xs font-semibold rounded-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Speak issue</span>
          </button>

          <button
            onClick={() => onStartWriteSubmission ? onStartWriteSubmission() : onNavigate('submit')}
            className="px-3.5 py-2 bg-white hover:bg-[#F7F5EF] text-[#171717] border border-[#171717]/25 text-xs font-semibold rounded-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <FileEdit className="w-3.5 h-3.5 text-[#57534E]" />
            <span>Write</span>
          </button>

          <button
            onClick={() => onNavigate('signals')}
            className="px-3 py-2 text-[#57534E] hover:text-[#171717] text-xs font-medium transition-colors cursor-pointer underline"
          >
            Track
          </button>
        </div>
      </section>

      {/* 2. PRIMARY EXECUTIVE CONCLUSION (The One Key Finding) */}
      <section className="bg-white border-2 border-[#D65A3A]/40 p-5 sm:p-6 rounded-xs shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="bg-[#D65A3A] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider">
              Top National Priority
            </span>
            <span className="text-xs font-mono font-semibold text-[#D65A3A]">
              Score 91 / 100 · Critical
            </span>
          </div>
          <span className="text-xs text-[#78716C] font-mono hidden sm:inline">
            Guntur, Andhra Pradesh
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#171717]">
            Water pipeline deficit requires immediate booster sanction in Guntur
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E] mt-1.5 leading-relaxed">
            <strong>Conclusion:</strong> 742 verified citizen voice reports backed by Jal Jeevan Mission telemetry indicate acute pipeline pressure collapse affecting 14 habitations.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#171717]/10">
          <div className="flex items-center space-x-4 text-xs font-mono text-[#57534E]">
            <span><strong>742</strong> citizen reports (+22%)</span>
            <span className="text-stone-300">•</span>
            <span><strong>31.6%</strong> tap deficit (JJM)</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (onSelectDistrictForPolicy) {
                  onSelectDistrictForPolicy('guntur', 'Water');
                }
                onNavigate('recommendations');
              }}
              className="px-4 py-1.5 bg-[#171717] hover:bg-[#34322D] text-white text-xs font-semibold rounded-xs transition-colors cursor-pointer"
            >
              Review recommendation →
            </button>
          </div>
        </div>
      </section>

      {/* 3. ONE DOMINANT VISUALIZATION (Interactive Priority Hotspots Map) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#171717]">
              Where action is needed
            </h2>
            <p className="text-xs text-[#78716C] mt-0.5">
              Interactive geographic distribution of citizen demand and infrastructure vulnerability.
            </p>
          </div>
          <button
            onClick={() => onNavigate('map')}
            className="text-xs font-semibold text-[#D65A3A] hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>Full screen map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Map Container as the Primary Visual Anchor */}
        <div className="bg-white border border-[#171717]/20 rounded-xs overflow-hidden shadow-xs">
          <div className="px-4 py-2.5 bg-[#FAF8F5] border-b border-[#171717]/15 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-4 text-[#57534E]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D65A3A]"></span>
                <span className="font-bold text-[#171717]">High priority</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D9A441]"></span>
                <span>Medium</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#285943]"></span>
                <span>Monitoring</span>
              </span>
            </div>

            <span className="text-[11px] text-[#78716C] hidden sm:inline">
              Click any circle to inspect evidence
            </span>
          </div>

          <div className="h-[440px] w-full relative">
            <IndiaMapCanvas
              evaluations={evaluations}
              activeDistrictId={selectedHotspotId}
              onSelectDistrict={(id) => {
                setSelectedHotspotId(id);
                const found = priorityIssues.find(p => p.districtId === id);
                if (found) {
                  setActiveDrawerIssue(found);
                }
              }}
              selectedCategory="All"
              layers={mapLayers}
              onSelectHotspotForPolicy={(dist, cat) => {
                if (onSelectDistrictForPolicy) {
                  onSelectDistrictForPolicy(dist.id, cat);
                }
                onNavigate('map');
              }}
              selectedCountryCode="IN"
            />
          </div>
        </div>
      </section>

      {/* 4. ESSENTIAL EVIDENCE: Clean 4-Item Ranked Attention List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-[#171717]/10 pb-2">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#171717]">
              Priority issues requiring decision
            </h2>
            <p className="text-xs text-[#78716C] mt-0.5">
              Ranked by citizen demand acceleration and open government infrastructure gap.
            </p>
          </div>
          <button
            onClick={() => onNavigate('issues')}
            className="text-xs font-semibold text-[#D65A3A] hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>All 327 community issues</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {priorityIssues.map((issue, idx) => (
            <div
              key={issue.title}
              onClick={() => setActiveDrawerIssue(issue)}
              className="bg-white border border-[#171717]/15 hover:border-[#171717]/40 p-4 rounded-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
            >
              <div className="flex items-start space-x-3.5">
                <span className="font-mono text-sm font-bold text-[#78716C] pt-0.5 shrink-0">
                  0{idx + 1}
                </span>
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold text-[#D65A3A] uppercase tracking-wider">
                      {issue.category}
                    </span>
                    <span className="text-[#171717]/30 text-xs">·</span>
                    <span className="text-xs font-medium text-[#57534E]">
                      {issue.location}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-[#171717] group-hover:text-[#D65A3A] transition-colors">
                    {issue.title}
                  </div>
                  <div className="text-xs text-[#78716C]">
                    {issue.statusNote}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#171717]/10">
                <div className="text-left sm:text-right">
                  <span className="text-xs font-mono font-bold text-[#171717] block">
                    {issue.signalCount} signals
                  </span>
                  <span className="text-[11px] text-[#D65A3A] font-medium block font-mono">
                    {issue.trend}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDrawerIssue(issue);
                  }}
                  className="px-3 py-1.5 text-xs font-medium bg-[#FAF8F5] hover:bg-[#171717] hover:text-white text-[#171717] border border-[#171717]/20 rounded-xs transition-colors cursor-pointer"
                >
                  Inspect →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SUMMARY FOOTPRINT (Minimal, Calm Stats) */}
      <section className="bg-[#FAF8F5] border border-[#171717]/10 p-4 rounded-xs flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#57534E]">
        <div className="flex items-center space-x-6">
          <div><strong className="text-[#171717]">{totalRequests.toLocaleString()}</strong> Citizen signals</div>
          <span className="text-stone-300">•</span>
          <div><strong className="text-[#171717]">{priorityDistrictsCount}</strong> Priority districts</div>
          <span className="text-stone-300">•</span>
          <div><strong className="text-[#171717]">{openActionsCount}</strong> Ready for sanction</div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <button 
            onClick={() => onNavigate('patterns')} 
            className="text-[#D65A3A] hover:underline cursor-pointer font-sans font-medium"
          >
            Explore AI Patterns →
          </button>
          <span className="text-stone-300">•</span>
          <button 
            onClick={() => onNavigate('recommendations')} 
            className="text-[#D65A3A] hover:underline cursor-pointer font-sans font-medium"
          >
            All Recommendations →
          </button>
        </div>
      </section>

      {/* PROGRESSIVE CONTEXTUAL DRAWER FOR ISSUE INSPECTION */}
      {activeDrawerIssue && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-100">
          <aside className="w-full max-w-md bg-[#FAF8F5] h-full shadow-2xl border-l border-[#171717]/20 flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-right duration-150 font-sans text-[#171717]">
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[#171717]/15 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#D65A3A] uppercase tracking-wider">
                    {activeDrawerIssue.category} Priority Detail
                  </span>
                  <h3 className="text-xl font-serif font-bold text-[#171717] mt-1">
                    {activeDrawerIssue.title}
                  </h3>
                  <div className="text-xs text-[#57534E] font-mono mt-0.5">
                    {activeDrawerIssue.location}
                  </div>
                </div>
                <button
                  onClick={() => setActiveDrawerIssue(null)}
                  className="p-1 text-[#78716C] hover:text-[#171717] hover:bg-stone-200 rounded cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 1. Conclusion */}
              <div className="bg-white p-4 border border-[#171717]/15 rounded-xs space-y-1">
                <div className="text-[10px] font-mono uppercase text-[#78716C]">Diagnosis</div>
                <p className="text-xs text-[#171717] leading-relaxed">
                  {activeDrawerIssue.statusNote} with urgent intervention required to prevent service disruption.
                </p>
                <div className="text-xs font-mono text-[#D65A3A] font-bold pt-1">
                  Demand Volume: {activeDrawerIssue.signalCount} reports ({activeDrawerIssue.trend})
                </div>
              </div>

              {/* 2. Essential Evidence & Open Public Telemetry */}
              {activeDrawerIssue.publicFinding && (
                <div className="bg-white p-4 border border-[#171717]/15 rounded-xs space-y-1.5">
                  <div className="flex items-center space-x-1 text-[10px] font-mono font-bold text-[#57534E] uppercase">
                    <Database className="w-3 h-3 text-[#D65A3A]" />
                    <span>Open Government Data Telemetry</span>
                  </div>
                  <p className="text-xs text-[#57534E] leading-relaxed">
                    {activeDrawerIssue.publicFinding}
                  </p>
                  <div className="text-[10px] font-mono text-[#78716C]">
                    Source: data.gov.in / Official Administrative Registry
                  </div>
                </div>
              )}

              {/* 3. Recommended Action */}
              {activeDrawerIssue.recommendedAction && (
                <div className="bg-[#FAF0E6] p-4 border border-[#D65A3A]/30 rounded-xs space-y-1">
                  <div className="text-[10px] font-mono font-bold text-[#D65A3A] uppercase tracking-wider">
                    Recommended Intervention
                  </div>
                  <p className="text-xs text-[#171717] leading-relaxed font-medium">
                    {activeDrawerIssue.recommendedAction}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-6 border-t border-[#171717]/15 mt-6">
              <button
                onClick={() => {
                  if (onSelectDistrictForPolicy) {
                    onSelectDistrictForPolicy(activeDrawerIssue.districtId, activeDrawerIssue.category);
                  }
                  setActiveDrawerIssue(null);
                  onNavigate('recommendations');
                }}
                className="w-full py-2.5 bg-[#171717] hover:bg-[#34322D] text-white text-xs font-semibold rounded-xs transition-colors cursor-pointer text-center"
              >
                Review Full Recommendation & Evidence →
              </button>

              <button
                onClick={() => {
                  setActiveDrawerIssue(null);
                  onNavigate('issues');
                }}
                className="w-full py-2 bg-white hover:bg-[#FAF8F5] text-[#171717] border border-[#171717]/20 text-xs font-medium rounded-xs transition-colors cursor-pointer text-center"
              >
                View Community Issues
              </button>
            </div>
          </aside>
        </div>
      )}

    </div>
  );
};

