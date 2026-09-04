import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  X, 
  Mic, 
  FileEdit, 
  Sparkles,
  ArrowRight,
  PlusCircle,
  Filter
} from 'lucide-react';
import { CitizenRequest, InfrastructureCategory } from '../types';

interface CitizenSignalsViewProps {
  requests: CitizenRequest[];
  onNavigateToIssues?: () => void;
  onNavigateToSubmit?: () => void;
  selectedLanguage?: string;
  selectedRequestId?: string;
}

export const CitizenSignalsView: React.FC<CitizenSignalsViewProps> = ({
  requests,
  onNavigateToIssues,
  onNavigateToSubmit,
  selectedRequestId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<string>('ALL');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>('ALL');
  const [selectedRequest, setSelectedRequest] = useState<CitizenRequest | null>(null);

  const categories: InfrastructureCategory[] = ['Water', 'Health', 'Roads', 'Electricity', 'Education', 'Drainage', 'Sanitation'];

  // Automatically open modal if requested
  useEffect(() => {
    if (selectedRequestId) {
      const found = requests.find(r => r.id === selectedRequestId);
      if (found) setSelectedRequest(found);
    }
  }, [selectedRequestId, requests]);

  // Extract unique filter options
  const uniqueStates = useMemo(() => {
    const set = new Set<string>();
    requests.forEach(r => {
      const parts = r.location.split(',');
      if (parts.length > 1) {
        set.add(parts[parts.length - 1].trim());
      }
    });
    return Array.from(set).filter(Boolean);
  }, [requests]);

  const uniqueDistricts = useMemo(() => {
    const set = new Set<string>();
    requests.forEach(r => {
      const parts = r.location.split(',');
      if (parts.length > 0) {
        set.add(parts[0].trim());
      }
    });
    return Array.from(set).filter(Boolean);
  }, [requests]);

  const uniqueLanguages = useMemo(() => {
    const set = new Set<string>();
    requests.forEach(r => {
      if (r.language) set.add(r.language);
    });
    return Array.from(set).filter(Boolean);
  }, [requests]);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || 
        req.summary_en.toLowerCase().includes(q) ||
        req.original_text.toLowerCase().includes(q) ||
        req.location.toLowerCase().includes(q) ||
        req.id.toLowerCase().includes(q);

      // Category
      const matchesCategory = selectedCategory === 'ALL' || req.category === selectedCategory;

      // State
      const matchesState = selectedState === 'ALL' || req.location.toLowerCase().includes(selectedState.toLowerCase());

      // District
      const matchesDistrict = selectedDistrict === 'ALL' || req.location.toLowerCase().includes(selectedDistrict.toLowerCase());

      // Language
      const matchesLang = selectedLanguageFilter === 'ALL' || req.language === selectedLanguageFilter;

      return matchesSearch && matchesCategory && matchesState && matchesDistrict && matchesLang;
    });
  }, [requests, searchQuery, selectedCategory, selectedState, selectedDistrict, selectedLanguageFilter]);

  const getStatusBadge = (status?: string) => {
    const s = status || 'Received';
    if (s.toLowerCase().includes('resolved')) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-medium bg-[#285943]/10 text-[#285943] border border-[#285943]/20">Resolved</span>;
    }
    if (s.toLowerCase().includes('prioritized')) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-medium bg-[#D65A3A]/10 text-[#D65A3A] border border-[#D65A3A]/20">Prioritized</span>;
    }
    if (s.toLowerCase().includes('review')) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-300">Under Review</span>;
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-medium bg-[#F7F5EF] text-[#57534E] border border-[#171717]/15">Received</span>;
  };

  return (
    <div className="space-y-8 font-sans text-[#171717] pb-16 max-w-6xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#171717]/10 pb-5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#171717]">
            Citizen signals
          </h1>
          <p className="text-sm text-[#57534E] mt-1">
            Understand what people are reporting, where and how frequently.
          </p>
        </div>

        {onNavigateToSubmit && (
          <button
            onClick={onNavigateToSubmit}
            className="px-3.5 py-2 bg-[#D65A3A] hover:bg-[#c24e2f] text-white text-xs font-semibold rounded-xs transition-colors flex items-center space-x-2 shrink-0 cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Submit new issue</span>
          </button>
        )}
      </div>

      {/* Top Controls: Search and Filters (Compact, clean inline controls) */}
      <div className="bg-white border border-[#171717]/15 p-4 rounded-sm shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports, keywords, or tracking ID..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#171717]/20 rounded-xs focus:outline-hidden focus:border-[#171717] text-[#171717]"
            />
          </div>

          {/* Quick Clear */}
          {(searchQuery || selectedCategory !== 'ALL' || selectedState !== 'ALL' || selectedDistrict !== 'ALL' || selectedLanguageFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setSelectedState('ALL');
                setSelectedDistrict('ALL');
                setSelectedLanguageFilter('ALL');
                setSelectedTimePeriod('ALL');
              }}
              className="text-xs text-[#D65A3A] hover:underline cursor-pointer px-2 py-1 shrink-0"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Filter Dropdowns row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 border-t border-[#171717]/10 text-xs font-sans">
          <div>
            <label className="text-[10px] text-[#78716C] block mb-0.5">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#FAF8F5] text-[#171717] px-2 py-1 text-xs border border-[#171717]/20 rounded-xs focus:outline-hidden"
            >
              <option value="ALL">All categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-[#78716C] block mb-0.5">State</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-[#FAF8F5] text-[#171717] px-2 py-1 text-xs border border-[#171717]/20 rounded-xs focus:outline-hidden"
            >
              <option value="ALL">All states</option>
              {uniqueStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-[#78716C] block mb-0.5">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-[#FAF8F5] text-[#171717] px-2 py-1 text-xs border border-[#171717]/20 rounded-xs focus:outline-hidden"
            >
              <option value="ALL">All districts</option>
              {uniqueDistricts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-[#78716C] block mb-0.5">Language</label>
            <select
              value={selectedLanguageFilter}
              onChange={(e) => setSelectedLanguageFilter(e.target.value)}
              className="w-full bg-[#FAF8F5] text-[#171717] px-2 py-1 text-xs border border-[#171717]/20 rounded-xs focus:outline-hidden"
            >
              <option value="ALL">All languages</option>
              {uniqueLanguages.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-[#78716C] block mb-0.5">Time period</label>
            <select
              value={selectedTimePeriod}
              onChange={(e) => setSelectedTimePeriod(e.target.value)}
              className="w-full bg-[#FAF8F5] text-[#171717] px-2 py-1 text-xs border border-[#171717]/20 rounded-xs focus:outline-hidden"
            >
              <option value="ALL">All time</option>
              <option value="7">Past 7 days</option>
              <option value="30">Past 30 days</option>
              <option value="90">Past 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content: Clean Table/List */}
      <div className="bg-white border border-[#171717]/15 rounded-sm overflow-hidden shadow-xs">
        <div className="px-4 py-3 bg-[#FAF8F5] border-b border-[#171717]/10 flex items-center justify-between text-xs text-[#57534E]">
          <span className="font-medium">
            Showing <strong className="text-[#171717]">{filteredRequests.length}</strong> citizen signals
          </span>
          <span className="text-[11px] text-[#78716C]">
            Click any row to view complete report
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#171717]/10 bg-[#FAF8F5] text-[#78716C] font-mono text-[10px] uppercase tracking-wider">
                <th className="py-2.5 px-4 font-semibold">Issue</th>
                <th className="py-2.5 px-3 font-semibold">Location</th>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold">Severity</th>
                <th className="py-2.5 px-3 font-semibold">Source</th>
                <th className="py-2.5 px-3 font-semibold">Date</th>
                <th className="py-2.5 px-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171717]/10">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-[#78716C]">
                    No citizen signals matched your filters.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const isVoice = req.source?.includes('voice');
                  const dateFormatted = req.timestamp 
                    ? new Date(req.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '2 Sep 2026';

                  return (
                    <tr
                      key={req.id}
                      onClick={() => setSelectedRequest(req)}
                      className="hover:bg-[#FAF8F5] cursor-pointer transition-colors group"
                    >
                      {/* Issue */}
                      <td className="py-3 px-4 max-w-sm">
                        <div className="font-medium text-[#171717] group-hover:text-[#D65A3A] transition-colors leading-snug line-clamp-2">
                          {req.summary_en || req.original_text}
                        </div>
                        <div className="text-[10px] font-mono text-[#78716C] mt-0.5">
                          {req.id}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3 text-[#57534E] whitespace-nowrap">
                        {req.location}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-mono text-[11px] text-[#171717]">
                          {req.category}
                        </span>
                      </td>

                      {/* Severity */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center font-mono text-xs font-semibold ${
                          (req.urgency_score || req.severity || 5) >= 8 
                            ? 'text-[#D65A3A]' 
                            : (req.urgency_score || req.severity || 5) >= 6 
                            ? 'text-amber-800' 
                            : 'text-[#285943]'
                        }`}>
                          {req.urgency_score || req.severity || 5} / 10
                        </span>
                      </td>

                      {/* Source */}
                      <td className="py-3 px-3 text-[#57534E] whitespace-nowrap">
                        <span className="inline-flex items-center space-x-1">
                          {isVoice ? (
                            <>
                              <Mic className="w-3.5 h-3.5 text-[#D65A3A]" />
                              <span>Voice ({req.language || 'Native'})</span>
                            </>
                          ) : (
                            <>
                              <FileEdit className="w-3.5 h-3.5 text-[#78716C]" />
                              <span>Written ({req.language || 'English'})</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 text-[#78716C] font-mono text-[11px] whitespace-nowrap">
                        {dateFormatted}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {getStatusBadge(req.status)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal: Clean, high readability drawer/modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-[#171717]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#171717]/20 rounded-sm w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-lg space-y-5 p-6 font-sans">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#171717]/10 pb-4">
              <div>
                <span className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider block">
                  Citizen Signal Record
                </span>
                <h2 className="text-xl font-serif font-bold text-[#171717] mt-0.5">
                  {selectedRequest.id}
                </h2>
                <span className="text-xs text-[#57534E] mt-0.5 block">
                  {selectedRequest.location} · Category: <strong className="text-[#171717]">{selectedRequest.category}</strong>
                </span>
              </div>

              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1 hover:bg-[#F7F5EF] rounded-xs text-[#78716C] hover:text-[#171717] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Timeline */}
            <div className="bg-[#FAF8F5] border border-[#171717]/10 p-3.5 rounded-sm">
              <span className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider block mb-2">
                Processing Status
              </span>
              <div className="grid grid-cols-4 text-center text-[10px] font-medium text-[#57534E] gap-1">
                <div className="p-1.5 bg-[#285943]/10 text-[#285943] border border-[#285943]/30 rounded-xs font-semibold">
                  1. Received
                </div>
                <div className="p-1.5 bg-amber-50 text-amber-800 border border-amber-300 rounded-xs font-semibold">
                  2. Under Review
                </div>
                <div className="p-1.5 bg-[#F7F5EF] text-[#78716C] border border-[#171717]/10 rounded-xs">
                  3. Prioritized
                </div>
                <div className="p-1.5 bg-[#F7F5EF] text-[#78716C] border border-[#171717]/10 rounded-xs">
                  4. Resolved
                </div>
              </div>
            </div>

            {/* Original Citizen Input */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#171717] block">
                Citizen input ({selectedRequest.language || 'Native'} · {selectedRequest.source || 'Written'})
              </span>
              <div className="p-3 bg-[#FAF8F5] border border-[#171717]/10 text-xs text-[#57534E] rounded-xs leading-relaxed italic">
                "{selectedRequest.original_text || selectedRequest.summary_en}"
              </div>
            </div>

            {/* What CivicPulse Understood */}
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#171717]">
                <Sparkles className="w-3.5 h-3.5 text-[#D65A3A]" />
                <span>What CivicPulse understood</span>
              </div>
              <div className="p-3 bg-white border border-[#171717]/15 text-xs text-[#171717] rounded-xs leading-relaxed">
                {selectedRequest.summary_en}
              </div>
            </div>

            {/* Key Diagnostic Attributes */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
              <div className="p-2.5 bg-[#FAF8F5] border border-[#171717]/10 rounded-xs">
                <span className="text-[10px] text-[#78716C] block">Severity Score</span>
                <span className="text-sm font-bold text-[#D65A3A]">
                  {selectedRequest.urgency_score || selectedRequest.severity || 6} / 10
                </span>
              </div>
              <div className="p-2.5 bg-[#FAF8F5] border border-[#171717]/10 rounded-xs">
                <span className="text-[10px] text-[#78716C] block">Reported Infrastructure</span>
                <span className="text-xs font-bold text-[#171717]">
                  {selectedRequest.affected_infra || `${selectedRequest.category} Utility Asset`}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#171717]/10">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-3 py-1.5 text-xs text-[#57534E] hover:text-[#171717] cursor-pointer"
              >
                Close
              </button>

              {onNavigateToIssues && (
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    onNavigateToIssues();
                  }}
                  className="px-4 py-2 bg-[#171717] hover:bg-[#34322D] text-white text-xs font-semibold rounded-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>Explore in community issues</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
