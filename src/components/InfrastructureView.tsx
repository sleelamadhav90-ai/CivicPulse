import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Filter, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Activity, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { InfrastructureAsset, InfrastructureCategory } from '../types';
import { INFRASTRUCTURE_ASSETS_REGISTRY } from '../data/infrastructureAssets';
import { useLanguage } from '../context/LanguageContext';

interface InfrastructureViewProps {
  districtId?: string;
  onNavigateToRecommendations?: () => void;
}

export const InfrastructureView: React.FC<InfrastructureViewProps> = ({
  districtId,
  onNavigateToRecommendations
}) => {
  const { t, tCategory } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCondition, setSelectedCondition] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetModal, setSelectedAssetModal] = useState<InfrastructureAsset | null>(null);

  const assets = INFRASTRUCTURE_ASSETS_REGISTRY;

  const filteredAssets = assets.filter(asset => {
    const matchesDistrict = !districtId || asset.districtId.toLowerCase() === districtId.toLowerCase();
    const matchesCategory = selectedCategory === 'ALL' || asset.category === selectedCategory;
    const matchesCondition = selectedCondition === 'ALL' || asset.condition.includes(selectedCondition);
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.districtName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDistrict && matchesCategory && matchesCondition && matchesSearch;
  });

  const getConditionBadgeStyle = (condition: string) => {
    if (condition.includes('Good')) return 'bg-emerald-50 text-emerald-800 border-emerald-300';
    if (condition.includes('Poor') || condition.includes('Damaged')) return 'bg-amber-50 text-amber-800 border-amber-300';
    return 'bg-red-50 text-red-800 border-red-300';
  };

  return (
    <div className="space-y-6 font-sans text-[#171717] pb-16 max-w-7xl mx-auto">
      {/* 1. Page Header (Question-driven with supporting label) */}
      <header className="border-b border-[#171717]/10 pb-4 pt-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-[#FAF8F5] text-[#D65A3A] border border-[#D65A3A]/30 text-[10px] font-mono font-bold tracking-wider uppercase rounded-xs">
            {t('infrastructure.page_label') || 'Infrastructure'}
          </span>
          <span className="text-[11px] font-mono text-[#78716C] uppercase tracking-wider">
            Step 3 · Measure Need
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#171717]">
              {t('infrastructure.question_title') || 'Where are the infrastructure gaps?'}
            </h1>
            <p className="text-xs sm:text-sm text-[#57534E] mt-1 max-w-3xl leading-relaxed">
              {t('infrastructure.subtitle')}
            </p>
          </div>

          {onNavigateToRecommendations && (
            <button
              onClick={onNavigateToRecommendations}
              className="px-3.5 py-2 bg-[#D65A3A] hover:bg-[#c24e2f] text-white text-xs font-semibold rounded-xs transition-colors flex items-center space-x-1.5 shrink-0 cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <span>{t('issues.view_recommendation')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Narrative Context Banner */}
      <div className="bg-[#FAF8F5] border border-[#171717]/15 p-4 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D65A3A] block">
            Why Asset Audits Matter
          </span>
          <p className="text-[#34322D] leading-relaxed">
            <strong className="text-[#171717]">ASSET CAPACITY + PHYSICAL CONDITION + CITIZEN DEMAND = TARGETED SANCTION.</strong>{' '}
            Cross-referencing facility registries against live complaints reveals whether a failure is caused by an overwhelmed facility (e.g. 140% capacity stress), a broken asset, or an absolute coverage desert.
          </p>
        </div>
        <span className="text-[11px] font-mono px-2 py-1 bg-white border border-[#171717]/15 rounded-xs shrink-0 text-[#171717] font-semibold">
          {filteredAssets.length} Facilities Listed
        </span>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#171717]/15 p-4 rounded-sm space-y-3 font-mono text-xs shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search facility name, location, or ward..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#FAF8F5] border border-[#171717]/20 rounded-xs text-xs text-[#171717] focus:outline-hidden focus:border-[#171717]"
            />
          </div>

          {/* Sector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[#78716C] font-bold uppercase text-[10px]">{t('filter.category')}:</span>
            {['ALL', 'Water', 'Health', 'Education', 'Roads', 'Electricity', 'Drainage'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-[11px] rounded-xs border cursor-pointer transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#171717] text-white border-[#171717] font-bold'
                    : 'bg-white text-[#57534E] border-[#171717]/15 hover:border-[#171717]/40'
                }`}
              >
                {cat === 'ALL' ? t('filter.all') : tCategory(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Condition Filter Row */}
        <div className="flex items-center space-x-3 border-t border-[#171717]/10 pt-2 text-[11px]">
          <span className="text-[#78716C] font-bold uppercase text-[10px]">Asset Condition:</span>
          {['ALL', 'Good', 'Poor', 'Damaged', 'Critical', 'Non-functional'].map((cond) => (
            <button
              key={cond}
              onClick={() => setSelectedCondition(cond)}
              className={`px-2 py-0.5 rounded-xs border cursor-pointer transition-colors ${
                selectedCondition === cond
                  ? 'bg-[#D65A3A] text-white border-[#D65A3A] font-bold'
                  : 'bg-white text-[#57534E] border-[#171717]/15 hover:border-[#171717]/40'
              }`}
            >
              {cond}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-white border border-[#171717]/15 rounded-sm shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] text-[#171717] border-b border-[#171717]/15 uppercase text-[10px] tracking-wider font-bold">
                <th className="p-3 border-r border-[#171717]/10">Facility ID & Name</th>
                <th className="p-3 border-r border-[#171717]/10">{t('table.location')}</th>
                <th className="p-3 border-r border-[#171717]/10">{t('table.category')}</th>
                <th className="p-3 border-r border-[#171717]/10">Condition</th>
                <th className="p-3 border-r border-[#171717]/10">Capacity & Utilization</th>
                <th className="p-3 border-r border-[#171717]/10">Access Gap / Distance</th>
                <th className="p-3 text-right">{t('action.inspect')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171717]/10 font-sans">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="p-3 border-r border-[#171717]/10 font-mono">
                    <span className="font-bold text-[#D65A3A] block text-xs">{asset.id}</span>
                    <span className="font-sans font-bold text-[#171717] block text-xs mt-0.5">{asset.name}</span>
                  </td>

                  <td className="p-3 border-r border-[#171717]/10">
                    <span className="font-bold text-[#171717] block">{asset.districtName}</span>
                    <span className="text-[#78716C] text-[11px] block">{asset.location}</span>
                  </td>

                  <td className="p-3 border-r border-[#171717]/10 font-mono">
                    <span className="bg-[#FAF8F5] text-[#171717] px-2 py-0.5 border border-[#171717]/15 text-[10px] uppercase font-bold rounded-xs">
                      {tCategory(asset.category)}
                    </span>
                  </td>

                  <td className="p-3 border-r border-[#171717]/10 font-mono">
                    <span className={`px-2 py-0.5 border rounded-xs text-[11px] font-bold ${getConditionBadgeStyle(asset.condition)}`}>
                      {asset.condition}
                    </span>
                  </td>

                  <td className="p-3 border-r border-[#171717]/10 font-mono">
                    <div className="text-xs font-bold text-[#171717]">{asset.capacity}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-24 bg-[#E7E5E4] h-2 rounded-xs border border-[#171717]/15 overflow-hidden">
                        <div 
                          className={`h-full ${
                            asset.utilizationPct > 100 ? 'bg-red-600' : asset.utilizationPct > 80 ? 'bg-amber-600' : 'bg-emerald-600'
                          }`}
                          style={{ width: `${Math.min(asset.utilizationPct, 100)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-[#57534E]">{asset.utilizationPct}% stress</span>
                    </div>
                  </td>

                  <td className="p-3 border-r border-[#171717]/10 font-mono text-xs">
                    {asset.nearestFacilityDistanceKm ? (
                      <div>
                        <span className="font-bold text-[#171717]">{asset.nearestFacilityDistanceKm} km</span>
                        <span className="text-[#78716C] text-[10px] block">({asset.travelTimeMinutes || 30} min transit)</span>
                      </div>
                    ) : (
                      <span className="text-[#A8A29E]">On-site facility</span>
                    )}
                  </td>

                  <td className="p-3 text-right font-mono">
                    <button
                      onClick={() => setSelectedAssetModal(asset)}
                      className="text-[#D65A3A] hover:text-[#b04326] font-bold uppercase text-[11px] hover:underline cursor-pointer"
                    >
                      {t('action.inspect')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Audit Inspector Modal */}
      {selectedAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171717]/60 backdrop-blur-xs">
          <div className="bg-white border border-[#171717]/20 rounded-sm shadow-xl max-w-xl w-full p-6 space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-[#171717]/15 pb-3 font-mono">
              <div>
                <span className="text-xs text-[#D65A3A] font-bold uppercase">Asset Condition & Capacity Audit</span>
                <h3 className="text-base font-bold text-[#171717]">{selectedAssetModal.name}</h3>
              </div>
              <button
                onClick={() => setSelectedAssetModal(null)}
                className="text-[#78716C] hover:text-[#171717] text-sm font-bold border border-[#171717]/20 rounded-xs px-2 py-1 cursor-pointer"
              >
                {t('common.close')} ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-[#FAF8F5] border border-[#171717]/15 rounded-xs space-y-1">
                <span className="text-[10px] text-[#78716C] uppercase block font-bold">Location & Coverage</span>
                <div className="text-sm font-bold text-[#171717]">{selectedAssetModal.location} ({selectedAssetModal.districtName})</div>
                <div className="text-[#57534E]">Coverage Radius: {selectedAssetModal.coverageRadiusKm || 10} km | Served Beneficiaries: {selectedAssetModal.servedPopulation.toLocaleString()} residents</div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xs space-y-1">
                <span className="text-[10px] text-amber-900 uppercase block font-bold">Staffing & Operational Status</span>
                <p className="text-[#171717] font-sans font-medium">{selectedAssetModal.staffOrEquipmentStatus || 'No operational defects reported.'}</p>
                <div className="text-[#78716C] text-[10px] pt-1">Last Physical Inspection: {selectedAssetModal.lastInspectedDate || '2026-07-15'}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#171717]/15 flex justify-end font-mono text-xs">
              <button
                onClick={() => setSelectedAssetModal(null)}
                className="bg-[#171717] text-white font-bold px-4 py-2 rounded-xs hover:bg-[#2A2925] cursor-pointer"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
