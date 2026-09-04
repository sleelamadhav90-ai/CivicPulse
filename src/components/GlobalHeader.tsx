import React, { useState } from 'react';
import { 
  ChevronDown, 
  Languages, 
  Check, 
  Info,
  Box,
  Layers,
  Sparkles,
  MapPin,
  X
} from 'lucide-react';
import { CountryCode } from '../types';
import { GLOBAL_COUNTRIES } from '../data/globalConfig';
import { NavTab } from './Sidebar';

interface GlobalHeaderProps {
  activeTab?: NavTab;
  onNavigate?: (tab: NavTab) => void;
  selectedCountryCode: CountryCode;
  onSelectCountry: (code: CountryCode) => void;
  selectedLanguage: string;
  onSelectLanguage: (langCode: string) => void;
  isWorldAtlasActive: boolean;
  onToggleWorldAtlas: () => void;
  onNavigateToConnectors: () => void;
  onNavigateToSchema: () => void;
  onOpenPortalDirectory?: () => void;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  activeTab = 'overview',
  onNavigate,
  selectedCountryCode,
  onSelectCountry,
  selectedLanguage,
  onSelectLanguage,
  onOpenPortalDirectory,
}) => {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [scalabilityModalOpen, setScalabilityModalOpen] = useState(false);

  const currentCountry = GLOBAL_COUNTRIES['IN'];
  const currentLang = currentCountry.languages.find(l => l.code === selectedLanguage) || currentCountry.languages[0];

  const mainNavItems: { id: NavTab; label: string; icon?: React.ReactNode }[] = [
    { id: 'overview', label: 'Home' },
    { id: 'submit', label: 'Report an Issue' },
    { id: 'map', label: 'Explore Area' },
    { id: 'signals', label: 'My Requests' },
    { id: 'recommendations', label: 'Government Dashboard' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#171717] text-[#F7F5EF] border-b border-[#171717]/40 font-mono text-xs shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        
        {/* Official Brand Header */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => onNavigate ? onNavigate('overview') : onOpenPortalDirectory?.()}
            className="w-7 h-7 bg-[#D65A3A] hover:bg-[#c34e2f] text-white flex items-center justify-center font-mono font-bold text-xs border border-[#171717] cursor-pointer transition-colors shadow-[1px_1px_0px_#F7F5EF]"
            title="CivicPulse Home"
          >
            CP
          </button>
          <div className="cursor-pointer" onClick={() => onNavigate?.('overview')}>
            <div className="flex items-center space-x-2">
              <span className="font-serif font-bold text-base tracking-wide text-white uppercase">
                CivicPulse
              </span>
              <span className="hidden md:inline-block px-2 py-0.5 bg-[#D65A3A]/20 border border-[#D65A3A]/40 text-[#D65A3A] font-mono text-[9px] font-bold tracking-wider uppercase">
                DIGITAL PUBLIC GOODS × INDIA STACK
              </span>
            </div>
            <span className="text-[10px] text-[#F7F5EF]/70 font-sans hidden sm:block">
              Public Infrastructure & Civic Intelligence
            </span>
          </div>
        </div>

        {/* Center Navigation Links */}
        {onNavigate && (
          <nav className="hidden lg:flex items-center space-x-1 font-sans text-xs">
            {mainNavItems.map((item) => {
              const isActive = activeTab === item.id || 
                (item.id === 'recommendations' && (activeTab === 'briefing' || activeTab === 'engine' || activeTab === 'action_queue')) ||
                (item.id === 'signals' && activeTab === 'issues');

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3 py-1.5 font-medium transition-all cursor-pointer rounded-sm border ${
                    isActive
                      ? 'bg-[#D65A3A] text-white font-bold border-[#D65A3A] shadow-[1px_1px_0px_#F7F5EF]'
                      : 'text-slate-300 hover:text-white hover:bg-white/10 border-transparent'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Controls: India Location + Language Switcher + Scalability Info */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* INDIA LOCATION & COVERAGE BADGE */}
          <div className="px-2.5 py-1.5 bg-[#285943] text-white border border-white/20 flex items-center space-x-1.5 text-[11px] font-bold shadow-[1px_1px_0px_#F7F5EF]">
            <span className="text-xs">🇮🇳</span>
            <span className="uppercase tracking-wider">INDIA</span>
            <span className="text-white/60">•</span>
            <span className="text-amber-200 font-normal">28 States · 8 UTs · 8 Active Languages</span>
          </div>

          {/* DASHBOARD LANGUAGE SWITCHER */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors cursor-pointer flex items-center space-x-1.5 text-[11px]"
            >
              <Languages className="w-3.5 h-3.5 text-[#D65A3A]" />
              <span className="font-bold">{currentLang.nativeName}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-slate-300 shadow-lg z-50 py-1 text-slate-900">
                <div className="px-3 py-1.5 border-b border-slate-200 text-[9px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 leading-tight">
                  8 Active AI Languages <br/>
                  <span className="text-slate-400 font-normal font-sans">(Out of 22 Scheduled Languages)</span>
                </div>
                {currentCountry.languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onSelectLanguage(lang.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-100 transition-colors text-xs font-mono ${
                      selectedLanguage === lang.code ? 'bg-orange-50 font-bold text-[#D65A3A]' : ''
                    }`}
                  >
                    <span>{lang.nativeName} ({lang.name})</span>
                    {selectedLanguage === lang.code && <Check className="w-3 h-3 text-[#D65A3A]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ARCHITECTURE INFO BUTTON */}
          <button
            onClick={() => setScalabilityModalOpen(true)}
            className="px-2 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer flex items-center space-x-1 text-[11px] font-mono font-bold"
            title="Scalable Architecture Overview"
          >
            <Info className="w-3.5 h-3.5 text-amber-300" />
            <span className="uppercase tracking-wider hidden sm:inline">Info</span>
          </button>
        </div>
      </div>

      {/* SCALABILITY BY DESIGN MODAL */}
      {scalabilityModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 font-sans text-[#171717]">
          <div className="bg-[#F7F5EF] border-2 border-[#171717] max-w-lg w-full p-6 shadow-[8px_8px_0px_#171717] space-y-4">
            <div className="flex items-center justify-between border-b border-[#171717] pb-3">
              <div className="flex items-center space-x-2">
                <Box className="w-5 h-5 text-[#D65A3A]" />
                <h3 className="font-serif font-bold text-lg uppercase text-[#171717]">
                  Designed for India · Scalable by Design
                </h3>
              </div>
              <button
                onClick={() => setScalabilityModalOpen(false)}
                className="p-1 text-[#171717] hover:text-[#D65A3A] font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-[#171717]/90 font-mono">
              <div className="bg-white p-3 border border-[#171717]/30 space-y-1">
                <span className="font-bold text-[#D65A3A] uppercase block text-[10px]">🇮🇳 BUILT FOR INDIA — LINGUISTIC & GEOGRAPHIC SCALE</span>
                <div className="grid grid-cols-2 gap-2 text-center py-1 my-1 bg-[#F7F5EF] border border-[#171717]/10 text-[11px]">
                  <div><strong className="text-[#171717] font-serif text-sm">28</strong> States</div>
                  <div><strong className="text-[#171717] font-serif text-sm">8</strong> Union Territories</div>
                  <div><strong className="text-[#171717] font-serif text-sm">22</strong> Scheduled Languages</div>
                  <div className="text-[#D65A3A] font-bold"><strong className="font-serif text-sm">8</strong> Active AI Prototype Languages</div>
                </div>
                <p className="text-[11px] text-slate-700">
                  CivicPulse respects the distinction between national scale and prototype readiness. While India spans 22 Eighth Schedule languages, CivicPulse currently enables <strong>8 active regional AI languages</strong> (English, Hindi, Telugu, Tamil, Kannada, Bengali, Marathi, Malayalam) with architecture ready to scale across all 22.
                </p>
              </div>

              <div className="bg-white p-3 border border-[#171717]/30 space-y-1">
                <span className="font-bold text-[#285943] uppercase block text-[10px]">REUSABLE CIVIC INFRASTRUCTURE ENGINE</span>
                <p className="text-[11px] text-slate-700">
                  CivicPulse decouples the intelligence engine from country-specific datasets. The exact same civic issue schema, multilingual voice parser, spatial aggregation pipeline, and Gemini priority engine can consume public infrastructure, demographic, geographic, and investment datasets across any jurisdiction.
                </p>
              </div>

              <div className="p-3 bg-[#171717] text-[#F7F5EF] text-[11px] font-mono border border-[#171717]">
                <span className="text-amber-300 font-bold block mb-1">UNIVERSAL CIVIC SCHEMA ADAPTER:</span>
                <code className="text-[10px] text-slate-300 block">
                  {`Country -> State/Province -> District/County -> Block/Ward -> Village/Community`}
                </code>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setScalabilityModalOpen(false)}
                className="px-4 py-2 bg-[#171717] text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#D65A3A] transition-colors cursor-pointer border border-[#171717]"
              >
                Close Overview
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

