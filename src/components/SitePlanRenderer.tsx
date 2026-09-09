import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  Map as MapIcon, 
  Compass, 
  Ruler, 
  Stamp, 
  FileText, 
  Sparkles,
  Maximize2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

// Helper to convert decimal lat/lon to Degrees Minutes Seconds (DMS)
function toDMS(deg: number, isLat: boolean): string {
  const absolute = Math.abs(deg);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = Math.floor((minutesNotTruncated - minutes) * 60);
  const direction = isLat ? (deg >= 0 ? 'N' : 'S') : (deg >= 0 ? 'E' : 'W');
  return `${degrees}°${minutes}'${seconds}" ${direction}`;
}

// Simple seeded PRNG for deterministic blueprint generation
function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

interface SitePlanRendererProps {
  category: string;
  seed: string;
  lat?: number;
  lon?: number;
}

export const SitePlanRenderer: React.FC<SitePlanRendererProps> = ({ category, seed, lat = 16.5062, lon = 80.6480 }) => {
  // Ensure lat and lon are always valid numbers to avoid Leaflet (NaN, NaN) LatLng errors
  const safeLat = (typeof lat === 'number' && !isNaN(lat) && isFinite(lat)) ? lat : 16.5062;
  const safeLon = (typeof lon === 'number' && !isNaN(lon) && isFinite(lon)) ? lon : 80.6480;

  // Layer states
  const [showSatellite, setShowSatellite] = useState(true);
  const [showBlueprint, setShowBlueprint] = useState(true);
  const [showContours, setShowContours] = useState(true);
  const [showCadastral, setShowCadastral] = useState(true);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [activeTab, setActiveTab] = useState<'plan' | 'section'>('plan');

  const dmsLat = useMemo(() => toDMS(safeLat, true), [safeLat]);
  const dmsLon = useMemo(() => toDMS(safeLon, false), [safeLon]);

  // Generate deterministic architectural geometry
  const planData = useMemo(() => {
    const prng = mulberry32(hashString(seed + category));
    const random = () => prng();
    const randomRange = (min: number, max: number) => min + random() * (max - min);

    const W = 800;
    const H = 800;

    // 1. Cadastral Plots
    const cadastralPlots = [
      { id: 'PLOT #401', x: 40, y: 40, w: 330, h: 320, setback: '3.5m' },
      { id: 'PLOT #402', x: 430, y: 40, w: 330, h: 320, setback: '4.0m' },
      { id: 'PLOT #403', x: 40, y: 440, w: 330, h: 320, setback: '3.0m' },
      { id: 'PLOT #404', x: 430, y: 440, w: 330, h: 320, setback: '5.0m' },
    ];

    // 2. Topo Contour Paths
    const contours: string[] = [];
    const baseElevation = 142.5;
    for (let i = 0; i < 6; i++) {
      const elev = (baseElevation + i * 1.5).toFixed(1);
      const yOffset = 100 + i * 110 + randomRange(-20, 20);
      const d = `M 20 ${yOffset} Q 250 ${yOffset + randomRange(-40, 40)} 400 ${yOffset + randomRange(-20, 20)} T 780 ${yOffset + randomRange(-30, 30)}`;
      contours.push(JSON.stringify({ d, elev }));
    }

    // 3. Roads & Pathways
    const roads = [
      { x: 0, y: 370, w: 800, h: 60, name: 'PRIMARY ARTERIAL CORRIDOR (ROW 18M)', chainage: 'CH 0+000 TO CH 0+800' },
      { x: 370, y: 0, w: 60, h: 800, name: 'SERVICE FEEDER ROAD (ROW 12M)', chainage: 'CH 0+150' },
    ];

    // 4. Buildings & Subdivisions
    const buildings: any[] = [];
    cadastralPlots.forEach((plot, plotIdx) => {
      const numBuildings = Math.floor(randomRange(1, 3));
      for (let i = 0; i < numBuildings; i++) {
        const bw = randomRange(90, 160);
        const bh = randomRange(80, 140);
        const bx = plot.x + randomRange(20, plot.w - bw - 20);
        const by = plot.y + randomRange(20, plot.h - bh - 20);

        const rooms: any[] = [];
        const cols = Math.floor(randomRange(2, 4));
        const rows = Math.floor(randomRange(2, 4));
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            rooms.push({
              x: bx + (c * (bw / cols)),
              y: by + (r * (bh / rows)),
              w: bw / cols,
              h: bh / rows,
            });
          }
        }

        buildings.push({
          id: `BLDG-${plotIdx + 1}${String.fromCharCode(65 + i)}`,
          x: bx,
          y: by,
          w: bw,
          h: bh,
          rooms,
          areaSqM: Math.round((bw * bh) * 0.45),
        });
      }
    });

    // 5. Trees & Vegetation
    const trees: any[] = [];
    cadastralPlots.forEach(plot => {
      const treeCount = Math.floor(randomRange(8, 16));
      for (let i = 0; i < treeCount; i++) {
        trees.push({
          cx: plot.x + randomRange(15, plot.w - 15),
          cy: plot.y + randomRange(15, plot.h - 15),
          r: randomRange(5, 11),
        });
      }
    });

    // 6. Infrastructure Specific Symbols
    const infraSymbols: any[] = [];
    if (category === 'Drainage') {
      infraSymbols.push(
        { type: 'outfall', x: 390, y: 440, label: 'MAIN DRAIN OUTFALL #OF-01' },
        { type: 'grate', x: 350, y: 380, label: 'STORM CATCH BASIN' },
        { type: 'grate', x: 440, y: 380, label: 'STORM CATCH BASIN' },
        { type: 'flow', x: 200, y: 395, label: 'FLOW V = 1.6 m/s' },
        { type: 'flow', x: 600, y: 395, label: 'FLOW V = 1.6 m/s' }
      );
    } else if (category === 'Water') {
      infraSymbols.push(
        { type: 'valve', x: 390, y: 380, label: 'GATE VALVE #V-12 (DN 200)' },
        { type: 'pump', x: 460, y: 120, label: 'BOOSTER PUMP STATION 45 HP' },
        { type: 'pipe', x: 50, y: 390, x2: 750, y2: 390, label: '200mm DI WATER MAIN' }
      );
    } else if (category === 'Electricity') {
      infraSymbols.push(
        { type: 'transformer', x: 470, y: 470, label: '250 kVA TRANSFORMER YARD' },
        { type: 'pole', x: 100, y: 360, label: 'LT POLE #14' },
        { type: 'pole', x: 250, y: 360, label: 'LT POLE #15' },
        { type: 'pole', x: 500, y: 360, label: 'LT POLE #16' }
      );
    } else {
      infraSymbols.push(
        { type: 'benchmark', x: 120, y: 120, label: 'SURVEY BM #104 (RL +148.5m)' },
        { type: 'benchmark', x: 680, y: 680, label: 'SURVEY BM #105 (RL +145.2m)' }
      );
    }

    // 7. Handwritten Annotations (Category Tailored)
    let annotationText = "Verified field survey 28-AUG by Er. K. Sharma (Nodal Eng.)";
    let annotationSub = "Slope gradient 1.8% towards East drainage outfall. Clear of HT line.";
    if (category === 'Drainage') {
      annotationText = "⚠️ Storm culvert capacity re-aligned for 100-yr flood return period.";
      annotationSub = "Concrete grade M-30 specified. Desilting pit added at Ch 0+220.";
    } else if (category === 'Roads') {
      annotationText = "Sub-base compaction CBR > 8% verified by QC lab.";
      annotationSub = "Dense Bituminous Macadam (DBM) 50mm + BC 30mm wearing coat.";
    } else if (category === 'Water') {
      annotationText = "Static pressure head @ 4.2 bar confirmed via hydrostatic test.";
      annotationSub = "Disinfection chlorination dosing unit sanctioned at node W-04.";
    }

    return {
      W, H,
      cadastralPlots,
      contours,
      roads,
      buildings,
      trees,
      infraSymbols,
      annotationText,
      annotationSub,
      scaleRatio: '1:500',
    };
  }, [category, seed]);

  return (
    <div className="w-full bg-[#f4f1ea] border-2 border-[#1a237e] text-[#1a237e] shadow-[4px_4px_0px_#1a237e] font-sans relative overflow-hidden">
      
      {/* Top Controls Toolbar */}
      <div className="p-3 bg-[#1a237e] text-[#f4f1ea] border-b-2 border-[#1a237e] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-widest uppercase flex items-center gap-1.5 text-[#c84b31] bg-[#f4f1ea] px-2 py-0.5 border border-[#1a237e]">
            <MapIcon className="w-3.5 h-3.5" />
            CADASTRAL SURVEY & BLUEPRINT
          </span>
          <span className="text-[10px] text-[#f4f1ea]/70 hidden sm:inline">
            ZONE: UTM 44N | SCALE {planData.scaleRatio}
          </span>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-1 bg-[#f4f1ea]/10 p-1 border border-[#f4f1ea]/20 rounded">
          <button
            onClick={() => setActiveTab('plan')}
            className={`px-2.5 py-1 text-[10px] font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'plan'
                ? 'bg-[#c84b31] text-white shadow-xs'
                : 'text-[#f4f1ea]/80 hover:text-white'
            }`}
          >
            Site Master Plan
          </button>
          <button
            onClick={() => setActiveTab('section')}
            className={`px-2.5 py-1 text-[10px] font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'section'
                ? 'bg-[#c84b31] text-white shadow-xs'
                : 'text-[#f4f1ea]/80 hover:text-white'
            }`}
          >
            Section Blueprint (A-A')
          </button>
        </div>
      </div>

      {/* Layer Visibility Toggles (Only visible in Plan View) */}
      {activeTab === 'plan' && (
        <div className="px-3 py-2 bg-[#f4f1ea] border-b border-[#1a237e]/20 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
          <span className="font-bold text-[#1a237e]/70 flex items-center gap-1 uppercase tracking-wider">
            <Layers className="w-3 h-3 text-[#c84b31]" />
            Active Survey Layers:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowSatellite(!showSatellite)}
              className={`px-2 py-0.5 border flex items-center gap-1 font-bold transition-all cursor-pointer ${
                showSatellite
                  ? 'bg-[#1a237e] text-[#f4f1ea] border-[#1a237e]'
                  : 'bg-white text-[#1a237e]/60 border-[#1a237e]/30'
              }`}
            >
              {showSatellite ? <Eye className="w-3 h-3 text-[#c84b31]" /> : <EyeOff className="w-3 h-3" />}
              <span>Satellite</span>
            </button>

            <button
              onClick={() => setShowBlueprint(!showBlueprint)}
              className={`px-2 py-0.5 border flex items-center gap-1 font-bold transition-all cursor-pointer ${
                showBlueprint
                  ? 'bg-[#1a237e] text-[#f4f1ea] border-[#1a237e]'
                  : 'bg-white text-[#1a237e]/60 border-[#1a237e]/30'
              }`}
            >
              {showBlueprint ? <Eye className="w-3 h-3 text-[#c84b31]" /> : <EyeOff className="w-3 h-3" />}
              <span>Grid & Layout</span>
            </button>

            <button
              onClick={() => setShowContours(!showContours)}
              className={`px-2 py-0.5 border flex items-center gap-1 font-bold transition-all cursor-pointer ${
                showContours
                  ? 'bg-[#1a237e] text-[#f4f1ea] border-[#1a237e]'
                  : 'bg-white text-[#1a237e]/60 border-[#1a237e]/30'
              }`}
            >
              {showContours ? <Eye className="w-3 h-3 text-[#c84b31]" /> : <EyeOff className="w-3 h-3" />}
              <span>Contours</span>
            </button>

            <button
              onClick={() => setShowCadastral(!showCadastral)}
              className={`px-2 py-0.5 border flex items-center gap-1 font-bold transition-all cursor-pointer ${
                showCadastral
                  ? 'bg-[#1a237e] text-[#f4f1ea] border-[#1a237e]'
                  : 'bg-white text-[#1a237e]/60 border-[#1a237e]/30'
              }`}
            >
              {showCadastral ? <Eye className="w-3 h-3 text-[#c84b31]" /> : <EyeOff className="w-3 h-3" />}
              <span>Plots</span>
            </button>

            <button
              onClick={() => setShowAnnotations(!showAnnotations)}
              className={`px-2 py-0.5 border flex items-center gap-1 font-bold transition-all cursor-pointer ${
                showAnnotations
                  ? 'bg-[#c84b31] text-white border-[#c84b31]'
                  : 'bg-white text-[#1a237e]/60 border-[#1a237e]/30'
              }`}
            >
              {showAnnotations ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              <span>Notes & Stamp</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Canvas View Area */}
      <div className="w-full relative overflow-hidden bg-[#f4f1ea]" style={{ paddingBottom: '90%' }}>
        
        {/* VIEW 1: SITE MASTER PLAN VIEW */}
        {activeTab === 'plan' && (
          <>
            {/* 1. Leaflet Satellite Layer */}
            {showSatellite && (
              <div className="absolute inset-0 z-0 opacity-70 grayscale contrast-125" style={{ mixBlendMode: 'multiply' }}>
                <MapContainer 
                  center={[safeLat, safeLon]} 
                  zoom={16} 
                  minZoom={10}
                  maxZoom={19}
                  worldCopyJump={false}
                  zoomControl={false}
                  scrollWheelZoom={false}
                  dragging={false}
                  doubleClickZoom={false}
                  attributionControl={false}
                  style={{ width: '100%', height: '100%' }}
                >
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    maxZoom={19}
                    noWrap={true}
                  />
                </MapContainer>
              </div>
            )}

            {/* 2. SVG Vector Layer (Grid, Cadastral, Blueprints, Annotations) */}
            <svg 
              className="absolute inset-0 w-full h-full z-10 pointer-events-none"
              viewBox={`0 0 ${planData.W} ${planData.H}`} 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Millimeter Grid Pattern */}
                <pattern id="millimeterGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a237e" strokeWidth="0.5" opacity="0.15" />
                  <path d="M 20 0 L 20 40 M 0 20 L 40 20" fill="none" stroke="#1a237e" strokeWidth="0.25" opacity="0.08" />
                </pattern>

                {/* Concrete Diagonal Hatch */}
                <pattern id="concreteHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="10" stroke="#1a237e" strokeWidth="0.75" opacity="0.25" />
                </pattern>

                {/* Drop Shadows */}
                <filter id="bldgShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="4" dy="6" stdDeviation="4" floodColor="#1a237e" floodOpacity="0.4"/>
                </filter>
                <filter id="treeShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="3" dy="5" stdDeviation="3" floodColor="#000000" floodOpacity="0.5"/>
                </filter>
              </defs>

              {/* Grid Background */}
              {showBlueprint && (
                <rect x="0" y="0" width={planData.W} height={planData.H} fill="url(#millimeterGrid)" />
              )}

              {/* Survey Coordinate Ticks & Registration Marks */}
              {showBlueprint && [100, 300, 500, 700].map(x => (
                [100, 300, 500, 700].map(y => (
                  <g key={`mark-${x}-${y}`} stroke="#1a237e" strokeWidth="1" opacity="0.4">
                    <line x1={x-12} y1={y} x2={x+12} y2={y} />
                    <line x1={x} y1={y-12} x2={x} y2={y+12} />
                    <circle cx={x} cy={y} r="5" fill="none" />
                    <text x={x+6} y={y-6} fontSize="9" fontFamily="monospace" fill="#1a237e" opacity="0.7">
                      +{x}m, +{y}m
                    </text>
                  </g>
                ))
              ))}

              {/* Topo Elevation Contours Layer */}
              {showContours && planData.contours.map((itemStr, idx) => {
                const item = JSON.parse(itemStr);
                return (
                  <g key={`contour-${idx}`}>
                    <path 
                      d={item.d} 
                      fill="none" 
                      stroke="#8d6e63" 
                      strokeWidth="1.2" 
                      strokeDasharray="6,4" 
                      opacity="0.6" 
                    />
                    <text x="50" y={105 + idx * 110} fontSize="9" fontFamily="monospace" fill="#6d4c41" opacity="0.75" fontWeight="bold">
                      EL {item.elev}m
                    </text>
                  </g>
                );
              })}

              {/* Cadastral Plots & Setback Boundaries Layer */}
              {showCadastral && planData.cadastralPlots.map((plot) => (
                <g key={plot.id}>
                  {/* Outer Parcel Boundary */}
                  <rect 
                    x={plot.x} 
                    y={plot.y} 
                    width={plot.w} 
                    height={plot.h} 
                    fill="none" 
                    stroke="#1a237e" 
                    strokeWidth="2" 
                    strokeDasharray="8,4"
                    opacity="0.5"
                  />
                  {/* Setback line */}
                  <rect 
                    x={plot.x + 15} 
                    y={plot.y + 15} 
                    width={plot.w - 30} 
                    height={plot.h - 30} 
                    fill="none" 
                    stroke="#c84b31" 
                    strokeWidth="0.75" 
                    strokeDasharray="3,3"
                    opacity="0.6"
                  />
                  <text x={plot.x + 10} y={plot.y + 22} fontSize="10" fontFamily="monospace" fontWeight="bold" fill="#1a237e" opacity="0.8">
                    {plot.id} (SETBACK {plot.setback})
                  </text>
                </g>
              ))}

              {/* Roads & Transport Channels */}
              {showBlueprint && planData.roads.map((road, i) => (
                <g key={`road-${i}`}>
                  <rect x={road.x} y={road.y} width={road.w} height={road.h} fill="#1a237e" opacity="0.1" />
                  <rect x={road.x} y={road.y} width={road.w} height={road.h} fill="none" stroke="#1a237e" strokeWidth="2" />
                  
                  {/* Road Centerline Axis */}
                  {road.w > road.h ? (
                    <>
                      <line x1={road.x} y1={road.y + road.h/2} x2={road.x + road.w} y2={road.y + road.h/2} stroke="#c84b31" strokeWidth="1.5" strokeDasharray="10,6" />
                      <text x={road.x + 20} y={road.y + 24} fontSize="9" fontFamily="monospace" fontWeight="bold" fill="#1a237e">
                        {road.name} • {road.chainage}
                      </text>
                    </>
                  ) : (
                    <>
                      <line x1={road.x + road.w/2} y1={road.y} x2={road.x + road.w/2} y2={road.y + road.h} stroke="#c84b31" strokeWidth="1.5" strokeDasharray="10,6" />
                      <text x={road.x + 12} y={road.y + 200} fontSize="9" fontFamily="monospace" fontWeight="bold" fill="#1a237e" transform={`rotate(-90 ${road.x + 12} ${road.y + 200})`}>
                        {road.name}
                      </text>
                    </>
                  )}
                </g>
              ))}

              {/* Architectural Buildings & Structures */}
              {showBlueprint && planData.buildings.map((b) => (
                <g key={b.id} filter="url(#bldgShadow)">
                  <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="#ffffff" stroke="#1a237e" strokeWidth="3" />
                  
                  {/* Internal Structural Subdivisions / Room Layout */}
                  {b.rooms.map((r: any, rIdx: number) => (
                    <rect key={`room-${rIdx}`} x={r.x} y={r.y} width={r.w} height={r.h} fill="none" stroke="#1a237e" strokeWidth="1" opacity="0.5" />
                  ))}

                  {/* Structural Concrete Elevator/Stair Core */}
                  <rect x={b.x + b.w/2 - 12} y={b.y + b.h/2 - 12} width="24" height="24" fill="url(#concreteHatch)" stroke="#1a237e" strokeWidth="1.5" />
                  <circle cx={b.x + b.w/2} cy={b.y + b.h/2} r="5" fill="#1a237e" />

                  {/* Building Designation Label */}
                  <rect x={b.x + 6} y={b.y + 6} width="64" height="16" fill="#1a237e" />
                  <text x={b.x + 10} y={b.y + 17} fontSize="9" fontFamily="monospace" fill="#f4f1ea" fontWeight="bold">
                    {b.id} ({b.areaSqM}m²)
                  </text>

                  {/* Dimension Extension Lines */}
                  <line x1={b.x} y1={b.y - 8} x2={b.x + b.w} y2={b.y - 8} stroke="#1a237e" strokeWidth="1" />
                  <line x1={b.x} y1={b.y - 12} x2={b.x} y2={b.y - 4} stroke="#1a237e" strokeWidth="1" />
                  <line x1={b.x + b.w} y1={b.y - 12} x2={b.x + b.w} y2={b.y - 4} stroke="#1a237e" strokeWidth="1" />
                  <text x={b.x + b.w/2 - 12} y={b.y - 11} fontSize="8" fontFamily="monospace" fill="#1a237e" fontWeight="bold">
                    {(b.w * 0.25).toFixed(1)}m
                  </text>
                </g>
              ))}

              {/* Landscape Trees */}
              {showBlueprint && planData.trees.map((t: any, idx: number) => (
                <g key={`tree-${idx}`} filter="url(#treeShadow)">
                  <circle cx={t.cx} cy={t.cy} r={t.r} fill="#2e7d32" stroke="#1b5e20" strokeWidth="1.5" opacity="0.85" />
                  <circle cx={t.cx} cy={t.cy} r={t.r * 0.4} fill="none" stroke="#a5d6a7" strokeWidth="1" />
                </g>
              ))}

              {/* Infrastructure Symbols */}
              {showBlueprint && planData.infraSymbols.map((sym: any, idx: number) => (
                <g key={`sym-${idx}`}>
                  {sym.type === 'valve' && (
                    <g transform={`translate(${sym.x}, ${sym.y})`}>
                      <polygon points="-8,-8 8,8 -8,8 8,-8" fill="#c84b31" stroke="#1a237e" strokeWidth="1" />
                      <circle cx="0" cy="0" r="10" fill="none" stroke="#c84b31" strokeWidth="1.5" />
                      <text x="14" y="4" fontSize="9" fontFamily="monospace" fontWeight="bold" fill="#1a237e">
                        {sym.label}
                      </text>
                    </g>
                  )}

                  {sym.type === 'grate' && (
                    <g transform={`translate(${sym.x}, ${sym.y})`}>
                      <rect x="-10" y="-8" width="20" height="16" fill="#1a237e" opacity="0.8" />
                      <line x1="-6" y1="-8" x2="-6" y2="8" stroke="#ffffff" strokeWidth="1" />
                      <line x1="0" y1="-8" x2="0" y2="8" stroke="#ffffff" strokeWidth="1" />
                      <line x1="6" y1="-8" x2="6" y2="8" stroke="#ffffff" strokeWidth="1" />
                      <text x="14" y="4" fontSize="8" fontFamily="monospace" fontWeight="bold" fill="#1a237e">
                        {sym.label}
                      </text>
                    </g>
                  )}

                  {sym.type === 'outfall' && (
                    <g transform={`translate(${sym.x}, ${sym.y})`}>
                      <circle cx="0" cy="0" r="14" fill="#c84b31" opacity="0.2" />
                      <circle cx="0" cy="0" r="10" fill="none" stroke="#c84b31" strokeWidth="2" strokeDasharray="3,3" />
                      <path d="M -6 0 L 6 0 M 2 -4 L 6 0 L 2 4" stroke="#c84b31" strokeWidth="2" fill="none" />
                      <text x="16" y="4" fontSize="9" fontFamily="monospace" fontWeight="bold" fill="#c84b31">
                        {sym.label}
                      </text>
                    </g>
                  )}

                  {sym.type === 'transformer' && (
                    <g transform={`translate(${sym.x}, ${sym.y})`}>
                      <rect x="-15" y="-15" width="30" height="30" fill="#f57f17" stroke="#1a237e" strokeWidth="2" />
                      <path d="M -4 -8 L 4 -2 L -2 2 L 4 8" stroke="#ffffff" strokeWidth="2" fill="none" />
                      <text x="20" y="4" fontSize="9" fontFamily="monospace" fontWeight="bold" fill="#1a237e">
                        {sym.label}
                      </text>
                    </g>
                  )}

                  {sym.type === 'benchmark' && (
                    <g transform={`translate(${sym.x}, ${sym.y})`}>
                      <polygon points="0,-10 9,6 -9,6" fill="#1a237e" />
                      <circle cx="0" cy="0" r="12" fill="none" stroke="#1a237e" strokeWidth="1.5" />
                      <text x="15" y="4" fontSize="9" fontFamily="monospace" fontWeight="bold" fill="#1a237e">
                        {sym.label}
                      </text>
                    </g>
                  )}
                </g>
              ))}

              {/* 3. Handwritten Annotations & Callouts (Sparingly applied) */}
              {showAnnotations && (
                <g>
                  {/* Handwritten Note 1 with Arrow */}
                  <g transform="translate(140, 260) rotate(-3)">
                    {/* Hand-drawn sketchy red circle */}
                    <path 
                      d="M -10 -10 C 80 -25 180 -15 195 20 C 210 55 170 80 80 75 C -10 70 -25 35 -10 -10 Z" 
                      fill="none" 
                      stroke="#c84b31" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      opacity="0.85"
                    />
                    {/* Handwritten Text */}
                    <text 
                      x="210" 
                      y="15" 
                      style={{ fontFamily: "'Caveat', 'Architects Daughter', cursive" }} 
                      fontSize="18" 
                      fontWeight="700" 
                      fill="#c84b31"
                    >
                      {planData.annotationText}
                    </text>
                    <text 
                      x="210" 
                      y="38" 
                      style={{ fontFamily: "'Caveat', 'Architects Daughter', cursive" }} 
                      fontSize="15" 
                      fill="#1a237e"
                    >
                      {planData.annotationSub}
                    </text>
                    {/* Sketchy pointer line */}
                    <path d="M 195 25 L 215 25" stroke="#c84b31" strokeWidth="2" strokeDasharray="3,2" />
                  </g>

                  {/* Handwritten Note 2 (Cadastral Sign-off) */}
                  <g transform="translate(460, 710) rotate(1)">
                    <text 
                      x="0" 
                      y="0" 
                      style={{ fontFamily: "'Caveat', 'Architects Daughter', cursive" }} 
                      fontSize="17" 
                      fontWeight="700" 
                      fill="#1a237e"
                    >
                      ✓ Cadastral parcel #402 clear for easement.
                    </text>
                    <text 
                      x="0" 
                      y="20" 
                      style={{ fontFamily: "'Caveat', 'Architects Daughter', cursive" }} 
                      fontSize="14" 
                      fill="#c84b31"
                    >
                      Signed: Er. R. Varma (District Surveyor)
                    </text>
                  </g>

                  {/* 4. Official Government Rubber Stamps */}
                  {/* Circular Red Rubber Stamp */}
                  <g transform="translate(700, 110) rotate(-12)">
                    <circle cx="0" cy="0" r="54" fill="#c84b31" opacity="0.08" />
                    <circle cx="0" cy="0" r="50" fill="none" stroke="#c84b31" strokeWidth="3" strokeDasharray="120,4" opacity="0.85" />
                    <circle cx="0" cy="0" r="42" fill="none" stroke="#c84b31" strokeWidth="1.5" opacity="0.85" />
                    
                    <path id="stampArcTop" d="M -36,0 A 36,36 0 0,1 36,0" fill="none" />
                    <text fontSize="8" fontFamily="monospace" fontWeight="bold" fill="#c84b31" letterSpacing="1">
                      <textPath href="#stampArcTop" startOffset="50%" textAnchor="middle">
                        GOVT OF INDIA
                      </textPath>
                    </text>

                    <text x="0" y="-6" fontSize="10" fontFamily="sans-serif" fontWeight="900" fill="#c84b31" textAnchor="middle" letterSpacing="1">
                      SANCTIONED
                    </text>
                    <text x="0" y="8" fontSize="8" fontFamily="monospace" fontWeight="bold" fill="#c84b31" textAnchor="middle">
                      CAPITAL ALLOCATION
                    </text>
                    <text x="0" y="20" fontSize="7" fontFamily="monospace" fill="#c84b31" textAnchor="middle">
                      31-AUG-2026
                    </text>
                  </g>
                </g>
              )}

              {/* Compass Rose (North Arrow) */}
              <g transform="translate(60, 730)">
                <circle cx="0" cy="0" r="22" fill="#f4f1ea" stroke="#1a237e" strokeWidth="2" />
                <polygon points="0,-18 5,0 0,2 -5,0" fill="#c84b31" />
                <polygon points="0,18 5,0 0,-2 -5,0" fill="#1a237e" opacity="0.4" />
                <text x="0" y="-22" fontSize="11" fontFamily="sans-serif" fontWeight="900" fill="#1a237e" textAnchor="middle">
                  N
                </text>
                <text x="0" y="32" fontSize="7" fontFamily="monospace" fill="#1a237e" textAnchor="middle">
                  MAG N 1°15' W
                </text>
              </g>

              {/* Metric Scale Bar */}
              <g transform="translate(180, 750)">
                <rect x="0" y="0" width="160" height="8" fill="#1a237e" opacity="0.2" />
                <rect x="0" y="0" width="40" height="8" fill="#1a237e" />
                <rect x="80" y="0" width="40" height="8" fill="#1a237e" />
                <line x1="0" y1="-2" x2="0" y2="10" stroke="#1a237e" strokeWidth="1.5" />
                <line x1="80" y1="-2" x2="80" y2="10" stroke="#1a237e" strokeWidth="1.5" />
                <line x1="160" y1="-2" x2="160" y2="10" stroke="#1a237e" strokeWidth="1.5" />
                <text x="0" y="-5" fontSize="8" fontFamily="monospace" fill="#1a237e" textAnchor="middle">0m</text>
                <text x="80" y="-5" fontSize="8" fontFamily="monospace" fill="#1a237e" textAnchor="middle">25m</text>
                <text x="160" y="-5" fontSize="8" fontFamily="monospace" fill="#1a237e" textAnchor="middle">50m</text>
              </g>
            </svg>
          </>
        )}

        {/* VIEW 2: SECTIONAL BLUEPRINT ELEVATION DIAGRAM (A-A') */}
        {activeTab === 'section' && (
          <div className="absolute inset-0 p-4 bg-[#f4f1ea] flex flex-col justify-between font-mono">
            {/* Diagram Header */}
            <div className="flex items-center justify-between border-b-2 border-[#1a237e] pb-2 text-xs">
              <span className="font-bold text-[#1a237e] uppercase tracking-widest flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#c84b31]" />
                CROSS-SECTION ELEVATION DIAGRAM (SECTION A-A')
              </span>
              <span className="text-[10px] text-[#1a237e]/70">SCALE 1:100 (VERTICAL EXAGGERATION 2X)</span>
            </div>

            {/* SVG Elevation Section Drawing */}
            <div className="flex-1 my-2 bg-[#ffffff] border-2 border-[#1a237e] relative shadow-inner overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="none">
                <defs>
                  {/* Concrete Hatching Pattern */}
                  <pattern id="secConcrete" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="12" stroke="#1a237e" strokeWidth="1" opacity="0.3" />
                  </pattern>
                  {/* Earth Hatch Pattern */}
                  <pattern id="earthHatch" width="20" height="20" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="20" x2="20" y2="0" stroke="#8d6e63" strokeWidth="0.75" opacity="0.3" />
                    <line x1="0" y1="10" x2="10" y2="0" stroke="#8d6e63" strokeWidth="0.75" opacity="0.2" />
                  </pattern>
                </defs>

                {/* Natural Ground Line */}
                <path d="M 0 260 Q 200 255 400 260 T 800 258" fill="none" stroke="#8d6e63" strokeWidth="3" strokeDasharray="6,4" />
                <rect x="0" y="260" width="800" height="140" fill="url(#earthHatch)" />

                {/* Foundation Sub-Base Gravel Bed */}
                <rect x="100" y="240" width="600" height="25" fill="#d7ccc8" stroke="#1a237e" strokeWidth="1.5" />
                <text x="400" y="256" fontSize="10" fontFamily="monospace" textAnchor="middle" fill="#5d4037" fontWeight="bold">
                  COMPACTED GRANULAR SUB-BASE (250mm THK)
                </text>

                {/* Main Structural Slab / Road Base */}
                <rect x="120" y="180" width="560" height="60" fill="url(#secConcrete)" stroke="#1a237e" strokeWidth="2.5" />
                <text x="400" y="215" fontSize="12" fontFamily="sans-serif" textAnchor="middle" fill="#1a237e" fontWeight="900">
                  REINFORCED CONCRETE SLAB M-30 GRADE (600mm THK)
                </text>

                {/* Infrastructure Conduits / Culvert Pipe Section */}
                {category === 'Drainage' || category === 'Water' ? (
                  <g>
                    <circle cx="300" cy="210" r="22" fill="#1a237e" opacity="0.15" stroke="#1a237e" strokeWidth="3" />
                    <circle cx="300" cy="210" r="16" fill="#ffffff" stroke="#1a237e" strokeWidth="2" />
                    <text x="300" y="214" fontSize="8" fontFamily="monospace" textAnchor="middle" fill="#c84b31" fontWeight="bold">
                      DN 400 PIPE
                    </text>

                    <circle cx="500" cy="210" r="22" fill="#1a237e" opacity="0.15" stroke="#1a237e" strokeWidth="3" />
                    <circle cx="500" cy="210" r="16" fill="#ffffff" stroke="#1a237e" strokeWidth="2" />
                    <text x="500" y="214" fontSize="8" fontFamily="monospace" textAnchor="middle" fill="#c84b31" fontWeight="bold">
                      DN 400 PIPE
                    </text>
                  </g>
                ) : (
                  <g>
                    {/* Columns / Structural Supports */}
                    <rect x="160" y="80" width="30" height="100" fill="#1a237e" opacity="0.2" stroke="#1a237e" strokeWidth="2" />
                    <rect x="610" y="80" width="30" height="100" fill="#1a237e" opacity="0.2" stroke="#1a237e" strokeWidth="2" />
                    <line x1="160" y1="80" x2="640" y2="80" stroke="#1a237e" strokeWidth="4" />
                  </g>
                )}

                {/* Technical Dimension Lines */}
                <g stroke="#c84b31" strokeWidth="1.5">
                  <line x1="120" y1="140" x2="680" y2="140" />
                  <line x1="120" y1="130" x2="120" y2="150" />
                  <line x1="680" y1="130" x2="680" y2="150" />
                </g>
                <rect x="350" y="130" width="100" height="18" fill="#c84b31" />
                <text x="400" y="143" fontSize="10" fontFamily="monospace" fill="#ffffff" textAnchor="middle" fontWeight="bold">
                  SPAN: 14.50 METERS
                </text>

                {/* Elevation Benchmarks */}
                <g transform="translate(60, 180)">
                  <polygon points="0,0 8,-12 -8,-12" fill="#1a237e" />
                  <line x1="-15" y1="0" x2="15" y2="0" stroke="#1a237e" strokeWidth="1.5" />
                  <text x="-20" y="4" fontSize="9" fontFamily="monospace" fill="#1a237e" textAnchor="end" fontWeight="bold">
                    RL +148.50m (FGL)
                  </text>
                </g>

                <g transform="translate(60, 260)">
                  <polygon points="0,0 8,-12 -8,-12" fill="#8d6e63" />
                  <line x1="-15" y1="0" x2="15" y2="0" stroke="#8d6e63" strokeWidth="1.5" />
                  <text x="-20" y="4" fontSize="9" fontFamily="monospace" fill="#8d6e63" textAnchor="end" fontWeight="bold">
                    RL +147.65m (FOUNDATION LEVEL)
                  </text>
                </g>
              </svg>
            </div>

            {/* Inset Notes & Signature block */}
            <div className="flex flex-wrap items-center justify-between text-[10px] bg-white p-2 border border-[#1a237e]">
              <div>
                <span className="font-bold text-[#1a237e] block">STRUCTURAL DESIGN SPECIFICATION:</span>
                <span className="text-[#1a237e]/80">IS 456:2000 Plain and Reinforced Concrete Code of Practice compliance verified.</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#c84b31] block">CHIEF ENGINEER SIGN-OFF</span>
                <span className="text-[#1a237e]/70">SEAL #408-AP-DPI</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Survey Metadata Footer Bar */}
      <div className="p-3 bg-[#f4f1ea] border-t-2 border-[#1a237e] grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-mono">
        <div className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-[#c84b31]" />
          <div>
            <span className="font-bold text-[#1a237e] block uppercase">Coordinates:</span>
            <span className="text-[#1a237e]/80">{dmsLat}, {dmsLon}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 border-t sm:border-t-0 sm:border-l border-[#1a237e]/20 pt-1 sm:pt-0 sm:pl-2">
          <Ruler className="w-3.5 h-3.5 text-[#1a237e]" />
          <div>
            <span className="font-bold text-[#1a237e] block uppercase">Benchmark Datum:</span>
            <span className="text-[#1a237e]/80">RL +148.50m MSL (UTM Zone 44N)</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 border-t sm:border-t-0 sm:border-l border-[#1a237e]/20 pt-1 sm:pt-0 sm:pl-2">
          <Stamp className="w-3.5 h-3.5 text-[#c84b31]" />
          <div>
            <span className="font-bold text-[#c84b31] block uppercase">Government Audit Seal:</span>
            <span className="text-[#1a237e]/80">Sanctioned & Archived</span>
          </div>
        </div>
      </div>

    </div>
  );
};
