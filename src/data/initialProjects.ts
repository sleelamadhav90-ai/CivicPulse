import { GovernmentProject } from '../types';

export const INITIAL_GOVERNMENT_PROJECTS: GovernmentProject[] = [
  {
    id: 'gov-proj-01',
    title: 'Drainage Upgrade — Vijayawada',
    district: 'Vijayawada',
    districtId: 'vijayawada',
    state: 'Andhra Pradesh',
    category: 'Drainage',
    priorityScore: 94,
    citizenRequestsCount: 1248,
    population: 84000,
    estimatedCostInr: 124000000, // ₹12.4 Cr
    status: 'Recommended',
    progress: 0,
    department: 'Municipal Administration & Urban Development (MA&UD)',
    officerInCharge: 'R. K. Verma, Superintending Engineer',
    startDate: 'Q2 2025',
    targetDate: 'Q4 2025',
    beforeAccess: 26,
    afterAccess: 88,
    description: 'Upgrade stormwater drainage networks, widen low-lying culverts, and build automated pumping stations to prevent annual monsoon inundation in Wards 12, 14 & 18.',
    keyReasoning: [
      '1,248 citizen complaints clustered via voice & WhatsApp',
      'High population density in low-lying commercial core (84,000 residents)',
      'Poor infrastructure index (74% drainage deficit gap)',
      'Frequent flooding reports & sewer overflow risk',
      'Existing investment gap under AMRUT 2.0'
    ],
    aiSummary: 'AI analysis verified critical inundation risks across 84,000 citizens. Recommended for immediate administrative sanction with ₹12.4 Cr estimated outlay.',
    sourceRecommendationId: 'rec-01',
    history: [
      {
        status: 'Recommended',
        timestamp: '2025-02-14T09:30:00Z',
        note: 'AI Priority Engine flagged high complaint concentration (1,248 requests) and calculated 94/100 composite priority score.',
        actor: 'CivicPulse AI Engine'
      }
    ]
  },
  {
    id: 'gov-proj-02',
    title: 'Piped Water Supply & RO Hub Network — Guntur',
    district: 'Guntur',
    districtId: 'guntur',
    state: 'Andhra Pradesh',
    category: 'Water',
    priorityScore: 89,
    citizenRequestsCount: 1842,
    population: 94000,
    estimatedCostInr: 98000000, // ₹9.8 Cr
    status: 'Approved',
    progress: 15,
    department: 'Rural Water Supply & Sanitation (RWSS)',
    officerInCharge: 'S. Lakshmi, Executive Engineer',
    startDate: 'Q1 2025',
    targetDate: 'Q4 2025',
    beforeAccess: 38,
    afterAccess: 92,
    description: 'Commission 14 solar-powered membrane filtration RO hubs and 42km feeder pipeline to eradicate groundwater fluoride toxicity across 22 village panchayats.',
    keyReasoning: [
      '1,842 citizen requests highlighting severe salinity & dry borewells',
      'High fluoride health vulnerability impacting 94,000 residents',
      '62% baseline water access deficit',
      'Seasonal borewell depletion reports',
      'Approved for Jal Jeevan Mission supplemental trunk line allocation'
    ],
    aiSummary: 'Project approved by District Collectorate following AI Policy Lab brief. Tender issued for 14 solar RO plants.',
    sourceRecommendationId: 'rec-02',
    history: [
      {
        status: 'Recommended',
        timestamp: '2025-01-10T11:00:00Z',
        note: 'Flagged by Priority Engine with score 89/100.',
        actor: 'CivicPulse AI Engine'
      },
      {
        status: 'Approved',
        timestamp: '2025-01-28T14:15:00Z',
        note: 'Administrative sanction granted by State Water Board with ₹9.8 Cr budget release.',
        actor: 'District Magistrate Office'
      }
    ]
  },
  {
    id: 'gov-proj-03',
    title: 'Smart LED Street Lighting & Safety Corridors — Nagpur',
    district: 'Nagpur',
    districtId: 'nagpur',
    state: 'Maharashtra',
    category: 'Electricity',
    priorityScore: 82,
    citizenRequestsCount: 1420,
    population: 110000,
    estimatedCostInr: 56000000, // ₹5.6 Cr
    status: 'In Progress',
    progress: 68,
    department: 'Public Works & Energy Department (PWD)',
    officerInCharge: 'M. P. Joshi, Project Director',
    startDate: 'Q4 2024',
    targetDate: 'Q3 2025',
    beforeAccess: 44,
    afterAccess: 95,
    description: 'Installing 4,200 connected smart LED poles with automatic dusk sensors along transit highways, dark worker commuter corridors, and rural bypasses.',
    keyReasoning: [
      '1,420 citizen requests reporting unlit transit corridors and safety concerns',
      'High night-shift commuter density along industrial belt',
      '56% baseline street lighting gap',
      'High women safety priority scoring in municipal audit',
      'Fast-track 8-month execution underway'
    ],
    aiSummary: 'Under active construction: 2,850 of 4,200 smart LED luminaires commissioned. Citizen nighttime incident reports down 42%.',
    sourceRecommendationId: 'rec-03',
    history: [
      {
        status: 'Recommended',
        timestamp: '2024-09-05T08:00:00Z',
        note: 'AI identified 1,420 dark-spot complaints across industrial corridors.',
        actor: 'CivicPulse AI Engine'
      },
      {
        status: 'Approved',
        timestamp: '2024-10-02T10:30:00Z',
        note: 'Work order awarded to Mahavitaran Smart Infrastructure Ltd.',
        actor: 'Municipal Commissioner'
      },
      {
        status: 'In Progress',
        timestamp: '2024-11-15T09:00:00Z',
        note: 'Phase 1 pole installation commenced across Ward 4 and MIDC corridor.',
        actor: 'PWD Field Team'
      }
    ]
  },
  {
    id: 'gov-proj-04',
    title: 'All-Weather Bituminous Road Corridors — Nanded',
    district: 'Nanded',
    districtId: 'nanded',
    state: 'Maharashtra',
    category: 'Roads',
    priorityScore: 78,
    citizenRequestsCount: 1105,
    population: 75000,
    estimatedCostInr: 82000000, // ₹8.2 Cr
    status: 'Completed',
    progress: 100,
    department: 'Rural Roads Development Agency (PMGSY)',
    officerInCharge: 'V. S. Deshmukh, Chief Engineer',
    startDate: 'Q2 2024',
    targetDate: 'Q1 2025',
    completedDate: '2025-01-20',
    beforeAccess: 42,
    afterAccess: 91,
    description: 'Reconstructed 68km of flood-prone black cotton soil roads with reinforced paver shoulders and side culverts connecting 18 agrarian village clusters to district mandis.',
    keyReasoning: [
      '1,105 citizen requests reporting monsoon road collapses and ambulance delays',
      'High agricultural cargo traffic (cotton and soybean transport belt)',
      '58% unpaved transit deficit',
      'PMGSY co-financing alignment',
      'Fully commissioned and audited with +49% access surge'
    ],
    aiSummary: 'Project completed and audited. Transit time to district hospital reduced from 75 mins to 22 mins. Complaint volume fell by 91%.',
    sourceRecommendationId: 'rec-04',
    history: [
      {
        status: 'Recommended',
        timestamp: '2024-03-12T10:00:00Z',
        note: 'AI detected high agrarian transport distress and emergency transit blockades.',
        actor: 'CivicPulse AI Engine'
      },
      {
        status: 'Approved',
        timestamp: '2024-04-10T16:00:00Z',
        note: 'PMGSY funding cleared by Ministry of Rural Development.',
        actor: 'State Highway Authority'
      },
      {
        status: 'In Progress',
        timestamp: '2024-06-01T08:00:00Z',
        note: 'Bituminous paving and culvert reconstruction started.',
        actor: 'Contractor JV'
      },
      {
        status: 'Completed',
        timestamp: '2025-01-20T17:00:00Z',
        note: 'Final third-party quality inspection cleared. Handed over to public.',
        actor: 'Quality Control Auditor'
      }
    ]
  },
  {
    id: 'gov-proj-05',
    title: 'Primary Health Sub-Center Solar Grid & Diagnostic Units — Kurnool',
    district: 'Kurnool',
    districtId: 'kurnool',
    state: 'Andhra Pradesh',
    category: 'Health',
    priorityScore: 74,
    citizenRequestsCount: 890,
    population: 48000,
    estimatedCostInr: 45000000, // ₹4.5 Cr
    status: 'In Progress',
    progress: 40,
    department: 'Health, Medical & Family Welfare Department',
    officerInCharge: 'Dr. A. Madhavi, District Medical Officer',
    startDate: 'Q1 2025',
    targetDate: 'Q3 2025',
    beforeAccess: 45,
    afterAccess: 84,
    description: 'Equipping 28 rural sub-centers with 5kVA solar battery backups for uninterrupted vaccine cold-chains and deploying 4 mobile tele-diagnostic units.',
    keyReasoning: [
      '890 citizen complaints regarding grid outages and vaccine spoilage',
      'Remote maternal health vulnerability in tribal mandals',
      '55% clinic equipment gap',
      'Vaccine cold-chain failure risks during summer peak',
      'High ROI healthcare investment'
    ],
    aiSummary: '12 of 28 clinics electrified with solar microgrids. 2 tele-medicine vans deployed in Western Kurnool mandals.',
    sourceRecommendationId: 'rec-05',
    history: [
      {
        status: 'Recommended',
        timestamp: '2024-11-20T09:00:00Z',
        note: 'AI flagged cold-chain vulnerability and maternal clinic power failures.',
        actor: 'CivicPulse AI Engine'
      },
      {
        status: 'Approved',
        timestamp: '2024-12-15T11:30:00Z',
        note: 'National Health Mission allocated ₹4.5 Cr grant.',
        actor: 'District Collector'
      },
      {
        status: 'In Progress',
        timestamp: '2025-01-10T10:00:00Z',
        note: 'Solar panel delivery and battery installation started in 12 centers.',
        actor: 'NREDCAP Agency'
      }
    ]
  },
  {
    id: 'gov-proj-06',
    title: 'School Sanitation Blocks & Solar Digital Learning Hubs — Solapur',
    district: 'Solapur',
    districtId: 'solapur',
    state: 'Maharashtra',
    category: 'Education',
    priorityScore: 68,
    citizenRequestsCount: 650,
    population: 32000,
    estimatedCostInr: 34000000, // ₹3.4 Cr
    status: 'Approved',
    progress: 10,
    department: 'School Education & Sports Department',
    officerInCharge: 'P. B. Shinde, Education Officer',
    startDate: 'Q2 2025',
    targetDate: 'Q4 2025',
    beforeAccess: 48,
    afterAccess: 86,
    description: 'Constructing 45 dedicated girl-child bio-sanitation complexes and setting up solar-powered interactive digital classrooms across 30 drought-prone zilla parishad schools.',
    keyReasoning: [
      '650 citizen & teacher requests regarding school dropout and sanitation barriers',
      'Vulnerable student demographic in drought-prone taluks',
      '48% baseline school facility deficit',
      'Samagra Shiksha Abhiyan co-financing',
      'Fast-track community impact'
    ],
    aiSummary: 'Administrative approval received. Civil tendering initiated for 45 school bio-toilets.',
    sourceRecommendationId: 'rec-06',
    history: [
      {
        status: 'Recommended',
        timestamp: '2025-01-05T14:00:00Z',
        note: 'AI highlighted correlation between lack of sanitation and female student dropout rates.',
        actor: 'CivicPulse AI Engine'
      },
      {
        status: 'Approved',
        timestamp: '2025-02-01T15:00:00Z',
        note: 'Zilla Parishad council approved ₹3.4 Cr outlay.',
        actor: 'Zilla Parishad CEO'
      }
    ]
  }
];
