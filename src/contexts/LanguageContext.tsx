import { createContext, useContext, useState, ReactNode } from 'react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'us', name: 'English (US)', flag: '🇺🇸' },
  { code: 'gb', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'au', name: 'English (AU)', flag: '🇦🇺' },
  { code: 'ca', name: 'English (CA)', flag: '🇨🇦' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'br', name: 'Português (BR)', flag: '🇧🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'cn', name: '中文', flag: '🇨🇳' },
  { code: 'jp', name: '日本語', flag: '🇯🇵' },
  { code: 'in', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'se', name: 'Svenska', flag: '🇸🇪' },
  { code: 'ch', name: 'Schweiz', flag: '🇨🇭' },
  { code: 'gr', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'ie', name: 'Ireland', flag: '🇮🇪' },
];

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  supportedLanguages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    // Load saved language preference on mount
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage) {
      const language = SUPPORTED_LANGUAGES.find(lang => lang.code === savedLanguage);
      if (language) {
        return language;
      }
    }
    return SUPPORTED_LANGUAGES[0]; // Default to English
  });

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('preferred-language', language.code);
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};