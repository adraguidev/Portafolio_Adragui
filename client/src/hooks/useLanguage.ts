import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { queryClient } from '../lib/queryClient';

// Lista de idiomas soportados con español como primero
export const SUPPORTED_LANGUAGES = [
  'es',
  'en',
  'fr',
  'de',
  'it',
  'pt',
] as const;
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export function useLanguage() {
  const { i18n } = useTranslation();
  const [location, setLocation] = useLocation();

  // Cambiar el idioma y actualizar la URL
  const changeLanguage = (newLang: SupportedLanguage) => {
    const url = new URL(window.location.href);
    const searchParams = new URLSearchParams(url.search);

    if (newLang === 'es') {
      // Si el idioma es español (por defecto), eliminar el parámetro lang
      searchParams.delete('lang');
    } else {
      searchParams.set('lang', newLang);
    }

    // Actualizar la URL
    url.search = searchParams.toString();
    setLocation(url.pathname + url.search);

    // Cambiar el idioma en i18next
    i18n.changeLanguage(newLang);

    // Invalidar todas las consultas para forzar una recarga con el nuevo idioma
    queryClient.invalidateQueries();
  };

  // Sincronizar el idioma con el parámetro de URL al cargar y cuando cambie la URL
  useEffect(() => {
    const url = new URL(window.location.href);
    const searchParams = new URLSearchParams(url.search);
    const langParam = searchParams.get('lang') as SupportedLanguage | null;

    // Si no hay parámetro lang o es español, usar español
    const newLang =
      langParam && SUPPORTED_LANGUAGES.includes(langParam) ? langParam : 'es';

    if (i18n.language !== newLang) {
      i18n.changeLanguage(newLang);
    }
  }, [location, i18n]);

  return {
    currentLanguage: i18n.language as SupportedLanguage,
    changeLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
}
