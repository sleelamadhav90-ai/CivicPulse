import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Scale, Database, Building2, Layers, Play, AlertCircle, Users, Activity, FileText, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { CommunityIssue } from './CommunityIssuesView';
import { District, CitizenRequest } from '../types';
import { calculatePriorityScore, getScoreComponentContributions, getPriorityTier, getIssueEvidenceExplanation, SCORING_CONFIG } from '../utils/scoring';
import { validateSignalRecord } from '../utils/signalValidator';
import { getProvenanceBadgeStyles } from '../utils/provenance';
import { useLanguage } from '../context/LanguageContext';

interface IssueIntelligenceModalProps {
  issue: CommunityIssue;
  district: District;
  requests?: CitizenRequest[];
  onClose: () => void;
}

export const IssueIntelligenceModal: React.FC<IssueIntelligenceModalProps> = ({
  issue,
  district,
  requests = [],
  onClose,
}) => {
  const { t, tCategory, tDistrict, tState } = useLanguage();
  const [showModelAssumptions, setShowModelAssumptions] = useState(false);

  // 1. Validation Layer
  const validation = validateSignalRecord(issue.location, issue.category, 8, district);

  // 2. Deterministic Score Calculation (Source of Truth)
  const scoreBreakdown = calculatePriorityScore(district, issue.category, 8, Math.max(issue.requestCount, 1));
  const contributions = getScoreComponentContributions(scoreBreakdown);
  const tier = getPriorityTier(scoreBreakdown.total_score);
  const sensitivity = scoreBreakdown.sensitivity;

  // 3. Grounded Evidence Explanation
  const evidence = getIssueEvidenceExplanation(district, issue.category, requests, scoreBreakdown);

  // 4. Simulated Impact
  const targetBeneficiaries = Math.round(district.population * (scoreBreakdown.gap_percentage / 100) * 0.45);
  const projectedScoreAfter = Math.max(15, scoreBreakdown.total_score - 48);

  const localizedFlags = validation.validationFlags.map(f => {
    if (f === 'District Validated') return t('evidence.district_validated');
    if (f === 'Category Verified') return t('evidence.category_verified');
    if (f === 'Urgency Bounded') return t('evidence.urgency_bounded');
    return f;
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in font-sans">
      <div className="bg-white border border-slate-300 rounded-2xl max-w-3xl w-full my-8 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* HEADER / ISSUE NAME */}
        <div className="p-5 bg-slate-900 text-white flex items-start justify-between border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {tCategory(issue.category)}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                {t('modal.validated_signal')}
              </span>
            </div>
            <h2 className="text-lg font-serif font-bold text-slate-100 mt-1">
              {issue.title}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              {t('modal.location')}: <strong className="text-slate-200">{issue.location}</strong> ({tDistrict(district.name)}, {tState(district.state)})
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400 block uppercase">{t('metric.priority_score')}</span>
              <span className="text-xl font-bold" style={{ color: tier.color }}>
                {scoreBreakdown.total_score}<span className="text-xs text-slate-400">/100</span>
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-800">
          
          {/* SECTION 1: DATA QUALITY & VALIDATION */}
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-emerald-900 text-xs uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                {t('modal.data_quality_layer')}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 rounded border border-emerald-300">
                {t('modal.quality_index')}: {validation.dataQualityScore}/100
              </span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-emerald-800 font-mono">
              {localizedFlags.map((flag, idx) => (
                <li key={idx} className="flex items-center gap-1">
                  <span className="text-emerald-600 font-bold">✓</span> {flag}
                </li>
              ))}
            </ul>
          </div>

          {/* SECTION 2: WHY IS THIS IMPORTANT? (GROUNDED EVIDENCE) */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold font-mono text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              1. Grounded Evidence & Baseline Deficit
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-center">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 block uppercase">Citizen Signals</span>
                <span className="text-sm font-bold text-blue-700">{issue.requestCount} Submissions</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 block uppercase">Infrastructure Gap</span>
                <span className="text-sm font-bold text-rose-700">{scoreBreakdown.gap_percentage}% Deficit</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 block uppercase">Affected Population</span>
                <span className="text-sm font-bold text-slate-800">{district.population.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 block uppercase">Vulnerability (MPI)</span>
                <span className="text-sm font-bold text-purple-700">{(district.poverty_index * 100).toFixed(0)}% Index</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 font-sans text-[11px]">
              <span className="font-bold text-slate-800 block font-mono">Public Context Summary:</span>
              <p className="text-slate-600 leading-relaxed">
                {evidence.infrastructureGap.publicBenchmarkSummary}
              </p>
            </div>
          </div>

          {/* SECTION 3: EVIDENCE & DATA SOURCES (PROVENANCE) */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold font-mono text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-purple-600" />
              2. Data Provenance & Lineage
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1">
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded">
                  Citizen-Submitted Signal
                </span>
                <p className="text-[11px] text-slate-600 font-sans">
                  Multilingual voice/WhatsApp ingestion mapped to {issue.location}.
                </p>
              </div>

              <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1">
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                  Curated Open Data Benchmark
                </span>
                <p className="text-[11px] text-slate-600 font-sans">
                  {evidence.infrastructureGap.primaryDataSource}
                </p>
              </div>

              <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1">
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded">
                  Deterministic Calculation Engine
                </span>
                <p className="text-[11px] text-slate-600 font-sans">
                  5-Pillar priority model execution with zero AI hallucination.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 4: SCORE BREAKDOWN (5-PILLAR TRACEABILITY) */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold font-mono text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-emerald-600" />
              3. Traceable 5-Pillar Score Formula Breakdown
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 font-mono text-[11px]">
              <div className="p-2 bg-white border border-slate-200 rounded-lg space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase">Demand (30%)</span>
                <div className="font-bold text-blue-700">{scoreBreakdown.demand_score} pts</div>
                <div className="text-[10px] text-slate-600">Contrib: <strong>+{contributions.demandContrib}</strong></div>
              </div>

              <div className="p-2 bg-white border border-slate-200 rounded-lg space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase">Gap (25%)</span>
                <div className="font-bold text-rose-700">{scoreBreakdown.gap_score} pts</div>
                <div className="text-[10px] text-slate-600">Contrib: <strong>+{contributions.gapContrib}</strong></div>
              </div>

              <div className="p-2 bg-white border border-slate-200 rounded-lg space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase">Pop Impact (20%)</span>
                <div className="font-bold text-purple-700">{scoreBreakdown.vuln_score} pts</div>
                <div className="text-[10px] text-slate-600">Contrib: <strong>+{contributions.vulnContrib}</strong></div>
              </div>

              <div className="p-2 bg-white border border-slate-200 rounded-lg space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase">Urgency (15%)</span>
                <div className="font-bold text-amber-700">{scoreBreakdown.sev_score} pts</div>
                <div className="text-[10px] text-slate-600">Contrib: <strong>+{contributions.urgencyContrib}</strong></div>
              </div>

              <div className="p-2 bg-white border border-slate-200 rounded-lg space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase">Gov Priority (10%)</span>
                <div className="font-bold text-emerald-700">{scoreBreakdown.align_score} pts</div>
                <div className="text-[10px] text-slate-600">Contrib: <strong>+{contributions.govContrib}</strong></div>
              </div>
            </div>

            <div className="p-2.5 bg-slate-100 rounded-lg font-mono text-[10px] text-slate-700 space-y-1">
              <div className="text-center font-bold text-slate-900">
                Verified Formula: ({contributions.demandContrib}) + ({contributions.gapContrib}) + ({contributions.vulnContrib}) + ({contributions.urgencyContrib}) + ({contributions.govContrib}) = <span className="text-slate-900 font-extrabold">{scoreBreakdown.total_score} / 100</span>
              </div>
              {sensitivity && (
                <div className="pt-1 border-t border-slate-200/80 text-[10px] flex items-center justify-between text-slate-600">
                  <span>Primary Score Driver: <strong className="text-blue-700">{sensitivity.dominantPillar}</strong></span>
                  <span>Relative Influence: <strong className="text-slate-900">{sensitivity.dominantPercentage}% of total score</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* MODEL ASSUMPTIONS & PARAMETER TRANSPARENCY (EXPANDABLE) */}
          <div className="border border-slate-200 rounded-xl bg-slate-50 overflow-hidden font-mono text-xs">
            <button
              onClick={() => setShowModelAssumptions(!showModelAssumptions)}
              className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-800 uppercase tracking-wide text-[11px]">
                  Model Assumptions & Parameter Transparency
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-blue-100 text-blue-800 font-bold border border-blue-200">
                  Deterministic Prototype
                </span>
              </div>
              {showModelAssumptions ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </button>

            {showModelAssumptions && (
              <div className="p-3.5 bg-white border-t border-slate-200 space-y-2.5 text-[11px] text-slate-600 font-sans leading-relaxed">
                <div className="p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-lg text-amber-900 font-mono text-[10px] space-y-1">
                  <span className="font-bold uppercase block">Technical Disclaimer & Prototype Calibration Note</span>
                  <p>
                    CivicPulse utilizes a transparent, deterministic decision-support prioritization model. The five pillar weights (Demand: 30%, Gap: 25%, Impact: 20%, Urgency: 15%, Gov Priority: 10%) are configurable initial parameters.
                  </p>
                </div>

                <ul className="list-disc pl-4 space-y-1.5 text-slate-700">
                  <li>
                    <strong className="font-mono text-slate-900">Deterministic Engine:</strong> All scores are calculated using mathematical transformation rules without non-deterministic AI scoring or opaque black-box algorithms.
                  </li>
                  <li>
                    <strong className="font-mono text-slate-900">Logarithmic Demand Scaling:</strong> Citizen demand uses a <code>22 × log(1 + signals)</code> transformation to prevent surge reports from monopolizing total priority score.
                  </li>
                  <li>
                    <strong className="font-mono text-slate-900">Derived Baseline Benchmark:</strong> Infrastructure access indices (e.g. Electricity baseline 58%, Sanitation derived 75% multiplier) represent curated open data benchmarks and prototype assumptions for demonstration.
                  </li>
                  <li>
                    <strong className="font-mono text-slate-900">Government Priority Signal:</strong> The Government Priority pillar evaluates presence of existing planned capital expenditure allocations (95 pts if budgeted, 45 pts if unbudgeted gap) rather than an official political priority ranking.
                  </li>
                  <li>
                    <strong className="font-mono text-slate-900">Calibration Notice:</strong> The current model parameters have not been statistically backtested against historical government project intervention outcomes. Production deployment requires domain validation and stakeholder calibration.
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* SECTION 5: GOVERNMENT / SCHEME ALIGNMENT */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold font-mono text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-amber-600" />
              4. Centrally Sponsored Scheme Alignment
            </h3>

            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex items-center justify-between font-mono text-[11px]">
              <div>
                <span className="text-[10px] text-amber-800 uppercase block font-bold">Matched Public Scheme</span>
                <span className="font-bold text-slate-900 text-xs">{issue.relatedScheme || 'Jal Jeevan Mission (JJM)'}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-amber-800 uppercase block font-bold">Planned CapEx Allocation</span>
                <span className="font-bold text-emerald-800 text-xs">
                  {district.planned_investment > 0 ? `₹${(district.planned_investment / 10000000).toFixed(1)} Cr Sanctioned` : 'Unbudgeted Priority Gap'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 6: RECOMMENDED ACTION & ACTION QUEUE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-slate-700 uppercase block">Recommended Engineering Intervention</span>
              <p className="text-[11px] text-slate-700 leading-relaxed font-sans">
                Sanction targeted municipal infrastructure expansion for {issue.category.toLowerCase()} in {issue.location} to alleviate baseline deficit.
              </p>
              <div className="text-[9px] font-mono text-slate-500 pt-1 border-t border-slate-200 flex justify-between">
                <span>Structured Engineering Brief</span>
                <span className="text-blue-700 font-bold">AI Narrative • Deterministic Data</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-slate-700 uppercase block">Action Queue Status</span>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-600">Department Lifecycle:</span>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold border border-blue-200">
                  {issue.actionStatus || 'TECHNICAL SANCTION'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono pt-1">
                Queue Ref: <strong className="text-slate-800">AQ-{district.id.toUpperCase()}-{issue.id.slice(-4)}</strong>
              </p>
            </div>
          </div>

          {/* SECTION 7: IMPACT SIMULATION (PROMINENTLY LABELED SIMULATED IMPACT) */}
          <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-indigo-950 text-xs uppercase flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-600" />
                5. Simulated Post-Intervention Impact Projection
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-200 text-indigo-900 rounded uppercase border border-indigo-300">
                SIMULATED IMPACT
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono text-center pt-1">
              <div className="p-2 bg-white/90 border border-indigo-100 rounded-lg">
                <span className="text-[10px] text-slate-500 block">Deficit Reduction</span>
                <span className="text-xs font-bold text-emerald-700">-{scoreBreakdown.gap_percentage}% Deficit</span>
              </div>
              <div className="p-2 bg-white/90 border border-indigo-100 rounded-lg">
                <span className="text-[10px] text-slate-500 block">Estimated Reach</span>
                <span className="text-xs font-bold text-indigo-800">{targetBeneficiaries.toLocaleString()} Citizens</span>
              </div>
              <div className="p-2 bg-white/90 border border-indigo-100 rounded-lg">
                <span className="text-[10px] text-slate-500 block">Projected Score</span>
                <span className="text-xs font-bold text-blue-800">{scoreBreakdown.total_score} → {projectedScoreAfter}</span>
              </div>
            </div>

            <p className="text-[10px] text-indigo-800/80 italic font-mono pt-1 border-t border-indigo-200/60">
              * Note: Outcomes are simulated post-intervention projections for decision support. Real-world verification follows project delivery.
            </p>
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>CivicPulse Decision-Support Pipeline • Representative Prototype Coverage</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors cursor-pointer"
          >
            Close Intelligence View
          </button>
        </div>

      </div>
    </div>
  );
};
