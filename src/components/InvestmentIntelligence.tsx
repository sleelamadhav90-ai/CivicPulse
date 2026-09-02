import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Building2, 
  CheckCircle2, 
  Clock, 
  PieChart, 
  ArrowRight, 
  Search, 
  Filter, 
  ShieldAlert, 
  FileCheck, 
  Layers, 
  BarChart3, 
  Sparkles,
  Info,
  ChevronRight,
  RefreshCw,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { District, InfrastructureCategory, InterventionType, InvestmentSchemeData, InvestmentAnomalySignal, InvestmentQuadrantType } from '../types';
import { STATE_INVESTMENT_OVERVIEW, MAJOR_GOVERNMENT_SCHEMES, ALL_INVESTMENT_ANOMALIES } from '../data/investmentData';

interface InvestmentIntelligenceProps {
  districts: District[];
  onNavigateToEngine?: () => void;
  onNavigateToPolicyLab?: (districtId: string, category: InfrastructureCategory) => void;
}

export const InvestmentIntelligence: React.FC<InvestmentIntelligenceProps> = ({
  districts,
  onNavigateToEngine,
  onNavigateToPolicyLab
}) => {
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedQuadrant, setSelectedQuadrant] = useState<string>('ALL');
  const [anomalySearchQuery, setAnomalySearchQuery] = useState<string>('');
  const [activeQuestionTab, setActiveQuestionTab] = useState<'FLOW' | 'UTILIZATION' | 'RESULTS' | 'MATRIX' | 'ANOMALIES'>('FLOW');

  // Modal inspection state for anomalies
  const [selectedAnomalyModal, setSelectedAnomalyModal] = useState<InvestmentAnomalySignal | null>(null);

  // Filter schemes
  const filteredSchemes = MAJOR_GOVERNMENT_SCHEMES.filter(scheme => {
    if (selectedSchemeId !== 'ALL' && scheme.schemeId !== selectedSchemeId) return false;
    if (selectedCategory !== 'ALL' && scheme.category !== selectedCategory) return false;
    if (selectedQuadrant !== 'ALL' && scheme.quadrant !== selectedQuadrant) return false;
    return true;
  });

  // Filter anomalies
  const filteredAnomalies = ALL_INVESTMENT_ANOMALIES.filter(anomaly => {
    if (selectedCategory !== 'ALL' && anomaly.schemeName.toLowerCase().indexOf(selectedCategory.toLowerCase()) === -1) return false;
    if (anomalySearchQuery) {
      const q = anomalySearchQuery.toLowerCase();
      return anomaly.title.toLowerCase().includes(q) || 
             anomaly.districtName.toLowerCase().includes(q) ||
             anomaly.department.toLowerCase().includes(q);
    }
    return true;
  });

  const formatCr = (inr: number) => `₹${(inr / 10000000).toFixed(1)} Cr`;

  return (
    <div className="space-[#171717] space-y-8 font-sans">
      
      {/* HEADER & STATE FINANCIAL OVERVIEW HERO */}
      <div className="bg-[#171717] text-[#F7F5EF] p-6 border-2 border-[#171717] shadow-[6px_6px_0px_#D65A3A]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/20 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-[#D65A3A] text-white text-[10px] font-mono font-bold tracking-widest uppercase">
                DATA LAYER #4
              </span>
              <span className="text-xs font-mono text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                INVESTMENT & PLAN INTELLIGENCE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight uppercase">
              GOVERNMENT INVESTMENT & OUTCOME AUDIT
            </h1>
            <p className="text-xs sm:text-sm font-mono text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Comparing what citizens ask for with what infrastructure exists and where state capital has been allocated, spent, or delayed.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <button 
              onClick={onNavigateToEngine}
              className="px-3 py-2 bg-[#D65A3A] hover:bg-[#c24a2c] text-white font-bold transition-all shadow-[2px_2px_0px_#ffffff] flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Priority Engine</span>
            </button>
          </div>
        </div>

        {/* FINANCIAL SUMMARY METRICS (4 CAPITAL PIPELINE STATS) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-2 font-mono">
          <div className="bg-white/10 p-3.5 border border-white/10 space-y-1">
            <span className="text-[10px] text-slate-300 uppercase tracking-widest block font-bold">TOTAL ALLOCATED</span>
            <div className="text-xl sm:text-2xl font-bold text-white flex items-baseline gap-1">
              {formatCr(STATE_INVESTMENT_OVERVIEW.allocatedInr)}
            </div>
            <span className="text-[9px] text-slate-400 block">6 Core Infrastructure Schemes</span>
          </div>

          <div className="bg-white/10 p-3.5 border border-white/10 space-y-1">
            <span className="text-[10px] text-amber-300 uppercase tracking-widest block font-bold">RELEASED FUNDS</span>
            <div className="text-xl sm:text-2xl font-bold text-amber-300 flex items-baseline gap-1">
              {formatCr(STATE_INVESTMENT_OVERVIEW.releasedInr)}
            </div>
            <span className="text-[9px] text-slate-400 block">81.6% of State Sanctions</span>
          </div>

          <div className="bg-white/10 p-3.5 border border-white/10 space-y-1">
            <span className="text-[10px] text-emerald-400 uppercase tracking-widest block font-bold">SPENT / EXPENDED</span>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 flex items-baseline gap-1">
              {formatCr(STATE_INVESTMENT_OVERVIEW.spentInr)}
            </div>
            <span className="text-[9px] text-slate-400 block">{STATE_INVESTMENT_OVERVIEW.utilizationPct}% Utilization Rate</span>
          </div>

          <div className="bg-white/10 p-3.5 border border-white/10 space-y-1">
            <span className="text-[10px] text-[#D65A3A] uppercase tracking-widest block font-bold">UNUTILIZED / REMAINING</span>
            <div className="text-xl sm:text-2xl font-bold text-[#D65A3A] flex items-baseline gap-1">
              {formatCr(STATE_INVESTMENT_OVERVIEW.remainingInr)}
            </div>
            <span className="text-[9px] text-slate-400 block">22.5% Capital Sitting Idle</span>
          </div>
        </div>
      </div>

      {/* 5 CORE QUESTIONS TAB NAVIGATION */}
      <div className="bg-[#F7F5EF] border border-[#171717] p-2 space-y-2 shadow-[3px_3px_0px_#171717]">
        <div className="text-[10px] font-mono font-bold text-[#171717]/70 uppercase tracking-widest px-2 pt-1">
          FIVE AUDIT QUESTIONS & DATA EXPLORATION MODULES:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono font-bold">
          <button
            onClick={() => setActiveQuestionTab('FLOW')}
            className={`p-2.5 text-left border transition-all cursor-pointer ${
              activeQuestionTab === 'FLOW'
                ? 'bg-[#171717] text-[#F7F5EF] border-[#171717] shadow-[2px_2px_0px_#D65A3A]'
                : 'bg-white text-[#171717] border-[#171717]/30 hover:border-[#171717]'
            }`}
          >
            <div className="text-[9px] text-[#D65A3A] uppercase font-mono">Q1. ALLOCATION</div>
            <div className="truncate font-serif font-bold text-xs mt-0.5">💰 Where is money going?</div>
          </button>

          <button
            onClick={() => setActiveQuestionTab('UTILIZATION')}
            className={`p-2.5 text-left border transition-all cursor-pointer ${
              activeQuestionTab === 'UTILIZATION'
                ? 'bg-[#171717] text-[#F7F5EF] border-[#171717] shadow-[2px_2px_0px_#D65A3A]'
                : 'bg-white text-[#171717] border-[#171717]/30 hover:border-[#171717]'
            }`}
          >
            <div className="text-[9px] text-[#D65A3A] uppercase font-mono">Q2. UTILIZATION</div>
            <div className="truncate font-serif font-bold text-xs mt-0.5">📉 Is money spent?</div>
          </button>

          <button
            onClick={() => setActiveQuestionTab('RESULTS')}
            className={`p-2.5 text-left border transition-all cursor-pointer ${
              activeQuestionTab === 'RESULTS'
                ? 'bg-[#171717] text-[#F7F5EF] border-[#171717] shadow-[2px_2px_0px_#D65A3A]'
                : 'bg-white text-[#171717] border-[#171717]/30 hover:border-[#171717]'
            }`}
          >
            <div className="text-[9px] text-[#D65A3A] uppercase font-mono">Q3. RESULTS</div>
            <div className="truncate font-serif font-bold text-xs mt-0.5">🏗️ Output vs Complaints</div>
          </button>

          <button
            onClick={() => setActiveQuestionTab('MATRIX')}
            className={`p-2.5 text-left border transition-all cursor-pointer ${
              activeQuestionTab === 'MATRIX'
                ? 'bg-[#171717] text-[#F7F5EF] border-[#171717] shadow-[2px_2px_0px_#D65A3A]'
                : 'bg-white text-[#171717] border-[#171717]/30 hover:border-[#171717]'
            }`}
          >
            <div className="text-[9px] text-[#D65A3A] uppercase font-mono">Q4. TARGETING</div>
            <div className="truncate font-serif font-bold text-xs mt-0.5">🗺️ Need vs Investment</div>
          </button>

          <button
            onClick={() => setActiveQuestionTab('ANOMALIES')}
            className={`p-2.5 text-left border transition-all cursor-pointer relative ${
              activeQuestionTab === 'ANOMALIES'
                ? 'bg-[#171717] text-[#F7F5EF] border-[#171717] shadow-[2px_2px_0px_#D65A3A]'
                : 'bg-amber-100 text-[#171717] border-amber-400 hover:border-[#171717]'
            }`}
          >
            <div className="text-[9px] text-[#D65A3A] uppercase font-mono flex items-center justify-between">
              <span>Q5. ANOMALIES</span>
              <span className="w-2 h-2 rounded-full bg-[#D65A3A] animate-pulse"></span>
            </div>
            <div className="truncate font-serif font-bold text-xs mt-0.5 text-[#D65A3A]">🚨 AI Audit Signals ({ALL_INVESTMENT_ANOMALIES.length})</div>
          </button>
        </div>
      </div>

      {/* MODULE 1: Q1 — SCHEME ALLOCATION EXPLORER */}
      {activeQuestionTab === 'FLOW' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#171717] p-5 space-y-4 shadow-[4px_4px_0px_#171717]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#171717]/15 pb-3">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#171717] uppercase flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#D65A3A]" />
                  1. WHERE IS THE MONEY GOING? (SCHEME & DEPT ALLOCATION)
                </h2>
                <p className="text-xs font-mono text-[#171717]/70">
                  Breakdown by State → District → Department → Scheme → Project.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="p-1.5 bg-[#F7F5EF] border border-[#171717] font-bold"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Water">Water</option>
                  <option value="Roads">Roads</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Drainage">Drainage</option>
                </select>
              </div>
            </div>

            {/* Scheme Allocation Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSchemes.map((scheme) => (
                <div 
                  key={scheme.schemeId}
                  className="bg-[#F7F5EF] border-2 border-[#171717] p-4 space-y-3 shadow-[3px_3px_0px_#171717] font-mono hover:border-[#D65A3A] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-[#171717]/15 pb-2">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#D65A3A] block">
                        {scheme.department}
                      </span>
                      <h3 className="text-sm font-bold text-[#171717] leading-snug">
                        {scheme.schemeName}
                      </h3>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 border ${
                      scheme.quadrant === 'RED_HIGH_NEED_LOW_INVESTMENT' 
                        ? 'bg-rose-100 text-rose-900 border-rose-400'
                        : scheme.quadrant === 'YELLOW_HIGH_INVESTMENT_POOR_OUTCOME'
                        ? 'bg-amber-100 text-amber-900 border-amber-400'
                        : 'bg-emerald-100 text-emerald-900 border-emerald-400'
                    }`}>
                      {scheme.quadrant === 'RED_HIGH_NEED_LOW_INVESTMENT' ? '🔴 High Need / Low Funding'
                        : scheme.quadrant === 'YELLOW_HIGH_INVESTMENT_POOR_OUTCOME' ? '🟡 High Spent / Poor Outcome'
                        : '🟢 Adequate Funding'}
                    </span>
                  </div>

                  {/* Financial Flow Numbers */}
                  <div className="grid grid-cols-4 gap-2 text-center text-xs bg-white p-2 border border-[#171717]/30">
                    <div>
                      <span className="text-[9px] text-[#171717]/60 block uppercase">Allocated</span>
                      <span className="font-bold text-[#171717]">{formatCr(scheme.stateAllocationInr)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#171717]/60 block uppercase">Released</span>
                      <span className="font-bold text-amber-800">{formatCr(scheme.releasedInr)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#171717]/60 block uppercase">Spent</span>
                      <span className="font-bold text-emerald-800">{formatCr(scheme.spentInr)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#171717]/60 block uppercase">Unspent</span>
                      <span className="font-bold text-[#D65A3A]">{formatCr(scheme.remainingInr)}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-[#171717]/80">
                      <span>Fund Expenditure Utilization:</span>
                      <span className="font-bold">{scheme.utilizationPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 border border-[#171717]/20 overflow-hidden">
                      <div 
                        className={`h-full ${scheme.utilizationPct > 80 ? 'bg-emerald-600' : scheme.utilizationPct > 65 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${scheme.utilizationPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Projects Status Summary */}
                  <div className="flex justify-between items-center text-[10px] text-[#171717]/80 pt-1 border-t border-[#171717]/10">
                    <span>
                      <strong>{scheme.totalProjects}</strong> Projects ({scheme.completedProjects} Completed, <span className="text-amber-800 font-bold">{scheme.delayedProjects} Delayed</span>)
                    </span>
                    <span className="bg-rose-50 text-rose-800 font-bold px-1.5 py-0.2 border border-rose-300">
                      🗣️ {scheme.citizenComplaintsCount.toLocaleString()} Complaints
                    </span>
                  </div>

                  {/* Primary Anomaly Signal Note */}
                  {scheme.primaryAnomaly && (
                    <div className="p-2 bg-amber-50 border border-amber-300 text-[10px] space-y-1">
                      <span className="font-bold text-amber-900 flex items-center gap-1 uppercase">
                        <AlertTriangle className="w-3 h-3 text-amber-700" />
                        AI Audit Signal: {scheme.primaryAnomaly.type}
                      </span>
                      <p className="text-amber-950 italic">
                        "{scheme.primaryAnomaly.outcomeTrend}"
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODULE 2: Q2 — MONEY UTILIZATION PIPELINE */}
      {activeQuestionTab === 'UTILIZATION' && (
        <div className="space-y-6 font-mono">
          <div className="bg-white border border-[#171717] p-5 space-y-5 shadow-[4px_4px_0px_#171717]">
            <div className="border-b border-[#171717]/15 pb-3">
              <h2 className="text-lg font-serif font-bold text-[#171717] uppercase flex items-center gap-2">
                <PieChart className="w-5 h-5 text-[#D65A3A]" />
                2. IS MONEY BEING UTILIZED? (CAPITAL PIPELINE AUDIT)
              </h2>
              <p className="text-xs text-[#171717]/70">
                Tracking fund leakages and bottlenecks between Allocation → Release → Expenditure → Idle Funds.
              </p>
            </div>

            {/* CAPITAL WATERFALL FLOW */}
            <div className="bg-[#F7F5EF] border border-[#171717] p-4 space-y-4">
              <span className="text-xs font-bold text-[#171717] uppercase block tracking-wider">
                STATE CAPITAL PIPELINE STAGE COMPARISON (STATEWIDE)
              </span>

              <div className="space-y-3">
                {/* Allocation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-[#171717]">
                    <span>1. Approved Budget Allocation:</span>
                    <span>{formatCr(STATE_INVESTMENT_OVERVIEW.allocatedInr)} (100%)</span>
                  </div>
                  <div className="w-full h-4 bg-slate-200 border border-[#171717]">
                    <div className="h-full bg-[#171717]" style={{ width: '100%' }} />
                  </div>
                </div>

                {/* Released */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-[#171717]">
                    <span>2. Released to State Treasury / Departments:</span>
                    <span className="text-amber-800">{formatCr(STATE_INVESTMENT_OVERVIEW.releasedInr)} (81.6%)</span>
                  </div>
                  <div className="w-full h-4 bg-slate-200 border border-[#171717]">
                    <div className="h-full bg-amber-600" style={{ width: '81.6%' }} />
                  </div>
                </div>

                {/* Spent */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-[#171717]">
                    <span>3. Actual Ground Expenditure (Invoices Paid):</span>
                    <span className="text-emerald-800">{formatCr(STATE_INVESTMENT_OVERVIEW.spentInr)} (63.3% of total)</span>
                  </div>
                  <div className="w-full h-4 bg-slate-200 border border-[#171717]">
                    <div className="h-full bg-emerald-600" style={{ width: '63.3%' }} />
                  </div>
                </div>

                {/* Idle / Unutilized */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-[#D65A3A]">
                    <span>4. Unutilized Balance (Idle Capital):</span>
                    <span>{formatCr(STATE_INVESTMENT_OVERVIEW.remainingInr)} (22.5% of released funds)</span>
                  </div>
                  <div className="w-full h-4 bg-slate-200 border border-[#171717]">
                    <div className="h-full bg-[#D65A3A]" style={{ width: '22.5%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Department Utilization Leaderboard */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#171717] uppercase block tracking-wider">
                DEPARTMENTAL UTILIZATION & UNSPENT BALANCES
              </span>

              <div className="border border-[#171717] divide-y divide-[#171717]/20 text-xs">
                {MAJOR_GOVERNMENT_SCHEMES.map(s => (
                  <div key={s.schemeId} className="p-3 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="font-bold text-[#171717]">{s.schemeName}</span>
                      <p className="text-[10px] text-[#171717]/70">{s.department}</p>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="text-[9px] text-[#171717]/60 block uppercase">Spent / Allocated</span>
                        <span className="font-bold">{formatCr(s.spentInr)} / {formatCr(s.stateAllocationInr)}</span>
                      </div>

                      <div className="w-24">
                        <span className="text-[9px] text-[#171717]/60 block uppercase">Utilization</span>
                        <span className={`font-bold ${s.utilizationPct > 80 ? 'text-emerald-700' : 'text-amber-800'}`}>
                          {s.utilizationPct}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 3: Q3 — SPENDING VS CITIZEN OUTCOMES */}
      {activeQuestionTab === 'RESULTS' && (
        <div className="space-y-6 font-mono">
          <div className="bg-white border border-[#171717] p-5 space-y-5 shadow-[4px_4px_0px_#171717]">
            <div className="border-b border-[#171717]/15 pb-3">
              <h2 className="text-lg font-serif font-bold text-[#171717] uppercase flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#D65A3A]" />
                3. IS SPENDING PRODUCING RESULTS? (INVESTMENT → OUTPUT → OUTCOME)
              </h2>
              <p className="text-xs text-[#171717]/70">
                Cross-matching state capital spent against ground infrastructure outputs and citizen complaint trends.
              </p>
            </div>

            {/* CONVERSION PIPELINE EXAMPLES */}
            <div className="space-y-4">
              {/* Example 1: Water */}
              <div className="p-4 bg-[#F7F5EF] border-2 border-[#171717] space-y-3 shadow-[3px_3px_0px_#171717]">
                <div className="flex items-center justify-between border-b border-[#171717]/15 pb-2">
                  <span className="text-xs font-bold text-[#171717] uppercase flex items-center gap-1.5">
                    💧 RURAL WATER INFRASTRUCTURE AUDIT
                  </span>
                  <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-400 px-2 py-0.5 font-bold">
                    🔧 FIX / AUDIT REQUIRED
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 border border-[#171717] space-y-1">
                    <span className="text-[9px] text-[#D65A3A] uppercase font-bold block">1. INVESTMENT INPUT</span>
                    <span className="font-bold text-[#171717] text-sm block">₹39 Cr Spent</span>
                    <span className="text-[10px] text-[#171717]/70">Out of ₹50 Cr allocated under Jal Jeevan Mission.</span>
                  </div>

                  <div className="bg-white p-3 border border-[#171717] space-y-1">
                    <span className="text-[9px] text-[#D65A3A] uppercase font-bold block">2. INFRASTRUCTURE OUTPUT</span>
                    <span className="font-bold text-[#171717] text-sm block">82 Projects Completed</span>
                    <span className="text-[10px] text-amber-800 font-bold block">25 Projects Delayed / Stalled</span>
                  </div>

                  <div className="bg-white p-3 border border-[#171717] space-y-1">
                    <span className="text-[9px] text-[#D65A3A] uppercase font-bold block">3. CITIZEN GROUND OUTCOME</span>
                    <span className="font-bold text-rose-800 text-sm block">4,820 Complaints Active</span>
                    <span className="text-[10px] text-[#171717]/70">37 villages still lack functioning piped supply.</span>
                  </div>
                </div>

                <div className="p-2.5 bg-[#171717] text-[#F7F5EF] text-xs space-y-1">
                  <span className="text-amber-400 text-[10px] font-bold uppercase block">AI GAP EVALUATION:</span>
                  <p className="text-white text-[11px] leading-relaxed">
                    "₹39 Cr has already been spent, but 37 villages continue reporting water-access problems due to contractor delays on 25 pending pipelines. The AI Engine recommends 🔧 FIX / AUDIT rather than building new uncoordinated schemes."
                  </p>
                </div>
              </div>

              {/* Example 2: Roads */}
              <div className="p-4 bg-[#F7F5EF] border-2 border-[#171717] space-y-3 shadow-[3px_3px_0px_#171717]">
                <div className="flex items-center justify-between border-b border-[#171717]/15 pb-2">
                  <span className="text-xs font-bold text-[#171717] uppercase flex items-center gap-1.5">
                    🛣️ RURAL HIGHWAY CORRIDOR AUDIT
                  </span>
                  <span className="text-[9px] bg-rose-100 text-rose-900 border border-rose-400 px-2 py-0.5 font-bold">
                    🚨 POST-COMPLETION SPIKE
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 border border-[#171717] space-y-1">
                    <span className="text-[9px] text-[#D65A3A] uppercase font-bold block">1. INVESTMENT INPUT</span>
                    <span className="font-bold text-[#171717] text-sm block">₹20 Cr Spent</span>
                    <span className="text-[10px] text-[#171717]/70">PMGSY Rural Roads Phase 3.</span>
                  </div>

                  <div className="bg-white p-3 border border-[#171717] space-y-1">
                    <span className="text-[9px] text-[#D65A3A] uppercase font-bold block">2. INFRASTRUCTURE OUTPUT</span>
                    <span className="font-bold text-[#171717] text-sm block">42 km Asphalt Constructed</span>
                    <span className="text-[10px] text-[#171717]/70">Completed 90 days ago.</span>
                  </div>

                  <div className="bg-white p-3 border border-[#171717] space-y-1">
                    <span className="text-[9px] text-[#D65A3A] uppercase font-bold block">3. CITIZEN GROUND OUTCOME</span>
                    <span className="font-bold text-rose-800 text-sm block">+31% Complaint Surge</span>
                    <span className="text-[10px] text-rose-800 font-bold block">3,890 Pothole & Erosion Signals</span>
                  </div>
                </div>

                <div className="p-2.5 bg-[#171717] text-[#F7F5EF] text-xs space-y-1">
                  <span className="text-amber-400 text-[10px] font-bold uppercase block">AI GAP EVALUATION:</span>
                  <p className="text-white text-[11px] leading-relaxed">
                    "High spending (₹20 Cr) produced 42 km of road, but complaints increased 31% due to immediate asphalt surface peeling under monsoon traffic. Triggers contractor quality defect liability audit."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 4: Q4 — NEED VS INVESTMENT MATRIX */}
      {activeQuestionTab === 'MATRIX' && (
        <div className="space-y-6 font-mono">
          <div className="bg-white border border-[#171717] p-5 space-y-5 shadow-[4px_4px_0px_#171717]">
            <div className="border-b border-[#171717]/15 pb-3">
              <h2 className="text-lg font-serif font-bold text-[#171717] uppercase flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#D65A3A]" />
                4. ARE INVESTMENTS REACHING THE PLACES THAT NEED THEM? (4-QUADRANT MATRIX)
              </h2>
              <p className="text-xs text-[#171717]/70">
                Overlaying citizen demand intensity against government capital allocation per district.
              </p>
            </div>

            {/* 4 QUADRANT CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* QUADRANT 1: RED */}
              <div className="bg-rose-50 border-2 border-rose-500 p-4 space-y-3 shadow-[3px_3px_0px_#171717]">
                <div className="flex items-center justify-between border-b border-rose-300 pb-2">
                  <span className="text-xs font-bold text-rose-900 uppercase flex items-center gap-1.5">
                    🔴 HIGH NEED + LOW INVESTMENT
                  </span>
                  <span className="text-[9px] bg-rose-600 text-white px-2 py-0.5 font-bold">
                    CRITICAL FUNDING GAP
                  </span>
                </div>
                <p className="text-xs text-rose-900 leading-snug">
                  Districts/sectors with massive citizen complaint signals (5,000+ requests) but minimal state scheme capital allocated.
                </p>
                <div className="bg-white p-3 border border-rose-300 text-xs space-y-1">
                  <span className="font-bold text-[#171717] block">Vijayawada Outer Rural Healthcare & Kurnool Power Grid</span>
                  <p className="text-[10px] text-[#171717]/70">14,200 residents isolated from clinics; ₹11 Cr NHM funds sitting idle in treasury.</p>
                </div>
              </div>

              {/* QUADRANT 2: YELLOW */}
              <div className="bg-amber-50 border-2 border-amber-500 p-4 space-y-3 shadow-[3px_3px_0px_#171717]">
                <div className="flex items-center justify-between border-b border-amber-300 pb-2">
                  <span className="text-xs font-bold text-amber-900 uppercase flex items-center gap-1.5">
                    🟡 HIGH INVESTMENT + POOR OUTCOMES
                  </span>
                  <span className="text-[9px] bg-amber-600 text-white px-2 py-0.5 font-bold">
                    AUDIT & FIX REQUIRED
                  </span>
                </div>
                <p className="text-xs text-amber-900 leading-snug">
                  Sectors where millions have been spent, but complaints remain high due to contractor delays, poor quality, or maintenance failure.
                </p>
                <div className="bg-white p-3 border border-amber-300 text-xs space-y-1">
                  <span className="font-bold text-[#171717] block">Guntur Rural Water (JJM) & PMGSY Roads</span>
                  <p className="text-[10px] text-[#171717]/70">₹39 Cr spent, 25 projects delayed; road complaints up +31% post-construction.</p>
                </div>
              </div>

              {/* QUADRANT 3: GREEN */}
              <div className="bg-emerald-50 border-2 border-emerald-500 p-4 space-y-3 shadow-[3px_3px_0px_#171717]">
                <div className="flex items-center justify-between border-b border-emerald-300 pb-2">
                  <span className="text-xs font-bold text-emerald-900 uppercase flex items-center gap-1.5">
                    🟢 HIGH NEED + ADEQUATE INVESTMENT
                  </span>
                  <span className="text-[9px] bg-emerald-600 text-white px-2 py-0.5 font-bold">
                    ON TRACK / MONITOR
                  </span>
                </div>
                <p className="text-xs text-emerald-900 leading-snug">
                  High citizen demand areas where major state schemes have been properly funded and execution is progressing on schedule.
                </p>
                <div className="bg-white p-3 border border-emerald-300 text-xs space-y-1">
                  <span className="font-bold text-[#171717] block">Vijayawada Urban Drainage (Swachh Bharat)</span>
                  <p className="text-[10px] text-[#171717]/70">₹13 Cr spent, 30 outfall projects active; desilting work progressing.</p>
                </div>
              </div>

              {/* QUADRANT 4: GREY */}
              <div className="bg-slate-100 border-2 border-slate-400 p-4 space-y-3 shadow-[3px_3px_0px_#171717]">
                <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                  <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                    ⚪ LOW NEED + LOW INVESTMENT
                  </span>
                  <span className="text-[9px] bg-slate-700 text-white px-2 py-0.5 font-bold">
                    BASELINE MAINTENANCE
                  </span>
                </div>
                <p className="text-xs text-slate-800 leading-snug">
                  Sectors with minimal citizen complaints and adequate baseline coverage requiring routine operational monitoring.
                </p>
                <div className="bg-white p-3 border border-slate-300 text-xs space-y-1">
                  <span className="font-bold text-[#171717] block">Pedakakani School Infrastructure</span>
                  <p className="text-[10px] text-[#171717]/70">Facility at 98% utilization with low grievance signals.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 5: Q5 — AI ANOMALY SIGNALS FEED */}
      {activeQuestionTab === 'ANOMALIES' && (
        <div className="space-y-6 font-mono">
          <div className="bg-white border-2 border-[#171717] p-5 space-y-5 shadow-[4px_4px_0px_#171717]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#171717]/15 pb-3">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#171717] uppercase flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-[#D65A3A]" />
                  5. WHERE ARE THE ANOMALIES & AUDIT SIGNALS? ({filteredAnomalies.length})
                </h2>
                <p className="text-xs text-[#171717]/70">
                  AI flags discrepancies between spending, project status, and citizen grievances to trigger human review.
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#171717]/50 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter anomaly signals..."
                  value={anomalySearchQuery}
                  onChange={(e) => setAnomalySearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-[#F7F5EF] border border-[#171717] text-xs font-bold placeholder-[#171717]/50 focus:outline-none focus:border-[#D65A3A]"
                />
              </div>
            </div>

            {/* ANOMALY CARDS FEED */}
            <div className="space-y-4">
              {filteredAnomalies.map((anomaly) => (
                <div 
                  key={anomaly.id}
                  className="bg-[#F7F5EF] border-2 border-[#171717] p-4 space-y-3 shadow-[3px_3px_0px_#171717] hover:border-[#D65A3A] transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#171717]/15 pb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[9px] font-bold border ${
                        anomaly.severity === 'CRITICAL' 
                          ? 'bg-rose-600 text-white border-rose-700'
                          : 'bg-amber-500 text-white border-amber-600'
                      }`}>
                        {anomaly.severity} SIGNAL
                      </span>
                      <span className="text-[10px] font-bold text-[#D65A3A] uppercase">
                        {anomaly.schemeName}
                      </span>
                    </div>

                    <span className="text-[10px] bg-white border border-[#171717] px-2 py-0.5 font-bold">
                      📍 {anomaly.districtName}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#171717] leading-snug">
                    {anomaly.title}
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs bg-white p-2 border border-[#171717]/20">
                    <div>
                      <span className="text-[9px] text-[#171717]/60 block uppercase">Allocated</span>
                      <span className="font-bold">{formatCr(anomaly.allocatedInr)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#171717]/60 block uppercase">Spent</span>
                      <span className="font-bold text-emerald-800">{formatCr(anomaly.spentInr)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#171717]/60 block uppercase">Projects</span>
                      <span className="font-bold">{anomaly.completedCount} Done / <span className="text-amber-800">{anomaly.delayedCount} Stalled</span></span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#171717]/60 block uppercase">Complaints</span>
                      <span className="font-bold text-rose-800">🗣️ {anomaly.citizenComplaintsCount.toLocaleString()}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#171717] italic bg-amber-50 p-2.5 border border-amber-300">
                    "{anomaly.outcomeTrend}"
                  </p>

                  <div className="p-2.5 bg-[#171717] text-[#F7F5EF] text-xs font-bold flex items-center justify-between gap-2">
                    <span className="text-amber-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {anomaly.aiInvestigationNote}
                    </span>

                    <button
                      onClick={() => setSelectedAnomalyModal(anomaly)}
                      className="px-2.5 py-1 bg-[#D65A3A] hover:bg-[#c24a2c] text-white text-[10px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer"
                    >
                      Audit Details & Action
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ANOMALY INSPECTION & ACTION MODAL */}
      {selectedAnomalyModal && (
        <div className="fixed inset-0 z-50 bg-[#171717]/60 backdrop-blur-xs flex items-center justify-center p-4 font-mono">
          <div className="bg-[#F7F5EF] border-2 border-[#171717] max-w-2xl w-full p-6 space-y-4 shadow-[8px_8px_0px_#171717] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#171717] pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#D65A3A]" />
                <span className="text-sm font-bold text-[#171717] uppercase tracking-wider">
                  OFFICIAL AUDIT SIGNAL INVESTIGATION
                </span>
              </div>
              <button
                onClick={() => setSelectedAnomalyModal(null)}
                className="px-2 py-0.5 bg-[#171717] text-white font-bold text-xs hover:bg-[#D65A3A] transition-colors cursor-pointer"
              >
                ✕ CLOSE
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white border border-[#171717] space-y-1">
                <span className="text-[9px] font-bold text-[#D65A3A] uppercase">ANOMALY TITLE & SCHEME</span>
                <h3 className="text-sm font-bold text-[#171717]">{selectedAnomalyModal.title}</h3>
                <p className="text-[10px] text-[#171717]/70">Scheme: {selectedAnomalyModal.schemeName} ({selectedAnomalyModal.department})</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-[#171717] space-y-1">
                  <span className="text-[9px] font-bold text-[#171717]/60 uppercase">FINANCIAL EXPENDITURE</span>
                  <div className="text-sm font-bold text-[#171717]">{formatCr(selectedAnomalyModal.spentInr)} spent</div>
                  <span className="text-[10px] text-[#171717]/70">out of {formatCr(selectedAnomalyModal.allocatedInr)} allocated</span>
                </div>

                <div className="p-3 bg-white border border-[#171717] space-y-1">
                  <span className="text-[9px] font-bold text-[#171717]/60 uppercase">PROJECT EXECUTION</span>
                  <div className="text-sm font-bold text-amber-800">{selectedAnomalyModal.delayedCount} Delayed Projects</div>
                  <span className="text-[10px] text-[#171717]/70">{selectedAnomalyModal.completedCount} completed</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-300 space-y-1">
                <span className="text-[9px] font-bold text-amber-900 uppercase">OUTCOME TREND ANALYSIS</span>
                <p className="text-[#171717] italic">"{selectedAnomalyModal.outcomeTrend}"</p>
              </div>

              <div className="p-3 bg-[#171717] text-[#F7F5EF] space-y-1">
                <span className="text-[9px] font-bold text-amber-300 uppercase">AI RECOMMENDATION DECISION</span>
                <p className="text-white text-xs leading-relaxed">{selectedAnomalyModal.aiInvestigationNote}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#171717] flex justify-end gap-2 text-xs font-mono font-bold">
              <button
                onClick={() => setSelectedAnomalyModal(null)}
                className="px-4 py-2 bg-white border border-[#171717] hover:bg-[#171717]/10 cursor-pointer"
              >
                Dismiss Signal
              </button>

              <button
                onClick={() => {
                  setSelectedAnomalyModal(null);
                  if (onNavigateToEngine) onNavigateToEngine();
                }}
                className="px-4 py-2 bg-[#D65A3A] text-white hover:bg-[#c24a2c] shadow-[2px_2px_0px_#171717] cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Trigger {selectedAnomalyModal.recommendedActionType} Intervention in Priority Engine</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
