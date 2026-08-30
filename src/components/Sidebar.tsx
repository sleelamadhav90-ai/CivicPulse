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
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand & Logo Header */}
        <div>
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-xs text-white">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-slate-900 block leading-tight">
                  CivicPulse
                </span>
                <span className="text-[11px] font-medium text-slate-500 block leading-tight">
                  Infrastructure Intelligence
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
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-base">{item.emoji}</span>
                    <span className="text-xs">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom System Audit & Methodology Badge */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-800 text-[11px]">DPI Core Engine</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Deterministic priority math + Gemini multilingual voice parser.
            </p>
          </div>

          <button
            onClick={onOpenMethodology}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-blue-600" />
            <span>How It Works</span>
          </button>
        </div>
      </aside>
    </>
  );
};
