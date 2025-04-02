import React, { useState, useEffect, createContext, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';

// Contexto de traducción
interface TranslationContextType {
  language: 'es' | 'en';
  setLanguage: (lang: 'es' | 'en') => void;
  translate: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType>({
  language: 'es',
  setLanguage: () => {},
  translate: () => ''
});

// Traducciones
const translations = {
  es: {
    // Navegación
    'nav.home': 'Inicio',
    'nav.projects': 'Proyectos',
    'nav.cv': 'Currículum',
    'nav.articles': 'Artículos',
    'nav.contact': 'Contacto',
    'nav.contactMe': 'Contáctame',
    
    // Hero section
    'hero.available': '🟣 Disponible para trabajar',
    'hero.title': 'Transformando Datos en Soluciones Inteligentes',
    'hero.description': 'Transformo datos en decisiones estratégicas a través del análisis, la visualización y la mejora de procesos operativos. Con experiencia en la creación de dashboards en Power BI, automatización de reportes y soporte a la operatividad, hoy combino mi trayectoria analítica con formación en desarrollo full stack para construir soluciones tecnológicas que generan impacto real.',
    'hero.role': 'Analista de Operaciones',
    'hero.viewWork': 'Ver mi trabajo',
    'hero.contactMe': 'Contáctame',
    'hero.experience': '+5 años de experiencia',
    
    // Traductor
    'translator.translate': 'English version',
    'translator.translating': 'Traduciendo...',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.projects': 'Projects',
    'nav.cv': 'Resume',
    'nav.articles': 'Articles',
    'nav.contact': 'Contact',
    'nav.contactMe': 'Contact Me',
    
    // Hero section
    'hero.available': '🟣 Available for work',
    'hero.title': 'Transforming Data into Smart Solutions',
    'hero.description': 'I transform data into strategic decisions through analysis, visualization, and operational process improvement. With experience in creating Power BI dashboards, report automation, and operational support, I now combine my analytical background with full stack development training to build technological solutions that generate real impact.',
    'hero.role': 'Operations Analyst',
    'hero.viewWork': 'View my work',
    'hero.contactMe': 'Contact Me',
    'hero.experience': '+5 years of experience',
    
    // Translator
    'translator.translate': 'Versión en español',
    'translator.translating': 'Translating...',
  }
};

// Proveedor de traducción
export const TranslationProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Obtener el idioma guardado o usar español por defecto
  const savedLanguage = Cookies.get('language') as 'es' | 'en';
  const [language, setLanguage] = useState<'es' | 'en'>(savedLanguage || 'es');
  
  // Guardar el idioma en cookies cuando cambia
  useEffect(() => {
    Cookies.set('language', language);
  }, [language]);
  
  // Función para traducir texto
  const translate = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };
  
  return (
    <TranslationContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </TranslationContext.Provider>
  );
};

// Hook para usar las traducciones
export const useTranslation = () => useContext(TranslationContext);

// Componente de botón de traducción
interface SimpleTranslatorProps {
  className?: string;
}

const SimpleTranslator: React.FC<SimpleTranslatorProps> = ({ className = '' }) => {
  const { language, setLanguage, translate } = useTranslation();
  const [isTranslating, setIsTranslating] = useState(false);
  
  const toggleLanguage = () => {
    setIsTranslating(true);
    
    // Pequeña demora para mostrar el estado de "traduciendo..."
    setTimeout(() => {
      setLanguage(language === 'es' ? 'en' : 'es');
      setIsTranslating(false);
    }, 500);
  };
  
  return (
    <div className={`flex items-center ${className}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-1 border border-slate-200"
          onClick={toggleLanguage}
          disabled={isTranslating}
        >
          <span role="img" aria-label="Translate" className="mr-1 text-sm">
            {language === 'es' ? '🇬🇧' : '🇪🇸'}
          </span>
          <span className="text-xs font-medium">
            {isTranslating 
              ? translate('translator.translating') 
              : translate('translator.translate')
            }
          </span>
        </Button>
      </motion.div>
    </div>
  );
};

export default SimpleTranslator;