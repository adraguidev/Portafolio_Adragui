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
  
  // Forzar recarga de datos de API si hay peticiones pendientes
  // Como solución simple, podemos forzar una recarga de la página
  // cuando cambiamos el idioma para que todas las API se recarguen
  // si es una app más grande se podría usar un patrón más sofisticado
  
  // Si ya tenemos un idioma previo y acabamos de cambiarlo, recargamos
  const prevLang = sessionStorage.getItem('currentLang');
  if (prevLang && prevLang !== language) {
    // Opcional: recargar la página para forzar todas las traducciones
    // window.location.reload();
    
    // Alternativa: si usas React Query, puedes invalidar todas las queries
    try {
      // Acceder a queryClient como propiedad global en window
      const queryClientAny = (window as any).queryClient;
      if (queryClientAny && typeof queryClientAny.invalidateQueries === 'function') {
        queryClientAny.invalidateQueries();
      }
    } catch (error) {
      console.error('[Deepseek] Error al invalidar queries:', error);
    }
  }
  
  // Actualizar idioma actual en sessionStorage
  sessionStorage.setItem('currentLang', language);
  
  console.log(`[Deepseek] Sincronizado idioma: ${language}`);
}; 