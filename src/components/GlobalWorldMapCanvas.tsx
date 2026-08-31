import React, { useState } from 'react';
import { Globe, ArrowRight, Layers, Sparkles, CheckCircle2, Shield, Radio, Box, Cpu } from 'lucide-react';
import { CountryCode } from '../types';
import { GLOBAL_COUNTRIES } from '../data/globalConfig';

interface GlobalWorldMapCanvasProps {
  selectedCountryCode: CountryCode;
  onSelectCountry: (code: CountryCode) => void;
  onEnterCountryAtlas: (code: CountryCode) => void;
}

export const GlobalWorldMapCanvas: React.FC<GlobalWorldMapCanvasProps> = ({
  selectedCountryCode,
  onSelectCountry,
  onEnterCountryAtlas,
}) => {
  const [hoveredCountry, setHoveredCountry] = useState<CountryCode | null>(null);

  const countries = Object.values(GLOBAL_COUNTRIES);

  // Approximate relative percentages for world map canvas overlay positioning
  const MAP_NODES: Record<CountryCode, { xPct: number; yPct: number; color: string }> = {
    IN: { xPct: 68, yPct: 48, color: '#D65A3A' },
    BR: { xPct: 32, yPct: 68, color: '#285943' },
    ZA: { xPct: 54, yPct: 76, color: '#D9A441' },
    RU: { xPct: 72, yPct: 24, color: '#171717' },
    CN: { xPct: 78, yPct: 42, color: '#D65A3A' },
  };

  const currentCountry = GLOBAL_COUNTRIES[selectedCountryCode];

  return (
    <div className="w-full bg-[#F7F5EF] border border-[#171717] shadow-[6px_6px_0px_#171717] font-sans p-6 sm:p-8 space-y-6">
      
      {/* Top Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#171717] pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#171717] text-[#F7F5EF] font-mono text-[10px] font-bold uppercase tracking-widest">
            <Globe className="w-3.5 h-3.5 text-[#D9A441]" />
            ONE PLATFORM. MANY CONTEXTS.
          </div>
          <h2 className="text-3xl font-serif font-bold text-[#171717] tracking-tight">
            GLOBAL CIVIC SIGNALS & ATLAS LAYER
          </h2>
          <p className="text-sm text-[#171717]/80 font-sans max-w-2xl leading-relaxed">
            CivicPulse is an open, reusable digital public good. Standardized at the core, localized at the edge across BRICS & global infrastructure networks.
          </p>
        </div>

        {/* Action: Enter Selected Country Atlas */}
        <div className="shrink-0 flex items-center space-x-3">
          <button
            onClick={() => onEnterCountryAtlas(selectedCountryCode)}
            className="group px-6 py-3.5 bg-[#D65A3A] hover:bg-[#171717] text-white font-mono text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-[4px_4px_0px_#171717] flex items-center gap-3 border border-[#171717]"
          >
            <span>ENTER {currentCountry.name.toUpperCase()} CIVIC ATLAS</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* WORLD MAP GRAPHIC CONTAINER */}
      <div className="relative w-full h-[380px] sm:h-[460px] bg-white border border-[#171717] overflow-hidden shadow-[4px_4px_0px_#171717] flex flex-col justify-between p-6">
        
        {/* Subtle Map Grid Background */}
        <div 
          className="absolute inset-0 opacity-[0.05] pointer-events-none" 
          style={{
            backgroundImage: `radial-gradient(#171717 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}
        />

        {/* Global Banner Overlay */}
        <div className="relative z-10 flex items-center justify-between border-b border-[#171717]/10 pb-3 font-mono text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#285943] animate-pulse"></span>
            <span className="font-bold text-[#171717] uppercase tracking-wider">
              REAL-TIME GLOBAL CIVIC TELEMETRY
            </span>
          </div>
          <div className="text-[#171717]/70 hidden sm:block">
            5 COUNTRY DEPLOYMENTS ACTIVE • 40,002 TOTAL CIVIC SIGNALS
          </div>
        </div>

        {/* World Nodes Canvas View */}
        <div className="relative flex-1 w-full my-4">
          
          {/* SVG World Outline Graphic Silhouette */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <svg viewBox="0 0 1000 500" className="w-full h-full text-[#171717] fill-current">
              {/* Simplified World Map Path Silhouette */}
              <path d="M150,150 Q200,100 300,140 Q350,220 250,300 Q200,380 150,320 Z M450,120 Q550,80 650,120 Q700,200 600,280 Q520,380 480,320 Z M700,100 Q850,80 950,160 Q900,280 800,320 Z M520,340 Q580,340 560,420 Z M280,300 Q360,320 320,440 Z" />
            </svg>
          </div>

          {/* INTERACTIVE COUNTRY PINS */}
          {countries.map((c) => {
            const pos = MAP_NODES[c.code];
            const isSelected = c.code === selectedCountryCode;
            const isHovered = hoveredCountry === c.code;

            return (
              <div
                key={c.code}
                style={{ left: `${pos.xPct}%`, top: `${pos.yPct}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-all"
                onMouseEnter={() => setHoveredCountry(c.code)}
                onMouseLeave={() => setHoveredCountry(null)}
              >
                {/* Node Radar Ring */}
                <div className="relative flex items-center justify-center">
                  <span 
                    className="absolute w-10 h-10 rounded-full opacity-30 animate-ping"
                    style={{ backgroundColor: pos.color }}
                  ></span>

                  {/* Pin Button */}
                  <button
                    onClick={() => onSelectCountry(c.code)}
                    className={`relative px-3 py-1.5 border-2 transition-all cursor-pointer font-mono text-xs flex items-center space-x-2 shadow-[2px_2px_0px_#171717] ${
                      isSelected
                        ? 'bg-[#171717] text-[#F7F5EF] border-[#D65A3A] scale-110 z-30 font-bold'
                        : isHovered
                        ? 'bg-white text-[#171717] border-[#171717] scale-105'
                        : 'bg-[#F7F5EF] text-[#171717] border-[#171717]'
                    }`}
                  >
                    <span className="text-base">{c.flag}</span>
                    <span className="font-bold uppercase tracking-wider">{c.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-[#D65A3A] text-white font-bold rounded-xs">
                      {c.signalCount}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* CONNECTING FLIGHT-LINE DASHED ARCS */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 stroke-[#171717]/20 stroke-dasharray-4">
            {/* Curved dashed connectors linking India to Brazil, S.Africa, Russia, China */}
            <path d="M 68% 48% Q 50% 55% 32% 68%" fill="none" strokeWidth="1.5" strokeDasharray="4 4" />
            <path d="M 68% 48% Q 60% 65% 54% 76%" fill="none" strokeWidth="1.5" strokeDasharray="4 4" />
            <path d="M 68% 48% Q 70% 35% 72% 24%" fill="none" strokeWidth="1.5" strokeDasharray="4 4" />
            <path d="M 68% 48% Q 73% 45% 78% 42%" fill="none" strokeWidth="1.5" strokeDasharray="4 4" />
          </svg>
        </div>

        {/* Bottom Legend */}
        <div className="relative z-10 pt-3 border-t border-[#171717]/10 flex flex-wrap items-center justify-between text-xs font-mono text-[#171717]">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D65A3A]"></span>
              <span>Primary Deployment</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#285943]"></span>
              <span>Active Data Connectors</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D9A441]"></span>
              <span>Universal Civic Schema</span>
            </span>
          </div>

          <div className="text-[11px] font-sans italic text-[#171717]/70">
            Click any country pin above to switch deployment context instantly.
          </div>
        </div>

      </div>

      {/* COUNTRY COMPARISON & DEPLOYMENT SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 font-mono text-xs">
        {countries.map((country) => {
          const isSelected = country.code === selectedCountryCode;
          return (
            <div
              key={country.code}
              onClick={() => onSelectCountry(country.code)}
              className={`p-4 border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-white border-2 border-[#D65A3A] shadow-[4px_4px_0px_#D65A3A]'
                  : 'bg-[#F7F5EF] border-[#171717] hover:bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#171717]/10 pb-2 mb-2">
                  <div className="flex items-center space-x-2 font-bold text-sm">
                    <span>{country.flag}</span>
                    <span className="uppercase">{country.name}</span>
                  </div>
                  {isSelected && (
                    <span className="px-1.5 py-0.5 bg-[#D65A3A] text-white font-bold text-[9px]">ACTIVE</span>
                  )}
                </div>

                <div className="space-y-1 text-[11px] text-[#171717]/80 font-sans">
                  <div><strong>Population:</strong> {country.totalPopulation}</div>
                  <div><strong>Signals:</strong> {country.signalCount}</div>
                  <div><strong>Hierarchy:</strong> {country.hierarchy.level2} → {country.hierarchy.level3}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#171717]/10 flex items-center justify-between text-[10px] font-mono text-[#285943] font-bold">
                <span>{country.connectors.length} CONNECTORS</span>
                <span>{country.languages.length} LANGUAGES</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
