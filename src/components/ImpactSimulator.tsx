import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  CheckCircle2, 
  Sliders, 
  Droplet, 
  HeartPulse, 
  Route, 
  Zap,
  RotateCcw, 
  ArrowRight,
  Sparkles,
  Users,
  Activity,
  Calendar,
  MapPin,
  X,
  Building2,
  Info,
  ShieldCheck,
  FileCheck,
  Layers,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertCircle
} from 'lucide-react';
import { District, InfrastructureCategory, GovernmentProject, CitizenRequest, ImpactEvidenceNature } from '../types';
import { COMPLETED_IMPACT_PROJECTS } from '../data/initialRequests';
import { getAvailableStates, getDistrictsForState } from '../utils/geography';
import { useLanguage } from '../context/LanguageContext';
import { calculatePercentageChange, getImpactNatureBadge } from '../utils/impactEvidence';
import { 
  evaluateModeledImpact, 
  IMPACT_MODEL_CONFIG, 
  InterventionTypeKey, 
  IntensityLevel,
  ImpactEvaluationPackage 
} from '../utils/impactModel';

interface ImpactSimulatorProps {
  districts: District[];
  requests?: CitizenRequest[];
  governmentProjects?: GovernmentProject[];
  initialDistrictId?: string;
  initialCategory?: InfrastructureCategory;
  onNavigateToProjects?: () => void;
  onNavigateToEngine?: () => void;
}

interface CompletedIntervention {
  id: string;
  title: string;
  district: string;
  state: string;
  category: InfrastructureCategory;
  completedDate: string;
  beforeSignals: number;
  afterSignals: number;
  signalsDeltaPct: number;
  beforeAccess: number;
  afterAccess: number;
  beforeScore: number;
  afterScore: number;
  populationBenefited: number;
  investmentCr: number;
  department?: string;
  officer?: string;
  description?: string;
  isFromActionQueue?: boolean;
  nature: ImpactEvidenceNature;
}

export const ImpactSimulator: React.FC<ImpactSimulatorProps> = ({
  districts,
  requests = [],
  governmentProjects = [],
  initialDistrictId,
  initialCategory,
  onNavigateToProjects,
  onNavigateToEngine,
}) => {
  const { t } = useLanguage();
  // Navigation tabs: strictly [Completed works] and [What-if simulator]
  const [activeTab, setActiveTab] = useState<'completed' | 'simulator'>('simulator');

  // Selected completed item for modal detail
  const [selectedCompletedWork, setSelectedCompletedWork] = useState<CompletedIntervention | null>(null);

  // --- SIMULATOR STATE ---
  const [simState, setSimState] = useState<string>('Andhra Pradesh');
  const [simDistrictId, setSimDistrictId] = useState<string>(initialDistrictId || 'guntur');
  const [simCategory, setSimCategory] = useState<InfrastructureCategory>(initialCategory || 'Water');
  const [simIntervention, setSimIntervention] = useState<InterventionTypeKey>('UPGRADE');
  const [simIntensity, setSimIntensity] = useState<IntensityLevel>('Medium');
  const [showTrace, setShowTrace] = useState<boolean>(false);

  // Authoritative states & districts for simulator
  const availableStates = useMemo(() => getAvailableStates('IN', districts), [districts]);
  const availableDistricts = useMemo(() => getDistrictsForState(simState, 'IN', districts), [simState, districts]);

  // When state changes, auto-pick first district in that state
  const handleStateChange = (st: string) => {
    setSimState(st);
    const inState = districts.filter(d => d.state.toLowerCase() === st.toLowerCase());
    if (inState.length > 0) {
      setSimDistrictId(inState[0].id);
    }
  };

  // Selected district object
  const currentDistrict = useMemo(() => {
    return districts.find(d => d.id === simDistrictId) || districts[0];
  }, [districts, simDistrictId]);

  // Deterministic Impact Evaluation Package
  const evaluation: ImpactEvaluationPackage = useMemo(() => {
    return evaluateModeledImpact({
      district: currentDistrict,
      category: simCategory,
      requests,
      interventionType: simIntervention,
      intensity: simIntensity,
    });
  }, [currentDistrict, simCategory, requests, simIntervention, simIntensity]);

  // --- MERGE COMPLETED WORKS (From Action Queue / Government Projects + Base dataset) ---
  const completedWorksList: CompletedIntervention[] = useMemo(() => {
    const list: CompletedIntervention[] = [];

    // 1. Projects marked Completed in the Action Queue / Government Projects workflow
    const fromGov = governmentProjects.filter(p => p.status === 'Completed');
    fromGov.forEach(p => {
      const beforeSig = p.citizenRequestsCount || 540;
      const afterSig = Math.round(beforeSig * 0.35);
      const delta = Math.round(((afterSig - beforeSig) / beforeSig) * 100);

      list.push({
        id: p.id,
        title: p.title,
        district: p.district,
        state: p.state || 'Andhra Pradesh',
        category: p.category,
        completedDate: p.completedDate || 'Completed · 28 Aug 2026',
        beforeSignals: beforeSig,
        afterSignals: afterSig,
        signalsDeltaPct: delta,
        beforeAccess: p.beforeAccess || 34,
        afterAccess: p.afterAccess || 86,
        beforeScore: p.priorityScore || 85,
        afterScore: Math.round((p.priorityScore || 85) * 0.38),
        populationBenefited: p.population || 45000,
        investmentCr: Number(((p.estimatedCostInr || 45000000) / 10000000).toFixed(1)),
        department: p.department || 'Public Health Engineering Department',
        officer: p.officerInCharge || 'Superintending Engineer',
        description: p.description || 'Demonstration infrastructure intervention completed within prototype tracking environment.',
        isFromActionQueue: true,
        nature: p.id.startsWith('gov-proj-') ? 'SYNTHETIC_DEMO' : 'DETERMINISTIC_CALCULATION',
      });
    });

    // 2. Verified baseline completed works (Curated Prototype Benchmarks)
    COMPLETED_IMPACT_PROJECTS.forEach(cp => {
      if (!list.some(item => item.id === cp.id)) {
        const delta = calculatePercentageChange(cp.before_requests, cp.after_requests) ?? -85;
        list.push({
          id: cp.id,
          title: cp.title,
          district: cp.district,
          state: cp.district === 'Guntur' ? 'Andhra Pradesh' : cp.district === 'Warangal' ? 'Telangana' : 'Maharashtra',
          category: cp.category,
          completedDate: `Completed · ${new Date(cp.completion_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`,
          beforeSignals: cp.before_requests,
          afterSignals: cp.after_requests,
          signalsDeltaPct: delta,
          beforeAccess: cp.before_access,
          afterAccess: cp.after_access,
          beforeScore: cp.before_score || 80,
          afterScore: cp.after_score || 28,
          populationBenefited: cp.population_benefited,
          investmentCr: Number(((cp.investment_inr || 45000000) / 10000000).toFixed(1)),
          department: cp.category === 'Water' ? 'Rural Water Supply Dept' : cp.category === 'Roads' ? 'State Highways Authority' : 'Primary Health Mission',
          officer: 'Executive Engineer',
          description: `Curated completed benchmark project under Centrally Sponsored Scheme in ${cp.district}.`,
          isFromActionQueue: false,
          nature: 'SYNTHETIC_DEMO',
        });
      }
    });

    return list;
  }, [governmentProjects]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      
      {/* 1. VIEW HEADER */}
      <div className="space-y-3 border-b border-[#171717]/10 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D65A3A] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
                Category 4 · Impact Potential
              </span>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                Modeled Impact — Not Observed Outcome
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171717] mt-1">
              Impact Evaluation & Closed-Loop Modeling
            </h1>
          </div>

          {/* TAB TOGGLE: [What-If Simulator] and [Case Study Benchmarks] */}
          <div className="flex items-center bg-[#FAF8F5] p-1 border border-[#171717]/15 rounded-xs font-mono text-xs self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3.5 py-1.5 font-bold transition-all rounded-xs cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'simulator'
                  ? 'bg-[#171717] text-white shadow-xs'
                  : 'text-[#57534E] hover:text-[#171717]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>What-If Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3.5 py-1.5 font-bold transition-all rounded-xs cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'completed'
                  ? 'bg-[#171717] text-white shadow-xs'
                  : 'text-[#57534E] hover:text-[#171717]'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Case Study Benchmarks ({completedWorksList.length})</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-[#57534E] max-w-3xl leading-relaxed">
          CivicPulse bridges citizen distress signals with public investment planning. This module provides transparent, assumption-based <strong>Modeled Projections</strong> for proposed interventions alongside a structured <strong>Post-Intervention Measurement Plan</strong> required for real-world verification.
        </p>
      </div>

      {/* ======================================================== */}
      {/* TAB 2: WHAT-IF SIMULATOR (MODELED PROJECTION)            */}
      {/* ======================================================== */}
      {activeTab === 'simulator' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* 1. CLOSED-LOOP ARCHITECTURE BANNER */}
          <div className="bg-slate-900 text-slate-100 p-4 rounded-sm border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                Closed-Loop Impact Model Architecture
              </span>
              <span className="text-[10px] text-slate-400">
                End-to-End Decision & Verification Cycle
              </span>
            </div>

            {/* Step-by-step pipeline */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-[10px]">
              {IMPACT_MODEL_CONFIG.closedLoopStages.map((stage) => {
                const isCurrent = stage.nature === 'MODELED_PROJECTION';
                const isPlanned = stage.nature === 'FUTURE_MEASUREMENT';
                return (
                  <div 
                    key={stage.order}
                    className={`p-2 rounded border flex flex-col justify-between space-y-1 ${
                      isCurrent 
                        ? 'bg-amber-950/70 border-amber-400 text-amber-200 ring-1 ring-amber-400' 
                        : isPlanned
                        ? 'bg-slate-800/90 border-blue-400/50 text-blue-200'
                        : 'bg-slate-800/50 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[9px] text-slate-400">
                      <span>Step {stage.order}</span>
                      {isCurrent && <span className="text-amber-400 font-bold">Active</span>}
                    </div>
                    <div className="font-bold text-[10px] leading-tight text-white">
                      {stage.name}
                    </div>
                    <div className="text-[8px] text-slate-400 font-sans truncate">
                      {stage.provenance}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. MODELED DISCLAIMER & PROMINENT HEADER */}
          <div className="bg-amber-50/90 border-2 border-dashed border-amber-300 p-4 rounded-sm space-y-1.5 text-xs font-mono text-amber-950">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-bold rounded text-[10px] uppercase tracking-wider">
                  MODELED IMPACT — NOT OBSERVED OUTCOME
                </span>
                <span className="font-bold text-xs text-amber-950">
                  Assumption-Based Projection Model
                </span>
              </div>
              <span className="text-[10px] text-amber-800 bg-white/80 px-2 py-0.5 rounded border border-amber-200">
                Deterministic Elasticity Engine v{IMPACT_MODEL_CONFIG.version}
              </span>
            </div>
            <p className="text-[11px] text-amber-900/90 font-sans leading-relaxed">
              This interactive model simulates potential reductions in civic grievances and gains in municipal infrastructure access under proposed capital interventions. Projected values are modeled estimates generated by the prototype and are not observed real-world outcomes or government forecasts.
            </p>
          </div>

          {/* 3. SIMULATOR PARAMETER CONTROLS */}
          <div className="bg-white border-2 border-stone-300 rounded-sm p-5 shadow-xs space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#171717]/10 pb-3">
              <span className="font-bold text-xs uppercase tracking-wider text-[#171717] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#D65A3A]" />
                Proposed Intervention Parameters
              </span>
              <button
                onClick={() => {
                  setSimState('Andhra Pradesh');
                  setSimDistrictId('guntur');
                  setSimCategory('Water');
                  setSimIntervention('UPGRADE');
                  setSimIntensity('Medium');
                }}
                className="text-[11px] text-[#78716C] hover:text-black flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset parameters</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* 1. State & District Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-[#78716C] font-bold block">1. State & District</label>
                <div className="space-y-1">
                  <select
                    value={simState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full bg-[#FAF8F5] text-[#171717] p-2 text-xs border border-[#171717]/20 rounded-xs focus:outline-hidden font-bold"
                  >
                    {availableStates.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>

                  <select
                    value={simDistrictId}
                    onChange={(e) => setSimDistrictId(e.target.value)}
                    className="w-full bg-[#FAF8F5] text-[#171717] p-2 text-xs border border-[#171717]/20 rounded-xs focus:outline-hidden font-bold"
                  >
                    {availableDistricts.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. Issue / Sector */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-[#78716C] font-bold block">2. Civic Issue / Sector</label>
                <select
                  value={simCategory}
                  onChange={(e) => setSimCategory(e.target.value as InfrastructureCategory)}
                  className="w-full bg-[#FAF8F5] text-[#171717] p-2 text-xs border border-[#171717]/20 rounded-xs focus:outline-hidden font-bold"
                >
                  <option value="Water">Water Supply & Potability</option>
                  <option value="Roads">Roads & Transit Arteries</option>
                  <option value="Drainage">Drainage & Flood Management</option>
                  <option value="Electricity">Electricity & Power Grid</option>
                  <option value="Health">Health & Clinics</option>
                  <option value="Sanitation">Sanitation & Solid Waste</option>
                </select>
                <span className="text-[10px] text-stone-500 block font-sans">
                  Baseline access: {evaluation.baseline.accessPct}% · Gap: {evaluation.baseline.gapPct}%
                </span>
              </div>

              {/* 3. Intervention Type */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-[#78716C] font-bold block">3. Intervention Scope</label>
                <select
                  value={simIntervention}
                  onChange={(e) => setSimIntervention(e.target.value as InterventionTypeKey)}
                  className="w-full bg-[#FAF8F5] text-[#171717] p-2 text-xs border border-[#171717]/20 rounded-xs focus:outline-hidden font-bold"
                >
                  <option value="FIX">Targeted Remediation (Fix) · 25% factor</option>
                  <option value="UPGRADE">Capacity Augmentation (Upgrade) · 40% factor</option>
                  <option value="BUILD">Capital Commissioning (Build) · 65% factor</option>
                  <option value="POLICY">Operational Reform (Policy) · 20% factor</option>
                </select>
                <span className="text-[10px] text-stone-500 block font-sans truncate">
                  {IMPACT_MODEL_CONFIG.interventions[simIntervention]?.description}
                </span>
              </div>

              {/* 4. Intensity / Investment Level */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-[#78716C] font-bold block">4. Intensity Multiplier</label>
                <div className="grid grid-cols-3 gap-1 pt-0.5">
                  {(['Low', 'Medium', 'High'] as IntensityLevel[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => setSimIntensity(level)}
                      className={`py-2 px-1 text-center rounded-xs font-bold transition-all cursor-pointer ${
                        simIntensity === level
                          ? 'bg-[#D65A3A] text-white shadow-xs'
                          : 'bg-[#FAF8F5] text-[#57534E] hover:bg-stone-200 border border-[#171717]/20'
                      }`}
                    >
                      {level} ({IMPACT_MODEL_CONFIG.intensityMultipliers[level].multiplier}x)
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-stone-500 block font-sans truncate">
                  {IMPACT_MODEL_CONFIG.intensityMultipliers[simIntensity]?.description}
                </span>
              </div>

            </div>
          </div>

          {/* 4. SIDE-BY-SIDE COMPARISON: BASELINE vs MODELED PROJECTION */}
          <div className="bg-white border-2 border-stone-300 rounded-sm shadow-xs overflow-hidden font-mono text-xs">
            <div className="bg-[#FAF8F5] p-3.5 border-b border-[#171717]/10 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider text-[#171717]">
                  Comparative Evaluation Table: {currentDistrict.name} ({simCategory})
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 rounded uppercase">
                  Modeled Impact
                </span>
              </div>
              <span className="text-[10px] text-stone-500">
                Intervention: {evaluation.assumptions.interventionLabel} ({simIntensity})
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-[10px] text-stone-600 uppercase">
                    <th className="p-3.5 font-bold">Metric Dimension</th>
                    <th className="p-3.5 font-bold bg-slate-50 border-x border-stone-200">
                      <div>1. BASELINE</div>
                      <div className="text-[9px] font-normal lowercase text-stone-500">observed / grounded data</div>
                    </th>
                    <th className="p-3.5 font-bold bg-amber-50/70 border-r border-stone-200 text-amber-950">
                      <div>2. MODELED PROJECTION</div>
                      <div className="text-[9px] font-normal lowercase text-amber-800">deterministic prototype model</div>
                    </th>
                    <th className="p-3.5 font-bold">
                      <div>3. MODELED DELTA</div>
                      <div className="text-[9px] font-normal lowercase text-stone-500">projected net variance</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-xs">
                  
                  {/* Row 1: Infrastructure Access */}
                  <tr className="hover:bg-stone-50/50">
                    <td className="p-3.5 font-semibold text-stone-900">
                      Infrastructure Access Rate
                      <span className="block text-[10px] font-sans text-stone-500 font-normal">Functional household saturation</span>
                    </td>
                    <td className="p-3.5 font-bold text-stone-900 bg-slate-50/50 border-x border-stone-200">
                      {evaluation.baseline.accessPct}%
                    </td>
                    <td className="p-3.5 font-bold text-emerald-800 bg-amber-50/40 border-r border-stone-200">
                      {evaluation.modeled.projectedAccessPct}%
                    </td>
                    <td className="p-3.5 font-bold text-emerald-700">
                      +{evaluation.modeled.accessGainPct}% modeled gain
                    </td>
                  </tr>

                  {/* Row 2: Infrastructure Deficit Gap */}
                  <tr className="hover:bg-stone-50/50">
                    <td className="p-3.5 font-semibold text-stone-900">
                      Infrastructure Deficit Gap
                      <span className="block text-[10px] font-sans text-stone-500 font-normal">Remaining unmet access requirement</span>
                    </td>
                    <td className="p-3.5 font-bold text-rose-700 bg-slate-50/50 border-x border-stone-200">
                      {evaluation.baseline.gapPct}% deficit
                    </td>
                    <td className="p-3.5 font-bold text-stone-900 bg-amber-50/40 border-r border-stone-200">
                      {evaluation.modeled.projectedGapPct}% deficit
                    </td>
                    <td className="p-3.5 font-bold text-emerald-700">
                      -{evaluation.baseline.gapPct - evaluation.modeled.projectedGapPct}% gap reduction
                    </td>
                  </tr>

                  {/* Row 3: Citizen Demand Signals */}
                  <tr className="hover:bg-stone-50/50">
                    <td className="p-3.5 font-semibold text-stone-900">
                      Citizen Demand Signals
                      <span className="block text-[10px] font-sans text-stone-500 font-normal">Active monthly grievance submissions</span>
                    </td>
                    <td className="p-3.5 font-bold text-blue-700 bg-slate-50/50 border-x border-stone-200">
                      {evaluation.baseline.signalsCount} signals
                    </td>
                    <td className="p-3.5 font-bold text-stone-900 bg-amber-50/40 border-r border-stone-200">
                      {evaluation.modeled.projectedSignals} signals
                    </td>
                    <td className="p-3.5 font-bold text-emerald-700">
                      {evaluation.modeled.signalsReductionPct}% ({evaluation.modeled.signalsDelta} signals)
                    </td>
                  </tr>

                  {/* Row 4: Priority Score */}
                  <tr className="hover:bg-stone-50/50">
                    <td className="p-3.5 font-semibold text-stone-900">
                      5-Pillar Priority Score
                      <span className="block text-[10px] font-sans text-stone-500 font-normal">Deterministic policy allocation index</span>
                    </td>
                    <td className="p-3.5 font-bold text-amber-700 bg-slate-50/50 border-x border-stone-200">
                      {evaluation.baseline.priorityScore} / 100
                    </td>
                    <td className="p-3.5 font-bold text-stone-900 bg-amber-50/40 border-r border-stone-200">
                      {evaluation.modeled.projectedPriorityScore} / 100
                    </td>
                    <td className="p-3.5 font-bold text-emerald-700">
                      {evaluation.modeled.priorityScoreDelta} pts de-escalation
                    </td>
                  </tr>

                  {/* Row 5: Beneficiary Population */}
                  <tr className="hover:bg-stone-50/50">
                    <td className="p-3.5 font-semibold text-stone-900">
                      Affected Beneficiary Population
                      <span className="block text-[10px] font-sans text-stone-500 font-normal">Citizens in low-access localities</span>
                    </td>
                    <td className="p-3.5 font-bold text-purple-700 bg-slate-50/50 border-x border-stone-200">
                      {evaluation.baseline.affectedPopulation.toLocaleString()} in deficit
                    </td>
                    <td className="p-3.5 font-bold text-stone-900 bg-amber-50/40 border-r border-stone-200">
                      {evaluation.modeled.modeledProtectedPopulation.toLocaleString()} protected
                    </td>
                    <td className="p-3.5 font-bold text-stone-600">
                      {evaluation.modeled.remainingAffectedPopulation.toLocaleString()} remaining
                    </td>
                  </tr>

                </tbody>
                <tfoot>
                  <tr className="bg-stone-100/70 border-t border-stone-300 text-[10px] text-stone-600 font-mono">
                    <td className="p-2.5 font-bold">Data Provenance:</td>
                    <td className="p-2.5 bg-slate-100/70 border-x border-stone-200">
                      {evaluation.baseline.provenanceLabel}
                    </td>
                    <td className="p-2.5 bg-amber-100/50 border-r border-stone-200 text-amber-900">
                      {evaluation.modeled.provenanceLabel}
                    </td>
                    <td className="p-2.5 text-stone-600">
                      Deterministic calculation trace
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* 5. IMPACT MODEL ASSUMPTIONS & CALCULATION TRACE */}
          <div className="bg-white border-2 border-stone-300 rounded-sm p-5 shadow-xs space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#171717]/10 pb-3">
              <span className="font-bold text-xs uppercase tracking-wider text-[#171717] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                Impact Model Assumptions & Elasticity Parameters
              </span>
              <button
                onClick={() => setShowTrace(!showTrace)}
                className="text-[11px] text-blue-700 hover:underline flex items-center gap-1 cursor-pointer font-bold"
              >
                {showTrace ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>{showTrace ? 'Hide calculation trace' : 'Show deterministic trace'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              
              <div className="p-3 bg-[#FAF8F5] border border-stone-200 rounded-xs space-y-1">
                <span className="text-[10px] text-stone-500 block uppercase font-bold">Selected Intervention</span>
                <span className="font-bold text-stone-900 text-sm block">{evaluation.assumptions.interventionLabel}</span>
                <span className="text-[10px] text-stone-600 font-sans block">Base factor: {evaluation.assumptions.baseCoverageGainFactor}</span>
              </div>

              <div className="p-3 bg-[#FAF8F5] border border-stone-200 rounded-xs space-y-1">
                <span className="text-[10px] text-stone-500 block uppercase font-bold">Estimated Coverage Gain</span>
                <span className="font-bold text-emerald-700 text-sm block">+{evaluation.assumptions.effectiveReductionPct}%</span>
                <span className="text-[10px] text-stone-600 font-sans block">Multiplier: {evaluation.assumptions.intensityMultiplier}x ({simIntensity})</span>
              </div>

              <div className="p-3 bg-[#FAF8F5] border border-stone-200 rounded-xs space-y-1">
                <span className="text-[10px] text-stone-500 block uppercase font-bold">Evaluation Horizon</span>
                <span className="font-bold text-stone-900 text-sm block">{evaluation.assumptions.evaluationHorizonMonths} Months</span>
                <span className="text-[10px] text-stone-600 font-sans block">Required post-audit observation window</span>
              </div>

              <div className="p-3 bg-[#FAF8F5] border border-stone-200 rounded-xs space-y-1">
                <span className="text-[10px] text-stone-500 block uppercase font-bold">Modeled Capital Outlay</span>
                <span className="font-bold text-[#D65A3A] text-sm block">₹{evaluation.assumptions.estimatedCapitalCr} Cr</span>
                <span className="text-[10px] text-stone-600 font-sans block">Estimated benchmark budgetary allocation</span>
              </div>

            </div>

            {/* Crucial Disclaimer Box */}
            <div className="p-3 bg-stone-100 border border-stone-300 rounded-xs flex items-center justify-between text-[11px] font-sans text-stone-700">
              <span className="italic">
                "{evaluation.assumptions.disclaimerText}"
              </span>
              <span className="text-[10px] font-mono font-bold uppercase text-stone-500 shrink-0 ml-2">
                Prototype Modeling Assumption
              </span>
            </div>

            {/* Calculation Trace Details */}
            {showTrace && (
              <div className="p-3.5 bg-slate-900 text-slate-200 rounded-xs space-y-1.5 text-[11px] font-mono border border-slate-800 animate-in fade-in duration-100">
                <div className="text-amber-400 font-bold text-[10px] uppercase tracking-wider pb-1 border-b border-slate-800">
                  Deterministic Arithmetic Trace (INPUT → ASSUMPTION → CALCULATION → PROJECTED OUTPUT)
                </div>
                {evaluation.calculationTrace.map((line, idx) => (
                  <div key={idx} className="text-slate-300">
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 6. PROPOSED POST-INTERVENTION MEASUREMENT PLAN */}
          <div className="bg-white border-2 border-stone-300 rounded-sm shadow-xs overflow-hidden font-mono text-xs">
            <div className="bg-[#FAF8F5] p-3.5 border-b border-[#171717]/10 flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="font-bold text-xs uppercase tracking-wider text-[#171717] block">
                  Proposed Post-Intervention Measurement Plan
                </span>
                <span className="text-[11px] text-stone-600 font-sans block mt-0.5">
                  These are proposed post-intervention metrics, not currently measured outcomes.
                </span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 rounded">
                Verification Framework ({evaluation.measurementPlan.length} Criteria)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-[10px] text-stone-600 uppercase">
                    <th className="p-3 font-bold">Audit Dimension</th>
                    <th className="p-3 font-bold">Target Benchmark</th>
                    <th className="p-3 font-bold">Verification Methodology & Cadence</th>
                    <th className="p-3 font-bold">Verifying Agency</th>
                    <th className="p-3 font-bold">Current Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-xs font-sans">
                  {evaluation.measurementPlan.map((plan) => (
                    <tr key={plan.id} className="hover:bg-stone-50/50">
                      <td className="p-3 font-semibold text-stone-900 font-mono text-[11px]">
                        {plan.name}
                      </td>
                      <td className="p-3 text-stone-700 text-[11px]">
                        {plan.targetBenchmark}
                      </td>
                      <td className="p-3 text-stone-600 text-[11px]">
                        <div>{plan.methodology}</div>
                        <div className="text-[10px] font-mono text-stone-500 mt-0.5">{plan.cadence}</div>
                      </td>
                      <td className="p-3 text-stone-700 font-mono text-[11px]">
                        {plan.verifyingAgency}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 text-[9px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300 rounded block whitespace-nowrap">
                          {plan.statusText}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-stone-50 border-t border-stone-200 text-[10px] text-stone-600 font-sans flex items-center justify-between">
              <span>Bridge Requirement: Real-world deployment will require connecting departmental work completion certificates to these verification sensors.</span>
              <span className="font-mono text-stone-500 font-bold">Status: Pending Delivery</span>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* COMPLETED WORK DETAIL MODAL                              */}
      {/* ======================================================== */}
      {selectedCompletedWork && (
        <div className="fixed inset-0 z-50 bg-[#171717]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#171717]/20 rounded-sm w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl space-y-5 p-6 font-sans">
            
            <div className="flex items-start justify-between border-b border-[#171717]/10 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold uppercase tracking-wider">
                    Completed Project Dossier
                  </span>
                  <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${
                    getImpactNatureBadge(selectedCompletedWork.nature).badgeClass
                  }`}>
                    {getImpactNatureBadge(selectedCompletedWork.nature).label}
                  </span>
                </div>
                <h2 className="text-xl font-serif font-bold text-[#171717]">
                  {selectedCompletedWork.title}
                </h2>
                <span className="text-xs text-[#57534E] font-mono mt-0.5 block">
                  {selectedCompletedWork.district}, {selectedCompletedWork.state} · Sector: <strong>{selectedCompletedWork.category}</strong>
                </span>
              </div>

              <button
                onClick={() => setSelectedCompletedWork(null)}
                className="p-1 hover:bg-[#F7F5EF] rounded-xs text-[#78716C] hover:text-[#171717] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Before vs After Impact Box */}
            <div className="bg-[#FAF8F5] border border-[#171717]/10 p-4 rounded-sm space-y-3 font-mono text-xs">
              <span className="text-[10px] uppercase font-bold text-[#78716C] block">
                Curated Benchmark Metrics
              </span>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-white border border-[#171717]/10 rounded-xs">
                  <span className="text-[10px] text-stone-500 block">Citizen Signals</span>
                  <div className="text-base font-bold text-emerald-700 mt-0.5">
                    {selectedCompletedWork.beforeSignals} → {selectedCompletedWork.afterSignals}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">{selectedCompletedWork.signalsDeltaPct}%</span>
                </div>

                <div className="p-2.5 bg-white border border-[#171717]/10 rounded-xs">
                  <span className="text-[10px] text-stone-500 block">Access Rate</span>
                  <div className="text-base font-bold text-[#171717] mt-0.5">
                    {selectedCompletedWork.beforeAccess}% → {selectedCompletedWork.afterAccess}%
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">+{selectedCompletedWork.afterAccess - selectedCompletedWork.beforeAccess}%</span>
                </div>

                <div className="p-2.5 bg-white border border-[#171717]/10 rounded-xs">
                  <span className="text-[10px] text-stone-500 block">Priority Drop</span>
                  <div className="text-base font-bold text-[#171717] mt-0.5">
                    {selectedCompletedWork.beforeScore} → {selectedCompletedWork.afterScore}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">De-escalated</span>
                </div>
              </div>
            </div>

            {/* Department & Capital Info */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-[#FAF8F5] border border-[#171717]/10 rounded-xs">
                <span className="text-[10px] text-[#78716C] block">Executing Department</span>
                <span className="font-bold text-[#171717] block mt-0.5">{selectedCompletedWork.department}</span>
              </div>

              <div className="p-3 bg-[#FAF8F5] border border-[#171717]/10 rounded-xs">
                <span className="text-[10px] text-[#78716C] block">Capital Investment</span>
                <span className="font-bold text-[#D65A3A] text-sm block mt-0.5">₹{selectedCompletedWork.investmentCr} Cr</span>
              </div>
            </div>

            {/* Beneficiary Note */}
            <div className="p-3.5 bg-white border border-[#171717]/15 rounded-xs space-y-1 text-xs">
              <span className="font-bold text-[#171717] block">Impact Summary:</span>
              <p className="text-[#57534E] leading-relaxed">
                {selectedCompletedWork.description} Directly benefited over <strong>{selectedCompletedWork.populationBenefited.toLocaleString()} citizens</strong> across the mandal.
              </p>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-[#171717]/10">
              <button
                onClick={() => setSelectedCompletedWork(null)}
                className="px-4 py-2 bg-[#171717] hover:bg-[#34322D] text-white text-xs font-semibold rounded-xs cursor-pointer"
              >
                Close dossier
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
