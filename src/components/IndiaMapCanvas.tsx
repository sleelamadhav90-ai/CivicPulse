import React, { useState, useMemo, useRef } from 'react';
import { 
  MapPin, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Sparkles, 
  Flame, 
  Eye, 
  EyeOff, 
  Info,
  Navigation,
  Droplet,
  HeartPulse,
  Route,
  Zap,
  GraduationCap
} from 'lucide-react';
import { District, CitizenRequest, InfrastructureCategory, ScoreBreakdown } from '../types';

export interface EvaluatedDistrict {
  district: District;
  category: InfrastructureCategory;
  demandCount: number;
  currentAccess: number;
  breakdown: ScoreBreakdown;
  matchedRequests: CitizenRequest[];
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

// Region viewbox presets for instant focus
const REGION_PRESETS = [
  { id: 'all', label: 'All India', viewBox: '0 0 1000 1100' },
  { id: 'south', label: 'South (AP/TS/KA/TN/KL)', viewBox: '150 480 700 600' },
  { id: 'north', label: 'North (Delhi/UP/RJ/PB)', viewBox: '100 50 650 550' },
  { id: 'west', label: 'West (MH/GJ)', viewBox: '50 350 600 550' },
  { id: 'east', label: 'East (BR/WB/OD/NE)', viewBox: '400 200 600 600' },
];

export const IndiaMapCanvas: React.FC<IndiaMapCanvasProps> = ({
  evaluations,
  activeDistrictId,
  onSelectDistrict,
  selectedCategory,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedRegionPreset, setSelectedRegionPreset] = useState<string>('all');
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showStateBorders, setShowStateBorders] = useState<boolean>(true);
  const [hoveredDistrict, setHoveredDistrict] = useState<EvaluatedDistrict | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Calibrated projection function from Latitude / Longitude to India SVG Canvas Coordinate System (0-1000 X, 0-1100 Y)
  // India bounds: Lon 68.0°E to 97.5°E (width: 29.5 deg), Lat 8.0°N to 37.2°N (height: 29.2 deg)
  const projectGeoToSvg = (lat: number, lon: number): { x: number; y: number } => {
    const minLon = 68.0;
    const maxLon = 97.4;
    const minLat = 7.6;
    const maxLat = 37.4;

    // Conical-like slight curvature correction for authentic cartography
    const normalizedLon = (lon - minLon) / (maxLon - minLon);
    const normalizedLat = (lat - minLat) / (maxLat - minLat);

    // Map to SVG coordinates (Canvas is 1000 x 1100)
    // Left margin 60, right margin 60 -> width 880
    // Top margin 60, bottom margin 60 -> height 980
    const x = 60 + normalizedLon * 860;
    const y = 1040 - normalizedLat * 960;

    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(2.5, prev + 0.25));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(0.75, prev - 0.25));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setSelectedRegionPreset('all');
  };

  const currentViewBox = useMemo(() => {
    const preset = REGION_PRESETS.find((p) => p.id === selectedRegionPreset);
    return preset ? preset.viewBox : '0 0 1000 1100';
  }, [selectedRegionPreset]);

  return (
    <div className="relative w-full h-[580px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between select-none shadow-inner">
      {/* Top Map Action Bar */}
      <div className="z-20 p-3.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        {/* Region Presets */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-blue-400" /> Focus:
          </span>
          {REGION_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                setSelectedRegionPreset(preset.id);
                setZoomLevel(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedRegionPreset === preset.id
                  ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Layer Toggles & Zoom Buttons */}
        <div className="flex items-center space-x-2">
          {/* Toggle Labels */}
          <button
            onClick={() => setShowLabels(!showLabels)}
            title="Toggle City Name Labels"
            className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              showLabels
                ? 'bg-slate-800 text-blue-300 border border-blue-500/30'
                : 'bg-slate-900 text-slate-500 border border-slate-800'
            }`}
          >
            {showLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Labels</span>
          </button>

          {/* Toggle Heat Halo */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            title="Toggle Deficit Heatmap Glow"
            className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              showHeatmap
                ? 'bg-slate-800 text-amber-300 border border-amber-500/30'
                : 'bg-slate-900 text-slate-500 border border-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Heat</span>
          </button>

          {/* Toggle State Boundaries */}
          <button
            onClick={() => setShowStateBorders(!showStateBorders)}
            title="Toggle State Boundary Lines"
            className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              showStateBorders
                ? 'bg-slate-800 text-indigo-300 border border-indigo-500/30'
                : 'bg-slate-900 text-slate-500 border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">States</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Zoom In / Out / Reset */}
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            title="Reset Map View"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main SVG Vector Canvas */}
      <div 
        ref={containerRef}
        className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        {/* Cartographic Coordinate Grid */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        {/* Ocean Labels */}
        <div className="absolute left-6 bottom-20 text-[11px] font-bold tracking-widest text-slate-600/60 uppercase select-none pointer-events-none font-serif">
          Arabian Sea
        </div>
        <div className="absolute right-12 bottom-36 text-[11px] font-bold tracking-widest text-slate-600/60 uppercase select-none pointer-events-none font-serif">
          Bay of Bengal
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 bottom-3 text-[10px] font-bold tracking-widest text-slate-600/60 uppercase select-none pointer-events-none font-serif">
          Indian Ocean
        </div>

        <svg
          viewBox={currentViewBox}
          className="w-full h-full max-h-[520px] transition-transform duration-500 ease-out"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <defs>
            {/* Deficit Heatmap Glow Gradients */}
            <radialGradient id="criticalGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#f43f5e" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="highGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="moderateGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="islandGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>

            {/* Landmass Shadow filter */}
            <filter id="landShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#0284c7" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* Group 1: Geographic Base Landmass of India (Accurate Vector Coordinates) */}
          <g filter="url(#landShadow)">
            {/* India Main Landmass Silhouette */}
            <path
              d="
                M 330 65 
                C 345 50, 375 40, 410 42 
                C 445 45, 480 60, 505 85 
                C 530 110, 545 145, 535 180 
                C 525 210, 490 230, 480 255 
                C 475 270, 490 285, 520 290 
                C 560 295, 610 290, 655 295 
                C 690 300, 715 315, 740 330 
                C 775 320, 820 305, 860 310 
                C 890 315, 915 340, 920 370 
                C 925 405, 905 440, 880 460 
                C 855 480, 820 485, 800 500 
                C 780 515, 765 530, 755 555 
                C 745 580, 720 590, 700 595 
                C 685 600, 675 620, 665 640 
                C 645 680, 630 730, 595 780 
                C 560 830, 520 890, 475 950 
                C 460 970, 445 990, 435 985 
                C 425 975, 415 940, 400 895 
                C 385 850, 365 790, 345 730 
                C 325 670, 305 605, 290 560 
                C 275 520, 240 505, 215 500 
                C 185 495, 155 490, 130 505 
                C 105 520, 90 535, 75 525 
                C 60 510, 65 480, 85 460 
                C 110 440, 140 445, 165 435 
                C 190 425, 205 400, 215 370 
                C 225 330, 210 280, 230 240 
                C 245 205, 275 170, 295 130 
                C 310 100, 320 80, 330 65 
                Z
              "
              fill="#0f172a"
              stroke="#38bdf8"
              strokeWidth="2.2"
              strokeLinejoin="round"
              className="transition-colors duration-300"
            />

            {/* Northern Crown: Jammu & Kashmir, Ladakh, Himachal & Uttarakhand */}
            <path
              d="
                M 330 65 
                C 350 45, 380 40, 410 42 
                C 440 45, 475 60, 505 85 
                C 525 110, 535 140, 530 170 
                C 505 190, 460 195, 420 185 
                C 380 175, 350 150, 330 115 
                Z
              "
              fill="#1e293b"
              stroke="#0284c7"
              strokeWidth="1.2"
              strokeDasharray={showStateBorders ? 'none' : '4,4'}
              opacity="0.85"
            />

            {/* Western Region: Gujarat Peninsula, Kathiawar & Kutch */}
            <path
              d="
                M 215 370 
                C 205 400, 190 425, 165 435 
                C 140 445, 110 440, 85 460 
                C 65 480, 60 510, 75 525 
                C 90 535, 105 520, 130 505 
                C 155 490, 185 495, 215 500 
                C 235 505, 250 490, 255 460 
                C 260 420, 240 385, 215 370 
                Z
              "
              fill="#1e293b"
              stroke="#0284c7"
              strokeWidth="1.2"
              opacity="0.9"
            />

            {/* Southern Peninsula: Andhra Pradesh, Telangana, Karnataka, Tamil Nadu, Kerala */}
            <path
              d="
                M 290 560 
                C 305 605, 325 670, 345 730 
                C 365 790, 385 850, 400 895 
                C 415 940, 425 975, 435 985 
                C 445 990, 460 970, 475 950 
                C 520 890, 560 830, 595 780 
                C 630 730, 645 680, 665 640 
                C 580 620, 480 600, 380 580 
                Z
              "
              fill="#172554"
              stroke="#3b82f6"
              strokeWidth="1.4"
              opacity="0.85"
            />

            {/* North-Eastern Seven Sisters (Assam, Meghalaya, Arunachal, etc.) */}
            <path
              d="
                M 740 330 
                C 775 320, 820 305, 860 310 
                C 890 315, 915 340, 920 370 
                C 925 405, 905 440, 880 460 
                C 855 480, 820 485, 800 500 
                C 780 480, 770 430, 760 380 
                Z
              "
              fill="#1e293b"
              stroke="#0284c7"
              strokeWidth="1.2"
              opacity="0.85"
            />

            {/* State Internal Boundary Guidelines */}
            {showStateBorders && (
              <g stroke="#334155" strokeWidth="0.9" strokeDasharray="3,3" fill="none">
                {/* AP & Telangana Border Guideline */}
                <path d="M 400 660 Q 460 670 510 650 Q 560 660 590 680" />
                {/* Maharashtra Border Guideline */}
                <path d="M 235 505 Q 330 520 430 510 Q 500 540 520 580" />
                {/* Karnataka & Tamil Nadu Guideline */}
                <path d="M 360 760 Q 430 790 480 810 Q 540 790 560 820" />
                {/* Rajasthan & UP / Gangetic Belt */}
                <path d="M 270 290 Q 370 330 460 320 Q 560 340 660 360" />
                {/* Bihar & Bengal Guideline */}
                <path d="M 580 360 Q 640 400 680 450 Q 710 520 670 580" />
              </g>
            )}

            {/* Andaman & Nicobar Islands */}
            <g opacity="0.8">
              <ellipse cx="880" cy="820" rx="6" ry="16" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
              <ellipse cx="886" cy="870" rx="5" ry="14" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
              <ellipse cx="890" cy="920" rx="7" ry="12" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
              <text x="910" y="875" fill="#64748b" fontSize="10" fontFamily="sans-serif" fontWeight="bold">
                Andaman & Nicobar
              </text>
            </g>

            {/* Lakshadweep Islands */}
            <g opacity="0.8">
              <circle cx="280" cy="850" r="4" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
              <circle cx="275" cy="880" r="4" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
              <circle cx="270" cy="910" r="5" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
              <text x="180" y="885" fill="#64748b" fontSize="10" fontFamily="sans-serif" fontWeight="bold">
                Lakshadweep
              </text>
            </g>
          </g>

          {/* Group 2: Ambient Priority Deficit Heat Halos */}
          {showHeatmap && (
            <g className="pointer-events-none">
              {evaluations.map((item) => {
                const pos = projectGeoToSvg(item.district.lat, item.district.lon);
                const score = item.breakdown.total_score;
                const radius = Math.max(38, Math.min(85, 30 + score * 0.65 + item.demandCount * 6));
                const glowFill =
                  score >= 70
                    ? 'url(#criticalGlow)'
                    : score >= 55
                    ? 'url(#highGlow)'
                    : 'url(#moderateGlow)';

                return (
                  <circle
                    key={`glow-${item.district.id}`}
                    cx={pos.x}
                    cy={pos.y}
                    r={radius}
                    fill={glowFill}
                    className="transition-all duration-500"
                  />
                );
              })}
            </g>
          )}

          {/* Group 3: Interactive City Nodes, Markers & Badges */}
          <g>
            {evaluations.map((item) => {
              const pos = projectGeoToSvg(item.district.lat, item.district.lon);
              const isSelected = item.district.id === activeDistrictId;
              const isHovered = hoveredDistrict?.district.id === item.district.id;
              const score = item.breakdown.total_score;
              const isCritical = score >= 70;
              const markerRadius = isSelected ? 16 : isHovered ? 14 : 11;

              return (
                <g
                  key={`city-${item.district.id}`}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer group"
                  onClick={() => onSelectDistrict(item.district.id)}
                  onMouseEnter={(e) => {
                    setHoveredDistrict(item);
                    if (containerRef.current) {
                      const rect = containerRef.current.getBoundingClientRect();
                      setHoverPos({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      });
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredDistrict(null);
                    setHoverPos(null);
                  }}
                >
                  {/* Pulsing Radar Ring for Critical Deficit Cities */}
                  {isCritical && (
                    <circle
                      r={markerRadius + 8}
                      fill="none"
                      stroke={item.priorityTier.color}
                      strokeWidth="2"
                      className="animate-ping opacity-60"
                    />
                  )}

                  {/* Outer Selection Highlight Ring */}
                  {isSelected && (
                    <circle
                      r={markerRadius + 6}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      strokeDasharray="4,2"
                      className="animate-spin origin-center"
                    />
                  )}

                  {/* Marker Node Background */}
                  <circle
                    r={markerRadius}
                    fill={isSelected ? item.priorityTier.color : '#0f172a'}
                    stroke={item.priorityTier.color}
                    strokeWidth={isSelected ? 3 : 2.2}
                    className="transition-all duration-200 drop-shadow-md"
                  />

                  {/* Score text inside the node */}
                  <text
                    textAnchor="middle"
                    dy="4"
                    fill={isSelected ? '#ffffff' : '#f8fafc'}
                    fontSize={isSelected ? '11' : '10'}
                    fontFamily="monospace"
                    fontWeight="bold"
                    className="select-none pointer-events-none"
                  >
                    {score}
                  </text>

                  {/* Citizen Demand Badge if active complaints present */}
                  {item.demandCount > 0 && (
                    <g transform={`translate(${markerRadius - 2}, ${-markerRadius + 2})`}>
                      <circle r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                      <text
                        textAnchor="middle"
                        dy="3"
                        fill="#ffffff"
                        fontSize="8"
                        fontFamily="monospace"
                        fontWeight="bold"
                        className="select-none pointer-events-none"
                      >
                        {item.demandCount}
                      </text>
                    </g>
                  )}

                  {/* City Name Label Pill */}
                  {showLabels && (
                    <g
                      transform={`translate(0, ${markerRadius + 14})`}
                      className="pointer-events-none select-none transition-all duration-200"
                    >
                      {/* Label Backdrop pill */}
                      <rect
                        x={-(item.district.name.length * 4.2 + 8)}
                        y="-10"
                        width={item.district.name.length * 8.4 + 16}
                        height="18"
                        rx="4"
                        fill={isSelected ? '#1e293b' : '#090d16'}
                        stroke={isSelected ? '#38bdf8' : '#334155'}
                        strokeWidth={isSelected ? 1.5 : 0.8}
                        opacity="0.95"
                      />
                      <text
                        textAnchor="middle"
                        dy="3"
                        fill={isSelected ? '#38bdf8' : '#f1f5f9'}
                        fontSize="10"
                        fontFamily="system-ui, sans-serif"
                        fontWeight={isSelected ? '700' : '600'}
                      >
                        {item.district.name}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredDistrict && hoverPos && (
          <div
            className="absolute z-30 pointer-events-none bg-slate-900/95 text-white border border-slate-700 rounded-xl p-3.5 shadow-2xl backdrop-blur-md w-64 space-y-2 transform -translate-x-1/2 -translate-y-full -mt-4 animate-in fade-in zoom-in-95 duration-150"
            style={{
              left: Math.max(130, Math.min(window.innerWidth > 768 ? 600 : 300, hoverPos.x)),
              top: Math.max(120, hoverPos.y),
            }}
          >
            <div className="flex items-start justify-between border-b border-slate-800 pb-2">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  {hoveredDistrict.district.name}
                </h4>
                <span className="text-[11px] text-slate-400 font-medium">
                  {hoveredDistrict.district.state} ({hoveredDistrict.district.zone} Zone)
                </span>
              </div>
              <div className="text-right">
                <span
                  className="text-base font-extrabold font-mono"
                  style={{ color: hoveredDistrict.priorityTier.color }}
                >
                  {hoveredDistrict.breakdown.total_score}
                </span>
                <span className="text-[9px] uppercase tracking-wider block font-bold text-slate-400">
                  {hoveredDistrict.priorityTier.label}
                </span>
              </div>
            </div>

            {/* Quick Access Matrix */}
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700/50 flex justify-between">
                <span className="text-slate-400">Water Access:</span>
                <span className="font-mono font-bold text-blue-300">{hoveredDistrict.district.water_access}%</span>
              </div>
              <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700/50 flex justify-between">
                <span className="text-slate-400">Road Quality:</span>
                <span className="font-mono font-bold text-amber-300">{hoveredDistrict.district.road_quality}%</span>
              </div>
              <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700/50 flex justify-between">
                <span className="text-slate-400">Health Access:</span>
                <span className="font-mono font-bold text-rose-300">{hoveredDistrict.district.health_access}%</span>
              </div>
              <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700/50 flex justify-between">
                <span className="text-slate-400">Poverty Index:</span>
                <span className="font-mono font-bold text-emerald-300">
                  {(hoveredDistrict.district.poverty_index * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Active Citizen Feedback Telemetry */}
            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-300">
              <span className="flex items-center gap-1 text-slate-400">
                <Sparkles className="w-3 h-3 text-amber-400" /> Active Signals:
              </span>
              <span className="font-mono font-bold text-blue-400">
                {hoveredDistrict.demandCount} citizen report{hoveredDistrict.demandCount === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Cartographic Legend */}
      <div className="z-20 p-3 bg-slate-900/90 backdrop-blur-md border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Deficit Priority:
          </span>
          <div className="flex items-center space-x-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm animate-pulse" />
              <span className="text-slate-200 font-medium">Critical (&ge;70)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
              <span className="text-slate-200 font-medium">High (55-69)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" />
              <span className="text-slate-200 font-medium">Moderate (40-54)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
              <span className="text-slate-200 font-medium">Low (&lt;40)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
          <span>Click any city marker to inspect full municipal dossier</span>
        </div>
      </div>
    </div>
  );
};
