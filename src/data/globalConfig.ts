import { CountryConfig, CountryCode, UniversalCivicSchema } from '../types';

export const GLOBAL_COUNTRIES: Record<CountryCode, CountryConfig> = {
  IN: {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    tagline: 'India Stack & Jal Jeevan National Infrastructure Grid',
    currencySymbol: '₹',
    currencyCode: 'INR',
    currencyRateToInr: 1,
    totalPopulation: '1.42 Billion',
    signalCount: '12,482',
    hierarchy: {
      level1: 'Country',
      level2: 'State',
      level3: 'District',
      level4: 'City / Village'
    },
    languages: [
      { code: 'en', name: 'English', nativeName: 'English', flagEmoji: '🇬🇧' },
      { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flagEmoji: '🇮🇳' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flagEmoji: '🇮🇳' },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flagEmoji: '🇮🇳' },
      { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flagEmoji: '🇮🇳' },
    ],
    defaultCategories: ['Water', 'Roads', 'Drainage', 'Electricity', 'Healthcare', 'Education'],
    coordinates: { lat: 20.5937, lng: 78.9629, zoom: 4.5 },
    sampleCities: ['Vijayawada', 'Guntur', 'Visakhapatnam', 'Tirupati', 'Kakinada', 'Kurnool', 'Anantapur'],
    connectors: [
      {
        id: 'in-conn-1',
        name: 'India Census 2021 Demographics',
        category: 'demographics',
        status: 'Connected',
        provider: 'Ministry of Home Affairs (MHA)',
        endpoint: 'https://api.census.gov.in/v1/demographics',
        lastSync: '10 minutes ago',
        recordsCount: '1.42B Citizens'
      },
      {
        id: 'in-conn-2',
        name: 'Jal Jeevan Mission Tap Water Registry',
        category: 'infrastructure',
        status: 'Connected',
        provider: 'Ministry of Jal Shakti',
        endpoint: 'https://ejalshakti.gov.in/api/v2/assets',
        lastSync: '2 minutes ago',
        recordsCount: '19.4M Households'
      },
      {
        id: 'in-conn-3',
        name: 'State PWD Road Quality Registry',
        category: 'infrastructure',
        status: 'Connected',
        provider: 'AP Public Works Department',
        endpoint: 'https://pwd.ap.gov.in/api/asset-registry',
        lastSync: '15 minutes ago',
        recordsCount: '48,200 km Roads'
      },
      {
        id: 'in-conn-4',
        name: 'Bhashini AI Multilingual Voice Gateway',
        category: 'voice',
        status: 'Connected',
        provider: 'MeitY Digital India Stack',
        endpoint: 'https://bhashini.gov.in/api/v1/stt-tts',
        lastSync: 'Real-time',
        recordsCount: '22 Official Dialects'
      }
    ]
  },
  BR: {
    code: 'BR',
    name: 'Brazil',
    flag: '🇧🇷',
    tagline: 'IBGE Demographics & SUS Healthcare Infrastructure Mesh',
    currencySymbol: 'R$',
    currencyCode: 'BRL',
    currencyRateToInr: 16.5,
    totalPopulation: '215 Million',
    signalCount: '8,940',
    hierarchy: {
      level1: 'Country',
      level2: 'State (Estado)',
      level3: 'Municipality (Município)',
      level4: 'Neighborhood (Bairro)'
    },
    languages: [
      { code: 'pt', name: 'Portuguese', nativeName: 'Português', flagEmoji: '🇧🇷' },
      { code: 'en', name: 'English', nativeName: 'English', flagEmoji: '🇬🇧' },
      { code: 'es', name: 'Spanish', nativeName: 'Español', flagEmoji: '🇪🇸' }
    ],
    defaultCategories: ['Water & Sanitation', 'Urban Roads', 'SUS Healthcare', 'Public Safety', 'Energy Grid', 'Flood Drainage'],
    coordinates: { lat: -14.235, lng: -51.9253, zoom: 4 },
    sampleCities: ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador', 'Fortaleza', 'Manaus', 'Curitiba'],
    connectors: [
      {
        id: 'br-conn-1',
        name: 'IBGE National Demographic API',
        category: 'demographics',
        status: 'Connected',
        provider: 'Instituto Brasileiro de Geografia e Estatística',
        endpoint: 'https://servicodados.ibge.gov.br/api/v1/censos',
        lastSync: '8 minutes ago',
        recordsCount: '215M Citizens'
      },
      {
        id: 'br-conn-2',
        name: 'SUS Primary Healthcare Facility Registry',
        category: 'infrastructure',
        status: 'Connected',
        provider: 'Ministério da Saúde',
        endpoint: 'https://api.sus.gov.br/v2/unidades-saude',
        lastSync: '5 minutes ago',
        recordsCount: '42,100 Clinics'
      },
      {
        id: 'br-conn-3',
        name: 'DNIT Highway & Bridge Asset System',
        category: 'infrastructure',
        status: 'Connected',
        provider: 'Departamento Nacional de Infraestrutura de Transportes',
        endpoint: 'https://api.dnit.gov.br/v1/rodovias',
        lastSync: '1 hour ago',
        recordsCount: '65,000 km Roads'
      },
      {
        id: 'br-conn-4',
        name: 'Fala.BR Citizen Voice Portal',
        category: 'voice',
        status: 'Connected',
        provider: 'Controladoria-Geral da União (CGU)',
        endpoint: 'https://falabr.cgu.gov.br/api/v1/ouvidorias',
        lastSync: 'Real-time',
        recordsCount: 'Portuguese STT'
      }
    ]
  },
  ZA: {
    code: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    tagline: 'Stats SA Demographics & Water SA Infrastructure Grid',
    currencySymbol: 'R',
    currencyCode: 'ZAR',
    currencyRateToInr: 4.6,
    totalPopulation: '60.6 Million',
    signalCount: '5,120',
    hierarchy: {
      level1: 'Country',
      level2: 'Province',
      level3: 'District Municipality',
      level4: 'Municipal Ward'
    },
    languages: [
      { code: 'en', name: 'English', nativeName: 'English', flagEmoji: '🇿🇦' },
      { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', flagEmoji: '🇿🇦' },
      { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', flagEmoji: '🇿🇦' },
      { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flagEmoji: '🇿🇦' }
    ],
    defaultCategories: ['Water & Sanitation', 'Power & Eskom Grid', 'Road Maintenance', 'Public Clinics', 'Digital Fiber', 'School Infra'],
    coordinates: { lat: -30.5595, lng: 22.9375, zoom: 4.5 },
    sampleCities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Gqeberha', 'Bloemfontein', 'Polokwane'],
    connectors: [
      {
        id: 'za-conn-1',
        name: 'Stats SA Census & Poverty Index',
        category: 'demographics',
        status: 'Connected',
        provider: 'Statistics South Africa',
        endpoint: 'https://api.statssa.gov.za/v1/poverty-data',
        lastSync: '12 minutes ago',
        recordsCount: '60.6M Citizens'
      },
      {
        id: 'za-conn-2',
        name: 'Department of Water & Sanitation Registry',
        category: 'infrastructure',
        status: 'Connected',
        provider: 'DWS South Africa',
        endpoint: 'https://api.dws.gov.za/v2/reservoirs-taps',
        lastSync: '4 minutes ago',
        recordsCount: '8,400 Pumping Stations'
      },
      {
        id: 'za-conn-3',
        name: 'SANRAL Road Condition Index',
        category: 'infrastructure',
        status: 'Connected',
        provider: 'South African National Roads Agency',
        endpoint: 'https://api.sanral.co.za/v1/asset-management',
        lastSync: '22 minutes ago',
        recordsCount: '22,200 km Highways'
      },
      {
        id: 'za-conn-4',
        name: 'GovChat Multilingual WhatsApp Service',
        category: 'voice',
        status: 'Connected',
        provider: 'Government Communication Service',
        endpoint: 'https://api.govchat.org/v1/citizens',
        lastSync: 'Real-time',
        recordsCount: '11 Official Languages'
      }
    ]
  },
  RU: {
    code: 'RU',
    name: 'Russia',
    flag: '🇷🇺',
    tagline: 'Rosstat Regional Demographics & Gosuslugi Civic Layer',
    currencySymbol: '₽',
    currencyCode: 'RUB',
    currencyRateToInr: 0.92,
    totalPopulation: '143 Million',
    signalCount: '4,310',
    hierarchy: {
      level1: 'Country',
      level2: 'Federal Subject (Oblast)',
      level3: 'Municipal District (Raion)',
      level4: 'Settlement / City'
    },
    languages: [
      { code: 'ru', name: 'Russian', nativeName: 'Русский', flagEmoji: '🇷🇺' },
      { code: 'en', name: 'English', nativeName: 'English', flagEmoji: '🇬🇧' },
      { code: 'tt', name: 'Tatar', nativeName: 'Татарча', flagEmoji: '🇷🇺' }
    ],
    defaultCategories: ['Heating Grid', 'Road Repair', 'Water Supply', 'Public Transport', 'Polyclinics', 'Waste Management'],
    coordinates: { lat: 61.524, lng: 105.3188, zoom: 3 },
    sampleCities: ['Moscow', 'Saint Petersburg', 'Kazan', 'Novosibirsk', 'Yekaterinburg', 'Nizhny Novgorod', 'Samara'],
    connectors: [
      {
        id: 'ru-conn-1',
        name: 'Rosstat Demographics Registry',
        category: 'demographics',
        status: 'Connected',
        provider: 'Federal State Statistics Service',
        endpoint: 'https://rosstat.gov.ru/api/v1/regions',
        lastSync: '14 minutes ago',
        recordsCount: '143M Citizens'
      },
      {
        id: 'ru-conn-2',
        name: 'Gosuslugi Housing & Utilities System (GIS ZKH)',
        category: 'infrastructure',
        status: 'Connected',
        provider: 'Ministry of Digital Development',
        endpoint: 'https://dom.gosuslugi.ru/api/v2/infrastructure',
        lastSync: '7 minutes ago',
        recordsCount: '14,200 Heating Sub-stations'
      },
      {
        id: 'ru-conn-3',
        name: 'Federal Road Agency (Rosavtodor)',
        category: 'infrastructure',
        status: 'Connected',
        provider: 'Rosavtodor',
        endpoint: 'https://rosavtodor.gov.ru/api/asset-index',
        lastSync: '45 minutes ago',
        recordsCount: '54,000 km Federal Roads'
      }
    ]
  },
  CN: {
    code: 'CN',
    name: 'China',
    flag: '🇨🇳',
    tagline: 'NBS Demographics & MOHURD Municipal Infrastructure Matrix',
    currencySymbol: '¥',
    currencyCode: 'CNY',
    currencyRateToInr: 11.8,
    totalPopulation: '1.41 Billion',
    signalCount: '9,150',
    hierarchy: {
      level1: 'Country',
      level2: 'Province (省)',
      level3: 'Prefecture / City (地级市)',
      level4: 'County / District (县/区)'
    },
    languages: [
      { code: 'zh', name: 'Mandarin', nativeName: '中文 (普通话)', flagEmoji: '🇨🇳' },
      { code: 'en', name: 'English', nativeName: 'English', flagEmoji: '🇬🇧' },
      { code: 'canton', name: 'Cantonese', nativeName: '粵語', flagEmoji: '🇨🇳' }
    ],
    defaultCategories: ['High-Speed Rail Transit', 'Municipal Water Grid', 'Digital Infrastructure', 'Urban Sanitation', 'Public Health', 'Power Substation'],
    coordinates: { lat: 35.8617, lng: 104.1954, zoom: 3.5 },
    sampleCities: ['Guangzhou', 'Shenzhen', 'Shanghai', 'Hangzhou', 'Chengdu', 'Wuhan', 'Nanjing'],
    connectors: [
      {
        id: 'cn-conn-1',
        name: 'NBS National Bureau of Statistics API',
        category: 'demographics',
        status: 'Connected',
        provider: 'National Bureau of Statistics of China',
        endpoint: 'https://stats.gov.cn/api/v1/census',
        lastSync: '20 minutes ago',
        recordsCount: '1.41B Citizens'
      },
      {
        id: 'cn-conn-2',
        name: 'MOHURD Urban Utilities & Water Grid',
        category: 'infrastructure',
        status: 'Connected',
        provider: 'Ministry of Housing and Urban-Rural Development',
        endpoint: 'https://mohurd.gov.cn/api/v2/utilities',
        lastSync: '3 minutes ago',
        recordsCount: '89,000 Pervious Drainage Grids'
      },
      {
        id: 'cn-conn-3',
        name: 'China Transport Asset Network',
        category: 'infrastructure',
        status: 'Connected',
        provider: 'Ministry of Transport',
        endpoint: 'https://mot.gov.cn/api/asset-monitoring',
        lastSync: '10 minutes ago',
        recordsCount: '173,000 km Expressways'
      }
    ]
  }
};

export const SAMPLE_UNIVERSAL_SCHEMAS: UniversalCivicSchema[] = [
  {
    requestId: 'CP-UNI-901',
    countryCode: 'IN',
    region: 'Andhra Pradesh',
    location: 'Vijayawada, Ward 14',
    category: 'Roads & Transit',
    problem: 'Severe asphalt cave-in blocking school bus corridor after heavy monsoons.',
    severity: 9,
    affectedPopulation: 184200,
    timestamp: '2026-08-31T09:12:00Z',
    evidenceType: 'Audio Voice',
    originalLanguage: 'Telugu (తెలుగు)',
    originalText: 'ఎమ్‌జి రోడ్డు బస్ స్టాండ్ వద్ద రోడ్డు పూర్తిగా కొట్టుకుపోయింది.',
    canonicalEnglishText: 'MG Road near bus stand completely washed out after heavy monsoons.',
    infrastructureGapPct: 82,
    priorityScore: 94,
    status: 'Prioritized'
  },
  {
    requestId: 'CP-UNI-902',
    countryCode: 'BR',
    region: 'São Paulo',
    location: 'Favela da Rocinha / Zona Sul',
    category: 'Water & Sanitation',
    problem: 'Main water pump pipe rupture causing clean water contamination & supply deficit.',
    severity: 8,
    affectedPopulation: 125000,
    timestamp: '2026-08-31T08:45:00Z',
    evidenceType: 'WhatsApp',
    originalLanguage: 'Portuguese (Português)',
    originalText: 'A tubulação principal de água rompeu perto do morro, estamos sem água limpa.',
    canonicalEnglishText: 'The main water pipeline burst near the hill, leaving 125,000 residents without clean drinking water.',
    infrastructureGapPct: 78,
    priorityScore: 91,
    status: 'Under Review'
  },
  {
    requestId: 'CP-UNI-903',
    countryCode: 'ZA',
    region: 'Gauteng',
    location: 'Soweto, Block 4',
    category: 'Power & Grid',
    problem: 'Substation transformer explosion leaving 85,000 residents without power for 3 days.',
    severity: 9,
    affectedPopulation: 85000,
    timestamp: '2026-08-31T07:30:00Z',
    evidenceType: 'Text SMS',
    originalLanguage: 'Zulu (isiZulu)',
    originalText: 'I-transformer e-Block 4 iqhume izolo, asinawo ugesi nabantwana babanda.',
    canonicalEnglishText: 'Block 4 transformer exploded yesterday; no electricity for 85,000 residents.',
    infrastructureGapPct: 85,
    priorityScore: 93,
    status: 'Assigned'
  },
  {
    requestId: 'CP-UNI-904',
    countryCode: 'RU',
    region: 'Tatarstan',
    location: 'Kazan, Vakhitovsky District',
    category: 'Heating Grid',
    problem: 'Central heating pipeline burst during sub-zero freeze.',
    severity: 10,
    affectedPopulation: 42000,
    timestamp: '2026-08-31T06:15:00Z',
    evidenceType: 'Audio Voice',
    originalLanguage: 'Russian (Русский)',
    originalText: 'Труба отопления прорвалась на улице Баумана, в домах нет тепла.',
    canonicalEnglishText: 'District heating main burst on Bauman street; apartments without heat in sub-zero weather.',
    infrastructureGapPct: 88,
    priorityScore: 96,
    status: 'Prioritized'
  },
  {
    requestId: 'CP-UNI-905',
    countryCode: 'CN',
    region: 'Guangdong',
    location: 'Guangzhou, Tianhe District',
    category: 'Urban Drainage',
    problem: 'Stormwater culvert siltation causing flash flooding near metro entrance.',
    severity: 8,
    affectedPopulation: 210000,
    timestamp: '2026-08-31T05:20:00Z',
    evidenceType: 'Photo Report',
    originalLanguage: 'Mandarin (中文)',
    originalText: '天河区地铁站入口积水严重，排水管堵塞。',
    canonicalEnglishText: 'Severe waterlogging at Tianhe Metro station entrance due to clogged underground culvert.',
    infrastructureGapPct: 74,
    priorityScore: 89,
    status: 'Logged'
  }
];
