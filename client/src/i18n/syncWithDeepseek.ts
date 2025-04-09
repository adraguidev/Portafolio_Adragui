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
  
  // Si ya tenemos un idioma previo y acabamos de cambiarlo, actualizamos selectivamente
  const prevLang = sessionStorage.getItem('currentLang');
  if (prevLang && prevLang !== language) {
    console.log(`[Deepseek] Cambio de idioma detectado: ${prevLang} → ${language}`);
    
    // Guardamos el idioma actual antes de continuar
    sessionStorage.setItem('currentLang', language);
    
    // Invalidar queries para refrescar los datos con el nuevo idioma
    try {
      // Acceder a queryClient como propiedad global en window
      const queryClientAny = (window as any).queryClient;
      if (queryClientAny && typeof queryClientAny.invalidateQueries === 'function') {
        queryClientAny.invalidateQueries();
        console.log('[Deepseek] Invalidadas queries para refrescar datos');
        
        // Disparar un evento personalizado para que los componentes puedan reaccionar
        document.dispatchEvent(new CustomEvent('deepseekLanguageChanged', { 
          detail: { prevLanguage: prevLang, newLanguage: language }
        }));
        
        return; // Terminamos aquí para evitar la recarga completa
      }
    } catch (error) {
      console.error('[Deepseek] Error al invalidar queries:', error);
    }
    
    // Solo recargamos la página si falló la invalidación de queries
    console.log(`[Deepseek] Recargando página para aplicar idioma: ${language}`);
    setTimeout(() => {
      window.location.reload();
    }, 100);
    
    return;
  }
  
  // Si es la primera carga (sin cambio de idioma)
  if (!prevLang) {
    // Intentamos invalidar queries por si acaso
    try {
      const queryClientAny = (window as any).queryClient;
      if (queryClientAny && typeof queryClientAny.invalidateQueries === 'function') {
        queryClientAny.invalidateQueries();
        console.log('[Deepseek] Invalidadas queries para carga inicial');
      }
    } catch (error) {
      console.error('[Deepseek] Error al invalidar queries en carga inicial:', error);
    }
  }
  
  // Actualizar idioma actual en sessionStorage
  sessionStorage.setItem('currentLang', language);
  
  console.log(`[Deepseek] Sincronizado idioma: ${language}`);
}; 