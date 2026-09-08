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
  RotateCcw,
  ChevronDown
} from 'lucide-react';
import { CitizenRequest, InfrastructureCategory } from '../types';
import { 
  getAvailableStates, 
  getDistrictsForState, 
  getLocalitiesForDistrict,
  filterCitizenRequests 
} from '../utils/geography';
import { useLanguage } from '../context/LanguageContext';

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
  const { t, tCategory, tStatus, tSignalSummary, tDistrict, tState } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedLocality, setSelectedLocality] = useState<string>('ALL');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<string>('ALL');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>('ALL');
  const [selectedSourceOrigin, setSelectedSourceOrigin] = useState<string>('ALL');
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
    let list = filterCitizenRequests(requests, {
      state: selectedState !== 'ALL' ? selectedState : undefined,
      district: selectedDistrict !== 'ALL' ? selectedDistrict : undefined,
      locality: selectedLocality !== 'ALL' ? selectedLocality : undefined,
      category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
      searchQuery: searchQuery.trim() || undefined,
    });

    if (selectedLanguageFilter !== 'ALL') {
      list = list.filter(r => (r.language || '').toLowerCase() === selectedLanguageFilter.toLowerCase());
    }

    if (selectedSourceOrigin !== 'ALL') {
      if (selectedSourceOrigin === 'CIVICPULSE_USER') {
        list = list.filter(r => r.source_origin === 'CIVICPULSE_USER' || r.id.startsWith('CP-202'));
      } else if (selectedSourceOrigin === 'SYNTHETIC_DEMO') {
        list = list.filter(r => r.source_origin !== 'CIVICPULSE_USER' && !r.id.startsWith('CP-202'));
      }
    }

    if (selectedTimePeriod !== 'ALL') {
      const days = parseInt(selectedTimePeriod, 10);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      list = list.filter(r => {
        if (!r.timestamp) return true;
        const d = new Date(r.timestamp);
        return d >= cutoff;
      });
    }

    return list;
  }, [requests, selectedState, selectedDistrict, selectedLocality, selectedCategory, selectedLanguageFilter, selectedSourceOrigin, selectedTimePeriod, searchQuery]);

  const hasActiveFilters = 
    searchQuery.trim() !== '' ||
    selectedCategory !== 'ALL' ||
    selectedState !== 'ALL' ||
    selectedDistrict !== 'ALL' ||
    selectedLocality !== 'ALL' ||
    selectedLanguageFilter !== 'ALL' ||
    selectedSourceOrigin !== 'ALL' ||
    selectedTimePeriod !== 'ALL';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedState('ALL');
    setSelectedDistrict('ALL');
    setSelectedLocality('ALL');
    setSelectedLanguageFilter('ALL');
    setSelectedSourceOrigin('ALL');
    setSelectedTimePeriod('ALL');
  };

  const getStatusBadge = (status?: string) => {
    const s = status || 'Received';
    if (s.toLowerCase().includes('resolved') || s.toLowerCase().includes('completed')) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-medium bg-[#285943]/10 text-[#285943] border border-[#285943]/20">{tStatus('Resolved')}</span>;
    }
    if (s.toLowerCase().includes('prioritized')) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-medium bg-[#D65A3A]/10 text-[#D65A3A] border border-[#D65A3A]/20">{tStatus('Prioritized')}</span>;
    }
    if (s.toLowerCase().includes('review')) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-300">{tStatus('Under Review')}</span>;
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-medium bg-[#F7F5EF] text-[#57534E] border border-[#171717]/15">{tStatus('Received')}</span>;
  };

  return (
    <div className="space-y-8 font-sans text-[#171717] pb-16 max-w-6xl mx-auto">
      
      {/* Page Header (Question-driven with supporting label) */}
      <div className="space-y-2 border-b border-[#171717]/10 pb-5">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-[#FAF8F5] text-[#D65A3A] border border-[#D65A3A]/30 text-[10px] font-mono font-bold tracking-wider uppercase rounded-xs">
            {t('signals.page_label') || 'Citizen Signals'}
          </span>
          <span className="text-[11px] font-mono text-[#78716C] uppercase tracking-wider">
            Step 1 · Listen
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-tight text-[#171717]">
              {t('signals.question_title') || 'What are citizens asking for?'}
            </h1>
            <p className="text-xs sm:text-sm text-[#57534E] mt-1 max-w-3xl leading-relaxed">
              {t('signals.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onNavigateToIssues && (
              <button
                onClick={onNavigateToIssues}
                className="px-3 py-2 bg-white border border-[#171717]/20 hover:border-[#171717] text-xs font-semibold rounded-xs transition-colors flex items-center space-x-1.5 cursor-pointer text-[#171717]"
              >
                <span>View Community Issues</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D65A3A]" />
              </button>
            )}
            {onNavigateToSubmit && (
              <button
                onClick={onNavigateToSubmit}
                className="px-3.5 py-2 bg-[#D65A3A] hover:bg-[#c24e2f] text-white text-xs font-semibold rounded-xs transition-colors flex items-center space-x-2 shrink-0 cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t('signals.submit_new')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* "So What?" Context Banner */}
      <div className="bg-[#FAF8F5] border border-[#171717]/15 p-4 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D65A3A]">
              Why This Matters
            </span>
          </div>
          <p className="text-[#34322D] leading-relaxed text-xs">
            Citizen reports are the frontline sensor of public delivery. These signals reveal where infrastructure is failing or falling behind community needs before official audits notice.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
            Live User: {requests.filter(r => r.source_origin === 'CIVICPULSE_USER' || r.id.startsWith('CP-202')).length}
          </span>
          <span className="px-2 py-0.5 rounded bg-stone-200 text-stone-700 border border-stone-300">
            Total Telemetry: {requests.length}
          </span>
        </div>
      </div>

      {/* Top Controls: Search and Cascading Filters */}
      <div className="bg-white border border-[#171717]/15 p-4 sm:p-5 rounded-sm shadow-xs space-y-4">
        
        {/* 1. Primary Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="citizen-signals-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('signals.search_placeholder') || 'Search reports, issues, locations, or tracking ID...'}
            className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#171717]/25 rounded-xs focus:outline-hidden focus:border-[#D65A3A] focus:bg-white text-[#171717] placeholder-[#78716C] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#171717] p-1 cursor-pointer transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 2. Refinement Filters (Secondary) */}
        <div className="pt-3 border-t border-[#171717]/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[#57534E]">
              <Filter className="w-3.5 h-3.5 text-[#78716C]" />
              <span className="font-medium text-[#171717]">{t('filter.refine_signals') || 'Refine signals'}</span>
              {hasActiveFilters && (
                <span className="text-[11px] font-mono text-[#D65A3A] ml-1">
                  ({[
                    selectedState !== 'ALL' ? 1 : 0,
                    selectedDistrict !== 'ALL' ? 1 : 0,
                    selectedLocality !== 'ALL' ? 1 : 0,
                    selectedCategory !== 'ALL' ? 1 : 0,
                    selectedSourceOrigin !== 'ALL' ? 1 : 0,
                    selectedLanguageFilter !== 'ALL' ? 1 : 0,
                    selectedTimePeriod !== 'ALL' ? 1 : 0,
                  ].reduce((a, b) => a + b, 0)} active)
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-[#D65A3A] hover:underline cursor-pointer flex items-center gap-1 font-medium transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t('signals.reset_filters')}</span>
              </button>
            )}
          </div>

          {/* Responsive Filter Grid: 3 columns on large screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-3.5 text-xs">
            
            {/* 1. State */}
            <div>
              <label htmlFor="filter-state" className="text-xs font-medium text-[#57534E] block mb-1">
                {t('geo.state') || 'State'}
              </label>
              <div className="relative">
                <select
                  id="filter-state"
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className={`w-full bg-[#FAF8F5] text-[#171717] px-3 py-2 text-xs border rounded-xs transition-colors cursor-pointer appearance-none pr-8 ${
                    selectedState !== 'ALL'
                      ? 'border-[#D65A3A]/70 bg-white font-medium focus:border-[#D65A3A] focus:outline-hidden'
                      : 'border-[#171717]/20 hover:border-[#171717]/40 focus:border-[#D65A3A] focus:outline-hidden'
                  }`}
                >
                  <option value="ALL">{t('filter.all_states')}</option>
                  {availableStates.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#78716C] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 2. District */}
            <div>
              <label htmlFor="filter-district" className="text-xs font-medium text-[#57534E] block mb-1">
                {t('geo.district') || 'District'}
              </label>
              <div className="relative">
                <select
                  id="filter-district"
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className={`w-full bg-[#FAF8F5] text-[#171717] px-3 py-2 text-xs border rounded-xs transition-colors cursor-pointer appearance-none pr-8 ${
                    selectedDistrict !== 'ALL'
                      ? 'border-[#D65A3A]/70 bg-white font-medium focus:border-[#D65A3A] focus:outline-hidden'
                      : 'border-[#171717]/20 hover:border-[#171717]/40 focus:border-[#D65A3A] focus:outline-hidden'
                  }`}
                >
                  <option value="ALL">
                    {selectedState !== 'ALL' ? `${t('filter.all')} ${selectedState} ${t('geo.district')}` : t('filter.all_districts')}
                  </option>
                  {availableDistricts.map(d => (
                    <option key={d.name} value={d.name}>{d.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#78716C] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 3. City / Locality */}
            <div>
              <label htmlFor="filter-locality" className="text-xs font-medium text-[#57534E] block mb-1">
                {t('filter.city_locality') || t('geo.city_town') || 'City / Locality'}
              </label>
              <div className="relative">
                <select
                  id="filter-locality"
                  value={selectedLocality}
                  onChange={(e) => setSelectedLocality(e.target.value)}
                  disabled={selectedDistrict === 'ALL'}
                  className={`w-full px-3 py-2 text-xs border rounded-xs transition-colors appearance-none pr-8 ${
                    selectedDistrict === 'ALL' 
                      ? 'bg-[#F5F2EB] text-[#78716C] border-[#171717]/10 cursor-not-allowed' 
                      : selectedLocality !== 'ALL'
                      ? 'border-[#D65A3A]/70 bg-white font-medium focus:border-[#D65A3A] focus:outline-hidden cursor-pointer'
                      : 'bg-[#FAF8F5] text-[#171717] border-[#171717]/20 hover:border-[#171717]/40 focus:border-[#D65A3A] focus:outline-hidden cursor-pointer'
                  }`}
                >
                  <option value="ALL">
                    {selectedDistrict !== 'ALL' ? `${t('filter.all')} ${selectedDistrict} ${t('geo.locality')}` : t('geo.select_district_first')}
                  </option>
                  {availableLocalities.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#78716C] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 4. Category */}
            <div>
              <label htmlFor="filter-category" className="text-xs font-medium text-[#57534E] block mb-1">
                {t('filter.category') || 'Category'}
              </label>
              <div className="relative">
                <select
                  id="filter-category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`w-full bg-[#FAF8F5] text-[#171717] px-3 py-2 text-xs border rounded-xs transition-colors cursor-pointer appearance-none pr-8 ${
                    selectedCategory !== 'ALL'
                      ? 'border-[#D65A3A]/70 bg-white font-medium focus:border-[#D65A3A] focus:outline-hidden'
                      : 'border-[#171717]/20 hover:border-[#171717]/40 focus:border-[#D65A3A] focus:outline-hidden'
                  }`}
                >
                  <option value="ALL">{t('filter.all_categories')}</option>
                  {categories.map(c => <option key={c} value={c}>{tCategory(c)}</option>)}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#78716C] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 5. Data Source */}
            <div>
              <label htmlFor="filter-source" className="text-xs font-medium text-[#57534E] block mb-1">
                {t('data_source.title') || 'Data Source'}
              </label>
              <div className="relative">
                <select
                  id="filter-source"
                  value={selectedSourceOrigin}
                  onChange={(e) => setSelectedSourceOrigin(e.target.value)}
                  className={`w-full bg-[#FAF8F5] text-[#171717] px-3 py-2 text-xs border rounded-xs transition-colors cursor-pointer appearance-none pr-8 ${
                    selectedSourceOrigin !== 'ALL'
                      ? 'border-[#D65A3A]/70 bg-white font-medium focus:border-[#D65A3A] focus:outline-hidden'
                      : 'border-[#171717]/20 hover:border-[#171717]/40 focus:border-[#D65A3A] focus:outline-hidden'
                  }`}
                >
                  <option value="ALL">{t('data_source.all_sources') || `${t('filter.all')} ${t('data_source.title')}`}</option>
                  <option value="CIVICPULSE_USER">🟢 {t('data_source.civicpulse_signals')}</option>
                  <option value="SYNTHETIC_DEMO">⚪ {t('data_source.synthetic_demo')}</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#78716C] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 6. Language */}
            <div>
              <label htmlFor="filter-language" className="text-xs font-medium text-[#57534E] block mb-1">
                {t('filter.language') || 'Language'}
              </label>
              <div className="relative">
                <select
                  id="filter-language"
                  value={selectedLanguageFilter}
                  onChange={(e) => setSelectedLanguageFilter(e.target.value)}
                  className={`w-full bg-[#FAF8F5] text-[#171717] px-3 py-2 text-xs border rounded-xs transition-colors cursor-pointer appearance-none pr-8 ${
                    selectedLanguageFilter !== 'ALL'
                      ? 'border-[#D65A3A]/70 bg-white font-medium focus:border-[#D65A3A] focus:outline-hidden'
                      : 'border-[#171717]/20 hover:border-[#171717]/40 focus:border-[#D65A3A] focus:outline-hidden'
                  }`}
                >
                  <option value="ALL">{t('filter.all_languages')}</option>
                  {uniqueLanguages.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#78716C] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 7. Time Period */}
            <div>
              <label htmlFor="filter-time" className="text-xs font-medium text-[#57534E] block mb-1">
                {t('filter.time_period') || 'Time period'}
              </label>
              <div className="relative">
                <select
                  id="filter-time"
                  value={selectedTimePeriod}
                  onChange={(e) => setSelectedTimePeriod(e.target.value)}
                  className={`w-full bg-[#FAF8F5] text-[#171717] px-3 py-2 text-xs border rounded-xs transition-colors cursor-pointer appearance-none pr-8 ${
                    selectedTimePeriod !== 'ALL'
                      ? 'border-[#D65A3A]/70 bg-white font-medium focus:border-[#D65A3A] focus:outline-hidden'
                      : 'border-[#171717]/20 hover:border-[#171717]/40 focus:border-[#D65A3A] focus:outline-hidden'
                  }`}
                >
                  <option value="ALL">{t('filter.all_time')}</option>
                  <option value="7">{t('filter.past_7_days')}</option>
                  <option value="30">{t('filter.past_30_days')}</option>
                  <option value="90">{t('filter.past_90_days')}</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#78716C] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content: Clean Table/List */}
      <div className="bg-white border border-[#171717]/15 rounded-sm overflow-hidden shadow-xs">
        <div className="px-4 py-3 bg-[#FAF8F5] border-b border-[#171717]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#57534E]">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {t('filter.showing')} <strong className="text-[#171717] font-mono">{filteredRequests.length}</strong> {t('metric.demand_signals')}
            </span>
            {(selectedState !== 'ALL' || selectedDistrict !== 'ALL' || selectedCategory !== 'ALL') && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-200/70 text-stone-700">
                {[
                  selectedState !== 'ALL' ? selectedState : null,
                  selectedDistrict !== 'ALL' ? selectedDistrict : null,
                  selectedLocality !== 'ALL' ? selectedLocality : null,
                  selectedCategory !== 'ALL' ? tCategory(selectedCategory) : null,
                ].filter(Boolean).join(' › ')}
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#78716C]">
            {t('signals.click_row_telemetry')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#171717]/10 bg-[#FAF8F5] text-[#78716C] font-mono text-[10px] uppercase tracking-wider">
                <th className="py-2.5 px-4 font-semibold">{t('table.issue')}</th>
                <th className="py-2.5 px-3 font-semibold">{t('table.location')}</th>
                <th className="py-2.5 px-3 font-semibold">{t('table.category')}</th>
                <th className="py-2.5 px-3 font-semibold">Origin</th>
                <th className="py-2.5 px-3 font-semibold">{t('table.severity')}</th>
                <th className="py-2.5 px-3 font-semibold">{t('table.source')}</th>
                <th className="py-2.5 px-3 font-semibold">{t('table.date')}</th>
                <th className="py-2.5 px-4 font-semibold text-right">{t('table.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171717]/10">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-[#78716C]">
                    <div className="max-w-md mx-auto space-y-2">
                      <p className="font-medium text-[#171717]">{t('signals.no_signals_match')}</p>
                      <p className="text-xs text-[#78716C]">
                        {t('signals.no_signals_hint')}
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={handleResetFilters}
                          className="mt-2 px-3 py-1.5 bg-[#FAF8F5] border border-[#171717]/20 text-xs font-semibold rounded-xs hover:bg-stone-200 transition-colors cursor-pointer"
                        >
                          {t('signals.reset_filters')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const isVoice = req.source_type?.includes('voice') || req.audio_url;
                  const isLiveUser = req.source_origin === 'CIVICPULSE_USER' || req.id.startsWith('CP-202');
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
                          {tSignalSummary(req)}
                        </div>
                        <div className="text-[10px] font-mono text-[#78716C] mt-0.5">
                          {req.id}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3 text-[#57534E] whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#78716C] shrink-0" />
                          <span>{tDistrict(req.district || req.location || '')}, {tState(req.state || '')}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-mono text-[11px] text-[#171717] bg-[#F7F5EF] px-2 py-0.5 rounded border border-[#171717]/10">
                          {tCategory(req.category)}
                        </span>
                      </td>

                      {/* Origin */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {isLiveUser ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Live User
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-stone-100 text-stone-600 border border-stone-200">
                            Demo Data
                          </span>
                        )}
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
                              <span>{t('signals.voice')} ({req.language || 'Native'})</span>
                            </>
                          ) : (
                            <>
                              <FileEdit className="w-3.5 h-3.5 text-[#78716C]" />
                              <span>{t('signals.written')} ({req.language || 'English'})</span>
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
                  {t('signals.record_title')}
                </span>
                <h2 className="text-xl font-serif font-bold text-[#171717] mt-0.5">
                  {selectedRequest.id}
                </h2>
                <span className="text-xs text-[#57534E] mt-0.5 block">
                  {selectedRequest.location} · {t('table.category')}: <strong className="text-[#171717]">{tCategory(selectedRequest.category)}</strong>
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
                {t('signals.processing_status')}
              </span>
              <div className="grid grid-cols-4 text-center text-[10px] font-medium text-[#57534E] gap-1">
                <div className="p-1.5 bg-[#285943]/10 text-[#285943] border border-[#285943]/30 rounded-xs font-semibold">
                  1. {tStatus('Received')}
                </div>
                <div className="p-1.5 bg-amber-50 text-amber-800 border border-amber-300 rounded-xs font-semibold">
                  2. {tStatus('Under Review')}
                </div>
                <div className="p-1.5 bg-[#F7F5EF] text-[#78716C] border border-[#171717]/10 rounded-xs">
                  3. {tStatus('Prioritized')}
                </div>
                <div className="p-1.5 bg-[#F7F5EF] text-[#78716C] border border-[#171717]/10 rounded-xs">
                  4. {tStatus('Resolved')}
                </div>
              </div>
            </div>

            {/* Original Citizen Input */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#171717] block">
                {t('signals.citizen_input')} ({selectedRequest.language || 'Native'} · {selectedRequest.source_type?.toLowerCase().includes('voice') ? t('signals.voice') : t('signals.written')})
              </span>
              <div className="p-3 bg-[#FAF8F5] border border-[#171717]/10 text-xs text-[#57534E] rounded-xs leading-relaxed italic">
                "{selectedRequest.original_text || selectedRequest.summary_en}"
              </div>
            </div>

            {/* What CivicPulse Understood */}
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#171717]">
                <Sparkles className="w-3.5 h-3.5 text-[#D65A3A]" />
                <span>{t('signals.what_understood')}</span>
              </div>
              <div className="p-3 bg-white border border-[#171717]/15 text-xs text-[#171717] rounded-xs leading-relaxed">
                {tSignalSummary(selectedRequest)}
              </div>
            </div>

            {/* Key Diagnostic Attributes */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
              <div className="p-2.5 bg-[#FAF8F5] border border-[#171717]/10 rounded-xs">
                <span className="text-[10px] text-[#78716C] block">{t('signals.severity_score')}</span>
                <span className="text-sm font-bold text-[#D65A3A]">
                  {selectedRequest.severity || 6} / 10
                </span>
              </div>
              <div className="p-2.5 bg-[#FAF8F5] border border-[#171717]/10 rounded-xs">
                <span className="text-[10px] text-[#78716C] block">{t('signals.reported_infra')}</span>
                <span className="text-xs font-bold text-[#171717]">
                  {selectedRequest.affected_infrastructure || `${tCategory(selectedRequest.category)} Utility Asset`}
                </span>
              </div>
            </div>

            {/* Provenance & Baseline Triangulation */}
            <div className="p-3 bg-[#FAF8F5] border border-[#171717]/15 rounded-xs space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#57534E]">
                  Data Provenance & Alignment
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                  selectedRequest.source_origin === 'CIVICPULSE_USER' || selectedRequest.id.startsWith('CP-202')
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-stone-200 text-stone-700 border border-stone-300'
                }`}>
                  {selectedRequest.source_origin === 'CIVICPULSE_USER' || selectedRequest.id.startsWith('CP-202')
                    ? t('data_source.civicpulse_signals')
                    : t('data_source.synthetic_demo')}
                </span>
              </div>
              <p className="text-[11px] text-[#57534E] leading-relaxed">
                Triangulated with Open Government Data (data.gov.in) department grievance statistics and national infrastructure benchmarks (DARPG/JJM/PMGSY).
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#171717]/10">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-3 py-1.5 text-xs text-[#57534E] hover:text-[#171717] cursor-pointer"
              >
                {t('common.close')}
              </button>

              {onNavigateToIssues && (
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    onNavigateToIssues();
                  }}
                  className="px-4 py-2 bg-[#171717] hover:bg-[#34322D] text-white text-xs font-semibold rounded-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>{t('action.explore_community_issues')}</span>
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
