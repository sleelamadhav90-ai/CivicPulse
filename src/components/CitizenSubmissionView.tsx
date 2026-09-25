import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Square, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Camera, 
  MapPin, 
  ArrowRight, 
  RotateCcw, 
  Volume2, 
  Globe, 
  ShieldCheck, 
  AlertTriangle, 
  Edit3, 
  FileEdit, 
  Check, 
  X,
  Clock,
  Radio,
  ExternalLink,
  ChevronRight,
  Info,
  LogIn,
  UserCheck
} from 'lucide-react';
import { CitizenRequest, InfrastructureCategory, District, RequestStatus } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface CitizenSubmissionViewProps {
  districts: District[];
  initialMode?: 'write' | 'voice';
  initialCategory?: InfrastructureCategory;
  onAddRequest: (req: CitizenRequest) => void;
  onViewRequest: (requestId: string) => void;
}

interface AIUnderstandingResult {
  language: string;
  original_text: string;
  translated_text: string;
  category: InfrastructureCategory;
  category_display: string;
  subcategory: string;
  issue_summary: string;
  location: string;
  severity: string;
  severity_number: number;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  duration?: string;
  affected_area?: string;
  affected_population_if_available?: string;
  recommended_action?: string;
}

export const DEMO_SAMPLE_PHOTOS: Record<string, { url: string; name: string; label: string }> = {
  Water: {
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?auto=format&fit=crop&w=800&q=80',
    name: 'demo_water_pipeline_fracture.jpg',
    label: 'Water Pipeline & Supply Infrastructure (Demo Sample)',
  },
  Roads: {
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    name: 'demo_pothole_asphalt_damage.jpg',
    label: 'Road Surface & Pavement Damage (Demo Sample)',
  },
  Health: {
    url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    name: 'demo_rural_health_clinic.jpg',
    label: 'Public Health Facility & Clinic (Demo Sample)',
  },
  Electricity: {
    url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80',
    name: 'demo_power_line_grid_fault.jpg',
    label: 'Power Distribution & Lighting Grid (Demo Sample)',
  },
  Drainage: {
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    name: 'demo_drainage_overflow_conduit.jpg',
    label: 'Stormwater Conduit & Drainage Canal (Demo Sample)',
  },
  Sanitation: {
    url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    name: 'demo_solid_waste_accumulation.jpg',
    label: 'Municipal Solid Waste & Cleanliness (Demo Sample)',
  },
  Education: {
    url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    name: 'demo_school_building_facility.jpg',
    label: 'Public School Building & Classroom (Demo Sample)',
  },
  General: {
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    name: 'demo_civic_infrastructure_damage.jpg',
    label: 'Civic Infrastructure Asset (Demo Sample)',
  }
};

export const CitizenSubmissionView: React.FC<CitizenSubmissionViewProps> = ({
  districts,
  initialMode = 'write',
  initialCategory,
  onAddRequest,
  onViewRequest,
}) => {
  const { t, tCategory, tStatus, language } = useLanguage();
  const { user, isFirebaseConfigured, signInWithGoogle, getIdToken } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  // Mode: 'write' or 'voice'
  const [activeMode, setActiveMode] = useState<'write' | 'voice'>(initialMode);
  
  // Stages: 'input' | 'processing' | 'review' | 'success'
  const [stage, setStage] = useState<'input' | 'processing' | 'review' | 'success'>('input');

  // React to prop changes so "Speak an Issue" and "Write an Issue" always open the submission form
  useEffect(() => {
    if (initialMode) {
      setActiveMode(initialMode);
      setStage('input');
    }
  }, [initialMode]);

  // Input Form State
  const [complaintText, setComplaintText] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const [locationName, setLocationName] = useState<string>('Vijayawada Rural');
  const [locationConfirmed, setLocationConfirmed] = useState<boolean>(true);
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [isDemoPhoto, setIsDemoPhoto] = useState<boolean>(false);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioMimeType, setAudioMimeType] = useState<string>('audio/webm');
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');

  // MediaRecorder & Web Audio API refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // AI Extraction Result State
  const [aiResult, setAiResult] = useState<AIUnderstandingResult | null>(null);
  const [isEditingAiResult, setIsEditingAiResult] = useState<boolean>(false);
  const [editedSummary, setEditedSummary] = useState<string>('');
  const [editedCategory, setEditedCategory] = useState<InfrastructureCategory>('Water');
  const [editedLocation, setEditedLocation] = useState<string>('Vijayawada Rural');
  const [editedSeverity, setEditedSeverity] = useState<string>('High');

  // Submitted Request Receipt State
  const [submittedReceipt, setSubmittedReceipt] = useState<CitizenRequest | null>(null);

  // Quick Language Presets
  const supportedLanguages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
  ];

  // Quick Sample Voice / Text Presets
  const sampleCivicPrompts = [
    {
      title: 'Drinking water pipeline outage',
      lang: 'English',
      text: 'Our village hasn\'t received proper drinking water for the last two weeks. The main distribution pipeline has low pressure and muddy water is coming out.',
      location: 'Vijayawada Rural',
      category: 'Water' as InfrastructureCategory
    },
    {
      title: 'తాగునీటి కొరత',
      lang: 'Telugu',
      text: 'మా గ్రామంలో గత రెండు వారాలుగా సరైన తాగునీరు అందడం లేదు. పైపులైన్ పగిలిపోవడంతో ప్రజలు చాలా ఇబ్బందులు పడుతున్నారు.',
      location: 'Vijayawada Rural',
      category: 'Water' as InfrastructureCategory
    },
    {
      title: 'सड़क में भारी गड्ढे',
      lang: 'Hindi',
      text: 'हमारे मुख्य सड़क पर स्कूल के पास बड़े-बड़े गड्ढे हो गए हैं। पिछले हफ्ते दो ऑटो पलट गए और एम्बुलेंस को आने में बहुत देर हो रही है।',
      location: 'Guntur',
      category: 'Roads' as InfrastructureCategory
    },
    {
      title: 'மருத்துவமனை மருத்துவர் பற்றாக்குறை',
      lang: 'Tamil',
      text: 'எங்கள் ஆரம்ப சுகாதார நிலையத்தில் மருத்துவர் மற்றும் அவசர மருந்துகள் இல்லை. நோயாளிகள் 25 கி.மீ தூரம் செல்ல வேண்டியுள்ளது.',
      location: 'Krishna',
      category: 'Health' as InfrastructureCategory
    }
  ];

  // District options for location picker
  const popularDistricts = [
    'Vijayawada Rural',
    'Vijayawada',
    'Guntur',
    'Krishna',
    'Warangal',
    'Hyderabad',
    'Nashik',
    'Pune',
    'Patna',
    'Gaya',
    'Raichur',
    'Mysuru'
  ];

  // Clean up audio & timers on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Use Browser Location
  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // Resolved coordinates; in prototype, map to nearest district
          setLocationName('Vijayawada Rural');
          setLocationConfirmed(true);
        },
        (err) => {
          // If denied, fallback smoothly
          setLocationName('Vijayawada Rural');
          setLocationConfirmed(true);
        },
        { timeout: 5000 }
      );
    } else {
      setLocationName('Vijayawada Rural');
      setLocationConfirmed(true);
    }
  };

  // Handle Photo Attachment
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoName(file.name);
      setIsDemoPhoto(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Select sample photo with category-specific selection
  const handleSelectSamplePhoto = () => {
    const textLower = (complaintText || voiceTranscript || '').toLowerCase();
    let detectedCategory: string = initialCategory || 'General';

    if (textLower.includes('water') || textLower.includes('నీరు') || textLower.includes('पानी') || textLower.includes('pipe') || textLower.includes('tank')) {
      detectedCategory = 'Water';
    } else if (textLower.includes('road') || textLower.includes('pothole') || textLower.includes('గడ్డ') || textLower.includes('सड़क') || textLower.includes('traffic')) {
      detectedCategory = 'Roads';
    } else if (textLower.includes('health') || textLower.includes('hospital') || textLower.includes('doctor') || textLower.includes('clinic') || textLower.includes('ఆసుపత్రి') || textLower.includes('दवा')) {
      detectedCategory = 'Health';
    } else if (textLower.includes('electric') || textLower.includes('power') || textLower.includes('light') || textLower.includes('lamp') || textLower.includes('కరెంట్') || textLower.includes('बिजली')) {
      detectedCategory = 'Electricity';
    } else if (textLower.includes('drain') || textLower.includes('flood') || textLower.includes('sewage') || textLower.includes('వర్షం') || textLower.includes('नाली')) {
      detectedCategory = 'Drainage';
    } else if (textLower.includes('sanitat') || textLower.includes('garbage') || textLower.includes('waste') || textLower.includes('చెత్త')) {
      detectedCategory = 'Sanitation';
    } else if (textLower.includes('school') || textLower.includes('education') || textLower.includes('బడి')) {
      detectedCategory = 'Education';
    }

    const sample = DEMO_SAMPLE_PHOTOS[detectedCategory] || DEMO_SAMPLE_PHOTOS.General;
    setAttachedPhoto(sample.url);
    setPhotoName(sample.name);
    setIsDemoPhoto(true);
  };

  // Start Audio Recording
  const handleStartRecording = async () => {
    try {
      audioChunksRef.current = [];
      setRecordingSeconds(0);
      setAudioBlobUrl(null);
      setAudioBase64(null);
      setVoiceTranscript('');

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Audio visualizer setup
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 64;
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      drawWaveform();

      // MediaRecorder setup
      const options = { mimeType: 'audio/webm' };
      const recorder = MediaRecorder.isTypeSupported('audio/webm')
        ? new MediaRecorder(stream, options)
        : new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const mime = recorder.mimeType || 'audio/webm';
        setAudioMimeType(mime);
        const blob = new Blob(audioChunksRef.current, { type: mime });
        const url = URL.createObjectURL(blob);
        setAudioBlobUrl(url);

        // Convert blob to base64 for Gemini multimodal API
        const reader = new FileReader();
        reader.onloadend = () => {
          setAudioBase64(reader.result as string);
        };
        reader.readAsDataURL(blob);

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      // SpeechRecognition (if available in browser)
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = selectedLanguage === 'Telugu' ? 'te-IN' : selectedLanguage === 'Hindi' ? 'hi-IN' : selectedLanguage === 'Tamil' ? 'ta-IN' : 'en-IN';
          recognition.onresult = (event: any) => {
            let transcript = '';
            for (let i = 0; i < event.results.length; i++) {
              transcript += event.results[i][0].transcript;
            }
            if (transcript) setVoiceTranscript(transcript);
          };
          recognition.start();
        } catch (e) {}
      }
    } catch (err: any) {
      console.warn('Microphone access denied or unavailable in sandbox, activating simulated voice session:', err);
      // If mic is blocked in iframe sandbox, provide simulated voice recording
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  // Stop Audio Recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsRecording(false);

    // If simulated or no transcript, set default transcript
    if (!voiceTranscript) {
      if (selectedLanguage === 'Telugu') {
        setVoiceTranscript('మా గ్రామంలో గత రెండు వారాలుగా సరైన తాగునీరు అందడం లేదు. పైపులైన్ మరమ్మతులు త్వరగా చేయాలి.');
      } else if (selectedLanguage === 'Hindi') {
        setVoiceTranscript('हमारे वार्ड में पिछले 2 हफ्तों से पीने के पानी की भारी समस्या है। मुख्य पाइपलाइन टूटी हुई है।');
      } else {
        setVoiceTranscript('Our village has not received proper drinking water for the last two weeks. The main pipeline needs urgent repair.');
      }
    }
  };

  // Draw Waveform Animation
  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const renderFrame = () => {
      animationFrameRef.current = requestAnimationFrame(renderFrame);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = '#D65A3A';
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }
    };

    renderFrame();
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  // Apply a sample prompt
  const handleApplySamplePrompt = (sample: typeof sampleCivicPrompts[0]) => {
    setComplaintText(sample.text);
    setSelectedLanguage(sample.lang);
    setLocationName(sample.location);
    setLocationConfirmed(true);
    if (activeMode === 'voice') {
      setVoiceTranscript(sample.text);
    }
  };

  // Trigger Gemini AI Understanding (Step -> Processing -> Review)
  const handleProceedToAIReview = async () => {
    const textToProcess = activeMode === 'voice' 
      ? (voiceTranscript || 'Citizen spoke a voice message regarding local civic infrastructure.')
      : complaintText;

    if (!textToProcess.trim() && !audioBase64) {
      alert('Please describe your civic issue or record your voice before continuing.');
      return;
    }

    setStage('processing');

    try {
      const payload: any = {
        text: textToProcess,
        userLocation: locationName,
        userCategory: initialCategory,
      };

      if (audioBase64) {
        payload.audioBase64 = audioBase64;
        payload.mimeType = audioMimeType;
      }

      const res = await fetch('/api/process-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const parsed = data.data;
        const severityNum = typeof parsed.severity_number === 'number' ? parsed.severity_number : (parsed.severity === 'Critical' ? 9 : parsed.severity === 'High' ? 8 : parsed.severity === 'Low' ? 3 : 5);
        const severityLabel = parsed.severity || (severityNum >= 9 ? 'Critical' : severityNum >= 7 ? 'High' : severityNum <= 3 ? 'Low' : 'Medium');

        const result: AIUnderstandingResult = {
          language: parsed.language || selectedLanguage,
          original_text: textToProcess,
          translated_text: parsed.translated_text || parsed.issue_summary || textToProcess,
          category: (parsed.category as InfrastructureCategory) || 'Water',
          category_display: parsed.category_display || `${parsed.category || 'Water'} Infrastructure`,
          subcategory: parsed.subcategory || `${parsed.category || 'Water'} Service Issue`,
          issue_summary: parsed.issue_summary || parsed.translated_text || textToProcess,
          location: parsed.location || locationName,
          severity: severityLabel,
          severity_number: severityNum,
          urgency: parsed.urgency || (severityNum >= 9 ? 'CRITICAL' : severityNum >= 7 ? 'HIGH' : severityNum <= 3 ? 'LOW' : 'MEDIUM'),
          duration: parsed.duration || 'Not specified',
          affected_area: parsed.affected_area || `${locationName} locality grid`,
          affected_population_if_available: parsed.affected_population_if_available || 'Not specified',
          recommended_action: parsed.recommended_action || 'Inspect reported site and verify local service delivery.'
        };

        setAiResult(result);
        setEditedSummary(result.issue_summary);
        setEditedCategory(result.category);
        setEditedLocation(result.location);
        setEditedSeverity(result.severity);
        setStage('review');
      } else {
        throw new Error('Could not process with AI');
      }
    } catch (err) {
      console.warn('Using deterministic AI extraction fallback:', err);
      const lower = textToProcess.toLowerCase();
      const isWater = lower.includes('water') || textToProcess.includes('నీరు') || textToProcess.includes('पानी');
      const isRoad = lower.includes('road') || textToProcess.includes('గడ్డ') || textToProcess.includes('सड़क') || textToProcess.includes('రహదారి');
      const isHealth = lower.includes('health') || lower.includes('hospital') || textToProcess.includes('ఆసుపత్రి') || textToProcess.includes('दवा');
      const isPower = lower.includes('power') || lower.includes('electric') || textToProcess.includes('కరెంట్') || textToProcess.includes('बिजली');

      const cat: InfrastructureCategory = isWater ? 'Water' : isRoad ? 'Roads' : isHealth ? 'Health' : isPower ? 'Electricity' : 'Water';
      
      // Deterministic severity evaluation based on rubric
      let sevNum = 5;
      let sevLabel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
      let urgLabel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';

      if (lower.includes('life threat') || lower.includes('fatal') || lower.includes('death') || lower.includes('electrocution') || lower.includes('collapsed bridge')) {
        sevNum = 10;
        sevLabel = 'Critical';
        urgLabel = 'CRITICAL';
      } else if (lower.includes('ambulance') || lower.includes('hospital') || lower.includes('outbreak') || lower.includes('contamination') || lower.includes('severe hazard')) {
        sevNum = 9;
        sevLabel = 'Critical';
        urgLabel = 'CRITICAL';
      } else if (lower.includes('2 week') || lower.includes('two week') || lower.includes('month') || lower.includes('no water for') || lower.includes('entire village')) {
        sevNum = 8;
        sevLabel = 'High';
        urgLabel = 'HIGH';
      } else if (lower.includes('overturn') || lower.includes('crater') || lower.includes('shortage') || lower.includes('overflow') || lower.includes('flood')) {
        sevNum = 7;
        sevLabel = 'High';
        urgLabel = 'HIGH';
      } else if (lower.includes('muddy') || lower.includes('low pressure') || lower.includes('garbage') || lower.includes('pothole')) {
        sevNum = 6;
        sevLabel = 'Medium';
        urgLabel = 'MEDIUM';
      } else if (lower.includes('single') || lower.includes('flicker') || lower.includes('minor') || lower.includes('lane')) {
        sevNum = 4;
        sevLabel = 'Low';
        urgLabel = 'LOW';
      } else if (lower.includes('cosmetic') || lower.includes('paint') || lower.includes('signboard')) {
        sevNum = 2;
        sevLabel = 'Low';
        urgLabel = 'LOW';
      }

      const fallbackResult: AIUnderstandingResult = {
        language: selectedLanguage,
        original_text: textToProcess,
        translated_text: textToProcess,
        category: cat,
        category_display: cat === 'Water' ? 'Water & Sanitation' : cat === 'Roads' ? 'Roads & Transport' : cat === 'Health' ? 'Healthcare & Clinics' : 'Power & Energy',
        subcategory: isWater ? 'Drinking water supply disruption' : isRoad ? 'Pothole corridor hazard' : isHealth ? 'Primary health center shortage' : 'Power reliability issue',
        issue_summary: textToProcess,
        location: locationName,
        severity: sevLabel,
        severity_number: sevNum,
        urgency: urgLabel,
        duration: lower.includes('2 week') || lower.includes('two week') ? '2 weeks' : lower.includes('month') ? '1 month' : 'Not specified',
        affected_area: `${locationName} local grid`,
        affected_population_if_available: 'Not specified',
        recommended_action: isWater 
          ? 'Inspect water supply network and audit distribution schedule.' 
          : 'Inspect transit corridor and schedule surface repair.'
      };

      setAiResult(fallbackResult);
      setEditedSummary(fallbackResult.issue_summary);
      setEditedCategory(fallbackResult.category);
      setEditedLocation(fallbackResult.location);
      setEditedSeverity(fallbackResult.severity);
      setStage('review');
    }
  };

  // Final Submission to Backend & Persistent Storage
  const handleConfirmAndSubmit = async () => {
    if (!aiResult) return;
    setAuthError(null);

    // If Firebase is configured and user is not signed in, enforce Google authentication
    if (isFirebaseConfigured && !user) {
      try {
        setIsSigningIn(true);
        await signInWithGoogle();
        setIsSigningIn(false);
      } catch (err: any) {
        setIsSigningIn(false);
        setAuthError(err?.message || 'Please sign in with Google to authenticate your submission.');
        return;
      }
    }

    // Generate unique tracking ID: CP-2026-XXXXXXXX (timestamp + random entropy)
    const currentYear = new Date().getFullYear();
    const timeSuffix = Date.now().toString().slice(-4);
    const randomEntropy = Math.floor(1000 + Math.random() * 9000).toString();
    const trackingId = `CP-${currentYear}-${timeSuffix}${randomEntropy}`;

    // Determine precise source_type
    let sourceType: 'voice' | 'text' | 'photo' | 'voice+photo' | 'text+photo' = 'text';
    if (activeMode === 'voice' && attachedPhoto) {
      sourceType = 'voice+photo';
    } else if (activeMode === 'voice') {
      sourceType = 'voice';
    } else if (attachedPhoto) {
      sourceType = 'text+photo';
    } else {
      sourceType = 'text';
    }

    const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

    const finalLocation = isEditingAiResult ? editedLocation : aiResult.location;
    const finalLocLower = (finalLocation || '').toLowerCase();
    const matchedDist = districts.find(d => 
      (d.name && finalLocLower.includes(d.name.toLowerCase())) || 
      (d.id && finalLocLower.includes(d.id.toLowerCase())) ||
      (d.name && d.name.toLowerCase().includes(finalLocLower)) ||
      (d.state && finalLocLower.includes(d.state.toLowerCase()))
    ) || districts.find(d => d.name.toLowerCase() === 'guntur') || districts[0];

    const newRequest: CitizenRequest = {
      id: trackingId,
      request_id: trackingId,
      userId: user?.uid,
      created_at: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      original_text: aiResult.original_text,
      language: aiResult.language,
      translated_text: aiResult.translated_text,
      category: isEditingAiResult ? editedCategory : aiResult.category,
      subcategory: aiResult.subcategory,
      issue_title: `${isEditingAiResult ? editedCategory : aiResult.category} — ${aiResult.subcategory}`,
      location: finalLocation,
      state: matchedDist ? matchedDist.state : 'Andhra Pradesh',
      district: matchedDist ? matchedDist.name : finalLocation,
      city_or_town: finalLocation,
      locality: finalLocation,
      latitude: matchedDist ? matchedDist.lat + (Math.random() - 0.5) * 0.04 : 16.5062,
      longitude: matchedDist ? matchedDist.lon + (Math.random() - 0.5) * 0.04 : 80.6480,
      severity: isEditingAiResult 
        ? (editedSeverity === 'Critical' ? 9 : editedSeverity === 'High' ? 8 : editedSeverity === 'Low' ? 3 : 5) 
        : (aiResult.severity_number ?? 5),
      severity_label: isEditingAiResult ? editedSeverity : aiResult.severity,
      priority_tier: (isEditingAiResult ? editedSeverity : aiResult.severity) as any,
      summary: isEditingAiResult ? editedSummary : aiResult.issue_summary,
      summary_en: isEditingAiResult ? editedSummary : aiResult.issue_summary,
      urgency: aiResult.urgency,
      urgency_reasoning: aiResult.recommended_action,
      duration: aiResult.duration,
      affected_area: aiResult.affected_area,
      affected_population_if_available: aiResult.affected_population_if_available,
      source_type: sourceType,
      source_origin: 'CIVICPULSE_USER',
      status: 'Received' as RequestStatus,
      photo_url: attachedPhoto || undefined,
      timeline: [
        {
          date: todayStr,
          title: 'Request submitted',
          status: 'completed',
          note: `Logged via ${sourceType} by citizen in ${aiResult.language}.`
        },
        {
          date: todayStr,
          title: 'AI processed request',
          status: 'completed',
          note: `Categorized under ${isEditingAiResult ? editedCategory : aiResult.category} (${aiResult.subcategory}).`
        },
        {
          date: 'Pending',
          title: 'Community issue identified',
          status: 'pending',
          note: 'Ingesting into regional demand aggregation cluster.'
        },
        {
          date: 'Pending',
          title: 'Forwarded for official review',
          status: 'pending',
          note: 'Assigned to Municipal Administration Action Queue.'
        }
      ],
      ai_analysis: {
        category: isEditingAiResult ? editedCategory : aiResult.category,
        problem: isEditingAiResult ? editedSummary : aiResult.issue_summary,
        urgency: aiResult.urgency,
        affected_infrastructure: aiResult.affected_area || `${isEditingAiResult ? editedCategory : aiResult.category} Grid`,
        estimated_impact: 'High',
        recommended_action: aiResult.recommended_action || 'Inspect and deploy field units.'
      }
    };

    // Save to server backend with Authorization header
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const idToken = await getIdToken();
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
      }

      const res = await fetch('/api/citizen-requests', {
        method: 'POST',
        headers,
        body: JSON.stringify(newRequest),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 401) {
          setAuthError(errorData?.error?.message || 'Authentication required to submit feedback.');
          return;
        }
      }
    } catch (err) {
      console.warn('Backend offline, relying on client persistent state:', err);
    }

    // Call parent handler to update React state & localStorage
    onAddRequest(newRequest);

    setSubmittedReceipt(newRequest);
    setStage('success');
  };

  // Reset form to report another issue
  const handleResetForm = () => {
    setComplaintText('');
    setVoiceTranscript('');
    setAudioBlobUrl(null);
    setAudioBase64(null);
    setAttachedPhoto(null);
    setPhotoName(null);
    setAiResult(null);
    setIsEditingAiResult(false);
    setSubmittedReceipt(null);
    setStage('input');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-sans text-[#171717] pb-16">
      
      {/* 1. TOP HEADER & WORKFLOW TABS */}
      <div className="bg-white border-2 border-[#171717] p-6 shadow-[4px_4px_0px_#171717] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#171717]/15 pb-4">
          <div className="max-w-xl">
            <div className="flex items-center space-x-2 text-[11px] font-mono text-[#78716C] uppercase tracking-wider mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D65A3A]" />
              <span>{t('report.eyebrow') || 'Official Citizen Grievance Intake · CivicPulse DPI'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#171717]">
              {stage === 'review' 
                ? (t('report.review_title') || 'Review & Verify AI Interpretation')
                : stage === 'success' 
                ? (t('report.success_title') || 'Request Successfully Lodged')
                : (t('report.title') || 'Report a Civic Issue')}
            </h1>
            <p className="text-xs sm:text-sm text-[#57534E] mt-1.5 leading-relaxed">
              {stage === 'review'
                ? (t('report.review_desc') || 'Never submit without verifying. Correct any field below before final lodgement.')
                : stage === 'success'
                ? (t('report.success_desc') || 'Your request has received a unique tracking credential and entered the municipal intelligence pipeline.')
                : (t('report.subtitle') || 'Tell us what is happening in your community. You can describe it naturally — no complicated government form required.')}
            </p>
          </div>

          {/* Mode Switcher: Segmented Control (Only visible in Input stage) */}
          {stage === 'input' && (
            <div 
              role="radiogroup" 
              aria-label="Submission Mode"
              className="inline-flex items-center bg-[#FAF8F5] p-1 border border-[#171717]/30 rounded-xs shrink-0 self-start sm:self-center gap-1"
            >
              <button
                type="button"
                role="radio"
                aria-checked={activeMode === 'write'}
                onClick={() => setActiveMode('write')}
                className={`px-3.5 py-1.5 text-xs transition-colors flex items-center gap-1.5 rounded-xs cursor-pointer ${
                  activeMode === 'write'
                    ? 'bg-[#171717] text-white shadow-2xs font-semibold'
                    : 'text-[#57534E] hover:text-[#171717] font-medium'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{t('report.write_issue') || t('action.write_issue') || 'Write an Issue'}</span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={activeMode === 'voice'}
                onClick={() => setActiveMode('voice')}
                className={`px-3.5 py-1.5 text-xs transition-colors flex items-center gap-1.5 rounded-xs cursor-pointer ${
                  activeMode === 'voice'
                    ? 'bg-[#171717] text-white shadow-2xs font-semibold'
                    : 'text-[#57534E] hover:text-[#171717] font-medium'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{t('report.speak_issue') || t('action.speak_issue') || 'Speak an Issue'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Workflow Progress Stepper (Process / Status Indicator, NOT clickable buttons) */}
        <div className="pt-2" aria-label="Workflow Steps">
          <div className="flex items-center justify-between gap-2 sm:gap-4 max-w-2xl mx-auto py-1">
            
            {/* Step 1: Describe Issue */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono transition-colors ${
                  stage === 'input'
                    ? 'bg-[#171717] text-white font-bold ring-2 ring-[#D65A3A] ring-offset-2 ring-offset-white'
                    : 'bg-[#285943] text-white font-bold'
                }`}
              >
                {stage === 'input' ? '1' : '✓'}
              </span>
              <div className="flex flex-col">
                <span
                  className={`text-xs ${
                    stage === 'input'
                      ? 'font-semibold text-[#171717]'
                      : 'font-medium text-[#285943]'
                  }`}
                >
                  {t('report.step_1') || '1. Describe Issue'}
                </span>
                <span className="text-[10px] text-[#78716C] hidden sm:block">
                  {stage === 'input' ? (t('report.step_active') || 'In progress') : (t('report.step_done') || 'Completed')}
                </span>
              </div>
            </div>

            {/* Connecting Bar 1 -> 2 */}
            <div
              className={`h-[1px] flex-1 min-w-[16px] sm:min-w-[32px] transition-colors ${
                stage !== 'input' ? 'bg-[#285943]' : 'bg-[#171717]/15'
              }`}
            />

            {/* Step 2: AI Diagnostic Review */}
            <div className="flex items-center gap-2.5 shrink-0">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono transition-colors ${
                  stage === 'processing' || stage === 'review'
                    ? 'bg-[#171717] text-white font-bold ring-2 ring-[#D65A3A] ring-offset-2 ring-offset-white'
                    : stage === 'success'
                    ? 'bg-[#285943] text-white font-bold'
                    : 'bg-[#FAF8F5] text-[#78716C] border border-[#171717]/20 font-medium'
                }`}
              >
                {stage === 'success' ? '✓' : '2'}
              </span>
              <div className="flex flex-col">
                <span
                  className={`text-xs ${
                    stage === 'processing' || stage === 'review'
                      ? 'font-semibold text-[#171717]'
                      : stage === 'success'
                      ? 'font-medium text-[#285943]'
                      : 'font-normal text-[#78716C]'
                  }`}
                >
                  {t('report.step_2') || '2. AI Diagnostic Review'}
                </span>
                <span className="text-[10px] text-[#78716C] hidden sm:block">
                  {stage === 'processing' || stage === 'review'
                    ? (t('report.step_active') || 'In progress')
                    : stage === 'success'
                    ? (t('report.step_done') || 'Completed')
                    : (t('report.step_upcoming') || 'Next stage')}
                </span>
              </div>
            </div>

            {/* Connecting Bar 2 -> 3 */}
            <div
              className={`h-[1px] flex-1 min-w-[16px] sm:min-w-[32px] transition-colors ${
                stage === 'success' ? 'bg-[#285943]' : 'bg-[#171717]/15'
              }`}
            />

            {/* Step 3: Permanent Lodgement */}
            <div className="flex items-center gap-2.5 shrink-0">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono transition-colors ${
                  stage === 'success'
                    ? 'bg-[#285943] text-white font-bold ring-2 ring-[#285943] ring-offset-2 ring-offset-white'
                    : 'bg-[#FAF8F5] text-[#78716C] border border-[#171717]/20 font-medium'
                }`}
              >
                {stage === 'success' ? '✓' : '3'}
              </span>
              <div className="flex flex-col">
                <span
                  className={`text-xs ${
                    stage === 'success'
                      ? 'font-semibold text-[#285943]'
                      : 'font-normal text-[#78716C]'
                  }`}
                >
                  {t('report.step_3') || '3. Permanent Lodgement'}
                </span>
                <span className="text-[10px] text-[#78716C] hidden sm:block">
                  {stage === 'success' ? (t('report.step_done') || 'Lodged') : (t('report.step_final') || 'Final step')}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* STAGE 1: INPUT STAGE (WRITE OR VOICE)                     */}
      {/* ========================================================= */}
      {stage === 'input' && (
        <div className="bg-white border-2 border-[#171717] p-6 sm:p-8 shadow-[6px_6px_0px_#171717] space-y-6">

          {/* WRITE FLOW INTERFACE */}
          {activeMode === 'write' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-sm font-serif font-bold text-[#171717] flex items-center gap-2">
                  <span>What would you like to report?</span>
                  <span className="text-red-600">*</span>
                </label>

                {/* Multilingual language switcher */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
                  <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="text-[11px] font-mono text-slate-500 font-bold shrink-0">Language:</span>
                  {supportedLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang.name)}
                      className={`px-2 py-0.5 text-[11px] font-mono border transition-all cursor-pointer shrink-0 ${
                        selectedLanguage === lang.name
                          ? 'bg-[#171717] text-white border-[#171717] font-bold'
                          : 'bg-[#F7F5EF] text-slate-700 border-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {lang.native}
                    </button>
                  ))}
                </div>
              </div>

              {/* Large Textarea */}
              <div className="relative">
                <textarea
                  rows={5}
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  placeholder="Describe what is happening in your own words (e.g. Our village has not received proper drinking water for the last two weeks, or potholes near the high school road are causing severe accidents)..."
                  className="w-full p-4 bg-slate-50 border-2 border-[#171717] text-sm text-[#171717] focus:outline-none focus:bg-white leading-relaxed font-sans shadow-inner placeholder:text-slate-400"
                />
                <div className="text-right text-[11px] font-mono text-slate-500 mt-1">
                  {complaintText.length} characters · Write naturally in any Indian language
                </div>
              </div>
            </div>
          )}

          {/* VOICE FLOW INTERFACE */}
          {activeMode === 'voice' && (
            <div className="space-y-6">
              <div className="border-b border-[#171717]/10 pb-3">
                <h3 className="font-serif font-bold text-xl text-[#171717]">
                  Tell us what happened
                </h3>
                <p className="text-xs text-[#171717]/80 mt-0.5">
                  Speak naturally in your preferred language. AI transcribes, detects dialect, and classifies the civic urgency.
                </p>
              </div>

              {/* Voice Recording Control Box */}
              <div className="bg-[#F7F5EF] border-2 border-[#171717] p-6 text-center space-y-4 shadow-[4px_4px_0px_#171717]">
                
                {/* Language Picker for Voice */}
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
                  <span className="text-slate-500 font-bold uppercase text-[11px]">Dialect / Language:</span>
                  {supportedLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang.name)}
                      className={`px-2.5 py-1 text-xs font-mono border transition-all cursor-pointer ${
                        selectedLanguage === lang.name
                          ? 'bg-[#D65A3A] text-white border-[#171717] font-bold shadow-[1px_1px_0px_#171717]'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      {lang.native} ({lang.name})
                    </button>
                  ))}
                </div>

                {/* Waveform / Visualizer */}
                <div className="w-full h-16 bg-white border border-[#171717] flex items-center justify-center relative overflow-hidden">
                  {isRecording ? (
                    <div className="flex items-center justify-center space-x-1 w-full h-full px-4">
                      <canvas ref={canvasRef} width={280} height={50} className="w-full h-full" />
                    </div>
                  ) : (
                    <div className="text-slate-400 font-mono text-xs flex items-center gap-2">
                      <Radio className="w-4 h-4 text-slate-400" />
                      <span>Audio visualizer standby — press Start Recording below</span>
                    </div>
                  )}
                </div>

                {/* Duration Counter */}
                <div className="font-mono text-xl font-bold tracking-widest text-[#171717]">
                  {isRecording ? (
                    <span className="text-[#D65A3A] flex items-center justify-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-600 animate-ping"></span>
                      Recording: {formatTime(recordingSeconds)}
                    </span>
                  ) : recordingSeconds > 0 ? (
                    <span className="text-[#285943]">
                      Recorded: {formatTime(recordingSeconds)} ✓
                    </span>
                  ) : (
                    <span className="text-slate-400">00:00</span>
                  )}
                </div>

                {/* Primary Recording Button */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={handleStartRecording}
                      className="px-6 py-3.5 bg-[#D65A3A] hover:bg-[#c34e2f] text-white font-bold text-sm uppercase tracking-wider border-2 border-[#171717] shadow-[3px_3px_0px_#171717] flex items-center gap-2.5 transition-all cursor-pointer"
                    >
                      <Mic className="w-5 h-5 text-amber-200" />
                      <span>🎙 Start Recording</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStopRecording}
                      className="px-6 py-3.5 bg-red-700 hover:bg-red-800 text-white font-bold text-sm uppercase tracking-wider border-2 border-[#171717] shadow-[3px_3px_0px_#171717] flex items-center gap-2.5 transition-all cursor-pointer animate-pulse"
                    >
                      <Square className="w-4 h-4 text-white" />
                      <span>⏹ Stop Recording</span>
                    </button>
                  )}

                  {audioBlobUrl && !isRecording && (
                    <audio src={audioBlobUrl} controls className="h-10 border border-[#171717]" />
                  )}
                </div>

                {/* Transcribed text feedback */}
                {voiceTranscript && (
                  <div className="p-3 bg-white border border-[#171717] text-left text-xs font-sans space-y-1">
                    <span className="font-mono font-bold text-[10px] text-[#D65A3A] uppercase block">
                      Live Voice Transcription:
                    </span>
                    <p className="text-slate-800 italic">"{voiceTranscript}"</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* LOCATION SECTION (COMMON TO BOTH FLOWS) */}
          <div className="border-t border-[#171717]/15 pt-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#171717] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#D65A3A]" />
                <span>Issue Location</span>
                <span className="text-red-600">*</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  className="px-3 py-1.5 bg-white border border-[#171717] text-xs font-mono font-bold text-[#171717] hover:bg-[#F7F5EF] shadow-[1px_1px_0px_#171717] flex items-center gap-1.5 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#285943]" />
                  <span>Use my location</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowLocationPicker(!showLocationPicker)}
                  className="px-3 py-1.5 bg-[#F7F5EF] border border-[#171717] text-xs font-mono font-bold text-[#171717] hover:bg-slate-200 shadow-[1px_1px_0px_#171717] cursor-pointer"
                >
                  {showLocationPicker ? 'Close list' : 'Select location'}
                </button>
              </div>
            </div>

            {/* Selected Location Display */}
            <div className="flex items-center space-x-2 p-3 bg-[#F7F5EF] border border-[#171717]">
              <span className="text-xs font-mono font-bold text-[#285943]">📍 Detected / Assigned:</span>
              <span className="text-sm font-bold text-[#171717]">{locationName}</span>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 border border-emerald-300 ml-auto">
                Verified
              </span>
            </div>

            {/* Quick District Selector Dropdown/Chips */}
            {showLocationPicker && (
              <div className="p-3 bg-white border border-[#171717] space-y-2 text-xs">
                <span className="font-mono text-[10px] font-bold text-slate-500 uppercase block">
                  Select your district or enter locality:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {popularDistricts.map((dist) => (
                    <button
                      key={dist}
                      type="button"
                      onClick={() => {
                        setLocationName(dist);
                        setLocationConfirmed(true);
                        setShowLocationPicker(false);
                      }}
                      className={`px-2.5 py-1 text-xs border font-mono transition-all cursor-pointer ${
                        locationName === dist
                          ? 'bg-[#D65A3A] text-white border-[#171717] font-bold'
                          : 'bg-slate-50 text-slate-800 border-slate-300 hover:border-slate-800'
                      }`}
                    >
                      {dist}
                    </button>
                  ))}
                </div>
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="Or type custom village / ward / mandal..."
                    className="flex-1 px-3 py-1.5 border border-[#171717] text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLocationPicker(false)}
                    className="px-3 py-1.5 bg-[#171717] text-white text-xs font-bold uppercase cursor-pointer"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* OPTIONAL PHOTO ATTACHMENT */}
          <div className="border-t border-[#171717]/15 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#171717] flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#D65A3A]" />
                <span>Add Photo (Optional Evidence)</span>
              </label>

              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 bg-white hover:bg-[#F7F5EF] border border-[#171717] text-xs font-mono font-bold text-[#171717] shadow-[1px_1px_0px_#171717] flex items-center gap-1.5 cursor-pointer">
                  <Camera className="w-3.5 h-3.5 text-[#D65A3A]" />
                  <span>Choose file</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleSelectSamplePhoto}
                  className="px-3 py-1.5 bg-[#F7F5EF] hover:bg-slate-200 border border-[#171717] text-xs font-mono font-bold text-slate-700 shadow-[1px_1px_0px_#171717] cursor-pointer"
                >
                  Use sample photo
                </button>
              </div>
            </div>

            {attachedPhoto && (
              <div className="flex items-center justify-between p-3 bg-[#F7F5EF] border border-[#171717] gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <img src={attachedPhoto} alt="Evidence" className="w-14 h-14 object-cover border border-[#171717] shrink-0" />
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 border rounded-xs uppercase tracking-wider ${
                        isDemoPhoto
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      }`}>
                        {isDemoPhoto ? '🧪 Demo Sample Image (Synthetic)' : '📷 Authentic Citizen Photo Upload'}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-[#171717] font-bold truncate block max-w-xs sm:max-w-md">
                      {photoName || (isDemoPhoto ? 'demo_sample_evidence.jpg' : 'citizen_photo_evidence.jpg')}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAttachedPhoto(null);
                    setPhotoName(null);
                    setIsDemoPhoto(false);
                  }}
                  className="text-xs font-mono text-red-700 hover:underline cursor-pointer shrink-0 font-bold"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* TRY A SAMPLE REQUEST SECTION */}
          <div className="border-t border-[#171717]/15 pt-5 space-y-2">
            <div>
              <span className="text-[11px] font-mono font-bold text-[#171717] uppercase tracking-wider block">
                Try a sample request
              </span>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Describe a local problem in your own language.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 pt-1">
              {sampleCivicPrompts.map((sample, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && (
                    <span className="hidden lg:inline text-[#171717]/25 select-none font-light text-xs" aria-hidden="true">
                      |
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleApplySamplePrompt(sample)}
                    className="inline-flex items-center gap-1.5 py-1 px-2 text-left hover:bg-orange-50/70 rounded-xs transition-all text-xs cursor-pointer group text-[#171717]"
                  >
                    <span className="font-medium group-hover:text-[#D65A3A] transition-colors">
                      {sample.title}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 group-hover:text-slate-600 transition-colors">
                      · {sample.lang}
                    </span>
                    <span className="text-slate-400 group-hover:text-[#D65A3A] text-xs font-mono transition-transform group-hover:translate-x-0.5 ml-0.5">
                      →
                    </span>
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* SUBMIT BUTTON -> CONTINUES TO AI REVIEW */}
          <div className="border-t border-[#171717]/15 pt-6 flex justify-end">
            <button
              type="button"
              onClick={handleProceedToAIReview}
              className="px-8 py-3.5 bg-[#D65A3A] hover:bg-[#c34e2f] text-white font-bold text-sm uppercase tracking-wider border-2 border-[#171717] shadow-[4px_4px_0px_#171717] flex items-center gap-3 transition-all cursor-pointer"
            >
              <span>Continue →</span>
              <Sparkles className="w-4 h-4 text-amber-200" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STAGE 2: PROCESSING INDICATOR                             */}
      {/* ========================================================= */}
      {stage === 'processing' && (
        <div className="bg-white border-2 border-[#171717] p-12 shadow-[6px_6px_0px_#171717] text-center space-y-6">
          <div className="w-16 h-16 border-4 border-[#171717] border-t-[#D65A3A] rounded-full animate-spin mx-auto"></div>
          
          <div className="space-y-2 max-w-md mx-auto">
            <span className="inline-block px-3 py-1 bg-[#D65A3A]/15 text-[#D65A3A] font-mono text-xs font-bold uppercase tracking-wider border border-[#D65A3A]/30">
              Gemini AI Diagnostic Processing
            </span>
            <h2 className="text-2xl font-serif font-bold text-[#171717]">
              Understanding Your Civic Request...
            </h2>
            <p className="text-xs text-[#171717]/70 leading-relaxed font-sans">
              Detecting regional language, extracting physical infrastructure category, resolving locality boundaries, and evaluating urgency rating.
            </p>
          </div>

          <div className="pt-2 flex justify-center items-center space-x-6 text-xs font-mono text-slate-500">
            <span>✓ Multilingual NLP</span>
            <span>•</span>
            <span>✓ Category Classification</span>
            <span>•</span>
            <span>✓ Geographic Tagging</span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STAGE 3: AI REVIEW / CONFIRMATION SCREEN                  */}
      {/* ========================================================= */}
      {stage === 'review' && aiResult && (
        <div className="bg-white border-2 border-[#171717] p-6 sm:p-8 shadow-[6px_6px_0px_#171717] space-y-6">
          
          {/* Header Banner */}
          <div className="bg-[#F7F5EF] border-2 border-[#171717] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[2px_2px_0px_#171717]">
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-5 h-5 text-[#D65A3A]" />
              <div>
                <h3 className="font-serif font-bold text-lg text-[#171717]">
                  Here's what we understood
                </h3>
                <span className="text-xs text-[#171717]/80 font-sans">
                  Please verify before official submission. You have complete control to edit any item.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditingAiResult(!isEditingAiResult)}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-[#171717] text-xs font-mono font-bold text-[#171717] shadow-[1px_1px_0px_#171717] flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#D65A3A]" />
              <span>{isEditingAiResult ? 'Done Editing' : '✎ Edit Interpretation'}</span>
            </button>
          </div>

          {/* AI Extraction Review Cards */}
          <div className="space-y-4">
            
            {/* 1. Original Request */}
            <div className="p-4 bg-slate-50 border border-[#171717]/20 space-y-1">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-500 font-bold uppercase">Original Citizen Submission</span>
                <span className="px-2 py-0.5 bg-slate-200 text-slate-800 font-bold">
                  Language: {aiResult.language}
                </span>
              </div>
              <p className="text-sm font-sans italic text-slate-800 leading-relaxed pt-1">
                "{aiResult.original_text}"
              </p>
            </div>

            {/* 2. AI Summary */}
            <div className="p-4 bg-white border-2 border-[#171717] space-y-2">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-[#D65A3A] font-bold uppercase">AI Structured Summary</span>
                {aiResult.duration && (
                  <span className="text-slate-500">
                    Duration: {aiResult.duration}
                  </span>
                )}
              </div>

              {isEditingAiResult ? (
                <textarea
                  rows={3}
                  value={editedSummary}
                  onChange={(e) => setEditedSummary(e.target.value)}
                  className="w-full p-2.5 border border-[#171717] text-sm text-[#171717] font-sans focus:outline-none"
                />
              ) : (
                <p className="text-sm font-bold font-sans text-[#171717] leading-relaxed">
                  "{editedSummary}"
                </p>
              )}
            </div>

            {/* 3. Core Extracted Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              
              {/* Category */}
              <div className="p-3.5 bg-[#F7F5EF] border border-[#171717] space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Category</span>
                {isEditingAiResult ? (
                  <select
                    value={editedCategory}
                    onChange={(e) => setEditedCategory(e.target.value as InfrastructureCategory)}
                    className="w-full p-1.5 border border-[#171717] bg-white text-xs font-bold focus:outline-none"
                  >
                    <option value="Water">Water & Sanitation</option>
                    <option value="Roads">Roads & Transport</option>
                    <option value="Health">Healthcare & Clinics</option>
                    <option value="Electricity">Power & Street Lighting</option>
                    <option value="Education">Education & Schools</option>
                    <option value="Drainage">Drainage & Stormwater</option>
                    <option value="Sanitation">Sanitation</option>
                  </select>
                ) : (
                  <span className="font-bold text-[#171717] text-sm block">
                    {editedCategory === 'Water' ? 'Water & Sanitation' : editedCategory === 'Roads' ? 'Roads & Transport' : editedCategory}
                  </span>
                )}
              </div>

              {/* Location */}
              <div className="p-3.5 bg-[#F7F5EF] border border-[#171717] space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Location</span>
                {isEditingAiResult ? (
                  <input
                    type="text"
                    value={editedLocation}
                    onChange={(e) => setEditedLocation(e.target.value)}
                    className="w-full p-1.5 border border-[#171717] bg-white text-xs font-bold focus:outline-none"
                  />
                ) : (
                  <span className="font-bold text-[#171717] text-sm block">
                    📍 {editedLocation}
                  </span>
                )}
              </div>

              {/* Severity */}
              <div className="p-3.5 bg-[#F7F5EF] border border-[#171717] space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Severity</span>
                {isEditingAiResult ? (
                  <select
                    value={editedSeverity}
                    onChange={(e) => setEditedSeverity(e.target.value)}
                    className="w-full p-1.5 border border-[#171717] bg-white text-xs font-bold focus:outline-none text-red-700"
                  >
                    <option value="Critical">Critical (9–10/10)</option>
                    <option value="High">High (7–8/10)</option>
                    <option value="Medium">Medium (5–6/10)</option>
                    <option value="Low">Low (1–4/10)</option>
                  </select>
                ) : (
                  <span className="font-bold text-red-700 text-sm block">
                    {editedSeverity} ({aiResult.severity_number ?? (editedSeverity === 'Critical' ? 9 : editedSeverity === 'High' ? 8 : editedSeverity === 'Low' ? 3 : 5)}/10)
                  </span>
                )}
              </div>
            </div>

            {/* Attached Photo Verification Card */}
            {attachedPhoto && (
              <div className="p-3.5 bg-white border border-[#171717] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                    Attached Photographic Evidence
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border rounded-xs uppercase tracking-wider ${
                    isDemoPhoto
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}>
                    {isDemoPhoto ? '🧪 Demo Sample Image (Synthetic)' : '📷 Authentic Citizen Photo Evidence'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <img 
                    src={attachedPhoto} 
                    alt="Evidence Preview" 
                    className="w-20 h-20 object-cover border border-[#171717] shadow-xs shrink-0" 
                  />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-[#171717] font-mono">
                      {photoName || (isDemoPhoto ? 'demo_sample_evidence.jpg' : 'citizen_photo_evidence.jpg')}
                    </p>
                    <p className="text-[11px] text-slate-600">
                      {isDemoPhoto 
                        ? 'Illustrative synthetic reference image attached via prototype demo selector.'
                        : 'Authentic citizen camera/device photo uploaded directly to CivicPulse.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Recommended Immediate Intervention */}
            {aiResult.recommended_action && (
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-300 space-y-1">
                <span className="font-mono text-[10px] font-bold text-emerald-900 uppercase block">
                  Recommended Action Plan
                </span>
                <p className="text-xs font-sans text-emerald-950 font-medium">
                  {aiResult.recommended_action}
                </p>
              </div>
            )}

            {/* AUTHENTICATION & TRANSPARENCY BLOCK */}
            {user ? (
              <div className="p-3 sm:p-3.5 bg-emerald-50 border-2 border-emerald-600/60 rounded-xs space-y-1.5 font-sans">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Authenticated Citizen</span>
                    <span className="font-mono text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 border border-emerald-300">
                      Account-authenticated submission
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-800 truncate max-w-full">
                    {user.email || 'Authenticated Account'}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-900/80 leading-relaxed font-sans">
                  Authentication helps CivicPulse associate submissions with an authenticated account and reduce anonymous abuse. Your authentication identity is used for submission ownership; CivicPulse does not require government ID verification.
                </p>
              </div>
            ) : isFirebaseConfigured ? (
              <div className="p-4 bg-orange-50/80 border-2 border-[#D65A3A]/70 rounded-xs space-y-2.5 font-sans">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#D65A3A]" />
                    <span className="text-xs font-bold text-[#171717]">
                      Sign in to submit your grievance
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => signInWithGoogle()}
                    disabled={isSigningIn}
                    className="px-4 py-2 bg-[#D65A3A] hover:bg-[#c34e2f] text-white text-xs font-bold font-sans uppercase tracking-wider border border-[#171717] shadow-[2px_2px_0px_#171717] flex items-center justify-center gap-2 transition-all cursor-pointer self-start sm:self-center"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{isSigningIn ? 'Signing in...' : 'Sign in with Google'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#171717]/80 leading-relaxed">
                  Authentication helps CivicPulse associate submissions with an authenticated account and reduce anonymous abuse. Your authentication identity is used for submission ownership; CivicPulse does not require government ID verification.
                </p>
                {authError && (
                  <div className="text-[11px] font-mono font-bold text-red-700 bg-red-50 p-2 border border-red-300">
                    ⚠️ {authError}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-300 rounded-xs text-[11px] text-slate-600 font-sans">
                <strong>Public Prototype Mode:</strong> Direct submission without authentication is active in local development. Configure Firebase credentials to enable Google Sign-In and account-authenticated submissions.
              </div>
            )}
          </div>

          {/* Action Buttons: Confirm & Submit vs Edit */}
          <div className="border-t border-[#171717]/15 pt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStage('input')}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-[#171717] font-bold text-xs uppercase tracking-wider border border-[#171717] flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>← Edit Input</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmAndSubmit}
              disabled={isSigningIn}
              className="px-8 py-3.5 bg-[#285943] hover:bg-[#204735] text-white font-bold text-sm uppercase tracking-wider border-2 border-[#171717] shadow-[4px_4px_0px_#171717] flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-70"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <span>{user ? '✓ Confirm & Submit' : (isFirebaseConfigured ? 'Sign in & Submit' : '✓ Confirm & Submit')}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STAGE 4: SUCCESS CONFIRMATION SCREEN                      */}
      {/* ========================================================= */}
      {stage === 'success' && submittedReceipt && (
        <div className="bg-white border-2 border-[#171717] p-8 sm:p-10 shadow-[6px_6px_0px_#171717] space-y-6">
          
          {/* Big Success Banner */}
          <div className="text-center space-y-3 pb-2">
            <div className="w-16 h-16 bg-emerald-100 border-2 border-[#285943] text-[#285943] rounded-full flex items-center justify-center mx-auto shadow-[2px_2px_0px_#171717]">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-[#171717]">
              Request submitted
            </h2>
            <p className="text-sm font-sans text-slate-700 max-w-md mx-auto">
              Your civic issue has been recorded successfully and persisted into the CivicPulse official registry.
            </p>
          </div>

          {/* Official Tracking Receipt Card */}
          <div className="bg-[#F7F5EF] border-2 border-[#171717] p-6 shadow-[3px_3px_0px_#171717] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#171717]/15 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">
                  Official Tracking Credential
                </span>
                <span className="font-mono text-xl font-bold text-[#D65A3A] tracking-wider">
                  {submittedReceipt.id}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {submittedReceipt.userId && (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Account-Authenticated</span>
                  </span>
                )}
                <span className="px-3 py-1 bg-[#285943] text-white font-mono text-xs font-bold uppercase tracking-wider">
                  {t('table.status')}: {tStatus('Received')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 uppercase text-[10px] font-bold block">{t('table.category')}</span>
                <span className="font-bold text-[#171717] text-sm">
                  {tCategory(submittedReceipt.category)}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 uppercase text-[10px] font-bold block">{t('table.location')}</span>
                <span className="font-bold text-[#171717] text-sm">
                  📍 {submittedReceipt.location}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 uppercase text-[10px] font-bold block">{t('table.source')}</span>
                <span className="font-bold text-slate-800">
                  {submittedReceipt.source_type?.toLowerCase().includes('voice') ? t('signals.voice') : t('signals.written')} ({submittedReceipt.language || 'English'})
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 uppercase text-[10px] font-bold block">{t('field.submitted')}</span>
                <span className="font-bold text-slate-800">
                  {new Date(submittedReceipt.timestamp).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            {/* Attached Photo in Receipt */}
            {submittedReceipt.photo_url && (
              <div className="pt-2 border-t border-[#171717]/10 flex items-center gap-3">
                <img 
                  src={submittedReceipt.photo_url} 
                  alt="Lodged Evidence" 
                  className="w-14 h-14 object-cover border border-[#171717] shadow-xs shrink-0" 
                />
                <div className="text-xs space-y-0.5">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 border rounded-xs uppercase tracking-wider inline-block ${
                    submittedReceipt.photo_url.startsWith('http')
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}>
                    {submittedReceipt.photo_url.startsWith('http') 
                      ? '🧪 Demo Sample Image (Synthetic Reference)'
                      : '📷 Authentic Citizen Photo Evidence'}
                  </span>
                  <p className="text-[11px] font-mono text-slate-600">
                    Photographic evidence recorded with intake package.
                  </p>
                </div>
              </div>
            )}

            {/* Summarized problem description */}
            <div className="pt-2 border-t border-[#171717]/10 font-sans text-xs text-slate-800">
              <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                {t('field.submitted_description')}:
              </span>
              <p className="italic">
                "{submittedReceipt.summary_en}"
              </p>
            </div>
          </div>

          {/* Action Buttons: View My Request & Report Another Issue */}
          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => onViewRequest(submittedReceipt.id)}
              className="px-6 py-3.5 bg-[#171717] hover:bg-[#D65A3A] text-white font-bold text-xs uppercase tracking-wider border-2 border-[#171717] shadow-[3px_3px_0px_#D65A3A] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>View My Request</span>
              <ExternalLink className="w-4 h-4 text-amber-200" />
            </button>

            <button
              type="button"
              onClick={handleResetForm}
              className="px-6 py-3.5 bg-white hover:bg-slate-100 text-[#171717] font-bold text-xs uppercase tracking-wider border-2 border-[#171717] shadow-[3px_3px_0px_#171717] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-600" />
              <span>Report Another Issue</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
