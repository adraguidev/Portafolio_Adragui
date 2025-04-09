import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar traducciones
import translationEN from './locales/en.json';
import translationES from './locales/es.json';
import translationFR from './locales/fr.json';
import translationDE from './locales/de.json';
import translationIT from './locales/it.json';
import translationPT from './locales/pt.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translationEN },
      es: { translation: translationES },
      fr: { translation: translationFR },
      de: { translation: translationDE },
      it: { translation: translationIT },
      pt: { translation: translationPT },
    },
    fallbackLng: 'es',
    supportedLngs: ['en', 'fr', 'de', 'it', 'pt', 'es'],
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['querystring', 'navigator'],
      lookupQuerystring: 'lang',
      caches: ['cookie'],
    },
    load: 'languageOnly',
  });

export default i18n;
