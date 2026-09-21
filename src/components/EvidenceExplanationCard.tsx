import React, { useState } from 'react';
import { ShieldCheck, Scale, Calculator, ChevronDown, ChevronUp, Layers, FileText, Database, Users, AlertTriangle, Building2, CheckCircle2, Sliders, Clock, Info } from 'lucide-react';
import { ScoreBreakdown, District, InfrastructureCategory, CitizenRequest } from '../types';
import { getScoreComponentContributions, getIssueEvidenceExplanation, getPriorityTier } from '../utils/scoring';
import { getProvenanceBadgeStyles } from '../utils/provenance';
import { validateSignalRecord } from '../utils/signalValidator';
import { evaluateModeledImpact } from '../utils/impactModel';

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
  const [showImpactPlan, setShowImpactPlan] = useState<boolean>(false);
  const evidence = getIssueEvidenceExplanation(district, category, requests, breakdown);
  const tier = getPriorityTier(evidence.totalScore);
  const valResult = validateSignalRecord(district.name, category, 8, district);

  const modeledImpact = evaluateModeledImpact({
    district,
    category,
    requests,
    interventionType: 'UPGRADE',
    intensity: 'Medium',
  });

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

            <div className="p-2.5 bg-slate-100 rounded-lg font-mono text-[10px] text-slate-700 space-y-1">
              <div className="text-center font-bold text-slate-900">
                Formula: ({evidence.citizenDemand.contribution}) + ({evidence.infrastructureGap.contribution}) + ({evidence.populationImpact.contribution}) + ({evidence.urgency.contribution}) + ({evidence.governmentPriority.contribution}) = <span className="text-slate-900 font-extrabold">{evidence.totalScore} / 100</span>
              </div>
              {evidence.sensitivity && (
                <div className="pt-1 border-t border-slate-200/80 text-[10px] flex items-center justify-between text-slate-600">
                  <span>Primary Driver: <strong className="text-blue-700">{evidence.sensitivity.dominantPillar}</strong></span>
                  <span>Relative Influence: <strong className="text-slate-900">{evidence.sensitivity.dominantPercentage}% of total</strong></span>
                </div>
              )}
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

            {/* Section 3: Prospective Modeled Impact & Verification Plan */}
            <div className="pt-3 border-t border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-mono text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                    3. Prospective Modeled Impact & Verification Plan
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowImpactPlan(!showImpactPlan)}
                  className="text-[10px] font-mono text-blue-700 hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                >
                  {showImpactPlan ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  <span>{showImpactPlan ? 'Hide modeled projection' : 'Show modeled projection'}</span>
                </button>
              </div>

              {showImpactPlan && (
                <div className="bg-white border border-amber-200 rounded-lg p-3.5 space-y-3 animate-in fade-in duration-100">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-stone-100">
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded font-mono text-[9px] font-bold uppercase">
                      MODELED IMPACT — NOT OBSERVED OUTCOME
                    </span>
                    <span className="text-[10px] font-mono text-stone-500">
                      Standard Scheme: {modeledImpact.assumptions.interventionLabel} (Medium)
                    </span>
                  </div>

                  {/* 5-part breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                    {/* 1. Baseline */}
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                      <span className="text-[9px] text-slate-500 uppercase font-bold block">1. Baseline (Observed)</span>
                      <div className="text-slate-900 font-bold mt-1">Access: {modeledImpact.baseline.accessPct}%</div>
                      <div className="text-slate-600 text-[10px]">Signals: {modeledImpact.baseline.signalsCount}</div>
                      <div className="text-slate-600 text-[10px]">Score: {modeledImpact.baseline.priorityScore} / 100</div>
                      <div className="text-[8px] text-slate-400 font-sans mt-1">Source: {modeledImpact.baseline.provenanceLabel}</div>
                    </div>

                    {/* 2. Assumptions */}
                    <div className="p-2 bg-stone-50 border border-stone-200 rounded">
                      <span className="text-[9px] text-stone-500 uppercase font-bold block">2. Model Assumptions</span>
                      <div className="text-stone-900 font-bold mt-1">Gain Factor: {modeledImpact.assumptions.baseCoverageGainFactor}</div>
                      <div className="text-stone-600 text-[10px]">Intensity: {modeledImpact.assumptions.intensityMultiplier}x</div>
                      <div className="text-stone-600 text-[10px]">Horizon: {modeledImpact.assumptions.evaluationHorizonMonths} months</div>
                      <div className="text-[8px] text-stone-400 font-sans mt-1">Benchmark capital: ₹{modeledImpact.assumptions.estimatedCapitalCr} Cr</div>
                    </div>

                    {/* 3. Modeled Projection */}
                    <div className="p-2 bg-amber-50/50 border border-amber-200 rounded">
                      <span className="text-[9px] text-amber-800 uppercase font-bold block">3. Modeled Projection</span>
                      <div className="text-emerald-700 font-bold mt-1">Access: {modeledImpact.modeled.projectedAccessPct}% (+{modeledImpact.modeled.accessGainPct}%)</div>
                      <div className="text-stone-700 text-[10px]">Signals: {modeledImpact.modeled.projectedSignals} ({modeledImpact.modeled.signalsReductionPct}%)</div>
                      <div className="text-stone-700 text-[10px]">Score: {modeledImpact.modeled.projectedPriorityScore} / 100 ({modeledImpact.modeled.priorityScoreDelta} pts)</div>
                      <div className="text-[8px] text-amber-700 font-sans mt-1">Source: {modeledImpact.modeled.provenanceLabel}</div>
                    </div>
                  </div>

                  {/* Measurement Requirement */}
                  <div className="p-2 bg-blue-50/60 border border-blue-200 rounded text-[10px] space-y-1 font-sans text-blue-950">
                    <div className="font-bold flex items-center gap-1 font-mono text-[10px] text-blue-900">
                      <Clock className="w-3 h-3 text-blue-700" />
                      Proposed Post-Intervention Verification Criteria:
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5 text-blue-900/90 text-[10px]">
                      <li>Physical infrastructure saturation survey (Third-party engineering audit)</li>
                      <li>Post-delivery citizen grievance signal density over 12-24 month window</li>
                      <li>Vulnerable population service continuity verification</li>
                    </ul>
                    <div className="text-[9px] font-mono text-blue-800 italic pt-1">
                      Status: Proposed post-intervention metrics, not currently measured outcomes.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
