import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { syncDeepseekWithI18n } from './syncWithDeepseek';

// Importar traducciones
import translationEN from './locales/en.json';
import translationES from './locales/es.json';
import translationFR from './locales/fr.json';
import translationDE from './locales/de.json';
import translationIT from './locales/it.json';
import translationPT from './locales/pt.json';
import translationJA from './locales/ja.json';
import translationZH from './locales/zh.json';

// Obtener el idioma de la URL si existe
const urlParams = new URLSearchParams(window.location.search);
const urlLang = urlParams.get('lang');

// Configuración principal de i18next
i18n
  .use(HttpBackend)
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
      ja: { translation: translationJA },
      zh: { translation: translationZH },
    },
    fallbackLng: 'es',
    lng: urlLang || 'es', // Usar el idioma de la URL o español por defecto
    supportedLngs: ['en', 'fr', 'de', 'it', 'pt', 'es', 'ja', 'zh'],
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // Orden de detección: 1. querystring, 2. localStorage, 3. navigator
      order: ['querystring', 'localStorage', 'navigator'],
      lookupQuerystring: 'lang',
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    load: 'languageOnly',
  });

// Evento para cuando cambia el idioma
i18n.on('languageChanged', (lng) => {
  // Sincronizar con las APIs de deepseek
  syncDeepseekWithI18n(lng);
  
  // Guardar en localStorage
  localStorage.setItem('i18nextLng', lng);
  
  // Actualizar URL para que deepseek pueda detectarlo
  const url = new URL(window.location.href);
  url.searchParams.set('lang', lng);
  window.history.replaceState({}, '', url.toString());
  
  // Informar por consola
  console.log(`[i18n] Idioma cambiado a: ${lng}`);
  
  // Disparar evento para que otros componentes puedan reaccionar
  document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lng } }));
});

// Asegurar que el idioma inicial sea español si no hay preferencias guardadas
const savedLanguage = localStorage.getItem('i18nextLng');
if (!savedLanguage && !urlLang) {
  i18n.changeLanguage('es');
  localStorage.setItem('i18nextLng', 'es');
}

export default i18n;
