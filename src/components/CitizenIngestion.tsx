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
  BarChart3, 
  TrendingUp, 
  Languages,
  Check,
  Building2,
  HelpCircle,
  FileText
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
    id: 'street-lighting',
    title: '💡 Scenario A: Street Lighting (English)',
    description: 'Direct citizen report parsed instantly into structured request.',
    language: 'English',
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
          category: 'Electricity / Infrastructure',
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
    id: 'tanglish-mixed',
    title: '🗣️ Scenario B: Code-Mixed Tanglish (Tamil + English)',
    description: 'Informal code-mixed speech parsed without requiring formal grammar.',
    language: 'Tanglish',
    messages: [
      { id: 'm1', sender: 'citizen', text: 'Road romba damage aagiduchu, school pakkam potholes irukku.', timestamp: '10:20 AM', language: 'Tanglish (Mixed)' },
      {
        id: 'm2',
        sender: 'ai',
        text: 'நான் புரிந்துகொண்டேன் (I understood). I have extracted your road defect report near the school area.',
        timestamp: '10:20 AM',
        language: 'Tanglish (Mixed)',
        isConfirmationCard: true,
        extractedEntity: {
          category: 'Road Infrastructure',
          subcategory: 'Severe Potholes & Surface Damage',
          location: 'Near Primary School Corridor',
          duration: 'Ongoing / 1 month',
          urgency: 'HIGH 🔴',
          affectedGroup: 'School children & daily commuters'
        }
      }
    ] as ChatMessage[]
  },
  {
    id: 'hinglish-mixed',
    title: '🗣️ Scenario C: Code-Mixed Hinglish (Hindi + English)',
    description: 'Combines Hindi and English phrases into unified civic signal.',
    language: 'Hinglish',
    messages: [
      { id: 'm1', sender: 'citizen', text: 'हमारे area में water supply बहुत खराब है, 10 days से पानी नहीं आया।', timestamp: '10:25 AM', language: 'Hinglish (Mixed)' },
      {
        id: 'm2',
        sender: 'ai',
        text: 'मैंने समझ लिया। (I understand). I have logged this drinking water supply shortage.',
        timestamp: '10:25 AM',
        language: 'Hinglish (Mixed)',
        isConfirmationCard: true,
        extractedEntity: {
          category: 'Water Infrastructure',
          subcategory: 'Pipeline Outage & Zero Supply',
          location: 'Krishna District Residential Area',
          duration: '10 days',
          urgency: 'CRITICAL 🔴',
          affectedGroup: 'Local households & families'
        }
      }
    ] as ChatMessage[]
  },
  {
    id: 'telugu-chat',
    title: 'తెలుగు Scenario D: Native Telugu Conversation',
    description: 'Citizen speaks Telugu; AI replies in Telugu while extracting structured English representation.',
    language: 'Telugu',
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
    id: 'hospital-followup',
    title: '🏥 Scenario E: Hospital Vague Input (AI Follow-up System)',
    description: 'AI presents interactive follow-up option pills to pinpoint missing details.',
    language: 'English',
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
  }
];

export const CitizenIngestion: React.FC<CitizenIngestionProps> = ({
  districts,
  onAddRequest,
  onNavigateToHotspots,
  onNavigateToPatterns,
}) => {
  // Navigation View Tabs
  const [activeTab, setActiveTab] = useState<'messaging' | 'onevoice' | 'official_dashboard' | 'pipeline'>('messaging');

  // Active Scenario Selection
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('street-lighting');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(SAMPLE_CHAT_SCENARIOS[0].messages);

  // Input Controls
  const [inputText, setInputText] = useState<string>("The street lights in our area have not been working for 2 weeks.");
  const [inputLanguage, setInputLanguage] = useState<string>('Auto-Detect');
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);

  // Official Interface Language Switcher
  const [officialLang, setOfficialLang] = useState<'EN' | 'TE' | 'HI' | 'TA'>('EN');

  // Audio Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
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
        text: "We understood your request! Please review the extracted details below:",
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
          DIGITAL PUBLIC GOOD • CIVICPULSE MULTILINGUAL AI
        </div>

        <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-[#171717] uppercase">
          CIVICPULSE
        </h1>
        
        {/* Multilingual Greetings Bar */}
        <div className="space-y-1">
          <p className="text-lg sm:text-xl font-serif text-[#D65A3A] font-bold italic">
            "உங்கள் பிரச்சனையை சொல்லுங்கள் • Tell us your problem • మీ సమస్యను చెప్పండి"
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 font-mono text-xs text-[#171717]/80">
            <span className="px-2 py-0.5 bg-[#F7F5EF] border border-[#171717]/30 font-bold">தமிழ்</span>
            <span>•</span>
            <span className="px-2 py-0.5 bg-[#F7F5EF] border border-[#171717]/30 font-bold">తెలుగు</span>
            <span>•</span>
            <span className="px-2 py-0.5 bg-[#F7F5EF] border border-[#171717]/30 font-bold">हिन्दी</span>
            <span>•</span>
            <span className="px-2 py-0.5 bg-[#F7F5EF] border border-[#171717]/30 font-bold">English</span>
            <span>•</span>
            <span className="px-2 py-0.5 bg-[#F7F5EF] border border-[#171717]/30 font-bold">বাংলা</span>
            <span>•</span>
            <span className="px-2 py-0.5 bg-[#F7F5EF] border border-[#171717]/30 font-bold">ಕನ್ನಡ</span>
          </div>
        </div>

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
            <span>01. Citizen Messaging</span>
          </button>

          <button
            onClick={() => setActiveTab('onevoice')}
            className={`px-4 py-2 font-mono text-xs font-bold uppercase transition-all cursor-pointer border border-[#171717] flex items-center gap-2 ${
              activeTab === 'onevoice'
                ? 'bg-[#171717] text-[#F7F5EF] shadow-[2px_2px_0px_#D65A3A]'
                : 'bg-[#F7F5EF] text-[#171717] hover:bg-white'
            }`}
          >
            <Languages className="w-3.5 h-3.5 text-[#D65A3A]" />
            <span>⭐ 02. One Civic Voice AI</span>
          </button>

          <button
            onClick={() => setActiveTab('official_dashboard')}
            className={`px-4 py-2 font-mono text-xs font-bold uppercase transition-all cursor-pointer border border-[#171717] flex items-center gap-2 ${
              activeTab === 'official_dashboard'
                ? 'bg-[#171717] text-[#F7F5EF] shadow-[2px_2px_0px_#D65A3A]'
                : 'bg-[#F7F5EF] text-[#171717] hover:bg-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#D65A3A]" />
            <span>03. Officials' Language View</span>
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
            <span>04. End-to-End Pipeline & Measure</span>
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
                PRE-CONFIGURED TEST MESSAGES
              </span>
              <p className="text-xs text-[#171717]/70">
                Click any scenario to test natural language & code-mixed parsing:
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
                  AUTOMATIC LANGUAGE DETECT
                </span>
              </div>

              {/* 3 Large Input Mode Buttons */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <button
                  type="button"
                  onClick={() => handleSendMessage("Road romba damage aagiduchu, school pakkam potholes irukku.")}
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

              {/* Language Mode Display */}
              <div className="p-3 bg-[#F7F5EF] border border-[#171717] font-mono text-xs space-y-1">
                <span className="text-[10px] font-bold text-[#D65A3A] uppercase block">AI AUTO-DETECTION ACTIVE:</span>
                <p className="text-[11px] text-[#171717]">
                  Type in <strong>Telugu, Hindi, Tanglish, Hinglish, Tamil, or English</strong>. No language selection dropdown required.
                </p>
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
                      ● Active • Multilingual Semantic Engine
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 border border-white/20 uppercase font-bold text-amber-300">
                  Auto-Detect Active
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
                    <span>AI is analyzing language & extracting structured civic signal...</span>
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
                    placeholder='💬 Write in Telugu, Tanglish, Hinglish, Hindi, Tamil or English...'
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

      {/* TAB 2: ONE CIVIC VOICE (CROSS-LANGUAGE CONVERGENCE & CODE-MIXED AI) */}
      {activeTab === 'onevoice' && (
        <div className="bg-white border border-[#171717] p-6 sm:p-8 shadow-[5px_5px_0px_#171717] space-y-8">
          {/* Concept Header */}
          <div className="text-center space-y-3 border-b border-[#171717]/15 pb-6">
            <span className="px-3 py-1 bg-[#171717] text-[#F7F5EF] font-mono text-[10px] font-bold uppercase tracking-widest border border-[#171717]">
              CONCEPTUAL IDENTITY • ONE CIVIC VOICE
            </span>

            <h2 className="text-2xl sm:text-3xl font-serif font-black uppercase text-[#171717]">
              Different Languages. One Civic Intelligence Layer.
            </h2>
            <p className="text-xs font-mono text-[#171717]/70 max-w-2xl mx-auto">
              CivicPulse does not rely on naive surface translation — it maps multi-dialect Indian citizen inputs directly into a unified semantic representation.
            </p>
          </div>

          {/* Visual Architecture Diagram: ONE CIVIC VOICE */}
          <div className="p-6 bg-[#171717] text-[#F7F5EF] border border-[#171717] space-y-6 shadow-[4px_4px_0px_#D65A3A]">
            <div className="text-center font-mono text-xs font-bold text-amber-300 uppercase tracking-wider">
              ONE CIVIC VOICE ARCHITECTURE
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center font-mono text-xs">
              <div className="p-3 bg-white/10 border border-white/20">
                <span className="font-bold text-amber-300 block">తెలుగు</span>
                <span className="text-[10px] text-white/70">Telugu</span>
              </div>
              <div className="p-3 bg-white/10 border border-white/20">
                <span className="font-bold text-amber-300 block">हिन्दी</span>
                <span className="text-[10px] text-white/70">Hindi</span>
              </div>
              <div className="p-3 bg-white/10 border border-white/20">
                <span className="font-bold text-amber-300 block">தமிழ்</span>
                <span className="text-[10px] text-white/70">Tamil</span>
              </div>
              <div className="p-3 bg-white/10 border border-white/20">
                <span className="font-bold text-amber-300 block">English</span>
                <span className="text-[10px] text-white/70">English</span>
              </div>
              <div className="p-3 bg-white/10 border border-white/20 col-span-2 sm:col-span-1">
                <span className="font-bold text-amber-300 block">ಕನ್ನಡ</span>
                <span className="text-[10px] text-white/70">Kannada</span>
              </div>
            </div>

            <div className="text-center font-mono text-[#D65A3A] font-bold text-xl">
              ↓ MULTILINGUAL SEMANTIC CONVERGENCE ENGINE ↓
            </div>

            <div className="p-4 bg-white text-[#171717] border-2 border-[#D65A3A] text-center space-y-1 font-mono">
              <span className="text-xs font-bold text-[#D65A3A] uppercase block">ONE SHARED CIVIC PICTURE</span>
              <p className="text-sm font-serif font-bold text-[#171717]">
                2,840 Native Signals ➔ Filtered into Unified Priority Clusters & Policy Actions
              </p>
            </div>
          </div>

          {/* Interactive Cross-Language Convergence Demonstrator */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#171717]/15 pb-2 font-mono">
              <span className="text-xs font-bold uppercase text-[#171717]">
                CROSS-LANGUAGE SEMANTIC CONVERGENCE DEMO
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-900 px-2 py-0.5 border border-blue-400 font-bold">
                5 DIVERSE INPUTS ➔ 1 CLUSTER
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* 5 Input Speech Cards */}
              <div className="lg:col-span-7 space-y-2.5 font-mono text-xs">
                <div className="p-3 bg-[#F7F5EF] border border-[#171717] flex items-center justify-between shadow-[2px_2px_0px_#171717]">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-amber-800 uppercase block">CITIZEN A • TELUGU (తెలుగు)</span>
                    <p className="font-serif italic text-xs">"మా గ్రామంలో రెండు వారాలుగా మంచినీటి సరఫరా నిలిచిపోయింది."</p>
                  </div>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 font-bold">VALID</span>
                </div>

                <div className="p-3 bg-[#F7F5EF] border border-[#171717] flex items-center justify-between shadow-[2px_2px_0px_#171717]">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-amber-800 uppercase block">CITIZEN B • HINDI (हिंदी)</span>
                    <p className="font-serif italic text-xs">"हमारे इलाके में पानी नहीं आ रहा है, टैंकर भी बंद है।"</p>
                  </div>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 font-bold">VALID</span>
                </div>

                <div className="p-3 bg-[#F7F5EF] border border-[#171717] flex items-center justify-between shadow-[2px_2px_0px_#171717]">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-amber-800 uppercase block">CITIZEN C • TAMIL (தமிழ்)</span>
                    <p className="font-serif italic text-xs">"எங்கள் பகுதியில் 2 வாரங்களாக குடிநீர் வரவில்லை."</p>
                  </div>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 font-bold">VALID</span>
                </div>

                <div className="p-3 bg-[#F7F5EF] border border-[#171717] flex items-center justify-between shadow-[2px_2px_0px_#171717]">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-amber-800 uppercase block">CITIZEN D • ENGLISH</span>
                    <p className="font-serif italic text-xs">"Water supply has completely stopped in our village for 14 days."</p>
                  </div>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 font-bold">VALID</span>
                </div>

                <div className="p-3 bg-[#F7F5EF] border border-[#171717] flex items-center justify-between shadow-[2px_2px_0px_#171717]">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-amber-800 uppercase block">CITIZEN E • KANNADA (ಕನ್ನಡ)</span>
                    <p className="font-serif italic text-xs">"ನಮ್ಮ ಊರಿನಲ್ಲಿ 2 ವಾರಗಳಿಂದ ಕುಡಿಯುವ ನೀರು ಬರುತ್ತಿಲ್ಲ."</p>
                  </div>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 font-bold">VALID</span>
                </div>
              </div>

              {/* Converged Cluster Box */}
              <div className="lg:col-span-5 p-5 bg-[#171717] text-[#F7F5EF] border-2 border-[#D65A3A] space-y-4 shadow-[5px_5px_0px_#171717]">
                <div className="flex items-center justify-between border-b border-white/20 pb-2 font-mono">
                  <span className="text-xs font-bold text-[#D65A3A] uppercase flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-[#D65A3A]" />
                    SEMANTIC CONVERGENCE
                  </span>
                  <span className="text-[9px] bg-rose-700 text-white px-2 py-0.5 font-bold">CRITICAL 🔴</span>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <span className="text-[10px] text-amber-300 font-bold block">IDENTIFIED PATTERN CLUSTER:</span>
                  <h3 className="font-serif font-black text-xl text-white">
                    WATER SHORTAGE OUTAGE
                  </h3>
                  <p className="text-[#F7F5EF]/80 text-xs leading-relaxed">
                    All 5 native inputs map to the exact same underlying infrastructure deficit without needing manual translation.
                  </p>
                </div>

                <div className="p-3 bg-white/10 border border-white/20 font-mono text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-white/70">Location:</span>
                    <span className="font-bold text-white">Krishna District (9 Villages)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Duration:</span>
                    <span className="font-bold text-amber-300">14 Days Continuous</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Impacted Households:</span>
                    <span className="font-bold text-rose-400">3,200 Families</span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateToPatterns && onNavigateToPatterns()}
                  className="w-full py-2.5 bg-[#D65A3A] text-white font-mono text-xs font-bold uppercase border border-white cursor-pointer shadow-[2px_2px_0px_#171717]"
                >
                  View Water Anomaly On Map →
                </button>
              </div>
            </div>
          </div>

          {/* Code-Mixed Informal Speech Support */}
          <div className="p-6 bg-[#F7F5EF] border border-[#171717] space-y-4 font-mono text-xs shadow-[3px_3px_0px_#171717]">
            <span className="font-bold text-[#171717] uppercase block border-b border-[#171717]/20 pb-2">
              INFORMAL CODE-MIXED SPEECH (HINGLISH & TANGLISH) EXAMPLES
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 border border-[#171717] space-y-2 shadow-[2px_2px_0px_#171717]">
                <span className="text-[10px] font-bold text-purple-800 uppercase block">TANGLISH CODE-MIXED REPORT</span>
                <p className="font-serif italic text-sm text-[#171717]">"Road romba damage aagiduchu, school pakkam potholes irukku."</p>
                <div className="p-2 bg-purple-50 border border-purple-200 text-[10px] space-y-0.5">
                  <div><strong>Language:</strong> Tanglish (Tamil + English)</div>
                  <div><strong>Topic:</strong> Road Infrastructure (Potholes)</div>
                  <div><strong>Location:</strong> School Corridor</div>
                  <div><strong>Urgency:</strong> HIGH 🔴</div>
                </div>
              </div>

              <div className="bg-white p-4 border border-[#171717] space-y-2 shadow-[2px_2px_0px_#171717]">
                <span className="text-[10px] font-bold text-blue-800 uppercase block">HINGLISH CODE-MIXED REPORT</span>
                <p className="font-serif italic text-sm text-[#171717]">"हमारे area में water supply बहुत खराब है, 10 days से पानी नहीं आया।"</p>
                <div className="p-2 bg-blue-50 border border-blue-200 text-[10px] space-y-0.5">
                  <div><strong>Language:</strong> Hinglish (Hindi + English)</div>
                  <div><strong>Topic:</strong> Drinking Water Outage</div>
                  <div><strong>Location:</strong> Residential Block</div>
                  <div><strong>Urgency:</strong> CRITICAL 🔴</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OFFICIALS' LANGUAGE COVERAGE & MULTILINGUAL DASHBOARD */}
      {activeTab === 'official_dashboard' && (
        <div className="bg-white border border-[#171717] p-6 sm:p-8 shadow-[5px_5px_0px_#171717] space-y-8">
          {/* Header & Interface Language Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#171717]/15 pb-4 font-mono">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D65A3A] block">
                OFFICIAL POLICY DASHBOARD
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#171717]">
                {officialLang === 'EN' && "Multilingual Executive Intelligence View"}
                {officialLang === 'TE' && "బహుభాషా ఎగ్జిక్యూటివ్ ఇంటెలిజెన్స్ వ్యూ"}
                {officialLang === 'HI' && "बहुभाषी कार्यकारी खुफिया दृश्य"}
                {officialLang === 'TA' && "பல்மொழி நிருவாக நுண்ணறிவுப் பார்வை"}
              </h2>
            </div>

            {/* Official UI Language Selector */}
            <div className="flex items-center gap-2 bg-[#F7F5EF] p-2 border border-[#171717]">
              <Globe2 className="w-4 h-4 text-[#D65A3A]" />
              <span className="text-xs font-bold uppercase text-[#171717]">Interface Language:</span>
              <select
                value={officialLang}
                onChange={(e) => setOfficialLang(e.target.value as any)}
                className="bg-white border border-[#171717] p-1 text-xs font-bold cursor-pointer"
              >
                <option value="EN">English ▾</option>
                <option value="TE">తెలుగు (Telugu)</option>
                <option value="HI">हिन्दी (Hindi)</option>
                <option value="TA">தமிழ் (Tamil)</option>
              </select>
            </div>
          </div>

          {/* Dynamic AI Summary in Selected Official Language */}
          <div className="p-5 bg-[#171717] text-[#F7F5EF] border border-[#171717] space-y-3 shadow-[4px_4px_0px_#D65A3A] font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/20 pb-2">
              <span className="text-xs font-bold text-amber-300 uppercase">
                AI EXECUTIVE SUMMARY (DYNAMICALLY TRANSLATED)
              </span>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 border border-white/20">
                Data Preserved • Language Switched
              </span>
            </div>

            <p className="font-serif text-base leading-relaxed text-white">
              {officialLang === 'EN' && "Water supply complaints increased 43% across 12 villages in Krishna district over the past 14 days."}
              {officialLang === 'TE' && "గత 14 రోజుల్లో కృష్ణా జిల్లాలోని 12 గ్రామాల్లో నీటి సరఫరా ఫిర్యాదులు 43% పెరిగాయి."}
              {officialLang === 'HI' && "पिछले 14 दिनों में कृष्णा जिले के 12 गांवों में पानी की आपूर्ति की शिकायतों में 43% की वृद्धि हुई है।"}
              {officialLang === 'TA' && "கடந்த 14 நாட்களில் கிருஷ்ணா மாவட்டத்தின் 12 கிராமங்களில் குடிநீர் விநியோக புகார்கள் 43% அதிகரித்துள்ளன."}
            </p>
          </div>

          {/* LANGUAGE COVERAGE ANALYTICS CARD */}
          <div className="p-6 bg-[#F7F5EF] border-2 border-[#171717] space-y-6 shadow-[4px_4px_0px_#171717] font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#171717]/20 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#D65A3A] block">
                  DIGITAL PUBLIC GOOD INCLUSIVITY METRICS
                </span>
                <h3 className="text-lg font-serif font-bold text-[#171717]">
                  Language Coverage Across 2,840 Citizen Signals
                </h3>
              </div>
              <span className="px-3 py-1 bg-[#171717] text-white font-bold text-xs">
                8 LANGUAGES ANALYZED
              </span>
            </div>

            {/* Language Breakdown Bars */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between font-bold pb-1">
                  <span>Telugu (తెలుగు)</span>
                  <span>1,240 signals (43%)</span>
                </div>
                <div className="w-full h-3 bg-white border border-[#171717]">
                  <div className="h-full bg-[#171717]" style={{ width: '43%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold pb-1">
                  <span>Hindi (हिंदी)</span>
                  <span>730 signals (26%)</span>
                </div>
                <div className="w-full h-3 bg-white border border-[#171717]">
                  <div className="h-full bg-[#D65A3A]" style={{ width: '26%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold pb-1">
                  <span>Tamil (தமிழ்)</span>
                  <span>490 signals (17%)</span>
                </div>
                <div className="w-full h-3 bg-white border border-[#171717]">
                  <div className="h-full bg-blue-700" style={{ width: '17%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold pb-1">
                  <span>English</span>
                  <span>380 signals (9%)</span>
                </div>
                <div className="w-full h-3 bg-white border border-[#171717]">
                  <div className="h-full bg-amber-600" style={{ width: '9%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold pb-1">
                  <span>Other (Bengali, Kannada, Marathi)</span>
                  <span>141 signals (5%)</span>
                </div>
                <div className="w-full h-3 bg-white border border-[#171717]">
                  <div className="h-full bg-slate-500" style={{ width: '5%' }} />
                </div>
              </div>
            </div>

            {/* Inclusivity Callout */}
            <div className="p-4 bg-emerald-100 border-2 border-emerald-600 text-emerald-900 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-xs block">✨ INCLUSIVITY HIGHLIGHT</span>
                <p className="text-xs font-sans font-semibold">
                  <strong>12% of high-priority critical signals</strong> were submitted in languages other than English — demonstrating that CivicPulse bridges the digital divide for rural populations.
                </p>
              </div>
              <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: END-TO-END PIPELINE & STAGE 6 MEASURE */}
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
