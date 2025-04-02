import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface TranslateButtonProps {
  className?: string;
}

// Utilizamos la definición de tipos global en /lib/window.d.ts

const TranslateButton: React.FC<TranslateButtonProps> = ({ className = '' }) => {
  const [isTranslating, setIsTranslating] = useState(false);

  // Función para integrar traductor de Google
  const handleTranslate = () => {
    setIsTranslating(!isTranslating);
    
    // Crear o eliminar el script de Google Translate
    if (!isTranslating) {
      // Agregar la función de callback global para Google Translate
      window.googleTranslateElementInit = function() {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: 'es',
            includedLanguages: 'en,es',
            layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          },
          'google_translate_element'
        );
      };

      // Crear y agregar el script de Google Translate
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else {
      // Eliminar el script si existe
      const script = document.getElementById('google-translate-script');
      if (script) {
        document.body.removeChild(script);
      }
      
      // Recargar la página para eliminar todas las modificaciones de Google Translate
      window.location.reload();
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-1 border border-slate-200"
          onClick={handleTranslate}
        >
          <span role="img" aria-label="Translate" className="mr-1 text-sm">
            {isTranslating ? '🇬🇧' : '🇪🇸'}
          </span>
          <span className="text-xs font-medium">
            {isTranslating ? 'Traduciendo...' : 'Traducir página'}
          </span>
        </Button>
      </motion.div>
      
      {/* Elemento oculto donde Google Translate inyectará su interfaz */}
      <div id="google_translate_element" className="hidden"></div>
    </div>
  );
};

export default TranslateButton;