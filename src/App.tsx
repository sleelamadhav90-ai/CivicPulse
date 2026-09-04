import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Menu, 
  X, 
  Sparkles, 
  Radio, 
  CheckCircle2, 
  Info,
  Layers,
  RotateCcw,
  Globe
} from 'lucide-react';
import { District, CitizenRequest, InfrastructureCategory, ScoreBreakdown, GovernmentProject, ProjectLifecycleStatus, RecommendedProject, CountryCode } from './types';
import { DISTRICTS_REGISTRY, getDistrictsForCountry } from './data/districts';
import { INITIAL_CITIZEN_REQUESTS, getRequestsForCountry } from './data/initialRequests';
import { INITIAL_GOVERNMENT_PROJECTS } from './data/initialProjects';
import { GLOBAL_COUNTRIES } from './data/globalConfig';
import { Sidebar, NavTab } from './components/Sidebar';
import { Overview } from './components/Overview';
import { PriorityEngine } from './components/PriorityEngine';
import { CitizenIngestion } from './components/CitizenIngestion';
import { HotspotMap } from './components/HotspotMap';
import { PolicyLab } from './components/PolicyLab';
import { ProjectsView } from './components/ProjectsView';
import { ImpactSimulator } from './components/ImpactSimulator';
import { SettingsView } from './components/SettingsView';
import { ScoreBreakdownModal } from './components/ScoreBreakdownModal';
import { AtlasLanding } from './components/AtlasLanding';
import { PublicInfrastructureBlocks } from './components/PublicInfrastructureBlocks';
import { GlobalHeader } from './components/GlobalHeader';
import { GlobalWorldMapCanvas } from './components/GlobalWorldMapCanvas';
import { GlobalConnectorsView } from './components/GlobalConnectorsView';
import { GovernmentBriefing } from './components/GovernmentBriefing';
import { PatternIntelligence } from './components/PatternIntelligence';
import { InvestmentIntelligence } from './components/InvestmentIntelligence';
import { PortalHubModal } from './components/PortalHub';
import { CitizenSignalsView } from './components/CitizenSignalsView';
import { CitizenSubmissionView } from './components/CitizenSubmissionView';
import { CommunityIssuesView } from './components/CommunityIssuesView';
import { InfrastructureView } from './components/InfrastructureView';
import { DemographicsView } from './components/DemographicsView';

export default function App() {
  const [hasEntered, setHasEntered] = useState(true);
  const [selectedCountryCode, setSelectedCountryCode] = useState<CountryCode>('IN');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  const districts = useMemo(() => getDistrictsForCountry(selectedCountryCode), [selectedCountryCode]);

  // Persistent citizen requests initialized from local storage
  const [customRequests, setCustomRequests] = useState<CitizenRequest[]>(() => {
    try {
      const saved = localStorage.getItem('civicpulse_custom_requests');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  // Fetch backend persisted requests from file storage on mount
  useEffect(() => {
    fetch('/api/citizen-requests')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.requests) && data.requests.length > 0) {
          setCustomRequests(prev => {
            const existingIds = new Set(prev.map(r => r.id));
            const newOnes = data.requests.filter((r: CitizenRequest) => !existingIds.has(r.id));
            if (newOnes.length > 0) {
              const merged = [...newOnes, ...prev];
              try {
                localStorage.setItem('civicpulse_custom_requests', JSON.stringify(merged));
              } catch {}
              return merged;
            }
            return prev;
          });
        }
      })
      .catch(err => console.warn('Could not fetch server persisted requests:', err));
  }, []);

  // Save custom requests to local storage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('civicpulse_custom_requests', JSON.stringify(customRequests));
    } catch {}
  }, [customRequests]);
  
  const requests = useMemo(() => {
    const defaultCountryRequests = getRequestsForCountry(selectedCountryCode);
    return [...customRequests, ...defaultCountryRequests];
  }, [selectedCountryCode, customRequests]);

  const [governmentProjects, setGovernmentProjects] = useState<GovernmentProject[]>(() => {
    try {
      const saved = localStorage.getItem('civicpulse_gov_projects');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return INITIAL_GOVERNMENT_PROJECTS;
  });

  // Default to 'overview' for the clean public digital infrastructure dashboard
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalDirectoryOpen, setPortalDirectoryOpen] = useState(false);

  // Dedicated Submission Mode & Tracking Target State
  const [submissionInitialMode, setSubmissionInitialMode] = useState<'write' | 'voice'>('write');
  const [submissionInitialCategory, setSubmissionInitialCategory] = useState<InfrastructureCategory | undefined>(undefined);
  const [focusedRequestId, setFocusedRequestId] = useState<string | undefined>(undefined);

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

  // Persist government projects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('civicpulse_gov_projects', JSON.stringify(governmentProjects));
    } catch {}
  }, [governmentProjects]);

  // Handle Add New Ingested Request
  const handleAddRequest = (newReq: CitizenRequest) => {
    setCustomRequests((prev) => [newReq, ...prev]);
  };

  // Update Government Project Status
  const handleUpdateProjectStatus = (
    projectId: string, 
    newStatus: ProjectLifecycleStatus, 
    note?: string
  ) => {
    setGovernmentProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;

        let newProgress = proj.progress;
        if (newStatus === 'Recommended') newProgress = 0;
        else if (newStatus === 'Approved' && proj.progress === 0) newProgress = 15;
        else if (newStatus === 'In Progress' && (proj.progress < 25 || proj.progress === 100)) newProgress = 50;
        else if (newStatus === 'Completed') newProgress = 100;

        const newHistoryEntry = {
          status: newStatus,
          timestamp: new Date().toISOString(),
          note: note || `Status transitioned to ${newStatus}.`,
          actor: 'Municipal Administration Authority'
        };

        return {
          ...proj,
          status: newStatus,
          progress: newProgress,
          completedDate: newStatus === 'Completed' ? new Date().toISOString().split('T')[0] : proj.completedDate,
          history: [newHistoryEntry, ...proj.history]
        };
      })
    );
  };

  // Convert AI Recommendation to a Government Project
  const handleConvertToGovernmentProject = (recommended: RecommendedProject) => {
    const existing = governmentProjects.find(p => p.districtId === recommended.districtId && p.category === recommended.category);
    if (existing) {
      handleUpdateProjectStatus(
        existing.id, 
        'Approved', 
        `Sanctioned and converted from AI Recommendation with ₹${(existing.estimatedCostInr / 10000000).toFixed(1)} Cr allocation.`
      );
      setActiveTab('projects');
      return;
    }

    const newProject: GovernmentProject = {
      id: `gov-proj-${Date.now()}`,
      title: `${recommended.title} — ${recommended.districtName}`,
      district: recommended.districtName,
      districtId: recommended.districtId,
      state: recommended.state,
      category: recommended.category,
      priorityScore: recommended.priorityScore,
      citizenRequestsCount: recommended.citizenRequestsCount,
      population: recommended.targetBeneficiaries,
      estimatedCostInr: recommended.estimatedBudgetInr,
      status: 'Approved',
      progress: 15,
      department: recommended.category === 'Drainage' 
        ? 'Municipal Administration & Urban Development (MA&UD)'
        : recommended.category === 'Water'
        ? 'Rural Water Supply & Sanitation (RWSS)'
        : recommended.category === 'Roads'
        ? 'Public Works Department (PWD)'
        : recommended.category === 'Electricity'
        ? 'State Energy Transmission Agency'
        : recommended.category === 'Health' || recommended.category === 'Healthcare'
        ? 'Health & Family Welfare Department'
        : 'School Education Department',
      officerInCharge: 'Nodal Executive Engineer',
      startDate: 'Q2 2025',
      targetDate: `Q${Math.min(4, Math.ceil(recommended.timelineMonths / 3))} 2025`,
      beforeAccess: 30,
      afterAccess: 88,
      description: recommended.summaryReasoning,
      keyReasoning: recommended.keyBulletPoints,
      aiSummary: recommended.aiRecommendation,
      sourceRecommendationId: recommended.id,
      history: [
        {
          status: 'Recommended',
          timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
          note: `AI calculated priority score of ${recommended.priorityScore}/100 based on ${recommended.citizenRequestsCount} requests.`,
          actor: 'CivicPulse AI Priority Engine'
        },
        {
          status: 'Approved',
          timestamp: new Date().toISOString(),
          note: `Project officially sanctioned and converted to Government Project with ₹${(recommended.estimatedBudgetInr / 10000000).toFixed(1)} Cr capital allocation.`,
          actor: 'State Planning Commission'
        }
      ]
    };

    setGovernmentProjects(prev => [newProject, ...prev]);
    setActiveTab('projects');
  };

  // Reset to demo baseline
  const handleResetData = () => {
    setCustomRequests([]);
    setGovernmentProjects(INITIAL_GOVERNMENT_PROJECTS);
    try {
      localStorage.removeItem('civicpulse_requests');
      localStorage.removeItem('civicpulse_gov_projects');
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
    <>
      {!hasEntered && <AtlasLanding onEnter={() => setHasEntered(true)} />}
      
      {/* Global Header Bar */}
      <div className={`min-h-screen bg-[#F7F5EF] text-[#171717] flex flex-col font-sans selection:bg-[#D65A3A]/20 selection:text-[#D65A3A] transition-opacity duration-1000 ${hasEntered ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
        
        <GlobalHeader
          activeTab={activeTab}
          onNavigate={(tab) => setActiveTab(tab)}
          selectedCountryCode={selectedCountryCode}
          onSelectCountry={(code) => setSelectedCountryCode(code)}
          selectedLanguage={selectedLanguage}
          onSelectLanguage={(lang) => setSelectedLanguage(lang)}
          isWorldAtlasActive={activeTab === 'world'}
          onToggleWorldAtlas={() => setActiveTab(activeTab === 'world' ? 'map' : 'world')}
          onNavigateToConnectors={() => setActiveTab('connectors')}
          onNavigateToSchema={() => setActiveTab('connectors')}
          onOpenPortalDirectory={() => setPortalDirectoryOpen(true)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <div className="flex-1 flex min-w-0">
          {/* Sidebar Navigation */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            requestsCount={requests.length}
            projectsCount={governmentProjects.length}
            onOpenMethodology={() => setMethodologyModalOpen(true)}
            onOpenPortalDirectory={() => setPortalDirectoryOpen(true)}
            isOpenMobile={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Dynamic View Panel */}
            <main className={`flex-1 ${activeTab === 'map' ? 'p-0 w-full h-[calc(100vh-48px)] overflow-hidden' : 'p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto'}`}>
              {activeTab === 'world' && (
                <GlobalWorldMapCanvas
                  selectedCountryCode={selectedCountryCode}
                  onSelectCountry={(code) => setSelectedCountryCode(code)}
                  onEnterCountryAtlas={(code) => {
                    setSelectedCountryCode(code);
                    setActiveTab('map');
                  }}
                />
              )}

              {activeTab === 'connectors' && (
                <GlobalConnectorsView
                  selectedCountryCode={selectedCountryCode}
                  onSelectCountry={(code) => setSelectedCountryCode(code)}
                  selectedLanguage={selectedLanguage}
                  onSelectLanguage={(langCode) => setSelectedLanguage(langCode)}
                />
              )}

              {activeTab === 'blocks' && (
                <PublicInfrastructureBlocks />
              )}

          {activeTab === 'overview' && (
            <Overview
              districts={districts}
              requests={requests}
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectDistrictForPolicy={(districtId, category) => {
                setPolicyTargetDistrictId(districtId);
                setPolicyTargetCategory(category as InfrastructureCategory);
              }}
              onSelectCategoryForReporting={(category) => {
                setSubmissionInitialCategory(category);
                setSubmissionInitialMode('write');
                setActiveTab('submit');
              }}
              onStartVoiceSubmission={() => {
                setSubmissionInitialMode('voice');
                setActiveTab('submit');
              }}
              onStartWriteSubmission={() => {
                setSubmissionInitialMode('write');
                setActiveTab('submit');
              }}
            />
          )}

          {activeTab === 'submit' && (
            <CitizenSubmissionView
              districts={districts}
              initialMode={submissionInitialMode}
              initialCategory={submissionInitialCategory}
              onAddRequest={handleAddRequest}
              onViewRequest={(reqId) => {
                setFocusedRequestId(reqId);
                setActiveTab('signals');
              }}
            />
          )}

          {activeTab === 'signals' && (
            <CitizenSignalsView
              requests={requests}
              selectedLanguage={selectedLanguage}
              selectedRequestId={focusedRequestId}
              onNavigateToIssues={() => setActiveTab('issues')}
              onNavigateToSubmit={() => {
                setSubmissionInitialMode('write');
                setActiveTab('submit');
              }}
            />
          )}

          {activeTab === 'issues' && (
            <CommunityIssuesView
              requests={requests}
              governmentProjects={governmentProjects}
              onNavigateToRecommendations={() => setActiveTab('recommendations')}
            />
          )}

          {activeTab === 'patterns' && (
            <PatternIntelligence
              districts={districts}
              requests={requests}
              onNavigateToMap={() => setActiveTab('map')}
              onNavigateToRecommendations={() => setActiveTab('recommendations')}
              onNavigateToPolicyLab={(districtId, category) => {
                setPolicyTargetDistrictId(districtId);
                setPolicyTargetCategory(category);
                setActiveTab('insights');
              }}
            />
          )}

          {activeTab === 'infrastructure' && (
            <InfrastructureView
              districtId={policyTargetDistrictId}
              onNavigateToRecommendations={() => setActiveTab('recommendations')}
            />
          )}

          {activeTab === 'demographics' && (
            <DemographicsView
              districts={districts}
              onNavigateToRecommendations={() => setActiveTab('recommendations')}
            />
          )}

          {(activeTab === 'recommendations' || activeTab === 'engine') && (
            <PriorityEngine
              districts={districts}
              requests={requests}
              policyTargetDistrictId={policyTargetDistrictId}
              policyTargetCategory={policyTargetCategory}
              onSelectProjectForPolicy={(districtId, category) => {
                setPolicyTargetDistrictId(districtId);
                setPolicyTargetCategory(category);
                setActiveTab('insights');
              }}
              onNavigateToImpact={(districtId, category) => {
                setPolicyTargetDistrictId(districtId);
                setPolicyTargetCategory(category);
                setActiveTab('impact');
              }}
              onNavigateToMap={() => setActiveTab('map')}
              onConvertToGovernmentProject={handleConvertToGovernmentProject}
              onNavigateToProjects={() => setActiveTab('action_queue')}
            />
          )}

          {activeTab === 'investment' && (
            <InvestmentIntelligence
              districts={districts}
              onNavigateToEngine={() => setActiveTab('recommendations')}
              onNavigateToPolicyLab={(districtId, category) => {
                setPolicyTargetDistrictId(districtId);
                setPolicyTargetCategory(category);
                setActiveTab('insights');
              }}
            />
          )}

          {activeTab === 'briefing' && (
            <GovernmentBriefing
              districts={districts}
              requests={requests}
              selectedCountryCode={selectedCountryCode}
              onInvestigateDistrict={(districtId, category) => {
                setPolicyTargetDistrictId(districtId);
                setPolicyTargetCategory(category);
                setActiveTab('map');
              }}
              onNavigateToMap={() => setActiveTab('map')}
            />
          )}

          {activeTab === 'map' && (
            <HotspotMap
              districts={districts}
              requests={requests}
              onSelectHotspotForPolicy={handleSelectHotspotForPolicy}
              onOpenScoreModal={handleOpenScoreModal}
              selectedCountryCode={selectedCountryCode}
              onNavigateToBriefing={() => setActiveTab('briefing')}
              onNavigateToEngine={() => setActiveTab('recommendations')}
              onNavigateToCommunityIssues={(districtId, category) => {
                if (districtId) setPolicyTargetDistrictId(districtId);
                if (category) setPolicyTargetCategory(category as InfrastructureCategory);
                setActiveTab('issues');
              }}
              onNavigateToRecommendations={(districtId, category) => {
                if (districtId) setPolicyTargetDistrictId(districtId);
                if (category) setPolicyTargetCategory(category as InfrastructureCategory);
                setActiveTab('recommendations');
              }}
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

          {(activeTab === 'action_queue' || activeTab === 'projects') && (
            <ProjectsView
              districts={districts}
              projects={governmentProjects}
              onUpdateProjectStatus={handleUpdateProjectStatus}
              onNavigateToImpact={handleNavigateToImpact}
              onNavigateToPolicyLab={(districtId, category) => {
                setPolicyTargetDistrictId(districtId);
                setPolicyTargetCategory(category);
                setActiveTab('insights');
              }}
              onNavigateToEngine={() => setActiveTab('recommendations')}
            />
          )}

          {activeTab === 'impact' && (
            <ImpactSimulator
              districts={districts}
              requests={requests}
              governmentProjects={governmentProjects}
              initialDistrictId={policyTargetDistrictId}
              initialCategory={policyTargetCategory}
              onNavigateToProjects={() => setActiveTab('projects')}
              onNavigateToEngine={() => setActiveTab('engine')}
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

        {/* Global Footer (Hidden on map workspace so map has full vertical focus) */}
        {activeTab !== 'map' && (
          <footer className="border-t border-[#171717] bg-[#F7F5EF] py-4 mt-8 text-[#171717]/70 font-mono text-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3 text-xs text-[#171717]">
                <span className="font-serif font-bold tracking-wider text-[#171717] uppercase">CIVICPULSE</span>
                <span>•</span>
                <span className="font-semibold text-[#171717]">Designed for India · Scalable by Design</span>
                <span>•</span>
                <span className="hidden sm:inline text-[#D65A3A] font-bold">India Stack DPI Engine</span>
              </div>

              <div className="flex items-center space-x-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#285943]"></div>
                  <span>India Stack Live</span>
                </div>
                <button
                  onClick={() => setMethodologyModalOpen(true)}
                  className="text-[#D65A3A] hover:underline font-bold text-xs transition-colors cursor-pointer"
                >
                  Architecture Specs
                </button>
              </div>
            </div>
          </footer>
        )}
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

            <div className="p-6 space-y-5 text-sm text-slate-700 max-h-[75vh] overflow-y-auto leading-relaxed">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  CivicPulse System Architecture & Extensible Topology
                </h2>
                <p className="text-xs text-slate-500">
                  A modular prototype designed to scale from municipal wards to multilateral BRICS infrastructure cooperation.
                </p>
              </div>

              {/* ASCII / Monospace 3-Pillar Diagram */}
              <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto shadow-xs border border-slate-800">
                <div className="text-blue-400 font-bold uppercase tracking-wider text-[10px] pb-2 border-b border-slate-800">
                  Decoupled Tri-Pillar Architecture:
                </div>
                <pre className="mt-2 text-slate-300">
{`                    CIVICPULSE
                        │
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
    Citizens          AI Engine      Government
        │               │               │
   Voice/Text      Classification    Dashboard
        │           Prioritization       │
        ↓               │               ↓
   Requests ────────────┼────────── Projects
                        │
                        ↓
                 Demand Hotspots
                        │
                        ↓
                   Impact Data`}
                </pre>
              </div>

              {/* Extensibility Hierarchy */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-emerald-900 uppercase tracking-wider block">
                  Hierarchical Scalability (Without Core Architecture Changes)
                </span>
                <p className="text-slate-800 leading-relaxed">
                  <strong>Current Working Prototype:</strong> <span className="font-mono text-emerald-800">India → Andhra Pradesh / Maharashtra → District → Municipality</span>
                </p>
                <p className="text-slate-800 leading-relaxed">
                  <strong>Extensible BRICS Scale:</strong> <span className="font-mono text-emerald-800">India / Brazil / Russia / China / South Africa / UAE / Egypt</span> (re-uses the identical citizen ingestion, mathematical priority engine, and government execution pipeline by simply loading regional boundary GIS datasets).
                </p>
              </div>

              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5">
                <span className="text-xs uppercase tracking-wider text-blue-700 font-bold block">Key Architectural Principle</span>
                <p className="text-slate-800 text-xs">
                  <strong className="text-blue-950">Separation of Intelligence from Decision Logic:</strong> Gemini is used as the Multilingual Ingestion & Synthesis Layer (translating local dialects, categorizing, and drafting memos). The Priority Score is calculated by an immutable, deterministic mathematical formula to guarantee transparent fiscal auditability.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
                  The Closed-Loop DPI Cycle:
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-700 pl-1 text-xs">
                  <li><strong className="text-slate-900">Listen:</strong> Citizens speak in native regional dialects (Telugu, Hindi, Marathi) or submit text.</li>
                  <li><strong className="text-slate-900">Understand:</strong> Gemini extracts category, location, and urgency; normalizes to district coordinates.</li>
                  <li><strong className="text-slate-900">Fuse:</strong> Merges citizen demand with national demographic, poverty, and infrastructure access baselines.</li>
                  <li><strong className="text-slate-900">Prioritize:</strong> The deterministic Priority Engine computes an auditable 0–100 score.</li>
                  <li><strong className="text-slate-900">Recommend:</strong> The AI Policy Lab generates executive briefs for public infrastructure funding.</li>
                  <li><strong className="text-slate-900">Convert & Execute:</strong> Government converts recommendations to sanctioned projects across the 4 stages (Recommended ➔ Approved ➔ In Progress ➔ Completed).</li>
                  <li><strong className="text-slate-900">Measure:</strong> The Impact Simulator quantifies post-project access improvement and closes the loop.</li>
                </ol>
              </div>

              <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-1 font-mono text-xs">
                <div className="text-slate-400 uppercase tracking-wider text-[10px]">Standardized National Priority Formula:</div>
                <div className="text-amber-300 font-semibold">
                  Score = (Demand × 0.30) + (InfraGap × 0.25) + (Population × 0.20) + (Urgency × 0.15) + (GovPriority × 0.10)
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

      {/* PORTAL DIRECTORY MODAL */}
      <PortalHubModal
        isOpen={portalDirectoryOpen}
        onClose={() => setPortalDirectoryOpen(false)}
        activeTab={activeTab}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setPortalDirectoryOpen(false);
        }}
        requestsCount={requests.length}
        projectsCount={governmentProjects.length}
      />
        </div>
      </div>
    </>
  );
}
