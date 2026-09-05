import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  TRANSLATIONS, 
  SUPPORTED_LANGUAGES, 
  SupportedLanguageCode, 
  LanguageOption,
  translateCategory,
  translateStatus
} from '../translations';

interface LanguageContextType {
  language: SupportedLanguageCode;
  setLanguage: (lang: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  tCategory: (category: string) => string;
  tStatus: (status: string) => string;
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

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    tCategory: tCat,
    tStatus: tStat,
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
