import React, { useState } from 'react';
import { 
  Globe, 
  Bell, 
  Database, 
  Download, 
  Info, 
  Check, 
  ShieldCheck, 
  RotateCcw 
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
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [dailyBriefing, setDailyBriefing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExportJson = () => {
    const data = {
      platform: 'CivicPulse',
      version: '2026.1',
      exportedAt: new Date().toISOString(),
      districtsCount: districts.length,
      signalsCount: requests.length,
      requests,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `civicpulse-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 font-sans text-[#171717] pb-16 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="space-y-1 border-b border-[#171717]/10 pb-4">
        <h1 className="text-3xl font-serif font-bold tracking-tight text-[#171717]">
          Settings
        </h1>
        <p className="text-sm text-[#57534E]">
          Configure language preferences, notification alerts, and data connectors.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* 1. Language */}
        <div className="bg-white border border-[#171717]/15 p-5 rounded-sm shadow-xs space-y-3">
          <div className="flex items-center space-x-2.5">
            <Globe className="w-4 h-4 text-[#D65A3A]" />
            <h2 className="text-base font-serif font-bold text-[#171717]">
              Language
            </h2>
          </div>
          <p className="text-xs text-[#57534E]">
            Choose interface language and default speech transcription dialect.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
            {['English', 'Hindi (हिंदी)', 'Telugu (తెలుగు)', 'Marathi (मराठी)', 'Bengali (বাংলা)', 'Tamil (தமிழ்)'].map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-2 text-left rounded-xs border transition-colors cursor-pointer ${
                  selectedLanguage === lang
                    ? 'bg-[#171717] text-white border-[#171717] font-semibold'
                    : 'bg-[#FAF8F5] text-[#57534E] border-[#171717]/15 hover:border-[#171717]/30'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Notifications */}
        <div className="bg-white border border-[#171717]/15 p-5 rounded-sm shadow-xs space-y-3">
          <div className="flex items-center space-x-2.5">
            <Bell className="w-4 h-4 text-[#D65A3A]" />
            <h2 className="text-base font-serif font-bold text-[#171717]">
              Notifications
            </h2>
          </div>
          <p className="text-xs text-[#57534E]">
            Alerts for critical infrastructure anomalies and status changes.
          </p>
          <div className="space-y-2 pt-1 text-xs">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded-xs text-[#171717] border-[#171717]/30 focus:ring-0 cursor-pointer"
              />
              <span className="text-[#171717]">Critical severity alerts (immediate notification for high urgency issues)</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={dailyBriefing}
                onChange={(e) => setDailyBriefing(e.target.checked)}
                className="w-4 h-4 rounded-xs text-[#171717] border-[#171717]/30 focus:ring-0 cursor-pointer"
              />
              <span className="text-[#171717]">Daily morning executive dispatch (district summary digests)</span>
            </label>
          </div>
        </div>

        {/* 3. Data sources */}
        <div className="bg-white border border-[#171717]/15 p-5 rounded-sm shadow-xs space-y-3">
          <div className="flex items-center space-x-2.5">
            <Database className="w-4 h-4 text-[#D65A3A]" />
            <h2 className="text-base font-serif font-bold text-[#171717]">
              Data sources
            </h2>
          </div>
          <p className="text-xs text-[#57534E]">
            Connected public registry connectors and administrative feeds.
          </p>
          <div className="space-y-2 pt-1 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 bg-[#FAF8F5] border border-[#171717]/10 rounded-xs">
              <span className="text-[#171717]">Jal Jeevan Mission (JJM) Telemetry</span>
              <span className="text-[#285943] text-[11px] font-semibold">Active · 2,840 nodes</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-[#FAF8F5] border border-[#171717]/10 rounded-xs">
              <span className="text-[#171717]">PMGSY National Rural Roads GIS</span>
              <span className="text-[#285943] text-[11px] font-semibold">Active · Road condition layer</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-[#FAF8F5] border border-[#171717]/10 rounded-xs">
              <span className="text-[#171717]">Census & Vulnerability Atlas (SECC)</span>
              <span className="text-[#285943] text-[11px] font-semibold">Active · Baseline census layer</span>
            </div>
          </div>
        </div>

        {/* 4. Export data */}
        <div className="bg-white border border-[#171717]/15 p-5 rounded-sm shadow-xs space-y-3">
          <div className="flex items-center space-x-2.5">
            <Download className="w-4 h-4 text-[#D65A3A]" />
            <h2 className="text-base font-serif font-bold text-[#171717]">
              Export data
            </h2>
          </div>
          <p className="text-xs text-[#57534E]">
            Download complete telemetry, citizen submissions, and priority records for external analysis.
          </p>
          <div className="pt-1">
            <button
              onClick={handleExportJson}
              className="px-4 py-2 bg-[#171717] hover:bg-[#34322D] text-white text-xs font-semibold rounded-xs transition-colors flex items-center space-x-2 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{copied ? 'Exported JSON Package!' : 'Export JSON telemetry package'}</span>
            </button>
          </div>
        </div>

        {/* 5. About CivicPulse */}
        <div className="bg-white border border-[#171717]/15 p-5 rounded-sm shadow-xs space-y-3">
          <div className="flex items-center space-x-2.5">
            <Info className="w-4 h-4 text-[#D65A3A]" />
            <h2 className="text-base font-serif font-bold text-[#171717]">
              About CivicPulse
            </h2>
          </div>
          <div className="text-xs text-[#57534E] space-y-2 leading-relaxed">
            <p>
              CivicPulse is an open public digital infrastructure platform linking citizen voice, infrastructure audits, and public capital allocations into verifiable, deterministic priorities.
            </p>
            <p>
              Engineered with institutional transparency: every score is mathematically audit-trailed without ungrounded AI hallucination.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-[#171717]/10 text-xs">
            <button
              onClick={onOpenMethodology}
              className="text-[#D65A3A] hover:underline font-semibold cursor-pointer"
            >
              Read Prioritization Formula Methodology
            </button>

            <button
              onClick={onResetData}
              className="text-[#78716C] hover:text-red-700 flex items-center space-x-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset demo state</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
