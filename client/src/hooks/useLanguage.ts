import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { queryClient } from '../lib/queryClient';

// Lista de idiomas soportados
export const SUPPORTED_LANGUAGES = [
  'en',
  'fr',
  'de',
  'it',
  'pt',
  'es',
] as const;
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export function useLanguage() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Cambiar el idioma y actualizar la URL
  const changeLanguage = (newLang: SupportedLanguage) => {
    const searchParams = new URLSearchParams(location.search);

    if (newLang === 'es') {
      // Si el idioma es español (por defecto), eliminar el parámetro lang
      searchParams.delete('lang');
    } else {
      searchParams.set('lang', newLang);
    }

    // Actualizar la URL
    const newSearch = searchParams.toString();
    const newPath = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
    navigate(newPath, { replace: true });

    // Cambiar el idioma en i18next
    i18n.changeLanguage(newLang);

    // Invalidar todas las consultas para forzar una recarga con el nuevo idioma
    queryClient.invalidateQueries();
  };

  // Sincronizar el idioma con el parámetro de URL al cargar y cuando cambie la URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const langParam = params.get('lang') as SupportedLanguage | null;

    // Si no hay parámetro lang o es español, usar español
    const newLang =
      langParam && SUPPORTED_LANGUAGES.includes(langParam) ? langParam : 'es';

    if (i18n.language !== newLang) {
      i18n.changeLanguage(newLang);
    }
  }, [location.search, i18n]);

  return {
    currentLanguage: i18n.language as SupportedLanguage,
    changeLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
}
