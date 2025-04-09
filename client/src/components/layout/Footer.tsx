import { Link } from 'wouter';
import { NAV_ITEMS, SOCIAL_LINKS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

interface SiteInfoData {
  id: number;
  about: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactLocation: string | null;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    dribbble?: string;
  } | null;
}

const Footer = () => {
  const { t } = useTranslation();
  
  // Obtener info del sitio desde la API
  const { data: siteInfo } = useQuery<SiteInfoData>({
    queryKey: ['/api/site-info'],
  });
  
  // Usar enlaces de redes sociales de la configuración del sitio o valores por defecto
  const socialLinks = {
    github: siteInfo?.socialLinks?.github || SOCIAL_LINKS.github,
    linkedin: siteInfo?.socialLinks?.linkedin || SOCIAL_LINKS.linkedin,
    twitter: siteInfo?.socialLinks?.twitter || SOCIAL_LINKS.twitter,
    dribbble: siteInfo?.socialLinks?.dribbble || SOCIAL_LINKS.dribbble
  };

  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="font-clash font-bold text-2xl">AA.</span>
            </div>
            <p className="text-white/70 max-w-md mb-6">
              {siteInfo?.about || "Creando experiencias digitales que combinan un diseño hermoso con una funcionalidad potente."}
            </p>
            <div className="flex space-x-4">
              {socialLinks.github && (
                <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-accent transition-colors">
                  <i className="ri-github-fill text-xl"></i>
                </a>
              )}
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-accent transition-colors">
                  <i className="ri-linkedin-fill text-xl"></i>
                </a>
              )}
              {socialLinks.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-accent transition-colors">
                  <i className="ri-twitter-fill text-xl"></i>
                </a>
              )}
              {socialLinks.dribbble && (
                <a href={socialLinks.dribbble} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-accent transition-colors">
                  <i className="ri-dribbble-fill text-xl"></i>
                </a>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-clash font-semibold text-lg mb-4">{t('footer.navigation')}</h4>
            <ul className="space-y-3">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="text-white/70 hover:text-accent transition-colors">
                    {t(item.translationKey || item.label)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-clash font-semibold text-lg mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-3">
              <li><Link to="/privacy-policy" className="text-white/70 hover:text-accent transition-colors">{t('legal.privacyPolicy')}</Link></li>
              <li><Link to="/terms-of-service" className="text-white/70 hover:text-accent transition-colors">{t('legal.termsOfService')}</Link></li>
              <li><Link to="/cookie-policy" className="text-white/70 hover:text-accent transition-colors">{t('legal.cookiePolicy')}</Link></li>
              <li><Link to="/login" className="text-white/70 hover:text-accent transition-colors">{t('common.adminPanel')}</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 text-center md:text-left md:flex md:justify-between md:items-center">
          <p className="text-white/60 text-sm">&copy; {new Date().getFullYear()} Adrián Aguirre. Todos los derechos reservados.</p>
          <p className="text-white/60 text-sm mt-2 md:mt-0">
            {t('common.madeWith')} <span className="text-accent">❤</span> {siteInfo?.contactLocation ? `en ${siteInfo.contactLocation}` : "en Lima, Peru"}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
