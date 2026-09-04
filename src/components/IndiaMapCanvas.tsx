import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker, Circle, Tooltip, Popup, useMap, ZoomControl, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Building2, Stethoscope, GraduationCap, Bus, Wifi, Users, Activity, Info, Flame
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

interface IndiaMapCanvasProps {
  evaluations: EvaluatedDistrict[];
  activeDistrictId: string;
  onSelectDistrict: (districtId: string) => void;
  selectedCategory: InfrastructureCategory | 'All';
  layers: MapLayerState;
  onSelectHotspotForPolicy?: (district: District, category: InfrastructureCategory) => void;
  selectedCountryCode?: CountryCode;
}

const isValidCoord = (lat?: number, lon?: number): boolean => {
  return typeof lat === 'number' && typeof lon === 'number' && !isNaN(lat) && !isNaN(lon) && isFinite(lat) && isFinite(lon);
};

const getReportEvidence = (district: District, category: string, hotspot: CityDemandHotspot) => {
  const images = {
    Water: {
      title: 'Drinking Water Pipeline Fracture & Ingress',
      tag: '#WaterContamination',
      sub: 'Main municipal feeder pipe ruptured near crossroad; muddy water entering overhead tanks.',
      officer: 'Er. Rajesh Kumar, Executive Engineer',
      actionDate: '28 Aug 2026',
      status: 'In Sanction Tender'
    },
    Drainage: {
      title: 'Monsoon Stormwater Drain Overflow',
      tag: '#DrainageBlockage',
      sub: 'Severe silt accumulation causing 1.5 ft waterlogging across residential streets.',
      officer: 'Smt. Priya Sharma, Municipal Health Officer',
      actionDate: '29 Aug 2026',
      status: 'Desilting Sanctioned'
    },
    Roads: {
      title: 'Heavy Arterial Pothole Grid Failure',
      tag: '#RoadSafetyDeficit',
      sub: 'Multiple deep craters along 4.2 km main transit corridor impeding bus connectivity.',
      officer: 'K. Venkatesh, Superintending Engineer (R&B)',
      actionDate: '26 Aug 2026',
      status: 'Work Order Issued'
    },
    Electricity: {
      title: 'Substation Voltage Drop & Streetlight Outage',
      tag: '#GridReliability',
      sub: '14 consecutive street poles dark for 3 weeks creating severe nighttime hazard.',
      officer: 'T. N. Murthy, ADE (APSPDCL)',
      actionDate: '27 Aug 2026',
      status: 'Under AI Prioritization'
    },
    Health: {
      title: 'Primary Health Clinic Staff & Bed Deficit',
      tag: '#PrimaryHealthAccess',
      sub: 'Single doctor handling 180+ outpatients daily without functioning diagnostics.',
      officer: 'Dr. Anita Desai, DMHO',
      actionDate: '25 Aug 2026',
      status: 'Policy Lab Review'
    },
  };

  const defaultEvidence = images[category as keyof typeof images] || images.Water;
  const safeLatVal = isValidCoord(district.lat, district.lon) ? district.lat : 16.5;
  return {
    ...defaultEvidence,
    reportId: `CP-${district.name.substring(0, 3).toUpperCase()}-${Math.floor(1000 + (Math.abs(safeLatVal) * 100) % 9000)}`,
    reporter: 'CivicPulse Citizen Network',
    timestamp: 'Today, 02:34 PM',
    commentsCount: Math.max(4, Math.round(hotspot.totalCitizenRequests / 450)),
    upvotes: Math.max(120, Math.round(hotspot.totalCitizenRequests * 1.8)),
  };
};

// Component to dynamically pan and zoom smoothly to active district
const MapController = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    if (Array.isArray(center) && center.length === 2 && isValidCoord(center[0], center[1])) {
      map.flyTo(center, zoom, { animate: true, duration: 1.2 });
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
}) => {
  const [baseTileMode, setBaseTileMode] = useState<'physical_satellite' | 'vector_voyager'>('physical_satellite');
  const [showMapSources, setShowMapSources] = useState(false);
  const countryConfig = GLOBAL_COUNTRIES[selectedCountryCode] || GLOBAL_COUNTRIES['IN'];

  // Filter evaluations to only those with valid numeric coordinates
  const validEvaluations = useMemo(() => {
    return evaluations.filter(e => e.district && isValidCoord(e.district.lat, e.district.lon));
  }, [evaluations]);

  const activeEvaluation = useMemo(() => {
    return validEvaluations.find(e => e.district.id === activeDistrictId);
  }, [validEvaluations, activeDistrictId]);

  // Calculate map center based on active district, first valid evaluation, or country center coordinates
  const mapCenter = useMemo<[number, number]>(() => {
    if (activeEvaluation && isValidCoord(activeEvaluation.district.lat, activeEvaluation.district.lon)) {
      return [activeEvaluation.district.lat, activeEvaluation.district.lon];
    }
    const validEval = validEvaluations[0];
    if (validEval) {
      return [validEval.district.lat, validEval.district.lon];
    }
    if (countryConfig?.coordinates && isValidCoord(countryConfig.coordinates.lat, countryConfig.coordinates.lng)) {
      return [countryConfig.coordinates.lat, countryConfig.coordinates.lng];
    }
    return [20.5937, 78.9629];
  }, [activeEvaluation, validEvaluations, countryConfig]);

  const defaultZoom = countryConfig?.coordinates?.zoom || 5;
  // Smoothly zoom in closer to inspect when a district is selected
  const targetZoom = activeDistrictId ? 8 : defaultZoom;

  // Clean, modern CivicPulse pin icon creation
  const createAtlasIcon = (category: string, isSelected: boolean, type: string = 'demand', score: number = 50) => {
    let iconSymbol = '📍';
    let bg = '#171717';

    if (type === 'healthcare') { iconSymbol = '🏥'; bg = '#285943'; }
    else if (type === 'education') { iconSymbol = '🎓'; bg = '#285943'; }
    else if (type === 'project') { iconSymbol = '🏗️'; bg = '#D9A441'; }
    else if (type === 'digital') { iconSymbol = '📡'; bg = '#171717'; }
    else if (score >= 70) {
      bg = '#D65A3A'; // High Priority CivicPulse Orange/Red
    } else if (score >= 40) {
      bg = '#D9A441'; // Medium Priority Amber
    } else {
      bg = '#285943'; // Emerging Priority Green
    }

    if (category === 'Water') iconSymbol = '💧';
    else if (category === 'Drainage') iconSymbol = '🌊';
    else if (category === 'Roads') iconSymbol = '🛣️';
    else if (category === 'Electricity') iconSymbol = '⚡';

    const size = isSelected ? 32 : 24;
    const ringSize = isSelected ? 44 : 0;

    return L.divIcon({
      className: 'bg-transparent border-none',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: ${size}px; height: ${size}px;">
          ${isSelected ? `
            <div style="
              position: absolute;
              width: ${ringSize}px;
              height: ${ringSize}px;
              border-radius: 50%;
              border: 2px solid #ffffff;
              background: ${bg}33;
              animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
          ` : ''}
          <div style="
            position: relative; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            width: ${size}px; 
            height: ${size}px;
            border-radius: 50%;
            background-color: ${bg};
            border: 2px solid #ffffff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.3);
            font-size: ${isSelected ? '14px' : '11px'};
            color: #ffffff;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
            cursor: pointer;
            z-index: ${isSelected ? 50 : 10};
          ">
            ${iconSymbol}
          </div>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2],
    });
  };

  return (
    <div className="w-full h-full relative z-0 bg-[#121417] overflow-hidden" style={{ minHeight: '520px' }}>
      {/* 1. BREADCRUMB & CONTEXTUAL BADGE OVERLAY (TOP-LEFT) */}
      <div className="absolute top-3 left-3 z-20 bg-[#171717]/85 border border-white/20 px-3 py-1.5 shadow-md backdrop-blur-md flex items-center space-x-2 font-mono text-[11px] text-white rounded-lg">
        <span className="text-xs">🇮🇳</span>
        <span className="font-bold tracking-wider uppercase">INDIA</span>
        <span className="text-white/40">/</span>
        <span className="font-semibold text-[#D65A3A] uppercase">
          {activeEvaluation?.district.state || 'NATIONAL MONITOR'}
        </span>
        {activeEvaluation && (
          <>
            <span className="text-white/40">/</span>
            <span className="font-bold uppercase text-white underline decoration-[#D65A3A] decoration-2">
              {activeEvaluation.district.name}
            </span>
          </>
        )}
      </div>

      {/* DATA STATUS INDICATOR (TOP-CENTER) */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center gap-1.5 bg-[#171717]/90 text-white border border-white/20 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-md backdrop-blur-md">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>CITIZEN SIGNALS · REAL-TIME PRIORITY</span>
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

      {/* 3. REFINED FLOATING CIVIC PRIORITY LEGEND (BOTTOM-LEFT) */}
      <div className="absolute bottom-4 left-4 z-20 bg-[#171717]/90 text-white border border-white/20 p-3 shadow-xl backdrop-blur-md font-sans text-xs rounded-xl space-y-2 max-w-[210px]">
        <div className="font-mono text-[10px] font-bold text-[#D65A3A] uppercase tracking-wider border-b border-white/15 pb-1 flex items-center justify-between">
          <span>CIVIC PRIORITY</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D65A3A] animate-pulse"></span>
        </div>
        <div className="space-y-1.5 font-medium text-[11px] text-gray-200">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D65A3A] border border-white shadow-xs inline-block"></span>
              <span>High Priority</span>
            </span>
            <span className="font-mono text-[10px] text-gray-300 font-bold">70+</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D9A441] border border-white shadow-xs inline-block"></span>
              <span>Medium Priority</span>
            </span>
            <span className="font-mono text-[10px] text-gray-300 font-bold">40–69</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#285943] border border-white shadow-xs inline-block"></span>
              <span>Emerging</span>
            </span>
            <span className="font-mono text-[10px] text-gray-300 font-bold">&lt;40</span>
          </div>
        </div>

        {/* MAP SOURCES DROPDOWN */}
        <div className="pt-1.5 border-t border-white/15">
          <button
            onClick={() => setShowMapSources(!showMapSources)}
            className="w-full bg-white/10 hover:bg-white/20 text-gray-200 px-2 py-1 text-[9px] font-mono font-bold uppercase transition-all rounded flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3 text-[#D65A3A]" />
              <span>DATA SOURCES</span>
            </span>
            <span>{showMapSources ? '▲' : '▼'}</span>
          </button>

          {showMapSources && (
            <div className="mt-2 p-2 bg-[#1f2227] border border-white/20 rounded text-[9px] font-mono space-y-1 text-gray-300 shadow-sm">
              <div>
                <strong className="block text-white">IMAGERY & CONTEXT:</strong>
                <span>Esri World Imagery & Reference</span>
              </div>
              <div>
                <strong className="block text-white">CIVIC SIGNALS:</strong>
                <span>CivicPulse Ingestion Matrix</span>
              </div>
            </div>
          )}
        </div>
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
              opacity={0.65}
            />
          </>
        ) : (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            maxZoom={19}
          />
        )}

        {/* HIGHLIGHT ONLY THE SELECTED DISTRICT (SUBTLE OUTLINE & GLOW) */}
        {activeEvaluation && (
          <>
            {/* Outer subtle focus perimeter */}
            <Circle
              center={[activeEvaluation.district.lat, activeEvaluation.district.lon]}
              radius={22000}
              pathOptions={{
                color: '#D65A3A',
                weight: 2,
                dashArray: '5, 5',
                opacity: 0.85,
                fillColor: '#D65A3A',
                fillOpacity: 0.08,
              }}
              interactive={false}
            />
            {/* Inner focused core halo */}
            <Circle
              center={[activeEvaluation.district.lat, activeEvaluation.district.lon]}
              radius={8500}
              pathOptions={{
                color: '#FFFFFF',
                weight: 1.5,
                opacity: 0.9,
                fillColor: '#D65A3A',
                fillOpacity: 0.18,
              }}
              interactive={false}
            />
          </>
        )}

        {/* 1. SUBTLE TRANSLUCENT PRIORITY ZONES BEHIND MARKERS */}
        {validEvaluations.map((item) => {
          const isSelected = item.district.id === activeDistrictId;
          const score = item.breakdown.total_score;
          const zoneColor = score >= 70 ? '#D65A3A' : score >= 40 ? '#D9A441' : '#285943';
          const zoneRadius = isSelected ? 28 : (score >= 70 ? 20 : score >= 40 ? 15 : 12);
          const zoneOpacity = isSelected ? 0.35 : (score >= 70 ? 0.22 : 0.15);

          return (
            <CircleMarker
              key={`zone-${item.district.id}`}
              center={[item.district.lat, item.district.lon]}
              radius={zoneRadius}
              pathOptions={{
                fillColor: zoneColor,
                fillOpacity: zoneOpacity,
                stroke: true,
                color: zoneColor,
                weight: isSelected ? 2 : 1,
                opacity: isSelected ? 0.9 : 0.4,
              }}
              interactive={false}
            />
          );
        })}

        {/* 2. REGIONAL CONNECTIVITY NETWORK (WHEN ROADS LAYER ENABLED) */}
        {layers.roads && (
          <>
            <Polyline
              positions={[
                [16.5062, 80.6480], // Vijayawada
                [16.3067, 80.4365], // Guntur
                [14.4426, 79.9865], // Nellore
                [13.2172, 79.1003], // Chittoor
              ]}
              pathOptions={{ color: '#ffffff', weight: 1.5, opacity: 0.6, dashArray: '4,6' }}
            />
            <Polyline
              positions={[
                [21.1458, 79.0882], // Nagpur
                [19.1383, 77.3210], // Nanded
                [17.6599, 75.9064], // Solapur
              ]}
              pathOptions={{ color: '#ffffff', weight: 1.5, opacity: 0.6, dashArray: '4,6' }}
            />
          </>
        )}

        {/* 3. CIVICPULSE CITIZEN DEMAND HOTSPOT PINS */}
        {layers.citizen_demand && validEvaluations.map((item) => {
          const isSelected = item.district.id === activeDistrictId;
          const evidence = getReportEvidence(item.district, item.category, item.demandHotspot);

          return (
            <Marker
              key={`demand-${item.district.id}`}
              position={[item.district.lat, item.district.lon]}
              icon={createAtlasIcon(item.category, isSelected, 'demand', item.breakdown.total_score)}
              eventHandlers={{
                click: () => onSelectDistrict(item.district.id),
              }}
            >
              <Tooltip direction="top" offset={[0, -18]} className="bg-[#171717] text-white border border-white/20 rounded-md shadow-lg !p-0">
                <div className="px-3 py-2 text-xs font-mono font-medium flex flex-col gap-1">
                  <div className="flex justify-between items-center gap-3">
                    <span className="font-bold text-sm text-white">{item.district.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 font-bold uppercase rounded ${
                      item.breakdown.total_score >= 70 ? 'bg-[#D65A3A] text-white' : item.breakdown.total_score >= 40 ? 'bg-[#D9A441] text-black' : 'bg-[#285943] text-white'
                    }`}>
                      {item.breakdown.total_score >= 70 ? 'High' : item.breakdown.total_score >= 40 ? 'Medium' : 'Emerging'}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-300 flex items-center justify-between gap-4">
                    <span>Score: <strong className="text-white">{item.breakdown.total_score}/100</strong></span>
                    <span>Signals: <strong className="text-white">{item.demandCount}</strong></span>
                  </div>
                  <div className="text-[10px] text-gray-400 border-t border-white/10 pt-1">
                    {item.category} • Click to inspect
                  </div>
                </div>
              </Tooltip>

              <Popup offset={[0, -20]} className="custom-popup" maxWidth={360} minWidth={300}>
                <div className="bg-[#F7F5EF] border border-[#171717] shadow-[4px_4px_0px_#171717] overflow-hidden text-[#171717] -m-4">
                  <div className="p-4 space-y-3 font-mono">
                    <div className="flex items-center justify-between border-b border-[#171717]/20 pb-2">
                      <span className="text-xs font-bold text-[#D65A3A] uppercase tracking-wider">
                        {item.district.name} • GAZETTE
                      </span>
                      <span className="text-[10px] bg-[#171717] text-white px-2 py-0.5">
                        {evidence.reportId}
                      </span>
                    </div>

                    <div className="text-xs bg-white p-2.5 border border-[#171717]/20 space-y-1">
                      <div className="text-[10px] text-[#171717]/60 uppercase">Issue Summary:</div>
                      <div className="font-sans text-[#171717] font-semibold">"{evidence.sub}"</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="bg-[#F7F5EF] p-2 border border-[#171717]/20">
                        <span className="text-[#171717]/60 block">DEMAND:</span>
                        <span className="font-bold text-[#D65A3A]">{item.demandCount} Requests</span>
                      </div>
                      <div className="bg-[#F7F5EF] p-2 border border-[#171717]/20">
                        <span className="text-[#171717]/60 block">PRIORITY:</span>
                        <span className="font-bold text-[#171717]">{item.breakdown.total_score} / 100</span>
                      </div>
                    </div>

                    {onSelectHotspotForPolicy && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectHotspotForPolicy(item.district, item.category);
                        }}
                        className="w-full bg-[#171717] hover:bg-[#D65A3A] text-white py-2 text-xs font-mono font-bold uppercase tracking-widest transition-colors cursor-pointer border border-[#171717]"
                      >
                        Draft Policy Brief →
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 4. HEALTHCARE CLINICS LAYER */}
        {layers.healthcare && validEvaluations.map((item) => (
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

        {/* 5. EDUCATION INSTITUTIONS LAYER */}
        {layers.education && validEvaluations.map((item) => (
          <Marker
            key={`edu-${item.district.id}`}
            position={[item.district.lat - 0.04, item.district.lon + 0.04]}
            icon={createAtlasIcon('Education', false, 'education')}
          >
            <Tooltip direction="top" className="bg-[#171717] text-white border border-white/20 font-mono text-xs">
              <div>🎓 {item.district.name} Govt ITI & High School</div>
            </Tooltip>
          </Marker>
        ))}

        {/* 6. GOVERNMENT SANCTIONED PROJECTS LAYER */}
        {layers.projects && validEvaluations.map((item) => (
          <Marker
            key={`proj-${item.district.id}`}
            position={[item.district.lat + 0.02, item.district.lon + 0.05]}
            icon={createAtlasIcon('Project', false, 'project')}
          >
            <Tooltip direction="top" className="bg-[#171717] text-white border border-white/20 font-mono text-xs">
              <div>🏗️ Active Project Site — ₹12.5 Cr Sanction</div>
            </Tooltip>
          </Marker>
        ))}

        {/* 7. DIGITAL CONNECTIVITY TOWERS LAYER */}
        {layers.digital && validEvaluations.map((item) => (
          <Marker
            key={`dig-${item.district.id}`}
            position={[item.district.lat - 0.03, item.district.lon - 0.05]}
            icon={createAtlasIcon('Digital', false, 'digital')}
          >
            <Tooltip direction="top" className="bg-[#171717] text-white border border-white/20 font-mono text-xs">
              <div>📡 BharatNet Fiber Node & 5G Tower</div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

