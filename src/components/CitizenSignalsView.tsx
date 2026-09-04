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
  Filter,
  RotateCcw
} from 'lucide-react';
import { CitizenRequest, InfrastructureCategory } from '../types';
import { 
  getAvailableStates, 
  getDistrictsForState, 
  getLocalitiesForDistrict,
  filterCitizenRequests 
} from '../utils/geography';

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
  const [selectedLocality, setSelectedLocality] = useState<string>('ALL');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<string>('ALL');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>('ALL');
  const [selectedRequest, setSelectedRequest] = useState<CitizenRequest | null>(null);

  const categories: InfrastructureCategory[] = [
    'Water', 'Health', 'Roads', 'Electricity', 'Education', 'Drainage', 'Sanitation'
  ];

  // Automatically open modal if requested
  useEffect(() => {
    if (selectedRequestId) {
      const found = requests.find(r => r.id === selectedRequestId);
      if (found) setSelectedRequest(found);
    }
  }, [selectedRequestId, requests]);

  // 1. Authoritative States list
  const availableStates = useMemo(() => {
    return getAvailableStates('IN');
  }, []);

  // 2. Cascading Districts strictly for the selected state
  const availableDistricts = useMemo(() => {
    return getDistrictsForState(selectedState, 'IN');
  }, [selectedState]);

  // 3. Cascading Localities / Cities strictly for the selected district
  const availableLocalities = useMemo(() => {
    return getLocalitiesForDistrict(selectedDistrict, selectedState, requests);
  }, [selectedDistrict, selectedState, requests]);

  // Unique Languages in dataset
  const uniqueLanguages = useMemo(() => {
    const set = new Set<string>();
    requests.forEach(r => {
      if (r.language) set.add(r.language);
    });
    return Array.from(set).filter(Boolean).sort();
  }, [requests]);

  // Cascade Resets:
  // When State changes: reset District and Locality
  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    setSelectedDistrict('ALL');
    setSelectedLocality('ALL');
  };

  // When District changes: reset Locality
  const handleDistrictChange = (newDistrict: string) => {
    setSelectedDistrict(newDistrict);
    setSelectedLocality('ALL');
  };

  // Filter requests deterministically
  const filteredRequests = useMemo(() => {
    // Basic filter by geography, category, language, search
    let list = filterCitizenRequests(requests, {
      state: selectedState,
      district: selectedDistrict,
      locality: selectedLocality,
      category: selectedCategory,
      language: selectedLanguageFilter,
      searchQuery: searchQuery,
    });

    // Time filter
    if (selectedTimePeriod !== 'ALL') {
      const days = parseInt(selectedTimePeriod, 10);
      if (!isNaN(days)) {
        const now = new Date('2026-09-04T12:00:00Z').getTime();
        const cutoff = now - days * 24 * 60 * 60 * 1000;
        list = list.filter(r => {
          if (!r.timestamp) return true;
          const t = new Date(r.timestamp).getTime();
          return isNaN(t) || t >= cutoff;
        });
      }
    }

    return list;
  }, [requests, selectedState, selectedDistrict, selectedLocality, selectedCategory, selectedLanguageFilter, selectedTimePeriod, searchQuery]);

  const hasActiveFilters = 
    searchQuery.trim() !== '' ||
    selectedCategory !== 'ALL' ||
    selectedState !== 'ALL' ||
    selectedDistrict !== 'ALL' ||
    selectedLocality !== 'ALL' ||
    selectedLanguageFilter !== 'ALL' ||
    selectedTimePeriod !== 'ALL';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedState('ALL');
    setSelectedDistrict('ALL');
    setSelectedLocality('ALL');
    setSelectedLanguageFilter('ALL');
    setSelectedTimePeriod('ALL');
  };

  const getStatusBadge = (status?: string) => {
    const s = status || 'Received';
    if (s.toLowerCase().includes('resolved') || s.toLowerCase().includes('completed')) {
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
            Understand what people are reporting, where and how frequently across India's administrative hierarchy.
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

      {/* Top Controls: Search and Cascading Filters */}
      <div className="bg-white border border-[#171717]/15 p-4 rounded-sm shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports, summary keywords, or tracking ID..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#171717]/20 rounded-xs focus:outline-hidden focus:border-[#171717] text-[#171717]"
            />
          </div>

          {/* Quick Clear */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-[#D65A3A] hover:underline cursor-pointer px-2 py-1 shrink-0 flex items-center gap-1 font-mono"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset filters</span>
            </button>
          )}
        </div>

        {/* Filter Dropdowns row - Strict Cascading Hierarchy */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2 border-t border-[#171717]/10 text-xs font-sans">
          
          {/* 1. STATE / UT */}
          <div>
            <label className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider block mb-0.5">
              State / UT
            </label>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full bg-[#FAF8F5] text-[#171717] px-2 py-1.5 text-xs border border-[#171717]/20 rounded-xs focus:outline-hidden focus:border-[#171717] font-medium"
            >
              <option value="ALL">All States</option>
              {availableStates.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* 2. DISTRICT */}
          <div>
            <label className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider block mb-0.5">
              District
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full bg-[#FAF8F5] text-[#171717] px-2 py-1.5 text-xs border border-[#171717]/20 rounded-xs focus:outline-hidden focus:border-[#171717] font-medium"
            >
              <option value="ALL">
                {selectedState !== 'ALL' ? `All ${selectedState} Districts` : 'All Districts'}
              </option>
              {availableDistricts.map(d => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* 3. CITY / TOWN / LOCALITY */}
          <div>
            <label className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider block mb-0.5">
              City / Town
            </label>
            <select
              value={selectedLocality}
              onChange={(e) => setSelectedLocality(e.target.value)}
              disabled={selectedDistrict === 'ALL'}
              className={`w-full px-2 py-1.5 text-xs border border-[#171717]/20 rounded-xs focus:outline-hidden focus:border-[#171717] font-medium ${
                selectedDistrict === 'ALL' 
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed' 
                  : 'bg-[#FAF8F5] text-[#171717]'
              }`}
            >
              <option value="ALL">
                {selectedDistrict !== 'ALL' ? `All ${selectedDistrict} Locations` : 'Select District first'}
              </option>
              {availableLocalities.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* 4. CATEGORY */}
          <div>
            <label className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider block mb-0.5">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#FAF8F5] text-[#171717] px-2 py-1.5 text-xs border border-[#171717]/20 rounded-xs focus:outline-hidden focus:border-[#171717] font-medium"
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* 5. LANGUAGE */}
          <div>
            <label className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider block mb-0.5">
              Language
            </label>
            <select
              value={selectedLanguageFilter}
              onChange={(e) => setSelectedLanguageFilter(e.target.value)}
              className="w-full bg-[#FAF8F5] text-[#171717] px-2 py-1.5 text-xs border border-[#171717]/20 rounded-xs focus:outline-hidden focus:border-[#171717]"
            >
              <option value="ALL">All Languages</option>
              {uniqueLanguages.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* 6. TIME PERIOD */}
          <div>
            <label className="text-[10px] font-mono text-[#78716C] uppercase tracking-wider block mb-0.5">
              Time period
            </label>
            <select
              value={selectedTimePeriod}
              onChange={(e) => setSelectedTimePeriod(e.target.value)}
              className="w-full bg-[#FAF8F5] text-[#171717] px-2 py-1.5 text-xs border border-[#171717]/20 rounded-xs focus:outline-hidden focus:border-[#171717]"
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
        <div className="px-4 py-3 bg-[#FAF8F5] border-b border-[#171717]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#57534E]">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              Showing <strong className="text-[#171717] font-mono">{filteredRequests.length}</strong> citizen signals
            </span>
            {(selectedState !== 'ALL' || selectedDistrict !== 'ALL' || selectedCategory !== 'ALL') && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-200/70 text-stone-700">
                Filtered: {[
                  selectedState !== 'ALL' ? selectedState : null,
                  selectedDistrict !== 'ALL' ? selectedDistrict : null,
                  selectedLocality !== 'ALL' ? selectedLocality : null,
                  selectedCategory !== 'ALL' ? selectedCategory : null,
                ].filter(Boolean).join(' › ')}
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#78716C]">
            Click any row to inspect full telemetry
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
                  <td colSpan={7} className="py-16 text-center text-sm text-[#78716C]">
                    <div className="max-w-md mx-auto space-y-2">
                      <p className="font-medium text-[#171717]">No civic signals match these filters.</p>
                      <p className="text-xs text-[#78716C]">
                        Try selecting "All Districts" or clearing the category/search filter to view broader signals.
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={handleResetFilters}
                          className="mt-2 px-3 py-1.5 bg-[#FAF8F5] border border-[#171717]/20 text-xs font-semibold rounded-xs hover:bg-stone-200 transition-colors cursor-pointer"
                        >
                          Reset all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const isVoice = req.source_type?.includes('voice') || req.audio_url;
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
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#78716C] shrink-0" />
                          <span>{req.location || `${req.district || ''}, ${req.state || ''}`}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-mono text-[11px] text-[#171717] bg-[#F7F5EF] px-2 py-0.5 rounded border border-[#171717]/10">
                          {req.category}
                        </span>
                      </td>

                      {/* Severity */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center font-mono text-xs font-semibold ${
                          (req.severity || 5) >= 8 
                            ? 'text-[#D65A3A]' 
                            : (req.severity || 5) >= 6 
                            ? 'text-amber-800' 
                            : 'text-[#285943]'
                        }`}>
                          {req.severity || 5} / 10
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
                Citizen input ({selectedRequest.language || 'Native'} · {selectedRequest.source_type || 'Written'})
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
                  {selectedRequest.severity || 6} / 10
                </span>
              </div>
              <div className="p-2.5 bg-[#FAF8F5] border border-[#171717]/10 rounded-xs">
                <span className="text-[10px] text-[#78716C] block">Reported Infrastructure</span>
                <span className="text-xs font-bold text-[#171717]">
                  {selectedRequest.affected_infrastructure || `${selectedRequest.category} Utility Asset`}
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
