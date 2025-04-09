import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

// Lista de idiomas soportados
const SUPPORTED_LANGUAGES = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'ja', name: '日本語' },
];

export default function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState('es');

  // Detectar el idioma actual al cargar el componente
  useEffect(() => {
    const url = new URL(window.location.href);
    const langParam = url.searchParams.get('lang');
    if (langParam && SUPPORTED_LANGUAGES.some(lang => lang.code === langParam)) {
      setCurrentLang(langParam);
    }
  }, []);

  // Cambiar el idioma modificando la URL
  const changeLanguage = (langCode: string) => {
    const url = new URL(window.location.href);
    
    if (langCode === 'es') {
      // Si es español (idioma predeterminado), eliminar el parámetro
      url.searchParams.delete('lang');
    } else {
      url.searchParams.set('lang', langCode);
    }
    
    // Actualizar la URL y recargar la página
    window.location.href = url.toString();
  };

  // Encontrar el nombre del idioma actual
  const currentLanguageName = SUPPORTED_LANGUAGES.find(
    lang => lang.code === currentLang
  )?.name || 'Español';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-primary">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Cambiar idioma</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LANGUAGES.map(lang => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={currentLang === lang.code ? 'bg-accent/10' : ''}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 