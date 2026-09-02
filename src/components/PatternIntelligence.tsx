import React, { useState, useMemo } from 'react';
import { 
  Cpu, 
  Sparkles, 
  TrendingUp, 
  MapPin, 
  AlertTriangle, 
  Layers, 
  RotateCcw, 
  ArrowRight, 
  X, 
  Search, 
  Compass, 
  BarChart3, 
  CheckCircle2, 
  Zap, 
  Droplet, 
  Route, 
  HeartPulse, 
  GraduationCap, 
  Building2, 
  Flame, 
  Filter, 
  ShieldAlert, 
  Activity, 
  FileText,
  Link2,
  Users
} from 'lucide-react';
import { District, CitizenRequest, InfrastructureCategory } from '../types';

export type PatternCategory = 'ALL' | 'Emerging' | 'Trend' | 'Cluster' | 'Cross-Domain' | 'Anomaly' | 'Recurring';

export interface PatternItem {
  id: string;
  title: string;
  type: 'Emerging' | 'Trend' | 'Cluster' | 'Cross-Domain' | 'Anomaly' | 'Recurring';
  priorityLabel: 'CRITICAL' | 'HIGH' | 'MODERATE';
  districtName: string;
  districtId: string;
  state: string;
  category: InfrastructureCategory;
  summary: string;
  metrics: {
    changePct?: string;
    affectedVillagesCount: number;
    nearbyFailuresCount?: number;
    citizenSignalsCount: number;
    confidencePct: number;
    timeframe: string;
    baselineRate?: string;
    currentRate?: string;
  };
  details: {
    what: string;
    where: string;
    whoIsAffected: string;
    whatItIndicates: string;
  };
  monthlyTrendData?: { month: string; count: number }[];
  crossDomainPair?: { primary: string; secondary: string; correlation: string };
  recommendedAction: string;
}

interface PatternIntelligenceProps {
  districts: District[];
  requests: CitizenRequest[];
  onNavigateToMap: () => void;
  onNavigateToRecommendations: () => void;
  onNavigateToPolicyLab: (districtId: string, category: InfrastructureCategory) => void;
}

export const PatternIntelligence: React.FC<PatternIntelligenceProps> = ({
  districts,
  requests,
  onNavigateToMap,
  onNavigateToRecommendations,
  onNavigateToPolicyLab,
}) => {
  const [activeFilter, setActiveFilter] = useState<PatternCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPatternModal, setSelectedPatternModal] = useState<PatternItem | null>(null);

  const mainDistrict = districts[0] || { name: 'Primary District', id: 'dist-01', state: 'State Region', population: 2400000 };
  const secondDistrict = districts[1] || { name: 'Secondary District', id: 'dist-02', state: 'State Region', population: 1800000 };
  const thirdDistrict = districts[2] || { name: 'Tertiary District', id: 'dist-03', state: 'State Region', population: 1200000 };

  // Dynamically generated patterns based on current selected country's districts
  const detectedPatterns: PatternItem[] = useMemo(() => {
    return [
      {
        id: 'pat-01',
        title: `Water Complaint Surge in Rural ${mainDistrict.name}`,
        type: 'Emerging',
        priorityLabel: 'CRITICAL',
        districtName: mainDistrict.name,
        districtId: mainDistrict.id,
        state: mainDistrict.state,
        category: 'Water',
        summary: `Water complaints are clustering around 12 villages in ${mainDistrict.name} district following a pipeline pressure breakdown.`,
        metrics: {
          changePct: '+43%',
          affectedVillagesCount: 12,
          nearbyFailuresCount: 3,
          citizenSignalsCount: 1842,
          confidencePct: 91,
          timeframe: 'Last 30 Days',
          baselineRate: '120 req/wk',
          currentRate: '420 req/wk',
        },
        details: {
          what: 'Unfiltered ground turbidity and broken distribution valves causing acute water supply interruption.',
          where: `12 contiguous rural villages in northern ${mainDistrict.name} within a 15 km radius.`,
          whoIsAffected: '42,000 rural residents, 14 local primary schools, and 3 rural health clinics.',
          whatItIndicates: 'Rapid structural deterioration of the 15-year-old rural water pipeline trunk.',
        },
        monthlyTrendData: [
          { month: 'Apr', count: 110 },
          { month: 'May', count: 135 },
          { month: 'Jun', count: 190 },
          { month: 'Jul', count: 320 },
          { month: 'Aug', count: 680 },
          { month: 'Sep', count: 1842 },
        ],
        recommendedAction: 'Prioritize expansion & trunk pipe replacement across 12 identified villages (BUILD / UPGRADE intervention).',
      },
      {
        id: 'pat-02',
        title: `Cross-Domain Link: Poor Road Transit & Missed Healthcare Access`,
        type: 'Cross-Domain',
        priorityLabel: 'HIGH',
        districtName: secondDistrict.name,
        districtId: secondDistrict.id,
        state: secondDistrict.state,
        category: 'Healthcare',
        summary: `Villages with severe road pothole damage correlate with 2.4× higher missed emergency healthcare complaints.`,
        metrics: {
          changePct: '+2.4x Correlation',
          affectedVillagesCount: 18,
          nearbyFailuresCount: 5,
          citizenSignalsCount: 2310,
          confidencePct: 88,
          timeframe: 'Last 60 Days',
        },
        details: {
          what: 'Citizen complaints reveal emergency ambulances cannot reach rural health posts due to washed-out road corridors.',
          where: `Eastern rural block of ${secondDistrict.name} connecting to Regional Hospital.`,
          whoIsAffected: '56,000 citizens needing maternal and urgent trauma care transport.',
          whatItIndicates: 'Healthcare access issues in this zone are driven primarily by transit infrastructure deficits rather than clinic staffing shortages.',
        },
        crossDomainPair: {
          primary: 'Road Connectivity Deficit (78%)',
          secondary: 'Emergency Healthcare Delays (84%)',
          correlation: '0.86 Strong Positive Correlation',
        },
        recommendedAction: 'Repair critical 18 km hospital access road before expanding local hospital ward bed capacity (FIX intervention).',
      },
      {
        id: 'pat-[#03]',
        title: `Sudden Waste Management Anomaly in ${thirdDistrict.name} Urban Center`,
        type: 'Anomaly',
        priorityLabel: 'CRITICAL',
        districtName: thirdDistrict.name,
        districtId: thirdDistrict.id,
        state: thirdDistrict.state,
        category: 'Drainage',
        summary: `Solid waste complaints surged +332% over 14 days following municipal contractor collection route changes.`,
        metrics: {
          changePct: '+332%',
          affectedVillagesCount: 8,
          nearbyFailuresCount: 2,
          citizenSignalsCount: 1240,
          confidencePct: 94,
          timeframe: 'Last 14 Days',
          baselineRate: '40 req/wk',
          currentRate: '173 req/wk',
        },
        details: {
          what: 'Uncollected refuse overflowing into primary stormwater drains causing localized flash flooding.',
          where: `Wards 4, 7, and 12 of ${thirdDistrict.name} Municipal Sector.`,
          whoIsAffected: '31,000 urban households and commercial market vendors.',
          whatItIndicates: 'Abrupt operational failure in outsourced municipal refuse collection contract.',
        },
        recommendedAction: 'Deploy emergency municipal sanitation trucks and review contractor SLA compliance (POLICY intervention).',
      },
      {
        id: 'pat-04',
        title: `Persistent 6-Month Road Deterioration on Primary Arterial Highway`,
        type: 'Recurring',
        priorityLabel: 'HIGH',
        districtName: mainDistrict.name,
        districtId: mainDistrict.id,
        state: mainDistrict.state,
        category: 'Roads',
        summary: `The same 14 km arterial road has generated citizen complaints for 6 consecutive months despite temporary patch repairs.`,
        metrics: {
          changePct: '6 Months Active',
          affectedVillagesCount: 14,
          nearbyFailuresCount: 4,
          citizenSignalsCount: 1980,
          confidencePct: 92,
          timeframe: 'Last 6 Months',
        },
        details: {
          what: 'Repeated asphalt patching washes away during monsoons due to missing side drainage conduits.',
          where: `Main Trade Highway corridor linking ${mainDistrict.name} to logistics ports.`,
          whoIsAffected: '95,000 daily commuters, freight transporters, and local bus routes.',
          whatItIndicates: 'Sub-surface water logging makes surface patching ineffective; permanent drainage reconstruction is mandatory.',
        },
        monthlyTrendData: [
          { month: 'Apr', count: 180 },
          { month: 'May', count: 210 },
          { month: 'Jun', count: 310 },
          { month: 'Jul', count: 390 },
          { month: 'Aug', count: 420 },
          { month: 'Sep', count: 470 },
        ],
        recommendedAction: 'Sanction permanent asphalt layer overhaul with reinforced concrete drainage conduits (BUILD / FIX intervention).',
      },
      {
        id: 'pat-05',
        title: `Digital Connectivity Barrier Impairing Public Service Access`,
        type: 'Trend',
        priorityLabel: 'MODERATE',
        districtName: secondDistrict.name,
        districtId: secondDistrict.id,
        state: secondDistrict.state,
        category: 'Education',
        summary: `Villages with low telecom connectivity show 2.4× more complaints regarding difficulty accessing e-governance & student portals.`,
        metrics: {
          changePct: '+37% in 6 wks',
          affectedVillagesCount: 22,
          nearbyFailuresCount: 1,
          citizenSignalsCount: 890,
          confidencePct: 86,
          timeframe: 'Last 6 Weeks',
        },
        details: {
          what: 'Students and elderly citizens unable to submit digital pension & scholarship verification forms online.',
          where: `22 interior rural habitations across ${secondDistrict.name}.`,
          whoIsAffected: '18,000 students and senior citizens seeking social security benefits.',
          whatItIndicates: 'Digital exclusion created by inadequate 4G/5G tower density in rural periphery.',
        },
        recommendedAction: 'Establish assisted digital government service kiosks in local panchayat offices (POLICY intervention).',
      },
      {
        id: 'pat-06',
        title: `Transformer Burnout Cluster in High-Density Agriculture Belt`,
        type: 'Cluster',
        priorityLabel: 'HIGH',
        districtName: thirdDistrict.name,
        districtId: thirdDistrict.id,
        state: thirdDistrict.state,
        category: 'Electricity',
        summary: `Geographic cluster of 16 electricity distribution transformer failures within a 10 km agricultural zone.`,
        metrics: {
          changePct: '+85% spikes',
          affectedVillagesCount: 10,
          nearbyFailuresCount: 16,
          citizenSignalsCount: 1560,
          confidencePct: 89,
          timeframe: 'Last 21 Days',
        },
        details: {
          what: 'Unregulated agricultural pump set usage causing severe voltage fluctuations and transformer coil burnout.',
          where: `Southern farming belt of ${thirdDistrict.name}.`,
          whoIsAffected: '28,000 farmers dependent on electric irrigation pumps during crop cycle.',
          whatItIndicates: 'Grid sub-station overload requiring dedicated agricultural feeder separation.',
        },
        recommendedAction: 'Install 200 kVA feeder transformers and smart load regulators (UPGRADE intervention).',
      },
    ];
  }, [mainDistrict, secondDistrict, thirdDistrict]);

  const filteredPatterns = useMemo(() => {
    return detectedPatterns.filter((pat) => {
      const matchFilter = activeFilter === 'ALL' || pat.type === activeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        pat.title.toLowerCase().includes(q) ||
        pat.summary.toLowerCase().includes(q) ||
        pat.districtName.toLowerCase().includes(q) ||
        pat.category.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [detectedPatterns, activeFilter, searchQuery]);

  const getCategoryIcon = (cat: InfrastructureCategory) => {
    switch (cat) {
      case 'Water': return <Droplet className="w-4 h-4 text-blue-600" />;
      case 'Roads': return <Route className="w-4 h-4 text-amber-600" />;
      case 'Drainage': return <Activity className="w-4 h-4 text-cyan-600" />;
      case 'Electricity': return <Zap className="w-4 h-4 text-yellow-600" />;
      case 'Healthcare':
      case 'Health': return <HeartPulse className="w-4 h-4 text-rose-600" />;
      case 'Education': return <GraduationCap className="w-4 h-4 text-purple-600" />;
      default: return <Building2 className="w-4 h-4 text-slate-600" />;
    }
  };

  const getTypeBadge = (type: PatternItem['type']) => {
    switch (type) {
      case 'Emerging':
        return <span className="px-2.5 py-0.5 text-[10px] font-mono font-extrabold uppercase bg-rose-500 text-white border border-[#171717] shadow-[1px_1px_0px_#171717]">🔴 EMERGING PATTERN</span>;
      case 'Cross-Domain':
        return <span className="px-2.5 py-0.5 text-[10px] font-mono font-extrabold uppercase bg-purple-600 text-white border border-[#171717] shadow-[1px_1px_0px_#171717]">🔗 CROSS-DOMAIN</span>;
      case 'Anomaly':
        return <span className="px-2.5 py-0.5 text-[10px] font-mono font-extrabold uppercase bg-amber-400 text-[#171717] border border-[#171717] shadow-[1px_1px_0px_#171717]">🚨 ANOMALY DETECTED</span>;
      case 'Recurring':
        return <span className="px-2.5 py-0.5 text-[10px] font-mono font-extrabold uppercase bg-red-700 text-white border border-[#171717] shadow-[1px_1px_0px_#171717]">🔥 RECURRING ISSUE</span>;
      case 'Cluster':
        return <span className="px-2.5 py-0.5 text-[10px] font-mono font-extrabold uppercase bg-blue-600 text-white border border-[#171717] shadow-[1px_1px_0px_#171717]">🗺️ GEOGRAPHIC CLUSTER</span>;
      case 'Trend':
        return <span className="px-2.5 py-0.5 text-[10px] font-mono font-extrabold uppercase bg-emerald-600 text-white border border-[#171717] shadow-[1px_1px_0px_#171717]">📈 TREND PATTERN</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-sans text-[#171717]">
      {/* Top Banner */}
      <div className="bg-white border border-[#171717] p-6 sm:p-8 shadow-[4px_4px_0px_#171717]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#171717]/15">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest bg-[#171717] text-[#F7F5EF] border border-[#171717]">
                CIVICPULSE AI PATTERN INTELLIGENCE
              </span>
              <span className="text-xs font-mono text-[#171717]/60">
                • 1,284,392 SIGNALS ANALYZED
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171717] tracking-tight">
              Pattern Intelligence Feed
            </h1>
            <p className="text-xs sm:text-sm text-[#171717]/80 max-w-3xl leading-relaxed">
              Detecting recurring anomalies, cross-domain correlations, and geographic complaint clusters before they evolve into widespread infrastructure crises.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3 bg-[#F7F5EF] border border-[#171717] shadow-[2px_2px_0px_#171717] text-center">
              <span className="text-[9px] font-mono uppercase text-[#171717]/60 block font-bold">ACTIVE PATTERNS</span>
              <span className="text-xl font-serif font-bold text-[#D65A3A]">{detectedPatterns.length} Identified</span>
            </div>
            <div className="p-3 bg-[#F7F5EF] border border-[#171717] shadow-[2px_2px_0px_#171717] text-center">
              <span className="text-[9px] font-mono uppercase text-[#171717]/60 block font-bold">AVG CONFIDENCE</span>
              <span className="text-xl font-serif font-bold text-emerald-700">90.2%</span>
            </div>
          </div>
        </div>

        {/* 3 AI Architecture Connection Step */}
        <div className="mt-6 p-4 bg-[#F7F5EF] border border-[#171717] shadow-[2px_2px_0px_#171717]">
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D65A3A] mb-2">
            INTEGRATED AI DECISION PIPELINE:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-center text-xs font-mono font-bold">
            <div className="p-2 bg-white border border-[#171717]/30 flex items-center justify-center gap-1.5">
              <span>01. Citizen Voice</span>
            </div>
            <div className="p-2 bg-[#D65A3A] text-white border border-[#171717] flex items-center justify-center gap-1.5 shadow-[1px_1px_0px_#171717]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>02. Pattern Discovery</span>
            </div>
            <div className="p-2 bg-white border border-[#171717]/30 flex items-center justify-center gap-1.5">
              <span>03. Priority Engine</span>
            </div>
            <div className="p-2 bg-white border border-[#171717]/30 flex items-center justify-center gap-1.5">
              <span>04. Interventions</span>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-900 border border-emerald-400 flex items-center justify-center gap-1.5">
              <span>05. Official Action</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border border-[#171717] p-4 shadow-[3px_3px_0px_#171717] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#171717]/70 block mb-1">
            PATTERN INTELLIGENCE FILTERS
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'ALL PATTERNS' },
              { id: 'Emerging', label: '🔴 EMERGING' },
              { id: 'Cross-Domain', label: '🔗 CROSS-DOMAIN' },
              { id: 'Anomaly', label: '🚨 ANOMALIES' },
              { id: 'Recurring', label: '🔥 RECURRING' },
              { id: 'Cluster', label: '🗺️ CLUSTERS' },
              { id: 'Trend', label: '📈 TRENDS' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveFilter(item.id as PatternCategory)}
                className={`px-3 py-1.5 font-mono text-xs font-bold uppercase transition-all cursor-pointer border border-[#171717] ${
                  activeFilter === item.id
                    ? 'bg-[#171717] text-[#F7F5EF] shadow-[2px_2px_0px_#D65A3A]'
                    : 'bg-[#F7F5EF] text-[#171717] hover:bg-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-[#171717]/50 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search patterns or districts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F7F5EF] border border-[#171717] pl-8 pr-3 py-1.5 text-xs text-[#171717] placeholder:text-[#171717]/50 focus:outline-none focus:bg-white font-mono"
          />
        </div>
      </div>

      {/* Pattern Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPatterns.map((pat) => (
          <div
            key={pat.id}
            className="bg-white border border-[#171717] p-6 shadow-[4px_4px_0px_#171717] flex flex-col justify-between space-y-5 hover:shadow-[6px_6px_0px_#171717] transition-all"
          >
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#171717]/10 pb-3">
                {getTypeBadge(pat.type)}
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#171717]/80 bg-[#F7F5EF] px-2.5 py-1 border border-[#171717]">
                  {pat.districtName.toUpperCase()}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#D65A3A] uppercase tracking-wider mb-1">
                  {getCategoryIcon(pat.category)}
                  <span>{pat.category} CATEGORY</span>
                </div>
                <h3 className="text-lg font-serif font-bold text-[#171717] leading-snug">
                  {pat.title}
                </h3>
              </div>
            </div>

            {/* Pattern Metrics Card */}
            <div className="p-4 bg-[#F7F5EF] border border-[#171717] space-y-3">
              <p className="text-xs font-medium text-[#171717] leading-relaxed">
                {pat.summary}
              </p>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-2 border-t border-[#171717]/15">
                <div>
                  <span className="text-[9px] text-[#171717]/60 block font-bold">SIGNAL SPIKE</span>
                  <span className="font-extrabold text-[#D65A3A]">{pat.metrics.changePct || pat.metrics.citizenSignalsCount}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#171717]/60 block font-bold">AFFECTED HABITATIONS</span>
                  <span className="font-bold text-[#171717]">{pat.metrics.affectedVillagesCount} villages/wards</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#171717]/60 block font-bold">AI CONFIDENCE</span>
                  <span className="font-extrabold text-emerald-700">{pat.metrics.confidencePct}%</span>
                </div>
              </div>
            </div>

            {/* If monthly trend available */}
            {pat.monthlyTrendData && (
              <div className="p-3 bg-white border border-[#171717]/40 space-y-1 font-mono text-[10px]">
                <span className="font-bold uppercase text-[#171717]/60 block">6-MONTH COMPLAINT TRAJECTORY:</span>
                <div className="flex items-end justify-between gap-1 h-12 pt-1 border-b border-[#171717]/20">
                  {pat.monthlyTrendData.map((d, i) => {
                    const max = Math.max(...pat.monthlyTrendData!.map((m) => m.count));
                    const hPct = Math.round((d.count / max) * 100);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-[#D65A3A] border border-[#171717]"
                          style={{ height: `${Math.max(15, hPct)}%` }}
                        />
                        <span className="text-[8px] text-[#171717]/70 font-bold">{d.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#171717]/10">
              <button
                onClick={() => setSelectedPatternModal(pat)}
                className="py-2.5 px-3 bg-white hover:bg-[#F7F5EF] border border-[#171717] font-mono text-xs font-bold uppercase text-[#171717] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#171717]"
              >
                <BarChart3 className="w-3.5 h-3.5 text-[#D65A3A]" />
                <span>Investigate Pattern →</span>
              </button>

              <button
                onClick={() => onNavigateToRecommendations()}
                className="py-2.5 px-3 bg-[#171717] hover:bg-[#171717]/90 border border-[#171717] font-mono text-xs font-bold uppercase text-[#F7F5EF] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#D65A3A]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D65A3A]" />
                <span>Recommendation Portal →</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PATTERN EVIDENCE & AUDIT MODAL */}
      {selectedPatternModal && (
        <div className="fixed inset-0 z-50 bg-[#171717]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F7F5EF] border-2 border-[#171717] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_#171717] p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-[#171717] pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D65A3A] block">
                  AI PATTERN EVIDENCE BREAKDOWN
                </span>
                <h3 className="text-xl font-serif font-bold text-[#171717]">
                  {selectedPatternModal.title}
                </h3>
                <div className="flex items-center gap-2 mt-1 font-mono text-xs text-[#171717]/70">
                  <span>{selectedPatternModal.districtName} ({selectedPatternModal.state})</span>
                  <span>•</span>
                  <span className="font-bold text-emerald-700">Confidence: {selectedPatternModal.metrics.confidencePct}%</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedPatternModal(null)}
                className="p-1 bg-white hover:bg-rose-100 border border-[#171717] cursor-pointer"
              >
                <X className="w-5 h-5 text-[#171717]" />
              </button>
            </div>

            {/* 4 Answers: WHAT, WHERE, WHO IS AFFECTED, WHAT IT INDICATES */}
            <div className="space-y-3 font-mono text-xs">
              <div className="bg-white border border-[#171717] p-4 space-y-1 shadow-[2px_2px_0px_#171717]">
                <span className="font-bold text-[#D65A3A] uppercase text-[10px] block">WHAT IS HAPPENING?</span>
                <p className="text-[#171717] leading-relaxed">{selectedPatternModal.details.what}</p>
              </div>

              <div className="bg-white border border-[#171717] p-4 space-y-1 shadow-[2px_2px_0px_#171717]">
                <span className="font-bold text-[#D65A3A] uppercase text-[10px] block">WHERE IS IT HAPPENING?</span>
                <p className="text-[#171717] leading-relaxed">{selectedPatternModal.details.where}</p>
              </div>

              <div className="bg-white border border-[#171717] p-4 space-y-1 shadow-[2px_2px_0px_#171717]">
                <span className="font-bold text-[#D65A3A] uppercase text-[10px] block">WHO IS AFFECTED?</span>
                <p className="text-[#171717] leading-relaxed">{selectedPatternModal.details.whoIsAffected}</p>
              </div>

              <div className="bg-white border border-[#171717] p-4 space-y-1 shadow-[2px_2px_0px_#171717]">
                <span className="font-bold text-[#D65A3A] uppercase text-[10px] block">WHAT MIGHT IT INDICATE?</span>
                <p className="text-[#171717] leading-relaxed font-bold">{selectedPatternModal.details.whatItIndicates}</p>
              </div>
            </div>

            {/* Recommended Policy Intervention */}
            <div className="p-4 bg-[#171717] text-[#F7F5EF] border border-[#171717] space-y-2 shadow-[3px_3px_0px_#D65A3A]">
              <span className="text-[10px] font-mono font-bold uppercase text-[#D65A3A] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                RECOMMENDED MUNICIPAL ACTION
              </span>
              <p className="font-serif font-bold text-sm leading-snug">
                {selectedPatternModal.recommendedAction}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedPatternModal(null);
                  onNavigateToMap();
                }}
                className="py-2.5 px-4 bg-white border border-[#171717] font-mono text-xs font-bold uppercase cursor-pointer shadow-[2px_2px_0px_#171717]"
              >
                [ View Hotspot Map ]
              </button>

              <button
                onClick={() => {
                  setSelectedPatternModal(null);
                  onNavigateToRecommendations();
                }}
                className="py-2.5 px-5 bg-[#D65A3A] text-white border border-[#171717] font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_#171717] cursor-pointer"
              >
                Go to Recommendations →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
