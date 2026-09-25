import L from 'leaflet';

/**
 * CIVICPULSE GLOBAL MAP STANDARDS
 * Ensures zero-cost, India-first, zero-wrap, bounded GIS map experience across all views.
 */

// National Centroid for India
export const INDIA_MAP_CENTER: [number, number] = [20.5937, 78.9629];

// Geographic Bounding Box for India (South: 4°N, West: 60°E, North: 40°N, East: 105°E)
// Strictly locks Leaflet map panning within the Indian subcontinent and immediate maritime context
export const INDIA_MAP_MAX_BOUNDS: [[number, number], [number, number]] = [
  [4.0, 60.0],
  [40.0, 105.0],
];

export const INDIA_MAP_DEFAULT_ZOOM = 5;
export const INDIA_MAP_MIN_ZOOM = 4;
export const INDIA_MAP_MAX_ZOOM = 18;

// Zero-Cost Satellite Base Tiles (Esri World Imagery)
export const SATELLITE_TILE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
export const SATELLITE_TILE_ATTRIBUTION = 'Tiles &copy; Esri &mdash; World Imagery GIS';

// Zero-Cost Reference Places & Boundaries Tiles
export const REFERENCE_PLACES_TILE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';
export const REFERENCE_PLACES_ATTRIBUTION = '&copy; Esri Reference';

// Path to official India State Boundaries GeoJSON in public folder
export const INDIA_STATES_GEOJSON_PATH = '/india_states_simplified.geojson';

/**
 * Validates whether numeric latitude and longitude coordinates are valid finite numbers.
 */
export const isValidCoordinate = (lat?: any, lon?: any): boolean => {
  return typeof lat === 'number' && typeof lon === 'number' && !isNaN(lat) && !isNaN(lon) && isFinite(lat) && isFinite(lon);
};

/**
 * Converts potentially nullable/NaN lat and lon to safe Leaflet [lat, lon] tuple.
 */
export const toSafeLatLng = (lat?: any, lon?: any, fallback: [number, number] = INDIA_MAP_CENTER): [number, number] => {
  if (isValidCoordinate(lat, lon)) {
    return [lat, lon];
  }
  return fallback;
};

/**
 * Returns dynamic GeoJSON polygon styling for Indian State boundaries
 * Highlights the active state/district's parent state while keeping other boundaries subtle.
 */
export const getIndiaStateBoundaryStyle = (activeStateName?: string) => {
  return (feature: any) => {
    const stateName = feature?.properties?.NAME_1 || feature?.properties?.st_nm || '';
    const isStateActive = !!activeStateName && activeStateName !== 'ALL' && stateName.toLowerCase().includes(activeStateName.toLowerCase());

    return {
      color: isStateActive ? '#D65A3A' : '#ffffff',
      weight: isStateActive ? 2.2 : 0.75,
      opacity: isStateActive ? 0.95 : 0.4,
      fillColor: isStateActive ? '#D65A3A' : '#000000',
      fillOpacity: isStateActive ? 0.12 : 0.02,
      dashArray: isStateActive ? '' : '2, 3',
    };
  };
};
