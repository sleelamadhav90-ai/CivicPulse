import React, { useState } from 'react';
import { 
  Globe, 
  ChevronDown, 
  Languages, 
  Check, 
  Radio, 
  Layers, 
  Cpu, 
  Box, 
  Sliders,
  Sparkles,
  Info,
  ShieldCheck,
  Building
} from 'lucide-react';
import { CountryCode, CountryConfig, LanguageOption } from '../types';
import { GLOBAL_COUNTRIES } from '../data/globalConfig';

interface GlobalHeaderProps {
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
  selectedCountryCode,
  onSelectCountry,
  selectedLanguage,
  onSelectLanguage,
  isWorldAtlasActive,
  onToggleWorldAtlas,
  onNavigateToConnectors,
  onNavigateToSchema,
  onOpenPortalDirectory,
}) => {
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const currentCountry = GLOBAL_COUNTRIES[selectedCountryCode];
  const currentLang = currentCountry.languages.find(l => l.code === selectedLanguage) || currentCountry.languages[0];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950 text-slate-100 border-b border-slate-800 font-mono text-xs shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        
        {/* Official Brand Header */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={onOpenPortalDirectory}
            className="w-7 h-7 bg-blue-700 hover:bg-blue-600 text-white flex items-center justify-center font-mono font-bold text-xs border border-blue-500 cursor-pointer transition-colors"
            title="Open Module Directory"
          >
            CP
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm tracking-wide text-white uppercase font-sans">
                CIVICPULSE
              </span>
              <span className="hidden md:inline-block px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[9px] uppercase tracking-wider font-bold">
                OFFICIAL DECISION COMMAND CENTRE
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-sans hidden sm:block">
              Government Infrastructure & Citizen Need Analytics
            </span>
          </div>
        </div>

        {/* Center Controls: Country Adapter & Dashboard Language Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* World Atlas Toggle */}
          <button
            onClick={onToggleWorldAtlas}
            className={`px-3 py-1.5 border transition-colors cursor-pointer flex items-center space-x-1.5 text-[11px] font-bold ${
              isWorldAtlasActive
                ? 'bg-blue-800 text-white border-blue-500'
                : 'bg-slate-900 text-slate-200 hover:bg-slate-800 border-slate-700'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span className="uppercase tracking-wider">
              {isWorldAtlasActive ? 'WORLD ATLAS' : 'GLOBAL ATLAS'}
            </span>
          </button>

          {/* COUNTRY SELECTOR DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => {
                setCountryDropdownOpen(!countryDropdownOpen);
                setLangDropdownOpen(false);
              }}
              className="px-3 py-1.5 bg-slate-100 text-slate-900 border border-slate-300 hover:bg-white transition-colors cursor-pointer flex items-center space-x-2 font-bold text-[11px]"
            >
              <span className="text-sm">{currentCountry.flag}</span>
              <span className="uppercase tracking-wider font-mono">{currentCountry.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-700" />
            </button>

            {countryDropdownOpen && (
              <div className="absolute right-0 sm:left-0 top-full mt-1 w-64 bg-white border border-slate-300 shadow-lg z-50 py-1 text-slate-900">
                <div className="px-3 py-1.5 border-b border-slate-200 text-[9px] font-bold text-blue-900 uppercase tracking-wider bg-slate-50">
                  SELECT GOVERNMENT ADAPTER
                </div>

                {Object.values(GLOBAL_COUNTRIES).map((country) => {
                  const isSelected = country.code === selectedCountryCode;
                  return (
                    <button
                      key={country.code}
                      onClick={() => {
                        onSelectCountry(country.code);
                        setCountryDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer text-xs ${
                        isSelected ? 'bg-blue-50 font-bold border-l-4 border-blue-700' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="text-base">{country.flag}</span>
                        <div>
                          <div className="font-bold font-mono text-slate-900">{country.name}</div>
                          <div className="text-[9px] text-slate-500 font-sans">
                            {country.hierarchy.level2} → {country.hierarchy.level3}
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-[10px] text-blue-900 font-bold block">{country.signalCount}</span>
                        <span className="text-[9px] text-slate-400 block">signals</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* DASHBOARD LANGUAGE SWITCHER */}
          <div className="relative">
            <button
              onClick={() => {
                setLangDropdownOpen(!langDropdownOpen);
                setCountryDropdownOpen(false);
              }}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors cursor-pointer flex items-center space-x-1.5 text-[11px]"
            >
              <Languages className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-bold">{currentLang.nativeName}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-300 shadow-lg z-50 py-1 text-slate-900">
                <div className="px-3 py-1.5 border-b border-slate-200 text-[9px] font-bold text-slate-600 uppercase tracking-wider bg-slate-50">
                  DASHBOARD LANGUAGE
                </div>

                {currentCountry.languages.map((lang) => {
                  const isSelected = lang.code === selectedLanguage;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onSelectLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer text-xs ${
                        isSelected ? 'bg-blue-50 font-bold border-l-4 border-blue-700' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{lang.flagEmoji}</span>
                        <span className="font-sans">{lang.nativeName}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-700" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Quick Links */}
        <div className="hidden lg:flex items-center space-x-3 text-[11px] text-slate-300">
          <button
            onClick={onNavigateToConnectors}
            className="hover:text-white hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <Box className="w-3.5 h-3.5 text-blue-400" />
            <span>CONNECTORS</span>
          </button>
          <span>•</span>
          <button
            onClick={onNavigateToSchema}
            className="hover:text-white hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>SCHEMA</span>
          </button>
        </div>

      </div>
    </header>
  );
};

