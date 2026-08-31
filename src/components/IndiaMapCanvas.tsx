import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker, Tooltip, Popup, useMap, ZoomControl } from 'react-leaflet';
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
  Water: { color: '#1a237e', bg: '#f4f1ea', icon: '💧', border: '#1a237e' },
  Drainage: { color: '#1a237e', bg: '#f4f1ea', icon: '🌊', border: '#1a237e' },
  Roads: { color: '#1a237e', bg: '#f4f1ea', icon: '🛣️', border: '#1a237e' },
  Electricity: { color: '#1a237e', bg: '#f4f1ea', icon: '⚡', border: '#1a237e' },
  Health: { color: '#1a237e', bg: '#f4f1ea', icon: '🏥', border: '#1a237e' },
  Healthcare: { color: '#1a237e', bg: '#f4f1ea', icon: '🏥', border: '#1a237e' },
  Sanitation: { color: '#1a237e', bg: '#f4f1ea', icon: '🗑️', border: '#1a237e' },
  Education: { color: '#1a237e', bg: '#f4f1ea', icon: '🎓', border: '#1a237e' },
  Other: { color: '#1a237e', bg: '#f4f1ea', icon: '📍', border: '#1a237e' },
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
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', background: '#faf9f6' }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <MapController center={mapCenter} zoom={activeDistrictId ? 6 : 5} />
        
        {/* Minimal Atlas Map Overlay */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
          maxZoom={19}
        />

        {/* Render heatmap glowing blurs under the pins */}
        {evaluations.map((item) => {
          const score = item.breakdown.total_score;
          if (score < 40) return null;
          
          let color = '#d97706'; // default saffron
          if (score >= 80) color = '#c84b31'; // critical red
          else if (score >= 60) color = '#d97706'; // saffron
          else color = '#2e7d32'; // deep green (positive)

          return (
            <CircleMarker
              key={`heat-${item.district.id}`}
              center={[item.district.lat, item.district.lon]}
              radius={score >= 80 ? 40 : score >= 60 ? 30 : 20}
              pathOptions={{
                fillColor: color,
                fillOpacity: 0.35,
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
              <Tooltip direction="top" offset={[0, -50]} className="bg-[#f4f1ea] border border-[#1a237e] text-[#1a237e] rounded-none shadow-[2px_2px_0px_#1a237e] !p-0">
                <div className="px-3 py-2 text-xs font-sans font-bold flex flex-col gap-1">
                  <div className="flex justify-between items-center gap-4">
                    <span>{item.district.name}</span>
                    <span className="font-mono text-[10px] bg-[#1a237e] text-[#f4f1ea] px-1.5 border border-[#1a237e] uppercase tracking-widest">{item.demandCount} Req</span>
                  </div>
                  <span className="text-[10px] text-[#1a237e]/70 font-sans uppercase tracking-widest">Priority: {item.breakdown.total_score}/100</span>
                </div>
              </Tooltip>

              {/* Popup replaces the permanent modal, natively dismissible! */}
              <Popup offset={[0, -50]} className="custom-popup" maxWidth={380} minWidth={320} autoPanPadding={[20, 20]}>
                <div className="bg-[#f4f1ea] border-2 border-[#1a237e] shadow-[4px_4px_0px_#1a237e] overflow-hidden text-[#1a237e] -m-4">
                  <div className="p-4 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between border-b-2 border-double border-[#1a237e] pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#1a237e]/5 border border-[#1a237e] flex items-center justify-center text-[#c84b31]">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#1a237e] flex items-center gap-1">
                              <FileText className="w-3 h-3 text-[#c84b31]" />
                              Gazette Report
                            </span>
                          </div>
                          <span className="text-[10px] text-[#1a237e]/70 font-mono tracking-wide uppercase">
                            ID: {evidence.reportId} • {item.district.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sub-Tabs */}
                    <div className="flex gap-2 border-b border-[#1a237e]/20 pb-1 text-[10px] font-sans uppercase tracking-widest font-semibold">
                      <button className="pb-1 text-[#c84b31] border-b-2 border-[#c84b31] flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Report
                      </button>
                      <button className="pb-1 text-[#1a237e]/60 hover:text-[#1a237e] flex items-center gap-1">
                        <Camera className="w-3 h-3" /> Photo
                      </button>
                      <button className="pb-1 text-[#1a237e]/60 hover:text-[#1a237e] flex items-center gap-1">
                        <Hammer className="w-3 h-3" /> Action
                      </button>
                    </div>

                    {/* Tab 1: Detailed Report Breakdown */}
                    <div className="space-y-3 text-xs font-sans">
                      <div className="grid grid-cols-2 gap-2 text-[10px] bg-white p-3 border border-[#1a237e]/20 uppercase tracking-wide font-mono">
                        <div>
                          <span className="text-[#1a237e]/60 block text-[9px] tracking-widest">Source:</span>
                          <strong className="text-[#1a237e]">WhatsApp AI</strong>
                        </div>
                        <div>
                          <span className="text-[#1a237e]/60 block text-[9px] tracking-widest">District:</span>
                          <strong className="text-[#1a237e]">{item.district.name}</strong>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[#1a237e]/60 block text-[9px] tracking-widest">Coordinates:</span>
                          <strong className="text-[#c84b31] font-mono">{item.district.lat.toFixed(4)}, {item.district.lon.toFixed(4)}</strong>
                        </div>
                      </div>

                      {/* Tags & Description */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 border border-[#1a237e]/20 bg-[#1a237e]/5 text-[#c84b31] uppercase tracking-widest font-bold">
                            {evidence.tag}
                          </span>
                        </div>
                        <p className="text-[#1a237e] text-xs font-mono italic bg-white p-3 border-l-2 border-[#1a237e]">
                          "{evidence.sub}"
                        </p>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex flex-col gap-3 pt-3 border-t border-[#1a237e]/20">
                        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-[#1a237e]/70">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5 text-[#1a237e]" />
                            {evidence.commentsCount} Annotations
                          </span>
                          <span className="font-sans text-[#2e7d32] flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {evidence.upvotes} Consensus
                          </span>
                        </div>
                        
                        {onSelectHotspotForPolicy && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectHotspotForPolicy(item.district, item.category);
                            }}
                            className="w-full mt-2 bg-[#1a237e] hover:bg-[#c84b31] text-[#f4f1ea] py-2 flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-bold transition-colors border border-[#1a237e]"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Draft Policy
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
