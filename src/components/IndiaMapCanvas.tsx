import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker, Tooltip, Popup, useMap, ZoomControl, Polyline, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Bot, FileText, Camera, Hammer, MessageSquare, TrendingUp, Flame, ChevronRight, Layers, Sparkles,
  Building2, Stethoscope, GraduationCap, Bus, Wifi, Users, Activity, Info
} from 'lucide-react';
import { District, CitizenRequest, InfrastructureCategory, ScoreBreakdown, CountryCode } from '../types';
import { CityDemandHotspot } from '../utils/demandAggregation';
import { GLOBAL_COUNTRIES } from '../data/globalConfig';
import indiaNationalGeoJSON from '../data/india-boundaries/india-national.json';
import indiaStatesGeoJSON from '../data/india-boundaries/india-states.json';

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

const INDIAN_STATE_LABELS = [
  { name: 'Ladakh', lat: 34.2, lon: 77.6, isUT: true },
  { name: 'Jammu and Kashmir', lat: 33.8, lon: 75.0, isUT: true },
  { name: 'Himachal Pradesh', lat: 31.8, lon: 77.2, isUT: false },
  { name: 'Punjab', lat: 31.0, lon: 75.4, isUT: false },
  { name: 'Uttarakhand', lat: 30.1, lon: 79.2, isUT: false },
  { name: 'Haryana', lat: 29.1, lon: 76.1, isUT: false },
  { name: 'Delhi', lat: 28.6, lon: 77.2, isUT: true },
  { name: 'Rajasthan', lat: 26.9, lon: 73.8, isUT: false },
  { name: 'Gujarat', lat: 22.3, lon: 71.8, isUT: false },
  { name: 'Madhya Pradesh', lat: 23.5, lon: 78.5, isUT: false },
  { name: 'Uttar Pradesh', lat: 26.8, lon: 80.9, isUT: false },
  { name: 'Maharashtra', lat: 19.5, lon: 75.8, isUT: false },
  { name: 'Andhra Pradesh', lat: 15.9, lon: 79.7, isUT: false },
  { name: 'Telangana', lat: 17.8, lon: 79.1, isUT: false },
  { name: 'Karnataka', lat: 15.3, lon: 75.7, isUT: false },
  { name: 'Tamil Nadu', lat: 11.1, lon: 78.7, isUT: false },
  { name: 'Kerala', lat: 10.2, lon: 76.4, isUT: false },
  { name: 'Odisha', lat: 20.5, lon: 84.4, isUT: false },
  { name: 'West Bengal', lat: 23.0, lon: 87.8, isUT: false },
  { name: 'Assam', lat: 26.2, lon: 92.9, isUT: false },
];

const createStateLabelIcon = (name: string, isSelected: boolean) => {
  return L.divIcon({
    className: 'custom-state-label-marker',
    html: `
      <div class="px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${
        isSelected
          ? 'bg-[#D65A3A] text-white shadow-md ring-1 ring-white'
          : 'bg-[#171717]/90 text-white border border-[#171717]/50 shadow-xs'
      } rounded whitespace-nowrap pointer-events-none">
        ${name}
      </div>
    `,
    iconSize: [90, 18],
    iconAnchor: [45, 9],
  });
};

// Component to dynamically pan to active district
const MapController = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    if (Array.isArray(center) && center.length === 2 && isValidCoord(center[0], center[1])) {
      map.flyTo(center, zoom, { animate: true, duration: 1 });
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
  const [baseTileMode, setBaseTileMode] = useState<'physical_satellite' | 'physical_topo' | 'physical_shaded' | 'vector_voyager'>('vector_voyager');
  const [showMapSources, setShowMapSources] = useState(false);
  const countryConfig = GLOBAL_COUNTRIES[selectedCountryCode] || GLOBAL_COUNTRIES['IN'];

  // Calculate map center based on active district, country evaluations, or country center coordinates
  const mapCenter = useMemo<[number, number]>(() => {
    const active = evaluations.find(e => e.district.id === activeDistrictId);
    if (active && isValidCoord(active.district.lat, active.district.lon)) {
      return [active.district.lat, active.district.lon];
    }
    const validEval = evaluations.find(e => isValidCoord(e.district?.lat, e.district?.lon));
    if (validEval) {
      return [validEval.district.lat, validEval.district.lon];
    }
    if (countryConfig?.coordinates && isValidCoord(countryConfig.coordinates.lat, countryConfig.coordinates.lng)) {
      return [countryConfig.coordinates.lat, countryConfig.coordinates.lng];
    }
    return [20.5937, 78.9629];
  }, [activeDistrictId, evaluations, countryConfig]);

  const defaultZoom = countryConfig.coordinates.zoom || 5;

  // Filter evaluations to only those with valid numeric coordinates to avoid Leaflet NaN LatLng errors
  const validEvaluations = useMemo(() => {
    return evaluations.filter(e => e.district && isValidCoord(e.district.lat, e.district.lon));
  }, [evaluations]);

  const activeEvaluation = useMemo(() => {
    return validEvaluations.find(e => e.district.id === activeDistrictId);
  }, [validEvaluations, activeDistrictId]);

  // Refined high-precision marker icon creation
  const createAtlasIcon = (category: string, isSelected: boolean, type: string = 'demand', score: number = 50) => {
    let iconSymbol = '📍';
    let bg = '#171717';
    let border = '#ffffff';

    if (type === 'healthcare') { iconSymbol = '🏥'; bg = '#285943'; border = '#ffffff'; }
    else if (type === 'education') { iconSymbol = '🎓'; bg = '#285943'; border = '#ffffff'; }
    else if (type === 'project') { iconSymbol = '🏗️'; bg = '#D9A441'; border = '#171717'; }
    else if (type === 'digital') { iconSymbol = '📡'; bg = '#171717'; border = '#D9A441'; }
    else if (score >= 70) {
      bg = '#D65A3A'; // High Priority CivicPulse Orange/Red
      border = '#ffffff';
    } else if (score >= 40) {
      bg = '#D9A441'; // Medium Priority Amber
      border = '#ffffff';
    } else {
      bg = '#285943'; // Emerging Priority Green
      border = '#ffffff';
    }

    if (category === 'Water') iconSymbol = '💧';
    else if (category === 'Drainage') iconSymbol = '🌊';
    else if (category === 'Roads') iconSymbol = '🛣️';
    else if (category === 'Electricity') iconSymbol = '⚡';

    const size = isSelected ? 34 : 26;
    const ringSize = isSelected ? 46 : 0;

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
              border: 2px solid ${bg};
              background: ${bg}1a;
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
            border: 2px solid ${border};
            box-shadow: 0 2px 6px rgba(0,0,0,0.25), 1px 1px 0px #171717;
            font-size: ${isSelected ? '15px' : '12px'};
            color: #ffffff;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
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
    <div className="w-full h-full relative z-0 bg-[#F7F5EF] overflow-hidden" style={{ minHeight: '520px' }}>
      {/* 1. BREADCRUMB & CONTEXTUAL BADGE OVERLAY (TOP-LEFT) */}
      <div className="absolute top-3 left-3 z-20 bg-[#F7F5EF]/95 border border-[#171717]/25 px-3 py-1.5 shadow-[2px_2px_0px_#171717] backdrop-blur-md flex items-center space-x-2 font-mono text-[11px] rounded-md">
        <span className="text-xs">🇮🇳</span>
        <span className="font-bold text-[#171717] tracking-wider uppercase">INDIA</span>
        <span className="text-[#171717]/40">/</span>
        <span className="font-semibold text-[#D65A3A] uppercase">
          {activeEvaluation?.district.state || 'ANDHRA PRADESH'}
        </span>
        {activeEvaluation && (
          <>
            <span className="text-[#171717]/40">/</span>
            <span className="font-bold text-[#171717] uppercase underline decoration-[#D65A3A]">
              {activeEvaluation.district.name}
            </span>
          </>
        )}
      </div>

      {/* DATA FRESHNESS INDICATOR (TOP-CENTER) */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center gap-1.5 bg-[#171717] text-white border border-[#171717] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest rounded shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>CITIZEN SIGNALS · LAST 30 DAYS</span>
      </div>

      {/* 2. FLOATING MAP TILE STYLE SELECTOR (TOP-RIGHT) */}
      <div className="absolute top-3 right-3 z-20 bg-[#F7F5EF]/95 border border-[#171717]/25 p-1 shadow-[2px_2px_0px_#171717] flex items-center gap-1 font-mono text-[10px] backdrop-blur-md rounded-md">
        <button
          onClick={() => setBaseTileMode('vector_voyager')}
          className={`px-2.5 py-1 font-bold uppercase tracking-wider transition-all cursor-pointer rounded ${
            baseTileMode === 'vector_voyager'
              ? 'bg-[#171717] text-white'
              : 'text-[#171717] hover:bg-[#171717]/10'
          }`}
          title="OpenStreetMap Standard Vector Map (No API Key Required)"
        >
          MAP
        </button>
        <button
          onClick={() => setBaseTileMode('physical_satellite')}
          className={`px-2.5 py-1 font-bold uppercase tracking-wider transition-all cursor-pointer rounded ${
            baseTileMode === 'physical_satellite'
              ? 'bg-[#171717] text-white'
              : 'text-[#171717] hover:bg-[#171717]/10'
          }`}
          title="High-Resolution Satellite Imagery"
        >
          SATELLITE
        </button>
        <button
          onClick={() => setBaseTileMode('physical_topo')}
          className={`px-2.5 py-1 font-bold uppercase tracking-wider transition-all cursor-pointer rounded ${
            baseTileMode === 'physical_topo'
              ? 'bg-[#171717] text-white'
              : 'text-[#171717] hover:bg-[#171717]/10'
          }`}
          title="Topographic Contour Map"
        >
          RELIEF
        </button>
      </div>

      {/* 3. REFINED FLOATING PRIORITY LEGEND (BOTTOM-LEFT) */}
      <div className="absolute bottom-4 left-4 z-20 bg-[#F7F5EF]/95 border border-[#171717]/25 p-3 shadow-[3px_3px_0px_#171717] backdrop-blur-md font-sans text-xs rounded-lg space-y-2 max-w-[220px]">
        <div className="font-mono text-[10px] font-bold text-[#D65A3A] uppercase tracking-wider border-b border-[#171717]/15 pb-1 flex items-center justify-between">
          <span>CIVIC PRIORITY</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D65A3A] animate-pulse"></span>
        </div>
        <div className="space-y-1.5 font-medium text-[11px] text-[#171717]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D65A3A] border border-white shadow-sm inline-block"></span>
              <span>High Priority</span>
            </span>
            <span className="font-mono text-[10px] text-slate-600 font-bold">70+</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D9A441] border border-white shadow-sm inline-block"></span>
              <span>Medium Priority</span>
            </span>
            <span className="font-mono text-[10px] text-slate-600 font-bold">40-69</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#285943] border border-white shadow-sm inline-block"></span>
              <span>Emerging</span>
            </span>
            <span className="font-mono text-[10px] text-slate-600 font-bold">&lt;40</span>
          </div>
        </div>

        {/* MAP SOURCES BUTTON */}
        <div className="pt-1.5 border-t border-[#171717]/15">
          <button
            onClick={() => setShowMapSources(!showMapSources)}
            className="w-full bg-[#171717]/5 hover:bg-[#171717] text-[#171717] hover:text-white px-2 py-1 text-[9px] font-mono font-bold uppercase transition-all rounded flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3 text-[#D65A3A]" />
              <span>MAP SOURCES</span>
            </span>
            <span>{showMapSources ? '▲' : '▼'}</span>
          </button>

          {showMapSources && (
            <div className="mt-2 p-2 bg-white border border-[#171717]/25 rounded text-[9px] font-mono space-y-1 text-[#171717]/90 shadow-sm animate-fadeIn">
              <div className="font-bold text-[#D65A3A] uppercase tracking-wide border-b border-slate-200 pb-0.5">MAP SOURCES</div>
              <div>
                <strong className="block text-[#171717]">BOUNDARIES:</strong>
                <span>Survey of India / Government of India GeoJSON</span>
              </div>
              <div>
                <strong className="block text-[#171717]">BASE MAP:</strong>
                <span>OpenStreetMap / Esri Canvas</span>
              </div>
              <div>
                <strong className="block text-[#171717]">CIVIC DATA:</strong>
                <span>CivicPulse Ingestion Matrix</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <MapContainer 
        center={mapCenter} 
        zoom={defaultZoom} 
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', background: '#F7F5EF' }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <MapController center={mapCenter} zoom={activeDistrictId ? (defaultZoom + 1) : defaultZoom} />
        
        {/* DYNAMIC BASE TILE LAYERS */}
        {baseTileMode === 'vector_voyager' && (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            maxZoom={19}
          />
        )}

        {baseTileMode === 'physical_satellite' && (
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
              opacity={0.4}
            />
          </>
        )}

        {baseTileMode === 'physical_topo' && (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
            attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
            maxZoom={19}
          />
        )}

        {baseTileMode === 'physical_shaded' && (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
          />
        )}

        {/* 1. CIVICPULSE OFFICIAL INDIA NATIONAL BOUNDARY OVERLAY */}
        <GeoJSON
          key="india-national-official-overlay"
          data={indiaNationalGeoJSON as any}
          style={{
            color: '#171717',
            weight: 2.5,
            opacity: 0.95,
            fillColor: '#F7F5EF',
            fillOpacity: 0.02,
          }}
        />

        {/* 2. CIVICPULSE OFFICIAL STATE/UT BOUNDARY OVERLAY */}
        <GeoJSON
          key="india-states-official-overlay"
          data={indiaStatesGeoJSON as any}
          style={(feature) => {
            const stateName = feature?.properties?.name;
            const isStateSelected = activeEvaluation && activeEvaluation.district.state === stateName;
            return {
              color: isStateSelected ? '#D65A3A' : '#333333',
              weight: isStateSelected ? 2.2 : 1.2,
              dashArray: isStateSelected ? 'none' : '3,3',
              fillColor: isStateSelected ? '#D65A3A' : 'transparent',
              fillOpacity: isStateSelected ? 0.12 : 0,
            };
          }}
        />

        {/* 3. OFFICIAL ENGLISH STATE & UNION TERRITORY LABELS OVERLAY */}
        {INDIAN_STATE_LABELS.map((labelItem) => {
          const isSelected = activeEvaluation && activeEvaluation.district.state === labelItem.name;
          return (
            <Marker
              key={`state-label-${labelItem.name}`}
              position={[labelItem.lat, labelItem.lon]}
              icon={createStateLabelIcon(labelItem.name, Boolean(isSelected))}
              interactive={false}
            />
          );
        })}

        {/* LAYER: POPULATION DENSITY HEATMAP */}
        {layers.population && validEvaluations.map((item) => (
          <CircleMarker
            key={`pop-${item.district.id}`}
            center={[item.district.lat, item.district.lon]}
            radius={Math.min(65, Math.max(25, item.district.population / 25000))}
            pathOptions={{
              fillColor: '#D9A441',
              fillOpacity: 0.25,
              stroke: true,
              color: '#D9A441',
              weight: 1,
              dashArray: '4,4'
            }}
          />
        ))}

        {/* LAYER: INFRASTRUCTURE GAP BOUNDARIES */}
        {layers.infrastructure && validEvaluations.map((item) => {
          const gap = 100 - item.currentAccess;
          if (gap < 20) return null;
          return (
            <CircleMarker
              key={`gap-${item.district.id}`}
              center={[item.district.lat, item.district.lon]}
              radius={Math.min(80, Math.max(30, gap * 1.2))}
              pathOptions={{
                fillColor: '#D65A3A',
                fillOpacity: 0.2,
                stroke: true,
                color: '#D65A3A',
                weight: 1.5
              }}
            />
          );
        })}

        {/* LAYER: ROADS NETWORK VECTORS */}
        {layers.roads && (
          <>
            <Polyline
              positions={[
                [16.5062, 80.6480], // Vijayawada
                [16.3067, 80.4365], // Guntur
                [14.4426, 79.9865], // Nellore
                [13.2172, 79.1003], // Chittoor
              ]}
              pathOptions={{ color: '#171717', weight: 2, dashArray: '6,6' }}
            />
            <Polyline
              positions={[
                [21.1458, 79.0882], // Nagpur
                [19.1383, 77.3210], // Nanded
                [17.6599, 75.9064], // Solapur
              ]}
              pathOptions={{ color: '#171717', weight: 2, dashArray: '6,6' }}
            />
          </>
        )}

        {/* LAYER: CITIZEN DEMAND PINS */}
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
              <Tooltip direction="top" offset={[0, -20]} className="bg-[#F7F5EF] border border-[#171717] text-[#171717] rounded-none shadow-[2px_2px_0px_#171717] !p-0">
                <div className="px-3 py-2 text-xs font-mono font-bold flex flex-col gap-1">
                  <div className="flex justify-between items-center gap-4">
                    <span className="font-serif">{item.district.name}</span>
                    <span className="text-[10px] bg-[#D65A3A] text-white px-1.5 font-mono">{item.demandCount} Req</span>
                  </div>
                  <span className="text-[10px] text-[#171717]/70 uppercase tracking-widest">
                    Score: {item.breakdown.total_score}/100 • {item.category}
                  </span>
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

        {/* LAYER: HEALTHCARE CLINICS */}
        {layers.healthcare && validEvaluations.map((item) => (
          <Marker
            key={`hc-${item.district.id}`}
            position={[item.district.lat + 0.04, item.district.lon - 0.04]}
            icon={createAtlasIcon('Health', false, 'healthcare')}
          >
            <Tooltip direction="top" className="bg-[#F7F5EF] border border-[#171717] text-[#171717] font-mono text-xs">
              <div>🏥 {item.district.name} District Hospital & PHC</div>
            </Tooltip>
          </Marker>
        ))}

        {/* LAYER: EDUCATION INSTITUTIONS */}
        {layers.education && validEvaluations.map((item) => (
          <Marker
            key={`edu-${item.district.id}`}
            position={[item.district.lat - 0.04, item.district.lon + 0.04]}
            icon={createAtlasIcon('Education', false, 'education')}
          >
            <Tooltip direction="top" className="bg-[#F7F5EF] border border-[#171717] text-[#171717] font-mono text-xs">
              <div>🎓 {item.district.name} Govt ITI & High School</div>
            </Tooltip>
          </Marker>
        ))}

        {/* LAYER: GOVERNMENT SANCTIONED PROJECTS */}
        {layers.projects && validEvaluations.map((item) => (
          <Marker
            key={`proj-${item.district.id}`}
            position={[item.district.lat + 0.02, item.district.lon + 0.05]}
            icon={createAtlasIcon('Project', false, 'project')}
          >
            <Tooltip direction="top" className="bg-[#F7F5EF] border border-[#171717] text-[#171717] font-mono text-xs">
              <div>🏗️ Active Project Site — ₹12.5 Cr Sanction</div>
            </Tooltip>
          </Marker>
        ))}

        {/* LAYER: DIGITAL CONNECTIVITY TOWERS */}
        {layers.digital && validEvaluations.map((item) => (
          <Marker
            key={`dig-${item.district.id}`}
            position={[item.district.lat - 0.03, item.district.lon - 0.05]}
            icon={createAtlasIcon('Digital', false, 'digital')}
          >
            <Tooltip direction="top" className="bg-[#F7F5EF] border border-[#171717] text-[#171717] font-mono text-xs">
              <div>📡 BharatNet Fiber Node & 5G Tower</div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

