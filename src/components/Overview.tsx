import React from 'react';
import { 
  Building2, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Radio, 
  Droplets, 
  Route, 
  HeartPulse, 
  GraduationCap,
  Zap,
  Trees,
  Smartphone,
  Mic,
  FileEdit,
  Clock,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Info
} from 'lucide-react';
import { District, CitizenRequest, InfrastructureCategory } from '../types';
import { NavTab } from './Sidebar';

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
  onSelectCategoryForReporting,
  onStartVoiceSubmission,
  onStartWriteSubmission,
}) => {
  // Service category definitions
  const serviceCategories = [
    {
      id: 'Roads' as InfrastructureCategory,
      title: 'Roads & Transport',
      icon: Route,
      desc: 'Potholes, streetlights, road damage, traffic signals, pedestrian pathways',
      badge: '14 Active Reports',
      color: 'border-amber-700/30 bg-amber-50/40 text-amber-900',
      iconBg: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'Water' as InfrastructureCategory,
      title: 'Water & Sanitation',
      icon: Droplets,
      desc: 'Pipe leaks, zero water supply, sewage overflow, contaminated water, drainage',
      badge: '18 Active Reports',
      color: 'border-blue-700/30 bg-blue-50/40 text-blue-900',
      iconBg: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'Health' as InfrastructureCategory,
      title: 'Healthcare & Clinics',
      icon: HeartPulse,
      desc: 'Primary health center supplies, doctor shortage, ambulance access, hygiene',
      badge: '9 Active Reports',
      color: 'border-emerald-700/30 bg-emerald-50/40 text-emerald-900',
      iconBg: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'Education' as InfrastructureCategory,
      title: 'Education & Schools',
      icon: GraduationCap,
      desc: 'School building maintenance, toilet facilities, drinking water, classroom roof',
      badge: '7 Active Reports',
      color: 'border-purple-700/30 bg-purple-50/40 text-purple-900',
      iconBg: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'Electricity' as InfrastructureCategory,
      title: 'Energy & Power',
      icon: Zap,
      desc: 'Transformer failures, dangerous wiring, power cuts, streetlighting grid',
      badge: '12 Active Reports',
      color: 'border-yellow-700/30 bg-yellow-50/40 text-yellow-900',
      iconBg: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 'Sanitation' as InfrastructureCategory,
      title: 'Public Facilities',
      icon: Building2,
      desc: 'Waste collection bins, public restrooms, community halls, bus shelters',
      badge: '11 Active Reports',
      color: 'border-stone-700/30 bg-stone-50/40 text-stone-900',
      iconBg: 'bg-stone-200 text-stone-800'
    },
    {
      id: 'Drainage' as InfrastructureCategory,
      title: 'Environment & Greenery',
      icon: Trees,
      desc: 'Waterlogging, open dumping, fallen trees, park maintenance, air/water pollution',
      badge: '6 Active Reports',
      color: 'border-green-700/30 bg-green-50/40 text-green-900',
      iconBg: 'bg-green-100 text-green-800'
    },
    {
      id: 'Water' as InfrastructureCategory,
      title: 'Digital Public Services',
      icon: Smartphone,
      desc: 'Certificate assistance, digital scheme connectivity, grievance tracking help',
      badge: 'DPG Active',
      color: 'border-orange-700/30 bg-orange-50/40 text-orange-900',
      iconBg: 'bg-orange-100 text-orange-800'
    }
  ];

  // Sample recent requests for citizen status pipeline
  const recentRequests = requests.slice(0, 3);

  const handleCategoryClick = (category: InfrastructureCategory) => {
    if (onSelectCategoryForReporting) {
      onSelectCategoryForReporting(category);
    }
    onNavigate('submit');
  };

  return (
    <div className="space-y-12 font-sans text-[#171717] pb-16 max-w-6xl mx-auto">
      
      {/* 1. HERO SECTION */}
      <section className="bg-white border-2 border-[#171717] p-8 sm:p-12 shadow-[6px_6px_0px_#171717] relative overflow-hidden">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#D65A3A]/10 border border-[#D65A3A]/30 text-[#D65A3A] font-mono text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#D65A3A]" />
            <span>Official Government Public Service Portal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-[#171717] leading-tight">
            Tell us what your community needs.
          </h1>

          <p className="text-base sm:text-lg text-[#171717]/80 font-sans leading-relaxed">
            Report local infrastructure issues in your native dialect (Telugu, Hindi, Tamil, Kannada, English). AI automatically categorizes and routes your voice note or text to government authorities for priority resolution.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <button
              onClick={() => {
                if (onStartVoiceSubmission) {
                  onStartVoiceSubmission();
                } else {
                  onNavigate('submit');
                }
              }}
              className="px-6 py-4 bg-[#D65A3A] hover:bg-[#c34e2f] text-white font-bold text-sm tracking-wide transition-all shadow-[4px_4px_0px_#171717] border-2 border-[#171717] flex items-center justify-center gap-3 cursor-pointer"
            >
              <Mic className="w-5 h-5 text-amber-200" />
              <span>🎙 Speak an Issue</span>
            </button>

            <button
              onClick={() => {
                if (onStartWriteSubmission) {
                  onStartWriteSubmission();
                } else {
                  onNavigate('submit');
                }
              }}
              className="px-6 py-4 bg-white hover:bg-slate-50 text-[#171717] font-bold text-sm tracking-wide transition-all shadow-[4px_4px_0px_#171717] border-2 border-[#171717] flex items-center justify-center gap-3 cursor-pointer"
            >
              <FileEdit className="w-5 h-5 text-[#285943]" />
              <span>✎ Write an Issue</span>
            </button>
          </div>

          {/* India Coverage Metric Strip */}
          <div className="pt-4 border-t border-[#171717]/15 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-[#D65A3A]">🇮🇳 BUILT FOR INDIA:</span>
              <span className="text-[#171717] font-semibold">28 States · 8 UTs · 22 Scheduled Languages</span>
            </div>
            <div className="flex items-center space-x-2 bg-[#F7F5EF] px-3 py-1 border border-[#171717]/30 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span className="font-bold text-[#285943]">8 Active AI Prototype Languages Enabled</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SERVICE / REQUEST CATEGORIES */}
      <section className="space-y-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#D65A3A] uppercase tracking-wider mb-1">
            <span>SERVICE DIRECTORY</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#171717]">
            What would you like to improve?
          </h2>
          <p className="text-sm text-[#171717]/70 mt-1">
            Select a category to launch a 2-minute request submission flow.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {serviceCategories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <div
                key={cat.title}
                onClick={() => handleCategoryClick(cat.id)}
                className="bg-white border border-[#171717]/20 p-5 hover:border-[#171717] hover:shadow-[4px_4px_0px_#171717] transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded border border-[#171717]/20 flex items-center justify-center ${cat.iconBg}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200">
                      {cat.badge}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-[#171717] group-hover:text-[#D65A3A] transition-colors">
                    {cat.title}
                  </h3>

                  <p className="text-xs text-[#171717]/70 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                <div className="pt-2 flex items-center text-xs font-bold text-[#D65A3A] space-x-1 group-hover:translate-x-1 transition-transform">
                  <span>Report issue</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. EXPLORE YOUR AREA (LOCALITY ACTIVITY) */}
      <section className="bg-white border border-[#171717]/20 p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#171717]/10 pb-5">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#285943] uppercase tracking-wider mb-1">
              <MapPin className="w-4 h-4 text-[#285943]" />
              <span>LOCALITY INTELLIGENCE • ANDHRA PRADESH</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#171717]">
              Community Activity in Your Area
            </h2>
            <p className="text-sm text-[#171717]/70 mt-0.5">
              Real-time civic status across Krishna, Guntur, Visakhapatnam, and Anantapur districts.
            </p>
          </div>

          <button
            onClick={() => onNavigate('map')}
            className="px-5 py-2.5 bg-[#171717] hover:bg-[#D65A3A] text-white font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer border border-[#171717] shadow-[2px_2px_0px_#171717] flex items-center gap-2 shrink-0"
          >
            <MapPin className="w-4 h-4 text-amber-300" />
            <span>Explore Map View</span>
          </button>
        </div>

        {/* Local Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#F7F5EF] border border-[#171717]/20 flex items-center space-x-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center font-bold text-lg">
              📍
            </div>
            <div>
              <span className="text-2xl font-serif font-bold text-[#171717]">12 Active</span>
              <p className="text-xs text-[#171717]/70 font-medium">Ingested citizen reports in review</p>
            </div>
          </div>

          <div className="p-4 bg-[#F7F5EF] border border-[#171717]/20 flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-800 border border-blue-300 flex items-center justify-center font-bold text-lg">
              ⚡
            </div>
            <div>
              <span className="text-2xl font-serif font-bold text-[#171717]">4 Projects</span>
              <p className="text-xs text-[#171717]/70 font-medium">Government works underway</p>
            </div>
          </div>

          <div className="p-4 bg-[#F7F5EF] border border-[#171717]/20 flex items-center space-x-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center font-bold text-lg">
              ✓
            </div>
            <div>
              <span className="text-2xl font-serif font-bold text-[#171717]">8 Resolved</span>
              <p className="text-xs text-[#171717]/70 font-medium">Public infrastructure works completed</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MY REQUESTS STATUS PIPELINE PREVIEW */}
      <section className="bg-white border border-[#171717]/20 p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#171717]/10 pb-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#171717]">
              Track Your Requests
            </h2>
            <p className="text-xs text-[#171717]/70 mt-0.5">
              Transparent, end-to-end lifecycle tracking for submitted citizen requests.
            </p>
          </div>

          <button
            onClick={() => onNavigate('signals')}
            className="text-xs font-bold text-[#D65A3A] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Requests</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline Status System */}
        <div className="space-y-4">
          {recentRequests.map((req) => (
            <div key={req.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2 font-mono text-xs">
                  <span className="px-2 py-0.5 bg-[#D65A3A] text-white font-bold">
                    {req.id}
                  </span>
                  <span className="font-semibold text-slate-800 font-sans">
                    {req.category} Infrastructure
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-sans">
                    {req.location}
                  </span>
                </div>

                <span className="text-[11px] font-mono text-slate-500">
                  Logged: {new Date(req.timestamp).toLocaleDateString()}
                </span>
              </div>

              <p className="text-xs text-slate-700 italic">
                "{req.summary_en}"
              </p>

              {/* Lifecycle Progress Bar */}
              <div className="pt-2">
                <div className="grid grid-cols-5 text-[10px] font-mono text-center font-bold gap-1 mb-1.5">
                  <span className="text-emerald-700">1. Submitted ✓</span>
                  <span className="text-emerald-700">2. In Review ✓</span>
                  <span className="text-blue-700 font-extrabold">3. Prioritized</span>
                  <span className="text-slate-400 font-normal">4. Action Plan</span>
                  <span className="text-slate-400 font-normal">5. Resolved</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-600 h-full w-[20%]"></div>
                  <div className="bg-emerald-600 h-full w-[20%]"></div>
                  <div className="bg-blue-600 h-full w-[20%] animate-pulse"></div>
                  <div className="bg-slate-200 h-full w-[40%]"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. GOVERNMENT DASHBOARD GATEWAY */}
      <section className="bg-[#171717] text-[#F7F5EF] p-8 border-2 border-[#171717] shadow-[6px_6px_0px_#D65A3A] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-block px-2.5 py-0.5 bg-[#D65A3A] text-white font-mono text-[10px] font-bold tracking-widest uppercase">
            DISTRICT OFFICERS & POLICYMAKERS
          </div>
          <h3 className="font-serif font-bold text-2xl text-white">
            Government Dashboard & Priority Engine
          </h3>
          <p className="text-xs text-[#F7F5EF]/80 leading-relaxed font-sans">
            Access the deterministic 0–100 priority scoring matrix, demographic vulnerability layers, Gemini intervention generator, and capital expenditure action queue.
          </p>
        </div>

        <button
          onClick={() => onNavigate('recommendations')}
          className="px-6 py-3.5 bg-[#D65A3A] hover:bg-[#c34e2f] text-white font-bold text-xs tracking-wider uppercase transition-colors shadow-[2px_2px_0px_#F7F5EF] border border-white/20 flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>Launch Officer Dashboard</span>
        </button>
      </section>

    </div>
  );
};
