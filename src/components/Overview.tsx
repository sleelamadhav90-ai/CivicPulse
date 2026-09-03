import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Sparkles, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  Droplets, 
  Route, 
  HeartPulse, 
  DollarSign, 
  ChevronRight,
  Filter,
  Users,
  ShieldCheck,
  Check,
  Info
} from 'lucide-react';
import { District, CitizenRequest } from '../types';
import { calculatePriorityScore, getPriorityTier } from '../utils/scoring';
import { NavTab } from './Sidebar';

interface OverviewProps {
  districts: District[];
  requests: CitizenRequest[];
  onNavigate: (tab: NavTab) => void;
  onSelectDistrictForPolicy: (districtId: string, category: 'Water' | 'Health' | 'Roads' | 'Education' | 'Drainage' | 'Electricity') => void;
}

export const Overview: React.FC<OverviewProps> = ({
  districts,
  requests,
  onNavigate,
  onSelectDistrictForPolicy,
}) => {
  // Region state for interactive map & detail drawer
  const [selectedRegionId, setSelectedRegionId] = useState<string>('dist-01');

  // Compute district priority rankings
  const rankedDistricts = districts.map((d) => {
    const waterScore = calculatePriorityScore(d, 'Water', 8, requests.filter(r => r.location.toLowerCase() === d.name.toLowerCase() && r.category === 'Water').length + 12).total_score;
    const roadScore = calculatePriorityScore(d, 'Roads', 7, requests.filter(r => r.location.toLowerCase() === d.name.toLowerCase() && r.category === 'Roads').length + 8).total_score;
    const healthScore = calculatePriorityScore(d, 'Health', 9, requests.filter(r => r.location.toLowerCase() === d.name.toLowerCase() && r.category === 'Health').length + 6).total_score;
    const maxScore = Math.max(waterScore, roadScore, healthScore);
    const topCategory: 'Water' | 'Roads' | 'Health' = waterScore >= roadScore && waterScore >= healthScore ? 'Water' : roadScore >= healthScore ? 'Roads' : 'Health';

    return {
      ...d,
      maxScore,
      topCategory,
      tier: getPriorityTier(maxScore),
      affectedCount: (d.population * 0.18).toFixed(0),
      citizenSignals: requests.filter(r => r.location.toLowerCase() === d.name.toLowerCase()).length + 380,
      investedCr: 39,
      delayedProjects: 25,
      complaintIncreasePct: 42,
    };
  }).sort((a, b) => b.maxScore - a.maxScore);

  const selectedRegion = rankedDistricts.find(d => d.id === selectedRegionId) || rankedDistricts[0];

  return (
    <div className="space-y-8 font-sans text-slate-900 pb-12 max-w-7xl mx-auto">
      {/* Top Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium mb-1">
            <span className="font-semibold text-blue-700">CivicPulse</span>
            <span>•</span>
            <span>Overview</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Where should we intervene?
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            <span className="font-semibold text-slate-900">4 regions</span> currently require priority attention based on citizen signals, access deficits, and stalled capital projects.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>Illustrative demo dataset</span>
          </span>
          <button
            onClick={() => onNavigate('recommendations')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>View Recommendations</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700">
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          <span className="flex items-center gap-1.5 font-semibold text-slate-900">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Scope:</span>
          </span>
          <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md font-medium text-slate-800">
            India
          </span>
          <span className="text-slate-300">•</span>
          <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md font-medium text-slate-800">
            All States
          </span>
          <span className="text-slate-300">•</span>
          <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md font-medium text-slate-800">
            All Infrastructure Sectors
          </span>
          <span className="text-slate-300">•</span>
          <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md font-medium text-slate-800 font-mono">
            Last 90 days
          </span>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Updated: <span className="font-semibold text-slate-700">03 Sep 2026</span>
        </div>
      </div>

      {/* Hero Section: Map + Selected Region Detail Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Priority Map (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Priority Areas Map
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any region to inspect issue velocity, affected residents, and recommended action
              </p>
            </div>

            {/* Status Legend */}
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                Critical
              </span>
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                High
              </span>
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                Moderate
              </span>
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Stable
              </span>
            </div>
          </div>

          {/* Map Interactive Canvas Container */}
          <div className="relative bg-slate-900 text-white rounded-lg p-6 min-h-[340px] flex flex-col justify-between overflow-hidden">
            {/* Subtle Map Grid Background */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <div className="relative z-10 flex justify-between items-start">
              <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                Interactive Regional Focus Canvas
              </span>
              <span className="text-xs text-slate-300 bg-blue-900/60 border border-blue-500/40 px-2.5 py-1 rounded">
                Click a region pin below
              </span>
            </div>

            {/* Region Pins Grid Representation */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
              {rankedDistricts.slice(0, 6).map((district, idx) => {
                const isSelected = selectedRegionId === district.id;
                const isCritical = district.maxScore >= 80;

                return (
                  <button
                    key={district.id}
                    onClick={() => setSelectedRegionId(district.id)}
                    className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-blue-600 text-white border-white shadow-md ring-2 ring-blue-300/50'
                        : 'bg-slate-800/90 hover:bg-slate-800 text-slate-200 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm truncate">{district.name}</span>
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        isCritical ? 'bg-red-500 animate-pulse' : 'bg-amber-400'
                      }`} />
                    </div>
                    <div className="text-xs opacity-80 flex items-center justify-between mt-1">
                      <span>{district.state}</span>
                      <span className="font-mono font-bold">Priority {district.maxScore}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800">
              <span>Showing 6 active monitoring districts</span>
              <button 
                onClick={() => onNavigate('map')}
                className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Open full GIS map</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Selected Region Focus Drawer / Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
            <div>
              <span className="text-xs text-blue-600 font-semibold uppercase tracking-wider block">
                Selected Region
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                {selectedRegion.name}, {selectedRegion.state}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium block">Priority Score</span>
              <span className="text-2xl font-bold font-mono text-red-600">
                {selectedRegion.maxScore}<span className="text-xs text-slate-400 font-normal">/100</span>
              </span>
            </div>
          </div>

          {/* Key Facts List */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-800 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-600" />
                Primary Sector Deficit
              </span>
              <span className="font-bold text-slate-900">{selectedRegion.topCategory} Access</span>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Citizen Signals</span>
                <span className="text-sm font-bold text-slate-900">{selectedRegion.citizenSignals.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Residents Affected</span>
                <span className="text-sm font-bold text-slate-900">{(selectedRegion.population * 0.18 / 1000).toFixed(0)}K</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Invested Capital</span>
                <span className="text-sm font-bold text-slate-900">₹{selectedRegion.investedCr} Cr</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Complaint Velocity</span>
                <span className="text-sm font-bold text-red-600">↑ {selectedRegion.complaintIncreasePct}%</span>
              </div>
            </div>

            {/* Recommended Action Box */}
            <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-lg space-y-2">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Recommended Action
              </span>
              <p className="text-xs text-blue-950 leading-relaxed font-medium">
                Fix existing water infrastructure before allocating new construction funds. ₹11.2 Cr remains unspent in related Jal Jeevan Mission allocation.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              onSelectDistrictForPolicy(selectedRegion.id, selectedRegion.topCategory);
              onNavigate('recommendations');
            }}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <span>View evidence & brief</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Priority Regions Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Priority Intervention Areas
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked deterministically by demand volume, infrastructure gap, and unspent scheme budget
            </p>
          </div>
          <button
            onClick={() => onNavigate('recommendations')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <span>See all recommendations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-medium text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4">Primary Issue</th>
                <th className="py-3 px-4 font-mono">People Affected</th>
                <th className="py-3 px-4 font-mono">Investment</th>
                <th className="py-3 px-4 font-mono">Priority</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans text-slate-800">
              {rankedDistricts.slice(0, 4).map((dist) => (
                <tr key={dist.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div>{dist.name}</div>
                    <div className="text-[11px] text-slate-500 font-normal">{dist.state}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      {dist.topCategory === 'Water' && <Droplets className="w-3.5 h-3.5 text-blue-600" />}
                      {dist.topCategory === 'Roads' && <Route className="w-3.5 h-3.5 text-amber-600" />}
                      {dist.topCategory === 'Health' && <HeartPulse className="w-3.5 h-3.5 text-rose-600" />}
                      {dist.topCategory} access deficit
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                    {(dist.population * 0.18 / 1000).toFixed(0)}K residents
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                    ₹39 Cr
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className={`inline-block px-2 py-0.5 rounded font-bold ${
                      dist.maxScore >= 80 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {dist.maxScore}/100
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        onSelectDistrictForPolicy(dist.id, dist.topCategory);
                        onNavigate('recommendations');
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>View details</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
