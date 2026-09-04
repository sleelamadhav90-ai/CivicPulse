import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Volume2, 
  Globe, 
  Search, 
  Play, 
  Pause, 
  ArrowRight,
  ShieldCheck, 
  Clock, 
  MapPin, 
  Info, 
  CheckCircle2, 
  ChevronRight, 
  X,
  FileEdit,
  Mic,
  Camera,
  Layers,
  Sparkles,
  ExternalLink,
  Plus
} from 'lucide-react';
import { CitizenRequest, InfrastructureCategory, RequestStatus } from '../types';

interface CitizenSignalsViewProps {
  requests: CitizenRequest[];
  onNavigateToIssues?: () => void;
  onNavigateToSubmit?: () => void;
  selectedLanguage: string;
  selectedRequestId?: string;
}

export const CitizenSignalsView: React.FC<CitizenSignalsViewProps> = ({
  requests,
  onNavigateToIssues,
  onNavigateToSubmit,
  selectedLanguage,
  selectedRequestId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedRequestModal, setSelectedRequestModal] = useState<CitizenRequest | null>(null);

  const categories: InfrastructureCategory[] = ['Water', 'Health', 'Roads', 'Electricity', 'Education', 'Drainage', 'Sanitation'];
  const statuses = ['ALL', 'Received', 'Under Review', 'Prioritized', 'Resolved'];

  // Automatically open modal if selectedRequestId was passed from submission success screen
  useEffect(() => {
    if (selectedRequestId) {
      const found = requests.find(r => r.id === selectedRequestId);
      if (found) {
        setSelectedRequestModal(found);
      }
    }
  }, [selectedRequestId, requests]);

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.summary_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.original_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'ALL' || req.category === selectedCategory;
    
    const reqStatus = req.status || 'Received';
    const matchesStatus = 
      selectedStatus === 'ALL' || 
      reqStatus.toLowerCase() === selectedStatus.toLowerCase() ||
      (selectedStatus === 'Received' && (reqStatus === 'Received' || reqStatus === 'Submitted' || reqStatus === 'Logged'));

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusStepIndex = (status?: string) => {
    switch (status) {
      case 'Received':
      case 'Submitted':
      case 'Logged':
        return 1;
      case 'Under Review': 
        return 2;
      case 'Prioritized': 
        return 3;
      case 'Action Initiated': 
        return 4;
      case 'Resolved': 
        return 5;
      default: 
        return 1;
    }
  };

  const getSourceTypeIcon = (source?: string) => {
    if (source === 'voice') return <Mic className="w-3.5 h-3.5 text-[#D65A3A]" />;
    if (source === 'voice+photo') return <span className="flex items-center gap-0.5"><Mic className="w-3.5 h-3.5 text-[#D65A3A]" /><Camera className="w-3.5 h-3.5 text-blue-600" /></span>;
    if (source === 'photo' || source === 'text+photo') return <Camera className="w-3.5 h-3.5 text-blue-600" />;
    return <FileEdit className="w-3.5 h-3.5 text-slate-700" />;
  };

  return (
    <div className="space-y-8 font-sans text-[#171717] pb-16 max-w-6xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#171717]/20 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#D65A3A] uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-[#D65A3A]" />
            <span>CITIZEN TRACKING REGISTRY · CIVICPULSE DPI</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#171717]">
            My Requests & Status Updates
          </h1>
          <p className="text-sm font-sans text-[#171717]/80 mt-1">
            Track your submitted civic issues, verified AI interpretations, and official action queue assignments in real time.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {onNavigateToSubmit && (
            <button
              onClick={onNavigateToSubmit}
              className="px-4 py-2.5 bg-[#D65A3A] hover:bg-[#c34e2f] text-white font-bold text-xs uppercase tracking-wider border-2 border-[#171717] shadow-[2px_2px_0px_#171717] flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Report An Issue</span>
            </button>
          )}

          <div className="px-4 py-2 bg-white border border-[#171717] shadow-[2px_2px_0px_#171717] text-right font-mono text-xs">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Total Ingested</span>
            <span className="font-bold text-[#D65A3A] text-base">{requests.length} Requests</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border-2 border-[#171717] p-4 shadow-[4px_4px_0px_#171717] space-y-3 text-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Tracking ID, locality, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-[#171717] text-xs focus:outline-none"
            />
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="font-mono font-bold text-slate-500 text-[10px] uppercase shrink-0">Status:</span>
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 text-[11px] font-mono font-bold border transition-all cursor-pointer shrink-0 ${
                  selectedStatus === st
                    ? 'bg-[#171717] text-white border-[#171717]'
                    : 'bg-[#F7F5EF] text-slate-700 border-slate-300 hover:border-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="font-mono font-bold text-slate-500 text-[10px] uppercase shrink-0">Category:</span>
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-2 py-1 text-[11px] font-mono font-bold border shrink-0 cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-[#D65A3A] text-white border-[#D65A3A]'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              ALL
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-1 text-[11px] font-mono font-bold border shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#D65A3A] text-white border-[#D65A3A]'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests Status List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#171717]/20 text-slate-500 font-mono text-xs space-y-2">
            <p>No civic requests match your filter criteria.</p>
            {onNavigateToSubmit && (
              <button
                onClick={onNavigateToSubmit}
                className="mt-2 px-4 py-2 bg-[#D65A3A] text-white font-bold text-xs uppercase"
              >
                Report an Issue Now
              </button>
            )}
          </div>
        ) : (
          filteredRequests.map((req) => {
            const stepIdx = getStatusStepIndex(req.status);
            const isNew = req.id.startsWith('CP-2026-');

            return (
              <div 
                key={req.id} 
                className={`bg-white border-2 border-[#171717] p-6 shadow-[4px_4px_0px_#171717] space-y-4 hover:border-[#D65A3A] transition-all cursor-pointer ${
                  isNew ? 'ring-2 ring-[#D65A3A]/40' : ''
                }`}
                onClick={() => setSelectedRequestModal(req)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#171717]/10 pb-3">
                  <div className="flex items-center space-x-2 font-mono text-xs flex-wrap gap-y-1">
                    <span className="px-2.5 py-1 bg-[#171717] text-white font-bold tracking-wider">
                      {req.id}
                    </span>
                    {isNew && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 text-[10px]">
                        NEWLY SUBMITTED
                      </span>
                    )}
                    <span className="font-bold text-[#171717] font-sans text-sm">
                      {req.category === 'Water' ? 'Water & Sanitation' : req.category === 'Roads' ? 'Roads & Transport' : req.category}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-700 font-medium">
                      📍 {req.location}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs font-mono">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F7F5EF] border border-[#171717]/20 text-[11px] font-bold">
                      {getSourceTypeIcon(req.source_type)}
                      <span className="capitalize">{req.source_type || 'Text'}</span>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {new Date(req.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-slate-900 font-sans font-medium leading-relaxed">
                    "{req.summary_en}"
                  </p>
                  {req.original_text !== req.summary_en && (
                    <p className="text-xs text-slate-500 italic font-sans line-clamp-1">
                      Native intake ({req.language}): "{req.original_text}"
                    </p>
                  )}
                </div>

                {/* Progressive Status Timeline Bar */}
                <div className="pt-2 bg-[#F7F5EF] p-4 border border-[#171717]/20 space-y-2">
                  <div className="grid grid-cols-5 text-[10px] font-mono text-center font-bold gap-1">
                    <span className={stepIdx >= 1 ? 'text-[#285943] font-bold' : 'text-slate-400 font-normal'}>
                      1. Received {stepIdx >= 1 && '✓'}
                    </span>
                    <span className={stepIdx >= 2 ? 'text-[#285943] font-bold' : 'text-slate-400 font-normal'}>
                      2. Under Review {stepIdx >= 2 && '✓'}
                    </span>
                    <span className={stepIdx >= 3 ? 'text-blue-800 font-bold' : 'text-slate-400 font-normal'}>
                      3. Prioritized {stepIdx >= 3 && '✓'}
                    </span>
                    <span className={stepIdx >= 4 ? 'text-purple-800 font-bold' : 'text-slate-400 font-normal'}>
                      4. Action Plan {stepIdx >= 4 && '✓'}
                    </span>
                    <span className={stepIdx >= 5 ? 'text-[#285943] font-bold' : 'text-slate-400 font-normal'}>
                      5. Resolved {stepIdx >= 5 && '✓'}
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex border border-[#171717]/20">
                    <div className={`h-full transition-all ${stepIdx >= 1 ? 'bg-emerald-600 w-[20%]' : 'w-0'}`}></div>
                    <div className={`h-full transition-all ${stepIdx >= 2 ? 'bg-emerald-600 w-[20%]' : 'w-0'}`}></div>
                    <div className={`h-full transition-all ${stepIdx >= 3 ? 'bg-blue-600 w-[20%]' : 'w-0'}`}></div>
                    <div className={`h-full transition-all ${stepIdx >= 4 ? 'bg-purple-600 w-[20%]' : 'w-0'}`}></div>
                    <div className={`h-full transition-all ${stepIdx >= 5 ? 'bg-emerald-600 w-[20%]' : 'w-0'}`}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 font-mono">
                  <div className="flex items-center space-x-3 text-slate-600">
                    <span>Dialect: <b>{req.language}</b></span>
                    <span>•</span>
                    <span>Severity: <b className="text-red-700">{req.severity || 8}/10</b></span>
                  </div>
                  <span className="text-[#D65A3A] font-bold flex items-center gap-1">
                    View Complete Audit & Analysis <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DETAIL AUDIT MODAL */}
      {selectedRequestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#171717] max-w-2xl w-full p-6 sm:p-8 shadow-[8px_8px_0px_#171717] space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#171717]/20 pb-4">
              <div>
                <div className="flex items-center space-x-2 font-mono text-xs">
                  <span className="px-2.5 py-0.5 bg-[#D65A3A] text-white font-bold tracking-wider">
                    {selectedRequestModal.id}
                  </span>
                  <span className="px-2 py-0.5 bg-[#285943] text-white font-bold uppercase text-[10px]">
                    Status: {selectedRequestModal.status || 'Received'}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-2xl text-[#171717] mt-1.5">
                  {selectedRequestModal.category === 'Water' ? 'Water & Sanitation' : selectedRequestModal.category === 'Roads' ? 'Roads & Transport' : selectedRequestModal.category}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedRequestModal(null)}
                className="p-1.5 bg-[#171717] text-white hover:bg-[#D65A3A] transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 font-sans text-xs">
              
              {/* Original intake */}
              <div className="p-4 bg-[#F7F5EF] border border-[#171717]/20 space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 uppercase font-bold">
                  <span>Citizen Voice / Written Submission</span>
                  <span>Language: {selectedRequestModal.language}</span>
                </div>
                <p className="italic text-slate-900 text-sm font-sans leading-relaxed">
                  "{selectedRequestModal.original_text}"
                </p>
              </div>

              {/* AI Understanding Summary */}
              <div className="p-4 bg-white border-2 border-[#171717] space-y-1.5 shadow-[2px_2px_0px_#171717]">
                <span className="font-mono text-[10px] text-[#D65A3A] uppercase font-bold block">
                  AI Standardized Summary & Translation
                </span>
                <p className="font-bold text-slate-900 text-sm leading-relaxed">
                  "{selectedRequestModal.summary_en}"
                </p>
              </div>

              {/* Grid of Attributes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                <div className="p-3 bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Severity Rating</span>
                  <span className="font-bold text-red-700 text-sm">
                    {selectedRequestModal.severity || 8}/10
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Location</span>
                  <span className="font-bold text-slate-800 text-xs">
                    📍 {selectedRequestModal.location}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Source Channel</span>
                  <span className="font-bold text-slate-800 uppercase text-xs">
                    {selectedRequestModal.source_type}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Lodgement Date</span>
                  <span className="font-bold text-slate-800 text-xs">
                    {new Date(selectedRequestModal.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Attached Photo if available */}
              {selectedRequestModal.photo_url && (
                <div className="p-3 bg-[#F7F5EF] border border-[#171717] space-y-1">
                  <span className="font-mono font-bold text-[10px] text-slate-500 uppercase block">
                    Citizen Photo Evidence
                  </span>
                  <img 
                    src={selectedRequestModal.photo_url} 
                    alt="Evidence" 
                    className="max-h-48 rounded-xs border border-[#171717] object-cover" 
                  />
                </div>
              )}

              {/* Official Audit Timeline */}
              <div className="border border-[#171717]/20 p-4 bg-slate-50 space-y-3">
                <span className="font-mono font-bold text-[10px] uppercase text-[#171717] tracking-wider block">
                  Official Processing & Action Timeline
                </span>
                
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-start space-x-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1 shrink-0"></span>
                    <div>
                      <span className="font-bold text-slate-900 block">
                        Step 1: Request submitted & logged into permanent database (Status: Received)
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        Recorded via {selectedRequestModal.source_type} interface with unique tracking credential.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1 shrink-0"></span>
                    <div>
                      <span className="font-bold text-slate-900 block">
                        Step 2: Gemini AI diagnostic extraction & verification completed
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        Categorized under {selectedRequestModal.category} with urgency score {selectedRequestModal.severity || 8}/10.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1 shrink-0"></span>
                    <div>
                      <span className="font-bold text-slate-900 block">
                        Step 3: Ingested into Community Issue Aggregation Pipeline
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        Synthesized into {selectedRequestModal.location} municipal demand cluster.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 mt-1 shrink-0"></span>
                    <div>
                      <span className="font-bold text-slate-600 block">
                        Step 4: Department action queue prioritization & capital intervention
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        Scheduled for review during next municipal development session.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-[#171717]/15 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {onNavigateToIssues && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRequestModal(null);
                    onNavigateToIssues();
                  }}
                  className="px-4 py-2.5 bg-[#D65A3A] hover:bg-[#c34e2f] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>View in Community Issues</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedRequestModal(null)}
                className="px-6 py-2.5 bg-[#171717] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Close Tracking Credential
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
