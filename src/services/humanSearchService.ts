import { CitizenRequest, District, GovernmentProject, InfrastructureAsset, InfrastructureCategory } from '../types';
import { CommunityIssue } from '../components/CommunityIssuesView';
import { DEPARTMENT_GRIEVANCE_BASELINES } from '../data/governmentBaselineData';
import { INFRASTRUCTURE_ASSETS_REGISTRY } from '../data/infrastructureAssets';
import { INITIAL_COMMUNITY_ISSUES } from '../components/CommunityIssuesView';

// Canonical categories and their human-facing display names
export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  Water: 'Water Supply',
  Roads: 'Roads & Transport',
  Electricity: 'Electricity & Power',
  Health: 'Public Health & Healthcare',
  Healthcare: 'Public Health & Healthcare',
  Drainage: 'Drainage & Flood Management',
  Sanitation: 'Sanitation & Waste Management',
  Education: 'Education & Schools',
  Other: 'Public Infrastructure',
};

// Multilingual and synonym mapping for categories
interface CategoryKeywords {
  category: InfrastructureCategory;
  displayName: string;
  terms: string[];
}

export const CATEGORY_SYNONYMS: CategoryKeywords[] = [
  {
    category: 'Water',
    displayName: 'Water Supply',
    terms: [
      // English
      'water', 'drinking water', 'tap', 'pipeline', 'water supply', 'shortage', 'leakage', 
      'tanker', 'borewell', 'groundwater', 'well', 'water quality', 'contamination', 
      'water pressure', 'salinity', 'water crisis', 'fluoride', 'pipeline burst',
      // Hindi
      'पानी', 'जल', 'पेयजल', 'नल', 'पाइपलाइन', 'आपूर्ति', 'किल्लत', 'जलभराव', 'बोरवेल', 'टैंकर', 'कुआं',
      // Telugu
      'నీరు', 'మంచినీరు', 'తాగునీరు', 'పైప్‌లైన్', 'సరఫరా', 'కొరత', 'లీకేజీ', 'బోర్‌వెల్', 'ట్యాంకర్', 'నీటి సమస్య',
      // Tamil
      'நீர்', 'தண்ணீர்', 'குடிநீர்', 'குழாய்', 'விநியோகம்', 'கசிவு', 'தட்டுப்பாடு', 'ஆழ்துளை', 'லாரி',
      // Kannada
      'ನೀರು', 'ಕುಡಿಯುವ ನೀರು', 'ಪೈಪ್‌ಲೈನ್', 'ಸರಬರಾಜು', 'ಸೋರಿಕೆ', 'ಕೊರತೆ', 'ಬೋರ್‌ವೆಲ್',
      // Marathi
      'पाणी', 'पिण्याचे पाणी', 'पाईपलाईन', 'पुरवठा', 'गळती', 'टंचाई', 'बोअरवेल', 'नळ',
      // Bengali
      'জল', 'পানীয় জল', 'পাইপলাইন', 'সরবরাহ', 'লিকেজ', 'ঘাটতি', 'টিউবওয়েল', 'ট্যাঙ্কার',
      // Odia
      'ଜଳ', 'ପାଣି', 'ପିଇବା ପାଣି', 'ପାଇପଲାଇନ୍', 'ଯୋଗାଣ', 'ଲିକେଜ୍', 'ଅଭାବ', 'ଟ୍ୟାଙ୍କର୍'
    ]
  },
  {
    category: 'Roads',
    displayName: 'Roads & Transport',
    terms: [
      // English
      'road', 'roads', 'pothole', 'potholes', 'street', 'highway', 'asphalt', 'transport', 
      'traffic', 'broken road', 'bridge', 'pavement', 'culvert', 'connectivity', 'commute', 
      'tarmac', 'corridor', 'crater', 'washout',
      // Hindi
      'सड़क', 'सड़कें', 'मार्ग', 'गड्ढा', 'गड्ढे', 'हाईवे', 'रास्ता', 'डामर', 'पुल', 'यातायात',
      // Telugu
      'రోడ్డు', 'రోడ్లు', 'రహదారి', 'గుంతలు', 'రవాణా', 'వీధి', 'వంతెన', 'ట్రాఫిక్',
      // Tamil
      'சாலை', 'தெரு', 'குண்டும் குழியும்', 'நெடுஞ்சாலை', 'போக்குவரத்து', 'பாலம்',
      // Kannada
      'ರಸ್ತೆ', 'ರಸ್ತೆಗಳು', 'ಗುಂಡಿ', 'ಗುಂಡಿಗಳು', 'ಹೆದ್ದಾರಿ', 'ಸಾರಿಗೆ', 'ಬೀದಿ', 'ಸೇತುವೆ',
      // Marathi
      'रस्ता', 'रस्ते', 'खड्डे', 'महामार्ग', 'वाहतूक', 'गल्ली', 'पूल',
      // Bengali
      'রাস্তা', 'সড়ক', 'গর্ত', 'হাইওয়ে', 'পরিবহন', 'সেতু',
      // Odia
      'ରାସ୍ତା', 'ସଡ଼କ', 'ଖାଲ', 'ହାଇୱେ', 'ପରିବହନ', 'ପୋଲ'
    ]
  },
  {
    category: 'Electricity',
    displayName: 'Electricity & Power',
    terms: [
      // English
      'electricity', 'power', 'light', 'transformer', 'wire', 'outage', 'blackout', 
      'voltage', 'load shedding', 'power cut', 'substation', 'grid', 'current', 'pole', 
      'cables', 'high tension', 'street light', 'streetlight',
      // Hindi
      'बिजली', 'विद्युत', 'ट्रांसफार्मर', 'तार', 'कटौती', 'वोल्टेज', 'करंट', 'खंभा', 'बत्ती',
      // Telugu
      'విద్యుత్', 'కరెంట్', 'ట్రాన్స్‌ఫార్మర్', 'తీగలు', 'కోత', 'వోల్టేజ్', 'స్తంభం', 'లైట్లు',
      // Tamil
      'மின்சாரம்', 'மின்வெட்டு', 'மின்மாற்றி', 'கம்பி', 'மின்னழுத்தம்', 'மின்கம்பம்', 'விளக்கு',
      // Kannada
      'ವಿದ್ಯುತ್', 'ಕರೆಂಟ್', 'ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್', 'ತಂತಿ', 'ಕಡಿತ', 'ವೋಲ್ಟೇಜ್', 'ದೀಪ',
      // Marathi
      'वीज', 'विद्युत', 'ट्रान्सफॉर्मर', 'वायर', 'खंडित', 'दाबाचा', 'खांब',
      // Bengali
      'বিদ্যুৎ', 'কারেন্ট', 'ট্রান্সফরমার', 'তার', 'লোডশেডিং', 'ভোল্টেজ', 'বাতি',
      // Odia
      'ବିଦ୍ୟୁତ୍', 'କରେଣ୍ଟ', 'ଟ୍ରାନ୍ସଫର୍ମର', 'ତାର', 'କଟ୍', 'ଭୋଲଟେଜ୍', 'ଖୁଣ୍ଟ'
    ]
  },
  {
    category: 'Health',
    displayName: 'Public Health & Healthcare',
    terms: [
      // English
      'health', 'healthcare', 'hospital', 'clinic', 'phc', 'doctor', 'medicine', 'medicines', 
      'nurse', 'ambulance', 'treatment', 'dispensary', 'sub-centre', 'maternity', 'drug shortage',
      // Hindi
      'स्वास्थ्य', 'अस्पताल', 'दवा', 'दवाएं', 'डॉक्टर', 'क्लिनिक', 'चिकित्सा', 'नर्स', 'पीएचसी',
      // Telugu
      'ఆరోగ్యం', 'ఆసుపత్రి', 'మందులు', 'డాక్టర్', 'చికిత్స', 'వైద్యం', 'పీహెచ్‌సీ',
      // Tamil
      'சுகாதாரம்', 'மருத்துவமனை', 'மருந்து', 'மருத்துவர்', 'சிகிச்சை', 'ஆரம்ப சுகாதார நிலையம்',
      // Kannada
      'ಆರೋಗ್ಯ', 'ಆಸ್ಪತ್ರೆ', 'ಔಷಧಿ', 'ವೈದ್ಯರು', 'ಚಿಕಿತ್ಸೆ', 'ಪಿಎಚ್‌ಸಿ',
      // Marathi
      'आरोग्य', 'रुग्णालय', 'औषध', 'डॉक्टर', 'उपचार', 'प्राथमिक आरोग्य केंद्र',
      // Bengali
      'স্বাস্থ্য', 'হাসপাতাল', 'ওষুধ', 'ডাক্তার', 'চিকিৎসা', 'নার্স',
      // Odia
      'ସ୍ୱାସ୍ଥ୍ୟ', 'ଡାକ୍ତରଖାନା', 'ଔଷଧ', 'ଡାକ୍ତର', 'ଚିକିତ୍ସା', 'ପିଏଚ୍‌ସି'
    ]
  },
  {
    category: 'Drainage',
    displayName: 'Drainage & Flood Management',
    terms: [
      // English
      'drainage', 'drain', 'sewer', 'sewage', 'gutter', 'culvert', 'flood', 'flooding', 
      'waterlogging', 'siltation', 'stormwater', 'overflow', 'choked drain',
      // Hindi
      'नाली', 'नालियां', 'सीवर', 'गटर', 'जलभराव', 'बाढ़', 'निकासी', 'गाद',
      // Telugu
      'డ్రైనేజీ', 'మురుగు', 'కాలువ', 'మురుగునీరు', 'వరద', 'కాలువ పూడిక',
      // Tamil
      'வடிகால்', 'கழிவுநீர்', 'சாக்கடை', 'வெள்ளம்', 'நீர் தேங்குதல்',
      // Kannada
      'ಚರಂಡಿ', 'ಒಳಚರಂಡಿ', 'ನೀರು ನಿಲ್ಲುವುದು', 'ಪ್ರವಾಹ',
      // Marathi
      'सांडपाणी', 'गटर', 'ड्रेनेज', 'पाणी साचणे', 'पूर',
      // Bengali
      'নর্দমা', 'ড্রেন', 'জল জমা', 'বন্যা', 'সুয়ারেজ',
      // Odia
      'ନର୍ଦ୍ଦମା', 'ଡ୍ରେନ୍', 'ପାଣି ଜମିବା', 'ବନ୍ୟା'
    ]
  },
  {
    category: 'Sanitation',
    displayName: 'Sanitation & Waste Management',
    terms: [
      // English
      'sanitation', 'garbage', 'waste', 'trash', 'dump', 'cleanliness', 'hygiene', 
      'solid waste', 'rubbish', 'landfill', 'litter', 'swachh', 'cleaning',
      // Hindi
      'कचरा', 'गंदगी', 'सफाई', 'स्वच्छता', 'कूड़ा', 'कचरा डिपो',
      // Telugu
      'చెత్త', 'పరిశుభ్రత', 'పారిశుధ్యం', 'చెత్తకుండీ', 'వ్యర్థాలు',
      // Tamil
      'குப்பை', 'தூய்மை', 'சுகாதாரம்', 'கழிவு',
      // Kannada
      'ಕಸ', 'ತ್ಯಾಜ್ಯ', 'ಸ್ವಚ್ಛತೆ', 'ಕಸದ ತೊಟ್ಟಿ',
      // Marathi
      'कचरा', 'स्वच्छता', 'घाण', 'कचराकुंडी',
      // Bengali
      'আবর্জনা', 'বর্জ্য', 'পরিচ্ছন্নতা', 'ময়লা',
      // Odia
      'ଅଳିଆ', 'ଆବର୍ଜନା', 'ସ୍ୱଚ୍ଛତା'
    ]
  },
  {
    category: 'Education',
    displayName: 'Education & Schools',
    terms: [
      // English
      'education', 'school', 'schools', 'teacher', 'student', 'classroom', 'hostel', 
      'college', 'books', 'desk', 'campus',
      // Hindi
      'शिक्षा', 'स्कूल', 'विद्यालय', 'शिक्षक', 'छात्र', 'कक्षा',
      // Telugu
      'విద్య', 'పాఠశాల', 'బడి', 'ఉపాధ్యాయులు', 'విద్యార్థులు', 'తరగతి',
      // Tamil
      'கல்வி', 'பள்ளி', 'ஆசிரியர்', 'மாணவர்', 'வகுப்பறை',
      // Kannada
      'ಶಿಕ್ಷಣ', 'ಶಾಲೆ', 'ಶಿಕ್ಷಕರು', 'ವಿದ್ಯಾರ್ಥಿಗಳು',
      // Marathi
      'शिक्षण', 'शाळा', 'शिक्षक', 'विद्यार्थी',
      // Bengali
      'শিক্ষা', 'বিদ্যালয়', 'স্কুল', 'শিক্ষক', 'ছাত্র',
      // Odia
      'ଶିକ୍ଷା', 'ବିଦ୍ୟାଳୟ', 'ସ୍କୁଲ', 'ଶିକ୍ଷକ', 'ଛାତ୍ର'
    ]
  }
];

// Common typo corrections dictionary
export const TYPO_DICTIONARY: Record<string, string> = {
  // Water
  watr: 'water',
  watter: 'water',
  waterr: 'water',
  watere: 'water',
  pipelin: 'pipeline',
  pipline: 'pipeline',
  boarwell: 'borewell',
  borwell: 'borewell',
  // Roads
  rads: 'roads',
  rod: 'road',
  rodes: 'roads',
  pothol: 'pothole',
  pothols: 'potholes',
  potholee: 'pothole',
  traffc: 'traffic',
  hway: 'highway',
  // Electricity
  electrcity: 'electricity',
  electrcty: 'electricity',
  electrisity: 'electricity',
  transfomer: 'transformer',
  trnasformer: 'transformer',
  voltge: 'voltage',
  outag: 'outage',
  // Health
  hosptal: 'hospital',
  hospitl: 'hospital',
  hosspital: 'hospital',
  medcine: 'medicine',
  medcin: 'medicine',
  doctr: 'doctor',
  clnic: 'clinic',
  // Sanitation / Drainage
  garbge: 'garbage',
  garbag: 'garbage',
  drainge: 'drainage',
  drange: 'drainage',
  sewerg: 'sewerage',
  gutterr: 'gutter',
  // Places
  guntor: 'Guntur',
  gunturu: 'Guntur',
  vijaywada: 'Vijayawada',
  vijayavada: 'Vijayawada',
  patana: 'Patna',
  solapoor: 'Solapur',
  nashk: 'Nashik',
  jodhpor: 'Jodhpur',
  jaypur: 'Jaipur',
  lucknoww: 'Lucknow',
};

export interface SearchIntent {
  rawQuery: string;
  normalizedQuery: string;
  exactId: string | null;
  detectedCategories: InfrastructureCategory[];
  detectedLocations: string[];
  isUrgent: boolean;
  isRecent: boolean;
  isHighScale: boolean;
  keywords: string[];
  typoCorrection: string | null;
}

export interface HumanSearchResultItem {
  id: string;
  type: 'EXACT_REQUEST' | 'BEST_MATCH' | 'COMMUNITY_ISSUE' | 'PRIORITY_HOTSPOT' | 'CITIZEN_REPORT' | 'ACTION_PROJECT' | 'INFRASTRUCTURE' | 'GOVERNMENT_BASELINE';
  title: string;
  subtitle?: string;
  category: string;
  location: string;
  provenanceLabel: 'CivicPulse Signals' | 'Government Baseline' | 'Illustrative Demo Data';
  provenanceBadgeColor: string;
  priorityLabel?: string;
  reportCount?: string;
  peopleAffected?: string;
  dateOrTimeline?: string;
  statusBadge?: string;
  actionHint: string;
  score: number;
  rawItem: any;
}

export interface HumanSearchResults {
  intent: SearchIntent;
  exactMatch: HumanSearchResultItem | null;
  bestMatch: HumanSearchResultItem | null;
  communityIssues: HumanSearchResultItem[];
  priorityHotspots: HumanSearchResultItem[];
  citizenReports: HumanSearchResultItem[];
  actionProjects: HumanSearchResultItem[];
  infrastructure: HumanSearchResultItem[];
  governmentBaseline: HumanSearchResultItem[];
  suggestions: string[];
  totalResultsCount: number;
}

/**
 * Normalizes search text (removes extra punctuation, lowercases, cleans whitespace)
 */
export function normalizeQuery(query: string): string {
  return query.toLowerCase().replace(/[#?,!.:;()"]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Parses user search query to extract human intent without requiring database codes
 */
export function parseSearchIntent(query: string, allDistricts: District[] = []): SearchIntent {
  const raw = query.trim();
  const normalized = normalizeQuery(raw);
  const words = normalized.split(' ').filter(Boolean);

  // 1. Check for Exact ID pattern
  let exactId: string | null = null;
  const idPattern = /(cp-[\w-]+|req-[\w-]+|gov-proj-[\w-]+|issue-[\w-]+|infra-[\w-]+)/i;
  const idMatch = raw.match(idPattern);
  if (idMatch) {
    exactId = idMatch[1].trim();
  }

  // 2. Typo correction check
  let typoCorrection: string | null = null;
  for (const word of words) {
    if (TYPO_DICTIONARY[word]) {
      typoCorrection = TYPO_DICTIONARY[word];
      break;
    }
  }

  // 3. Category Detection across all synonyms and languages
  const detectedCategories: InfrastructureCategory[] = [];
  for (const cat of CATEGORY_SYNONYMS) {
    for (const term of cat.terms) {
      if (normalized.includes(term.toLowerCase())) {
        if (!detectedCategories.includes(cat.category)) {
          detectedCategories.push(cat.category);
        }
        break;
      }
    }
  }

  // 4. Location Detection (Districts, States, Major Cities)
  const detectedLocations: string[] = [];
  const popularPlaces = [
    'Guntur', 'Vijayawada', 'Krishna', 'Patna', 'Gaya', 'Solapur', 'Nashik',
    'Jodhpur', 'Jaipur', 'Barmer', 'Bikaner', 'Bhopal', 'Ranchi', 'Lucknow',
    'Varanasi', 'Kolkata', 'Bhubaneswar', 'Guwahati', 'Andhra Pradesh', 'Bihar',
    'Maharashtra', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Odisha', 'Assam',
    'Madhya Pradesh', 'Jharkhand', 'Gujarat'
  ];

  // Also include any districts in the app's registry
  const placeCandidates = Array.from(new Set([
    ...popularPlaces,
    ...allDistricts.map(d => d.name),
    ...allDistricts.map(d => d.state)
  ]));

  for (const place of placeCandidates) {
    if (normalized.includes(place.toLowerCase())) {
      if (!detectedLocations.includes(place)) {
        detectedLocations.push(place);
      }
    }
  }

  // 5. Urgency / Priority Detection
  const urgencyKeywords = [
    'high priority', 'urgent', 'emergency', 'critical', 'severe', 'breakdown', 
    'danger', 'collapse', 'acute', 'crisis', 'immediate', 'गंभीर', 'अत्यवश्यक', 'తీవ్రమైన'
  ];
  const isUrgent = urgencyKeywords.some(u => normalized.includes(u));

  // 6. Recency Detection
  const recencyKeywords = [
    'recent', 'this week', 'today', 'yesterday', 'new', 'latest', 'हालिया', 'ఇటీవలి'
  ];
  const isRecent = recencyKeywords.some(r => normalized.includes(r));

  // 7. Scale / Population Impact Detection
  const scaleKeywords = [
    'many people', 'crowded', 'affecting many', 'mass', 'community', 'widely', 'large'
  ];
  const isHighScale = scaleKeywords.some(s => normalized.includes(s));

  // Filter out stop words for residual keyword search
  const stopWords = new Set([
    'in', 'at', 'near', 'of', 'for', 'the', 'a', 'an', 'and', 'or', 'to', 'from', 
    'with', 'is', 'are', 'issue', 'issues', 'problem', 'problems', 'complaint', 'complaints'
  ]);
  const keywords = words.filter(w => !stopWords.has(w));

  return {
    rawQuery: raw,
    normalizedQuery: normalized,
    exactId,
    detectedCategories,
    detectedLocations,
    isUrgent,
    isRecent,
    isHighScale,
    keywords,
    typoCorrection
  };
}

/**
 * Generates intelligent autocomplete and intent recommendations as user types
 */
export function getSearchSuggestions(
  query: string, 
  districts: District[] = []
): string[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return [
      'Water Supply issues',
      'Road conditions in Guntur',
      'High priority community issues',
      'Electricity complaints',
      'Recent citizen reports'
    ];
  }

  const suggestions: string[] = [];

  // 1. If user typed a category stem
  for (const cat of CATEGORY_SYNONYMS) {
    if (cat.terms.some(t => t.toLowerCase().startsWith(trimmed) || trimmed.includes(t.toLowerCase()))) {
      suggestions.push(`${cat.displayName}`);
      suggestions.push(`${cat.displayName} Community Issues`);
      suggestions.push(`Priority ${cat.displayName} Hotspots`);
      suggestions.push(`Recent ${cat.displayName} Reports`);
      break;
    }
  }

  // 2. If user typed a place name stem
  for (const d of districts) {
    if (d.name.toLowerCase().startsWith(trimmed) || d.name.toLowerCase().includes(trimmed)) {
      suggestions.push(`${d.name}`);
      suggestions.push(`${d.name} District Hotspots`);
      suggestions.push(`Water issues in ${d.name}`);
      suggestions.push(`Road issues in ${d.name}`);
      break;
    }
  }

  // 3. Add compound suggestions if query has multiple words
  if (trimmed.includes('water')) {
    if (!suggestions.includes('Water Supply')) suggestions.push('Water Supply');
    if (!suggestions.includes('Drinking water pipeline disruption')) suggestions.push('Drinking water pipeline disruption');
    if (!suggestions.includes('Water issues in Guntur')) suggestions.push('Water issues in Guntur');
  } else if (trimmed.includes('road')) {
    if (!suggestions.includes('Roads & Transport')) suggestions.push('Roads & Transport');
    if (!suggestions.includes('Road damage & potholes')) suggestions.push('Road damage & potholes');
    if (!suggestions.includes('Road connectivity in Bihar')) suggestions.push('Road connectivity in Bihar');
  } else if (trimmed.includes('electric') || trimmed.includes('power')) {
    if (!suggestions.includes('Electricity & Power')) suggestions.push('Electricity & Power');
    if (!suggestions.includes('Transformer breakdown')) suggestions.push('Transformer breakdown');
  }

  // Dedup and return up to 5 clean suggestions
  return Array.from(new Set(suggestions)).slice(0, 5);
}

/**
 * Searches across all CivicPulse datasets with human-first intent ranking
 */
export function searchCivicPulse(
  query: string,
  data: {
    requests: CitizenRequest[];
    districts: District[];
    governmentProjects: GovernmentProject[];
    communityIssues?: CommunityIssue[];
  },
  options: {
    tCategory?: (cat: string) => string;
    tStatus?: (status: string) => string;
  } = {}
): HumanSearchResults {
  const { requests, districts, governmentProjects } = data;
  const communityIssues = data.communityIssues || INITIAL_COMMUNITY_ISSUES;
  const intent = parseSearchIntent(query, districts);

  const tCat = options.tCategory || ((c: string) => CATEGORY_DISPLAY_NAMES[c] || c);
  const tStat = options.tStatus || ((s: string) => s);

  let exactMatch: HumanSearchResultItem | null = null;
  const bestMatchList: HumanSearchResultItem[] = [];
  const matchingIssues: HumanSearchResultItem[] = [];
  const matchingHotspots: HumanSearchResultItem[] = [];
  const matchingReports: HumanSearchResultItem[] = [];
  const matchingProjects: HumanSearchResultItem[] = [];
  const matchingInfrastructure: HumanSearchResultItem[] = [];
  const matchingBaseline: HumanSearchResultItem[] = [];

  // ==========================================
  // 1. EXACT ID SEARCH (Highest Priority)
  // ==========================================
  if (intent.exactId) {
    const qId = intent.exactId.toLowerCase();
    
    // Search in citizen requests
    const exactReq = requests.find(r => 
      r.id.toLowerCase() === qId || 
      (r.request_id && r.request_id.toLowerCase() === qId)
    );

    if (exactReq) {
      const isLive = exactReq.source_origin === 'CIVICPULSE_USER' || exactReq.id.startsWith('CP-202');
      exactMatch = {
        id: exactReq.id,
        type: 'EXACT_REQUEST',
        title: `Citizen Request ${exactReq.request_id || exactReq.id}`,
        subtitle: exactReq.summary_en || exactReq.original_text,
        category: tCat(exactReq.category),
        location: exactReq.location,
        provenanceLabel: isLive ? 'CivicPulse Signals' : 'Illustrative Demo Data',
        provenanceBadgeColor: isLive ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-stone-200 text-stone-700 border-stone-300',
        statusBadge: tStat(exactReq.status || 'Received'),
        priorityLabel: `Severity: ${exactReq.severity || 5}/10`,
        dateOrTimeline: exactReq.timestamp ? new Date(exactReq.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently submitted',
        actionHint: 'Click to open Request Details',
        score: 1000,
        rawItem: exactReq
      };
    }

    // Search in government projects
    const exactProj = governmentProjects.find(p => p.id.toLowerCase() === qId);
    if (!exactMatch && exactProj) {
      exactMatch = {
        id: exactProj.id,
        type: 'ACTION_PROJECT',
        title: `Public Project ${exactProj.id}: ${exactProj.title}`,
        subtitle: exactProj.description,
        category: tCat(exactProj.category),
        location: `${exactProj.district}, ${exactProj.state || 'India'}`,
        provenanceLabel: 'CivicPulse Signals',
        provenanceBadgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        statusBadge: exactProj.status,
        priorityLabel: `Priority Score: ${exactProj.priorityScore}/100`,
        reportCount: `${exactProj.citizenRequestsCount} citizen reports`,
        peopleAffected: `${(exactProj.population || 0).toLocaleString()} people`,
        actionHint: 'Click to view in Action Queue',
        score: 1000,
        rawItem: exactProj
      };
    }
  }

  // ==========================================
  // 2. COMMUNITY ISSUES SEARCH
  // ==========================================
  for (const issue of communityIssues) {
    let score = 0;
    const normTitle = issue.title.toLowerCase();
    const normLoc = issue.location.toLowerCase();
    const normCat = issue.category.toLowerCase();

    // Direct category match
    if (intent.detectedCategories.length > 0) {
      if (intent.detectedCategories.some(c => c.toLowerCase() === normCat)) {
        score += 40;
      }
    }

    // Direct location match
    if (intent.detectedLocations.length > 0) {
      if (intent.detectedLocations.some(l => normLoc.includes(l.toLowerCase()))) {
        score += 45;
      }
    }

    // Keywords match
    for (const kw of intent.keywords) {
      if (normTitle.includes(kw)) score += 15;
      if (normLoc.includes(kw)) score += 15;
    }

    // Full query substring match
    if (normTitle.includes(intent.normalizedQuery) || normLoc.includes(intent.normalizedQuery)) {
      score += 50;
    }

    // Urgency match
    if (intent.isUrgent && (issue.severity === 'Critical' || issue.severity === 'High')) {
      score += 20;
    }

    if (score > 15) {
      matchingIssues.push({
        id: issue.id,
        type: 'COMMUNITY_ISSUE',
        title: issue.title,
        subtitle: `Linked with ${issue.infrastructureName} (${issue.relatedScheme})`,
        category: tCat(issue.category),
        location: issue.location,
        provenanceLabel: 'CivicPulse Signals',
        provenanceBadgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        priorityLabel: `${issue.severity} Priority`,
        reportCount: `${issue.requestCount} citizen reports`,
        peopleAffected: `${issue.affectedCommunities} communities`,
        actionHint: 'View Community Issue',
        score,
        rawItem: issue
      });
    }
  }

  // ==========================================
  // 3. PRIORITY HOTSPOTS & DISTRICTS SEARCH
  // ==========================================
  for (const dist of districts) {
    let score = 0;
    const normName = dist.name.toLowerCase();
    const normState = dist.state.toLowerCase();

    // Check location match
    if (intent.detectedLocations.some(l => normName.includes(l.toLowerCase()) || normState.includes(l.toLowerCase()))) {
      score += 55;
    } else if (normName.includes(intent.normalizedQuery) || normState.includes(intent.normalizedQuery)) {
      score += 45;
    }

    // Category gap check (e.g. if searching "water", and Guntur has water_access < 40)
    if (intent.detectedCategories.includes('Water') && dist.water_access < 50) {
      score += 30;
    } else if (intent.detectedCategories.includes('Roads') && dist.road_quality < 60) {
      score += 30;
    } else if (intent.detectedCategories.includes('Health') && dist.health_access < 60) {
      score += 30;
    }

    for (const kw of intent.keywords) {
      if (normName.includes(kw)) score += 20;
      if (normState.includes(kw)) score += 10;
    }

    if (score > 20) {
      const isCritical = dist.poverty_index > 0.5 || dist.water_access < 45 || dist.road_quality < 55;
      matchingHotspots.push({
        id: dist.id,
        type: 'PRIORITY_HOTSPOT',
        title: `${dist.name} District Hotspot`,
        subtitle: `State of ${dist.state} · Poverty Index ${(dist.poverty_index * 100).toFixed(0)}%`,
        category: intent.detectedCategories[0] ? tCat(intent.detectedCategories[0]) : 'Multi-Sector Hotspot',
        location: `${dist.name}, ${dist.state}`,
        provenanceLabel: 'CivicPulse Signals',
        provenanceBadgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        priorityLabel: isCritical ? 'Critical Hotspot' : 'Priority Area',
        peopleAffected: `${(dist.population / 1000000).toFixed(1)}M Population`,
        actionHint: 'Inspect District on Hotspot Map',
        score,
        rawItem: dist
      });
    }
  }

  // ==========================================
  // 4. CITIZEN SIGNALS & REPORTS SEARCH
  // ==========================================
  for (const req of requests) {
    let score = 0;
    const normSummary = (req.summary_en || '').toLowerCase();
    const normOriginal = (req.original_text || '').toLowerCase();
    const normLoc = (req.location || '').toLowerCase();
    const normCat = req.category.toLowerCase();

    // Category match
    if (intent.detectedCategories.some(c => c.toLowerCase() === normCat)) {
      score += 35;
    }

    // Location match
    if (intent.detectedLocations.some(l => normLoc.includes(l.toLowerCase()))) {
      score += 40;
    }

    // Keywords match in summary or original text
    for (const kw of intent.keywords) {
      if (normSummary.includes(kw)) score += 15;
      if (normOriginal.includes(kw)) score += 15;
      if (normLoc.includes(kw)) score += 10;
    }

    // Substring match
    if (normSummary.includes(intent.normalizedQuery) || normOriginal.includes(intent.normalizedQuery)) {
      score += 45;
    }

    // Urgency match
    if (intent.isUrgent && (req.severity || 5) >= 8) {
      score += 20;
    }

    if (score > 20) {
      const isLive = req.source_origin === 'CIVICPULSE_USER' || req.id.startsWith('CP-202');
      matchingReports.push({
        id: req.id,
        type: 'CITIZEN_REPORT',
        title: `${tCat(req.category)}: ${req.summary_en || req.original_text}`,
        subtitle: req.original_text ? `Original note: "${req.original_text}"` : undefined,
        category: tCat(req.category),
        location: req.location,
        provenanceLabel: isLive ? 'CivicPulse Signals' : 'Illustrative Demo Data',
        provenanceBadgeColor: isLive ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-stone-200 text-stone-700 border-stone-300',
        statusBadge: tStat(req.status || 'Received'),
        priorityLabel: `Severity: ${req.severity || 5}/10`,
        dateOrTimeline: req.timestamp ? new Date(req.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently submitted',
        actionHint: 'Inspect Citizen Signal',
        score,
        rawItem: req
      });
    }
  }

  // ==========================================
  // 5. ACTION QUEUE & SANCTIONED PROJECTS SEARCH
  // ==========================================
  for (const proj of governmentProjects) {
    let score = 0;
    const normTitle = proj.title.toLowerCase();
    const normDesc = (proj.description || '').toLowerCase();
    const normDist = proj.district.toLowerCase();
    const normCat = proj.category.toLowerCase();

    if (intent.detectedCategories.some(c => c.toLowerCase() === normCat)) {
      score += 35;
    }

    if (intent.detectedLocations.some(l => normDist.includes(l.toLowerCase()))) {
      score += 40;
    }

    for (const kw of intent.keywords) {
      if (normTitle.includes(kw)) score += 15;
      if (normDesc.includes(kw)) score += 10;
    }

    if (normTitle.includes(intent.normalizedQuery) || normDesc.includes(intent.normalizedQuery)) {
      score += 40;
    }

    if (score > 20) {
      matchingProjects.push({
        id: proj.id,
        type: 'ACTION_PROJECT',
        title: proj.title,
        subtitle: proj.department,
        category: tCat(proj.category),
        location: `${proj.district}, ${proj.state || 'India'}`,
        provenanceLabel: 'CivicPulse Signals',
        provenanceBadgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        statusBadge: proj.status,
        priorityLabel: `Score: ${proj.priorityScore}/100`,
        reportCount: `${proj.citizenRequestsCount} citizen reports`,
        peopleAffected: `${(proj.population || 0).toLocaleString()} people`,
        actionHint: 'Open in Action Queue',
        score,
        rawItem: proj
      });
    }
  }

  // ==========================================
  // 6. INFRASTRUCTURE ASSETS SEARCH
  // ==========================================
  for (const asset of INFRASTRUCTURE_ASSETS_REGISTRY) {
    let score = 0;
    const normName = asset.name.toLowerCase();
    const normLoc = asset.location.toLowerCase();
    const normDist = asset.districtName.toLowerCase();
    const normCat = asset.category.toLowerCase();

    if (intent.detectedCategories.some(c => c.toLowerCase() === normCat)) {
      score += 30;
    }
    if (intent.detectedLocations.some(l => normDist.includes(l.toLowerCase()) || normLoc.includes(l.toLowerCase()))) {
      score += 35;
    }
    for (const kw of intent.keywords) {
      if (normName.includes(kw)) score += 20;
      if (normLoc.includes(kw)) score += 15;
    }

    if (score > 25) {
      matchingInfrastructure.push({
        id: asset.id,
        type: 'INFRASTRUCTURE',
        title: asset.name,
        subtitle: `${asset.location} · ${asset.staffOrEquipmentStatus || asset.capacity}`,
        category: tCat(asset.category),
        location: `${asset.districtName}, ${asset.location}`,
        provenanceLabel: 'Government Baseline',
        provenanceBadgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
        priorityLabel: asset.condition,
        peopleAffected: `${(asset.servedPopulation || 0).toLocaleString()} Served`,
        actionHint: 'View Infrastructure Audit',
        score,
        rawItem: asset
      });
    }
  }

  // ==========================================
  // 7. GOVERNMENT BASELINE GRIEVANCE DATA
  // ==========================================
  for (const base of DEPARTMENT_GRIEVANCE_BASELINES) {
    let score = 0;
    const normDept = base.department.toLowerCase();
    const normMin = base.ministry.toLowerCase();
    const normCat = base.category.toLowerCase();

    if (intent.detectedCategories.some(c => c.toLowerCase() === normCat)) {
      score += 30;
    }
    for (const kw of intent.keywords) {
      if (normDept.includes(kw) || normMin.includes(kw)) score += 20;
    }

    if (score > 20) {
      matchingBaseline.push({
        id: base.id,
        type: 'GOVERNMENT_BASELINE',
        title: `${base.department} Baseline`,
        subtitle: `${base.ministry} · National Public Grievance Disposal Summary`,
        category: tCat(base.category),
        location: 'National / Line Ministry Baseline',
        provenanceLabel: 'Government Baseline',
        provenanceBadgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
        priorityLabel: `${base.disposal_rate_pct}% Disposal Rate`,
        reportCount: `${base.received_count.toLocaleString()} Grievances`,
        actionHint: 'Official OGD Reference Data',
        score,
        rawItem: base
      });
    }
  }

  // Sort each list by score descending
  matchingIssues.sort((a, b) => b.score - a.score);
  matchingHotspots.sort((a, b) => b.score - a.score);
  matchingReports.sort((a, b) => b.score - a.score);
  matchingProjects.sort((a, b) => b.score - a.score);
  matchingInfrastructure.sort((a, b) => b.score - a.score);
  matchingBaseline.sort((a, b) => b.score - a.score);

  // Determine BEST MATCH
  let bestMatch: HumanSearchResultItem | null = null;
  if (!exactMatch) {
    // Pick highest scoring item across issues, hotspots, and projects
    const candidates = [
      ...matchingIssues.slice(0, 2),
      ...matchingHotspots.slice(0, 2),
      ...matchingProjects.slice(0, 1),
      ...matchingReports.slice(0, 1)
    ].sort((a, b) => b.score - a.score);

    if (candidates.length > 0 && candidates[0].score >= 40) {
      bestMatch = candidates[0];
    }
  }

  const suggestions = getSearchSuggestions(query, districts);
  const totalResultsCount = 
    (exactMatch ? 1 : 0) +
    matchingIssues.length +
    matchingHotspots.length +
    matchingReports.length +
    matchingProjects.length +
    matchingInfrastructure.length +
    matchingBaseline.length;

  return {
    intent,
    exactMatch,
    bestMatch,
    communityIssues: matchingIssues.slice(0, 6),
    priorityHotspots: matchingHotspots.slice(0, 4),
    citizenReports: matchingReports.slice(0, 8),
    actionProjects: matchingProjects.slice(0, 4),
    infrastructure: matchingInfrastructure.slice(0, 4),
    governmentBaseline: matchingBaseline.slice(0, 2),
    suggestions,
    totalResultsCount
  };
}

/**
 * Checks if a specific citizen request matches a human search query intent
 * (used for upgrading in-page list filtering)
 */
export function matchCitizenRequestIntent(
  req: CitizenRequest, 
  query: string, 
  allDistricts: District[] = []
): boolean {
  if (!query || !query.trim()) return true;
  const intent = parseSearchIntent(query, allDistricts);

  // Exact ID match
  if (intent.exactId) {
    const qId = intent.exactId.toLowerCase();
    return req.id.toLowerCase().includes(qId) || (req.request_id && req.request_id.toLowerCase().includes(qId));
  }

  const normSummary = (req.summary_en || '').toLowerCase();
  const normOriginal = (req.original_text || '').toLowerCase();
  const normLoc = (req.location || '').toLowerCase();
  const normDist = (req.district || '').toLowerCase();
  const normState = (req.state || '').toLowerCase();
  const normCat = req.category.toLowerCase();

  // If query specifies a category, must match category
  if (intent.detectedCategories.length > 0) {
    const catMatch = intent.detectedCategories.some(c => c.toLowerCase() === normCat);
    if (!catMatch) return false;
  }

  // If query specifies location, must match location
  if (intent.detectedLocations.length > 0) {
    const locMatch = intent.detectedLocations.some(l => {
      const lowL = l.toLowerCase();
      return normLoc.includes(lowL) || normDist.includes(lowL) || normState.includes(lowL);
    });
    if (!locMatch) return false;
  }

  // If query specifies high urgency
  if (intent.isUrgent && (req.severity || 5) < 7) {
    return false;
  }

  // If residual keywords exist, test if any match
  if (intent.keywords.length > 0) {
    const matchesAnyKw = intent.keywords.some(kw => 
      normSummary.includes(kw) || 
      normOriginal.includes(kw) || 
      normLoc.includes(kw) || 
      normCat.includes(kw)
    );
    if (!matchesAnyKw) return false;
  }

  return true;
}
