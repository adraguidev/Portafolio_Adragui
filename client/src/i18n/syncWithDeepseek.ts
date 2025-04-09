/**
 * Sincroniza el idioma seleccionado de i18next con las APIs 
 * que usan Deepseek para traducir contenido dinámico
 * 
 * @param language - Código del idioma (ej: 'es', 'en', etc.)
 */
export const syncDeepseekWithI18n = (language: string) => {
  // Guardar el idioma seleccionado en localStorage para que esté disponible
  // para todas las APIs incluyendo las de deepseek
  localStorage.setItem('selectedLanguage', language);
  
  // Actualizar parámetro lang en URL para que el middleware de autoTranslate
  // en el servidor pueda detectar el idioma solicitado
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set('lang', language);
  window.history.replaceState({}, '', currentUrl.toString());
  
  // Si ya tenemos un idioma previo y acabamos de cambiarlo, recargamos
  const prevLang = sessionStorage.getItem('currentLang');
  if (prevLang && prevLang !== language) {
    // Recargar la página para forzar todas las traducciones
    // Es la forma más fiable de asegurar que tanto i18next como deepseek
    // traducen todo el contenido correctamente
    console.log(`[Deepseek] Recargando página para aplicar idioma: ${language}`);
    
    // Guardamos el idioma antes de recargar
    sessionStorage.setItem('currentLang', language);
    
    // Pequeño timeout para asegurar que los cambios se guardan antes de recargar
    setTimeout(() => {
      window.location.reload();
    }, 100);
    
    return; // Terminamos aquí porque la página se va a recargar
  }
  
  // Solo llegamos aquí si no se va a recargar la página (primera carga)
  // Intentamos invalidar queries por si acaso
  try {
    // Acceder a queryClient como propiedad global en window
    const queryClientAny = (window as any).queryClient;
    if (queryClientAny && typeof queryClientAny.invalidateQueries === 'function') {
      queryClientAny.invalidateQueries();
      console.log('[Deepseek] Invalidadas queries para refrescar datos');
    }
  } catch (error) {
    console.error('[Deepseek] Error al invalidar queries:', error);
  }
  
  // Actualizar idioma actual en sessionStorage
  sessionStorage.setItem('currentLang', language);
  
  console.log(`[Deepseek] Sincronizado idioma: ${language}`);
}; 