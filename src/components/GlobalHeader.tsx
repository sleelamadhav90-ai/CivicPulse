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
  X,
  Menu,
  Search
} from 'lucide-react';
import { CountryCode } from '../types';
import { NavTab } from './Sidebar';
import { useLanguage } from '../context/LanguageContext';

interface GlobalHeaderProps {
  activeTab?: NavTab;
  onNavigate?: (tab: NavTab) => void;
  selectedCountryCode: CountryCode;
  onSelectCountry: (code: CountryCode) => void;
  selectedLanguage?: string;
  onSelectLanguage?: (langCode: string) => void;
  isWorldAtlasActive?: boolean;
  onToggleWorldAtlas?: () => void;
  onNavigateToConnectors?: () => void;
  onNavigateToSchema?: () => void;
  onOpenPortalDirectory?: () => void;
  onOpenMobileMenu?: () => void;
  onOpenSearch?: () => void;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  activeTab = 'overview',
  onNavigate,
  selectedCountryCode,
  onSelectCountry,
  onOpenPortalDirectory,
  onOpenMobileMenu,
  onOpenSearch,
}) => {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [scalabilityModalOpen, setScalabilityModalOpen] = useState(false);
  const { language, setLanguage, supportedLanguages, currentLanguageConfig, t } = useLanguage();

  const mainNavItems: { id: NavTab; labelKey: string }[] = [
    { id: 'overview', labelKey: 'nav.home' },
    { id: 'submit', labelKey: 'nav.report_issue' },
    { id: 'map', labelKey: 'nav.explore_area' },
    { id: 'signals', labelKey: 'nav.my_requests' },
    { id: 'recommendations', labelKey: 'nav.government_dashboard' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#171717] text-[#F7F5EF] border-b border-[#171717]/40 font-mono text-xs shadow-xs shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3">
        
        {/* Official Brand Header */}
        <div className="flex items-center space-x-2.5">
          {/* Mobile hamburger button */}
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="p-1.5 bg-[#292824] hover:bg-[#34322D] text-white rounded-xs lg:hidden transition-colors cursor-pointer mr-1"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          <button 
            onClick={() => onNavigate ? onNavigate('overview') : onOpenPortalDirectory?.()}
            className="w-7 h-7 bg-[#D65A3A] hover:bg-[#c34e2f] text-white flex items-center justify-center font-mono font-bold text-xs border border-[#171717] cursor-pointer transition-colors shadow-[1px_1px_0px_#F7F5EF] rounded-xs shrink-0"
            title="CivicPulse Home"
          >
            CP
          </button>
          <div className="cursor-pointer" onClick={() => onNavigate?.('overview')}>
            <span className="font-serif font-bold text-base tracking-wide text-white uppercase">
              {t('brand.name')}
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
                  className={`px-3 py-1 font-medium transition-all cursor-pointer rounded-xs border ${
                    isActive
                      ? 'bg-[#D65A3A] text-white font-bold border-[#D65A3A]'
                      : 'text-slate-300 hover:text-white hover:bg-white/10 border-transparent'
                  }`}
                >
                  {t(item.labelKey)}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Controls: Search + India + Language + Info */}
        <div className="flex items-center space-x-2">
          
          {/* HUMAN-FIRST QUICK SEARCH BUTTON */}
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="flex items-center space-x-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/15 text-slate-200 border border-white/20 transition-colors cursor-pointer rounded-xs text-[11px] font-sans group"
              title="Search CivicPulse (Press ⌘K or Ctrl+K)"
              aria-label="Search CivicPulse"
            >
              <Search className="w-3.5 h-3.5 text-[#D65A3A] group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-slate-300">
                Search CivicPulse...
              </span>
              <kbd className="hidden md:inline-block px-1 py-0.2 text-[9px] font-mono bg-black/40 text-slate-400 border border-white/10 rounded-xs">
                ⌘K
              </kbd>
            </button>
          )}

          {/* INDIA JURISDICTION BADGE */}
          <div className="px-2.5 py-1 bg-[#285943]/90 text-white border border-white/20 flex items-center space-x-1.5 text-[11px] font-bold rounded-xs">
            <span className="text-xs">🇮🇳</span>
            <span className="uppercase tracking-wider">{t('brand.jurisdiction')}</span>
          </div>

          {/* LANGUAGE SWITCHER */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/15 text-slate-200 border border-white/20 transition-colors cursor-pointer flex items-center space-x-1 text-[11px] rounded-xs"
            >
              <Languages className="w-3 h-3 text-[#D65A3A]" />
              <span className="font-medium">{currentLanguageConfig.nativeName}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-slate-300 shadow-xl z-50 py-1 text-slate-900 rounded-xs">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                  {t('brand.select_language')}
                </div>
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-100 transition-colors text-xs font-mono cursor-pointer ${
                      language === lang.code ? 'bg-orange-50 font-bold text-[#D65A3A]' : ''
                    }`}
                  >
                    <span>{lang.nativeName} {lang.name !== lang.nativeName && <span className="text-slate-500 text-[11px]">({lang.name})</span>}</span>
                    {language === lang.code && <Check className="w-3 h-3 text-[#D65A3A]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFO BUTTON */}
          <button
            onClick={() => setScalabilityModalOpen(true)}
            className="p-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer flex items-center justify-center rounded-xs text-[11px]"
            title="System Architecture & Scalability Overview"
            aria-label="System Architecture & Scalability Overview"
          >
            <Info className="w-3.5 h-3.5 text-amber-300" />
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
                className="p-1 text-[#171717] hover:text-[#D65A3A] font-bold cursor-pointer"
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
                  CivicPulse enables 8 regional languages (English, Hindi, Telugu, Tamil, Kannada, Marathi, Bengali, Odia) with global translation switching across all views and telemetry.
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


