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
  Database,
  Flame,
  Wind,
  Trash2
} from 'lucide-react';
import { District, CitizenRequest, InfrastructureCategory } from '../types';
import { NavTab } from './Sidebar';
import { calculatePriorityScore, getCategoryAccess, getPriorityTier } from '../utils/scoring';
import { getCityDemandHotspot } from '../utils/demandAggregation';
import { matchesDistrict } from '../utils/districtMatcher';
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

      const matchedRequests = requests.filter(
        r => matchesDistrict(r, district)
      );

      const avgSeverity = matchedRequests.length > 0
        ? Math.round(matchedRequests.reduce((acc, r) => acc + (typeof r.severity === 'number' ? r.severity : 5), 0) / matchedRequests.length)
        : (demandHotspot.urgencyLevel === 'Critical' ? 9 : demandHotspot.urgencyLevel === 'High' ? 7 : 5);

      const breakdown = calculatePriorityScore(district, category, avgSeverity, demandCount, accessScore);
      const tier = getPriorityTier(breakdown.total_score);

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
      title: 'Water shortages and low pipeline pressure',
      location: 'Guntur, Andhra Pradesh',
      districtId: 'guntur',
      statusNote: 'Citizen reports of water shortages in peri-urban areas are increasing.',
      signalCount: 742,
      trend: '+22% this month',
      severity: 'Critical',
      publicFinding: 'Jal Jeevan Mission (JJM) data records 31.6% non-tap reliance with acute summer aquifer drawdown.',
      recommendedAction: 'Sanction 18.4 km trunk line booster pump & secondary reservoir feeder under JJM priority funds.',
    },
    {
      category: 'Roads' as InfrastructureCategory,
      title: 'Damaged roads near hospital routes',
      location: 'Patna, Bihar',
      districtId: 'dist-01',
      statusNote: 'Road damage is causing delays for ambulances in this area.',
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
      statusNote: 'Patient reports highlight staffing issues and vaccine storage concerns in tribal blocks.',
      signalCount: 389,
      trend: '+15% this month',
      severity: 'High',
      publicFinding: 'National Health Mission facility audit indicates 118% bed occupancy and medical officer vacancies.',
      recommendedAction: 'Deploy mobile healthcare van and install solar cold-chain backup for vaccine stocks.',
    },
    {
      category: 'Electricity' as InfrastructureCategory,
      title: 'Repeated transformer failures affecting agricultural power',
      location: 'Gaya, Bihar',
      districtId: 'dist-01',
      statusNote: 'Frequent transformer outages are disrupting irrigation.',
      signalCount: 294,
      trend: '+29% this month',
      severity: 'Moderate',
      publicFinding: 'CEA feeder monitoring records 6.4 daily agricultural feeder trips during paddy transplantation.',
      recommendedAction: 'Replace overloaded 63 kVA transformers with 100 kVA units under RDSS scheme.',
    },
  ], []);

  const WaterIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6"><path d="M12 2C7 2 3 6 3 11c0 4 3 8 9 10 6-2 9-6 9-10 0-5-4-9-9-9z" fill="#3B82F6" /><path d="M12 4c-3 0-5 3-5 7 0 2 1 4 2 5" fill="#60A5FA" /></svg>
  );
  const FireIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6"><path d="M12 2c-3 4-7 5-7 10 0 4 3 7 7 7s7-3 7-7c0-5-4-6-7-10z" fill="#EF4444" /><path d="M12 5c-2 3-5 4-5 8 0 3 2 5 5 5s5-2 5-5c0-4-3-5-5-8z" fill="#F59E0B" /></svg>
  );
  const RoadIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6"><rect x="4" y="2" width="16" height="20" rx="2" fill="#6B7280" /><rect x="11" y="4" width="2" height="4" fill="#FFFFFF" /><rect x="11" y="10" width="2" height="4" fill="#FFFFFF" /><rect x="11" y="16" width="2" height="4" fill="#FFFFFF" /></svg>
  );
  const ElectricityIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#F59E0B" /></svg>
  );
  const PollutionIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6"><path d="M19 12a3 3 0 0 0-3-3H9a3 3 0 0 0 0 6h10" fill="#9CA3AF" /><circle cx="8" cy="15" r="1" fill="#4B5563" /><circle cx="12" cy="18" r="1" fill="#4B5563" /><circle cx="16" cy="15" r="1" fill="#4B5563" /></svg>
  );
  const HealthIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6"><rect x="6" y="6" width="12" height="12" rx="2" fill="#10B981" /><rect x="10" y="8" width="4" height="8" fill="#FFFFFF" /><rect x="8" y="10" width="8" height="4" fill="#FFFFFF" /></svg>
  );
  const WasteIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6"><path d="M5 7h14l-1 14H6L5 7z" fill="#4B5563" /><path d="M8 4h8v2H8V4z" fill="#6B7280" /></svg>
  );
  const SewageIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6"><path d="M12 2C6 2 2 6 2 12s4 10 10 10 10-4 10-10S18 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" fill="#0D9488" /><path d="M12 6v6l4 4" fill="none" stroke="#0D9488" strokeWidth="2" /></svg>
  );
  const DefaultIcon = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6"><circle cx="12" cy="12" r="10" fill="#D1D5DB" /></svg>
  );

  const categoryIcons: Record<string, any> = {
    Water: WaterIcon,
    Roads: RoadIcon,
    Health: HealthIcon,
    Electricity: ElectricityIcon,
    Fire: FireIcon,
    'Air Pollution': PollutionIcon,
    Waste: WasteIcon,
    Sewage: SewageIcon,
  };

  const priorityIssues = useMemo(() => {
    return rawPriorityIssues.map(issue => tOverviewPriorityIssue(issue));
  }, [rawPriorityIssues, tOverviewPriorityIssue]);

  return (
    <div className="space-y-6 sm:space-y-8 font-sans text-[#171717] pb-12 w-full max-w-7xl mx-auto">
      
      {/* 1. CITIZEN INTAKE HERO SECTION WITH UPLOADED INDIAN PARLIAMENT BACKGROUND */}
      <section 
        className="relative border border-[#171717]/30 rounded-xs overflow-hidden shadow-sm transition-all bg-cover bg-center"
        style={{ 
          backgroundImage: `url('/assets/aistudio/image_6c0073af.png')`, 
          backgroundPosition: 'center 38%' 
        }}
      >
        {/* High-contrast public-sector dark overlay to guarantee WCAG AA text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#171717]/95 via-[#1F1E1B]/88 to-[#171717]/72" />

        <div className="relative z-10 py-5 px-5 sm:py-6 sm:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center space-x-2 text-[10px] font-mono font-bold text-[#FF8A65] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D65A3A] shrink-0"></span>
              <span className="truncate">{t('brand.name')} · {t('overview.intake_title')}</span>
            </div>
            <h2 className="text-base sm:text-lg font-serif font-bold text-white leading-snug drop-shadow-xs">
              {t('overview.intake_title')}
            </h2>
            <p className="text-xs sm:text-sm text-[#E8E6DF] leading-relaxed max-w-2xl font-sans">
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
              className="px-3.5 py-2 bg-white hover:bg-[#FAF8F5] text-[#171717] border border-white/80 text-xs font-semibold rounded-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs whitespace-nowrap"
            >
              <FileEdit className="w-3.5 h-3.5 text-[#57534E] shrink-0" />
              <span>{t('action.write_issue')}</span>
            </button>

            <button
              onClick={() => onNavigate('signals')}
              className="px-3 py-2 text-white/90 hover:text-white text-xs font-medium transition-colors cursor-pointer underline whitespace-nowrap"
            >
              {t('nav.my_requests')}
            </button>
          </div>
        </div>
      </section>

      {/* 2. PRIMARY EXECUTIVE CONCLUSION / GOVERNMENT DECISION-SUPPORT PANEL */}
      <section className="bg-[#F1E9DF] border border-[#171717]/10 p-4 sm:p-5 rounded-xs space-y-3.5">
        {/* Top Metadata Line & Decision Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-[#171717]/15">
          {/* Header Area */}
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#78716C] bg-[#FAF8F5] px-1.5 py-0.5 rounded-sm">
                {conclusion.district} · {conclusion.state}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D65A3A] bg-[#FEF2F0] px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[#D65A3A]" />
                {t('overview.urgent_action_title')}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-mono font-bold text-[#171717] tracking-wider uppercase">
                {t('overview.water_infrastructure')}
              </div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#171717] leading-tight">
                {t('overview.high_priority_need')}
              </h1>
            </div>

            <p className="text-sm text-[#57534E] leading-relaxed max-w-2xl font-sans">
              {conclusion.whyMatters}
            </p>
          </div>

          {/* Compact Priority Score */}
          <div className="flex items-center gap-3 bg-[#FAF8F5] border border-[#171717]/15 px-3 py-1.5 rounded-sm shrink-0 self-start">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[10px] font-bold text-[#78716C] uppercase">{t('overview.priority')}</span>
              <span className="text-sm font-bold text-[#171717]">91/100</span>
            </div>
            <div className="text-[10px] font-bold text-[#D65A3A] bg-[#FEF2F0] px-1.5 py-0.5 rounded-xs border border-[#D65A3A]/10">
              {t('status.critical')}
            </div>
          </div>
        </div>

        {/* Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          {[
            { label: t('overview.demand'), value: typeof priorityIssues[0]?.signalCount === 'number' ? priorityIssues[0].signalCount : totalRequests, desc: t('overview.synthetic_signals_desc'), type: 'demo' },
            { label: t('overview.service_gap'), value: '31.6%', desc: t('overview.jjm_benchmark_desc'), type: 'data' },
            { label: t('overview.investment'), value: '₹6.50 Cr', desc: t('overview.planned_capital_desc'), type: 'plan' },
          ].map((metric) => (
            <div key={metric.label} className="bg-white p-4 rounded-sm border border-[#171717]/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#78716C] uppercase tracking-wider">
                  {metric.label}
                </span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-sm font-semibold uppercase ${
                  metric.type === 'demo' ? 'bg-amber-50 text-amber-900 border border-amber-200' :
                  metric.type === 'data' ? 'bg-sky-50 text-sky-900 border border-sky-200' :
                  'bg-stone-50 text-stone-700 border border-stone-200'
                }`}>
                  {metric.type === 'demo' ? t('overview.demo_signal') : metric.type === 'data' ? t('overview.public_data') : t('overview.curated_plan')}
                </span>
              </div>
              <div className="text-2xl font-mono font-bold text-[#171717] tracking-tight">
                {metric.value}
              </div>
              <p className="text-[10px] text-[#57534E] leading-tight font-sans">
                {metric.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Action Row */}
        <div className="border-t border-[#171717]/10 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#285943] uppercase tracking-wider block">
              {t('overview.recommended_intervention')}
            </span>
            <p className="text-sm font-medium text-[#171717] max-w-2xl">
              {t('overview.recommended_intervention_text')}
            </p>
          </div>

          <button
            onClick={() => {
              if (onSelectDistrictForPolicy) {
                onSelectDistrictForPolicy('guntur', 'Water');
              }
              onNavigate('recommendations');
            }}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#171717] hover:bg-[#34322D] text-white text-xs font-mono font-semibold rounded-sm transition-colors cursor-pointer whitespace-nowrap shadow-sm"
          >
            <span>{t('overview.view_evidence_dossier')}</span>
            <span>→</span>
          </button>
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
              Community issues that may need attention first, based on citizen reports, service gaps and urgency.
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
          {(() => {
            const categoryIcons: Record<string, any> = {
              Water: Droplets,
              Roads: Route,
              Health: HeartPulse,
              Electricity: Zap,
              Fire: Flame,
              'Air Pollution': Wind,
              Waste: Trash2,
              Sewage: Droplets,
            };
            return priorityIssues.map((issue, idx) => {
              const Icon = categoryIcons[issue.category] || AlertCircle;
              return (
                <div
                  key={issue.title}
                  onClick={() => setActiveDrawerIssue(issue)}
                  className="bg-white border border-[#171717]/15 hover:border-[#171717]/40 p-4 rounded-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="flex items-start space-x-4 flex-1 min-w-0">
                    <span className="font-mono text-sm font-bold text-[#78716C] pt-0.5 shrink-0 w-6">
                      0{idx + 1}
                    </span>
                    <div className="w-8 h-8 rounded-xs bg-[#FAF8F5] flex items-center justify-center shrink-0 border border-[#171717]/5">
                      <Icon />
                    </div>
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

                  <div className="flex items-center justify-between md:justify-end gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-[#171717]/10 shrink-0">
                    <div className="text-left md:text-right">
                      <span className="text-xs font-mono font-bold text-[#171717] block whitespace-nowrap">
                        {issue.signalCount} <span className="text-[#78716C] font-normal">citizen feedback signals</span>
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
              );
            });
          })()}
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

              {/* 2.5 Representative Visual Evidence */}
              {(() => {
                const reqWithImage = requests.find(r => 
                  r.category === activeDrawerIssue.category && 
                  (activeDrawerIssue.location.includes(r.location) || activeDrawerIssue.location.includes(r.district || '')) &&
                  (r.photo_url || r.illustration_url)
                );
                if (!reqWithImage) return null;
                const isAi = !reqWithImage.photo_url && !!reqWithImage.illustration_url;
                return (
                  <div className="bg-white p-3 border border-[#171717]/15 rounded-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Representative Evidence</span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border rounded-xs uppercase ${
                        isAi ? 'bg-purple-50 text-purple-800 border-purple-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {isAi ? '🤖 AI Illustration' : '📷 Citizen Photo'}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <img 
                        src={reqWithImage.photo_url || reqWithImage.illustration_url} 
                        alt="Evidence" 
                        className="w-16 h-16 object-cover border border-[#171717]/15 rounded-xs"
                        referrerPolicy="no-referrer"
                      />
                      <p className="text-[11px] text-slate-600 leading-tight italic">
                        "{reqWithImage.summary_en || reqWithImage.original_text.substring(0, 60)}..."
                      </p>
                    </div>
                  </div>
                );
              })()}

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


