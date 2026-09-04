import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker, Tooltip, Popup, useMap, ZoomControl, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Bot, FileText, Camera, Hammer, MessageSquare, TrendingUp, Flame, ChevronRight, Layers, Sparkles,
  Building2, Stethoscope, GraduationCap, Bus, Wifi, Users, Activity
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
  const [baseTileMode, setBaseTileMode] = useState<'physical_satellite' | 'physical_topo' | 'physical_shaded' | 'vector_voyager'>('physical_satellite');
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
    return [16.5062, 80.6480];
  }, [activeDistrictId, evaluations, countryConfig]);

  const defaultZoom = countryConfig.coordinates.zoom || 5;

  // Filter evaluations to only those with valid numeric coordinates to avoid Leaflet NaN LatLng errors
  const validEvaluations = useMemo(() => {
    return evaluations.filter(e => e.district && isValidCoord(e.district.lat, e.district.lon));
  }, [evaluations]);

  // Custom marker icon creation
  const createAtlasIcon = (category: string, isSelected: boolean, type: string = 'demand') => {
    let iconSymbol = '📍';
    let bg = '#171717';
    let border = '#D65A3A';

    if (type === 'healthcare') { iconSymbol = '🏥'; bg = '#285943'; border = '#ffffff'; }
    else if (type === 'education') { iconSymbol = '🎓'; bg = '#285943'; border = '#ffffff'; }
    else if (type === 'project') { iconSymbol = '🏗️'; bg = '#D9A441'; border = '#171717'; }
    else if (type === 'digital') { iconSymbol = '📡'; bg = '#171717'; border = '#D9A441'; }
    else if (category === 'Water') iconSymbol = '💧';
    else if (category === 'Drainage') iconSymbol = '🌊';
    else if (category === 'Roads') iconSymbol = '🛣️';
    else if (category === 'Electricity') iconSymbol = '⚡';

    return L.divIcon({
      className: 'bg-transparent border-none',
      html: `
        <div style="
          position: relative; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          width: ${isSelected ? '36px' : '28px'}; 
          height: ${isSelected ? '36px' : '28px'};
          background-color: ${bg};
          border: 2px solid ${border};
          box-shadow: 2px 2px 0px rgba(0,0,0,0.8);
          font-size: ${isSelected ? '16px' : '12px'};
          transition: all 0.2s ease;
        ">
          ${iconSymbol}
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

  return (
    <div className="w-full h-full relative z-0 bg-[#0f172a]" style={{ minHeight: '600px' }}>
      {/* FLOATING PHYSICAL MAP VIEW SELECTOR */}
      <div className="absolute top-4 right-4 z-20 bg-[#171717]/90 text-white border border-[#333] p-1.5 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] flex items-center gap-1 font-mono text-[11px] backdrop-blur-sm">
        <span className="text-[10px] text-gray-400 font-bold px-2 uppercase tracking-wider hidden sm:inline">PHYSICAL MAP:</span>
        <button
          onClick={() => setBaseTileMode('physical_satellite')}
          className={`px-2.5 py-1 font-bold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1.5 ${
            baseTileMode === 'physical_satellite'
              ? 'bg-[#D65A3A] text-white border-[#D65A3A] shadow-inner'
              : 'bg-[#262626] text-gray-300 border-[#404040] hover:bg-[#333] hover:text-white'
          }`}
          title="High-resolution physical satellite & terrain imagery with administrative overlays"
        >
          <span>🛰️</span>
          <span>Satellite</span>
        </button>
        <button
          onClick={() => setBaseTileMode('physical_topo')}
          className={`px-2.5 py-1 font-bold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1.5 ${
            baseTileMode === 'physical_topo'
              ? 'bg-[#D65A3A] text-white border-[#D65A3A] shadow-inner'
              : 'bg-[#262626] text-gray-300 border-[#404040] hover:bg-[#333] hover:text-white'
          }`}
          title="Physical topographic contours, elevation profiles, and relief"
        >
          <span>🏔️</span>
          <span>Topo Relief</span>
        </button>
        <button
          onClick={() => setBaseTileMode('physical_shaded')}
          className={`px-2.5 py-1 font-bold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1.5 ${
            baseTileMode === 'physical_shaded'
              ? 'bg-[#D65A3A] text-white border-[#D65A3A] shadow-inner'
              : 'bg-[#262626] text-gray-300 border-[#404040] hover:bg-[#333] hover:text-white'
          }`}
          title="Shaded physical terrain & geographic landscape view"
        >
          <span>🏞️</span>
          <span>Terrain</span>
        </button>
        <button
          onClick={() => setBaseTileMode('vector_voyager')}
          className={`px-2.5 py-1 font-bold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1.5 ${
            baseTileMode === 'vector_voyager'
              ? 'bg-[#D65A3A] text-white border-[#D65A3A] shadow-inner'
              : 'bg-[#262626] text-gray-300 border-[#404040] hover:bg-[#333] hover:text-white'
          }`}
          title="Standard vector administrative road atlas"
        >
          <span>🗺️</span>
          <span>Vector</span>
        </button>
      </div>

      <MapContainer 
        center={mapCenter} 
        zoom={defaultZoom} 
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', background: '#0f172a' }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <MapController center={mapCenter} zoom={activeDistrictId ? (defaultZoom + 1) : defaultZoom} />
        
        {/* DYNAMIC BASE TILE LAYERS */}
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
              opacity={0.85}
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
          <>
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}"
              attribution='Tiles &copy; Esri &mdash; Source: US National Park Service'
              maxZoom={19}
            />
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; Esri'
              maxZoom={19}
              opacity={0.7}
            />
          </>
        )}

        {baseTileMode === 'vector_voyager' && (
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            maxZoom={19}
          />
        )}

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
              icon={createAtlasIcon(item.category, isSelected, 'demand')}
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

