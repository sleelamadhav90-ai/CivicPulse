import React, { useState } from 'react';
import { 
  Settings, 
  RotateCcw, 
  Scale, 
  ShieldCheck, 
  Database, 
  Sliders, 
  Check, 
  Info,
  Globe,
  Radio,
  Cpu
} from 'lucide-react';
import { District, CitizenRequest } from '../types';

interface SettingsViewProps {
  districts: District[];
  requests: CitizenRequest[];
  onResetData: () => void;
  onOpenMethodology: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  districts,
  requests,
  onResetData,
  onOpenMethodology,
}) => {
  const [copied, setCopied] = useState(false);
  const [demandWeight, setDemandWeight] = useState(35);
  const [gapWeight, setGapWeight] = useState(25);
  const [sevWeight, setSevWeight] = useState(15);
  const [povWeight, setPovWeight] = useState(15);
  const [alignWeight, setAlignWeight] = useState(10);
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  const handleExportJson = () => {
    const data = {
      timestamp: new Date().toISOString(),
      platform: 'CivicPulse v2.4',
      districtsCount: districts.length,
      requestsCount: requests.length,
      formulaWeights: {
        demand: demandWeight / 100,
        gap: gapWeight / 100,
        severity: sevWeight / 100,
        poverty: povWeight / 100,
        alignment: alignWeight / 100,
      },
      requests: requests,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `civicpulse-telemetry-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded bg-blue-50 text-blue-700 border border-blue-200">
                SYSTEM CONFIGURATION
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Platform Settings & Governance Engine
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Configure deterministic prioritization parameters, multilingual voice ingestion channels, and data export pipelines.
            </p>
          </div>

          <button
            onClick={onOpenMethodology}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer w-fit"
          >
            <Info className="w-4 h-4 text-blue-600" />
            <span>Audit Formula Methodology</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Deterministic Priority Scoring Weights */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-600" />
                Priority Index Weight Calibration
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Standardized national weights summing to 100%
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Total: {demandWeight + gapWeight + sevWeight + povWeight + alignWeight}%
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Weight 1 */}
            <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>1. Citizen Demand Volume Weight:</span>
                <span className="font-mono text-blue-600 font-bold">{demandWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={demandWeight}
                onChange={(e) => setDemandWeight(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[11px] text-slate-500 font-mono">Quantifies verified citizen voice clustering</p>
            </div>

            {/* Weight 2 */}
            <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>2. Infrastructure Deficit Gap Weight:</span>
                <span className="font-mono text-rose-600 font-bold">{gapWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={gapWeight}
                onChange={(e) => setGapWeight(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[11px] text-slate-500 font-mono">100 minus baseline access percentage</p>
            </div>

            {/* Weight 3 */}
            <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>3. Semantic Severity & Urgency:</span>
                <span className="font-mono text-amber-600 font-bold">{sevWeight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={sevWeight}
                onChange={(e) => setSevWeight(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[11px] text-slate-500 font-mono">AI extracted public safety and health severity</p>
            </div>

            {/* Weight 4 */}
            <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>4. Multidimensional Poverty (MPI):</span>
                <span className="font-mono text-purple-600 font-bold">{povWeight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={povWeight}
                onChange={(e) => setPovWeight(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[11px] text-slate-500 font-mono">Demographic and social vulnerability multiplier</p>
            </div>

            {/* Weight 5 */}
            <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>5. Capital & Policy Alignment:</span>
                <span className="font-mono text-emerald-600 font-bold">{alignWeight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                value={alignWeight}
                onChange={(e) => setAlignWeight(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[11px] text-slate-500 font-mono">Ministerial capex pipeline synergy</p>
            </div>
          </div>
        </div>

        {/* Right Column: Ingestion Engine & Data Management */}
        <div className="space-y-6">
          {/* Multilingual Voice Engine */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Multilingual Speech & Dialect Parsing
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Gemini 3.7
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              CivicPulse uses server-side Gemini audio streaming to ingest native dialects, preserving local colloquialisms while converting them into structured GIS categories.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <span className="block text-slate-900 font-bold">తెలుగు</span>
                <span className="text-[10px] text-slate-500 font-normal">Telugu</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <span className="block text-slate-900 font-bold">हिंदी</span>
                <span className="text-[10px] text-slate-500 font-normal">Hindi</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <span className="block text-slate-900 font-bold">मराठी</span>
                <span className="text-[10px] text-slate-500 font-normal">Marathi</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <span className="block text-slate-900 font-bold">English</span>
                <span className="text-[10px] text-slate-500 font-normal">Global</span>
              </div>
            </div>
          </div>

          {/* Data Export & Reset */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                Data Management & Persistence
              </h2>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-xs text-slate-900 block">Export Telemetry Snapshot</span>
                  <span className="text-xs text-slate-500">Download active requests & priority matrix as JSON</span>
                </div>
                <button
                  onClick={handleExportJson}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs rounded-lg border border-slate-300 shadow-2xs transition-colors cursor-pointer"
                >
                  Download JSON
                </button>
              </div>

              <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-xs text-rose-900 block">Reset Demonstration Feed</span>
                  <span className="text-xs text-rose-700">Clears locally added citizen requests and restores defaults</span>
                </div>
                <button
                  onClick={onResetData}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
