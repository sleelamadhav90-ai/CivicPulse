import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  X, 
  ArrowRight, 
  MapPin, 
  Droplets, 
  Route, 
  Zap, 
  HeartPulse, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Layers, 
  ShieldCheck,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Info,
  ExternalLink,
  Activity
} from 'lucide-react';
import { 
  searchCivicPulse, 
  HumanSearchResultItem, 
  HumanSearchResults, 
  fetchServerSearchIntent, 
  fetchSearchSummary, 
  SearchIntent 
} from '../services/humanSearchService';
import { CitizenRequest, District, GovernmentProject, InfrastructureCategory } from '../types';
import { CommunityIssue } from './CommunityIssuesView';
import { useLanguage } from '../context/LanguageContext';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: CitizenRequest[];
  districts: District[];
  governmentProjects: GovernmentProject[];
  communityIssues?: CommunityIssue[];
  initialQuery?: string;
  onNavigateToSignal: (requestId: string) => void;
  onNavigateToIssues: () => void;
  onNavigateToDistrict: (districtId: string, category?: InfrastructureCategory) => void;
  onNavigateToProjects: () => void;
  onNavigateToInfrastructure?: () => void;
  onNavigateToRecommendations?: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  requests,
  districts,
  governmentProjects,
  communityIssues,
  initialQuery = '',
  onNavigateToSignal,
  onNavigateToIssues,
  onNavigateToDistrict,
  onNavigateToProjects,
  onNavigateToInfrastructure,
  onNavigateToRecommendations,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [serverIntent, setServerIntent] = useState<SearchIntent | null>(null);
  const [isAiExtracting, setIsAiExtracting] = useState(false);
  const [aiError, setAiError] = useState<boolean>(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiSummarizing, setIsAiSummarizing] = useState(false);
  const [expandedExplainIds, setExpandedExplainIds] = useState<Set<string>>(new Set());
  const [disabledFilters, setDisabledFilters] = useState<Set<string>>(new Set());

  const inputRef = useRef<HTMLInputElement>(null);
  const { t, tCategory, tStatus } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setServerIntent(null);
      setAiSummary(null);
      setAiError(false);
      setDisabledFilters(new Set());
      setExpandedExplainIds(new Set());
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, initialQuery]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Asynchronously query server-side Gemini intent extraction (debounced)
  useEffect(() => {
    if (!query.trim() || query.trim().length < 3) {
      setServerIntent(null);
      setAiSummary(null);
      setAiError(false);
      setDisabledFilters(new Set());
      return;
    }

    const timer = setTimeout(async () => {
      setIsAiExtracting(true);
      setAiError(false);
      try {
        const result = await fetchServerSearchIntent(query, districts);
        if (result.isAiExtracted) {
          setServerIntent(result.intent);
        }
      } catch (e) {
        console.warn('Intent extraction fallback:', e);
        setAiError(true);
      } finally {
        setIsAiExtracting(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, districts]);

  // Compute effective intent after applying user-disabled filters
  const effectiveIntent = useMemo<SearchIntent | undefined>(() => {
    if (!serverIntent) return undefined;
    const modified = { ...serverIntent };

    if (disabledFilters.has('category')) {
      modified.category = 'ANY';
      modified.detectedCategories = [];
    }
    if (disabledFilters.has('district')) {
      modified.district = undefined;
    }
    if (disabledFilters.has('state')) {
      modified.state = undefined;
    }
    if (disabledFilters.has('priority') || disabledFilters.has('urgency')) {
      modified.isUrgent = false;
    }
    if (disabledFilters.has('query_type')) {
      modified.query_type = undefined;
    }
    if (modified.issue_terms) {
      modified.issue_terms = modified.issue_terms.filter(term => !disabledFilters.has(`term:${term}`));
    }
    if (modified.keywords) {
      modified.keywords = modified.keywords.filter(kw => !disabledFilters.has(`kw:${kw}`));
    }

    return modified;
  }, [serverIntent, disabledFilters]);

  // Execute human-first deterministic search
  const searchResults: HumanSearchResults = useMemo(() => {
    return searchCivicPulse(
      query, 
      { requests, districts, governmentProjects, communityIssues },
      { tCategory, tStatus, intentOverride: effectiveIntent }
    );
  }, [query, requests, districts, governmentProjects, communityIssues, tCategory, tStatus, effectiveIntent]);

  // Generate grounded AI summary for non-empty search results (debounced)
  useEffect(() => {
    if (!query.trim() || searchResults.totalResultsCount === 0 || searchResults.exactMatchNotFoundId) {
      setAiSummary(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsAiSummarizing(true);
      try {
        const summary = await fetchSearchSummary(query, searchResults);
        if (summary) {
          setAiSummary(summary);
        }
      } catch (e) {
        console.warn('Summary generation error:', e);
      } finally {
        setIsAiSummarizing(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, searchResults]);

  const toggleExplain = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedExplainIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const toggleFilterRemoval = (filterKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDisabledFilters(prev => {
      const next = new Set(prev);
      if (next.has(filterKey)) {
        next.delete(filterKey);
      } else {
        next.add(filterKey);
      }
      return next;
    });
  };

  const handleApplySuggestion = (sug: string) => {
    setQuery(sug);
    setDisabledFilters(new Set());
    inputRef.current?.focus();
  };

  const handleResultClick = (item: HumanSearchResultItem) => {
    onClose();
    switch (item.type) {
      case 'EXACT_REQUEST':
      case 'CITIZEN_REPORT':
        onNavigateToSignal(item.id);
        break;
      case 'RECOMMENDATION':
        if (onNavigateToRecommendations) {
          onNavigateToRecommendations();
        } else {
          onNavigateToDistrict(item.rawItem?.districtId);
        }
        break;
      case 'COMMUNITY_ISSUE':
        onNavigateToIssues();
        break;
      case 'PRIORITY_HOTSPOT':
        onNavigateToDistrict(item.id, item.rawItem?.category);
        break;
      case 'ACTION_PROJECT':
        onNavigateToProjects();
        break;
      case 'INFRASTRUCTURE':
        if (onNavigateToInfrastructure) {
          onNavigateToInfrastructure();
        } else {
          onNavigateToDistrict(item.rawItem?.districtId);
        }
        break;
      case 'BEST_MATCH':
        if (item.rawItem?.id?.startsWith('rec-') || item.rawItem?.interventionType) {
          if (onNavigateToRecommendations) {
            onNavigateToRecommendations();
          } else {
            onNavigateToDistrict(item.rawItem?.districtId);
          }
        } else if (item.rawItem?.id?.startsWith('CP-') || item.rawItem?.id?.startsWith('req-')) {
          onNavigateToSignal(item.id);
        } else if (item.rawItem?.title && item.rawItem?.category && item.rawItem?.requestCount) {
          onNavigateToIssues();
        } else if (item.rawItem?.population) {
          onNavigateToDistrict(item.id);
        } else {
          onNavigateToIssues();
        }
        break;
      default:
        onNavigateToIssues();
    }
  };

  const getCategoryIcon = (category: string) => {
    const c = (category || '').toLowerCase();
    if (c.includes('water')) return <Droplets className="w-3.5 h-3.5 text-[#285943]" />;
    if (c.includes('road')) return <Route className="w-3.5 h-3.5 text-[#D65A3A]" />;
    if (c.includes('elect')) return <Zap className="w-3.5 h-3.5 text-amber-600" />;
    if (c.includes('health')) return <HeartPulse className="w-3.5 h-3.5 text-rose-600" />;
    return <Layers className="w-3.5 h-3.5 text-stone-600" />;
  };

  const starterQueries = [
    'Show water problems in Guntur',
    'Where is water demand highest in Guntur?',
    'What should we prioritize for water in Guntur?',
    'Show urgent road problems in Andhra Pradesh',
    'Find request CP-2026-004821',
    'Prioritize drinking water investment'
  ];

  if (!isOpen) return null;

  const activeIntent = effectiveIntent || searchResults.intent;
  const hasExtractedFilters = Boolean(
    (activeIntent.category && activeIntent.category !== 'ANY') ||
    activeIntent.district ||
    activeIntent.state ||
    activeIntent.isUrgent ||
    activeIntent.query_type ||
    (activeIntent.issue_terms && activeIntent.issue_terms.length > 0)
  );

  return (
    <div 
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 pt-10 sm:pt-16 font-sans text-[#171717] overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-[#F7F5EF] border-2 border-[#171717] w-full max-w-3xl rounded-none shadow-[10px_10px_0px_#171717] overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b-2 border-[#171717] bg-[#F3EFE6] relative">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-[#D65A3A]"></span>
              <h2 className="font-serif font-bold text-lg text-[#171717] tracking-tight">
                {t('search.prompt_title') || 'What would you like to find?'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#57534E] hover:text-[#171717] hover:bg-[#171717]/5 rounded-xs transition-colors cursor-pointer"
              title="Close Search (Esc)"
              aria-label="Close Search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input Box */}
          <div className="relative mt-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#57534E]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.input_placeholder') || 'Ask CivicPulse about citizen needs, hotspots, infrastructure or priorities…'}
              className="w-full pl-11 pr-10 py-3 bg-white border-2 border-[#171717] text-[#171717] text-sm sm:text-base placeholder-[#57534E]/60 focus:outline-none focus:ring-2 focus:ring-[#D65A3A] font-sans shadow-[2px_2px_0px_#171717]"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setDisabledFilters(new Set());
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#57534E] hover:text-[#171717] transition-colors cursor-pointer"
                title="Clear query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Staged Loading Indicator */}
          {(isAiExtracting || isAiSummarizing) && (
            <div className="mt-2 flex items-center space-x-2 text-[11px] font-mono text-[#57534E]">
              <span className="inline-block w-2 h-2 rounded-full bg-[#D65A3A] animate-pulse"></span>
              <span>
                {isAiExtracting 
                  ? (t('search.understanding_query') || 'UNDERSTANDING QUERY…')
                  : (t('search.building_results') || 'BUILDING RESULTS…')}
              </span>
            </div>
          )}

          {/* Typo Correction Pill */}
          {searchResults.intent.typoCorrection && (
            <div className="mt-2.5 flex items-center space-x-2 text-xs text-[#57534E] bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>
                {t('search.did_you_mean') || 'Did you mean:'}{' '}
                <button
                  onClick={() => handleApplySuggestion(searchResults.intent.typoCorrection!)}
                  className="font-bold text-[#D65A3A] underline underline-offset-2 hover:text-[#b03d20] cursor-pointer"
                >
                  {searchResults.intent.typoCorrection}
                </button>
                ?
              </span>
            </div>
          )}

          {/* Search Interpreted As Banner & Removable Filter Chips */}
          {query.trim().length >= 2 && hasExtractedFilters && (
            <div className="mt-3 p-2.5 bg-white border border-[#171717]/15 rounded-xs space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#57534E] tracking-wider">
                <span className="flex items-center space-x-1.5 font-bold text-[#171717]">
                  <Sparkles className="w-3 h-3 text-[#D65A3A]" />
                  <span>{t('search.interpreted_as') || 'SEARCH INTERPRETED AS'}</span>
                </span>
                {disabledFilters.size > 0 && (
                  <button 
                    onClick={() => setDisabledFilters(new Set())}
                    className="text-[#D65A3A] hover:underline normal-case cursor-pointer text-[10px]"
                  >
                    Reset filters
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {activeIntent.category && activeIntent.category !== 'ANY' && !disabledFilters.has('category') && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-[#F7F5EF] border border-[#171717]/30 text-xs font-medium text-[#171717] rounded-xs">
                    {getCategoryIcon(activeIntent.category)}
                    <span>{tCategory(activeIntent.category as any)}</span>
                    <button 
                      onClick={(e) => toggleFilterRemoval('category', e)}
                      className="ml-1 hover:text-[#D65A3A] cursor-pointer"
                      title={t('search.remove_filter') || 'Remove filter'}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {activeIntent.district && !disabledFilters.has('district') && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-[#F7F5EF] border border-[#171717]/30 text-xs font-medium text-[#171717] rounded-xs">
                    <MapPin className="w-3 h-3 text-stone-600" />
                    <span>District: {activeIntent.district}</span>
                    <button 
                      onClick={(e) => toggleFilterRemoval('district', e)}
                      className="ml-1 hover:text-[#D65A3A] cursor-pointer"
                      title={t('search.remove_filter') || 'Remove filter'}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {activeIntent.state && !disabledFilters.has('state') && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-[#F7F5EF] border border-[#171717]/30 text-xs font-medium text-[#171717] rounded-xs">
                    <span>State: {activeIntent.state}</span>
                    <button 
                      onClick={(e) => toggleFilterRemoval('state', e)}
                      className="ml-1 hover:text-[#D65A3A] cursor-pointer"
                      title={t('search.remove_filter') || 'Remove filter'}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {activeIntent.isUrgent && !disabledFilters.has('urgency') && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-rose-50 border border-rose-300 text-xs font-medium text-rose-900 rounded-xs">
                    <span>High Urgency / Priority</span>
                    <button 
                      onClick={(e) => toggleFilterRemoval('urgency', e)}
                      className="ml-1 hover:text-rose-700 cursor-pointer"
                      title={t('search.remove_filter') || 'Remove filter'}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {activeIntent.query_type && activeIntent.query_type !== 'GENERAL' && !disabledFilters.has('query_type') && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-amber-50 border border-amber-300 text-xs font-medium text-amber-900 rounded-xs">
                    <span>Type: {activeIntent.query_type.replace('_', ' ')}</span>
                    <button 
                      onClick={(e) => toggleFilterRemoval('query_type', e)}
                      className="ml-1 hover:text-amber-700 cursor-pointer"
                      title={t('search.remove_filter') || 'Remove filter'}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {activeIntent.issue_terms?.map((term) => !disabledFilters.has(`term:${term}`) && (
                  <span key={term} className="inline-flex items-center space-x-1 px-2 py-0.5 bg-stone-100 border border-stone-300 text-xs text-stone-800 rounded-xs">
                    <span>"{term}"</span>
                    <button 
                      onClick={(e) => toggleFilterRemoval(`term:${term}`, e)}
                      className="ml-1 hover:text-[#D65A3A] cursor-pointer"
                      title={t('search.remove_filter') || 'Remove filter'}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Unavailable Alert Box */}
          {aiError && (
            <div className="mt-2.5 p-2 bg-amber-50 border border-amber-200 text-xs text-amber-900 rounded-xs flex items-center space-x-2">
              <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>{t('search.ai_unavailable') || 'AI interpretation is temporarily unavailable. CivicPulse is using its deterministic search fallback.'}</span>
            </div>
          )}

          {/* Clickable Grounded Query Suggestions Chips */}
          <div className="mt-3 flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[11px] font-mono text-[#57534E] uppercase tracking-wider shrink-0 mr-1">
              {searchResults.suggestionsType === 'POPULAR_OR_RECENT' 
                ? (t('search.popular_recent') || 'Popular & Recent:') 
                : (t('search.matching_suggestions') || 'Matching Suggestions:')}
            </span>
            {searchResults.suggestions.length > 0 ? (
              searchResults.suggestions.map((sug) => (
                <button
                  key={sug}
                  onClick={() => handleApplySuggestion(sug)}
                  className="px-2.5 py-1 bg-white hover:bg-[#F7F5EF] border border-[#171717]/20 hover:border-[#171717] text-xs text-[#171717] rounded-xs shrink-0 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                >
                  {sug}
                </button>
              ))
            ) : query.trim() ? (
              <span className="text-xs text-stone-500 italic">No matching CivicPulse issues found.</span>
            ) : null}
          </div>
        </div>

        {/* Search Results Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* EMPTY STATE / 6 PRESET HINTS */}
          {!query.trim() && (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 bg-stone-200/80 rounded-full flex items-center justify-center mx-auto text-[#57534E]">
                <Search className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="font-serif font-bold text-lg text-[#171717]">
                  {t('search.human_first_title') || 'Human-First Civic Search'}
                </h3>
                <p className="text-xs sm:text-sm text-[#57534E] mt-1 leading-relaxed">
                  {t('search.human_first_desc') || 'Search naturally using conversational language. No database codes or request IDs required.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl mx-auto text-left mt-4 pt-2">
                {starterQueries.map((starter) => (
                  <div 
                    key={starter}
                    onClick={() => handleApplySuggestion(starter)}
                    className="p-3 bg-white border border-[#171717]/15 hover:border-[#171717] hover:shadow-xs transition-all cursor-pointer rounded-xs flex items-center justify-between group"
                  >
                    <p className="font-medium text-xs text-[#171717] group-hover:text-[#D65A3A] transition-colors">
                      "{starter}"
                    </p>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#D65A3A] transition-transform group-hover:translate-x-0.5 shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EXACT ID NOT FOUND STATE */}
          {searchResults.exactMatchNotFoundId && !searchResults.exactMatch && (
            <div className="border-2 border-stone-400 bg-stone-50 p-4 sm:p-5 shadow-[4px_4px_0px_#78716c] space-y-2">
              <div className="flex items-center space-x-2 text-stone-800">
                <Search className="w-5 h-5 text-stone-500 shrink-0" />
                <h4 className="font-serif font-bold text-base text-[#171717]">
                  No CivicPulse request found for {searchResults.exactMatchNotFoundId}.
                </h4>
              </div>
              <p className="text-xs text-[#57534E] leading-relaxed">
                We verified all records in the CivicPulse database, but no citizen report or public project matches this exact tracking ID. Verify the code or search using conversational phrases like <span className="font-bold text-[#171717]">"water in Guntur"</span> or <span className="font-bold text-[#171717]">"road damage"</span>.
              </p>
            </div>
          )}

          {/* NO RESULTS FOUND STATE */}
          {query.trim() && searchResults.totalResultsCount === 0 && !searchResults.exactMatchNotFoundId && (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 bg-amber-100 border border-amber-300 rounded-full flex items-center justify-center mx-auto text-amber-800">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#171717]">
                No matching records found for "{query}"
              </h3>
              <p className="text-xs sm:text-sm text-[#57534E] max-w-md mx-auto">
                Try searching by a broader category like <span className="font-bold text-[#171717]">"Water"</span>, <span className="font-bold text-[#171717]">"Roads"</span>, or by district name like <span className="font-bold text-[#171717]">"Guntur"</span>.
              </p>
            </div>
          )}

          {/* EXACT ID RESULT */}
          {searchResults.exactMatch && (
            <div className="border-2 border-[#171717] bg-white p-4 sm:p-5 shadow-[4px_4px_0px_#171717] space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-[#171717]/10 pb-2.5">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 bg-[#285943] text-white text-[11px] font-mono font-bold rounded-xs">
                    {t('search.exact_record_found') || 'EXACT RECORD FOUND'}
                  </span>
                  <span className="text-xs font-mono text-[#57534E]">
                    {searchResults.exactMatch.dateOrTimeline}
                  </span>
                </div>
                <span className={`px-2 py-0.5 text-[11px] font-medium border rounded-xs ${searchResults.exactMatch.provenanceBadgeColor}`}>
                  {searchResults.exactMatch.provenanceLabel}
                </span>
              </div>

              <div>
                <h4 className="font-serif font-bold text-lg text-[#171717]">
                  {searchResults.exactMatch.title}
                </h4>
                {searchResults.exactMatch.subtitle && (
                  <p className="text-xs sm:text-sm text-[#57534E] mt-1 leading-relaxed">
                    {searchResults.exactMatch.subtitle}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#57534E] pt-1">
                <span className="flex items-center space-x-1">
                  {getCategoryIcon(searchResults.exactMatch.category)}
                  <span className="font-medium text-[#171717]">{searchResults.exactMatch.category}</span>
                </span>
                <span>·</span>
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-500" />
                  <span>{searchResults.exactMatch.location}</span>
                </span>
                {searchResults.exactMatch.statusBadge && (
                  <>
                    <span>·</span>
                    <span className="px-2 py-0.5 bg-stone-100 text-stone-800 border border-stone-300 rounded-xs font-medium text-[11px]">
                      Status: {searchResults.exactMatch.statusBadge}
                    </span>
                  </>
                )}
                {searchResults.exactMatch.priorityLabel && (
                  <>
                    <span>·</span>
                    <span className="font-medium text-[#D65A3A]">
                      {searchResults.exactMatch.priorityLabel}
                    </span>
                  </>
                )}
              </div>

              {/* Explainability Accordion */}
              <div className="pt-2 border-t border-[#171717]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <button
                  onClick={(e) => toggleExplain(searchResults.exactMatch!.id, e)}
                  className="inline-flex items-center space-x-1.5 text-xs text-[#57534E] hover:text-[#171717] font-mono cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5 text-[#D65A3A]" />
                  <span>{t('search.why_this_result') || 'Why this result?'}</span>
                  {expandedExplainIds.has(searchResults.exactMatch!.id) ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => handleResultClick(searchResults.exactMatch!)}
                  className="px-4 py-2 bg-[#D65A3A] hover:bg-[#b03d20] text-white font-medium text-xs flex items-center justify-center space-x-2 rounded-xs transition-colors cursor-pointer"
                >
                  <span>{searchResults.exactMatch.actionHint}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {expandedExplainIds.has(searchResults.exactMatch!.id) && (
                <div className="p-3 bg-[#F7F5EF] border border-[#171717]/15 rounded-xs text-xs space-y-1.5 font-mono">
                  <div className="flex items-center justify-between text-[#171717] font-bold">
                    <span>{t('search.relevance_score') || 'Relevance Score'}: {searchResults.exactMatch.score}/100</span>
                  </div>
                  <ul className="space-y-1 text-[#57534E] text-[11px]">
                    {searchResults.exactMatch.scoreBreakdown?.map((factor, i) => (
                      <li key={i} className="flex items-center justify-between">
                        <span>• {factor.label}</span>
                        <span className="font-bold text-[#285943]">+{factor.points}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* GROUNDED SUMMARY SYNTHESIS */}
          {(aiSummary || isAiSummarizing) && (
            <div className="border-2 border-[#171717] bg-[#F7F5EF] p-3.5 sm:p-4 shadow-[3px_3px_0px_#171717] space-y-1.5">
              <div className="flex items-center justify-between gap-2 border-b border-[#171717]/10 pb-1.5">
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D65A3A]" />
                  <span className="text-[11px] font-mono font-bold text-[#171717] uppercase tracking-wider">
                    {t('search.grounded_summary') || 'CIVICPULSE SUMMARY'}
                  </span>
                </div>
                <span className="px-1.5 py-0.2 bg-stone-200 text-stone-700 text-[10px] font-mono rounded-xs">
                  Grounded Synthesis
                </span>
              </div>
              {isAiSummarizing && !aiSummary ? (
                <div className="flex items-center space-x-2 text-xs text-[#57534E] py-1">
                  <span className="animate-spin w-3 h-3 border-2 border-[#D65A3A] border-t-transparent rounded-full"></span>
                  <span>Synthesizing grounded brief across records...</span>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-[#171717] leading-relaxed font-sans">
                  {aiSummary}
                </p>
              )}
            </div>
          )}

          {/* 1. PRIORITY RECOMMENDATIONS */}
          {searchResults.recommendations && searchResults.recommendations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#171717]/10 pb-1.5">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-[#285943]" />
                  <h3 className="font-serif font-bold text-sm text-[#171717] uppercase tracking-wider">
                    Priority Recommendations ({searchResults.recommendations.length})
                  </h3>
                </div>
                {onNavigateToRecommendations && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToRecommendations();
                    }}
                    className="text-xs text-[#285943] hover:underline cursor-pointer flex items-center space-x-1 font-mono"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {searchResults.recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3.5 bg-white border border-[#171717]/15 hover:border-[#171717] hover:shadow-xs transition-all rounded-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#57534E]">
                      <span className="flex items-center space-x-1 font-medium text-[#171717]">
                        {getCategoryIcon(rec.category)}
                        <span>{rec.category}</span>
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className={`px-1.5 py-0.2 text-[10px] font-medium border rounded-xs ${rec.provenanceBadgeColor}`}>
                          {rec.provenanceLabel}
                        </span>
                        {rec.priorityLabel && (
                          <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xs text-[10px] font-bold">
                            {rec.priorityLabel}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-sm sm:text-base text-[#171717]">
                        {rec.title}
                      </h4>
                      {rec.subtitle && (
                        <p className="text-xs text-[#57534E] mt-0.5 leading-relaxed">
                          {rec.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#57534E] pt-1.5 border-t border-[#171717]/5">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span>{rec.location}</span>
                      </span>
                      {rec.reportCount && (
                        <span className="font-bold text-[#285943]">
                          {rec.reportCount}
                        </span>
                      )}
                    </div>

                    {/* Card Actions & Explainability */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#171717]/10">
                      <button
                        onClick={(e) => toggleExplain(rec.id, e)}
                        className="inline-flex items-center space-x-1 text-xs text-[#57534E] hover:text-[#171717] font-mono cursor-pointer"
                      >
                        <Info className="w-3 h-3 text-[#D65A3A]" />
                        <span>{t('search.why_this_result') || 'Why this result?'}</span>
                        {expandedExplainIds.has(rec.id) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleResultClick(rec)}
                          className="px-3 py-1 bg-[#285943] hover:bg-[#1e4433] text-white text-xs font-medium rounded-xs flex items-center space-x-1 transition-colors cursor-pointer"
                        >
                          <span>{t('search.view_recommendation') || 'View Recommendation'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {expandedExplainIds.has(rec.id) && (
                      <div className="p-3 bg-[#F7F5EF] border border-[#171717]/15 rounded-xs text-xs space-y-2 font-mono">
                        <div className="flex items-center justify-between text-[#171717] font-bold">
                          <span>{t('search.relevance_score') || 'Relevance Score'}: {rec.score}/100</span>
                        </div>
                        {rec.whyExplanation && (
                          <p className="text-[11px] text-[#171717] font-sans italic bg-white p-2 border border-[#171717]/10 rounded-xs">
                            "{rec.whyExplanation}"
                          </p>
                        )}
                        <ul className="space-y-1 text-[#57534E] text-[11px]">
                          {rec.scoreBreakdown?.map((factor, i) => (
                            <li key={i} className="flex items-center justify-between">
                              <span>• {factor.label}</span>
                              <span className="font-bold text-[#285943]">+{factor.points}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. PRIORITY HOTSPOTS */}
          {searchResults.priorityHotspots.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#171717]/10 pb-1.5">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-[#285943]" />
                  <h3 className="font-serif font-bold text-sm text-[#171717] uppercase tracking-wider">
                    Priority Hotspots ({searchResults.priorityHotspots.length})
                  </h3>
                </div>
              </div>

              <div className="space-y-3">
                {searchResults.priorityHotspots.map((spot) => (
                  <div
                    key={spot.id}
                    className="p-3.5 bg-white border border-[#171717]/15 hover:border-[#171717] hover:shadow-xs transition-all rounded-xs space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-serif font-bold text-sm sm:text-base text-[#171717]">
                          {spot.title}
                        </h4>
                        <p className="text-xs text-[#57534E] mt-0.5">
                          {spot.subtitle || spot.location}
                        </p>
                        {spot.peopleAffected && (
                          <p className="text-[11px] font-medium text-[#285943] mt-1">
                            {spot.peopleAffected}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0 ml-3 space-y-1">
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold rounded-xs inline-block">
                          {spot.priorityLabel || 'Hotspot'}
                        </span>
                        <div className="block">
                          <span className={`px-1.5 py-0.2 text-[10px] font-medium border rounded-xs ${spot.provenanceBadgeColor}`}>
                            {spot.provenanceLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#171717]/10">
                      <button
                        onClick={(e) => toggleExplain(spot.id, e)}
                        className="inline-flex items-center space-x-1 text-xs text-[#57534E] hover:text-[#171717] font-mono cursor-pointer"
                      >
                        <Info className="w-3 h-3 text-[#D65A3A]" />
                        <span>{t('search.why_this_result') || 'Why this result?'}</span>
                        {expandedExplainIds.has(spot.id) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      <button
                        onClick={() => handleResultClick(spot)}
                        className="px-3 py-1 bg-[#285943] hover:bg-[#1e4433] text-white text-xs font-medium rounded-xs flex items-center space-x-1 transition-colors cursor-pointer"
                      >
                        <span>{t('search.view_on_map') || 'View on Map'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {expandedExplainIds.has(spot.id) && (
                      <div className="p-3 bg-[#F7F5EF] border border-[#171717]/15 rounded-xs text-xs space-y-1.5 font-mono">
                        <div className="flex items-center justify-between text-[#171717] font-bold">
                          <span>{t('search.relevance_score') || 'Relevance Score'}: {spot.score}/100</span>
                        </div>
                        <ul className="space-y-1 text-[#57534E] text-[11px]">
                          {spot.scoreBreakdown?.map((factor, i) => (
                            <li key={i} className="flex items-center justify-between">
                              <span>• {factor.label}</span>
                              <span className="font-bold text-[#285943]">+{factor.points}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. COMMUNITY ISSUES */}
          {searchResults.communityIssues.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#171717]/10 pb-1.5">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-[#D65A3A]" />
                  <h3 className="font-serif font-bold text-sm text-[#171717] uppercase tracking-wider">
                    Community Issues ({searchResults.communityIssues.length})
                  </h3>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToIssues();
                  }}
                  className="text-xs text-[#D65A3A] hover:underline cursor-pointer flex items-center space-x-1 font-mono"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-3">
                {searchResults.communityIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3.5 bg-white border border-[#171717]/15 hover:border-[#171717] hover:shadow-xs transition-all rounded-xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#57534E]">
                      <span className="flex items-center space-x-1 font-medium text-[#171717]">
                        {getCategoryIcon(issue.category)}
                        <span>{issue.category}</span>
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className={`px-1.5 py-0.2 text-[10px] font-medium border rounded-xs ${issue.provenanceBadgeColor}`}>
                          {issue.provenanceLabel}
                        </span>
                        {issue.priorityLabel && (
                          <span className="px-1.5 py-0.2 bg-amber-50 text-amber-800 border border-amber-200 rounded-xs text-[10px] font-bold">
                            {issue.priorityLabel}
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="font-serif font-bold text-sm text-[#171717]">
                      {issue.title}
                    </h4>

                    {issue.subtitle && (
                      <p className="text-xs text-[#57534E]">
                        {issue.subtitle}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-[#57534E] pt-1.5 border-t border-[#171717]/5">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span>{issue.location}</span>
                      </span>
                      {issue.reportCount && (
                        <span className="font-bold text-[#285943]">
                          {issue.reportCount}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#171717]/10">
                      <button
                        onClick={(e) => toggleExplain(issue.id, e)}
                        className="inline-flex items-center space-x-1 text-xs text-[#57534E] hover:text-[#171717] font-mono cursor-pointer"
                      >
                        <Info className="w-3 h-3 text-[#D65A3A]" />
                        <span>{t('search.why_this_result') || 'Why this result?'}</span>
                        {expandedExplainIds.has(issue.id) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      <button
                        onClick={() => handleResultClick(issue)}
                        className="px-3 py-1 bg-[#D65A3A] hover:bg-[#b03d20] text-white text-xs font-medium rounded-xs flex items-center space-x-1 transition-colors cursor-pointer"
                      >
                        <span>{t('search.view_issue') || 'View Community Issue'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {expandedExplainIds.has(issue.id) && (
                      <div className="p-3 bg-[#F7F5EF] border border-[#171717]/15 rounded-xs text-xs space-y-1.5 font-mono">
                        <div className="flex items-center justify-between text-[#171717] font-bold">
                          <span>{t('search.relevance_score') || 'Relevance Score'}: {issue.score}/100</span>
                        </div>
                        <ul className="space-y-1 text-[#57534E] text-[11px]">
                          {issue.scoreBreakdown?.map((factor, i) => (
                            <li key={i} className="flex items-center justify-between">
                              <span>• {factor.label}</span>
                              <span className="font-bold text-[#285943]">+{factor.points}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. RECENT CITIZEN SIGNALS & REPORTS */}
          {searchResults.citizenReports.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#171717]/10 pb-1.5">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-stone-700" />
                  <h3 className="font-serif font-bold text-sm text-[#171717] uppercase tracking-wider">
                    Recent Citizen Reports ({searchResults.citizenReports.length})
                  </h3>
                </div>
              </div>

              <div className="space-y-2">
                {searchResults.citizenReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-3 bg-white border border-[#171717]/15 hover:border-[#171717] hover:shadow-2xs transition-all rounded-xs space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="flex items-center space-x-1 text-xs font-bold text-[#171717]">
                            {getCategoryIcon(report.category)}
                            <span>{report.category}</span>
                          </span>
                          <span className="text-stone-300">·</span>
                          <span className="text-xs text-[#57534E] truncate max-w-xs">{report.location}</span>
                          <span className={`px-1.5 py-0.2 text-[10px] font-medium border rounded-xs ${report.provenanceBadgeColor}`}>
                            {report.provenanceLabel}
                          </span>
                        </div>
                        <p className="text-xs text-[#171717] line-clamp-1">
                          {report.subtitle || report.title}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 text-right shrink-0">
                        {report.statusBadge && (
                          <span className="px-2 py-0.5 bg-stone-100 text-stone-700 border border-stone-300 rounded-xs text-[10px] font-medium">
                            {report.statusBadge}
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-[#57534E]">
                          {report.dateOrTimeline}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#171717]/10 text-xs">
                      <button
                        onClick={(e) => toggleExplain(report.id, e)}
                        className="inline-flex items-center space-x-1 text-xs text-[#57534E] hover:text-[#171717] font-mono cursor-pointer"
                      >
                        <Info className="w-3 h-3 text-[#D65A3A]" />
                        <span>{t('search.why_this_result') || 'Why this result?'}</span>
                        {expandedExplainIds.has(report.id) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      <button
                        onClick={() => handleResultClick(report)}
                        className="text-[#D65A3A] font-medium hover:underline cursor-pointer flex items-center space-x-1 text-xs"
                      >
                        <span>{t('search.view_request') || 'View Request'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {expandedExplainIds.has(report.id) && (
                      <div className="p-2.5 bg-[#F7F5EF] border border-[#171717]/15 rounded-xs text-xs space-y-1 font-mono">
                        <div className="flex items-center justify-between text-[#171717] font-bold">
                          <span>{t('search.relevance_score') || 'Relevance Score'}: {report.score}/100</span>
                        </div>
                        <ul className="space-y-0.5 text-[#57534E] text-[11px]">
                          {report.scoreBreakdown?.map((factor, i) => (
                            <li key={i} className="flex items-center justify-between">
                              <span>• {factor.label}</span>
                              <span className="font-bold text-[#285943]">+{factor.points}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. ACTION QUEUE & SANCTIONED WORKS */}
          {searchResults.actionProjects.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#171717]/10 pb-1.5">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#285943]" />
                  <h3 className="font-serif font-bold text-sm text-[#171717] uppercase tracking-wider">
                    Action Queue & Sanctioned Works ({searchResults.actionProjects.length})
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {searchResults.actionProjects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-3.5 bg-white border border-[#171717]/15 hover:border-[#171717] hover:shadow-xs transition-all rounded-xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[10px] text-[#57534E] uppercase">{proj.category}</span>
                      <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded-xs">
                        {proj.statusBadge || 'Approved'}
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-xs sm:text-sm text-[#171717] line-clamp-1">
                      {proj.title}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] text-[#57534E] pt-1 border-t border-[#171717]/5">
                      <span>{proj.location}</span>
                      {proj.reportCount && (
                        <span className="font-bold text-[#285943]">{proj.reportCount}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-[#171717]/10">
                      <button
                        onClick={(e) => toggleExplain(proj.id, e)}
                        className="inline-flex items-center space-x-1 text-[11px] text-[#57534E] hover:text-[#171717] font-mono cursor-pointer"
                      >
                        <Info className="w-3 h-3 text-[#D65A3A]" />
                        <span>Why?</span>
                        {expandedExplainIds.has(proj.id) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => handleResultClick(proj)}
                        className="text-[#285943] font-medium hover:underline cursor-pointer flex items-center space-x-1 text-xs"
                      >
                        <span>{t('search.open_action_queue') || 'Open in Action Queue'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {expandedExplainIds.has(proj.id) && (
                      <div className="p-2.5 bg-[#F7F5EF] border border-[#171717]/15 rounded-xs text-xs space-y-1 font-mono">
                        <div className="flex items-center justify-between text-[#171717] font-bold">
                          <span>{t('search.relevance_score') || 'Relevance Score'}: {proj.score}/100</span>
                        </div>
                        <ul className="space-y-0.5 text-[#57534E] text-[11px]">
                          {proj.scoreBreakdown?.map((factor, i) => (
                            <li key={i} className="flex items-center justify-between">
                              <span>• {factor.label}</span>
                              <span className="font-bold text-[#285943]">+{factor.points}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. GOVERNMENT BASELINE STATISTICS (DARPG / Official OGD) */}
          {searchResults.governmentBaseline.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#171717]/10 pb-1.5">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-sky-700" />
                  <h3 className="font-serif font-bold text-sm text-[#171717] uppercase tracking-wider">
                    Official Government Baseline Indicators
                  </h3>
                </div>
              </div>

              <div className="space-y-2">
                {searchResults.governmentBaseline.map((base) => (
                  <div
                    key={base.id}
                    className="p-3 bg-sky-50/50 border border-sky-200 rounded-xs space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-bold text-sky-950">
                        {base.title}
                      </h4>
                      <span className="px-2 py-0.5 bg-sky-100 text-sky-800 border border-sky-300 rounded-xs font-mono text-[10px] font-bold">
                        Government Baseline
                      </span>
                    </div>
                    <p className="text-[#57534E] text-[11px]">
                      {base.subtitle}
                    </p>
                    <div className="flex items-center space-x-3 text-[11px] font-medium text-sky-900 pt-1">
                      <span>Disposal Rate: {base.priorityLabel}</span>
                      <span>·</span>
                      <span>Total Grievances: {base.reportCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-3 sm:p-4 border-t-2 border-[#171717] bg-[#F3EFE6] flex items-center justify-between text-xs text-[#57534E] font-mono">
          <div className="flex items-center space-x-3">
            <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-[#171717]/20 rounded-xs">ESC</kbd> to close</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Total matches: {searchResults.totalResultsCount}</span>
          </div>
          <div className="flex items-center space-x-1.5 text-[11px] text-[#285943]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Human-First Civic Intelligence</span>
          </div>
        </div>

      </div>
    </div>
  );
};
