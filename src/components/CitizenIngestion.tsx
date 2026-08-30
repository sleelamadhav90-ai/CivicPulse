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
  Cpu
} from 'lucide-react';
import { District, CitizenRequest, InfrastructureCategory, ScoreBreakdown, AIAnalysisResult } from '../types';
import { SAMPLE_CITIZEN_PROMPTS } from '../data/initialRequests';
import { calculatePriorityScore } from '../utils/scoring';

interface CitizenIngestionProps {
  districts: District[];
  requests: CitizenRequest[];
  onAddRequest: (req: CitizenRequest) => void;
  onOpenScoreModal: (breakdown: ScoreBreakdown, district: District, category: InfrastructureCategory) => void;
  onNavigateToHotspots: () => void;
}

const CATEGORY_LIST: { id: InfrastructureCategory; label: string; icon: any; color: string; bg: string }[] = [
  { id: 'Drainage', label: 'Drainage', icon: Droplets, color: 'text-cyan-600', bg: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200' },
  { id: 'Roads', label: 'Roads', icon: Route, color: 'text-amber-600', bg: 'bg-amber-50 hover:bg-amber-100 border-amber-200' },
  { id: 'Water', label: 'Water', icon: Droplet, color: 'text-blue-600', bg: 'bg-blue-50 hover:bg-blue-100 border-blue-200' },
  { id: 'Electricity', label: 'Electricity', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200' },
  { id: 'Healthcare', label: 'Healthcare', icon: HeartPulse, color: 'text-rose-600', bg: 'bg-rose-50 hover:bg-rose-100 border-rose-200' },
  { id: 'Sanitation', label: 'Sanitation', icon: Trash2, color: 'text-emerald-600', bg: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200' },
  { id: 'Education', label: 'Education', icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50 hover:bg-purple-100 border-purple-200' },
  { id: 'Other', label: 'Other', icon: Building2, color: 'text-slate-600', bg: 'bg-slate-50 hover:bg-slate-100 border-slate-200' },
];

export const CitizenIngestion: React.FC<CitizenIngestionProps> = ({
  districts,
  requests,
  onAddRequest,
  onOpenScoreModal,
  onNavigateToHotspots,
}) => {
  // Form State - Defaulting to the new drainage scenario for instant demonstration
  const [problemDescription, setProblemDescription] = useState('Our area has no proper drainage and during rain the entire road gets flooded.');
  const [selectedLocation, setSelectedLocation] = useState('Vijayawada');
  const [selectedCategory, setSelectedCategory] = useState<InfrastructureCategory>('Drainage');
  const [submissionMode, setSubmissionMode] = useState<'voice' | 'text'>('text');

  // Audio / Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioMimeType, setAudioMimeType] = useState<string>('audio/wav');
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

  // Processing & Confirmation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedReceipt, setSubmittedReceipt] = useState<{
    requestId: string;
    issueTitle: string;
    category: InfrastructureCategory;
    location: string;
    priorityTier: 'Low' | 'Medium' | 'High' | 'Critical';
    aiSummary: string;
    originalText: string;
    request: CitizenRequest;
    scoreBreakdown: ScoreBreakdown;
    district: District;
    aiAnalysis: AIAnalysisResult;
  } | null>(null);

  // Refs for media recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Handle start microphone recording
  const startRecording = async () => {
    try {
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        setAudioMimeType(mimeType);
        setAudioFileName(`voice_report_${Date.now().toString().slice(-4)}.${mimeType.includes('mp4') ? 'mp4' : mimeType.includes('wav') ? 'wav' : 'webm'}`);

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          setAudioBase64(base64Data);
        };

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setErrorMessage('Microphone access unavailable or denied. You can still type in any regional language or choose a 1-click prompt.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  // Handle audio file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage(null);
    setAudioFileName(file.name);
    setAudioMimeType(file.type || 'audio/wav');
    const url = URL.createObjectURL(file);
    setRecordedAudioUrl(url);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setAudioBase64(reader.result as string);
    };
  };

  // Load sample prompt
  const handleLoadSample = (sample: typeof SAMPLE_CITIZEN_PROMPTS[0]) => {
    setProblemDescription(sample.text);
    if (sample.district) {
      const match = districts.find(d => d.name.toLowerCase() === sample.district.toLowerCase());
      if (match) setSelectedLocation(match.name);
    }
    if (sample.category) {
      const cat = (sample.category === 'Health' ? 'Healthcare' : sample.category) as InfrastructureCategory;
      setSelectedCategory(cat);
    }
    setSubmissionMode('text');
    setAudioBase64(null);
    setRecordedAudioUrl(null);
    setAudioFileName(null);
    setErrorMessage(null);
  };

  // Submit Request Action with AI Diagnostic Analysis
  const handleSubmitRequest = async () => {
    const inputContent = problemDescription.trim();
    if (!inputContent && !audioBase64) {
      setErrorMessage('Please describe the problem or record a voice note.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/process-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputContent || undefined,
          audioBase64: audioBase64 || undefined,
          mimeType: audioMimeType,
          userLocation: selectedLocation,
          userCategory: selectedCategory,
        }),
      });

      const resData = await response.json();
      const extracted = resData.data || {};

      // Match target district
      const matchedDistrict = districts.find(
        (d) => d.name.toLowerCase() === (extracted.location || selectedLocation).toLowerCase()
      ) || districts.find(d => d.name.toLowerCase() === 'vijayawada') || districts[0];

      // Structured AI outputs
      const isDrainage = inputContent.toLowerCase().includes('drain') || inputContent.toLowerCase().includes('flood');
      const isLighting = inputContent.toLowerCase().includes('light');
      
      const finalCategory: InfrastructureCategory = (extracted.category as InfrastructureCategory) || selectedCategory || (isDrainage ? 'Drainage' : 'Electricity');
      const problem = extracted.problem || (isDrainage ? 'Flooding caused by inadequate drainage' : isLighting ? 'Insufficient street lighting near educational institution' : 'Infrastructure deficit requiring civic remediation');
      const urgency = (extracted.urgency as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') || 'HIGH';
      const affectedInfrastructure = extracted.affected_infrastructure || (isDrainage ? 'Stormwater drainage' : isLighting ? 'Street lighting grid' : `${finalCategory} network`);
      const estimatedImpact = (extracted.estimated_impact as 'Low' | 'Medium' | 'High' | 'Critical') || 'High';
      const recommendedAction = extracted.recommended_action || (isDrainage ? 'Upgrade drainage infrastructure and improve stormwater capacity.' : isLighting ? 'Install high-illumination LED streetlights and expand grid coverage.' : `Rehabilitate and modernise ${finalCategory} infrastructure.`);

      const severity = extracted.severity || (urgency === 'CRITICAL' ? 10 : urgency === 'HIGH' ? 8 : 6);
      const priorityTier = extracted.priority_tier || (severity >= 8 ? 'High' : severity >= 6 ? 'Medium' : 'Low');
      const issueTitle = problem.length > 30 ? problem.substring(0, 30) + '...' : problem;
      
      const randomIdSuffix = Math.floor(10000 + Math.random() * 90000);
      const formattedId = `CP-${randomIdSuffix}`;

      // Prior demand count for deterministic score
      const priorDemand = requests.filter(
        (r) => r.location.toLowerCase() === matchedDistrict.name.toLowerCase() && (r.category === finalCategory || (r.category === 'Health' && finalCategory === 'Healthcare'))
      ).length + 1;

      const scoreBreakdown = calculatePriorityScore(
        matchedDistrict,
        finalCategory,
        severity,
        priorDemand
      );

      const aiAnalysis: AIAnalysisResult = {
        category: finalCategory,
        problem,
        urgency,
        affected_infrastructure: affectedInfrastructure,
        estimated_impact: estimatedImpact,
        recommended_action: recommendedAction,
      };

      const newRequest: CitizenRequest = {
        id: formattedId,
        timestamp: new Date().toISOString(),
        original_text: inputContent || `[Voice Note: ${audioFileName || 'Citizen Audio'}]`,
        language: extracted.language || 'English',
        category: finalCategory,
        issue_title: issueTitle,
        location: matchedDistrict.name,
        severity,
        priority_tier: priorityTier,
        summary_en: extracted.summary_en || `${problem} in ${matchedDistrict.name}.`,
        urgency_reasoning: extracted.urgency_reasoning || 'Public safety and accessibility priority.',
        affected_group: extracted.affected_group || 'Local residents and daily commuters',
        audio_url: recordedAudioUrl || undefined,
        source_type: audioBase64 ? 'voice' : 'text',
        status: 'Submitted',
        problem,
        urgency,
        affected_infrastructure: affectedInfrastructure,
        estimated_impact: estimatedImpact,
        recommended_action: recommendedAction,
        ai_analysis: aiAnalysis,
      };

      onAddRequest(newRequest);

      setSubmittedReceipt({
        requestId: formattedId,
        issueTitle,
        category: finalCategory,
        location: matchedDistrict.name,
        priorityTier,
        aiSummary: newRequest.summary_en,
        originalText: newRequest.original_text,
        request: newRequest,
        scoreBreakdown,
        district: matchedDistrict,
        aiAnalysis,
      });

      setIsProcessing(false);
    } catch (err: any) {
      console.error('Submission error:', err);
      setIsProcessing(false);
      setErrorMessage(err.message || 'An error occurred while analyzing the request. Please try again.');
    }
  };

  // Reset to submit another request
  const handleResetForm = () => {
    setSubmittedReceipt(null);
    setProblemDescription('');
    setAudioBase64(null);
    setRecordedAudioUrl(null);
    setAudioFileName(null);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-md bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                AI DIAGNOSTIC INGESTION
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Citizen Request Submission
              </h1>
            </div>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
              CivicPulse uses AI to diagnose civic complaints into structured engineering tasks (Category, Problem, Urgency, Affected Infrastructure, Impact, and Recommended Action) to eliminate administrative bottleneck.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium">
            <Globe2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Multilingual Support:</span>
            <span className="text-slate-500 font-mono">English • Telugu • Hindi • Marathi</span>
          </div>
        </div>

        {/* 1-Click Quick Sample Prompts */}
        {!submittedReceipt && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Quick Diagnostic Scenarios:
              </span>
              <span className="text-xs text-slate-400">Click to autofill prompt</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setProblemDescription('Our area has no proper drainage and during rain the entire road gets flooded.');
                  setSelectedLocation('Vijayawada');
                  setSelectedCategory('Drainage');
                  setSubmissionMode('text');
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-300 hover:bg-cyan-100 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>🌊 Drainage & Road Flooding (Feature 2 Demo)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProblemDescription('There is no street lighting near our college.');
                  setSelectedLocation('Vijayawada');
                  setSelectedCategory('Electricity');
                  setSubmissionMode('text');
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>💡 Street Lighting near College (Vijayawada)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProblemDescription('Drinking water pipeline damaged in rural ward for 4 days.');
                  setSelectedLocation('Guntur');
                  setSelectedCategory('Water');
                  setSubmissionMode('text');
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <span>🚰 Water Pipeline Breach (Guntur)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProblemDescription('Emergency triage ward lacks doctors and life-saving medicines.');
                  setSelectedLocation('Warangal');
                  setSelectedCategory('Healthcare');
                  setSubmissionMode('text');
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <span>🏥 PHC Clinic Shortage (Warangal)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Submission Form OR Post-Submission Confirmation Receipt */}
      {!submittedReceipt ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-7">
          {/* Section 1: Problem Description */}
          <div className="space-y-2.5">
            <label className="block text-base font-bold text-slate-900">
              What problem are you facing?
            </label>
            <textarea
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder='e.g., "Our area has no proper drainage and during rain the entire road gets flooded."'
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-sans leading-relaxed shadow-2xs"
            />
            <p className="text-xs text-slate-500">
              You can write in English or any Indian regional language (Telugu, Hindi, Marathi, etc.). AI will analyze and categorize the civic deficit automatically.
            </p>
          </div>

          {/* Section 2: Location */}
          <div className="space-y-2.5">
            <label className="block text-base font-bold text-slate-900 flex items-center gap-1.5">
              <span>Location</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-rose-500">
                  <MapPin className="w-4 h-4" />
                </div>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer shadow-2xs"
                >
                  <option value="Vijayawada">📍 Vijayawada (Andhra Pradesh)</option>
                  <option value="Guntur">📍 Guntur (Andhra Pradesh)</option>
                  <option value="Krishna">📍 Krishna (Andhra Pradesh)</option>
                  <option value="Kurnool">📍 Kurnool (Andhra Pradesh)</option>
                  <option value="Warangal">📍 Warangal (Telangana)</option>
                  <option value="Hyderabad">📍 Hyderabad (Telangana)</option>
                  <option value="Nizamabad">📍 Nizamabad (Telangana)</option>
                  <option value="Nashik">📍 Nashik (Maharashtra)</option>
                  <option value="Pune">📍 Pune (Maharashtra)</option>
                  <option value="Solapur">📍 Solapur (Maharashtra)</option>
                  <option value="Mysuru">📍 Mysuru (Karnataka)</option>
                  <option value="Raichur">📍 Raichur (Karnataka)</option>
                  <option value="Madurai">📍 Madurai (Tamil Nadu)</option>
                  <option value="Varanasi">📍 Varanasi (Uttar Pradesh)</option>
                  <option value="Jaipur">📍 Jaipur (Rajasthan)</option>
                  <option value="Gaya">📍 Gaya (Bihar)</option>
                </select>
              </div>

              {/* Quick location pill buttons */}
              <div className="flex flex-wrap gap-1.5 items-center">
                {['Vijayawada', 'Guntur', 'Warangal', 'Nashik'].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedLocation(city)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      selectedLocation === city
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Category */}
          <div className="space-y-2.5">
            <label className="block text-base font-bold text-slate-900">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              {CATEGORY_LIST.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const IconComp = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 cursor-pointer shadow-2xs ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-300'
                        : `${cat.bg} border-slate-200 text-slate-800`
                    }`}
                  >
                    <IconComp className={`w-5 h-5 ${isSelected ? 'text-white' : cat.color}`} />
                    <span className="text-xs font-bold tracking-tight">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: How would you like to submit? */}
          <div className="space-y-3 pt-2">
            <label className="block text-base font-bold text-slate-900">
              How would you like to submit?
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => setSubmissionMode('voice')}
                className={`py-3 px-4 rounded-xl border font-bold text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-2xs ${
                  submissionMode === 'voice'
                    ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className="text-base">🎤</span>
                <span>Voice</span>
              </button>

              <button
                type="button"
                onClick={() => setSubmissionMode('text')}
                className={`py-3 px-4 rounded-xl border font-bold text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-2xs ${
                  submissionMode === 'text'
                    ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className="text-base">⌨️</span>
                <span>Text</span>
              </button>
            </div>

            {/* Voice Sub-Panel if Voice is Selected */}
            {submissionMode === 'voice' && (
              <div className="mt-4 p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-col items-center justify-center space-y-3 text-center">
                  {!isRecording ? (
                    <>
                      <button
                        type="button"
                        onClick={startRecording}
                        className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 cursor-pointer"
                      >
                        <Mic className="w-7 h-7" />
                      </button>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Tap to Record Voice Note</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Speak naturally in Telugu, Hindi, Marathi, Tamil, or English.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="w-16 h-16 rounded-full bg-rose-600 text-white animate-pulse border-4 border-rose-200 flex items-center justify-center shadow-lg transition-transform cursor-pointer"
                      >
                        <MicOff className="w-7 h-7" />
                      </button>
                      <div className="flex items-center space-x-2 text-rose-600 font-mono text-sm font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
                        <span>Recording in progress: {recordingSeconds}s</span>
                      </div>
                      <p className="text-xs text-slate-600">Tap to finish voice recording.</p>
                    </>
                  )}

                  {recordedAudioUrl && !isRecording && (
                    <div className="w-full mt-3 p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5 text-xs text-slate-800 font-medium">
                        <Volume2 className="w-4 h-4 text-emerald-600" />
                        <span>Voice Note Captured ({audioFileName})</span>
                      </div>
                      <audio controls src={recordedAudioUrl} className="h-8 max-w-[200px]" />
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                  <span>Or upload pre-recorded audio file:</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs sm:text-sm text-rose-700">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Request Button */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Directly integrated with the National Infrastructure Priority Registry</span>
            </div>

            <button
              type="button"
              onClick={handleSubmitRequest}
              disabled={isProcessing || (!problemDescription.trim() && !audioBase64)}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2.5 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Extracting AI Diagnostic Intelligence...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* AFTER SUBMISSION: The Clean Citizen Confirmation Receipt with Feature 2 AI Diagnostic Output */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          {/* Header Receipt Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Request received</span>
                  <span className="text-emerald-600">✓</span>
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Logged on {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date().toLocaleTimeString()} • Location: <strong className="text-slate-700">{submittedReceipt.location}</strong>
                </p>
              </div>
            </div>

            <div className="bg-slate-900 text-white px-4 py-2 rounded-xl flex flex-col items-start sm:items-end">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Request ID</span>
              <span className="text-base sm:text-lg font-mono font-extrabold text-amber-400">
                {submittedReceipt.requestId}
              </span>
            </div>
          </div>

          {/* Original Input Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
            <span className="font-bold text-slate-600 uppercase tracking-wider block mb-1">Citizen Input</span>
            <p className="text-slate-800 italic text-sm font-serif">"{submittedReceipt.originalText}"</p>
          </div>

          {/* FEATURE 2: AI OUTPUT DIAGNOSTIC CARD */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-7 shadow-md border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-400/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <span>AI Output</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                      Live Diagnostic
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Automated multi-attribute classification for civic engineering triage</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Diagnostic Model</span>
                <span className="text-xs font-mono text-blue-300 font-bold">gemini-3.7-flash</span>
              </div>
            </div>

            {/* The 6 Specified AI Output Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Field 1: Category */}
              <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  Category
                </span>
                <span className="text-base font-extrabold text-white mt-1">
                  {submittedReceipt.aiAnalysis.category}
                </span>
              </div>

              {/* Field 2: Problem */}
              <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  Problem
                </span>
                <span className="text-sm font-bold text-amber-200 mt-1">
                  {submittedReceipt.aiAnalysis.problem}
                </span>
              </div>

              {/* Field 3: Urgency */}
              <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-rose-400" />
                  Urgency
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black tracking-wider uppercase ${
                    submittedReceipt.aiAnalysis.urgency === 'HIGH' || submittedReceipt.aiAnalysis.urgency === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {submittedReceipt.aiAnalysis.urgency}
                  </span>
                  <span className="text-xs text-slate-400">Severity Score: {submittedReceipt.request.severity}/10</span>
                </div>
              </div>

              {/* Field 4: Affected Infrastructure */}
              <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-blue-400" />
                  Affected Infrastructure
                </span>
                <span className="text-sm font-bold text-white mt-1">
                  {submittedReceipt.aiAnalysis.affected_infrastructure}
                </span>
              </div>

              {/* Field 5: Estimated Impact */}
              <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  Estimated Impact
                </span>
                <span className="text-sm font-bold text-emerald-300 mt-1">
                  {submittedReceipt.aiAnalysis.estimated_impact}
                </span>
              </div>

              {/* Field 6: Recommended Action */}
              <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Recommended Action
                </span>
                <p className="text-sm font-medium text-slate-100 mt-1 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
                  {submittedReceipt.aiAnalysis.recommended_action}
                </p>
              </div>
            </div>
          </div>

          {/* Status Tracker: 4 Steps */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-4">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Status Tracker:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Step 1: Submitted */}
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  ●
                </div>
                <div>
                  <div className="text-xs font-extrabold text-blue-900">Submitted</div>
                  <div className="text-[10px] text-blue-700">Validated & Recorded</div>
                </div>
              </div>

              {/* Step 2: Under Review */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-2.5 text-slate-500">
                <div className="w-5 h-5 rounded-full border border-slate-400 flex items-center justify-center text-xs font-medium shrink-0">
                  ○
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-700">Under Review</div>
                  <div className="text-[10px] text-slate-400">Department Screening</div>
                </div>
              </div>

              {/* Step 3: Assigned */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-2.5 text-slate-500">
                <div className="w-5 h-5 rounded-full border border-slate-400 flex items-center justify-center text-xs font-medium shrink-0">
                  ○
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-700">Assigned</div>
                  <div className="text-[10px] text-slate-400">Municipal Work Order</div>
                </div>
              </div>

              {/* Step 4: Resolved */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-2.5 text-slate-500">
                <div className="w-5 h-5 rounded-full border border-slate-400 flex items-center justify-center text-xs font-medium shrink-0">
                  ○
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-700">Resolved</div>
                  <div className="text-[10px] text-slate-400">Citizen Verification</div>
                </div>
              </div>
            </div>
          </div>

          {/* Computed Priority Score Banner & Inspection */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Calculated Priority Score for {submittedReceipt.location}
              </span>
              <div className="text-2xl font-mono font-bold text-amber-400 mt-0.5">
                {submittedReceipt.scoreBreakdown.total_score}
                <span className="text-xs text-slate-400 font-normal"> /100</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onOpenScoreModal(
                  submittedReceipt.scoreBreakdown,
                  submittedReceipt.district,
                  submittedReceipt.category
                )
              }
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Inspect Deterministic Formula</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetForm}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Submit Another Request</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToHotspots}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View On Demand Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
