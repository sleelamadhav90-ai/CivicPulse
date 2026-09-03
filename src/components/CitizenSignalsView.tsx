import React, { useState } from 'react';
import { 
  Radio, 
  Volume2, 
  Globe, 
  Search, 
  Play, 
  Pause, 
  ArrowRight,
  ShieldCheck,
  Clock,
  MapPin,
  Info
} from 'lucide-react';
import { CitizenRequest, InfrastructureCategory } from '../types';

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
    <div className="space-y-8 font-sans text-slate-900 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium mb-1">
            <span className="font-semibold text-blue-700">CivicPulse</span>
            <span>•</span>
            <span>Understand</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-500">
              <Info className="w-3.5 h-3.5" />
              Illustrative Demo Dataset
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Citizen Signals
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Raw reports submitted via voice telephony, text messaging, and field surveys in regional dialects.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-right font-mono text-xs">
            <span className="text-[10px] text-slate-500 uppercase block font-sans">Ingested Signals</span>
            <span className="font-bold text-slate-900">{requests.length} Submissions</span>
          </div>
          {onNavigateToIssues && (
            <button
              onClick={onNavigateToIssues}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>View Aggregated Issues</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 text-xs shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search request ID, location, or content..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <span className="text-slate-500 font-medium">Category:</span>
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Channel:</span>
            {['ALL', 'voice', 'text'].map((src) => (
              <button
                key={src}
                onClick={() => setSelectedSource(src)}
                className={`px-2.5 py-0.5 rounded transition-colors cursor-pointer uppercase text-[11px] ${
                  selectedSource === src
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {src}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Language:</span>
            {['ALL', 'Telugu', 'Marathi', 'Hindi', 'English'].map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLangFilter(lang)}
                className={`px-2.5 py-0.5 rounded transition-colors cursor-pointer text-[11px] ${
                  selectedLangFilter === lang
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Signals List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden divide-y divide-slate-100">
        {filteredRequests.map((req) => (
          <div key={req.id} className="p-5 hover:bg-slate-50/50 transition-colors space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  {req.id}
                </span>
                <span className="text-slate-700 font-sans font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {req.location}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">
                  {new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-xs font-mono shrink-0">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200">
                  {req.source_type === 'voice' ? '🎙️ Voice' : '📝 Text'}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200">
                  {req.language}
                </span>
                <span className={`px-2 py-0.5 rounded font-bold ${
                  req.severity >= 8 
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  Severity {req.severity}/10
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-[11px] text-slate-500 font-mono">
                  <span className="font-semibold uppercase text-slate-700">
                    Original Submission ({req.language})
                  </span>
                  {req.source_type === 'voice' && (
                    <button
                      onClick={() => toggleAudio(req.id)}
                      className="text-blue-700 font-semibold flex items-center gap-1 cursor-pointer bg-white border border-blue-200 rounded px-2 py-0.5"
                    >
                      {playingAudioId === req.id ? (
                        <>
                          <Pause className="w-3 h-3 text-red-600" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 text-blue-600" />
                          <span>Audio (0:42)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <p className="text-slate-800 italic leading-relaxed text-sm">
                  "{req.original_text}"
                </p>

                {playingAudioId === req.id && (
                  <div className="p-2 bg-blue-900 text-white text-[11px] font-mono rounded flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Volume2 className="w-4 h-4 text-blue-300" />
                      <span>Playing audio stream...</span>
                    </div>
                    <span>0:14 / 0:42</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200 space-y-2">
                <div className="flex items-center justify-between border-b border-blue-200 pb-1 text-[11px] text-blue-900 font-mono">
                  <span className="font-semibold uppercase flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    English Translation & Category
                  </span>
                  <span className="font-bold">
                    {req.category}
                  </span>
                </div>

                <p className="text-slate-900 font-medium leading-relaxed text-xs">
                  {req.summary_en}
                </p>

                {req.affected_group && (
                  <div className="text-[11px] text-slate-600 pt-1">
                    <span className="font-semibold text-slate-800">Affected Beneficiaries: </span>
                    {req.affected_group}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-slate-500">
                Reason: {req.urgency_reasoning || 'Infrastructure disruption.'}
              </span>

              <button
                onClick={() => setSelectedRequestModal(req)}
                className="text-blue-700 hover:text-blue-800 font-semibold cursor-pointer flex items-center gap-1"
              >
                <span>Inspect Metadata</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs text-blue-600 font-semibold uppercase">Signal Metadata</span>
                <h3 className="text-base font-bold text-slate-900">{selectedRequestModal.id} • {selectedRequestModal.location}</h3>
              </div>
              <button
                onClick={() => setSelectedRequestModal(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Original Submission</span>
                <p className="text-sm italic text-slate-900">"{selectedRequestModal.original_text}"</p>
                <div className="text-[11px] text-slate-600 font-mono pt-1">Language: {selectedRequestModal.language} | Source: {selectedRequestModal.source_type}</div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-1">
                <span className="text-[10px] text-blue-900 uppercase font-semibold block">English Translation</span>
                <p className="text-sm font-medium text-slate-900">{selectedRequestModal.summary_en}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 border border-slate-200 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 uppercase block text-[10px] font-sans">Category</span>
                  <span className="font-bold text-slate-900">{selectedRequestModal.category}</span>
                </div>
                <div className="p-2.5 border border-slate-200 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 uppercase block text-[10px] font-sans">Severity Score</span>
                  <span className="font-bold text-red-600">{selectedRequestModal.severity} / 10</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end text-xs">
              <button
                onClick={() => setSelectedRequestModal(null)}
                className="px-4 py-2 bg-slate-900 text-white font-semibold rounded hover:bg-slate-800 cursor-pointer"
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
