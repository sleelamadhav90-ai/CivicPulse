import { CitizenRequest, District, GovernmentProject, InfrastructureAsset, InfrastructureCategory, RecommendedProject } from '../types';
import { CommunityIssue } from '../components/CommunityIssuesView';
import { DEPARTMENT_GRIEVANCE_BASELINES } from '../data/governmentBaselineData';
import { INFRASTRUCTURE_ASSETS_REGISTRY } from '../data/infrastructureAssets';
import { INITIAL_COMMUNITY_ISSUES } from '../components/CommunityIssuesView';
import { matchesDistrictToken, matchesDistrict } from '../utils/districtMatcher';
import { getCityDemandHotspot } from '../utils/demandAggregation';
import { getAIRecommendedProjects } from '../utils/scoring';
import { DISTRICTS_REGISTRY } from '../data/districts';

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
      'water pressure', 'salinity', 'water crisis', 'fluoride', 'pipeline burst', 'pipeline disruption',
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
      'road', 'roads', 'pothole', 'potholes', 'street', 'highway', 'traffic', 'bridge', 
      'asphalt', 'flyover', 'transport', 'pedestrian', 'culvert', 'crater', 'washout',
      'road condition', 'broken road', 'bad road', 'arterial road',
      // Hindi
      'सड़क', 'रास्ता', 'गड्ढे', 'सड़कें', 'हाईवे', 'पुल', 'यातायात', 'जाम', 'टूटी सड़क',
      // Telugu
      'రోడ్డు', 'రోడ్లు', 'గుంతలు', 'రవాణా', 'వంతెన', 'ట్రాఫిక్', 'రహదారి', 'పాడైన రోడ్డు',
      // Tamil
      'சாலை', 'பள்ளம்', 'நெடுஞ்சாலை', 'பாலம்', 'போக்குவரத்து', 'தெரு', 'பழுதடைந்த சாலை',
      // Kannada
      'ರಸ್ತೆ', 'ಗುಂಡಿ', 'ಸೇತುವೆ', 'ಸಂಚಾರ', 'ಹೆದ್ದಾರಿ',
      // Marathi
      'रस्ता', 'खड्डे', 'पूल', 'वाहतूक', 'महामार्ग', 'खराब रस्ता',
      // Bengali
      'রাস্তা', 'খানাখন্দ', 'পুল', 'যানজট', 'মহাসড়ক',
      // Odia
      'ରାସ୍ତା', 'ଖାଲ', 'ପୋଲ', 'ଯାତାୟାତ'
    ]
  },
  {
    category: 'Electricity',
    displayName: 'Electricity & Power',
    terms: [
      // English
      'electricity', 'power', 'power cut', 'outage', 'blackout', 'transformer', 'wire', 
      'voltage', 'street light', 'pole', 'current', 'load shedding', 'substation', 'grid',
      // Hindi
      'बिजली', 'करंट', 'ट्रांसफार्मर', 'बिजली कटौती', 'वोल्टेज', 'अंधेरा', 'तार', 'लाइट',
      // Telugu
      'విద్యుత్', 'కరెంట్', 'ట్రాన్స్‌ఫార్మర్', 'విద్యుత్ కోత', 'లైట్లు', 'వోల్టేజ్', 'కరెంటు పోయింది',
      // Tamil
      'மின்சாரம்', 'மின்வெட்டு', 'மின்மாற்றி', 'மின்கம்பி', 'விளக்கு',
      // Kannada
      'ವಿದ್ಯುತ್', 'ಕರೆಂಟ್', 'ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್', 'ವಿದ್ಯುತ್ ಕಡಿತ', 'ಬೆಳಕು',
      // Marathi
      'वीज', 'विद्युत', 'ट्रान्सफॉर्मर', 'लोडशेडिंग', 'विद्युत पुरवठा',
      // Bengali
      'বিদ্যুৎ', 'কারেন্ট', 'লোডশেডিং', 'ট্রান্সফরমার',
      // Odia
      'ବିଦ୍ୟୁତ୍', 'କରେଣ୍ଟ', 'ଟ୍ରାନ୍ସଫର୍ମର', 'ବିଦ୍ୟୁତ୍ କାଟ'
    ]
  },
  {
    category: 'Health',
    displayName: 'Public Health & Healthcare',
    terms: [
      // English
      'health', 'healthcare', 'hospital', 'clinic', 'phc', 'doctor', 'medicine', 'medicines', 
      'nurse', 'ambulance', 'dispensary', 'treatment', 'chc', 'medical', 'maternity',
      // Hindi
      'स्वास्थ्य', 'अस्पताल', 'दवा', 'दवाएं', 'डॉक्टर', 'इलाज', 'नर्स', 'चिकित्सा', 'प्राथमिक स्वास्थ्य केंद्र',
      // Telugu
      'ఆరోగ్యం', 'ఆసుపత్రి', 'వైద్యం', 'మందులు', 'డాక్టర్', 'నర్సు', 'వైద్యశాల', 'పీహెచ్‌సీ',
      // Tamil
      'சுகாதாரம்', 'மருத்துவமனை', 'மருந்து', 'மருத்துவர்', 'சிகிச்சை', 'ஆரம்ப சுகாதார நிலையம்',
      // Kannada
      'ಆರೋಗ್ಯ', 'ಆಸ್ಪತ್ರೆ', 'ಔಷಧಿ', 'ವೈದ್ಯರು', 'ಚಿಕಿತ್ಸೆ',
      // Marathi
      'आरोग्य', 'दवाखाना', 'औषधे', 'डॉक्टर', 'रुग्णालय', 'उपचार',
      // Bengali
      'স্বাস্থ্য', 'হাসপাতাল', 'ওষুধ', 'ডাক্তার', 'চিকিৎসা',
      // Odia
      'ସ୍ୱାସ୍ଥ୍ୟ', 'ଡାକ୍ତରଖାନା', 'ଔଷଧ', 'ଡାକ୍ତର', 'ଚିକିତ୍ସା'
    ]
  },
  {
    category: 'Drainage',
    displayName: 'Drainage & Flood Management',
    terms: [
      // English
      'drainage', 'drain', 'sewer', 'sewerage', 'gutter', 'waterlogging', 'flood', 'flooding', 
      'overflow', 'stormwater', 'monsoon drain', 'siltation', 'culvert overflow', 'nala',
      // Hindi
      'नाली', 'नाला', 'सीवर', 'जलजमाव', 'बाढ़', 'गंदा पानी', 'ड्रेनेज', 'निकासी',
      // Telugu
      'కాలువ', 'డ్రైనేజీ', 'మురుగునీరు', 'వరద', 'నీరు నిలవడం', 'మురుగు', 'మురికి కాలువ',
      // Tamil
      'வடிகால்', 'சாக்கடை', 'வெள்ளம்', 'நீர் தேங்குதல்',
      // Kannada
      'ಚರಂಡಿ', 'ಒಳಚರಂಡಿ', 'ಪ್ರವಾಹ', 'ನೀರು ನಿಲ್ಲುವುದು',
      // Marathi
      'गटार', 'सांडपाणी', 'पूर', 'पाणी साचणे', 'ड्रेनेज',
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
      'solid waste', 'rubbish', 'landfill', 'litter', 'swachh', 'cleaning', 'waste collection',
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

/**
 * Structured Search Intent extracted deterministically or via Gemini from user's natural language
 */
export type SearchIntent = {
  queryType:
    | 'citizen_reports'
    | 'community_issues'
    | 'hotspots'
    | 'recommendations'
    | 'locations'
    | 'request_lookup'
    | 'general';

  category:
    | 'Water'
    | 'Roads'
    | 'Health'
    | 'Electricity'
    | 'Drainage'
    | 'Sanitation'
    | 'Education'
    | 'Other'
    | 'ANY'
    | null;

  district: string | null;
  state: string | null;

  priority:
    | 'HIGH'
    | 'CRITICAL'
    | 'MODERATE'
    | 'LOW'
    | null;

  minSeverity: number | null;
  maxSeverity: number | null;

  demandLevel:
    | 'HIGH'
    | 'MEDIUM'
    | 'LOW'
    | null;

  infrastructureGapLevel:
    | 'HIGH'
    | 'MEDIUM'
    | 'LOW'
    | null;

  status: string | null;

  requestId: string | null;

  keywords: string[];

  limit: number;

  // Extended internal properties for heuristic parser & UI compatibility:
  rawQuery?: string;
  normalizedQuery?: string;
  subcategory?: string | null;
  locality?: string | null;
  location?: string | 'ANY';
  issue_terms?: string[];
  severity?: number | null;
  time_range?: 'LAST_7_DAYS' | 'LAST_30_DAYS' | null;
  request_id?: string | null;
  exactId?: string | null;
  detectedCategories?: InfrastructureCategory[];
  detectedLocations?: string[];
  isUrgent?: boolean;
  isRecent?: boolean;
  isHighScale?: boolean;
  typoCorrection?: string | null;
};

export interface ScoreFactor {
  label: string;
  points: number;
}

export interface HumanSearchResultItem {
  id: string;
  type: 'EXACT_REQUEST' | 'BEST_MATCH' | 'RECOMMENDATION' | 'COMMUNITY_ISSUE' | 'PRIORITY_HOTSPOT' | 'CITIZEN_REPORT' | 'ACTION_PROJECT' | 'INFRASTRUCTURE' | 'GOVERNMENT_BASELINE';
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
  scoreBreakdown?: ScoreFactor[];
  whyExplanation?: string;
  evidenceBundleId?: string;
  rawItem: any;
}

export interface HumanSearchResults {
  intent: SearchIntent;
  exactMatch: HumanSearchResultItem | null;
  exactMatchNotFoundId: string | null;
  bestMatch: HumanSearchResultItem | null;
  recommendations: HumanSearchResultItem[];
  communityIssues: HumanSearchResultItem[];
  priorityHotspots: HumanSearchResultItem[];
  citizenReports: HumanSearchResultItem[];
  actionProjects: HumanSearchResultItem[];
  infrastructure: HumanSearchResultItem[];
  governmentBaseline: HumanSearchResultItem[];
  suggestions: string[];
  suggestionsType: 'DIRECT_MATCH' | 'POPULAR_OR_RECENT';
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

  // 1. Check for Exact ID pattern (e.g. CP-2026-004821, CP-2026-WAT-101, req-wat-001, ISSUE-WAT-001)
  let request_id: string | null = null;
  const idPattern = /(cp-[\w-]+|req-[\w-]+|gov-proj-[\w-]+|issue-[\w-]+|infra-[\w-]+)/i;
  const idMatch = raw.match(idPattern);
  if (idMatch) {
    request_id = idMatch[1].trim();
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
      const lowTerm = term.toLowerCase();
      // Match whole word or exact substring
      if (normalized === lowTerm || normalized.includes(` ${lowTerm} `) || normalized.startsWith(`${lowTerm} `) || normalized.endsWith(` ${lowTerm}`) || normalized.includes(lowTerm)) {
        if (!detectedCategories.includes(cat.category)) {
          detectedCategories.push(cat.category);
        }
        break;
      }
    }
  }

  const primaryCategory: InfrastructureCategory | 'ANY' = detectedCategories.length > 0 ? detectedCategories[0] : 'ANY';

  // 4. Location Detection (Districts, States, Localities)
  let state: string | null = null;
  let district: string | null = null;
  let locality: string | null = null;
  const detectedLocations: string[] = [];

  const knownStates = [
    'Andhra Pradesh', 'Bihar', 'Maharashtra', 'Rajasthan', 'Uttar Pradesh',
    'West Bengal', 'Odisha', 'Assam', 'Madhya Pradesh', 'Jharkhand', 'Gujarat',
    'Karnataka', 'Tamil Nadu', 'Kerala', 'Telangana', 'Punjab', 'Haryana'
  ];

  for (const st of knownStates) {
    if (normalized.includes(st.toLowerCase())) {
      state = st;
      detectedLocations.push(st);
    }
  }

  // Check districts from authoritative registry using centralized word-bounded matcher
  for (const d of allDistricts) {
    if (matchesDistrictToken(normalized, d.name, d.id)) {
      district = d.name;
      if (!detectedLocations.includes(d.name)) detectedLocations.push(d.name);
      if (!state && d.state) state = d.state;
      break;
    }
  }

  const finalLocationStr: string | 'ANY' = district || state || (detectedLocations.length > 0 ? detectedLocations[0] : 'ANY');

  // 5. Urgency / Priority Detection
  const urgencyKeywords = [
    'high priority', 'urgent', 'emergency', 'critical', 'severe', 'breakdown', 
    'danger', 'collapse', 'acute', 'crisis', 'immediate', 'गंभीर', 'अत्यवश्यक', 'తీవ్రమైన'
  ];
  const isUrgent = urgencyKeywords.some(u => normalized.includes(u));
  const priority: 'HIGH' | 'CRITICAL' | 'MODERATE' | 'LOW' | null = isUrgent ? 'HIGH' : null;
  const severity: number | null = isUrgent ? 8 : null;

  // 6. Recency / Time Range Detection
  const recencyKeywords = [
    'recent', 'recently', 'this week', 'today', 'yesterday', 'new', 'latest', 'last 7 days', 'हालिया', 'ఇటీవలి'
  ];
  const isRecent = recencyKeywords.some(r => normalized.includes(r));
  const time_range: 'LAST_7_DAYS' | 'LAST_30_DAYS' | null = isRecent 
    ? 'LAST_7_DAYS' 
    : (normalized.includes('this month') || normalized.includes('last 30 days') ? 'LAST_30_DAYS' : null);

  // 7. Status Detection
  let status: string | null = null;
  if (normalized.includes('resolved')) status = 'Resolved';
  else if (normalized.includes('under review')) status = 'Under Review';
  else if (normalized.includes('in action')) status = 'In Action';
  else if (normalized.includes('prioritized')) status = 'Prioritized';

  // 8. Scale / Population Impact Detection
  const scaleKeywords = [
    'many people', 'crowded', 'affecting many', 'mass', 'community', 'widely', 'large'
  ];
  const isHighScale = scaleKeywords.some(s => normalized.includes(s));

  // 9. Specific Subcategory / Issue Terms
  const subcategoryTerms = [
    'pipeline', 'tap', 'borewell', 'tanker', 'salinity', 'fluoride', 'groundwater',
    'pothole', 'potholes', 'crater', 'washout', 'bridge', 'culvert', 'highway',
    'transformer', 'power cut', 'wire', 'voltage', 'outage',
    'doctor', 'nurse', 'medicine', 'phc', 'clinic', 'hospital',
    'garbage', 'dump', 'waste', 'cleanliness', 'litter',
    'drainage', 'gutter', 'sewer', 'waterlogging', 'flood',
    'school', 'classroom', 'teacher'
  ];
  const detectedSubterms: string[] = [];
  for (const st of subcategoryTerms) {
    if (normalized.includes(st)) {
      detectedSubterms.push(st);
    }
  }

  // Filter out stop words for residual keyword search
  const stopWords = new Set([
    'in', 'at', 'near', 'of', 'for', 'the', 'a', 'an', 'and', 'or', 'to', 'from', 
    'with', 'is', 'are', 'issue', 'issues', 'problem', 'problems', 'complaint', 'complaints'
  ]);
  const keywords = words.filter(w => !stopWords.has(w));

  // Determine queryType
  let queryType: SearchIntent['queryType'] = 'general';
  if (request_id) {
    queryType = 'request_lookup';
  } else if (
    normalized.includes('recommend') ||
    normalized.includes('prioritize') ||
    normalized.includes('project') ||
    normalized.includes('investment') ||
    normalized.includes('brief') ||
    normalized.includes('action plan')
  ) {
    queryType = 'recommendations';
  } else if (
    normalized.includes('hotspot') ||
    normalized.includes('demand') ||
    normalized.includes('zone') ||
    normalized.includes('deficit')
  ) {
    queryType = 'hotspots';
  } else if (
    normalized.includes('report') ||
    normalized.includes('complaint') ||
    normalized.includes('signal') ||
    normalized.includes('voice') ||
    normalized.includes('citizen')
  ) {
    queryType = 'citizen_reports';
  } else if (
    normalized.includes('issue') ||
    normalized.includes('problem') ||
    normalized.includes('cluster')
  ) {
    queryType = 'community_issues';
  } else if ((district && primaryCategory === 'ANY') || normalized.includes('location') || normalized.includes('district')) {
    queryType = 'locations';
  }

  // Demand Level & Infrastructure Gap Level
  let demandLevel: 'HIGH' | 'MEDIUM' | 'LOW' | null = null;
  if (normalized.includes('high demand') || normalized.includes('heavy demand') || normalized.includes('acute demand')) {
    demandLevel = 'HIGH';
  } else if (normalized.includes('low demand')) {
    demandLevel = 'LOW';
  } else if (normalized.includes('medium demand') || normalized.includes('moderate demand')) {
    demandLevel = 'MEDIUM';
  }

  let infrastructureGapLevel: 'HIGH' | 'MEDIUM' | 'LOW' | null = null;
  if (
    normalized.includes('infrastructure gap') ||
    normalized.includes('poor infra') ||
    normalized.includes('poor infrastructure') ||
    normalized.includes('deficit') ||
    normalized.includes('poor coverage') ||
    normalized.includes('lack of coverage')
  ) {
    infrastructureGapLevel = 'HIGH';
  }

  const canonicalCategory = primaryCategory === 'ANY' ? null : (primaryCategory as any);

  return {
    queryType,
    category: canonicalCategory,
    district,
    state,
    priority,
    minSeverity: priority === 'HIGH' || priority === 'CRITICAL' ? 8 : (severity || null),
    maxSeverity: null,
    demandLevel,
    infrastructureGapLevel,
    status,
    requestId: request_id,
    keywords,
    limit: 10,
    // Extended internal properties for heuristic parser & UI compatibility:
    rawQuery: raw,
    normalizedQuery: normalized,
    subcategory: detectedSubterms.length > 0 ? detectedSubterms[0] : null,
    locality,
    location: finalLocationStr,
    issue_terms: detectedSubterms.length > 0 ? detectedSubterms : keywords.slice(0, 3),
    severity,
    time_range,
    request_id,
    exactId: request_id,
    detectedCategories,
    detectedLocations,
    isUrgent,
    isRecent,
    isHighScale,
    typoCorrection
  };
}

export function normalizeSearchIntent(intent: Partial<SearchIntent>): SearchIntent {
  const reqId = intent.requestId || intent.request_id || null;
  const rawCat = intent.category || null;
  const canonicalCat = (rawCat && rawCat !== 'ANY') ? rawCat : null;
  const loc = intent.location || (intent.district ? intent.district : 'ANY');
  const catList = Array.isArray(intent.detectedCategories) ? intent.detectedCategories : (canonicalCat && canonicalCat !== 'Other' ? [canonicalCat as InfrastructureCategory] : []);
  const locList = Array.isArray(intent.detectedLocations) ? intent.detectedLocations : (intent.district ? [intent.district] : []);

  return {
    queryType: intent.queryType || 'general',
    category: canonicalCat,
    district: intent.district || null,
    state: intent.state || null,
    priority: intent.priority || null,
    minSeverity: intent.minSeverity ?? null,
    maxSeverity: intent.maxSeverity ?? null,
    demandLevel: intent.demandLevel || null,
    infrastructureGapLevel: intent.infrastructureGapLevel || null,
    status: intent.status || null,
    requestId: reqId,
    keywords: Array.isArray(intent.keywords) ? intent.keywords.filter(Boolean) : [],
    limit: intent.limit || 10,
    rawQuery: intent.rawQuery || '',
    normalizedQuery: intent.normalizedQuery || '',
    subcategory: intent.subcategory || null,
    locality: intent.locality || null,
    location: loc,
    issue_terms: Array.isArray(intent.issue_terms) ? intent.issue_terms.filter(Boolean) : (intent.subcategory ? [intent.subcategory] : []),
    severity: intent.severity ?? intent.minSeverity ?? null,
    time_range: intent.time_range || null,
    request_id: reqId,
    exactId: reqId,
    detectedCategories: catList,
    detectedLocations: locList,
    isUrgent: !!intent.isUrgent || intent.priority === 'CRITICAL' || intent.priority === 'HIGH',
    isRecent: !!intent.isRecent || intent.time_range === 'LAST_7_DAYS',
    isHighScale: !!intent.isHighScale,
    typoCorrection: intent.typoCorrection || null
  };
}

/**
 * Generates intelligent autocomplete and suggestions grounded in ACTUAL CivicPulse data.
 * Adheres strictly to Section 7 & 8:
 * - Recommendations must correspond to an actual category, location, issue, request, or record in the application.
 * - If user types "water", suggests actual Water issues/subcategories in the database (never Healthcare/Roads).
 * - If user types "gunt", suggests actual "Guntur" locations and issues.
 * - If user types "water gunt", combines both constraints to recommend actual Water records in Guntur.
 * - If query is empty, clearly provides "Popular & Recent" suggestions based on actual counts in the dataset.
 */
export function getSearchSuggestions(
  query: string,
  data: {
    requests: CitizenRequest[];
    districts: District[];
    governmentProjects: GovernmentProject[];
    communityIssues?: CommunityIssue[];
  },
  options: {
    tCategory?: (cat: string) => string;
  } = {}
): { suggestions: string[]; type: 'DIRECT_MATCH' | 'POPULAR_OR_RECENT' } {
  const { requests, districts } = data;
  const communityIssues = data.communityIssues || INITIAL_COMMUNITY_ISSUES;
  const trimmed = query.trim().toLowerCase();

  // 1. EMPTY QUERY -> Derive popular categories and recent issues from real data
  if (!trimmed) {
    // Count real request volume per category in actual dataset
    const catCounts: Record<string, number> = {};
    requests.forEach(r => {
      catCounts[r.category] = (catCounts[r.category] || 0) + 1;
    });
    const sortedCats = Object.entries(catCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => CATEGORY_DISPLAY_NAMES[cat] || cat);

    const starterSuggestions: string[] = [];
    if (sortedCats[0]) starterSuggestions.push(sortedCats[0]);
    if (sortedCats[1]) starterSuggestions.push(sortedCats[1]);
    
    // Top critical community issue
    if (communityIssues.length > 0) {
      starterSuggestions.push(communityIssues[0].title);
    }

    // Top district hotspot
    if (districts.length > 0) {
      const topDist = districts.find(d => d.poverty_index > 0.5) || districts[0];
      starterSuggestions.push(`${topDist.name} District Hotspots`);
    }

    starterSuggestions.push('CP-2026-004821');

    return {
      suggestions: Array.from(new Set(starterSuggestions)).slice(0, 5),
      type: 'POPULAR_OR_RECENT'
    };
  }

  const intent = normalizeSearchIntent(parseSearchIntent(query, districts));
  const candidateSuggestions = new Set<string>();

  // 2. Exact ID Prefix match
  if (intent.request_id || trimmed.startsWith('cp') || trimmed.startsWith('req')) {
    requests.forEach(r => {
      const matchId = (r.request_id && r.request_id.toLowerCase().includes(trimmed)) ? r.request_id : (r.id.toLowerCase().includes(trimmed) ? r.id : null);
      if (matchId) candidateSuggestions.add(matchId);
    });
    communityIssues.forEach(iss => {
      if (iss.id.toLowerCase().includes(trimmed)) candidateSuggestions.add(iss.id);
    });
  }

  // 3. Both Category AND Location present (e.g. "water gunt")
  if (intent.category && intent.category !== 'ANY' && intent.location && intent.location !== 'ANY') {
    const locLower = intent.location.toLowerCase();
    const catLower = intent.category.toLowerCase();

    // Check community issues matching both
    communityIssues.forEach(iss => {
      if (iss.category.toLowerCase() === catLower && iss.location.toLowerCase().includes(locLower)) {
        candidateSuggestions.add(`${iss.title} — ${intent.location}`);
      }
    });

    // Check requests matching both
    requests.forEach(r => {
      if (r.category.toLowerCase() === catLower && (r.location.toLowerCase().includes(locLower) || (r.district && r.district.toLowerCase() === locLower))) {
        if (r.subcategory) candidateSuggestions.add(`${r.subcategory} — ${intent.location}`);
      }
    });

    // Also suggest generic category + location
    const dispCat = CATEGORY_DISPLAY_NAMES[intent.category] || intent.category;
    candidateSuggestions.add(`${dispCat} — ${intent.location}`);
  }
  // 4. Only Category matched (e.g. "water" or "wat" or "roads")
  else if (intent.category && intent.category !== 'ANY') {
    const catLower = intent.category.toLowerCase();
    const dispCat = CATEGORY_DISPLAY_NAMES[intent.category] || intent.category;
    candidateSuggestions.add(dispCat);

    // Extract actual subcategories present in data for this category
    const subcatsInData = new Set<string>();
    requests.forEach(r => {
      if (r.category.toLowerCase() === catLower && r.subcategory) {
        subcatsInData.add(r.subcategory);
      }
    });
    Array.from(subcatsInData).slice(0, 2).forEach(sc => candidateSuggestions.add(sc));

    // Extract actual community issues in data for this category
    communityIssues.forEach(iss => {
      if (iss.category.toLowerCase() === catLower) {
        candidateSuggestions.add(iss.title);
      }
    });
  }
  // 5. Only Location matched (e.g. "gunt" or "guntur" or "vijayawada")
  else if (intent.location && intent.location !== 'ANY') {
    candidateSuggestions.add(intent.location);
    candidateSuggestions.add(`${intent.location} District Hotspots`);

    // Add actual issues found in this location
    const locLower = intent.location.toLowerCase();
    communityIssues.forEach(iss => {
      if (iss.location.toLowerCase().includes(locLower)) {
        candidateSuggestions.add(iss.title);
      }
    });
  }
  // 6. Progressive Stem Matches (e.g. user typed "wat", "garb", "elec")
  else {
    // Check if stem matches category names or synonyms
    for (const cat of CATEGORY_SYNONYMS) {
      if (cat.terms.some(t => t.toLowerCase().startsWith(trimmed))) {
        candidateSuggestions.add(cat.displayName);
        // Add actual issues for this category
        communityIssues.forEach(iss => {
          if (iss.category.toLowerCase() === cat.category.toLowerCase()) {
            candidateSuggestions.add(iss.title);
          }
        });
        break;
      }
    }

    // Check if stem matches districts
    for (const d of districts) {
      if (d.name.toLowerCase().startsWith(trimmed)) {
        candidateSuggestions.add(d.name);
        candidateSuggestions.add(`${d.name} District Hotspots`);
        break;
      }
    }

    // Check if stem matches subcategories in actual requests
    requests.forEach(r => {
      if (r.subcategory && r.subcategory.toLowerCase().includes(trimmed)) {
        candidateSuggestions.add(r.subcategory);
      }
    });
  }

  const resultList = Array.from(candidateSuggestions).slice(0, 5);

  return {
    suggestions: resultList,
    type: 'DIRECT_MATCH'
  };
}

/**
 * Deterministic tie-breaking comparator adhering strictly to Section 6:
 * If two results have equal or similar relevance, prefer:
 * 1. More exact match (exact ID > exact locality > exact district > exact category)
 * 2. More recent data (by timestamp)
 * 3. Higher actual priority (by severity / priorityScore)
 * 4. Higher actual number of citizen reports
 * 5. Deterministic ID sort (localeCompare)
 */
function tieBreakCompare(a: HumanSearchResultItem, b: HumanSearchResultItem): number {
  // 1. Relevance score descending
  if (b.score !== a.score) {
    return b.score - a.score;
  }

  // 2. Exact match type priority
  const typeRank = (t: string) => {
    switch (t) {
      case 'EXACT_REQUEST': return 6;
      case 'RECOMMENDATION': return 5;
      case 'COMMUNITY_ISSUE': return 4;
      case 'PRIORITY_HOTSPOT': return 3;
      case 'ACTION_PROJECT': return 2;
      case 'CITIZEN_REPORT': return 1;
      default: return 0;
    }
  };
  const diffType = typeRank(b.type) - typeRank(a.type);
  if (diffType !== 0) return diffType;

  // 3. More recent data (timestamp descending)
  const timeA = a.rawItem?.timestamp ? new Date(a.rawItem.timestamp).getTime() : 0;
  const timeB = b.rawItem?.timestamp ? new Date(b.rawItem.timestamp).getTime() : 0;
  if (timeB !== timeA) return timeB - timeA;

  // 4. Higher actual priority
  const prioA = a.rawItem?.severity || (a.rawItem?.priorityScore ? a.rawItem.priorityScore / 10 : 0);
  const prioB = b.rawItem?.severity || (b.rawItem?.priorityScore ? b.rawItem.priorityScore / 10 : 0);
  if (prioB !== prioA) return prioB - prioA;

  // 5. Higher actual number of citizen reports
  const countA = typeof a.rawItem?.requestCount === 'number' ? a.rawItem.requestCount : (a.rawItem?.citizenRequestsCount || 0);
  const countB = typeof b.rawItem?.requestCount === 'number' ? b.rawItem.requestCount : (b.rawItem?.citizenRequestsCount || 0);
  if (countB !== countA) return countB - countA;

  // 6. Stable deterministic id order
  return a.id.localeCompare(b.id);
}

/**
 * Searches across all CivicPulse datasets with human-first intent ranking
 * Strictly enforces:
 * - Deterministic relevance scoring:
 *   +100 Exact ID
 *   +40 Exact District (via centralized word-bounded matcher)
 *   +35 Exact Category
 *   +25 Issue / Subcategory / Intervention
 *   +20 Keyword match
 *   +10 Recent signal
 *   +5 High priority
 * - PriorityEngine recommendations integration
 * - Real DemandHotspot engine aggregation
 * - Grounded in actual records (no hallucinated/invented results)
 */
export function searchCivicPulse(
  query: string,
  data: {
    requests: CitizenRequest[];
    districts: District[];
    governmentProjects: GovernmentProject[];
    communityIssues?: CommunityIssue[];
    recommendations?: RecommendedProject[];
  },
  options: {
    tCategory?: (cat: string) => string;
    tStatus?: (status: string) => string;
    intentOverride?: SearchIntent;
  } = {}
): HumanSearchResults {
  const { requests, districts, governmentProjects } = data;
  const communityIssues = data.communityIssues || INITIAL_COMMUNITY_ISSUES;
  const allRecommendations = data.recommendations || getAIRecommendedProjects(districts, requests);
  const intent = normalizeSearchIntent(options.intentOverride || parseSearchIntent(query, districts));

  const tCat = options.tCategory || ((c: string) => CATEGORY_DISPLAY_NAMES[c] || c);
  const tStat = options.tStatus || ((s: string) => s);

  let exactMatch: HumanSearchResultItem | null = null;
  let exactMatchNotFoundId: string | null = null;
  const matchingRecommendations: HumanSearchResultItem[] = [];
  const matchingIssues: HumanSearchResultItem[] = [];
  const matchingHotspots: HumanSearchResultItem[] = [];
  const matchingReports: HumanSearchResultItem[] = [];
  const matchingProjects: HumanSearchResultItem[] = [];
  const matchingInfrastructure: HumanSearchResultItem[] = [];
  const matchingBaseline: HumanSearchResultItem[] = [];

  // =========================================================================
  // 1. EXACT ID SEARCH (Highest Priority, Section 10)
  // If user enters an ID like CP-2026-004821, ISSUE-WAT-001, rec-guntur-water-1, gov-proj-001:
  // If exists: show exact record.
  // If does not exist: show "No CivicPulse record found for ID."
  // =========================================================================
  if (intent.request_id) {
    const qId = intent.request_id.toLowerCase();
    
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
        score: 100,
        scoreBreakdown: [{ label: `Exact ID match (${intent.request_id})`, points: 100 }],
        rawItem: exactReq
      };
    }

    // Search in recommendations
    if (!exactMatch) {
      const exactRec = allRecommendations.find(r => r.id.toLowerCase() === qId);
      if (exactRec) {
        exactMatch = {
          id: exactRec.id,
          type: 'RECOMMENDATION',
          title: `Recommendation: ${exactRec.title}`,
          subtitle: `${exactRec.interventionType} · Priority Score: ${exactRec.priorityScore.toFixed(1)}/100 · Budget: ₹${(exactRec.estimatedBudgetInr / 10000000).toFixed(1)} Cr`,
          category: tCat(exactRec.category),
          location: `${exactRec.districtName}, ${exactRec.state}`,
          provenanceLabel: 'CivicPulse Signals',
          provenanceBadgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          priorityLabel: `Score ${exactRec.priorityScore.toFixed(1)}`,
          reportCount: `${exactRec.citizenRequestsCount} verified demand signals`,
          peopleAffected: `${(exactRec.targetBeneficiaries / 1000).toFixed(0)}k Beneficiaries`,
          actionHint: 'Click to inspect Priority Recommendation',
          score: 100,
          scoreBreakdown: [{ label: `Exact ID match (${intent.request_id})`, points: 100 }],
          rawItem: exactRec
        };
      }
    }

    // Search in community issues
    if (!exactMatch) {
      const exactIssue = communityIssues.find(i => i.id.toLowerCase() === qId || (i.rank && i.rank.toLowerCase() === qId));
      if (exactIssue) {
        exactMatch = {
          id: exactIssue.id,
          type: 'COMMUNITY_ISSUE',
          title: `Community Issue: ${exactIssue.title}`,
          subtitle: `${exactIssue.infrastructureName} (${exactIssue.relatedScheme})`,
          category: tCat(exactIssue.category),
          location: exactIssue.location,
          provenanceLabel: 'CivicPulse Signals',
          provenanceBadgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          priorityLabel: `${exactIssue.severity} Priority`,
          reportCount: `${exactIssue.requestCount || 0} citizen reports`,
          peopleAffected: `${exactIssue.affectedCommunities} communities`,
          actionHint: 'Click to view Community Issue',
          score: 100,
          scoreBreakdown: [{ label: `Exact ID match (${intent.request_id})`, points: 100 }],
          rawItem: exactIssue
        };
      }
    }

    // Search in government projects
    if (!exactMatch) {
      const exactProj = governmentProjects.find(p => p.id.toLowerCase() === qId);
      if (exactProj) {
        const actualProjCount = requests.filter(r => 
          r.category === exactProj.category && 
          ((r.district && r.district.toLowerCase() === exactProj.district.toLowerCase()) || 
           (r.location && r.location.toLowerCase().includes(exactProj.district.toLowerCase())))
        ).length;
        const dispCount = actualProjCount > 0 ? actualProjCount : exactProj.citizenRequestsCount;

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
          reportCount: dispCount > 0 ? `${dispCount} citizen reports` : 'No citizen reports found',
          peopleAffected: `${(exactProj.population || 0).toLocaleString()} people`,
          actionHint: 'Click to view in Action Queue',
          score: 100,
          scoreBreakdown: [{ label: `Exact ID match (${intent.request_id})`, points: 100 }],
          rawItem: exactProj
        };
      }
    }

    // If exact ID was entered but neither exists:
    if (!exactMatch) {
      exactMatchNotFoundId = intent.request_id;
    }
  }

  // =========================================================================
  // 2. RECOMMENDATIONS & POLICY BRIEFS SEARCH (PriorityEngine)
  // Calibrated relevance:
  // - Exact ID: +100
  // - District match: +40 (centralized matcher)
  // - Category match: +35
  // - Subcategory / intervention match: +25
  // - Keyword match: +20
  // - Recent signal: +10
  // - High priority: +5
  // =========================================================================
  for (const rec of allRecommendations) {
    let score = 0;
    const scoreBreakdown: ScoreFactor[] = [];
    const normTitle = rec.title.toLowerCase();
    const normCat = rec.category.toLowerCase();
    const normIntervention = (rec.interventionType || '').toLowerCase();
    const normAiRec = (rec.aiRecommendation || '').toLowerCase();
    const normSummary = (rec.summaryReasoning || '').toLowerCase();
    const normDist = rec.districtName.toLowerCase();

    // Exact ID (+100)
    if (intent.request_id && rec.id.toLowerCase() === intent.request_id.toLowerCase()) {
      score += 100;
      scoreBreakdown.push({ label: `Exact ID match (${intent.request_id})`, points: 100 });
    }

    // Centralized District Match (+40)
    if (intent.district && (normDist === intent.district.toLowerCase() || matchesDistrictToken(intent.district, rec.districtName, rec.districtId))) {
      score += 40;
      scoreBreakdown.push({ label: `District match (${intent.district})`, points: 40 });
    } else if (intent.location && intent.location !== 'ANY' && matchesDistrictToken(intent.location, rec.districtName, rec.districtId)) {
      score += 40;
      scoreBreakdown.push({ label: `Location match (${intent.location})`, points: 40 });
    }

    // Category match (+35)
    if (intent.category && intent.category !== 'ANY' && intent.category.toLowerCase() === normCat) {
      score += 35;
      scoreBreakdown.push({ label: `Category match (${intent.category})`, points: 35 });
    } else if ((intent.detectedCategories || []).some(c => c && c.toLowerCase() === normCat)) {
      score += 35;
      scoreBreakdown.push({ label: `Category match (${rec.category})`, points: 35 });
    }

    // Subcategory / Intervention match (+25)
    if (intent.subcategory && (normIntervention.includes(intent.subcategory.toLowerCase()) || normTitle.includes(intent.subcategory.toLowerCase()))) {
      score += 25;
      scoreBreakdown.push({ label: `Intervention match (${intent.subcategory})`, points: 25 });
    } else {
      for (const term of (intent.issue_terms || [])) {
        if (normTitle.includes(term) || normIntervention.includes(term) || normAiRec.includes(term) || normSummary.includes(term)) {
          score += 25;
          scoreBreakdown.push({ label: `Issue term match (${term})`, points: 25 });
          break;
        }
      }
    }

    // Keyword match (+20)
    for (const kw of (intent.keywords || [])) {
      if (normTitle.includes(kw) || normIntervention.includes(kw) || normAiRec.includes(kw) || normSummary.includes(kw)) {
        score += 20;
        scoreBreakdown.push({ label: `Keyword match (${kw})`, points: 20 });
        break;
      }
    }

    // Recent signal (+10)
    if (intent.time_range === 'LAST_7_DAYS' || intent.isRecent) {
      score += 10;
      scoreBreakdown.push({ label: 'Recent signal activity', points: 10 });
    }

    // High priority (+5)
    if (rec.priorityScore >= 60 || rec.urgencyLabel === 'CRITICAL' || rec.urgencyLabel === 'HIGH') {
      score += 5;
      scoreBreakdown.push({ label: 'High priority urgency', points: 5 });
    }

    if (score >= 20) {
      matchingRecommendations.push({
        id: rec.id,
        type: 'RECOMMENDATION',
        title: rec.title,
        subtitle: `${rec.interventionType} · Score: ${rec.priorityScore.toFixed(1)}/100 · Budget: ₹${(rec.estimatedBudgetInr / 10000000).toFixed(1)} Cr`,
        category: tCat(rec.category),
        location: `${rec.districtName}, ${rec.state}`,
        provenanceLabel: 'CivicPulse Signals',
        provenanceBadgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        priorityLabel: `${rec.priorityScore.toFixed(1)} Priority`,
        reportCount: `${rec.citizenRequestsCount} verified demand signals`,
        peopleAffected: `${(rec.targetBeneficiaries / 1000).toFixed(0)}k Beneficiaries`,
        actionHint: 'View Priority Recommendation',
        score,
        scoreBreakdown,
        whyExplanation: rec.summaryReasoning || 'High citizen demand + infrastructure gap + vulnerability + existing investment context.',
        rawItem: rec,
      });
    }
  }

  // =========================================================================
  // 3. COMMUNITY ISSUES SEARCH (Clustered public problems)
  // Calibrated relevance:
  // - Exact ID: +100
  // - District match: +40 (centralized matcher)
  // - Category match: +35
  // - Issue term / Subcategory: +25
  // - Keyword match: +20
  // - Recent: +10
  // - High priority: +5
  // =========================================================================
  for (const issue of communityIssues) {
    let score = 0;
    const scoreBreakdown: ScoreFactor[] = [];
    const normTitle = issue.title.toLowerCase();
    const normLoc = issue.location.toLowerCase();
    const normCat = issue.category.toLowerCase();
    const normScheme = (issue.relatedScheme || '').toLowerCase();
    const normInfra = (issue.infrastructureName || '').toLowerCase();

    // Exact ID (+100)
    if (intent.request_id && (issue.id.toLowerCase() === intent.request_id.toLowerCase() || issue.rank === intent.request_id)) {
      score += 100;
      scoreBreakdown.push({ label: `Exact ID match (${intent.request_id})`, points: 100 });
    }

    // Exact category match (+35)
    if (intent.category && intent.category !== 'ANY' && intent.category.toLowerCase() === normCat) {
      score += 35;
      scoreBreakdown.push({ label: `Category match (${intent.category})`, points: 35 });
    } else if ((intent.detectedCategories || []).some(c => c && c.toLowerCase() === normCat)) {
      score += 35;
      scoreBreakdown.push({ label: `Category match (${issue.category})`, points: 35 });
    }

    // Centralized district / locality match (+40)
    if (intent.district && (normLoc.includes(intent.district.toLowerCase()) || matchesDistrictToken(issue.location, intent.district, intent.district.toLowerCase()))) {
      score += 40;
      scoreBreakdown.push({ label: `District match (${intent.district})`, points: 40 });
    } else if (intent.location && intent.location !== 'ANY' && normLoc.includes(intent.location.toLowerCase())) {
      score += 40;
      scoreBreakdown.push({ label: `Location match (${intent.location})`, points: 40 });
    }

    // Issue-term / subcategory match (+25)
    for (const term of (intent.issue_terms || [])) {
      if (normTitle.includes(term) || normInfra.includes(term)) {
        score += 25;
        scoreBreakdown.push({ label: `Issue term match (${term})`, points: 25 });
        break;
      }
    }

    // Keyword match (+20)
    for (const kw of (intent.keywords || [])) {
      if (normTitle.includes(kw) || normScheme.includes(kw) || normInfra.includes(kw)) {
        score += 20;
        scoreBreakdown.push({ label: `Keyword match (${kw})`, points: 20 });
        break;
      }
    }

    // Recent record (+10)
    if (intent.time_range === 'LAST_7_DAYS' || intent.isRecent) {
      score += 10;
      scoreBreakdown.push({ label: 'Recent record', points: 10 });
    }

    // High priority (+5)
    if (issue.severity === 'Critical' || issue.severity === 'High') {
      score += 5;
      scoreBreakdown.push({ label: 'High severity', points: 5 });
    }

    if (score >= 20) {
      const locKey = issue.location.split(',')[0].trim().toLowerCase();
      const realReportsCount = requests.filter(r => 
        r.category.toLowerCase() === normCat && 
        (r.location.toLowerCase().includes(locKey) || (r.district && issue.location.toLowerCase().includes(r.district.toLowerCase())))
      ).length;
      const countToShow = realReportsCount > 0 ? realReportsCount : (issue.requestCount || 0);

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
        reportCount: countToShow > 0 ? `${countToShow} citizen reports` : 'No citizen reports found',
        peopleAffected: `${issue.affectedCommunities} communities`,
        actionHint: 'View Community Issue',
        score,
        scoreBreakdown,
        rawItem: issue,
      });
    }
  }

  // =========================================================================
  // 4. PRIORITY HOTSPOTS & DEMAND SEARCH (Actual getCityDemandHotspot engine)
  // Calibrated relevance:
  // - Exact ID: +100
  // - District match: +40 (centralized matcher)
  // - Category match: +35
  // - Issue term / subcategory: +25
  // - Keyword match: +20
  // - Recent: +10
  // - High priority: +5
  // =========================================================================
  for (const dist of districts) {
    let score = 0;
    const scoreBreakdown: ScoreFactor[] = [];
    const normName = dist.name.toLowerCase();
    const normState = dist.state.toLowerCase();

    // Exact ID (+100)
    if (intent.request_id && dist.id.toLowerCase() === intent.request_id.toLowerCase()) {
      score += 100;
      scoreBreakdown.push({ label: `Exact ID match (${intent.request_id})`, points: 100 });
    }

    // Centralized District Match (+40)
    if (intent.district && (normName === intent.district.toLowerCase() || matchesDistrictToken(intent.district, dist.name, dist.id))) {
      score += 40;
      scoreBreakdown.push({ label: `District match (${intent.district})`, points: 40 });
    } else if (intent.location && intent.location !== 'ANY' && matchesDistrictToken(intent.location, dist.name, dist.id)) {
      score += 40;
      scoreBreakdown.push({ label: `Location match (${intent.location})`, points: 40 });
    }

    // State match (+20)
    if (intent.state && normState.includes(intent.state.toLowerCase())) {
      score += 20;
      scoreBreakdown.push({ label: `State match (${intent.state})`, points: 20 });
    }

    // Generate actual Demand Hotspot using the demandAggregation engine
    const targetCategory: 'All' | InfrastructureCategory = (intent.category && intent.category !== 'ANY' && intent.category !== 'Other') ? (intent.category as InfrastructureCategory) : 'All';
    const hotspot = getCityDemandHotspot(dist, requests, targetCategory);

    // Category match (+35)
    if (intent.category && intent.category !== 'ANY' && (hotspot.hasCategorySignal || hotspot.primaryCategory === intent.category)) {
      score += 35;
      scoreBreakdown.push({ label: `Category demand match (${intent.category})`, points: 35 });
    }

    // Subcategory / issue term match (+25)
    for (const term of (intent.issue_terms || [])) {
      if (normName.includes(term) || hotspot.topIssues.some(ti => ti.category.toLowerCase().includes(term))) {
        score += 25;
        scoreBreakdown.push({ label: `Issue term match (${term})`, points: 25 });
        break;
      }
    }

    // Keyword match (+20)
    for (const kw of (intent.keywords || [])) {
      if (normName.includes(kw) || normState.includes(kw) || hotspot.topIssues.some(ti => ti.category.toLowerCase().includes(kw))) {
        score += 20;
        scoreBreakdown.push({ label: `Keyword match (${kw})`, points: 20 });
        break;
      }
    }

    // Recent signal (+10)
    if (intent.time_range === 'LAST_7_DAYS' || intent.isRecent || (hotspot.userRequestsCount && hotspot.userRequestsCount > 0)) {
      score += 10;
      scoreBreakdown.push({ label: 'Recent demand signals', points: 10 });
    }

    // High priority (+5)
    const isCritical = hotspot.urgencyLevel === 'Critical' || hotspot.urgencyLevel === 'High' || dist.poverty_index > 0.5;
    if (isCritical) {
      score += 5;
      scoreBreakdown.push({ label: 'High urgency / vulnerability', points: 5 });
    }

    if (score >= 20) {
      matchingHotspots.push({
        id: dist.id,
        type: 'PRIORITY_HOTSPOT',
        title: `${dist.name} District Hotspot`,
        subtitle: `${hotspot.primaryBadgeLabel} · ${hotspot.urgencyLevel} Urgency (${(dist.poverty_index * 100).toFixed(0)}% Poverty Index)`,
        category: (intent.category && intent.category !== 'ANY') ? tCat(intent.category) : tCat(hotspot.primaryCategory),
        location: `${dist.name}, ${dist.state}`,
        provenanceLabel: 'CivicPulse Signals',
        provenanceBadgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        priorityLabel: `${hotspot.urgencyLevel} Hotspot`,
        reportCount: `${hotspot.totalCitizenRequests.toLocaleString()} demand signals recorded`,
        peopleAffected: `${(dist.population / 1000000).toFixed(1)}M Population`,
        actionHint: 'Inspect District on Hotspot Map',
        score,
        scoreBreakdown,
        rawItem: { ...dist, hotspot },
      });
    }
  }

  // =========================================================================
  // 5. CITIZEN SIGNALS & REPORTS SEARCH (Individual Citizen Submissions)
  // Calibrated relevance:
  // - Exact ID: +100
  // - District match: +40 (centralized matcher)
  // - Category match: +35
  // - Subcategory match: +25
  // - Issue term: +25
  // - Keyword match: +20
  // - Recent: +10
  // - High priority: +5
  // =========================================================================
  for (const req of requests) {
    let score = 0;
    const scoreBreakdown: ScoreFactor[] = [];
    const normSummary = (req.summary_en || '').toLowerCase();
    const normOriginal = (req.original_text || '').toLowerCase();
    const normLoc = (req.location || '').toLowerCase();
    const normCat = req.category.toLowerCase();
    const normSub = (req.subcategory || '').toLowerCase();

    // Exact ID (+100)
    if (intent.request_id) {
      if (req.id.toLowerCase() === intent.request_id.toLowerCase() || (req.request_id && req.request_id.toLowerCase() === intent.request_id.toLowerCase())) {
        score += 100;
        scoreBreakdown.push({ label: `Exact ID match (${intent.request_id})`, points: 100 });
      }
    }

    // Exact Category Match (+35)
    if (intent.category && intent.category !== 'ANY' && intent.category.toLowerCase() === normCat) {
      score += 35;
      scoreBreakdown.push({ label: `Category match (${intent.category})`, points: 35 });
    } else if ((intent.detectedCategories || []).some(c => c && c.toLowerCase() === normCat)) {
      score += 35;
      scoreBreakdown.push({ label: `Category match (${req.category})`, points: 35 });
    }

    // Subcategory / Issue Match (+25)
    if (intent.subcategory && normSub.includes(intent.subcategory.toLowerCase())) {
      score += 25;
      scoreBreakdown.push({ label: `Subcategory match (${intent.subcategory})`, points: 25 });
    }

    // Centralized District Match (+40)
    if (intent.district && (matchesDistrict(req, { name: intent.district, id: intent.district.toLowerCase() } as any) || matchesDistrictToken(req.location, intent.district, intent.district.toLowerCase()))) {
      score += 40;
      scoreBreakdown.push({ label: `District match (${intent.district})`, points: 40 });
    } else if (intent.location && intent.location !== 'ANY' && (normLoc.includes(intent.location.toLowerCase()) || (req.locality && req.locality.toLowerCase().includes(intent.location.toLowerCase())))) {
      score += 40;
      scoreBreakdown.push({ label: `Location match (${intent.location})`, points: 40 });
    }

    // Issue-term match (+25)
    for (const term of (intent.issue_terms || [])) {
      if (normSummary.includes(term) || normOriginal.includes(term) || normSub.includes(term)) {
        score += 25;
        scoreBreakdown.push({ label: `Issue term match (${term})`, points: 25 });
        break;
      }
    }

    // Description keyword match (+20)
    for (const kw of (intent.keywords || [])) {
      if (normSummary.includes(kw) || normOriginal.includes(kw)) {
        score += 20;
        scoreBreakdown.push({ label: `Keyword match (${kw})`, points: 20 });
        break;
      }
    }

    // Recent record (+10)
    const reqTime = req.timestamp ? new Date(req.timestamp).getTime() : 0;
    const isWithin7Days = reqTime > 0 && (Date.now() - reqTime) < 7 * 24 * 60 * 60 * 1000;
    if (isWithin7Days || intent.time_range === 'LAST_7_DAYS' || req.id.startsWith('CP-2026-')) {
      score += 10;
      scoreBreakdown.push({ label: 'Recent signal activity', points: 10 });
    }

    // High priority (+5)
    if ((req.severity || 5) >= 8 || req.urgency === 'CRITICAL' || req.urgency === 'HIGH') {
      score += 5;
      scoreBreakdown.push({ label: 'High urgency / severity', points: 5 });
    }

    if (score >= 20) {
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
        scoreBreakdown,
        rawItem: req,
      });
    }
  }

  // =========================================================================
  // 6. ACTION QUEUE & SANCTIONED PUBLIC PROJECTS SEARCH
  // Calibrated relevance:
  // - Exact ID: +100
  // - District: +40 (centralized matcher)
  // - Category: +35
  // - Issue term / subcategory: +25
  // - Keyword: +20
  // - High priority: +5
  // =========================================================================
  for (const proj of governmentProjects) {
    let score = 0;
    const scoreBreakdown: ScoreFactor[] = [];
    const normTitle = proj.title.toLowerCase();
    const normDesc = (proj.description || '').toLowerCase();
    const normDist = proj.district.toLowerCase();
    const normCat = proj.category.toLowerCase();

    // Exact ID (+100)
    if (intent.request_id && proj.id.toLowerCase() === intent.request_id.toLowerCase()) {
      score += 100;
      scoreBreakdown.push({ label: `Exact ID match (${intent.request_id})`, points: 100 });
    }

    // Category (+35)
    if (intent.category && intent.category !== 'ANY' && intent.category.toLowerCase() === normCat) {
      score += 35;
      scoreBreakdown.push({ label: `Category match (${intent.category})`, points: 35 });
    }

    // District (+40) via Centralized Matcher
    if (intent.district && (normDist === intent.district.toLowerCase() || matchesDistrictToken(intent.district, proj.district, proj.district.toLowerCase()))) {
      score += 40;
      scoreBreakdown.push({ label: `District match (${intent.district})`, points: 40 });
    } else if (intent.location && intent.location !== 'ANY' && matchesDistrictToken(intent.location, proj.district, proj.district.toLowerCase())) {
      score += 40;
      scoreBreakdown.push({ label: `Location match (${intent.location})`, points: 40 });
    }

    // Issue terms (+25)
    for (const term of (intent.issue_terms || [])) {
      if (normTitle.includes(term)) {
        score += 25;
        scoreBreakdown.push({ label: `Issue term match (${term})`, points: 25 });
        break;
      }
    }

    // Keywords (+20)
    for (const kw of (intent.keywords || [])) {
      if (normTitle.includes(kw) || normDesc.includes(kw)) {
        score += 20;
        scoreBreakdown.push({ label: `Keyword match (${kw})`, points: 20 });
        break;
      }
    }

    // High priority (+5)
    if (proj.priorityScore >= 75) {
      score += 5;
      scoreBreakdown.push({ label: 'High priority score', points: 5 });
    }

    if (score >= 20) {
      const realProjCount = requests.filter(r => 
        r.category === proj.category && 
        ((r.district && r.district.toLowerCase() === normDist) || (r.location && r.location.toLowerCase().includes(normDist)))
      ).length;
      const countToShow = realProjCount > 0 ? realProjCount : proj.citizenRequestsCount;

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
        reportCount: countToShow > 0 ? `${countToShow} citizen reports` : 'No citizen reports found',
        peopleAffected: `${(proj.population || 0).toLocaleString()} people`,
        actionHint: 'Open in Action Queue',
        score,
        scoreBreakdown,
        rawItem: proj,
      });
    }
  }

  // =========================================================================
  // 7. INFRASTRUCTURE ASSETS SEARCH
  // =========================================================================
  for (const asset of INFRASTRUCTURE_ASSETS_REGISTRY) {
    let score = 0;
    const scoreBreakdown: ScoreFactor[] = [];
    const normName = asset.name.toLowerCase();
    const normLoc = asset.location.toLowerCase();
    const normDist = asset.districtName.toLowerCase();
    const normCat = asset.category.toLowerCase();

    if (intent.category && intent.category !== 'ANY' && intent.category.toLowerCase() === normCat) {
      score += 35;
      scoreBreakdown.push({ label: `Category match (${intent.category})`, points: 35 });
    }
    if (intent.district && (normDist === intent.district.toLowerCase() || matchesDistrictToken(intent.district, asset.districtName, asset.districtName.toLowerCase()))) {
      score += 40;
      scoreBreakdown.push({ label: `District match (${intent.district})`, points: 40 });
    } else if (intent.location && intent.location !== 'ANY' && (normDist.includes(intent.location.toLowerCase()) || normLoc.includes(intent.location.toLowerCase()))) {
      score += 40;
      scoreBreakdown.push({ label: `Location match (${intent.location})`, points: 40 });
    }
    for (const term of (intent.issue_terms || [])) {
      if (normName.includes(term)) {
        score += 25;
        scoreBreakdown.push({ label: `Issue match (${term})`, points: 25 });
        break;
      }
    }
    for (const kw of (intent.keywords || [])) {
      if (normName.includes(kw) || normLoc.includes(kw)) {
        score += 20;
        scoreBreakdown.push({ label: `Keyword match (${kw})`, points: 20 });
        break;
      }
    }

    if (score >= 20) {
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
        scoreBreakdown,
        rawItem: asset,
      });
    }
  }

  // =========================================================================
  // 8. GOVERNMENT BASELINE GRIEVANCE DATA
  // =========================================================================
  for (const base of DEPARTMENT_GRIEVANCE_BASELINES) {
    let score = 0;
    const scoreBreakdown: ScoreFactor[] = [];
    const normDept = base.department.toLowerCase();
    const normMin = base.ministry.toLowerCase();
    const normCat = base.category.toLowerCase();

    if (intent.category && intent.category !== 'ANY' && intent.category.toLowerCase() === normCat) {
      score += 35;
      scoreBreakdown.push({ label: `Category match (${intent.category})`, points: 35 });
    }
    for (const kw of (intent.keywords || [])) {
      if (normDept.includes(kw) || normMin.includes(kw)) {
        score += 20;
        scoreBreakdown.push({ label: `Keyword match (${kw})`, points: 20 });
        break;
      }
    }

    if (score >= 20) {
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
        scoreBreakdown,
        rawItem: base,
      });
    }
  }

  // Deterministic sorting with stable tie-breaking
  matchingRecommendations.sort(tieBreakCompare);
  matchingIssues.sort(tieBreakCompare);
  matchingHotspots.sort(tieBreakCompare);
  matchingReports.sort(tieBreakCompare);
  matchingProjects.sort(tieBreakCompare);
  matchingInfrastructure.sort(tieBreakCompare);
  matchingBaseline.sort(tieBreakCompare);

  // Determine BEST MATCH (highest ranked across all categories if score >= 40)
  let bestMatch: HumanSearchResultItem | null = null;
  if (!exactMatch) {
    const topCandidates = [
      ...matchingRecommendations.slice(0, 2),
      ...matchingIssues.slice(0, 2),
      ...matchingHotspots.slice(0, 2),
      ...matchingProjects.slice(0, 1),
      ...matchingReports.slice(0, 1),
    ].sort(tieBreakCompare);

    if (topCandidates.length > 0 && topCandidates[0].score >= 40) {
      bestMatch = topCandidates[0];
    }
  }

  const { suggestions, type: suggestionsType } = getSearchSuggestions(query, data, options);
  const totalResultsCount = 
    (exactMatch ? 1 : 0) +
    matchingRecommendations.length +
    matchingIssues.length +
    matchingHotspots.length +
    matchingReports.length +
    matchingProjects.length +
    matchingInfrastructure.length +
    matchingBaseline.length;

  return {
    intent,
    exactMatch,
    exactMatchNotFoundId,
    bestMatch,
    recommendations: matchingRecommendations.slice(0, 6),
    communityIssues: matchingIssues.slice(0, 6),
    priorityHotspots: matchingHotspots.slice(0, 4),
    citizenReports: matchingReports.slice(0, 8),
    actionProjects: matchingProjects.slice(0, 4),
    infrastructure: matchingInfrastructure.slice(0, 4),
    governmentBaseline: matchingBaseline.slice(0, 2),
    suggestions,
    suggestionsType,
    totalResultsCount,
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
  const intent = normalizeSearchIntent(parseSearchIntent(query, allDistricts));

  // Exact ID match
  if (intent.request_id) {
    const qId = intent.request_id.toLowerCase();
    return req.id.toLowerCase().includes(qId) || (req.request_id && req.request_id.toLowerCase().includes(qId)) || false;
  }

  const normSummary = (req.summary_en || '').toLowerCase();
  const normOriginal = (req.original_text || '').toLowerCase();
  const normLoc = (req.location || '').toLowerCase();
  const normDist = (req.district || '').toLowerCase();
  const normState = (req.state || '').toLowerCase();
  const normCat = req.category.toLowerCase();

  // If query specifies a category, must match category
  if (intent.category && intent.category !== 'ANY') {
    if (req.category.toLowerCase() !== intent.category.toLowerCase()) return false;
  } else if ((intent.detectedCategories || []).length > 0) {
    const catMatch = intent.detectedCategories.some(c => c && c.toLowerCase() === normCat);
    if (!catMatch) return false;
  }

  // If query specifies location, must match location
  if (intent.location && intent.location !== 'ANY') {
    const lowL = intent.location.toLowerCase();
    const locMatch = normLoc.includes(lowL) || normDist.includes(lowL) || normState.includes(lowL);
    if (!locMatch) return false;
  } else if ((intent.detectedLocations || []).length > 0) {
    const locMatch = intent.detectedLocations.some(l => {
      const lowL = (l || '').toLowerCase();
      return normLoc.includes(lowL) || normDist.includes(lowL) || normState.includes(lowL);
    });
    if (!locMatch) return false;
  }

  // If query specifies high urgency
  if (intent.isUrgent && (req.severity || 5) < 7) {
    return false;
  }

  // If residual keywords exist, test if any match
  if ((intent.keywords || []).length > 0) {
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

/**
 * Calls server-side Gemini structured intent extraction API (/api/search/intent)
 * Falls back safely to client-side parseSearchIntent if offline or server returns error
 */
export async function fetchServerSearchIntent(
  query: string,
  districts: District[] = []
): Promise<{ intent: SearchIntent; isAiExtracted: boolean }> {
  try {
    const res = await fetch('/api/search/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.intent) {
        return {
          intent: normalizeSearchIntent(data.intent),
          isAiExtracted: !!data.isAiExtracted,
        };
      }
    }
  } catch (err) {
    console.warn('[Search] Server intent extraction failed, falling back to local parser:', err);
  }
  return {
    intent: normalizeSearchIntent(parseSearchIntent(query, districts)),
    isAiExtracted: false
  };
}

/**
 * ============================================================================
 * DETERMINISTIC SEARCH FUNCTIONS (Section 5 - 11)
 * Pure, reliable search functions executing against actual CivicPulse datasets.
 * ============================================================================
 */

/**
 * 1. searchCitizenReports(criteria)
 * Search actual citizen reports dataset with strict provenance and standardized relevance scoring.
 */
export function searchCitizenReports(
  criteria: Partial<SearchIntent>,
  requests: CitizenRequest[],
  districts: District[] = []
): HumanSearchResultItem[] {
  const normCat = criteria.category ? criteria.category.toLowerCase() : null;
  const keywords = (criteria.keywords || []).map(k => k.toLowerCase());
  const limit = Math.min(Math.max(criteria.limit || 10, 1), 20);

  const results: HumanSearchResultItem[] = [];

  for (const req of requests) {
    let score = 0;
    const rCat = req.category.toLowerCase();
    const rLoc = (req.location || '').toLowerCase();
    const rText = ((req.summary_en || '') + ' ' + (req.original_text || '')).toLowerCase();
    const rSub = (req.subcategory || '').toLowerCase();

    // Exact Request ID (+100)
    if (criteria.requestId && (req.id.toLowerCase() === criteria.requestId.toLowerCase() || (req.request_id && req.request_id.toLowerCase() === criteria.requestId.toLowerCase()))) {
      score += 100;
    }

    // Exact District (+40) via Centralized Matcher
    if (criteria.district) {
      if (matchesDistrict(req, { id: criteria.district, name: criteria.district })) {
        score += 40;
      }
    }

    // Exact Category (+35)
    if (normCat && rCat === normCat) {
      score += 35;
    }

    // Issue / Subcategory (+25)
    if (criteria.subcategory && rSub.includes(criteria.subcategory.toLowerCase())) {
      score += 25;
    }
    if (criteria.issue_terms) {
      for (const term of criteria.issue_terms) {
        if (rSub.includes(term.toLowerCase()) || rText.includes(term.toLowerCase())) {
          score += 25;
          break;
        }
      }
    }

    // Keywords (+20)
    for (const kw of keywords) {
      if (rText.includes(kw) || rSub.includes(kw) || rLoc.includes(kw)) {
        score += 20;
        break;
      }
    }

    // Recent Signal (+10)
    if (criteria.time_range === 'LAST_7_DAYS' || criteria.isRecent) {
      score += 10;
    }

    // High Priority / Severity (+5)
    if ((req.severity && req.severity >= 8) || req.urgency === 'CRITICAL' || req.urgency === 'HIGH' || criteria.priority === 'HIGH' || criteria.priority === 'CRITICAL') {
      score += 5;
    }

    // Filter checks
    if (criteria.minSeverity && (req.severity || 0) < criteria.minSeverity) {
      continue;
    }
    if (criteria.maxSeverity && (req.severity || 0) > criteria.maxSeverity) {
      continue;
    }
    if (criteria.status && req.status && req.status.toLowerCase() !== criteria.status.toLowerCase()) {
      continue;
    }

    if (score >= 20 || (criteria.queryType === 'citizen_reports' && score >= 10)) {
      const isLive = req.source_origin === 'CIVICPULSE_USER' || req.id.startsWith('CP-202');
      results.push({
        id: req.id,
        type: 'CITIZEN_REPORT',
        title: `${CATEGORY_DISPLAY_NAMES[req.category] || req.category}: ${req.summary_en || req.original_text}`,
        subtitle: req.original_text ? `Original note: "${req.original_text}"` : undefined,
        category: CATEGORY_DISPLAY_NAMES[req.category] || req.category,
        location: req.location,
        provenanceLabel: isLive ? 'CivicPulse Signals' : 'Illustrative Demo Data',
        provenanceBadgeColor: isLive ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-stone-200 text-stone-700 border-stone-300',
        statusBadge: req.status || 'Received',
        priorityLabel: `Severity: ${req.severity || 5}/10`,
        dateOrTimeline: req.timestamp ? new Date(req.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently submitted',
        actionHint: 'Inspect Citizen Signal',
        score,
        rawItem: req,
      });
    }
  }

  return results.sort(tieBreakCompare).slice(0, limit);
}

/**
 * 2. searchCommunityIssues(criteria)
 * Search actual community issues clusters.
 */
export function searchCommunityIssues(
  criteria: Partial<SearchIntent>,
  issues: CommunityIssue[] = INITIAL_COMMUNITY_ISSUES
): HumanSearchResultItem[] {
  const normCat = criteria.category ? criteria.category.toLowerCase() : null;
  const keywords = (criteria.keywords || []).map(k => k.toLowerCase());
  const limit = Math.min(Math.max(criteria.limit || 10, 1), 20);

  const results: HumanSearchResultItem[] = [];

  for (const issue of issues) {
    let score = 0;
    const iTitle = issue.title.toLowerCase();
    const iInfra = issue.infrastructureName.toLowerCase();
    const iLoc = issue.location.toLowerCase();
    const iCat = issue.category.toLowerCase();

    // Exact ID (+100)
    if (criteria.requestId && (issue.id.toLowerCase() === criteria.requestId.toLowerCase() || (issue.rank && issue.rank.toLowerCase() === criteria.requestId.toLowerCase()))) {
      score += 100;
    }

    // District (+40) via Centralized Matcher
    if (criteria.district && (iLoc.includes(criteria.district.toLowerCase()) || matchesDistrictToken(iLoc, criteria.district, criteria.district.toLowerCase()))) {
      score += 40;
    }

    // Category (+35)
    if (normCat && (iCat === normCat || iTitle.includes(normCat) || iInfra.includes(normCat))) {
      score += 35;
    }

    // Issue / Subcategory terms (+25)
    if (criteria.issue_terms) {
      for (const term of criteria.issue_terms) {
        if (iTitle.includes(term.toLowerCase()) || iInfra.includes(term.toLowerCase())) {
          score += 25;
          break;
        }
      }
    }

    // Keywords (+20)
    for (const kw of keywords) {
      if (iTitle.includes(kw) || iInfra.includes(kw) || iLoc.includes(kw)) {
        score += 20;
        break;
      }
    }

    // Priority filter / High priority (+5)
    if (issue.severity === 'Critical' || issue.severity === 'High' || criteria.priority === 'HIGH' || criteria.priority === 'CRITICAL') {
      score += 5;
    }

    if (score >= 20 || (criteria.queryType === 'community_issues' && score >= 10)) {
      results.push({
        id: issue.id,
        type: 'COMMUNITY_ISSUE',
        title: `Community Issue: ${issue.title}`,
        subtitle: `${issue.infrastructureName} (${issue.relatedScheme})`,
        category: CATEGORY_DISPLAY_NAMES[issue.category] || issue.category,
        location: issue.location,
        provenanceLabel: 'CivicPulse Signals',
        provenanceBadgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        priorityLabel: `${issue.severity} Priority`,
        reportCount: `${issue.requestCount || 0} citizen reports`,
        peopleAffected: `${issue.affectedCommunities} communities`,
        actionHint: 'Click to view Community Issue',
        score,
        rawItem: issue,
      });
    }
  }

  return results.sort(tieBreakCompare).slice(0, limit);
}

/**
 * 3. searchHotspots(criteria)
 * Uses getCityDemandHotspot(...) from demandAggregation.ts against actual citizen request data.
 */
export function searchHotspots(
  criteria: Partial<SearchIntent>,
  districts: District[],
  requests: CitizenRequest[]
): HumanSearchResultItem[] {
  const targetCategory: 'All' | InfrastructureCategory = (criteria.category && criteria.category !== 'Other' && criteria.category !== 'ANY') ? (criteria.category as InfrastructureCategory) : 'All';
  const keywords = (criteria.keywords || []).map(k => k.toLowerCase());
  const limit = Math.min(Math.max(criteria.limit || 10, 1), 20);

  const results: HumanSearchResultItem[] = [];

  for (const dist of districts) {
    let score = 0;
    const normName = dist.name.toLowerCase();
    const normState = (dist.state || '').toLowerCase();

    // Centralized district match (+40)
    if (criteria.district) {
      if (matchesDistrictToken(criteria.district, dist.name, dist.id) || normName === criteria.district.toLowerCase()) {
        score += 40;
      } else {
        continue;
      }
    }

    // State match (+20)
    if (criteria.state && normState.includes(criteria.state.toLowerCase())) {
      score += 20;
    }

    // Compute actual hotspot data from demandAggregation
    const hotspot = getCityDemandHotspot(dist, requests, targetCategory);

    // Category match (+35)
    if (criteria.category && (hotspot.hasCategorySignal || hotspot.primaryCategory === criteria.category)) {
      score += 35;
    }

    // Issue terms (+25)
    if (criteria.issue_terms) {
      for (const term of criteria.issue_terms) {
        if (normName.includes(term.toLowerCase()) || hotspot.topIssues.some(ti => ti.category.toLowerCase().includes(term.toLowerCase()))) {
          score += 25;
          break;
        }
      }
    }

    // Keywords (+20)
    for (const kw of keywords) {
      if (normName.includes(kw) || normState.includes(kw) || hotspot.topIssues.some(ti => ti.category.toLowerCase().includes(kw))) {
        score += 20;
        break;
      }
    }

    // Demand / Gap filters
    if (criteria.demandLevel === 'HIGH' && hotspot.totalCitizenRequests < 10 && (hotspot.baselineDemandVolume || 0) < 100) {
      continue;
    }
    if (criteria.infrastructureGapLevel === 'HIGH' && dist.poverty_index < 0.4 && (dist.water_access > 60 && dist.health_access > 60)) {
      continue;
    }

    // Recent signal (+10)
    if (criteria.time_range === 'LAST_7_DAYS' || criteria.isRecent || (hotspot.userRequestsCount && hotspot.userRequestsCount > 0)) {
      score += 10;
    }

    // High priority (+5)
    if (hotspot.highPriorityCount > 0) {
      score += 5;
    }

    if (score >= 20 || (criteria.queryType === 'hotspots' && score >= 10)) {
      results.push({
        id: dist.id,
        type: 'PRIORITY_HOTSPOT',
        title: `${dist.name} Demand Hotspot`,
        subtitle: `${hotspot.primaryBadgeLabel} · ${dist.state} (${dist.zone} Zone)`,
        category: hotspot.primaryCategory,
        location: `${dist.name}, ${dist.state}`,
        provenanceLabel: 'CivicPulse Signals',
        provenanceBadgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        priorityLabel: `${hotspot.primaryDot} ${hotspot.primaryBadgeLabel}`,
        reportCount: `${hotspot.totalCitizenRequests} total verified requests`,
        peopleAffected: `${(dist.population / 1000000).toFixed(1)}M Population`,
        actionHint: 'View District Need & Demand Breakdown',
        score,
        rawItem: { ...dist, hotspot },
      });
    }
  }

  return results.sort(tieBreakCompare).slice(0, limit);
}

/**
 * 4. searchRecommendations(criteria)
 * Uses getAIRecommendedProjects(districts, requests) from scoring.ts.
 */
export function searchRecommendations(
  criteria: Partial<SearchIntent>,
  districts: District[],
  requests: CitizenRequest[],
  recommendations?: RecommendedProject[]
): HumanSearchResultItem[] {
  const allRecs = recommendations || getAIRecommendedProjects(districts, requests);
  const normCat = criteria.category ? criteria.category.toLowerCase() : null;
  const keywords = (criteria.keywords || []).map(k => k.toLowerCase());
  const limit = Math.min(Math.max(criteria.limit || 10, 1), 20);

  const results: HumanSearchResultItem[] = [];

  for (const rec of allRecs) {
    let score = 0;
    const rTitle = rec.title.toLowerCase();
    const rCat = rec.category.toLowerCase();
    const rIntervention = (rec.interventionType || '').toLowerCase();
    const rAiRec = (rec.aiRecommendation || '').toLowerCase();
    const rSummary = (rec.summaryReasoning || '').toLowerCase();
    const rDist = rec.districtName.toLowerCase();

    // Exact ID (+100)
    if (criteria.requestId && rec.id.toLowerCase() === criteria.requestId.toLowerCase()) {
      score += 100;
    }

    // Centralized District Match (+40)
    if (criteria.district) {
      if (rDist === criteria.district.toLowerCase() || matchesDistrictToken(criteria.district, rec.districtName, rec.districtId)) {
        score += 40;
      } else {
        continue;
      }
    }

    // Category match (+35)
    if (normCat && rCat === normCat) {
      score += 35;
    }

    // Subcategory / Intervention match (+25)
    if (criteria.subcategory && (rIntervention.includes(criteria.subcategory.toLowerCase()) || rTitle.includes(criteria.subcategory.toLowerCase()))) {
      score += 25;
    }
    if (criteria.issue_terms) {
      for (const term of criteria.issue_terms) {
        if (rTitle.includes(term.toLowerCase()) || rIntervention.includes(term.toLowerCase()) || rAiRec.includes(term.toLowerCase()) || rSummary.includes(term.toLowerCase())) {
          score += 25;
          break;
        }
      }
    }

    // Keyword match (+20)
    for (const kw of keywords) {
      if (rTitle.includes(kw) || rIntervention.includes(kw) || rAiRec.includes(kw) || rSummary.includes(kw)) {
        score += 20;
        break;
      }
    }

    // Min Priority Score filter
    if (criteria.minSeverity && rec.priorityScore < criteria.minSeverity) {
      continue;
    }

    // Recent signal (+10)
    if (criteria.time_range === 'LAST_7_DAYS' || criteria.isRecent) {
      score += 10;
    }

    // High priority (+5)
    if (rec.priorityScore >= 60 || rec.urgencyLabel === 'CRITICAL' || rec.urgencyLabel === 'HIGH') {
      score += 5;
    }

    if (score >= 20 || (criteria.queryType === 'recommendations' && score >= 10)) {
      results.push({
        id: rec.id,
        type: 'RECOMMENDATION',
        title: rec.title,
        subtitle: `${rec.interventionType} · Score: ${rec.priorityScore.toFixed(1)}/100 · Budget: ₹${(rec.estimatedBudgetInr / 10000000).toFixed(1)} Cr`,
        category: CATEGORY_DISPLAY_NAMES[rec.category] || rec.category,
        location: `${rec.districtName}, ${rec.state}`,
        provenanceLabel: 'CivicPulse Signals',
        provenanceBadgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        priorityLabel: `${rec.priorityScore.toFixed(1)} Priority`,
        reportCount: `${rec.citizenRequestsCount} verified demand signals`,
        peopleAffected: `${(rec.targetBeneficiaries / 1000).toFixed(0)}k Beneficiaries`,
        actionHint: 'View Priority Recommendation',
        score,
        rawItem: rec,
      });
    }
  }

  return results.sort(tieBreakCompare).slice(0, limit);
}

/**
 * 5. searchLocations(criteria)
 * Search DISTRICTS_REGISTRY using centralized word-bounded matchesDistrictToken.
 */
export function searchLocations(
  criteria: Partial<SearchIntent>,
  districts: District[] = DISTRICTS_REGISTRY
): District[] {
  const query = (criteria.district || (criteria.keywords || []).join(' ') || '').trim();
  if (!query) return [];

  const matched: District[] = [];

  for (const dist of districts) {
    if (matchesDistrictToken(query, dist.name, dist.id)) {
      matched.push(dist);
    } else if (dist.name.toLowerCase() === query.toLowerCase() || dist.id.toLowerCase() === query.toLowerCase()) {
      matched.push(dist);
    }
  }

  return matched;
}

/**
 * 6. getRequestById(requestId)
 * Exact ID lookup. Returns exact record or null.
 */
export function getRequestById(
  requestId: string,
  data: {
    requests: CitizenRequest[];
    recommendations?: RecommendedProject[];
    communityIssues?: CommunityIssue[];
    governmentProjects?: GovernmentProject[];
  }
): HumanSearchResultItem | null {
  if (!requestId) return null;
  const qId = requestId.trim().toLowerCase();

  // 1. Citizen requests
  const req = data.requests.find(r =>
    r.id.toLowerCase() === qId ||
    (r.request_id && r.request_id.toLowerCase() === qId)
  );
  if (req) {
    const isLive = req.source_origin === 'CIVICPULSE_USER' || req.id.startsWith('CP-202');
    return {
      id: req.id,
      type: 'EXACT_REQUEST',
      title: `Citizen Request ${req.request_id || req.id}`,
      subtitle: req.summary_en || req.original_text,
      category: CATEGORY_DISPLAY_NAMES[req.category] || req.category,
      location: req.location,
      provenanceLabel: isLive ? 'CivicPulse Signals' : 'Illustrative Demo Data',
      provenanceBadgeColor: isLive ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-stone-200 text-stone-700 border-stone-300',
      statusBadge: req.status || 'Received',
      priorityLabel: `Severity: ${req.severity || 5}/10`,
      dateOrTimeline: req.timestamp ? new Date(req.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently submitted',
      actionHint: 'Click to open Request Details',
      score: 100,
      rawItem: req,
    };
  }

  // 2. Recommendations
  const recs = data.recommendations || [];
  const rec = recs.find(r => r.id.toLowerCase() === qId);
  if (rec) {
    return {
      id: rec.id,
      type: 'RECOMMENDATION',
      title: `Recommendation: ${rec.title}`,
      subtitle: `${rec.interventionType} · Priority Score: ${rec.priorityScore.toFixed(1)}/100 · Budget: ₹${(rec.estimatedBudgetInr / 10000000).toFixed(1)} Cr`,
      category: CATEGORY_DISPLAY_NAMES[rec.category] || rec.category,
      location: `${rec.districtName}, ${rec.state}`,
      provenanceLabel: 'CivicPulse Signals',
      provenanceBadgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      priorityLabel: `Score ${rec.priorityScore.toFixed(1)}`,
      reportCount: `${rec.citizenRequestsCount} verified demand signals`,
      peopleAffected: `${(rec.targetBeneficiaries / 1000).toFixed(0)}k Beneficiaries`,
      actionHint: 'Click to inspect Priority Recommendation',
      score: 100,
      rawItem: rec,
    };
  }

  // 3. Community issues
  const issues = data.communityIssues || INITIAL_COMMUNITY_ISSUES;
  const issue = issues.find(i => i.id.toLowerCase() === qId || (i.rank && i.rank.toLowerCase() === qId));
  if (issue) {
    return {
      id: issue.id,
      type: 'COMMUNITY_ISSUE',
      title: `Community Issue: ${issue.title}`,
      subtitle: `${issue.infrastructureName} (${issue.relatedScheme})`,
      category: CATEGORY_DISPLAY_NAMES[issue.category] || issue.category,
      location: issue.location,
      provenanceLabel: 'CivicPulse Signals',
      provenanceBadgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      priorityLabel: `${issue.severity} Priority`,
      reportCount: `${issue.requestCount || 0} citizen reports`,
      peopleAffected: `${issue.affectedCommunities} communities`,
      actionHint: 'Click to view Community Issue',
      score: 100,
      rawItem: issue,
    };
  }

  // 4. Government projects
  const projs = data.governmentProjects || [];
  const proj = projs.find(p => p.id.toLowerCase() === qId);
  if (proj) {
    return {
      id: proj.id,
      type: 'ACTION_PROJECT',
      title: `Public Project ${proj.id}: ${proj.title}`,
      subtitle: proj.description,
      category: CATEGORY_DISPLAY_NAMES[proj.category] || proj.category,
      location: `${proj.district}, ${proj.state || 'India'}`,
      provenanceLabel: 'CivicPulse Signals',
      provenanceBadgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      statusBadge: proj.status,
      priorityLabel: `Priority Score: ${proj.priorityScore}/100`,
      reportCount: `${proj.citizenRequestsCount} citizen reports`,
      peopleAffected: `${(proj.population || 0).toLocaleString()} people`,
      actionHint: 'Click to view in Action Queue',
      score: 100,
      rawItem: proj,
    };
  }

  return null;
}

/**
 * Calls server-side Gemini grounded search summarization API (/api/search/summary)
 */
export async function fetchSearchSummary(
  query: string,
  results: HumanSearchResults
): Promise<string | null> {
  try {
    const summaryData = {
      exactMatch: results.exactMatch ? {
        id: results.exactMatch.id,
        title: results.exactMatch.title,
        category: results.exactMatch.category,
        location: results.exactMatch.location,
      } : null,
      recommendations: (results.recommendations || []).slice(0, 3).map(r => ({
        title: r.title,
        location: r.location,
        priority: r.priorityLabel,
        reportCount: r.reportCount,
      })),
      hotspots: results.priorityHotspots.slice(0, 3).map(h => ({
        title: h.title,
        location: h.location,
        priority: h.priorityLabel,
        reportCount: h.reportCount,
      })),
      issues: results.communityIssues.slice(0, 3).map(i => ({
        title: i.title,
        location: i.location,
        priority: i.priorityLabel,
        reportCount: i.reportCount,
      })),
      totalCount: results.totalResultsCount,
    };

    const res = await fetch('/api/search/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        results: summaryData,
        ...summaryData,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.summary || null;
    }
  } catch (err) {
    console.warn('[Search] Failed to fetch server search summary:', err);
  }
  return null;
}

