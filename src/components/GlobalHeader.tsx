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
  Info
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
}) => {
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const currentCountry = GLOBAL_COUNTRIES[selectedCountryCode];
  const currentLang = currentCountry.languages.find(l => l.code === selectedLanguage) || currentCountry.languages[0];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#171717] text-[#F7F5EF] border-b border-[#171717] font-mono text-xs shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand & Tagline */}
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 bg-[#D65A3A] text-white flex items-center justify-center font-serif font-bold text-sm shadow-[1px_1px_0px_#F7F5EF]">
            CP
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif font-bold text-base tracking-wide text-white uppercase">
                CIVICPULSE
              </span>
              <span className="hidden md:inline-block px-2 py-0.5 bg-[#285943] text-white font-mono text-[9px] uppercase tracking-widest font-bold">
                GLOBAL CIVIC LAYER
              </span>
            </div>
            <span className="text-[10px] text-[#F7F5EF]/70 font-sans hidden sm:block">
              Localized at the Edge • Standardized at the Core
            </span>
          </div>
        </div>

        {/* Center Controls: Country Selector & Language Selector */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* World Atlas Toggle */}
          <button
            onClick={onToggleWorldAtlas}
            className={`px-3 py-1.5 border transition-all cursor-pointer flex items-center space-x-1.5 ${
              isWorldAtlasActive
                ? 'bg-[#D65A3A] text-white border-white font-bold'
                : 'bg-white/10 text-white hover:bg-white/20 border-white/20'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-[#D9A441]" />
            <span className="text-[11px] uppercase tracking-wider">
              {isWorldAtlasActive ? '🌍 WORLD ATLAS' : '🌐 WORLD VIEW'}
            </span>
          </button>

          {/* COUNTRY SELECTOR DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => {
                setCountryDropdownOpen(!countryDropdownOpen);
                setLangDropdownOpen(false);
              }}
              className="px-3 py-1.5 bg-white text-[#171717] border border-white hover:bg-[#F7F5EF] transition-all cursor-pointer flex items-center space-x-2 font-bold text-[11px]"
            >
              <span className="text-sm">{currentCountry.flag}</span>
              <span className="uppercase tracking-wider">{currentCountry.name}</span>
              <ChevronDown className="w-3 h-3 text-[#171717]" />
            </button>

            {countryDropdownOpen && (
              <div className="absolute right-0 sm:left-0 top-full mt-1 w-64 bg-[#F7F5EF] border border-[#171717] shadow-[6px_6px_0px_#171717] z-50 py-1 text-[#171717]">
                <div className="px-3 py-1.5 border-b border-[#171717]/10 text-[9px] font-bold text-[#D65A3A] uppercase tracking-widest bg-white">
                  SELECT DEPLOYMENT ADAPTER
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
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#171717]/10 transition-colors cursor-pointer text-xs ${
                        isSelected ? 'bg-white font-bold border-l-4 border-[#D65A3A]' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="text-base">{country.flag}</span>
                        <div>
                          <div className="font-bold font-mono">{country.name}</div>
                          <div className="text-[9px] text-[#171717]/60 font-sans">
                            {country.hierarchy.level2} → {country.hierarchy.level3}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-[#285943] font-bold block">{country.signalCount}</span>
                        <span className="text-[9px] text-[#171717]/50 block">signals</span>
                      </div>
                    </button>
                  );
                })}

                <div className="p-2 border-t border-[#171717]/10 bg-white text-[10px] text-[#171717]/70 font-sans italic text-center">
                  Common Civic Engine • Swap country adapters instantly
                </div>
              </div>
            )}
          </div>

          {/* LANGUAGE SELECTOR DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => {
                setLangDropdownOpen(!langDropdownOpen);
                setCountryDropdownOpen(false);
              }}
              className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer flex items-center space-x-1.5 text-[11px]"
            >
              <Languages className="w-3.5 h-3.5 text-[#D9A441]" />
              <span className="font-bold">{currentLang.nativeName}</span>
              <ChevronDown className="w-3 h-3 text-white/70" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-[#F7F5EF] border border-[#171717] shadow-[6px_6px_0px_#171717] z-50 py-1 text-[#171717]">
                <div className="px-3 py-1.5 border-b border-[#171717]/10 text-[9px] font-bold text-[#285943] uppercase tracking-widest bg-white">
                  FIRST-CLASS LANGUAGE AI
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
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#171717]/10 transition-colors cursor-pointer text-xs ${
                        isSelected ? 'bg-white font-bold border-l-4 border-[#285943]' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{lang.flagEmoji}</span>
                        <span>{lang.nativeName}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#285943]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Quick Links: Connectors & Universal Schema */}
        <div className="hidden lg:flex items-center space-x-3 text-[11px]">
          <button
            onClick={onNavigateToConnectors}
            className="text-white/80 hover:text-white hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <Box className="w-3.5 h-3.5 text-[#D65A3A]" />
            <span>CONNECTORS</span>
          </button>
          <span>•</span>
          <button
            onClick={onNavigateToSchema}
            className="text-white/80 hover:text-white hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5 text-[#D9A441]" />
            <span>UNIVERSAL SCHEMA</span>
          </button>
        </div>

      </div>
    </header>
  );
};
