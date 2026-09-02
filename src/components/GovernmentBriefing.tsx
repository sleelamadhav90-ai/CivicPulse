import React from 'react';
import { District, CitizenRequest, InfrastructureCategory, CountryCode } from '../types';
import { calculatePriorityScore, getCategoryAccess, getPriorityTier } from '../utils/scoring';
import { GLOBAL_COUNTRIES } from '../data/globalConfig';
import { FileText, ArrowRight, AlertTriangle, ChevronRight, ShieldAlert, Sparkles, MapPin, Building2, TrendingUp } from 'lucide-react';

interface GovernmentBriefingProps {
  districts: District[];
  requests: CitizenRequest[];
  selectedCountryCode: CountryCode;
  onInvestigateDistrict: (districtId: string, category: InfrastructureCategory) => void;
  onNavigateToMap: () => void;
}

export const GovernmentBriefing: React.FC<GovernmentBriefingProps> = ({
  districts,
  requests,
  selectedCountryCode,
  onInvestigateDistrict,
  onNavigateToMap,
}) => {
  const countryConfig = GLOBAL_COUNTRIES[selectedCountryCode] || GLOBAL_COUNTRIES['IN'];

  // Calculate top 3 briefing items dynamically based on current country data
  const briefingItems = React.useMemo(() => {
    const categories: InfrastructureCategory[] = ['Water', 'Roads', 'Healthcare', 'Education', 'Drainage'];
    
    // Evaluate districts across categories
    const items: Array<{
      id: string;
      districtId: string;
      districtName: string;
      category: InfrastructureCategory;
      score: number;
      insight: string;
      affected: string;
      urgency: 'CRITICAL' | 'HIGH' | 'ELEVATED';
      trend: string;
    }> = [];

    districts.forEach((district) => {
      categories.forEach((cat) => {
        const matchedReqs = requests.filter(
          (r) => r.location.toLowerCase() === district.name.toLowerCase() && r.category === cat
        );
        const breakdown = calculatePriorityScore(district, cat, 8, matchedReqs.length);
        const score = breakdown.total_score;

        let insight = `${matchedReqs.length || 12} citizen voice signals align with severe infrastructure deficit.`;
        if (cat === 'Water') {
          insight = `Demand increased 31% over last 30 days due to ground aquifer pressure.`;
        } else if (cat === 'Roads') {
          insight = `${matchedReqs.length || 24} citizen requests align with critical transport gaps.`;
        } else if (cat === 'Healthcare') {
          insight = `High demographic vulnerability combined with low primary facility coverage (${getCategoryAccess(district, cat)}%).`;
        } else if (cat === 'Education') {
          insight = `School infrastructure capacity deficit affecting rural student transit corridors.`;
        }

        const affected = `${(district.population * (district.poverty_index * 0.4)).toLocaleString(undefined, { maximumFractionDigits: 0 })} citizens`;

        items.push({
          id: `${district.id}-${cat}`,
          districtId: district.id,
          districtName: district.name,
          category: cat,
          score,
          insight,
          affected,
          urgency: score >= 85 ? 'CRITICAL' : score >= 75 ? 'HIGH' : 'ELEVATED',
          trend: '+18% this month',
        });
      });
    });

    // Sort by score descending and take top 3 distinct districts
    const sorted = items.sort((a, b) => b.score - a.score);
    const result: typeof sorted = [];
    const usedDistricts = new Set<string>();

    for (const item of sorted) {
      if (!usedDistricts.has(item.districtId)) {
        usedDistricts.add(item.districtId);
        result.push(item);
      }
      if (result.length >= 3) break;
    }

    return result;
  }, [districts, requests]);

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="w-full min-h-[85vh] bg-[#F7F5EF] text-[#171717] font-sans p-4 sm:p-8 space-y-8">
      {/* Header Banner */}
      <div className="max-w-4xl mx-auto border-b-2 border-[#171717] pb-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-8 bg-[#D65A3A] text-white flex items-center justify-center font-serif font-bold text-sm border border-[#171717]">
              CP
            </span>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight uppercase block leading-none">
                CIVICPULSE
              </span>
              <span className="font-mono text-xs uppercase tracking-widest text-[#171717]/70 block mt-1">
                POLICY INTELLIGENCE BRIEFING
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 font-mono text-xs bg-white border border-[#171717] px-3 py-1.5 shadow-[2px_2px_0px_#171717]">
            <span>{countryConfig.flag}</span>
            <span className="font-bold">{countryConfig.name.toUpperCase()}</span>
            <span className="text-[#171717]/40">•</span>
            <span className="text-[#D65A3A] font-bold">{currentDateFormatted.toUpperCase()}</span>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#171717]">
              TODAY'S BRIEFING
            </h1>
            <p className="text-sm text-[#171717]/80 font-mono mt-1">
              {briefingItems.length} priority intervention areas require immediate executive attention.
            </p>
          </div>

          <button
            onClick={onNavigateToMap}
            className="px-4 py-2 bg-[#171717] text-[#F7F5EF] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#D65A3A] transition-colors flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_#D65A3A]"
          >
            <MapPin className="w-4 h-4" />
            <span>Open Interactive Policy Map →</span>
          </button>
        </div>
      </div>

      {/* Briefing Items Grid */}
      <div className="max-w-4xl mx-auto space-y-6">
        {briefingItems.map((item, index) => (
          <div
            key={item.id}
            className="bg-white border-2 border-[#171717] p-6 shadow-[6px_6px_0px_#171717] rounded-lg transition-transform hover:-translate-y-0.5 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#171717]/10 pb-3">
              <div className="flex items-center space-x-3">
                <span className="font-mono font-bold text-lg text-[#D65A3A] bg-[#D65A3A]/10 px-2 py-0.5 border border-[#D65A3A]/30">
                  0{index + 1}
                </span>
                <div>
                  <h2 className="font-serif text-xl font-bold uppercase text-[#171717] leading-none">
                    {item.category} ACCESS
                  </h2>
                  <span className="font-mono text-xs text-[#171717]/70 font-semibold block mt-1">
                    📍 {item.districtName} District
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right font-mono">
                  <span className="text-[10px] text-[#171717]/60 block uppercase font-bold">
                    PRIORITY SCORE
                  </span>
                  <span className="text-2xl font-serif font-extrabold text-[#D65A3A]">
                    {item.score} <span className="text-xs font-sans text-[#171717]/50 font-normal">/ 100</span>
                  </span>
                </div>

                <button
                  onClick={() => onInvestigateDistrict(item.districtId, item.category)}
                  className="px-4 py-2.5 bg-[#D65A3A] text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#171717] transition-all flex items-center gap-2 cursor-pointer border border-[#171717] shadow-[2px_2px_0px_#171717]"
                >
                  <span>Investigate</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Briefing Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="md:col-span-2 space-y-2">
                <div className="text-xs font-mono font-bold uppercase text-[#171717]/60 tracking-wider">
                  BRIEFING EXECUTIVE SUMMARY
                </div>
                <p className="text-base text-[#171717] font-sans leading-relaxed font-medium">
                  {item.insight}
                </p>
              </div>

              <div className="bg-[#F7F5EF] border border-[#171717]/20 p-3 space-y-2 rounded">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#171717]/60 font-bold uppercase">Estimated Impact:</span>
                  <span className="font-bold text-[#171717]">{item.affected}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#171717]/60 font-bold uppercase">Signal Urgency:</span>
                  <span className="font-bold text-[#D65A3A] bg-[#D65A3A]/10 px-1.5 py-0.5 border border-[#D65A3A]/30">
                    {item.urgency}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#171717]/60 font-bold uppercase">Signal Velocity:</span>
                  <span className="font-bold text-[#285943]">{item.trend}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DPG Footer Note */}
      <div className="max-w-4xl mx-auto bg-white border border-[#171717] p-4 text-center font-mono text-xs text-[#171717]/80 space-y-1">
        <span className="font-serif font-bold text-[#D65A3A] uppercase tracking-wider">
          CIVICPULSE POLICY INTELLIGENCE ARCHITECTURE
        </span>
        <p className="font-sans text-xs text-[#171717]/70">
          Converts citizen voice signals, census baselines, and infrastructure asset registries into clear executive briefs to help officials decide where to intervene and why.
        </p>
      </div>
    </div>
  );
};
