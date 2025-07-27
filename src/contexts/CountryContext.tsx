import { createContext, useContext, useState, ReactNode } from 'react';

interface Country {
  code: string;
  name: string;
  flag: string;
}

const SUPPORTED_COUNTRIES: Country[] = [
  { code: 'us', name: 'United States', flag: '🇺🇸' },
  { code: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'au', name: 'Australia', flag: '🇦🇺' },
  { code: 'ca', name: 'Canada', flag: '🇨🇦' },
  { code: 'br', name: 'Brazil', flag: '🇧🇷' },
  { code: 'cn', name: 'China', flag: '🇨🇳' },
  { code: 'eg', name: 'Egypt', flag: '🇪🇬' },
  { code: 'fr', name: 'France', flag: '🇫🇷' },
  { code: 'de', name: 'Germany', flag: '🇩🇪' },
  { code: 'gr', name: 'Greece', flag: '🇬🇷' },
  { code: 'hk', name: 'Hong Kong', flag: '🇭🇰' },
  { code: 'in', name: 'India', flag: '🇮🇳' },
  { code: 'ie', name: 'Ireland', flag: '🇮🇪' },
  { code: 'it', name: 'Italy', flag: '🇮🇹' },
  { code: 'jp', name: 'Japan', flag: '🇯🇵' },
  { code: 'nl', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'no', name: 'Norway', flag: '🇳🇴' },
  { code: 'pk', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'pe', name: 'Peru', flag: '🇵🇪' },
  { code: 'ph', name: 'Philippines', flag: '🇵🇭' },
  { code: 'pt', name: 'Portugal', flag: '🇵🇹' },
  { code: 'ro', name: 'Romania', flag: '🇷🇴' },
  { code: 'ru', name: 'Russian Federation', flag: '🇷🇺' },
  { code: 'sg', name: 'Singapore', flag: '🇸🇬' },
  { code: 'es', name: 'Spain', flag: '🇪🇸' },
  { code: 'se', name: 'Sweden', flag: '🇸🇪' },
  { code: 'ch', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'tw', name: 'Taiwan', flag: '🇹🇼' },
  { code: 'ua', name: 'Ukraine', flag: '🇺🇦' },
];

interface CountryContextType {
  currentCountry: Country;
  setCountry: (country: Country) => void;
  supportedCountries: Country[];
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export const useCountry = () => {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
};

interface CountryProviderProps {
  children: ReactNode;
}

export const CountryProvider = ({ children }: CountryProviderProps) => {
  const [currentCountry, setCurrentCountry] = useState<Country>(() => {
    // Load saved country preference on mount
    const savedCountry = localStorage.getItem('preferred-country');
    if (savedCountry) {
      const country = SUPPORTED_COUNTRIES.find(c => c.code === savedCountry);
      if (country) {
        return country;
      }
    }
    return SUPPORTED_COUNTRIES[0]; // Default to United States
  });

  const setCountry = (country: Country) => {
    setCurrentCountry(country);
    localStorage.setItem('preferred-country', country.code);
  };

  return (
    <CountryContext.Provider
      value={{
        currentCountry,
        setCountry,
        supportedCountries: SUPPORTED_COUNTRIES,
      }}
    >
      {children}
    </CountryContext.Provider>
  );
};