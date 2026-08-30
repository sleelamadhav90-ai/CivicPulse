import React from 'react';
import { X, Calculator, ShieldCheck, Scale, Cpu, Layers } from 'lucide-react';
import { ScoreBreakdown, District, InfrastructureCategory } from '../types';
import { getPriorityTier } from '../utils/scoring';

interface ScoreBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  breakdown?: ScoreBreakdown | null;
  district?: District | null;
  category?: InfrastructureCategory | null;
}

export const ScoreBreakdownModal: React.FC<ScoreBreakdownModalProps> = ({
  isOpen,
  onClose,
  breakdown,
  district,
  category = 'Water',
}) => {
  if (!isOpen || !breakdown || !district) return null;

  const tier = getPriorityTier(breakdown.total_score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c0d10]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#111318] border border-slate-800 rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 bg-[#0c0d10]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white/5 text-slate-300 border border-white/10">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-light text-slate-100 flex items-center gap-2">
                Deterministic Priority Scoring Engine
                <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono uppercase tracking-wider">
                  Auditable
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Mathematical formulation for {district.name} ({category})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Core Score Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-lg bg-[#0c0d10] border border-slate-800 gap-4">
            <div className="flex items-center space-x-4">
              <div className="text-4xl font-extralight font-mono tracking-tight" style={{ color: tier.color }}>
                {breakdown.total_score}
                <span className="text-xs text-slate-600 font-normal"> /100</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-200">National Priority Index</span>
                  <span className="px-2 py-0.5 text-[9px] uppercase tracking-widest font-mono rounded border border-white/10 bg-white/5 text-slate-300">
                    {tier.label} Tier
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {breakdown.demand_count} aggregated citizen demand signal(s) recorded
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-500 font-mono border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-4 space-y-0.5">
              <div>Baseline Access: <span className="text-slate-200 font-medium">{breakdown.current_access}%</span></div>
              <div>Deficit Gap: <span className="text-rose-400 font-medium">{breakdown.gap_percentage}%</span></div>
            </div>
          </div>

          {/* Mathematical Formula Formula Card */}
          <div className="p-3.5 bg-[#0c0d10] border border-slate-800 rounded-lg text-xs space-y-1.5">
            <div className="text-[10px] uppercase tracking-widest font-medium text-slate-400 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-slate-400" />
              Standardized Composite Formula
            </div>
            <div className="font-mono text-[11px] text-slate-300 bg-white/[0.02] p-2 rounded border border-slate-800/80 overflow-x-auto">
              Score = 0.35·(Demand) + 0.25·(Deficit Gap) + 0.15·(Severity) + 0.15·(Poverty Index) + 0.10·(Alignment)
            </div>
          </div>

          {/* Detailed Component Breakdown Bars */}
          <div className="space-y-3">
            <h4 className="text-[9px] uppercase tracking-widest text-slate-500 font-medium flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-slate-400" />
              Weighted Component Evaluation
            </h4>

            {/* 1. Demand Signal Volume */}
            <div className="p-3 rounded-lg bg-[#0c0d10] border border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-medium text-slate-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  1. Citizen Demand Volume (35% Weight)
                </span>
                <span className="font-mono text-slate-400 text-[11px]">
                  {breakdown.demand_score} pts × 0.35 = <strong className="text-slate-200 font-medium">{(breakdown.demand_score * 0.35).toFixed(2)}</strong>
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-slate-300 h-full rounded-full transition-all duration-500" style={{ width: `${breakdown.demand_score}%` }}></div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">
                min(20 × ln(1 + {breakdown.demand_count}), 100) — prioritizes persistent signal clustering.
              </p>
            </div>

            {/* 2. Infrastructure Gap */}
            <div className="p-3 rounded-lg bg-[#0c0d10] border border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-medium text-slate-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  2. Infrastructure Deficit Gap (25% Weight)
                </span>
                <span className="font-mono text-slate-400 text-[11px]">
                  {breakdown.gap_score} pts × 0.25 = <strong className="text-rose-300 font-medium">{(breakdown.gap_score * 0.25).toFixed(2)}</strong>
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${breakdown.gap_score}%` }}></div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">
                100 - {breakdown.current_access}% (Current Access) = {breakdown.gap_percentage}% Gap.
              </p>
            </div>

            {/* 3. Severity / Urgency */}
            <div className="p-3 rounded-lg bg-[#0c0d10] border border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-medium text-slate-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  3. Individual Severity & Safety Urgency (15% Weight)
                </span>
                <span className="font-mono text-slate-400 text-[11px]">
                  {breakdown.sev_score} pts × 0.15 = <strong className="text-amber-300 font-medium">{(breakdown.sev_score * 0.15).toFixed(2)}</strong>
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${breakdown.sev_score}%` }}></div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">
                Extracted by Gemini from natural language / audio input (Scale 1–10).
              </p>
            </div>

            {/* 4. Social Vulnerability */}
            <div className="p-3 rounded-lg bg-[#0c0d10] border border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-medium text-slate-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  4. Social Vulnerability & Poverty (15% Weight)
                </span>
                <span className="font-mono text-slate-400 text-[11px]">
                  {breakdown.vuln_score} pts × 0.15 = <strong className="text-slate-200 font-medium">{(breakdown.vuln_score * 0.15).toFixed(2)}</strong>
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full rounded-full transition-all duration-500" style={{ width: `${breakdown.vuln_score}%` }}></div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">
                District Multidimensional Poverty Index: {(district.poverty_index * 100).toFixed(0)}%.
              </p>
            </div>

            {/* 5. Policy & Investment Alignment */}
            <div className="p-3 rounded-lg bg-[#0c0d10] border border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-medium text-slate-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  5. National Policy & Capex Alignment (10% Weight)
                </span>
                <span className="font-mono text-slate-400 text-[11px]">
                  {breakdown.align_score} pts × 0.10 = <strong className="text-emerald-300 font-medium">{(breakdown.align_score * 0.10).toFixed(2)}</strong>
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${breakdown.align_score}%` }}></div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">
                Planned Capex Allocation: ₹{(district.planned_investment / 10000000).toFixed(2)} Cr.
              </p>
            </div>
          </div>

          {/* Architectural Distinction Note */}
          <div className="p-3 bg-[#0c0d10] border border-slate-800 rounded-lg flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-200 font-medium">Deterministic Transparency:</strong> AI models (Gemini) are utilized exclusively for transcription, translation, and structured semantic parsing. The composite Priority Index is computed deterministically, ensuring uncompromised auditability.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800/60 bg-[#0c0d10] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-900 bg-slate-100 hover:bg-white rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            Close Audit Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
