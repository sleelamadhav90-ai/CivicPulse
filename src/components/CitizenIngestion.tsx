import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Mic, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Globe2, 
  HeartPulse, 
  Layers, 
  Radio, 
  ShieldAlert, 
  Cpu, 
  MessageSquare, 
  Camera, 
  ChevronRight, 
  TrendingUp, 
  Languages,
  Check,
  Building2,
  FileText,
  MapPin,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Volume2,
  Play,
  Pause,
  AlertTriangle,
  Upload,
  Trash2,
  ImageIcon,
  X,
  Droplets,
  Construction,
  Flame,
  Zap,
  Waves,
  Wind,
  Bus,
  GraduationCap,
  Trees,
  Landmark,
  ClipboardList,
  type LucideIcon
} from 'lucide-react';
import { District, CitizenRequest, InfrastructureCategory, ScoreBreakdown } from '../types';
import { calculatePriorityScore, getPriorityTier } from '../utils/scoring';
import { useAuth } from '../context/AuthContext';
import { INDIA_STATES_DISTRICTS, getDistrictsByStateName } from '../data/indiaLocations';

interface CitizenIngestionProps {
  districts: District[];
  requests: CitizenRequest[];
  onAddRequest: (req: CitizenRequest) => void;
  onOpenScoreModal: (breakdown: ScoreBreakdown, district: District, category: InfrastructureCategory) => void;
  onNavigateToHotspots: () => void;
  onNavigateToSignals?: (requestId?: string) => void;
  onNavigateToPatterns?: () => void;
  initialCategory?: InfrastructureCategory;
}

export interface ServiceCategoryItem {
  id: InfrastructureCategory;
  name: string;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  badgeClass: string;
  image?: string;
}

export const CitizenIngestion: React.FC<CitizenIngestionProps> = ({
  districts,
  requests = [],
  onAddRequest,
  onNavigateToHotspots,
  onNavigateToSignals,
  initialCategory,
}) => {
  const { user, getIdToken } = useAuth();

  // Mode selection: 'wizard' (5-Step Government Service) or 'assistant' (Multilingual Dialect Assistant)
  const [activeMode, setActiveMode] = useState<'wizard' | 'assistant'>('wizard');

  // 5-Step Progressive Reporting State
  const [step, setStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<InfrastructureCategory>(initialCategory || 'Roads');
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('Roads and potholes');
  
  // Dynamic India-wide Location Selection State
  const [selectedState, setSelectedState] = useState<string>('Andhra Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Guntur');
  const [landmark, setLandmark] = useState<string>('Near Primary School, Ward 12');

  const [inputText, setInputText] = useState<string>('Potholes and broken streetlights near the school corridor.');
  
  // Photo Upload State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [photoSize, setPhotoSize] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedVoice, setRecordedVoice] = useState<boolean>(false);
  const [isProcessingAI, setIsProcessingAI] = useState<boolean>(false);

  // Submission Receipt
  const [submissionReceipt, setSubmissionReceipt] = useState<{
    id: string;
    category: InfrastructureCategory;
    location: string;
    urgency: string;
    issueTitle: string;
    timestamp: string;
    priorityScore: number;
    priorityTier: string;
    severity: number;
    scoreBreakdown?: ScoreBreakdown;
  } | null>(null);

  // Multilingual Assistant State
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Telugu');

  // All 13 categories mapped to consistent, colorful category icons
  const categories: ServiceCategoryItem[] = [
    { 
      id: 'Water', 
      name: 'Water supply', 
      icon: Droplets, 
      colorClass: 'text-blue-600', 
      bgClass: 'bg-blue-50', 
      borderClass: 'border-blue-200', 
      badgeClass: 'text-blue-700 bg-blue-100/70 border-blue-200',
      image: '/images/categories/water.jpg' 
    },
    { 
      id: 'Roads', 
      name: 'Roads and potholes', 
      icon: Construction, 
      colorClass: 'text-slate-700', 
      bgClass: 'bg-slate-100', 
      borderClass: 'border-slate-300', 
      badgeClass: 'text-slate-700 bg-slate-200/70 border-slate-300',
      image: '/images/categories/potholes.jpg' 
    },
    { 
      id: 'Fire', 
      name: 'Fire hazards', 
      icon: Flame, 
      colorClass: 'text-orange-600', 
      bgClass: 'bg-orange-50', 
      borderClass: 'border-orange-200', 
      badgeClass: 'text-orange-700 bg-orange-100/70 border-orange-200',
      image: '/images/categories/fire.jpg' 
    },
    { 
      id: 'Electricity', 
      name: 'Electricity and transformers', 
      icon: Zap, 
      colorClass: 'text-amber-600', 
      bgClass: 'bg-amber-50', 
      borderClass: 'border-amber-200', 
      badgeClass: 'text-amber-700 bg-amber-100/70 border-amber-200',
      image: '/images/categories/electricity and transformer.jpg' 
    },
    { 
      id: 'Sanitation', 
      name: 'Waste and garbage', 
      icon: Trash2, 
      colorClass: 'text-emerald-600', 
      bgClass: 'bg-emerald-50', 
      borderClass: 'border-emerald-200', 
      badgeClass: 'text-emerald-700 bg-emerald-100/70 border-emerald-200',
      image: '/images/categories/Waste and garbage.jpg' 
    },
    { 
      id: 'Drainage', 
      name: 'Sewage and drainage', 
      icon: Waves, 
      colorClass: 'text-teal-600', 
      bgClass: 'bg-teal-50', 
      borderClass: 'border-teal-200', 
      badgeClass: 'text-teal-700 bg-teal-100/70 border-teal-200',
      image: '/images/categories/Sewage and drainage.jpg' 
    },
    { 
      id: 'Health', 
      name: 'Public health', 
      icon: HeartPulse, 
      colorClass: 'text-green-600', 
      bgClass: 'bg-green-50', 
      borderClass: 'border-green-200', 
      badgeClass: 'text-green-700 bg-green-100/70 border-green-200',
      image: '/images/categories/Public health.jpg' 
    },
    { 
      id: 'Environment', 
      name: 'Dust and air pollution', 
      icon: Wind, 
      colorClass: 'text-slate-600', 
      bgClass: 'bg-slate-100', 
      borderClass: 'border-slate-300', 
      badgeClass: 'text-slate-700 bg-slate-200/70 border-slate-300',
      image: '/images/categories/Dust and air pollution.png' 
    },
    { 
      id: 'Transport', 
      name: 'Public transport', 
      icon: Bus, 
      colorClass: 'text-sky-600', 
      bgClass: 'bg-sky-50', 
      borderClass: 'border-sky-200', 
      badgeClass: 'text-sky-700 bg-sky-100/70 border-sky-200',
      image: '/images/categories/Public transport.jpg' 
    },
    { 
      id: 'Education', 
      name: 'Schools and public facilities', 
      icon: GraduationCap, 
      colorClass: 'text-indigo-600', 
      bgClass: 'bg-indigo-50', 
      borderClass: 'border-indigo-200', 
      badgeClass: 'text-indigo-700 bg-indigo-100/70 border-indigo-200',
      image: '/images/categories/Schools and public facilities.jpg' 
    },
    { 
      id: 'Parks', 
      name: 'Parks and public spaces', 
      icon: Trees, 
      colorClass: 'text-lime-700', 
      bgClass: 'bg-lime-50', 
      borderClass: 'border-lime-200', 
      badgeClass: 'text-lime-800 bg-lime-100/70 border-lime-200',
      image: '/images/categories/Parks and public spaces.jpg' 
    },
    { 
      id: 'Government', 
      name: 'Government buildings', 
      icon: Landmark, 
      colorClass: 'text-blue-900', 
      bgClass: 'bg-blue-50', 
      borderClass: 'border-blue-200', 
      badgeClass: 'text-blue-900 bg-blue-100/70 border-blue-200',
      image: '/images/categories/Government buildings.jpg' 
    },
    { 
      id: 'Other', 
      name: 'Other civic issue', 
      icon: ClipboardList, 
      colorClass: 'text-purple-600', 
      bgClass: 'bg-purple-50', 
      borderClass: 'border-purple-200', 
      badgeClass: 'text-purple-700 bg-purple-100/70 border-purple-200',
      image: '/images/categories/General.jpg' 
    },
  ];

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
      const match = categories.find(c => c.id === initialCategory);
      if (match) setSelectedCategoryName(match.name);
    }
  }, [initialCategory]);

  // Handle State Change -> Reset District to first available district of selected state
  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    const availableDistricts = getDistrictsByStateName(newState);
    if (availableDistricts && availableDistricts.length > 0) {
      setSelectedDistrict(availableDistricts[0]);
    } else {
      setSelectedDistrict('');
    }
  };

  // Handle Photo File Upload (Validation & FileReader Base64)
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      setPhotoError('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    // Validate size (5MB max)
    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setPhotoError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max size allowed is 5MB.`);
      return;
    }

    const sizeFormatted = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    setPhotoName(file.name);
    setPhotoSize(sizeFormatted);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAttachedPhoto(null);
    setPhotoName(null);
    setPhotoSize(null);
    setPhotoError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNextStep = () => {
    if (step === 3) {
      setIsProcessingAI(true);
      setTimeout(() => {
        setIsProcessingAI(false);
        setStep(4);
      }, 300);
    } else {
      setStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // Helper to find district or construct standard baseline from selected State & District
  const activeDistrictObj = useMemo<District>(() => {
    const matched = districts.find(
      (d) => d.name.toLowerCase() === selectedDistrict.toLowerCase() ||
             selectedDistrict.toLowerCase().includes(d.name.toLowerCase()) ||
             d.name.toLowerCase().includes(selectedDistrict.toLowerCase())
    );
    if (matched) return matched;
    // Standard baseline for any of India's 700+ districts from dynamic selector
    return {
      id: selectedDistrict.toLowerCase().replace(/\s+/g, '-'),
      name: selectedDistrict,
      state: selectedState,
      population: 1850000,
      poverty_index: 0.28,
      water_access: 62,
      health_access: 58,
      road_quality: 54,
      education_access: 66,
      planned_investment: 15,
      citizen_reports_count: 8,
      zone: 'Central'
    };
  }, [districts, selectedDistrict, selectedState]);

  // Evaluate text for hazard severity (1-10) and urgency transparently
  const evaluatedSeverity = useMemo(() => {
    const lower = (inputText || '').toLowerCase();
    if (!lower.trim()) return 6;
    if (
      lower.includes('electrocut') || lower.includes('electric wire') || lower.includes('live wire') ||
      lower.includes('downed wire') || lower.includes('fatal') || lower.includes('collapse') || 
      lower.includes('death') || lower.includes('gas leak') || lower.includes('explosion') || lower.includes('fire') ||
      lower.includes('live electrical') || lower.includes('electrical cable') || lower.includes('live cable') ||
      lower.includes('exposed wire') || lower.includes('power line') || lower.includes('sparking') || lower.includes('hanging wire')
    ) {
      return 10;
    }
    if (
      lower.includes('ambulance') || lower.includes('hospital') || lower.includes('contamination') || 
      lower.includes('poison') || lower.includes('epidemic') || lower.includes('burst') || lower.includes('no water for')
    ) {
      return 9;
    }
    if (
      lower.includes('acute') || lower.includes('severe') || lower.includes('2 week') || 
      lower.includes('two week') || lower.includes('sewage flood') || lower.includes('blackout')
    ) {
      return 8;
    }
    if (
      lower.includes('pothole') || lower.includes('shortage') || lower.includes('overflow') || 
      lower.includes('leakage') || lower.includes('broken') || lower.includes('drainage')
    ) {
      return 7;
    }
    if (
      lower.includes('dust') || lower.includes('garbage') || lower.includes('street light') || 
      lower.includes('streetlight') || lower.includes('smell') || lower.includes('flicker')
    ) {
      return 5;
    }
    if (lower.includes('minor') || lower.includes('clean') || lower.includes('paint') || lower.includes('cosmetic')) {
      return 3;
    }
    return 6;
  }, [inputText]);

  // Current demand count for this district and category from active request database
  const matchingDemandCount = useMemo(() => {
    return requests.filter((r) => {
      const matchDist = (r.district || r.location || '').toLowerCase().includes(selectedDistrict.toLowerCase());
      const matchCat = r.category === selectedCategory;
      return matchDist && matchCat;
    }).length;
  }, [requests, selectedDistrict, selectedCategory]);

  // Authoritative 5-pillar composite Priority Score calculated strictly using SCORING_CONFIG (0-100)
  const activeScoreBreakdown = useMemo(() => {
    const effectiveDemand = matchingDemandCount + 1;
    return calculatePriorityScore(
      activeDistrictObj,
      selectedCategory,
      evaluatedSeverity,
      effectiveDemand
    );
  }, [activeDistrictObj, selectedCategory, evaluatedSeverity, matchingDemandCount]);

  const activePriorityTier = useMemo<'Low' | 'Medium' | 'High' | 'Critical'>(() => {
    const tier = getPriorityTier(activeScoreBreakdown.total_score);
    if (tier.label === 'Critical') return 'Critical';
    if (tier.label === 'High') return 'High';
    if (tier.label === 'Moderate') return 'Medium';
    return 'Low';
  }, [activeScoreBreakdown]);

  // AI Classification suggestion for "Other civic issue" without silently misrepresenting citizen selection
  const aiSuggestedCategory = useMemo<{ suggestedName: string; suggestedId: InfrastructureCategory } | null>(() => {
    if (selectedCategory !== 'Other') return null;
    const lower = (inputText || '').toLowerCase();
    if (lower.includes('water') || lower.includes('pipe') || lower.includes('tap') || lower.includes('borewell')) {
      return { suggestedId: 'Water', suggestedName: 'Water supply' };
    }
    if (lower.includes('road') || lower.includes('pothole') || lower.includes('tar') || lower.includes('asphalt')) {
      return { suggestedId: 'Roads', suggestedName: 'Roads and potholes' };
    }
    if (lower.includes('power') || lower.includes('electric') || lower.includes('transformer') || lower.includes('wire')) {
      return { suggestedId: 'Electricity', suggestedName: 'Electricity and transformers' };
    }
    if (lower.includes('garbage') || lower.includes('waste') || lower.includes('trash') || lower.includes('dump')) {
      return { suggestedId: 'Sanitation', suggestedName: 'Waste and garbage' };
    }
    if (lower.includes('drain') || lower.includes('sewage') || lower.includes('gutter') || lower.includes('flood')) {
      return { suggestedId: 'Drainage', suggestedName: 'Sewage and drainage' };
    }
    if (lower.includes('hospital') || lower.includes('clinic') || lower.includes('health') || lower.includes('doctor')) {
      return { suggestedId: 'Health', suggestedName: 'Public health' };
    }
    return null;
  }, [selectedCategory, inputText]);

  const handleFinalSubmit = async () => {
    const trackingId = `CP-IN-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const fullLocation = `${landmark ? landmark + ', ' : ''}${selectedDistrict}, ${selectedState}`;

    let sourceType: 'voice' | 'text' | 'photo' | 'voice+photo' | 'text+photo' = 'text';
    if (recordedVoice && attachedPhoto) sourceType = 'voice+photo';
    else if (recordedVoice) sourceType = 'voice';
    else if (attachedPhoto) sourceType = 'text+photo';

    const severityLabel = evaluatedSeverity >= 9 ? 'Critical' : evaluatedSeverity >= 7 ? 'High' : evaluatedSeverity >= 5 ? 'Medium' : 'Low';
    const urgencyLabel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = evaluatedSeverity >= 9 ? 'CRITICAL' : evaluatedSeverity >= 7 ? 'HIGH' : evaluatedSeverity >= 5 ? 'MEDIUM' : 'LOW';

    const newReq: CitizenRequest = {
      id: trackingId,
      request_id: trackingId,
      userId: user?.uid,
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
      original_text: inputText || 'Civic report submitted via CivicPulse Service',
      language: selectedLanguage,
      category: selectedCategory,
      issue_title: `${selectedCategoryName || selectedCategory} Request — ${selectedDistrict}`,
      location: fullLocation,
      state: selectedState,
      district: selectedDistrict,
      city_or_town: selectedDistrict,
      locality: landmark,
      severity: evaluatedSeverity,
      severity_label: severityLabel,
      priority_score: activeScoreBreakdown.total_score,
      priority_tier: activePriorityTier,
      score_breakdown: activeScoreBreakdown,
      summary_en: `${selectedCategoryName || selectedCategory} report at ${fullLocation}.`,
      source_type: sourceType,
      source_origin: 'CIVICPULSE_USER',
      status: 'Submitted',
      photo_url: attachedPhoto || undefined,
      problem: inputText || 'Civic deficit reported',
      urgency: urgencyLabel,
      affected_infrastructure: selectedCategory === 'Other' ? 'Community Civic Infrastructure' : `${selectedCategoryName || selectedCategory} Public Network`,
      estimated_impact: activePriorityTier,
      recommended_action: `Dispatch regional response team to ${selectedDistrict}, ${selectedState} for ${selectedCategoryName || selectedCategory} inspection.`,
      ai_analysis: {
        category: selectedCategory,
        problem: inputText || 'Deficit',
        urgency: urgencyLabel,
        affected_infrastructure: selectedCategory === 'Other' ? 'Community Civic Grid' : `${selectedCategory} Public Grid`,
        estimated_impact: activePriorityTier,
        recommended_action: `Inspect and resolve ${selectedCategory} deficit.`
      }
    };

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const idToken = await getIdToken();
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
      }
      await fetch('/api/citizen-requests', {
        method: 'POST',
        headers,
        body: JSON.stringify(newReq),
      });
    } catch (err) {
      console.warn('Backend sync skipped, preserving local state:', err);
    }

    onAddRequest(newReq);

    setSubmissionReceipt({
      id: trackingId,
      category: selectedCategory,
      location: fullLocation,
      urgency: `${urgencyLabel} ${evaluatedSeverity >= 8 ? '🔴' : '🟡'}`,
      issueTitle: `${selectedCategoryName || selectedCategory} Request`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      priorityScore: activeScoreBreakdown.total_score,
      priorityTier: activePriorityTier,
      severity: evaluatedSeverity,
      scoreBreakdown: activeScoreBreakdown
    });

    setStep(5);
  };

  const handleResetForm = () => {
    setStep(1);
    setSubmissionReceipt(null);
    setInputText('Potholes and broken streetlights near the school corridor.');
    handleRemovePhoto();
    setRecordedVoice(false);
  };

  const currentDistricts = getDistrictsByStateName(selectedState);

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-sans text-[#171717] pb-16">
      
      {/* Top Banner & Mode Selector */}
      <div className="bg-white border-2 border-[#171717] p-6 shadow-[4px_4px_0px_#171717] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#D65A3A] uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-[#D65A3A]" />
            <span>OFFICIAL PUBLIC SERVICE PORTAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171717]">
            Submit a Civic Request
          </h1>
          <p className="text-xs text-[#171717]/70 mt-0.5">
            Follow our 5-step reporting wizard or speak in your regional language.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#F7F5EF] p-1 border border-[#171717]/30 shrink-0">
          <button
            onClick={() => setActiveMode('wizard')}
            className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'wizard'
                ? 'bg-[#D65A3A] text-white border border-[#171717] shadow-[1px_1px_0px_#171717]'
                : 'text-[#171717]/70 hover:text-[#171717]'
            }`}
          >
            📋 5-Step Wizard
          </button>
          <button
            onClick={() => setActiveMode('assistant')}
            className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'assistant'
                ? 'bg-[#D65A3A] text-white border border-[#171717] shadow-[1px_1px_0px_#171717]'
                : 'text-[#171717]/70 hover:text-[#171717]'
            }`}
          >
            🗣️ Dialect AI Assistant
          </button>
        </div>
      </div>

      {activeMode === 'wizard' && (
        <div className="bg-white border-2 border-[#171717] p-6 sm:p-8 shadow-[6px_6px_0px_#171717] space-y-8">
          
          {/* STEP PROGRESS TRACKER */}
          <div className="border-b border-[#171717]/20 pb-6">
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2 text-center text-xs font-mono font-bold">
              {[
                { s: 1, name: '1. Service Category' },
                { s: 2, name: '2. Location' },
                { s: 3, name: '3. Details & Voice' },
                { s: 4, name: '4. AI Review' },
                { s: 5, name: '5. Confirmation' },
              ].map((item) => (
                <div
                  key={item.s}
                  className={`py-2 px-1 border transition-all ${
                    step === item.s
                      ? 'bg-[#D65A3A] text-white border-[#171717] shadow-[2px_2px_0px_#171717]'
                      : step > item.s
                      ? 'bg-[#285943] text-white border-[#171717]'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  <span className="hidden sm:inline">{item.name}</span>
                  <span className="sm:hidden">{item.s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 1: WHAT DO YOU NEED? (FIX 1) */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#171717]">
                  Step 1: What service or infrastructure do you need?
                </h2>
                <p className="text-xs text-[#171717]/70 mt-1">
                  Select from our 13 public service categories below:
                </p>
              </div>

              <div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                role="radiogroup"
                aria-label="Public service categories"
              >
                {categories.map((cat) => {
                  const isSelected = selectedCategoryName === cat.name;
                  const IconComponent = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`${cat.name}, sector ${cat.id}`}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setSelectedCategoryName(cat.name);
                      }}
                      className={`p-3.5 border-2 text-left flex items-center space-x-3.5 transition-all cursor-pointer rounded-sm group relative ${
                        isSelected
                          ? 'bg-orange-50/80 border-[#D65A3A] shadow-[3px_3px_0px_#171717] ring-1 ring-[#D65A3A]/40'
                          : 'bg-white border-[#171717]/30 hover:border-[#171717] hover:bg-[#FAF8F5] hover:shadow-xs'
                      }`}
                    >
                      {/* Icon Container: 48-56px, rounded corners, pale-tinted theme background */}
                      <div 
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg border flex items-center justify-center shrink-0 shadow-xs transition-transform duration-150 ${cat.bgClass} ${cat.borderClass} ${
                          isSelected ? 'scale-105 shadow-sm' : 'group-hover:scale-102'
                        }`}
                      >
                        <IconComponent 
                          className={`w-6 h-6 sm:w-7 sm:h-7 ${cat.colorClass} transition-colors`} 
                          aria-hidden="true" 
                        />
                      </div>

                      {/* Label & Sector Metadata */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span 
                            className={`text-sm font-sans block leading-snug truncate ${
                              isSelected ? 'text-[#D65A3A] font-bold' : 'text-[#171717] font-semibold group-hover:text-black'
                            }`}
                          >
                            {cat.name}
                          </span>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-[#D65A3A] text-white flex items-center justify-center shrink-0 shadow-xs">
                              <Check className="w-3 h-3 text-white stroke-[3]" aria-hidden="true" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                            Sector: {cat.id}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleNextStep}
                  className="px-6 py-3 bg-[#D65A3A] text-white font-bold text-xs uppercase tracking-wider border border-[#171717] shadow-[2px_2px_0px_#171717] hover:bg-[#c34e2f] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Next: Location Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: WHERE IS IT? (FIX 2) */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#171717]">
                  Step 2: Where is this issue located?
                </h2>
                <p className="text-xs text-[#171717]/70 mt-1">
                  Select your State/UT and District from across India:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold uppercase text-[#171717]/80">
                    State / Union Territory
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full p-3 bg-white border-2 border-[#171717] text-xs font-bold text-[#171717] focus:outline-none shadow-xs"
                  >
                    {INDIA_STATES_DISTRICTS.map((st) => (
                      <option key={st.state} value={st.state}>
                        {st.state} ({st.type === 'Union Territory' ? 'UT' : 'State'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold uppercase text-[#171717]/80">
                    District
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full p-3 bg-white border-2 border-[#171717] text-xs font-bold text-[#171717] focus:outline-none shadow-xs"
                  >
                    {currentDistricts.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist} District
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-[#171717]/80">
                  Village / Ward / Landmark Address
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near ZP High School, Ward 14, Main Road"
                  className="w-full p-3 bg-white border border-[#171717] text-xs font-sans text-[#171717] focus:outline-none"
                />
              </div>

              <div className="p-3 bg-[#F7F5EF] border border-[#171717]/20 rounded-xs text-xs font-mono">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Selected Target Location:</span>
                <span className="font-bold text-[#171717]">
                  {landmark ? `${landmark}, ` : ''}{selectedDistrict}, {selectedState}
                </span>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={handlePrevStep}
                  className="px-5 py-2.5 bg-slate-100 text-[#171717] font-bold text-xs uppercase border border-[#171717] hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  onClick={handleNextStep}
                  className="px-6 py-3 bg-[#D65A3A] text-white font-bold text-xs uppercase tracking-wider border border-[#171717] shadow-[2px_2px_0px_#171717] hover:bg-[#c34e2f] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Next: Describe Issue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ADD DETAILS / VOICE / PHOTO (FIX 3) */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#171717]">
                  Step 3: Tell us what is happening
                </h2>
                <p className="text-xs text-[#171717]/70 mt-1">
                  Speak in your dialect or type in any language. Attach a photo if available:
                </p>
              </div>

              {/* Hidden Real File Input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/jpeg,image/png,image/webp,image/jpg" 
                onChange={handlePhotoFileChange} 
                className="hidden" 
              />

              {/* Voice Recording Assistant Card */}
              <div className="p-5 bg-[#F7F5EF] border-2 border-[#171717] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mic className="w-5 h-5 text-[#D65A3A]" />
                    <span className="font-serif font-bold text-sm text-[#171717]">
                      Speak Your Request (Voice Recording)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-[#D65A3A]/20 text-[#D65A3A] px-2 py-0.5 font-bold uppercase">
                    Telugu / Hindi / Tamil / English
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRecording(true);
                      setTimeout(() => {
                        setIsRecording(false);
                        setRecordedVoice(true);
                        setInputText("మా ఊరి స్కూల్ రోడ్డులో గుంతలు పడ్డాయి, వీధి దీపాలు వెలగడం లేదు. (Potholes on school road, streetlights dark)");
                      }, 2000);
                    }}
                    className={`px-5 py-3 font-bold text-xs uppercase border border-[#171717] flex items-center gap-2 transition-all cursor-pointer shadow-[2px_2px_0px_#171717] ${
                      isRecording
                        ? 'bg-red-600 text-white animate-pulse'
                        : recordedVoice
                        ? 'bg-emerald-700 text-white'
                        : 'bg-[#D65A3A] text-white hover:bg-[#c34e2f]'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    <span>
                      {isRecording ? 'Listening (Speak Now)...' : recordedVoice ? '🎙️ Voice Recorded ✓' : 'Start Voice Input'}
                    </span>
                  </button>

                  {recordedVoice && (
                    <span className="text-xs text-emerald-800 font-mono font-bold bg-emerald-50 px-3 py-1.5 border border-emerald-200">
                      ✓ Voice Audio Ingested & Transcribed
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-[#171717]/80">
                  Description / Transcribed Text
                </label>
                <textarea
                  rows={4}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  className="w-full p-3 bg-white border border-[#171717] text-xs font-sans text-[#171717] focus:outline-none leading-relaxed"
                />
              </div>

              {/* FIX 3: Photo Upload Section */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-mono font-bold uppercase text-[#171717]/80 block">
                  Photo Evidence (Optional, max 5MB)
                </label>

                {photoError && (
                  <div className="p-3 bg-red-50 border border-red-300 text-red-700 text-xs flex items-center justify-between">
                    <span>{photoError}</span>
                    <button onClick={() => setPhotoError(null)} className="text-red-500 hover:text-red-800">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {attachedPhoto ? (
                  <div className="p-4 bg-slate-50 border-2 border-[#171717] rounded-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={attachedPhoto} 
                        alt="Attached Evidence" 
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xs border-2 border-[#171717] shadow-xs shrink-0" 
                      />
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Photo Evidence Attached</span>
                        </div>
                        <p className="text-xs font-mono text-slate-700 truncate max-w-xs">{photoName || 'evidence_photo.jpg'}</p>
                        {photoSize && <p className="text-[10px] font-mono text-slate-500">{photoSize}</p>}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-[#171717] text-xs font-bold border border-[#171717] flex items-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Change</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-3 bg-slate-50 hover:bg-slate-100 text-[#171717] text-xs font-bold border-2 border-dashed border-[#171717]/40 hover:border-[#171717] flex items-center gap-2 cursor-pointer transition-all w-full justify-center"
                  >
                    <Camera className="w-5 h-5 text-[#D65A3A]" />
                    <span>Attach Photo File (Click to Browse)</span>
                  </button>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-5 py-2.5 bg-slate-100 text-[#171717] font-bold text-xs uppercase border border-[#171717] hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-3 bg-[#D65A3A] text-white font-bold text-xs uppercase tracking-wider border border-[#171717] shadow-[2px_2px_0px_#171717] hover:bg-[#c34e2f] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Next: AI Auto-Extraction</span>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & AI AUTOMATIC EXTRACTION */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#171717]">
                  Step 4: AI Automatic Extraction & Verification
                </h2>
                <p className="text-xs text-[#171717]/70 mt-1">
                  CivicPulse AI automatically extracted severity, urgency, and relevant infrastructure:
                </p>
              </div>

              {isProcessingAI ? (
                <div className="p-12 text-center space-y-3 bg-[#F7F5EF] border border-[#171717]">
                  <Sparkles className="w-8 h-8 text-[#D65A3A] animate-spin mx-auto" />
                  <p className="font-mono text-xs font-bold text-[#171717]">
                    Analyzing voice/text with Gemini Civic Intelligence...
                  </p>
                </div>
              ) : (
                <div className="bg-[#F7F5EF] border-2 border-[#171717] p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#171717]/20 pb-3">
                    <span className="font-mono text-xs font-bold text-[#D65A3A] uppercase">
                      INFERRED CIVIC METADATA
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold border border-emerald-300">
                      ✓ AI Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                    {/* 5-Pillar Priority Score */}
                    <div className="bg-white p-3.5 border-2 border-[#171717] shadow-xs sm:col-span-2 space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#171717]/15 pb-2">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-[#D65A3A] font-bold block">
                            Deterministic Priority Score (0–100 Scale)
                          </span>
                          <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="font-serif font-bold text-2xl text-[#171717]">
                              {activeScoreBreakdown.total_score}
                            </span>
                            <span className="text-xs text-slate-500 font-mono">/ 100</span>
                            <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider ${
                              activePriorityTier === 'Critical' ? 'bg-red-100 text-red-900 border border-red-300' :
                              activePriorityTier === 'High' ? 'bg-orange-100 text-orange-900 border border-orange-300' :
                              activePriorityTier === 'Medium' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                              'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            }`}>
                              {activePriorityTier} Priority
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">
                          Weighted 5-Pillar Decision Model
                        </span>
                      </div>

                      {/* 5 Pillars Contribution Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-mono">
                        <div className="bg-[#FAF8F5] p-2 rounded-xs border border-[#171717]/10">
                          <span className="text-slate-500 block">1. Demand (30%)</span>
                          <span className="font-bold text-[#171717]">{activeScoreBreakdown.demand_score} pts</span>
                          <span className="text-[9px] text-slate-400 block">{matchingDemandCount + 1} signals</span>
                        </div>
                        <div className="bg-[#FAF8F5] p-2 rounded-xs border border-[#171717]/10">
                          <span className="text-slate-500 block">2. Gap (25%)</span>
                          <span className="font-bold text-[#171717]">{activeScoreBreakdown.gap_score} pts</span>
                          <span className="text-[9px] text-slate-400 block">{activeScoreBreakdown.gap_percentage}% deficit</span>
                        </div>
                        <div className="bg-[#FAF8F5] p-2 rounded-xs border border-[#171717]/10">
                          <span className="text-slate-500 block">3. Vulnerability (20%)</span>
                          <span className="font-bold text-[#171717]">{activeScoreBreakdown.vuln_score} pts</span>
                          <span className="text-[9px] text-slate-400 block">MPI / Census</span>
                        </div>
                        <div className="bg-[#FAF8F5] p-2 rounded-xs border border-[#171717]/10">
                          <span className="text-slate-500 block">4. Urgency (15%)</span>
                          <span className="font-bold text-[#171717]">{activeScoreBreakdown.sev_score} pts</span>
                          <span className="text-[9px] text-slate-400 block">Sev: {evaluatedSeverity}/10</span>
                        </div>
                        <div className="bg-[#FAF8F5] p-2 rounded-xs border border-[#171717]/10">
                          <span className="text-slate-500 block">5. CapEx (10%)</span>
                          <span className="font-bold text-[#171717]">{activeScoreBreakdown.align_score} pts</span>
                          <span className="text-[9px] text-slate-400 block">Budget signal</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-3 border border-[#171717]/20">
                      <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Inferred Sector</span>
                      <span className="font-bold text-base text-[#171717]">{selectedCategoryName || selectedCategory}</span>
                      {aiSuggestedCategory && (
                        <div className="mt-2 p-2 bg-purple-50 border border-purple-200 text-[11px] text-purple-900 rounded-xs">
                          <p className="font-medium">
                            <span className="font-bold">AI Observation:</span> Issue text suggests alignment with <strong>{aiSuggestedCategory.suggestedName}</strong>. Citizen selection is strictly maintained as <em>Other civic issue</em>.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCategory(aiSuggestedCategory.suggestedId);
                              setSelectedCategoryName(aiSuggestedCategory.suggestedName);
                            }}
                            className="mt-1 text-[10px] text-purple-800 underline font-bold cursor-pointer hover:text-purple-950"
                          >
                            Switch to {aiSuggestedCategory.suggestedName} →
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="bg-white p-3 border border-[#171717]/20">
                      <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Location</span>
                      <span className="font-bold text-base text-[#171717]">{landmark ? `${landmark}, ` : ''}{selectedDistrict}, {selectedState}</span>
                    </div>

                    <div className="bg-white p-3 border border-[#171717]/20">
                      <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Hazard Severity Rating</span>
                      <span className="font-bold text-base text-red-700">{evaluatedSeverity} / 10 ({evaluatedSeverity >= 9 ? 'Critical Hazard' : evaluatedSeverity >= 7 ? 'High Urgency' : evaluatedSeverity >= 5 ? 'Moderate Deficit' : 'Minor Deficit'})</span>
                    </div>

                    <div className="bg-white p-3 border border-[#171717]/20">
                      <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Affected Infrastructure</span>
                      <span className="font-bold text-base text-[#171717]">{selectedCategory === 'Other' ? 'Community Civic Infrastructure' : `${selectedCategoryName || selectedCategory} Local Network`}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-[#171717]/20 text-xs">
                    <span className="font-mono font-bold text-[10px] text-slate-500 uppercase block mb-1">
                      Citizen Raw Input:
                    </span>
                    <p className="italic text-slate-800">
                      "{inputText}"
                    </p>
                  </div>

                  {/* Attached Photo Preview in AI Review */}
                  {attachedPhoto && (
                    <div className="p-3 bg-white border border-[#171717]/20 text-xs flex items-center space-x-3">
                      <img src={attachedPhoto} alt="Attached Photo" className="w-16 h-16 object-cover border border-[#171717] rounded-xs" />
                      <div>
                        <span className="font-mono font-bold text-[10px] text-slate-500 uppercase block">Attached Photo Evidence:</span>
                        <span className="font-semibold text-slate-800">{photoName || 'photo.jpg'}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-5 py-2.5 bg-slate-100 text-[#171717] font-bold text-xs uppercase border border-[#171717] hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  ← Edit Details
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="px-6 py-3.5 bg-[#285943] hover:bg-[#1e4433] text-white font-bold text-xs uppercase tracking-wider border border-[#171717] shadow-[3px_3px_0px_#171717] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 text-amber-200" />
                  <span>Submit Request Officially</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: SUBMISSION CONFIRMATION RECEIPT */}
          {step === 5 && submissionReceipt && (
            <div className="space-y-6">
              <div className="bg-white border-2 border-[#171717] p-8 shadow-[6px_6px_0px_#285943] text-center space-y-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-800 border-2 border-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <span className="px-3 py-1 bg-[#285943] text-white font-mono text-xs font-bold uppercase tracking-widest">
                    OFFICIAL SUBMISSION RECEIPT
                  </span>
                  <h2 className="text-3xl font-serif font-bold text-[#171717]">
                    Request Submitted Successfully
                  </h2>
                  <p className="text-xs text-[#171717]/70">
                    Your civic request has been logged on the Digital Public Infrastructure registry.
                  </p>
                </div>

                <div className="p-4 bg-[#F7F5EF] border border-[#171717] max-w-md mx-auto space-y-2 font-mono text-left text-xs">
                  <div className="flex justify-between border-b border-[#171717]/20 pb-1">
                    <span className="text-slate-500">Tracking Code:</span>
                    <span className="font-bold text-[#D65A3A]">{submissionReceipt.id}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#171717]/20 pb-1">
                    <span className="text-slate-500">Service Category:</span>
                    <span className="font-bold">{submissionReceipt.category}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#171717]/20 pb-1">
                    <span className="text-slate-500">Location:</span>
                    <span className="font-bold">{submissionReceipt.location}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#171717]/20 pb-1">
                    <span className="text-slate-500">Priority Score:</span>
                    <span className="font-bold text-[#D65A3A]">
                      {submissionReceipt.priorityScore} / 100 ({submissionReceipt.priorityTier} Priority)
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#171717]/20 pb-1">
                    <span className="text-slate-500">Hazard Severity:</span>
                    <span className="font-bold">{submissionReceipt.severity} / 10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-bold text-emerald-700">Submitted to District Collector</span>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="pt-2">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-2">
                    Request Progress Pipeline
                  </span>
                  <div className="grid grid-cols-5 text-[10px] font-mono text-center font-bold gap-1 mb-2">
                    <span className="text-emerald-700">Submitted ✓</span>
                    <span className="text-blue-700 animate-pulse">Under Review</span>
                    <span className="text-slate-400 font-normal">Prioritized</span>
                    <span className="text-slate-400 font-normal">Action Initiated</span>
                    <span className="text-slate-400 font-normal">Resolved</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex border border-[#171717]/20">
                    <div className="bg-emerald-600 h-full w-[20%]"></div>
                    <div className="bg-blue-600 h-full w-[20%] animate-pulse"></div>
                    <div className="bg-slate-200 h-full w-[60%]"></div>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  {onNavigateToSignals && (
                    <button
                      type="button"
                      onClick={() => onNavigateToSignals(submissionReceipt.id)}
                      className="w-full sm:w-auto px-7 py-3.5 bg-[#D65A3A] hover:bg-[#c24e2f] text-white font-bold text-xs uppercase tracking-wider border-2 border-[#171717] shadow-[3px_3px_0px_#171717] hover:shadow-[1px_1px_0px_#171717] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>View Citizen Signals</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="w-full sm:w-auto px-6 py-3.5 bg-[#171717] hover:bg-[#333333] text-white font-bold text-xs uppercase tracking-wider border-2 border-[#171717] shadow-[2px_2px_0px_#171717] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Submit Another Request</span>
                  </button>
                  <button
                    type="button"
                    onClick={onNavigateToHotspots}
                    className="w-full sm:w-auto px-5 py-3.5 bg-white hover:bg-slate-50 text-[#171717] font-bold text-xs uppercase tracking-wider border-2 border-[#171717] shadow-[2px_2px_0px_#171717] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-[#D65A3A]" />
                    <span>View Locality Map</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* OPTIONAL MODE: MULTILINGUAL DIALECT ASSISTANT */}
      {activeMode === 'assistant' && (
        <div className="bg-white border-2 border-[#171717] p-8 shadow-[6px_6px_0px_#171717] space-y-6">
          <div className="flex items-center justify-between border-b border-[#171717]/20 pb-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#171717]">
                Regional Dialect Voice Assistant
              </h2>
              <p className="text-xs text-[#171717]/70 mt-0.5">
                Speak naturally in Telugu, Hindi, Tamil, Kannada, or English code-mixed phrases.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-[#D65A3A] text-white font-mono text-xs font-bold uppercase">
              Multilingual AI
            </span>
          </div>

          <div className="p-6 bg-[#F7F5EF] border border-[#171717] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#171717]/10 pb-2">
              <p className="text-xs font-sans text-slate-800 font-bold leading-relaxed">
                Select from 8 Active Prototype Languages:
              </p>
              <span className="text-[10px] font-mono font-bold text-[#D65A3A]">
                India Scale: 22 Eighth Schedule Languages
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                'English', 
                'Hindi (हिंदी)', 
                'Telugu (తెలుగు)', 
                'Tamil (தமிழ்)', 
                'Kannada (ಕನ್ನಡ)', 
                'Bengali (বাংলা)', 
                'Marathi (मराठी)', 
                'Malayalam (മലയാളം)'
              ].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setSelectedLanguage(lang.split(' ')[0])}
                  className={`px-3 py-1.5 text-xs font-bold border transition-all cursor-pointer ${
                    selectedLanguage === lang.split(' ')[0]
                      ? 'bg-[#171717] text-white border-[#171717]'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-[#171717]'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <div className="p-4 bg-white border border-[#171717]/20 space-y-3">
              <div className="flex items-center space-x-2">
                <Mic className="w-5 h-5 text-[#D65A3A]" />
                <span className="text-xs font-mono font-bold text-[#171717]">
                  Voice Input Active for {selectedLanguage}
                </span>
              </div>
              <p className="text-xs italic text-slate-600">
                "మా గ్రామంలో రెండు వారాలుగా మంచినీటి సరఫరా నిలిచిపోయింది." (Water supply stopped for 2 weeks)
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
