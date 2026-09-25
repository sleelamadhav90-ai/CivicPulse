import React, { useState } from 'react';
import { ShieldCheck, Scale, Calculator, ChevronDown, ChevronUp, Layers, FileText, Database, Users, AlertTriangle, Building2, CheckCircle2, Sliders, Clock, Info } from 'lucide-react';
import { ScoreBreakdown, District, InfrastructureCategory, CitizenRequest } from '../types';
import { getScoreComponentContributions, getIssueEvidenceExplanation, getPriorityTier } from '../utils/scoring';
import { getProvenanceBadgeStyles } from '../utils/provenance';
import { validateSignalRecord } from '../utils/signalValidator';
import { evaluateModeledImpact } from '../utils/impactModel';
import { useLanguage } from '../context/LanguageContext';

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
  const { t, tCategory } = useLanguage();
  const [isExpanded, setIsExpanded] = useState<boolean>(!compact);
  const [showImpactPlan, setShowImpactPlan] = useState<boolean>(false);
  const evidence = getIssueEvidenceExplanation(district, category, requests, breakdown);
  const tier = getPriorityTier(evidence.totalScore);
  const valResult = validateSignalRecord(district.name, category, 8, district);

  const localizedFlags = valResult.validationFlags.map(f => {
    if (f === 'District Validated') return t('evidence.district_validated');
    if (f === 'Category Verified') return t('evidence.category_verified');
    if (f === 'Urgency Bounded') return t('evidence.urgency_bounded');
    return f;
  });

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
              <span className="font-bold text-slate-900 text-xs">{t('evidence.why_prioritized')}</span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {t('evidence.deterministic_engine')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              {t('evidence.score')}: <strong style={{ color: tier.color }}>{evidence.totalScore}/100</strong> ({tier.label}) • {evidence.citizenDemand.signalsCount} {t('evidence.signals')} • {evidence.infrastructureGap.deficitPct}% {t('evidence.deficit')}
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
                  {t('evidence.data_quality_title')}: {valResult.dataQualityScore}/100
                </span>
                <span className="text-[10px] text-emerald-800 font-sans">
                  {localizedFlags.join(' • ')}
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 rounded uppercase border border-emerald-300 shrink-0">
              {t('evidence.validated')}
            </span>
          </div>

          {/* Data Lineage Breadcrumb */}
          <div className="p-2.5 bg-slate-900 text-slate-200 rounded-lg font-mono text-[10px] flex items-center justify-between overflow-x-auto gap-2">
            <span className="text-blue-400 font-bold shrink-0">{t('evidence.data_lineage')}:</span>
            <div className="flex items-center space-x-1 whitespace-nowrap text-slate-300">
              <span className="bg-slate-800 px-1.5 py-0.5 rounded">{t('evidence.signals')} ({evidence.citizenDemand.signalsCount})</span>
              <span>→</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded">{t('evidence.validated')}</span>
              <span>→</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded">{t('evidence.cluster')} ({tCategory(category)})</span>
              <span>→</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">{t('evidence.evidence_step')}</span>
              <span>→</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300">{t('evidence.score')} ({evidence.totalScore})</span>
              <span>→</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded">{t('evidence.action_queue')}</span>
            </div>
          </div>

          {/* 1. WHY THIS SCORE? (Traceable Component Contributions Grid) */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Scale className="w-3.5 h-3.5 text-blue-600" />
              {t('evidence.calculation_title')}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 font-mono text-[11px]">
              
              {/* Pillar 1: Citizen Demand */}
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">{t('evidence.pillar_demand')}</div>
                <div className="text-sm font-bold text-blue-700">{evidence.citizenDemand.demandScore} pts</div>
                <div className="text-[10px] text-slate-600">{t('evidence.contrib')}: <strong>+{evidence.citizenDemand.contribution}</strong></div>
              </div>

              {/* Pillar 2: Infrastructure Gap */}
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">{t('evidence.pillar_gap')}</div>
                <div className="text-sm font-bold text-rose-700">{evidence.infrastructureGap.gapScore} pts</div>
                <div className="text-[10px] text-slate-600">{t('evidence.contrib')}: <strong>+{evidence.infrastructureGap.contribution}</strong></div>
              </div>

              {/* Pillar 3: Population Impact */}
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">{t('evidence.pillar_pop')}</div>
                <div className="text-sm font-bold text-purple-700">{evidence.populationImpact.vulnScore} pts</div>
                <div className="text-[10px] text-slate-600">{t('evidence.contrib')}: <strong>+{evidence.populationImpact.contribution}</strong></div>
              </div>

              {/* Pillar 4: Urgency */}
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">{t('evidence.pillar_urgency')}</div>
                <div className="text-sm font-bold text-amber-700">{evidence.urgency.severityScore} pts</div>
                <div className="text-[10px] text-slate-600">{t('evidence.contrib')}: <strong>+{evidence.urgency.contribution}</strong></div>
              </div>

              {/* Pillar 5: Government Priority */}
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">{t('evidence.pillar_gov')}</div>
                <div className="text-sm font-bold text-emerald-700">{evidence.governmentPriority.alignScore} pts</div>
                <div className="text-[10px] text-slate-600">{t('evidence.contrib')}: <strong>+{evidence.governmentPriority.contribution}</strong></div>
              </div>

            </div>

            <div className="p-2.5 bg-slate-100 rounded-lg font-mono text-[10px] text-slate-700 space-y-1">
              <div className="text-center font-bold text-slate-900">
                {t('evidence.formula')}: ({evidence.citizenDemand.contribution}) + ({evidence.infrastructureGap.contribution}) + ({evidence.populationImpact.contribution}) + ({evidence.urgency.contribution}) + ({evidence.governmentPriority.contribution}) = <span className="text-slate-900 font-extrabold">{evidence.totalScore} / 100</span>
              </div>
              {evidence.sensitivity && (
                <div className="pt-1 border-t border-slate-200/80 text-[10px] flex items-center justify-between text-slate-600">
                  <span>{t('evidence.primary_driver')}: <strong className="text-blue-700">{evidence.sensitivity.dominantPillar}</strong></span>
                  <span>{t('evidence.relative_influence')}: <strong className="text-slate-900">{evidence.sensitivity.dominantPercentage}% {t('evidence.of_total')}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* 2. DATA & EVIDENCE LAYER */}
          <div className="space-y-2 pt-1 border-t border-slate-200/80">
            <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Database className="w-3.5 h-3.5 text-purple-600" />
              {t('evidence.datasets_title')}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700">
              
              {/* Evidence Panel A: Citizen Signals */}
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="font-bold text-slate-900 uppercase flex items-center gap-1">
                    <Users className="w-3 h-3 text-blue-600" />
                    {t('evidence.citizen_reports')}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                    {evidence.citizenDemand.signalsCount} {t('evidence.signals')}
                  </span>
                </div>
                {evidence.citizenDemand.sampleExcerpts.length > 0 ? (
                  <ul className="space-y-1 text-[11px] text-slate-600 list-disc italic pl-4">
                    {evidence.citizenDemand.sampleExcerpts.map((excerpt, idx) => (
                      <li key={idx} className="line-clamp-2 font-sans">"{excerpt}"</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-slate-500 italic">{t('evidence.no_raw_excerpts')}</p>
                )}
              </div>

              {/* Evidence Panel B: Public Data & Infrastructure Deficit */}
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="font-bold text-slate-900 uppercase flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-rose-600" />
                    {t('evidence.public_benchmark_deficit')}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                    {evidence.infrastructureGap.deficitPct}% {t('evidence.deficit')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                  {evidence.infrastructureGap.publicBenchmarkSummary}
                </p>
                <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                  <span>{t('evidence.source')}: {evidence.infrastructureGap.primaryDataSource}</span>
                  <span className="text-emerald-700 font-semibold">{t('evidence.verified_benchmark')}</span>
                </div>
              </div>

            </div>

            {/* Provenance Badges Bar */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">{t('evidence.data_provenance')}:</span>
              {evidence.dataSources.map((ds, i) => {
                const label = ds.isSynthetic ? t('evidence.civicpulse_demo_signal') : ds.name.includes('Deterministic') ? t('evidence.deterministic_calc') : t('evidence.public_benchmark');
                const style = getProvenanceBadgeStyles(ds.isSynthetic ? 'CivicPulse Demo Signal' : ds.name.includes('Deterministic') ? 'Deterministic Calculation' : 'Public Benchmark');
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
                    {t('evidence.impact_plan_title')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowImpactPlan(!showImpactPlan)}
                  className="text-[10px] font-mono text-blue-700 hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                >
                  {showImpactPlan ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  <span>{showImpactPlan ? t('evidence.hide_modeled') : t('evidence.show_modeled')}</span>
                </button>
              </div>

              {showImpactPlan && (
                <div className="bg-white border border-amber-200 rounded-lg p-3.5 space-y-3 animate-in fade-in duration-100">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-stone-100">
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded font-mono text-[9px] font-bold uppercase">
                      {t('evidence.modeled_impact_warning')}
                    </span>
                    <span className="text-[10px] font-mono text-stone-500">
                      {t('evidence.standard_scheme')}: {modeledImpact.assumptions.interventionLabel} (Medium)
                    </span>
                  </div>

                  {/* 5-part breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                    {/* 1. Baseline */}
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                      <span className="text-[9px] text-slate-500 uppercase font-bold block">{t('evidence.baseline_observed')}</span>
                      <div className="text-slate-900 font-bold mt-1">{t('evidence.access')}: {modeledImpact.baseline.accessPct}%</div>
                      <div className="text-slate-600 text-[10px]">{t('evidence.signals_label')}: {modeledImpact.baseline.signalsCount}</div>
                      <div className="text-slate-600 text-[10px]">{t('evidence.score')}: {modeledImpact.baseline.priorityScore} / 100</div>
                      <div className="text-[8px] text-slate-400 font-sans mt-1">{t('evidence.source')}: {modeledImpact.baseline.provenanceLabel}</div>
                    </div>

                    {/* 2. Assumptions */}
                    <div className="p-2 bg-stone-50 border border-stone-200 rounded">
                      <span className="text-[9px] text-stone-500 uppercase font-bold block">{t('evidence.model_assumptions')}</span>
                      <div className="text-stone-900 font-bold mt-1">{t('evidence.gain_factor')}: {modeledImpact.assumptions.baseCoverageGainFactor}</div>
                      <div className="text-stone-600 text-[10px]">{t('evidence.intensity')}: {modeledImpact.assumptions.intensityMultiplier}x</div>
                      <div className="text-stone-600 text-[10px]">{t('evidence.horizon')}: {modeledImpact.assumptions.evaluationHorizonMonths} {t('metric.months')}</div>
                      <div className="text-[8px] text-stone-400 font-sans mt-1">{t('evidence.benchmark_capital')}: ₹{modeledImpact.assumptions.estimatedCapitalCr} Cr</div>
                    </div>

                    {/* 3. Modeled Projection */}
                    <div className="p-2 bg-amber-50/70 border border-amber-300 rounded space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-amber-900 uppercase font-bold block">{t('evidence.modeled_projection')}</span>
                        <span className="text-[8px] font-mono px-1 py-0.2 bg-amber-200 text-amber-900 rounded font-semibold">{t('evidence.simulation')}</span>
                      </div>
                      <div className="text-emerald-800 font-bold">{t('evidence.access')}: {modeledImpact.modeled.projectedAccessPct}% (+{modeledImpact.modeled.accessGainPct}%)</div>
                      <div className="text-stone-900 text-[10px] font-semibold">
                        {t('evidence.est_grievance_reduction')}: {Math.abs(modeledImpact.modeled.signalsReductionPct)}%
                      </div>
                      <div className="text-stone-700 text-[10px]">{t('evidence.projected_signals')}: {modeledImpact.modeled.projectedSignals}</div>
                      <div className="text-stone-700 text-[10px]">{t('evidence.score')}: {modeledImpact.modeled.projectedPriorityScore} / 100 ({modeledImpact.modeled.priorityScoreDelta} pts)</div>
                      <div className="text-[8px] text-amber-900/90 font-sans italic pt-0.5 border-t border-amber-200/80">
                        {t('evidence.prototype_sim_note')}
                      </div>
                    </div>
                  </div>

                  {/* Measurement Requirement */}
                  <div className="p-2 bg-blue-50/60 border border-blue-200 rounded text-[10px] space-y-1 font-sans text-blue-950">
                    <div className="font-bold flex items-center gap-1 font-mono text-[10px] text-blue-900">
                      <Clock className="w-3 h-3 text-blue-700" />
                      {t('evidence.proposed_criteria_title')}:
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5 text-blue-900/90 text-[10px]">
                      <li>{t('evidence.criteria_saturation')}</li>
                      <li>{t('evidence.criteria_density')}</li>
                      <li>{t('evidence.criteria_continuity')}</li>
                    </ul>
                    <div className="text-[9px] font-mono text-blue-800 italic pt-1">
                      {t('evidence.criteria_status')}
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
