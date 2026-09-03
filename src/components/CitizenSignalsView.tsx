import React, { useState } from 'react';
import { 
  Radio, 
  Volume2, 
  VolumeX, 
  FileText, 
  Globe, 
  Filter, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Pause, 
  Layers,
  ArrowRight,
  ShieldCheck,
  Tag,
  Clock,
  MapPin,
  Sparkles
} from 'lucide-react';
import { CitizenRequest, InfrastructureCategory, LanguageOption } from '../types';

interface CitizenSignalsViewProps {
  requests: CitizenRequest[];
  onNavigateToIssues?: () => void;
  selectedLanguage: string;
}

export const CitizenSignalsView: React.FC<CitizenSignalsViewProps> = ({
  requests,
  onNavigateToIssues,
  selectedLanguage
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [selectedLangFilter, setSelectedLangFilter] = useState<string>('ALL');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [selectedRequestModal, setSelectedRequestModal] = useState<CitizenRequest | null>(null);

  const categories: InfrastructureCategory[] = ['Water', 'Health', 'Roads', 'Electricity', 'Education', 'Drainage', 'Sanitation'];

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.summary_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.original_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'ALL' || req.category === selectedCategory;
    const matchesSource = selectedSource === 'ALL' || req.source_type === selectedSource;
    const matchesLang = selectedLangFilter === 'ALL' || req.language.toLowerCase() === selectedLangFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesSource && matchesLang;
  });

  const toggleAudio = (id: string) => {
    if (playingAudioId === id) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(id);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-12">
      {/* Official Government Header Banner */}
      <div className="bg-slate-900 text-white p-5 border-b-2 border-slate-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-700 text-white text-[10px] font-mono font-bold px-2 py-0.5 tracking-wider uppercase">
              STAGE 1: SIGNAL INGESTION
            </span>
            <span className="text-slate-400 text-xs font-mono">
              • Real-Time Multilingual Intake
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white mt-1">
            Citizen Signals Intake Stream
          </h1>
          <p className="text-xs text-slate-300 mt-0.5 max-w-3xl">
            Raw unedited citizen reports submitted via voice recordings, text messages, field surveyors, and WhatsApp. AI standardizes regional dialect inputs into a common semantic schema.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 font-mono">
          <div className="bg-slate-800 border border-slate-700 px-3 py-2 text-right">
            <span className="text-[10px] text-slate-400 uppercase block">Total Raw Signals</span>
            <span className="text-base font-bold text-white">{requests.length} Submissions</span>
          </div>
          {onNavigateToIssues && (
            <button
              onClick={onNavigateToIssues}
              className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium px-3.5 py-2 transition-colors flex items-center gap-1.5 cursor-pointer border border-blue-600"
            >
              <span>View Aggregated Issues</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Primary Question Banner */}
      <div className="bg-slate-100 border border-slate-300 p-4 text-xs text-slate-800 flex items-center justify-between font-mono">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-blue-900">PRIMARY QUESTION:</span>
          <span>"What are individual citizens reporting right now across voice & text channels?"</span>
        </div>
        <div className="flex items-center space-x-2 text-[11px] text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Semantic Classification Engine Active</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-300 p-4 space-y-3 font-mono text-xs shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by ID, location, or issue text..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-700"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Category:</span>
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-2 py-1 text-[11px] border cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-slate-900 text-white border-slate-900 font-bold'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-1 text-[11px] border cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-900 text-white border-blue-900 font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter Row (Source & Language) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3 text-[11px]">
          <div className="flex items-center space-x-3">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Source Channel:</span>
            {['ALL', 'voice', 'text', 'sample'].map((src) => (
              <button
                key={src}
                onClick={() => setSelectedSource(src)}
                className={`px-2 py-0.5 border cursor-pointer uppercase ${
                  selectedSource === src
                    ? 'bg-slate-800 text-white border-slate-800 font-bold'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {src}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Dialect / Language:</span>
            {['ALL', 'Telugu', 'Marathi', 'Hindi', 'English'].map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLangFilter(lang)}
                className={`px-2 py-0.5 border cursor-pointer ${
                  selectedLangFilter === lang
                    ? 'bg-slate-800 text-white border-slate-800 font-bold'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Signals Data Table & Evidence Cards */}
      <div className="bg-white border border-slate-300 shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-100 border-b border-slate-300 flex items-center justify-between font-mono text-xs">
          <span className="font-bold text-slate-900 uppercase tracking-wider">
            INGESTED SIGNAL RECORDS ({filteredRequests.length})
          </span>
          <span className="text-slate-500 text-[11px]">
            Showing original citizen evidence alongside canonical English translations
          </span>
        </div>

        <div className="divide-y divide-slate-200">
          {filteredRequests.map((req) => (
            <div key={req.id} className="p-4 hover:bg-slate-50/80 transition-colors space-y-3 font-sans">
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2.5 font-mono text-xs">
                  <span className="font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5">
                    {req.id}
                  </span>
                  <span className="text-slate-600 font-bold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {req.location}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center space-x-2 font-mono text-[11px]">
                  <span className={`px-2 py-0.5 border font-bold uppercase ${
                    req.source_type === 'voice' 
                      ? 'bg-amber-50 text-amber-800 border-amber-300' 
                      : 'bg-slate-100 text-slate-800 border-slate-300'
                  }`}>
                    {req.source_type === 'voice' ? '🎙️ Voice Audio' : '📝 Text SMS'}
                  </span>
                  <span className="bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 font-bold">
                    {req.language}
                  </span>
                  <span className={`px-2 py-0.5 border font-bold ${
                    req.severity >= 8 
                      ? 'bg-red-50 text-red-800 border-red-300' 
                      : req.severity >= 6 
                      ? 'bg-amber-50 text-amber-800 border-amber-300' 
                      : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  }`}>
                    Severity {req.severity}/10
                  </span>
                </div>
              </div>

              {/* Multilingual Dual Box: Original vs English */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Original Voice/Text Evidence Box */}
                <div className="p-3 bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1 font-mono text-[10px] text-slate-500">
                    <span className="font-bold uppercase tracking-wider text-slate-700">
                      ORIGINAL SUBMISSION ({req.language})
                    </span>
                    {req.source_type === 'voice' && (
                      <button
                        onClick={() => toggleAudio(req.id)}
                        className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 cursor-pointer bg-white border border-blue-300 px-2 py-0.5"
                      >
                        {playingAudioId === req.id ? (
                          <>
                            <Pause className="w-3 h-3 text-red-600" />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 text-blue-700" />
                            <span>Play Recording (0:42)</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <p className="text-slate-800 italic leading-relaxed font-serif text-sm">
                    "{req.original_text}"
                  </p>

                  {/* Simulated Audio Waveform Bar if playing */}
                  {playingAudioId === req.id && (
                    <div className="p-2 bg-blue-900 text-white text-[10px] font-mono flex items-center justify-between border border-blue-900 animate-pulse">
                      <div className="flex items-center space-x-2">
                        <Volume2 className="w-4 h-4 text-amber-400" />
                        <span>Playing Voice Evidence Recording...</span>
                      </div>
                      <span>0:14 / 0:42</span>
                    </div>
                  )}
                </div>

                {/* Standardized Canonical English Translation Box */}
                <div className="p-3 bg-blue-50/40 border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between border-b border-blue-200 pb-1 font-mono text-[10px] text-blue-900">
                    <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                      <Globe className="w-3 h-3 text-blue-700" />
                      CANONICAL ENGLISH TRANSLATION & SCHEMA
                    </span>
                    <span className="text-blue-800 font-bold">
                      Category: {req.category}
                    </span>
                  </div>

                  <p className="text-slate-900 font-medium leading-relaxed text-xs">
                    {req.summary_en}
                  </p>

                  {req.affected_group && (
                    <div className="text-[11px] text-slate-600 font-mono pt-1">
                      <span className="font-bold text-slate-800">Affected Beneficiaries: </span>
                      {req.affected_group}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between pt-1 font-mono text-[11px]">
                <div className="text-slate-500">
                  <span>Urgency Reason: </span>
                  <span className="text-slate-700">{req.urgency_reasoning || 'Public infrastructure access disruption.'}</span>
                </div>

                <button
                  onClick={() => setSelectedRequestModal(req)}
                  className="text-blue-700 hover:text-blue-900 font-bold uppercase tracking-wider hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Inspect Signal Metadata</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Inspector Modal */}
      {selectedRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border-2 border-slate-800 shadow-lg max-w-2xl w-full p-6 space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-300 pb-3 font-mono">
              <div>
                <span className="text-xs text-blue-900 font-bold uppercase">Signal Inspector</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedRequestModal.id} • {selectedRequestModal.location}</h3>
              </div>
              <button
                onClick={() => setSelectedRequestModal(null)}
                className="text-slate-500 hover:text-slate-900 text-sm font-bold border border-slate-300 px-2 py-1"
              >
                Close ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-mono text-[10px] text-slate-500 uppercase block font-bold">Original Submission</span>
                <p className="text-sm font-serif italic text-slate-900">"{selectedRequestModal.original_text}"</p>
                <div className="text-[11px] font-mono text-slate-600 pt-1">Language: {selectedRequestModal.language} | Source: {selectedRequestModal.source_type}</div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 space-y-1">
                <span className="font-mono text-[10px] text-blue-900 uppercase block font-bold">Canonical English Translation</span>
                <p className="text-sm font-medium text-slate-900">{selectedRequestModal.summary_en}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                <div className="p-2 border border-slate-200 bg-slate-50">
                  <span className="text-slate-500 uppercase block text-[9px]">Category</span>
                  <span className="font-bold text-slate-900">{selectedRequestModal.category}</span>
                </div>
                <div className="p-2 border border-slate-200 bg-slate-50">
                  <span className="text-slate-500 uppercase block text-[9px]">Severity Score</span>
                  <span className="font-bold text-red-700">{selectedRequestModal.severity} / 10</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-300 flex justify-end font-mono text-xs">
              <button
                onClick={() => setSelectedRequestModal(null)}
                className="bg-slate-900 text-white font-bold px-4 py-2 hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
