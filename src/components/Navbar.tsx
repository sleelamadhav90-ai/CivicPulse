import React from 'react';
import { 
  Building2, 
  Radio, 
  MapPin, 
  FileText, 
  TrendingUp, 
  RotateCcw, 
  Info,
  ShieldCheck,
  Globe2
} from 'lucide-react';
import { District, CitizenRequest } from '../types';

interface NavbarProps {
  activeTab: 'ingestion' | 'hotspots' | 'policylab' | 'impact';
  setActiveTab: (tab: 'ingestion' | 'hotspots' | 'policylab' | 'impact') => void;
  districts: District[];
  requests: CitizenRequest[];
  onResetData: () => void;
  onOpenMethodology: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  districts,
  requests,
  onResetData,
  onOpenMethodology,
}) => {
  // Aggregate KPI stats
  const totalSignals = requests.length;
  const criticalHotspots = districts.filter(d => d.water_access < 45 || d.health_access < 45 || d.road_quality < 45).length;
  const totalBeneficiaries = districts.reduce((acc, d) => acc + d.population, 0);

  return (
    <header className="sticky top-0 z-40 bg-[#0c0d10]/95 backdrop-blur-md border-b border-slate-800/50">
      {/* Top Banner & Title Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Brand */}
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-500 border border-slate-600 flex items-center justify-center shadow-sm">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <span className="text-lg font-light tracking-[0.3em] text-white">
                  CIVICPULSE
                </span>
                <span className="px-2 py-0.5 text-[9px] font-medium tracking-widest uppercase rounded bg-white/5 text-slate-300 border border-white/10">
                  DPI Core
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                  Live Telemetry
                </span>
              </div>
              <p className="text-[11px] text-slate-500 tracking-tight hidden sm:block">
                National Development Intelligence & Deterministic Gap Engine
              </p>
            </div>
          </div>

          {/* Aggregate Telemetry Strip */}
          <div className="hidden lg:flex items-center space-x-6 bg-[#111318] px-5 py-2 rounded-lg border border-slate-800">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500">Demand Signals</span>
              <span className="text-xs font-light text-white font-mono flex items-center mt-0.5">
                <Radio className="w-3 h-3 text-slate-400 mr-1" />
                {totalSignals.toLocaleString()}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-800"></div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500">Deficit Hotspots</span>
              <span className="text-xs font-light text-rose-400 font-mono mt-0.5">
                {criticalHotspots} Districts
              </span>
            </div>
            <div className="h-6 w-px bg-slate-800"></div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500">Population Reach</span>
              <span className="text-xs font-light text-slate-200 font-mono mt-0.5">
                {(totalBeneficiaries / 1000000).toFixed(1)}M Citizens
              </span>
            </div>
          </div>

          {/* Utility Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenMethodology}
              className="inline-flex items-center px-3 py-1.5 text-[10px] uppercase tracking-wider font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors cursor-pointer"
              title="View Scoring Methodology & Transparency"
            >
              <Info className="w-3 h-3 mr-1 text-slate-400" />
              <span>Formula Audit</span>
            </button>
            <button
              onClick={onResetData}
              className="inline-flex items-center px-2.5 py-1.5 text-[10px] uppercase tracking-wider font-medium text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/5 border border-slate-800 rounded transition-colors cursor-pointer"
              title="Reset Signal Stream"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              <span className="hidden md:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-[#0c0d10] border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-6 overflow-x-auto py-2.5 no-scrollbar" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('ingestion')}
              className={`flex items-center pb-1 text-xs uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'ingestion'
                  ? 'text-white border-b-2 border-white font-medium'
                  : 'text-slate-500 hover:text-slate-300 border-b-2 border-transparent'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 mr-2 ${activeTab === 'ingestion' ? 'text-white' : 'text-slate-500'}`} />
              <span>1. Citizen Ingestion</span>
              <span className="ml-2 px-1.5 py-0.2 bg-white/5 text-slate-400 text-[9px] uppercase tracking-tighter rounded hidden sm:inline-block font-mono">
                Multilingual
              </span>
            </button>

            <button
              onClick={() => setActiveTab('hotspots')}
              className={`flex items-center pb-1 text-xs uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'hotspots'
                  ? 'text-white border-b-2 border-white font-medium'
                  : 'text-slate-500 hover:text-slate-300 border-b-2 border-transparent'
              }`}
            >
              <MapPin className={`w-3.5 h-3.5 mr-2 ${activeTab === 'hotspots' ? 'text-white' : 'text-slate-500'}`} />
              <span>2. Hotspots & Gap Map</span>
              <span className="ml-2 px-1.5 py-0.2 bg-white/5 text-slate-400 text-[9px] uppercase tracking-tighter rounded hidden sm:inline-block font-mono">
                GIS Fusion
              </span>
            </button>

            <button
              onClick={() => setActiveTab('policylab')}
              className={`flex items-center pb-1 text-xs uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'policylab'
                  ? 'text-white border-b-2 border-white font-medium'
                  : 'text-slate-500 hover:text-slate-300 border-b-2 border-transparent'
              }`}
            >
              <FileText className={`w-3.5 h-3.5 mr-2 ${activeTab === 'policylab' ? 'text-white' : 'text-slate-500'}`} />
              <span>3. AI Policy Lab</span>
              <span className="ml-2 px-1.5 py-0.2 bg-white/5 text-slate-400 text-[9px] uppercase tracking-tighter rounded hidden sm:inline-block font-mono">
                Executive Memo
              </span>
            </button>

            <button
              onClick={() => setActiveTab('impact')}
              className={`flex items-center pb-1 text-xs uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'impact'
                  ? 'text-white border-b-2 border-white font-medium'
                  : 'text-slate-500 hover:text-slate-300 border-b-2 border-transparent'
              }`}
            >
              <TrendingUp className={`w-3.5 h-3.5 mr-2 ${activeTab === 'impact' ? 'text-white' : 'text-slate-500'}`} />
              <span>4. Impact Simulator</span>
              <span className="ml-2 px-1.5 py-0.2 bg-white/5 text-slate-400 text-[9px] uppercase tracking-tighter rounded hidden sm:inline-block font-mono">
                DPI Loop
              </span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
