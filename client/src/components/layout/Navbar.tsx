import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { NAV_ITEMS } from '@/lib/constants';
import { useTranslation } from 'react-i18next';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import i18n from '@/i18n';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Añadir el parámetro lang a la URL para que funcione con deepseek
    const url = new URL(window.location.href);
    url.searchParams.set('lang', lng);
    window.history.replaceState({}, '', url.toString());
  };

  // Obtener el idioma actual
  const currentLanguage = i18n.language || 'es';

  // Mapa de idiomas para mostrar nombres legibles
  const languages = {
    es: 'Español',
    en: 'English',
    fr: 'Français',
    de: 'Deutsch',
    it: 'Italiano',
    pt: 'Português',
    ja: '日本語',
    zh: '中文'
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${
        isScrolled ? 'shadow-sm' : ''
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-clash font-bold text-2xl text-primary">
              AA.
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`nav-link text-primary font-medium relative after:absolute after:content-[''] after:w-0 after:h-0.5 after:bg-accent after:bottom-[-4px] after:left-0 after:transition-all after:duration-300 hover:after:w-full ${
                  location === item.href.split('#')[0] ? 'after:w-full' : ''
                }`}
              >
                {t(item.translationKey || item.label)}
              </a>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {/* Selector de idioma */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-primary font-medium">
                <i className="ri-global-line mr-1"></i>
                <span className="hidden sm:inline">{languages[currentLanguage as keyof typeof languages]}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {Object.entries(languages).map(([code, name]) => (
                  <DropdownMenuItem 
                    key={code} 
                    onClick={() => changeLanguage(code)}
                    className={code === currentLanguage ? "font-bold" : ""}
                  >
                    {name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <a
              href="#contact"
              className="hidden md:inline-flex bg-primary text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {t('nav.contact')}
            </a>
            <button
              onClick={toggleMobileMenu}
              className="md:hidden text-primary"
              aria-label="Toggle menu"
            >
              <i
                className={`ri-${
                  isMobileMenuOpen ? 'close' : 'menu'
                }-line text-2xl`}
              ></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-white ${
          isMobileMenuOpen ? 'block' : 'hidden'
        }`}
      >
        <div className="px-4 py-2 space-y-3">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block text-primary font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t(item.translationKey || item.label)}
            </a>
          ))}
          
          {/* Selector de idioma para móvil */}
          <div className="py-2 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-2">{t('common.language')}</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(languages).map(([code, name]) => (
                <button
                  key={code}
                  onClick={() => {
                    changeLanguage(code);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-left px-2 py-1 rounded ${
                    code === currentLanguage 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
          
          <a
            href="#contact"
            className="block bg-primary text-white rounded-md px-4 py-2 text-sm font-medium text-center"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t('nav.contact')}
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
