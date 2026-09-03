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
  GraduationCap,
  ShieldCheck,
  Cpu,
  Award,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Layers,
  FileText,
  CheckSquare
} from 'lucide-react';
import { District, CitizenRequest, RecommendedProject } from '../types';
import { calculatePriorityScore, getPriorityTier, getAIRecommendedProjects } from '../utils/scoring';
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
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>('rec-01');

  // AI Recommended Projects generated from Priority Engine
  const recommendedProjects = getAIRecommendedProjects(districts, requests);

  // Ranked Priority Districts
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
    };
  }).sort((a, b) => b.maxScore - a.maxScore);

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-12">
      {/* Official Government Header */}
      <div className="bg-slate-900 text-white p-6 border-b-2 border-slate-700 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 font-mono">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="bg-blue-700 text-white text-[10px] font-bold px-2 py-0.5 tracking-wider uppercase">
              EXECUTIVE COMMAND CENTRE
            </span>
            <span className="text-slate-400 text-xs">
              • Unified Public Decision Matrix
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans mt-1">
            Intervention Priority Matrix
          </h1>
          <p className="text-xs text-slate-300 font-sans max-w-3xl leading-relaxed">
            Synthesizes 2,841 citizen voice signals, JJM piped water infrastructure deficits, and government expenditure logs to answer: <strong>Where should the government intervene, and why?</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs shrink-0">
          <button
            onClick={() => onNavigate('recommendations')}
            className="bg-blue-700 hover:bg-blue-800 text-white font-medium px-4 py-2.5 transition-colors flex items-center gap-2 cursor-pointer border border-blue-600 shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Priority Recommendations</span>
          </button>
          <button
            onClick={() => onNavigate('investment')}
            className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-4 py-2.5 transition-colors flex items-center gap-2 cursor-pointer border border-slate-700"
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Investment Audit</span>
          </button>
        </div>
      </div>

      {/* Primary Question Banner */}
      <div className="bg-slate-100 border border-slate-300 p-4 text-xs text-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-blue-900 bg-blue-100 px-2 py-0.5 border border-blue-300">CORE DIRECTIVE:</span>
          <span className="font-bold text-slate-900">"Where should the government intervene, and why?"</span>
        </div>
        <span className="text-[11px] text-slate-600 font-bold">
          4 Priority Regions Flagged for Immediate Allocation
        </span>
      </div>

      {/* Top Section: Priority Regions & Critical Issues Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Priority Regions List */}
        <div className="lg:col-span-7 bg-white border border-slate-300 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 font-mono text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">SECTION 1</span>
              <h2 className="text-sm font-bold text-slate-900 uppercase font-sans">
                Priority Intervention Regions
              </h2>
            </div>
            <button
              onClick={() => onNavigate('demographics')}
              className="text-blue-700 hover:text-blue-900 font-bold text-[11px] uppercase hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>View Census Data</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-200">
            {rankedDistricts.slice(0, 4).map((dist) => (
              <div 
                key={dist.id} 
                onClick={() => {
                  onSelectDistrictForPolicy(dist.id, dist.topCategory);
                  onNavigate('recommendations');
                }}
                className="py-3 hover:bg-slate-50 transition-colors cursor-pointer space-y-2 font-sans"
              >
                <div className="flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{dist.name}</span>
                    <span className="text-slate-500 text-[11px]">({dist.state})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-500">Priority Score:</span>
                    <span className={`px-2 py-0.5 font-bold border ${
                      dist.maxScore >= 80 ? 'bg-red-50 text-red-800 border-red-300' : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}>
                      {dist.maxScore} / 100
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono text-[11px] bg-slate-50 p-2 border border-slate-200">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Primary Sector Deficit</span>
                    <span className="font-bold text-slate-900">{dist.topCategory} Access Deficit</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Citizen Signal Volume</span>
                    <span className="font-bold text-blue-900">4,820 reports</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Unspent Budget</span>
                    <span className="font-bold text-amber-800">₹11.2 Cr unspent</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-normal">
                  <strong>Why intervene:</strong> High population density combined with 3-day water supply outage and unspent JJM budget creating severe public health risk.
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (5 cols): Investment-Performance Warnings & Signal Changes */}
        <div className="lg:col-span-5 space-y-6">
          {/* Investment-Performance Warnings */}
          <div className="bg-white border border-slate-300 p-5 shadow-xs space-y-3 font-mono text-xs">
            <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-red-700 uppercase font-bold block">AUDIT WARNINGS</span>
                <h3 className="text-xs font-bold text-slate-900 font-sans uppercase">
                  Investment & Outcome Mismatch Flags
                </h3>
              </div>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>

            <div className="space-y-2.5 font-sans">
              <div className="p-3 bg-red-50/50 border border-red-200 space-y-1 font-mono">
                <div className="flex justify-between font-bold text-red-900 text-[11px]">
                  <span>Guntur Rural Water Scheme</span>
                  <span>₹39 Cr Spent</span>
                </div>
                <p className="text-[11px] text-slate-700 font-sans">
                  <strong>Warning:</strong> 78% budget spent, but citizen complaints rose 42% due to pipeline pump breakdown.
                </p>
              </div>

              <div className="p-3 bg-amber-50/50 border border-amber-200 space-y-1 font-mono">
                <div className="flex justify-between font-bold text-amber-900 text-[11px]">
                  <span>Mylavaram PHC Sub-Centre</span>
                  <span>₹12 Cr Released</span>
                </div>
                <p className="text-[11px] text-slate-700 font-sans">
                  <strong>Warning:</strong> Facility fully funded but doctor absent 4 days/wk causing 30 km hospital detours.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('investment')}
              className="w-full text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold uppercase text-[11px] border border-slate-300 cursor-pointer"
            >
              Inspect 4-Quadrant Investment Matrix →
            </button>
          </div>

          {/* Recent Citizen Signal Changes */}
          <div className="bg-white border border-slate-300 p-5 shadow-xs space-y-3 font-mono text-xs">
            <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-blue-900 uppercase font-bold block">SIGNAL TRENDS</span>
                <h3 className="text-xs font-bold text-slate-900 font-sans uppercase">
                  Recent Citizen Signal Changes
                </h3>
              </div>
              <Radio className="w-4 h-4 text-blue-700" />
            </div>

            <div className="space-y-2 font-sans text-xs">
              <div className="flex justify-between p-2 bg-slate-50 border border-slate-200">
                <span>Drinking Water Outages</span>
                <strong className="text-red-700 font-mono">+42% velocity</strong>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 border border-slate-200">
                <span>Post-Monsoon Road Potholes</span>
                <strong className="text-amber-700 font-mono">+31% velocity</strong>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 border border-slate-200">
                <span>Primary School Roof Leaks</span>
                <strong className="text-slate-700 font-mono">+12% velocity</strong>
              </div>
            </div>

            <button
              onClick={() => onNavigate('signals')}
              className="w-full text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold uppercase text-[11px] border border-slate-300 cursor-pointer"
            >
              Open Raw Signal Ingestion Stream →
            </button>
          </div>
        </div>

      </div>

      {/* Priority Recommendations Feature Section */}
      <div className="bg-white border border-slate-300 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 font-mono text-xs">
          <div>
            <span className="text-[10px] text-blue-900 uppercase font-bold block">AI DECISION SUPPORT ENGINE</span>
            <h2 className="text-base font-bold text-slate-900 uppercase font-sans">
              Recommended Government Actions
            </h2>
          </div>

          <button
            onClick={() => onNavigate('recommendations')}
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-3.5 py-1.5 transition-colors cursor-pointer border border-blue-600"
          >
            Explore All Action Briefs →
          </button>
        </div>

        <div className="space-y-3 font-sans">
          {recommendedProjects.slice(0, 3).map((project) => (
            <div key={project.id} className="p-4 bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2 font-mono text-xs">
                <div className="flex items-center space-x-2">
                  <span className="bg-slate-900 text-white px-2 py-0.5 text-[10px] font-bold uppercase">
                    {project.category}
                  </span>
                  <span className="font-bold text-slate-900">{project.districtName}, {project.state}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-slate-500 text-[11px]">Priority:</span>
                  <span className="font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5">
                    {project.priorityScore} / 100
                  </span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-900">
                {project.title}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 bg-white border border-slate-200 space-y-1">
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Why this recommendation?</span>
                  <p className="font-sans text-slate-800 text-[11px] leading-relaxed">
                    {project.keyBulletPoints[0] || 'High population deficit paired with severe citizen complaint velocity.'}
                  </p>
                </div>

                <div className="p-2.5 bg-white border border-slate-200 space-y-1">
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Why now?</span>
                  <p className="font-sans text-slate-800 text-[11px] leading-relaxed">
                    Unspent scheme capital exists in the sector; immediate action prevents public health escalation.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end font-mono text-xs gap-2">
                <button
                  onClick={() => onNavigate('recommendations')}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-3 py-1 text-[11px] border border-blue-600 cursor-pointer"
                >
                  View Full Evidence & Export Brief
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


