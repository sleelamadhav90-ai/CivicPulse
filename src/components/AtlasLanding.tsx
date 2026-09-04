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
            INDIA STACK × DIGITAL PUBLIC GOODS × CIVIC INTELLIGENCE
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-[#171717] uppercase break-words max-w-full">
            CIVICPULSE INDIA
          </h1>
          <p className="text-sm font-sans font-semibold text-[#171717]/80 mt-2">
            Built for India: State → District → Block → Village. Designed to scale across public systems globally.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs font-mono tracking-wider uppercase text-[#171717]/80 mt-3 border-t border-[#171717]/10 pt-3">
            <span>Vol. I — India Civic Intelligence Layer</span>
            <span>•</span>
            <span>Ground-Up Administrative Hierarchy</span>
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
                INDIA-FIRST ADMINISTRATIVE PIPELINE
              </span>
              
              <h2 className="text-3xl sm:text-4xl font-serif font-bold leading-tight text-[#171717]">
                Civic Intelligence grounded in <span className="text-[#D65A3A] underline decoration-[#D65A3A]/30 underline-offset-4">India's district & state architecture</span>.
              </h2>
              
              <p className="text-sm font-sans text-[#171717]/80 leading-relaxed max-w-xl">
                Combining regional voice ingestion (Telugu, Hindi, Tamil, Kannada), deterministic AI priority scoring, census demography baselines, and open public mapping.
              </p>

              {/* BUILT FOR INDIA - COVERAGE & SCALE BADGE */}
              <div className="p-5 bg-white border-2 border-[#171717] shadow-[3px_3px_0px_#D65A3A] space-y-3">
                <div className="flex items-center justify-between border-b border-[#171717]/20 pb-2">
                  <span className="font-mono text-xs font-bold text-[#D65A3A] tracking-wider uppercase">
                    🇮🇳 BUILT FOR INDIA — GEOGRAPHIC & LINGUISTIC COVERAGE
                  </span>
                  <span className="text-[10px] font-mono bg-[#285943] text-white px-2 py-0.5 font-bold uppercase">
                    PROTOTYPE CAPABILITY
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                  <div className="p-2 bg-[#F7F5EF] border border-[#171717]/20">
                    <span className="text-xl font-serif font-bold text-[#171717] block">28</span>
                    <span className="text-[10px] text-slate-600 font-bold uppercase block">STATES</span>
                  </div>
                  <div className="p-2 bg-[#F7F5EF] border border-[#171717]/20">
                    <span className="text-xl font-serif font-bold text-[#171717] block">8</span>
                    <span className="text-[10px] text-slate-600 font-bold uppercase block">UNION TERRITORIES</span>
                  </div>
                  <div className="p-2 bg-[#F7F5EF] border border-[#171717]/20">
                    <span className="text-xl font-serif font-bold text-[#171717] block">22</span>
                    <span className="text-[10px] text-slate-600 font-bold uppercase block">SCHEDULED LANGUAGES</span>
                  </div>
                  <div className="p-2 bg-orange-100 border border-[#D65A3A]">
                    <span className="text-xl font-serif font-bold text-[#D65A3A] block">8</span>
                    <span className="text-[10px] text-[#D65A3A] font-bold uppercase block">ACTIVE AI LANGUAGES</span>
                  </div>
                </div>

                <p className="text-xs font-sans text-slate-700 leading-relaxed pt-1">
                  Designed to understand diverse citizen voices across India's linguistic and geographic regions. CivicPulse currently enables <strong className="text-[#171717]">8 active AI languages</strong> (English, Hindi, Telugu, Tamil, Kannada, Bengali, Marathi, Malayalam) with full architectural readiness to support all <strong className="text-[#171717]">22 Eighth Schedule languages</strong>.
                </p>
              </div>

              {/* Connected ASCII-Style Hierarchy Preview */}
              <div className="p-4 bg-[#F7F5EF] border border-[#171717]/20 font-mono text-[11px] text-[#171717] space-y-2">
                <div className="flex items-center justify-between text-[10px] text-[#171717]/60 border-b border-[#171717]/10 pb-1">
                  <span>GROUND-UP HIERARCHY</span>
                  <span className="text-[#D65A3A] font-bold">INDIA STACK</span>
                </div>
                <div className="flex items-center justify-around gap-1.5 text-center text-[10px] font-bold">
                  <span className="p-1 border border-[#171717] bg-white">INDIA</span>
                  <span>→</span>
                  <span className="p-1 border border-[#D65A3A] bg-[#D65A3A]/10 text-[#D65A3A]">STATE</span>
                  <span>→</span>
                  <span className="p-1 border border-[#285943] bg-[#285943]/10 text-[#285943]">DISTRICT</span>
                  <span>→</span>
                  <span className="p-1 border border-[#D9A441] bg-[#D9A441]/15 text-[#171717]">BLOCK</span>
                  <span>→</span>
                  <span className="p-1 border border-[#171717] bg-[#171717] text-white">VILLAGE</span>
                </div>
              </div>
            </div>
            
            <div className="pt-8">
              <button
                onClick={onEnter}
                className="group w-full sm:w-auto flex items-center justify-center gap-3 text-xs font-mono uppercase tracking-widest font-bold bg-[#171717] text-[#F7F5EF] px-8 py-4 hover:bg-[#D65A3A] transition-colors cursor-pointer border border-[#171717] shadow-[2px_2px_0px_#D65A3A]"
              >
                OPEN INDIA CIVIC MAP & STACK
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
                  <span className="text-[9px] text-[#171717] block font-bold">☐ SCHEME BUDGET</span>
                  <span className="font-bold">₹120 Cr Capital</span>
                </div>
              </div>

              <div className="p-4 bg-white border border-[#171717]/20 text-xs font-sans space-y-2">
                <div className="font-serif font-bold text-[#171717]">Global Scalability Architecture</div>
                <p className="text-[#171717]/80 text-[11px] leading-relaxed">
                  While built India-first for immediate district deployment, CivicPulse uses generic schema adapters so it can be deployed across global public systems (BRICS/Global South) by changing datasets and language configs.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-[#171717]/20 flex items-center justify-between text-xs font-mono text-[#171717]/70">
              <span>Status: Operational</span>
              <span className="text-[#285943] font-bold">● India Stack Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

