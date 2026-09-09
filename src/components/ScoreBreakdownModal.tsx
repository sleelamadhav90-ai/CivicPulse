import React from 'react';
import { X, Calculator, ShieldCheck, Scale, Cpu, Layers } from 'lucide-react';
import { ScoreBreakdown, District, InfrastructureCategory } from '../types';
import { getPriorityTier } from '../utils/scoring';
import { useLanguage } from '../context/LanguageContext';

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
  const { t, tCategory } = useLanguage();
  if (!isOpen || !breakdown || !district) return null;

  const tier = getPriorityTier(breakdown.total_score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                {t('score.modal_title')}
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-semibold uppercase tracking-wider">
                  {t('score.auditable_badge')}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {t('score.math_formulation', { district: district.name, category: tCategory(category) })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Core Score Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 gap-4">
            <div className="flex items-center space-x-4">
              <div className="text-4xl font-bold font-mono tracking-tight" style={{ color: tier.color }}>
                {breakdown.total_score}
                <span className="text-xs text-slate-500 font-normal"> /100</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800">{t('score.national_priority_index')}</span>
                  <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider font-mono rounded border border-slate-200 bg-white text-slate-700">
                    {tier.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('score.signals_recorded', { count: breakdown.demand_count })}
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-600 font-mono border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-4 space-y-0.5">
              <div>{t('score.baseline_access')} <span className="text-slate-900 font-bold">{breakdown.current_access}%</span></div>
              <div>{t('score.deficit_gap')} <span className="text-rose-600 font-bold">{breakdown.gap_percentage}%</span></div>
            </div>
          </div>

          {/* Mathematical Formula Formula Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
            <div className="text-xs uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1.5 font-sans">
              <Scale className="w-3.5 h-3.5 text-blue-600" />
              {t('score.five_pillar_formula')}
            </div>
            <div className="font-mono text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 overflow-x-auto">
              {t('score.formula_text')}
            </div>
          </div>

          {/* Detailed Component Breakdown Bars */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-slate-700 font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              {t('score.five_pillar_evaluation')}
            </h4>

            {/* 1. Demand Signal Volume */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  {t('score.demand_pillar')}
                </span>
                <span className="font-mono text-slate-600 text-xs">
                  {breakdown.demand_score} pts × 0.30 = <strong className="text-slate-900">{(breakdown.demand_score * 0.30).toFixed(2)}</strong>
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${breakdown.demand_score}%` }}></div>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                min(22 × ln(1 + {breakdown.demand_count}), 100) — {t('score.demand_formula_note')}
              </p>
            </div>

            {/* 2. Infrastructure Gap */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                  {t('score.gap_pillar')}
                </span>
                <span className="font-mono text-slate-600 text-xs">
                  {breakdown.gap_score} pts × 0.25 = <strong className="text-rose-700">{(breakdown.gap_score * 0.25).toFixed(2)}</strong>
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-600 h-full rounded-full transition-all duration-500" style={{ width: `${breakdown.gap_score}%` }}></div>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                {t('score.gap_formula_note', { access: breakdown.current_access, gap: breakdown.gap_percentage })}
              </p>
              {breakdown.publicContextSummary && (
                <div className="mt-2 p-2 bg-sky-50 border border-sky-200 rounded-lg text-[11px] text-sky-900 leading-relaxed">
                  <div className="flex items-center gap-1.5 font-semibold text-sky-950 mb-0.5">
                    <span className="px-1.5 py-0.2 bg-sky-100 border border-sky-300 rounded text-[9px] uppercase font-mono">
                      Public Data Snapshot
                    </span>
                    <span>Corroborating Open Data Benchmark</span>
                  </div>
                  <div>{breakdown.publicContextSummary}</div>
                  {breakdown.publicDataSource && (
                    <div className="text-[10px] text-sky-700 font-mono mt-0.5">
                      Source: {breakdown.publicDataSource}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Population Impact & Density */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                  {t('score.vuln_pillar')}
                </span>
                <span className="font-mono text-slate-600 text-xs">
                  {breakdown.vuln_score} pts × 0.20 = <strong className="text-slate-900">{(breakdown.vuln_score * 0.20).toFixed(2)}</strong>
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${breakdown.vuln_score}%` }}></div>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                {t('score.vuln_formula_note', { pop: (district.population / 100000).toFixed(1), poverty: (district.poverty_index * 100).toFixed(0) })}
              </p>
            </div>

            {/* 4. Urgency */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                  {t('score.urgency_pillar')}
                </span>
                <span className="font-mono text-slate-600 text-xs">
                  {breakdown.sev_score} pts × 0.15 = <strong className="text-amber-700">{(breakdown.sev_score * 0.15).toFixed(2)}</strong>
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${breakdown.sev_score}%` }}></div>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                {t('score.urgency_formula_note')}
              </p>
            </div>

            {/* 5. Government Priority */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  {t('score.capex_pillar')}
                </span>
                <span className="font-mono text-slate-600 text-xs">
                  {breakdown.align_score} pts × 0.10 = <strong className="text-emerald-700">{(breakdown.align_score * 0.10).toFixed(2)}</strong>
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${breakdown.align_score}%` }}></div>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                {t('score.capex_formula_note', { capex: (district.planned_investment / 10000000).toFixed(2) })}
              </p>
            </div>
          </div>

          {/* Architectural Distinction Note */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed">
              {t('score.deterministic_note')}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            {t('score.close_btn')}
          </button>
        </div>
      </div>
    </div>
  );
};
