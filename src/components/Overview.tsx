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
import { useLanguage } from '../context/LanguageContext';

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
  const { t, tCategory, tStatus, tOverviewConclusion, tOverviewPriorityIssue } = useLanguage();
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

  // Localized Executive Conclusion
  const conclusion = useMemo(() => {
    return tOverviewConclusion();
  }, [tOverviewConclusion]);

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
        r => (r.district && r.district.toLowerCase() === district.name.toLowerCase()) ||
             r.location.toLowerCase().includes(district.name.toLowerCase()) || 
             district.name.toLowerCase().includes(r.location.toLowerCase()) ||
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
  const rawPriorityIssues = useMemo(() => [
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
      publicFinding: 'CEA feeder monitoring records 6.4 daily agricultural feeder trips during paddy transplantation.',
      recommendedAction: 'Replace overloaded 63 kVA transformers with 100 kVA units under RDSS scheme.',
    },
  ], []);

  const priorityIssues = useMemo(() => {
    return rawPriorityIssues.map(issue => tOverviewPriorityIssue(issue));
  }, [rawPriorityIssues, tOverviewPriorityIssue]);

  return (
    <div className="space-y-10 font-sans text-[#171717] pb-16 w-full max-w-7xl mx-auto">
      
      {/* 1. CITIZEN INTAKE BAR: Clean, compact, flexible for all languages */}
      <section className="bg-[#FAF8F5] border border-[#171717]/15 p-4 sm:p-5 rounded-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center space-x-2 text-[10px] font-mono font-bold text-[#D65A3A] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D65A3A] shrink-0"></span>
            <span className="truncate">{t('brand.name')} · {t('overview.intake_title')}</span>
          </div>
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#171717] leading-snug">
            {t('overview.intake_title')}
          </h2>
          <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
            {t('overview.intake_desc')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-1 lg:pt-0">
          <button
            onClick={() => onStartVoiceSubmission ? onStartVoiceSubmission() : onNavigate('submit')}
            className="px-3.5 py-2 bg-[#D65A3A] hover:bg-[#c24e2f] text-white text-xs font-semibold rounded-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Mic className="w-3.5 h-3.5 shrink-0" />
            <span>{t('action.speak_issue')}</span>
          </button>

          <button
            onClick={() => onStartWriteSubmission ? onStartWriteSubmission() : onNavigate('submit')}
            className="px-3.5 py-2 bg-white hover:bg-[#F7F5EF] text-[#171717] border border-[#171717]/25 text-xs font-semibold rounded-xs transition-colors flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
          >
            <FileEdit className="w-3.5 h-3.5 text-[#57534E] shrink-0" />
            <span>{t('action.write_issue')}</span>
          </button>

          <button
            onClick={() => onNavigate('signals')}
            className="px-3 py-2 text-[#57534E] hover:text-[#171717] text-xs font-medium transition-colors cursor-pointer underline whitespace-nowrap"
          >
            {t('nav.my_requests')}
          </button>
        </div>
      </section>

      {/* 2. PRIMARY EXECUTIVE CONCLUSION / GOVERNMENT DECISION-SUPPORT PANEL */}
      <section className="bg-white border border-[#171717]/20 p-5 sm:p-6 rounded-xs shadow-xs space-y-4">
        {/* Top Metadata Line & Compact Decision Header (Two-Zone Layout) */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3.5 border-b border-[#171717]/15">
          {/* Top Left: Location, Category & Finding Statement */}
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#78716C] font-semibold">
                {conclusion.district} · {conclusion.state}
              </span>
              <span className="text-[#171717]/20 select-none">•</span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D65A3A]">
                {t('overview.urgent_action_title')}
              </span>
            </div>

            <div className="space-y-0.5 pt-0.5">
              <div className="text-xs font-mono font-bold text-[#171717] tracking-wider uppercase">
                {t('overview.water_infrastructure')}
              </div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#171717] leading-tight break-words">
                {t('overview.high_priority_need')}
              </h1>
            </div>

            <p className="text-xs sm:text-[13px] text-[#57534E] leading-relaxed font-sans pt-0.5 max-w-xl">
              {conclusion.whyMatters}
            </p>
          </div>

          {/* Top Right: Compact Priority Decision Marker */}
          <div className="sm:text-right shrink-0 bg-[#FAF8F5] sm:bg-transparent p-2.5 sm:p-0 rounded-xs sm:rounded-none border sm:border-0 border-[#171717]/10 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1.5">
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-[10px] uppercase tracking-wider text-[#78716C] font-semibold sm:inline-block">
                {t('overview.priority')}
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight ml-1">
                91
              </span>
              <span className="text-sm text-[#78716C] font-normal">
                / 100
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono px-1.5 py-0.2 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded font-semibold uppercase">
                {t('overview.model_estimate')}
              </span>
              <div className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#D65A3A] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D65A3A] inline-block"></span>
                <span>{t('status.critical')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Evidence Row (Three Columns with Thin Separators) */}
        <div className="pt-0.5 pb-3 border-b border-[#171717]/15 space-y-2.5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 md:divide-x md:divide-[#171717]/15">
            {/* Column 1: Demand */}
            <div className="space-y-0.5 md:pr-4">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold text-[#78716C] uppercase tracking-wider block">
                  {t('overview.demand')}
                </span>
                <span className="text-[9px] font-mono px-1 py-0.2 bg-amber-100 text-amber-900 border border-amber-300 rounded font-semibold uppercase">
                  {t('overview.demo_signal')}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-mono font-bold text-[#171717] tracking-tight">
                {priorityIssues[0]?.signalCount || totalRequests || 742}
              </div>
              <p className="text-[11px] text-[#57534E] leading-tight font-sans">
                {t('overview.synthetic_signals_desc')}
              </p>
            </div>

            {/* Column 2: Service Gap */}
            <div className="space-y-0.5 md:px-6">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold text-[#78716C] uppercase tracking-wider block">
                  {t('overview.service_gap')}
                </span>
                <span className="text-[9px] font-mono px-1 py-0.2 bg-sky-100 text-sky-900 border border-sky-300 rounded font-semibold uppercase">
                  {t('overview.public_data')}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-mono font-bold text-[#171717] tracking-tight">
                31.6%
              </div>
              <p className="text-[11px] text-[#57534E] leading-tight font-sans">
                {t('overview.jjm_benchmark_desc')}
              </p>
            </div>

            {/* Column 3: Investment */}
            <div className="space-y-0.5 md:pl-6">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold text-[#78716C] uppercase tracking-wider block">
                  {t('overview.investment')}
                </span>
                <span className="text-[9px] font-mono px-1 py-0.2 bg-stone-100 text-stone-700 border border-stone-300 rounded font-semibold uppercase">
                  {t('overview.curated_plan')}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-mono font-bold text-[#285943] tracking-tight">
                ₹6.50 Cr
              </div>
              <p className="text-[11px] text-[#57534E] leading-tight font-sans">
                {t('overview.planned_capital_desc')}
              </p>
            </div>
          </div>

          {/* Short Evidence Interpretation */}
          <div className="pt-2 border-t border-[#171717]/10 flex flex-wrap items-baseline gap-1.5">
            <span className="text-[10px] font-mono font-bold text-[#78716C] uppercase tracking-wider">
              {t('overview.why_prioritized_label')}
            </span>
            <p className="text-xs text-[#57534E] font-sans">
              {t('overview.why_prioritized_text')}
            </p>
          </div>
        </div>

        {/* Recommended Intervention Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
          <div className="space-y-0.5 max-w-2xl">
            <span className="text-[10px] font-mono font-bold text-[#285943] uppercase tracking-wider block">
              {t('overview.recommended_intervention')}
            </span>
            <p className="text-xs sm:text-sm font-medium text-[#171717]">
              {t('overview.recommended_intervention_text')}
            </p>
          </div>

          <div className="flex items-center shrink-0 pt-1 sm:pt-0">
            <button
              onClick={() => {
                if (onSelectDistrictForPolicy) {
                  onSelectDistrictForPolicy('guntur', 'Water');
                }
                onNavigate('recommendations');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#171717] hover:bg-[#34322D] text-white text-xs font-mono font-semibold rounded-xs transition-colors cursor-pointer whitespace-nowrap shadow-xs"
            >
              <span>{t('overview.view_evidence_dossier')}</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. ONE DOMINANT VISUALIZATION (Interactive Priority Hotspots Map) */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#171717]">
              {t('overview.hotspot_map_title')}
            </h2>
            <p className="text-xs text-[#78716C] mt-0.5">
              {t('overview.hotspot_map_desc')}
            </p>
          </div>
          <button
            onClick={() => onNavigate('map')}
            className="text-xs font-semibold text-[#D65A3A] hover:underline flex items-center space-x-1 cursor-pointer whitespace-nowrap"
          >
            <span>{t('nav.map')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Map Container as the Primary Visual Anchor */}
        <div className="bg-white border border-[#171717]/20 rounded-xs overflow-hidden shadow-xs">
          <div className="px-4 py-2.5 bg-[#FAF8F5] border-b border-[#171717]/15 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-4 text-[#57534E]">
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D65A3A]"></span>
                <span className="font-bold text-[#171717]">{t('status.critical')}</span>
              </span>
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D9A441]"></span>
                <span>{t('status.moderate')}</span>
              </span>
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-2.5 h-2.5 rounded-full bg-[#285943]"></span>
                <span>{t('status.low')}</span>
              </span>
            </div>

            <span className="text-[11px] text-[#78716C] whitespace-nowrap">
              {t('overview.click_to_inspect')}
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
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#171717]/10 pb-2">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#171717]">
              {t('overview.priority_list_title')}
            </h2>
            <p className="text-xs text-[#78716C] mt-0.5">
              {t('overview.priority_list_desc')}
            </p>
          </div>
          <button
            onClick={() => onNavigate('issues')}
            className="text-xs font-semibold text-[#D65A3A] hover:underline flex items-center space-x-1 cursor-pointer whitespace-nowrap"
          >
            <span>{t('nav.issues')} ({communityIssuesCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {priorityIssues.map((issue, idx) => (
            <div
              key={issue.title}
              onClick={() => setActiveDrawerIssue(issue)}
              className="bg-white border border-[#171717]/15 hover:border-[#171717]/40 p-4 rounded-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
            >
              <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                <span className="font-mono text-sm font-bold text-[#78716C] pt-0.5 shrink-0">
                  0{idx + 1}
                </span>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-[#D65A3A] uppercase tracking-wider whitespace-nowrap">
                      {tCategory(issue.category)}
                    </span>
                    <span className="text-[#171717]/30 text-xs">·</span>
                    <span className="text-xs font-medium text-[#57534E] whitespace-nowrap">
                      {issue.location}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-[#171717] group-hover:text-[#D65A3A] transition-colors leading-snug break-words">
                    {issue.title}
                  </div>
                  <div className="text-xs text-[#78716C] leading-relaxed break-words">
                    {issue.statusNote}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-[#171717]/10 shrink-0">
                <div className="text-left md:text-right">
                  <span className="text-xs font-mono font-bold text-[#171717] block whitespace-nowrap">
                    {issue.signalCount} {t('metric.demand_signals')}
                  </span>
                  <span className="text-[11px] text-[#D65A3A] font-medium block font-mono whitespace-nowrap">
                    {issue.trend}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDrawerIssue(issue);
                  }}
                  className="px-3.5 py-1.5 text-xs font-medium bg-[#FAF8F5] hover:bg-[#171717] hover:text-white text-[#171717] border border-[#171717]/20 rounded-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  {t('action.inspect')} →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SUMMARY FOOTPRINT (Minimal, Calm Stats) */}
      <section className="bg-[#FAF8F5] border border-[#171717]/10 p-4 rounded-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono text-[#57534E]">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="whitespace-nowrap"><strong className="text-[#171717]">{totalRequests.toLocaleString()}</strong> {t('metric.demand_signals')}</div>
          <span className="text-stone-300 hidden sm:inline">•</span>
          <div className="whitespace-nowrap"><strong className="text-[#171717]">{priorityDistrictsCount}</strong> {t('metric.districts')}</div>
          <span className="text-stone-300 hidden sm:inline">•</span>
          <div className="whitespace-nowrap"><strong className="text-[#171717]">{openActionsCount}</strong> {t('status.prioritized')}</div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs shrink-0">
          <button 
            onClick={() => onNavigate('patterns')} 
            className="text-[#D65A3A] hover:underline cursor-pointer font-sans font-medium whitespace-nowrap"
          >
            {t('nav.patterns')} →
          </button>
          <span className="text-stone-300 hidden sm:inline">•</span>
          <button 
            onClick={() => onNavigate('recommendations')} 
            className="text-[#D65A3A] hover:underline cursor-pointer font-sans font-medium whitespace-nowrap"
          >
            {t('overview.view_all_recommendations')} →
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
                    {tCategory(activeDrawerIssue.category)} · {t('metric.severity')}: {tStatus(activeDrawerIssue.severity)}
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
                <div className="text-[10px] font-mono uppercase text-[#78716C]">{t('overview.why_matters')}</div>
                <p className="text-xs text-[#171717] leading-relaxed">
                  {activeDrawerIssue.statusNote}
                </p>
                <div className="text-xs font-mono text-[#D65A3A] font-bold pt-1">
                  {t('metric.demand_signals')}: {activeDrawerIssue.signalCount} ({activeDrawerIssue.trend})
                </div>
              </div>

              {/* 2. Essential Evidence & Open Public Data */}
              {activeDrawerIssue.publicFinding && (
                <div className="bg-white p-4 border border-[#171717]/15 rounded-xs space-y-1.5">
                  <div className="flex items-center space-x-1 text-[10px] font-mono font-bold text-[#57534E] uppercase">
                    <Database className="w-3 h-3 text-[#D65A3A]" />
                    <span>{t('patterns.grounding_evidence')}</span>
                  </div>
                  <p className="text-xs text-[#57534E] leading-relaxed">
                    {activeDrawerIssue.publicFinding}
                  </p>
                  <div className="text-[10px] font-mono text-[#78716C]">
                    data.gov.in / National Registry
                  </div>
                </div>
              )}

              {/* 3. Recommended Action */}
              {activeDrawerIssue.recommendedAction && (
                <div className="bg-[#FAF0E6] p-4 border border-[#D65A3A]/30 rounded-xs space-y-1">
                  <div className="text-[10px] font-mono font-bold text-[#D65A3A] uppercase tracking-wider">
                    {t('patterns.suggested_intervention')}
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
                {t('action.review_in_recommendations')} →
              </button>

              <button
                onClick={() => {
                  setActiveDrawerIssue(null);
                  onNavigate('issues');
                }}
                className="w-full py-2 bg-white hover:bg-[#FAF8F5] text-[#171717] border border-[#171717]/20 text-xs font-medium rounded-xs transition-colors cursor-pointer text-center"
              >
                {t('action.explore_community_issues')}
              </button>
            </div>
          </aside>
        </div>
      )}

    </div>
  );
};


