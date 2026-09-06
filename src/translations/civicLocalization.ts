import { SupportedLanguageCode } from './languages';
import { 
  RecommendedProject, 
  GovernmentProject, 
  CitizenRequest, 
  InfrastructureCategory, 
  InterventionType 
} from '../types';

// Localized district names
export const DISTRICT_NAMES: Record<string, Record<SupportedLanguageCode, string>> = {
  'Vijayawada': {
    en: 'Vijayawada',
    ta: 'விஜயவாடா',
    hi: 'विजयवाड़ा',
    te: 'విజయవాడ',
    kn: 'ವಿಜಯವಾಡ',
    mr: 'विजयवाडा',
    bn: 'বিজয়ওয়াড়া',
    or: 'ବିଜୟୱାଡ଼ା'
  },
  'Guntur': {
    en: 'Guntur',
    ta: 'குண்டூர்',
    hi: 'गुंटूर',
    te: 'గుంటూరు',
    kn: 'ಗುಂಟೂರು',
    mr: 'गुंटूर',
    bn: 'গুন্টুর',
    or: 'ଗୁଣ୍ଟୁର'
  },
  'Kurnool': {
    en: 'Kurnool',
    ta: 'கர்நூல்',
    hi: 'कर्नूल',
    te: 'కర్నూలు',
    kn: 'ಕರ್ನೂಲ್',
    mr: 'कुर्नूल',
    bn: 'কুর্নুল',
    or: 'କୁର୍ଣ୍ଣୁଲ'
  },
  'Krishna': {
    en: 'Krishna',
    ta: 'கிருஷ்ணா',
    hi: 'कृष्णा',
    te: 'కృష్ణా',
    kn: 'ಕೃಷ್ಣಾ',
    mr: 'कृष्णा',
    bn: 'কৃষ্ণা',
    or: 'କୃଷ୍ଣା'
  },
  'Nagpur': {
    en: 'Nagpur',
    ta: 'நாக்பூர்',
    hi: 'नागपुर',
    te: 'నాగ్‌పూర్',
    kn: 'ನಾಗಪುರ',
    mr: 'नागपूर',
    bn: 'নাগপুর',
    or: 'ନାଗପୁର'
  },
  'Nashik': {
    en: 'Nashik',
    ta: 'நாசிக்',
    hi: 'नासिक',
    te: 'నాసిక్',
    kn: 'ನಾಸಿಕ್',
    mr: 'नाशिक',
    bn: 'নাসিক',
    or: 'ନାସିକ'
  },
  'Solapur': {
    en: 'Solapur',
    ta: 'சோலாப்பூர்',
    hi: 'सोलापुर',
    te: 'సోలాపూర్',
    kn: 'ಸೋಲಾಪುರ',
    mr: 'सोलापूर',
    bn: 'সোলাপুর',
    or: 'ସୋଲାପୁର'
  },
  'Nanded': {
    en: 'Nanded',
    ta: 'நாந்தேட்',
    hi: 'नांदेड़',
    te: 'నాందేడ్',
    kn: 'ನಾಂದೇಡ್',
    mr: 'नांदेड',
    bn: 'নান্দেড়',
    or: 'ନାନ୍ଦେଡ଼'
  },
  'Patna': {
    en: 'Patna',
    ta: 'பாட்னா',
    hi: 'पटना',
    te: 'పాట్నా',
    kn: 'ಪಾಟ್ನಾ',
    mr: 'पाटणा',
    bn: 'পাটনা',
    or: 'ପାଟନା'
  },
  'Gaya': {
    en: 'Gaya',
    ta: 'கயா',
    hi: 'गया',
    te: 'గయా',
    kn: 'ಗಯಾ',
    mr: 'गया',
    bn: 'গয়া',
    or: 'ଗୟା'
  },
  'Jodhpur': {
    en: 'Jodhpur',
    ta: 'ஜோத்பூர்',
    hi: 'जोधपुर',
    te: 'జోధ్‌పూర్',
    kn: 'ಜೋಧ್‌ಪುರ',
    mr: 'जोधपूर',
    bn: 'যোধপুর',
    or: 'ଯୋଧପୁର'
  },
  'Barmer': {
    en: 'Barmer',
    ta: 'பார்மர்',
    hi: 'बाड़मेर',
    te: 'బార్మర్',
    kn: 'ಬಾರ್ಮರ್',
    mr: 'बाडमेर',
    bn: 'বারমের',
    or: 'ବାଡ଼ମେର'
  },
  'Latur': {
    en: 'Latur',
    ta: 'லாத்தூர்',
    hi: 'लातूर',
    te: 'లాతూర్',
    kn: 'ಲಾತೂರ್',
    mr: 'लातूर',
    bn: 'লাতুর',
    or: 'ଲାତୁର'
  },
  'Mysuru': {
    en: 'Mysuru',
    ta: 'மைசூர்',
    hi: 'मैसूरु',
    te: 'మైసూరు',
    kn: 'ಮೈಸೂರು',
    mr: 'म्हैसूर',
    bn: 'মহীশূর',
    or: 'ମହୀଶୂର'
  }
};

// Localized state names
export const STATE_NAMES: Record<string, Record<SupportedLanguageCode, string>> = {
  'Andhra Pradesh': {
    en: 'Andhra Pradesh',
    ta: 'ஆந்திரப் பிரதேசம்',
    hi: 'आंध्र प्रदेश',
    te: 'ఆంధ్ర ప్రదేశ్',
    kn: 'ಆಂಧ್ರ ಪ್ರದೇಶ',
    mr: 'आंध्र प्रदेश',
    bn: 'অন্ধ্রপ্রদেশ',
    or: 'ଆନ୍ଧ୍ର ପ୍ରଦେଶ'
  },
  'Maharashtra': {
    en: 'Maharashtra',
    ta: 'மகாராஷ்டிரா',
    hi: 'महाराष्ट्र',
    te: 'మహారాష్ట్ర',
    kn: 'ಮಹಾರಾಷ್ಟ್ರ',
    mr: 'महाराष्ट्र',
    bn: 'মহারাষ্ট্র',
    or: 'ମହାରାଷ୍ଟ୍ର'
  },
  'Bihar': {
    en: 'Bihar',
    ta: 'பீகார்',
    hi: 'बिहार',
    te: 'బీహార్',
    kn: 'ಬಿಹಾರ',
    mr: 'बिहार',
    bn: 'বিহার',
    or: 'ବିହାର'
  },
  'Rajasthan': {
    en: 'Rajasthan',
    ta: 'ராஜஸ்தான்',
    hi: 'राजस्थान',
    te: 'రాజస్థాన్',
    kn: 'ರಾಜಸ್ಥಾನ',
    mr: 'राजस्थान',
    bn: 'রাজস্থান',
    or: 'ରାଜସ୍ଥାନ'
  },
  'Karnataka': {
    en: 'Karnataka',
    ta: 'கர்நாடகா',
    hi: 'कर्नाटक',
    te: 'కర్ణాటక',
    kn: 'ಕರ್ನಾಟಕ',
    mr: 'कर्नाटक',
    bn: 'কর্ণাটক',
    or: 'କର୍ଣ୍ଣାଟକ'
  },
  'Tamil Nadu': {
    en: 'Tamil Nadu',
    ta: 'தமிழ்நாடு',
    hi: 'तमिलनाडु',
    te: 'తమిళనాడు',
    kn: 'ತಮಿಳುನಾಡು',
    mr: 'तमिळनाडू',
    bn: 'তামিলনাড়ু',
    or: 'ତାମିଲନାଡୁ'
  },
  'Telangana': {
    en: 'Telangana',
    ta: 'தெலுங்கானா',
    hi: 'तेलंगाना',
    te: 'తెలంగాణ',
    kn: 'ತೆಲಂಗಾಣ',
    mr: 'तेलंगणा',
    bn: 'তেলেঙ্গানা',
    or: 'ତେଲେଙ୍ଗାନା'
  }
};

// Localized Intervention Types
export const INTERVENTION_TYPES: Record<string, Record<SupportedLanguageCode, string>> = {
  'BUILD': {
    en: 'BUILD',
    ta: 'புதிய கட்டுமானம்',
    hi: 'नया निर्माण',
    te: 'కొత్త నిర్మాణం',
    kn: 'ಹೊಸ ನಿರ್ಮಾಣ',
    mr: 'नवीन बांधकाम',
    bn: 'নতুন নির্মাণ',
    or: 'ନୂତନ ନିର୍ମାଣ'
  },
  'FIX': {
    en: 'FIX',
    ta: 'பழுதுநீக்கம்',
    hi: 'मरम्मत',
    te: 'మరమ్మతు',
    kn: 'ದುರಸ್ತಿ',
    mr: 'दुरुस्ती',
    bn: 'মেরামত',
    or: 'ମରାମତି'
  },
  'UPGRADE': {
    en: 'UPGRADE',
    ta: 'மேம்படுத்தல்',
    hi: 'उन्नयन',
    te: 'నవీకరణ',
    kn: 'ಉನ್ನತೀಕರಣ',
    mr: 'सुधारणा',
    bn: 'উন্নয়ন',
    or: 'ଉନ୍ନତୀକରଣ'
  },
  'POLICY': {
    en: 'POLICY',
    ta: 'கொள்கை நடவடிக்கை',
    hi: 'नीतिगत कार्रवाई',
    te: 'విధానపరమైన చర్య',
    kn: 'ನೀತಿ ಕ್ರಮ',
    mr: 'धोरणात्मक कृती',
    bn: 'নীতিগত পদক্ষেপ',
    or: 'ନୀତିଗତ କାର୍ଯ୍ୟାନୁଷ୍ଠାନ'
  },
  'ALL': {
    en: 'ALL',
    ta: 'அனைத்தும்',
    hi: 'सभी',
    te: 'అన్నీ',
    kn: 'ಎಲ್ಲಾ',
    mr: 'सर्व',
    bn: 'সব',
    or: 'ସମସ୍ତ'
  }
};

// Localized Urgency
export const URGENCY_LABELS: Record<string, Record<SupportedLanguageCode, string>> = {
  'CRITICAL': {
    en: 'CRITICAL',
    ta: 'மிக அவசரம்',
    hi: 'अति गंभीर',
    te: 'అత్యవసరం',
    kn: 'ಅತ್ಯಂತ ತುರ್ತು',
    mr: 'अति तातडीचे',
    bn: 'জরুরী',
    or: 'ଅତ୍ୟନ୍ତ ଜରୁରୀ'
  },
  'HIGH': {
    en: 'HIGH',
    ta: 'அவசரம்',
    hi: 'उच्च',
    te: 'అధికం',
    kn: 'ಹೆಚ್ಚಿನ',
    mr: 'उच्च',
    bn: 'উচ্চ',
    or: 'ଉଚ୍ଚ'
  },
  'MODERATE': {
    en: 'MODERATE',
    ta: 'நடுத்தர',
    hi: 'मध्यम',
    te: 'మధ్యస్థ',
    kn: 'ಮಧ್ಯಮ',
    mr: 'मध्यम',
    bn: 'মাঝারি',
    or: 'ମଧ୍ୟମ'
  },
  'MEDIUM': {
    en: 'MEDIUM',
    ta: 'நடுத்தர',
    hi: 'मध्यम',
    te: 'మధ్యస్థ',
    kn: 'ಮಧ್ಯಮ',
    mr: 'मध्यम',
    bn: 'মাঝারি',
    or: 'ମଧ୍ୟମ'
  },
  'LOW': {
    en: 'LOW',
    ta: 'குறைவு',
    hi: 'सामान्य',
    te: 'తక్కువ',
    kn: 'ಕಡಿಮೆ',
    mr: 'कमी',
    bn: 'কম',
    or: 'କମ'
  }
};

// Recommendation Titles and Summaries by Category
export const CATEGORY_RECOMMENDATIONS: Record<string, {
  title: Record<SupportedLanguageCode, string>;
  keyHazard: Record<SupportedLanguageCode, string>;
  aiRecommendationTemplate: Record<SupportedLanguageCode, (dist: string) => string>;
  scheme: Record<SupportedLanguageCode, string>;
  analyticalJustification: Record<SupportedLanguageCode, (dist: string, deficit: number) => string>;
}> = {
  'Drainage': {
    title: {
      en: 'Upgrade Stormwater Drainage & Flood Outfalls',
      ta: 'மழைநீர் வடிகால் மற்றும் வெள்ள வெளியேற்ற அமைப்புகளை மேம்படுத்துதல்',
      hi: 'वर्षा जल निकासी और बाढ़ निकास प्रणालियों का उन्नयन',
      te: 'వర్షపు నీటి డ్రైనేజీ మరియు వరద ఔట్‌ఫాల్స్ నవీకరణ',
      kn: 'ಮಳೆನೀರು ಒಳಚರಂಡಿ ಮತ್ತು ಪ್ರವಾಹ ಹೊರಹರಿವು ನವೀಕರಣ',
      mr: 'पावसाळी पाण्याचा निचरा आणि पूर व्यवस्थापन सुधारणा',
      bn: 'বৃষ্টির জল নিষ্কাশন ও বন্যা আউটফল উন্নয়ন',
      or: 'ବର୍ଷା ଜଳ ନିଷ୍କାସନ ଏବଂ ବନ୍ୟା ଉତ୍ସ ନବୀକରଣ'
    },
    keyHazard: {
      en: 'Frequent monsoon waterlogging, stagnant sewer overflow & low-lying flood risks',
      ta: 'பருவமழை கால வெள்ளப்பெருக்கு, கழிவுநீர் தேங்குதல் மற்றும் தாழ்வான பகுதி வெள்ள அபாயங்கள்',
      hi: 'बार-बार मानसून में जलभराव, सीवर ओवरफ्लो और निचले इलाकों में बाढ़ का खतरा',
      te: 'వర్షాకాలంలో నిలిచే నీరు, మురుగునీటి పొంగిపొర్లడం మరియు లోతట్టు ప్రాంతాలలో వరద ముప్పు',
      kn: 'ಮುಂಗಾರು ಮಳೆನೀರು ನಿಲ್ಲುವುದು, ಒಳಚರಂಡಿ ಉಕ್ಕಿ ಹರಿಯುವುದು ಮತ್ತು ತಗ್ಗು ಪ್ರದೇಶದ ಪ್ರವಾಹ ಅಪಾಯ',
      mr: 'पावसाळ्यात पाणी साचणे, सांडपाणी वाहून जाणे आणि सखल भागातील पुराचा धोका',
      bn: 'বর্ষায় ঘনঘন জল জমা, নর্দমার উপচে পড়া এবং নিচু এলাকার বন্যা ঝুঁকি',
      or: 'ବର୍ଷା ଋତୁରେ ବାରମ୍ବାର ଜଳବନ୍ଦୀ, ଡ୍ରେନେଜ୍ ଉଛୁଳିବା ଏବଂ ବନ୍ୟା ବିପଦ'
    },
    aiRecommendationTemplate: {
      en: (d) => `Prioritize automated underground stormwater outfalls and culvert deepening across dense municipal wards in ${d}.`,
      ta: (d) => `${d} நகராட்சியின் நெரிசலான வார்டுகளில் தானியங்கி நிலத்தடி மழைநீர் வடிகால்கள் மற்றும் மதகு ஆழப்படுத்துதலுக்கு முன்னுரிமை அளிக்கவும்.`,
      hi: (d) => `${d} के सघन नगरपालिका वार्डों में स्वचालित भूमिगत वर्षा जल निकास और पुलियों को गहरा करने को प्राथमिकता दें।`,
      te: (d) => `${d} మున్సిపల్ వార్డులలో ఆటోమేటెడ్ భూగర్భ వర్షపు నీటి అవుట్‌లెట్లు మరియు కల్వర్టుల పునరుద్ధరణకు ప్రాధాన్యత ఇవ్వండి.`,
      kn: (d) => `${d} ಪುರಸಭೆಯ ಜನನಿಬಿಡ ವಾರ್ಡ್‌ಗಳಲ್ಲಿ ಸ್ವಯಂಚಾಲಿತ ಭೂಗತ ಮಳೆನೀರು ಕಾಲುವೆಗಳು ಮತ್ತು ಸೇತುವೆಗಳನ್ನು ಆಳವಾಗಿಸಲು ಆದ್ಯತೆ ನೀಡಿ.`,
      mr: (d) => `${d} मधील दाट नागरी वॉर्डांमध्ये स्वयंचलित भूमिगत जलवाहिन्या आणि कल्व्हर्ट दुरुस्तीला प्राधान्य द्या.`,
      bn: (d) => `${d} মিউনিসিপ্যালিটির ঘনবসতিপূর্ণ ওয়ার্ডে স্বয়ংক্রিয় ভূগর্ভস্থ ড্রেনেজ ও কালভার্ট গভীরকরণে অগ্রাধিকার দিন।`,
      or: (d) => `${d} ପୌରାଞ୍ଚଳ ୱାର୍ଡଗୁଡ଼ିକରେ ସ୍ୱୟଂଚାଳିତ ଭୂତଳ ଜଳ ନିଷ୍କାସନ ଏବଂ କଲଭର୍ଟ ଗଭୀର କରିବାକୁ ପ୍ରାଥମିକତା ଦିଅନ୍ତୁ।`
    },
    scheme: {
      en: 'AMRUT 2.0 Urban Waterways Mission',
      ta: 'அம்ருத் 2.0 நகர்ப்புற நீர்வழிப்பாதை திட்டம்',
      hi: 'अमृत 2.0 शहरी जलमार्ग मिशन',
      te: 'అమృత్ 2.0 అర్బన్ వాటర్‌వేస్ మిషన్',
      kn: 'ಅಮೃತ್ 2.0 ನಗರ ಜಲಮಾರ್ಗ ಮಿಷನ್',
      mr: 'अमृत २.० नागरी जलमार्ग अभियान',
      bn: 'অমৃত ২.০ নগর জলপথ মিশন',
      or: 'ଅମୃତ ୨.୦ ସହରୀ ଜଳପଥ ମିଶନ'
    },
    analyticalJustification: {
      en: (d, def) => `Groundwater infiltration and surface drainage modeling in ${d} show a severe ${def}% capacity deficit during monsoon peak periods, directly putting thousands of households at risk.`,
      ta: (d, def) => `${d} பகுதியில் நிலத்தடி நீர் வடிதல் மற்றும் வடிகால் பகுப்பாய்வு பருவமழை காலத்தில் ${def}% கொள்ளளவு குறைபாட்டை காட்டுகிறது, இது ஆயிரக்கணக்கான குடும்பங்களை பாதிக்கிறது.`,
      hi: (d, def) => `${d} में ड्रेनेज मॉडलिंग मानसून के चरम समय में ${def}% क्षमता की गंभीर कमी को दर्शाती है, जिससे हजारों परिवार प्रभावित होते हैं।`,
      te: (d, def) => `${d} ప్రాంతంలో డ్రైనేజీ విశ్లేషణ వర్షాకాలంలో ${def}% తీవ్రమైన సామర్థ్య లోటును సూచిస్తుంది.`,
      kn: (d, def) => `${d} ನಲ್ಲಿನ ಡ್ರೈನೇಜ್ ಮಾದರಿಯು ಮಳೆಗಾಲದಲ್ಲಿ ${def}% ಕೊರತೆಯನ್ನು ತೋರಿಸುತ್ತದೆ.`,
      mr: (d, def) => `${d} मधील ड्रेनेज विश्लेषणात पावसाळ्यात ${def}% क्षमतेची तूट दिसून येते.`,
      bn: (d, def) => `${d} এ ড্রেনেজ বিশ্লেষণে বর্ষাকালে ${def}% তীব্র ঘাটতি দেখা যায়।`,
      or: (d, def) => `${d} ରେ ଡ୍ରେନେଜ୍ ବିଶ୍ଳେଷଣ ବର୍ଷା ଋତୁରେ ${def}% ଗୁରୁତର ଅଭାବ ଦର୍ଶାଉଛି।`
    }
  },
  'Water': {
    title: {
      en: 'Piped Water Trunk Extension & RO Filtration Hubs',
      ta: 'குழாய் நீர் விநியோக விரிவாக்கம் மற்றும் ஆர்.ஓ வடிகட்டுதல் மையங்கள்',
      hi: 'पाइपलाइन जलापूर्ति विस्तार और आरओ निस्पंदन केंद्र',
      te: 'పైప్‌డ్ నీటి సరఫరా విస్తరణ మరియు RO శుద్ధి కేంద్రాలు',
      kn: 'ಪೈಪ್‌ಲೈನ್ ಕುಡಿಯುವ ನೀರು ಸರಬರಾಜು ವಿಸ್ತರಣೆ ಮತ್ತು RO ಶುದ್ಧೀಕರಣ ಕೇಂದ್ರಗಳು',
      mr: 'नळ पाणीपुरवठा विस्तार आणि आरओ जलशुद्धीकरण केंद्रे',
      bn: 'পাইপযুক্ত জল সরবরাহ সম্প্রসারণ এবং আরও পরিস্রাবণ কেন্দ্র',
      or: 'ପାଇପ୍ ଯୋଗେ ଜଳ ଯୋଗାଣ ସମ୍ପ୍ରସାରଣ ଏବଂ RO ଫିଲ୍ଟ୍ରେସନ୍ ହବ୍'
    },
    keyHazard: {
      en: 'Severe drinking water salinity, dry-outs, and piped access deficit',
      ta: 'கடுமையான குடிநீர் உவர்ப்புத்தன்மை, வறட்சி மற்றும் குழாய் இணைப்பு பற்றாக்குறை',
      hi: 'गंभीर पेयजल लवणता, सूखा और पाइपलाइन पहुंच में कमी',
      te: 'తీవ్రమైన త్రాగునీటి లవణీయత, ఎండిపోవడం మరియు పైప్ వాటర్ కొరత',
      kn: 'ತೀವ್ರ ಕುಡಿಯುವ ನೀರಿನ ಲವಣಾಂಶ, ಬತ್ತಿಹೋಗುವಿಕೆ ಮತ್ತು ಪೈಪ್ ಸಂಪರ್ಕ ಕೊರತೆ',
      mr: 'पिण्याच्या पाण्याची गंभीर क्षारता, कोरडे पडणे आणि नळ जोडणीची कमतरता',
      bn: 'পানীয় জলের তীব্র লবণাক্ততা, ঘাটতি এবং পাইপ সংযোগের অভাব',
      or: 'ପିଇବା ପାଣିର ଅତ୍ୟଧିକ ଲବଣାକ୍ତତା, ଶୁଷ୍କତା ଏବଂ ପାଇପ୍ ସଂଯୋଗ ଅଭାବ'
    },
    aiRecommendationTemplate: {
      en: (d) => `Deploy solar-powered deep membrane filtration hubs and expand pipeline reach across panchayats in ${d}.`,
      ta: (d) => `${d} ஊராட்சிகளில் சூரிய சக்தியால் இயங்கும் சவ்வு வடிகட்டுதல் மையங்களை அமைத்து குழாய் இணைப்பை விரிவுபடுத்துங்கள்.`,
      hi: (d) => `${d} की पंचायतों में सौर ऊर्जा संचालित डीप मेम्ब्रेन फिल्ट्रेशन हब स्थापित करें और पाइपलाइन का विस्तार करें।`,
      te: (d) => `${d} పంచాయతీలలో సౌరశక్తితో నడిచే డీప్ మెంబ్రేన్ RO కేంద్రాలను ఏర్పాటు చేసి పైప్‌లైన్‌ను విస్తరించండి.`,
      kn: (d) => `${d} ಪಂಚಾಯಿತಿಗಳಲ್ಲಿ ಸೌರಶಕ್ತಿ ಚಾಲಿತ RO ಫಿಲ್ಟ್ರೇಶನ್ ಕೇಂದ್ರಗಳನ್ನು ಸ್ಥಾಪಿಸಿ ಪೈಪ್‌ಲೈನ್ ವಿಸ್ತರಿಸಿ.`,
      mr: (d) => `${d} च्या ग्रामपंचायतींमध्ये सौरऊर्जेवर चालणारी आरओ केंद्रे उभारा आणि पाईपलाईन वाढवा.`,
      bn: (d) => `${d} এর পঞ্চায়েতগুলিতে সৌর-চালিত মেমব্রেন পরিস্রাবণ হাব স্থাপন করুন ও পাইপলাইন প্রসারিত করুন।`,
      or: (d) => `${d} ପଞ୍ଚାୟତଗୁଡ଼ିକରେ ସୌରଚାଳିତ RO ଫିଲ୍ଟ୍ରେସନ୍ ହବ୍ ସ୍ଥାପନ କରି ପାଇପଲାଇନ୍ ସମ୍ପ୍ରସାରଣ କରନ୍ତୁ।`
    },
    scheme: {
      en: 'Jal Jeevan Mission (JJM)',
      ta: 'ஜல் ஜீவன் இயக்கம் (JJM)',
      hi: 'जल जीवन मिशन (JJM)',
      te: 'జల్ జీవన్ మిషన్ (JJM)',
      kn: 'ಜಲ ಜೀವನ್ ಮಿಷನ್ (JJM)',
      mr: 'जल जीवन मिशन (JJM)',
      bn: 'জল জীবন মিশন (JJM)',
      or: 'ଜଳ ଜୀବନ ମିଶନ (JJM)'
    },
    analyticalJustification: {
      en: (d, def) => `Groundwater table depletion and high fluoride concentration in ${d} create an immediate ${def}% drinking water access deficit requiring centralized membrane water stations.`,
      ta: (d, def) => `${d} பகுதியில் நிலத்தடி நீர் மட்டம் குறைதல் மற்றும் அதிக ஃப்ளோரைடு பாதிப்பு காரணமாக ${def}% குடிநீர் தட்டுப்பாடு ஏற்பட்டுள்ளது.`,
      hi: (d, def) => `${d} में भूजल स्तर में गिरावट और उच्च फ्लोराइड के कारण ${def}% पेयजल की कमी है, जिसके लिए आरओ केंद्रों की तत्काल आवश्यकता है।`,
      te: (d, def) => `${d} లో భూగర్భజలాల క్షీణత మరియు ఫ్లోరైడ్ కారణంగా ${def}% తాగునీటి కొరత ఏర్పడింది.`,
      kn: (d, def) => `${d} ನಲ್ಲಿ ಅಂತರ್ಜಲ ಕುಸಿತ ಮತ್ತು ಫ್ಲೋರೈಡ್‌ನಿಂದಾಗಿ ${def}% ಕುಡಿಯುವ ನೀರಿನ ಕೊರತೆಯಿದೆ.`,
      mr: (d, def) => `${d} मध्ये भूजल पातळी खालावल्याने आणि फ्लोराईडमुळे ${def}% पाण्याची तीव्र टंचाई आहे.`,
      bn: (d, def) => `${d} এ ভূগর্ভস্থ জলস্তর হ্রাস এবং আর্সেনিক/ফ্লোরাইডের কারণে ${def}% পানীয় জলের ঘাটতি রয়েছে।`,
      or: (d, def) => `${d} ରେ ଭୂତଳ ଜଳସ୍ତର ହ୍ରାସ ଏବଂ ଫ୍ଲୋରାଇଡ୍ ଯୋଗୁଁ ${def}% ପିଇବା ପାଣିର ଘୋର ଅଭାବ ଦେଖାଦେଇଛି।`
    }
  },
  'Roads': {
    title: {
      en: 'All-Weather Bituminous Surfacing & Transit Corridors',
      ta: 'அனைத்து பருவநிலைக்குமான தார் சாலைகள் மற்றும் போக்குவரத்து வழித்தடங்கள்',
      hi: 'हर मौसम के अनुकूल डामर सड़कें और परिवहन गलियारे',
      te: 'అన్ని కాలాలలో ప్రయాణించదగిన తారు రోడ్లు మరియు రవాణా కారిడార్లు',
      kn: 'ಎಲ್ಲಾ ಋತುವಿನ ಡಾಂಬರು ರಸ್ತೆಗಳು ಮತ್ತು ಸಾರಿಗೆ ಕಾರಿಡಾರ್‌ಗಳು',
      mr: 'सर्व ऋतूंसाठी योग्य डांबरी रस्ते आणि वाहतूक कॉरिडोअर',
      bn: 'সব ঋতুর উপযোগী পাকা পিচ রাস্তা এবং পরিবহন করিডোর',
      or: 'ସବୁ ଋତୁ ଉପଯୋଗୀ ପିଚୁ ରାସ୍ତା ଏବଂ ପରିବହନ କରିଡର'
    },
    keyHazard: {
      en: 'Pothole hazards, soil road collapses, transit delays & agricultural crop spoilage',
      ta: 'பள்ளங்களால் ஏற்படும் விபத்துகள், மண் சாலை சேதம், பயண தாமதம் மற்றும் விவசாய விளைபொருள் சேதம்',
      hi: 'गड्ढों के खतरे, कच्ची सड़कों का धंसना, यातायात में देरी और कृषि उपज की बर्बादी',
      te: 'గుంతల ప్రమాదాలు, మట్టి రోడ్ల కోత, ప్రయాణ ఆలస్యం మరియు వ్యవసాయ పంటల నష్టం',
      kn: 'ಗುಂಡಿಗಳ ಅಪಾಯ, ಮಣ್ಣಿನ ರಸ್ತೆಗಳ ಕುಸಿತ, ಸಾರಿಗೆ ವಿಳಂಬ ಮತ್ತು ಕೃಷಿ ಬೆಳೆ ನಷ್ಟ',
      mr: 'खड्ड्यांचे धोके, कच्च्या रस्त्यांची दुरवस्था, प्रवासातील विलंब आणि शेतीमालाचे नुकसान',
      bn: 'খাঁদখন্দের ঝুঁকি, কাঁচা রাস্তার ধস, যানজট এবং কৃষিজ ফসলের ক্ষতি',
      or: 'ଖାଲଖମା ବିପଦ, କଚ୍ଚା ରାସ୍ତା ଧସିବା, ଯାତାୟାତ ବିଳମ୍ବ ଏବଂ କୃଷିଜାତ ଦ୍ରବ୍ୟ ନଷ୍ଟ'
    },
    aiRecommendationTemplate: {
      en: (d) => `Reconstruct critical transit corridors with reinforced paver shoulders and side drainage culverts in ${d}.`,
      ta: (d) => `${d} பகுதியில் வலுவூட்டப்பட்ட பக்கவாட்டு வடிகால்களுடன் கூடிய முக்கிய போக்குவரத்து சாலைகளை மறுசீரமைக்கவும்.`,
      hi: (d) => `${d} में मजबूत पेवर शोल्डर और साइड ड्रेनेज पुलियों के साथ प्रमुख पारगमन गलियारों का पुनर्निर्माण करें।`,
      te: (d) => `${d} లో డ్రైనేజీ సదుపాయంతో కూడిన కీలక రవాణా కారిడార్లను పునర్నిర్మించండి.`,
      kn: (d) => `${d} ನಲ್ಲಿ ಬಲವರ್ಧಿತ ಪಾದಚಾರಿ ಮಾರ್ಗ ಮತ್ತು ಚರಂಡಿಗಳೊಂದಿಗೆ ಪ್ರಮುಖ ರಸ್ತೆಗಳನ್ನು ಪುನರ್ನಿರ್ಮಿಸಿ.`,
      mr: (d) => `${d} मधील महत्त्वाच्या रस्त्यांची डागडुजी आणि बाजूच्या गटारांचे पुनर्निर्माण करा.`,
      bn: (d) => `${d} এ ড্রেনেজ কালভার্ট সহ গুরুত্বপূর্ণ ট্রানজিট করিডোর পুনর্নির্মাণ করুন।`,
      or: (d) => `${d} ରେ ପାର୍ଶ୍ୱ ଜଳ ନିଷ୍କାସନ ସହିତ ପ୍ରମୁଖ ଯାତାୟାତ କରିଡର ପୁନଃନିର୍ମାଣ କରନ୍ତୁ।`
    },
    scheme: {
      en: 'PMGSY Rural Connectivity Scheme',
      ta: 'பிரதான் மந்திரி கிராம சடக் யோஜனா (PMGSY)',
      hi: 'प्रधानमंत्री ग्राम सड़क योजना (PMGSY)',
      te: 'ప్రధాన మంత్రి గ్రామ్ సడక్ యోజన (PMGSY)',
      kn: 'ಪ್ರಧಾನ ಮಂತ್ರಿ ಗ್ರಾಮ ಸಡಕ್ ಯೋಜನೆ (PMGSY)',
      mr: 'प्रधानमंत्री ग्राम सडक योजना (PMGSY)',
      bn: 'প্রধানমন্ত্রী গ্রাম সড়ক যোজনা (PMGSY)',
      or: 'ପ୍ରଧାନମନ୍ତ୍ରୀ ଗ୍ରାମ ସଡ଼କ ଯୋଜନା (PMGSY)'
    },
    analyticalJustification: {
      en: (d, def) => `Unpaved transit arteries in ${d} suffer a ${def}% deficit index, causing severe ambulance transit bottlenecks and market access barriers.`,
      ta: (d, def) => `${d} பகுதியில் செப்பனிடப்படாத சாலைகள் ${def}% குறைபாட்டைக் கொண்டுள்ளன, இது அவசர ஆம்புலன்ஸ் போக்குவரத்தை பாதிக்கிறது.`,
      hi: (d, def) => `${d} में कच्ची सड़कें ${def}% की कमी दर्शाती हैं, जिससे एम्बुलेंस और बाजार तक पहुंच में भारी रुकावट आती है।`,
      te: (d, def) => `${d} లో రోడ్ల పరిస్థితి ${def}% లోటును కలిగి ఉంది, దీనివల్ల అత్యవసర అంబులెన్స్ సేవలకు ఆటంకం కలుగుతోంది.`,
      kn: (d, def) => `${d} ನಲ್ಲಿ ಕಚ್ಚಾ ರಸ್ತೆಗಳು ${def}% ಕೊರತೆಯನ್ನು ಹೊಂದಿದ್ದು, ಆಂಬ್ಯುಲೆನ್ಸ್ ಸಂಚಾರಕ್ಕೆ ಅಡ್ಡಿಯಾಗಿದೆ.`,
      mr: (d, def) => `${d} मधील खराब रस्त्यांमुळे रुग्णवाहिका आणि दळणवळणात ${def}% अडथळा निर्माण होतो.`,
      bn: (d, def) => `${d} এ কাঁচা রাস্তার কারণে ${def}% ট্রানজিট ঘাটতি রয়েছে, যা জরুরি চিকিৎসা পরিষেবাকে ব্যাহত করে।`,
      or: (d, def) => `${d} ରେ କଚ୍ଚା ରାସ୍ତା ଯୋଗୁଁ ${def}% ଯାତାୟାତ ବାଧା ଉପୁଜିଛି।`
    }
  },
  'Electricity': {
    title: {
      en: 'Smart Connected LED Grid & Safety Lighting Corridors',
      ta: 'ஸ்மார்ட் எல்இடி தெருவிளக்குகள் மற்றும் பாதுகாப்பு விளக்கு வழித்தடங்கள்',
      hi: 'स्मार्ट कनेक्टेड एलईडी ग्रिड और सुरक्षा प्रकाश गलियारे',
      te: 'స్మార్ట్ కనెక్ట్ చేయబడిన LED గ్రిడ్ మరియు భద్రతా లైటింగ్ కారిడార్లు',
      kn: 'ಸ್ಮಾರ್ಟ್ ಎಲ್‌ಇಡಿ ಬೀದಿ ದೀಪಗಳು ಮತ್ತು ಸುರಕ್ಷತಾ ಲೈಟಿಂಗ್ ಕಾರಿಡಾರ್‌ಗಳು',
      mr: 'स्मार्ट एलईडी पथदिवे आणि सुरक्षित प्रकाश कॉरिडोअर',
      bn: 'স্মার্ট সংযুক্ত এলইডি গ্রিড এবং সুরক্ষা আলো করিডোর',
      or: 'ସ୍ମାର୍ଟ LED ଗ୍ରିଡ୍ ଏବଂ ନିରାପତ୍ତା ଆଲୋକ କରିଡର'
    },
    keyHazard: {
      en: 'Night dark spots, public safety concerns & arterial transit blindspots',
      ta: 'இரவு நேர இருள் பகுதிகள், பொதுப் பாதுகாப்பு அச்சங்கள் மற்றும் பிரதான சாலை ஆபத்துகள்',
      hi: 'रात में अंधेरे क्षेत्र, सार्वजनिक सुरक्षा चिंताएं और मुख्य मार्गों पर खतरे',
      te: 'రాత్రిపూట చీకటి ప్రాంతాలు, ప్రజల భద్రతా సమస్యలు మరియు రహదారి ప్రమాదాలు',
      kn: 'ರಾತ್ರಿಯ ಕತ್ತಲೆ ಪ್ರದೇಶಗಳು, ಸಾರ್ವಜನಿಕ ಸುರಕ್ಷತೆ ಕಾಳಜಿಗಳು ಮತ್ತು ರಸ್ತೆ ಅಪಾಯಗಳು',
      mr: 'रात्रीचे अंधारे रस्ते, सार्वजनिक सुरक्षेचे प्रश्न आणि अपघात प्रवण क्षेत्रे',
      bn: 'রাতের অন্ধকার অঞ্চল, জননিরাপত্তার ঝুঁকি এবং ট্রানজিট অন্ধবিন্দু',
      or: 'ରାତିରେ ଅନ୍ଧକାର ସ୍ଥାନ, ସାର୍ବଜନୀନ ସୁରକ୍ଷା ଚିନ୍ତା ଏବଂ ଦୁର୍ଘଟଣା ବିପଦ'
    },
    aiRecommendationTemplate: {
      en: (d) => `Install connected smart LED poles with automatic dusk sensors along main arterial bypasses in ${d}.`,
      ta: (d) => `${d} பகுதியின் பிரதான புறவழிச் சாலைகளில் தானியங்கி உணரிகள் கொண்ட ஸ்மார்ட் எல்இடி விளக்குகளை நிறுவவும்.`,
      hi: (d) => `${d} में मुख्य बाईपास मार्गों पर स्वचालित डस्क सेंसर वाले स्मार्ट एलईडी पोल लगाएं।`,
      te: (d) => `${d} లోని ప్రధాన బైపాస్ మార్గాల్లో ఆటోమేటిక్ డస్క్ సెన్సార్లతో కూడిన స్మార్ట్ LED స్తంభాలను అమర్చండి.`,
      kn: (d) => `${d} ನ ಮುಖ್ಯ ಬೈಪಾಸ್ ರಸ್ತೆಗಳಲ್ಲಿ ಸ್ವಯಂಚಾಲಿತ ಸೆನ್ಸಾರ್ ಹೊಂದಿರುವ ಸ್ಮಾರ್ಟ್ ಎಲ್‌ಇಡಿ ಕಂಬಗಳನ್ನು ಅಳವಡಿಸಿ.`,
      mr: (d) => `${d} मधील प्रमुख बायपास रस्त्यांवर स्वयंचलित सेन्सर्ससह स्मार्ट एलईडी दिवे लावा.`,
      bn: (d) => `${d} এর প্রধান বাইপাসে স্বয়ংক্রিয় সেন্সর যুক্ত স্মার্ট এলইডি পোল স্থাপন করুন।`,
      or: (d) => `${d} ର ମୁଖ୍ୟ ବାଇପାସ୍ ରାସ୍ତାରେ ସ୍ୱୟଂଚାଳିତ ସେନ୍ସର ଥିବା ସ୍ମାର୍ଟ LED ଖୁଣ୍ଟ ସ୍ଥାପନ କରନ୍ତୁ।`
    },
    scheme: {
      en: 'National Smart Street Lighting Mission',
      ta: 'தேசிய ஸ்மார்ட் தெருவிளக்கு திட்டம்',
      hi: 'राष्ट्रीय स्मार्ट स्ट्रीट लाइटिंग मिशन',
      te: 'నేషనల్ స్మార్ట్ స్ట్రీట్ లైటింగ్ మిషన్',
      kn: 'ರಾಷ್ಟ್ರೀಯ ಸ್ಮಾರ್ಟ್ ಬೀದಿ ದೀಪ ಮಿಷನ್',
      mr: 'राष्ट्रीय स्मार्ट पथदिवे अभियान',
      bn: 'জাতীয় স্মার্ট স্ট্রিট লাইটিং মিশন',
      or: 'ଜାତୀୟ ସ୍ମାର୍ଟ ଷ୍ଟ୍ରିଟ୍ ଲାଇଟିଂ ମିଶନ'
    },
    analyticalJustification: {
      en: (d, def) => `Telemetry audits reveal an acute lighting void in ${d} with a ${def}% deficit gap, causing elevated nighttime transit risks.`,
      ta: (d, def) => `${d} பகுதியில் இரவு நேர வெளிச்சத்தில் ${def}% குறைபாடு இருப்பது கண்டறியப்பட்டுள்ளது.`,
      hi: (d, def) => `${d} में रात्रि प्रकाश व्यवस्था में ${def}% की कमी है, जिससे रात में दुर्घटना और सुरक्षा जोखिम बढ़ जाते हैं।`,
      te: (d, def) => `${d} లో రాత్రిపూట వీధి దీపాల కొరత ${def}% గా ఉంది.`,
      kn: (d, def) => `${d} ನಲ್ಲಿ ಬೀದಿ ದೀಪಗಳ ಕೊರತೆ ${def}% ರಷ್ಟಿದೆ.`,
      mr: (d, def) => `${d} मध्ये रस्त्यावरील दिव्यांची ${def}% तूट आहे.`,
      bn: (d, def) => `${d} এ আলোর তীব্র ঘাটতি (${def}%) রয়েছে, যা রাতের নিরাপত্তাকে ব্যাহত করে।`,
      or: (d, def) => `${d} ରେ ରାତ୍ରିକାଳୀନ ଆଲୋକର ${def}% ଅଭାବ ରହିଛି।`
    }
  },
  'Health': {
    title: {
      en: 'Primary Healthcare Solar Backup & Mobile Diagnostic Vans',
      ta: 'ஆரம்ப சுகாதார நிலைய சூரியசக்தி மின் காப்பு மற்றும் நடமாடும் பரிசோதனை வாகனங்கள்',
      hi: 'प्राथमिक स्वास्थ्य केंद्र सौर बैकअप और मोबाइल डायग्नोस्टिक वैन',
      te: 'ప్రాథమిక ఆరోగ్య కేంద్రాల సౌర విద్యుత్ బ్యాకప్ మరియు మొబైల్ డయాగ్నస్టిక్ వ్యాన్లు',
      kn: 'ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರಗಳ ಸೌರ ಬ್ಯಾಕಪ್ ಮತ್ತು ಮೊಬೈಲ್ ತಪಾಸಣಾ ವಾಹನಗಳು',
      mr: 'प्राथमिक आरोग्य केंद्र सौर बॅकअप आणि फिरती निदान वाहने',
      bn: 'প্রাথমিক স্বাস্থ্য কেন্দ্র সৌর ব্যাকআপ ও ভ্রাম্যমাণ ডায়াগনস্টিক ভ্যান',
      or: 'ପ୍ରାଥମିକ ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ର ସୌର ବ୍ୟାକଅପ୍ ଏବଂ ମୋବାଇଲ୍ ଡାଇଗ୍ନୋଷ୍ଟିକ୍ ଭ୍ୟାନ୍'
    },
    keyHazard: {
      en: 'Frequent grid outages affecting vaccine cold-chains & maternal emergency care delays',
      ta: 'மின் தடையால் தடுப்பூசி சேமிப்பு பாதிப்பு மற்றும் தாய்மார்களுக்கான அவசர சிகிச்சை தாமதங்கள்',
      hi: 'टीका कोल्ड-चेन को प्रभावित करने वाली लगातार बिजली कटौती और मातृ देखभाल में देरी',
      te: 'వ్యాక్సిన్ నిల్వను ప్రభావితం చేసే విద్యుత్ కోతలు మరియు ప్రసూతి అత్యవసర సేవల ఆలస్యం',
      kn: 'ಲಸಿಕೆ ಶೇಖರಣೆಗೆ ಅಡ್ಡಿಯಾಗುವ ವಿದ್ಯುತ್ ಕಡಿತ ಮತ್ತು ತುರ್ತು ಹೆರಿಗೆ ಚಿಕಿತ್ಸಾ ವಿಳಂಬ',
      mr: 'लस साठवणुकीवर परिणाम करणारे वीज खंडन आणि माता आरोग्य सेवेतील विलंब',
      bn: 'টিকা কোল্ড-চেইন ব্যাহতকারী লোডশেডিং এবং জরুরি মাতৃত্বকালীন চিকিৎসায় বিলম্ব',
      or: 'ଟିକା ସଂରକ୍ଷଣ ଉପରେ ପ୍ରଭାବ ପକାଉଥିବା ବିଦ୍ୟୁତ୍ ବିଭ୍ରାଟ ଏବଂ ପ୍ରସୂତି ଚିକିତ୍ସା ବିଳମ୍ବ'
    },
    aiRecommendationTemplate: {
      en: (d) => `Equip rural clinics in ${d} with solar battery backups and deploy tele-diagnostic mobile vans.`,
      ta: (d) => `${d} கிராமப்புற மருத்துவமனைகளில் சூரியசக்தி பேட்டரிகளை அமைத்து தொலைதூர மருத்துவ பரிசோதனை வாகனங்களை இயக்கவும்.`,
      hi: (d) => `${d} के ग्रामीण क्लीनिकों को सोलर बैटरी बैकअप से लैस करें और टेली-डायग्नोस्टिक मोबाइल वैन तैनात करें।`,
      te: (d) => `${d} గ్రామీణ క్లినిక్‌లలో సోలార్ బ్యాటరీ బ్యాకప్‌లను ఏర్పాటు చేసి టెలి-డయాగ్నస్టిక్ వ్యాన్లను ప్రారంభించండి.`,
      kn: (d) => `${d} ಗ್ರಾಮೀಣ ಚಿಕಿತ್ಸಾಲಯಗಳಿಗೆ ಸೌರ ಬ್ಯಾಟರಿ ಬ್ಯಾಕಪ್ ಒದಗಿಸಿ ಮೊಬೈಲ್ ಡಯಾಗ್ನೋಸ್ಟಿಕ್ ವಾಹನಗಳನ್ನು ನಿಯೋಜಿಸಿ.`,
      mr: (d) => `${d} मधील ग्रामीण रुग्णालयांना सौर बॅकअप द्या आणि फिरते निदान व्हॅन तैनात करा.`,
      bn: (d) => `${d} এর গ্রামীণ ক্লিনিকগুলিতে সৌর ব্যাটারি ব্যাকআপ স্থাপন করুন ও টেলি-ডায়াগনস্টিক ভ্যান মোতায়েন করুন।`,
      or: (d) => `${d} ଗ୍ରାମୀଣ କ୍ଲିନିକଗୁଡ଼ିକରେ ସୌର ବ୍ୟାଟେରୀ ବ୍ୟାକଅପ୍ ପ୍ରଦାନ କରନ୍ତୁ ଏବଂ ମୋବାଇଲ୍ ଭ୍ୟାନ୍ ନିୟୋଜିତ କରନ୍ତୁ।`
    },
    scheme: {
      en: 'National Health Mission (NHM)',
      ta: 'தேசிய சுகாதார இயக்கம் (NHM)',
      hi: 'राष्ट्रीय स्वास्थ्य मिशन (NHM)',
      te: 'జాతీయ ఆరోగ్య మిషన్ (NHM)',
      kn: 'ರಾಷ್ಟ್ರೀಯ ಆರೋಗ್ಯ ಮಿಷನ್ (NHM)',
      mr: 'राष्ट्रीय आरोग्य अभियान (NHM)',
      bn: 'জাতীয় স্বাস্থ্য মিশন (NHM)',
      or: 'ଜାତୀୟ ସ୍ୱାସ୍ଥ୍ୟ ମିଶନ (NHM)'
    },
    analyticalJustification: {
      en: (d, def) => `Primary healthcare facilities in ${d} face a ${def}% functional deficit gap due to unstable power grids and remote geography.`,
      ta: (d, def) => `${d} ஆரம்ப சுகாதார நிலையங்கள் சீரற்ற மின்சாரம் காரணமாக ${def}% குறைபாட்டை எதிர்கொள்கின்றன.`,
      hi: (d, def) => `${d} में प्राथमिक स्वास्थ्य केंद्रों में अस्थिर बिजली ग्रिड के कारण ${def}% की कमी है।`,
      te: (d, def) => `${d} లోని ప్రాథమిక ఆరోగ్య కేంద్రాలు విద్యుత్ లోపాల వల్ల ${def}% అంతరాన్ని ఎదుర్కొంటున్నాయి.`,
      kn: (d, def) => `${d} ನಲ್ಲಿನ ಆರೋಗ್ಯ ಕೇಂದ್ರಗಳು ${def}% ಕೊರತೆಯನ್ನು ಎದುರಿಸುತ್ತಿವೆ.`,
      mr: (d, def) => `${d} मधील आरोग्य केंद्रांमध्ये वीज समस्येमुळे ${def}% तूट आहे.`,
      bn: (d, def) => `${d} এর স্বাস্থ্য কেন্দ্রগুলিতে বিদ্যুৎ ঘাটতির কারণে ${def}% পরিষেবা ঘাটতি রয়েছে।`,
      or: (d, def) => `${d} ର ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ରଗୁଡ଼ିକରେ ବିଦ୍ୟୁତ୍ ଅସ୍ଥିରତା ଯୋଗୁଁ ${def}% ସେବା ଅଭାବ ରହିଛି।`
    }
  },
  'Education': {
    title: {
      en: 'School Sanitation Blocks & Solar Digital Learning Hubs',
      ta: 'பள்ளி சுகாதார வளாகங்கள் மற்றும் சூரியசக்தி டிஜிட்டல் கற்றல் மையங்கள்',
      hi: 'स्कूल स्वच्छता परिसर और सौर डिजिटल शिक्षण केंद्र',
      te: 'పాఠశాల పారిశుధ్య సముదాయాలు మరియు సౌర డిజిటల్ లెర్నింగ్ హబ్‌లు',
      kn: 'ಶಾಲಾ ನೈರ್ಮಲ್ಯ ಸಂಕೀರ್ಣಗಳು ಮತ್ತು ಸೌರ ಡಿಜಿಟಲ್ ಕಲಿಕಾ ಕೇಂದ್ರಗಳು',
      mr: 'शाळा स्वच्छता संकुले आणि सौर डिजिटल शिक्षण केंद्रे',
      bn: 'বিদ্যালয় স্যানিটেশন কমপ্লেক্স এবং সৌর ডিজিটাল লার্নিং হাব',
      or: 'ବିଦ୍ୟାଳୟ ପରିମଳ ବ୍ଲକ୍ ଏବଂ ସୌର ଡିଜିଟାଲ୍ ଶିକ୍ଷା ହବ୍'
    },
    keyHazard: {
      en: 'Sanitation facility deficits leading to student dropouts and digital learning divide',
      ta: 'கழிப்பறை வசதி குறைபாட்டால் மாணவிகள் பள்ளி இடைநிற்றல் மற்றும் டிஜிட்டல் கற்றல் இடைவெளி',
      hi: 'शौचालय सुविधाओं की कमी से छात्रों का स्कूल छोड़ना और डिजिटल शिक्षा का अंतर',
      te: 'పారిశుధ్య లోపాల వల్ల విద్యార్థుల డ్రాపౌట్లు మరియు డిజిటల్ విద్యలో అంతరం',
      kn: 'ಶೌಚಾಲಯ ಕೊರತೆಯಿಂದ ವಿದ್ಯಾರ್ಥಿಗಳು ಶಾಲೆ ಬಿಡುವುದು ಮತ್ತು ಡಿಜಿಟಲ್ ಕಲಿಕೆಯ ಕೊರತೆ',
      mr: 'स्वच्छतागृहांच्या अभावामुळे विद्यार्थ्यांचे गळती प्रमाण आणि डिजिटल शिक्षणातील तूट',
      bn: 'স্যানিটেশন ঘাটতির কারণে শিক্ষার্থীদের স্কুল ত্যাগ এবং ডিজিটাল বৈষম্য',
      or: 'ପରିମଳ ସୁବିଧା ଅଭାବ ଯୋଗୁଁ ଛାତ୍ରଛାତ୍ରୀ ସ୍କୁଲ ଛାଡ଼ିବା ଏବଂ ଡିଜିଟାଲ୍ ଶିକ୍ଷା ବ୍ୟବଧାନ'
    },
    aiRecommendationTemplate: {
      en: (d) => `Construct dedicated bio-sanitation facilities and install solar smart classroom displays in schools in ${d}.`,
      ta: (d) => `${d} பள்ளிகளில் தனிப்பட்ட உயிரி-கழிப்பறைகளைக் கட்டி சூரியசக்தி ஸ்மார்ட் வகுப்பறைகளை அமைக்கவும்.`,
      hi: (d) => `${d} के स्कूलों में समर्पित बायो-शौचालय बनाएं और सोलर स्मार्ट क्लासरूम डिस्प्ले लगाएं।`,
      te: (d) => `${d} పాఠశాలల్లో బయో-టాయిలెట్లను నిర్మించి సోలార్ స్మార్ట్ తరగతి గదులను ఏర్పాటు చేయండి.`,
      kn: (d) => `${d} ಶಾಲೆಗಳಲ್ಲಿ ಜೈವಿಕ ಶೌಚಾಲಯಗಳನ್ನು ನಿರ್ಮಿಸಿ ಸೌರ ಸ್ಮಾರ್ಟ್ ತರಗತಿಗಳನ್ನು ಸ್ಥಾಪಿಸಿ.`,
      mr: (d) => `${d} मधील शाळांमध्ये जैव-शौचालये बांधा आणि स्मार्ट वर्गखोल्या उभारा.`,
      bn: (d) => `${d} এর স্কুলগুলিতে বায়ো-টয়লেট নির্মাণ করুন এবং স্মার্ট ক্লাসরুম স্থাপন করুন।`,
      or: (d) => `${d} ର ବିଦ୍ୟାଳୟଗୁଡ଼ିକରେ ବାୟୋ-ଶୌଚାଳୟ ନିର୍ମାଣ କରନ୍ତୁ ଏବଂ ସ୍ମାର୍ଟ କ୍ଲାସରୁମ୍ ସ୍ଥାପନ କରନ୍ତୁ।`
    },
    scheme: {
      en: 'Samagra Shiksha Abhiyan',
      ta: 'சமக்ர சிக்ஷா அபியான் (ஒருங்கிணைந்த கல்வி இயக்கம்)',
      hi: 'समग्र शिक्षा अभियान',
      te: 'సమగ్ర శిక్షా అభియాన్',
      kn: 'ಸಮಗ್ರ ಶಿಕ್ಷಣ ಅಭಿಯಾನ',
      mr: 'समग्र शिक्षा अभियान',
      bn: 'সমগ্র শিক্ষা অভিযান',
      or: 'ସମଗ୍ର ଶିକ୍ଷା ଅଭିଯାନ'
    },
    analyticalJustification: {
      en: (d, def) => `Public schools in ${d} exhibit a ${def}% amenity deficit, directly affecting student retention and digital literacy.`,
      ta: (d, def) => `${d} அரசுப் பள்ளிகளில் ${def}% அடிப்படை வசதி குறைபாடு உள்ளது, இது மாணவர் சேர்க்கையை பாதிக்கிறது.`,
      hi: (d, def) => `${d} के सरकारी स्कूलों में ${def}% सुविधाओं की कमी है, जो छात्रों की उपस्थिति को प्रभावित करती है।`,
      te: (d, def) => `${d} ప్రభుత్వ పాఠశాలల్లో ${def}% మౌలిక వసతుల కొరత ఉంది.`,
      kn: (d, def) => `${d} ಸರ್ಕಾರಿ ಶಾಲೆಗಳಲ್ಲಿ ${def}% ಸೌಲಭ್ಯಗಳ ಕೊರತೆಯಿದೆ.`,
      mr: (d, def) => `${d} मधील सरकारी शाळांमध्ये ${def}% सुविधांची तूट आहे.`,
      bn: (d, def) => `${d} এর সরকারি স্কুলগুলিতে ${def}% সুযোগ-সুবিধার ঘাটতি রয়েছে।`,
      or: (d, def) => `${d} ସରକାରୀ ବିଦ୍ୟାଳୟଗୁଡ଼ିକରେ ${def}% ସୁବିଧା ଅଭାବ ରହିଛି।`
    }
  }
};

/**
 * Returns a localized district name
 */
export function getLocalizedDistrict(name: string, lang: SupportedLanguageCode): string {
  if (!name || lang === 'en') return name;
  const match = Object.keys(DISTRICT_NAMES).find(
    k => k.toLowerCase() === name.toLowerCase() || name.toLowerCase().includes(k.toLowerCase())
  );
  if (match && DISTRICT_NAMES[match][lang]) {
    return DISTRICT_NAMES[match][lang];
  }
  return name;
}

/**
 * Returns a localized state name
 */
export function getLocalizedState(name: string, lang: SupportedLanguageCode): string {
  if (!name || lang === 'en') return name;
  const match = Object.keys(STATE_NAMES).find(
    k => k.toLowerCase() === name.toLowerCase() || name.toLowerCase().includes(k.toLowerCase())
  );
  if (match && STATE_NAMES[match][lang]) {
    return STATE_NAMES[match][lang];
  }
  return name;
}

/**
 * Returns a localized intervention label (BUILD / FIX / UPGRADE / POLICY)
 */
export function getLocalizedIntervention(type: string, lang: SupportedLanguageCode): string {
  const upper = (type || 'BUILD').toUpperCase();
  if (INTERVENTION_TYPES[upper] && INTERVENTION_TYPES[upper][lang]) {
    return INTERVENTION_TYPES[upper][lang];
  }
  return type;
}

/**
 * Returns a localized urgency label
 */
export function getLocalizedUrgency(urgency: string, lang: SupportedLanguageCode): string {
  const upper = (urgency || 'MEDIUM').toUpperCase();
  if (URGENCY_LABELS[upper] && URGENCY_LABELS[upper][lang]) {
    return URGENCY_LABELS[upper][lang];
  }
  return urgency;
}

/**
 * Returns a localized RecommendedProject object dynamically adapting all text fields
 */
export function getLocalizedRecommendation(project: RecommendedProject, lang: SupportedLanguageCode): RecommendedProject {
  if (lang === 'en') return project;

  const catKey = (project.category in CATEGORY_RECOMMENDATIONS) ? project.category : 'Water';
  const catConfig = CATEGORY_RECOMMENDATIONS[catKey] || CATEGORY_RECOMMENDATIONS.Water;

  const localizedDistrict = getLocalizedDistrict(project.districtName, lang);
  const localizedState = getLocalizedState(project.state, lang);
  const localizedTitle = catConfig.title[lang] || project.title;
  const localizedAiRec = catConfig.aiRecommendationTemplate[lang] 
    ? catConfig.aiRecommendationTemplate[lang](localizedDistrict) 
    : project.aiRecommendation;
  const localizedSummary = catConfig.analyticalJustification[lang]
    ? catConfig.analyticalJustification[lang](localizedDistrict, 65)
    : project.summaryReasoning;

  return {
    ...project,
    title: localizedTitle,
    districtName: localizedDistrict,
    state: localizedState,
    summaryReasoning: localizedSummary,
    aiRecommendation: localizedAiRec,
  };
}

/**
 * Returns localized government project representation
 */
export function getLocalizedGovernmentProject(proj: GovernmentProject, lang: SupportedLanguageCode): GovernmentProject {
  if (lang === 'en') return proj;

  const localizedDistrict = getLocalizedDistrict(proj.district, lang);
  const localizedState = getLocalizedState(proj.state, lang);

  const catKey = (proj.category in CATEGORY_RECOMMENDATIONS) ? proj.category : 'Water';
  const catConfig = CATEGORY_RECOMMENDATIONS[catKey] || CATEGORY_RECOMMENDATIONS.Water;

  return {
    ...proj,
    title: `${catConfig.title[lang] || proj.title} — ${localizedDistrict}`,
    district: localizedDistrict,
    state: localizedState,
    description: catConfig.analyticalJustification[lang] 
      ? catConfig.analyticalJustification[lang](localizedDistrict, Math.round(100 - (proj.beforeAccess || 40)))
      : proj.description,
    aiSummary: catConfig.aiRecommendationTemplate[lang]
      ? catConfig.aiRecommendationTemplate[lang](localizedDistrict)
      : proj.aiSummary
  };
}

/**
 * Returns a localized citizen request summary
 */
export function getLocalizedSignalSummary(req: CitizenRequest, lang: SupportedLanguageCode): string {
  if (lang === 'en') return req.summary_en || req.original_text;

  const catKey = (req.category in CATEGORY_RECOMMENDATIONS) ? req.category : 'Water';
  const catConfig = CATEGORY_RECOMMENDATIONS[catKey] || CATEGORY_RECOMMENDATIONS.Water;
  const localizedDist = getLocalizedDistrict(req.district || req.location || '', lang);

  if (catConfig.aiRecommendationTemplate[lang]) {
    return catConfig.aiRecommendationTemplate[lang](localizedDist);
  }

  return req.summary_en || req.original_text;
}

// Localized Analytical Patterns
export const PATTERN_TRANSLATIONS: Record<string, {
  name: Record<SupportedLanguageCode, string>;
  description: Record<SupportedLanguageCode, string>;
  suggestedIntervention: Record<SupportedLanguageCode, string>;
}> = {
  'PAT-01': {
    name: {
      en: 'Water demand acceleration in urban peripheries',
      ta: 'நகர்ப்புற புறநகர்ப் பகுதிகளில் நீர் தேவை முடுக்கம்',
      hi: 'शहरी परिधीय क्षेत्रों में जल मांग में वृद्धि',
      te: 'పట్టణ శివారు ప్రాంతాలలో నీటి డిమాండ్ పెరుగుదల',
      kn: 'ನಗರ ಹೊರವಲಯಗಳಲ್ಲಿ ನೀರಿನ ಬೇಡಿಕೆ ಹೆಚ್ಚಳ',
      mr: 'शहरी परिघीय भागात पाण्याची मागणी वाढ',
      bn: 'শহরতলির এলাকায় জলের চাহিদার দ্রুত বৃদ্ধি',
      or: 'ସହରତଳି ଅଞ୍ଚଳରେ ଜଳ ଆବଶ୍ୟକତାରେ ଦ୍ରୁତ ବୃଦ୍ଧି'
    },
    description: {
      en: 'Citizen requests for water supply have increased by 31% over 60 days in rapidly growing peri-urban wards where municipal pipelines have not yet reached new housing developments.',
      ta: 'நகராட்சி குழாய் இணைப்புகள் இன்னும் புதிய குடியிருப்பு பகுதிகளுக்கு சென்றடையாத வேகமாக வளரும் புறநகர் வார்டுகளில் குடிநீர் விநியோகத்திற்கான குடிமக்கள் கோரிக்கைகள் 60 நாட்களில் 31% அதிகரித்துள்ளன.',
      hi: 'तेजी से बढ़ते उपनगरीय वार्डों में जहां नगर निगम की पाइपलाइनें अभी तक नए आवासों तक नहीं पहुंची हैं, 60 दिनों में जलापूर्ति की मांग में 31% की वृद्धि हुई है।',
      te: 'మునిసిపల్ పైప్‌లైన్లు ఇంకా చేరని వేగంగా అభివృద్ధి చెందుతున్న శివారు వార్డులలో నీటి సరఫరా కోసం పౌరుల అభ్యర్థనలు 60 రోజుల్లో 31% పెరిగాయి.',
      kn: 'ನಗರ ಪೈಪ್‌ಲೈನ್‌ಗಳು ಇನ್ನೂ ತಲುಪದ ವೇಗವಾಗಿ ಬೆಳೆಯುತ್ತಿರುವ ಉಪನಗರ ವಾರ್ಡ್‌ಗಳಲ್ಲಿ ನೀರಿನ ಸರಬರಾಜು ಕೋರಿಕೆಗಳು 60 ದಿನಗಳಲ್ಲಿ 31% ಹೆಚ್ಚಾಗಿದೆ.',
      mr: 'महानगरपालिका जलवाहिन्या पोहोचू न शकलेल्या वेगाने वाढणाऱ्या उपनगरांमध्ये ६० दिवसांत पाण्याच्या तक्रारींमध्ये ३१% वाढ झाली आहे.',
      bn: 'পৌরসভার পাইপলাইন পৌঁছায়নি এমন দ্রুত বর্ধনশীল শহরতলি ওয়ার্ডগুলিতে ৬০ দিনে জলের দাবিতে নাগরিকদের আবেদন ৩১% বৃদ্ধি পেয়েছে।',
      or: 'ନଗର ନିଗମ ପାଇପଲାଇନ ପହଞ୍ଚି ନଥିବା ଉପନଗରୀୟ ୱାର୍ଡଗୁଡ଼ିକରେ ୬୦ ଦିନରେ ଜଳଯୋଗାଣ ଦାବି ୩୧% ବୃଦ୍ଧି ପାଇଛି।'
    },
    suggestedIntervention: {
      en: 'Advance pipeline augmentation scheduled for FY27 to current fiscal year; deploy interim telemetry-monitored water kiosks in peripheral clusters.',
      ta: 'அடுத்த நிதியாண்டுக்கு திட்டமிடப்பட்ட குழாய் விரிவாக்கத்தை நடப்பு நிதியாண்டுக்கு முன்னெடுக்கவும்; புறநகர் பகுதிகளில் இடைக்கால நீர் கியோஸ்க்குகளை நிறுவவும்.',
      hi: 'वित्त वर्ष 2027 के लिए निर्धारित पाइपलाइन विस्तार को वर्तमान वित्तीय वर्ष में शुरू करें; परिधीय क्षेत्रों में स्वचालित वाटर कियोस्क स्थापित करें।',
      te: 'తదుపరి ఆర్థిక సంవత్సరానికి ప్రణాళిక చేసిన పైప్‌లైన్ విస్తరణను ప్రస్తుత ఆర్థిక సంవత్సరానికి ముందస్తు చేయండి; శివారు ప్రాంతాలలో వాటర్ కియోస్క్‌లను ఏర్పాటు చేయండి.',
      kn: 'ಮುಂದಿನ ಹಣಕಾಸು ವರ್ಷಕ್ಕೆ ನಿಗದಿಯಾಗಿದ್ದ ಪೈಪ್‌ಲೈನ್ ವಿಸ್ತರಣೆಯನ್ನು ಪ್ರಸಕ್ತ ವರ್ಷಕ್ಕೆ ಮುನ್ನಡೆಸಿ; ತುರ್ತು ನೀರಿನ ಕಿಯೋಸ್ಕ್ ಸ್ಥಾಪಿಸಿ.',
      mr: 'पुढील आर्थिक वर्षातील जलवाहिनी विस्तारीकरण काम चालू वर्षात तातडीने हाती घ्यावे आणि स्वयंचलित वॉटर किऑस्क स्थापित करावेत.',
      bn: 'পরবর্তী আর্থিক বছরের পাইপলাইন সম্প্রসারণ এই বছরই শুরু করুন; প্রান্তিক এলাকায় অটোমেটেড ওয়াটার কিয়স্ক স্থাপন করুন।',
      or: 'ପରବର୍ତ୍ତୀ ଆର୍ଥିକ ବର୍ଷ ପାଇଁ ଥିବା ପାଇପଲାଇନ ସମ୍ପ୍ରସାରଣକୁ ଏହି ବର୍ଷ ଆରମ୍ଭ କରନ୍ତୁ ଏବଂ ସ୍ୱୟଂଚାଳିତ ୱାଟର କିଓସ୍କ ସ୍ଥାପନ କରନ୍ତୁ।'
    }
  },
  'PAT-02': {
    name: {
      en: 'Health access bottlenecks correlated with unpaved road corridors',
      ta: 'மண் சாலைகளுடன் தொடர்புடைய சுகாதார அணுகல் தடைகள்',
      hi: 'कच्ची सड़कों के गलियारों से जुड़ी स्वास्थ्य सेवा पहुंच में बाधाएं',
      te: 'మట్టి రోడ్ల కారణంగా ఆరోగ్య సేవల ప్రాప్యతలో అడ్డంకులు',
      kn: 'ಕಚ್ಚಾ ರಸ್ತೆಗಳಿಂದ ಉಂಟಾದ ಆರೋಗ್ಯ ಸೇವೆಗಳ ಅಡೆತಡೆಗಳು',
      mr: 'कच्च्या रस्त्यांमुळे आरोग्य सेवा मिळण्यात अडथळे',
      bn: 'কাঁচা রাস্তার কারণে স্বাস্থ্যসেবা পাওয়ার ক্ষেত্রে বাধা',
      or: 'କଞ୍ଚା ରାସ୍ତା ଯୋଗୁଁ ସ୍ୱାସ୍ଥ୍ୟସେବା ପାଇବାରେ ବାଧା'
    },
    description: {
      en: 'Patient transfer delay reports and unattended medical grievances correlate strongly with road crater clusters within an 8km radius of sub-divisional hospital centres.',
      ta: 'துணைப்பிரிவு மருத்துவமனை மையங்களின் 8 கி.மீ சுற்றளவில் உள்ள சாலைக் குழிகள் ஆம்புலன்ஸ் தாமதங்கள் மற்றும் அவசர சிகிச்சை தடைகளுடன் வலுவான தொடர்பு கொண்டுள்ளன.',
      hi: 'उप-विभागीय अस्पताल केंद्रों के 8 किमी के दायरे में गड्ढों वाली सड़कें एम्बुलेंस की देरी और अनसुलझी चिकित्सा शिकायतों से सीधे संबंधित हैं।',
      te: 'ఉప-విభాగ ఆసుపత్రుల నుండి 8 కిమీ పరిధిలో దెబ్బతిన్న రహదారులు అంబులెన్స్ ఆలస్యాలు మరియు అత్యవసర సమస్యలకు కారణమవుతున్నాయి.',
      kn: 'ಆಸ್ಪತ್ರೆಗಳ 8 ಕಿಮೀ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ರಸ್ತೆ ಗುಂಡಿಗಳು ತುರ್ತು ವೈದ್ಯಕೀಯ ಚಿಕಿತ್ಸಾ ವಿಳಂಬಕ್ಕೆ ನೇರವಾಗಿ ಕಾರಣವಾಗಿವೆ.',
      mr: 'रुग्णालयांच्या ८ किमी परिसरातील खड्डेयुक्त रस्ते रुग्णवाहिका विलंब आणि आरोग्य तक्रारींशी थेट संबंधित आहेत.',
      bn: 'হাসপাতালের ৮ কিমি ব্যাসার্ধের মধ্যে ভাঙাচোরা রাস্তা অ্যাম্বুলেন্সের দেরি এবং চিকিৎসা সেবার বাধার সাথে সরাসরি যুক্ত।',
      or: 'ଡାକ୍ତରଖାନାର ୮ କିମି ପରିସୀମାରେ ଭଙ୍ଗା ରାସ୍ତା ଯୋଗୁଁ ଆମ୍ବୁଲାନ୍ସ ବିଳମ୍ବ ଓ ଚିକିତ୍ସା ସେବାରେ ବାଧା ଉପୁଜୁଛି।'
    },
    suggestedIntervention: {
      en: 'Prioritize asphalt corridor paving for NHM emergency transit corridors; commission multi-agency works audit between PWD and Health ministry.',
      ta: 'என்.எச்.எம் அவசர போக்குவரத்து வழித்தடங்களுக்கு முன்னுரிமை தார் சாலை அமைக்கவும்; பொதுப்பணித்துறை மற்றும் சுகாதார அமைச்சகத்தின் கூட்டு தணிக்கையை தொடங்கவும்.',
      hi: 'आपातकालीन पारगमन गलियारों के लिए डामर सड़क निर्माण को प्राथमिकता दें; पीडब्ल्यूडी और स्वास्थ्य मंत्रालय के बीच संयुक्त कार्य शुरू करें।',
      te: 'అత్యవసర రవాణా కారిడార్లకు తారు రోడ్డు నిర్మాణానికి ప్రాధాన్యత ఇవ్వండి; సంయుక్త కార్యాచరణను ప్రారంభించండి.',
      kn: 'ತುರ್ತು ಚಿಕಿತ್ಸಾ ಮಾರ್ಗಗಳಿಗೆ ಆದ್ಯತೆಯ ಡಾಂಬರು ರಸ್ತೆ ನಿರ್ಮಿಸಿ; ಜಂಟಿ ಪರಿಶೀಲನೆ ನಡೆಸಿ.',
      mr: 'तातडीच्या आरोग्य मार्गांचे डांबरीकरण प्राधान्याने पूर्ण करावे आणि संयुक्त पाहणी करावी.',
      bn: 'জরুরি স্বাস্থ্য করিডোরের জন্য পিচ ঢালাইয়ের রাস্তাকে অগ্রাধিকার দিন; যৌথ তদারকি শুরু করুন।',
      or: 'ଜରୁରୀକାଳୀନ ସ୍ୱାସ୍ଥ୍ୟ କୋରିଡର ପାଇଁ ପିଚ୍ ରାସ୍ତା ନିର୍ମାଣକୁ ପ୍ରାଥମିକତା ଦିଅନ୍ତୁ।'
    }
  },
  'PAT-03': {
    name: {
      en: 'Power grid tripping under extreme localized summer peaks',
      ta: 'கோடை உச்ச சுமைகளின் கீழ் மின் கட்டமைப்பு முடக்கம்',
      hi: 'ग्रीष्मकालीन अत्यधिक भार के कारण पावर ग्रिड ट्रिपिंग',
      te: 'వేసవి అధిక డిమాండ్ వల్ల విద్యుత్ గ్రిడ్ సమస్యలు',
      kn: 'ಬೇಸಿಗೆಯ ಗರಿಷ್ಠ ಹೊರೆಯಲ್ಲಿ ವಿದ್ಯುತ್ ಗ್ರಿಡ್ ವೈಫಲ್ಯ',
      mr: 'उन्हाळ्यातील कमाल भारामुळे वीज पुरवठा खंडित होणे',
      bn: 'গ্রীষ্মকালীন অতিরিক্ত লোডের কারণে পাওয়ার গ্রিড ট্রিপিং',
      or: 'ଗ୍ରୀଷ୍ମକାଳୀନ ଅତ୍ୟଧିକ ଚାପ ଯୋଗୁଁ ବିଦ୍ୟୁତ ଗ୍ରିଡ୍ ସମସ୍ୟା'
    },
    description: {
      en: 'Unscheduled feeder outages spike by 45% during peak afternoon hours in high-density informal settlements with overloaded 11kV distribution transformers.',
      ta: 'அதிக அடர்த்தி கொண்ட குடியிருப்பு பகுதிகளில் அதிகப்படியான சுமையேற்றப்பட்ட 11kV மின்மாற்றிகள் காரணமாக மதிய நேரங்களில் திட்டமிடப்படாத மின்வெட்டு 45% உயர்கிறது.',
      hi: 'अत्यधिक लोड वाले 11kV वितरण ट्रांसफार्मरों के कारण घनी आबादी वाली बस्तियों में दोपहर के समय अघोषित बिजली कटौती 45% तक बढ़ जाती है।',
      te: 'ఓవర్‌లోడ్ అయిన 11kV ట్రాన్స్‌ఫార్మర్ల వల్ల మధ్యాహ్నం వేళల్లో అప్రకటిత విద్యుత్ కోతలు 45% పెరుగుతున్నాయి.',
      kn: 'ಅತಿಯಾದ ಭಾರವಿರುವ 11kV ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್‌ಗಳ ಕಾರಣದಿಂದ ಮಧ್ಯಾಹ್ನ ಅನಿಗದಿತ ವಿದ್ಯುತ್ ಕಡಿತ 45% ಹೆಚ್ಚಾಗಿದೆ.',
      mr: 'जादा भार असलेल्या ११ केव्ही ट्रान्सफॉर्मर्समुळे दुपारी अघोषित वीज खंडित होण्याचे प्रमाण ४५% वाढले आहे.',
      bn: 'অতিরিক্ত লোডযুক্ত ১১কেভি ট্রান্সফরমারের কারণে দুপুরে অনিয়মিত বিদ্যুৎ বিভ্রাট ৪৫% বৃদ্ধি পায়।',
      or: 'ଅତ୍ୟଧିକ ଲୋଡ୍ ଥିବା ୧୧ କେଭି ଟ୍ରାନ୍ସଫର୍ମର ଯୋଗୁଁ ଅପରାହ୍ନରେ ବିଦ୍ୟୁତ କାଟ ୪୫% ବୃଦ୍ଧି ପାଉଛି।'
    },
    suggestedIntervention: {
      en: 'Sanction immediate deployment of 15 supplementary distribution substations and dynamic thermal feeder monitors under RDSS scheme.',
      ta: 'RDSS திட்டத்தின் கீழ் 15 துணை விநியோக துணை மின்நிலையங்கள் மற்றும் தானியங்கி கண்காணிப்பிகளை உடனடியாக நிறுவ அனுமதிக்கவும்.',
      hi: 'आरडीएसएस योजना के तहत 15 अतिरिक्त वितरण सब-स्टेशनों और थर्मल फीडर मॉनिटर की तत्काल स्थापना को स्वीकृति दें।',
      te: 'RDSS పథకం కింద 15 అదనపు సబ్‌స్టేషన్ల ఏర్పాటుకు తక్షణ ఆమోదం తెలపండి.',
      kn: 'ಆರ್‌ಡಿಎಸ್‌ಎಸ್ ಯೋಜನೆಯಡಿ 15 ಹೆಚ್ಚುವರಿ ಸಬ್‌ಸ್ಟೇಷನ್‌ಗಳನ್ನು ತಕ್ಷಣವೇ ಮಂಜೂರು ಮಾಡಿ.',
      mr: 'आरडीएसएस योजनेअंतर्गत १५ अतिरिक्त उपकेंद्रे आणि थर्मल मॉनिटर्स तातडीने मंजूर करावेत.',
      bn: 'RDSS প্রকল্পের অধীনে ১৫টি অতিরিক্ত সাব-স্টেশন অবিলম্বে অনুমোদন করুন।',
      or: 'RDSS ଯୋଜନା ଅଧୀନରେ ୧୫ଟି ଅତିରିକ୍ତ ସବ୍-ଷ୍ଟେସନ୍ ତୁରନ୍ତ ମଞ୍ଜୁର କରନ୍ତୁ।'
    }
  }
};

/**
 * Returns a localized analytical pattern
 */
export function getLocalizedPattern(pat: any, lang: SupportedLanguageCode): any {
  if (lang === 'en') return pat;

  const translation = PATTERN_TRANSLATIONS[pat.id];
  const localizedDistricts = pat.affectedDistricts.map((d: any) => ({
    ...d,
    name: getLocalizedDistrict(d.name, lang),
    state: getLocalizedState(d.state, lang)
  }));

  if (!translation) {
    return {
      ...pat,
      affectedDistricts: localizedDistricts
    };
  }

  return {
    ...pat,
    name: translation.name[lang] || pat.name,
    description: translation.description[lang] || pat.description,
    suggestedIntervention: translation.suggestedIntervention[lang] || pat.suggestedIntervention,
    affectedDistricts: localizedDistricts
  };
}

// Localized Community Issues
export const COMMUNITY_ISSUE_TRANSLATIONS: Record<string, {
  title: Record<SupportedLanguageCode, string>;
  scheme: Record<SupportedLanguageCode, string>;
}> = {
  'ISSUE-WAT-001': {
    title: {
      en: 'Water access deficit & pipeline pressure collapse',
      ta: 'நீர் அணுகல் பற்றாக்குறை & குழாய் அழுத்த வீழ்ச்சி',
      hi: 'जल उपलब्धता की कमी और पाइपलाइन दबाव में गिरावट',
      te: 'నీటి లభ్యత లోటు మరియు పైప్‌లైన్ పీడన పతనం',
      kn: 'ನೀರಿನ ಲಭ್ಯತೆಯ ಕೊರತೆ ಮತ್ತು ಪೈಪ್‌ಲೈನ್ ಒತ್ತಡದ ಕುಸಿತ',
      mr: 'पाण्याची टंचाई आणि जलवाहिनीचा दाब कमी होणे',
      bn: 'জলের ঘাটতি এবং পাইপলাইনের চাপ হ্রাস',
      or: 'ଜଳ ଅଭାବ ଏବଂ ପାଇପଲାଇନ୍ ଚାପ ହ୍ରାସ'
    },
    scheme: {
      en: 'Jal Jeevan Mission (JJM)',
      ta: 'ஜல் ஜீவன் மிஷன் (JJM)',
      hi: 'जल जीवन मिशन (JJM)',
      te: 'జల్ జీవన్ మిషన్ (JJM)',
      kn: 'ಜಲ್ ಜೀವನ್ ಮಿಷನ್ (JJM)',
      mr: 'जल जीवन मिशन (JJM)',
      bn: 'জল জীবন মিশন (JJM)',
      or: 'ଜଳ ଜୀବନ ମିଶନ (JJM)'
    }
  },
  'ISSUE-RD-002': {
    title: {
      en: 'Arterial hospital access corridor craters & washouts',
      ta: 'மருத்துவமனை முக்கிய அணுகல் சாலை பள்ளங்கள் & சேதம்',
      hi: 'अस्पताल पहुंच मार्ग पर गड्ढे और सड़क क्षति',
      te: 'ఆసుపత్రి ప్రధాన రహదారి గుంతలు మరియు దెబ్బతిన్న మార్గం',
      kn: 'ಆಸ್ಪತ್ರೆ ಮುಖ್ಯ ರಸ್ತೆಯ ಗುಂಡಿಗಳು ಮತ್ತು ಹಾನಿ',
      mr: 'रुग्णालय मुख्य रस्त्यावरील खड्डे व नुकसान',
      bn: 'হাসপাতাল সংযোগকারী রাস্তার গর্ত ও ক্ষতি',
      or: 'ଡାକ୍ତରଖାନା ମୁଖ୍ୟ ରାସ୍ତାରେ ଖାଲଖମା ଓ କ୍ଷତି'
    },
    scheme: {
      en: 'PMGSY Rural Connectivity',
      ta: 'பிரதான் மந்திரி கிராமப்புற சாலை திட்டம் (PMGSY)',
      hi: 'प्रधानमंत्री ग्राम सड़क योजना (PMGSY)',
      te: 'ప్రధాన మంత్రి గ్రామ్ సడక్ యోజన (PMGSY)',
      kn: 'ಪ್ರಧಾನ ಮಂತ್ರಿ ಗ್ರಾಮ ಸಡಕ್ ಯೋಜನೆ (PMGSY)',
      mr: 'पंतप्रधान ग्राम सडक योजना (PMGSY)',
      bn: 'প্রধানমন্ত্রী গ্রাম সড়ক যোজনা (PMGSY)',
      or: 'ପ୍ରଧାନମନ୍ତ୍ରୀ ଗ୍ରାମ ସଡ଼କ ଯୋଜନା (PMGSY)'
    }
  },
  'ISSUE-HC-003': {
    title: {
      en: 'Primary health sub-centre staffing & drug shortages',
      ta: 'ஆரம்ப சுகாதார துணை மைய பணியாளர் & மருந்து பற்றாக்குறை',
      hi: 'प्राथमिक स्वास्थ्य उप-केंद्र में स्टाफ और दवाओं की कमी',
      te: 'ప్రాథમિક ఆరోగ్య ఉప-కేంద్రంలో సిబ్బంది మరియు మందుల కొరత',
      kn: 'ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಉಪ-ಕೇಂದ್ರದಲ್ಲಿ ಸಿಬ್ಬಂದಿ ಮತ್ತು ಔಷಧಿ ಕೊರತೆ',
      mr: 'प्राथमिक आरोग्य उपकेंद्रात कर्मचारी व औषधांची टंचाई',
      bn: 'প্রাথমিক স্বাস্থ্য উপকেন্দ্রে কর্মী ও ওষুধের ঘাটতি',
      or: 'ପ୍ରାଥମିକ ସ୍ୱାସ୍ଥ୍ୟ ଉପ-କେନ୍ଦ୍ରରେ କର୍ମଚାରୀ ଓ ଔଷଧ ଅଭାବ'
    },
    scheme: {
      en: 'National Health Mission (NHM)',
      ta: 'தேசிய சுகாதார இயக்கம் (NHM)',
      hi: 'राष्ट्रीय स्वास्थ्य मिशन (NHM)',
      te: 'జాతీయ ఆరోగ్య మిషన్ (NHM)',
      kn: 'ರಾಷ್ಟ್ರೀಯ ಆರೋಗ್ಯ ಅಭಿಯಾನ (NHM)',
      mr: 'राष्ट्रीय आरोग्य अभियान (NHM)',
      bn: 'জাতীয় স্বাস্থ্য মিশন (NHM)',
      or: 'ଜାତୀୟ ସ୍ୱାସ୍ଥ୍ୟ ମିଶନ (NHM)'
    }
  },
  'ISSUE-POW-004': {
    title: {
      en: 'Agricultural power transformer breakdown cycle',
      ta: 'விவசாய மின்மாற்றி முறிவு சுழற்சி',
      hi: 'कृषि विद्युत ट्रांसफार्मर खराबी की समस्या',
      te: 'వ్యవసాయ విద్యుత్ ట్రాన్స్‌ఫార్మర్ వైఫల్య సమస్య',
      kn: 'ಕೃಷಿ ವಿದ್ಯುತ್ ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್ ವೈಫಲ್ಯದ ಸಮಸ್ಯೆ',
      mr: 'कृषी वीज ट्रान्सफॉर्मर वारंवार बिघाड',
      bn: 'কৃষি বিদ্যুৎ ট্রান্সফরমার বিকলের সমস্যা',
      or: 'କୃଷି ବିଦ୍ୟୁତ ଟ୍ରାନ୍ସଫର୍ମର ଖରାପ ସମସ୍ୟା'
    },
    scheme: {
      en: 'Revamped Distribution Sector Scheme',
      ta: 'சீர்திருத்தப்பட்ட மின் விநியோகத் திட்டம் (RDSS)',
      hi: 'पुनर्गठित वितरण क्षेत्र योजना (RDSS)',
      te: 'పునర్వ్యవస్థీకరించిన పంపిణీ రంగ పథకం (RDSS)',
      kn: 'ಮರುರೂಪಿಸಲಾದ ವಿತರಣಾ ವಲಯ ಯೋಜನೆ (RDSS)',
      mr: 'सुधारित वितरण क्षेत्र योजना (RDSS)',
      bn: 'পুনর্গঠিত বিদ্যুৎ বণ্টন ক্ষেত্র প্রকল্প (RDSS)',
      or: 'ପୁନର୍ଗଠିତ ବିତରଣ କ୍ଷେତ୍ର ଯୋଜନା (RDSS)'
    }
  },
  'ISSUE-SAN-005': {
    title: {
      en: 'Stormwater culvert siltation & open drainage overflow',
      ta: 'மழைநீர் வடிகால் தூர்ந்துபோதல் & திறந்த வடிகால் வழிதல்',
      hi: 'तूफानी जल पुलिया में गाद और खुली नाली का उफान',
      te: 'తుఫాను నీటి కాలువల పూడిక మరియు బహిరంగ డ్రైనేజీ పొంగిపొర్లడం',
      kn: 'ಮಳೆನೀರು ಚರಂಡಿ ಹೂಳೆತ್ತುವಿಕೆ ಮತ್ತು ತೆರೆದ ಚರಂಡಿ ಉಕ್ಕಿ ಹರಿಯುವುದು',
      mr: 'पावसाळी नाल्यांमध्ये गाळ साचणे आणि उघडी गटारे तुंबणे',
      bn: 'বৃষ্টির জলের কালভার্টে পলি জমা এবং খোলা নর্দমার উপচে পড়া',
      or: 'ବର୍ଷା ଜଳ କଲଭର୍ଟରେ ପଙ୍କ ଜମିବା ଓ ଖୋଲା ଡ୍ରେନେଜ୍ ଉଛୁଳିବା'
    },
    scheme: {
      en: 'Swachh Bharat Mission (Urban)',
      ta: 'தூய்மை இந்தியா இயக்கம் (நகர்ப்புறம்)',
      hi: 'स्वच्छ भारत मिशन (शहरी)',
      te: 'స్వచ్ఛ భారత్ మిషన్ (పట్టణ)',
      kn: 'ಸ್ವಚ್ಛ ಭಾರತ ಮಿಷನ್ (ನಗರ)',
      mr: 'स्वच्छ भारत अभियान (नागरी)',
      bn: 'স্বচ্ছ ভারত মিশন (নগর)',
      or: 'ସ୍ୱଚ୍ଛ ଭାରତ ମିଶନ (ସହରାଞ୍ଚଳ)'
    }
  }
};

/**
 * Returns a localized community issue
 */
export function getLocalizedCommunityIssue(issue: any, lang: SupportedLanguageCode): any {
  if (lang === 'en') return issue;

  const translation = COMMUNITY_ISSUE_TRANSLATIONS[issue.id];
  const parts = (issue.location || '').split(',');
  const dist = parts[0]?.trim() || '';
  const st = parts[1]?.trim() || '';
  const localizedDist = getLocalizedDistrict(dist, lang);
  const localizedSt = getLocalizedState(st, lang);
  const localizedLoc = `${localizedDist}, ${localizedSt}`;

  if (!translation) {
    return {
      ...issue,
      location: localizedLoc
    };
  }

  return {
    ...issue,
    title: translation.title[lang] || issue.title,
    relatedScheme: translation.scheme[lang] || issue.relatedScheme,
    location: localizedLoc
  };
}

// Overview Executive Finding Localization
export const OVERVIEW_CONCLUSION_TRANSLATION: {
  title: Record<SupportedLanguageCode, string>;
  whyMatters: Record<SupportedLanguageCode, string>;
} = {
  title: {
    en: 'Water pipeline deficit requires immediate booster sanction in Guntur',
    ta: 'குண்டூரில் குடிநீர் குழாய் பற்றாக்குறைக்கு உடனடி பூஸ்டர் அனுமதி தேவை',
    hi: 'गुंटूर में जल पाइपलाइन घाटे के लिए तत्काल बूस्टर मंजूरी की आवश्यकता है',
    te: 'గుంటూరులో నీటి పైప్‌లైన్ లోటుకు తక్షణ బూస్టర్ మంజూరు అవసరం',
    kn: 'ಗುಂಟೂರಿನಲ್ಲಿ ನೀರಿನ ಪೈಪ್‌ಲೈನ್ ಕೊರತೆಗೆ ತಕ್ಷಣದ ಬೂಸ್ಟರ್ ಮಂಜೂರಾತಿ ಅಗತ್ಯವಿದೆ',
    mr: 'गुंटूरमध्ये पाण्याच्या पाईपलाईन तुटवड्यासाठी तात्काळ बूस्टर मंजुरी आवश्यक आहे',
    bn: 'গুন্টুরে জল পাইপলাইনের ঘাটতি মেটাতে অবিলম্বে বুস্টার পাম্প অনুমোদন প্রয়োজন',
    or: 'ଗୁଣ୍ଟୁରରେ ଜଳ ପାଇପଲାଇନ୍ ଅଭାବ ପାଇଁ ତୁରନ୍ତ ବୁଷ୍ଟର ମଞ୍ଜୁରୀ ଆବଶ୍ୟକ'
  },
  whyMatters: {
    en: '742 citizen reports combined with Jal Jeevan Mission water infrastructure data indicate a significant pipeline pressure deficit affecting multiple habitations in Guntur.',
    ta: 'ஜல் ஜீவன் மிஷன் கட்டமைப்புத் தரவுகளுடன் 742 குடிமக்கள் புகார்கள் குண்டூரில் உள்ள பல பகுதிகளில் கடுமையான குழாய் அழுத்தக் குறைபாட்டைக் காட்டுகின்றன.',
    hi: 'जल जीवन मिशन अवसंरचना डेटा के साथ 742 नागरिक रिपोर्ट दर्शाती हैं कि गुंटूर की कई बस्तियों में गंभीर पाइपलाइन दबाव की कमी है।',
    te: 'జల్ జీవన్ మిషన్ మౌలిక సదుపాయాల డేటాతో కలిపి 742 పౌర నివేదికలు గుంటూరులోని అనేక ప్రాంతాలలో తీవ్రమైన పైప్‌లైన్ పీడన లోటును సూచిస్తున్నాయి.',
    kn: 'ಜಲ ಜೀವನ್ ಮಿಷನ್ ಮೂಲಸೌಕರ್ಯ ದತ್ತಾಂಶದೊಂದಿಗೆ 742 ನಾಗರಿಕ ವರದಿಗಳು ಗುಂಟೂರಿನ ಅನೇಕ ಪ್ರದೇಶಗಳಲ್ಲಿ ತೀವ್ರ ಪೈಪ್‌ಲೈನ್ ಒತ್ತಡದ ಕೊರತೆಯನ್ನು ಸೂಚಿಸುತ್ತವೆ.',
    mr: 'जल जीवन मिशन पायाभूत सुविधांच्या आकडेवारीसह 742 नागरिक अहवाल गुंटूरमधील अनेक वस्त्यांमध्ये पाईपलाईनचा दाब कमी असल्याचे दर्शवतात.',
    bn: 'জল জীবন মিশন পরিকাঠামো তথ্যের সাথে 742 নাগরিক প্রতিবেদন নির্দেশ করে যে গুন্টুরের একাধিক অঞ্চলে পাইপলাইনের চাপে তীব্র ঘাটতি দেখা দিয়েছে।',
    or: 'ଜଳ ଜୀବନ ମିଶନ ଭିତ୍ତିଭୂମି ତଥ୍ୟ ସହିତ 742 ନାଗରିକ ଅଭିଯୋଗ ଦର୍ଶାଉଛି ଯେ ଗୁଣ୍ଟୁରର ଅନେକ ଅଞ୍ଚଳରେ ପାଇପଲାଇନ୍ ଚାପରେ ଗମ୍ଭୀର ଅଭାବ ରହିଛି।'
  }
};

export function getLocalizedOverviewConclusion(lang: SupportedLanguageCode): {
  title: string;
  whyMatters: string;
  district: string;
  state: string;
} {
  return {
    title: OVERVIEW_CONCLUSION_TRANSLATION.title[lang] || OVERVIEW_CONCLUSION_TRANSLATION.title.en,
    whyMatters: OVERVIEW_CONCLUSION_TRANSLATION.whyMatters[lang] || OVERVIEW_CONCLUSION_TRANSLATION.whyMatters.en,
    district: getLocalizedDistrict('Guntur', lang),
    state: getLocalizedState('Andhra Pradesh', lang)
  };
}

export const OVERVIEW_PRIORITY_ISSUES_TRANSLATIONS: Record<string, {
  title: Record<SupportedLanguageCode, string>;
  statusNote: Record<SupportedLanguageCode, string>;
  trend: Record<SupportedLanguageCode, string>;
  publicFinding: Record<SupportedLanguageCode, string>;
  recommendedAction: Record<SupportedLanguageCode, string>;
}> = {
  'guntur': {
    title: {
      en: 'Water access deficit & pipeline pressure collapse',
      ta: 'நீர் அணுகல் பற்றாக்குறை & குழாய் அழுத்த வீழ்ச்சி',
      hi: 'जल उपलब्धता की कमी और पाइपलाइन दबाव में गिरावट',
      te: 'నీటి లభ్యత లోటు మరియు పైప్‌లైన్ పీడన పతనం',
      kn: 'ನೀರಿನ ಲಭ್ಯತೆಯ ಕೊರತೆ ಮತ್ತು ಪೈಪ್‌ಲೈನ್ ಒತ್ತಡದ ಕುಸಿತ',
      mr: 'पाण्याची टंचाई आणि जलवाहिनीचा दाब कमी होणे',
      bn: 'জলের ঘাটতি এবং পাইপলাইনের চাপ হ্রাস',
      or: 'ଜଳ ଅଭାବ ଏବଂ ପାଇପଲାଇନ୍ ଚାପ ହ୍ରାସ'
    },
    statusNote: {
      en: 'High and rising citizen demand in peri-urban wards',
      ta: 'புறநகர் வார்டுகளில் அதிகரித்து வரும் குடிமக்கள் தேவை',
      hi: 'शहरी बाहरी वार्डों में नागरिकों की बढ़ती मांग',
      te: 'అర్ధ-పట్టణ వార్డులలో పెరుగుతున్న పౌర డిమాండ్',
      kn: 'ಅರೆ-ನಗರ ವಾರ್ಡ್‌ಗಳಲ್ಲಿ ಹೆಚ್ಚುತ್ತಿರುವ ನಾಗರಿಕ ಬೇಡಿಕೆ',
      mr: 'उपनगरीय प्रभागांमध्ये नागरिकांची वाढती मागणी',
      bn: 'উপ-শহরাঞ্চলে ক্রমবর্ধমান নাগরিক চাহিদা',
      or: 'ଉପ-ସହରାଞ୍ଚଳ ୱାର୍ଡଗୁଡ଼ିକରେ ବଢୁଥିବା ନାଗରିକ ଦାବି'
    },
    trend: {
      en: '+22% this month',
      ta: '+22% இந்த மாதம்',
      hi: '+22% इस माह',
      te: '+22% ఈ నెల',
      kn: '+22% ಈ ತಿಂಗಳು',
      mr: '+22% या महिन्यात',
      bn: '+22% এই মাসে',
      or: '+22% ଏହି ମାସରେ'
    },
    publicFinding: {
      en: 'Jal Jeevan Mission (JJM) data records 31.6% non-tap reliance with acute summer aquifer drawdown.',
      ta: 'ஜல் ஜீவன் மிஷன் (JJM) தரவுகள் 31.6% குழாய் இணைப்பின்மை மற்றும் கோடைக்கால நிலத்தடி நீர் பற்றாக்குறையை காட்டுகின்றன.',
      hi: 'जल जीवन मिशन (JJM) डेटा 31.6% गैर-नल निर्भरता और गर्मियों में भूजल गिरावट दर्ज करता है।',
      te: 'జల్ జీవన్ మిషన్ (JJM) డేటా 31.6% కుళాయి రహిత ఆధారపడటం మరియు వేసవి భూగర్భజల క్షీణతను నమోదు చేస్తుంది.',
      kn: 'ಜಲ ಜೀವನ್ ಮಿಷನ್ (JJM) ದತ್ತಾಂಶವು 31.6% ನಲ್ಲಿ ಸಂಪರ್ಕವಿಲ್ಲದಿರುವುದು ಮತ್ತು ಬೇಸಿಗೆಯ ಅಂತರ್ಜಲ ಕುಸಿತವನ್ನು ದಾಖಲಿಸುತ್ತದೆ.',
      mr: 'जल जीवन मिशन (JJM) डेटा 31.6% नळ नसलेली अवलंबित्व नोंदवतो.',
      bn: 'জল জীবন মিশন (JJM) তথ্য অনুযায়ী 31.6% নলকূপ নির্ভর এবং গ্রীষ্মকালীন ভূগর্ভস্থ জলস্তর হ্রাস নথিভুক্ত হয়েছে।',
      or: 'ଜଳ ଜୀବନ ମିଶନ (JJM) ତଥ୍ୟ ଅନୁସାରେ 31.6% ଅଣ-ଟ୍ୟାପ୍ ନିର୍ଭରଶୀଳତା ଦେଖାଯାଇଛି।'
    },
    recommendedAction: {
      en: 'Sanction 18.4 km trunk line booster pump & secondary reservoir feeder under JJM priority funds.',
      ta: 'JJM முன்னுரிமை நிதியின் கீழ் 18.4 கிமீ பிரதான குழாய் பூஸ்டர் பம்ப் மற்றும் இரண்டாம் நிலை நீர்த்தேக்கத்தை அனுமதிக்கவும்.',
      hi: 'JJM प्राथमिकता निधि के तहत 18.4 किमी ट्रंक लाइन बूस्टर पंप और द्वितीयक जलाशय फीडर स्वीकृत करें।',
      te: 'JJM ప్రాధాన్యత నిధుల కింద 18.4 కి.మీ ట్రంక్ లైన్ బూస్టర్ పంప్ మరియు రిజర్వాయర్ ఫీడర్‌ను మంజూరు చేయండి.',
      kn: 'JJM ಆದ್ಯತೆಯ ನಿಧಿಯಡಿಯಲ್ಲಿ 18.4 ಕಿಮೀ ಮುಖ್ಯ ಲೈನ್ ಬೂಸ್ಟರ್ ಪಂಪ್ ಮತ್ತು ಫೀಡರ್ ಮಂಜೂರು ಮಾಡಿ.',
      mr: 'JJM प्राधान्य निधी अंतर्गत 18.4 किमी ट्रंक लाईन बूस्टर पंप आणि जलाशय फीडर मंजूर करा.',
      bn: 'JJM অগ্রাধিকার তহবিলের আওতায় 18.4 কিমি ট্রাঙ্ক লাইন বুস্টার পাম্প এবং রিজার্ভার ফিডার অনুমোদন করুন।',
      or: 'JJM ପ୍ରାଥମିକତା ପାଣ୍ଠି ଅଧୀନରେ 18.4 କିଲୋମିଟର ଟ୍ରଙ୍କ ଲାଇନ୍ ବୁଷ୍ଟର ପମ୍ପ ମଞ୍ଜୁର କରନ୍ତୁ।'
    }
  },
  'dist-01-roads': {
    title: {
      en: 'Arterial hospital corridor craters & flood washout',
      ta: 'மருத்துவமனை அணுகல் சாலையில் பள்ளங்கள் & வெள்ள சேதம்',
      hi: 'अस्पताल मार्ग पर गड्ढे और बाढ़ से सड़क क्षति',
      te: 'ఆసుపత్రి ప్రధాన రహదారి గుంతలు మరియు వరద కోత',
      kn: 'ಆಸ್ಪತ್ರೆ ರಸ್ತೆಯ ಗುಂಡಿಗಳು ಮತ್ತು ಪ್ರವಾಹ ಹಾನಿ',
      mr: 'रुग्णालय मुख्य रस्त्यावरील खड्डे व पुरामुळे नुकसान',
      bn: 'হাসপাতাল করিডোরে গর্ত এবং বন্যার কারণে ক্ষয়ক্ষতি',
      or: 'ଡାକ୍ତରଖାନା ରାସ୍ତାରେ ଖାଲଖମା ଓ ବନ୍ୟା କ୍ଷତି'
    },
    statusNote: {
      en: 'Emergency transit bottleneck affecting ambulance access',
      ta: 'ஆம்புலன்ஸ் போக்குவரத்தை பாதிக்கும் அவசர போக்குவரத்து நெரிசல்',
      hi: 'एम्बुलेंस पहुंच को प्रभावित करने वाली आपातकालीन बाधा',
      te: 'అంబులెన్స్ ప్రయాణాన్ని ప్రభావితం చేస్తున్న అత్యవసర మార్గ అవరోధం',
      kn: 'ಆಂಬ್ಯುಲೆನ್ಸ್ ಸಂಚಾರಕ್ಕೆ ಅಡ್ಡಿಯಾಗುವ ತುರ್ತು ಸಾರಿಗೆ ಅಡಚಣೆ',
      mr: 'रुग्णवाहिका प्रवासात अडथळा निर्माण करणारी वाहतूक कोंडी',
      bn: 'অ্যাম্বুলেন্স চলাচলে বিঘ্ন সৃষ্টিকারী জরুরি ট্রানজিট সমস্যা',
      or: 'ଆମ୍ବୁଲାନ୍ସ ଯାତାୟାତକୁ ପ୍ରଭାବିତ କରୁଥିବା ଜରୁରୀକାଳୀନ ବାଧା'
    },
    trend: {
      en: '+18% this month',
      ta: '+18% இந்த மாதம்',
      hi: '+18% इस माह',
      te: '+18% ఈ నెల',
      kn: '+18% ಈ ತಿಂಗಳು',
      mr: '+18% या महिन्यात',
      bn: '+18% এই মাসে',
      or: '+18% ଏହି ମାସରେ'
    },
    publicFinding: {
      en: 'PMGSY GIS audit shows pavement roughness index (IRI 5.8) exceeding safety tolerances.',
      ta: 'PMGSY GIS தணிக்கை சாலை கரடுமுரடு குறியீடு (IRI 5.8) பாதுகாப்பு வரம்பை மீறியுள்ளதைக் காட்டுகிறது.',
      hi: 'PMGSY जीआईएस ऑडिट से पता चलता है कि सड़क खुरदरापन सूचकांक (IRI 5.8) सुरक्षा सीमा से अधिक है।',
      te: 'PMGSY GIS ఆడిట్ ప్రకారం రోడ్డు రఫ్‌నెస్ సూచిక (IRI 5.8) భద్రతా పరిమితులను మించిపోయింది.',
      kn: 'PMGSY GIS ಆಡಿಟ್ ರಸ್ತೆ ಒರಟುತನ ಸೂಚ್ಯಂಕ (IRI 5.8) ಸುರಕ್ಷತಾ ಮಿತಿಗಳನ್ನು ಮೀರಿದೆ ಎಂದು ತೋರಿಸುತ್ತದೆ.',
      mr: 'PMGSY GIS ऑडिटनुसार रस्त्याचा खडबडीतपणा निर्देशांक (IRI 5.8) सुरक्षिततेच्या मर्यादेपेक्षा जास्त आहे.',
      bn: 'PMGSY GIS অডিট অনুযায়ী রাস্তার অমসৃণতা সূচক (IRI 5.8) নিরাপত্তা সীমা অতিক্রম করেছে।',
      or: 'PMGSY GIS ଅଡିଟ୍ ଅନୁଯାୟୀ ରାସ୍ତା ଖାଲଖମା ସୂଚକାଙ୍କ (IRI 5.8) ନିରାପତ୍ତା ସୀମା ଅତିକ୍ରମ କରିଛି।'
    },
    recommendedAction: {
      en: 'Execute fast-track hot-mix resurfacing on MDR-44 hospital approach road.',
      ta: 'MDR-44 மருத்துவமனை அணுகு சாலையில் விரைவான தார் மறுசீரமைப்பைச் செயல்படுத்தவும்.',
      hi: 'MDR-44 अस्पताल पहुंच मार्ग पर तेजी से हॉट-मिक्स रिसर्फेसिंग का कार्य करें।',
      te: 'MDR-44 ఆసుపత్రి అప్రోచ్ రోడ్డుపై ఫాస్ట్ ట్రాక్ హాట్-మిక్స్ రీసర్ఫేసింగ్ చేపట్టండి.',
      kn: 'MDR-44 ಆಸ್ಪತ್ರೆ ಸಂಪರ್ಕ ರಸ್ತೆಯಲ್ಲಿ ತ್ವರಿತ ಹಾಟ್-ಮಿಕ್ಸ್ ಡಾಂಬರೀಕರಣ ನಡೆಸಿ.',
      mr: 'MDR-44 रुग्णालय रस्त्यावर त्वरित हॉट-मिक्स रिसर्फेसिंग करा.',
      bn: 'MDR-44 হাসপাতাল সংযোগ সড়কে দ্রুত হট-মিক্স পিচ ঢালাই কাজ সম্পন্ন করুন।',
      or: 'MDR-44 ଡାକ୍ତରଖାନା ସଂଯୋଗ ରାସ୍ତାରେ ତୁରନ୍ତ ହଟ୍-ମିକ୍ସ ପୁନଃନିର୍ମାଣ କାର୍ଯ୍ୟ କରନ୍ତୁ।'
    }
  },
  'dist-04-health': {
    title: {
      en: 'Primary health sub-centre staffing & cold chain shortfalls',
      ta: 'ஆரம்ப சுகாதார துணை மைய பணியாளர் & மருந்து சேமிப்பு பற்றாக்குறை',
      hi: 'प्राथमिक स्वास्थ्य उप-केंद्र में स्टाफ और कोल्ड चेन की कमी',
      te: 'ప్రాథమిక ఆరోగ్య ఉప-కేంద్రంలో సిబ్బంది మరియు కోల్డ్ చైన్ కొరత',
      kn: 'ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಉಪ-ಕೇಂದ್ರದಲ್ಲಿ ಸಿಬ್ಬಂದಿ ಮತ್ತು ಕೋಲ್ಡ್ ಚೈನ್ ಕೊರತೆ',
      mr: 'प्राथमिक आरोग्य उपकेंद्रात कर्मचारी आणि कोल्ड चेन तुटवडा',
      bn: 'প্রাথমিক স্বাস্থ্য উপকেন্দ্রে কর্মী ও কোল্ড চেইনের ঘাটতি',
      or: 'ପ୍ରାଥମିକ ସ୍ୱାସ୍ଥ୍ୟ ଉପ-କେନ୍ଦ୍ରରେ କର୍ମଚାରୀ ଓ କୋଲ୍ଡ ଚେନ୍ ଅଭାବ'
    },
    statusNote: {
      en: 'Patient grievances concentrated in tribal blocks',
      ta: 'பழங்குடியின பகுதிகளில் குவிந்துள்ள நோயாளிகளின் குறைகள்',
      hi: 'आदिवासी ब्लॉकों में केंद्रित रोगियों की शिकायतें',
      te: 'గిరిజన ప్రాంతాల్లో కేంద్రీకృతమైన రోగుల ఫిర్యాదులు',
      kn: 'ಬುಡಕಟ್ಟು ಪ್ರದೇಶಗಳಲ್ಲಿ ಕೇಂದ್ರೀಕೃತವಾಗಿರುವ ರೋಗಿಗಳ ಕುಂದುಕೊರತೆಗಳು',
      mr: 'आदिवासी भागातील रुग्णांच्या तक्रारी',
      bn: 'উপজাতি অধ্যুষিত এলাকায় রোগীদের অভিযোগের ঘনত্ব',
      or: 'ଆଦିବାସୀ ବ୍ଲକଗୁଡ଼ିକରେ ରୋଗୀଙ୍କ ଅଭିଯୋଗ କେନ୍ଦ୍ରୀଭୂତ'
    },
    trend: {
      en: '+15% this month',
      ta: '+15% இந்த மாதம்',
      hi: '+15% इस माह',
      te: '+15% ఈ నెల',
      kn: '+15% ಈ ತಿಂಗಳು',
      mr: '+15% या महिन्यात',
      bn: '+15% এই মাসে',
      or: '+15% ଏହି ମାସରେ'
    },
    publicFinding: {
      en: 'National Health Mission facility audit indicates 118% bed occupancy and medical officer vacancies.',
      ta: 'தேசிய சுகாதார இயக்க தணிக்கை 118% படுக்கை ஆக்கிரமிப்பு மற்றும் மருத்துவர் பணியிட காலியிடங்களைக் காட்டுகிறது.',
      hi: 'राष्ट्रीय स्वास्थ्य मिशन ऑडिट 118% बेड अधिभोग और चिकित्सा अधिकारी रिक्तियों को दर्शाता है।',
      te: 'జాతీయ ఆరోగ్య మిషన్ ఆడిట్ 118% బెడ్ ఆక్యుపెన్సీ మరియు వైద్యుల ఖాళీలను సూచిస్తుంది.',
      kn: 'ರಾಷ್ಟ್ರೀಯ ಆರೋಗ್ಯ ಅಭಿಯಾನದ ಆಡಿಟ್ 118% ಬೆಡ್ ಭರ್ತಿ ಮತ್ತು ವೈದ್ಯರ ಹುದ್ದೆಗಳ ಕೊರತೆಯನ್ನು ತೋರಿಸುತ್ತದೆ.',
      mr: 'राष्ट्रीय आरोग्य अभियान ऑडिट 118% खाटांची व्याप्यता आणि वैद्यकीय अधिकारी रिक्त पदे दर्शवते.',
      bn: 'জাতীয় স্বাস্থ্য মিশন অডিট অনুযায়ী 118% শয্যা দখল এবং চিকিৎসকদের শূন্যপদ রয়েছে।',
      or: 'ଜାତୀୟ ସ୍ୱାସ୍ଥ୍ୟ ମିଶନ ଅଡିଟ୍ ଅନୁଯାୟୀ 118% ବେଡ୍ ପୂରଣ ଏବଂ ଡାକ୍ତର ପଦବୀ ଖାଲି ରହିଛି।'
    },
    recommendedAction: {
      en: 'Deploy mobile healthcare van and install solar cold-chain backup for vaccine stocks.',
      ta: 'நடமாடும் மருத்துவ ஊர்தியை ஈடுபடுத்தி தடுப்பூசி இருப்புக்கான சூரிய ஒளி குளிர்பதன வசதியை நிறுவவும்.',
      hi: 'मोबाइल हेल्थकेयर वैन तैनात करें और टीकों के लिए सोलर कोल्ड-चेन बैकअप स्थापित करें।',
      te: 'మొబైల్ హెల్త్‌కేర్ వ్యాన్‌ను మోహరించండి మరియు వ్యాక్సిన్‌ల కోసం సోలార్ కోల్డ్-చైన్ బ్యాకప్‌ను ఏర్పాటు చేయండి.',
      kn: 'ಮೊಬೈಲ್ ಆರೋಗ್ಯ ವಾಹನ ನಿಯೋಜಿಸಿ ಮತ್ತು ಲಸಿಕೆಗಳಿಗಾಗಿ ಸೌರ ಕೋಲ್ಡ್-ಚೈನ್ ಸ್ಥಾಪಿಸಿ.',
      mr: 'मोबाईल हेल्थकेअर व्हॅन तैनात करा आणि लसींसाठी सोलर कोल्ड-चेन बॅकअप बसवा.',
      bn: 'মোবাইল স্বাস্থ্যসেবা ভ্যান মোতায়েন করুন এবং ভ্যাকসিনের জন্য সৌর কোল্ড-চেইন ব্যাকআপ স্থাপন করুন।',
      or: 'ମୋବାଇଲ୍ ସ୍ୱାସ୍ଥ୍ୟସେବା ଭ୍ୟାନ୍ ନିୟୋଜିତ କରନ୍ତୁ ଏବଂ ସୌର କୋଲ୍ଡ-ଚେନ୍ ବ୍ୟାକଅପ୍ ସ୍ଥାପନ କରନ୍ତୁ।'
    }
  },
  'dist-01-elec': {
    title: {
      en: 'Agricultural power transformer breakdown cycle',
      ta: 'விவசாய மின்மாற்றி முறிவு சுழற்சி',
      hi: 'कृषि विद्युत ट्रांसफार्मर खराबी की समस्या',
      te: 'వ్యవసాయ విద్యుత్ ట్రాన్స్‌ఫార్మర్ వైఫల్య సమస్య',
      kn: 'ಕೃಷಿ ವಿದ್ಯುತ್ ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್ ವೈಫಲ್ಯದ ಸಮಸ್ಯೆ',
      mr: 'कृषी वीज ट्रान्सफॉर्मर वारंवार बिघाड',
      bn: 'কৃষি বিদ্যুৎ ট্রান্সফরমার বিকলের সমস্যা',
      or: 'କୃଷି ବିଦ୍ୟୁତ ଟ୍ରାନ୍ସଫର୍ମର ଖରାପ ସମସ୍ୟା'
    },
    statusNote: {
      en: 'Recurring outage pattern during irrigation cycles',
      ta: 'நீர்ப்பாசன சுழற்சிகளின் போது தொடர்ச்சியான மின்வெட்டு',
      hi: 'सिंचाई चक्र के दौरान बार-बार बिजली कटौती',
      te: 'సాగునీటి కాలంలో నిరంతర విద్యుత్ అంతరాయం',
      kn: 'ನೀರಾವರಿ ಸಮಯದಲ್ಲಿ ಪುನರಾವರ್ತಿತ ವಿದ್ಯುತ್ ಕಡಿತ',
      mr: 'सिंचन काळात वारंવાર वीज खंडित होणे',
      bn: 'সেচ মরসুমে বারবার বিদ্যুৎ বিভ্রাট',
      or: 'ଜଳସେଚନ ସମୟରେ ବାରମ୍ବାର ବିଦ୍ୟୁତ୍ ବିଭ୍ରାଟ'
    },
    trend: {
      en: '+29% this month',
      ta: '+29% இந்த மாதம்',
      hi: '+29% इस माह',
      te: '+29% ఈ నెల',
      kn: '+29% ಈ ತಿಂಗಳು',
      mr: '+29% या महिन्यात',
      bn: '+29% এই মাসে',
      or: '+29% ଏହି ମାସରେ'
    },
    publicFinding: {
      en: 'CEA feeder telemetry records 6.4 daily agricultural feeder trips during paddy transplantation.',
      ta: 'CEA மின் தொடர் தரவுகள் நெல் நடவின் போது தினமும் 6.4 முறை மின்வெட்டு ஏற்படுவதாக பதிவு செய்கின்றன.',
      hi: 'सीईए फीडर डेटा धान रोपाई के दौरान रोजाना 6.4 फीडर ट्रिप दर्ज करता है।',
      te: 'CEA ఫీడర్ టెలిమెట్రీ వరి నాట్ల సమయంలో రోజుకు 6.4 ఫీడర్ ట్రిప్పులను నమోదు చేస్తుంది.',
      kn: 'CEA ಫೀಡರ್ ದತ್ತಾಂಶವು ಭತ್ತ ನಾಟಿ ಸಮಯದಲ್ಲಿ ದಿನಕ್ಕೆ 6.4 ಬಾರಿ ವಿದ್ಯುತ್ ಕಡಿತವನ್ನು ದಾಖಲಿಸುತ್ತದೆ.',
      mr: 'सीईए फीडर डेटा भात लावणी दरम्यान दररोज 6.4 फीडर ट्रिप नोंदवतो.',
      bn: 'সিইএ ফিডার তথ্য ধান রোপণের সময় দৈনিক 6.4 বার বিদ্যুৎ সংযোগ বিচ্ছিন্ন হওয়ার রেকর্ড করেছে।',
      or: 'CEA ଫିଡର୍ ତଥ୍ୟ ଅନୁଯାୟୀ ଧାନ ରୋପଣ ସମୟରେ ଦୈନିକ 6.4 ଥର ବିଦ୍ୟୁତ୍ କଟିଥାଏ।'
    },
    recommendedAction: {
      en: 'Replace overloaded 63 kVA transformers with 100 kVA units under RDSS scheme.',
      ta: 'RDSS திட்டத்தின் கீழ் அதிக சுமையுள்ள 63 kVA மின்மாற்றிகளை 100 kVA அலகுகளுடன் மாற்றவும்.',
      hi: 'आरडीएसएस योजना के तहत ओवरलोड 63 केवीए ट्रांसफार्मर को 100 केवीए इकाइयों से बदलें।',
      te: 'RDSS పథకం కింద ఓవర్‌లోడ్ అయిన 63 kVA ట్రాన్స్‌ఫార్మర్లను 100 kVA యూనిట్లతో భర్తీ చేయండి.',
      kn: 'RDSS ಯೋಜನೆಯಡಿಯಲ್ಲಿ ಓವರ್‌ಲೋಡ್ ಆದ 63 kVA ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್‌ಗಳನ್ನು 100 kVA ಘಟಕಗಳೊಂದಿಗೆ ಬದಲಾಯಿಸಿ.',
      mr: 'आरडीएसएस योजनेअंतर्गत ओव्हरलोड झालेले 63 kVA ट्रान्सफॉर्मर 100 kVA युनिट्सने बदला.',
      bn: 'RDSS প্রকল্পের আওতায় অতিরিক্ত লোডযুক্ত 63 kVA ট্রান্সফরমারগুলিকে 100 kVA ইউনিট দিয়ে প্রতিস্থাপন করুন।',
      or: 'RDSS ଯୋଜନା ଅଧୀନରେ ଓଭରଲୋଡ୍ 63 kVA ଟ୍ରାନ୍ସଫର୍ମରକୁ 100 kVA ୟୁନିଟ୍ ସହିତ ବଦଳାନ୍ତୁ।'
    }
  }
};

export function getLocalizedOverviewPriorityIssue(issue: any, lang: SupportedLanguageCode): any {
  if (lang === 'en') return issue;

  const key = issue.districtId === 'guntur' 
    ? 'guntur' 
    : issue.category === 'Roads' 
    ? 'dist-01-roads' 
    : issue.category === 'Health' 
    ? 'dist-04-health' 
    : 'dist-01-elec';

  const tr = OVERVIEW_PRIORITY_ISSUES_TRANSLATIONS[key];
  const parts = (issue.location || '').split(',');
  const dist = parts[0]?.trim() || '';
  const st = parts[1]?.trim() || '';
  const localizedDist = getLocalizedDistrict(dist, lang);
  const localizedSt = getLocalizedState(st, lang);
  const localizedLoc = `${localizedDist}, ${localizedSt}`;

  if (!tr) {
    return {
      ...issue,
      location: localizedLoc
    };
  }

  return {
    ...issue,
    title: tr.title[lang] || issue.title,
    location: localizedLoc,
    statusNote: tr.statusNote[lang] || issue.statusNote,
    trend: tr.trend[lang] || issue.trend,
    publicFinding: tr.publicFinding[lang] || issue.publicFinding,
    recommendedAction: tr.recommendedAction[lang] || issue.recommendedAction
  };
}

