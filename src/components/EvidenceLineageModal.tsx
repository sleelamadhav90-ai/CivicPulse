import React from 'react';
import { X, ShieldCheck, Scale, Layers, FileText, Database, ArrowRight } from 'lucide-react';
import { ScoreBreakdown, District, InfrastructureCategory } from '../types';
import { getPriorityTier } from '../utils/scoring';

interface EvidenceLineageModalProps {
  isOpen: boolean;
  onClose: () => void;
  breakdown?: ScoreBreakdown | null;
  district?: District | null;
  category?: InfrastructureCategory | null;
}

export const EvidenceLineageModal: React.FC<EvidenceLineageModalProps> = ({
  isOpen,
  onClose,
  breakdown,
  district,
  category = 'Water',
}) => {
  if (!isOpen) return null;

  const score = breakdown?.total_score ?? 51.7;
  const tier = getPriorityTier(score);
  const districtName = district?.name ?? 'Guntur';
  const categoryName = category ?? 'Water';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[#D65A3A] text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
                CivicPulse Complete Evidence Lineage Audit
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-semibold uppercase tracking-wider">
                  Traceable Provenance
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Target: {districtName} District ({categoryName} Sector)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-slate-700 text-xs sm:text-sm">
          {/* Report-to-Policy Pipeline Flow */}
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-bold font-mono block">
              1. Report-to-Policy Processing Pipeline
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center font-mono text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="font-bold text-blue-900">Citizen Report</div>
                <div className="text-[10px] text-blue-700 mt-1">Multilingual Voice / Text Ingestion</div>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="font-bold text-emerald-900">Public Baseline</div>
                <div className="text-[10px] text-emerald-700 mt-1">Census & Infrastructure Access Audit</div>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="font-bold text-amber-900">5-Pillar Score</div>
                <div className="text-[10px] text-amber-700 mt-1">Deterministic 0–100 Calculation</div>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                <div className="font-bold text-purple-900">Policy Brief</div>
                <div className="text-[10px] text-purple-700 mt-1">Action Queue & Capital Allocation</div>
              </div>
            </div>
          </div>

          {/* Current Report Lineage Snapshot */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-900 uppercase tracking-wider font-mono text-xs">
                Active Report Audit Record
              </span>
              <span className="text-xs font-mono bg-white px-2 py-0.5 border border-slate-200 rounded text-slate-700">
                Score: <strong className="text-slate-900">{score} / 100</strong> ({tier.label})
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">REPORT ID</span>
                <span className="font-bold text-slate-900">CP-2026-004821</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">CATEGORY</span>
                <span className="font-bold text-slate-900">{categoryName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">SEVERITY</span>
                <span className="font-bold text-slate-900">{breakdown?.sev_score ? (breakdown.sev_score / 10).toFixed(1) : '7.0'}/10</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">DISTRICT TARGET</span>
                <span className="font-bold text-slate-900">{districtName}</span>
              </div>
            </div>
          </div>

          {/* Five Pillars and Configured Weights */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-bold font-mono">
                2. Five-Pillar Priority Formula & Configured Weights
              </span>
              <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                Weights Sum = 100%
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Citizen Demand (30% weight)</span>
                  <span className="text-slate-500 text-[11px]">Logarithmic volume scaling of citizen voice/text submissions</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-blue-700">{breakdown?.demand_score ?? 15.2} pts</span>
                  <div className="text-[10px] text-slate-500">Contrib: {((breakdown?.demand_score ?? 15.2) * 0.30).toFixed(2)}</div>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Infrastructure Access Gap (25% weight)</span>
                  <span className="text-slate-500 text-[11px]">Direct physical deficit (100% - access baseline %)</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-rose-700">{breakdown?.gap_score ?? 40} pts</span>
                  <div className="text-[10px] text-slate-500">Contrib: {((breakdown?.gap_score ?? 40) * 0.25).toFixed(2)}</div>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Population Impact & Vulnerability (20% weight)</span>
                  <span className="text-slate-500 text-[11px]">Target beneficiary population volume & poverty index stratification</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-purple-700">{breakdown?.vuln_score ?? 51} pts</span>
                  <div className="text-[10px] text-slate-500">Contrib: {((breakdown?.vuln_score ?? 51) * 0.20).toFixed(2)}</div>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Hazard Urgency (15% weight)</span>
                  <span className="text-slate-500 text-[11px]">Extracted severity rating and immediate life-safety risk factor</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-amber-700">{breakdown?.sev_score ?? 70} pts</span>
                  <div className="text-[10px] text-slate-500">Contrib: {((breakdown?.sev_score ?? 70) * 0.15).toFixed(2)}</div>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Government Investment Alignment (10% weight)</span>
                  <span className="text-slate-500 text-[11px]">Planned capital expenditure (CapEx) vs unbudgeted deficit gap</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-700">{breakdown?.align_score ?? 95} pts</span>
                  <div className="text-[10px] text-slate-500">Contrib: {((breakdown?.align_score ?? 95) * 0.10).toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Provenance & Disclaimer Notice */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
            <span className="font-bold uppercase tracking-wider block mb-1">Data Provenance & Baseline Disclaimer</span>
            <p>
              Figures and benchmark baselines displayed reflect curated open data baselines (Census of India / Ministry Open Data registries) and prototype municipal estimates. They are transparently labelled and do not claim unverified official census figures unless traceable to published government records.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
          >
            Close Lineage Audit
          </button>
        </div>
      </div>
    </div>
  );
};
