import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  CheckCircle2, 
  ArrowDownRight, 
  ArrowUpRight, 
  Sliders, 
  Building, 
  Droplet, 
  HeartPulse, 
  Route, 
  GraduationCap, 
  ShieldCheck, 
  RotateCcw, 
  Award, 
  Layers,
  Sparkles,
  Users,
  Wallet
} from 'lucide-react';
import { District, InfrastructureCategory, ImpactProject } from '../types';
import { COMPLETED_IMPACT_PROJECTS } from '../data/initialRequests';
import { calculatePriorityScore, getCategoryAccess, getPriorityTier } from '../utils/scoring';

interface ImpactSimulatorProps {
  districts: District[];
  initialDistrictId?: string;
  initialCategory?: InfrastructureCategory;
}

export const ImpactSimulator: React.FC<ImpactSimulatorProps> = ({
  districts,
  initialDistrictId,
  initialCategory,
}) => {
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(initialDistrictId || 'guntur');
  const [selectedCategory, setSelectedCategory] = useState<InfrastructureCategory>(initialCategory || 'Water');

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

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-blue-50 text-blue-700 border border-blue-200">
                STEP 4 OF 4
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Deterministic Impact Measurement & Closed-Loop DPI Tracker
              </h2>
            </div>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Closes the public infrastructure feedback loop: models how capital interventions expand access, resolve citizen demand, and systematically reduce the National Priority Deficit Score.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-500 uppercase tracking-wider text-xs font-semibold">Outcome:</span>
            <span className="text-slate-800 font-bold text-xs">Auditable Feedback Loop</span>
          </div>
        </div>
      </div>

      {/* Interactive Simulator Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Simulation Sliders */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                Intervention Modeling Controls
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none cursor-pointer"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="Water">Water Access</option>
                  <option value="Health">Healthcare Access</option>
                  <option value="Roads">Road Infrastructure</option>
                  <option value="Education">School Infrastructure</option>
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
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-xs">
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
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Priority Delta</span>
                <span className="text-sm font-bold font-mono text-emerald-600 flex items-center justify-center mt-1">
                  <ArrowDownRight className="w-4 h-4 mr-0.5" />
                  {scoreDelta} pts
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Gap Reduction</span>
                <span className="text-sm font-bold font-mono text-emerald-600 flex items-center justify-center mt-1">
                  <ArrowDownRight className="w-4 h-4 mr-0.5" />
                  {gapDelta}%
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
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

            {/* Methodological Note */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-2.5 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-800 font-semibold">Closed-Loop Verification:</strong> Deterministically models public ROI by quantifying how capital outlays compress access deficits and eliminate citizen friction.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Historic Tracked DPI Case Studies Showcase */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Historical Completed DPI Interventions (Validated Impact Archive)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Case studies of funded public projects where post-intervention citizen feedback confirmed measurable gap elimination.
            </p>
          </div>
          <span className="text-xs uppercase tracking-wider text-emerald-700 font-bold font-mono bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            3 Projects Completed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COMPLETED_IMPACT_PROJECTS.map((proj) => (
            <div key={proj.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  {proj.category === 'Water' && <Droplet className="w-3.5 h-3.5 text-blue-600" />}
                  {proj.category === 'Health' && <HeartPulse className="w-3.5 h-3.5 text-rose-600" />}
                  {proj.category === 'Roads' && <Route className="w-3.5 h-3.5 text-amber-600" />}
                  {proj.district}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-semibold uppercase tracking-wider">
                  {proj.status}
                </span>
              </div>

              <h4 className="text-xs font-medium text-slate-700 line-clamp-2">
                {proj.title}
              </h4>

              {/* Before vs After Metric Grid */}
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-white rounded-lg border border-slate-200 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-xs uppercase tracking-wider">Access:</span>
                  <span className="text-slate-700">{proj.before_access}% → <strong className="text-emerald-600 font-bold">{proj.after_access}%</strong></span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs uppercase tracking-wider">Priority:</span>
                  <span className="text-rose-600">{proj.before_score} → <strong className="text-emerald-600 font-bold">{proj.after_score}</strong></span>
                </div>
                <div className="col-span-2 pt-1.5 border-t border-slate-100 flex justify-between text-slate-600">
                  <span>Beneficiaries: <strong className="text-slate-900 font-semibold">{proj.population_benefited.toLocaleString()}</strong></span>
                  <span>Capex: <strong className="text-emerald-700 font-bold">₹{(proj.investment_inr / 10000000).toFixed(1)} Cr</strong></span>
                </div>
              </div>

              <p className="text-xs text-slate-500 font-mono">
                Completed: {proj.completion_date} • Post-project citizen survey verified
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
