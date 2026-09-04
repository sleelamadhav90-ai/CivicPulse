import React, { useState } from 'react';
import { 
  Box, 
  Cpu, 
  Globe, 
  Layers, 
  CheckCircle2, 
  Radio, 
  Sparkles, 
  Share2, 
  Code, 
  Plus, 
  Languages, 
  ShieldCheck, 
  Database,
  Sliders,
  FileText,
  Activity,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { CountryCode, UniversalCivicSchema } from '../types';
import { GLOBAL_COUNTRIES, SAMPLE_UNIVERSAL_SCHEMAS } from '../data/globalConfig';

interface GlobalConnectorsViewProps {
  selectedCountryCode: CountryCode;
  onSelectCountry: (code: CountryCode) => void;
  selectedLanguage: string;
  onSelectLanguage: (langCode: string) => void;
}

export const GlobalConnectorsView: React.FC<GlobalConnectorsViewProps> = ({
  selectedCountryCode,
  onSelectCountry,
  selectedLanguage,
  onSelectLanguage,
}) => {
  const [activeTab, setActiveTab] = useState<'adapters' | 'schema' | 'modules' | 'layers'>('adapters');
  const [selectedSchemaId, setSelectedSchemaId] = useState<string>('CP-UNI-901');
  const [customCategories, setCustomCategories] = useState<string[]>([
    'Transportation', 'Healthcare', 'Education', 'Water & Sanitation', 'Energy Grid', 'Digital Access', 'Housing', 'Environment'
  ]);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const selectedCountry = GLOBAL_COUNTRIES[selectedCountryCode];
  const activeSchema = SAMPLE_UNIVERSAL_SCHEMAS.find(s => s.requestId === selectedSchemaId) || SAMPLE_UNIVERSAL_SCHEMAS[0];

  const handleAddCategory = () => {
    if (newCategoryInput.trim() && !customCategories.includes(newCategoryInput.trim())) {
      setCustomCategories([...customCategories, newCategoryInput.trim()]);
      setNewCategoryInput('');
      setIsAddingCategory(false);
    }
  };

  return (
    <div className="w-full bg-[#F7F5EF] border border-[#171717] shadow-[6px_6px_0px_#171717] font-sans p-6 sm:p-8 space-y-8">
      
      {/* Top Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#171717] pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#D65A3A] text-white font-mono text-[10px] font-bold uppercase tracking-widest">
            <Box className="w-3.5 h-3.5" />
            INDIAN DPI DATA CONNECTORS & SCHEMA ENGINE
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#171717] tracking-tight">
            BUILT FOR INDIA STACK. SCALABLE BY DESIGN.
          </h1>
          <p className="text-sm text-[#171717]/80 font-sans max-w-3xl leading-relaxed">
            CivicPulse connects directly to Indian public infrastructure sources (Jal Jeevan Mission, PMGSY Roads, Census Baselines, Bhashini Voice AI). Its modular architecture separates intelligence logic from datasets, enabling smooth scale to other public systems.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {[
            { id: 'adapters', label: 'Data Connectors', icon: Database },
            { id: 'schema', label: 'Universal Schema', icon: Code },
            { id: 'modules', label: 'Civic Blocks', icon: Box },
            { id: 'layers', label: 'Layer Stack', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1.5 border border-[#171717] ${
                  isActive
                    ? 'bg-[#171717] text-[#F7F5EF] shadow-[2px_2px_0px_#D65A3A]'
                    : 'bg-white text-[#171717] hover:bg-[#171717]/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-[#D65A3A]" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: COUNTRY ADAPTERS & CONNECTORS */}
      {activeTab === 'adapters' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Architectural ASCII Flow Diagram */}
          <div className="p-6 bg-[#171717] text-[#F7F5EF] border border-[#171717] shadow-[4px_4px_0px_#D65A3A] font-mono text-xs overflow-x-auto">
            <div className="flex items-center justify-between border-b border-white/20 pb-2 text-[10px] text-[#D9A441] font-bold">
              <span>CIVICPULSE CORE PLATFORM → ADAPTER ARCHITECTURE</span>
              <span>STANDARDIZED CORE | LOCALIZED EDGE</span>
            </div>

            <pre className="py-4 text-center sm:text-left leading-relaxed text-white font-bold tracking-wider select-all">
{`                        CIVICPULSE CORE
                             │
        ┌────────────────────┼────────────────────┐
        ↓                    ↓                    ↓
    🇮🇳 India Adapter     🇧🇷 Brazil Adapter    🇿🇦 Africa Adapter
        ↓                    ↓                    ↓
   Local APIs           Local APIs           Local APIs
   (Jal Jeevan/PWD)     (IBGE/SUS/ Fala.BR)  (Stats SA/DWS)
        ↓                    ↓                    ↓
   Local Data           Local Data           Local Data
        └────────────────────┼────────────────────┘
                             ↓
                    COMMON CIVIC ENGINE`}
            </pre>

            <div className="pt-2 border-t border-white/20 text-[11px] text-white/70 font-sans">
              <strong>Core Principle:</strong> The AI pipeline, priority scoring formula, and universal civic schema remain identical everywhere. Only the country connectors, languages, and government registries change.
            </div>
          </div>

          {/* CONNECTORS STATUS GRID BY COUNTRY */}
          <div className="space-y-4">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="font-bold text-[#171717] uppercase tracking-wider">
                ACTIVE COUNTRY CONNECTORS & APIS
              </span>
              <span className="text-[#285943] font-bold">● 18 CONNECTORS ONLINE</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
              {Object.values(GLOBAL_COUNTRIES).map((country) => (
                <div 
                  key={country.code}
                  className={`p-5 bg-white border border-[#171717] shadow-[4px_4px_0px_#171717] space-y-4 ${
                    country.code === selectedCountryCode ? 'ring-2 ring-[#D65A3A]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-[#171717]/10 pb-2">
                    <div className="flex items-center space-x-2 text-sm font-bold">
                      <span>{country.flag}</span>
                      <span className="uppercase">{country.name}</span>
                    </div>
                    <button
                      onClick={() => onSelectCountry(country.code)}
                      className="text-[10px] px-2 py-0.5 bg-[#171717] text-white hover:bg-[#D65A3A] transition-colors cursor-pointer uppercase font-bold"
                    >
                      {country.code === selectedCountryCode ? 'Active' : 'Switch'}
                    </button>
                  </div>

                  {/* Connectors List */}
                  <div className="space-y-2">
                    {country.connectors.map((conn) => (
                      <div 
                        key={conn.id}
                        className="p-2.5 bg-[#F7F5EF] border border-[#171717]/20 flex items-start justify-between gap-2"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-[11px] text-[#171717]">{conn.name}</div>
                          <div className="text-[9px] text-[#171717]/60 font-sans">{conn.provider}</div>
                          <div className="text-[9px] text-[#285943] font-bold">{conn.recordsCount}</div>
                        </div>
                        <span className="px-1.5 py-0.5 bg-[#285943] text-white font-bold text-[9px] uppercase tracking-wider shrink-0">
                          {conn.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#171717]/10 text-[10px] text-[#171717]/70 font-sans flex items-center justify-between">
                    <span>Hierarchy:</span>
                    <span className="font-mono font-bold text-[#171717]">{country.hierarchy.level2} → {country.hierarchy.level3}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: UNIVERSAL CIVIC SCHEMA INSPECTOR */}
      {activeTab === 'schema' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Section Description */}
          <div className="p-4 bg-white border border-[#171717] font-mono text-xs space-y-2 shadow-[4px_4px_0px_#171717]">
            <div className="flex items-center justify-between text-[#D65A3A] font-bold">
              <span>MULTILINGUAL INGESTION → UNIVERSAL CIVIC SCHEMA</span>
              <span>STANDARDIZED DATA FORMAT</span>
            </div>
            <p className="text-xs font-sans text-[#171717]/80 leading-relaxed">
              Regardless of country, language, or channel (Telugu audio call, Portuguese WhatsApp, Russian portal, or Zulu SMS), every citizen input is normalized into a single <strong>Universal Civic Schema</strong> for global prioritization.
            </p>
          </div>

          {/* Schema Inspector Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Input Selector */}
            <div className="lg:col-span-5 space-y-3 font-mono text-xs">
              <span className="font-bold text-[#171717] uppercase tracking-wider block">
                SELECT SAMPLE NATIVE REQUEST
              </span>

              {SAMPLE_UNIVERSAL_SCHEMAS.map((item) => {
                const isSelected = item.requestId === selectedSchemaId;
                const country = GLOBAL_COUNTRIES[item.countryCode];
                return (
                  <button
                    key={item.requestId}
                    onClick={() => setSelectedSchemaId(item.requestId)}
                    className={`w-full text-left p-4 border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-white border-2 border-[#D65A3A] shadow-[4px_4px_0px_#D65A3A]'
                        : 'bg-[#F7F5EF] border-[#171717] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 font-bold">
                        <span>{country.flag}</span>
                        <span>{country.name} ({item.originalLanguage.split(' ')[0]})</span>
                      </div>
                      <span className="px-1.5 py-0.5 bg-[#171717] text-white text-[9px]">
                        {item.evidenceType}
                      </span>
                    </div>

                    <div className="text-[11px] font-sans italic text-[#171717]/80 line-clamp-2">
                      "{item.originalText}"
                    </div>

                    <div className="flex items-center justify-between text-[10px] border-t border-[#171717]/10 pt-1.5 font-mono">
                      <span className="text-[#285943] font-bold">{item.category}</span>
                      <span className="font-bold text-[#D65A3A]">Priority: {item.priorityScore}/100</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right: Normalized JSON Schema Code Viewer */}
            <div className="lg:col-span-7 bg-[#171717] text-[#F7F5EF] border border-[#171717] p-6 shadow-[6px_6px_0px_#D65A3A] font-mono text-xs space-y-4">
              <div className="flex items-center justify-between border-b border-white/20 pb-2">
                <div className="flex items-center space-x-2 text-[#D9A441] font-bold">
                  <Code className="w-4 h-4" />
                  <span>UNIVERSAL_CIVIC_SCHEMA.json</span>
                </div>
                <span className="px-2 py-0.5 bg-[#285943] text-white text-[9px] font-bold uppercase">
                  NORMALIZED & VALIDATED
                </span>
              </div>

              <pre className="text-emerald-400 leading-relaxed font-mono text-[11px] select-all overflow-x-auto p-4 bg-black/40 border border-white/10">
{JSON.stringify({
  requestId: activeSchema.requestId,
  countryCode: activeSchema.countryCode,
  region: activeSchema.region,
  location: activeSchema.location,
  category: activeSchema.category,
  problem: activeSchema.problem,
  severity: activeSchema.severity,
  affectedPopulation: activeSchema.affectedPopulation,
  timestamp: activeSchema.timestamp,
  evidenceType: activeSchema.evidenceType,
  originalLanguage: activeSchema.originalLanguage,
  originalText: activeSchema.originalText,
  canonicalEnglishText: activeSchema.canonicalEnglishText,
  infrastructureGapPct: activeSchema.infrastructureGapPct,
  priorityScore: activeSchema.priorityScore,
  status: activeSchema.status
}, null, 2)}
              </pre>

              <div className="pt-2 border-t border-white/20 text-[11px] text-white/80 font-sans leading-relaxed">
                <strong>Ingestion Translation:</strong> Translates <i>"{activeSchema.originalText}"</i> directly into canonical schema format to drive universal priority indexing.
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 3: LEGO MODULAR BLOCKS & CUSTOM CATEGORIES */}
      {activeTab === 'modules' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Lego Blocks Representation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="font-bold text-[#171717] uppercase tracking-wider">
                CIVICPULSE MODULAR INFRASTRUCTURE LEGO BLOCKS
              </span>
              <span className="text-[#D65A3A] font-bold">SELECT ANY COMBINATION FOR A COUNTRY</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              {[
                { name: 'Voice Ingestion', desc: 'Regional dialect STT & telephony', color: '#D65A3A', tag: 'IN | BR | ZA' },
                { name: 'Text SMS / USSD', desc: 'Feature phone offline ingestion', color: '#285943', tag: 'ZA | IN' },
                { name: 'Messaging Gateway', desc: 'WhatsApp / GovChat integration', color: '#D9A441', tag: 'BR | ZA | IN' },
                { name: 'Language AI', desc: 'Multilingual translation to schema', color: '#171717', tag: 'Universal' },
                { name: 'Gemini AI Engine', desc: 'Categorization & policy drafter', color: '#D65A3A', tag: 'Universal' },
                { name: 'Geospatial Location', desc: 'District & ward boundary maps', color: '#285943', tag: 'Universal' },
                { name: 'Infra Asset Registry', desc: 'Jal Jeevan, PWD, SUS, DNIT APIs', color: '#D9A441', tag: 'Adapter-based' },
                { name: 'Census Demographics', desc: 'Population density & poverty index', color: '#171717', tag: 'Adapter-based' },
                { name: 'Investment CapEx', desc: 'Sanctioned capital budget tracker', color: '#285943', tag: 'Adapter-based' },
              ].map((mod, i) => (
                <div 
                  key={i}
                  className="p-4 bg-white border border-[#171717] shadow-[3px_3px_0px_#171717] space-y-2 relative group hover:border-[#D65A3A]"
                >
                  <div className="flex items-center justify-between border-b border-[#171717]/10 pb-1.5">
                    <span className="font-bold text-sm text-[#171717]">{mod.name}</span>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: mod.color }}></span>
                  </div>
                  <p className="text-[11px] text-[#171717]/80 font-sans">{mod.desc}</p>
                  <div className="text-[9px] text-[#D65A3A] font-mono font-bold pt-1">{mod.tag}</div>
                </div>
              ))}
            </div>
          </div>

          {/* DYNAMIC CATEGORY MANAGER (POINT #7 USER PROMPT) */}
          <div className="p-6 bg-white border border-[#171717] shadow-[4px_4px_0px_#171717] space-y-4 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#171717]/10 pb-3">
              <div className="space-y-0.5">
                <span className="font-serif font-bold text-base text-[#171717]">
                  ADAPTABLE CIVIC CATEGORIES
                </span>
                <p className="text-[11px] text-[#171717]/70 font-sans">
                  Governments can dynamically configure civic categories without code changes.
                </p>
              </div>

              {!isAddingCategory ? (
                <button
                  onClick={() => setIsAddingCategory(true)}
                  className="px-3 py-1.5 bg-[#D65A3A] text-white hover:bg-[#171717] transition-colors cursor-pointer font-bold flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD CATEGORY</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    placeholder="e.g. Environmental Health"
                    className="px-2.5 py-1 bg-[#F7F5EF] border border-[#171717] font-mono text-xs focus:outline-none"
                  />
                  <button
                    onClick={handleAddCategory}
                    className="px-3 py-1 bg-[#285943] text-white font-bold"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsAddingCategory(false)}
                    className="px-2 py-1 bg-[#171717]/10 text-[#171717]"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Rendered Categories Badges */}
            <div className="flex flex-wrap gap-2">
              {customCategories.map((cat, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1.5 bg-[#F7F5EF] border border-[#171717] text-[#171717] font-bold text-xs flex items-center space-x-1.5 shadow-[2px_2px_0px_#171717]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D65A3A]"></span>
                  <span>{cat}</span>
                </span>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: STACK LAYERS METAPHOR (POINT #10 USER PROMPT) */}
      {activeTab === 'layers' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="space-y-3 font-mono text-xs">
            <span className="font-bold text-[#171717] uppercase tracking-wider block">
              PUBLIC INFRASTRUCTURE LAYER STACK (DIGITAL PUBLIC GOOD)
            </span>

            <div className="space-y-3">
              {[
                {
                  layer: 'Layer 1: Citizen Interaction Layer',
                  sub: 'Voice Calls, SMS, WhatsApp, Web App, Voice Notes (Bhashini, Speak2Civic)',
                  color: '#D65A3A'
                },
                {
                  layer: 'Layer 2: AI Intelligence & Multilingual Translation Layer',
                  sub: 'Gemini Categorization Engine, Whisper Speech-to-Text, Dialect Normalizer',
                  color: '#D9A441'
                },
                {
                  layer: 'Layer 3: Universal Civic Data & Schema Layer',
                  sub: 'Normalized JSON Schema, Priority Scoring Matrix, Audit Logging Engine',
                  color: '#285943'
                },
                {
                  layer: 'Layer 4: Interoperability & Country Connectors Layer',
                  sub: 'Open APIs, IBGE, Jal Jeevan, Stats SA, PWD, SUS, Rosstat Adapters',
                  color: '#171717'
                },
                {
                  layer: 'Layer 5: Country Infrastructure & Governance Layer',
                  sub: 'District Collector Portals, Capital Budget Allocation, Executive Policy Memos',
                  color: '#D65A3A'
                }
              ].map((item, idx) => (
                <div 
                  key={idx}
                  className="p-5 bg-white border border-[#171717] shadow-[4px_4px_0px_#171717] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  style={{ borderLeftWidth: '6px', borderLeftColor: item.color }}
                >
                  <div>
                    <div className="font-bold text-sm text-[#171717] uppercase">{item.layer}</div>
                    <div className="text-xs text-[#171717]/80 font-sans mt-1">{item.sub}</div>
                  </div>
                  <span className="px-2.5 py-1 bg-[#F7F5EF] border border-[#171717] text-[10px] font-mono font-bold text-[#171717] shrink-0 uppercase">
                    OPEN SPECIFICATION
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
