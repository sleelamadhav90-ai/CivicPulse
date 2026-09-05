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
    <div className="space-y-6 font-sans text-slate-900 pb-12">
      {/* Official Government Header */}
      <div className="bg-slate-900 text-white p-5 border-b-2 border-slate-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-700 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
              {t('nav.infrastructure')}
            </span>
            <span className="text-slate-400 text-xs font-mono">
              • Facility Condition & Capacity
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white mt-1 font-sans">
            {t('nav.infrastructure')}
          </h1>
          <p className="text-xs text-slate-300 mt-0.5 font-sans max-w-3xl">
            Complete inventory of public water filtration plants, primary health centres, schools, sub-stations, roads, and drainage outfalls. Cross-references physical condition against utilization stress.
          </p>
        </div>

        {onNavigateToRecommendations && (
          <button
            onClick={onNavigateToRecommendations}
            className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium px-4 py-2 transition-colors flex items-center gap-1.5 cursor-pointer border border-blue-600 shrink-0"
          >
            <span>{t('issues.view_recommendation')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Primary Question Banner */}
      <div className="bg-slate-100 border border-slate-300 p-3.5 text-xs text-slate-800 flex items-center justify-between font-mono">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-blue-900">PRIMARY QUESTION:</span>
          <span>"What physical infrastructure already exists in the region, what condition is it in, and what is its capacity stress?"</span>
        </div>
        <span className="text-[11px] text-slate-600 font-bold">
          {filteredAssets.length} Facilities Listed
        </span>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-300 p-4 space-y-3 font-mono text-xs shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search facility name, location, or ward..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-700"
            />
          </div>

          {/* Sector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 font-bold uppercase text-[10px]">{t('filter.category')}:</span>
            {['ALL', 'Water', 'Health', 'Education', 'Roads', 'Electricity', 'Drainage'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-[11px] border cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white border-slate-900 font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {cat === 'ALL' ? t('filter.all') : tCategory(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Condition Filter Row */}
        <div className="flex items-center space-x-3 border-t border-slate-200 pt-2 text-[11px]">
          <span className="text-slate-500 font-bold uppercase text-[10px]">Asset Condition:</span>
          {['ALL', 'Good', 'Poor', 'Damaged', 'Critical', 'Non-functional'].map((cond) => (
            <button
              key={cond}
              onClick={() => setSelectedCondition(cond)}
              className={`px-2 py-0.5 border cursor-pointer ${
                selectedCondition === cond
                  ? 'bg-blue-900 text-white border-blue-900 font-bold'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {cond}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-white border border-slate-300 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 uppercase text-[10px] tracking-wider font-bold">
                <th className="p-3 border-r border-slate-200">Facility ID & Name</th>
                <th className="p-3 border-r border-slate-200">{t('table.location')}</th>
                <th className="p-3 border-r border-slate-200">{t('table.category')}</th>
                <th className="p-3 border-r border-slate-200">Condition</th>
                <th className="p-3 border-r border-slate-200">Capacity & Utilization</th>
                <th className="p-3 border-r border-slate-200">Access Gap / Distance</th>
                <th className="p-3 text-right">{t('action.inspect')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 border-r border-slate-200 font-mono">
                    <span className="font-bold text-blue-900 block text-xs">{asset.id}</span>
                    <span className="font-sans font-bold text-slate-900 block text-xs mt-0.5">{asset.name}</span>
                  </td>

                  <td className="p-3 border-r border-slate-200">
                    <span className="font-bold text-slate-900 block">{asset.districtName}</span>
                    <span className="text-slate-500 text-[11px] block">{asset.location}</span>
                  </td>

                  <td className="p-3 border-r border-slate-200 font-mono">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 border border-slate-300 text-[10px] uppercase font-bold">
                      {tCategory(asset.category)}
                    </span>
                  </td>

                  <td className="p-3 border-r border-slate-200 font-mono">
                    <span className={`px-2 py-0.5 border text-[11px] font-bold ${getConditionBadgeStyle(asset.condition)}`}>
                      {asset.condition}
                    </span>
                  </td>

                  <td className="p-3 border-r border-slate-200 font-mono">
                    <div className="text-xs font-bold text-slate-900">{asset.capacity}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-24 bg-slate-200 h-2 border border-slate-300 overflow-hidden">
                        <div 
                          className={`h-full ${
                            asset.utilizationPct > 100 ? 'bg-red-600' : asset.utilizationPct > 80 ? 'bg-amber-600' : 'bg-emerald-600'
                          }`}
                          style={{ width: `${Math.min(asset.utilizationPct, 100)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700">{asset.utilizationPct}% stress</span>
                    </div>
                  </td>

                  <td className="p-3 border-r border-slate-200 font-mono text-xs">
                    {asset.nearestFacilityDistanceKm ? (
                      <div>
                        <span className="font-bold text-slate-900">{asset.nearestFacilityDistanceKm} km</span>
                        <span className="text-slate-500 text-[10px] block">({asset.travelTimeMinutes || 30} min transit)</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">On-site facility</span>
                    )}
                  </td>

                  <td className="p-3 text-right font-mono">
                    <button
                      onClick={() => setSelectedAssetModal(asset)}
                      className="text-blue-700 hover:text-blue-900 font-bold uppercase text-[11px] hover:underline cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border-2 border-slate-800 shadow-xl max-w-xl w-full p-6 space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-300 pb-3 font-mono">
              <div>
                <span className="text-xs text-blue-900 font-bold uppercase">Asset Condition & Capacity Audit</span>
                <h3 className="text-base font-bold text-slate-900">{selectedAssetModal.name}</h3>
              </div>
              <button
                onClick={() => setSelectedAssetModal(null)}
                className="text-slate-500 hover:text-slate-900 text-sm font-bold border border-slate-300 px-2 py-1 cursor-pointer"
              >
                {t('common.close')} ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Location & Coverage</span>
                <div className="text-sm font-bold text-slate-900">{selectedAssetModal.location} ({selectedAssetModal.districtName})</div>
                <div className="text-slate-600">Coverage Radius: {selectedAssetModal.coverageRadiusKm || 10} km | Served Beneficiaries: {selectedAssetModal.servedPopulation.toLocaleString()} residents</div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 space-y-1">
                <span className="text-[10px] text-amber-900 uppercase block font-bold">Staffing & Operational Status</span>
                <p className="text-slate-900 font-sans font-medium">{selectedAssetModal.staffOrEquipmentStatus || 'No operational defects reported.'}</p>
                <div className="text-slate-600 text-[10px] pt-1">Last Physical Inspection: {selectedAssetModal.lastInspectedDate || '2026-07-15'}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-300 flex justify-end font-mono text-xs">
              <button
                onClick={() => setSelectedAssetModal(null)}
                className="bg-slate-900 text-white font-bold px-4 py-2 hover:bg-slate-800 cursor-pointer"
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
