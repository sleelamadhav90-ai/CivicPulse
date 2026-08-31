import React, { useState, useMemo } from 'react';
import { 
  Bell,
  Search,
  User,
  Settings,
  MoreVertical,
  Activity,
  BarChart2,
  PieChart,
  TrendingUp,
  MapPin,
  Download
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { District, CitizenRequest, InfrastructureCategory, ScoreBreakdown } from '../types';
import { calculatePriorityScore, getCategoryAccess, getPriorityTier } from '../utils/scoring';
import { getCityDemandHotspot } from '../utils/demandAggregation';
import { IndiaMapCanvas, EvaluatedDistrict } from './IndiaMapCanvas';

interface HotspotMapProps {
  districts: District[];
  requests: CitizenRequest[];
  onSelectHotspotForPolicy: (district: District, category: InfrastructureCategory) => void;
  onOpenScoreModal: (breakdown: ScoreBreakdown, district: District, category: InfrastructureCategory) => void;
}

const DASHBOARD_BG = '#151b23';
const PANEL_BG = '#1e2430';
const ACCENT_BLUE = '#0284c7';
const ACCENT_TEAL = '#0d9488';
const ACCENT_GREEN = '#10b981';
const TEXT_MUTED = '#94a3b8';
const TEXT_LIGHT = '#f1f5f9';

// Mock Data for the Real Time Infrastructure Area Chart
const realTimeData = [
  { time: '0:00', Sensors: 150, Citizen: 100, AI: 200, Officers: 50 },
  { time: '3:00', Sensors: 200, Citizen: 150, AI: 250, Officers: 80 },
  { time: '6:00', Sensors: 400, Citizen: 350, AI: 450, Officers: 200 },
  { time: '9:00', Sensors: 800, Citizen: 700, AI: 850, Officers: 500 },
  { time: '12:00', Sensors: 1200, Citizen: 1000, AI: 1100, Officers: 800 },
  { time: '15:00', Sensors: 900, Citizen: 850, AI: 950, Officers: 700 },
  { time: '18:00', Sensors: 600, Citizen: 550, AI: 650, Officers: 400 },
  { time: '21:00', Sensors: 300, Citizen: 250, AI: 350, Officers: 150 },
  { time: '24:00', Sensors: 200, Citizen: 100, AI: 250, Officers: 80 },
];

// Mock Data for Budget Allocation Pie Chart
const budgetData = [
  { name: 'Water & Sanitation', value: 35, color: '#3b82f6' },
  { name: 'Roads & Transit', value: 25, color: '#0ea5e9' },
  { name: 'Power Grid', value: 20, color: '#06b6d4' },
  { name: 'Healthcare', value: 15, color: '#14b8a6' },
  { name: 'Education', value: 5, color: '#10b981' },
];

export const HotspotMap: React.FC<HotspotMapProps> = ({
  districts,
  requests,
  onSelectHotspotForPolicy,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<InfrastructureCategory | 'All'>('All');
  const [activeDistrictId, setActiveDistrictId] = useState<string>(districts[0]?.id || 'vijayawada');

  // Compute stats, scores and demand aggregations for each district
  const districtEvaluations: EvaluatedDistrict[] = useMemo(() => {
    return districts.map((district) => {
      const targetCategory: InfrastructureCategory = selectedCategory === 'All' ? 'Drainage' : selectedCategory;
      const matchedRequests = requests.filter(
        (r) => r.location.toLowerCase() === district.name.toLowerCase() &&
               (selectedCategory === 'All' || r.category === selectedCategory)
      );
      const demandCount = matchedRequests.length;
      const currentAccess = getCategoryAccess(district, targetCategory);
      const breakdown = calculatePriorityScore(district, targetCategory, 8, demandCount);
      const demandHotspot = getCityDemandHotspot(district, requests);

      return {
        district,
        category: targetCategory,
        demandCount,
        currentAccess,
        breakdown,
        matchedRequests,
        demandHotspot,
        priorityTier: getPriorityTier(breakdown.total_score),
      };
    });
  }, [districts, requests, selectedCategory]);

  return (
    <div 
      className="rounded-2xl border border-slate-700/60 overflow-hidden text-slate-200 shadow-2xl"
      style={{ backgroundColor: DASHBOARD_BG, fontFamily: 'system-ui, sans-serif' }}
    >
      {/* 1. Header Bar */}
      <div 
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
          Infrastructure Data Analytics
        </h2>
        <div className="flex items-center gap-4 text-slate-400">
          <button className="hover:text-white transition-colors cursor-pointer"><Search className="w-4 h-4" /></button>
          <div className="relative">
            <button className="hover:text-white transition-colors cursor-pointer"><Bell className="w-4 h-4" /></button>
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <button className="hover:text-white transition-colors cursor-pointer"><User className="w-4 h-4" /></button>
        </div>
      </div>

      {/* 2. Main Dashboard Grid Layout */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column */}
        <div className="lg:col-span-3 space-y-5">
          {/* Priority Matrix */}
          <div className="rounded-xl p-4 shadow-lg flex flex-col h-[280px]" style={{ backgroundColor: PANEL_BG }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-white">Priority Matrix</h3>
              <MoreVertical className="w-4 h-4 text-slate-500 cursor-pointer hover:text-white" />
            </div>
            
            <div className="flex-1 grid grid-cols-6 grid-rows-5 gap-1.5 opacity-90">
              {Array.from({ length: 30 }).map((_, i) => {
                const x = i % 6;
                const y = Math.floor(i / 6);
                let bg = '#1e293b'; // default slate
                if (y === 0 && x < 2) bg = '#e11d48'; // red
                else if (y === 0 && x < 4) bg = '#ea580c'; // orange
                else if (y < 2 && x < 2) bg = '#ea580c'; // orange
                else if (x > 3 && y > 2) bg = '#2563eb'; // blue
                else if (x > 2 && y > 1) bg = '#0284c7'; // light blue
                else bg = '#10b981'; // green

                return (
                  <div 
                    key={i} 
                    className="rounded text-[8px] flex items-center justify-center font-mono opacity-80 hover:opacity-100 cursor-pointer transition-opacity"
                    style={{ backgroundColor: bg }}
                  >
                    {Math.floor(Math.random() * 20)}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] mt-2 font-mono" style={{ color: TEXT_MUTED }}>
              <span>Low Urgency</span>
              <span>High Deficit</span>
            </div>
          </div>

          {/* Low Priority Issues Bar Chart */}
          <div className="rounded-xl p-4 shadow-lg flex flex-col h-[260px]" style={{ backgroundColor: PANEL_BG }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-white">Project Deficits</h3>
              <select className="bg-transparent border-none text-[10px] text-slate-400 outline-none cursor-pointer">
                <option>Monthly</option>
              </select>
            </div>
            <div className="flex-1 min-h-0 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetData.slice().reverse()} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke={TEXT_MUTED} fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke={TEXT_MUTED} fontSize={9} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '11px' }} />
                  <Bar dataKey="value" fill="#10b981" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Center Column: The Map */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="rounded-xl p-4 shadow-lg flex-1 flex flex-col relative" style={{ backgroundColor: PANEL_BG }}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-white">Live Operations Grid</h3>
              <div className="flex items-center gap-2 text-[10px] bg-slate-800/80 px-2 py-1 rounded">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-400 font-mono">LIVE SYNC</span>
              </div>
            </div>
            {/* The IndiaMapCanvas Component replaces the center */}
            <div className="flex-1 w-full rounded-lg overflow-hidden border border-slate-700/50">
               <IndiaMapCanvas
                  evaluations={districtEvaluations}
                  activeDistrictId={activeDistrictId}
                  onSelectDistrict={(id) => setActiveDistrictId(id)}
                  selectedCategory={selectedCategory}
                  onSelectHotspotForPolicy={onSelectHotspotForPolicy}
               />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-3 space-y-5">
          {/* Budget Allocation Pie */}
          <div className="rounded-xl p-4 shadow-lg flex flex-col h-[280px]" style={{ backgroundColor: PANEL_BG }}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-white">Budget Allocation</h3>
              <MoreVertical className="w-4 h-4 text-slate-500 cursor-pointer hover:text-white" />
            </div>
            <div className="flex-1 min-h-0 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={budgetData}
                    cx="50%"
                    cy="45%"
                    innerRadius="65%"
                    outerRadius="85%"
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {budgetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </RechartsPie>
              </ResponsiveContainer>
              {/* Inner Label for Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4">
                <span className="text-2xl font-bold text-white">290%</span>
                <span className="text-[9px] uppercase tracking-widest" style={{ color: TEXT_MUTED }}>Growth</span>
              </div>
            </div>
            
            {/* Custom Legend */}
            <div className="grid grid-cols-2 gap-y-2 gap-x-2 text-[10px] font-semibold text-slate-300 mt-2">
              {budgetData.slice(0, 4).map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Public Transport Needs Bar Chart */}
          <div className="rounded-xl p-4 shadow-lg flex flex-col h-[260px]" style={{ backgroundColor: PANEL_BG }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-white">Public Transport</h3>
              <MoreVertical className="w-4 h-4 text-slate-500 cursor-pointer hover:text-white" />
            </div>
            <div className="flex-1 min-h-0 w-full flex flex-col justify-between">
              {[
                { label: 'Bus Routes', val: 76, color: '#3b82f6' },
                { label: 'Metro Ext', val: 45, color: '#0ea5e9' },
                { label: 'Bike Lanes', val: 65, color: '#10b981' },
                { label: 'Footpaths', val: 32, color: '#8b5cf6' },
                { label: 'EV Stations', val: 54, color: '#f59e0b' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-slate-400 w-6 text-right">{item.val}</span>
                  <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ width: `${item.val}%`, backgroundColor: item.color }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Area Chart */}
      <div className="px-5 pb-5">
        <div className="rounded-xl p-4 shadow-lg" style={{ backgroundColor: PANEL_BG }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-white">Real Time Infrastructure Telemetry</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Sensors
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="w-2 h-2 rounded-full bg-teal-500" /> Citizen
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> AI
              </div>
            </div>
          </div>
          
          <div className="w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={realTimeData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSensors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCitizen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke={TEXT_MUTED} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={TEXT_MUTED} fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '11px' }} 
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="Sensors" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSensors)" />
                <Area type="monotone" dataKey="Citizen" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorCitizen)" />
                <Area type="monotone" dataKey="AI" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAI)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
