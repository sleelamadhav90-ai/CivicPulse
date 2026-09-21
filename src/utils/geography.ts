import { District, CitizenRequest, CountryCode } from '../types';
import { DISTRICTS_REGISTRY, COUNTRY_DISTRICTS_REGISTRY } from '../data/districts';
import { matchCitizenRequestIntent } from '../services/humanSearchService';
import { getDistrictCoverageTier } from './provenance';

export interface StateDistrictHierarchy {
  state: string;
  isUT?: boolean;
  districts: {
    name: string;
    id?: string;
    cities: string[];
  }[];
}

// 1. Comprehensive, authoritative Indian States & Union Territories
export const INDIA_STATES_AND_UTS: { name: string; isUT: boolean }[] = [
  { name: 'Andhra Pradesh', isUT: false },
  { name: 'Arunachal Pradesh', isUT: false },
  { name: 'Assam', isUT: false },
  { name: 'Bihar', isUT: false },
  { name: 'Chhattisgarh', isUT: false },
  { name: 'Goa', isUT: false },
  { name: 'Gujarat', isUT: false },
  { name: 'Haryana', isUT: false },
  { name: 'Himachal Pradesh', isUT: false },
  { name: 'Jharkhand', isUT: false },
  { name: 'Karnataka', isUT: false },
  { name: 'Kerala', isUT: false },
  { name: 'Madhya Pradesh', isUT: false },
  { name: 'Maharashtra', isUT: false },
  { name: 'Manipur', isUT: false },
  { name: 'Meghalaya', isUT: false },
  { name: 'Mizoram', isUT: false },
  { name: 'Nagaland', isUT: false },
  { name: 'Odisha', isUT: false },
  { name: 'Punjab', isUT: false },
  { name: 'Rajasthan', isUT: false },
  { name: 'Sikkim', isUT: false },
  { name: 'Tamil Nadu', isUT: false },
  { name: 'Telangana', isUT: false },
  { name: 'Tripura', isUT: false },
  { name: 'Uttar Pradesh', isUT: false },
  { name: 'Uttarakhand', isUT: false },
  { name: 'West Bengal', isUT: false },
  // Union Territories
  { name: 'Andaman and Nicobar Islands', isUT: true },
  { name: 'Chandigarh', isUT: true },
  { name: 'Dadra and Nagar Haveli and Daman and Diu', isUT: true },
  { name: 'Delhi', isUT: true },
  { name: 'Jammu and Kashmir', isUT: true },
  { name: 'Ladakh', isUT: true },
  { name: 'Lakshadweep', isUT: true },
  { name: 'Puducherry', isUT: true },
];

// 2. Strict district catalogue per state in India
export const STATE_DISTRICT_MAP: Record<string, { name: string; id?: string; defaultCities?: string[] }[]> = {
  'Andhra Pradesh': [
    { name: 'Alluri Sitharama Raju', defaultCities: ['Paderu', 'Rampachodavaram'] },
    { name: 'Anakapalli', defaultCities: ['Anakapalli', 'Chodavaram'] },
    { name: 'Ananthapuramu', id: 'anantapur', defaultCities: ['Ananthapuramu', 'Dharmavaram', 'Guntakal', 'Tadipatri'] },
    { name: 'Annamayya', defaultCities: ['Rayachoti', 'Madanapalle'] },
    { name: 'Bapatla', defaultCities: ['Bapatla', 'Chirala', 'Repalle'] },
    { name: 'Chittoor', defaultCities: ['Chittoor', 'Punganur', 'Nagari'] },
    { name: 'Dr. B. R. Ambedkar Konaseema', defaultCities: ['Amalapuram', 'Razole'] },
    { name: 'East Godavari', defaultCities: ['Rajahmundry', 'Kovvur'] },
    { name: 'Eluru', defaultCities: ['Eluru', 'Jangareddygudem'] },
    { name: 'Guntur', id: 'guntur', defaultCities: ['Guntur', 'Tenali', 'Narasaraopet', 'Mangalagiri', 'Tadepalli'] },
    { name: 'Kakinada', defaultCities: ['Kakinada', 'Pithapuram', 'Samalkot'] },
    { name: 'Krishna', id: 'krishna', defaultCities: ['Machilipatnam', 'Gudivada', 'Vuyyuru'] },
    { name: 'Kurnool', id: 'kurnool', defaultCities: ['Kurnool', 'Adoni', 'Yemmiganur', 'Pattikonda'] },
    { name: 'Nandyal', defaultCities: ['Nandyal', 'Allagadda', 'Dhone'] },
    { name: 'NTR', defaultCities: ['Vijayawada Urban', 'Nandigama', 'Jaggayyapeta'] },
    { name: 'Palnadu', defaultCities: ['Narasaraopet', 'Sattenapalle', 'Vinukonda'] },
    { name: 'Parvathipuram Manyam', defaultCities: ['Parvathipuram', 'Salur'] },
    { name: 'Prakasam', id: 'prakasam', defaultCities: ['Ongole', 'Markapur', 'Kandukur', 'Giddalur'] },
    { name: 'SPSR Nellore', defaultCities: ['Nellore', 'Kavali', 'Gudur'] },
    { name: 'Sri Sathya Sai', defaultCities: ['Puttaparthi', 'Kadiri', 'Hindupur'] },
    { name: 'Srikakulam', defaultCities: ['Srikakulam', 'Amadalavalasa', 'Palasa'] },
    { name: 'Tirupati', defaultCities: ['Tirupati', 'Srikalahasti', 'Venkatagiri'] },
    { name: 'Vijayawada', id: 'vijayawada', defaultCities: ['Gunadala', 'Ramavarappadu', 'Benz Circle', 'Governorpet', 'Poranki'] },
    { name: 'Visakhapatnam', id: 'visakhapatnam', defaultCities: ['Visakhapatnam', 'Gajuwaka', 'Anandapuram', 'Bheemunipatnam'] },
    { name: 'Vizianagaram', defaultCities: ['Vizianagaram', 'Bobbili', 'Cheepurupalli'] },
    { name: 'West Godavari', defaultCities: ['Bhimavaram', 'Tadepalligudem', 'Tanuku', 'Palakollu'] },
    { name: 'YSR Kadapa', defaultCities: ['Kadapa', 'Proddatur', 'Pulivendula', 'Jammalamadugu'] }
  ],
  'Telangana': [
    { name: 'Hyderabad', id: 'hyderabad', defaultCities: ['Hyderabad', 'Kukatpally', 'Secunderabad', 'Charminar', 'Gachibowli'] },
    { name: 'Warangal', id: 'warangal', defaultCities: ['Warangal', 'Hanamkonda', 'Kazipet', 'Parkal'] },
    { name: 'Nalgonda', id: 'nalgonda', defaultCities: ['Nalgonda', 'Miryalaguda', 'Devarakonda', 'Suryapet'] },
    { name: 'Mahbubnagar', id: 'mahbubnagar', defaultCities: ['Mahbubnagar', 'Jadcherla', 'Badepally', 'Narayanpet'] },
    { name: 'Nizamabad', id: 'nizamabad', defaultCities: ['Nizamabad', 'Bodhan', 'Armoor', 'Banswada'] },
    { name: 'Karimnagar', defaultCities: ['Karimnagar', 'Huzurabad', 'Jammikunta'] },
    { name: 'Khammam', defaultCities: ['Khammam', 'Kothagudem', 'Palwancha'] }
  ],
  'Maharashtra': [
    { name: 'Mumbai', id: 'mumbai', defaultCities: ['Mumbai City', 'Kurla West', 'Andheri', 'Bandra', 'Dadar'] },
    { name: 'Pune', id: 'pune', defaultCities: ['Pune', 'Hadapsar', 'Magarpatta', 'Pimpri-Chinchwad', 'Kothrud'] },
    { name: 'Nashik', id: 'nashik', defaultCities: ['Nashik', 'Sinnar', 'Dindori', 'Malegaon', 'Niphad'] },
    { name: 'Solapur', id: 'solapur', defaultCities: ['Solapur', 'Mohol', 'Pandharpur', 'Barshi', 'Akkalkot'] },
    { name: 'Latur', id: 'latur', defaultCities: ['Latur', 'Ausa', 'Nilanga', 'Udgir', 'Ahmedpur'] },
    { name: 'Nagpur', defaultCities: ['Nagpur', 'Kamptee', 'Umred', 'Katol'] },
    { name: 'Thane', defaultCities: ['Thane', 'Kalyan', 'Dombivli', 'Ulhasnagar'] }
  ],
  'Karnataka': [
    { name: 'Bengaluru', id: 'bengaluru', defaultCities: ['Bengaluru Urban', 'Whitefield', 'Peenya', 'Indiranagar', 'Koramangala'] },
    { name: 'Mysuru', id: 'mysuru', defaultCities: ['Mysuru', 'Hunsur', 'Nanjangud', 'T. Narasipura'] },
    { name: 'Raichur', id: 'raichur', defaultCities: ['Raichur', 'Manvi', 'Sindhanur', 'Devadurga'] },
    { name: 'Belagavi', id: 'belagavi', defaultCities: ['Belagavi', 'Chikkodi', 'Nipani', 'Gokak', 'Bailhongal'] },
    { name: 'Dharwad', defaultCities: ['Hubballi', 'Dharwad', 'Navalgund', 'Kalghatgi'] }
  ],
  'Tamil Nadu': [
    { name: 'Chennai', id: 'chennai', defaultCities: ['Chennai', 'Velachery', 'Guindy', 'T. Nagar', 'Anna Nagar'] },
    { name: 'Madurai', id: 'madurai', defaultCities: ['Madurai', 'Melur', 'Thirumangalam', 'Usilampatti'] },
    { name: 'Tirunelveli', id: 'tirunelveli', defaultCities: ['Tirunelveli', 'Palayamkottai', 'Ambasamudram', 'Tenkasi'] },
    { name: 'Ramanathapuram', id: 'ramanathapuram', defaultCities: ['Ramanathapuram', 'Paramakudi', 'Rameswaram', 'Mudukulathur'] },
    { name: 'Coimbatore', defaultCities: ['Coimbatore', 'Pollachi', 'Mettupalayam'] }
  ],
  'Bihar': [
    { name: 'Patna', id: 'patna', defaultCities: ['Patna', 'Danapur', 'Khagaul', 'Phulwari Sharif', 'Patna City'] },
    { name: 'Gaya', id: 'gaya', defaultCities: ['Gaya', 'Wazirganj', 'Bodh Gaya', 'Sherghati', 'Tekari'] },
    { name: 'Muzaffarpur', id: 'muzaffarpur', defaultCities: ['Muzaffarpur', 'Kanti', 'Motipur', 'Marwan', 'Sakra'] },
    { name: 'Purnia', id: 'purnia', defaultCities: ['Purnia', 'Banmankhi', 'Kasba', 'Dhamdaha', 'Baisi'] },
    { name: 'Madhubani', id: 'madhubani', defaultCities: ['Madhubani', 'Jhanjharpur', 'Benipatti', 'Rajnagar'] },
    { name: 'Bhagalpur', defaultCities: ['Bhagalpur', 'Naugachia', 'Kahalgaon'] }
  ],
  'Uttar Pradesh': [
    { name: 'Lucknow', id: 'lucknow', defaultCities: ['Lucknow', 'Hazratganj', 'Alambagh', 'Gomti Nagar', 'Chinhat'] },
    { name: 'Varanasi', id: 'varanasi', defaultCities: ['Varanasi', 'Kashi', 'Shivpur', 'Ramnagar', 'Pindra'] },
    { name: 'Kanpur Dehat', id: 'kanpur-dehat', defaultCities: ['Akbarpur', 'Rura', 'Derapur', 'Rasulabad', 'Bhognipur'] },
    { name: 'Sitapur', id: 'sitapur', defaultCities: ['Sitapur', 'Biswan', 'Laharpur', 'Mahmoodabad', 'Sidhauli'] },
    { name: 'Hardoi', id: 'hardoi', defaultCities: ['Hardoi', 'Sandila', 'Shahabad', 'Bilgram', 'Sandi'] },
    { name: 'Bahraich', id: 'bahraich', defaultCities: ['Bahraich', 'Nanpara', 'Mahasi', 'Payagpur', 'Kaiserganj'] },
    { name: 'Bareilly', id: 'bareilly', defaultCities: ['Bareilly', 'Nawabganj', 'Aonla', 'Faridpur', 'Baheri'] },
    { name: 'Prayagraj', defaultCities: ['Prayagraj', 'Naini', 'Phulpur', 'Koraon'] }
  ],
  'Rajasthan': [
    { name: 'Jaipur', id: 'jaipur', defaultCities: ['Jaipur', 'Sanganer', 'Amber', 'Chomu', 'Mansarovar'] },
    { name: 'Jodhpur', id: 'jodhpur', defaultCities: ['Jodhpur', 'Osian', 'Mandore', 'Pipar City', 'Phalodi', 'Bilara'] },
    { name: 'Barmer', id: 'barmer', defaultCities: ['Barmer', 'Balotra', 'Baytu', 'Siwana', 'Gudamalani'] },
    { name: 'Bikaner', id: 'bikaner', defaultCities: ['Bikaner', 'Nokha', 'Lunkaransar', 'Kolayat', 'Dungargarh'] },
    { name: 'Udaipur', defaultCities: ['Udaipur', 'Mavli', 'Vallabhnagar', 'Salumber'] }
  ],
  'West Bengal': [
    { name: 'Kolkata', id: 'kolkata', defaultCities: ['Kolkata', 'Salt Lake', 'Howrah Bridge', 'Alipore', 'Jadavpur'] },
    { name: 'Murshidabad', id: 'murshidabad', defaultCities: ['Murshidabad', 'Berhampore', 'Domkal', 'Lalgola', 'Jangipur'] },
    { name: 'South 24 Parganas', id: 'south-24-parganas', defaultCities: ['Canning', 'Diamond Harbour', 'Kakdwip', 'Baruipur', 'Sonarpur'] },
    { name: 'North 24 Parganas', defaultCities: ['Barasat', 'Barrackpore', 'Basirhat', 'Bongaon'] }
  ],
  'Odisha': [
    { name: 'Bhubaneswar', id: 'bhubaneswar', defaultCities: ['Bhubaneswar', 'Khurda', 'Jatni', 'Balipatna'] },
    { name: 'Kalahandi', id: 'kalahandi', defaultCities: ['Bhawanipatna', 'Kesinga', 'Dharamgarh', 'Junagarh'] },
    { name: 'Mayurbhanj', id: 'mayurbhanj', defaultCities: ['Baripada', 'Rairangpur', 'Karanjia', 'Udala'] },
    { name: 'Nabarangpur', id: 'nabarangpur', defaultCities: ['Nabarangpur', 'Umerkote', 'Raighar', 'Jharigam'] },
    { name: 'Cuttack', defaultCities: ['Cuttack', 'Choudwar', 'Banki', 'Athagarh'] }
  ],
  'Assam': [
    { name: 'Guwahati', id: 'guwahati', defaultCities: ['Guwahati', 'Dispur', 'Kamrup', 'North Guwahati'] },
    { name: 'Dhubri', id: 'dhubri', defaultCities: ['Dhubri', 'Bilasipara', 'Gauripur', 'Golakganj'] },
    { name: 'Nagaon', id: 'nagaon', defaultCities: ['Nagaon', 'Kaliabor', 'Raha', 'Samaguri'] },
    { name: 'Dibrugarh', defaultCities: ['Dibrugarh', 'Chabua', 'Naharkatia', 'Moran'] }
  ],
  'Madhya Pradesh': [
    { name: 'Bhopal', id: 'bhopal', defaultCities: ['Bhopal', 'Berasia', 'Kolar', 'Govindpura'] },
    { name: 'Tikamgarh', id: 'tikamgarh', defaultCities: ['Tikamgarh', 'Jatara', 'Baldeogarh', 'Palera'] },
    { name: 'Indore', defaultCities: ['Indore', 'Mhow', 'Sanwer', 'Depalpur'] },
    { name: 'Jabalpur', defaultCities: ['Jabalpur', 'Sihora', 'Patan', 'Panagar'] }
  ],
  'Jharkhand': [
    { name: 'Ranchi', id: 'ranchi', defaultCities: ['Ranchi', 'Hatia', 'Kanke', 'Namkum'] },
    { name: 'Palamu', id: 'palamu', defaultCities: ['Daltonganj', 'Medininagar', 'Chhatarpur', 'Hussainabad'] },
    { name: 'Pakur', id: 'pakur', defaultCities: ['Pakur', 'Maheshpur', 'Pakuria', 'Hiranpur'] },
    { name: 'Jamshedpur', defaultCities: ['Jamshedpur', 'Jugsalai', 'Mango', 'Ghatshila'] }
  ],
  'Chhattisgarh': [
    { name: 'Raipur', defaultCities: ['Raipur', 'Arang', 'Abhanpur', 'Tilda'] },
    { name: 'Bastar', id: 'bastar', defaultCities: ['Jagdalpur', 'Tokapal', 'Bastanar', 'Lohandiguda'] },
    { name: 'Bilaspur', defaultCities: ['Bilaspur', 'Kota', 'Takhatpur', 'Masturi'] }
  ],
  'Gujarat': [
    { name: 'Ahmedabad', id: 'ahmedabad', defaultCities: ['Ahmedabad', 'Sanand', 'Dholka', 'Bavla', 'Viramgam'] },
    { name: 'Surat', defaultCities: ['Surat', 'Bardoli', 'Olpad', 'Kamrej'] },
    { name: 'Vadodara', defaultCities: ['Vadodara', 'Padra', 'Savli', 'Waghodia'] }
  ],
  'Kerala': [
    { name: 'Kochi', id: 'kochi', defaultCities: ['Kochi', 'Ernakulam', 'Aluva', 'Paravur', 'Tripunithura'] },
    { name: 'Thiruvananthapuram', defaultCities: ['Thiruvananthapuram', 'Neyyattinkara', 'Nedumangad', 'Attingal'] },
    { name: 'Kozhikode', defaultCities: ['Kozhikode', 'Vadakara', 'Koyilandy', 'Thamarassery'] }
  ],
  'Punjab': [
    { name: 'Ludhiana', defaultCities: ['Ludhiana', 'Khanna', 'Jagraon', 'Samrala'] },
    { name: 'Amritsar', defaultCities: ['Amritsar', 'Majitha', 'Ajnala', 'Attari'] }
  ],
  'Haryana': [
    { name: 'Gurugram', defaultCities: ['Gurugram', 'Manesar', 'Sohna', 'Pataudi'] },
    { name: 'Faridabad', defaultCities: ['Faridabad', 'Ballabgarh', 'NIT Faridabad'] }
  ],
  'Delhi': [
    { name: 'Delhi', id: 'delhi', defaultCities: ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Dwarka'] }
  ],
  'Jammu and Kashmir': [
    { name: 'Srinagar', id: 'srinagar', defaultCities: ['Srinagar', 'Downtown', 'Lal Chowk', 'Batamaloo'] },
    { name: 'Jammu', defaultCities: ['Jammu City', 'R.S. Pura', 'Akhnoor', 'Bishnah'] }
  ],
  'Chandigarh': [
    { name: 'Chandigarh', id: 'chandigarh', defaultCities: ['Sector 17', 'Sector 35', 'Manimajra', 'Industrial Area'] }
  ]
};

/**
 * Returns strictly valid States and UTs for the selected country
 */
export function getAvailableStates(countryCode: CountryCode | string = 'IN', districtsCatalog: District[] = DISTRICTS_REGISTRY): string[] {
  // If districtsCatalog is provided and has items, extract states directly from available data
  if (districtsCatalog && districtsCatalog.length > 0) {
    const statesSet = new Set<string>();
    districtsCatalog.forEach(d => {
      if (d.state && d.state.trim().length > 0) {
        statesSet.add(d.state.trim());
      }
    });
    if (statesSet.size > 0) {
      return Array.from(statesSet).sort((a, b) => a.localeCompare(b));
    }
  }

  if (countryCode === 'IN') {
    // Return all Indian states and UTs in alphabetical order
    return INDIA_STATES_AND_UTS.map(s => s.name).sort();
  }

  // For other countries (BR, ZA, RU, CN), extract unique states/provinces from their district registry
  const countryList = COUNTRY_DISTRICTS_REGISTRY[countryCode as CountryCode] || districtsCatalog;
  const statesSet = new Set<string>();
  countryList.forEach(d => {
    if (d.state) statesSet.add(d.state);
  });
  return Array.from(statesSet).sort();
}

/**
 * Returns strictly valid Districts belonging to the given state
 */
export function getDistrictsForState(
  stateName: string, 
  countryCode: CountryCode | string = 'IN',
  districtsCatalog: District[] = DISTRICTS_REGISTRY
): { name: string; id: string; state: string }[] {
  const catalog = (districtsCatalog && districtsCatalog.length > 0)
    ? districtsCatalog
    : (countryCode === 'IN' ? DISTRICTS_REGISTRY : (COUNTRY_DISTRICTS_REGISTRY[countryCode as CountryCode] || []));

  if (!stateName || stateName === 'ALL' || stateName === 'All States' || stateName === 'All') {
    // Return all registered districts for this catalog
    return catalog.map(d => ({
      name: d.name,
      id: d.id,
      state: d.state || 'India'
    })).sort((a, b) => a.name.localeCompare(b.name));
  }

  // Normalize state name for flexible matching
  const normalizedState = stateName.toLowerCase().trim();

  // 1. Direct catalog filtering (ensures 100% data coherence with loaded application state)
  const matched = catalog.filter(d => {
    if (!d.state) return false;
    const s = d.state.toLowerCase().trim();
    return s === normalizedState || s.startsWith(normalizedState) || normalizedState.startsWith(s);
  });

  if (matched.length > 0) {
    return matched.map(d => ({
      name: d.name,
      id: d.id,
      state: d.state || stateName
    })).sort((a, b) => a.name.localeCompare(b.name));
  }

  // 2. Secondary lookup via STATE_DISTRICT_MAP for India
  if (countryCode === 'IN' && STATE_DISTRICT_MAP[stateName]) {
    const list = STATE_DISTRICT_MAP[stateName];
    return list.map(item => {
      const reg = catalog.find(d => 
        (item.id && d.id.toLowerCase() === item.id.toLowerCase()) || 
        d.name.toLowerCase() === item.name.toLowerCase()
      );
      return {
        name: item.name,
        id: reg ? reg.id : (item.id || item.name.toLowerCase().replace(/[^a-z0-9]/g, '-')),
        state: stateName
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }

  return [];
}

/**
 * Returns strictly valid Cities/Towns/Localities for a given District
 */
export function getLocalitiesForDistrict(
  districtName: string,
  stateName?: string,
  requests: CitizenRequest[] = []
): string[] {
  if (!districtName || districtName === 'ALL' || districtName === 'All Districts' || districtName === 'All') {
    return [];
  }

  const citiesSet = new Set<string>();

  // 1. Check if default cities are registered in STATE_DISTRICT_MAP
  if (stateName && STATE_DISTRICT_MAP[stateName]) {
    const distEntry = STATE_DISTRICT_MAP[stateName].find(d => 
      d.name.toLowerCase() === districtName.toLowerCase() || 
      (d.id && d.id.toLowerCase() === districtName.toLowerCase())
    );
    if (distEntry && distEntry.defaultCities) {
      distEntry.defaultCities.forEach(c => citiesSet.add(c));
    }
  } else {
    // Search across all states for this district name
    for (const sName in STATE_DISTRICT_MAP) {
      const distEntry = STATE_DISTRICT_MAP[sName].find(d => 
        d.name.toLowerCase() === districtName.toLowerCase() || 
        (d.id && d.id.toLowerCase() === districtName.toLowerCase())
      );
      if (distEntry && distEntry.defaultCities) {
        distEntry.defaultCities.forEach(c => citiesSet.add(c));
      }
    }
  }

  // 2. Ingest localities from the real Citizen Requests dataset
  requests.forEach(r => {
    const rDist = (r.district || '').toLowerCase();
    const rLoc = (r.location || '').toLowerCase();
    const targetDist = districtName.toLowerCase();

    if (rDist === targetDist || rLoc.includes(targetDist)) {
      if (r.locality && r.locality.trim().length > 0) {
        citiesSet.add(r.locality.trim());
      }
    }
  });

  return Array.from(citiesSet).sort();
}

/**
 * Robust, consistent filtering of citizen requests by cascading geography, category, and language
 */
export function filterCitizenRequests(
  requests: CitizenRequest[],
  options: {
    state?: string;
    district?: string;
    locality?: string;
    category?: string;
    language?: string;
    timeFilter?: string;
    searchQuery?: string;
  }
): CitizenRequest[] {
  const {
    state = 'ALL',
    district = 'ALL',
    locality = 'ALL',
    category = 'ALL',
    language = 'ALL',
    searchQuery = '',
  } = options;

  const isAll = (val?: string) => !val || val === 'ALL' || val === 'All' || val.startsWith('All ');

  return requests.filter(req => {
    // 1. State check
    if (!isAll(state)) {
      const reqState = req.state || '';
      const reqLoc = req.location || '';
      const matchesState = 
        reqState.toLowerCase() === state.toLowerCase() ||
        reqLoc.toLowerCase().includes(state.toLowerCase());
      if (!matchesState) return false;
    }

    // 2. District check
    if (!isAll(district)) {
      const reqDist = req.district || '';
      const reqLoc = req.location || '';
      const matchesDistrict = 
        reqDist.toLowerCase() === district.toLowerCase() ||
        reqLoc.toLowerCase().includes(district.toLowerCase());
      if (!matchesDistrict) return false;
    }

    // 3. Locality / City check
    if (!isAll(locality)) {
      const reqLocality = req.locality || '';
      const reqLoc = req.location || '';
      const matchesLocality = 
        reqLocality.toLowerCase() === locality.toLowerCase() ||
        reqLoc.toLowerCase().includes(locality.toLowerCase());
      if (!matchesLocality) return false;
    }

    // 4. Category check
    if (!isAll(category)) {
      if (req.category !== category) return false;
    }

    // 5. Language check
    if (!isAll(language)) {
      if (req.language !== language) return false;
    }

    // 6. Human-First Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const directMatch = 
        (req.summary_en && req.summary_en.toLowerCase().includes(q)) ||
        (req.original_text && req.original_text.toLowerCase().includes(q)) ||
        (req.location && req.location.toLowerCase().includes(q)) ||
        (req.id && req.id.toLowerCase().includes(q)) ||
        (req.request_id && req.request_id.toLowerCase().includes(q)) ||
        (req.district && req.district.toLowerCase().includes(q)) ||
        (req.locality && req.locality.toLowerCase().includes(q));

      if (!directMatch && !matchCitizenRequestIntent(req, searchQuery)) {
        return false;
      }
    }

    return true;
  });
}

export interface CoverageStatistics {
  totalDistricts: number;
  totalStatesAndUTs: number; // 36
  representedStatesAndUTs: number;
  missingStatesAndUTs: string[];
  deepBaselineCount: number; // Tier 1
  expandedBaselineCount: number; // Tier 2
  regionalCoverageCount: number; // Tier 3
  statesCount: number; // count of states represented out of 28
  utsCount: number; // count of UTs represented out of 8
  coveragePercentage: number;
}

/**
  * Calculates dynamic geographic coverage metrics directly from the source-of-truth registry.
  */
export function getCoverageStatistics(districtsCatalog: District[] = DISTRICTS_REGISTRY): CoverageStatistics {
  const totalDistricts = districtsCatalog.length;
  const totalStatesAndUTs = INDIA_STATES_AND_UTS.length; // 36

  const normalizeStateName = (str: string) =>
    (str || '')
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/\(ncr\)/g, '')
      .replace(/[^a-z0-9]/g, '');

  const registeredStateSet = new Set<string>();
  districtsCatalog.forEach(d => {
    if (d.state) {
      registeredStateSet.add(normalizeStateName(d.state));
    }
  });

  const missingStatesAndUTs: string[] = [];
  let statesCount = 0;
  let utsCount = 0;

  INDIA_STATES_AND_UTS.forEach(s => {
    const norm = normalizeStateName(s.name);
    const isPresent = Array.from(registeredStateSet).some(reg => reg.includes(norm) || norm.includes(reg));
    if (isPresent) {
      if (s.isUT) utsCount++;
      else statesCount++;
    } else {
      missingStatesAndUTs.push(s.name);
    }
  });

  const representedStatesAndUTs = statesCount + utsCount;

  let deepBaselineCount = 0;
  let expandedBaselineCount = 0;
  let regionalCoverageCount = 0;

  districtsCatalog.forEach(d => {
    const tier = getDistrictCoverageTier(d.id || d.name);
    if (tier === 'deep-baseline') deepBaselineCount++;
    else if (tier === 'expanded-baseline') expandedBaselineCount++;
    else regionalCoverageCount++;
  });

  const coveragePercentage = Math.round((representedStatesAndUTs / totalStatesAndUTs) * 100);

  return {
    totalDistricts,
    totalStatesAndUTs,
    representedStatesAndUTs,
    missingStatesAndUTs,
    deepBaselineCount,
    expandedBaselineCount,
    regionalCoverageCount,
    statesCount,
    utsCount,
    coveragePercentage,
  };
}
