import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import { CitizenRequest, InfrastructureCategory } from '../types';

interface CitizenSignalsViewProps {
  requests: CitizenRequest[];
  onNavigateToIssues?: () => void;
  selectedLanguage: string;
}

export const CitizenSignalsView: React.FC<CitizenSignalsViewProps> = ({
  requests,
  onNavigateToIssues,
  selectedLanguage
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedRequestModal, setSelectedRequestModal] = useState<CitizenRequest | null>(null);

  const categories: InfrastructureCategory[] = ['Water', 'Health', 'Roads', 'Electricity', 'Education', 'Drainage', 'Sanitation'];

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.summary_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.original_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'ALL' || req.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || (req.status || 'Submitted') === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusStepIndex = (status?: string) => {
    switch (status) {
      case 'Submitted': return 1;
      case 'Under Review': return 2;
      case 'Prioritized': return 3;
      case 'Action Initiated': return 4;
      case 'Resolved': return 5;
      default: return 1;
    }
  };

  return (
    <div className="space-y-8 font-sans text-[#171717] pb-16 max-w-6xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#171717]/20 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#D65A3A] uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-[#D65A3A]" />
            <span>CITIZEN TRACKING REGISTRY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#171717]">
            My Requests & Status Updates
          </h1>
          <p className="text-sm font-sans text-[#171717]/80 mt-1">
            Real-time status tracking for all reported civic issues across Andhra Pradesh districts.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 bg-white border border-[#171717] shadow-[2px_2px_0px_#171717] text-right font-mono text-xs">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Total Ingested</span>
            <span className="font-bold text-[#D65A3A] text-base">{requests.length} Requests</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border-2 border-[#171717] p-4 shadow-[4px_4px_0px_#171717] space-y-3 text-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Tracking ID, locality, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-[#171717] text-xs focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="font-mono font-bold text-slate-500 text-[10px] uppercase shrink-0">Category:</span>
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-2.5 py-1 text-[11px] font-mono font-bold border shrink-0 ${
                selectedCategory === 'ALL'
                  ? 'bg-[#171717] text-white border-[#171717]'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              ALL
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-[11px] font-mono font-bold border shrink-0 ${
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
          <div className="p-12 text-center bg-white border border-[#171717]/20 text-slate-500 font-mono text-xs">
            No requests matched your filter criteria.
          </div>
        ) : (
          filteredRequests.map((req) => {
            const stepIdx = getStatusStepIndex(req.status);

            return (
              <div 
                key={req.id} 
                className="bg-white border-2 border-[#171717] p-6 shadow-[4px_4px_0px_#171717] space-y-4 hover:border-[#D65A3A] transition-all cursor-pointer"
                onClick={() => setSelectedRequestModal(req)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#171717]/10 pb-3">
                  <div className="flex items-center space-x-2 font-mono text-xs">
                    <span className="px-2.5 py-1 bg-[#D65A3A] text-white font-bold tracking-wider">
                      {req.id}
                    </span>
                    <span className="font-bold text-[#171717] font-sans text-sm">
                      {req.category} Infrastructure
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-700 font-medium">
                      📍 {req.location}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500">
                    {new Date(req.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <p className="text-sm text-slate-800 font-sans leading-relaxed">
                  "{req.summary_en}"
                </p>

                {/* Progressive Status Timeline Bar */}
                <div className="pt-2 bg-[#F7F5EF] p-4 border border-[#171717]/20 space-y-2">
                  <div className="grid grid-cols-5 text-[10px] font-mono text-center font-bold gap-1">
                    <span className={stepIdx >= 1 ? 'text-emerald-800 font-bold' : 'text-slate-400 font-normal'}>1. Submitted {stepIdx >= 1 && '✓'}</span>
                    <span className={stepIdx >= 2 ? 'text-emerald-800 font-bold' : 'text-slate-400 font-normal'}>2. Under Review {stepIdx >= 2 && '✓'}</span>
                    <span className={stepIdx >= 3 ? 'text-blue-800 font-bold' : 'text-slate-400 font-normal'}>3. Prioritized {stepIdx >= 3 && '✓'}</span>
                    <span className={stepIdx >= 4 ? 'text-purple-800 font-bold' : 'text-slate-400 font-normal'}>4. Action Plan {stepIdx >= 4 && '✓'}</span>
                    <span className={stepIdx >= 5 ? 'text-emerald-800 font-bold' : 'text-slate-400 font-normal'}>5. Resolved {stepIdx >= 5 && '✓'}</span>
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
                  <span className="text-slate-500">Language: {req.language}</span>
                  <span className="text-[#D65A3A] font-bold flex items-center gap-1">
                    View Complete Audit & Analysis <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedRequestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#171717] max-w-2xl w-full p-6 shadow-[8px_8px_0px_#171717] space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#171717]/20 pb-4">
              <div>
                <span className="px-2 py-0.5 bg-[#D65A3A] text-white font-mono text-xs font-bold">
                  {selectedRequestModal.id}
                </span>
                <h3 className="font-serif font-bold text-xl text-[#171717] mt-1">
                  {selectedRequestModal.category} Infrastructure
                </h3>
              </div>
              <button 
                onClick={() => setSelectedRequestModal(null)}
                className="p-1 bg-[#171717] text-white hover:bg-[#D65A3A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 font-sans text-xs">
              <div className="p-4 bg-[#F7F5EF] border border-[#171717]/20 space-y-2">
                <span className="font-mono font-bold text-[10px] text-slate-500 uppercase block">Original Ingested Input</span>
                <p className="italic text-slate-800 text-sm">
                  "{selectedRequestModal.original_text}"
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-mono font-bold text-[10px] text-[#D65A3A] uppercase block">AI Recommended Intervention</span>
                <p className="font-bold text-slate-900 text-xs leading-relaxed">
                  {selectedRequestModal.recommended_action || selectedRequestModal.summary_en}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                <div className="p-3 bg-white border border-slate-200">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Severity Rating</span>
                  <span className="font-bold text-red-700">{selectedRequestModal.severity}/10 ({selectedRequestModal.priority_tier})</span>
                </div>
                <div className="p-3 bg-white border border-slate-200">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Location</span>
                  <span className="font-bold text-slate-800">{selectedRequestModal.location}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedRequestModal(null)}
                className="px-5 py-2 bg-[#171717] text-white font-bold text-xs uppercase cursor-pointer"
              >
                Close Tracking Receipt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
