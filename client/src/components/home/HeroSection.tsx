import { Button } from '@/components/ui/button';
import { PROFILE_IMAGE_URL } from '@/lib/constants';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

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
  // Consulta para obtener la información del sitio
  const { data: siteInfo } = useQuery<SiteInfo>({
    queryKey: ['/api/site-info'],
  });

  // Usar la imagen del hero desde la base de datos o la imagen por defecto
  const heroImageUrl = siteInfo?.heroImageUrl || PROFILE_IMAGE_URL;

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
              <span className="pulse-dot"></span> Disponible para trabajar
            </span>
            <h1 className="font-clash font-bold text-4xl md:text-5xl lg:text-6xl text-primary mb-4 leading-tight">
              Transformando <span className="text-secondary">Datos</span> en <span className="text-secondary">Soluciones</span> Inteligentes
            </h1>
            <p className="text-base md:text-lg text-text/80 mb-6 max-w-lg">
              Transformo datos en decisiones estratégicas a través del análisis, la visualización y la mejora de procesos operativos. Con experiencia en la creación de dashboards en Power BI, automatización de reportes y soporte a la operatividad, hoy combino mi trayectoria analítica con formación en desarrollo full stack para construir soluciones tecnológicas que generan impacto real.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild 
                size="default" 
                className="bg-primary text-white hover:bg-primary/90 font-medium"
              >
                <a href="#cv">
                  Ver mi currículum
                  <i className="ri-arrow-right-line ml-2"></i>
                </a>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="default"
                className="border-slate-200 text-primary hover:bg-slate-50 font-medium"
              >
                <a href="#contact">Contáctame</a>
              </Button>
            </div>
          </motion.div>
          
          <motion.div 
            className="order-1 md:order-2 relative -mt-2 md:mt-0 max-w-sm mx-auto md:max-w-none md:mx-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative aspect-[4/5] md:aspect-[1/1] bg-slate-100 rounded-2xl overflow-hidden shadow-lg">
              <div className="absolute inset-0 bg-secondary/20 mix-blend-multiply z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent z-10"></div>
              <img 
                src={heroImageUrl}
                alt="Adrián Aguirre, analista de operaciones" 
                className="w-full h-full object-cover object-center scale-[1.02]"
                style={{ 
                  filter: 'contrast(1.05) brightness(0.95)',
                  objectPosition: 'center 20%'
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/80 to-transparent pt-24 pb-6 px-6 z-20">
                <div className="text-white">
                  <h3 className="text-xl font-semibold">Adrián Aguirre</h3>
                  <p className="text-white/80">Analista de Operaciones</p>
                </div>
              </div>
            </div>
            <motion.div 
              className="absolute -top-4 -right-4 bg-accent p-4 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <p className="text-primary font-medium text-sm">+5 años de experiencia</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
