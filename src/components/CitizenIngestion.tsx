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
  HeartPulse, 
  Route, 
  GraduationCap, 
  Zap,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  Info,
  Layers,
  Radio
} from 'lucide-react';
import { District, CitizenRequest, InfrastructureCategory, ScoreBreakdown } from '../types';
import { SAMPLE_CITIZEN_PROMPTS } from '../data/initialRequests';
import { calculatePriorityScore, getPriorityTier } from '../utils/scoring';

interface CitizenIngestionProps {
  districts: District[];
  requests: CitizenRequest[];
  onAddRequest: (req: CitizenRequest) => void;
  onOpenScoreModal: (breakdown: ScoreBreakdown, district: District, category: InfrastructureCategory) => void;
  onNavigateToHotspots: () => void;
}

export const CitizenIngestion: React.FC<CitizenIngestionProps> = ({
  districts,
  requests,
  onAddRequest,
  onOpenScoreModal,
  onNavigateToHotspots,
}) => {
  const [inputMode, setInputMode] = useState<'text' | 'voice' | 'upload'>('text');
  const [textInput, setTextInput] = useState('');
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioMimeType, setAudioMimeType] = useState<string>('audio/wav');
  const [audioFileName, setAudioFileName] = useState<string | null>(null);

  // Live Microphone Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0);
  const [processingResult, setProcessingResult] = useState<{
    request: CitizenRequest;
    scoreBreakdown: ScoreBreakdown;
    district: District;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs for media recording and audio context
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

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

      // Select supported mimeType
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
        setAudioFileName(`voice_note_${Date.now()}.${mimeType.includes('mp4') ? 'mp4' : mimeType.includes('wav') ? 'wav' : 'webm'}`);

        // Convert to Base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          setAudioBase64(base64Data);
        };

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250); // Slice every 250ms
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access error:', err);
      setErrorMessage('Microphone access was denied or is unavailable. You can still test with text input or sample voice scenarios.');
      setIsRecording(false);
    }
  };

  // Handle stop microphone recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  // Handle file upload
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
      const base64Data = reader.result as string;
      setAudioBase64(base64Data);
    };
  };

  // Load sample prompt
  const handleLoadSample = (sample: typeof SAMPLE_CITIZEN_PROMPTS[0]) => {
    setTextInput(sample.text);
    setInputMode('text');
    setAudioBase64(null);
    setRecordedAudioUrl(null);
    setAudioFileName(null);
    setErrorMessage(null);
  };

  // Submit Feedback to Backend Gemini Pipeline
  const handleSubmitFeedback = async () => {
    if (!textInput.trim() && !audioBase64) {
      setErrorMessage('Please enter citizen text feedback or record/upload an audio message.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setPipelineStep(1);

    try {
      // Animated pipeline step 1: Transcribing & Ingesting
      setTimeout(() => setPipelineStep(2), 600);

      const response = await fetch('/api/process-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textInput.trim() || undefined,
          audioBase64: audioBase64 || undefined,
          mimeType: audioMimeType,
        }),
      });

      setPipelineStep(3);
      const resData = await response.json();

      if (!resData.success && !resData.fallback) {
        throw new Error(resData.error || 'Failed to process feedback with AI.');
      }

      const extracted = resData.data;

      // Find matching district or default
      const matchedDistrict = districts.find(
        (d) => d.name.toLowerCase() === (extracted.location || '').toLowerCase()
      ) || districts[0];

      const category = (['Water', 'Health', 'Roads', 'Education', 'Electricity'].includes(extracted.category)
        ? extracted.category
        : 'Water') as InfrastructureCategory;

      const severity = extracted.severity || 8;

      // Count prior demand for this district + category
      const priorDemand = requests.filter(
        (r) => r.location.toLowerCase() === matchedDistrict.name.toLowerCase() && r.category === category
      ).length + 1; // including this new request

      // Deterministic calculation
      const scoreBreakdown = calculatePriorityScore(
        matchedDistrict,
        category,
        severity,
        priorDemand
      );

      const newRequest: CitizenRequest = {
        id: `req-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toISOString(),
        original_text: textInput.trim() || `[Audio Note: ${audioFileName || 'Citizen Voice Recording'}]`,
        language: extracted.language || 'Auto-detected',
        category,
        location: matchedDistrict.name,
        severity,
        summary_en: extracted.summary_en || 'Citizen reported an infrastructure disruption requiring urgent civic attention.',
        urgency_reasoning: extracted.urgency_reasoning,
        affected_group: extracted.affected_group,
        audio_url: recordedAudioUrl || undefined,
        source_type: audioBase64 ? 'voice' : 'text',
        status: scoreBreakdown.total_score >= 70 ? 'Prioritized' : 'Under Review',
      };

      setPipelineStep(4);
      setTimeout(() => {
        onAddRequest(newRequest);
        setProcessingResult({
          request: newRequest,
          scoreBreakdown,
          district: matchedDistrict,
        });
        setIsProcessing(false);
        setPipelineStep(0);
      }, 500);

    } catch (err: any) {
      console.error('Submission error:', err);
      setIsProcessing(false);
      setPipelineStep(0);
      setErrorMessage(err.message || 'An error occurred during Gemini AI processing. Please try again.');
    }
  };

  const getCategoryIcon = (category: InfrastructureCategory) => {
    switch (category) {
      case 'Water':
        return <Droplet className="w-4 h-4 text-blue-600" />;
      case 'Health':
        return <HeartPulse className="w-4 h-4 text-rose-600" />;
      case 'Roads':
        return <Route className="w-4 h-4 text-amber-600" />;
      case 'Education':
        return <GraduationCap className="w-4 h-4 text-purple-600" />;
      case 'Electricity':
        return <Zap className="w-4 h-4 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Friendly Guide Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-blue-50 text-blue-700 border border-blue-200">
                STEP 1 OF 4
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Citizen Demand Ingestion (Multimodal Voice AI)
              </h2>
            </div>
            <p className="text-sm text-slate-600 mt-1.5 max-w-3xl leading-relaxed">
              Citizens speak in local regional dialects (Telugu, Hindi, Marathi, etc.) or submit text complaints. Gemini extracts location coordinates, category, and severity, then updates the national priority score.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200 text-xs">
            <Globe2 className="w-4 h-4 text-blue-600" />
            <span className="text-slate-700 font-medium">Supported Languages:</span>
            <span className="text-slate-500 font-mono">Telugu • Hindi • Marathi • Tamil • English</span>
          </div>
        </div>

        {/* 1-Click Sample Scenarios Selector */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Try a 1-Click Sample Citizen Signal:
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">Click any scenario to auto-fill</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {SAMPLE_CITIZEN_PROMPTS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleLoadSample(sample)}
                className="text-left p-3 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 transition-all text-xs group cursor-pointer"
              >
                <div className="font-semibold text-slate-800 group-hover:text-blue-700 flex items-center justify-between">
                  <span className="truncate">{sample.title}</span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-mono">
                  {sample.text}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ingestion Console & Processing Result Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Citizen Input Form */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            {/* Input Mode Selector */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">Choose Input Method:</span>
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => { setInputMode('text'); setErrorMessage(null); }}
                  className={`px-3.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    inputMode === 'text'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Text Complaint
                </button>
                <button
                  type="button"
                  onClick={() => { setInputMode('voice'); setErrorMessage(null); }}
                  className={`px-3.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    inputMode === 'voice'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Record Live Mic
                </button>
                <button
                  type="button"
                  onClick={() => { setInputMode('upload'); setErrorMessage(null); }}
                  className={`px-3.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    inputMode === 'upload'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Upload Audio
                </button>
              </div>
            </div>

            {/* Input Area Depending on Mode */}
            {inputMode === 'text' && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Enter Citizen Feedback (Any regional Indian language or English):
                </label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="e.g., మా గ్రామంలో మూడు రోజులుగా నీళ్లు రావడం లేదు (Guntur) OR The primary health center in Warangal lacks emergency staff..."
                  rows={5}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all leading-relaxed"
                />
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Automatic dialect detection for Telugu, Hindi, Marathi, Tamil, Bengali & more.</span>
                  <span className="font-mono">{textInput.length} characters</span>
                </div>
              </div>
            )}

            {inputMode === 'voice' && (
              <div className="py-8 flex flex-col items-center justify-center space-y-4 bg-slate-50 rounded-xl border border-slate-200 p-6 text-center">
                {!isRecording ? (
                  <>
                    <button
                      onClick={startRecording}
                      className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition-all transform hover:scale-105 cursor-pointer"
                    >
                      <Mic className="w-7 h-7" />
                    </button>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Tap to Start Voice Recording</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm">
                        Speak in Telugu, Hindi, Marathi, or English. Explain the problem and mention your district or village.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      onClick={stopRecording}
                      className="w-16 h-16 rounded-full bg-rose-600 text-white animate-pulse border-4 border-rose-200 flex items-center justify-center shadow-lg transition-all cursor-pointer"
                    >
                      <MicOff className="w-7 h-7" />
                    </button>
                    <div>
                      <div className="flex items-center justify-center space-x-2 text-rose-600 font-mono text-sm font-bold">
                        <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                        <span>Recording: {recordingSeconds}s</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">Tap the red microphone button to finish recording.</p>
                    </div>
                  </>
                )}

                {/* Recorded Audio Playback */}
                {recordedAudioUrl && !isRecording && (
                  <div className="w-full mt-4 p-3.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between shadow-xs">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded bg-blue-50 text-blue-600">
                        <Volume2 className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-semibold text-slate-800">Voice Note Captured</span>
                        <span className="text-xs text-slate-500 block font-mono">{audioFileName}</span>
                      </div>
                    </div>
                    <audio controls src={recordedAudioUrl} className="h-8 max-w-xs" />
                  </div>
                )}
              </div>
            )}

            {inputMode === 'upload' && (
              <div className="space-y-4">
                <label className="block text-xs font-semibold text-slate-700">
                  Upload Recorded Audio (WAV, MP3, WebM):
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 text-center bg-slate-50 transition-colors">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-700 font-medium">Click to select audio file or drag & drop</p>
                  <p className="text-xs text-slate-500 mt-1">Supports standard audio formats up to 20MB</p>
                  <input
                    type="file"
                    accept="audio/wav,audio/mp3,audio/mpeg,audio/webm,audio/ogg"
                    onChange={handleFileUpload}
                    className="mt-4 text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                  />
                </div>

                {audioFileName && (
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between text-xs">
                    <span className="text-emerald-800 font-mono flex items-center font-medium">
                      <Volume2 className="w-4 h-4 text-emerald-600 mr-2" />
                      {audioFileName}
                    </span>
                    <span className="text-emerald-700 font-semibold">Ready for Gemini Parsing</span>
                  </div>
                )}
              </div>
            )}

            {/* Error Display */}
            {errorMessage && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Action Button */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500 flex items-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5" />
                Deterministic Scoring & Structured Schema
              </span>

              <button
                onClick={handleSubmitFeedback}
                disabled={isProcessing || (!textInput.trim() && !audioBase64)}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs uppercase tracking-wider rounded-lg shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Processing with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit & Analyze Signal</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Extraction & Live Priority Engine Feedback */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Pipeline Progress Tracker */}
          {isProcessing && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs animate-in fade-in">
              <div className="flex items-center space-x-2 text-blue-700 text-xs uppercase tracking-wider font-bold">
                <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
                <span>Gemini Multimodal Ingestion Pipeline</span>
              </div>

              <div className="space-y-2.5">
                <div className={`p-3 rounded-lg border text-xs flex items-center space-x-3 transition-all ${
                  pipelineStep >= 1 ? 'bg-blue-50 border-blue-200 text-blue-900 font-medium' : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    pipelineStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'
                  }`}>1</div>
                  <span>Transcribing Natural Language & Dialect</span>
                </div>

                <div className={`p-3 rounded-lg border text-xs flex items-center space-x-3 transition-all ${
                  pipelineStep >= 2 ? 'bg-blue-50 border-blue-200 text-blue-900 font-medium' : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    pipelineStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'
                  }`}>2</div>
                  <span>Category & District Location Normalization</span>
                </div>

                <div className={`p-3 rounded-lg border text-xs flex items-center space-x-3 transition-all ${
                  pipelineStep >= 3 ? 'bg-blue-50 border-blue-200 text-blue-900 font-medium' : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    pipelineStep >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'
                  }`}>3</div>
                  <span>Demographic Data Fusion & Deterministic Gap Math</span>
                </div>
              </div>
            </div>
          )}

          {/* Extracted Result Card */}
          {processingResult ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-xs animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Signal Successfully Ingested
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {new Date(processingResult.request.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {/* Badges strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Language</span>
                  <span className="text-xs font-bold text-slate-800 font-mono flex items-center mt-0.5">
                    <Globe2 className="w-3.5 h-3.5 mr-1 text-blue-600" />
                    {processingResult.request.language}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Sector Category</span>
                  <span className="text-xs font-bold text-slate-800 flex items-center mt-0.5">
                    {getCategoryIcon(processingResult.request.category)}
                    <span className="ml-1">{processingResult.request.category}</span>
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">District Location</span>
                  <span className="text-xs font-bold text-slate-800 font-mono flex items-center mt-0.5">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-rose-600" />
                    {processingResult.request.location}
                  </span>
                </div>
              </div>

              {/* Severity Gauge & English Summary */}
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-600 font-semibold">Urgency & Severity Score:</span>
                    <span className="font-mono font-bold text-rose-600">{processingResult.request.severity} / 10</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${processingResult.request.severity * 10}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-3.5 bg-blue-50/60 rounded-lg border border-blue-100 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
                    English Summary (Normalized by Gemini)
                  </span>
                  <p className="text-slate-800 font-sans leading-relaxed">
                    "{processingResult.request.summary_en}"
                  </p>
                  {processingResult.request.affected_group && (
                    <div className="mt-2 pt-2 border-t border-blue-200/60 text-xs text-blue-800">
                      <strong>Demographic Impact:</strong> {processingResult.request.affected_group}
                    </div>
                  )}
                </div>
              </div>

              {/* Computed Priority Score Banner */}
              <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">
                    National Priority Score
                  </span>
                  <div className="text-3xl font-bold font-mono text-amber-400 mt-0.5">
                    {processingResult.scoreBreakdown.total_score}
                    <span className="text-xs text-slate-400 font-normal"> /100</span>
                  </div>
                  <span className="text-xs text-slate-300">
                    Deficit Gap: {processingResult.scoreBreakdown.gap_percentage}% • {processingResult.scoreBreakdown.demand_count} demand signal(s)
                  </span>
                </div>

                <button
                  onClick={() =>
                    onOpenScoreModal(
                      processingResult.scoreBreakdown,
                      processingResult.district,
                      processingResult.request.category
                    )
                  }
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Inspect Formula</span>
                </button>
              </div>

              {/* Next Actions */}
              <div className="flex gap-2.5">
                <button
                  onClick={onNavigateToHotspots}
                  className="flex-1 py-2.5 text-xs uppercase tracking-wider font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Step 2: View on Hotspot Map</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    handleSubmitFeedback();
                  }}
                  className="px-3 py-2.5 text-xs uppercase tracking-wider font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="Resubmit to simulate multiple citizen demand signals"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                  <span>+1 Signal</span>
                </button>
              </div>
            </div>
          ) : (
            /* Standby Card */
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto">
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Awaiting Citizen Demand Signals</h4>
                <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto leading-relaxed">
                  Submit a voice recording, upload an audio clip, or type feedback to activate Gemini extraction and compute deterministic priority scores.
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 text-left space-y-1">
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  How the Pipeline Works:
                </div>
                <p className="leading-relaxed text-xs">
                  Gemini translates & normalizes unstructured citizen voices. The Priority Engine combines it with census & infrastructure data to rank deficits transparently.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
