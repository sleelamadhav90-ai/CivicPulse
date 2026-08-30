import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Radio, 
  MapPin, 
  FileText, 
  TrendingUp, 
  ShieldCheck, 
  Layers, 
  Calculator, 
  Globe2, 
  Sparkles, 
  CheckCircle2,
  X
} from 'lucide-react';
import { District, CitizenRequest, InfrastructureCategory, ScoreBreakdown } from './types';
import { DISTRICTS_REGISTRY } from './data/districts';
import { INITIAL_CITIZEN_REQUESTS } from './data/initialRequests';
import { Navbar } from './components/Navbar';
import { CitizenIngestion } from './components/CitizenIngestion';
import { HotspotMap } from './components/HotspotMap';
import { PolicyLab } from './components/PolicyLab';
import { ImpactSimulator } from './components/ImpactSimulator';
import { ScoreBreakdownModal } from './components/ScoreBreakdownModal';
import { calculatePriorityScore } from './utils/scoring';

export default function App() {
  const [districts] = useState<District[]>(DISTRICTS_REGISTRY);
  const [requests, setRequests] = useState<CitizenRequest[]>(() => {
    try {
      const saved = localStorage.getItem('civicpulse_requests');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return INITIAL_CITIZEN_REQUESTS;
  });

  const [activeTab, setActiveTab] = useState<'ingestion' | 'hotspots' | 'policylab' | 'impact'>('ingestion');

  // Policy Lab Target State
  const [policyTargetDistrictId, setPolicyTargetDistrictId] = useState<string>('guntur');
  const [policyTargetCategory, setPolicyTargetCategory] = useState<InfrastructureCategory>('Water');

  // Score Audit Modal State
  const [scoreModalState, setScoreModalState] = useState<{
    isOpen: boolean;
    breakdown: ScoreBreakdown | null;
    district: District | null;
    category: InfrastructureCategory | null;
  }>({
    isOpen: false,
    breakdown: null,
    district: null,
    category: null,
  });

  // Methodology Modal State
  const [methodologyModalOpen, setMethodologyModalOpen] = useState(false);

  // Persist requests to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('civicpulse_requests', JSON.stringify(requests));
    } catch {}
  }, [requests]);

  // Handle Add New Ingested Request
  const handleAddRequest = (newReq: CitizenRequest) => {
    setRequests((prev) => [newReq, ...prev]);
  };

  // Reset to demo baseline
  const handleResetData = () => {
    setRequests(INITIAL_CITIZEN_REQUESTS);
    try {
      localStorage.removeItem('civicpulse_requests');
    } catch {}
  };

  // Open Score Breakdown Modal
  const handleOpenScoreModal = (
    breakdown: ScoreBreakdown,
    district: District,
    category: InfrastructureCategory
  ) => {
    setScoreModalState({
      isOpen: true,
      breakdown,
      district,
      category,
    });
  };

  // Cross-Tab Navigation Handlers
  const handleSelectHotspotForPolicy = (district: District, category: InfrastructureCategory) => {
    setPolicyTargetDistrictId(district.id);
    setPolicyTargetCategory(category);
    setActiveTab('policylab');
  };

  const handleNavigateToImpact = (districtId: string, category: InfrastructureCategory) => {
    setPolicyTargetDistrictId(districtId);
    setPolicyTargetCategory(category);
    setActiveTab('impact');
  };

  return (
    <div className="min-h-screen bg-[#0c0d10] text-[#e2e8f0] flex flex-col font-sans selection:bg-white/20 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        districts={districts}
        requests={requests}
        onResetData={handleResetData}
        onOpenMethodology={() => setMethodologyModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'ingestion' && (
          <CitizenIngestion
            districts={districts}
            requests={requests}
            onAddRequest={handleAddRequest}
            onOpenScoreModal={handleOpenScoreModal}
            onNavigateToHotspots={() => setActiveTab('hotspots')}
          />
        )}

        {activeTab === 'hotspots' && (
          <HotspotMap
            districts={districts}
            requests={requests}
            onSelectHotspotForPolicy={handleSelectHotspotForPolicy}
            onOpenScoreModal={handleOpenScoreModal}
          />
        )}

        {activeTab === 'policylab' && (
          <PolicyLab
            districts={districts}
            requests={requests}
            selectedDistrictId={policyTargetDistrictId}
            selectedCategory={policyTargetCategory}
            onSelectDistrict={setPolicyTargetDistrictId}
            onSelectCategory={setPolicyTargetCategory}
            onNavigateToImpact={handleNavigateToImpact}
          />
        )}

        {activeTab === 'impact' && (
          <ImpactSimulator
            districts={districts}
            initialDistrictId={policyTargetDistrictId}
            initialCategory={policyTargetCategory}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 bg-[#0c0d10] py-4 mt-12 text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-[10px] uppercase tracking-widest text-slate-500">
            <span className="font-light tracking-[0.2em] text-white">CIVICPULSE</span>
            <span>•</span>
            <span>Deterministic DPI Platform</span>
            <span>•</span>
            <span className="hidden sm:inline">National Development Intelligence</span>
          </div>

          <div className="flex items-center space-x-6 text-[10px] tracking-wide">
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
              <span>System Operational • Mathematical DPI Core</span>
            </div>
            <button
              onClick={() => setMethodologyModalOpen(true)}
              className="text-slate-400 hover:text-white uppercase tracking-wider text-[10px] transition-colors cursor-pointer"
            >
              Methodology & Audit
            </button>
          </div>
        </div>
      </footer>

      {/* Score Breakdown Modal */}
      <ScoreBreakdownModal
        isOpen={scoreModalState.isOpen}
        onClose={() => setScoreModalState((prev) => ({ ...prev, isOpen: false }))}
        breakdown={scoreModalState.breakdown}
        district={scoreModalState.district}
        category={scoreModalState.category}
      />

      {/* Engine Methodology Modal */}
      {methodologyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c0d10]/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-[#111318] border border-slate-800 rounded-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-[#0c0d10]">
              <div className="flex items-center space-x-2.5">
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500">SYSTEM ARCHITECTURE</span>
              </div>
              <button
                onClick={() => setMethodologyModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-300 max-h-[75vh] overflow-y-auto leading-relaxed">
              <h2 className="text-xl font-light tracking-tight text-white">
                CivicPulse Core Architecture & Methodology
              </h2>
              <div className="p-4 bg-white/[0.02] border border-slate-800 rounded-lg space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold block">Key Architectural Principle</span>
                <p className="text-slate-300">
                  <strong className="text-white">Separation of Intelligence from Decision Logic:</strong> Gemini is used as the Multilingual Ingestion & Synthesis Layer (translating local dialects, categorizing, and drafting memos). The Priority Score is calculated by an immutable, deterministic mathematical formula to guarantee transparent fiscal auditability.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold block">
                  The Closed-Loop DPI Cycle:
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1">
                  <li><strong className="text-slate-100">Listen:</strong> Citizens speak in native regional dialects (Telugu, Hindi, Marathi, etc.) or submit text.</li>
                  <li><strong className="text-slate-100">Understand:</strong> Gemini extracts category, location, and urgency; normalizes to district coordinates.</li>
                  <li><strong className="text-slate-100">Fuse:</strong> Merges citizen demand with national demographic, poverty, and infrastructure access baselines.</li>
                  <li><strong className="text-slate-100">Prioritize:</strong> The deterministic Priority Engine computes an auditable 0–100 score.</li>
                  <li><strong className="text-slate-100">Recommend:</strong> The AI Policy Lab generates executive briefs for public infrastructure funding.</li>
                  <li><strong className="text-slate-100">Measure:</strong> The Impact Simulator quantifies post-project access improvement and closes the loop.</li>
                </ol>
              </div>

              <div className="p-3.5 bg-[#08090c] rounded-lg border border-slate-800 space-y-1 font-mono text-[11px]">
                <div className="text-slate-500 uppercase tracking-widest text-[9px]">Standardized National Priority Formula:</div>
                <div className="text-slate-200">
                  Score = (Demand × 0.35) + (InfraGap × 0.25) + (Severity × 0.15) + (Poverty × 0.15) + (Alignment × 0.10)
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-800/50 bg-[#0c0d10] flex justify-end">
              <button
                onClick={() => setMethodologyModalOpen(false)}
                className="px-4 py-2 text-[10px] uppercase tracking-widest font-semibold text-slate-900 bg-slate-100 hover:bg-white rounded transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
