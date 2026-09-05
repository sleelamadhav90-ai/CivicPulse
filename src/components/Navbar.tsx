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
import { useLanguage } from '../context/LanguageContext';

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
  const { t } = useLanguage();

  // Aggregate KPI stats
  const totalSignals = requests.length;
  const criticalHotspots = districts.filter(d => d.water_access < 45 || d.health_access < 45 || d.road_quality < 45).length;
  const totalBeneficiaries = districts.reduce((acc, d) => acc + d.population, 0);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs font-sans">
      {/* Top Banner & Title Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Brand */}
          <div className="flex items-center space-x-3.5">
            <div className="w-9 h-9 rounded-lg bg-[#D65A3A] flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <span className="text-lg font-bold tracking-tight text-slate-900 font-serif">
                  {t('brand.name')}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-orange-50 text-[#D65A3A] border border-orange-200">
                  {t('brand.dpi_engine')}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {t('brand.live_telemetry')}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {t('brand.subtitle')}
              </p>
            </div>
          </div>

          {/* Aggregate Telemetry Strip */}
          <div className="hidden lg:flex items-center space-x-6 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">{t('metric.demand_signals')}</span>
              <span className="text-sm font-bold text-slate-900 font-mono flex items-center mt-0.5">
                <Radio className="w-3.5 h-3.5 text-[#D65A3A] mr-1.5" />
                {totalSignals.toLocaleString()}
              </span>
            </div>
            <div className="h-7 w-px bg-slate-200"></div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">{t('metric.deficit_hotspots')}</span>
              <span className="text-sm font-bold text-rose-600 font-mono mt-0.5">
                {criticalHotspots} {t('metric.districts')}
              </span>
            </div>
            <div className="h-7 w-px bg-slate-200"></div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">{t('metric.citizen_reach')}</span>
              <span className="text-sm font-bold text-slate-800 font-mono mt-0.5">
                {(totalBeneficiaries / 1000000).toFixed(1)}M {t('metric.people')}
              </span>
            </div>
          </div>

          {/* Utility Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenMethodology}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              title="View Scoring Methodology & Transparency"
            >
              <Info className="w-3.5 h-3.5 mr-1.5 text-[#D65A3A]" />
              <span>{t('nav.how_it_works')}</span>
            </button>
            <button
              onClick={onResetData}
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Reset Signal Stream"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              <span className="hidden md:inline">{t('nav.reset')}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};


