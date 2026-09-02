import { InfrastructureAsset } from '../types';

export const INFRASTRUCTURE_ASSETS_REGISTRY: InfrastructureAsset[] = [
  // HEALTHCARE ASSETS
  {
    id: 'INFRA-HC-001',
    name: 'Primary Health Centre (PHC)',
    category: 'Healthcare',
    districtId: 'vijayawada',
    districtName: 'Vijayawada',
    location: 'Village Mangalagiri Sector 4',
    capacity: '30 beds',
    condition: '⚠️ Poor',
    utilizationPct: 92,
    nearestFacilityDistanceKm: 18.2,
    travelTimeMinutes: 45,
    staffOrEquipmentStatus: '2 Medical Officers missing, vaccine stockout reported',
    coverageRadiusKm: 12,
    servedPopulation: 14200,
    lastInspectedDate: '2026-07-20'
  },
  {
    id: 'INFRA-HC-002',
    name: 'Rural Sub-Centre Hospital',
    category: 'Health',
    districtId: 'guntur',
    districtName: 'Guntur',
    location: 'Mylavaram Block B',
    capacity: '15 beds',
    condition: '🔴 Critical',
    utilizationPct: 110,
    nearestFacilityDistanceKm: 22.5,
    travelTimeMinutes: 52,
    staffOrEquipmentStatus: 'Doctor absent 4 days/wk, diagnostic kit shortage',
    coverageRadiusKm: 15,
    servedPopulation: 22800,
    lastInspectedDate: '2026-06-12'
  },

  // EDUCATION ASSETS
  {
    id: 'INFRA-EDU-001',
    name: 'Government High School & Hostel',
    category: 'Education',
    districtId: 'guntur',
    districtName: 'Guntur',
    location: 'Village Pedakakani',
    capacity: '500 students',
    condition: '🟢 Good',
    utilizationPct: 98,
    nearestFacilityDistanceKm: 4.2,
    travelTimeMinutes: 12,
    staffOrEquipmentStatus: 'Fully staffed, female sanitation facilities incomplete',
    coverageRadiusKm: 6,
    servedPopulation: 8500,
    lastInspectedDate: '2026-08-05'
  },
  {
    id: 'INFRA-EDU-002',
    name: 'Mandal Primary School',
    category: 'Education',
    districtId: 'kurnool',
    districtName: 'Kurnool',
    location: 'Village Bethamcherla',
    capacity: '220 students',
    condition: '⚠️ Damaged',
    utilizationPct: 125,
    nearestFacilityDistanceKm: 14.8,
    travelTimeMinutes: 38,
    staffOrEquipmentStatus: 'Roof leakage, no digital display panels or clean water taps',
    coverageRadiusKm: 10,
    servedPopulation: 6400,
    lastInspectedDate: '2026-05-18'
  },

  // WATER ASSETS
  {
    id: 'INFRA-WAT-001',
    name: 'Overhead Water Tank & Pumping Station',
    category: 'Water',
    districtId: 'guntur',
    districtName: 'Guntur',
    location: 'Tadepalle Rural Ward 9',
    capacity: '100,000 L',
    condition: '🔴 Critical',
    utilizationPct: 115,
    nearestFacilityDistanceKm: 12.0,
    travelTimeMinutes: 30,
    staffOrEquipmentStatus: 'Main intake pump impellers rusted, pipeline leakage 34%',
    coverageRadiusKm: 8,
    servedPopulation: 18600,
    lastInspectedDate: '2026-07-28'
  },
  {
    id: 'INFRA-WAT-002',
    name: 'RO Filtration Plant & Bulk Tank',
    category: 'Water',
    districtId: 'kurnool',
    districtName: 'Kurnool',
    location: 'Panyam Sector 3',
    capacity: '50,000 L/day',
    condition: '❌ Non-functional',
    utilizationPct: 0,
    nearestFacilityDistanceKm: 16.4,
    travelTimeMinutes: 42,
    staffOrEquipmentStatus: 'High groundwater salinity, membrane filter clogged',
    coverageRadiusKm: 14,
    servedPopulation: 12400,
    lastInspectedDate: '2026-04-10'
  },

  // TRANSPORT / ROADS ASSETS
  {
    id: 'INFRA-RD-001',
    name: 'MDR-44 Arterial Hospital Access Road',
    category: 'Roads',
    districtId: 'guntur',
    districtName: 'Guntur',
    location: 'Mangalagiri Corridor',
    capacity: '8 km stretch',
    condition: '⚠️ Damaged',
    utilizationPct: 95,
    nearestFacilityDistanceKm: 0,
    travelTimeMinutes: 28, // 2.4x delay
    staffOrEquipmentStatus: '48 major craters, asphalt layer eroded due to monsoon',
    coverageRadiusKm: 20,
    servedPopulation: 34000,
    lastInspectedDate: '2026-08-10'
  },
  {
    id: 'INFRA-RD-002',
    name: 'Rural Feeder Bus Route #12',
    category: 'Roads',
    districtId: 'vijayawada',
    districtName: 'Vijayawada',
    location: 'Kankipadu-Ramanagaram Bypass',
    capacity: '14.2 km corridor',
    condition: '⚠️ Poor',
    utilizationPct: 88,
    nearestFacilityDistanceKm: 0,
    travelTimeMinutes: 40,
    staffOrEquipmentStatus: 'Unpaved gravel shoulders, bus service frequency reduced',
    coverageRadiusKm: 15,
    servedPopulation: 21500,
    lastInspectedDate: '2026-07-02'
  },

  // ELECTRICITY ASSETS
  {
    id: 'INFRA-ELE-001',
    name: '33/11kV Power Substation & Feeder Line',
    category: 'Electricity',
    districtId: 'kurnool',
    districtName: 'Kurnool',
    location: 'Farming Sector North',
    capacity: '12 MVA capacity',
    condition: '⚠️ Damaged',
    utilizationPct: 108,
    nearestFacilityDistanceKm: 8.5,
    travelTimeMinutes: 20,
    staffOrEquipmentStatus: 'Transformer coils burnt, frequent low-voltage spikes',
    coverageRadiusKm: 18,
    servedPopulation: 16800,
    lastInspectedDate: '2026-08-01'
  },

  // DRAINAGE & SANITATION ASSETS
  {
    id: 'INFRA-DRN-001',
    name: 'Main Municipal Stormwater Outfall Drain',
    category: 'Drainage',
    districtId: 'vijayawada',
    districtName: 'Vijayawada',
    location: 'Municipal Ward 4 Low-Income Colony',
    capacity: '2,500 L/sec flow',
    condition: '🔴 Critical',
    utilizationPct: 125,
    nearestFacilityDistanceKm: 1.5,
    travelTimeMinutes: 5,
    staffOrEquipmentStatus: 'Silt blockage 70%, open sewer overflow into residential streets',
    coverageRadiusKm: 4,
    servedPopulation: 19400,
    lastInspectedDate: '2026-08-14'
  },
  {
    id: 'INFRA-SAN-001',
    name: 'Community Sanitation Complex',
    category: 'Sanitation',
    districtId: 'guntur',
    districtName: 'Guntur',
    location: 'Autonagar Worker Hub',
    capacity: '24 toilet units',
    condition: '⚠️ Poor',
    utilizationPct: 102,
    nearestFacilityDistanceKm: 0.8,
    travelTimeMinutes: 3,
    staffOrEquipmentStatus: 'Water inlet valve leaking, septic tank desilting required',
    coverageRadiusKm: 2,
    servedPopulation: 8200,
    lastInspectedDate: '2026-06-30'
  }
];

export function getAssetsByDistrict(districtId: string): InfrastructureAsset[] {
  return INFRASTRUCTURE_ASSETS_REGISTRY.filter(
    (asset) => asset.districtId.toLowerCase() === districtId.toLowerCase()
  );
}

export function getAssetsByCategory(category: string): InfrastructureAsset[] {
  return INFRASTRUCTURE_ASSETS_REGISTRY.filter(
    (asset) => asset.category.toLowerCase() === category.toLowerCase() ||
               (category === 'Health' && asset.category === 'Healthcare') ||
               (category === 'Healthcare' && asset.category === 'Health')
  );
}
