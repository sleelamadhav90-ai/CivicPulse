import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  CheckCircle2, 
  ArrowDownRight, 
  ArrowUpRight, 
  Sliders, 
  Building2, 
  Droplet, 
  Droplets,
  HeartPulse, 
  Route, 
  GraduationCap, 
  Zap,
  ShieldCheck, 
  RotateCcw, 
  Award, 
  Layers,
  Sparkles,
  Users,
  Wallet,
  ArrowRight,
  Clock,
  Activity,
  BarChart3,
  FileCheck,
  Check,
  Compass,
  Building
} from 'lucide-react';
import { District, InfrastructureCategory, ImpactProject, GovernmentProject } from '../types';
import { COMPLETED_IMPACT_PROJECTS } from '../data/initialRequests';
import { calculatePriorityScore, getCategoryAccess, getPriorityTier } from '../utils/scoring';

interface ImpactSimulatorProps {
  districts: District[];
  governmentProjects?: GovernmentProject[];
  initialDistrictId?: string;
  initialCategory?: InfrastructureCategory;
  onNavigateToProjects?: () => void;
  onNavigateToEngine?: () => void;
}

export const ImpactSimulator: React.FC<ImpactSimulatorProps> = ({
  districts,
  governmentProjects = [],
  initialDistrictId,
  initialCategory,
  onNavigateToProjects,
  onNavigateToEngine,
}) => {
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(initialDistrictId || 'guntur');
  const [selectedCategory, setSelectedCategory] = useState<InfrastructureCategory>(initialCategory || 'Water');
  const [activeTab, setActiveTab] = useState<'overview' | 'simulator' | 'portfolio'>('overview');

  // Sliders for dynamic modeling
  const currentDistrict = districts.find((d) => d.id === selectedDistrictId) || districts[0];
  const initialBaseAccess = getCategoryAccess(currentDistrict, selectedCategory);

  const [simulatedCurrentAccess, setSimulatedCurrentAccess] = useState<number>(initialBaseAccess);
  const [simulatedTargetAccess, setSimulatedTargetAccess] = useState<number>(85);
  const [simulatedPreRequests, setSimulatedPreRequests] = useState<number>(450);
  const [simulatedPostRequests, setSimulatedPostRequests] = useState<number>(45);
  const [estimatedInvestmentCr, setEstimatedInvestmentCr] = useState<number>(4.5);

  // Sync baseline when district changes
  const handleDistrictChange = (distId: string) => {
    setSelectedDistrictId(distId);
    const d = districts.find((item) => item.id === distId) || districts[0];
    const acc = getCategoryAccess(d, selectedCategory);
    setSimulatedCurrentAccess(acc);
  };

  // Recalculate deterministic baseline vs modeled scores
  const baselineEvaluation = useMemo(() => {
    return calculatePriorityScore(
      currentDistrict,
      selectedCategory,
      8, // baseline severity
      simulatedPreRequests,
      simulatedCurrentAccess
    );
  }, [currentDistrict, selectedCategory, simulatedPreRequests, simulatedCurrentAccess]);

  const modeledEvaluation = useMemo(() => {
    return calculatePriorityScore(
      currentDistrict,
      selectedCategory,
      3, // severity drops post-fix
      simulatedPostRequests,
      simulatedTargetAccess
    );
  }, [currentDistrict, selectedCategory, simulatedPostRequests, simulatedTargetAccess]);

  const baseTier = getPriorityTier(baselineEvaluation.total_score);
  const modeledTier = getPriorityTier(modeledEvaluation.total_score);
  const scoreDelta = Number((modeledEvaluation.total_score - baselineEvaluation.total_score).toFixed(1));
  const gapDelta = Number((modeledEvaluation.gap_percentage - baselineEvaluation.gap_percentage).toFixed(1));

  // Beneficiary population and Capex efficiency
  const beneficiariesCount = Math.round(currentDistrict.population * (simulatedTargetAccess - simulatedCurrentAccess) / 100);
  const costPerBeneficiary = beneficiariesCount > 0 ? Math.round((estimatedInvestmentCr * 10000000) / beneficiariesCount) : 0;

  // Infrastructure improvement stats requested:
  // Water: 78%, Roads: 64%, Lighting: 71%, Sanitation: 59%
  const sectorImprovements = [
    {
      sector: 'Water',
      label: 'Clean Water & RO Networks',
      icon: Droplet,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-500',
      barColor: 'bg-blue-600',
      currentRate: 78,
      baselineRate: 34,
      delta: '+44%',
      projectsCount: 11,
      beneficiaries: '1.4M',
      highlight: 'Solar piped water grids & arsenic/fluoride filtration hubs'
    },
    {
      sector: 'Lighting',
      label: 'Smart Street Lighting',
      icon: Zap,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-500',
      barColor: 'bg-yellow-500',
      currentRate: 71,
      baselineRate: 42,
      delta: '+29%',
      projectsCount: 8,
      beneficiaries: '980K',
      highlight: '4,200+ connected LED safety poles along transit corridors'
    },
    {
      sector: 'Roads',
      label: 'All-Weather Road Corridors',
      icon: Route,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-500',
      barColor: 'bg-amber-600',
      currentRate: 64,
      baselineRate: 38,
      delta: '+26%',
      projectsCount: 7,
      beneficiaries: '1.1M',
      highlight: 'PMGSY black-cotton soil asphalt paving & bypass culverts'
    },
    {
      sector: 'Sanitation',
      label: 'Stormwater Drainage & Sanitation',
      icon: Droplets,
      iconColor: 'text-cyan-600',
      bgColor: 'bg-cyan-500',
      barColor: 'bg-cyan-600',
      currentRate: 59,
      baselineRate: 22,
      delta: '+37%',
      projectsCount: 5,
      beneficiaries: '720K',
      highlight: 'Automated flood pump stations & school girl-child bio-toilets'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-0.5 text-xs font-black uppercase tracking-wider rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 font-mono">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                FEATURE 6: IMPACT DASHBOARD
              </span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                • Closed-Loop Public ROI & Outcomes
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              CivicPulse Impact & Verification Dashboard
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
              Measuring the tangible real-world outcomes of citizen-led infrastructure investments. Track macro public ROI, verify access rate expansion across sectors, and simulate future capital interventions.
            </p>
          </div>

          {/* Sub-view switcher */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-xl text-xs font-bold shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Impact Overview
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              What-If Simulator
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'portfolio'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed Works (31)
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* EXACT SECTION REQUESTED: CIVICPULSE IMPACT 4-METRIC HERO     */}
        {/* ============================================================ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              CIVICPULSE IMPACT
            </h2>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 font-bold">
              ● Verified Closed-Loop Results
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
            {/* 1. Requests Received: 12,480 */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/60 to-white border border-blue-200/80 shadow-2xs space-y-1.5">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block font-sans">
                Requests received
              </span>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                12,480
              </div>
              <p className="text-[11px] text-slate-500 font-sans font-medium">
                Multilingual voice & text citizen signals
              </p>
            </div>

            {/* 2. Projects Recommended: 86 */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/60 to-white border border-purple-200/80 shadow-2xs space-y-1.5">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block font-sans">
                Projects recommended
              </span>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                86
              </div>
              <p className="text-[11px] text-slate-500 font-sans font-medium">
                Ranked by 5-Pillar Priority Engine
              </p>
            </div>

            {/* 3. Projects Completed: 31 */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-white border border-emerald-200/80 shadow-2xs space-y-1.5">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block font-sans">
                Projects completed
              </span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight">
                31
              </div>
              <p className="text-[11px] text-slate-500 font-sans font-medium">
                Commissioned with third-party audit
              </p>
            </div>

            {/* 4. Citizens Impacted: 4.2M */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/60 to-white border border-amber-200/80 shadow-2xs space-y-1.5">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block font-sans">
                Citizens impacted
              </span>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                4.2M
              </div>
              <p className="text-[11px] text-slate-500 font-sans font-medium">
                Direct population benefiting from upgrades
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* EXACT SECTION REQUESTED: THE DEMO STORY TRANSFORM (BEFORE/AFTER) */}
        {/* ============================================================ */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              THE CIVICPULSE TRANSFORMATION STORY
            </span>
            <span className="text-xs px-3 py-1 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
              Citizen-Led Capital Efficiency
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
            {/* Left Box: Before CivicPulse */}
            <div className="lg:col-span-5 p-5 rounded-xl bg-slate-800/80 border border-rose-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 font-mono">
                  Before CivicPulse
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Unstructured Chaos
                </span>
              </div>
              
              <div className="text-2xl sm:text-3xl font-black font-mono text-rose-200">
                12,480
              </div>
              <div className="text-sm font-bold text-slate-200">
                unresolved development requests
              </div>

              <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-700 font-sans">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>Citizens felt unheard; voice notes and WhatsApp complaints languished in silos.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>14.2 months average decision lag between complaint and departmental review.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>Discretionary capital allocation with no auditable equity basis.</span>
                </li>
              </ul>
            </div>

            {/* Middle Transform Arrow */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center py-2 text-center">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black shadow-lg animate-pulse">
                ↓
              </div>
              <span className="text-[10px] font-mono text-blue-300 font-bold uppercase mt-1 tracking-wider">
                AI Engine
              </span>
            </div>

            {/* Right Box: After AI Prioritization */}
            <div className="lg:col-span-5 p-5 rounded-xl bg-slate-800/80 border border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  After AI Prioritization
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  Targeted Execution
                </span>
              </div>
              
              <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-300">
                31
              </div>
              <div className="text-sm font-bold text-slate-100">
                high-impact projects completed
              </div>

              <ul className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-slate-700 font-sans">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>4.2 Million citizens</strong> directly benefiting from upgraded water, roads & power.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Decision-to-tender cycle compressed from <strong>14.2 months down to 3.1 months</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>100% deterministic formula backed by census and demographic data.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* EXACT SECTION REQUESTED: INFRASTRUCTURE IMPROVEMENT (BARS)   */}
        {/* ============================================================ */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Infrastructure Improvement
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Targeted sector access expansion achieved across funded municipal clusters.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">
              Aggregated Municipal Audit
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sectorImprovements.map((sec) => (
              <div 
                key={sec.sector}
                className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3 hover:border-slate-300 transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <sec.icon className={`w-4 h-4 ${sec.iconColor}`} />
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono block">
                        {sec.sector}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {sec.label}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-black font-mono text-slate-900">
                      {sec.currentRate}%
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {sec.delta} expansion
                    </span>
                  </div>
                </div>

                {/* Progress Bar (Visual ASCII/Block Representation & Styled Bar) */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden p-0.5">
                    <div 
                      className={`h-full rounded-full ${sec.barColor} transition-all duration-700`}
                      style={{ width: `${sec.currentRate}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-0.5">
                    <span>Baseline: {sec.baselineRate}%</span>
                    <span className="font-bold text-slate-800">Target: {sec.currentRate}%</span>
                  </div>
                </div>

                {/* Footnote details */}
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                  <span><strong>{sec.projectsCount}</strong> projects completed</span>
                  <span><strong>{sec.beneficiaries}</strong> citizens impacted</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conditional Sub-View: What-If Simulator or Portfolio */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          {/* Left Column: Interactive Simulation Sliders */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  What-If Intervention Modeling
                </h3>
                <button
                  onClick={() => {
                    setSimulatedCurrentAccess(initialBaseAccess);
                    setSimulatedTargetAccess(85);
                    setSimulatedPreRequests(450);
                    setSimulatedPostRequests(45);
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>
              </div>

              {/* Target Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    District:
                  </label>
                  <select
                    value={selectedDistrictId}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none cursor-pointer"
                  >
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.state})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sector:
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      const cat = e.target.value as InfrastructureCategory;
                      setSelectedCategory(cat);
                      setSimulatedCurrentAccess(getCategoryAccess(currentDistrict, cat));
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="Water">Water Access</option>
                    <option value="Drainage">Drainage & Flood Management</option>
                    <option value="Roads">Road Infrastructure</option>
                    <option value="Electricity">Electricity & Street Lighting</option>
                    <option value="Health">Healthcare Clinics</option>
                    <option value="Education">School Facilities</option>
                  </select>
                </div>
              </div>

              {/* Slider 1: Pre-Intervention Baseline Access */}
              <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-700 font-semibold text-xs">1. Baseline Infrastructure Access (Pre-Project):</span>
                  <span className="font-mono text-xs font-bold text-rose-600">{simulatedCurrentAccess}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={simulatedCurrentAccess}
                  onChange={(e) => setSimulatedCurrentAccess(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <p className="text-xs text-slate-500 font-mono">Deficit gap before intervention: {100 - simulatedCurrentAccess}%</p>
              </div>

              {/* Slider 2: Post-Intervention Modeled Access */}
              <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-700 font-semibold text-xs">2. Projected Access Rate (Post-Project Target):</span>
                  <span className="font-mono text-xs font-bold text-emerald-600">{simulatedTargetAccess}%</span>
                </div>
                <input
                  type="range"
                  min={simulatedCurrentAccess + 5}
                  max="98"
                  value={simulatedTargetAccess}
                  onChange={(e) => setSimulatedTargetAccess(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <p className="text-xs text-slate-500 font-mono">
                  Net improvement: +{simulatedTargetAccess - simulatedCurrentAccess}% access expansion
                </p>
              </div>

              {/* Slider 3: Citizen Demand Resolution */}
              <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-700 font-semibold text-xs">3. Citizen Demand Signals (Before → After):</span>
                  <span className="font-mono text-xs font-bold text-slate-800">
                    {simulatedPreRequests} reqs → {simulatedPostRequests} reqs
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={simulatedPostRequests}
                  onChange={(e) => setSimulatedPostRequests(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <p className="text-xs text-slate-500 font-mono">
                  Resolved Complaints: ~{simulatedPreRequests - simulatedPostRequests} citizen issues closed
                </p>
              </div>

              {/* Budget Input */}
              <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-700 font-semibold text-xs">4. Allocated Capex Budget:</span>
                  <span className="font-mono text-xs font-bold text-emerald-600">₹{estimatedInvestmentCr.toFixed(1)} Cr</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="25"
                  step="0.5"
                  value={estimatedInvestmentCr}
                  onChange={(e) => setEstimatedInvestmentCr(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Modeled Impact Real-time Recalculation */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Modeled Outcome: Before vs. After Intervention
              </h3>

              {/* Before vs After Score Cards */}
              <div className="grid grid-cols-2 gap-4">
                {/* Baseline Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                      Baseline (Pre)
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded font-bold border border-rose-200 bg-rose-50 text-rose-700">
                      {baseTier.label}
                    </span>
                  </div>
                  <div className="text-3xl font-bold font-mono text-rose-600 tracking-tight">
                    {baselineEvaluation.total_score}
                    <span className="text-xs text-slate-500 font-normal"> /100</span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-0.5 pt-2 border-t border-slate-200 font-mono">
                    <div>Access: <strong className="text-slate-900">{simulatedCurrentAccess}%</strong></div>
                    <div>Deficit Gap: <strong className="text-rose-600">{baselineEvaluation.gap_percentage}%</strong></div>
                    <div>Demand: <strong className="text-slate-800">{simulatedPreRequests} signals</strong></div>
                  </div>
                </div>

                {/* Modeled After Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                      Modeled Post
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded font-bold border border-emerald-200 bg-emerald-50 text-emerald-700">
                      {modeledTier.label}
                    </span>
                  </div>
                  <div className="text-3xl font-bold font-mono text-emerald-600 tracking-tight">
                    {modeledEvaluation.total_score}
                    <span className="text-xs text-slate-500 font-normal"> /100</span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-0.5 pt-2 border-t border-slate-200 font-mono">
                    <div>Access: <strong className="text-slate-900">{simulatedTargetAccess}%</strong></div>
                    <div>Deficit Gap: <strong className="text-emerald-600">{modeledEvaluation.gap_percentage}%</strong></div>
                    <div>Demand: <strong className="text-slate-800">{simulatedPostRequests} signals</strong></div>
                  </div>
                </div>
              </div>

              {/* Impact Metric Deltas Strip */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Priority Delta</span>
                  <span className="text-sm font-bold font-mono text-emerald-600 flex items-center justify-center mt-1">
                    <ArrowDownRight className="w-4 h-4 mr-0.5" />
                    {scoreDelta} pts
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Gap Reduction</span>
                  <span className="text-sm font-bold font-mono text-emerald-600 flex items-center justify-center mt-1">
                    <ArrowDownRight className="w-4 h-4 mr-0.5" />
                    {gapDelta}%
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Beneficiaries</span>
                  <span className="text-sm font-bold font-mono text-slate-900 flex items-center justify-center mt-1">
                    <Users className="w-4 h-4 mr-1 text-slate-500" />
                    {(beneficiariesCount / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>

              {/* Fiscal Efficiency Gauge */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Fiscal Capital Efficiency:</span>
                    <span className="text-xs text-slate-500 font-mono">Cost per beneficiary: ₹{costPerBeneficiary.toLocaleString()}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-xs font-bold uppercase tracking-wider">
                  Grade A ROI
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conditional Sub-View: Completed Works Showcase */}
      {(activeTab === 'overview' || activeTab === 'portfolio') && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Validated Completed Works Portfolio (31 Public Projects)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Case studies of funded public projects where post-intervention citizen feedback and municipal audits verified gap elimination.
              </p>
            </div>
            <span className="text-xs uppercase tracking-wider text-emerald-700 font-bold font-mono bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
              ● 31 Works Commissioned
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {COMPLETED_IMPACT_PROJECTS.map((proj) => (
              <div key={proj.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 hover:border-slate-300 transition-all shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    {proj.category === 'Water' && <Droplet className="w-4 h-4 text-blue-600" />}
                    {proj.category === 'Health' && <HeartPulse className="w-4 h-4 text-rose-600" />}
                    {proj.category === 'Roads' && <Route className="w-4 h-4 text-amber-600" />}
                    {proj.district}
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-black uppercase tracking-wider">
                    {proj.status}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-800 leading-snug">
                  {proj.title}
                </h4>

                {/* Before vs After Metric Grid */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-white rounded-xl border border-slate-200 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-sans font-bold">Access Rate:</span>
                    <span className="text-slate-700 font-semibold">{proj.before_access}% → <strong className="text-emerald-600 font-bold">{proj.after_access}%</strong></span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-sans font-bold">Priority Score:</span>
                    <span className="text-rose-600 font-semibold">{proj.before_score} → <strong className="text-emerald-600 font-bold">{proj.after_score}</strong></span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-100 flex justify-between text-slate-600 text-[11px]">
                    <span>Beneficiaries: <strong className="text-slate-900">{proj.population_benefited.toLocaleString()}</strong></span>
                    <span>Capex: <strong className="text-emerald-700 font-bold">₹{(proj.investment_inr / 10000000).toFixed(1)} Cr</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-mono">
                  <span>Audited: {proj.completion_date}</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
