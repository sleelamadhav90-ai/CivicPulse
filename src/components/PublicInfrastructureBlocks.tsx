import React, { useState } from 'react';
import { 
  Mic, 
  MessageSquare, 
  FileText, 
  Cpu, 
  Users, 
  Building2, 
  Coins, 
  Zap, 
  Layers, 
  ArrowDown, 
  ChevronRight, 
  Info, 
  CheckCircle2, 
  Radio,
  Share2,
  Code2
} from 'lucide-react';

interface ModuleDetail {
  id: string;
  name: string;
  category: 'input' | 'ai' | 'dataset' | 'engine';
  tagline: string;
  description: string;
  codeSnippet: string;
  metrics: { label: string; value: string }[];
  accentColor: string;
}

const MODULES_DATA: Record<string, ModuleDetail> = {
  voice: {
    id: 'voice',
    name: 'VOICE MODULE',
    category: 'input',
    tagline: 'Multilingual Regional Dialect Audio Processing',
    description: 'Ingests citizen voice notes in Telugu, Hindi, Marathi, and Kannada. Uses Gemini multimodal audio parsing to extract location, infrastructure domain, and distress urgency without requiring literacy.',
    codeSnippet: `// Voice Ingestion Module Specification
import { GeminiMultimodal } from '@civicpulse/voice-sdk';

export async function processCitizenVoice(audioBuffer: ArrayBuffer) {
  const result = await GeminiMultimodal.transcribeAndExtract({
    audio: audioBuffer,
    languages: ['te-IN', 'hi-IN', 'mr-IN'],
    targetSchema: 'CivicSignal'
  });
  return result; // returns { district, category, urgency, transcript }
}`,
    metrics: [
      { label: 'Supported Dialects', value: '14 Regional' },
      { label: 'Avg Audio Duration', value: '28.4 sec' },
      { label: 'Parsing Accuracy', value: '96.2%' }
    ],
    accentColor: '#D65A3A'
  },
  text: {
    id: 'text',
    name: 'TEXT MODULE',
    category: 'input',
    tagline: 'Structured Public Grievance NLP Parser',
    description: 'Processes written civic petitions, web forms, and municipal helpdesk tickets into standardized vector payloads tagged with geographic coordinates.',
    codeSnippet: `// Text Ingestion Pipeline
export interface TextSignal {
  source: 'web_portal' | 'grievance_cell';
  rawText: string;
  districtId: string;
  timestamp: string;
}`,
    metrics: [
      { label: 'Daily Throughput', value: '4,200/hr' },
      { label: 'Geo-Tagging', value: 'GPS / Mandal' },
      { label: 'De-duplication', value: 'Active' }
    ],
    accentColor: '#D65A3A'
  },
  messaging: {
    id: 'messaging',
    name: 'MESSAGING MODULE',
    category: 'input',
    tagline: 'WhatsApp & SMS Citizen Bot Gateway',
    description: 'Zero-friction chat gateway enabling citizens to report broken pipelines, waterlogging, or power cuts via simple WhatsApp messages or feature-phone SMS.',
    codeSnippet: `// WhatsApp Bot Webhook Listener
app.post('/api/whatsapp/webhook', async (req, res) => {
  const { From, Body, MediaUrl0 } = req.body;
  const signal = await parseCivicMessage({ phone: From, text: Body, media: MediaUrl0 });
  await storeSignal(signal);
  res.send('<Response><Message>Grievance Registered. ID: ' + signal.id + '</Message></Response>');
});`,
    metrics: [
      { label: 'Active Users', value: '184,000+' },
      { label: 'Latency', value: '1.2 sec' },
      { label: 'Channel', value: 'WhatsApp / SMS' }
    ],
    accentColor: '#D65A3A'
  },
  ai_layer: {
    id: 'ai_layer',
    name: 'AI LAYER',
    category: 'ai',
    tagline: 'Gemini Multimodal Processing & Synthesis Core',
    description: 'Central intelligence hub performing zero-shot classification across 6 infrastructure categories (Water, Drainage, Roads, Electricity, Healthcare, Education), sentiment analysis, and executive policy draft generation.',
    codeSnippet: `// AI Intelligence Layer Core
const aiModel = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function synthesizePolicyMemo(demandCluster, baselineData) {
  const prompt = \`Draft a official executive brief for project allocation...\`;
  const response = await aiModel.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  return response.text;
}`,
    metrics: [
      { label: 'Core Model', value: 'Gemini 2.5 Flash' },
      { label: 'Classifications', value: '6 Domains' },
      { label: 'Policy Draft Time', value: '1.8 sec' }
    ],
    accentColor: '#D65A3A'
  },
  demographics: {
    id: 'demographics',
    name: 'DEMOGRAPHICS MODULE',
    category: 'dataset',
    tagline: 'National Census & Poverty Index Data Layer',
    description: 'Integrates official Census and Multidimensional Poverty Index (MPI) data to weigh infrastructure gaps against vulnerable population counts.',
    codeSnippet: `// Demographic Dataset Interface
export interface DemographicBaseline {
  districtId: string;
  populationTotal: number;
  povertyIndex: number; // 0.0 - 1.0
  bplRatio: number;
}`,
    metrics: [
      { label: 'Population Covered', value: '4.2 Million' },
      { label: 'Resolution', value: 'Ward / Mandal' },
      { label: 'Update Cycle', value: 'Annual Census' }
    ],
    accentColor: '#285943'
  },
  infra_data: {
    id: 'infra_data',
    name: 'INFRASTRUCTURE DATA MODULE',
    category: 'dataset',
    tagline: 'State Asset Register, Condition & Capacity Audit Engine',
    description: 'Integrates real infrastructure asset registers tracking capacity (beds, students, L/day, km), physical condition (🟢 Good, ⚠️ Poor, ⚠️ Damaged, 🔴 Critical, ❌ Non-functional), and utilization rates to drive 4 intervention types: BUILD, FIX, UPGRADE, or POLICY.',
    codeSnippet: `// Infrastructure Asset Register & Gap Schema
export interface InfrastructureAsset {
  id: string; // e.g. "PHC-VJA-401"
  name: string; // e.g. "Primary Health Centre"
  category: 'Healthcare' | 'Water' | 'Roads' | 'Education' | 'Electricity';
  location: string; // e.g. "Village Mangalagiri Sector 4"
  capacity: string; // e.g. "30 beds", "100,000 L", "500 students"
  condition: '🟢 Good' | '⚠️ Poor' | '⚠️ Damaged' | '🔴 Critical' | '❌ Non-functional';
  utilizationPct: number; // e.g. 92%
  nearestDistanceKm: number; // e.g. 18.2 km
  travelTimeMinutes: number; // e.g. 45 min
}

export function evaluateInterventionType(asset: InfrastructureAsset): 'BUILD' | 'FIX' | 'UPGRADE' | 'POLICY' {
  if (asset.nearestDistanceKm > 10 || asset.utilizationPct === 0) return 'BUILD';
  if (asset.condition === '⚠️ Damaged' || asset.condition === '🔴 Critical') return 'FIX';
  if (asset.utilizationPct > 90) return 'UPGRADE';
  return 'POLICY';
}`,
    metrics: [
      { label: 'Tracked Assets', value: '18,450 Pins' },
      { label: 'Action Types', value: '4 Deterministic' },
      { label: 'Asset Depts', value: 'PWD / Jal Jeevan / Health' }
    ],
    accentColor: '#285943'
  },
  investment: {
    id: 'investment',
    name: 'INVESTMENT & SCHEME DATA MODULE',
    category: 'dataset',
    tagline: 'State Scheme Capital Outlay & 5-Question Audit Engine',
    description: 'Aggregates state scheme allocations (Jal Jeevan, PMGSY, NHM, Swachh Bharat), funds released, actual expenditure, and unspent balances. Answers 5 critical questions: Where is money going? Is money spent? Is spending producing results? Are investments reaching places in need? Where are anomalies?',
    codeSnippet: `// Investment & Plan Data Scheme Schema
export interface InvestmentSchemeData {
  schemeName: string; // e.g. "Jal Jeevan Mission (JJM)"
  department: string; // e.g. "Rural Water Supply & Sanitation"
  stateAllocationInr: number; // e.g. ₹50 Cr
  releasedInr: number;        // e.g. ₹45 Cr
  spentInr: number;           // e.g. ₹39 Cr
  remainingInr: number;       // e.g. ₹11 Cr
  totalProjects: number;      // e.g. 120
  completedProjects: number;  // e.g. 82
  delayedProjects: number;    // e.g. 25
  citizenComplaintsCount: number; // e.g. 4,820
  quadrant: 'RED_HIGH_NEED_LOW_INVESTMENT' | 'YELLOW_HIGH_INVESTMENT_POOR_OUTCOME' | 'GREEN_ADEQUATE' | 'GREY_BASELINE';
}`,
    metrics: [
      { label: 'State Budget Tracked', value: '₹120 Cr' },
      { label: 'Active Schemes', value: '5 Key Programs' },
      { label: 'AI Audit Signals', value: '5 Live Anomaly Flags' }
    ],
    accentColor: '#285943'
  },
  priority_ai: {
    id: 'priority_ai',
    name: 'PRIORITY AI ENGINE',
    category: 'engine',
    tagline: 'Deterministic Priority Algorithm & Audit Engine',
    description: 'Computes an auditable 0–100 Priority Score using an immutable mathematical formula: Score = (Demand × 0.30) + (InfraGap × 0.25) + (Population × 0.20) + (Urgency × 0.15) + (GovPriority × 0.10). Eliminates political bias and guarantees fiscal transparency.',
    codeSnippet: `// Deterministic Priority Score Formula
export function calculatePriorityScore(district, category, demandCount) {
  const demandWeight = Math.min(100, (demandCount / 1200) * 100) * 0.30;
  const gapWeight = (100 - getCategoryAccess(district, category)) * 0.25;
  const popWeight = Math.min(100, (district.population / 800000) * 100) * 0.20;
  const urgencyWeight = 85 * 0.15;
  const govWeight = district.governmentPriorityScore * 0.10;
  
  return Math.round(demandWeight + gapWeight + popWeight + urgencyWeight + govWeight);
}`,
    metrics: [
      { label: 'Formula Type', value: 'Deterministic' },
      { label: 'Pillars Evaluated', value: '5 Indicators' },
      { label: 'Audit Verification', value: '100% Pass' }
    ],
    accentColor: '#D9A441'
  }
};

export const PublicInfrastructureBlocks: React.FC = () => {
  const [activeModuleId, setActiveModuleId] = useState<string>('priority_ai');
  const [copiedCode, setCopiedCode] = useState(false);

  const activeModule = MODULES_DATA[activeModuleId] || MODULES_DATA.priority_ai;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeModule.codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="w-full space-y-8 bg-[#F7F5EF] text-[#171717]">
      {/* Header Banner */}
      <div className="border border-[#171717]/20 p-6 bg-white shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-[#D65A3A] text-white tracking-widest">
                ARCHITECTURE SYSTEM
              </span>
              <span className="text-xs font-mono text-[#171717]/60">Digital Public Goods × Open Infrastructure</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#171717] mt-2 tracking-tight">
              Public Infrastructure Blocks
            </h2>
            <p className="text-xs sm:text-sm text-[#171717]/80 mt-1 max-w-3xl leading-relaxed">
              CivicPulse isn't one application. It is a collection of modular, reusable civic infrastructure building blocks. The architecture itself becomes the design language.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs border-t sm:border-t-0 border-[#171717]/10 pt-3 sm:pt-0">
            <div className="px-3 py-1.5 border border-[#171717]/20 bg-[#F7F5EF] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#285943]"></span>
              <span>8 Modular Blocks</span>
            </div>
            <div className="px-3 py-1.5 border border-[#171717]/20 bg-[#F7F5EF] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D65A3A]"></span>
              <span>Zero Silos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Block Diagram Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive ASCII-Style Infrastructure Diagram */}
        <div className="lg:col-span-7 border border-[#171717]/20 bg-white p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#171717]/10 pb-3">
            <div className="text-center font-serif text-lg tracking-wider text-[#171717] font-bold">
              CIVICPULSE
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#D65A3A] font-bold">
              OPEN CIVIC INTELLIGENCE LAYER
            </span>
          </div>

          {/* Connected Modules Diagram */}
          <div className="space-y-6 pt-2">
            
            {/* ROW 1: INPUT MODULES */}
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#171717]/60 mb-2 font-semibold">
                INPUT CHANNEL MODULES
              </div>
              <div className="grid grid-cols-3 gap-3">
                {['voice', 'text', 'messaging'].map((id) => {
                  const mod = MODULES_DATA[id];
                  const isSelected = activeModuleId === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveModuleId(id)}
                      className={`p-3 text-center border transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-[#D65A3A] bg-[#D65A3A]/10 shadow-[3px_3px_0px_#D65A3A]' 
                          : 'border-[#171717]/30 bg-[#F7F5EF] hover:border-[#171717]'
                      }`}
                    >
                      <div className="text-xs font-mono font-bold text-[#171717] tracking-wider uppercase">
                        {id.toUpperCase()}
                      </div>
                      <div className="text-[9px] font-mono text-[#171717]/70 mt-1">
                        {id === 'voice' ? 'Audio NLP' : id === 'text' ? 'Grievance' : 'WhatsApp'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CONNECTING LINES DOWN TO AI LAYER */}
            <div className="flex justify-center items-center py-1">
              <div className="w-full max-w-xs flex flex-col items-center">
                <div className="w-full border-t border-dashed border-[#171717]/40"></div>
                <ArrowDown className="w-4 h-4 text-[#D65A3A] -mt-1" />
              </div>
            </div>

            {/* ROW 2: CENTRAL AI LAYER MODULE */}
            <div className="flex justify-center">
              <button
                onClick={() => setActiveModuleId('ai_layer')}
                className={`w-full max-w-sm p-4 text-center border transition-all cursor-pointer ${
                  activeModuleId === 'ai_layer'
                    ? 'border-[#D65A3A] bg-[#D65A3A]/15 shadow-[4px_4px_0px_#D65A3A]'
                    : 'border-[#171717] bg-[#F7F5EF] hover:border-[#D65A3A]'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Cpu className="w-4 h-4 text-[#D65A3A]" />
                  <span className="text-sm font-mono font-bold text-[#171717] tracking-wider uppercase">
                    AI LAYER (GEMINI 2.5)
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[#171717]/70 mt-1">
                  Multimodal Extraction & Policy Synthesis
                </div>
              </button>
            </div>

            {/* CONNECTING LINES DOWN TO DATASETS */}
            <div className="flex justify-center items-center py-1">
              <div className="w-full max-w-xs flex flex-col items-center">
                <div className="w-full border-t border-dashed border-[#171717]/40"></div>
                <ArrowDown className="w-4 h-4 text-[#285943] -mt-1" />
              </div>
            </div>

            {/* ROW 3: PUBLIC DATASET MODULES */}
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#171717]/60 mb-2 font-semibold">
                OPEN PUBLIC DATASETS (INDIA STACK INTEGRATED)
              </div>
              <div className="grid grid-cols-3 gap-3">
                {['demographics', 'infra_data', 'investment'].map((id) => {
                  const isSelected = activeModuleId === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveModuleId(id)}
                      className={`p-3 text-center border transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-[#285943] bg-[#285943]/10 shadow-[3px_3px_0px_#285943]' 
                          : 'border-[#171717]/30 bg-[#F7F5EF] hover:border-[#171717]'
                      }`}
                    >
                      <div className="text-xs font-mono font-bold text-[#171717] tracking-wider uppercase">
                        {id === 'demographics' ? 'DEMOGRAPH' : id === 'infra_data' ? 'INFRA DATA' : 'INVESTMENT'}
                      </div>
                      <div className="text-[9px] font-mono text-[#171717]/70 mt-1">
                        {id === 'demographics' ? 'Census Baseline' : id === 'infra_data' ? 'Asset API' : 'Sanction CapEx'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CONNECTING LINES DOWN TO PRIORITY ENGINE */}
            <div className="flex justify-center items-center py-1">
              <div className="w-full max-w-xs flex flex-col items-center">
                <div className="w-full border-t border-dashed border-[#171717]/40"></div>
                <ArrowDown className="w-4 h-4 text-[#D9A441] -mt-1" />
              </div>
            </div>

            {/* ROW 4: PRIORITY AI ENGINE */}
            <div className="flex justify-center">
              <button
                onClick={() => setActiveModuleId('priority_ai')}
                className={`w-full max-w-md p-4 text-center border transition-all cursor-pointer ${
                  activeModuleId === 'priority_ai'
                    ? 'border-[#D9A441] bg-[#D9A441]/15 shadow-[4px_4px_0px_#D9A441]'
                    : 'border-[#171717] bg-[#F7F5EF] hover:border-[#D9A441]'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 text-[#D9A441]" />
                  <span className="text-sm font-mono font-bold text-[#171717] tracking-wider uppercase">
                    PRIORITY AI ENGINE
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[#171717]/70 mt-1">
                  Deterministic Fiscal Audit & Priority Score (0–100)
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Module Inspector & Code Documentation */}
        <div className="lg:col-span-5 border border-[#171717]/20 bg-white p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#171717]/10 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#171717]/60 block font-bold">
                MODULE INSPECTOR
              </span>
              <h3 className="text-xl font-serif font-bold text-[#171717]">
                {activeModule.name}
              </h3>
            </div>
            <span 
              className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase text-white tracking-widest"
              style={{ backgroundColor: activeModule.accentColor }}
            >
              {activeModule.category}
            </span>
          </div>

          <p className="text-xs font-mono font-medium text-[#171717] border-l-2 pl-3 py-1" style={{ borderLeftColor: activeModule.accentColor }}>
            {activeModule.tagline}
          </p>

          <p className="text-xs text-[#171717]/80 leading-relaxed font-sans">
            {activeModule.description}
          </p>

          {/* Module Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#171717]/10 font-mono text-xs">
            {activeModule.metrics.map((m, i) => (
              <div key={i} className="bg-[#F7F5EF] p-2 border border-[#171717]/10">
                <span className="text-[9px] uppercase tracking-wider text-[#171717]/60 block">
                  {m.label}
                </span>
                <span className="font-bold text-[#171717] mt-0.5 block">
                  {m.value}
                </span>
              </div>
            ))}
          </div>

          {/* Code & API Documentation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-[#171717]/70 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" />
                OPEN SPECIFICATION CODE
              </span>
              <button
                onClick={handleCopyCode}
                className="text-[10px] font-mono text-[#D65A3A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedCode ? <CheckCircle2 className="w-3 h-3 text-[#285943]" /> : <Share2 className="w-3 h-3" />}
                {copiedCode ? 'Copied' : 'Copy Code'}
              </button>
            </div>
            <pre className="p-3 bg-[#171717] text-[#F7F5EF] font-mono text-[10px] overflow-x-auto leading-relaxed border border-[#171717]">
              <code>{activeModule.codeSnippet}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
