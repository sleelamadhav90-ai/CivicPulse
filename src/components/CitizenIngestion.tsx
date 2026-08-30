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
        return <Droplet className="w-4 h-4 text-sky-400" />;
      case 'Health':
        return <HeartPulse className="w-4 h-4 text-rose-400" />;
      case 'Roads':
        return <Route className="w-4 h-4 text-amber-400" />;
      case 'Education':
        return <GraduationCap className="w-4 h-4 text-indigo-400" />;
      case 'Electricity':
        return <Zap className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-[#111318] border border-slate-800 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="px-2 py-0.5 text-[9px] uppercase tracking-widest font-mono rounded bg-white/5 text-slate-400 border border-white/10">
                MODULE 01
              </span>
              <h2 className="text-xl font-light tracking-tight text-white">
                Multimodal Citizen Demand Ingestion
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Citizens speak in native dialects (Telugu, Hindi, Marathi, etc.) or submit text. Gemini transcribes, extracts geographic metadata, categorizes the deficit, and feeds the deterministic National Priority Engine.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-[#0c0d10] px-3 py-2 rounded-lg border border-slate-800/80 text-[11px]">
            <Globe2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-300 font-medium">Multilingual:</span>
            <span className="text-slate-500 font-mono">Telugu • Hindi • Marathi • Tamil • English</span>
          </div>
        </div>

        {/* 1-Click Sample Scenarios Selector */}
        <div className="mt-5 pt-4 border-t border-slate-800/60">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3 h-3 text-slate-400" />
              1-Click Demo Scenarios (Pre-loaded Citizen Signals):
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {SAMPLE_CITIZEN_PROMPTS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleLoadSample(sample)}
                className="text-left p-3 rounded-lg bg-[#0c0d10] hover:bg-white/[0.03] border border-slate-800/80 hover:border-slate-700 transition-all text-xs group cursor-pointer"
              >
                <div className="font-medium text-slate-200 group-hover:text-white flex items-center justify-between">
                  <span className="truncate">{sample.title}</span>
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-1 mt-1 font-mono">
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
          <div className="bg-[#111318] border border-slate-800 rounded-lg p-6">
            {/* Input Mode Selector */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/60">
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">Select Input Modality:</span>
              <div className="flex bg-[#0c0d10] p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setInputMode('text'); setErrorMessage(null); }}
                  className={`px-3 py-1 text-xs uppercase tracking-wider rounded transition-all cursor-pointer ${
                    inputMode === 'text'
                      ? 'bg-white/10 text-white font-medium shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Text
                </button>
                <button
                  type="button"
                  onClick={() => { setInputMode('voice'); setErrorMessage(null); }}
                  className={`px-3 py-1 text-xs uppercase tracking-wider rounded transition-all cursor-pointer ${
                    inputMode === 'voice'
                      ? 'bg-white/10 text-white font-medium shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Live Mic
                </button>
                <button
                  type="button"
                  onClick={() => { setInputMode('upload'); setErrorMessage(null); }}
                  className={`px-3 py-1 text-xs uppercase tracking-wider rounded transition-all cursor-pointer ${
                    inputMode === 'upload'
                      ? 'bg-white/10 text-white font-medium shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Audio File
                </button>
              </div>
            </div>

            {/* Input Area Depending on Mode */}
            {inputMode === 'text' && (
              <div className="space-y-3">
                <label className="block text-xs font-medium text-slate-300">
                  Citizen Request Text (Enter in any regional language):
                </label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="e.g., మా గ్రామంలో మూడు రోజులుగా నీళ్లు రావడం లేదు (Guntur) OR The primary health center in Warangal lacks emergency staff..."
                  rows={5}
                  className="w-full bg-[#0c0d10] border border-slate-800 rounded-lg p-4 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all font-sans leading-relaxed"
                />
                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span>Supports Telugu, Hindi, Marathi, Tamil, English, Kannada, Bengali.</span>
                  <span className="font-mono">{textInput.length} chars</span>
                </div>
              </div>
            )}

            {inputMode === 'voice' && (
              <div className="py-8 flex flex-col items-center justify-center space-y-4 bg-[#0c0d10] rounded-lg border border-slate-800/80 p-6 text-center">
                {!isRecording ? (
                  <>
                    <button
                      onClick={startRecording}
                      className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/20 flex items-center justify-center shadow-lg transition-all transform hover:scale-105 cursor-pointer"
                    >
                      <Mic className="w-7 h-7" />
                    </button>
                    <div>
                      <h4 className="text-xs uppercase tracking-widest font-medium text-slate-200">Tap to Start Recording</h4>
                      <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                        Speak in Telugu, Hindi, Marathi, or English. Describe the location and the problem.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      onClick={stopRecording}
                      className="w-16 h-16 rounded-full bg-rose-600 text-white animate-pulse border-2 border-rose-400 flex items-center justify-center shadow-lg transition-all cursor-pointer"
                    >
                      <MicOff className="w-7 h-7" />
                    </button>
                    <div>
                      <div className="flex items-center justify-center space-x-2 text-rose-400 font-mono text-xs font-medium">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                        <span>Recording: {recordingSeconds}s</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">Tap icon to stop recording.</p>
                    </div>
                  </>
                )}

                {/* Recorded Audio Playback */}
                {recordedAudioUrl && !isRecording && (
                  <div className="w-full mt-4 p-3 bg-[#111318] rounded-lg border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded bg-white/5 text-slate-300">
                        <Volume2 className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-medium text-slate-200">Voice Note Captured</span>
                        <span className="text-[10px] text-slate-500 block font-mono">{audioFileName}</span>
                      </div>
                    </div>
                    <audio controls src={recordedAudioUrl} className="h-8 max-w-xs" />
                  </div>
                )}
              </div>
            )}

            {inputMode === 'upload' && (
              <div className="space-y-4">
                <label className="block text-xs font-medium text-slate-300">
                  Upload Recorded Audio (WAV, MP3, WebM):
                </label>
                <div className="border border-dashed border-slate-800 hover:border-slate-600 rounded-lg p-8 text-center bg-[#0c0d10] transition-colors">
                  <Upload className="w-7 h-7 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-300 font-medium">Click to select audio file or drag & drop</p>
                  <p className="text-[10px] text-slate-500 mt-1">Audio files up to 20MB supported</p>
                  <input
                    type="file"
                    accept="audio/wav,audio/mp3,audio/mpeg,audio/webm,audio/ogg"
                    onChange={handleFileUpload}
                    className="mt-4 text-[11px] text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-[10px] file:uppercase file:tracking-wider file:font-semibold file:bg-slate-100 file:text-slate-900 hover:file:bg-white cursor-pointer"
                  />
                </div>

                {audioFileName && (
                  <div className="p-3 bg-[#0c0d10] rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-mono flex items-center">
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400 mr-2" />
                      {audioFileName}
                    </span>
                    <span className="text-emerald-400 font-medium text-[11px]">Ready for Gemini Parsing</span>
                  </div>
                )}
              </div>
            )}

            {/* Error Display */}
            {errorMessage && (
              <div className="mt-4 p-3 bg-rose-950/20 border border-rose-800/40 rounded-lg flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Action Button */}
            <div className="mt-6 pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
                Deterministic Scoring & Structured Schema
              </span>

              <button
                onClick={handleSubmitFeedback}
                disabled={isProcessing || (!textInput.trim() && !audioBase64)}
                className="w-full sm:w-auto px-5 py-2 bg-slate-100 hover:bg-white text-slate-900 font-semibold text-xs uppercase tracking-wider rounded-lg shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></span>
                    <span>Processing with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Signal</span>
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
            <div className="bg-[#111318] border border-slate-800 rounded-lg p-6 space-y-4 animate-in fade-in">
              <div className="flex items-center space-x-2 text-slate-300 text-xs uppercase tracking-widest font-medium">
                <Sparkles className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                <span>Gemini Multimodal Ingestion Pipeline</span>
              </div>

              <div className="space-y-2.5">
                <div className={`p-3 rounded-lg border text-xs flex items-center space-x-3 transition-all ${
                  pipelineStep >= 1 ? 'bg-white/5 border-white/20 text-white' : 'bg-[#0c0d10] border-slate-800 text-slate-600'
                }`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-medium ${
                    pipelineStep >= 1 ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400'
                  }`}>1</div>
                  <span>Transcribing Natural Language & Dialect</span>
                </div>

                <div className={`p-3 rounded-lg border text-xs flex items-center space-x-3 transition-all ${
                  pipelineStep >= 2 ? 'bg-white/5 border-white/20 text-white' : 'bg-[#0c0d10] border-slate-800 text-slate-600'
                }`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-medium ${
                    pipelineStep >= 2 ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400'
                  }`}>2</div>
                  <span>Category & District Location Normalization</span>
                </div>

                <div className={`p-3 rounded-lg border text-xs flex items-center space-x-3 transition-all ${
                  pipelineStep >= 3 ? 'bg-white/5 border-white/20 text-white' : 'bg-[#0c0d10] border-slate-800 text-slate-600'
                }`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-medium ${
                    pipelineStep >= 3 ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400'
                  }`}>3</div>
                  <span>Demographic Data Fusion & Deterministic Gap Math</span>
                </div>
              </div>
            </div>
          )}

          {/* Extracted Result Card */}
          {processingResult ? (
            <div className="bg-[#111318] border border-slate-800 rounded-lg p-6 space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
                <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Signal Ingested & Rated
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {new Date(processingResult.request.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {/* Badges strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="bg-[#0c0d10] p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-medium block">Detected Language</span>
                  <span className="text-xs font-light text-slate-200 font-mono flex items-center mt-0.5">
                    <Globe2 className="w-3 h-3 mr-1 text-slate-400" />
                    {processingResult.request.language}
                  </span>
                </div>

                <div className="bg-[#0c0d10] p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-medium block">Sector Category</span>
                  <span className="text-xs font-light text-slate-200 flex items-center mt-0.5">
                    {getCategoryIcon(processingResult.request.category)}
                    <span className="ml-1">{processingResult.request.category}</span>
                  </span>
                </div>

                <div className="bg-[#0c0d10] p-2.5 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-medium block">Location</span>
                  <span className="text-xs font-light text-slate-200 font-mono flex items-center mt-0.5">
                    <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                    {processingResult.request.location}
                  </span>
                </div>
              </div>

              {/* Severity Gauge & English Summary */}
              <div className="space-y-3">
                <div className="p-3 bg-[#0c0d10] rounded-lg border border-slate-800">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-400 font-medium">Urgency / Severity Rating:</span>
                    <span className="font-mono font-bold text-rose-400">{processingResult.request.severity} / 10</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${processingResult.request.severity * 10}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-3.5 bg-[#0c0d10] rounded-lg border border-slate-800 text-xs">
                  <span className="text-[9px] font-medium uppercase tracking-widest text-slate-500 block mb-1">
                    Structured English Summary
                  </span>
                  <p className="text-slate-300 font-sans leading-relaxed">
                    "{processingResult.request.summary_en}"
                  </p>
                  {processingResult.request.affected_group && (
                    <div className="mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono">
                      DEMOGRAPHIC IMPACT: <span className="text-slate-300">{processingResult.request.affected_group}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Computed Priority Score Banner */}
              <div className="p-4 rounded-lg bg-[#0c0d10] border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-medium tracking-widest text-slate-500 block">
                    National Priority Index
                  </span>
                  <div className="text-3xl font-extralight font-mono text-white mt-0.5 tracking-tight">
                    {processingResult.scoreBreakdown.total_score}
                    <span className="text-xs text-slate-500 font-normal"> /100</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
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
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded text-[10px] uppercase tracking-wider font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-3 h-3" />
                  <span>Inspect Formula</span>
                </button>
              </div>

              {/* Next Actions */}
              <div className="flex gap-2">
                <button
                  onClick={onNavigateToHotspots}
                  className="flex-1 py-2 text-xs uppercase tracking-wider font-semibold text-slate-900 bg-slate-100 hover:bg-white rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>View on Hotspot Map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    // Quick resubmit to test demand volume increment
                    handleSubmitFeedback();
                  }}
                  className="px-3 py-2 text-xs uppercase tracking-wider font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors flex items-center gap-1 cursor-pointer"
                  title="Resubmit to simulate multiple citizen demand signals"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>+1 Signal</span>
                </button>
              </div>
            </div>
          ) : (
            /* Standby Card */
            <div className="bg-[#111318] border border-slate-800 rounded-lg p-6 text-center space-y-4">
              <div className="w-10 h-10 rounded-full bg-white/5 text-slate-400 border border-white/10 flex items-center justify-center mx-auto">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-widest font-medium text-slate-200">Awaiting Citizen Demand Signals</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Submit a voice recording or text request to activate the Gemini classification pipeline and calculate deterministic priority scores.
                </p>
              </div>
              <div className="p-3 bg-[#0c0d10] rounded-lg border border-slate-800/80 text-[10px] text-slate-500 text-left space-y-1">
                <div className="font-medium text-slate-300 flex items-center gap-1 uppercase tracking-wider text-[9px]">
                  <Info className="w-3 h-3 text-slate-400" />
                  DPI Architecture Rule:
                </div>
                <p className="leading-relaxed">
                  Gemini translates and structures human voices; our deterministic Python/TS engine calculates the mathematical allocation index.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
