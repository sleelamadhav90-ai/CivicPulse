import React, { useState } from 'react';
import { 
  Users, 
  AlertTriangle, 
  Box, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  FileText, 
  ArrowDown, 
  ArrowRight, 
  Sparkles, 
  Database, 
  Radio, 
  Share2,
  Info,
  Sliders
} from 'lucide-react';

export interface FlowNodeDetail {
  id: string;
  title: string;
  subtitle: string;
  metric: string;
  dataSource: string;
  category: 'signal' | 'problem' | 'data' | 'engine' | 'action' | 'plan';
  color: string;
  description: string;
  auditSnippet: string;
}

export interface RelationshipScenario {
  id: string;
  district: string;
  categoryName: string;
  citizensCount: string;
  problemTitle: string;
  infraGapMetric: string;
  populationMetric: string;
  priorityScore: number;
  actionTitle: string;
  planTitle: string;
  budgetInr: string;
  nodes: FlowNodeDetail[];
}

const RELATIONSHIP_SCENARIOS: RelationshipScenario[] = [
  {
    id: 'vijayawada-roads',
    district: 'Vijayawada',
    categoryName: 'Roads & Transit',
    citizensCount: '4,281 CITIZENS',
    problemTitle: 'ROAD CAVE-IN & CORRIDOR DEFICIT',
    infraGapMetric: '82% INFRA GAP',
    populationMetric: '184,200 CITIZENS',
    priorityScore: 94,
    actionTitle: 'ROAD REHABILITATION & PAVING',
    planTitle: 'GOVERNMENT CAPITAL PLAN (₹12.5 Cr)',
    budgetInr: '₹12.5 Cr',
    nodes: [
      {
        id: 'node-1',
        title: '4,281 Citizen Voice Signals',
        subtitle: 'Multilingual Ingestion (Telugu & English)',
        metric: '4,281 Reports',
        dataSource: 'Bhashini Speech API + WhatsApp Bot',
        category: 'signal',
        color: '#D65A3A',
        description: 'Raw complaints captured in regional dialects from voice notes, call transcripts, and mobile reports.',
        auditSnippet: 'STT_TRANSCRIPT: "MG Road near bus stand completely washed out after monsoons."'
      },
      {
        id: 'node-2',
        title: 'Road Problem Classified',
        subtitle: 'Multimodal AI Categorization',
        metric: 'Category: Roads',
        dataSource: 'Gemini 2.5 Categorizer Engine',
        category: 'problem',
        color: '#D9A441',
        description: 'AI extracts issue category, GPS location cluster, hazard severity rating, and verified imagery.',
        auditSnippet: 'EXTRACTED: { category: "Roads", hazard: "Critical", location: [16.5062, 80.6480] }'
      },
      {
        id: 'node-3a',
        title: 'Infrastructure Deficit Gap',
        subtitle: 'PWD Road Quality Index',
        metric: 'Gap: 82%',
        dataSource: 'State PWD Road Asset Registry',
        category: 'data',
        color: '#285943',
        description: 'Cross-referenced against official municipal asset logs to verify road age and repair history.',
        auditSnippet: 'ASSET_LOG: "Last paved 2019. PWD Quality Index: 18/100 (82% Deficit)"'
      },
      {
        id: 'node-3b',
        title: 'Vulnerable Population',
        subtitle: 'Census Demography Layer',
        metric: '184,200 Citizens',
        dataSource: 'Census 2021 + Municipal Ward Data',
        category: 'data',
        color: '#171717',
        description: 'High-density transit corridor servicing 184,200 daily commuters and emergency vehicles.',
        auditSnippet: 'CENSUS_WARD_14: "Total resident pop: 112,000 + Transit flow: 72,200 daily"'
      },
      {
        id: 'node-4',
        title: 'Priority Score: 94 / 100',
        subtitle: 'Deterministic Governance Formula',
        metric: '94 / 100 (Tier 1)',
        dataSource: 'CivicPulse Algorithmic Engine',
        category: 'engine',
        color: '#D65A3A',
        description: 'Combines 30% demand + 25% gap + 20% pop density + 15% urgency + 10% govt priority.',
        auditSnippet: 'FORMULA: (0.30*95) + (0.25*82) + (0.20*98) + (0.15*95) + (0.10*100) = 94.15'
      },
      {
        id: 'node-5',
        title: 'Road Rehabilitation Scope',
        subtitle: 'Engineering Solution Synthesis',
        metric: 'Sub-surface Paving',
        dataSource: 'AI Municipal Work Order Drafter',
        category: 'action',
        color: '#285943',
        description: 'Recommends bituminous concrete overlay, reinforced stormwater culverts, and street lighting.',
        auditSnippet: 'SCOPE: "3.2km dual-carriageway resurfacing + storm drainage culverts"'
      },
      {
        id: 'node-6',
        title: 'Sanctioned Government Plan',
        subtitle: 'State Capital Allocation',
        metric: 'Budget: ₹12.5 Cr',
        dataSource: 'AP Urban Infrastructure Development Board',
        category: 'plan',
        color: '#171717',
        description: 'Formal executive memo submitted to District Collector & Municipal Commissioner for budget approval.',
        auditSnippet: 'SANCTION_ORDER: "Project #AP-VJ-2026-081 approved under Smart Cities Fund."'
      }
    ]
  },
  {
    id: 'guntur-water',
    district: 'Guntur',
    categoryName: 'Water & Sanitation',
    citizensCount: '3,120 CITIZENS',
    problemTitle: 'BOREWELL CONTAMINATION & SUPPLY GAP',
    infraGapMetric: '78% WATER GAP',
    populationMetric: '340,000 CITIZENS',
    priorityScore: 91,
    actionTitle: 'JAL JEEVAN PIPED WATER EXTENSION',
    planTitle: 'EXECUTIVE BRIEF & SANCTION (₹18.2 Cr)',
    budgetInr: '₹18.2 Cr',
    nodes: [
      {
        id: 'node-g1',
        title: '3,120 Citizen Voice Signals',
        subtitle: 'Telugu Audio Calls & Transcripts',
        metric: '3,120 Reports',
        dataSource: 'Toll-Free Helpline 1905 Ingestion',
        category: 'signal',
        color: '#D65A3A',
        description: 'Widespread complaints of high TDS, salinity, and broken hand pumps in peri-urban wards.',
        auditSnippet: 'TELUGU_STT: "Water from borewell turning yellow, children falling ill."'
      },
      {
        id: 'node-g2',
        title: 'Water Problem Classified',
        subtitle: 'Contamination & Supply Deficit',
        metric: 'Category: Water',
        dataSource: 'Gemini Multimodal Categorizer',
        category: 'problem',
        color: '#D9A441',
        description: 'Tagged under Drinking Water Access Deficit & Biological Risk.',
        auditSnippet: 'CLASSIFICATION: { category: "Water", subcategory: "Contamination", risk: "High" }'
      },
      {
        id: 'node-g3a',
        title: 'Piped Water Infrastructure Gap',
        subtitle: 'Jal Jeevan Mission Registry',
        metric: 'Gap: 78%',
        dataSource: 'Jal Jeevan Mission Public API',
        category: 'data',
        color: '#285943',
        description: '78% of households in Ward 9 & 12 lack functional tap water connections.',
        auditSnippet: 'JJM_LOG: "Coverage: 22%. Unserved households: 14,800."'
      },
      {
        id: 'node-g3b',
        title: 'Affected Population Density',
        subtitle: 'Urban Slum & Housing Baseline',
        metric: '340,000 Citizens',
        dataSource: 'Guntur Municipal Demography',
        category: 'data',
        color: '#171717',
        description: 'High concentration of low-income families relying on water tankers.',
        auditSnippet: 'DEMO_DATA: "340,000 residents across 4 adjacent municipal wards."'
      },
      {
        id: 'node-g4',
        title: 'Priority Score: 91 / 100',
        subtitle: 'Health & Access Matrix',
        metric: '91 / 100 (Tier 1)',
        dataSource: 'Priority Engine Matrix',
        category: 'engine',
        color: '#D65A3A',
        description: 'Elevated score due to acute health risk and high population density.',
        auditSnippet: 'COMPUTATION: Demand(88) + Gap(78) + Pop(92) + Risk(96) + Policy(100) = 91.2'
      },
      {
        id: 'node-g5',
        title: 'Piped Water Network Extension',
        subtitle: 'OHT & Pipeline Engineering',
        metric: '42km HDPE Pipeline',
        dataSource: 'Public Health Engineering Dept',
        category: 'action',
        color: '#285943',
        description: 'Construction of 2 Overhead Tanks (OHT) + 42km distribution pipeline.',
        auditSnippet: 'ENGINEERING_PLAN: "2,000 KL Overhead Reservoir + chlorination plant"'
      },
      {
        id: 'node-g6',
        title: 'Jal Jeevan Executive Allocation',
        subtitle: 'Cabinet Sanction',
        metric: 'Budget: ₹18.2 Cr',
        dataSource: 'State Water & Sanitation Board',
        category: 'plan',
        color: '#171717',
        description: 'Budget cleared under AMRUT 2.0 & Jal Jeevan Mission national grant.',
        auditSnippet: 'GOVT_MEMO: "Sanction #AP-GNT-W-04 approved for immediate tender."'
      }
    ]
  }
];

export const CivicRelationshipFlow: React.FC = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('vijayawada-roads');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-4');
  const [viewMode, setViewMode] = useState<'flowchart' | 'ascii'>('flowchart');

  const currentScenario = RELATIONSHIP_SCENARIOS.find(s => s.id === selectedScenarioId) || RELATIONSHIP_SCENARIOS[0];
  const activeNode = currentScenario.nodes.find(n => n.id === selectedNodeId) || currentScenario.nodes[4];

  return (
    <div id="relationship-flow-core" className="w-full bg-[#F7F5EF] border border-[#171717] p-6 sm:p-8 space-y-6 shadow-[6px_6px_0px_#171717] font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#171717]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#D65A3A] text-white font-mono text-[10px] font-bold uppercase tracking-widest">
            <Share2 className="w-3.5 h-3.5" />
            THE CORE PHILOSOPHY
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#171717] tracking-tight">
            Not Cards. <span className="text-[#D65A3A]">Relationships.</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#171717]/80 max-w-2xl font-sans leading-relaxed">
            CivicPulse doesn't just collect complaints. It connects <strong>public signals</strong> → <strong>public data</strong> → <strong>public decisions</strong>.
          </p>
        </div>

        {/* Controls: Select Scenario & View Mode */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 font-mono text-xs">
          {/* Scenario Selector */}
          <div className="flex items-center gap-1 bg-white border border-[#171717] p-1">
            {RELATIONSHIP_SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => {
                  setSelectedScenarioId(scenario.id);
                  setSelectedNodeId(scenario.nodes[4]?.id || 'node-4');
                }}
                className={`px-3 py-1.5 font-bold uppercase transition-all cursor-pointer ${
                  selectedScenarioId === scenario.id
                    ? 'bg-[#171717] text-[#F7F5EF]'
                    : 'text-[#171717]/70 hover:bg-[#171717]/10'
                }`}
              >
                {scenario.district} ({scenario.categoryName.split(' ')[0]})
              </button>
            ))}
          </div>

          {/* Toggle Flowchart / ASCII */}
          <div className="flex items-center border border-[#171717] bg-white p-1">
            <button
              onClick={() => setViewMode('flowchart')}
              className={`px-3 py-1.5 font-bold uppercase transition-all cursor-pointer ${
                viewMode === 'flowchart' ? 'bg-[#D65A3A] text-white' : 'text-[#171717]/70 hover:bg-[#171717]/10'
              }`}
            >
              Visual Flow
            </button>
            <button
              onClick={() => setViewMode('ascii')}
              className={`px-3 py-1.5 font-bold uppercase transition-all cursor-pointer ${
                viewMode === 'ascii' ? 'bg-[#D65A3A] text-white' : 'text-[#171717]/70 hover:bg-[#171717]/10'
              }`}
            >
              ASCII Schema
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: VISUAL RELATIONSHIP FLOW DIAGRAM */}
      {viewMode === 'flowchart' && (
        <div className="space-y-6">
          
          {/* Relationship Chain Diagram Box */}
          <div className="p-6 sm:p-8 bg-white border border-[#171717] shadow-[4px_4px_0px_#171717] overflow-x-auto">
            <div className="min-w-[700px] flex flex-col items-center space-y-4 font-mono text-xs">
              
              {/* LEVEL 1: CITIZEN SIGNALS */}
              <div 
                onClick={() => setSelectedNodeId(currentScenario.nodes[0].id)}
                className={`w-80 p-3.5 border-2 transition-all cursor-pointer text-center relative group ${
                  activeNode.id === currentScenario.nodes[0].id
                    ? 'border-[#D65A3A] bg-[#D65A3A]/10 shadow-[4px_4px_0px_#D65A3A]'
                    : 'border-[#171717] bg-[#F7F5EF] hover:border-[#D65A3A]'
                }`}
              >
                <div className="flex items-center justify-center gap-2 font-bold text-[#D65A3A] text-sm uppercase">
                  <Radio className="w-4 h-4" />
                  {currentScenario.citizensCount}
                </div>
                <div className="text-[11px] text-[#171717]/80 font-sans mt-0.5">
                  Raw Multilingual Voice & Mobile Reports
                </div>
              </div>

              {/* ARROW DOWN */}
              <div className="flex flex-col items-center text-[#171717]">
                <div className="h-4 w-0.5 bg-[#171717]"></div>
                <div className="text-[10px]">▼</div>
              </div>

              {/* LEVEL 2: CIVIC PROBLEM CLASSIFICATION */}
              <div 
                onClick={() => setSelectedNodeId(currentScenario.nodes[1].id)}
                className={`w-80 p-3.5 border-2 transition-all cursor-pointer text-center relative ${
                  activeNode.id === currentScenario.nodes[1].id
                    ? 'border-[#D9A441] bg-[#D9A441]/10 shadow-[4px_4px_0px_#D9A441]'
                    : 'border-[#171717] bg-[#F7F5EF] hover:border-[#D9A441]'
                }`}
              >
                <div className="flex items-center justify-center gap-2 font-bold text-[#171717] text-sm uppercase">
                  <AlertTriangle className="w-4 h-4 text-[#D9A441]" />
                  {currentScenario.problemTitle}
                </div>
                <div className="text-[11px] text-[#171717]/80 font-sans mt-0.5">
                  AI Extracted Category: {currentScenario.categoryName}
                </div>
              </div>

              {/* ARROW DOWN & SPLIT FORK */}
              <div className="flex flex-col items-center w-full max-w-xl text-[#171717]">
                <div className="h-4 w-0.5 bg-[#171717]"></div>
                <div className="text-[10px]">▼</div>
                {/* Horizontal Split Line */}
                <div className="w-full h-0.5 bg-[#171717] relative my-1">
                  <div className="absolute left-1/4 -top-1 w-2 h-2 bg-[#171717] rounded-full"></div>
                  <div className="absolute right-1/4 -top-1 w-2 h-2 bg-[#171717] rounded-full"></div>
                </div>
              </div>

              {/* LEVEL 3: PARALLEL DATASETS (INFRASTRUCTURE GAP + POPULATION DENSITY) */}
              <div className="grid grid-cols-2 gap-8 w-full max-w-xl">
                {/* 3A: Infrastructure Gap */}
                <div 
                  onClick={() => setSelectedNodeId(currentScenario.nodes[2].id)}
                  className={`p-3.5 border-2 transition-all cursor-pointer text-center ${
                    activeNode.id === currentScenario.nodes[2].id
                      ? 'border-[#285943] bg-[#285943]/10 shadow-[4px_4px_0px_#285943]'
                      : 'border-[#171717] bg-[#F7F5EF] hover:border-[#285943]'
                  }`}
                >
                  <div className="text-[10px] text-[#285943] font-bold uppercase tracking-widest">PUBLIC ASSET DATA</div>
                  <div className="font-bold text-[#285943] text-sm uppercase mt-1">
                    {currentScenario.infraGapMetric}
                  </div>
                  <div className="text-[10px] text-[#171717]/70 font-sans mt-0.5">
                    PWD Registry / Jal Jeevan
                  </div>
                </div>

                {/* 3B: Population Density */}
                <div 
                  onClick={() => setSelectedNodeId(currentScenario.nodes[3].id)}
                  className={`p-3.5 border-2 transition-all cursor-pointer text-center ${
                    activeNode.id === currentScenario.nodes[3].id
                      ? 'border-[#171717] bg-[#171717]/10 shadow-[4px_4px_0px_#171717]'
                      : 'border-[#171717] bg-[#F7F5EF] hover:border-[#171717]'
                  }`}
                >
                  <div className="text-[10px] text-[#171717] font-bold uppercase tracking-widest">CENSUS DEMOGRAPHY</div>
                  <div className="font-bold text-[#171717] text-sm uppercase mt-1">
                    {currentScenario.populationMetric}
                  </div>
                  <div className="text-[10px] text-[#171717]/70 font-sans mt-0.5">
                    Affected Citizen Density
                  </div>
                </div>
              </div>

              {/* ARROW CONVERGE */}
              <div className="flex flex-col items-center w-full max-w-xl text-[#171717]">
                <div className="w-full h-0.5 bg-[#171717] relative my-1"></div>
                <div className="h-4 w-0.5 bg-[#171717]"></div>
                <div className="text-[10px]">▼</div>
              </div>

              {/* LEVEL 4: PRIORITY SCORE ENGINE */}
              <div 
                onClick={() => setSelectedNodeId(currentScenario.nodes[4].id)}
                className={`w-80 p-4 border-2 transition-all cursor-pointer text-center relative ${
                  activeNode.id === currentScenario.nodes[4].id
                    ? 'border-[#D65A3A] bg-[#D65A3A] text-white shadow-[4px_4px_0px_#171717]'
                    : 'border-[#171717] bg-white hover:border-[#D65A3A]'
                }`}
              >
                <div className="flex items-center justify-center gap-2 font-bold text-base uppercase">
                  <Cpu className="w-4 h-4" />
                  PRIORITY ENGINE: {currentScenario.priorityScore} / 100
                </div>
                <div className={`text-[11px] font-sans mt-0.5 ${activeNode.id === currentScenario.nodes[4].id ? 'text-white/90' : 'text-[#171717]/80'}`}>
                  Deterministic Audit Matrix (Tier 1 Priority)
                </div>
              </div>

              {/* ARROW DOWN */}
              <div className="flex flex-col items-center text-[#171717]">
                <div className="h-4 w-0.5 bg-[#171717]"></div>
                <div className="text-[10px]">▼</div>
              </div>

              {/* LEVEL 5: SCOPED CAPITAL WORK */}
              <div 
                onClick={() => setSelectedNodeId(currentScenario.nodes[5].id)}
                className={`w-80 p-3.5 border-2 transition-all cursor-pointer text-center ${
                  activeNode.id === currentScenario.nodes[5].id
                    ? 'border-[#285943] bg-[#285943]/10 shadow-[4px_4px_0px_#285943]'
                    : 'border-[#171717] bg-[#F7F5EF] hover:border-[#285943]'
                }`}
              >
                <div className="flex items-center justify-center gap-2 font-bold text-[#285943] text-sm uppercase">
                  <Box className="w-4 h-4" />
                  {currentScenario.actionTitle}
                </div>
                <div className="text-[11px] text-[#171717]/80 font-sans mt-0.5">
                  AI Engineering Work Order
                </div>
              </div>

              {/* ARROW DOWN */}
              <div className="flex flex-col items-center text-[#171717]">
                <div className="h-4 w-0.5 bg-[#171717]"></div>
                <div className="text-[10px]">▼</div>
              </div>

              {/* LEVEL 6: SANCTIONED GOVERNMENT PLAN */}
              <div 
                onClick={() => setSelectedNodeId(currentScenario.nodes[6].id)}
                className={`w-80 p-3.5 border-2 transition-all cursor-pointer text-center ${
                  activeNode.id === currentScenario.nodes[6].id
                    ? 'border-[#171717] bg-[#171717] text-white shadow-[4px_4px_0px_#D65A3A]'
                    : 'border-[#171717] bg-[#F7F5EF] hover:border-[#171717]'
                }`}
              >
                <div className="flex items-center justify-center gap-2 font-bold text-sm uppercase">
                  <CheckCircle2 className="w-4 h-4 text-[#285943]" />
                  {currentScenario.planTitle}
                </div>
                <div className={`text-[11px] font-sans mt-0.5 ${activeNode.id === currentScenario.nodes[6].id ? 'text-white/80' : 'text-[#171717]/80'}`}>
                  Cabinet Brief & Budget Sanction
                </div>
              </div>

            </div>
          </div>

          {/* NODE INSPECTION DOSSIER */}
          {activeNode && (
            <div className="p-5 bg-white border border-[#171717] shadow-[4px_4px_0px_#171717] space-y-4 font-mono text-xs animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#171717]/10 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeNode.color }}></span>
                  <span className="font-bold text-[#171717] text-sm uppercase">
                    NODE INSPECTION: {activeNode.title}
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-[#171717]/10 text-[#171717] font-bold uppercase text-[10px]">
                  DATA SOURCE: {activeNode.dataSource}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                <div className="space-y-1">
                  <span className="font-mono text-[10px] text-[#171717]/60 font-bold uppercase">Relationship Role:</span>
                  <p className="text-[#171717] font-medium leading-relaxed">
                    {activeNode.description}
                  </p>
                </div>

                <div className="space-y-1 bg-[#F7F5EF] p-3 border border-[#171717]/20 font-mono text-[11px]">
                  <span className="text-[10px] text-[#D65A3A] font-bold uppercase block">Audit Log / System Execution:</span>
                  <code className="text-[#171717] block font-semibold break-all">
                    {activeNode.auditSnippet}
                  </code>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* VIEW MODE 2: ASCII SCHEMA VIEW (EXACT MATCHING USER PROMPT) */}
      {viewMode === 'ascii' && (
        <div className="p-6 bg-[#171717] text-[#F7F5EF] border border-[#171717] shadow-[4px_4px_0px_#D65A3A] font-mono text-xs sm:text-sm space-y-4 overflow-x-auto">
          <div className="flex items-center justify-between border-b border-white/20 pb-2 text-[11px] text-[#D9A441]">
            <span>SYSTEM SCHEMA & RELATIONSHIP ARCHITECTURE</span>
            <span>CIVICPULSE CORE GRAPH</span>
          </div>

          <pre className="text-white leading-relaxed font-bold tracking-wider py-4 text-center sm:text-left select-all">
{`              ${currentScenario.citizensCount}
                    │
                    ▼
             ${currentScenario.problemTitle}
                    │
           ┌────────┴────────┐
           ▼                 ▼
     INFRASTRUCTURE       POPULATION
       ${currentScenario.infraGapMetric}           ${currentScenario.populationMetric}
           │                 │
           └────────┬────────┘
                    ▼
             PRIORITY: ${currentScenario.priorityScore}
                    │
                    ▼
          ${currentScenario.actionTitle}
                    │
                    ▼
            ${currentScenario.planTitle}`}
          </pre>

          <div className="pt-3 border-t border-white/20 text-[11px] text-white/70 font-sans flex flex-col sm:flex-row justify-between gap-2">
            <div>
              <strong className="text-white">Key Takeaway:</strong> Public complaints do not directly trigger budget spending. They feed an open relational graph.
            </div>
            <div className="font-mono text-[#D65A3A] font-bold">
              Budget Allocated: {currentScenario.budgetInr}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Architectural Summary Bar */}
      <div className="p-4 bg-white border border-[#171717] font-mono text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-[#285943]"></span>
          <span className="font-bold text-[#171717]">CONNECTED DATA PIPELINE:</span>
          <span className="text-[#171717]/80">Bhashini Voice → Gemini Categorizer → PWD Registry → Priority Score → Executive Brief</span>
        </div>
        <a 
          href="#priority-engine-section"
          className="text-[#D65A3A] hover:underline font-bold text-xs uppercase tracking-wider cursor-pointer"
        >
          View Full Priority Engine Formulas →
        </a>
      </div>

    </div>
  );
};
