import React, { useState } from 'react';
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
  Search,
  X,
  ArrowRight,
  Globe,
  Radio,
  Sliders,
  ShieldCheck,
  Award
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface PortalHubProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  requestsCount: number;
  projectsCount: number;
}

export interface PortalModule {
  id: NavTab;
  title: string;
  category: 'core' | 'intelligence' | 'execution' | 'global' | 'tools';
  categoryLabel: string;
  categoryEmoji: string;
  icon: React.FC<{ className?: string }>;
  emoji: string;
  badge?: string;
  badgeColor?: string;
  tagline: string;
  description: string;
  userPersonas: string[];
  keyFeatures: string[];
}

export const PORTAL_MODULES: PortalModule[] = [
  // CORE DECISION PORTAL
  {
    id: 'overview',
    title: 'Executive Overview',
    category: 'core',
    categoryLabel: 'CORE DECISION PORTAL',
    categoryEmoji: '🎯',
    icon: Home,
    emoji: '🏛️',
    badge: 'Hub Home',
    badgeColor: 'bg-[#171717] text-white',
    tagline: 'Relational Civic Intelligence & DPI Closed-Loop Dashboard',
    description: 'Central executive portal presenting citizen demand signals, 4-step DPI loop, high-demand district rankings, and top AI project recommendations.',
    userPersonas: ['Executive Officials', 'Ministers', 'General Public'],
    keyFeatures: ['Relational Graph Flow', 'Top AI Recommendations', '4-Step DPI Loop', 'Citizen Demand Signals']
  },
  {
    id: 'map',
    title: 'Policy GIS Map',
    category: 'core',
    categoryLabel: 'CORE DECISION PORTAL',
    categoryEmoji: '🎯',
    icon: MapPin,
    emoji: '🗺️',
    badge: 'GIS Layer',
    badgeColor: 'bg-[#D65A3A] text-white',
    tagline: 'Interactive Municipal Deficit Map & Spatial Analytics',
    description: 'Visual map interface layering citizen demand against census demographics and infrastructure access deficits (Water, Health, Roads, Electricity, Education, Drainage).',
    userPersonas: ['Urban Planners', 'District Collectors', 'Field Engineers'],
    keyFeatures: ['Interactive SVG/Canvas Map', 'Deficit Sliders', 'District Inspector', 'Demographic Overlay']
  },
  {
    id: 'engine',
    title: 'Recommendations & Priority Engine',
    category: 'core',
    categoryLabel: 'CORE DECISION PORTAL',
    categoryEmoji: '🎯',
    icon: Sparkles,
    emoji: '💡',
    badge: 'AI Priority',
    badgeColor: 'bg-[#D65A3A] text-white',
    tagline: 'Multi-Factor Capital Infrastructure Prioritization',
    description: 'Auditable formula computing 0–100 priority scores based on citizen demand, infrastructure deficits, population density, urgency, and expenditure audits.',
    userPersonas: ['State Planning Commission', 'Budget Committee', 'Auditors'],
    keyFeatures: ['Multi-Factor Ranking', 'Convert to Gov Project', 'Investment Audit Panel', 'Score Audit Breakdown']
  },
  {
    id: 'investment',
    title: 'Investment & Plan Data Audit',
    category: 'core',
    categoryLabel: 'CORE DECISION PORTAL',
    categoryEmoji: '🎯',
    icon: DollarSign,
    emoji: '💰',
    badge: '₹120 Cr Tracked',
    badgeColor: 'bg-[#285943] text-white',
    tagline: 'State Scheme Expenditure & 5-Question AI Audit Engine',
    description: 'Tracks capital outlay across Jal Jeevan, PMGSY, NHM, and Swachh Bharat schemes. Cross-references actual spending against citizen ground outcomes.',
    userPersonas: ['Finance Ministry', 'Public Accounts Audit', 'Media & Investigators'],
    keyFeatures: ['Capital Pipeline Waterfall', '4-Quadrant Need vs Spent Matrix', '5 AI Audit Anomaly Signals', 'Scheme Traceability']
  },

  // INTELLIGENCE & SIGNALS
  {
    id: 'briefing',
    title: 'Daily Government Briefing',
    category: 'intelligence',
    categoryLabel: 'INTELLIGENCE & SIGNALS',
    categoryEmoji: '📡',
    icon: FileText,
    emoji: '📰',
    badge: 'Daily Memo',
    badgeColor: 'bg-amber-600 text-white',
    tagline: 'Executive Daily Intelligence Briefing & Alert Feeds',
    description: 'Daily executive brief highlighting top 3 priority actions, emergency deficit spikes, regional alerts, and ministerial decision briefs.',
    userPersonas: ['Chief Minister Office', 'Department Heads', 'Media Advisors'],
    keyFeatures: ['Daily Executive Summary', 'Top 3 Actionable Priorities', 'Deficit Spike Feeds', '1-Click PDF Export']
  },
  {
    id: 'patterns',
    title: 'Community Signals Intelligence',
    category: 'intelligence',
    categoryLabel: 'INTELLIGENCE & SIGNALS',
    categoryEmoji: '📡',
    icon: Cpu,
    emoji: '🔎',
    badge: '327 Issues',
    badgeColor: 'bg-[#171717] text-white',
    tagline: 'AI Pattern Clustering & Grievance Anomaly Detection',
    description: 'Automatically clusters thousands of raw citizen reports into emerging trends, spatial clusters, recurring bottlenecks, and government scheme gaps.',
    userPersonas: ['Data Scientists', 'Civic Researchers', 'Grievance Officers'],
    keyFeatures: ['Trend & Cluster Detection', 'Cross-Domain Hotspots', 'Scheme Gap Traceability', 'Raw Signal Stream']
  },
  {
    id: 'insights',
    title: 'AI Policy Lab',
    category: 'intelligence',
    categoryLabel: 'INTELLIGENCE & SIGNALS',
    categoryEmoji: '📡',
    icon: Sparkles,
    emoji: '🤖',
    badge: 'Gemini AI',
    badgeColor: 'bg-blue-600 text-white',
    tagline: 'Generative Policy Memo & Sanction Proposal Builder',
    description: 'Powered by Gemini AI to draft formal ministerial memos, technical engineering specs, budget justifications, and ROI impact projections.',
    userPersonas: ['Policy Analysts', 'Cabinet Secretaries', 'Legislators'],
    keyFeatures: ['Gemini Policy Builder', 'Customizable Parameters', 'Budget & Timeline Breakdown', 'Export Sanction Memo']
  },

  // PROJECTS & EXECUTION
  {
    id: 'projects',
    title: 'Government Projects Tracker',
    category: 'execution',
    categoryLabel: 'PROJECTS & EXECUTION',
    categoryEmoji: '🏗️',
    icon: Hammer,
    emoji: '🏗️',
    badge: 'Lifecycle',
    badgeColor: 'bg-[#285943] text-white',
    tagline: 'Sanctioned Capital Works Lifecycle & Execution Audit',
    description: 'Tracks state infrastructure projects from Recommendation ➔ Sanction ➔ Execution ➔ Commissioning with audit logs and contractor tracking.',
    userPersonas: ['Chief Engineers', 'Contractors', 'Public Works Dept'],
    keyFeatures: ['4-Stage Lifecycle State', 'Audit History Trail', 'Contractor Officer Tagging', 'Completion Verification']
  },
  {
    id: 'impact',
    title: 'Impact Simulator',
    category: 'execution',
    categoryLabel: 'PROJECTS & EXECUTION',
    categoryEmoji: '🏗️',
    icon: TrendingUp,
    emoji: '📊',
    badge: 'Modeled Impact',
    badgeColor: 'bg-amber-700 text-white',
    tagline: 'Assumption-Based Capital Allocation & Deficit Reduction Modeling',
    description: 'Deterministic simulation tool quantifying how proposed capital investments could reduce infrastructure access gaps and citizen signals.',
    userPersonas: ['Budget Officers', 'Economists', 'Policy Researchers'],
    keyFeatures: ['Capital Allocation Slider', 'Modeled Reduction Curve', 'Beneficiary Population Reach', 'Baseline vs Modeled Comparison']
  },
  {
    id: 'submit',
    title: 'Citizen Voice Ingestion',
    category: 'execution',
    categoryLabel: 'PROJECTS & EXECUTION',
    categoryEmoji: '🏗️',
    icon: FileEdit,
    emoji: '📝',
    badge: 'Multilingual Voice',
    badgeColor: 'bg-[#D65A3A] text-white',
    tagline: 'Regional Voice & Text Grievance Submission Portal',
    description: 'Allows citizens to submit infrastructure complaints in regional languages (Telugu, Hindi, Marathi) via voice recording, photo attachment, or text.',
    userPersonas: ['Citizens', 'Community Advocates', 'Field Surveyors'],
    keyFeatures: ['Multilingual Voice-to-Text', 'Photo Upload & AI Vision', 'Geo-Tagging', 'Live Ingestion Stream']
  },

  // GLOBAL DPI ARCHITECTURE
  {
    id: 'world',
    title: 'Global World Atlas',
    category: 'global',
    categoryLabel: 'GLOBAL DPI ARCHITECTURE',
    categoryEmoji: '🌍',
    icon: Globe,
    emoji: '🌍',
    badge: 'BRICS / Global',
    badgeColor: 'bg-[#D9A441] text-[#171717]',
    tagline: 'BRICS & Global Civic Infrastructure Deployment Canvas',
    description: 'Interactive global map showcasing CivicPulse deployment adapters across BRICS and Global South nations (India, Brazil, South Africa, Indonesia, Nigeria).',
    userPersonas: ['Multilateral Delegates', 'UN/World Bank Observers', 'Global Engineers'],
    keyFeatures: ['Interactive Global Canvas', 'Country Adapter Switcher', 'National Data Feeds', 'Universal Schema Sync']
  },
  {
    id: 'connectors',
    title: 'Country Connectors & Adapters',
    category: 'global',
    categoryLabel: 'GLOBAL DPI ARCHITECTURE',
    categoryEmoji: '🌍',
    icon: Box,
    emoji: '🔌',
    badge: '5 Adapters',
    badgeColor: 'bg-[#171717] text-white',
    tagline: 'National Grievance Feed Integration Technical Specs',
    description: 'Technical connector specifications for linking national platforms like India CPGRAMS, Brazil Fala.BR, Kenya e-Citizen, and Indonesia LAPOR!.',
    userPersonas: ['System Integrators', 'DevOps Engineers', 'Data Architects'],
    keyFeatures: ['CPGRAMS Connector API', 'Universal Data Contract', 'JSON Payload Spec', 'Adapter Status Feed']
  },
  {
    id: 'blocks',
    title: 'Modular Infrastructure Blocks',
    category: 'global',
    categoryLabel: 'GLOBAL DPI ARCHITECTURE',
    categoryEmoji: '🌍',
    icon: Box,
    emoji: '🧱',
    badge: '8 Reusable Blocks',
    badgeColor: 'bg-[#285943] text-white',
    tagline: '8 Reusable Open Source Public DPI Software Components',
    description: 'Interactive catalog of 8 modular building blocks that can be decoupled and embedded into any government or municipal portal.',
    userPersonas: ['Software Architects', 'Open Source Developers', 'CTOs'],
    keyFeatures: ['8 Reusable Code Blocks', 'Live Sandbox Previews', 'Copyable Schemas', 'India Stack Principles']
  },

  // PORTAL TOOLS
  {
    id: 'settings',
    title: 'Settings & Architecture Specs',
    category: 'tools',
    categoryLabel: 'PORTAL TOOLS',
    categoryEmoji: '⚙️',
    icon: Settings,
    emoji: '⚙️',
    badge: 'Config',
    badgeColor: 'bg-[#171717] text-white',
    tagline: 'System Settings, Data Reset & Technical Blueprint Specs',
    description: 'Manage portal configurations, reset sample signal streams, inspect system architecture blueprints, and download technical documentation.',
    userPersonas: ['Portal Administrators', 'Security Officers'],
    keyFeatures: ['Data Stream Reset', 'Architecture Blueprint', 'Storage Inspector', 'Export System Logs']
  }
];

export const PortalHubModal: React.FC<PortalHubProps> = ({
  isOpen,
  onClose,
  activeTab,
  onNavigate,
  requestsCount,
  projectsCount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredModules = PORTAL_MODULES.filter(m => {
    const matchesCategory = selectedCategoryFilter === 'ALL' || m.category === selectedCategoryFilter;
    const matchesSearch = 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.userPersonas.some(p => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.keyFeatures.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'ALL', label: 'All 14 Modules', emoji: '🗂️' },
    { id: 'core', label: 'Core Decision Portal', emoji: '🎯' },
    { id: 'intelligence', label: 'Intelligence & Signals', emoji: '📡' },
    { id: 'execution', label: 'Projects & Execution', emoji: '🏗️' },
    { id: 'global', label: 'Global DPI Layer', emoji: '🌍' },
    { id: 'tools', label: 'Portal Tools', emoji: '⚙️' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#171717]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#F7F5EF] border-2 border-[#171717] shadow-[8px_8px_0px_#171717] max-h-[90vh] flex flex-col overflow-hidden font-sans">
        
        {/* Header Bar */}
        <div className="bg-[#171717] text-[#F7F5EF] p-4 sm:p-5 flex items-center justify-between border-b-2 border-[#171717]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-[#D65A3A] text-white flex items-center justify-center font-serif font-bold text-lg shadow-[2px_2px_0px_#ffffff]">
              CP
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-lg text-white uppercase tracking-tight">
                  CIVICPULSE PORTAL DIRECTORY
                </span>
                <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-[#285943] text-white font-bold tracking-widest">
                  14 MODULES READY
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono">
                Complete Digital Public Infrastructure suite for citizens, ministers, planners & global delegates.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-[#D65A3A] text-white transition-colors cursor-pointer border border-white/20"
            title="Close Directory"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="p-4 bg-white border-b border-[#171717] flex flex-col md:flex-row items-center justify-between gap-3 font-mono">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#171717]/50 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search module, feature, or persona..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#F7F5EF] border border-[#171717] text-xs font-mono text-[#171717] focus:outline-none focus:border-[#D65A3A]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border ${
                  selectedCategoryFilter === cat.id
                    ? 'bg-[#171717] text-[#F7F5EF] border-[#171717] shadow-[1px_1px_0px_#D65A3A]'
                    : 'bg-[#F7F5EF] text-[#171717]/80 hover:bg-[#171717]/10 border-[#171717]/30'
                }`}
              >
                <span className="mr-1">{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Directory Modules Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {filteredModules.length === 0 ? (
            <div className="text-center py-12 bg-white border border-[#171717] p-8 space-y-3 font-mono">
              <span className="text-3xl">🔎</span>
              <h3 className="text-base font-bold text-[#171717]">No Portal Modules Match Your Query</h3>
              <p className="text-xs text-[#171717]/70">Try searching for keywords like "Water", "Gemini", "Map", "Budget", or "Voice".</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategoryFilter('ALL'); }}
                className="px-4 py-2 bg-[#171717] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
              {filteredModules.map((mod) => {
                const IconComp = mod.icon;
                const isActive = activeTab === mod.id;

                return (
                  <div
                    key={mod.id}
                    onClick={() => {
                      onNavigate(mod.id);
                      onClose();
                    }}
                    className={`bg-white border-2 border-[#171717] p-4 flex flex-col justify-between transition-all cursor-pointer group hover:-translate-y-1 ${
                      isActive 
                        ? 'shadow-[4px_4px_0px_#D65A3A] border-[#D65A3A]' 
                        : 'shadow-[4px_4px_0px_#171717] hover:shadow-[6px_6px_0px_#D65A3A]'
                    }`}
                  >
                    {/* Top Header */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between border-b border-[#171717]/15 pb-2">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#171717]/70 flex items-center gap-1">
                          <span>{mod.categoryEmoji}</span>
                          <span>{mod.categoryLabel}</span>
                        </span>
                        {mod.badge && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 border border-[#171717] ${mod.badgeColor}`}>
                            {mod.badge}
                          </span>
                        )}
                      </div>

                      <div className="flex items-start space-x-2.5 pt-1">
                        <span className="text-2xl shrink-0 p-1 bg-[#F7F5EF] border border-[#171717]">
                          {mod.emoji}
                        </span>
                        <div>
                          <h3 className="text-sm font-serif font-bold text-[#171717] uppercase tracking-tight group-hover:text-[#D65A3A] transition-colors leading-tight">
                            {mod.title}
                          </h3>
                          <p className="text-[10px] text-[#D65A3A] font-bold mt-0.5">
                            {mod.tagline}
                          </p>
                        </div>
                      </div>

                      <p className="text-[11px] font-sans text-[#171717]/80 leading-relaxed pt-1">
                        {mod.description}
                      </p>

                      {/* Feature Tags */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {mod.keyFeatures.slice(0, 3).map((feat, i) => (
                          <span key={i} className="text-[9px] bg-[#F7F5EF] text-[#171717] px-1.5 py-0.5 border border-[#171717]/20">
                            • {feat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-4 pt-3 border-t border-[#171717]/15 flex items-center justify-between text-xs">
                      <span className="text-[9px] text-[#171717]/60 font-sans italic">
                        For: {mod.userPersonas[0]}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#171717] group-hover:text-[#D65A3A] flex items-center gap-1">
                        <span>Launch Module</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Footer Info */}
        <div className="p-3 bg-[#171717] text-[#F7F5EF] border-t-2 border-[#171717] flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-xs">
          <div className="flex items-center space-x-2 text-[10px]">
            <span className="text-[#D65A3A] font-bold uppercase">CIVICPULSE DPI PORTAL</span>
            <span>•</span>
            <span className="text-slate-300">14 Modular Open Blocks</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">Live System</span>
          </div>

          <div className="text-[10px] text-slate-400">
            Click any module to jump directly to its dedicated interface
          </div>
        </div>

      </div>
    </div>
  );
};
