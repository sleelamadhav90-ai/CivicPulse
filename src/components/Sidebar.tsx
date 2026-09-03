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
  DollarSign,
  Grid,
  Globe,
  Radio,
  Users,
  CheckSquare,
  ListFilter
} from 'lucide-react';

export type NavTab = 
  | 'overview' 
  | 'signals' 
  | 'issues' 
  | 'patterns' 
  | 'infrastructure' 
  | 'demographics' 
  | 'investment' 
  | 'recommendations' 
  | 'impact' 
  | 'action_queue' 
  | 'map' 
  | 'briefing' 
  | 'insights' 
  | 'world' 
  | 'settings'
  | 'submit'
  | 'connectors'
  | 'blocks'
  | 'engine'
  | 'projects';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  requestsCount: number;
  projectsCount?: number;
  onOpenMethodology: () => void;
  onOpenPortalDirectory?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  requestsCount,
  projectsCount = 6,
  onOpenMethodology,
  onOpenPortalDirectory,
  isOpenMobile,
  onCloseMobile,
}) => {
  const primaryNavSections = [
    {
      title: 'HOME',
      items: [
        { id: 'overview' as NavTab, label: 'Home', icon: Home, badge: 'Overview' },
      ]
    },
    {
      title: 'UNDERSTAND',
      items: [
        { id: 'signals' as NavTab, label: 'Citizen Signals', icon: Radio, badge: `${requestsCount}` },
        { id: 'issues' as NavTab, label: 'Community Issues', icon: Layers, badge: '327' },
        { id: 'patterns' as NavTab, label: 'AI Patterns', icon: Cpu, badge: 'Feed' },
      ]
    },
    {
      title: 'EXPLORE',
      items: [
        { id: 'infrastructure' as NavTab, label: 'Infrastructure', icon: Building2, badge: 'Assets' },
        { id: 'demographics' as NavTab, label: 'Population', icon: Users, badge: 'Census' },
        { id: 'investment' as NavTab, label: 'Government Investment', icon: DollarSign, badge: '₹120 Cr' },
      ]
    },
    {
      title: 'DECIDE',
      items: [
        { id: 'recommendations' as NavTab, label: 'Recommendations', icon: Sparkles, badge: 'AI' },
        { id: 'action_queue' as NavTab, label: 'Action Queue', icon: CheckSquare, badge: `${projectsCount}` },
        { id: 'impact' as NavTab, label: 'Impact', icon: TrendingUp, badge: '4.2M' },
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        { id: 'settings' as NavTab, label: 'Settings', icon: Settings, badge: null },
        { id: 'world' as NavTab, label: 'Global World Atlas', icon: Globe, badge: 'BRICS' },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out overflow-y-auto font-sans
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Official Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-700 text-white font-mono font-bold text-sm flex items-center justify-center border border-blue-500 shadow-xs shrink-0">
              CP
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white block uppercase leading-tight font-sans">
                CivicPulse
              </span>
              <span className="text-[9px] font-mono tracking-wider text-slate-400 block mt-0.5">
                Public Infrastructure & Intelligence
              </span>
            </div>
          </div>

          {/* Directory Launcher Button */}
          {onOpenPortalDirectory && (
            <div className="p-2 border-b border-slate-800 bg-slate-900">
              <button
                onClick={onOpenPortalDirectory}
                className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center justify-between cursor-pointer border border-slate-700"
              >
                <div className="flex items-center space-x-2">
                  <Grid className="w-3.5 h-3.5 text-blue-400" />
                  <span>Module Directory</span>
                </div>
                <span className="px-1.5 py-0.2 bg-blue-900 text-blue-200 text-[9px] font-mono border border-blue-700">14 Apps</span>
              </button>
            </div>
          )}

          {/* Categorized Navigation */}
          <nav className="p-2 space-y-3" aria-label="Main Navigation">
            {primaryNavSections.map((sec, secIdx) => (
              <div key={secIdx} className="space-y-0.5">
                <div className="px-2 pt-1 pb-1 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800/80 mb-1">
                  {sec.title}
                </div>

                {sec.items.map((item) => {
                  const IconComp = item.icon;
                  // Handle aliases
                  const isActive = activeTab === item.id || 
                    (item.id === 'recommendations' && activeTab === 'engine') ||
                    (item.id === 'action_queue' && activeTab === 'projects') ||
                    (item.id === 'signals' && activeTab === 'submit');

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium tracking-wide transition-colors cursor-pointer border ${
                        isActive
                          ? 'bg-blue-800 text-white border-blue-600 font-semibold shadow-xs'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="text-[11px]">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[8px] px-1.5 py-0.2 font-mono uppercase font-bold border ${
                          isActive
                            ? 'bg-white text-blue-900 border-white'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom System Specs */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 space-y-2 shrink-0 font-mono text-[10px]">
          <div className="p-2 border border-slate-800 bg-slate-900 text-slate-300">
            <div className="flex items-center justify-between mb-1 border-b border-slate-800 pb-1">
              <span className="uppercase font-bold text-blue-400 text-[9px]">DPI PIPELINE</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>ONLINE</span>
              </span>
            </div>
            <p className="text-[9px] text-slate-400 leading-relaxed font-sans">
              7-Stage Closed Loop Civic Support Platform.
            </p>
          </div>

          <button
            onClick={onOpenMethodology}
            className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-[9px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-800"
          >
            <Info className="w-3 h-3 text-blue-400" />
            <span>Architecture Specs</span>
          </button>
        </div>
      </aside>
    </>
  );
};


