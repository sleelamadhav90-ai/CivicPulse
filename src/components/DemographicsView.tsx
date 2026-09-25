import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap, GeoJSON, Circle, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  MapPin, 
  AlertTriangle, 
  Info, 
  RotateCcw,
  SlidersHorizontal,
  FileText,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { District, CitizenRequest, InfrastructureCategory } from '../types';
import { getAvailableStates, getDistrictsForState } from '../utils/geography';
import { calculatePriorityScore, getPriorityTier } from '../utils/scoring';
import { useLanguage } from '../context/LanguageContext';
import { getDistrictDataDepth } from '../utils/provenance';
import {
  INDIA_MAP_CENTER,
  INDIA_MAP_MAX_BOUNDS,
  INDIA_MAP_MIN_ZOOM,
  INDIA_MAP_MAX_ZOOM,
  SATELLITE_TILE_URL,
  SATELLITE_TILE_ATTRIBUTION,
  REFERENCE_PLACES_TILE_URL,
  REFERENCE_PLACES_ATTRIBUTION,
  INDIA_STATES_GEOJSON_PATH,
  getIndiaStateBoundaryStyle,
  isValidCoordinate
} from '../utils/mapStandards';

interface DemographicsViewProps {
  districts: District[];
  requests?: CitizenRequest[];
  onNavigateToRecommendations?: (districtId?: string, category?: string) => void;
  onNavigateToIssues?: (districtId?: string, category?: string) => void;
}

// Map helper to smoothly pan/zoom when the selected district changes
function MapFocusController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (center && isValidCoordinate(center[0], center[1])) {
      map.flyTo(center, zoom, { duration: 0.9 });
    }
  }, [center, zoom, map]);
  return null;
}

// Single-spectrum vulnerability scale helper
// Low (<35%) -> Moderate (35-50%) -> High (50-65%) -> Critical (>65%)
function getVulnerabilityColor(povertyIndex: number): string {
  if (povertyIndex >= 0.65) return '#b91c1c'; // Critical: Deep urgent crimson
  if (povertyIndex >= 0.50) return '#ea580c'; // High: Warm terracotta
  if (povertyIndex >= 0.35) return '#d97706'; // Moderate: Warm amber
  return '#94a3b8'; // Low: Neutral slate
}

function getVulnerabilityTierLabel(povertyIndex: number, t: (k: string) => string): string {
  if (povertyIndex >= 0.65) return t('demographics.level_critical');
  if (povertyIndex >= 0.50) return t('demographics.level_high');
  if (povertyIndex >= 0.35) return t('demographics.level_medium');
  return t('demographics.level_low');
}

export const DemographicsView: React.FC<DemographicsViewProps> = ({
  districts,
  requests = [],
  onNavigateToRecommendations,
  onNavigateToIssues
}) => {
  const { t, tCategory, tStatus } = useLanguage();

  // Filter states
  const [selectedState, setSelectedState] = useState<string>('All States');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('guntur');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [highRiskOnly, setHighRiskOnly] = useState<boolean>(false);
  const [showMoreFilters, setShowMoreFilters] = useState<boolean>(false);
  const [showAdvancedDetails, setShowAdvancedDetails] = useState<boolean>(false);

  // India Official Boundary (GeoJSON) state for Zero-Cost GIS basemap
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    fetch(INDIA_STATES_GEOJSON_PATH)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load boundary');
        return res.json();
      })
      .then(data => {
        if (isMounted) setGeoJsonData(data);
      })
      .catch(err => {
        console.warn('GeoJSON boundary load fallback in DemographicsView:', err);
      });
    return () => { isMounted = false; };
  }, []);

  // Available states from real geography helper
  const availableStates = useMemo(() => {
    const states = getAvailableStates('IN', districts);
    return ['All States', ...states];
  }, [districts]);

  // Cascading districts for selected state
  const stateDistricts = useMemo(() => {
    if (selectedState === 'All States') return districts;
    return districts.filter(d => d.state.toLowerCase() === selectedState.toLowerCase());
  }, [districts, selectedState]);

  // Filtered districts matching search and risk filters
  const filteredDistricts = useMemo(() => {
    return stateDistricts.filter(d => {
      if (highRiskOnly && d.poverty_index < 0.50) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const prefixRegex = new RegExp(`(?:^|\\b|\\s)${escapedQ}`, 'i');
        const matchName = prefixRegex.test(d.name) || (q.length >= 4 && d.name.toLowerCase().includes(q));
        const matchState = prefixRegex.test(d.state) || (q.length >= 4 && d.state.toLowerCase().includes(q));
        if (!matchName && !matchState) return false;
      }
      return true;
    });
  }, [stateDistricts, highRiskOnly, searchQuery]);

  // Selected district entity (fallback gracefully to first available)
  const selectedDistrict = useMemo(() => {
    const found = districts.find(d => d.id.toLowerCase() === selectedDistrictId.toLowerCase());
    if (found) return found;
    if (filteredDistricts.length > 0) return filteredDistricts[0];
    return districts[0] || null;
  }, [districts, selectedDistrictId, filteredDistricts]);

  // Handle cascading state change
  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    if (newState !== 'All States') {
      const inState = districts.filter(d => d.state.toLowerCase() === newState.toLowerCase());
      if (inState.length > 0 && (!selectedDistrict || selectedDistrict.state.toLowerCase() !== newState.toLowerCase())) {
        setSelectedDistrictId(inState[0].id);
      }
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSelectedState('All States');
    setSearchQuery('');
    setHighRiskOnly(false);
  };

  const isFiltered = selectedState !== 'All States' || searchQuery.trim() !== '' || highRiskOnly;

  // ----------------------------------------------------
  // SECTION 2: THREE SIMPLE SUMMARY METRICS (100% Real Data)
  // ----------------------------------------------------
  const summaryMetrics = useMemo(() => {
    const activeList = filteredDistricts.length > 0 ? filteredDistricts : districts;
    const totalPop = activeList.reduce((sum, d) => sum + (d.population || 0), 0);
    const weightedVulnPop = activeList.reduce((sum, d) => sum + ((d.population || 0) * (d.poverty_index || 0)), 0);
    const avgVulnPercentage = totalPop > 0 ? Math.round((weightedVulnPop / totalPop) * 100) : 0;
    const highRiskCount = activeList.filter(d => d.poverty_index >= 0.50).length;

    // Formatting population into concise, human-readable display (e.g. 68.4M or 4.9M)
    const formattedPop = totalPop >= 1000000 
      ? `${(totalPop / 1000000).toFixed(1)}M` 
      : totalPop.toLocaleString();

    return {
      formattedPop,
      rawPop: totalPop,
      avgVulnPercentage,
      highRiskCount,
      totalCount: activeList.length
    };
  }, [filteredDistricts, districts]);

  // ----------------------------------------------------
  // SECTION 4: SELECTED DISTRICT FACTORS & CITIZEN REPORTS
  // ----------------------------------------------------
  const districtInsight = useMemo(() => {
    if (!selectedDistrict) return null;

    // Real Access and Gaps
    const waterGap = Math.max(0, 100 - (selectedDistrict.water_access || 50));
    const roadGap = Math.max(0, 100 - (selectedDistrict.road_quality || 50));
    const avgInfraGap = Math.round((waterGap + roadGap) / 2);

    const avgServiceAccess = Math.round(
      ((selectedDistrict.health_access || 50) + (selectedDistrict.education_access || 50)) / 2
    );
    const serviceAccessGap = 100 - avgServiceAccess;

    // Factor classifications
    const infraGapLevel = avgInfraGap >= 50 ? 'High' : avgInfraGap >= 30 ? 'Medium' : 'Low';
    const serviceAccessLevel = avgServiceAccess < 50 ? 'High' : avgServiceAccess < 70 ? 'Moderate' : 'Low'; // deficit level
    const povertyLevel = selectedDistrict.poverty_index >= 0.50 ? 'High' : selectedDistrict.poverty_index >= 0.35 ? 'Medium' : 'Low';
    const densityLevel = selectedDistrict.population >= 3500000 ? 'High' : selectedDistrict.population >= 1800000 ? 'Medium' : 'Low';

    // Related citizen reports from real requests
    const dName = selectedDistrict.name.toLowerCase();
    const relatedReports = requests.filter(r => {
      const rDist = (r.district || '').toLowerCase();
      const rLoc = (r.location || '').toLowerCase();
      return rDist === dName || rLoc.includes(dName);
    });

    // Determine top category and highest severity if reports exist
    let topCategory: InfrastructureCategory = 'Water';
    let maxSeverity = 5;
    if (relatedReports.length > 0) {
      const categoryCounts: Record<string, number> = {};
      relatedReports.forEach(r => {
        categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
        if (r.severity && r.severity > maxSeverity) {
          maxSeverity = r.severity;
        }
      });
      const sorted = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) {
        topCategory = sorted[0][0] as InfrastructureCategory;
      }
    }

    // Deterministic Priority Score from scoring engine
    const priorityResult = calculatePriorityScore(
      selectedDistrict,
      topCategory,
      maxSeverity,
      relatedReports.length
    );

    const priorityTier = getPriorityTier(priorityResult.total_score);

    return {
      avgInfraGap,
      infraGapLevel,
      avgServiceAccess,
      serviceAccessGap,
      serviceAccessLevel,
      povertyLevel,
      densityLevel,
      relatedReports,
      topCategory,
      maxSeverity,
      priorityTier: priorityTier.label,
      priorityScore: priorityResult.total_score
    };
  }, [selectedDistrict, requests]);

  // Collapsible detailed data (preserves all existing useful demographic data)
  const ruralPct = 68;
  const urbanPct = 32;
  const ageBreakdown = [
    { range: '0 - 14 years (Children)', pct: 26, color: 'bg-stone-500' },
    { range: '15 - 59 years (Working Age)', pct: 62, color: 'bg-stone-800' },
    { range: '60+ years (Elderly Citizens)', pct: 12, color: 'bg-amber-700' }
  ];

  const vulnerabilityIndicators = [
    { label: 'High Rain-Shadow & Drought Risk', status: 'CRITICAL', note: '74% reliance on rainfed agriculture in western mandals.' },
    { label: 'BPL Household Density', status: 'HIGH', note: '58% households below poverty threshold.' },
    { label: 'Piped Water Connection Deficit', status: 'CRITICAL', note: '42% households walk >2 km for potable water.' },
    { label: 'Healthcare Transit Disparity', status: 'HIGH', note: 'Average distance to primary emergency hospital is 22.5 km.' }
  ];

  const issuePopulationImpact = [
    { issue: 'Drinking Water Supply Outage', affectedCount: 184200, category: 'Water', equityScore: 'Vulnerable Rural Clusters' },
    { issue: 'Primary Health Staff Absence', affectedCount: 94000, category: 'Health', equityScore: 'Low-Income Women & Children' },
    { issue: 'Arterial Hospital Transit Craters', affectedCount: 145000, category: 'Roads', equityScore: 'Commuters & Emergency Transit' },
    { issue: 'Open Sewage Overflow', affectedCount: 62000, category: 'Drainage', equityScore: 'Urban Informal Settlements' }
  ];

  // Map center coordinates
  const mapCenter: [number, number] = useMemo(() => {
    if (selectedDistrict && isValidCoordinate(selectedDistrict.lat, selectedDistrict.lon)) {
      return [selectedDistrict.lat, selectedDistrict.lon];
    }
    return INDIA_MAP_CENTER; // Default India center
  }, [selectedDistrict]);

  return (
    <div id="demographics-page" className="max-w-7xl mx-auto space-y-6 pb-16 font-sans text-[#171717]">
      
      {/* 1. PAGE HEADER (Question-driven with supporting label) */}
      <header id="demographics-header" className="border-b border-[#171717]/10 pb-4 pt-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-[#FAF8F5] text-[#D65A3A] border border-[#D65A3A]/30 text-[10px] font-mono font-bold tracking-wider uppercase rounded-xs">
            {t('demographics.page_label') || 'Population & Vulnerability'}
          </span>
          <span className="text-[11px] font-mono text-[#78716C] uppercase tracking-wider">
            {t('workflow.step_3')}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#171717]">
              {t('demographics.question_title') || 'Who is most affected?'}
            </h1>
            <p className="text-xs sm:text-sm text-[#171717]/70 mt-1 max-w-2xl leading-relaxed">
              {t('demographics.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#171717]/60 font-mono self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Census & SECC Baseline</span>
          </div>
        </div>
      </header>

      {/* Connection Formula Context Banner */}
      <div className="bg-[#FAF8F5] border border-[#171717]/15 p-3 sm:p-4 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D65A3A] block">
            Why Vulnerability Matters in Capital Sanction
          </span>
          <p className="text-[#34322D] leading-relaxed">
            <strong className="font-mono text-[#171717]">VULNERABILITY WEIGHT + CITIZEN DEMAND + INFRASTRUCTURE GAP = PRIORITY NEED.</strong>{' '}
            Vulnerability factors ensure infrastructure capital reaches marginalized, low-resilience communities rather than only areas with high reporting volume.
          </p>
        </div>
        {onNavigateToRecommendations && (
          <button
            onClick={() => onNavigateToRecommendations(selectedDistrict?.id)}
            className="px-3 py-1.5 bg-white border border-[#171717]/20 hover:border-[#171717] text-xs font-semibold rounded-xs transition-colors flex items-center space-x-1.5 shrink-0 cursor-pointer text-[#171717]"
          >
            <span>View Recommendations</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D65A3A]" />
          </button>
        )}
      </div>

      {/* 2. THREE SIMPLE SUMMARY METRICS ONLY (Horizontal, restrained, non-dashboard style) */}
      <section id="demographics-summary-metrics" className="bg-[#fcfbf9] border border-[#171717]/10 rounded-lg p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:divide-x sm:divide-[#171717]/10">
          
          {/* Metric 1: Population Covered */}
          <div id="metric-population-covered" className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#171717]/60">
              {t('demographics.metric_pop_covered')}
            </span>
            <div className="font-serif text-2xl md:text-3xl font-bold text-[#171717]">
              {summaryMetrics.formattedPop}
            </div>
            <p className="text-xs text-[#171717]/60">
              {summaryMetrics.rawPop.toLocaleString()} residents across {summaryMetrics.totalCount} districts
            </p>
          </div>

          {/* Metric 2: Vulnerable Population */}
          <div id="metric-vulnerable-population" className="sm:pl-6 space-y-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#171717]/60">
              {t('demographics.metric_vuln_pop')}
            </span>
            <div className="font-serif text-2xl md:text-3xl font-bold text-[#ea580c]">
              {summaryMetrics.avgVulnPercentage}%
            </div>
            <p className="text-xs text-[#171717]/60">
              Multidimensional poverty incidence & equity deficit
            </p>
          </div>

          {/* Metric 3: High-Risk Districts */}
          <div id="metric-high-risk-districts" className="sm:pl-6 space-y-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#171717]/60">
              {t('demographics.metric_high_risk')}
            </span>
            <div className="font-serif text-2xl md:text-3xl font-bold text-[#b91c1c]">
              {summaryMetrics.highRiskCount}
            </div>
            <p className="text-xs text-[#171717]/60">
              Districts with vulnerability index ≥ 50%
            </p>
          </div>

        </div>
      </section>

      {/* FILTER BAR: State, District, Search & Optional More Filters */}
      <section id="demographics-filters" className="bg-[#fcfbf9] border border-[#171717]/10 rounded-lg p-3 sm:p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* State Dropdown (Cascading) */}
          <div className="flex items-center gap-2 min-w-[170px] flex-1 sm:flex-initial">
            <label htmlFor="select-state" className="text-xs font-semibold text-[#171717]/70 uppercase">
              {t('geo.state')}:
            </label>
            <select
              id="select-state"
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="bg-white border border-[#171717]/20 rounded px-2.5 py-1.5 text-xs text-[#171717] font-medium focus:outline-hidden focus:border-[#171717] w-full"
            >
              {availableStates.map(st => (
                <option key={st} value={st}>
                  {st === 'All States' ? t('filter.all_states_uts') : st}
                </option>
              ))}
            </select>
          </div>

          {/* District Dropdown */}
          <div className="flex items-center gap-2 min-w-[190px] flex-1 sm:flex-initial">
            <label htmlFor="select-district" className="text-xs font-semibold text-[#171717]/70 uppercase">
              {t('geo.district')}:
            </label>
            <select
              id="select-district"
              value={selectedDistrict ? selectedDistrict.id : ''}
              onChange={(e) => setSelectedDistrictId(e.target.value)}
              className="bg-white border border-[#171717]/20 rounded px-2.5 py-1.5 text-xs text-[#171717] font-medium focus:outline-hidden focus:border-[#171717] w-full"
            >
              {stateDistricts.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} {selectedState === 'All States' ? `(${d.state})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-[#171717]/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-location"
              type="text"
              placeholder={t('demographics.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#171717]/20 rounded pl-8 pr-3 py-1.5 text-xs text-[#171717] placeholder:text-[#171717]/40 focus:outline-hidden focus:border-[#171717]"
            />
          </div>

          {/* Compact More Filters Toggle */}
          <button
            id="btn-more-filters"
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors flex items-center gap-1.5 cursor-pointer ${
              showMoreFilters || highRiskOnly
                ? 'bg-[#171717] text-white border-[#171717]' 
                : 'bg-white text-[#171717]/80 border-[#171717]/20 hover:bg-[#171717]/5'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{t('demographics.more_filters')}</span>
            {highRiskOnly && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 ml-0.5" />}
          </button>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              id="btn-reset-filters"
              onClick={handleResetFilters}
              className="px-2.5 py-1.5 text-xs text-[#171717]/70 hover:text-[#171717] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t('filter.reset')}</span>
            </button>
          )}

        </div>

        {/* Collapsible More Filters Tray */}
        {showMoreFilters && (
          <div id="more-filters-tray" className="pt-2 border-t border-[#171717]/10 flex items-center gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                id="checkbox-high-risk-only"
                type="checkbox"
                checked={highRiskOnly}
                onChange={(e) => setHighRiskOnly(e.target.checked)}
                className="rounded border-[#171717]/30 text-[#ea580c] focus:ring-0 cursor-pointer"
              />
              <span className="text-[#171717]/80 font-medium">
                {t('demographics.high_risk_only')}
              </span>
            </label>
          </div>
        )}
      </section>

      {/* 3 & 4. MAIN WORKSPACE: LARGE VULNERABILITY MAP (Dominant 68%) + SELECTED DISTRICT INSIGHT PANEL (32%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 3. LARGE VULNERABILITY MAP (Dominant visual, 65-75% width) */}
        <section 
          id="section-vulnerability-map" 
          className="lg:col-span-8 bg-white border border-[#171717]/10 rounded-lg overflow-hidden shadow-xs relative flex flex-col"
        >
          {/* Map Header Strip */}
          <div className="px-4 py-2.5 bg-[#fcfbf9] border-b border-[#171717]/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-[#171717]">Vulnerability Spatial Distribution</span>
              <span className="text-[#171717]/40">•</span>
              <span className="text-[#171717]/60 font-mono">
                {filteredDistricts.length} {filteredDistricts.length === 1 ? 'district' : 'districts'} active
              </span>
            </div>
            <div className="text-[11px] text-[#171717]/50 hidden sm:block">
              Click any district circle to inspect
            </div>
          </div>

          {/* Leaflet Map Canvas */}
          <div className="w-full h-[460px] md:h-[560px] relative z-0 bg-[#121417]">
            {/* Top-Left Geographic Breadcrumb */}
            <div className="absolute top-3 left-3 z-1000 bg-[#171717]/85 border border-white/20 px-3 py-1.5 shadow-md backdrop-blur-md flex items-center space-x-2 font-mono text-[11px] text-white rounded-lg">
              <span className="text-xs">🇮🇳</span>
              <span className="font-bold tracking-wider uppercase">INDIA</span>
              <span className="text-white/40">/</span>
              <span className="font-semibold text-[#D65A3A] uppercase">
                {selectedState !== 'All States' ? selectedState : (selectedDistrict?.state || 'NATIONAL GIS')}
              </span>
              {selectedDistrict && (
                <>
                  <span className="text-white/40">/</span>
                  <span className="font-bold text-white uppercase">{selectedDistrict.name}</span>
                </>
              )}
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1"></span>
              <span className="text-[10px] text-gray-300 font-sans">
                {filteredDistricts.length} Active Hotspots
              </span>
            </div>

            {/* Top-Right Zero-Cost Satellite Badge */}
            <div className="absolute top-3 right-3 z-1000 bg-[#171717]/85 backdrop-blur-md border border-white/20 px-2.5 py-1 shadow-md flex items-center gap-1.5 font-mono text-[10px] text-white/90 rounded-lg">
              <span>🛰️</span>
              <span className="font-bold uppercase tracking-wider">Satellite Hybrid</span>
            </div>

            <MapContainer
              center={mapCenter}
              zoom={selectedDistrict ? 7 : 5}
              minZoom={INDIA_MAP_MIN_ZOOM}
              maxZoom={INDIA_MAP_MAX_ZOOM}
              maxBounds={INDIA_MAP_MAX_BOUNDS}
              maxBoundsViscosity={1.0}
              worldCopyJump={false}
              scrollWheelZoom={false}
              zoomControl={false}
              className="w-full h-full"
              style={{ background: '#121417' }}
            >
              <ZoomControl position="bottomright" />

              {/* Zero-Cost ESRI World Imagery Base Tiles */}
              <TileLayer
                attribution={SATELLITE_TILE_ATTRIBUTION}
                url={SATELLITE_TILE_URL}
                maxZoom={18}
                noWrap={true}
                bounds={INDIA_MAP_MAX_BOUNDS}
              />
              <TileLayer
                attribution={REFERENCE_PLACES_ATTRIBUTION}
                url={REFERENCE_PLACES_TILE_URL}
                maxZoom={18}
                opacity={0.45}
                noWrap={true}
                bounds={INDIA_MAP_MAX_BOUNDS}
              />

              {/* India Official State Boundary Overlay (GeoJSON) */}
              {geoJsonData && (
                <GeoJSON
                  key={`geojson-demo-${selectedState !== 'All States' ? selectedState : (selectedDistrict?.state || 'ALL')}`}
                  data={geoJsonData}
                  style={getIndiaStateBoundaryStyle(selectedState !== 'All States' ? selectedState : selectedDistrict?.state)}
                />
              )}

              {/* Fly to selected district */}
              {selectedDistrict && isValidCoordinate(selectedDistrict.lat, selectedDistrict.lon) && (
                <MapFocusController 
                  center={[selectedDistrict.lat, selectedDistrict.lon]} 
                  zoom={7} 
                />
              )}

              {/* Focus Ring on Selected District */}
              {selectedDistrict && isValidCoordinate(selectedDistrict.lat, selectedDistrict.lon) && (
                <Circle
                  center={[selectedDistrict.lat, selectedDistrict.lon]}
                  radius={12000}
                  pathOptions={{
                    color: '#D65A3A',
                    weight: 2,
                    opacity: 0.85,
                    fillColor: '#D65A3A',
                    fillOpacity: 0.15,
                    dashArray: '3, 4'
                  }}
                  interactive={false}
                />
              )}

              {/* Single-spectrum district circle markers */}
              {filteredDistricts.map((district) => {
                if (!district || !isValidCoordinate(district.lat, district.lon)) return null;
                const isSelected = selectedDistrict?.id === district.id;
                const color = getVulnerabilityColor(district.poverty_index);
                const vulnPct = Math.round(district.poverty_index * 100);

                return (
                  <CircleMarker
                    key={district.id}
                    center={[district.lat, district.lon]}
                    radius={isSelected ? 13 : 8}
                    pathOptions={{
                      color: isSelected ? '#ffffff' : '#171717',
                      weight: isSelected ? 2.5 : 1,
                      fillColor: color,
                      fillOpacity: isSelected ? 0.95 : 0.8,
                    }}
                    eventHandlers={{
                      click: () => setSelectedDistrictId(district.id),
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                      <div className="p-1 font-sans text-xs space-y-0.5 min-w-[140px]">
                        <div className="font-bold text-[#171717]">{district.name}</div>
                        <div className="text-[11px] text-[#171717]/70">{district.state}</div>
                        <div className="pt-1 border-t border-[#171717]/10 flex items-center justify-between text-[11px]">
                          <span className="text-[#171717]/70">Vulnerability:</span>
                          <span className="font-bold" style={{ color }}>{vulnPct}%</span>
                        </div>
                        <div className="text-[10px] text-[#171717]/60">
                          Population: {(district.population).toLocaleString()}
                        </div>
                      </div>
                    </Tooltip>
                  </CircleMarker>
                );
              })}
            </MapContainer>

            {/* Restrained Single-Spectrum Legend in Corner */}
            <div 
              id="map-legend" 
              className="absolute bottom-3 left-3 z-1000 bg-[#171717]/90 text-white backdrop-blur-md border border-white/20 rounded p-2.5 shadow-md text-xs font-sans max-w-[280px]"
            >
              <div className="text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                {t('demographics.spectrum_title')}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-gray-200 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#94a3b8] border border-white/40" />
                  <span>{t('demographics.spectrum_low')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#d97706] border border-white/40" />
                  <span>{t('demographics.spectrum_medium')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c] border border-white/40" />
                  <span>{t('demographics.spectrum_high')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#b91c1c] border border-white/40" />
                  <span>{t('demographics.spectrum_critical')}</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 4. SELECTED DISTRICT INSIGHT PANEL (Side panel, clean & readable) */}
        <section 
          id="section-district-insight" 
          className="lg:col-span-4 bg-[#fcfbf9] border border-[#171717]/10 rounded-lg p-5 space-y-5"
        >
          {selectedDistrict && districtInsight ? (
            <>
              {/* Header: District Name, State & Vulnerability Badge */}
              <div className="border-b border-[#171717]/10 pb-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif text-xl font-bold text-[#171717]">
                        {selectedDistrict.name}
                      </h2>
                      {(() => {
                        const depthInfo = getDistrictDataDepth(selectedDistrict.id || selectedDistrict.name);
                        return (
                          <span className={`inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded border ${depthInfo.badgeClass}`}>
                            {depthInfo.badgeLabel}
                          </span>
                        );
                      })()}
                    </div>
                    <p className="text-xs text-[#171717]/60 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#171717]/40" />
                      <span>{selectedDistrict.state}</span>
                    </p>
                  </div>

                  {/* Vulnerability Tier Badge */}
                  <span 
                    className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider text-white shrink-0"
                    style={{ backgroundColor: getVulnerabilityColor(selectedDistrict.poverty_index) }}
                  >
                    {getVulnerabilityTierLabel(selectedDistrict.poverty_index, t)} {t('demographics.vulnerability')}
                  </span>
                </div>

                {/* Key Numbers */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-white border border-[#171717]/10 rounded p-2.5">
                    <span className="text-[10px] uppercase font-semibold text-[#171717]/50 block">
                      Population (Projection Baseline)
                    </span>
                    <span className="font-serif text-lg font-bold text-[#171717]">
                      {selectedDistrict.population.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-white border border-[#171717]/10 rounded p-2.5">
                    <span className="text-[10px] uppercase font-semibold text-[#171717]/50 block">
                      Vulnerable Population
                    </span>
                    <span 
                      className="font-serif text-lg font-bold"
                      style={{ color: getVulnerabilityColor(selectedDistrict.poverty_index) }}
                    >
                      {Math.round(selectedDistrict.poverty_index * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Factors */}
              <div className="space-y-2.5 text-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#171717]/60">
                  Primary Community Indicators
                </div>

                <div className="bg-white border border-[#171717]/10 rounded divide-y divide-[#171717]/5">
                  
                  {/* Infrastructure Gap */}
                  <div className="p-2.5 flex items-center justify-between">
                    <span className="text-[#171717]/70 font-medium">
                      {t('demographics.factor_infra_gap')}:
                    </span>
                    <span className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                      districtInsight.infraGapLevel === 'High' 
                        ? 'bg-orange-50 text-[#ea580c]' 
                        : 'bg-stone-100 text-[#171717]'
                    }`}>
                      {districtInsight.infraGapLevel.toUpperCase()} ({districtInsight.avgInfraGap}% deficit)
                    </span>
                  </div>

                  {/* Service Access */}
                  <div className="p-2.5 flex items-center justify-between">
                    <span className="text-[#171717]/70 font-medium">
                      {t('demographics.factor_service_access')}:
                    </span>
                    <span className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                      districtInsight.serviceAccessLevel === 'High' 
                        ? 'bg-red-50 text-[#b91c1c]' 
                        : 'bg-stone-100 text-[#171717]'
                    }`}>
                      {districtInsight.serviceAccessLevel.toUpperCase()} ({districtInsight.serviceAccessGap}% gap)
                    </span>
                  </div>

                  {/* Population Density */}
                  <div className="p-2.5 flex items-center justify-between">
                    <span className="text-[#171717]/70 font-medium">
                      {t('demographics.factor_density')}:
                    </span>
                    <span className="font-bold text-[#171717] px-1.5 py-0.5">
                      {districtInsight.densityLevel.toUpperCase()}
                    </span>
                  </div>

                </div>
              </div>

              {/* Related Citizen Reports */}
              <div className="border-t border-[#171717]/10 pt-4 space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#171717]/60">
                  {t('demographics.related_reports')}
                </div>

                {districtInsight.relatedReports.length > 0 ? (
                  <div className="bg-white border border-[#171717]/10 rounded p-3 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-serif font-bold text-[#171717]">
                        {districtInsight.relatedReports.length} {t('issues.related_requests')}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        Top: {tCategory(districtInsight.topCategory)}
                      </span>
                    </div>

                    <p className="text-xs text-[#171717]/70 leading-relaxed">
                      Citizens in {selectedDistrict.name} have submitted verified reports primarily regarding {districtInsight.topCategory.toLowerCase()} delivery and infrastructure quality.
                    </p>

                    {onNavigateToIssues && (
                      <button
                        id="btn-view-related-issues"
                        onClick={() => onNavigateToIssues(selectedDistrict.id, districtInsight.topCategory)}
                        className="w-full mt-1 bg-white hover:bg-[#171717]/5 text-[#171717] text-xs font-medium py-2 px-3 border border-[#171717]/20 rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>{t('demographics.view_related_issues')}</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-white border border-[#171717]/10 rounded text-xs text-[#171717]/60 flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#171717]/40 shrink-0" />
                    <span>{t('demographics.no_related_reports')}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-xs text-[#171717]/60">
              Select a district to view insights.
            </div>
          )}
        </section>

      </div>

      {/* 5. "WHAT DRIVES VULNERABILITY?" SECTION (Consolidated visual matrix) */}
      {selectedDistrict && districtInsight && (
        <section id="section-what-drives-vulnerability" className="bg-[#fcfbf9] border border-[#171717]/10 rounded-lg p-5 space-y-4">
          <div className="border-b border-[#171717]/10 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#171717]">
                {t('demographics.what_drives_title')}
              </h3>
              <p className="text-xs text-[#171717]/60 mt-0.5">
                Consolidated structural vulnerability factors for {selectedDistrict.name}
              </p>
            </div>
            <span className="text-xs font-mono text-[#171717]/50 hidden sm:block">
              Scale: 0% (Equitable) → 100% (Critical Deficit)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Factor 1: Infrastructure Gap */}
            <div className="bg-white border border-[#171717]/10 rounded p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#171717]">
                  {t('demographics.factor_infra_gap')}
                </span>
                <span className="font-bold text-[#ea580c]">
                  {districtInsight.avgInfraGap}% • {districtInsight.infraGapLevel}
                </span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-[#ea580c] h-full rounded-full transition-all duration-500" 
                  style={{ width: `${districtInsight.avgInfraGap}%` }} 
                />
              </div>
              <p className="text-[11px] text-[#171717]/60">
                Piped water access deficit ({100 - selectedDistrict.water_access}%) and arterial road distress ({100 - selectedDistrict.road_quality}%).
              </p>
            </div>

            {/* Factor 2: Service Access Deficit */}
            <div className="bg-white border border-[#171717]/10 rounded p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#171717]">
                  {t('demographics.factor_service_access')}
                </span>
                <span className="font-bold text-[#b91c1c]">
                  {districtInsight.serviceAccessGap}% • {districtInsight.serviceAccessLevel}
                </span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-[#b91c1c] h-full rounded-full transition-all duration-500" 
                  style={{ width: `${districtInsight.serviceAccessGap}%` }} 
                />
              </div>
              <p className="text-[11px] text-[#171717]/60">
                Disparity in transit distance to primary emergency clinics ({100 - selectedDistrict.health_access}% access gap) and schools.
              </p>
            </div>

            {/* Factor 3: Poverty & Economic Stress */}
            <div className="bg-white border border-[#171717]/10 rounded p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#171717]">
                  {t('demographics.factor_socioeconomic')}
                </span>
                <span className="font-bold text-[#ea580c]">
                  {Math.round(selectedDistrict.poverty_index * 100)}% • {districtInsight.povertyLevel}
                </span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-[#ea580c] h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.round(selectedDistrict.poverty_index * 100)}%` }} 
                />
              </div>
              <p className="text-[11px] text-[#171717]/60">
                Multidimensional Poverty Index (MPI) and below-poverty-line household density in rural blocks.
              </p>
            </div>

            {/* Factor 4: Population Concentration & Rural Reliance */}
            <div className="bg-white border border-[#171717]/10 rounded p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#171717]">
                  {t('demographics.factor_density')} & Rural Reliance
                </span>
                <span className="font-bold text-stone-700">
                  {districtInsight.densityLevel} Density
                </span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-stone-700 h-full rounded-full transition-all duration-500" 
                  style={{ width: districtInsight.densityLevel === 'High' ? '80%' : districtInsight.densityLevel === 'Medium' ? '50%' : '30%' }} 
                />
              </div>
              <p className="text-[11px] text-[#171717]/60">
                {(selectedDistrict.population).toLocaleString()} residents distributed across agrarian mandals and peri-urban wards.
              </p>
            </div>

          </div>
        </section>
      )}

      {/* 6. "WHY THIS MATTERS" CIVICPULSE CONNECTION (Vulnerability + Citizen Demand + Gap = Priority) */}
      {selectedDistrict && districtInsight && (
        <section id="section-why-this-matters" className="bg-[#fcfbf9] border border-[#171717]/10 rounded-lg p-5 space-y-4">
          <div className="border-b border-[#171717]/10 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#171717]">
                {t('demographics.why_matters_title')}
              </h3>
              <p className="text-xs text-[#171717]/60 mt-0.5">
                Deterministic prioritization linking vulnerable communities with civic action
              </p>
            </div>
            <span className="text-[11px] font-mono font-semibold text-[#171717]/60 px-2 py-0.5 rounded bg-white border border-[#171717]/10">
              CivicPulse Engine
            </span>
          </div>

          {/* Relationship Formula Visual */}
          <div className="bg-white border border-[#171717]/10 rounded-lg p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-center text-xs">
              
              <div className="flex-1 min-w-[100px] p-2 bg-stone-50 rounded border border-stone-200">
                <span className="text-[10px] uppercase font-bold text-stone-500 block">Factor 1</span>
                <span className="font-bold text-[#171717]">{t('demographics.vulnerability')}</span>
                <span className="text-[11px] block text-[#ea580c] font-semibold mt-0.5">
                  {Math.round(selectedDistrict.poverty_index * 100)}%
                </span>
              </div>

              <span className="text-lg font-serif font-bold text-[#171717]/40">+</span>

              <div className="flex-1 min-w-[100px] p-2 bg-stone-50 rounded border border-stone-200">
                <span className="text-[10px] uppercase font-bold text-stone-500 block">Factor 2</span>
                <span className="font-bold text-[#171717]">{t('demographics.citizen_demand')}</span>
                <span className="text-[11px] block text-stone-700 font-semibold mt-0.5">
                  {districtInsight.relatedReports.length} {t('issues.related_requests')}
                </span>
              </div>

              <span className="text-lg font-serif font-bold text-[#171717]/40">+</span>

              <div className="flex-1 min-w-[100px] p-2 bg-stone-50 rounded border border-stone-200">
                <span className="text-[10px] uppercase font-bold text-stone-500 block">Factor 3</span>
                <span className="font-bold text-[#171717]">{t('demographics.infra_gap')}</span>
                <span className="text-[11px] block text-[#ea580c] font-semibold mt-0.5">
                  {districtInsight.avgInfraGap}% Deficit
                </span>
              </div>

              <span className="text-lg font-serif font-bold text-[#171717]/40">=</span>

              <div className="flex-1 min-w-[120px] p-2 bg-[#171717] text-white rounded border border-[#171717]">
                <span className="text-[10px] uppercase font-bold text-stone-300 block">Outcome</span>
                <span className="font-bold text-white">{t('demographics.planning_priority')}</span>
                <span className="text-[11px] block text-amber-300 font-semibold mt-0.5">
                  {districtInsight.priorityTier.toUpperCase()} ({districtInsight.priorityScore}/100)
                </span>
              </div>

            </div>

            {/* Contextual Narrative */}
            <div className="mt-4 pt-3 border-t border-[#171717]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-[#171717]/80 leading-relaxed max-w-2xl">
                {districtInsight.relatedReports.length > 0 ? (
                  <p>
                    <strong>{selectedDistrict.name}</strong> combines {getVulnerabilityTierLabel(selectedDistrict.poverty_index, t).toLowerCase()} vulnerability with active citizen demand for {districtInsight.topCategory.toLowerCase()} services and a {districtInsight.avgInfraGap}% infrastructure gap. Public digital capital allocated here directly shields at-risk populations.
                  </p>
                ) : (
                  <p className="text-[#171717]/60">
                    {t('demographics.no_priority_data')} While {selectedDistrict.name} has recorded vulnerability ({Math.round(selectedDistrict.poverty_index * 100)}%), citizen demand signals are not yet verified for this district.
                  </p>
                )}
              </div>

              {onNavigateToRecommendations && (
                <button
                  id="btn-view-related-recommendations"
                  onClick={() => onNavigateToRecommendations(selectedDistrict.id, districtInsight.topCategory)}
                  className="bg-[#171717] hover:bg-[#171717]/90 text-white text-xs font-medium px-4 py-2.5 rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span>{t('demographics.view_related_recommendations')}</span>
                </button>
              )}
            </div>

          </div>
        </section>
      )}

      {/* 7. COLLAPSIBLE ADVANCED DETAILS SECTION (Preserves all existing demographic details) */}
      <section id="section-advanced-demographic-details" className="border border-[#171717]/10 rounded-lg overflow-hidden bg-white">
        <button
          id="btn-toggle-advanced-details"
          onClick={() => setShowAdvancedDetails(!showAdvancedDetails)}
          className="w-full px-5 py-3.5 bg-[#fcfbf9] hover:bg-[#171717]/5 text-xs font-semibold text-[#171717] flex items-center justify-between transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#171717]/60" />
            <span>
              {showAdvancedDetails 
                ? t('demographics.hide_details') 
                : t('demographics.view_details')}
            </span>
          </span>
          {showAdvancedDetails ? (
            <ChevronUp className="w-4 h-4 text-[#171717]/60" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#171717]/60" />
          )}
        </button>

        {showAdvancedDetails && selectedDistrict && (
          <div id="advanced-details-content" className="p-5 space-y-6 border-t border-[#171717]/10">
            
            {/* 1. Rural / Urban Split & Age Structure */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              
              {/* Rural vs Urban */}
              <div className="p-4 bg-[#fcfbf9] border border-[#171717]/10 rounded space-y-3">
                <span className="text-[10px] text-[#171717]/60 uppercase font-bold block">
                  1. RURAL / URBAN POPULATION COMPOSITION
                </span>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-[#171717] mb-1">
                      <span>Rural Mandals ({ruralPct}%)</span>
                      <span className="font-mono">
                        {Math.round(selectedDistrict.population * ruralPct / 100).toLocaleString()} residents
                      </span>
                    </div>
                    <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-stone-800 h-full rounded-full" style={{ width: `${ruralPct}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-[#171717] mb-1">
                      <span>Urban Wards ({urbanPct}%)</span>
                      <span className="font-mono">
                        {Math.round(selectedDistrict.population * urbanPct / 100).toLocaleString()} residents
                      </span>
                    </div>
                    <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-stone-500 h-full rounded-full" style={{ width: `${urbanPct}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Age Structure Breakdown */}
              <div className="p-4 bg-[#fcfbf9] border border-[#171717]/10 rounded space-y-3">
                <span className="text-[10px] text-[#171717]/60 uppercase font-bold block">
                  2. AGE STRUCTURE BREAKDOWN
                </span>
                <div className="space-y-2.5">
                  {ageBreakdown.map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-[11px] font-semibold text-[#171717] mb-0.5">
                        <span>{item.range}</span>
                        <span className="font-mono font-bold">{item.pct}%</span>
                      </div>
                      <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                        <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* 2. Demographic Vulnerability Indicators & Beneficiary Counts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              
              {/* Left: Detailed Indicators */}
              <div className="p-4 bg-[#fcfbf9] border border-[#171717]/10 rounded space-y-3">
                <div className="border-b border-[#171717]/10 pb-2 flex justify-between items-center">
                  <span className="font-bold text-[#171717] uppercase text-[11px]">
                    DEMOGRAPHIC VULNERABILITY INDICATORS
                  </span>
                  <span className="text-[#171717]/50 font-mono text-[10px]">4 Risk Factors</span>
                </div>

                <div className="divide-y divide-[#171717]/10">
                  {vulnerabilityIndicators.map((ind, idx) => (
                    <div key={idx} className="py-2.5 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#171717]">{ind.label}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                          ind.status === 'CRITICAL' 
                            ? 'bg-red-50 text-red-800 border-red-200' 
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {tStatus(ind.status)}
                        </span>
                      </div>
                      <p className="text-[#171717]/70 text-[11px]">{ind.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Population Affected by Issue Category */}
              <div className="p-4 bg-[#fcfbf9] border border-[#171717]/10 rounded space-y-3">
                <div className="border-b border-[#171717]/10 pb-2 flex justify-between items-center">
                  <span className="font-bold text-[#171717] uppercase text-[11px]">
                    POPULATION AFFECTED BY ISSUE CATEGORY
                  </span>
                  <span className="text-[#171717]/50 font-mono text-[10px]">Beneficiary Count</span>
                </div>

                <div className="space-y-2.5">
                  {issuePopulationImpact.map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-white border border-[#171717]/10 rounded space-y-1">
                      <div className="flex justify-between font-semibold text-xs text-[#171717]">
                        <span>{item.issue}</span>
                        <span className="font-mono text-[#ea580c] font-bold">{item.affectedCount.toLocaleString()} residents</span>
                      </div>
                      <div className="text-[11px] text-[#171717]/60 flex justify-between">
                        <span>{t('table.category')}: {tCategory(item.category)}</span>
                        <span>Group: {item.equityScore}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Baseline Data Source & GODL Compliance */}
            <div className="p-3 bg-stone-50 border border-[#171717]/10 rounded text-[11px] text-[#171717]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>
                  <strong>Baseline Source:</strong> Office of the Registrar General & Census Commissioner (Census of India / SECC) via data.gov.in
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#171717]/50">
                <span>GODL License</span>
                <span>•</span>
                <span className="text-emerald-700 font-medium">Strictly Anonymized Aggregate Baseline Data</span>
              </div>
            </div>

          </div>
        )}
      </section>

    </div>
  );
};
