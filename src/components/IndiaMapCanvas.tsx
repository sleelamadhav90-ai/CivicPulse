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
  Water: { color: '#2d2d2d', bg: '#f5f5f4', icon: '💧', border: '#57534e' },
  Drainage: { color: '#2d2d2d', bg: '#f5f5f4', icon: '🌊', border: '#57534e' },
  Roads: { color: '#2d2d2d', bg: '#f5f5f4', icon: '🛣️', border: '#57534e' },
  Electricity: { color: '#2d2d2d', bg: '#f5f5f4', icon: '⚡', border: '#57534e' },
  Health: { color: '#2d2d2d', bg: '#f5f5f4', icon: '🏥', border: '#57534e' },
  Healthcare: { color: '#2d2d2d', bg: '#f5f5f4', icon: '🏥', border: '#57534e' },
  Sanitation: { color: '#2d2d2d', bg: '#f5f5f4', icon: '🗑️', border: '#57534e' },
  Education: { color: '#2d2d2d', bg: '#f5f5f4', icon: '🎓', border: '#57534e' },
  Other: { color: '#2d2d2d', bg: '#f5f5f4', icon: '📍', border: '#57534e' },
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
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OSM</a> &copy; <a href='https://carto.com/'>CARTO</a>"
        />

        {/* Render heatmap glowing blurs under the pins */}
        {evaluations.map((item) => {
          const score = item.breakdown.total_score;
          if (score < 40) return null;
          
          let color = '#e07a5f'; // default terracotta
          if (score >= 80) color = '#bc4749'; // critical red
          else if (score >= 60) color = '#e07a5f'; // terracotta
          else color = '#386641'; // deep green (positive)

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
              <Tooltip direction="top" offset={[0, -50]} className="bg-[#faf9f6] border border-[#2d2d2d]/20 text-[#2d2d2d] rounded-none shadow-none !p-0">
                <div className="px-3 py-2 text-xs font-sans font-semibold flex flex-col gap-1">
                  <div className="flex justify-between items-center gap-4">
                    <span>{item.district.name}</span>
                    <span className="font-mono text-[10px] bg-[#2d2d2d]/5 text-[#2d2d2d] px-1.5 border border-[#2d2d2d]/10 uppercase tracking-widest">{item.demandCount} Req</span>
                  </div>
                  <span className="text-[10px] text-[#57534e] font-sans uppercase tracking-widest">Priority: {item.breakdown.total_score}/100</span>
                </div>
              </Tooltip>

              {/* Popup replaces the permanent modal, natively dismissible! */}
              <Popup offset={[0, -50]} className="custom-popup" maxWidth={380} minWidth={320} autoPanPadding={[20, 20]}>
                <div className="bg-[#faf9f6] border border-[#2d2d2d]/20 shadow-none overflow-hidden text-[#2d2d2d] -m-4">
                  <div className="p-4 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-[#2d2d2d]/10 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#2d2d2d]/5 border border-[#2d2d2d]/10 flex items-center justify-center text-[#e07a5f]">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#2d2d2d] flex items-center gap-1">
                              <FileText className="w-3 h-3 text-[#e07a5f]" />
                              Insight Report
                            </span>
                          </div>
                          <span className="text-[10px] text-[#57534e] font-sans tracking-wide uppercase">
                            ID: {evidence.reportId} • {item.district.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sub-Tabs */}
                    <div className="flex gap-2 border-b border-[#2d2d2d]/10 pb-1 text-[10px] font-sans uppercase tracking-widest font-semibold">
                      <button className="pb-1 text-[#e07a5f] border-b-2 border-[#e07a5f] flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Report
                      </button>
                      <button className="pb-1 text-[#57534e] hover:text-[#2d2d2d] flex items-center gap-1">
                        <Camera className="w-3 h-3" /> Photo
                      </button>
                      <button className="pb-1 text-[#57534e] hover:text-[#2d2d2d] flex items-center gap-1">
                        <Hammer className="w-3 h-3" /> Action
                      </button>
                    </div>

                    {/* Tab 1: Detailed Report Breakdown */}
                    <div className="space-y-3 text-xs font-sans">
                      <div className="grid grid-cols-2 gap-2 text-[10px] bg-[#2d2d2d]/5 p-3 border border-[#2d2d2d]/10 uppercase tracking-wide">
                        <div>
                          <span className="text-[#57534e] block text-[9px] tracking-widest">Channel:</span>
                          <strong className="text-[#2d2d2d]">WhatsApp AI</strong>
                        </div>
                        <div>
                          <span className="text-[#57534e] block text-[9px] tracking-widest">District:</span>
                          <strong className="text-[#2d2d2d]">{item.district.name}</strong>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[#57534e] block text-[9px] tracking-widest">Coordinates:</span>
                          <strong className="text-[#e07a5f] font-mono">{item.district.lat.toFixed(4)}, {item.district.lon.toFixed(4)}</strong>
                        </div>
                      </div>

                      {/* Tags & Description */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 border border-[#2d2d2d]/20 text-[#e07a5f] uppercase tracking-widest font-bold">
                            {evidence.tag}
                          </span>
                        </div>
                        <p className="text-[#2d2d2d] text-xs font-serif italic bg-white p-3 border border-[#2d2d2d]/10">
                          "{evidence.sub}"
                        </p>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex flex-col gap-3 pt-3 border-t border-[#2d2d2d]/10">
                        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-[#57534e]">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5 text-[#2d2d2d]" />
                            {evidence.commentsCount} Comments
                          </span>
                          <span className="font-sans text-[#386641] flex items-center gap-1">
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
                            className="w-full mt-2 bg-[#2d2d2d] hover:bg-[#e07a5f] text-[#faf9f6] py-2 flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-bold transition-colors border border-[#2d2d2d]"
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
