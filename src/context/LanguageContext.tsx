import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  TRANSLATIONS, 
  SUPPORTED_LANGUAGES, 
  SupportedLanguageCode, 
  LanguageOption,
  translateCategory,
  translateStatus,
  getLocalizedDistrict,
  getLocalizedState,
  getLocalizedIntervention,
  getLocalizedUrgency,
  getLocalizedRecommendation,
  getLocalizedGovernmentProject,
  getLocalizedSignalSummary,
  getLocalizedPattern,
  getLocalizedCommunityIssue,
  getLocalizedOverviewConclusion,
  getLocalizedOverviewPriorityIssue
} from '../translations';
import { RecommendedProject, GovernmentProject, CitizenRequest } from '../types';

interface LanguageContextType {
  language: SupportedLanguageCode;
  setLanguage: (lang: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  tCategory: (category: string) => string;
  tStatus: (status: string) => string;
  tIntervention: (type: string) => string;
  tUrgency: (urgency: string) => string;
  tDistrict: (district: string) => string;
  tState: (state: string) => string;
  tRecommendation: (rec: RecommendedProject) => RecommendedProject;
  tGovernmentProject: (proj: GovernmentProject) => GovernmentProject;
  tSignalSummary: (req: CitizenRequest) => string;
  tPattern: (pat: any) => any;
  tCommunityIssue: (issue: any) => any;
  tOverviewConclusion: () => { title: string; whyMatters: string; district: string; state: string };
  tOverviewPriorityIssue: (issue: any) => any;
  tPriority: (priority: string) => string;
  supportedLanguages: LanguageOption[];
  currentLanguageConfig: LanguageOption;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'civicpulse_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguageCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved in TRANSLATIONS) {
        return saved as SupportedLanguageCode;
      }
    } catch {}
    return 'en';
  });

  const setLanguage = (newLang: string) => {
    const validLang = (newLang in TRANSLATIONS ? newLang : 'en') as SupportedLanguageCode;
    setLanguageState(validLang);
    try {
      localStorage.setItem(STORAGE_KEY, validLang);
      document.documentElement.lang = validLang;
    } catch {}
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const currentLanguageConfig = useMemo(() => {
    return SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const isRtl = currentLanguageConfig.dir === 'rtl';

  const t = useMemo(() => {
    // Curated human-readable fallback mappings for any internal/technical keys
    const TECHNICAL_KEY_MAPPINGS: Record<string, string> = {
      'issues.flow_requests': 'Citizen Reports',
      'issues.flow_raw_notes': 'Submitted Reports',
      'issues.flow_issues': 'Community Issues',
      'issues.flow_clustered': 'Identified Issue Clusters',
      'issues.flow_hotspots': 'Priority Hotspots',
      'issues.flow_audits': 'Analysis Checks',
      'citizen_signal_count': 'Citizen Signals',
      'affected_population': 'People Affected',
      'infrastructure_gap': 'Infrastructure Gap',
      'avg_severity': 'Average Severity',
      'source_type': 'Source',
      'created_at': 'Submitted',
      'request_id': 'Request ID',
      'geo_level': 'Geographic Level',
      'raw_notes': 'Submitted Description',
      'cluster_id': 'Issue Cluster',
      'priority_score': 'Priority Score',
      'model_confidence': 'AI Confidence',
      'source_origin': 'Data Source',
      'civicpulse_user': 'CivicPulse Citizen',
      'government_baseline': 'Government Baseline',
      'synthetic_demo': 'Illustrative Demo Data',
      'CIVICPULSE_USER': 'CivicPulse Signals',
      'GOVERNMENT_BASELINE': 'Government Baseline',
      'SYNTHETIC_DEMO': 'Illustrative Demo Data',
      'data.raw': 'Raw Data',
      'request.status': 'Request Status',
      'api_response': 'System Response',
      'null': 'Not available',
      'undefined': 'Not available',
      'NaN': 'No data available',
      '[object Object]': 'Record Details'
    };

    const humanizeTechnicalKey = (k: string): string => {
      if (!k) return '';
      if (TECHNICAL_KEY_MAPPINGS[k]) return TECHNICAL_KEY_MAPPINGS[k];
      
      // If it contains dots like "namespace.sub_key", take the sub_key
      const leaf = k.includes('.') ? k.split('.').pop() || k : k;
      if (TECHNICAL_KEY_MAPPINGS[leaf]) return TECHNICAL_KEY_MAPPINGS[leaf];

      // Convert snake_case or kebab-case to Title Case words
      const cleaned = leaf
        .replace(/[_-]+/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, char => char.toUpperCase())
        .trim();
      return cleaned || k;
    };

    return (key: string, params?: Record<string, string | number>): string => {
      if (!key) return '';
      const activeDict = TRANSLATIONS[language] || TRANSLATIONS.en;
      let text = activeDict[key];

      // Fallback to English if key is missing in active locale
      if (!text && language !== 'en') {
        text = TRANSLATIONS.en[key];
      }

      // If still missing, resolve through human-facing fallback layer
      if (!text) {
        text = humanizeTechnicalKey(key);
      }

      // Replace dynamic parameters like {count}, {status}, etc.
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
        });
      }

      return text;
    };
  }, [language]);

  const tCat = useMemo(() => {
    return (category: string) => translateCategory(category, language);
  }, [language]);

  const tStat = useMemo(() => {
    return (status: string) => translateStatus(status, language);
  }, [language]);

  const tInterv = useMemo(() => {
    return (type: string) => getLocalizedIntervention(type, language);
  }, [language]);

  const tUrg = useMemo(() => {
    return (urgency: string) => getLocalizedUrgency(urgency, language);
  }, [language]);

  const tDist = useMemo(() => {
    return (district: string) => getLocalizedDistrict(district, language);
  }, [language]);

  const tSt = useMemo(() => {
    return (state: string) => getLocalizedState(state, language);
  }, [language]);

  const tRec = useMemo(() => {
    return (rec: RecommendedProject) => getLocalizedRecommendation(rec, language);
  }, [language]);

  const tGovProj = useMemo(() => {
    return (proj: GovernmentProject) => getLocalizedGovernmentProject(proj, language);
  }, [language]);

  const tSigSum = useMemo(() => {
    return (req: CitizenRequest) => getLocalizedSignalSummary(req, language);
  }, [language]);

  const tPat = useMemo(() => {
    return (pat: any) => getLocalizedPattern(pat, language);
  }, [language]);

  const tCommIss = useMemo(() => {
    return (issue: any) => getLocalizedCommunityIssue(issue, language);
  }, [language]);

  const tOverConc = useMemo(() => {
    return () => getLocalizedOverviewConclusion(language);
  }, [language]);

  const tOverPriIss = useMemo(() => {
    return (issue: any) => getLocalizedOverviewPriorityIssue(issue, language);
  }, [language]);

  const tPrio = useMemo(() => {
    return (priority: string) => {
      const p = (priority || '').toLowerCase();
      if (p.includes('crit')) return t('status.critical');
      if (p.includes('high')) return t('status.high');
      if (p.includes('mod') || p.includes('med')) return t('status.moderate');
      if (p.includes('low')) return t('status.low');
      return priority;
    };
  }, [t]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    tCategory: tCat,
    tStatus: tStat,
    tIntervention: tInterv,
    tUrgency: tUrg,
    tDistrict: tDist,
    tState: tSt,
    tRecommendation: tRec,
    tGovernmentProject: tGovProj,
    tSignalSummary: tSigSum,
    tPattern: tPat,
    tCommunityIssue: tCommIss,
    tOverviewConclusion: tOverConc,
    tOverviewPriorityIssue: tOverPriIss,
    tPriority: tPrio,
    supportedLanguages: SUPPORTED_LANGUAGES,
    currentLanguageConfig,
    isRtl,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
