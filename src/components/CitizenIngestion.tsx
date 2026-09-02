import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Upload, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Globe2, 
  MapPin, 
  Droplet, 
  Droplets,
  HeartPulse, 
  Route, 
  GraduationCap, 
  Zap,
  Trash2,
  Volume2,
  RotateCcw,
  ArrowRight,
  Info,
  Layers,
  Radio,
  FileText,
  Clock,
  Check,
  Building2,
  ShieldAlert,
  Wrench,
  Activity,
  Users,
  Cpu,
  CornerDownRight,
  Edit3,
  Play,
  Pause,
  MessageSquare,
  Camera,
  Image as ImageIcon,
  ChevronRight,
  Search,
  CheckSquare,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Sliders,
  Sparkle
} from 'lucide-react';
import { District, CitizenRequest, InfrastructureCategory, ScoreBreakdown, AIAnalysisResult } from '../types';
import { calculatePriorityScore } from '../utils/scoring';

interface CitizenIngestionProps {
  districts: District[];
  requests: CitizenRequest[];
  onAddRequest: (req: CitizenRequest) => void;
  onOpenScoreModal: (breakdown: ScoreBreakdown, district: District, category: InfrastructureCategory) => void;
  onNavigateToHotspots: () => void;
  onNavigateToPatterns?: () => void;
}

export interface ChatMessage {
  id: string;
  sender: 'citizen' | 'ai';
  text: string;
  timestamp: string;
  language?: string;
  quickOptions?: string[];
  extractedEntity?: {
    category?: string;
    subcategory?: string;
    location?: string;
    duration?: string;
    urgency?: string;
    affectedGroup?: string;
  };
  isConfirmationCard?: boolean;
  photoUrl?: string;
  audioUrl?: string;
}

const SAMPLE_CHAT_SCENARIOS = [
  {
    id: 'road-damage',
    title: '💬 Scenario A: Road Damage (Chat Conversation)',
    description: 'Conversational flow gathering location and duration naturally.',
    messages: [
      { id: 'm1', sender: 'citizen', text: 'The road near our village is completely damaged.', timestamp: '10:00 AM', language: 'English' },
      { id: 'm2', sender: 'ai', text: 'I understand. Is this the road near the primary school in Krishna district?', timestamp: '10:00 AM', language: 'English', quickOptions: ['Yes', 'No, near market area', 'No, near hospital'] },
      { id: 'm3', sender: 'citizen', text: 'Yes', timestamp: '10:01 AM', language: 'English' },
      { id: 'm4', sender: 'ai', text: 'How long has this problem existed?', timestamp: '10:01 AM', language: 'English', quickOptions: ['Around 3 months', '2 weeks', 'Over a year'] },
      { id: 'm5', sender: 'citizen', text: 'Around 3 months', timestamp: '10:02 AM', language: 'English' },
      {
        id: 'm6',
        sender: 'ai',
        text: "Got it. I've recorded this as a road infrastructure issue.",
        timestamp: '10:02 AM',
        language: 'English',
        isConfirmationCard: true,
        extractedEntity: {
          category: 'Roads',
          subcategory: 'Pothole & Surface Damage',
          location: 'Near Village Primary School',
          duration: '3 months',
          urgency: 'HIGH 🔴',
          affectedGroup: 'School students & local farmers'
        }
      }
    ] as ChatMessage[]
  },
  {
    id: 'street-lighting',
    title: '💡 Scenario B: Street Lighting (Instant Structured Extraction)',
    description: 'Single statement parsed into structured request.',
    messages: [
      { id: 'm1', sender: 'citizen', text: "The street lights near our school haven't worked for two weeks.", timestamp: '10:15 AM', language: 'English' },
      {
        id: 'm2',
        sender: 'ai',
        text: 'We understood your request! Please review the extracted details below:',
        timestamp: '10:15 AM',
        language: 'English',
        isConfirmationCard: true,
        extractedEntity: {
          category: 'Electricity / Street Lighting',
          subcategory: 'Street Lighting Grid Outage',
          location: 'XYZ School Area, Vijayawada',
          duration: '2 weeks',
          urgency: 'Medium Priority 🟠',
          affectedGroup: 'Students + local residents'
        }
      }
    ] as ChatMessage[]
  },
  {
    id: 'hospital-followup',
    title: '🏥 Scenario C: Hospital Vague Input (AI Follow-up System)',
    description: 'AI presents interactive follow-up option pills to pinpoint missing details.',
    messages: [
      { id: 'm1', sender: 'citizen', text: "Our hospital isn't working properly.", timestamp: '10:30 AM', language: 'English' },
      {
        id: 'm2',
        sender: 'ai',
        text: 'I understand you are experiencing an issue at the hospital. What is the main problem?',
        timestamp: '10:30 AM',
        language: 'English',
        quickOptions: ['👨‍⚕️ No doctors', '💊 Medicine shortage', '⏳ Long waiting time', '🏥 Facility damaged', '💬 Other']
      }
    ] as ChatMessage[]
  },
  {
    id: 'telugu-chat',
    title: 'తెలుగు Scenario D: Multilingual Telugu Chat',
    description: 'Citizen speaks Telugu; AI replies in Telugu while extracting structured English representation.',
    messages: [
      { id: 'm1', sender: 'citizen', text: 'మా గ్రామంలో రెండు వారాలుగా మంచినీటి సరఫరా నిలిచిపోయింది.', timestamp: '10:45 AM', language: 'Telugu' },
      {
        id: 'm2',
        sender: 'ai',
        text: 'నేను అర్థం చేసుకున్నాను. కృష్ణా జిల్లాలోని మంచి నీటి సరఫరా సమస్యను నేను రికార్డు చేశాను.',
        timestamp: '10:45 AM',
        language: 'Telugu',
        isConfirmationCard: true,
        extractedEntity: {
          category: 'Water (తాగునీరు)',
          subcategory: 'No Drinking Water Supply',
          location: 'Krishna District Village',
          duration: '2 weeks (14 రోజులు)',
          urgency: 'CRITICAL 🔴',
          affectedGroup: 'గ్రామస్తులు, పిల్లలు'
        }
      }
    ] as ChatMessage[]
  },
  {
    id: 'hindi-chat',
    title: 'हिंदी Scenario E: Multilingual Hindi Chat',
    description: 'Citizen speaks Hindi; AI replies in Hindi with full structure.',
    messages: [
      { id: 'm1', sender: 'citizen', text: 'हमारे स्कूल के पास स्ट्रीट लाइट और सड़क 2 महीने से खराब हैं।', timestamp: '11:00 AM', language: 'Hindi' },
      {
        id: 'm2',
        sender: 'ai',
        text: 'धन्यवाद। मैंने इसे सड़क और स्ट्रीट लाइट बुनियादी ढांचे की समस्या के रूप में दर्ज कर लिया है।',
        timestamp: '11:00 AM',
        language: 'Hindi',
        isConfirmationCard: true,
        extractedEntity: {
          category: 'Roads & Electricity',
          subcategory: 'Street lighting & Potholes',
          location: 'Near Government School, Guntur',
          duration: '2 months',
          urgency: 'HIGH 🔴',
          affectedGroup: 'छात्र और स्थानीय निवासी'
        }
      }
    ] as ChatMessage[]
  }
];

export const CitizenIngestion: React.FC<CitizenIngestionProps> = ({
  districts,
  requests,
  onAddRequest,
  onOpenScoreModal,
  onNavigateToHotspots,
  onNavigateToPatterns,
}) => {
  // Navigation View Tabs
  const [activeTab, setActiveTab] = useState<'messaging' | 'followup' | 'analytics' | 'pipeline'>('messaging');

  // Active Scenario Selection
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('street-lighting');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(SAMPLE_CHAT_SCENARIOS[1].messages);

  // Input Controls
  const [inputText, setInputText] = useState<string>("The street lights in our area haven't been working for 2 weeks.");
  const [inputLanguage, setInputLanguage] = useState<string>('English');
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

  // Submission / Processing State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [submissionReceipt, setSubmissionReceipt] = useState<{
    id: string;
    category: string;
    location: string;
    urgency: string;
    issueTitle: string;
  } | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSelectScenario = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    const scenario = SAMPLE_CHAT_SCENARIOS.find((s) => s.id === scenarioId);
    if (scenario) {
      setChatMessages(scenario.messages);
      setSubmissionReceipt(null);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text && !attachedPhoto && !recordedAudioUrl) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'citizen',
      text: text || (recordedAudioUrl ? '🎙️ Spoken Voice Message' : '📷 Attached Photo Report'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: inputLanguage,
      photoUrl: attachedPhoto || undefined,
      audioUrl: recordedAudioUrl || undefined
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setAttachedPhoto(null);
    setRecordedAudioUrl(null);
    setIsProcessing(true);

    try {
      const response = await fetch('/api/conversational-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: text,
          languagePreference: inputLanguage,
          history: chatMessages.map((m) => ({ sender: m.sender, text: m.text }))
        })
      });

      const resData = await response.json();
      const aiData = resData.data || {};

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiData.replyMessage || "I've recorded your infrastructure request.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: aiData.detectedLanguage || inputLanguage,
        quickOptions: aiData.quickOptions,
        isConfirmationCard: aiData.isComplete,
        extractedEntity: aiData.extractedEntity
      };

      setChatMessages((prev) => [...prev, aiMsg]);
      setIsProcessing(false);
    } catch {
      // Fallback response
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: "We understood your request! Please review the details below:",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: inputLanguage,
        isConfirmationCard: true,
        extractedEntity: {
          category: 'Electricity / Infrastructure',
          subcategory: 'Street Lighting Grid',
          location: 'XYZ School Area',
          duration: '2 weeks',
          urgency: 'Medium Priority 🟠',
          affectedGroup: 'Students + local residents'
        }
      };
      setChatMessages((prev) => [...prev, aiMsg]);
      setIsProcessing(false);
    }
  };

  const handleQuickOptionClick = (optionText: string) => {
    if (optionText.includes('No medicines')) {
      const citizenMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'citizen',
        text: '💊 Medicine shortage',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: 'English'
      };
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: 'Got it. Which health facility or location is experiencing this medicine shortage?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: 'English',
        quickOptions: ['📍 Guntur PHC', '📍 Vijayawada District Hospital', '📍 Krishna Rural Clinic']
      };
      setChatMessages((prev) => [...prev, citizenMsg, aiMsg]);
    } else if (optionText.includes('Guntur PHC')) {
      const citizenMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'citizen',
        text: '📍 Guntur PHC',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: 'English'
      };
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: 'Thank you! I have recorded this as a critical healthcare supply shortage.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: 'English',
        isConfirmationCard: true,
        extractedEntity: {
          category: 'Healthcare',
          subcategory: 'Medicine Stock Out',
          location: 'Guntur PHC',
          duration: 'Current / Ongoing',
          urgency: 'HIGH 🔴',
          affectedGroup: 'Patients & rural residents'
        }
      };
      setChatMessages((prev) => [...prev, citizenMsg, aiMsg]);
    } else {
      handleSendMessage(optionText);
    }
  };

  const handleConfirmRequest = (entity: ChatMessage['extractedEntity']) => {
    const newReqId = `CP-${Math.floor(10000 + Math.random() * 90000)}`;
    const category: InfrastructureCategory = (entity?.category as InfrastructureCategory) || 'Electricity';
    const matchedDist = districts.find((d) => entity?.location?.toLowerCase().includes(d.name.toLowerCase())) || districts[0];

    const scoreBreakdown = calculatePriorityScore(matchedDist, category, 8, 12, 45);

    const newReq: CitizenRequest = {
      id: newReqId,
      timestamp: new Date().toISOString(),
      original_text: entity?.subcategory || 'Citizen reported issue',
      language: 'English',
      category,
      issue_title: entity?.subcategory || 'Civic Infrastructure Demand',
      location: matchedDist.name,
      severity: 8,
      priority_tier: 'High',
      summary_en: `${entity?.subcategory || 'Infrastructure defect'} reported in ${entity?.location || matchedDist.name}.`,
      source_type: 'text',
      status: 'Submitted',
      problem: entity?.subcategory || 'Infrastructure defect',
      urgency: 'HIGH',
      affected_infrastructure: `${category} distribution network`,
      estimated_impact: 'High',
      recommended_action: `Repair and upgrade ${category} facilities in ${matchedDist.name}.`,
      ai_analysis: {
        category,
        problem: entity?.subcategory || 'Deficit',
        urgency: 'HIGH',
        affected_infrastructure: `${category} grid`,
        estimated_impact: 'High',
        recommended_action: `Remediate ${category} deficit in ${matchedDist.name}.`
      }
    };

    onAddRequest(newReq);
    setSubmissionReceipt({
      id: newReqId,
      category,
      location: entity?.location || matchedDist.name,
      urgency: entity?.urgency || 'HIGH 🔴',
      issueTitle: entity?.subcategory || 'Civic Infrastructure Request'
    });
  };

  const handleSimulatePhotoUpload = () => {
    setAttachedPhoto('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80');
    setInputText('Dark street with broken lights near school');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans text-[#171717]">
      {/* CIVICPULSE Header Banner */}
      <div className="bg-white border border-[#171717] p-6 sm:p-8 shadow-[4px_4px_0px_#171717] space-y-4 text-center">
        <div className="inline-block px-3 py-1 bg-[#171717] text-[#F7F5EF] font-mono text-[10px] font-bold uppercase tracking-widest border border-[#171717] mb-1">
          DIGITAL PUBLIC GOOD • CIVICPULSE MESSAGING
        </div>

        <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-[#171717] uppercase">
          CIVICPULSE
        </h1>
        <p className="text-lg sm:text-xl font-serif text-[#D65A3A] font-bold italic">
          "What does your community need?"
        </p>

        <p className="text-xs font-mono text-[#171717]/70 max-w-xl mx-auto">
          You can write or speak in <strong>Telugu (తెలుగు)</strong>, <strong>Hindi (हिंदी)</strong>, <strong>English</strong>, <strong>Tamil (தமிழ்)</strong>, or <strong>Kannada (ಕನ್ನಡ)</strong>.
        </p>

        {/* View Selection Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-[#171717]/15">
          <button
            onClick={() => setActiveTab('messaging')}
            className={`px-4 py-2 font-mono text-xs font-bold uppercase transition-all cursor-pointer border border-[#171717] flex items-center gap-2 ${
              activeTab === 'messaging'
                ? 'bg-[#171717] text-[#F7F5EF] shadow-[2px_2px_0px_#D65A3A]'
                : 'bg-[#F7F5EF] text-[#171717] hover:bg-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#D65A3A]" />
            <span>01. Messaging & AI Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('followup')}
            className={`px-4 py-2 font-mono text-xs font-bold uppercase transition-all cursor-pointer border border-[#171717] flex items-center gap-2 ${
              activeTab === 'followup'
                ? 'bg-[#171717] text-[#F7F5EF] shadow-[2px_2px_0px_#D65A3A]'
                : 'bg-[#F7F5EF] text-[#171717] hover:bg-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D65A3A]" />
            <span>02. AI Follow-up System</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 font-mono text-xs font-bold uppercase transition-all cursor-pointer border border-[#171717] flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-[#171717] text-[#F7F5EF] shadow-[2px_2px_0px_#D65A3A]'
                : 'bg-[#F7F5EF] text-[#171717] hover:bg-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#D65A3A]" />
            <span>03. Officials' Structured Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-4 py-2 font-mono text-xs font-bold uppercase transition-all cursor-pointer border border-[#171717] flex items-center gap-2 ${
              activeTab === 'pipeline'
                ? 'bg-[#171717] text-[#F7F5EF] shadow-[2px_2px_0px_#D65A3A]'
                : 'bg-[#F7F5EF] text-[#171717] hover:bg-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#D65A3A]" />
            <span>04. 6-Stage Pipeline & Stage 6 MEASURE</span>
          </button>
        </div>
      </div>

      {/* TAB 1: MESSAGING & AI CHAT ASSISTANT */}
      {activeTab === 'messaging' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Preset Scenarios & Multimodal Input Bar */}
          <div className="lg:col-span-5 space-y-6">
            {/* Scenario Switcher */}
            <div className="bg-white border border-[#171717] p-5 shadow-[4px_4px_0px_#171717] space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase text-[#D65A3A] tracking-wider block">
                INTERACTIVE SCENARIO SHORTCUTS
              </span>
              <p className="text-xs text-[#171717]/70">
                Click any pre-configured messaging flow to test AI extraction:
              </p>

              <div className="space-y-2">
                {SAMPLE_CHAT_SCENARIOS.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => handleSelectScenario(sc.id)}
                    className={`w-full p-3 text-left font-mono text-xs border transition-all cursor-pointer ${
                      selectedScenarioId === sc.id
                        ? 'bg-[#171717] text-[#F7F5EF] border-[#171717] shadow-[2px_2px_0px_#D65A3A]'
                        : 'bg-[#F7F5EF] hover:bg-white text-[#171717] border-[#171717]/40'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>{sc.title}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-[10px] opacity-80 mt-1">{sc.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Multimodal Input Card (Voice, Text, Photo) */}
            <div className="bg-white border border-[#171717] p-5 shadow-[4px_4px_0px_#171717] space-y-4">
              <div className="flex items-center justify-between border-b border-[#171717]/15 pb-2">
                <span className="text-xs font-mono font-bold uppercase text-[#171717]">
                  REPORT A PROBLEM
                </span>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 border border-emerald-400 font-bold">
                  UNIFIED INPUT PIPELINE
                </span>
              </div>

              {/* 3 Large Input Mode Buttons */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <button
                  type="button"
                  onClick={() => handleSendMessage("The street lights near our school haven't worked for two weeks.")}
                  className="p-3 bg-[#F7F5EF] hover:bg-white border border-[#171717] font-mono text-xs font-bold cursor-pointer flex flex-col items-center gap-1 shadow-[2px_2px_0px_#171717]"
                >
                  <MessageSquare className="w-5 h-5 text-[#D65A3A]" />
                  <span>💬 Text</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsRecording(!isRecording)}
                  className={`p-3 border font-mono text-xs font-bold cursor-pointer flex flex-col items-center gap-1 shadow-[2px_2px_0px_#171717] transition-all ${
                    isRecording ? 'bg-rose-600 text-white border-[#171717] animate-pulse' : 'bg-[#F7F5EF] hover:bg-white text-[#171717] border-[#171717]'
                  }`}
                >
                  <Mic className="w-5 h-5 text-amber-600" />
                  <span>{isRecording ? '● Rec' : '🎙️ Voice'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSimulatePhotoUpload}
                  className="p-3 bg-[#F7F5EF] hover:bg-white border border-[#171717] text-[#171717] font-mono text-xs font-bold cursor-pointer flex flex-col items-center gap-1 shadow-[2px_2px_0px_#171717]"
                >
                  <Camera className="w-5 h-5 text-blue-600" />
                  <span>📷 Photo</span>
                </button>
              </div>

              {/* Photo Preview if attached */}
              {attachedPhoto && (
                <div className="p-2 bg-[#F7F5EF] border border-[#171717] flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <img src={attachedPhoto} alt="Evidence preview" className="w-10 h-10 object-cover border border-[#171717]" />
                    <span className="font-bold text-[10px]">Photo Evidence Attached</span>
                  </div>
                  <button onClick={() => setAttachedPhoto(null)} className="text-rose-600 font-bold underline cursor-pointer text-[10px]">Remove</button>
                </div>
              )}

              {/* Language Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-[#171717]/70 block">
                  Language Preference:
                </label>
                <select
                  value={inputLanguage}
                  onChange={(e) => setInputLanguage(e.target.value)}
                  className="w-full bg-[#F7F5EF] border border-[#171717] p-2 text-xs font-mono font-bold cursor-pointer"
                >
                  <option value="English">English</option>
                  <option value="Telugu">Telugu (తెలుగు)</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Tamil">Tamil (தமிழ்)</option>
                  <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: Live Chat Screen */}
          <div className="lg:col-span-7 space-y-4">
            {/* Chat Frame Container */}
            <div className="bg-white border-2 border-[#171717] shadow-[6px_6px_0px_#171717] flex flex-col h-[620px]">
              {/* Chat Header */}
              <div className="p-4 bg-[#171717] text-[#F7F5EF] flex items-center justify-between border-b border-[#171717]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#D65A3A] text-white flex items-center justify-center font-bold font-serif text-sm border border-white">
                    CP
                  </div>
                  <div>
                    <span className="font-serif font-bold text-sm tracking-wide block">
                      CIVICPULSE ASSISTANT
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 block">
                      ● Active • Multilingual AI Engine
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono uppercase bg-white/10 px-2 py-0.5 border border-white/20">
                  {inputLanguage} Mode
                </span>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F7F5EF]">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'citizen' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 border font-mono text-xs shadow-[2px_2px_0px_#171717] space-y-2 ${
                        msg.sender === 'citizen'
                          ? 'bg-[#171717] text-[#F7F5EF] border-[#171717]'
                          : 'bg-white text-[#171717] border-[#171717]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[9px] opacity-70 pb-1 border-b border-current/10">
                        <span className="font-bold uppercase">
                          {msg.sender === 'citizen' ? '👤 CITIZEN' : '🤖 CIVICPULSE AI'}
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>

                      <p className="font-sans text-sm leading-relaxed">{msg.text}</p>

                      {msg.photoUrl && (
                        <div className="pt-2">
                          <img src={msg.photoUrl} alt="Report attachment" className="max-h-40 border border-[#171717] object-cover" />
                        </div>
                      )}

                      {/* Interactive Quick Option Pills */}
                      {msg.quickOptions && msg.quickOptions.length > 0 && (
                        <div className="pt-2 space-y-1.5">
                          <span className="text-[9px] font-mono font-bold uppercase text-[#D65A3A] block">
                            SELECT AN OPTION OR TYPE BELOW:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.quickOptions.map((opt, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleQuickOptionClick(opt)}
                                className="px-3 py-1 bg-[#F7F5EF] hover:bg-amber-100 text-[#171717] border border-[#171717] text-[11px] font-mono font-bold cursor-pointer transition-all shadow-[1px_1px_0px_#171717]"
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* "WE UNDERSTOOD YOUR REQUEST" CONFIRMATION CARD */}
                      {msg.isConfirmationCard && msg.extractedEntity && (
                        <div className="mt-3 p-4 bg-[#F7F5EF] text-[#171717] border-2 border-[#171717] space-y-3 font-mono shadow-[3px_3px_0px_#D65A3A]">
                          <div className="flex items-center justify-between border-b border-[#171717]/20 pb-2">
                            <span className="text-xs font-bold uppercase text-[#171717] tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-[#D65A3A]" />
                              WE UNDERSTOOD YOUR REQUEST
                            </span>
                            <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 border border-emerald-500 font-bold">
                              AI EXTRACTED
                            </span>
                          </div>

                          <div className="space-y-1.5 text-xs font-bold">
                            <div className="flex items-center gap-2">
                              <span className="text-base">💡</span>
                              <span>Category:</span>
                              <span className="text-blue-900 font-extrabold">{msg.extractedEntity.category}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-base">📍</span>
                              <span>Location:</span>
                              <span className="text-[#171717]">{msg.extractedEntity.location}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-base">🕐</span>
                              <span>Duration:</span>
                              <span className="text-amber-800">{msg.extractedEntity.duration}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-base">🟠</span>
                              <span>Urgency:</span>
                              <span className="text-rose-700">{msg.extractedEntity.urgency}</span>
                            </div>

                            {msg.extractedEntity.affectedGroup && (
                              <div className="flex items-center gap-2 text-[10px] text-[#171717]/80 pt-1 border-t border-[#171717]/10">
                                <span>👥 Affected:</span>
                                <span>{msg.extractedEntity.affectedGroup}</span>
                              </div>
                            )}
                          </div>

                          <div className="text-[10px] font-bold text-[#171717]/70 pt-1 border-t border-[#171717]/15">
                            Is this correct?
                          </div>

                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => handleSelectScenario('hospital-followup')}
                              className="flex-1 py-2 bg-white hover:bg-[#F7F5EF] border border-[#171717] text-[10px] font-bold uppercase text-[#171717] cursor-pointer"
                            >
                              [ Edit Details ]
                            </button>
                            <button
                              onClick={() => handleConfirmRequest(msg.extractedEntity)}
                              className="flex-1 py-2 bg-[#D65A3A] hover:bg-[#D65A3A]/90 text-white border border-[#171717] text-[10px] font-bold uppercase cursor-pointer flex items-center justify-center gap-1 shadow-[1px_1px_0px_#171717]"
                            >
                              <span>Confirm ✓</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isProcessing && (
                  <div className="flex items-center gap-2 p-3 bg-white border border-[#171717] font-mono text-xs text-[#171717] w-fit shadow-[2px_2px_0px_#171717]">
                    <Sparkles className="w-4 h-4 text-[#D65A3A] animate-spin" />
                    <span>AI is processing request & extracting entities...</span>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-white border-t-2 border-[#171717] space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder='💬 "The street lights in our area have not been working for 2 weeks."'
                    className="flex-1 bg-[#F7F5EF] border border-[#171717] px-3 py-2.5 font-mono text-xs text-[#171717] focus:outline-none focus:bg-white"
                  />

                  <button
                    onClick={() => handleSendMessage()}
                    className="px-4 py-2.5 bg-[#171717] hover:bg-[#D65A3A] text-white font-mono text-xs font-bold uppercase border border-[#171717] cursor-pointer shadow-[2px_2px_0px_#171717] flex items-center gap-1.5"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Submission Receipt Notification */}
            {submissionReceipt && (
              <div className="p-4 bg-emerald-100 border-2 border-emerald-600 text-emerald-900 font-mono text-xs space-y-2 shadow-[4px_4px_0px_#171717]">
                <div className="flex items-center justify-between font-bold">
                  <span>✓ SUBMITTED TO NATIONAL REGISTRY ({submissionReceipt.id})</span>
                  <span className="bg-emerald-700 text-white px-2 py-0.5 text-[9px]">LOGGED</span>
                </div>
                <p className="font-sans text-xs">
                  Recorded <strong>{submissionReceipt.issueTitle}</strong> in <strong>{submissionReceipt.location}</strong>. Priority Tier: {submissionReceipt.urgency}.
                </p>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={onNavigateToHotspots}
                    className="py-1.5 px-3 bg-[#171717] text-white text-[10px] font-bold uppercase border border-[#171717] cursor-pointer"
                  >
                    View On Policy Map →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AI FOLLOW-UP SYSTEM SIMULATOR */}
      {activeTab === 'followup' && (
        <div className="bg-white border border-[#171717] p-6 sm:p-8 shadow-[5px_5px_0px_#171717] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#171717]/15 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D65A3A] block">
                SMART CLARIFICATION PIPELINE
              </span>
              <h2 className="text-xl font-serif font-bold text-[#171717]">
                AI "Follow-up" System
              </h2>
              <p className="text-xs text-[#171717]/70 mt-1 max-w-xl">
                Instead of forcing citizens to fill out 10 tedious form fields, CivicPulse AI asks targeted clarifying questions with interactive option pills when reports are vague.
              </p>
            </div>

            <span className="p-3 bg-[#F7F5EF] border border-[#171717] font-mono text-xs text-center font-bold text-[#D65A3A]">
              🤖 ZERO FORM FILLING
            </span>
          </div>

          {/* Demonstration Diagram */}
          <div className="p-6 bg-[#F7F5EF] border border-[#171717] space-y-4 font-mono text-xs">
            <span className="font-bold text-[#171717] uppercase block border-b border-[#171717]/15 pb-2">
              EXAMPLE: VAGUE CITIZEN MESSAGE ➔ SMART AI CLARIFICATION
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box 1: Vague Input */}
              <div className="bg-white p-4 border border-[#171717] space-y-2 shadow-[2px_2px_0px_#171717]">
                <span className="text-[10px] text-rose-600 font-bold block">👤 STEP 1: CITIZEN SENDS VAGUE REPORT</span>
                <p className="font-serif italic text-sm text-[#171717]">"Our hospital isn't working properly."</p>
                <div className="text-[10px] text-[#171717]/60">
                  Deficit: Missing location, specific issue type, and severity.
                </div>
              </div>

              {/* Box 2: Smart AI Follow-up */}
              <div className="bg-[#171717] text-[#F7F5EF] p-4 border border-[#171717] space-y-3 shadow-[2px_2px_0px_#D65A3A]">
                <span className="text-[10px] text-amber-300 font-bold block">🤖 STEP 2: AI ASKS TARGETED FOLLOW-UP</span>
                <p className="font-sans text-xs">"What is the main issue you are experiencing at the hospital?"</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['[ No doctors ]', '[ No medicines ]', '[ Long waiting time ]', '[ Facility damaged ]', '[ Other ]'].map((pill, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-white/10 text-white text-[10px] border border-white/20 font-bold">
                      {pill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                setActiveTab('messaging');
                handleSelectScenario('hospital-followup');
              }}
              className="py-3 px-6 bg-[#D65A3A] text-white font-mono text-xs font-bold uppercase border border-[#171717] shadow-[3px_3px_0px_#171717] cursor-pointer flex items-center gap-2"
            >
              <span>Test Hospital Follow-up Live →</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: OFFICIALS' STRUCTURED ANALYTICS VIEW */}
      {activeTab === 'analytics' && (
        <div className="bg-white border border-[#171717] p-6 sm:p-8 shadow-[5px_5px_0px_#171717] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#171717]/15 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D65A3A] block">
                AGGREGATED INTELLIGENCE
              </span>
              <h2 className="text-xl font-serif font-bold text-[#171717]">
                Officials' Structured Version
              </h2>
              <p className="text-xs text-[#171717]/70 mt-1 max-w-xl">
                Government officials don't read 5,000 raw chat messages — CivicPulse aggregates thousands of signals into categorized dashboards and pattern alerts.
              </p>
            </div>

            <div className="p-3 bg-[#171717] text-[#F7F5EF] font-mono text-xs text-center border border-[#171717]">
              <span className="text-[9px] text-[#D65A3A] block font-bold">PROCESSED SIGNALS</span>
              <span className="font-extrabold text-sm">2,481 Healthcare Signals</span>
            </div>
          </div>

          {/* Healthcare Signals Breakdown Table */}
          <div className="bg-[#F7F5EF] border border-[#171717] p-5 shadow-[3px_3px_0px_#171717] space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#171717]/20 pb-2">
              <span className="font-bold text-rose-900 uppercase flex items-center gap-1.5 text-sm">
                <HeartPulse className="w-5 h-5 text-rose-600" />
                Healthcare Signals Breakdown (2,481 Signals)
              </span>
              <span className="text-[10px] bg-rose-100 text-rose-900 px-2 py-0.5 border border-rose-300 font-bold">
                Categorized Automatically
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-3.5 bg-white border border-[#171717] space-y-1">
                <span className="text-[10px] text-[#171717]/60 block font-bold">DOCTOR AVAILABILITY</span>
                <span className="text-xl font-extrabold text-[#171717]">842</span>
                <p className="text-[9px] text-[#171717]/70">33.9% of total healthcare signals</p>
              </div>

              <div className="p-3.5 bg-white border-2 border-rose-600 space-y-1 shadow-[2px_2px_0px_#D65A3A]">
                <span className="text-[10px] text-rose-700 block font-bold">MEDICINE SHORTAGE</span>
                <span className="text-xl font-extrabold text-rose-700">617</span>
                <p className="text-[9px] font-bold text-rose-800">🔴 Critical Supply Chain Anomaly</p>
              </div>

              <div className="p-3.5 bg-white border border-[#171717] space-y-1">
                <span className="text-[10px] text-[#171717]/60 block font-bold">WAITING TIMES</span>
                <span className="text-xl font-extrabold text-[#171717]">493</span>
                <p className="text-[9px] text-[#171717]/70">19.8% of total healthcare signals</p>
              </div>

              <div className="p-3.5 bg-white border border-[#171717] space-y-1">
                <span className="text-[10px] text-[#171717]/60 block font-bold">FACILITY CONDITION</span>
                <span className="text-xl font-extrabold text-[#171717]">281</span>
                <p className="text-[9px] text-[#171717]/70">11.3% of total healthcare signals</p>
              </div>

              <div className="p-3.5 bg-white border border-[#171717] space-y-1">
                <span className="text-[10px] text-[#171717]/60 block font-bold">OTHER / MISC</span>
                <span className="text-xl font-extrabold text-[#171717]">248</span>
                <p className="text-[9px] text-[#171717]/70">10.0% of total healthcare signals</p>
              </div>
            </div>
          </div>

          {/* Pattern Alert Card */}
          <div className="p-5 bg-[#171717] text-[#F7F5EF] border border-[#171717] space-y-3 shadow-[4px_4px_0px_#D65A3A]">
            <div className="flex items-center justify-between border-b border-white/20 pb-2">
              <span className="text-xs font-mono font-bold uppercase text-[#D65A3A] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#D65A3A]" />
                PATTERN DETECTED 🔴
              </span>
              <span className="text-[10px] font-mono bg-rose-700 text-white px-2 py-0.5 font-bold">
                Confidence: 89%
              </span>
            </div>

            <p className="font-serif font-bold text-base leading-snug">
              "7 districts show unusually high reports of medicine shortages across rural PHC centers."
            </p>

            <div className="p-3 bg-white/10 border border-white/20 font-mono text-xs space-y-1">
              <span className="text-[10px] font-bold text-amber-300 block">FEEDS DIRECTLY INTO RECOMMENDATIONS PORTAL:</span>
              <p className="text-white italic">
                "💡 Consider investigating medicine supply chains across these 7 districts and reallocating regional buffer stock."
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onNavigateToPatterns && onNavigateToPatterns()}
                className="py-2 px-4 bg-[#D65A3A] text-white font-mono text-xs font-bold uppercase border border-white cursor-pointer shadow-[2px_2px_0px_#171717]"
              >
                Open Recommendations Portal →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: THE 6-STAGE POLICY INTELLIGENCE PIPELINE & STAGE 6 MEASURE */}
      {activeTab === 'pipeline' && (
        <div className="bg-white border border-[#171717] p-6 sm:p-8 shadow-[5px_5px_0px_#171717] space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#171717]/15 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D65A3A] block">
                CONTINUOUS POLICY INTELLIGENCE SYSTEM
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#171717]">
                The 6-Stage CivicPulse Loop
              </h2>
              <p className="text-xs text-[#171717]/70 mt-1 max-w-2xl">
                CivicPulse isn't just a reporting app — it is a full-cycle policy intelligence system connecting citizen signals to capital allocation and post-intervention impact measurement.
              </p>
            </div>

            <span className="p-3 bg-[#171717] text-[#F7F5EF] font-mono text-xs font-bold border border-[#171717]">
              STAGE 1 ➔ STAGE 6
            </span>
          </div>

          {/* Visual 6-Stage Flow Diagram */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
            {/* Stage 1 */}
            <div className="p-4 bg-[#F7F5EF] border border-[#171717] space-y-2 shadow-[2px_2px_0px_#171717]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#D65A3A]">STAGE 01</span>
                <Mic className="w-4 h-4 text-[#D65A3A]" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#171717]">1. LISTEN</h4>
              <p className="text-[11px] text-[#171717]/80 leading-relaxed">
                Multimodal signal capture via Voice, Text, Messaging, and Photos across 5 Indian languages.
              </p>
            </div>

            {/* Stage 2 */}
            <div className="p-4 bg-[#F7F5EF] border border-[#171717] space-y-2 shadow-[2px_2px_0px_#171717]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-blue-800">STAGE 02</span>
                <Cpu className="w-4 h-4 text-blue-800" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#171717]">2. UNDERSTAND</h4>
              <p className="text-[11px] text-[#171717]/80 leading-relaxed">
                AI extracts language, category, location, duration, urgency tier, and affected demographics.
              </p>
            </div>

            {/* Stage 3 */}
            <div className="p-4 bg-[#F7F5EF] border border-[#171717] space-y-2 shadow-[2px_2px_0px_#171717]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-purple-800">STAGE 03</span>
                <Radio className="w-4 h-4 text-purple-800" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#171717]">3. DISCOVER</h4>
              <p className="text-[11px] text-[#171717]/80 leading-relaxed">
                AI finds spatial trends, anomalies, clusters, and cross-domain pattern intelligence.
              </p>
            </div>

            {/* Stage 4 */}
            <div className="p-4 bg-[#F7F5EF] border border-[#171717] space-y-2 shadow-[2px_2px_0px_#171717]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-800">STAGE 04</span>
                <Sparkles className="w-4 h-4 text-amber-800" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#171717]">4. RECOMMEND</h4>
              <p className="text-[11px] text-[#171717]/80 leading-relaxed">
                Generate BUILD / FIX / UPGRADE / POLICY recommendations with capital expenditure modeling.
              </p>
            </div>

            {/* Stage 5 */}
            <div className="p-4 bg-[#F7F5EF] border border-[#171717] space-y-2 shadow-[2px_2px_0px_#171717]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-800">STAGE 05</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-800" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#171717]">5. DECIDE</h4>
              <p className="text-[11px] text-[#171717]/80 leading-relaxed">
                Ministers & officials review evidence dossiers and sanction budget deployment.
              </p>
            </div>

            {/* Stage 6 */}
            <div className="p-4 bg-[#171717] text-[#F7F5EF] border border-[#171717] space-y-2 shadow-[2px_2px_0px_#D65A3A]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#D65A3A]">STAGE 06</span>
                <TrendingUp className="w-4 h-4 text-[#D65A3A]" />
              </div>
              <h4 className="font-serif font-bold text-sm text-white">6. MEASURE</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Track whether completed interventions actually resolved complaints & improved citizen sentiment post-fix!
              </p>
            </div>
          </div>

          {/* STAGE 6: MEASURE DASHBOARD IN ACTION */}
          <div className="p-6 bg-[#F7F5EF] border-2 border-[#171717] space-y-6 shadow-[4px_4px_0px_#171717]">
            <div className="flex items-center justify-between border-b border-[#171717]/20 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D65A3A] block">
                  STAGE 6: IMPACT MEASUREMENT & FEEDBACK LOOP
                </span>
                <h3 className="text-lg font-serif font-bold text-[#171717]">
                  Completed Project Impact Verification
                </h3>
              </div>
              <span className="px-3 py-1 bg-emerald-700 text-white font-mono text-xs font-bold uppercase">
                POST-INTERVENTION AUDIT
              </span>
            </div>

            {/* Case Study 1: Guntur Water Trunk Pipeline */}
            <div className="bg-white p-5 border border-[#171717] space-y-4 shadow-[2px_2px_0px_#171717] font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#171717]/10 pb-2">
                <div>
                  <span className="text-[10px] text-blue-800 font-bold uppercase block">CASE STUDY #01 • GUNTUR DISTRICT</span>
                  <h4 className="font-serif font-bold text-base text-[#171717]">Water Trunk Pipeline & Filtration Upgrade</h4>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-400 px-2.5 py-1 font-bold">
                  ✓ Intervention Completed (60 Days Ago)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-[#F7F5EF] border border-[#171717]/20">
                  <span className="text-[9px] text-[#171717]/60 block font-bold">PRE-FIX SIGNALS</span>
                  <span className="text-lg font-extrabold text-rose-700">450 / mo</span>
                </div>

                <div className="p-3 bg-[#F7F5EF] border border-[#171717]/20">
                  <span className="text-[9px] text-[#171717]/60 block font-bold">POST-FIX SIGNALS</span>
                  <span className="text-lg font-extrabold text-emerald-700">12 / mo</span>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-300">
                  <span className="text-[9px] text-emerald-900 block font-bold">COMPLAINT REDUCTION</span>
                  <span className="text-lg font-extrabold text-emerald-800">▼ 97.3%</span>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-300">
                  <span className="text-[9px] text-blue-900 block font-bold">SATISFACTION RATING</span>
                  <span className="text-lg font-extrabold text-blue-900">22% ➔ 94%</span>
                </div>
              </div>
            </div>

            {/* Case Study 2: Vijayawada School Access Road */}
            <div className="bg-white p-5 border border-[#171717] space-y-4 shadow-[2px_2px_0px_#171717] font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#171717]/10 pb-2">
                <div>
                  <span className="text-[10px] text-amber-800 font-bold uppercase block">CASE STUDY #02 • VIJAYAWADA DISTRICT</span>
                  <h4 className="font-serif font-bold text-base text-[#171717]">School Access Corridor & LED Street Lighting Grid</h4>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-400 px-2.5 py-1 font-bold">
                  ✓ Intervention Completed (30 Days Ago)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-[#F7F5EF] border border-[#171717]/20">
                  <span className="text-[9px] text-[#171717]/60 block font-bold">PRE-FIX SIGNALS</span>
                  <span className="text-lg font-extrabold text-rose-700">280 / mo</span>
                </div>

                <div className="p-3 bg-[#F7F5EF] border border-[#171717]/20">
                  <span className="text-[9px] text-[#171717]/60 block font-bold">POST-FIX SIGNALS</span>
                  <span className="text-lg font-extrabold text-emerald-700">8 / mo</span>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-300">
                  <span className="text-[9px] text-emerald-900 block font-bold">COMPLAINT REDUCTION</span>
                  <span className="text-lg font-extrabold text-emerald-800">▼ 97.1%</span>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-300">
                  <span className="text-[9px] text-blue-900 block font-bold">NIGHT SAFETY PERCEPTION</span>
                  <span className="text-lg font-extrabold text-blue-900">31% ➔ 89%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
