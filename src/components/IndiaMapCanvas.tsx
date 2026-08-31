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
  Navigation,
  Droplets,
  Droplet,
  Activity,
  Radio,
  FileText,
  Camera,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Zap,
  Route,
  HeartPulse,
  GraduationCap,
  Hammer,
  Bot,
  Compass,
  Maximize2,
  Share2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Sliders,
  ShieldCheck,
  User
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

// Region viewbox presets for instant focus
const REGION_PRESETS = [
  { id: 'all', label: 'All India', viewBox: '0 0 1000 1100' },
  { id: 'south', label: 'South (AP/TS/KA/TN)', viewBox: '150 480 700 600' },
  { id: 'west', label: 'West (MH/GJ)', viewBox: '50 350 600 550' },
  { id: 'north', label: 'North (Delhi/UP/PB)', viewBox: '100 50 650 550' },
  { id: 'east', label: 'East (WB/OD/BR)', viewBox: '400 200 600 600' },
];

// Category styling dictionary
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

// Rich mock photo and report data generator for Qlue/Jakarta Smart City style callouts
const getReportEvidence = (district: District, category: string, hotspot: CityDemandHotspot) => {
  const images = {
    Water: {
      title: 'Drinking Water Pipeline Fracture & Ingress',
      tag: '#WaterContamination',
      sub: 'Main municipal feeder pipe ruptured near crossroad; muddy water entering overhead tanks.',
      officer: 'Er. Rajesh Kumar, Executive Engineer (Water Works)',
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
      officer: 'T. N. Murthy, Assistant Divisional Engineer (APSPDCL)',
      actionDate: '27 Aug 2026',
      status: 'Under AI Prioritization'
    },
    Health: {
      title: 'Primary Health Clinic Staff & Bed Deficit',
      tag: '#PrimaryHealthAccess',
      sub: 'Single doctor handling 180+ outpatients daily without functioning diagnostics.',
      officer: 'Dr. Anita Desai, District Medical & Health Officer',
      actionDate: '25 Aug 2026',
      status: 'Policy Lab Review'
    },
  };

  const defaultEvidence = images[category as keyof typeof images] || images.Water;
  return {
    ...defaultEvidence,
    reportId: `CP-${district.name.substring(0, 3).toUpperCase()}-${Math.floor(1000 + (district.lat * 100) % 9000)}`,
    reporter: 'CivicPulse Citizen Network (Verified Voice/WhatsApp)',
    timestamp: 'Today, 02:34 PM',
    commentsCount: Math.max(4, Math.round(hotspot.totalCitizenRequests / 450)),
    upvotes: Math.max(120, Math.round(hotspot.totalCitizenRequests * 1.8)),
  };
};

export const IndiaMapCanvas: React.FC<IndiaMapCanvasProps> = ({
  evaluations,
  activeDistrictId,
  onSelectDistrict,
  selectedCategory,
  onSelectHotspotForPolicy,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedRegionPreset, setSelectedRegionPreset] = useState<string>('all');
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showStateBorders, setShowStateBorders] = useState<boolean>(true);
  const [mapViewMode, setMapViewMode] = useState<'smartcity' | 'heatmap' | 'scores'>('smartcity');
  const [selectedCalloutTab, setSelectedCalloutTab] = useState<'report' | 'photo' | 'action'>('report');
  const [showModalReport, setShowModalReport] = useState<boolean>(false);
  const [hoveredDistrict, setHoveredDistrict] = useState<EvaluatedDistrict | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Calibrated projection function from Latitude / Longitude to India SVG Canvas Coordinate System (0-1000 X, 0-1100 Y)
  const projectGeoToSvg = (lat: number, lon: number): { x: number; y: number } => {
    const minLon = 68.0;
    const maxLon = 97.4;
    const minLat = 7.6;
    const maxLat = 37.4;

    const normalizedLon = (lon - minLon) / (maxLon - minLon);
    const normalizedLat = (lat - minLat) / (maxLat - minLat);

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

  // Selected district details
  const activeEval = useMemo(() => {
    return evaluations.find((e) => e.district.id === activeDistrictId) || evaluations[0];
  }, [evaluations, activeDistrictId]);

  const activeEvidence = useMemo(() => {
    if (!activeEval) return null;
    return getReportEvidence(activeEval.district, activeEval.demandHotspot.primaryCategory, activeEval.demandHotspot);
  }, [activeEval]);

  // Top overall demand category share across filtered cities
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {
      Water: 0,
      Drainage: 0,
      Roads: 0,
      Electricity: 0,
      Health: 0,
    };
    evaluations.forEach((e) => {
      const cat = e.demandHotspot.primaryCategory;
      if (counts[cat] !== undefined) {
        counts[cat] += e.demandHotspot.totalCitizenRequests;
      } else {
        counts.Water += e.demandHotspot.totalCitizenRequests;
      }
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return {
      counts,
      total,
      waterPct: Math.round((counts.Water / total) * 100),
      drainagePct: Math.round((counts.Drainage / total) * 100),
      roadsPct: Math.round((counts.Roads / total) * 100),
      electricityPct: Math.round((counts.Electricity / total) * 100),
      healthPct: Math.round((counts.Health / total) * 100),
    };
  }, [evaluations]);

  return (
    <div className="relative w-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between select-none shadow-2xl">
      {/* ============================================================ */}
      {/* 1. TOP SMART CITY CONTROL BAR & VIEW MODES                   */}
      {/* ============================================================ */}
      <div className="z-20 p-3.5 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/90 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Region Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5 text-sky-400" /> Focus:
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
                  ? 'bg-sky-600 text-white shadow-sm ring-1 ring-sky-400 font-bold'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Right: Map Visual Modes (Smart City Pins / Heatmap / Scores) */}
        <div className="flex items-center space-x-2">
          {/* Mode Switcher */}
          <div className="flex bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setMapViewMode('smartcity')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                mapViewMode === 'smartcity'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Smart City Qlue-Style Teardrop Pins & Category Badges"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Smart Pins</span>
            </button>
            <button
              onClick={() => setMapViewMode('heatmap')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                mapViewMode === 'heatmap'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="GIS Kernel Density Heatmap (Continuous Contour Field)"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>GIS Heatmap</span>
            </button>
            <button
              onClick={() => setMapViewMode('scores')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                mapViewMode === 'scores'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="5-Pillar Priority Score Nodes"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Scores</span>
            </button>
          </div>

          {/* Quick Toggle Overlays */}
          <div className="hidden sm:flex items-center space-x-1 pl-1">
            <button
              onClick={() => setShowLabels(!showLabels)}
              title="Toggle City Name Labels"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                showLabels
                  ? 'bg-slate-800 text-sky-300 border border-sky-500/30'
                  : 'bg-slate-900 text-slate-500 border border-slate-800'
              }`}
            >
              {showLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              title="Toggle Density Heat Halos"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                showHeatmap
                  ? 'bg-slate-800 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-900 text-slate-500 border border-slate-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1">
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
              title="Reset View"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. MAIN SVG MAP CANVAS WITH FLOATING SMART CITY CALLOUTS      */}
      {/* ============================================================ */}
      <div 
        ref={containerRef}
        className="relative flex-1 w-full min-h-[520px] max-h-[620px] overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing bg-slate-950"
      >
        {/* Cartographic Coordinate Grid */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        {/* Top-Left Smart City Banner (Image 1 Style) */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <div className="bg-slate-900/90 border border-slate-700/80 px-3.5 py-2 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-sky-500 p-0.5 flex items-center justify-center shadow-xs">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Bot className="w-4 h-4 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black tracking-widest text-slate-100 uppercase">
                  INDIA SMART GIS HOTSPOTS
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                {evaluations.length} Municipal Clusters • 12,480 Citizen Grievances
              </p>
            </div>
          </div>
        </div>

        {/* Top-Right Mini Infrastructure Analytics Donut (Image 2 Style) */}
        <div className="absolute top-4 right-4 z-10 pointer-events-none hidden lg:block">
          <div className="bg-slate-900/90 border border-slate-700/80 p-3 rounded-2xl shadow-xl backdrop-blur-md space-y-2 w-48">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1.5">
              <span>Category Demand</span>
              <span className="font-mono text-sky-400">100%</span>
            </div>
            
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-sky-400" /> Water
                </span>
                <span className="font-mono font-bold text-slate-200">{categoryStats.waterPct}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-orange-400" /> Roads
                </span>
                <span className="font-mono font-bold text-slate-200">{categoryStats.roadsPct}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-teal-400" /> Drainage
                </span>
                <span className="font-mono font-bold text-slate-200">{categoryStats.drainagePct}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-yellow-400" /> Power
                </span>
                <span className="font-mono font-bold text-slate-200">{categoryStats.electricityPct}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ocean Names in Cartographic Style */}
        <div className="absolute left-6 bottom-16 text-[11px] font-bold tracking-widest text-slate-600/50 uppercase select-none pointer-events-none font-serif">
          Arabian Sea
        </div>
        <div className="absolute right-12 bottom-28 text-[11px] font-bold tracking-widest text-slate-600/50 uppercase select-none pointer-events-none font-serif">
          Bay of Bengal
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 bottom-2 text-[10px] font-bold tracking-widest text-slate-600/50 uppercase select-none pointer-events-none font-serif">
          Indian Ocean
        </div>

        {/* SVG Map */}
        <svg
          viewBox={currentViewBox}
          className="w-full h-full max-h-[560px] transition-transform duration-500 ease-out"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <defs>
            {/* Multi-tier Gaussian Density Heatmap Radial Gradients (Image 3 Style: Green -> Yellow -> Orange -> Red) */}
            <radialGradient id="heatGaussianPeak" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="10%" stopColor="#fef08a" stopOpacity="0.95" />
              <stop offset="25%" stopColor="#ef4444" stopOpacity="0.85" />
              <stop offset="55%" stopColor="#f97316" stopOpacity="0.55" />
              <stop offset="80%" stopColor="#eab308" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="heatGaussianModerate" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
              <stop offset="20%" stopColor="#f59e0b" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#eab308" stopOpacity="0.45" />
              <stop offset="80%" stopColor="#10b981" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="heatGaussianBaseline" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.75" />
              <stop offset="40%" stopColor="#10b981" stopOpacity="0.55" />
              <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>

            {/* Glowing blur filter for pins */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            {/* Landmass Shadow filter */}
            <filter id="landShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#0284c7" floodOpacity="0.18" />
            </filter>

            {/* Pin Drop Shadow */}
            <filter id="pinShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Group 1: Geographic Base Landmass of India */}
          <g filter="url(#landShadow)">
            {/* Main Silhouette */}
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
              fill="#0b1329"
              stroke="#38bdf8"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />

            {/* Northern Crown */}
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
              fill="#111c44"
              stroke="#0284c7"
              strokeWidth="1.2"
              opacity="0.9"
            />

            {/* Southern Peninsula Focus Area */}
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
              fill="#0f1f4d"
              stroke="#38bdf8"
              strokeWidth="1.6"
              opacity="0.9"
            />

            {/* State Internal Boundary Guidelines */}
            {showStateBorders && (
              <g stroke="#1e293b" strokeWidth="1.2" strokeDasharray="4,4" fill="none">
                <path d="M 400 660 Q 460 670 510 650 Q 560 660 590 680" />
                <path d="M 235 505 Q 330 520 430 510 Q 500 540 520 580" />
                <path d="M 360 760 Q 430 790 480 810 Q 540 790 560 820" />
                <path d="M 270 290 Q 370 330 460 320 Q 560 340 660 360" />
                <path d="M 580 360 Q 640 400 680 450 Q 710 520 670 580" />
              </g>
            )}

            {/* Islands */}
            <g opacity="0.8">
              <ellipse cx="880" cy="820" rx="6" ry="16" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
              <ellipse cx="886" cy="870" rx="5" ry="14" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
              <ellipse cx="890" cy="920" rx="7" ry="12" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
              <circle cx="280" cy="850" r="4" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
              <circle cx="275" cy="880" r="4" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
            </g>
          </g>

          {/* ============================================================ */}
          {/* Group 2: CONTINUOUS DENSITY HEATMAP LAYER (São Paulo style)  */}
          {/* ============================================================ */}
          {(showHeatmap || mapViewMode === 'heatmap') && (
            <g className="pointer-events-none" style={{ mixBlendMode: 'screen' }}>
              {evaluations.map((item) => {
                const pos = projectGeoToSvg(item.district.lat, item.district.lon);
                const score = item.breakdown.total_score;
                const radius = Math.max(48, Math.min(110, 40 + score * 0.8 + item.demandCount * 6));
                
                const gradientFill =
                  score >= 70
                    ? 'url(#heatGaussianPeak)'
                    : score >= 50
                    ? 'url(#heatGaussianModerate)'
                    : 'url(#heatGaussianBaseline)';

                return (
                  <g key={`heat-${item.district.id}`}>
                    {/* Outer Heat Contour Ring */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={radius * 1.25}
                      fill={gradientFill}
                      opacity={mapViewMode === 'heatmap' ? 0.95 : 0.65}
                      className="transition-all duration-500"
                    />
                    {/* Inner Core Hotspot */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={radius * 0.65}
                      fill={gradientFill}
                      opacity="0.8"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* ============================================================ */}
          {/* Group 3: SMART CITY TEARDROP PINS (Qlue / Jakarta Style)      */}
          {/* ============================================================ */}
          <g>
            {evaluations.map((item) => {
              const pos = projectGeoToSvg(item.district.lat, item.district.lon);
              const isSelected = item.district.id === activeDistrictId;
              const isHovered = hoveredDistrict?.district.id === item.district.id;
              const score = item.breakdown.total_score;
              const hotspot = item.demandHotspot;
              const isCritical = hotspot.urgencyLevel === 'Critical' || score >= 70;
              const catStyle = CATEGORY_STYLES[hotspot.primaryCategory] || CATEGORY_STYLES.Water;

              // Pin Color by priority & category
              const pinColor = isCritical 
                ? '#ef4444' 
                : score >= 55 
                ? '#f97316' 
                : score >= 40 
                ? '#eab308' 
                : '#10b981';

              return (
                <g
                  key={`smart-pin-${item.district.id}`}
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
                  {/* Pulsing Radar Ring for Critical Urgent Hotspots */}
                  {isCritical && (
                    <circle
                      cx="0"
                      cy="-22"
                      r="22"
                      fill="none"
                      stroke={pinColor}
                      strokeWidth="2.5"
                      className="animate-ping opacity-75"
                    />
                  )}

                  {/* Active Selection Halo Ring */}
                  {isSelected && (
                    <circle
                      cx="0"
                      cy="-22"
                      r="24"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="3"
                      strokeDasharray="4,3"
                      className="animate-spin origin-center"
                    />
                  )}

                  {/* TEARDROP PIN (Image 1 Style) */}
                  <g filter={(isCritical || isSelected) ? "url(#glow)" : "url(#pinShadow)"} transform={`scale(${isSelected ? 1.25 : isHovered ? 1.15 : 1})`}>
                    {/* Teardrop Base Vector pointing at (0,0) */}
                    <path
                      d="M 0 0 C -11 -14 -16 -23 -16 -32 C -16 -41 -9 -48 0 -48 C 9 -48 16 -41 16 -32 C 16 -23 11 -14 0 0 Z"
                      fill={pinColor}
                      stroke="#ffffff"
                      strokeWidth={isSelected ? "2.5" : "1.8"}
                      className="transition-all duration-200"
                    />

                    {/* Inner White Badge Disc */}
                    <circle
                      cx="0"
                      cy="-32"
                      r="10.5"
                      fill="#ffffff"
                    />

                    {/* Center Emoji / Category Icon */}
                    <text
                      x="0"
                      y="-28"
                      textAnchor="middle"
                      fontSize="11"
                      className="select-none pointer-events-none"
                    >
                      {catStyle.icon}
                    </text>

                    {/* Top-Right Notification Counter Badge */}
                    <g transform="translate(10, -44)">
                      <circle r="6.5" fill="#1e293b" stroke="#ffffff" strokeWidth="1.2" />
                      <text
                        textAnchor="middle"
                        dy="2.5"
                        fill="#ffffff"
                        fontSize="7.5"
                        fontFamily="monospace"
                        fontWeight="black"
                        className="select-none pointer-events-none"
                      >
                        {item.demandCount > 0 ? item.demandCount : Math.min(99, Math.round(hotspot.totalCitizenRequests / 120))}
                      </text>
                    </g>
                  </g>

                  {/* City Label Pill under Pin */}
                  {showLabels && (
                    <g transform="translate(0, 10)" className="pointer-events-none select-none">
                      <rect
                        x={-(item.district.name.length * 3.8 + 12)}
                        y="-8"
                        width={item.district.name.length * 7.6 + 24}
                        height="17"
                        rx="4.5"
                        fill={isSelected ? '#1e293b' : '#090d16'}
                        stroke={isSelected ? '#38bdf8' : '#334155'}
                        strokeWidth={isSelected ? 1.6 : 0.8}
                        opacity="0.95"
                      />
                      <text
                        textAnchor="middle"
                        dy="4"
                        fill={isSelected ? '#38bdf8' : '#f1f5f9'}
                        fontSize="9.5"
                        fontFamily="system-ui, sans-serif"
                        fontWeight={isSelected ? '800' : '600'}
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

        {/* ============================================================ */}
        {/* 3. RICH "INFORMASI LAPORAN" / CIVIC REPORT CALLOUT (IMAGE 1)  */}
        {/* ============================================================ */}
        {activeEval && activeEvidence && (
          <div className="absolute left-4 bottom-14 z-30 max-w-[340px] sm:max-w-[380px] bg-slate-900/95 border border-slate-700/90 rounded-2xl shadow-2xl backdrop-blur-xl p-4 text-white space-y-3.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
            {/* Header: Report Title & Mascot Avatar */}
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
                    <span className="text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded border border-sky-500/30">
                      1
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: {activeEvidence.reportId} • {activeEval.district.name}
                  </span>
                </div>
              </div>

              {/* Status Chip */}
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md font-mono ${
                activeEval.breakdown.total_score >= 70
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {activeEvidence.status}
              </span>
            </div>

            {/* Sub-Tabs: 1. Detail Laporan | 2. Photo Pendukung | 3. Tindak Lanjut */}
            <div className="grid grid-cols-3 gap-1 bg-slate-800/80 p-1 rounded-xl text-[11px] font-bold">
              <button
                onClick={() => setSelectedCalloutTab('report')}
                className={`py-1 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  selectedCalloutTab === 'report' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>1. Laporan</span>
              </button>
              <button
                onClick={() => setSelectedCalloutTab('photo')}
                className={`py-1 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  selectedCalloutTab === 'photo' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Camera className="w-3 h-3" />
                <span>2. Photo</span>
              </button>
              <button
                onClick={() => setSelectedCalloutTab('action')}
                className={`py-1 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  selectedCalloutTab === 'action' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Hammer className="w-3 h-3" />
                <span>3. Tindak</span>
              </button>
            </div>

            {/* Tab 1: Detailed Report Breakdown */}
            {selectedCalloutTab === 'report' && (
              <div className="space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/60">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Pelapor / Channel:</span>
                    <strong className="text-slate-200">WhatsApp Voice AI</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Kelurahan / Ward:</span>
                    <strong className="text-slate-200">{activeEval.district.name} Central</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Waktu / Timestamp:</span>
                    <strong className="text-slate-200">{activeEvidence.timestamp}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Koordinat GPS:</span>
                    <strong className="text-sky-300 font-mono">{activeEval.district.lat.toFixed(4)}, {activeEval.district.lon.toFixed(4)}</strong>
                  </div>
                </div>

                {/* Tags & Description */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">
                      {activeEvidence.tag}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      #FasilitasUmum
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] italic bg-slate-800/40 p-2 rounded-lg border border-slate-700/40 leading-relaxed">
                    "{activeEvidence.sub}"
                  </p>
                </div>

                {/* Footer Count: Comments & Upvotes */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                    Komentar ({activeEvidence.commentsCount})
                  </span>
                  <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {activeEvidence.upvotes} Citizen Upvotes
                  </span>
                </div>
              </div>
            )}

            {/* Tab 2: Photo Pendukung Evidence Thumbnail (Image 1 Style) */}
            {selectedCalloutTab === 'photo' && (
              <div className="space-y-2 text-xs">
                <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-800 aspect-video flex items-center justify-center">
                  {/* High Quality Illustrated Mock Photo of Municipal Infrastructure */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-10" />
                  
                  {/* Photo Visual Representation */}
                  <div className="text-center p-4 z-20 space-y-1.5">
                    <div className="w-10 h-10 mx-auto rounded-full bg-sky-500/20 border border-sky-400 flex items-center justify-center text-xl">
                      {activeEval.demandHotspot.primaryCategory === 'Water' ? '🚰' : activeEval.demandHotspot.primaryCategory === 'Roads' ? '🚧' : '⚡'}
                    </div>
                    <h5 className="font-bold text-xs text-white">{activeEvidence.title}</h5>
                    <p className="text-[10px] text-slate-300 line-clamp-1">{activeEvidence.sub}</p>
                  </div>

                  <span className="absolute top-2 right-2 z-20 text-[9px] font-mono bg-slate-900/80 px-2 py-0.5 rounded text-emerald-400 border border-emerald-500/30">
                    GPS Geotag Verified
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block text-center">
                  Uploaded via CivicPulse Citizen Audio/Camera Ingestion
                </span>
              </div>
            )}

            {/* Tab 3: Tindak Lanjut / Government Sanction Action */}
            {selectedCalloutTab === 'action' && (
              <div className="space-y-2.5 text-xs">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Petugas / Officer:</span>
                    <span className="text-[10px] font-mono text-sky-300">{activeEvidence.actionDate}</span>
                  </div>
                  <strong className="text-white text-xs block">{activeEvidence.officer}</strong>
                  <p className="text-[11px] text-slate-300 pt-1">
                    Priority Score computed deterministically at <span className="font-bold font-mono text-amber-400">{activeEval.breakdown.total_score}/100</span>. Sanction recommendation forwarded to Ministry.
                  </p>
                </div>

                <button
                  onClick={() => onSelectHotspotForPolicy?.(activeEval.district, activeEval.category)}
                  className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Execute Policy Simulation in AI Lab</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 4. BOTTOM CARTOGRAPHIC LEGEND & SCALE BAR (Image 3 Style)    */}
      {/* ============================================================ */}
      <div className="z-20 p-3 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: GIS Value Gradient Bar */}
        <div className="flex items-center space-x-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            Infrastructure Deficit Scale:
          </span>
          
          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-emerald-400 font-mono">Lower Need</span>
            <div className="w-24 h-2.5 rounded-full bg-gradient-to-r from-emerald-500 via-yellow-400 via-orange-500 to-rose-600 border border-slate-700" />
            <span className="text-[10px] text-rose-400 font-mono font-bold">Greater Hotspot</span>
          </div>
        </div>

        {/* Right: Quick Interaction Hint */}
        <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
          <span className="hidden sm:inline">Click any teardrop pin to open <strong>Informasi Laporan</strong></span>
        </div>
      </div>
    </div>
  );
};
