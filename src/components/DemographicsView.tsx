import React, { useState } from 'react';
import { 
  Users, 
  PieChart, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  Building2, 
  ArrowRight,
  TrendingUp,
  Info,
  Lock
} from 'lucide-react';
import { District } from '../types';
import { DISTRICTS_REGISTRY } from '../data/districts';

interface DemographicsViewProps {
  districts: District[];
  onNavigateToRecommendations?: () => void;
}

export const DemographicsView: React.FC<DemographicsViewProps> = ({
  districts,
  onNavigateToRecommendations
}) => {
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('guntur');

  const selectedDistrict = districts.find(d => d.id.toLowerCase() === selectedDistrictId.toLowerCase()) || districts[0];

  // Aggregated Demographics Data
  const ruralPct = 68;
  const urbanPct = 32;

  const ageBreakdown = [
    { range: '0 - 14 years (Children)', pct: 26, color: 'bg-blue-800' },
    { range: '15 - 59 years (Working Age)', pct: 62, color: 'bg-slate-800' },
    { range: '60+ years (Elderly Citizens)', pct: 12, color: 'bg-amber-800' }
  ];

  const vulnerabilityIndicators = [
    { label: 'High Rain-Shadow & Drought Risk', status: 'CRITICAL', note: '74% reliance on rainfed agriculture in western mandals.' },
    { label: 'BPL Household Density', status: 'HIGH', note: '58% households below poverty threshold.' },
    { label: 'Piped Water Connection Deficit', status: 'CRITICAL', note: '42% households walk >2 km for potable water.' },
    { label: 'Healthcare Transit Disparity', status: 'HIGH', note: 'Average distance to primary emergency hospital is 22.5 km.' }
  ];

  const issuePopulationImpact = [
    { issue: 'Drinking Water Supply Outage', affectedCount: 184200, category: 'Water', equityScore: 'Vulnerable Rural Clusters' },
    { issue: 'Primary Health Staff Absence', affectedCount: 94000, category: 'Health', equityScore: 'Low-Income Women & Children' },
    { issue: 'Arterial Hospital Transit Craters', affectedCount: 145000, category: 'Roads', equityScore: 'Commuters & Emergency Transit' },
    { issue: 'Open Sewage Overflow', affectedCount: 62000, category: 'Drainage', equityScore: 'Urban Informal Settlements' }
  ];

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-12">
      {/* Official Header Banner */}
      <div className="bg-slate-900 text-white p-5 border-b-2 border-slate-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-700 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
              DEMOGRAPHICS & EQUITY
            </span>
            <span className="text-slate-400 text-xs font-mono">
              • Census & Vulnerability Profile
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white mt-1 font-sans">
            Demographics & Census Data
          </h1>
          <p className="text-xs text-slate-300 mt-0.5 font-sans max-w-3xl">
            Aggregated demographic breakdown by age distribution, rural/urban split, and equity vulnerability indicators. All estimates operate at the anonymized ward & block level.
          </p>
        </div>

        {onNavigateToRecommendations && (
          <button
            onClick={onNavigateToRecommendations}
            className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium px-4 py-2 transition-colors flex items-center gap-1.5 cursor-pointer border border-blue-600 shrink-0"
          >
            <span>Compare Equity Impact</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Primary Question Banner */}
      <div className="bg-slate-100 border border-slate-300 p-3.5 text-xs text-slate-800 flex items-center justify-between font-mono">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-blue-900">PRIMARY QUESTION:</span>
          <span>"Who is affected by infrastructure deficits, and how are vulnerable demographics impacted?"</span>
        </div>
        <div className="flex items-center space-x-1.5 text-slate-600 text-[11px]">
          <Lock className="w-3.5 h-3.5 text-emerald-700" />
          <span>Strictly Aggregated (Zero PII)</span>
        </div>
      </div>

      {/* District Selector & Core Population Metrics */}
      <div className="bg-white border border-slate-300 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 font-mono">
          <div className="flex items-center space-x-3">
            <span className="text-slate-500 font-bold uppercase text-xs">Target District:</span>
            <select
              value={selectedDistrictId}
              onChange={(e) => setSelectedDistrictId(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-900 font-bold px-3 py-1.5 text-xs focus:outline-none focus:border-blue-700"
            >
              {districts.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.state})</option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-600">
            Total Population: <strong className="text-slate-900 font-mono">{(selectedDistrict.population || 4880000).toLocaleString()}</strong> residents
          </div>
        </div>

        {/* 3 Core Demographic Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          {/* Rural vs Urban */}
          <div className="p-4 bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">
              1. RURAL / URBAN DISTRIBUTION
            </span>
            <div className="space-y-2 font-sans">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Rural Mandals ({ruralPct}%)</span>
                  <span>{(selectedDistrict.population * ruralPct / 100).toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 border border-slate-300">
                  <div className="bg-blue-800 h-full" style={{ width: `${ruralPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Urban Wards ({urbanPct}%)</span>
                  <span>{(selectedDistrict.population * urbanPct / 100).toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 border border-slate-300">
                  <div className="bg-slate-700 h-full" style={{ width: `${urbanPct}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Age Distribution */}
          <div className="p-4 bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">
              2. AGE STRUCTURE BREAKDOWN
            </span>
            <div className="space-y-2">
              {ageBreakdown.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[11px] font-bold text-slate-800 mb-0.5">
                    <span>{item.range}</span>
                    <span>{item.pct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 border border-slate-300">
                    <div className={`${item.color} h-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Poverty & Equity Barometer */}
          <div className="p-4 bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">
              3. POVERTY & EQUITY INDEX
            </span>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-slate-900 font-mono">
                {((selectedDistrict.poverty_index || 0.42) * 100).toFixed(0)}% Vulnerability
              </div>
              <p className="text-[11px] text-slate-600 font-sans leading-relaxed">
                Higher poverty concentration in rainfed rural blocks where basic water and health access scores fall below state averages.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vulnerability Indicators & Affected Population Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
        {/* Left: Vulnerability Indicators */}
        <div className="bg-white border border-slate-300 p-5 shadow-xs space-y-3">
          <div className="border-b border-slate-200 pb-2 font-mono text-xs flex justify-between">
            <span className="font-bold text-slate-900 uppercase">DEMOGRAPHIC VULNERABILITY INDICATORS</span>
            <span className="text-slate-500">4 Risk Factors</span>
          </div>

          <div className="divide-y divide-slate-200">
            {vulnerabilityIndicators.map((ind, idx) => (
              <div key={idx} className="py-2.5 space-y-1">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-slate-900">{ind.label}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold border ${
                    ind.status === 'CRITICAL' ? 'bg-red-50 text-red-800 border-red-300' : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}>
                    {ind.status}
                  </span>
                </div>
                <p className="text-slate-600 text-xs">{ind.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Population Affected by Issues */}
        <div className="bg-white border border-slate-300 p-5 shadow-xs space-y-3 font-mono">
          <div className="border-b border-slate-200 pb-2 text-xs flex justify-between">
            <span className="font-bold text-slate-900 uppercase">POPULATION AFFECTED BY ISSUE CATEGORY</span>
            <span className="text-slate-500">Beneficiary Count</span>
          </div>

          <div className="space-y-3 font-sans">
            {issuePopulationImpact.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 font-mono space-y-1">
                <div className="flex justify-between font-bold text-xs text-slate-900">
                  <span>{item.issue}</span>
                  <span className="text-blue-900">{item.affectedCount.toLocaleString()} residents</span>
                </div>
                <div className="text-[11px] text-slate-600 flex justify-between font-sans">
                  <span>Sector: {item.category}</span>
                  <span className="text-slate-700 font-mono font-bold">Group: {item.equityScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
