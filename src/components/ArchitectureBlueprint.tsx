import React, { useState } from 'react';
import { 
  Network, 
  Globe2, 
  Layers, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Cpu, 
  Users, 
  Building2, 
  TrendingUp, 
  ShieldCheck,
  Flame,
  Radio,
  FileEdit,
  Hammer,
  Database,
  Compass,
  Check
} from 'lucide-react';

interface ArchitectureBlueprintProps {
  onNavigate?: (tab: any) => void;
}

export const ArchitectureBlueprint: React.FC<ArchitectureBlueprintProps> = ({ onNavigate }) => {
  const [selectedScaleLevel, setSelectedScaleLevel] = useState<'current' | 'national' | 'brics'>('current');

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-7">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold uppercase rounded-md bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-blue-600" />
              SYSTEM ARCHITECTURE & EXTENSIBLE DESIGN
            </span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">•</span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">Convincing Prototype → Global Scale</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            The CivicPulse 3-Pillar Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Engineered with a clean, decoupled tri-pillar design that connects <strong>Citizens</strong>, <strong>AI Priority Engine</strong>, and <strong>Government Execution</strong> without hardcoding jurisdictional silos.
          </p>
        </div>

        {/* Scope Scale Switcher */}
        <div className="flex items-center bg-slate-100/90 p-1.5 rounded-xl text-xs font-bold shrink-0">
          <button
            onClick={() => setSelectedScaleLevel('current')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedScaleLevel === 'current'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Live Prototype
          </button>
          <button
            onClick={() => setSelectedScaleLevel('national')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedScaleLevel === 'national'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            State → National
          </button>
          <button
            onClick={() => setSelectedScaleLevel('brics')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              selectedScaleLevel === 'brics'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            BRICS-Ready Scale
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* THE CORE 3-PILLAR VISUAL ARCHITECTURAL DIAGRAM               */}
      {/* ============================================================ */}
      <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-md space-y-6">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            CIVICPULSE TRI-PILLAR FOUNDATION
          </span>
          <span className="text-[11px] font-mono bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded border border-slate-700">
            Plug-and-Play Topology
          </span>
        </div>

        {/* Central Architecture Flow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Pillar 1: Citizens */}
          <div className="p-5 rounded-xl bg-slate-800/90 border border-blue-500/40 space-y-3 relative group hover:border-blue-400 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-400" />
                1. Citizens
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Input Layer
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-700 text-xs font-mono text-slate-200 flex items-center justify-between">
                <span>🎙️ Voice Notes (Telugu/Hindi)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-700 text-xs font-mono text-slate-200 flex items-center justify-between">
                <span>💬 WhatsApp / SMS Text</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-700 text-xs font-mono text-slate-200 flex items-center justify-between">
                <span>📍 Photo & GPS Pin</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-700 text-center">
              <span className="text-[11px] font-mono font-bold text-blue-300">
                ↓ 12,480 Ingested Requests
              </span>
            </div>
          </div>

          {/* Pillar 2: AI Engine (Central Brain) */}
          <div className="p-5 rounded-xl bg-slate-800/90 border border-purple-500/50 space-y-3 relative group hover:border-purple-400 transition-all shadow-lg ring-1 ring-purple-500/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-purple-400" />
                2. AI Priority Engine
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-500/40">
                Deterministic
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-purple-500/30 text-xs font-mono text-purple-200">
                <strong>Classification:</strong> Water, Roads, Drainage, Power
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-purple-500/30 text-xs font-mono text-purple-200">
                <strong>Prioritization:</strong> 5-Pillar Score (0–100)
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-purple-500/30 text-xs font-mono text-purple-200">
                <strong>Hotspots:</strong> Density & Deficit Fusion
              </div>
            </div>

            <div className="pt-2 border-t border-slate-700 text-center">
              <span className="text-[11px] font-mono font-bold text-purple-300">
                ↓ Impact Data & Policy Memos
              </span>
            </div>
          </div>

          {/* Pillar 3: Government */}
          <div className="p-5 rounded-xl bg-slate-800/90 border border-emerald-500/40 space-y-3 relative group hover:border-emerald-400 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-400" />
                3. Government
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Execution Layer
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-700 text-xs font-mono text-slate-200">
                <strong>Dashboard:</strong> Spatial Priority GIS Map
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-700 text-xs font-mono text-slate-200">
                <strong>Projects:</strong> Sanctions & Work Orders
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-700 text-xs font-mono text-slate-200">
                <strong>Audit:</strong> 4-Stage Lifecycle Tracking
              </div>
            </div>

            <div className="pt-2 border-t border-slate-700 text-center">
              <span className="text-[11px] font-mono font-bold text-emerald-300">
                ↓ 31 Verified Completed Works
              </span>
            </div>
          </div>
        </div>

        {/* Full 12-Stage Pipeline Diagram */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto space-y-2">
          <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
            END-TO-END DECISION-SUPPORT PIPELINE ARCHITECTURE:
          </div>
          <pre className="leading-relaxed text-slate-300">
{`  Citizen Input (Voice / Text / WhatsApp)
      │
      ▼
  AI Extraction (Gemini Multilingual NLP / Structured Entity Parsing)
      │
      ▼
  Signal Normalization & Validation (Bounded Ranges & District Registry Check)
      │
      ▼
  Community Aggregation (Geo-Spatial Clustering by Locality & Category)
      │
      ▼
  Hotspot Detection (Density & Deficit Fusion across State → District → Mandal)
      │
      ▼
  Evidence Layer (Citizen Reports + Census / Open-Data Infrastructure Deficits)
      │
      ▼
  Deterministic Priority Engine (5-Pillar Score: 30% Demand + 25% Gap + 20% Pop + 15% Urgency + 10% Gov)
      │
      ▼
  Scheme / Project Matching (Centrally Sponsored Schemes: JJM, PMGSY, SBM, NHM)
      │
      ▼
  Recommendation Brief (Actionable Engineering Briefs with Data Lineage)
      │
      ▼
  Action Queue (Departmental Lifecycle Tracking: Sanction → Tender → Execution)
      │
      ▼
  Impact Simulation (Simulated Deficit Reduction & Beneficiary Reach)
      │
      ▼
  Feedback Loop (Post-Intervention Signal Reduction Monitoring)`}
          </pre>
          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Supporting Datasets: Census Baselines • Open Data (data.gov.in) • Jal Jeevan Mission Portal • PMGSY Road Registers</span>
            <span className="text-emerald-400 font-bold">100% Deterministic Prioritization</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* EXTENSIBLE HIERARCHY: HOW IT PLUGS IN WITHOUT CHANGING CORE */}
      {/* ============================================================ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-blue-600" />
              Hierarchical Extensibility
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              The fundamental architecture stays invariant whether deployed to a single municipal ward or an entire continent.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            Zero Architectural Debt
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Level 1: Live Prototype */}
          <div className={`p-5 rounded-2xl border transition-all ${
            selectedScaleLevel === 'current' 
              ? 'bg-blue-50/50 border-blue-300 shadow-xs' 
              : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700">
                1. Live Prototype
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-blue-100 text-blue-800 font-bold">
                Active
              </span>
            </div>
            
            <div className="mt-3 space-y-2 font-mono text-xs text-slate-800">
              <div className="font-bold text-sm text-slate-900">
                India → Andhra Pradesh / Maharashtra
              </div>
              <div className="text-[11px] text-slate-600 leading-relaxed font-sans">
                • <strong>8 Core Districts</strong>: Vijayawada, Guntur, Nagpur, Nanded, Kurnool, Solapur, Chittoor, Visakhapatnam.
                <br />• <strong>Municipalities</strong>: Urban wards & rural mandals.
                <br />• <strong>Focus</strong>: Pristine working prototype with verified priority scores.
              </div>
            </div>
          </div>

          {/* Level 2: National Federation */}
          <div className={`p-5 rounded-2xl border transition-all ${
            selectedScaleLevel === 'national' 
              ? 'bg-purple-50/50 border-purple-300 shadow-xs' 
              : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-700">
                2. National Federation
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-purple-100 text-purple-800 font-bold">
                Plug-in
              </span>
            </div>
            
            <div className="mt-3 space-y-2 font-mono text-xs text-slate-800">
              <div className="font-bold text-sm text-slate-900">
                All 28 States & 780+ Districts
              </div>
              <div className="text-[11px] text-slate-600 leading-relaxed font-sans">
                • <strong>Integrations</strong>: PM Gati Shakti GIS, Jal Jeevan Mission API, PMGSY road registers.
                <br />• <strong>Languages</strong>: 22 scheduled official Indian languages via Gemini multimodal audio.
                <br />• <strong>No Core Rewrite</strong>: Simply load regional geospatial geoJSON boundaries.
              </div>
            </div>
          </div>

          {/* Level 3: BRICS Scale */}
          <div className={`p-5 rounded-2xl border transition-all ${
            selectedScaleLevel === 'brics' 
              ? 'bg-emerald-50/50 border-emerald-300 shadow-xs' 
              : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">
                3. BRICS Global Scale
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-100 text-emerald-800 font-bold">
                Extensible
              </span>
            </div>
            
            <div className="mt-3 space-y-2 font-mono text-xs text-slate-800">
              <div className="font-bold text-sm text-slate-900">
                India / Brazil / South Africa / etc.
              </div>
              <div className="text-[11px] text-slate-600 leading-relaxed font-sans">
                • <strong>Brazil</strong>: Favelas sanitation & Amazon rural connectivity.
                <br />• <strong>South Africa</strong>: Eskom grid stability & township clinics.
                <br />• <strong>Shared Digital Public Good</strong>: Standardized open priority algorithm for multilateral development banks.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
