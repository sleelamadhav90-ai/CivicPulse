import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Tooltip, Popup, useMap, ZoomControl, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Building2, Stethoscope, GraduationCap, Bus, Wifi, Users, Activity, Info, Flame, Eye, ExternalLink, ShieldAlert
} from 'lucide-react';
import { District, CitizenRequest, InfrastructureCategory, ScoreBreakdown, CountryCode } from '../types';
import { CityDemandHotspot } from '../utils/demandAggregation';
import { GLOBAL_COUNTRIES } from '../data/globalConfig';

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
}

const isValidCoord = (lat?: number, lon?: number): boolean => {
  return typeof lat === 'number' && typeof lon === 'number' && !isNaN(lat) && !isNaN(lon) && isFinite(lat) && isFinite(lon);
};

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
  const safeLatVal = isValidCoord(district.lat, district.lon) ? district.lat : 16.5;
  const code = (district.name || 'IND').substring(0, 3).toUpperCase();
  const idNum = Math.floor(1000 + (Math.abs(safeLatVal) * 137) % 8999);

  return {
    ...defaultEvidence,
    reportId: `CP-${code}-${idNum}`,
    signalConfidence: defaultEvidence.confidence,
  };
};

// Smoothly pans the map when selected district changes
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (isValidCoord(center[0], center[1])) {
      map.flyTo(center, zoom, { duration: 1.2, easeLinearity: 0.25 });
    }
  }, [center, zoom, map]);
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
}) => {
  const [baseTileMode, setBaseTileMode] = useState<'physical_satellite' | 'vector_voyager'>('physical_satellite');
  const [showMapSources, setShowMapSources] = useState(false);
  const countryConfig = GLOBAL_COUNTRIES[selectedCountryCode] || GLOBAL_COUNTRIES['IN'];

  // Filter evaluations to only those with valid numeric coordinates
  const validEvaluations = useMemo(() => {
    return evaluations.filter(e => e.district && isValidCoord(e.district.lat, e.district.lon));
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
    return displayedEvaluations.find(e => e.district.id === activeDistrictId) || 
           validEvaluations.find(e => e.district.id === activeDistrictId) || 
           displayedEvaluations[0];
  }, [displayedEvaluations, validEvaluations, activeDistrictId]);

  // Calculate map center based on active district, first displayed evaluation, or country center coordinates
  const mapCenter = useMemo<[number, number]>(() => {
    if (activeEvaluation && isValidCoord(activeEvaluation.district.lat, activeEvaluation.district.lon)) {
      return [activeEvaluation.district.lat, activeEvaluation.district.lon];
    }
    const firstEval = displayedEvaluations[0];
    if (firstEval) {
      return [firstEval.district.lat, firstEval.district.lon];
    }
    if (countryConfig?.coordinates && isValidCoord(countryConfig.coordinates.lat, countryConfig.coordinates.lng)) {
      return [countryConfig.coordinates.lat, countryConfig.coordinates.lng];
    }
    return [20.5937, 78.9629];
  }, [activeEvaluation, displayedEvaluations, countryConfig]);

  const defaultZoom = countryConfig?.coordinates?.zoom || 5;
  const targetZoom = activeDistrictId ? 8 : defaultZoom;

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
      
      {/* 1. BREADCRUMB & REGIONAL BADGE (TOP-LEFT) */}
      <div className="absolute top-3 left-3 z-20 bg-[#171717]/85 border border-white/20 px-3 py-1.5 shadow-md backdrop-blur-md flex items-center space-x-2 font-mono text-[11px] text-white rounded-lg">
        <span className="text-xs">🇮🇳</span>
        <span className="font-bold tracking-wider uppercase">INDIA</span>
        <span className="text-white/40">/</span>
        <span className="font-semibold text-[#D65A3A] uppercase">
          {activeEvaluation?.district.state || 'NATIONAL GIS'}
        </span>
        {activeEvaluation && (
          <>
            <span className="text-white/40">/</span>
            <span className="font-bold text-white uppercase">{activeEvaluation.district.name}</span>
          </>
        )}
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1"></span>
        <span className="text-[10px] text-gray-300 font-sans">
          {displayedEvaluations.length} Active Hotspots
        </span>
      </div>

      {/* 2. FLOATING MAP TILE STYLE SELECTOR (TOP-RIGHT) */}
      <div className="absolute top-3 right-3 z-20 bg-[#171717]/85 backdrop-blur-md border border-white/20 p-1 shadow-md flex items-center gap-1 font-mono text-[10px] rounded-lg">
        <button
          onClick={() => setBaseTileMode('physical_satellite')}
          className={`px-3 py-1 font-bold uppercase tracking-wider transition-all cursor-pointer rounded-md ${
            baseTileMode === 'physical_satellite'
              ? 'bg-[#D65A3A] text-white shadow-xs'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
          title="High-Resolution Satellite Imagery with Place Context"
        >
          🛰️ SATELLITE
        </button>
        <button
          onClick={() => setBaseTileMode('vector_voyager')}
          className={`px-3 py-1 font-bold uppercase tracking-wider transition-all cursor-pointer rounded-md ${
            baseTileMode === 'vector_voyager'
              ? 'bg-[#D65A3A] text-white shadow-xs'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
          title="Clean Street & Geographic Map"
        >
          🗺️ STREETS
        </button>
      </div>

      {/* 3. COMPACT FLOATING CIVIC PRIORITY LEGEND (BOTTOM-LEFT) */}
      <div className="absolute bottom-4 left-4 z-20 bg-[#171717]/85 text-white border border-white/15 px-3 py-2 shadow-lg backdrop-blur-md font-sans text-xs rounded-lg space-y-1.5 min-w-[135px]">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-stone-300 uppercase tracking-wider border-b border-white/10 pb-1">
          <span>Priority</span>
          <button 
            onClick={() => setShowMapSources(!showMapSources)} 
            title="Data Sources"
            className="text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <Info className="w-3 h-3 text-amber-300" />
          </button>
        </div>
        
        <div className="space-y-1 text-[11px] font-medium text-stone-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ef4444] border border-white/60 shrink-0"></span>
            <span>Critical (85+)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#f97316] border border-white/60 shrink-0"></span>
            <span>High (70–84)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#eab308] border border-white/60 shrink-0"></span>
            <span>Medium (40–69)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981] border border-white/60 shrink-0"></span>
            <span>Emerging (&lt;40)</span>
          </div>
        </div>

        {showMapSources && (
          <div className="mt-1.5 pt-1.5 border-t border-white/10 text-[9px] font-mono text-stone-300 space-y-0.5">
            <div className="text-white font-bold">Sources:</div>
            <div>• Esri Satellite GIS</div>
            <div>• Ingested Telemetry</div>
          </div>
        )}
      </div>

      <MapContainer 
        center={mapCenter} 
        zoom={targetZoom} 
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', background: '#121417' }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <MapController center={mapCenter} zoom={targetZoom} />
        
        {/* BASE TILE LAYERS: SATELLITE (DEFAULT) OR STREETS */}
        {baseTileMode === 'physical_satellite' ? (
          <>
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              maxZoom={19}
            />
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; Esri'
              maxZoom={19}
              opacity={0.7}
            />
          </>
        ) : (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            maxZoom={19}
          />
        )}

        {/* SUBTLE FOCUS RING ON SELECTED DISTRICT ONLY — NO HUGE OVERLAPPING CIRCLES */}
        {activeEvaluation && isValidCoord(activeEvaluation.district.lat, activeEvaluation.district.lon) && (
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

        {/* CIVICPULSE CITIZEN DEMAND HOTSPOT PINS */}
        {layers.citizen_demand && displayedEvaluations.map((item) => {
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
                    <span className={`text-[10px] px-1.5 py-0.5 font-bold uppercase rounded ${
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
                <div className="bg-[#F7F5EF] border border-[#171717] shadow-[4px_4px_0px_#171717] overflow-hidden text-[#171717] -m-4">
                  <div className="p-4 space-y-3 font-mono">
                    <div className="flex items-center justify-between border-b border-[#171717]/20 pb-2">
                      <span className="text-xs font-bold text-[#D65A3A] uppercase tracking-wider">
                        {item.district.name} • {item.district.state}
                      </span>
                      <span className="text-[10px] bg-[#171717] text-white px-2 py-0.5">
                        {evidence.reportId}
                      </span>
                    </div>

                    <div className="text-xs bg-white p-2.5 border border-[#171717]/20 space-y-1">
                      <div className="text-[10px] text-[#171717]/60 uppercase">Field Assessment:</div>
                      <div className="font-sans text-[#171717] font-semibold">"{evidence.sub}"</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="bg-[#F7F5EF] p-2 border border-[#171717]/20">
                        <span className="text-[#171717]/60 block">CITIZEN DEMAND:</span>
                        <span className="font-bold text-[#D65A3A]">{item.demandCount} Requests</span>
                      </div>
                      <div className="bg-[#F7F5EF] p-2 border border-[#171717]/20">
                        <span className="text-[#171717]/60 block">PRIORITY SCORE:</span>
                        <span className="font-bold text-[#171717]">{score} / 100</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {onOpenEvidenceModal && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenEvidenceModal(item.district, item.category, item.demandHotspot);
                          }}
                          className="flex-1 bg-white hover:bg-stone-100 text-[#171717] py-2 text-xs font-mono font-bold uppercase transition-colors border border-[#171717] flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Evidence</span>
                        </button>
                      )}
                      {onSelectHotspotForPolicy && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectHotspotForPolicy(item.district, item.category);
                          }}
                          className="flex-1 bg-[#171717] hover:bg-[#D65A3A] text-white py-2 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer border border-[#171717] flex items-center justify-center gap-1"
                        >
                          <span>Policy Brief →</span>
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
        {layers.healthcare && displayedEvaluations.map((item) => (
          <Marker
            key={`hc-${item.district.id}`}
            position={[item.district.lat + 0.04, item.district.lon - 0.04]}
            icon={createAtlasIcon('Health', false, 'healthcare')}
          >
            <Tooltip direction="top" className="bg-[#171717] text-white border border-white/20 font-mono text-xs">
              <div>🏥 {item.district.name} District Hospital & PHC</div>
            </Tooltip>
          </Marker>
        ))}

        {/* EDUCATION INSTITUTIONS LAYER */}
        {layers.education && displayedEvaluations.map((item) => (
          <Marker
            key={`edu-${item.district.id}`}
            position={[item.district.lat - 0.04, item.district.lon + 0.04]}
            icon={createAtlasIcon('Education', false, 'education')}
          >
            <Tooltip direction="top" className="bg-[#171717] text-white border border-white/20 font-mono text-xs">
              <div>🎓 {item.district.name} Govt Polytechnic & High School</div>
            </Tooltip>
          </Marker>
        ))}

        {/* GOVERNMENT SANCTIONED PROJECTS LAYER */}
        {layers.projects && displayedEvaluations.map((item) => (
          <Marker
            key={`proj-${item.district.id}`}
            position={[item.district.lat + 0.02, item.district.lon + 0.05]}
            icon={createAtlasIcon('Project', false, 'project')}
          >
            <Tooltip direction="top" className="bg-[#171717] text-white border border-white/20 font-mono text-xs">
              <div>🏗️ Active Project Site — Sanction ₹14.8 Cr</div>
            </Tooltip>
          </Marker>
        ))}

        {/* DIGITAL CONNECTIVITY TOWERS LAYER */}
        {layers.digital && displayedEvaluations.map((item) => (
          <Marker
            key={`dig-${item.district.id}`}
            position={[item.district.lat - 0.03, item.district.lon - 0.05]}
            icon={createAtlasIcon('Digital', false, 'digital')}
          >
            <Tooltip direction="top" className="bg-[#171717] text-white border border-white/20 font-mono text-xs">
              <div>📡 BharatNet Optical Fiber Distribution Node</div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
