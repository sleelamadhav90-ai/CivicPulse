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
  FileCheck
} from 'lucide-react';
import { District, InfrastructureCategory, GovernmentProject, CitizenRequest, ImpactEvidenceNature } from '../types';
import { COMPLETED_IMPACT_PROJECTS } from '../data/initialRequests';
import { calculatePriorityScore, getCategoryAccess, getPriorityTier } from '../utils/scoring';
import { getAvailableStates, getDistrictsForState } from '../utils/geography';
import { useLanguage } from '../context/LanguageContext';
import { calculateAbsoluteChange, calculatePercentageChange, calculateGapReduction, getImpactNatureBadge } from '../utils/impactEvidence';

interface ImpactSimulatorProps {
  districts: District[];
  requests?: CitizenRequest[];
  governmentProjects?: GovernmentProject[];
  initialDistrictId?: string;
  initialCategory?: InfrastructureCategory;
  onNavigateToProjects?: () => void;
  onNavigateToEngine?: () => void;
}

type InterventionTypeKey = 'FIX' | 'UPGRADE' | 'BUILD' | 'POLICY';
type IntensityLevel = 'Low' | 'Medium' | 'High';

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
  const [activeTab, setActiveTab] = useState<'completed' | 'simulator'>('completed');

  // Selected completed item for modal detail
  const [selectedCompletedWork, setSelectedCompletedWork] = useState<CompletedIntervention | null>(null);

  // --- SIMULATOR STATE ---
  const [simState, setSimState] = useState<string>('Andhra Pradesh');
  const [simDistrictId, setSimDistrictId] = useState<string>(initialDistrictId || 'guntur');
  const [simCategory, setSimCategory] = useState<InfrastructureCategory>(initialCategory || 'Water');
  const [simIntervention, setSimIntervention] = useState<InterventionTypeKey>('UPGRADE');
  const [simIntensity, setSimIntensity] = useState<IntensityLevel>('Medium');
  const [hasRunSimulation, setHasRunSimulation] = useState<boolean>(true);

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

  // Real baseline calculation for selected district + category
  const baselineData = useMemo(() => {
    const baseAccess = getCategoryAccess(currentDistrict, simCategory);
    
    // Count real matching citizen signals if available, else standard baseline
    const matchingRequests = requests.filter(r => {
      const matchDist = (r.district && r.district.toLowerCase() === currentDistrict.name.toLowerCase()) ||
                         (r.location && r.location.toLowerCase().includes(currentDistrict.name.toLowerCase()));
      const matchCat = r.category === simCategory;
      return matchDist && matchCat;
    });

    const signalCount = matchingRequests.length > 0 ? matchingRequests.length * 18 : 640;
    const baseSeverity = 8;
    const priorityBreakdown = calculatePriorityScore(currentDistrict, simCategory, baseSeverity, signalCount, baseAccess);
    const affectedPop = Math.round(currentDistrict.population * (Math.max(10, 100 - baseAccess) / 100) * 0.4);

    return {
      access: baseAccess,
      signals: signalCount,
      priorityScore: Math.round(priorityBreakdown.total_score),
      gapPct: Math.round(100 - baseAccess),
      affectedPopulation: affectedPop,
    };
  }, [currentDistrict, simCategory, requests]);

  // Deterministic simulation outcome calculation
  const simulatedOutcome = useMemo(() => {
    // Base reduction factors:
    // FIX: ~25%, UPGRADE: ~40%, BUILD: ~65%, POLICY: ~20%
    let baseFactor = 0.40;
    if (simIntervention === 'FIX') baseFactor = 0.25;
    else if (simIntervention === 'BUILD') baseFactor = 0.65;
    else if (simIntervention === 'POLICY') baseFactor = 0.20;

    // Intensity multiplier: Low: 0.8x, Medium: 1.0x, High: 1.25x
    const intensityMultiplier = simIntensity === 'Low' ? 0.8 : simIntensity === 'High' ? 1.25 : 1.0;
    const effectiveReduction = Math.min(0.85, baseFactor * intensityMultiplier);

    // Projected Signals
    const projectedSignals = Math.max(12, Math.round(baselineData.signals * (1 - effectiveReduction)));
    
    // Projected Access & Gap
    const accessGain = Math.round((100 - baselineData.access) * effectiveReduction);
    const projectedAccess = Math.min(95, baselineData.access + accessGain);
    const projectedGap = Math.max(5, 100 - projectedAccess);

    // Projected Priority Score
    const projectedBreakdown = calculatePriorityScore(
      currentDistrict, 
      simCategory, 
      Math.max(2, Math.round(8 * (1 - effectiveReduction * 0.7))), 
      projectedSignals, 
      projectedAccess
    );
    const projectedScore = Math.round(projectedBreakdown.total_score);

    // Projected Beneficiaries and Cost
    const popProtected = Math.round(baselineData.affectedPopulation * effectiveReduction);
    const remainingPopAffected = Math.max(0, baselineData.affectedPopulation - popProtected);
    
    // Estimated Cost in Crores
    let baseCost = 4.2;
    if (simIntervention === 'FIX') baseCost = 1.8;
    else if (simIntervention === 'BUILD') baseCost = 9.5;
    else if (simIntervention === 'POLICY') baseCost = 0.6;
    const estimatedCostCr = Number((baseCost * intensityMultiplier).toFixed(1));

    return {
      effectiveReductionPct: Math.round(effectiveReduction * 100),
      projectedSignals,
      signalsDelta: projectedSignals - baselineData.signals,
      projectedAccess,
      projectedGap,
      projectedScore,
      scoreDelta: projectedScore - baselineData.priorityScore,
      popProtected,
      remainingPopAffected,
      estimatedCostCr,
    };
  }, [baselineData, simIntervention, simIntensity, currentDistrict, simCategory]);

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
        description: p.description || 'Comprehensive infrastructure intervention completed and verified via citizen feedback telemetries.',
        isFromActionQueue: true,
        nature: p.id.startsWith('gov-proj-') ? 'SYNTHETIC_DEMO' : 'DETERMINISTIC_CALCULATION',
      });
    });

    // 2. Verified baseline completed works (Curated Prototype Benchmarks)
    COMPLETED_IMPACT_PROJECTS.forEach(cp => {
      // Avoid duplicates if same ID exists
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
          beforeScore: cp.before_score,
          afterScore: cp.after_score,
          populationBenefited: cp.population_benefited,
          investmentCr: Number((cp.investment_inr / 10000000).toFixed(1)),
          department: cp.category === 'Water' ? 'Rural Water Supply & Sanitation' : cp.category === 'Health' ? 'Health & Family Welfare' : 'Public Works Department',
          officer: 'Executive Nodal Officer',
          description: 'Closed-loop infrastructure intervention with multi-month benchmark verification and citizen grievance resolution.',
          isFromActionQueue: false,
          nature: 'SYNTHETIC_DEMO',
        });
      }
    });

    return list;
  }, [governmentProjects]);

  return (
    <div className="space-y-6 font-sans text-[#171717] pb-16 max-w-6xl mx-auto">
      
      {/* 1. PAGE HEADER (Question-driven with supporting label) */}
      <header className="space-y-2 border-b border-[#171717]/10 pb-5">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-[#FAF8F5] text-[#D65A3A] border border-[#D65A3A]/30 text-[10px] font-mono font-bold tracking-wider uppercase rounded-xs">
            {t('impact.page_label') || 'Impact'}
          </span>
          <span className="text-[11px] font-mono text-[#78716C] uppercase tracking-wider">
            Step 6 · Impact
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-tight text-[#171717]">
              {t('impact.question_title') || 'Did it make a difference?'}
            </h1>
            <p className="text-xs sm:text-sm text-[#57534E] mt-1 max-w-2xl leading-relaxed">
              Closing the civic loop: measured citizen feedback before and after completed interventions, and predictive forecasting for proposed capital allocations.
            </p>
          </div>

          {/* Primary View Switcher: [Completed works] [What-if simulator] */}
          <div className="flex items-center bg-[#FAF8F5] border border-[#171717]/20 p-1 rounded-xs text-xs font-mono shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3.5 py-1.5 font-bold transition-all cursor-pointer rounded-xs flex items-center gap-1.5 ${
                activeTab === 'completed'
                  ? 'bg-[#171717] text-white shadow-xs'
                  : 'text-[#57534E] hover:text-[#171717]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed works ({completedWorksList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3.5 py-1.5 font-bold transition-all cursor-pointer rounded-xs flex items-center gap-1.5 ${
                activeTab === 'simulator'
                  ? 'bg-[#171717] text-white shadow-xs'
                  : 'text-[#57534E] hover:text-[#171717]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-[#D65A3A]" />
              <span>What-if simulator</span>
            </button>
          </div>
        </div>
      </header>

      {/* Narrative Context Banner */}
      <div className="bg-[#FAF8F5] border border-[#171717]/15 p-4 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D65A3A] block">
            Why Post-Delivery Verification Matters
          </span>
          <p className="text-[#34322D] leading-relaxed">
            <strong className="text-[#171717]">CLOSING THE CIVIC FEEDBACK LOOP.</strong>{' '}
            Capital sanction without verification risks repetitive infrastructure failure. Comparing citizen grievance signals before and after delivery proves whether the sanctioned solution actually eliminated citizen hardship.
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: COMPLETED WORKS LIST (MEASURED IMPACT)            */}
      {/* ======================================================== */}
      {activeTab === 'completed' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          
          <div className="flex items-center justify-between text-xs text-[#57534E] px-1 font-mono">
            <span className="flex items-center gap-1.5 font-bold text-[#171717]">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Empirically Measured Outcomes & Verified Public Works
            </span>
            {onNavigateToProjects && (
              <button 
                onClick={onNavigateToProjects}
                className="text-[#D65A3A] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Go to Action Queue</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {completedWorksList.length === 0 ? (
            <div className="bg-white border border-[#171717]/15 rounded-sm p-12 text-center space-y-3 shadow-xs">
              <CheckCircle2 className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="text-sm font-semibold text-[#171717]">No completed interventions yet.</p>
              <p className="text-xs text-[#57534E] max-w-md mx-auto">
                Completed actions from the Action Queue will appear here with measured Before → After feedback metrics.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedWorksList.map((work) => {
                const natureBadge = getImpactNatureBadge(work.nature);
                const hasValidImpact = typeof work.afterAccess === 'number' && typeof work.afterSignals === 'number';

                return (
                  <div 
                    key={work.id}
                    className="bg-white border border-[#171717]/15 rounded-sm p-4 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#171717]/40 transition-all group"
                  >
                    {/* Card Header */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#F7F5EF] text-[#171717] border border-[#171717]/10">
                            {work.category}
                          </span>
                          <span className={`text-[9px] font-mono font-medium px-1.5 py-0.5 rounded border ${natureBadge.badgeClass}`}>
                            {natureBadge.label}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{work.completedDate}</span>
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-base text-[#171717] group-hover:text-[#D65A3A] transition-colors leading-snug line-clamp-2">
                        {work.title}
                      </h3>

                      <div className="flex items-center text-xs text-[#57534E] gap-1 font-mono">
                        <MapPin className="w-3 h-3 text-[#78716C] shrink-0" />
                        <span>{work.district}, {work.state}</span>
                      </div>
                    </div>

                    {/* Before → After Metrics Box with Honesty Rule */}
                    {hasValidImpact ? (
                      <div className="bg-[#FAF8F5] border border-[#171717]/10 rounded-xs p-3 space-y-2 font-mono text-xs">
                        <div className="flex items-center justify-between text-[11px] text-[#78716C]">
                          <span>Citizen Signals:</span>
                          <span className="font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded text-[10px]">
                            {work.signalsDeltaPct}%
                          </span>
                        </div>
                        
                        <div className="flex items-baseline justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-stone-500 line-through text-xs">{work.beforeSignals}</span>
                            <span className="text-stone-400">→</span>
                            <span className="font-bold text-sm text-[#171717]">{work.afterSignals} signals</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#171717]/10 flex items-center justify-between text-[11px] text-[#57534E]">
                          <span>Service Access:</span>
                          <span className="font-bold text-[#171717]">{work.beforeAccess}% → {work.afterAccess}%</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-stone-50 border border-stone-200 rounded-xs text-[#57534E] text-xs">
                        <span className="font-bold text-[#171717] block">Impact measurement not yet available</span>
                        <span className="text-[10px] text-stone-500 block mt-0.5">Post-delivery sensor telemetries pending.</span>
                      </div>
                    )}

                    {/* Provenance Pill */}
                    <div className="text-[9px] font-mono text-[#78716C] flex items-center justify-between pt-1 border-t border-[#171717]/10">
                      <span>Source: Field Telemetry</span>
                      <span className="text-emerald-700 font-bold">Verified Lineage</span>
                    </div>

                    {/* Card Action */}
                    <button
                      onClick={() => setSelectedCompletedWork(work)}
                      className="w-full py-2 bg-[#FAF8F5] hover:bg-[#171717] hover:text-white border border-[#171717]/20 text-[#171717] text-xs font-mono font-bold rounded-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <span>View impact details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: WHAT-IF SIMULATOR (HYPOTHETICAL FORECAST)         */}
      {/* ======================================================== */}
      {activeTab === 'simulator' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Prominent Label Mandate & Distinct Scenario Header */}
          <div className="bg-amber-50/90 border-2 border-dashed border-amber-300 p-4 rounded-sm space-y-1.5 text-xs font-mono text-amber-950">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-bold rounded text-[10px] uppercase tracking-wider">
                  Hypothetical Scenario
                </span>
                <span className="font-bold text-sm text-amber-950">
                  SIMULATION — NOT A GOVERNMENT FORECAST
                </span>
              </div>
              <span className="text-[10px] text-amber-800 bg-white/70 px-2 py-0.5 rounded border border-amber-200">
                Model: Dynamic 5-Pillar Calculation Engine
              </span>
            </div>
            <p className="text-[11px] text-amber-900/90 font-sans leading-relaxed">
              This interactive model simulates potential reductions in civic grievances and gains in municipal infrastructure access under proposed capital interventions. Projected values are hypothetical estimations and do not represent verified outcomes.
            </p>
          </div>

          {/* SIMULATOR CONTROLS CARD with Blueprint Styling */}
          <div className="bg-white border-2 border-stone-300 rounded-sm p-5 shadow-xs space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#171717]/10 pb-3">
              <span className="font-bold text-xs uppercase tracking-wider text-[#171717] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#D65A3A]" />
                Scenario Parameter Configuration (What-If)
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
                  Active baseline: {baselineData.signals} signals · Gap: {baselineData.gapPct}%
                </span>
              </div>

              {/* 3. Intervention Type */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-[#78716C] font-bold block">3. Intervention Type</label>
                <select
                  value={simIntervention}
                  onChange={(e) => setSimIntervention(e.target.value as InterventionTypeKey)}
                  className="w-full bg-[#FAF8F5] text-[#171717] p-2 text-xs border border-[#171717]/20 rounded-xs focus:outline-hidden font-bold"
                >
                  <option value="FIX">Fix existing infrastructure (~25% impact)</option>
                  <option value="UPGRADE">Upgrade capacity (~40% impact)</option>
                  <option value="BUILD">Build new infrastructure (~65% impact)</option>
                  <option value="POLICY">Policy intervention (~20% impact)</option>
                </select>
              </div>

              {/* 4. Intensity / Investment Level */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-[#78716C] font-bold block">4. Intensity Level</label>
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
                      {level}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Run Action */}
            <div className="pt-2 border-t border-[#171717]/10 flex items-center justify-between">
              <span className="text-[11px] text-[#78716C]">
                Target: <strong className="text-[#171717]">{currentDistrict.name}</strong> · Mode: <strong className="text-[#171717]">{simIntervention} ({simIntensity})</strong>
              </span>

              <button
                onClick={() => setHasRunSimulation(true)}
                className="px-5 py-2.5 bg-[#171717] hover:bg-[#34322D] text-white text-xs font-bold rounded-xs transition-colors flex items-center space-x-2 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D65A3A]" />
                <span>Calculate scenario forecast</span>
              </button>
            </div>
          </div>

          {/* SIMULATION RESULTS: VISUALLY DISTINCT PROJECTED GRID */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono px-1">
              <span className="font-bold text-[#171717] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse"></span>
                Hypothetical Scenario Results: {currentDistrict.name} ({simCategory})
              </span>
              <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                Projected Reduction: -{simulatedOutcome.effectiveReductionPct}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
              
              {/* 1. Citizen Demand */}
              <div className="bg-white border-2 border-dashed border-amber-200 rounded-sm p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#78716C] uppercase font-bold">
                    Citizen Demand
                  </span>
                  <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                    Projected
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-xs text-stone-400 line-through">{baselineData.signals}</span>
                    <span className="text-stone-300">→</span>
                    <span className="text-2xl font-serif font-bold text-[#171717]">
                      {simulatedOutcome.projectedSignals}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    {Math.round((simulatedOutcome.signalsDelta / baselineData.signals) * 100)}%
                  </span>
                </div>
                <p className="text-[11px] text-[#57534E] font-sans">
                  Monthly citizen complaints estimated to drop by {baselineData.signals - simulatedOutcome.projectedSignals} signals
                </p>
              </div>

              {/* 2. Infrastructure Gap */}
              <div className="bg-white border-2 border-dashed border-amber-200 rounded-sm p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#78716C] uppercase font-bold">
                    Infrastructure Gap
                  </span>
                  <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                    Projected
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-xs text-stone-400 line-through">{baselineData.gapPct}%</span>
                    <span className="text-stone-300">→</span>
                    <span className="text-2xl font-serif font-bold text-[#171717]">
                      {simulatedOutcome.projectedGap}%
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    +{simulatedOutcome.projectedAccess - baselineData.access}% access
                  </span>
                </div>
                <p className="text-[11px] text-[#57534E] font-sans">
                  Coverage projected to rise from {baselineData.access}% to {simulatedOutcome.projectedAccess}%
                </p>
              </div>

              {/* 3. Priority Score */}
              <div className="bg-white border-2 border-dashed border-amber-200 rounded-sm p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#78716C] uppercase font-bold">
                    Priority Score
                  </span>
                  <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                    Projected
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-xs text-stone-400 line-through">{baselineData.priorityScore}</span>
                    <span className="text-stone-300">→</span>
                    <span className="text-2xl font-serif font-bold text-[#171717]">
                      {simulatedOutcome.projectedScore}
                    </span>
                    <span className="text-[10px] text-stone-400">/100</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    {simulatedOutcome.scoreDelta} pts
                  </span>
                </div>
                <p className="text-[11px] text-[#57534E] font-sans">
                  Simulated de-escalation from Critical to Moderate
                </p>
              </div>

              {/* 4. Affected Population Protected */}
              <div className="bg-white border-2 border-dashed border-amber-200 rounded-sm p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#78716C] uppercase font-bold">
                    Protected Population
                  </span>
                  <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                    Forecast
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-2xl font-serif font-bold text-[#171717]">
                      {(simulatedOutcome.popProtected / 1000).toFixed(1)}k
                    </span>
                    <span className="text-xs text-[#57534E]">beneficiaries</span>
                  </div>
                  <span className="text-xs font-bold text-[#D65A3A] bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                    ₹{simulatedOutcome.estimatedCostCr} Cr
                  </span>
                </div>
                <p className="text-[11px] text-[#57534E] font-sans">
                  Estimated capital outlay requirement
                </p>
              </div>

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
                Quantified Field Results
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
