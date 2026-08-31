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
          className="fixed inset-0 z-40 bg-[#2d2d2d]/20 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#faf9f6] border-r border-[#2d2d2d]/10 flex flex-col justify-between transition-transform duration-200 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand & Logo Header */}
        <div>
          <div className="p-6 border-b border-[#2d2d2d]/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#e07a5f] flex items-center justify-center text-white">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-lg font-serif font-bold tracking-tight text-[#2d2d2d] block leading-tight">
                  CivicPulse
                </span>
                <span className="text-[10px] font-sans uppercase tracking-widest text-[#57534e] block leading-tight mt-1">
                  Atlas
                </span>
              </div>
            </div>
          </div>

          {/* Nav Items List */}
          <nav className="p-3.5 space-y-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-sans font-semibold tracking-wide uppercase transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#2d2d2d]/5 text-[#e07a5f] border-b-2 border-[#e07a5f]'
                      : 'text-[#57534e] hover:text-[#2d2d2d] hover:bg-[#2d2d2d]/5 border-b-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-base">{item.emoji}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 font-mono ${
                      isActive
                        ? 'bg-[#e07a5f] text-white'
                        : 'bg-[#2d2d2d]/5 text-[#57534e]'
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
        <div className="p-4 border-t border-[#2d2d2d]/10 space-y-3">
          <div className="p-3 bg-white/50 border border-[#2d2d2d]/10 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-sans uppercase tracking-widest font-semibold text-[#2d2d2d] text-[10px]">Data Stream</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#386641] animate-pulse"></span>
                <span className="text-[10px] font-sans uppercase tracking-widest text-[#386641] font-semibold">Live</span>
              </span>
            </div>
            <p className="text-[10px] font-sans text-[#57534e] leading-relaxed">
              Tracking citizen demand against global baseline metrics.
            </p>
          </div>

          <button
            onClick={onOpenMethodology}
            className="w-full py-2.5 bg-[#2d2d2d]/5 hover:bg-[#2d2d2d]/10 text-[#2d2d2d] font-sans font-semibold text-xs tracking-wide uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-[#2d2d2d]/10"
          >
            <Info className="w-3.5 h-3.5 text-[#e07a5f]" />
            <span>Architecture & Scale</span>
          </button>
        </div>
      </aside>
    </>
  );
};
