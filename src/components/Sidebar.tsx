import React from 'react';
import { 
  Building2, 
  Home, 
  MapPin, 
  Sparkles, 
  Layers, 
  Cpu, 
  DollarSign, 
  Radio, 
  Users, 
  CheckSquare, 
  TrendingUp, 
  Settings, 
  PlusCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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
  isOpenMobile,
  onCloseMobile,
}) => {
  const { t } = useLanguage();

  // Navigation structure adhering strictly to the requested narrative taxonomy:
  // LISTEN -> UNDERSTAND -> MEASURE NEED -> ALIGN INVESTMENT -> DECIDE -> IMPACT
  const navSections = [
    {
      titleKey: 'section.listen',
      items: [
        { id: 'signals' as NavTab, labelKey: 'nav.signals', icon: Radio, count: requestsCount },
      ]
    },
    {
      titleKey: 'section.understand',
      items: [
        { id: 'issues' as NavTab, labelKey: 'nav.issues', icon: Layers },
        { id: 'patterns' as NavTab, labelKey: 'nav.patterns', icon: Cpu },
      ]
    },
    {
      titleKey: 'section.measure_need',
      items: [
        { id: 'map' as NavTab, labelKey: 'nav.map', icon: MapPin },
        { id: 'infrastructure' as NavTab, labelKey: 'nav.infrastructure', icon: Building2 },
        { id: 'demographics' as NavTab, labelKey: 'nav.demographics', icon: Users },
      ]
    },
    {
      titleKey: 'section.align_investment',
      items: [
        { id: 'investment' as NavTab, labelKey: 'nav.investment', icon: DollarSign },
      ]
    },
    {
      titleKey: 'section.decide',
      items: [
        { id: 'recommendations' as NavTab, labelKey: 'nav.recommendations', icon: Sparkles },
        { id: 'action_queue' as NavTab, labelKey: 'nav.action_queue', icon: CheckSquare, count: projectsCount },
      ]
    },
    {
      titleKey: 'section.impact',
      items: [
        { id: 'impact' as NavTab, labelKey: 'nav.impact', icon: TrendingUp },
      ]
    }
  ];

  const handleTabClick = (tab: NavTab) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-[#171717]/50 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#1F1E1B] text-[#E8E6DF] border-r border-[#2D2B26] flex flex-col justify-between transition-transform duration-200 ease-in-out font-sans
        lg:static lg:translate-x-0 lg:z-auto lg:h-full lg:shrink-0
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="overflow-y-auto flex-1 min-h-0 py-5 px-3 space-y-5">
          {/* Platform Header */}
          <div className="px-2 pb-3 border-b border-[#2D2B26]">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 bg-[#D65A3A] text-white font-mono font-bold text-xs flex items-center justify-center rounded-xs shrink-0">
                CP
              </div>
              <div>
                <span className="text-lg font-serif font-bold tracking-tight text-white block leading-none">
                  {t('brand.name')}
                </span>
                <span className="text-[11px] text-[#A6A296] font-sans block mt-1">
                  {t('brand.tagline')}
                </span>
              </div>
            </div>

            {/* Quick citizen submission CTA */}
            <div className="mt-4">
              <button
                onClick={() => handleTabClick('submit')}
                className={`w-full py-2 px-3 flex items-center justify-center space-x-2 text-xs font-medium rounded-xs border transition-all cursor-pointer ${
                  activeTab === 'submit'
                    ? 'bg-[#D65A3A] text-white border-[#D65A3A]'
                    : 'bg-[#292824] hover:bg-[#34322D] text-[#FAF8F5] border-[#3D3A33]'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#D65A3A]" />
                <span>{t('nav.report_issue')}</span>
              </button>
            </div>
          </div>

          {/* Top-level Overview link */}
          <div className="px-1">
            <button
              onClick={() => handleTabClick('overview')}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xs transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#D65A3A] text-white font-semibold shadow-xs'
                  : 'text-[#FAF8F5] hover:bg-[#2A2925] hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Home className={`w-4 h-4 ${activeTab === 'overview' ? 'text-white' : 'text-[#A6A296]'}`} />
                <span>{t('nav.overview')}</span>
              </div>
            </button>
          </div>

          {/* Grouped Nav Sections */}
          <nav className="space-y-5 px-1" aria-label="Main Navigation">
            {navSections.map((sec) => (
              <div key={sec.titleKey} className="space-y-1">
                <div className="px-3 text-[10px] font-mono font-semibold text-[#8C887B] tracking-wider uppercase">
                  {t(sec.titleKey)}
                </div>

                <div className="space-y-0.5">
                  {sec.items.map((item) => {
                    const IconComp = item.icon;
                    const isActive = activeTab === item.id ||
                      (item.id === 'recommendations' && activeTab === 'engine') ||
                      (item.id === 'action_queue' && activeTab === 'projects');

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium rounded-xs transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-[#D65A3A] text-white font-semibold shadow-xs'
                            : 'text-[#D5D2C8] hover:bg-[#2A2925] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#8C887B]'}`} />
                          <span>{t(item.labelKey)}</span>
                        </div>
                        {item.count !== undefined && item.count > 0 && (
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-xs ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-[#2B2925] text-[#A6A296]'
                          }`}>
                            {item.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Settings */}
            <div className="pt-2 border-t border-[#2D2B26]">
              <button
                onClick={() => handleTabClick('settings')}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium rounded-xs transition-colors cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-[#D65A3A] text-white font-semibold'
                    : 'text-[#A6A296] hover:bg-[#2A2925] hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Settings className="w-3.5 h-3.5 text-[#8C887B]" />
                  <span>{t('nav.settings')}</span>
                </div>
              </button>
            </div>
          </nav>
        </div>

        {/* Quiet Footer */}
        <div className="p-3 border-t border-[#2D2B26] bg-[#1A1916] text-[11px] text-[#8C887B] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="font-sans">{t('brand.india_stack')}</span>
          </div>
          <button
            onClick={onOpenMethodology}
            className="text-[11px] text-[#A6A296] hover:text-white underline cursor-pointer"
          >
            {t('nav.methodology')}
          </button>
        </div>
      </aside>
    </>
  );
};

