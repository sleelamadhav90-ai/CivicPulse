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
  ChevronDown,
  AlertTriangle,
  Droplets,
  Construction,
  Flame,
  Zap,
  Trash2,
  Waves,
  HeartPulse,
  Wind,
  Bus,
  GraduationCap,
  Trees,
  Landmark,
  ClipboardList
} from 'lucide-react';
import { CitizenRequest, InfrastructureCategory, District } from '../types';
import { 
  getAvailableStates, 
  getDistrictsForState, 
  getLocalitiesForDistrict,
  filterCitizenRequests 
} from '../utils/geography';
import { useLanguage } from '../context/LanguageContext';
import { checkCriticalSafetyRisk, calculatePriorityScore, getPriorityTier } from '../utils/scoring';

interface CitizenSignalsViewProps {
  requests: CitizenRequest[];
  districts?: District[];
  onNavigateToIssues?: () => void;
  onNavigateToSubmit?: () => void;
  selectedLanguage?: string;
  selectedRequestId?: string;
}

export const CitizenSignalsView: React.FC<CitizenSignalsViewProps> = ({
  requests,
  districts = [],
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
    'Water', 'Roads', 'Fire', 'Electricity', 'Sanitation', 'Drainage', 'Health', 'Environment', 'Transport', 'Education', 'Parks', 'Government', 'Other'
  ];

  const getCategoryIconMeta = (catStr: string) => {
    const c = (catStr || '').toLowerCase();
    if (c.includes('water')) return { icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' };
    if (c.includes('road') || c.includes('pothole')) return { icon: Construction, color: 'text-slate-700', bg: 'bg-slate-100 border-slate-300' };
    if (c.includes('fire')) return { icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' };
    if (c.includes('electr') || c.includes('power')) return { icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };
    if (c.includes('sanit') || c.includes('waste') || c.includes('garbage')) return { icon: Trash2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
    if (c.includes('drain') || c.includes('sew') || c.includes('flood')) return { icon: Waves, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' };
    if (c.includes('health') || c.includes('clinic') || c.includes('hospital')) return { icon: HeartPulse, color: 'text-green-600', bg: 'bg-green-50 border-green-200' };
    if (c.includes('environ') || c.includes('dust') || c.includes('air') || c.includes('pollut')) return { icon: Wind, color: 'text-slate-600', bg: 'bg-slate-100 border-slate-300' };
    if (c.includes('transp') || c.includes('bus')) return { icon: Bus, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200' };
    if (c.includes('educat') || c.includes('school')) return { icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' };
    if (c.includes('park') || c.includes('tree') || c.includes('garden')) return { icon: Trees, color: 'text-lime-700', bg: 'bg-lime-50 border-lime-200' };
    if (c.includes('gov') || c.includes('civic') || c.includes('build')) return { icon: Landmark, color: 'text-blue-900', bg: 'bg-blue-50 border-blue-200' };
    if (c.includes('other') || c.includes('general') || c.includes('misc') || c.includes('clipboard')) {
      return { icon: ClipboardList, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' };
    }
    return { icon: Landmark, color: 'text-slate-700', bg: 'bg-slate-100 border-slate-200' };
  };

  const getRequestScore = (req: CitizenRequest) => {
    const toTierString = (score: number): 'Low' | 'Medium' | 'High' | 'Critical' => {
      const t = getPriorityTier(score);
      if (t.label === 'Critical') return 'Critical';
      if (t.label === 'High') return 'High';
      if (t.label === 'Moderate') return 'Medium';
      return 'Low';
    };

    if (typeof req.priority_score === 'number' && req.priority_score > 0) {
      const tier = req.priority_tier || toTierString(req.priority_score);
      return {
        score: req.priority_score,
        tier,
        breakdown: req.score_breakdown,
        severity: typeof req.severity === 'number' ? req.severity : 5,
      };
    }

    const reqDistrictName = (req.district || req.location || '').toLowerCase();
    const matchedDistrict = (districts || []).find(d => 
      d.name.toLowerCase() === reqDistrictName || 
      reqDistrictName.includes(d.name.toLowerCase()) || 
      d.name.toLowerCase().includes(reqDistrictName)
    ) || districts?.[0] || {
      id: 'default',
      name: req.district || req.location || 'Central District',
      state: req.state || 'National',
      population: 450000,
      poverty_index: 0.28,
      water_access: 65,
      road_quality: 58,
      health_access: 62,
      education_access: 70,
      planned_investment: 12000000
    };

    const matchingDemandCount = requests.filter(r => 
      r.category === req.category && 
      (r.district === req.district || r.state === req.state)
    ).length || 1;

    const breakdown = calculatePriorityScore(
      matchedDistrict,
      req.category,
      typeof req.severity === 'number' ? req.severity : 5,
      matchingDemandCount
    );

    const score = breakdown.total_score;
    const tier = req.priority_tier || toTierString(score);
    return {
      score,
      tier,
      breakdown,
      severity: typeof req.severity === 'number' ? req.severity : 5,
    };
  };

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
        list = list.filter(r => r.source_origin === 'CIVICPULSE_USER');
      } else if (selectedSourceOrigin === 'SYNTHETIC_DEMO') {
        list = list.filter(r => r.source_origin !== 'CIVICPULSE_USER');
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
            {t('workflow.step_1')}
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
                <span>{t('action.explore_community_issues')}</span>
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
          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">
            Citizen Signals: {requests.filter(r => r.source_origin === 'CIVICPULSE_USER').length}
          </span>
          <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-300">
            Demo Signals: {requests.filter(r => r.source_origin !== 'CIVICPULSE_USER').length}
          </span>
          <span className="px-2 py-0.5 rounded bg-white text-stone-900 border border-stone-300 font-bold">
            Total Analysed: {requests.length}
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
                <th className="py-2.5 px-3 font-semibold">{t('metric.priority_score') || 'Priority Score'}</th>
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
                filteredRequests.map((req, idx) => {
                  const isVoice = req.source_type?.includes('voice') || req.audio_url;
                  const isCitizenSignal = req.source_origin === 'CIVICPULSE_USER';
                  const safetyEval = checkCriticalSafetyRisk(req);
                  const priorityData = getRequestScore(req);
                  const dateFormatted = req.timestamp 
                    ? new Date(req.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '2 Sep 2026';

                  const tierColor = 
                    priorityData.tier === 'Critical' ? 'text-rose-800 bg-rose-50 border-rose-200' :
                    priorityData.tier === 'High' ? 'text-amber-800 bg-amber-50 border-amber-200' :
                    priorityData.tier === 'Medium' ? 'text-blue-800 bg-blue-50 border-blue-200' :
                    'text-slate-700 bg-slate-100 border-slate-200';

                  const isCriticalRow = priorityData.tier === 'Critical' || safetyEval.isCriticalSafetyRisk;
                  const isHighRow = priorityData.tier === 'High';

                  return (
                    <tr
                      key={`${req.id}-${idx}`}
                      onClick={() => setSelectedRequest(req)}
                      className={`hover:bg-[#FAF8F5] cursor-pointer transition-colors group ${
                        isCriticalRow ? 'border-l-4 border-l-rose-500' : isHighRow ? 'border-l-4 border-l-amber-500' : ''
                      }`}
                    >
                      {/* Issue */}
                      <td className="py-3 px-4 max-w-sm">
                        <div className="font-medium text-[#171717] group-hover:text-[#D65A3A] transition-colors leading-snug line-clamp-2">
                          {tSignalSummary(req)}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono text-[#78716C]">
                            {req.id}
                          </span>
                          {safetyEval.isCriticalSafetyRisk && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-red-900 bg-red-100 border border-red-300 px-1.5 py-0.2 rounded uppercase">
                              <AlertTriangle className="w-2.5 h-2.5 text-red-600" />
                              <span>Critical Safety Risk</span>
                            </span>
                          )}
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
                        {(() => {
                          const meta = getCategoryIconMeta(req.category);
                          const CatIcon = meta.icon;
                          return (
                            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#171717] bg-[#F7F5EF] px-2 py-0.5 rounded border border-[#171717]/10">
                              <CatIcon className={`w-3.5 h-3.5 ${meta.color}`} />
                              <span>{tCategory(req.category)}</span>
                            </span>
                          );
                        })()}
                      </td>

                      {/* Origin */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {isCitizenSignal ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-900 border border-emerald-200">
                            Citizen Signal
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                            CivicPulse Demo Signal
                          </span>
                        )}
                      </td>

                      {/* Priority Score & Hazard Severity */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex flex-col space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-[#171717]">
                              {priorityData.score}
                              <span className="text-[10px] font-normal text-[#78716C]">/100</span>
                            </span>
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${tierColor}`}>
                              {priorityData.tier}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-mono text-[#78716C]">
                            <span>Sev: {priorityData.severity}/10</span>
                            {safetyEval.isCriticalSafetyRisk && (
                              <span className="text-[9px] font-bold text-red-600 uppercase">
                                · Flagged
                              </span>
                            )}
                          </div>
                        </div>
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
                <div className="text-xs text-[#57534E] mt-0.5 flex flex-wrap items-center gap-1.5">
                  <span>{selectedRequest.location}</span>
                  <span>·</span>
                  <span>{t('table.category')}:</span>
                  {(() => {
                    const meta = getCategoryIconMeta(selectedRequest.category);
                    const CatIcon = meta.icon;
                    return (
                      <span className="inline-flex items-center gap-1 font-semibold text-[#171717] bg-[#F7F5EF] px-1.5 py-0.5 rounded border border-[#171717]/10">
                        <CatIcon className={`w-3.5 h-3.5 ${meta.color}`} />
                        <span>{tCategory(selectedRequest.category)}</span>
                      </span>
                    );
                  })()}
                </div>
              </div>

              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1 hover:bg-[#F7F5EF] rounded-xs text-[#78716C] hover:text-[#171717] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Critical Safety Hazard Callout Banner */}
            {(() => {
              const safetyEval = checkCriticalSafetyRisk(selectedRequest);
              if (!safetyEval.isCriticalSafetyRisk) return null;
              return (
                <div className="bg-red-50 border-l-4 border-red-600 p-3.5 rounded-r-xs space-y-1 font-sans">
                  <div className="flex items-center gap-1.5 font-mono font-bold text-xs text-red-900 uppercase">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>⚡ CRITICAL SAFETY HAZARD ESCALATION</span>
                  </div>
                  <p className="text-xs text-red-800 leading-snug font-medium">
                    {safetyEval.escalationDescription}
                  </p>
                  <div className="text-[10px] font-mono font-bold text-red-900 bg-red-100 border border-red-200 px-2 py-0.5 rounded inline-block mt-1 uppercase">
                    Administrative Status: {safetyEval.escalationStatus}
                  </div>
                </div>
              );
            })()}

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

            {/* 5-Pillar Priority Score & Diagnostic Attributes */}
            {(() => {
              const priorityData = getRequestScore(selectedRequest);
              const tierBadgeClass = 
                priorityData.tier === 'Critical' ? 'bg-red-100 text-red-900 border-red-300' :
                priorityData.tier === 'High' ? 'bg-orange-100 text-orange-900 border-orange-300' :
                priorityData.tier === 'Medium' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                'bg-emerald-100 text-emerald-900 border-emerald-300';

              return (
                <div className="space-y-2">
                  <div className="p-3 bg-[#FAF8F5] border border-[#171717]/15 rounded-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-[#78716C] font-semibold block">
                          5-Pillar Composite Priority Score
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-2xl font-serif font-bold text-[#D65A3A]">
                            {priorityData.score} <span className="text-sm font-sans text-[#78716C]">/ 100</span>
                          </span>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${tierBadgeClass}`}>
                            {priorityData.tier} Priority
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono uppercase text-[#78716C] font-semibold block">
                          Hazard Severity
                        </span>
                        <span className="text-sm font-mono font-bold text-[#171717]">
                          {priorityData.severity} / 10
                        </span>
                      </div>
                    </div>

                    {priorityData.breakdown && (
                      <div className="pt-2 border-t border-[#171717]/10">
                        <span className="text-[9px] font-mono uppercase text-[#78716C] font-semibold block mb-1.5">
                          Formula Lineage (Demand 30% + Gap 25% + Vulnerability 20% + Urgency 15% + CapEx 10%)
                        </span>
                        <div className="grid grid-cols-5 gap-1.5 text-[9px] font-mono text-center">
                          <div className="bg-white p-1.5 border border-[#171717]/10 rounded-xs">
                            <span className="text-[#78716C] block">Demand</span>
                            <span className="font-bold text-[#171717]">{priorityData.breakdown.demand_score}</span>
                          </div>
                          <div className="bg-white p-1.5 border border-[#171717]/10 rounded-xs">
                            <span className="text-[#78716C] block">Gap</span>
                            <span className="font-bold text-[#171717]">{priorityData.breakdown.gap_score}</span>
                          </div>
                          <div className="bg-white p-1.5 border border-[#171717]/10 rounded-xs">
                            <span className="text-[#78716C] block">Vuln</span>
                            <span className="font-bold text-[#171717]">{priorityData.breakdown.vuln_score}</span>
                          </div>
                          <div className="bg-white p-1.5 border border-[#171717]/10 rounded-xs">
                            <span className="text-[#78716C] block">Urgency</span>
                            <span className="font-bold text-[#171717]">{priorityData.breakdown.sev_score}</span>
                          </div>
                          <div className="bg-white p-1.5 border border-[#171717]/10 rounded-xs">
                            <span className="text-[#78716C] block">CapEx</span>
                            <span className="font-bold text-[#171717]">{priorityData.breakdown.align_score}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 bg-[#FAF8F5] border border-[#171717]/10 rounded-xs">
                    <span className="text-[10px] text-[#78716C] block">{t('signals.reported_infra')}</span>
                    <span className="text-xs font-bold text-[#171717]">
                      {selectedRequest.affected_infrastructure || (selectedRequest.category === 'Other' ? 'Community Civic Infrastructure' : `${tCategory(selectedRequest.category)} Utility Asset`)}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Photographic Evidence OR AI Illustration */}
            {selectedRequest.photo_url ? (
              <div className="p-3 bg-[#FAF8F5] border border-[#171717]/15 rounded-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#57534E]">
                    Attached Photographic Evidence
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    selectedRequest.photo_url.startsWith('http')
                      ? 'bg-amber-50 text-amber-900 border border-amber-300'
                      : 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                  }`}>
                    {selectedRequest.photo_url.startsWith('http')
                      ? '🧪 Demo Sample Image (Synthetic Reference)'
                      : '📷 Authentic Citizen Photo Evidence'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <img 
                    src={selectedRequest.photo_url} 
                    alt="Citizen Evidence" 
                    className="w-16 h-16 object-cover border border-[#171717] rounded-xs shadow-xs shrink-0" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-xs space-y-0.5">
                    <p className="font-semibold text-[#171717]">
                      {selectedRequest.photo_url.startsWith('http')
                        ? 'Illustrative reference image from CivicPulse prototype benchmark dataset.'
                        : 'Authentic local camera snapshot captured and attached during citizen intake.'}
                    </p>
                    <span className="text-[10px] font-mono text-[#78716C]">
                      Source Type: {selectedRequest.source_type || 'photo'}
                    </span>
                  </div>
                </div>
              </div>
            ) : selectedRequest.illustration_url ? (
              <div className="p-3 bg-white border border-[#171717]/15 rounded-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#57534E]">
                    AI-Generated Problem Illustration
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-purple-100 text-purple-900 border border-purple-300 rounded-xs uppercase tracking-wider">
                    🤖 AI-Generated Illustration
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <img 
                    src={selectedRequest.illustration_url} 
                    alt="AI Illustration" 
                    className="w-20 h-20 sm:w-24 sm:h-20 object-cover border border-[#171717] rounded-xs shadow-xs shrink-0" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-[#171717] font-serif italic text-[11px]">
                      "Synthetic visualization of the reported {selectedRequest.category.toLowerCase()} issue."
                    </p>
                    <p className="text-[10px] text-slate-600 leading-tight">
                      Generated by AI to help visualize the reported conditions. This is a synthetic reference, NOT a real site photo.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Provenance & Baseline Triangulation */}
            <div className="p-3 bg-[#FAF8F5] border border-[#171717]/15 rounded-xs space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#57534E]">
                  Data Provenance & Alignment
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                  selectedRequest.source_origin === 'CIVICPULSE_USER'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-stone-100 text-stone-700 border border-stone-300'
                }`}>
                  {selectedRequest.source_origin === 'CIVICPULSE_USER'
                    ? 'Citizen Signal'
                    : 'CivicPulse Demo Signal'}
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
