import React, { useState, useRef, useEffect } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { District, CitizenRequest, InfrastructureCategory, ScoreBreakdown } from '../types';
import { calculatePriorityScore } from '../utils/scoring';

interface CitizenIngestionProps {
  districts: District[];
  requests: CitizenRequest[];
  onAddRequest: (req: CitizenRequest) => void;
  onOpenScoreModal: (breakdown: ScoreBreakdown, district: District, category: InfrastructureCategory) => void;
  onNavigateToHotspots: () => void;
  onNavigateToPatterns?: () => void;
  initialCategory?: InfrastructureCategory;
}

export const CitizenIngestion: React.FC<CitizenIngestionProps> = ({
  districts,
  onAddRequest,
  onNavigateToHotspots,
  initialCategory,
}) => {
  // Mode selection: 'wizard' (5-Step Government Service) or 'assistant' (Multilingual Dialect Assistant)
  const [activeMode, setActiveMode] = useState<'wizard' | 'assistant'>('wizard');

  // 5-Step Progressive Reporting State
  const [step, setStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<InfrastructureCategory>(initialCategory || 'Roads');
  const [selectedDistrict, setSelectedDistrict] = useState<string>(districts[0]?.name || 'Krishna');
  const [landmark, setLandmark] = useState<string>('Near Primary School, Ward 12');
  const [inputText, setInputText] = useState<string>('Potholes and broken streetlights near the school corridor.');
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
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
  } | null>(null);

  // Multilingual Assistant State (Preserving Scenario Dialect Engine)
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Telugu');

  const categories: { id: InfrastructureCategory; name: string; icon: string }[] = [
    { id: 'Roads', name: 'Roads & Transport', icon: '🛣️' },
    { id: 'Water', name: 'Water & Sanitation', icon: '💧' },
    { id: 'Health', name: 'Healthcare & Clinics', icon: '🏥' },
    { id: 'Education', name: 'Education & Schools', icon: '🎓' },
    { id: 'Electricity', name: 'Power & Energy', icon: '⚡' },
    { id: 'Sanitation', name: 'Public Facilities', icon: '🏙️' },
    { id: 'Drainage', name: 'Environment & Greenery', icon: '🌱' },
  ];

  const handleNextStep = () => {
    if (step === 3) {
      // Transitioning to Step 4: AI Automatic Inference Simulation
      setIsProcessingAI(true);
      setTimeout(() => {
        setIsProcessingAI(false);
        setStep(4);
      }, 1000);
    } else {
      setStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinalSubmit = () => {
    const trackingId = `CP-IN-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const matchedDist = districts.find(d => d.name.toLowerCase() === selectedDistrict.toLowerCase()) || districts[0];

    const newReq: CitizenRequest = {
      id: trackingId,
      timestamp: new Date().toISOString(),
      original_text: inputText || 'Voice report submitted via CivicPulse Service',
      language: selectedLanguage,
      category: selectedCategory,
      issue_title: `${selectedCategory} Request - ${landmark}`,
      location: `${selectedDistrict}, AP`,
      severity: 8,
      priority_tier: 'High',
      summary_en: `${selectedCategory} infrastructure report logged at ${landmark}, ${selectedDistrict}.`,
      source_type: recordedVoice ? 'voice' : 'text',
      status: 'Submitted',
      problem: inputText || 'Infrastructure deficit',
      urgency: 'HIGH',
      affected_infrastructure: `${selectedCategory} Public Grid`,
      estimated_impact: 'High',
      recommended_action: `Dispatch field team to ${selectedDistrict} for ${selectedCategory} repair.`,
      ai_analysis: {
        category: selectedCategory,
        problem: inputText || 'Deficit',
        urgency: 'HIGH',
        affected_infrastructure: `${selectedCategory} Grid`,
        estimated_impact: 'High',
        recommended_action: `Inspect and resolve ${selectedCategory} deficit.`
      }
    };

    onAddRequest(newReq);

    setSubmissionReceipt({
      id: trackingId,
      category: selectedCategory,
      location: `${landmark}, ${selectedDistrict}`,
      urgency: 'HIGH 🔴',
      issueTitle: `${selectedCategory} Service Request`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    setStep(5);
  };

  const handleResetForm = () => {
    setStep(1);
    setSubmissionReceipt(null);
    setInputText('Potholes and broken streetlights near the school corridor.');
    setAttachedPhoto(null);
    setRecordedVoice(false);
  };

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
            Follow our simple 5-step wizard or speak in your regional dialect.
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
        <div className="bg-white border-2 border-[#171717] p-8 shadow-[6px_6px_0px_#171717] space-y-8">
          
          {/* STEP PROGRESS TRACKER */}
          <div className="border-b border-[#171717]/20 pb-6">
            <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono font-bold">
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

          {/* STEP 1: WHAT DO YOU NEED? */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#171717]">
                  Step 1: What service or infrastructure do you need?
                </h2>
                <p className="text-xs text-[#171717]/70 mt-1">
                  Select the public service category that best matches your request:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-4 border text-left flex items-center space-x-3 transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-orange-50 border-[#D65A3A] shadow-[3px_3px_0px_#171717] font-bold text-[#D65A3A]'
                        : 'bg-white border-[#171717]/30 hover:border-[#171717]'
                    }`}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-sm font-sans">{cat.name}</span>
                  </button>
                ))}
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

          {/* STEP 2: WHERE IS IT? */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#171717]">
                  Step 2: Where is this issue located?
                </h2>
                <p className="text-xs text-[#171717]/70 mt-1">
                  Specify your district, block, or village landmark in Andhra Pradesh:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold uppercase text-[#171717]/80">
                    State
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Andhra Pradesh (IN-AP)"
                    className="w-full p-3 bg-slate-100 border border-[#171717]/30 text-xs font-bold text-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold uppercase text-[#171717]/80">
                    District
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full p-3 bg-white border border-[#171717] text-xs font-bold text-[#171717] focus:outline-none"
                  >
                    {districts.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} District
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

          {/* STEP 3: ADD DETAILS / VOICE / PHOTO */}
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

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setAttachedPhoto('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#171717] text-xs font-bold border border-[#171717] flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-[#D65A3A]" />
                  <span>{attachedPhoto ? 'Photo Attached ✓' : 'Attach Photo'}</span>
                </button>
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
                    <div className="bg-white p-3 border border-[#171717]/20">
                      <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Inferred Sector</span>
                      <span className="font-bold text-base text-[#171717]">{selectedCategory} Infrastructure</span>
                    </div>

                    <div className="bg-white p-3 border border-[#171717]/20">
                      <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Location</span>
                      <span className="font-bold text-base text-[#171717]">{landmark}, {selectedDistrict}</span>
                    </div>

                    <div className="bg-white p-3 border border-[#171717]/20">
                      <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Severity / Urgency</span>
                      <span className="font-bold text-base text-red-700">High Priority (Urgency Score: 8/10)</span>
                    </div>

                    <div className="bg-white p-3 border border-[#171717]/20">
                      <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Affected Infrastructure</span>
                      <span className="font-bold text-base text-[#171717]">{selectedCategory} Local Distribution Grid</span>
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
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  onClick={handlePrevStep}
                  className="px-5 py-2.5 bg-slate-100 text-[#171717] font-bold text-xs uppercase border border-[#171717] hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  ← Edit Details
                </button>
                <button
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

                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={handleResetForm}
                    className="px-6 py-3 bg-[#171717] text-white font-bold text-xs uppercase border border-[#171717] hover:bg-[#D65A3A] transition-colors cursor-pointer"
                  >
                    Submit Another Request
                  </button>
                  <button
                    onClick={onNavigateToHotspots}
                    className="px-6 py-3 bg-white text-[#171717] font-bold text-xs uppercase border border-[#171717] shadow-[2px_2px_0px_#171717] hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    View Locality Map
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
