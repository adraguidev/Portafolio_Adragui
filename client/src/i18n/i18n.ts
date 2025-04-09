import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importar traducciones
import translationEN from './locales/en.json';
import translationES from './locales/es.json';
import translationFR from './locales/fr.json';
import translationDE from './locales/de.json';
import translationIT from './locales/it.json';
import translationPT from './locales/pt.json';

// Configuración de i18next
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: translationEN },
    es: { translation: translationES },
    fr: { translation: translationFR },
    de: { translation: translationDE },
    it: { translation: translationIT },
    pt: { translation: translationPT },
  },
  lng: 'es', // idioma por defecto
  fallbackLng: 'es',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
