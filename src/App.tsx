import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Menu, 
  X, 
  Sparkles, 
  Radio, 
  CheckCircle2, 
  Info,
  Layers,
  RotateCcw
} from 'lucide-react';
import { District, CitizenRequest, InfrastructureCategory, ScoreBreakdown } from './types';
import { DISTRICTS_REGISTRY } from './data/districts';
import { INITIAL_CITIZEN_REQUESTS } from './data/initialRequests';
import { Sidebar, NavTab } from './components/Sidebar';
import { Overview } from './components/Overview';
import { CitizenIngestion } from './components/CitizenIngestion';
import { HotspotMap } from './components/HotspotMap';
import { PolicyLab } from './components/PolicyLab';
import { ProjectsView } from './components/ProjectsView';
import { ImpactSimulator } from './components/ImpactSimulator';
import { SettingsView } from './components/SettingsView';
import { ScoreBreakdownModal } from './components/ScoreBreakdownModal';

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

  // Default to 'overview' so the user immediately understands what CivicPulse does in 5-10 seconds
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    setActiveTab('insights');
  };

  const handleNavigateToImpact = (districtId: string, category: InfrastructureCategory) => {
    setPolicyTargetDistrictId(districtId);
    setPolicyTargetCategory(category);
    setActiveTab('impact');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        requestsCount={requests.length}
        onOpenMethodology={() => setMethodologyModalOpen(true)}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-slate-900 tracking-tight text-base">CivicPulse</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
              {requests.length} Signals
            </span>
            <button
              onClick={() => setMethodologyModalOpen(true)}
              className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900"
              title="Methodology"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic View Panel */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <Overview
              districts={districts}
              requests={requests}
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectDistrictForPolicy={(districtId, category) => {
                setPolicyTargetDistrictId(districtId);
                setPolicyTargetCategory(category);
              }}
            />
          )}

          {activeTab === 'submit' && (
            <CitizenIngestion
              districts={districts}
              requests={requests}
              onAddRequest={handleAddRequest}
              onOpenScoreModal={handleOpenScoreModal}
              onNavigateToHotspots={() => setActiveTab('map')}
            />
          )}

          {activeTab === 'map' && (
            <HotspotMap
              districts={districts}
              requests={requests}
              onSelectHotspotForPolicy={handleSelectHotspotForPolicy}
              onOpenScoreModal={handleOpenScoreModal}
            />
          )}

          {activeTab === 'insights' && (
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

          {activeTab === 'projects' && (
            <ProjectsView
              districts={districts}
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

          {activeTab === 'settings' && (
            <SettingsView
              districts={districts}
              requests={requests}
              onResetData={handleResetData}
              onOpenMethodology={() => setMethodologyModalOpen(true)}
            />
          )}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 mt-8 text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-xs text-slate-600">
              <span className="font-bold tracking-wider text-slate-900">CIVICPULSE</span>
              <span>•</span>
              <span>AI-Powered Civic Infrastructure Intelligence</span>
              <span>•</span>
              <span className="hidden sm:inline text-slate-500">Multilingual Ingestion + Deterministic Prioritization</span>
            </div>

            <div className="flex items-center space-x-6 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span>Engine Active</span>
              </div>
              <button
                onClick={() => setMethodologyModalOpen(true)}
                className="text-blue-600 hover:text-blue-800 font-semibold text-xs transition-colors cursor-pointer"
              >
                Methodology & Audit
              </button>
            </div>
          </div>
        </footer>
      </div>

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center space-x-2.5">
                <span className="text-xs uppercase tracking-widest font-bold text-slate-500">SYSTEM ARCHITECTURE</span>
              </div>
              <button
                onClick={() => setMethodologyModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-slate-700 max-h-[75vh] overflow-y-auto leading-relaxed">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                CivicPulse Core Architecture & Methodology
              </h2>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5">
                <span className="text-xs uppercase tracking-wider text-blue-700 font-bold block">Key Architectural Principle</span>
                <p className="text-slate-800 text-xs sm:text-sm">
                  <strong className="text-blue-950">Separation of Intelligence from Decision Logic:</strong> Gemini is used as the Multilingual Ingestion & Synthesis Layer (translating local dialects, categorizing, and drafting memos). The Priority Score is calculated by an immutable, deterministic mathematical formula to guarantee transparent fiscal auditability.
                </p>
              </div>

              <div className="space-y-2.5">
                <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
                  The Closed-Loop DPI Cycle:
                </span>
                <ol className="list-decimal list-inside space-y-2 text-slate-700 pl-1 text-xs sm:text-sm">
                  <li><strong className="text-slate-900">Listen:</strong> Citizens speak in native regional dialects (Telugu, Hindi, Marathi, etc.) or submit text.</li>
                  <li><strong className="text-slate-900">Understand:</strong> Gemini extracts category, location, and urgency; normalizes to district coordinates.</li>
                  <li><strong className="text-slate-900">Fuse:</strong> Merges citizen demand with national demographic, poverty, and infrastructure access baselines.</li>
                  <li><strong className="text-slate-900">Prioritize:</strong> The deterministic Priority Engine computes an auditable 0–100 score.</li>
                  <li><strong className="text-slate-900">Recommend:</strong> The AI Policy Lab generates executive briefs for public infrastructure funding.</li>
                  <li><strong className="text-slate-900">Measure:</strong> The Impact Simulator quantifies post-project access improvement and closes the loop.</li>
                </ol>
              </div>

              <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-1 font-mono text-xs">
                <div className="text-slate-400 uppercase tracking-wider text-[10px]">Standardized National Priority Formula:</div>
                <div className="text-amber-300 font-semibold">
                  Score = (Demand × 0.35) + (InfraGap × 0.25) + (Severity × 0.15) + (Poverty × 0.15) + (Alignment × 0.10)
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setMethodologyModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
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
