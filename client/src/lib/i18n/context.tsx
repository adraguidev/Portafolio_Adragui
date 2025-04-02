import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { es } from './es';
import { en } from './en';

// Tipo para los idiomas disponibles
export type Locale = 'es' | 'en';

// Tipo para el contexto
interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

// Valor por defecto del contexto
const defaultContextValue: I18nContextType = {
  locale: 'es',
  setLocale: () => {},
  t: (key: string) => key,
};

// Crear el contexto
export const I18nContext = createContext<I18nContextType>(defaultContextValue);

// Hook personalizado para usar el contexto
export const useI18n = () => useContext(I18nContext);

// Proveedor del contexto
interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  // Obtener el idioma del navegador o usar español por defecto
  const getBrowserLocale = (): Locale => {
    const storedLocale = localStorage.getItem('locale') as Locale;
    if (storedLocale) return storedLocale;
    
    const browserLocale = navigator.language.split('-')[0];
    return browserLocale === 'en' ? 'en' : 'es';
  };

  const [locale, setLocale] = useState<Locale>(getBrowserLocale());
  const [translations, setTranslations] = useState(locale === 'es' ? es : en);

  // Cambiar las traducciones cuando cambia el idioma
  useEffect(() => {
    setTranslations(locale === 'es' ? es : en);
    localStorage.setItem('locale', locale);
    document.documentElement.lang = locale;
  }, [locale]);

  // Función para obtener una traducción
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    return value;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};