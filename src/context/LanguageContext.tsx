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
    return (key: string, params?: Record<string, string | number>): string => {
      const activeDict = TRANSLATIONS[language] || TRANSLATIONS.en;
      let text = activeDict[key];

      // Fallback to English if key is missing in active locale
      if (!text && language !== 'en') {
        text = TRANSLATIONS.en[key];
      }

      // If still missing, return key itself gracefully
      if (!text) {
        return key;
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
