import { Button } from '@/components/ui/button';
import { PROFILE_IMAGE_URL } from '@/lib/constants';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

interface SiteInfo {
  id: number;
  about: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactLocation: string | null;
  cvFileUrl: string | null;
  heroImageUrl: string | null;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    dribbble?: string;
  } | null;
}

const HeroSection = () => {
  const { t } = useTranslation();
  
  // Consulta para obtener la información del sitio
  const { data: siteInfo } = useQuery<SiteInfo>({
    queryKey: ['/api/site-info'],
  });

  // Usar la imagen del hero desde la base de datos o la imagen por defecto
  const heroImageUrl = siteInfo?.heroImageUrl || PROFILE_IMAGE_URL;

  // Función para asegurar que la URL de la imagen sea absoluta
  const getAbsoluteImageUrl = (url: string) => {
    if (url.startsWith('http')) {
      return url;
    }
    return `${window.location.origin}${url.startsWith('/') ? url : `/${url}`}`;
  };

  return (
    <section id="home" className="relative py-6 md:py-10 mt-6 md:mt-8 overflow-hidden">
      <div className="animated-bg absolute top-0 left-0 w-full h-full bg-gradient-45 from-primary/3 via-secondary/3 to-accent/3 bg-size-400 animate-gradient-slow z-[-1]"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div 
            className="order-2 md:order-1 -mt-2 md:mt-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium mb-4 available-badge">
              <span className="pulse-dot"></span> {t('common.available')}
            </span>
            <h1 className="font-clash font-bold text-4xl md:text-5xl lg:text-6xl text-primary mb-4 leading-tight">
              {t('home.title')}
            </h1>
            <p className="text-base md:text-lg text-text/80 mb-6 max-w-lg">
              {t('home.description')}
            </p>
            <div className="flex gap-4">
              <Button 
                asChild 
                size="default" 
                className="bg-primary text-white hover:bg-primary/90 font-medium"
              >
                <a href="#cv">
                  {t('common.viewCV')}
                  <i className="ri-arrow-right-line ml-2"></i>
                </a>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="default"
                className="border-slate-200 text-primary hover:bg-slate-50 font-medium"
              >
                <a href="#contact">{t('common.contact')}</a>
              </Button>
            </div>
          </motion.div>
          
          <motion.div 
            className="order-1 md:order-2 relative -mt-2 md:mt-0 max-w-sm mx-auto md:max-w-none md:mx-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative aspect-square rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-secondary/20 mix-blend-multiply z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent z-10"></div>
              <img 
                src={getAbsoluteImageUrl(heroImageUrl)}
                alt={t('home.heroAlt')}
                className="w-full h-full object-cover object-center scale-[1.02]"
                style={{ 
                  filter: 'contrast(1.05) brightness(0.95)',
                  objectPosition: 'center 20%'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = PROFILE_IMAGE_URL;
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/80 to-transparent pt-24 pb-6 px-6 z-20">
                <div className="text-white">
                  <h3 className="text-xl font-semibold">{t('home.name')}</h3>
                  <p className="text-white/80">{t('home.role')}</p>
                </div>
              </div>
            </div>
            <motion.div 
              className="absolute -top-4 -right-4 bg-accent p-4 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <p className="text-primary font-medium text-sm">{t('home.experience')}</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
