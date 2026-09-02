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
  Info,
  Layers,
  Cpu,
  Box,
  Share2,
  FileText,
  DollarSign
} from 'lucide-react';

export type NavTab = 'world' | 'briefing' | 'map' | 'patterns' | 'engine' | 'investment' | 'connectors' | 'blocks' | 'overview' | 'submit' | 'insights' | 'projects' | 'impact' | 'settings';

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
    { id: 'briefing' as NavTab, label: 'Gov Briefing', icon: FileText, emoji: '📰', badge: 'Daily' },
    { id: 'map' as NavTab, label: 'Policy Map', icon: MapPin, emoji: '🗺️', badge: 'Main' },
    { id: 'patterns' as NavTab, label: 'Community Signals', icon: Cpu, emoji: '🔎', badge: '327 Issues' },
    { id: 'engine' as NavTab, label: 'Recommendations', icon: Sparkles, emoji: '💡', badge: 'AI Portal' },
    { id: 'investment' as NavTab, label: 'Investment Audit', icon: DollarSign, emoji: '💰', badge: '₹120 Cr' },
    { id: 'world' as NavTab, label: 'Global World Atlas', icon: MapPin, emoji: '🌍', badge: 'BRICS / Global' },
    { id: 'connectors' as NavTab, label: 'Country Connectors', icon: Box, emoji: '🔌', badge: 'Adapters' },
    { id: 'blocks' as NavTab, label: 'Infrastructure Blocks', icon: Box, emoji: '🧱', badge: '8 Reusable' },
    { id: 'overview' as NavTab, label: 'Overview', icon: Home, emoji: '🏛️', badge: null },
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
          className="fixed inset-0 z-40 bg-[#171717]/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#F7F5EF] border-r border-[#171717] flex flex-col justify-between transition-transform duration-200 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div>
          <div className="p-5 border-b border-[#171717] bg-white flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 mb-2 border border-[#171717] bg-[#D65A3A] text-white flex items-center justify-center font-serif font-bold text-lg shadow-[2px_2px_0px_#171717]">
              CP
            </div>
            <div>
              <span className="text-xl font-serif font-bold tracking-tight text-[#171717] block leading-tight uppercase">
                CIVICPULSE
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#171717]/70 block leading-tight mt-1 border-t border-[#171717]/10 pt-1">
                CIVIC INFRASTRUCTURE BLOCKS
              </span>
            </div>
          </div>

          {/* Navigation Items List */}
          <nav className="p-3 space-y-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#171717] text-[#F7F5EF] shadow-[2px_2px_0px_#D65A3A]'
                      : 'text-[#171717]/80 hover:text-[#171717] hover:bg-[#171717]/5'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-sm">{item.emoji}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 font-mono ${
                      isActive
                        ? 'bg-[#D65A3A] text-white'
                        : 'bg-[#171717]/10 text-[#171717]'
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
        <div className="p-4 border-t border-[#171717] space-y-3 bg-[#F7F5EF]">
          <div className="p-3 border border-[#171717] bg-white text-xs shadow-[2px_2px_0px_#171717]">
            <div className="flex items-center justify-between mb-1.5 border-b border-[#171717]/10 pb-1.5">
              <span className="font-mono uppercase tracking-widest font-bold text-[#D65A3A] text-[9px]">DESIGN SYSTEM</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#285943] animate-pulse"></span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#285943] font-bold">Active</span>
              </span>
            </div>
            <p className="text-[10px] font-mono text-[#171717]/80 leading-relaxed">
              India Stack × Bloomberg data viz × open infrastructure.
            </p>
          </div>

          <button
            onClick={onOpenMethodology}
            className="w-full py-2 bg-[#F7F5EF] hover:bg-[#171717]/5 text-[#171717] font-mono font-bold text-[10px] tracking-widest uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#171717]"
          >
            <Info className="w-3.5 h-3.5 text-[#D65A3A]" />
            <span>Architecture Specs</span>
          </button>
        </div>
      </aside>
    </>
  );
};
