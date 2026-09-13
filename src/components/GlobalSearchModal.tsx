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
  Building2, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Layers, 
  ShieldCheck,
  TrendingUp,
  Clock
} from 'lucide-react';
import { 
  searchCivicPulse, 
  HumanSearchResultItem, 
  HumanSearchResults, 
  getSearchSuggestions,
  CATEGORY_DISPLAY_NAMES,
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
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiSummarizing, setIsAiSummarizing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t, tCategory, tStatus, currentLanguageConfig } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setServerIntent(null);
      setAiSummary(null);
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
      return;
    }

    const timer = setTimeout(async () => {
      setIsAiExtracting(true);
      try {
        const result = await fetchServerSearchIntent(query, districts);
        if (result.isAiExtracted) {
          setServerIntent(result.intent);
        }
      } catch (e) {
        console.warn('Intent extraction failed:', e);
      } finally {
        setIsAiExtracting(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, districts]);

  // Execute human-first search
  const searchResults: HumanSearchResults = useMemo(() => {
    return searchCivicPulse(
      query, 
      { requests, districts, governmentProjects, communityIssues },
      { tCategory, tStatus, intentOverride: serverIntent || undefined }
    );
  }, [query, requests, districts, governmentProjects, communityIssues, tCategory, tStatus, serverIntent]);

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
        console.warn('Summary generation failed:', e);
      } finally {
        setIsAiSummarizing(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [query, searchResults]);

  if (!isOpen) return null;

  const handleApplySuggestion = (sug: string) => {
    setQuery(sug);
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
    const c = category.toLowerCase();
    if (c.includes('water')) return <Droplets className="w-3.5 h-3.5 text-[#285943]" />;
    if (c.includes('road')) return <Route className="w-3.5 h-3.5 text-[#D65A3A]" />;
    if (c.includes('elect')) return <Zap className="w-3.5 h-3.5 text-amber-600" />;
    if (c.includes('health')) return <HeartPulse className="w-3.5 h-3.5 text-rose-600" />;
    return <Layers className="w-3.5 h-3.5 text-stone-600" />;
  };

  const defaultStarterQueries = [
    'Water problem',
    'Roads in Guntur',
    'Electricity complaints',
    'Garbage near schools',
    'High priority issues',
    'CP-2026-004821',
  ];

  return (
    <div 
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 pt-12 sm:pt-20 font-sans text-[#171717] overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-[#F7F5EF] border-2 border-[#171717] w-full max-w-3xl rounded-none shadow-[10px_10px_0px_#171717] overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div className="p-4 sm:p-5 border-b-2 border-[#171717] bg-[#F3EFE6] relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-[#D65A3A]"></span>
              <h2 className="font-serif font-bold text-lg text-[#171717] tracking-tight">
                Search CivicPulse
              </h2>
              <span className="text-[11px] font-mono text-[#57534E] hidden sm:inline">
                Natural Language · Intent Aware
              </span>
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
              placeholder="Search for an issue, place, category or request ID (e.g., 'water problem', 'roads in Guntur', 'CP-2026-004821')..."
              className="w-full pl-11 pr-10 py-3 bg-white border-2 border-[#171717] text-[#171717] text-sm sm:text-base placeholder-[#57534E]/60 focus:outline-none focus:ring-2 focus:ring-[#D65A3A] font-sans shadow-[2px_2px_0px_#171717]"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#57534E] hover:text-[#171717] transition-colors cursor-pointer"
                title="Clear query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Typo Tolerance Suggestion */}
          {searchResults.intent.typoCorrection && (
            <div className="mt-2.5 flex items-center space-x-2 text-xs text-[#57534E] bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>
                Did you mean:{' '}
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

          {/* Smart Suggestions Chips (Grounded in Real Data) */}
          <div className="mt-3 flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[11px] font-mono text-[#57534E] uppercase tracking-wider shrink-0 mr-1">
              {searchResults.suggestionsType === 'POPULAR_OR_RECENT' ? 'Popular & Recent:' : 'Matching Suggestions:'}
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

        {/* Search Results Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* EMPTY STATE / STARTER HINTS */}
          {!query.trim() && (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 bg-stone-200/80 rounded-full flex items-center justify-center mx-auto text-[#57534E]">
                <Search className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="font-serif font-bold text-lg text-[#171717]">
                  Human-First Civic Search
                </h3>
                <p className="text-xs sm:text-sm text-[#57534E] mt-1 leading-relaxed">
                  Search naturally using conversational language. No database codes or request IDs required.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl mx-auto text-left mt-4 pt-2">
                <div 
                  onClick={() => handleApplySuggestion('water supply problems in Guntur')}
                  className="p-3 bg-white border border-[#171717]/15 hover:border-[#171717] hover:shadow-xs transition-all cursor-pointer rounded-xs"
                >
                  <p className="font-medium text-xs text-[#171717]">"water supply problems in Guntur"</p>
                  <p className="text-[11px] text-[#57534E] mt-0.5">Finds community issues, hotspots, and citizen signals</p>
                </div>
                <div 
                  onClick={() => handleApplySuggestion('roads in Vijayawada')}
                  className="p-3 bg-white border border-[#171717]/15 hover:border-[#171717] hover:shadow-xs transition-all cursor-pointer rounded-xs"
                >
                  <p className="font-medium text-xs text-[#171717]">"roads in Vijayawada"</p>
                  <p className="text-[11px] text-[#57534E] mt-0.5">Discovers road conditions and public infrastructure assets</p>
                </div>
                <div 
                  onClick={() => handleApplySuggestion('electricity complaints')}
                  className="p-3 bg-white border border-[#171717]/15 hover:border-[#171717] hover:shadow-xs transition-all cursor-pointer rounded-xs"
                >
                  <p className="font-medium text-xs text-[#171717]">"electricity complaints"</p>
                  <p className="text-[11px] text-[#57534E] mt-0.5">Scans power outages, transformers, and citizen reports</p>
                </div>
                <div 
                  onClick={() => handleApplySuggestion('CP-2026-004821')}
                  className="p-3 bg-white border border-[#171717]/15 hover:border-[#171717] hover:shadow-xs transition-all cursor-pointer rounded-xs"
                >
                  <p className="font-medium text-xs text-[#171717]">"CP-2026-004821" (Exact ID)</p>
                  <p className="text-[11px] text-[#57534E] mt-0.5">Looks up exact citizen request tracking receipts</p>
                </div>
              </div>
            </div>
          )}

          {/* EXACT ID NOT FOUND STATE (Section 10) */}
          {searchResults.exactMatchNotFoundId && !searchResults.exactMatch && (
            <div className="border-2 border-stone-400 bg-stone-50 p-4 sm:p-5 shadow-[4px_4px_0px_#78716c] space-y-2">
              <div className="flex items-center space-x-2 text-stone-800">
                <Search className="w-5 h-5 text-stone-500 shrink-0" />
                <h4 className="font-serif font-bold text-base text-[#171717]">
                  No CivicPulse request found for {searchResults.exactMatchNotFoundId}.
                </h4>
              </div>
              <p className="text-xs text-[#57534E] leading-relaxed">
                We verified all records in the CivicPulse database, but no citizen report or public project matches this exact tracking ID. Verify the code or search using normal language like <span className="font-bold text-[#171717]">"water in Guntur"</span> or <span className="font-bold text-[#171717]">"road damage"</span>.
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

          {/* 1. EXACT ID RESULT (When a user searches an ID like CP-2026-004821) */}
          {searchResults.exactMatch && (
            <div className="border-2 border-[#171717] bg-white p-4 sm:p-5 shadow-[4px_4px_0px_#171717] space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-[#171717]/10 pb-2.5">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 bg-[#285943] text-white text-[11px] font-mono font-bold rounded-xs">
                    EXACT RECORD FOUND
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

              <div className="pt-2">
                <button
                  onClick={() => handleResultClick(searchResults.exactMatch!)}
                  className="w-full sm:w-auto px-4 py-2 bg-[#D65A3A] hover:bg-[#b03d20] text-white font-medium text-xs flex items-center justify-center space-x-2 rounded-xs transition-colors cursor-pointer"
                >
                  <span>{searchResults.exactMatch.actionHint}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* AI GROUNDED INTELLIGENCE BRIEF (Gemini Structured Synthesis) */}
          {(aiSummary || isAiSummarizing) && (
            <div className="border-2 border-[#171717] bg-[#F7F5EF] p-3.5 sm:p-4 shadow-[3px_3px_0px_#171717] space-y-1.5">
              <div className="flex items-center justify-between gap-2 border-b border-[#171717]/10 pb-1.5">
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D65A3A]" />
                  <span className="text-[11px] font-mono font-bold text-[#171717] uppercase tracking-wider">
                    Grounded Intelligence Brief
                  </span>
                </div>
                <span className="px-1.5 py-0.2 bg-stone-200 text-stone-700 text-[10px] font-mono rounded-xs">
                  {serverIntent ? 'Gemini Intent' : 'Grounded Synthesis'}
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

          {/* 2. BEST MATCH RECOMMENDATION (Highlighted Top Card) */}
          {searchResults.bestMatch && !searchResults.exactMatch && (
            <div className="border-2 border-[#285943] bg-emerald-50/50 p-4 sm:p-5 shadow-[4px_4px_0px_#285943] space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-[#285943]/20 pb-2">
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-[#285943]" />
                  <span className="text-xs font-mono font-bold text-[#285943] uppercase tracking-wider">
                    Best Match Recommendation
                  </span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-medium border rounded-xs ${searchResults.bestMatch.provenanceBadgeColor}`}>
                  {searchResults.bestMatch.provenanceLabel}
                </span>
              </div>

              <div>
                <h4 className="font-serif font-bold text-base sm:text-lg text-[#171717]">
                  {searchResults.bestMatch.title}
                </h4>
                {searchResults.bestMatch.subtitle && (
                  <p className="text-xs text-[#57534E] mt-1 leading-relaxed">
                    {searchResults.bestMatch.subtitle}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#57534E]">
                <span className="flex items-center space-x-1 font-medium text-[#171717]">
                  {getCategoryIcon(searchResults.bestMatch.category)}
                  <span>{searchResults.bestMatch.category}</span>
                </span>
                <span>·</span>
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-500" />
                  <span>{searchResults.bestMatch.location}</span>
                </span>
                {searchResults.bestMatch.reportCount && (
                  <>
                    <span>·</span>
                    <span className="font-bold text-[#285943]">
                      {searchResults.bestMatch.reportCount}
                    </span>
                  </>
                )}
                {searchResults.bestMatch.priorityLabel && (
                  <>
                    <span>·</span>
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-medium rounded-xs">
                      {searchResults.bestMatch.priorityLabel}
                    </span>
                  </>
                )}
              </div>

              <div className="pt-1">
                <button
                  onClick={() => handleResultClick(searchResults.bestMatch!)}
                  className="px-4 py-1.5 bg-[#285943] hover:bg-[#1e4433] text-white text-xs font-medium rounded-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <span>{searchResults.bestMatch.actionHint}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* 2B. PRIORITY RECOMMENDATIONS (PriorityEngine) */}
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
                    <span>View All Recommendations</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {searchResults.recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => handleResultClick(rec)}
                    className="p-3.5 bg-white border border-[#171717]/15 hover:border-[#171717] hover:shadow-xs transition-all cursor-pointer rounded-xs flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-[#57534E] mb-1">
                        <span className="flex items-center space-x-1 font-medium text-[#171717]">
                          {getCategoryIcon(rec.category)}
                          <span>{rec.category}</span>
                        </span>
                        {rec.priorityLabel && (
                          <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xs text-[10px] font-bold">
                            {rec.priorityLabel}
                          </span>
                        )}
                      </div>
                      <h4 className="font-serif font-bold text-xs sm:text-sm text-[#171717] line-clamp-2">
                        {rec.title}
                      </h4>
                      {rec.subtitle && (
                        <p className="text-[11px] text-[#57534E] mt-0.5 line-clamp-1">
                          {rec.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#57534E] pt-1 border-t border-[#171717]/5">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span className="truncate max-w-[130px]">{rec.location}</span>
                      </span>
                      {rec.reportCount && (
                        <span className="font-bold text-[#285943]">
                          {rec.reportCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. COMMUNITY ISSUES (Clustered Problems) */}
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
                  <span>View All Issues</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {searchResults.communityIssues.map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => handleResultClick(issue)}
                    className="p-3.5 bg-white border border-[#171717]/15 hover:border-[#171717] hover:shadow-xs transition-all cursor-pointer rounded-xs flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-[#57534E] mb-1">
                        <span className="flex items-center space-x-1 font-medium text-[#171717]">
                          {getCategoryIcon(issue.category)}
                          <span>{issue.category}</span>
                        </span>
                        {issue.priorityLabel && (
                          <span className="px-1.5 py-0.2 bg-amber-50 text-amber-800 border border-amber-200 rounded-xs text-[10px] font-bold">
                            {issue.priorityLabel}
                          </span>
                        )}
                      </div>
                      <h4 className="font-serif font-bold text-xs sm:text-sm text-[#171717] line-clamp-2">
                        {issue.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#57534E] pt-1 border-t border-[#171717]/5">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span className="truncate max-w-[140px]">{issue.location}</span>
                      </span>
                      {issue.reportCount && (
                        <span className="font-bold text-[#285943]">
                          {issue.reportCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. PRIORITY HOTSPOTS & DISTRICTS */}
          {searchResults.priorityHotspots.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#171717]/10 pb-1.5">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-[#285943]" />
                  <h3 className="font-serif font-bold text-sm text-[#171717] uppercase tracking-wider">
                    Priority Hotspots & Districts ({searchResults.priorityHotspots.length})
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {searchResults.priorityHotspots.map((spot) => (
                  <div
                    key={spot.id}
                    onClick={() => handleResultClick(spot)}
                    className="p-3.5 bg-white border border-[#171717]/15 hover:border-[#171717] hover:shadow-xs transition-all cursor-pointer rounded-xs flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#171717]">
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
                    <div className="text-right shrink-0 ml-3">
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold rounded-xs">
                        {spot.priorityLabel || 'Hotspot'}
                      </span>
                      <p className="text-[10px] text-[#57534E] mt-1 font-mono">Open Map →</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. RECENT CITIZEN SIGNALS & REPORTS */}
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
                {searchResults.citizenReports.map((report, idx) => (
                  <div
                    key={`${report.id}-${idx}`}
                    onClick={() => handleResultClick(report)}
                    className="p-3 bg-white border border-[#171717]/15 hover:border-[#171717] hover:shadow-2xs transition-all cursor-pointer rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
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
                ))}
              </div>
            </div>
          )}

          {/* 6. ACTION QUEUE & PUBLIC SANCTIONS */}
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
                    onClick={() => handleResultClick(proj)}
                    className="p-3.5 bg-white border border-[#171717]/15 hover:border-[#171717] hover:shadow-xs transition-all cursor-pointer rounded-xs space-y-1.5"
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. GOVERNMENT BASELINE STATISTICS (DARPG / Official OGD) */}
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
                    className="p-3 bg-sky-50/50 border border-sky-200 rounded-xs space-y-1 text-xs"
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
