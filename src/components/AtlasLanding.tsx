import React from 'react';
import { ArrowRight, Map, Box, Layers } from 'lucide-react';

interface AtlasLandingProps {
  onEnter: () => void;
}

export const AtlasLanding: React.FC<AtlasLandingProps> = ({ onEnter }) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#F7F5EF] text-[#171717] overflow-y-auto selection:bg-[#D65A3A]/20 selection:text-[#D65A3A] font-sans">
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 max-w-6xl mx-auto w-full relative my-auto">
        
        {/* Newspaper & Open Atlas Header Style */}
        <div className="w-full text-center border-b border-[#171717] pb-6 mb-8 sm:mb-12">
          <div className="inline-block bg-[#D65A3A] text-white px-3 py-1 text-[10px] font-mono tracking-widest uppercase font-bold mb-2">
            DIGITAL PUBLIC GOODS × CIVIC INTELLIGENCE × OPEN INFRASTRUCTURE
          </div>
          <h1 className="text-5xl sm:text-7xl font-serif font-bold tracking-tight text-[#171717] uppercase">
            CIVICPULSE
          </h1>
          <p className="text-sm font-sans font-semibold text-[#171717]/80 mt-2">
            Built for India. Designed to scale across public systems globally.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs font-mono tracking-wider uppercase text-[#171717]/80 mt-3 border-t border-[#171717]/10 pt-3">
            <span>Vol. I — Open Civic Intelligence Layer</span>
            <span>•</span>
            <span>8 Reusable Infrastructure Blocks</span>
            <span>•</span>
            <span className="text-[#D65A3A] font-bold">Public Atlas</span>
          </div>
        </div>
        
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Hero Card */}
          <div className="lg:col-span-7 border border-[#171717] bg-white p-8 sm:p-10 flex flex-col justify-between shadow-[6px_6px_0px_#171717]">
            <div className="space-y-6">
              <span className="text-xs font-mono uppercase tracking-widest text-[#285943] font-bold flex items-center gap-2">
                <Box className="w-4 h-4 text-[#285943]" />
                REUSABLE CIVIC INFRASTRUCTURE MODULES
              </span>
              
              <h2 className="text-3xl sm:text-4xl font-serif font-bold leading-tight text-[#171717]">
                CivicPulse isn't one application.<br />
                It's a collection of <span className="text-[#D65A3A] underline decoration-[#D65A3A]/30 underline-offset-4">reusable civic infrastructure blocks</span>.
              </h2>
              
              <p className="text-sm font-sans text-[#171717]/80 leading-relaxed max-w-xl">
                Combining native voice ingestion in regional dialects, deterministic AI priority scoring, census demography baselines, and open public mapping.
              </p>

              {/* Connected ASCII-Style Blocks Preview */}
              <div className="p-4 bg-[#F7F5EF] border border-[#171717]/20 font-mono text-[11px] text-[#171717]">
                <div className="flex items-center justify-between text-[10px] text-[#171717]/60 border-b border-[#171717]/10 pb-1 mb-2">
                  <span>ARCHITECTURE PREVIEW</span>
                  <span className="text-[#D65A3A] font-bold">DECOUPLED BLOCKS</span>
                </div>
                <div className="flex items-center justify-around gap-2 text-center text-[10px] font-bold">
                  <span className="p-1.5 border border-[#171717] bg-white">VOICE</span>
                  <span>→</span>
                  <span className="p-1.5 border border-[#D65A3A] bg-[#D65A3A]/10 text-[#D65A3A]">AI LAYER</span>
                  <span>→</span>
                  <span className="p-1.5 border border-[#285943] bg-[#285943]/10 text-[#285943]">DATASETS</span>
                  <span>→</span>
                  <span className="p-1.5 border border-[#D9A441] bg-[#D9A441]/15 text-[#171717]">PRIORITY AI</span>
                </div>
              </div>
            </div>
            
            <div className="pt-8">
              <button
                onClick={onEnter}
                className="group w-full sm:w-auto flex items-center justify-center gap-3 text-xs font-mono uppercase tracking-widest font-bold bg-[#171717] text-[#F7F5EF] px-8 py-4 hover:bg-[#D65A3A] transition-colors cursor-pointer border border-[#171717]"
              >
                OPEN CIVIC MAP & BLOCKS
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Metrics & Atlas Layer Box */}
          <div className="lg:col-span-5 border border-[#171717] bg-[#F7F5EF] p-8 flex flex-col justify-between shadow-[6px_6px_0px_#171717]">
            <div className="space-y-6">
              <div className="text-center font-serif text-xl border-b border-[#171717]/20 pb-3 uppercase font-bold text-[#171717]">
                Public Dataset Layers
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-white border border-[#171717]/20">
                  <span className="text-[9px] text-[#D65A3A] block font-bold">☑ CITIZEN DEMAND</span>
                  <span className="font-bold">12,482 Signals</span>
                </div>
                <div className="p-2.5 bg-white border border-[#171717]/20">
                  <span className="text-[9px] text-[#285943] block font-bold">☑ INFRASTRUCTURE</span>
                  <span className="font-bold">18,450 Assets</span>
                </div>
                <div className="p-2.5 bg-white border border-[#171717]/20">
                  <span className="text-[9px] text-[#D9A441] block font-bold">☑ POPULATION</span>
                  <span className="font-bold">4.2M Citizens</span>
                </div>
                <div className="p-2.5 bg-white border border-[#171717]/20">
                  <span className="text-[9px] text-[#171717] block font-bold">☐ GOVT PROJECTS</span>
                  <span className="font-bold">38 Sanctioned</span>
                </div>
              </div>

              <div className="p-4 bg-white border border-[#171717]/20 text-xs font-sans space-y-2">
                <div className="font-serif font-bold text-[#171717]">Combinatorial Intelligence</div>
                <p className="text-[#171717]/80 text-[11px] leading-relaxed">
                  Turn layers on and off dynamically to observe how public datasets fuse into deterministic priority scores across water, roads, drainage, and power.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-[#171717]/20 flex items-center justify-between text-xs font-mono text-[#171717]/70">
              <span>Status: Operational</span>
              <span className="text-[#285943] font-bold">● Live API Grid</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

