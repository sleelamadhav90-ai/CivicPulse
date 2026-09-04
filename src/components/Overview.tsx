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
    <div className="space-y-8 font-sans text-[#171717] pb-12 max-w-7xl mx-auto">
      {/* Top Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#171717]/20 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold mb-2">
            <span className="px-2 py-0.5 bg-[#D65A3A] text-white uppercase text-[10px]">
              DIGITAL PUBLIC GOODS × CIVIC INTELLIGENCE
            </span>
            <span className="text-[#171717]/40">•</span>
            <span className="text-[#171717]/70 uppercase text-[10px]">
              Built for India. Designed to scale across public systems.
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#171717]">
            Where should we intervene?
          </h1>
          <p className="text-sm font-sans text-[#171717]/80 mt-1">
            <span className="font-bold text-[#171717]">4 priority regions</span> currently require intervention based on citizen signals, access deficits, and stalled capital projects.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white text-[#171717] border border-[#171717]/20 font-mono text-xs">
            <Info className="w-3.5 h-3.5 text-[#D65A3A]" />
            <span>Illustrative Demo Dataset</span>
          </span>
          <button
            onClick={() => onNavigate('recommendations')}
            className="px-4 py-2.5 bg-[#D65A3A] hover:bg-[#c34e2f] text-white font-sans font-bold text-xs rounded transition-colors shadow-[2px_2px_0px_#171717] border border-[#171717] flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>View AI Recommendations</span>
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

      {/* Priority Regions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#171717] uppercase tracking-tight">
              Priority Regions Requiring Intervention
            </h2>
            <p className="text-xs font-mono text-[#171717]/70 mt-0.5">
              Determined by synthesizing citizen demand volume, infrastructure gap audits, and unspent scheme capital.
            </p>
          </div>
          <button
            onClick={() => onNavigate('recommendations')}
            className="text-xs font-mono font-bold text-[#D65A3A] hover:text-[#c34e2f] flex items-center gap-1 cursor-pointer uppercase"
          >
            <span>View All Recommendations ({rankedDistricts.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rankedDistricts.slice(0, 4).map((dist) => {
            const isHigh = dist.maxScore >= 80;
            return (
              <div
                key={dist.id}
                className="bg-white border-2 border-[#171717] rounded-lg p-6 shadow-[4px_4px_0px_#171717] flex flex-col justify-between space-y-4 hover:shadow-[6px_6px_0px_#D65A3A] transition-all"
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-[#171717]/20 pb-3">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-[#171717] uppercase tracking-tight">
                        {dist.name}, {dist.state}
                      </h3>
                      <span className="text-[10px] font-mono text-[#171717]/70 uppercase">
                        India Stack Node #{dist.id.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className={`px-2.5 py-1 text-xs font-mono font-bold border uppercase block ${
                        isHigh ? 'bg-rose-100 text-rose-900 border-rose-500' : 'bg-amber-100 text-amber-900 border-amber-500'
                      }`}>
                        {dist.maxScore} / 100 — {isHigh ? 'HIGH PRIORITY' : 'CRITICAL'}
                      </span>
                    </div>
                  </div>

                  {/* Primary Deficit Badge */}
                  <div className="flex items-center space-x-2 pt-1 font-mono text-xs">
                    <span className="font-bold text-[#D65A3A] flex items-center gap-1.5 uppercase">
                      {dist.topCategory === 'Water' && <Droplets className="w-4 h-4 text-blue-600" />}
                      {dist.topCategory === 'Roads' && <Route className="w-4 h-4 text-amber-600" />}
                      {dist.topCategory === 'Health' && <HeartPulse className="w-4 h-4 text-rose-600" />}
                      💧 {dist.topCategory} Access Deficit
                    </span>
                  </div>
                </div>

                {/* 4 Metric Chips */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-[#F7F5EF] p-2.5 border border-[#171717]/30">
                    <span className="text-[9px] text-[#171717]/60 uppercase block font-sans">Citizen Signals</span>
                    <span className="font-bold text-[#171717] text-sm">4,820 Reports</span>
                  </div>
                  <div className="bg-[#F7F5EF] p-2.5 border border-[#171717]/30">
                    <span className="text-[9px] text-[#171717]/60 uppercase block font-sans">Potentially Affected</span>
                    <span className="font-bold text-[#171717] text-sm">{(dist.population * 0.18 / 1000).toFixed(0)}K Residents</span>
                  </div>
                  <div className="bg-[#F7F5EF] p-2.5 border border-[#171717]/30">
                    <span className="text-[9px] text-[#171717]/60 uppercase block font-sans">Related Scheme Investment</span>
                    <span className="font-bold text-[#171717] text-sm">₹39 Cr Expended</span>
                  </div>
                  <div className="bg-[#F7F5EF] p-2.5 border border-[#171717]/30">
                    <span className="text-[9px] text-[#171717]/60 uppercase block font-sans">Stalled Contracts</span>
                    <span className="font-bold text-rose-700 text-sm">25 Projects Delayed</span>
                  </div>
                </div>

                {/* Recommended Action */}
                <div className="p-3 bg-amber-50 border border-amber-300 text-amber-950 rounded space-y-1 font-sans text-xs">
                  <span className="font-bold uppercase text-[10px] text-amber-800 tracking-wider flex items-center gap-1 font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-[#D65A3A]" />
                    AI Recommended Intervention
                  </span>
                  <p className="font-medium text-[#171717]">
                    <strong>🔧 FIX:</strong> Repair existing water pipeline infrastructure and expedite stalled pumping contracts before allocating new construction budget.
                  </p>
                </div>

                {/* CTAs */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#171717]/10 font-mono text-xs">
                  <button
                    onClick={() => {
                      onSelectDistrictForPolicy(dist.id, dist.topCategory);
                      onNavigate('recommendations');
                    }}
                    className="px-4 py-2.5 bg-[#171717] hover:bg-[#D65A3A] text-white font-bold rounded transition-colors shadow-[2px_2px_0px_#171717] cursor-pointer flex items-center gap-1.5"
                  >
                    <span>VIEW EVIDENCE →</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectDistrictForPolicy(dist.id, dist.topCategory);
                      onNavigate('recommendations');
                    }}
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded transition-colors shadow-[2px_2px_0px_#171717] cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Add to Action Queue →</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
