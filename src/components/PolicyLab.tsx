import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Building, 
  MapPin, 
  Droplet, 
  HeartPulse, 
  Route, 
  GraduationCap, 
  Zap,
  CheckCircle2, 
  Copy, 
  Check, 
  Printer, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  AlertTriangle,
  Send
} from 'lucide-react';
import { District, InfrastructureCategory, CitizenRequest } from '../types';
import { calculatePriorityScore, getCategoryAccess, getPriorityTier } from '../utils/scoring';

interface PolicyLabProps {
  districts: District[];
  requests: CitizenRequest[];
  selectedDistrictId: string;
  selectedCategory: InfrastructureCategory;
  onSelectDistrict: (id: string) => void;
  onSelectCategory: (cat: InfrastructureCategory) => void;
  onNavigateToImpact: (districtId: string, category: InfrastructureCategory) => void;
}

export const PolicyLab: React.FC<PolicyLabProps> = ({
  districts,
  requests,
  selectedDistrictId,
  selectedCategory,
  onSelectDistrict,
  onSelectCategory,
  onNavigateToImpact,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBrief, setGeneratedBrief] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active district
  const currentDistrict = districts.find((d) => d.id === selectedDistrictId) || districts[0];

  // Count requests for this district + category
  const activeRequests = requests.filter(
    (r) => r.location.toLowerCase() === currentDistrict.name.toLowerCase() && r.category === selectedCategory
  );
  const demandCount = Math.max(1, activeRequests.length);

  const currentAccess = getCategoryAccess(currentDistrict, selectedCategory);
  const scoreBreakdown = calculatePriorityScore(currentDistrict, selectedCategory, 8, demandCount);
  const priorityTier = getPriorityTier(scoreBreakdown.total_score);

  // Handle Generate Policy Brief via Gemini API
  const handleGenerateBrief = async () => {
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/generate-policy-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          district: currentDistrict.name,
          category: selectedCategory,
          demandCount,
          priorityScore: scoreBreakdown.total_score,
          currentAccess,
          population: currentDistrict.population,
          povertyIndex: currentDistrict.poverty_index,
          plannedInvestment: currentDistrict.planned_investment,
        }),
      });

      const resData = await response.json();
      if (resData.success && resData.brief) {
        setGeneratedBrief(resData.brief);
      } else {
        throw new Error(resData.error || 'Failed to generate policy brief.');
      }
    } catch (err: any) {
      console.warn('Policy brief generation failed or used fallback.');
      setErrorMessage(err.message || 'Error communicating with Gemini API.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedBrief) return;
    navigator.clipboard.writeText(generatedBrief);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-blue-50 text-blue-700 border border-blue-200">
                STEP 3 OF 4
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                AI Governance & Policy Recommendation Lab
              </h2>
            </div>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Translates mathematical priority scores and fused citizen demand data into structured, executive policy briefs for planning commissioners and finance ministries.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-mono">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-slate-500 uppercase tracking-wider text-xs font-semibold">Model:</span>
            <span className="text-slate-800 font-bold text-xs">Gemini 3.7 Flash</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Target Hotspot Dossier & Parameters */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              Target Hotspot Parameter Dossier
            </h3>

            {/* District & Category Selectors */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Target District:
                </label>
                <select
                  value={selectedDistrictId}
                  onChange={(e) => {
                    onSelectDistrict(e.target.value);
                    setGeneratedBrief(null);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none cursor-pointer"
                >
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.state}) — Pop: {(d.population / 100000).toFixed(1)}L
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Infrastructure Category:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['Drainage', 'Water', 'Health', 'Roads', 'Electricity', 'Education'] as InfrastructureCategory[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        onSelectCategory(cat);
                        setGeneratedBrief(null);
                      }}
                      className={`p-2.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-blue-50 text-blue-700 border border-blue-300 shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
                      }`}
                    >
                      {cat === 'Drainage' && <Droplet className="w-3.5 h-3.5 text-cyan-600" />}
                      {cat === 'Water' && <Droplet className="w-3.5 h-3.5 text-blue-600" />}
                      {cat === 'Health' && <HeartPulse className="w-3.5 h-3.5 text-rose-600" />}
                      {cat === 'Roads' && <Route className="w-3.5 h-3.5 text-amber-600" />}
                      {cat === 'Electricity' && <Zap className="w-3.5 h-3.5 text-yellow-600" />}
                      {cat === 'Education' && <GraduationCap className="w-3.5 h-3.5 text-purple-600" />}
                      <span>{cat}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Evidence Matrix */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs font-mono">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans block">
                Fused Quantitative Evidence:
              </span>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Priority Score:</span>
                <span className="font-bold" style={{ color: priorityTier.color }}>
                  {scoreBreakdown.total_score} / 100 ({priorityTier.label})
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Citizen Signals:</span>
                <span className="text-slate-900 font-bold">
                  {demandCount} verified signals
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Baseline Access:</span>
                <span className="text-slate-900 font-bold">
                  {currentAccess}% (Deficit: {100 - currentAccess}%)
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Poverty Index (MPI):</span>
                <span className="text-rose-600 font-bold">
                  {(currentDistrict.poverty_index * 100).toFixed(0)}% Vulnerability
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Planned Capex:</span>
                <span className="text-emerald-700 font-bold">
                  ₹{(currentDistrict.planned_investment / 10000000).toFixed(2)} Cr
                </span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerateBrief}
              disabled={isGenerating}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs uppercase tracking-wider rounded-lg shadow-xs disabled:opacity-50 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Drafting Executive Brief with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Executive Policy Brief</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Executive Policy Brief Output Memo */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 min-h-[480px] flex flex-col justify-between shadow-xs">
            {generatedBrief ? (
              <div className="space-y-4">
                {/* Official Memorandum Header */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-900 tracking-wider uppercase">
                        National Infrastructure Taskforce • Executive Memo
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      REF: DPI-{currentDistrict.name.toUpperCase()}-{selectedCategory.toUpperCase()}-{Date.now().toString().slice(-4)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopy}
                      className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 text-xs transition-colors cursor-pointer shadow-xs"
                      title="Copy Markdown Brief"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={handlePrint}
                      className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 text-xs transition-colors cursor-pointer shadow-xs"
                      title="Print Executive Brief"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Markdown Policy Content */}
                <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 text-sm leading-relaxed space-y-4 font-sans max-h-[420px] overflow-y-auto">
                  <div className="whitespace-pre-line leading-relaxed">
                    {generatedBrief}
                  </div>
                </div>

                {/* Call to Action: Next Step into Impact Simulator */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs text-slate-600">
                    Policy brief finalized. Advance to simulated interventions:
                  </span>

                  <button
                    onClick={() => onNavigateToImpact(currentDistrict.id, selectedCategory)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs uppercase tracking-wider rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Step 4: Simulate Project Impact</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Awaiting Generation State */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Ready to Generate Executive Policy Brief
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
                    Select target district parameters and generate an evidence-backed intervention memo for <strong className="text-slate-900">{currentDistrict.name} ({selectedCategory})</strong>.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 text-left max-w-sm">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Structured Government Specification:
                  </div>
                  <p className="leading-relaxed text-xs">
                    Produces a quantitative problem diagnostic, strategic budget justification, 3-phase engineering roadmap, and ROI beneficiary metrics.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
