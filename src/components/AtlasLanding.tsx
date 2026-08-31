import React from 'react';
import { ArrowRight, Map } from 'lucide-react';

interface AtlasLandingProps {
  onEnter: () => void;
}

export const AtlasLanding: React.FC<AtlasLandingProps> = ({ onEnter }) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#f4f1ea] text-[#1a237e] overflow-hidden selection:bg-[#d97706]/20 selection:text-[#d97706]">
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center sm:text-left sm:items-start max-w-5xl mx-auto w-full relative">
        
        {/* Newspaper Header Style */}
        <div className="w-full text-center border-b-4 border-double border-[#1a237e] pb-6 mb-10 sm:mb-16">
          <h1 className="text-sm font-sans tracking-[0.3em] font-bold text-[#c84b31] uppercase mb-2">
            The Government & Citizen Initiative
          </h1>
          <div className="text-6xl sm:text-8xl font-serif font-bold tracking-tight text-[#1a237e] uppercase">
            Civic Pulse
          </div>
          <div className="flex items-center justify-center gap-4 text-xs font-mono tracking-widest uppercase text-[#1a237e]/70 mt-4 border-t border-[#1a237e]/20 pt-4">
            <span>Vol. I — India</span>
            <span className="w-1.5 h-1.5 bg-[#d97706] rounded-full"></span>
            <span>2026 Edition</span>
            <span className="w-1.5 h-1.5 bg-[#d97706] rounded-full"></span>
            <span>Public Infrastructure Atlas</span>
          </div>
        </div>
        
        <div className="w-full flex flex-col sm:flex-row gap-12 sm:gap-24 items-start">
          <div className="flex-1">
            <h2 className="text-4xl sm:text-5xl font-mono font-medium leading-[1.3] text-[#1a237e] mb-8">
              A Living Atlas mapping<br/>
              the <span className="text-[#c84b31]">infrastructure needs</span><br/>
              of our communities.
            </h2>
            
            <button
              onClick={onEnter}
              className="group flex items-center gap-3 text-sm font-sans uppercase tracking-widest font-semibold border border-[#1a237e] px-8 py-4 hover:bg-[#1a237e] hover:text-[#f4f1ea] transition-all cursor-pointer"
            >
              Examine the Atlas
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="sm:w-[360px] shrink-0 border border-[#1a237e] bg-[#f4f1ea] p-8 flex flex-col gap-8 shadow-[8px_8px_0px_#1a237e]">
            <div className="text-center font-serif text-xl tracking-wide border-b border-[#1a237e]/20 pb-4 uppercase font-bold text-[#1a237e]">
              National Data Summary
            </div>
            
            <div className="flex justify-center py-6 relative">
              {/* Ashoka Chakra inspired dashed rotating ring */}
              <div className="absolute inset-0 m-auto w-32 h-32 border-[3px] border-dashed border-[#1a237e]/20 rounded-full animate-[spin_60s_linear_infinite]"></div>
              <Map className="w-20 h-20 text-[#1a237e] stroke-1 relative z-10" />
            </div>

            <div className="flex flex-col gap-4 font-mono text-base tracking-wide text-[#1a237e]">
              <div className="flex justify-between items-center border-b border-[#1a237e]/20 pb-2">
                <span className="font-bold">12,482</span>
                <span className="text-xs font-sans uppercase tracking-widest text-[#1a237e]/70">Citizen Signals</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#1a237e]/20 pb-2">
                <span className="font-bold">147</span>
                <span className="text-xs font-sans uppercase tracking-widest text-[#1a237e]/70">Demand Hotspots</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="font-bold text-[#c84b31]">38</span>
                <span className="text-xs font-sans uppercase tracking-widest text-[#c84b31]">Priority Districts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
