import React from 'react';
import { ArrowRight, Map } from 'lucide-react';

interface AtlasLandingProps {
  onEnter: () => void;
}

export const AtlasLanding: React.FC<AtlasLandingProps> = ({ onEnter }) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#faf9f6] text-[#2d2d2d] overflow-hidden selection:bg-[#e07a5f]/20 selection:text-[#e07a5f]">
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center sm:text-left sm:items-start max-w-4xl mx-auto w-full relative">
        <h1 className="text-sm font-sans tracking-[0.2em] font-bold text-[#e07a5f] uppercase mb-4 sm:mb-8 border-b border-[#2d2d2d]/10 pb-4 w-full">
          CivicPulse
        </h1>
        
        <div className="w-full flex flex-col sm:flex-row gap-12 sm:gap-24 items-start">
          <div className="flex-1">
            <h2 className="text-5xl sm:text-7xl font-serif font-medium leading-[1.1] text-[#2d2d2d] mb-6 tracking-tight">
              Understanding<br/>
              what communities<br/>
              need.
            </h2>
            <div className="flex items-center gap-4 text-sm font-sans tracking-widest uppercase text-[#57534e] mb-12">
              <span>India</span>
              <span className="w-1 h-1 bg-[#e07a5f] rounded-full"></span>
              <span>2026</span>
            </div>
            
            <button
              onClick={onEnter}
              className="group flex items-center gap-3 text-sm font-sans uppercase tracking-widest font-semibold border-b-2 border-[#2d2d2d] pb-2 hover:text-[#e07a5f] hover:border-[#e07a5f] transition-all cursor-pointer"
            >
              Explore the Atlas
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="sm:w-[320px] shrink-0 border border-[#2d2d2d]/20 bg-white/50 p-6 flex flex-col gap-8 shadow-sm">
            <div className="text-center font-serif text-lg tracking-wide border-b border-[#2d2d2d]/10 pb-4">
              INDIA DEVELOPMENT<br/>ATLAS
            </div>
            
            <div className="flex justify-center py-4">
              <Map className="w-24 h-24 text-[#e07a5f]/20 stroke-1" />
            </div>

            <div className="flex flex-col gap-4 font-sans text-sm tracking-wide text-[#57534e]">
              <div className="flex justify-between items-center border-b border-[#2d2d2d]/10 pb-2">
                <span className="font-semibold text-[#2d2d2d]">12,482</span>
                <span className="text-xs uppercase">Citizen Signals</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#2d2d2d]/10 pb-2">
                <span className="font-semibold text-[#2d2d2d]">147</span>
                <span className="text-xs uppercase">Demand Hotspots</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="font-semibold text-[#e07a5f]">38</span>
                <span className="text-xs uppercase">Priority Districts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
