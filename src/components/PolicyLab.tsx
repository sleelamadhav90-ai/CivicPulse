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
      console.error('Error generating policy brief:', err);
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
      <div className="bg-[#111318] border border-slate-800 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="px-2 py-0.5 text-[9px] uppercase tracking-widest font-mono rounded bg-white/5 text-slate-400 border border-white/10">
                MODULE 03
              </span>
              <h2 className="text-xl font-light tracking-tight text-white">
                AI Governance & Policy Recommendation Lab
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Translates mathematical priority scores and fused citizen demand data into structured, executive policy briefs for planning commissioners and finance ministries.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-[#0c0d10] px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 uppercase tracking-widest text-[9px]">Model:</span>
            <span className="text-slate-200 font-medium text-xs">Gemini 3.7 Flash</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Target Hotspot Dossier & Parameters */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#111318] border border-slate-800 rounded-lg p-6 space-y-5">
            <h3 className="text-xs font-medium uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              Target Hotspot Parameter Dossier
            </h3>

            {/* District & Category Selectors */}
            <div className="space-y-3">
              <div>
                <label className="block text-[9px] uppercase tracking-widest text-slate-500 font-medium mb-1">
                  Select Target District:
                </label>
                <select
                  value={selectedDistrictId}
                  onChange={(e) => {
                    onSelectDistrict(e.target.value);
                    setGeneratedBrief(null);
                  }}
                  className="w-full bg-[#0c0d10] border border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 focus:ring-1 focus:ring-slate-400 focus:outline-none cursor-pointer"
                >
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.state}) — Pop: {(d.population / 100000).toFixed(1)}L
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-widest text-slate-500 font-medium mb-1">
                  Select Infrastructure Category:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Water', 'Health', 'Roads', 'Education'] as InfrastructureCategory[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        onSelectCategory(cat);
                        setGeneratedBrief(null);
                      }}
                      className={`p-2 rounded-lg text-xs font-medium flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                          : 'bg-[#0c0d10] text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {cat === 'Water' && <Droplet className="w-3.5 h-3.5 text-slate-400" />}
                      {cat === 'Health' && <HeartPulse className="w-3.5 h-3.5 text-slate-400" />}
                      {cat === 'Roads' && <Route className="w-3.5 h-3.5 text-slate-400" />}
                      {cat === 'Education' && <GraduationCap className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{cat}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Evidence Matrix */}
            <div className="p-4 bg-[#0c0d10] rounded-lg border border-slate-800 space-y-2.5 text-xs font-mono">
              <span className="text-[9px] uppercase tracking-widest text-slate-500 font-medium block">
                Fused Quantitative Evidence:
              </span>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Priority Index:</span>
                <span className="font-medium" style={{ color: priorityTier.color }}>
                  {scoreBreakdown.total_score} / 100 ({priorityTier.label})
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Citizen Signals:</span>
                <span className="text-slate-200 font-medium">
                  {demandCount} verified signals
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Baseline Access:</span>
                <span className="text-slate-200 font-medium">
                  {currentAccess}% (Deficit: {100 - currentAccess}%)
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Poverty Index (MPI):</span>
                <span className="text-rose-400 font-medium">
                  {(currentDistrict.poverty_index * 100).toFixed(0)}% Vulnerability
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Planned Capex:</span>
                <span className="text-emerald-400 font-medium">
                  ₹{(currentDistrict.planned_investment / 10000000).toFixed(2)} Cr
                </span>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateBrief}
              disabled={isGenerating}
              className="w-full py-2.5 bg-slate-100 hover:bg-white text-slate-900 font-semibold text-xs uppercase tracking-wider rounded-lg shadow-sm disabled:opacity-50 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></span>
                  <span>Drafting Executive Brief with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-slate-900" />
                  <span>Generate Executive Policy Brief</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Executive Policy Brief Output Memo */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#111318] border border-slate-800 rounded-lg p-6 min-h-[480px] flex flex-col justify-between">
            {generatedBrief ? (
              <div className="space-y-4">
                {/* Official Memorandum Header */}
                <div className="p-4 bg-[#0c0d10] border border-slate-800 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-medium text-slate-200 tracking-wider uppercase">
                        National Infrastructure Taskforce • Executive Memo
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      REF: DPI-{currentDistrict.name.toUpperCase()}-{selectedCategory.toUpperCase()}-{Date.now().toString().slice(-4)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopy}
                      className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg border border-white/10 text-xs transition-colors cursor-pointer"
                      title="Copy Markdown Brief"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={handlePrint}
                      className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg border border-white/10 text-xs transition-colors cursor-pointer"
                      title="Print Executive Brief"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Markdown Policy Content */}
                <div className="p-6 bg-[#0c0d10] rounded-lg border border-slate-800 text-slate-300 text-xs leading-relaxed space-y-4 font-sans max-h-[420px] overflow-y-auto">
                  <div className="whitespace-pre-line leading-relaxed">
                    {generatedBrief}
                  </div>
                </div>

                {/* Call to Action: Next Step into Impact Simulator */}
                <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">
                    Policy brief finalized. Advance to simulated interventions:
                  </span>

                  <button
                    onClick={() => onNavigateToImpact(currentDistrict.id, selectedCategory)}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-white text-slate-900 font-semibold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Simulate Project Impact</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              /* Awaiting Generation State */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-lg bg-white/5 text-slate-400 border border-white/10 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-light text-slate-200 uppercase tracking-wider">
                    Ready to Generate Executive Policy Brief
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                    Select target district parameters and generate an evidence-backed intervention memo for <strong className="text-slate-300 font-normal">{currentDistrict.name} ({selectedCategory})</strong>.
                  </p>
                </div>
                <div className="p-3 bg-[#0c0d10] rounded-lg border border-slate-800 text-[11px] text-slate-500 text-left max-w-sm">
                  <div className="font-medium text-slate-300 flex items-center gap-1.5 mb-1 text-[10px] uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Structured Government Specification:
                  </div>
                  <p className="leading-relaxed">
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
