import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { NAV_ITEMS } from '@/lib/constants';
import { useTranslation } from 'react-i18next';

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

  return (
    <header
      className={`fixed w-full top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-slate-100 transition-all ${
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
        <div className="px-4 py-3 space-y-4">
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
