import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowRight, 
  Layers, 
  MapPin, 
  Sparkles, 
  Database, 
  CheckCircle2, 
  Clock, 
  X,
  TrendingUp,
  FileText
} from 'lucide-react';
import { District, CitizenRequest, InfrastructureCategory } from '../types';
import { useLanguage } from '../context/LanguageContext';

export interface AnalyticalPattern {
  id: string;
  name: string;
  category: InfrastructureCategory;
  type: 'Cross-Domain' | 'Acceleration' | 'Infrastructure Lag' | 'Seasonal Vulnerability';
  description: string;
  evidence: {
    dataSources: string[];
    figures: string[];
    totalCitizenSignals: number;
    correlations?: string;
  };
  affectedDistricts: {
    name: string;
    state: string;
    districtId: string;
    specificMetric: string;
  }[];
  suggestedIntervention: string;
  urgency: 'Critical' | 'High' | 'Moderate';
  timeline: string;
}

interface PatternIntelligenceProps {
  districts: District[];
  requests: CitizenRequest[];
  onNavigateToMap: () => void;
  onNavigateToRecommendations: () => void;
  onNavigateToPolicyLab?: (districtId: string, category: InfrastructureCategory) => void;
}

export const CORE_PATTERNS: AnalyticalPattern[] = [
  {
    id: 'PAT-01',
    name: 'Water demand acceleration in urban peripheries',
    category: 'Water',
    type: 'Acceleration',
    description: 'Citizen requests for water supply have increased by 31% over 60 days in rapidly growing peri-urban wards where municipal pipelines have not yet reached new housing developments.',
    evidence: {
      dataSources: [
        'Jal Jeevan Mission coverage telemetry',
        'Census 2011 + urban expansion satellite layer',
        'Municipal drinking water tanker tracking registry'
      ],
      figures: [
        '+31% signal growth across 60 days',
        '14 affected peri-urban panchayats',
        'Average per-capita deficit: 42 litres/day'
      ],
      totalCitizenSignals: 2419,
      correlations: 'Strong inverse correlation (-0.84) between pipeline proximity and tanker grievance volume.'
    },
    affectedDistricts: [
      { name: 'Guntur', state: 'Andhra Pradesh', districtId: 'guntur', specificMetric: '742 signals (+22% MoM)' },
      { name: 'Nashik', state: 'Maharashtra', districtId: 'dist-04', specificMetric: '420 signals (+19% MoM)' },
      { name: 'Patna', state: 'Bihar', districtId: 'dist-01', specificMetric: '310 signals (+15% MoM)' },
    ],
    suggestedIntervention: 'Advance pipeline augmentation scheduled for FY27 to current fiscal year; deploy interim telemetry-monitored water kiosks in peripheral clusters.',
    urgency: 'Critical',
    timeline: 'Immediate (Next 30 Days)'
  },
  {
    id: 'PAT-02',
    name: 'Health access bottlenecks correlated with unpaved road corridors',
    category: 'Health',
    type: 'Cross-Domain',
    description: 'Patient transfer delay reports and unattended medical grievances correlate strongly with road crater clusters within an 8km radius of sub-divisional hospital centres.',
    evidence: {
      dataSources: [
        'PMGSY road condition audit GIS layer',
        'National Health Mission (NHM) ambulance response logs',
        'Citizen voice grievance transcripts'
      ],
      figures: [
        '3.2x higher transit time during monsoon',
        '18 unpaved arterial corridors flagged',
        '412 healthcare access signals'
      ],
      totalCitizenSignals: 890,
      correlations: 'Direct 0.78 correlation between road surface deterioration index and delayed emergency response calls.'
    },
    affectedDistricts: [
      { name: 'Patna', state: 'Bihar', districtId: 'dist-01', specificMetric: '512 road & health signals' },
      { name: 'Gaya', state: 'Bihar', districtId: 'dist-01', specificMetric: '294 emergency transit delays' },
    ],
    suggestedIntervention: 'Prioritize joint sanctioning of all-weather macadam paving on hospital approach roads under PMGSY priority window.',
    urgency: 'High',
    timeline: '60-day execution window'
  },
  {
    id: 'PAT-03',
    name: 'Cyclic agricultural power transformer breakdowns',
    category: 'Electricity',
    type: 'Seasonal Vulnerability',
    description: 'Recurring power outages in agricultural pump feeders spike reliably during peak kharif irrigation cycles due to unmaintained oil cooling in distribution transformers.',
    evidence: {
      dataSources: [
        'DISCOM feeder telemetry feeds',
        'Central Electricity Authority substation records',
        'Citizen IVR outage logs'
      ],
      figures: [
        'Average repair turnaround: 8.4 days',
        '64 transformers exceeding 90% thermal capacity',
        '580 farmer outage reports'
      ],
      totalCitizenSignals: 680,
      correlations: 'Overload spikes align with groundwater pumping hours (04:00 - 10:00 AM).'
    },
    affectedDistricts: [
      { name: 'Solapur', state: 'Maharashtra', districtId: 'dist-04', specificMetric: '218 outage logs' },
      { name: 'Guntur', state: 'Andhra Pradesh', districtId: 'guntur', specificMetric: '185 agricultural feeder reports' },
    ],
    suggestedIntervention: 'Procure spare transformer reserves and initiate pre-monsoon oil reconditioning under RDSS scheme.',
    urgency: 'Moderate',
    timeline: 'Prior to next irrigation cycle'
  },
  {
    id: 'PAT-04',
    name: 'Drainage siltation and urban flood vulnerability',
    category: 'Drainage',
    type: 'Infrastructure Lag',
    description: 'Stormwater culverts in low-lying market squares have not undergone scheduled pre-monsoon desilting, causing repetitive waterlogging and shopkeeper distress.',
    evidence: {
      dataSources: [
        'Municipal Corporation drainage audit maps',
        'Meteorological rainfall radar feeds',
        'Citizen photo submissions of street flooding'
      ],
      figures: [
        '62 km of uncleaned arterial storm drains',
        '12 recurrent water stagnation points',
        '340 civic flood signals'
      ],
      totalCitizenSignals: 540,
    },
    affectedDistricts: [
      { name: 'Patna', state: 'Bihar', districtId: 'dist-01', specificMetric: '310 waterlogging reports' },
      { name: 'Nashik', state: 'Maharashtra', districtId: 'dist-04', specificMetric: '160 culvert blockage logs' },
    ],
    suggestedIntervention: 'Execute emergency desilting mechanical contracts under Swachh Bharat Urban stormwater resilience budget.',
    urgency: 'High',
    timeline: 'Within 15 days'
  }
];

export const PatternIntelligence: React.FC<PatternIntelligenceProps> = ({
  districts,
  requests,
  onNavigateToMap,
  onNavigateToRecommendations,
  onNavigateToPolicyLab,
}) => {
  const { t, tCategory, tUrgency, tPattern } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activePatternModal, setActivePatternModal] = useState<AnalyticalPattern | null>(null);

  const localizedPatterns = useMemo(() => {
    return CORE_PATTERNS.map(p => tPattern(p));
  }, [tPattern]);

  const filteredPatterns = useMemo(() => {
    return localizedPatterns.filter(pat => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        pat.name.toLowerCase().includes(q) ||
        pat.description.toLowerCase().includes(q) ||
        pat.affectedDistricts.some((d: any) => d.name.toLowerCase().includes(q));

      const matchesCat = selectedCategory === 'ALL' || pat.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [localizedPatterns, searchQuery, selectedCategory]);

  return (
    <div className="space-y-8 font-sans text-[#171717] pb-16 max-w-6xl mx-auto">
      
      {/* 1. Page Header */}
      <div className="space-y-1.5 border-b border-[#171717]/10 pb-5">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#171717]">
          {t('patterns.title')}
        </h1>
        <p className="text-sm text-[#57534E] max-w-2xl leading-relaxed">
          {t('patterns.subtitle')}
        </p>
      </div>

      {/* 2. Compact Search & Sector Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('patterns.search_placeholder') || 'Search patterns, keywords, or districts...'}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#171717]/20 rounded-xs focus:outline-hidden focus:border-[#171717] text-[#171717]"
          />
        </div>

        <div className="flex items-center space-x-1.5 text-xs">
          <span className="text-[#78716C] text-[11px]">{t('filter.domain') || 'Domain'}:</span>
          {['ALL', 'Water', 'Health', 'Electricity', 'Drainage'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-xs transition-colors cursor-pointer text-xs ${
                selectedCategory === cat
                  ? 'bg-[#171717] text-white font-medium'
                  : 'bg-white text-[#57534E] border border-[#171717]/15 hover:border-[#171717]/30'
              }`}
            >
              {cat === 'ALL' ? t('filter.all') : tCategory(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Pattern Cards (Clean editorial layout, rigorous data citations) */}
      <div className="space-y-5">
        {filteredPatterns.map((pat) => (
          <div
            key={pat.id}
            className="bg-white border border-[#171717]/15 hover:border-[#171717]/35 p-6 rounded-sm shadow-xs transition-all space-y-4"
          >
            {/* Header / Type */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#171717]/10 pb-3">
              <div className="flex items-center space-x-2.5">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs bg-[#F7F5EF] text-[#D65A3A] border border-[#171717]/10 uppercase tracking-wider">
                  {tCategory(pat.category)}
                </span>
                <span className="text-xs font-mono text-[#78716C]">
                  {pat.type} · {pat.id}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className={`px-2 py-0.5 rounded-xs font-bold ${
                  pat.urgency === 'Critical' 
                    ? 'bg-[#D65A3A]/10 text-[#D65A3A] border border-[#D65A3A]/20'
                    : 'bg-amber-50 text-amber-800 border border-amber-300'
                }`}>
                  {t('metric.urgency') || 'Urgency'}: {tUrgency(pat.urgency)}
                </span>
                <span className="text-[#78716C]">
                  {pat.timeline}
                </span>
              </div>
            </div>

            {/* Pattern Name & Description */}
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-[#171717]">
                {pat.name}
              </h2>
              <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                {pat.description}
              </p>
            </div>

            {/* Evidence & Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Evidence data sources */}
              <div className="bg-[#FAF8F5] border border-[#171717]/10 p-3.5 rounded-xs space-y-2 text-xs">
                <div className="flex items-center space-x-1.5 font-semibold text-[#171717]">
                  <Database className="w-3.5 h-3.5 text-[#D65A3A]" />
                  <span>{t('patterns.grounding_evidence') || 'Grounding Evidence & Data Sources'}</span>
                </div>
                <ul className="space-y-1 text-[#57534E] list-disc list-inside text-[11px] leading-relaxed">
                  {pat.evidence.dataSources.map((ds: string, idx: number) => (
                    <li key={idx}>{ds}</li>
                  ))}
                </ul>
                <div className="pt-1 text-[11px] font-mono text-[#78716C] border-t border-[#171717]/10">
                  {pat.evidence.totalCitizenSignals.toLocaleString()} {t('patterns.citizen_reports_analyzed') || 'citizen reports analyzed'}
                </div>
              </div>

              {/* Affected districts & Key indicators */}
              <div className="bg-[#FAF8F5] border border-[#171717]/10 p-3.5 rounded-xs space-y-2 text-xs">
                <div className="flex items-center space-x-1.5 font-semibold text-[#171717]">
                  <MapPin className="w-3.5 h-3.5 text-[#D65A3A]" />
                  <span>{t('patterns.affected_districts') || 'Affected Districts'}</span>
                </div>
                <div className="space-y-1.5">
                  {pat.affectedDistricts.map((dist: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-[11px]">
                      <span className="font-medium text-[#171717]">
                        {dist.name}, {dist.state}
                      </span>
                      <span className="font-mono text-[#78716C]">
                        {dist.specificMetric}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggested Intervention & Action Button */}
            <div className="pt-2 border-t border-[#171717]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-semibold text-[#171717] block">{t('patterns.suggested_intervention') || 'Suggested intervention'}:</span>
                <p className="text-[#57534E] leading-relaxed">
                  {pat.suggestedIntervention}
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0 pt-2 sm:pt-0">
                <button
                  onClick={onNavigateToRecommendations}
                  className="px-3.5 py-1.5 bg-[#171717] hover:bg-[#34322D] text-white font-medium rounded-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>{t('patterns.review_recommendations') || 'Review in recommendations'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
