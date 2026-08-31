import React, { useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Simple seeded PRNG
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

export const SitePlanRenderer: React.FC<SitePlanRendererProps> = ({ category, seed, lat, lon }) => {
  const svgContent = useMemo(() => {
    const prng = mulberry32(hashString(seed + category));
    const random = () => prng();
    const randomRange = (min: number, max: number) => min + random() * (max - min);
    
    // Canvas size
    const W = 800;
    const H = 800;

    // We'll generate a grid of blocks
    const blockSize = 200;
    const roads: any[] = [];
    const buildings: any[] = [];
    const trees: any[] = [];
    const cars: any[] = [];
    const pathways: any[] = [];

    // Main axes
    roads.push({ x: 0, y: 350, w: 800, h: 100 });
    roads.push({ x: 350, y: 0, w: 100, h: 800 });
    
    // Add some secondary roads
    if (random() > 0.5) roads.push({ x: 0, y: 100, w: 350, h: 40 });
    if (random() > 0.5) roads.push({ x: 450, y: 600, w: 350, h: 40 });

    // Define building plots
    const plots = [
      { x: 50, y: 50, w: 250, h: 250 },
      { x: 450, y: 50, w: 300, h: 250 },
      { x: 50, y: 500, w: 250, h: 250 },
      { x: 450, y: 500, w: 300, h: 250 },
    ];

    plots.forEach(plot => {
      // Background pathways for the plot (light dot pattern area)
      pathways.push({
        x: plot.x, y: plot.y, w: plot.w, h: plot.h
      });

      // Buildings
      const numBuildings = Math.floor(randomRange(1, 4));
      for (let i = 0; i < numBuildings; i++) {
        const bw = randomRange(60, 150);
        const bh = randomRange(60, 150);
        const bx = plot.x + randomRange(10, plot.w - bw - 10);
        const by = plot.y + randomRange(10, plot.h - bh - 10);
        
        // internal subdivisions (rooms)
        const rooms = [];
        const splitsX = Math.floor(randomRange(1, 4));
        const splitsY = Math.floor(randomRange(1, 4));
        for (let rx = 0; rx < splitsX; rx++) {
          for (let ry = 0; ry < splitsY; ry++) {
            rooms.push({
              x: bx + (rx * (bw / splitsX)),
              y: by + (ry * (bh / splitsY)),
              w: bw / splitsX,
              h: bh / splitsY
            });
          }
        }
        
        buildings.push({ x: bx, y: by, w: bw, h: bh, rooms });
      }

      // Trees in the plot
      const numTrees = Math.floor(randomRange(15, 30));
      for (let i = 0; i < numTrees; i++) {
        trees.push({
          cx: plot.x + randomRange(10, plot.w - 10),
          cy: plot.y + randomRange(10, plot.h - 10),
          r: randomRange(4, 12),
          opacity: randomRange(0.6, 0.9)
        });
      }
    });

    // Cars on the roads
    roads.forEach(road => {
      const isHoriz = road.w > road.h;
      const numCars = Math.floor(randomRange(5, 15));
      for (let i = 0; i < numCars; i++) {
        const carColors = ['#d32f2f', '#1976d2', '#ffffff', '#424242', '#9e9e9e'];
        cars.push({
          x: isHoriz ? road.x + randomRange(10, road.w - 20) : road.x + randomRange(5, road.w - 15),
          y: isHoriz ? road.y + randomRange(5, road.h - 15) : road.y + randomRange(10, road.h - 20),
          w: isHoriz ? 12 : 6,
          h: isHoriz ? 6 : 12,
          color: carColors[Math.floor(randomRange(0, carColors.length))]
        });
      }
    });

    return { roads, pathways, buildings, trees, cars, W, H };
  }, [category, seed]);

  const { roads, pathways, buildings, trees, cars, W, H } = svgContent;

  return (
    <div className="w-full relative overflow-hidden bg-[#fafafa] border border-[#1a237e]/20" style={{ paddingBottom: '100%' }}>
      {/* Background Map Container */}
      {lat !== undefined && lon !== undefined && (
        <div className="absolute inset-0 z-0 grayscale opacity-80" style={{ mixBlendMode: 'multiply' }}>
          <MapContainer 
            center={[lat, lon]} 
            zoom={16} 
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
            />
          </MapContainer>
        </div>
      )}

      {/* Blueprint SVG Overlay */}
      <svg 
        className="absolute inset-0 w-full h-full z-10 pointer-events-none"
        viewBox={`0 0 ${W} ${H}`} 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.35"/>
          </filter>
          <filter id="tree-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="4" stdDeviation="2" floodColor="#000000" floodOpacity="0.4"/>
          </filter>
          <pattern id="dotGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#1a237e" opacity="0.1" />
          </pattern>
          <pattern id="diagHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#1a237e" strokeWidth="0.5" opacity="0.2" />
          </pattern>
          <filter id="drop-shadow-small" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="1" dy="2" stdDeviation="1" floodColor="#000000" floodOpacity="0.4"/>
          </filter>
        </defs>

        {/* Base Grid - Make it slightly transparent so map shows through */}
        <rect x="0" y="0" width={W} height={H} fill="url(#dotGrid)" />

        {/* Semi-transparent dark overlay to make blueprint lines pop over satellite */}
        {lat !== undefined && lon !== undefined && (
          <rect x="0" y="0" width={W} height={H} fill="#f4f1ea" opacity="0.6" />
        )}

        {/* Registration marks */}
        {[100, 300, 500, 700].map(x => (
          [100, 300, 500, 700].map(y => (
            <g key={`${x}-${y}`} stroke="#1a237e" strokeWidth="1" opacity="0.5">
              <line x1={x-10} y1={y} x2={x+10} y2={y} />
              <line x1={x} y1={y-10} x2={x} y2={y+10} />
              <circle cx={x} cy={y} r="4" fill="none" />
            </g>
          ))
        ))}

        {/* Roads */}
        {roads.map((road, i) => (
          <g key={`road-${i}`}>
            <rect x={road.x} y={road.y} width={road.w} height={road.h} fill="#e0e0e0" opacity="0.8" />
            {/* Road dashed lines */}
            {road.w > road.h ? (
              <line x1={road.x} y1={road.y + road.h/2} x2={road.x + road.w} y2={road.y + road.h/2} stroke="#ffffff" strokeWidth="2" strokeDasharray="15,15" />
            ) : (
              <line x1={road.x + road.w/2} y1={road.y} x2={road.x + road.w/2} y2={road.y + road.h} stroke="#ffffff" strokeWidth="2" strokeDasharray="15,15" />
            )}
          </g>
        ))}

        {/* Pathways / Plazas */}
        {pathways.map((pw, i) => (
          <rect key={`pw-${i}`} x={pw.x} y={pw.y} width={pw.w} height={pw.h} fill="#ffffff" opacity="0.75" rx="20" />
        ))}
        
        {/* Walkway paths (sinuous lines) */}
        {pathways.map((pw, i) => (
          <path 
            key={`path-${i}`}
            d={`M ${pw.x + 20} ${pw.y + 20} Q ${pw.x + pw.w/2} ${pw.y + 100} ${pw.x + pw.w - 20} ${pw.y + pw.h - 20}`}
            fill="none" 
            stroke="#1a237e" 
            strokeWidth="1.5" 
            strokeDasharray="4,4"
            opacity="0.4"
          />
        ))}

        {/* Buildings */}
        {buildings.map((b, i) => (
          <g key={`bldg-${i}`} filter="url(#shadow)">
            <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="#ffffff" stroke="#1a237e" strokeWidth="3" />
            {/* Internal Rooms */}
            {b.rooms.map((r: any, rIndex: number) => (
              <rect key={`room-${rIndex}`} x={r.x} y={r.y} width={r.w} height={r.h} fill="none" stroke="#1a237e" strokeWidth="0.75" opacity="0.6" />
            ))}
            {/* Core/Stairs */}
            <rect x={b.x + b.w/2 - 10} y={b.y + b.h/2 - 10} width="20" height="20" fill="url(#diagHatch)" stroke="#1a237e" strokeWidth="1" />
            <circle cx={b.x + b.w/2} cy={b.y + b.h/2} r="6" fill="none" stroke="#1a237e" strokeWidth="1" />
            <text x={b.x + 5} y={b.y + 15} fontSize="8" fontFamily="monospace" fill="#1a237e" opacity="0.6" fontWeight="bold">BLDG {i+1}</text>
          </g>
        ))}

        {/* Trees */}
        {trees.map((t, i) => (
          <circle 
            key={`tree-${i}`} 
            cx={t.cx} 
            cy={t.cy} 
            r={t.r} 
            fill="#4caf50" 
            opacity={t.opacity}
            filter="url(#tree-shadow)"
            stroke="#2e7d32"
            strokeWidth="1"
          />
        ))}
        
        {/* Cars */}
        {cars.map((c, i) => (
          <rect key={`car-${i}`} x={c.x} y={c.y} width={c.w} height={c.h} fill={c.color} rx="2" filter="url(#drop-shadow-small)" />
        ))}
      </svg>
    </div>
  );
};

