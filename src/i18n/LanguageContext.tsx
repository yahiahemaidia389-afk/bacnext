import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Direction, TranslationSchema } from './types';
import { fr } from './locales/fr';
import { en } from './locales/en';
import { ar } from './locales/ar';

const translations: Record<Language, TranslationSchema> = {
  fr,
  en,
  ar,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: Direction;
  isRTL: boolean;
  t: TranslationSchema;
  getLocalizedText: (frText: string, enText?: string, arText?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('bacnext_language');
    if (saved === 'fr' || saved === 'en' || saved === 'ar') {
      return saved;
    }
    return 'fr';
  });

  const dir: Direction = language === 'ar' ? 'rtl' : 'ltr';
  const isRTL = language === 'ar';

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('bacnext_language', lang);
  };

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    if (isRTL) {
      document.body.classList.add('rtl-mode');
    } else {
      document.body.classList.remove('rtl-mode');
    }
  }, [language, dir, isRTL]);

  const t = translations[language] || translations.fr;

  const getLocalizedText = (frText: string, enText?: string, arText?: string): string => {
    if (language === 'ar' && arText) return arText;
    if (language === 'en' && enText) return enText;
    return frText;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        dir,
        isRTL,
        t,
        getLocalizedText,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
