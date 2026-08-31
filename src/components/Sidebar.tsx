import React from 'react';
import { 
  Building2, 
  Home, 
  FileEdit, 
  MapPin, 
  Sparkles, 
  Hammer, 
  TrendingUp, 
  Settings, 
  Radio, 
  Info,
  Layers,
  Flame,
  CheckCircle2,
  Cpu,
  Award
} from 'lucide-react';
import { District, CitizenRequest } from '../types';

export type NavTab = 'overview' | 'engine' | 'map' | 'submit' | 'insights' | 'projects' | 'impact' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  requestsCount: number;
  projectsCount?: number;
  onOpenMethodology: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  requestsCount,
  projectsCount = 6,
  onOpenMethodology,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'overview' as NavTab, label: 'Overview', icon: Home, emoji: '🏠', badge: null },
    { id: 'engine' as NavTab, label: 'Priority Engine', icon: Cpu, emoji: '⚡', badge: '94/100' },
    { id: 'map' as NavTab, label: 'Demand Map', icon: MapPin, emoji: '📍', badge: 'Hotspots' },
    { id: 'submit' as NavTab, label: 'Submit Request', icon: FileEdit, emoji: '📝', badge: `${requestsCount}` },
    { id: 'insights' as NavTab, label: 'AI Policy Lab', icon: Sparkles, emoji: '🤖', badge: 'Gemini' },
    { id: 'projects' as NavTab, label: 'Gov Projects', icon: Hammer, emoji: '🏗️', badge: `${projectsCount}` },
    { id: 'impact' as NavTab, label: 'Impact Dashboard', icon: TrendingUp, emoji: '📊', badge: '4.2M' },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings, emoji: '⚙️', badge: null },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-[#1a237e]/20 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#f4f1ea] border-r-2 border-[#1a237e] flex flex-col justify-between transition-transform duration-200 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand & Logo Header */}
        <div>
          <div className="p-6 border-b-4 border-double border-[#1a237e] flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 mb-3 relative flex items-center justify-center">
               <div className="absolute inset-0 border-[3px] border-dashed border-[#1a237e]/40 rounded-full animate-[spin_60s_linear_infinite]"></div>
               <Building2 className="w-5 h-5 text-[#c84b31] relative z-10" />
            </div>
            <div>
              <span className="text-2xl font-serif font-bold tracking-tight text-[#1a237e] block leading-tight uppercase">
                Civic Pulse
              </span>
              <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#1a237e]/70 block leading-tight mt-2 border-t border-[#1a237e]/20 pt-2">
                India Atlas
              </span>
            </div>
          </div>

          {/* Nav Items List */}
          <nav className="p-3.5 space-y-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 text-xs font-sans font-semibold tracking-wide uppercase transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1a237e] text-[#f4f1ea] shadow-[2px_2px_0px_rgba(200,75,49,1)]'
                      : 'text-[#1a237e]/70 hover:text-[#1a237e] hover:bg-[#1a237e]/5'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-base">{item.emoji}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 font-mono ${
                      isActive
                        ? 'bg-[#c84b31] text-[#f4f1ea]'
                        : 'bg-[#1a237e]/10 text-[#1a237e]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom System Audit & Architecture Badge */}
        <div className="p-4 border-t-2 border-[#1a237e] space-y-3 bg-[#f4f1ea]">
          <div className="p-3 border border-[#1a237e] bg-white text-xs shadow-[2px_2px_0px_rgba(26,35,126,0.3)]">
            <div className="flex items-center justify-between mb-2 border-b border-[#1a237e]/10 pb-2">
              <span className="font-sans uppercase tracking-[0.2em] font-bold text-[#1a237e] text-[9px]">Data Stream</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32] animate-pulse"></span>
                <span className="text-[9px] font-sans uppercase tracking-widest text-[#2e7d32] font-bold">Live</span>
              </span>
            </div>
            <p className="text-[10px] font-mono text-[#1a237e]/80 leading-relaxed">
              Tracking citizen demand against global baseline metrics.
            </p>
          </div>

          <button
            onClick={onOpenMethodology}
            className="w-full py-2.5 bg-[#f4f1ea] hover:bg-[#1a237e]/5 text-[#1a237e] font-sans font-semibold text-[10px] tracking-widest uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#1a237e]"
          >
            <Info className="w-3.5 h-3.5 text-[#c84b31]" />
            <span>Architecture & Scale</span>
          </button>
        </div>
      </aside>
    </>
  );
};
