import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker, Tooltip, Popup, useMap, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Bot, FileText, Camera, Hammer, MessageSquare, TrendingUp, Flame, ChevronRight, Layers, Sparkles
} from 'lucide-react';
import { District, CitizenRequest, InfrastructureCategory, ScoreBreakdown } from '../types';
import { CityDemandHotspot } from '../utils/demandAggregation';

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

interface IndiaMapCanvasProps {
  evaluations: EvaluatedDistrict[];
  activeDistrictId: string;
  onSelectDistrict: (districtId: string) => void;
  selectedCategory: InfrastructureCategory | 'All';
  onSelectHotspotForPolicy?: (district: District, category: InfrastructureCategory) => void;
}

const CATEGORY_STYLES: Record<string, { color: string; bg: string; icon: string; border: string }> = {
  Water: { color: '#0284c7', bg: '#e0f2fe', icon: '💧', border: '#38bdf8' },
  Drainage: { color: '#0d9488', bg: '#ccfbf1', icon: '🌊', border: '#2dd4bf' },
  Roads: { color: '#ea580c', bg: '#ffedd5', icon: '🛣️', border: '#fb923c' },
  Electricity: { color: '#ca8a04', bg: '#fef9c3', icon: '⚡', border: '#facc15' },
  Health: { color: '#e11d48', bg: '#ffe4e6', icon: '🏥', border: '#fb7185' },
  Healthcare: { color: '#e11d48', bg: '#ffe4e6', icon: '🏥', border: '#fb7185' },
  Sanitation: { color: '#059669', bg: '#d1fae5', icon: '🗑️', border: '#34d399' },
  Education: { color: '#7c3aed', bg: '#ede9fe', icon: '🎓', border: '#a78bfa' },
  Other: { color: '#475569', bg: '#f1f5f9', icon: '📍', border: '#94a3b8' },
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
  return {
    ...defaultEvidence,
    reportId: `CP-${district.name.substring(0, 3).toUpperCase()}-${Math.floor(1000 + (district.lat * 100) % 9000)}`,
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
    map.flyTo(center, zoom, { animate: true, duration: 1 });
  }, [center, zoom, map]);
  return null;
};

export const IndiaMapCanvas: React.FC<IndiaMapCanvasProps> = ({
  evaluations,
  activeDistrictId,
  onSelectDistrict,
  selectedCategory,
  onSelectHotspotForPolicy,
}) => {
  const [selectedCalloutTab, setSelectedCalloutTab] = useState<'report' | 'photo' | 'action'>('report');
  const [geoData, setGeoData] = useState<any>(null);
  
  useEffect(() => {
    fetch('/india_states_official_simplified.geojson')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("Failed to load India bounds:", err));
  }, []);
  
  // Calculate map center based on active district or all evaluations
  const mapCenter = useMemo<[number, number]>(() => {
    const active = evaluations.find(e => e.district.id === activeDistrictId);
    if (active) return [active.district.lat, active.district.lon];
    if (evaluations.length > 0) return [evaluations[0].district.lat, evaluations[0].district.lon];
    return [20.5937, 78.9629]; // Center of India
  }, [activeDistrictId, evaluations]);

  // Create custom DivIcon for markers
  const createIcon = (catStyle: any, isCritical: boolean, isSelected: boolean) => {
    return L.divIcon({
      className: 'bg-transparent border-none',
      html: `
        <div style="position: relative; display: flex; justify-content: center; align-items: center; width: 100%; height: 100%;">
          ${isCritical ? `<div style="position: absolute; width: 50px; height: 50px; background: ${catStyle.color}; border-radius: 50%; filter: blur(15px); opacity: 0.6; mix-blend-mode: screen; animation: pulse 2s infinite;"></div>` : ''}
          <svg width="32" height="48" viewBox="-16 -48 32 48" style="transform: scale(${isSelected ? 1.2 : 1}); transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);">
             <g filter="drop-shadow(0px 8px 10px rgba(0,0,0,0.6))">
               <path
                  d="M 0 0 C -11 -14 -16 -23 -16 -32 C -16 -41 -9 -48 0 -48 C 9 -48 16 -41 16 -32 C 16 -23 11 -14 0 0 Z"
                  fill="${catStyle.color}"
                  stroke="#ffffff"
                  stroke-width="${isSelected ? '2.5' : '1.5'}"
               />
               <circle cx="0" cy="-32" r="10" fill="#ffffff" />
               <text x="0" y="-28" text-anchor="middle" font-size="11">${catStyle.icon}</text>
             </g>
          </svg>
        </div>
      `,
      iconSize: [40, 60],
      iconAnchor: [20, 60],
      popupAnchor: [0, -60],
    });
  };

  return (
    <div className="w-full h-full relative z-0" style={{ minHeight: '600px' }}>
      <MapContainer 
        center={mapCenter} 
        zoom={5} 
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%', background: '#dcdcdc' }} // light grey background like the image
        zoomControl={false}
      >
        <MapController center={mapCenter} zoom={activeDistrictId ? 6 : 5} />
        
        {/* Official India Political Map Overlay */}
        
        {geoData && (
          <GeoJSON 
            data={geoData} 
            style={{
              color: '#000000', // thick black border like the image
              weight: 2.5, 
              opacity: 1, 
              fillColor: '#3498db', // solid blue fill like the image
              fillOpacity: 1 
            }}
          />
        )}

        {/* Render heatmap glowing blurs under the pins */}
        {evaluations.map((item) => {
          const score = item.breakdown.total_score;
          if (score < 40) return null;
          
          let color = '#3b82f6';
          if (score >= 80) color = '#ef4444';
          else if (score >= 60) color = '#f59e0b';
          else if (score >= 40) color = '#10b981';

          return (
            <CircleMarker
              key={`heat-${item.district.id}`}
              center={[item.district.lat, item.district.lon]}
              radius={score >= 80 ? 40 : score >= 60 ? 30 : 20}
              pathOptions={{
                fillColor: color,
                fillOpacity: 0.25,
                stroke: false,
                className: 'mix-blend-screen pointer-events-none blur-[12px]'
              }}
            />
          );
        })}

        {/* Render interactive teardrop pins */}
        {evaluations.map((item) => {
          const catStyle = CATEGORY_STYLES[item.category] || CATEGORY_STYLES['Other'];
          const isCritical = item.breakdown.total_score >= 80;
          const isSelected = item.district.id === activeDistrictId;
          const evidence = getReportEvidence(item.district, item.category, item.demandHotspot);

          return (
            <Marker
              key={item.district.id}
              position={[item.district.lat, item.district.lon]}
              icon={createIcon(catStyle, isCritical, isSelected)}
              eventHandlers={{
                click: () => {
                  onSelectDistrict(item.district.id);
                },
              }}
            >
              {/* Tooltip shows purely on hover for quick info */}
              <Tooltip direction="top" offset={[0, -50]} className="bg-slate-900 border border-slate-700 text-white rounded-lg shadow-xl !p-0">
                <div className="px-3 py-2 text-xs font-semibold flex flex-col gap-1">
                  <div className="flex justify-between items-center gap-4">
                    <span>{item.district.name}</span>
                    <span className="font-mono text-[10px] bg-slate-800 px-1.5 rounded">{item.demandCount} Req</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Priority: {item.breakdown.total_score}/100</span>
                </div>
              </Tooltip>

              {/* Popup replaces the permanent modal, natively dismissible! */}
              <Popup offset={[0, -50]} className="custom-popup" maxWidth={380} minWidth={320} autoPanPadding={[20, 20]}>
                <div className="bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden text-white -m-4">
                  <div className="p-4 space-y-3.5">
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                          <Bot className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-100 flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5 text-sky-400" />
                              INFORMASI LAPORAN
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            ID: {evidence.reportId} • {item.district.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sub-Tabs */}
                    <div className="grid grid-cols-3 gap-1 bg-slate-800/80 p-1 rounded-xl text-[11px] font-bold">
                      <button className="py-1 rounded-lg bg-sky-600 text-white flex items-center justify-center gap-1">
                        <FileText className="w-3 h-3" /> Laporan
                      </button>
                      <button className="py-1 rounded-lg text-slate-400 hover:text-white flex items-center justify-center gap-1">
                        <Camera className="w-3 h-3" /> Photo
                      </button>
                      <button className="py-1 rounded-lg text-slate-400 hover:text-white flex items-center justify-center gap-1">
                        <Hammer className="w-3 h-3" /> Tindak
                      </button>
                    </div>

                    {/* Tab 1: Detailed Report Breakdown */}
                    <div className="space-y-2.5 text-xs">
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/60">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Channel:</span>
                          <strong className="text-slate-200">WhatsApp AI</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">District:</span>
                          <strong className="text-slate-200">{item.district.name}</strong>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-400 block text-[10px]">Coordinates:</span>
                          <strong className="text-sky-300 font-mono">{item.district.lat.toFixed(4)}, {item.district.lon.toFixed(4)}</strong>
                        </div>
                      </div>

                      {/* Tags & Description */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">
                            {evidence.tag}
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px] italic bg-slate-800/40 p-2 rounded-lg border border-slate-700/40">
                          "{evidence.sub}"
                        </p>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                            {evidence.commentsCount} Comments
                          </span>
                          <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {evidence.upvotes} Upvotes
                          </span>
                        </div>
                        
                        {onSelectHotspotForPolicy && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectHotspotForPolicy(item.district, item.category);
                            }}
                            className="w-full mt-1 bg-sky-600 hover:bg-sky-500 text-white py-1.5 rounded-lg flex items-center justify-center gap-1.5 font-bold transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Run Policy Simulation
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
