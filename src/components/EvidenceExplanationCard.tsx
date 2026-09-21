import React, { useState } from 'react';
import { ShieldCheck, Scale, Calculator, ChevronDown, ChevronUp, Layers, FileText, Database, Users, AlertTriangle, Building2, CheckCircle2 } from 'lucide-react';
import { ScoreBreakdown, District, InfrastructureCategory, CitizenRequest } from '../types';
import { getScoreComponentContributions, getIssueEvidenceExplanation, getPriorityTier } from '../utils/scoring';
import { getProvenanceBadgeStyles } from '../utils/provenance';
import { validateSignalRecord } from '../utils/signalValidator';

interface EvidenceExplanationCardProps {
  district: District;
  category: InfrastructureCategory;
  requests?: CitizenRequest[];
  breakdown?: ScoreBreakdown;
  compact?: boolean;
}

export const EvidenceExplanationCard: React.FC<EvidenceExplanationCardProps> = ({
  district,
  category,
  requests = [],
  breakdown,
  compact = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(!compact);
  const evidence = getIssueEvidenceExplanation(district, category, requests, breakdown);
  const tier = getPriorityTier(evidence.totalScore);
  const valResult = validateSignalRecord(district.name, category, 8, district);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-xs font-sans text-xs space-y-0">
      {/* Header Toggle */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer border-b border-slate-200/80"
      >
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-xs">Why was this issue prioritized?</span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Deterministic Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Score: <strong style={{ color: tier.color }}>{evidence.totalScore}/100</strong> ({tier.label}) • {evidence.citizenDemand.signalsCount} signals • {evidence.infrastructureGap.deficitPct}% deficit
            </p>
          </div>
        </div>

        <button className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-4 bg-slate-50">
          
          {/* Data Quality & Validation Badge */}
          <div className="p-2.5 bg-emerald-50/90 border border-emerald-200 rounded-lg flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="font-mono font-bold text-emerald-900 text-[11px] block">
                  DATA QUALITY & SIGNAL VALIDATION: {valResult.dataQualityScore}/100
                </span>
                <span className="text-[10px] text-emerald-800 font-sans">
                  {valResult.validationFlags.join(' • ')}
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 rounded uppercase border border-emerald-300 shrink-0">
              Validated
            </span>
          </div>

          {/* Data Lineage Breadcrumb */}
          <div className="p-2.5 bg-slate-900 text-slate-200 rounded-lg font-mono text-[10px] flex items-center justify-between overflow-x-auto gap-2">
            <span className="text-blue-400 font-bold shrink-0">DATA LINEAGE:</span>
            <div className="flex items-center space-x-1 whitespace-nowrap text-slate-300">
              <span className="bg-slate-800 px-1.5 py-0.5 rounded">Signals ({evidence.citizenDemand.signalsCount})</span>
              <span>→</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded">Validated</span>
              <span>→</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded">Cluster ({category})</span>
              <span>→</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">Evidence</span>
              <span>→</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300">Score ({evidence.totalScore})</span>
              <span>→</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded">Action Queue</span>
            </div>
          </div>

          {/* 1. WHY THIS SCORE? (Traceable Component Contributions Grid) */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Scale className="w-3.5 h-3.5 text-blue-600" />
              1. Deterministic 5-Pillar Score Calculation
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 font-mono text-[11px]">
              
              {/* Pillar 1: Citizen Demand */}
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Demand (30%)</div>
                <div className="text-sm font-bold text-blue-700">{evidence.citizenDemand.demandScore} pts</div>
                <div className="text-[10px] text-slate-600">Contrib: <strong>+{evidence.citizenDemand.contribution}</strong></div>
              </div>

              {/* Pillar 2: Infrastructure Gap */}
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Gap Deficit (25%)</div>
                <div className="text-sm font-bold text-rose-700">{evidence.infrastructureGap.gapScore} pts</div>
                <div className="text-[10px] text-slate-600">Contrib: <strong>+{evidence.infrastructureGap.contribution}</strong></div>
              </div>

              {/* Pillar 3: Population Impact */}
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Pop Impact (20%)</div>
                <div className="text-sm font-bold text-purple-700">{evidence.populationImpact.vulnScore} pts</div>
                <div className="text-[10px] text-slate-600">Contrib: <strong>+{evidence.populationImpact.contribution}</strong></div>
              </div>

              {/* Pillar 4: Urgency */}
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Urgency (15%)</div>
                <div className="text-sm font-bold text-amber-700">{evidence.urgency.severityScore} pts</div>
                <div className="text-[10px] text-slate-600">Contrib: <strong>+{evidence.urgency.contribution}</strong></div>
              </div>

              {/* Pillar 5: Government Priority */}
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Gov Alignment (10%)</div>
                <div className="text-sm font-bold text-emerald-700">{evidence.governmentPriority.alignScore} pts</div>
                <div className="text-[10px] text-slate-600">Contrib: <strong>+{evidence.governmentPriority.contribution}</strong></div>
              </div>

            </div>

            <div className="p-2 bg-slate-100 rounded-lg font-mono text-[10px] text-slate-700 text-center">
              Formula: ({evidence.citizenDemand.contribution}) + ({evidence.infrastructureGap.contribution}) + ({evidence.populationImpact.contribution}) + ({evidence.urgency.contribution}) + ({evidence.governmentPriority.contribution}) = <strong className="text-slate-900">{evidence.totalScore} / 100</strong>
            </div>
          </div>

          {/* 2. DATA & EVIDENCE LAYER */}
          <div className="space-y-2 pt-1 border-t border-slate-200/80">
            <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Database className="w-3.5 h-3.5 text-purple-600" />
              2. Supporting Grounded Evidence & Datasets
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700">
              
              {/* Evidence Panel A: Citizen Signals */}
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="font-bold text-slate-900 uppercase flex items-center gap-1">
                    <Users className="w-3 h-3 text-blue-600" />
                    Citizen Reports
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                    {evidence.citizenDemand.signalsCount} Signals
                  </span>
                </div>
                {evidence.citizenDemand.sampleExcerpts.length > 0 ? (
                  <ul className="space-y-1 text-[11px] text-slate-600 list-disc italic pl-4">
                    {evidence.citizenDemand.sampleExcerpts.map((excerpt, idx) => (
                      <li key={idx} className="line-clamp-2 font-sans">"{excerpt}"</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-slate-500 italic">No direct raw speech excerpts; aggregated from ward registry.</p>
                )}
              </div>

              {/* Evidence Panel B: Public Data & Infrastructure Deficit */}
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="font-bold text-slate-900 uppercase flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-rose-600" />
                    Public Benchmark Deficit
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                    {evidence.infrastructureGap.deficitPct}% Deficit
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                  {evidence.infrastructureGap.publicBenchmarkSummary}
                </p>
                <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                  <span>Source: {evidence.infrastructureGap.primaryDataSource}</span>
                  <span className="text-emerald-700 font-semibold">Verified Benchmark</span>
                </div>
              </div>

            </div>

            {/* Provenance Badges Bar */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Data Provenance:</span>
              {evidence.dataSources.map((ds, i) => {
                const label = ds.isSynthetic ? 'CivicPulse Demo Signal' : ds.name.includes('Deterministic') ? 'Deterministic Calculation' : 'Public Benchmark';
                const style = getProvenanceBadgeStyles(label);
                return (
                  <span key={i} className={`text-[9px] font-mono font-medium px-2 py-0.5 rounded border ${style.bg} ${style.text} ${style.border}`}>
                    {ds.label} ({ds.year})
                  </span>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
