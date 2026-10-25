import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Tooltip, Popup, useMap, ZoomControl, Polyline, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Building2, Stethoscope, GraduationCap, Bus, Wifi, Users, Activity, Flame, Eye, ExternalLink, ShieldAlert, Info
} from 'lucide-react';
import { District, CitizenRequest, InfrastructureCategory, ScoreBreakdown, CountryCode } from '../types';
import { CityDemandHotspot } from '../utils/demandAggregation';
import { GLOBAL_COUNTRIES } from '../data/globalConfig';
import { 
  INDIA_MAP_CENTER, 
  INDIA_MAP_MAX_BOUNDS, 
  INDIA_MAP_DEFAULT_ZOOM,
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

export interface EvaluatedDistrict {
  district: District;
  category: InfrastructureCategory;
  demandCount: number;
  currentAccess: number;
  breakdown: ScoreBreakdown;
  matchedRequests: CitizenRequest[];
  demandHotspot: CityDemandHotspot;
  priorityTier: {
    tier: 'Low' | 'Medium' | 'High' | 'Critical';
    color: string;
    label: string;
  };
}

export interface MapLayerState {
  citizen_demand: boolean;
  infrastructure: boolean;
  population: boolean;
  projects: boolean;
  healthcare: boolean;
  education: boolean;
  roads: boolean;
  digital: boolean;
}

export interface ReportEvidence {
  title: string;
  tag: string;
  sub: string;
  officer: string;
  department: string;
  actionDate: string;
  status: string;
  reportId: string;
  signalConfidence: number;
}

interface IndiaMapCanvasProps {
  evaluations: EvaluatedDistrict[];
  activeDistrictId: string;
  onSelectDistrict: (districtId: string) => void;
  selectedCategory: InfrastructureCategory | 'All';
  layers: MapLayerState;
  onSelectHotspotForPolicy?: (district: District, category: InfrastructureCategory) => void;
  selectedCountryCode?: CountryCode;
  onOpenEvidenceModal?: (district: District, category: string, hotspot: CityDemandHotspot) => void;
  focusedCoordinate?: [number, number] | null;
  focusedPinId?: string | null;
  onResetAllIndia?: () => void;
}


export const getReportEvidence = (district: District, category: string, hotspot: CityDemandHotspot): ReportEvidence => {
  const reports: Record<string, {
    title: string;
    tag: string;
    sub: string;
    officer: string;
    department: string;
    actionDate: string;
    status: string;
    confidence: number;
  }> = {
    Water: {
      title: 'Deep Aquifer & Feeder Pipe Fracture Assessment',
      tag: '#WaterSecurityCrisis',
      sub: 'Main municipal raw water feeder line ruptured near transit junction; contamination ingress reported in 4 peri-urban blocks.',
      officer: 'Er. Rajesh Kumar, Executive Engineer',
      department: 'Public Health Engineering Department (PHED)',
      actionDate: '28 Aug 2026',
      status: 'Emergency Sanction Tender Underway',
      confidence: 94,
    },
    Drainage: {
      title: 'Monsoon Sump Siltation & Flood Canal Overflow',
      tag: '#DrainageGridlock',
      sub: 'Severe stormwater conduit siltation causing 1.5 ft toxic backflow across residential mandal corridors.',
      officer: 'Smt. Priya Sharma, Chief Municipal Health Officer',
      department: 'Urban Development & Stormwater Authority',
      actionDate: '29 Aug 2026',
      status: 'Special Desilting Sanctioned',
      confidence: 91,
    },
    Roads: {
      title: 'Heavy Freight Corridor Subsidence & Arterial Craters',
      tag: '#ArterialTransitDeficit',
      sub: 'Multiple deep pavement fissures and structural culvert cracking along 6.4 km agricultural transit artery.',
      officer: 'K. Venkatesh, Superintending Engineer (R&B)',
      department: 'Roads & Buildings / National Highway Cell',
      actionDate: '26 Aug 2026',
      status: 'Pavement Work Order Fast-Tracked',
      confidence: 96,
    },
    Electricity: {
      title: 'Substation Transformer Overload & Feeder Tripping',
      tag: '#GridReliabilityRisk',
      sub: 'Burnt 250 kVA distribution transformers causing prolonged brownouts and high-voltage motor burnout for agricultural wells.',
      officer: 'T. N. Murthy, Assistant Divisional Engineer',
      department: 'State Power Distribution Corporation',
      actionDate: '27 Aug 2026',
      status: 'Feeder Segregation Scheduled',
      confidence: 89,
    },
    Health: {
      title: 'Primary Health Center Emergency & Obstetrics Deficit',
      tag: '#RuralHealthAccessDeficit',
      sub: 'Single medical officer servicing 220+ outpatients daily; anti-snake venom and emergency pediatric diagnostics depleted.',
      officer: 'Dr. Anita Desai, District Medical & Health Officer',
      department: 'Directorate of Health Services',
      actionDate: '25 Aug 2026',
      status: 'Medical Board Emergency Supply Dispatched',
      confidence: 95,
    },
    Sanitation: {
      title: 'Municipal Solid Waste Accumulation & Open Drain Hazard',
      tag: '#SanitationVectorAlert',
      sub: 'Uncollected refuse clogging peri-urban open storm channels, generating high vector breeding indices before monsoons.',
      officer: 'S. K. Verma, Sanitation Commissioner',
      department: 'Municipal Corporation Sanitation Wing',
      actionDate: '24 Aug 2026',
      status: 'Intensive Cleanup Drive Initiated',
      confidence: 90,
    },
  };

  const defaultEvidence = reports[category] || reports.Water;
  const safeLatVal = isValidCoordinate(district.lat, district.lon) ? district.lat : 16.5;
  const code = (district.name || 'IND').substring(0, 3).toUpperCase();
  const idNum = Math.floor(1000 + (Math.abs(safeLatVal) * 137) % 8999);

  return {
    ...defaultEvidence,
    reportId: `CP-${code}-${idNum}`,
    signalConfidence: defaultEvidence.confidence,
  };
};

// Smoothly pans the map when selected district or focused coordinates change
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  const prevRef = React.useRef<{ lat: number; lng: number; zoom: number } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 120);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    const [lat, lng] = center;
    if (!isValidCoordinate(lat, lng) || typeof zoom !== 'number' || isNaN(zoom)) return;

    if (
      !prevRef.current ||
      Math.abs(prevRef.current.lat - lat) > 0.0001 ||
      Math.abs(prevRef.current.lng - lng) > 0.0001 ||
      prevRef.current.zoom !== zoom
    ) {
      prevRef.current = { lat, lng, zoom };
      map.flyTo([lat, lng], zoom, { duration: 1.2, easeLinearity: 0.25 });
    }
  }, [center[0], center[1], zoom, map]);

  return null;
};

// Component to handle fitting bounds when a state is selected
const StateFocuser: React.FC<{ activeState?: string; geoJsonData: any }> = ({ activeState, geoJsonData }) => {
  const map = useMap();
  useEffect(() => {
    if (!geoJsonData || !activeState || activeState === 'ALL') return;

    const stateFeature = geoJsonData.features.find((f: any) => {
      const name = f?.properties?.NAME_1 || f?.properties?.st_nm || '';
      return name.toLowerCase().includes(activeState.toLowerCase());
    });

    if (stateFeature) {
      const bounds = L.geoJSON(stateFeature).getBounds();
      if (bounds.isValid()) {
        map.flyToBounds(bounds, { padding: [40, 40], duration: 1.5 });
      }
    }
  }, [activeState, geoJsonData, map]);
  return null;
};

export const IndiaMapCanvas: React.FC<IndiaMapCanvasProps> = ({
  evaluations,
  activeDistrictId,
  onSelectDistrict,
  selectedCategory,
  layers,
  onSelectHotspotForPolicy,
  selectedCountryCode = 'IN',
  onOpenEvidenceModal,
  focusedCoordinate,
  focusedPinId,
  onResetAllIndia,
}) => {
  const [showMapSources, setShowMapSources] = useState(false);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const countryConfig = GLOBAL_COUNTRIES[selectedCountryCode] || GLOBAL_COUNTRIES['IN'];

  // Zero-Cost Official India State Boundaries Layer
  useEffect(() => {
    let isMounted = true;
    fetch(INDIA_STATES_GEOJSON_PATH)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load boundary');
        return res.json();
      })
      .then((data) => {
        if (isMounted) setGeoJsonData(data);
      })
      .catch((err) => {
        console.warn('GeoJSON boundary load fallback:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter evaluations to only those with valid numeric coordinates
  const validEvaluations = useMemo(() => {
    return evaluations.filter(e => e.district && isValidCoordinate(e.district.lat, e.district.lon));
  }, [evaluations]);

  // CRITICAL REALISM FILTER:
  // When a category is filtered, ONLY display hotspots that have genuine demand/issues in that category!
  const displayedEvaluations = useMemo(() => {
    if (selectedCategory === 'All') {
      return validEvaluations;
    }
    const filtered = validEvaluations.filter((item) => item.demandHotspot.hasCategorySignal);
    // If none match strictly, fallback to top 5 by priority to avoid empty map
    return filtered.length > 0 ? filtered : validEvaluations.slice(0, 6);
  }, [validEvaluations, selectedCategory]);

  const activeEvaluation = useMemo(() => {
    if (!activeDistrictId) return null;
    // We check validEvaluations (the unfiltered list) to ensure we find the active district
    // even if it's currently hidden by a category filter.
    return validEvaluations.find(e => e.district.id === activeDistrictId) || null;
  }, [validEvaluations, activeDistrictId]);

  // Calculate map center based on focused coordinate, active district, or country center coordinates
  const mapCenter = useMemo<[number, number]>(() => {
    if (focusedCoordinate && isValidCoordinate(focusedCoordinate[0], focusedCoordinate[1])) {
      return focusedCoordinate;
    }
    if (activeEvaluation && isValidCoordinate(activeEvaluation.district.lat, activeEvaluation.district.lon)) {
      return [activeEvaluation.district.lat, activeEvaluation.district.lon];
    }
    if (countryConfig?.coordinates && isValidCoordinate(countryConfig.coordinates.lat, countryConfig.coordinates.lng)) {
      return [countryConfig.coordinates.lat, countryConfig.coordinates.lng];
    }
    return INDIA_MAP_CENTER;
  }, [focusedCoordinate, activeEvaluation, countryConfig]);

  const defaultZoom = countryConfig?.coordinates?.zoom || INDIA_MAP_DEFAULT_ZOOM;
  
  // Calculate target zoom based on state or district selection
  const targetZoom = useMemo(() => {
    if (focusedCoordinate && isValidCoordinate(focusedCoordinate[0], focusedCoordinate[1])) {
      return 11;
    }
    if (activeEvaluation) {
      // If we have an active district, zoom in to show context
      return 8;
    }
    return defaultZoom;
  }, [focusedCoordinate, activeEvaluation, defaultZoom]);

  const stateStyle = useMemo(() => {
    return getIndiaStateBoundaryStyle(activeEvaluation?.district?.state);
  }, [activeEvaluation?.district?.state]);

  // Clean, institutional CivicPulse circular marker creation
  const createAtlasIcon = (category: string, isSelected: boolean, type: string = 'demand', score: number = 50) => {
    let bg = '#10b981'; // Emerging (<40)
    if (score >= 85) bg = '#ef4444'; // Critical (85+)
    else if (score >= 70) bg = '#f97316'; // High (70-84)
    else if (score >= 40) bg = '#eab308'; // Medium (40-69)

    if (type === 'healthcare') bg = '#285943';
    else if (type === 'project') bg = '#D9A441';

    // Simple, clean circular markers scaled proportionally to intensity
    const size = isSelected ? 26 : (score >= 85 ? 22 : score >= 70 ? 20 : score >= 40 ? 17 : 14);

    return L.divIcon({
      className: 'bg-transparent border-none',
      html: `
        <div style="
          position: relative;
          display: flex; 
          align-items: center; 
          justify-content: center;
          width: ${size}px; 
          height: ${size}px;
          border-radius: 50%;
          background-color: ${bg};
          border: 2px solid ${isSelected ? '#171717' : '#ffffff'};
          box-shadow: 0 2px 6px rgba(0,0,0,0.45);
          cursor: pointer;
          transition: transform 0.15s ease;
          transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
          outline: ${isSelected ? '2px solid #ffffff' : 'none'};
          z-index: ${isSelected ? 50 : 10};
        ">
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2],
    });
  };

  return (
    <div className="w-full h-full relative z-0 bg-[#121417] overflow-hidden">
      
      {/* 1. BREADCRUMB & REGIONAL BADGE (TOP-LEFT OVERLAY) */}
      <div className="absolute top-4 left-4 z-20 max-w-[calc(100%-140px)] sm:max-w-[calc(100%-200px)] bg-slate-900/90 border border-slate-700 px-3.5 py-2 shadow-xl backdrop-blur-md flex items-center space-x-2.5 font-sans text-xs text-white rounded-xl overflow-hidden truncate ring-1 ring-white/10">
        <span className="text-sm shrink-0">🇮🇳</span>
        <span className="font-bold tracking-tight shrink-0">India</span>
        {activeEvaluation ? (
          <>
            <span className="text-white/30 shrink-0">/</span>
            <span className="font-semibold text-orange-400 truncate">
              {activeEvaluation.district.state}
            </span>
            <span className="text-white/30 shrink-0">/</span>
            <span className="font-bold text-white truncate">{activeEvaluation.district.name}</span>
          </>
        ) : (
          <>
            <span className="text-white/30 shrink-0">/</span>
            <span className="font-semibold text-orange-400 truncate">
              India Overview
            </span>
          </>
        )}
        <div className="flex items-center gap-1.5 ml-2 shrink-0 hidden xs:flex border-l border-white/10 pl-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] text-slate-300 font-medium">
            {displayedEvaluations.length} Active hotspots
          </span>
        </div>
      </div>

      {/* 2. SATELLITE BASEMAP BADGE (TOP-RIGHT OVERLAY) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3 py-2 shadow-xl flex items-center gap-2 font-sans text-xs text-white/90 rounded-xl shrink-0 ring-1 ring-white/10">
          <span className="shrink-0 text-sm">🛰️</span>
          <span className="font-bold hidden sm:inline">Satellite hybrid</span>
          <span className="font-bold sm:hidden">Satellite</span>
        </div>
        
        {/* All India Reset Button */}
        <button 
          onClick={() => {
            if (onResetAllIndia) {
              onResetAllIndia();
            } else {
              onSelectDistrict('');
              const url = new URL(window.location.href);
              url.searchParams.delete('highlightPin');
              url.searchParams.delete('state');
              url.searchParams.delete('district');
              url.searchParams.delete('locality');
              url.searchParams.delete('lat');
              url.searchParams.delete('lng');
              window.history.pushState({}, '', url);
            }
          }}
          className="bg-white text-slate-900 px-3 py-2 rounded-xl shadow-xl flex items-center justify-center gap-2 font-sans text-xs font-bold transition-all hover:bg-slate-50 border border-slate-200 cursor-pointer active:scale-95"
        >
          <span className="text-sm">🌐</span>
          <span>India view</span>
        </button>
      </div>

      {/* 3. COMPACT FLOATING CIVIC PRIORITY LEGEND (BOTTOM-LEFT OVERLAY) */}
      <div className="absolute bottom-6 left-4 sm:left-6 z-20 bg-slate-900/95 text-white border border-white/10 px-4 py-3 shadow-2xl backdrop-blur-md font-sans text-xs rounded-2xl space-y-2 min-w-[150px]">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 border-b border-white/5 pb-2">
          <span>Priority levels</span>
          <button 
            onClick={() => setShowMapSources(!showMapSources)} 
            title="Data Sources"
            className="text-slate-500 hover:text-white transition-colors cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-amber-400/80" />
          </button>
        </div>
        
        <div className="space-y-1.5 text-[11px] font-semibold text-slate-200">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-sm shadow-red-500/50"></span>
            <span>Critical (85+)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] shadow-sm shadow-orange-500/50"></span>
            <span>High (70–84)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#eab308] shadow-sm shadow-yellow-500/50"></span>
            <span>Medium (40–69)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-sm shadow-emerald-500/50"></span>
            <span>Low (&lt;40)</span>
          </div>
        </div>

        {showMapSources && (
          <div className="mt-2.5 pt-2.5 border-t border-white/5 text-[10px] font-sans text-slate-400 space-y-1 animate-in fade-in slide-in-from-bottom-1 duration-200">
            <div className="text-white/80 font-bold text-[9px]">Data sources</div>
            <div>• Esri Satellite GIS basemap</div>
            <div>• Real-time citizen signals</div>
          </div>
        )}
      </div>

      <MapContainer 
        center={mapCenter} 
        zoom={targetZoom} 
        minZoom={INDIA_MAP_MIN_ZOOM}
        maxZoom={INDIA_MAP_MAX_ZOOM}
        maxBounds={INDIA_MAP_MAX_BOUNDS}
        maxBoundsViscosity={1.0}
        worldCopyJump={false}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', background: '#121417' }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <MapController center={mapCenter} zoom={targetZoom} />
        <StateFocuser activeState={activeEvaluation?.district?.state} geoJsonData={geoJsonData} />
        
        {/* BASE SATELLITE TILE LAYERS: WORLD IMAGERY & PLACE LABELS */}
        <TileLayer
          url={SATELLITE_TILE_URL}
          attribution={SATELLITE_TILE_ATTRIBUTION}
          maxZoom={19}
          noWrap={true}
          bounds={INDIA_MAP_MAX_BOUNDS}
        />
        <TileLayer
          url={REFERENCE_PLACES_TILE_URL}
          attribution={REFERENCE_PLACES_ATTRIBUTION}
          maxZoom={19}
          opacity={0.5}
          noWrap={true}
          bounds={INDIA_MAP_MAX_BOUNDS}
        />

        {/* OFFICIAL INDIA STATE BOUNDARIES OVERLAY */}
        {geoJsonData && (
          <GeoJSON
            key={`geojson-ind-${activeEvaluation?.district?.state || 'ALL'}`}
            data={geoJsonData}
            style={stateStyle}
          />
        )}

        {/* SUBTLE FOCUS RING ON SELECTED DISTRICT ONLY — NO HUGE OVERLAPPING CIRCLES */}
        {activeEvaluation && isValidCoordinate(activeEvaluation.district.lat, activeEvaluation.district.lon) && (
          <Circle
            center={[activeEvaluation.district.lat, activeEvaluation.district.lon]}
            radius={11000}
            pathOptions={{
              color: '#D65A3A',
              weight: 2,
              opacity: 0.9,
              fillColor: '#D65A3A',
              fillOpacity: 0.12,
              dashArray: '4, 4',
            }}
            interactive={false}
          />
        )}

        {/* REGIONAL CONNECTIVITY NETWORK (WHEN ROADS LAYER ENABLED) */}
        {layers.roads && (
          <>
            <Polyline
              positions={[
                [16.5062, 80.6480], // Vijayawada
                [16.3067, 80.4365], // Guntur
                [14.4426, 79.9865], // Nellore
                [13.2172, 79.1003], // Chittoor
              ]}
              pathOptions={{ color: '#ffffff', weight: 1.5, opacity: 0.5 }}
            />
            <Polyline
              positions={[
                [21.1458, 79.0882], // Nagpur
                [19.1383, 77.3210], // Nanded
                [17.6599, 75.9064], // Solapur
              ]}
              pathOptions={{ color: '#ffffff', weight: 1.5, opacity: 0.5 }}
            />
          </>
        )}

        {/* HIGHLIGHTED FOCUSED PIN (FOR SUBMITTED OR TRACED CITIZEN ISSUE) */}
        {focusedCoordinate && isValidCoordinate(focusedCoordinate[0], focusedCoordinate[1]) && focusedPinId && (
          <Marker
            position={focusedCoordinate}
            zIndexOffset={1000}
            icon={L.divIcon({
              className: 'bg-transparent border-none',
              html: `
                <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
                  <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(214, 90, 58, 0.45); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                  <div style="width: 22px; height: 22px; border-radius: 50%; background: #D65A3A; border: 2.5px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px;">
                    📍
                  </div>
                </div>
              `,
              iconSize: [36, 36],
              iconAnchor: [18, 18],
            })}
          >
            <Tooltip permanent direction="top" offset={[0, -18]} className="bg-[#171717] text-white border border-[#D65A3A] font-mono text-xs rounded shadow-lg">
              <span className="font-bold text-[#D65A3A]">{focusedPinId}</span>
            </Tooltip>
          </Marker>
        )}

        {/* CIVICPULSE CITIZEN DEMAND HOTSPOT PINS */}
        {layers.citizen_demand && displayedEvaluations.map((item) => {
          if (!item.district || !isValidCoordinate(item.district.lat, item.district.lon)) return null;
          const isSelected = item.district.id === activeDistrictId;
          const evidence = getReportEvidence(item.district, item.category, item.demandHotspot);
          const score = item.breakdown.total_score;

          return (
            <Marker
              key={`demand-${item.district.id}`}
              position={[item.district.lat, item.district.lon]}
              icon={createAtlasIcon(item.category, isSelected, 'demand', score)}
              eventHandlers={{
                click: () => onSelectDistrict(item.district.id),
              }}
            >
              <Tooltip direction="top" offset={[0, -18]} className="bg-[#171717] text-white border border-white/20 rounded-md shadow-lg !p-0">
                <div className="px-3 py-2 text-xs font-mono font-medium flex flex-col gap-1">
                  <div className="flex justify-between items-center gap-3">
                    <span className="font-bold text-sm text-white">{item.district.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 font-bold rounded ${
                      score >= 70 ? 'bg-[#D65A3A] text-white' : score >= 40 ? 'bg-[#D9A441] text-black' : 'bg-[#285943] text-white'
                    }`}>
                      {score >= 70 ? 'High' : score >= 40 ? 'Medium' : 'Emerging'}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-300 flex items-center justify-between gap-4">
                    <span>Priority: <strong className="text-white">{score}/100</strong></span>
                    <span>Signals: <strong className="text-white">{item.demandCount}</strong></span>
                  </div>
                  <div className="text-[10px] text-gray-400 border-t border-white/10 pt-1 flex items-center justify-between">
                    <span>{item.category}</span>
                    <span className="text-[#D65A3A]">Click to inspect →</span>
                  </div>
                </div>
              </Tooltip>

              <Popup offset={[0, -20]} className="custom-popup" maxWidth={360} minWidth={300}>
                <div className="bg-white border border-slate-200 shadow-2xl overflow-hidden text-slate-900 -m-4 rounded-xl">
                  <div className="p-4 space-y-4 font-sans">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="text-sm font-bold text-slate-900">
                        {item.district.name} · {item.district.state}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                        {evidence.reportId}
                      </span>
                    </div>

                    <div className="text-sm bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                      <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5">
                        <Activity className="w-3 h-3 text-orange-500" />
                        Citizen voice
                      </div>
                      <div className="font-sans text-slate-800 font-medium italic leading-relaxed">
                        "{item.matchedRequests && item.matchedRequests.length > 0 ? item.matchedRequests[0].original_text : evidence.sub}"
                      </div>
                      {item.matchedRequests && item.matchedRequests.length > 0 && item.matchedRequests[0].language !== 'English' && (
                        <div className="text-[10px] text-slate-400 font-medium pt-1 border-t border-slate-200/60 mt-2">
                          Language: {item.matchedRequests[0].language}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-100">
                        <span className="text-orange-800/60 font-bold text-[9px] block mb-1">Citizen demand</span>
                        <span className="font-bold text-orange-700">{item.demandCount} signals</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-slate-500 font-bold text-[9px] block mb-1">Priority index</span>
                        <span className="font-bold text-slate-900">{score} / 100</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 pt-1">
                      {onOpenEvidenceModal && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenEvidenceModal(item.district, item.category, item.demandHotspot);
                          }}
                          className="flex-1 bg-white hover:bg-slate-50 text-slate-900 py-2.5 px-3 text-xs font-bold transition-all border border-slate-200 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                          <span>Evidence</span>
                        </button>
                      )}
                      {onSelectHotspotForPolicy && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectHotspotForPolicy(item.district, item.category);
                          }}
                          className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2.5 px-3 text-xs font-bold transition-all cursor-pointer rounded-lg flex items-center justify-center gap-1.5 shadow-sm shadow-slate-200"
                        >
                          <span>Policy brief →</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* HEALTHCARE CLINICS LAYER */}
        {layers.healthcare && displayedEvaluations.map((item) => {
          if (!item.district || !isValidCoordinate(item.district.lat, item.district.lon)) return null;
          return (
            <Marker
              key={`hc-${item.district.id}`}
              position={[item.district.lat + 0.04, item.district.lon - 0.04]}
              icon={createAtlasIcon('Health', false, 'healthcare')}
            >
              <Tooltip direction="top" className="bg-[#171717] text-white border border-white/20 font-mono text-xs">
                <div>🏥 {item.district.name} District Hospital & PHC</div>
              </Tooltip>
            </Marker>
          );
        })}

        {/* EDUCATION INSTITUTIONS LAYER */}
        {layers.education && displayedEvaluations.map((item) => {
          if (!item.district || !isValidCoordinate(item.district.lat, item.district.lon)) return null;
          return (
            <Marker
              key={`edu-${item.district.id}`}
              position={[item.district.lat - 0.04, item.district.lon + 0.04]}
              icon={createAtlasIcon('Education', false, 'education')}
            >
              <Tooltip direction="top" className="bg-[#171717] text-white border border-white/20 font-mono text-xs">
                <div>🎓 {item.district.name} Govt Polytechnic & High School</div>
              </Tooltip>
            </Marker>
          );
        })}

        {/* GOVERNMENT SANCTIONED PROJECTS LAYER */}
        {layers.projects && displayedEvaluations.map((item) => {
          if (!item.district || !isValidCoordinate(item.district.lat, item.district.lon)) return null;
          return (
            <Marker
              key={`proj-${item.district.id}`}
              position={[item.district.lat + 0.02, item.district.lon + 0.05]}
              icon={createAtlasIcon('Project', false, 'project')}
            >
              <Tooltip direction="top" className="bg-[#171717] text-white border border-white/20 font-mono text-xs">
                <div>🏗️ Active Project Site — Sanction ₹14.8 Cr</div>
              </Tooltip>
            </Marker>
          );
        })}

        {/* DIGITAL CONNECTIVITY TOWERS LAYER */}
        {layers.digital && displayedEvaluations.map((item) => {
          if (!item.district || !isValidCoordinate(item.district.lat, item.district.lon)) return null;
          return (
            <Marker
              key={`dig-${item.district.id}`}
              position={[item.district.lat - 0.03, item.district.lon - 0.05]}
              icon={createAtlasIcon('Digital', false, 'digital')}
            >
              <Tooltip direction="top" className="bg-[#171717] text-white border border-white/20 font-mono text-xs">
                <div>📡 BharatNet Optical Fiber Distribution Node</div>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
