import React, { useState, useMemo } from 'react';
import { 
  ArrowRight, 
  Droplets, 
  Route, 
  HeartPulse, 
  Zap, 
  Mic, 
  FileEdit, 
  Radio, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { District, CitizenRequest, InfrastructureCategory } from '../types';
import { NavTab } from './Sidebar';
import { calculatePriorityScore, getCategoryAccess, getPriorityTier } from '../utils/scoring';
import { getCityDemandHotspot } from '../utils/demandAggregation';
import { IndiaMapCanvas, EvaluatedDistrict, MapLayerState } from './IndiaMapCanvas';

interface OverviewProps {
  districts: District[];
  requests: CitizenRequest[];
  onNavigate: (tab: NavTab) => void;
  onSelectDistrictForPolicy?: (districtId: string, category: InfrastructureCategory) => void;
  onSelectCategoryForReporting?: (category: InfrastructureCategory) => void;
  onStartVoiceSubmission?: () => void;
  onStartWriteSubmission?: () => void;
}

export const Overview: React.FC<OverviewProps> = ({
  districts,
  requests,
  onNavigate,
  onSelectDistrictForPolicy,
  onStartVoiceSubmission,
  onStartWriteSubmission,
}) => {
  const [selectedHotspotId, setSelectedHotspotId] = useState<string>(districts[0]?.id || 'guntur');

  // Compute summary metrics
  const totalRequests = requests.length;
  const communityIssuesCount = 327;
  const priorityDistrictsCount = 42;
  const openActionsCount = 18;

  // Prepare evaluations for the map
  const evaluations: EvaluatedDistrict[] = useMemo(() => {
    return districts.map((district) => {
      const category: InfrastructureCategory = 'Water';
      const demandHotspot = getCityDemandHotspot(district, requests);
      const accessScore = getCategoryAccess(district, category);
      const demandCount = demandHotspot.totalCitizenRequests;
      const breakdown = calculatePriorityScore(district, category, demandCount, accessScore);
      const tier = getPriorityTier(breakdown.total_score);

      const matchedRequests = requests.filter(
        r => r.location.toLowerCase().includes(district.name.toLowerCase()) || 
             r.location.toLowerCase().includes(district.state.toLowerCase())
      );

      return {
        district,
        category,
        demandCount,
        currentAccess: accessScore,
        breakdown,
        matchedRequests,
        demandHotspot,
        priorityTier: tier,
      };
    });
  }, [districts, requests]);

  const mapLayers: MapLayerState = {
    citizen_demand: true,
    infrastructure: true,
    population: true,
    projects: false,
    healthcare: false,
    education: false,
    roads: false,
    digital: false,
  };

  // 3-5 Priority issues for "What needs attention"
  const priorityIssues = [
    {
      category: 'WATER' as InfrastructureCategory,
      title: 'Water access deficit & pipeline pressure drops',
      location: 'Guntur, Andhra Pradesh',
      districtId: 'guntur',
      statusNote: 'High and rising demand',
      signalCount: 742,
      trend: '+22% vs previous month',
      severity: 'Critical',
      icon: Droplets,
    },
    {
      category: 'ROADS' as InfrastructureCategory,
      title: 'Arterial hospital corridor craters & flood damage',
      location: 'Patna, Bihar',
      districtId: 'dist-01',
      statusNote: 'Infrastructure gap',
      signalCount: 512,
      trend: '+18% vs previous month',
      severity: 'High',
      icon: Route,
    },
    {
      category: 'HEALTH' as InfrastructureCategory,
      title: 'Sub-centre staffing shortfall & cold-chain failures',
      location: 'Nashik, Maharashtra',
      districtId: 'dist-04',
      statusNote: 'Demand increasing',
      signalCount: 389,
      trend: '+15% vs previous month',
      severity: 'High',
      icon: HeartPulse,
    },
    {
      category: 'POWER' as InfrastructureCategory,
      title: 'Agricultural feeder transformer breakdowns',
      location: 'Gaya, Bihar',
      districtId: 'dist-01',
      statusNote: 'Recurring outage pattern',
      signalCount: 294,
      trend: '+29% vs previous month',
      severity: 'Moderate',
      icon: Zap,
    },
  ];

  // 3-4 AI / predictive insights
  const predictiveInsights = [
    {
      title: 'Water demand increasing faster than capacity',
      body: 'Urban peripheries in Guntur and surrounding sub-districts exhibit a 22% monthly rise in water deficit reports, outpacing scheduled reservoir replenishment.',
      source: 'Gemini analysis · Vertex AI forecast',
      actionTab: 'patterns' as NavTab,
    },
    {
      title: 'Monsoon arterial road degradation cluster',
      body: 'Multi-district road distress detected along MDR corridors connecting agricultural mandis to national highways, affecting ambulance turnaround times.',
      source: 'Gemini analysis · Infrastructure telemetry',
      actionTab: 'issues' as NavTab,
    },
    {
      title: 'Primary healthcare accessibility gap',
      body: 'Patient grievance reports correlate strongly with unpaved transit corridors and transformer outages at primary clinics in Nashik rural blocks.',
      source: 'Cross-domain correlation model',
      actionTab: 'patterns' as NavTab,
    },
  ];

  // Top 3 Recommendations
  const topRecommendations = [
    {
      rank: '01',
      type: 'FIX',
      title: 'Drinking Water Trunk Pipeline & Pressure Booster',
      location: 'Guntur, Andhra Pradesh',
      districtId: 'guntur',
      category: 'Water' as InfrastructureCategory,
      priority: 'Priority 91 / 100',
      evidence: '742 citizen signals · +22% demand · High infrastructure gap',
      horizon: 'Predicted next 30 days: 890 signals',
      urgency: 'HIGH',
    },
    {
      rank: '02',
      type: 'BUILD',
      title: 'Primary Healthcare Clinic & Solar Storage Unit',
      location: 'Patna, Bihar',
      districtId: 'dist-01',
      category: 'Health' as InfrastructureCategory,
      priority: 'Priority 87 / 100',
      evidence: '512 citizen signals · Zero current clinic within 8km',
      horizon: 'Predicted next 30 days: 620 signals',
      urgency: 'HIGH',
    },
    {
      rank: '03',
      type: 'UPGRADE',
      title: 'Corridor Resurfacing & Drainage Culverts',
      location: 'Nashik, Maharashtra',
      districtId: 'dist-04',
      category: 'Roads' as InfrastructureCategory,
      priority: 'Priority 82 / 100',
      evidence: '389 citizen signals · 48 verified arterial craters',
      horizon: 'Predicted next 30 days: 450 signals',
      urgency: 'MODERATE',
    },
  ];

  return (
    <div className="space-y-12 font-sans text-[#171717] pb-16 max-w-6xl mx-auto">
      
      {/* 1. CITIZEN INTAKE STRIP */}
      <section className="bg-white border border-[#171717]/15 p-6 sm:p-7 rounded-sm shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center space-x-2 text-[11px] font-mono font-semibold text-[#D65A3A] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D65A3A]"></span>
            <span>Citizen Service Portal</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#171717]">
            Tell us what needs attention.
          </h2>
          <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
            Report local water, road, health, or electricity issues in your native dialect. AI translates and connects your report to administrative decision-makers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onStartVoiceSubmission ? onStartVoiceSubmission() : onNavigate('submit')}
            className="px-4 py-2.5 bg-[#D65A3A] hover:bg-[#c24e2f] text-white text-xs font-semibold rounded-xs transition-colors flex items-center space-x-2 cursor-pointer shadow-xs"
          >
            <Mic className="w-4 h-4" />
            <span>Speak an issue</span>
          </button>

          <button
            onClick={() => onStartWriteSubmission ? onStartWriteSubmission() : onNavigate('submit')}
            className="px-4 py-2.5 bg-white hover:bg-[#F7F5EF] text-[#171717] border border-[#171717]/25 text-xs font-semibold rounded-xs transition-colors flex items-center space-x-2 cursor-pointer shadow-xs"
          >
            <FileEdit className="w-4 h-4 text-[#57534E]" />
            <span>Write an issue</span>
          </button>

          <button
            onClick={() => onNavigate('signals')}
            className="px-3.5 py-2.5 text-[#57534E] hover:text-[#171717] text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer underline"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Track my requests</span>
          </button>
        </div>
      </section>

      {/* 2. HEADER & COMPACT SUMMARY STATS */}
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-[#171717]">
            India's civic priorities
          </h1>
          <p className="text-sm sm:text-base text-[#57534E] max-w-2xl mt-2 leading-relaxed">
            Signals from citizens, infrastructure and public investment — brought together to identify where action is needed.
          </p>
        </div>

        {/* Compact summary row: small, clean statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="bg-white border border-[#171717]/15 p-4 rounded-sm">
            <span className="text-[11px] font-sans text-[#78716C] block">Citizen requests</span>
            <span className="text-2xl font-mono font-bold text-[#171717] mt-1 block">
              {totalRequests.toLocaleString()}
            </span>
            <span className="text-[10px] text-[#57534E] block mt-0.5">Verified citizen submissions</span>
          </div>

          <div className="bg-white border border-[#171717]/15 p-4 rounded-sm">
            <span className="text-[11px] font-sans text-[#78716C] block">Community issues</span>
            <span className="text-2xl font-mono font-bold text-[#171717] mt-1 block">
              {communityIssuesCount}
            </span>
            <span className="text-[10px] text-[#57534E] block mt-0.5">Aggregated issue clusters</span>
          </div>

          <div className="bg-white border border-[#171717]/15 p-4 rounded-sm">
            <span className="text-[11px] font-sans text-[#78716C] block">Priority districts</span>
            <span className="text-2xl font-mono font-bold text-[#D65A3A] mt-1 block">
              {priorityDistrictsCount}
            </span>
            <span className="text-[10px] text-[#57534E] block mt-0.5">Critical response zones</span>
          </div>

          <div className="bg-white border border-[#171717]/15 p-4 rounded-sm">
            <span className="text-[11px] font-sans text-[#78716C] block">Open actions</span>
            <span className="text-2xl font-mono font-bold text-[#285943] mt-1 block">
              {openActionsCount}
            </span>
            <span className="text-[10px] text-[#57534E] block mt-0.5">Under official review</span>
          </div>
        </div>
      </section>

      {/* 3. SECTION: WHAT NEEDS ATTENTION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#171717]/10 pb-2">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#171717]">
              What needs attention
            </h2>
            <p className="text-xs text-[#78716C] mt-0.5">
              Urgent issues experiencing rapid demand acceleration or critical infrastructure failure.
            </p>
          </div>
          <button
            onClick={() => onNavigate('issues')}
            className="text-xs font-semibold text-[#D65A3A] hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>All community issues</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Compact horizontal rows */}
        <div className="space-y-2.5">
          {priorityIssues.map((issue) => {
            const IconComp = issue.icon;
            return (
              <div
                key={issue.title}
                className="bg-white border border-[#171717]/15 hover:border-[#171717]/35 p-4 rounded-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="w-8 h-8 rounded-xs bg-[#F7F5EF] border border-[#171717]/10 flex items-center justify-center shrink-0 mt-0.5 text-[#57534E]">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold text-[#D65A3A] uppercase tracking-wider">
                        {issue.category}
                      </span>
                      <span className="text-[#171717]/30 text-xs">·</span>
                      <span className="text-xs font-medium text-[#57534E]">
                        {issue.location}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-[#171717]">
                      {issue.title}
                    </div>
                    <div className="text-xs text-[#78716C]">
                      {issue.statusNote}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#171717]/10">
                  <div className="text-left sm:text-right">
                    <span className="text-xs font-mono font-bold text-[#171717] block">
                      {issue.signalCount} signals
                    </span>
                    <span className="text-[11px] text-[#D65A3A] font-medium block">
                      {issue.trend}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (onSelectDistrictForPolicy) {
                        onSelectDistrictForPolicy(issue.districtId, issue.category);
                      }
                      onNavigate('issues');
                    }}
                    className="px-3 py-1.5 text-xs font-medium bg-[#FAF8F5] hover:bg-[#F0ECE1] text-[#171717] border border-[#171717]/20 rounded-xs transition-colors cursor-pointer"
                  >
                    View issue
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. SECTION: WHERE (LARGE INDIA MAP) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#171717]/10 pb-2">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#171717]">
              Where
            </h2>
            <p className="text-xs text-[#78716C] mt-0.5">
              Geographic distribution of citizen demand and infrastructure vulnerability.
            </p>
          </div>
          <button
            onClick={() => onNavigate('map')}
            className="text-xs font-semibold text-[#D65A3A] hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>Open full map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Large map container as primary visual element */}
        <div className="bg-white border border-[#171717]/20 rounded-sm overflow-hidden shadow-xs">
          <div className="p-3 bg-[#F7F5EF] border-b border-[#171717]/15 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-3 text-[#57534E]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D65A3A]"></span>
                <span>High priority hotspot</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D9A441]"></span>
                <span>Medium priority</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#285943]"></span>
                <span>Monitoring</span>
              </span>
            </div>

            <span className="text-[11px] text-[#78716C]">
              Click any hotspot to explore
            </span>
          </div>

          <div className="h-[480px] w-full relative">
            <IndiaMapCanvas
              evaluations={evaluations}
              activeDistrictId={selectedHotspotId}
              onSelectDistrict={(id) => setSelectedHotspotId(id)}
              selectedCategory="All"
              layers={mapLayers}
              onSelectHotspotForPolicy={(dist, cat) => {
                if (onSelectDistrictForPolicy) {
                  onSelectDistrictForPolicy(dist.id, cat);
                }
                onNavigate('map');
              }}
              selectedCountryCode="IN"
            />
          </div>
        </div>
      </section>

      {/* 5. SECTION: WHAT THE DATA SUGGESTS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#171717]/10 pb-2">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#171717]">
              What the data suggests
            </h2>
            <p className="text-xs text-[#78716C] mt-0.5">
              Predictive models and correlation analysis grounded in public datasets.
            </p>
          </div>
          <button
            onClick={() => onNavigate('patterns')}
            className="text-xs font-semibold text-[#D65A3A] hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>View pattern intelligence</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {predictiveInsights.map((insight) => (
            <div
              key={insight.title}
              className="bg-white border border-[#171717]/15 p-5 rounded-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-1.5 text-[10px] font-mono text-[#78716C]">
                  <Sparkles className="w-3 h-3 text-[#D65A3A]" />
                  <span>{insight.source}</span>
                </div>
                <h3 className="text-sm font-serif font-bold text-[#171717] leading-snug">
                  {insight.title}
                </h3>
                <p className="text-xs text-[#57534E] leading-relaxed">
                  {insight.body}
                </p>
              </div>

              <button
                onClick={() => onNavigate(insight.actionTab)}
                className="text-xs font-medium text-[#D65A3A] hover:underline flex items-center space-x-1 cursor-pointer pt-2 border-t border-[#171717]/10"
              >
                <span>Examine pattern</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 6. SECTION: RECOMMENDED ACTIONS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#171717]/10 pb-2">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#171717]">
              Recommended actions
            </h2>
            <p className="text-xs text-[#78716C] mt-0.5">
              Top evidence-backed recommendations ready for sanctioning and administrative execution.
            </p>
          </div>
          <button
            onClick={() => onNavigate('recommendations')}
            className="text-xs font-semibold text-[#D65A3A] hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>All recommendations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {topRecommendations.map((rec) => (
            <div
              key={rec.rank}
              className="bg-white border border-[#171717]/15 hover:border-[#171717]/35 p-5 rounded-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-4">
                <div className="font-mono text-base font-bold text-[#78716C] shrink-0 pt-0.5">
                  {rec.rank}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-xs border ${
                      rec.type === 'FIX'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : rec.type === 'BUILD'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-blue-50 text-blue-800 border-blue-300'
                    }`}>
                      {rec.type}
                    </span>
                    <span className="text-xs font-medium text-[#57534E]">
                      {rec.location}
                    </span>
                    <span className="text-[#171717]/30 text-xs">·</span>
                    <span className="text-xs font-mono font-semibold text-[#D65A3A]">
                      {rec.priority}
                    </span>
                  </div>

                  <h3 className="text-base font-serif font-bold text-[#171717]">
                    {rec.title}
                  </h3>

                  <p className="text-xs text-[#57534E]">
                    {rec.evidence}
                  </p>
                  <p className="text-[11px] font-mono text-[#78716C]">
                    {rec.horizon}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#171717]/10">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs bg-[#F7F5EF] text-[#57534E] border border-[#171717]/15">
                  Urgency: {rec.urgency}
                </span>

                <button
                  onClick={() => {
                    if (onSelectDistrictForPolicy) {
                      onSelectDistrictForPolicy(rec.districtId, rec.category);
                    }
                    onNavigate('recommendations');
                  }}
                  className="px-3.5 py-2 text-xs font-semibold bg-[#171717] hover:bg-[#34322D] text-white rounded-xs transition-colors cursor-pointer"
                >
                  Review recommendation
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
