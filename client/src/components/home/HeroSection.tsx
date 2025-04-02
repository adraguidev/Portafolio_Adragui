import { Button } from '@/components/ui/button';
import { PROFILE_IMAGE_URL } from '@/lib/constants';
import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    <section id="home" className="relative py-20 md:py-32 overflow-hidden">
      <div className="animated-bg absolute top-0 left-0 w-full h-full bg-gradient-45 from-primary/3 via-secondary/3 to-accent/3 bg-size-400 animate-gradient-slow z-[-1]"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="order-2 md:order-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium mb-6">🟣 Disponible para trabajar</span>
            <h1 className="font-clash font-bold text-5xl md:text-6xl lg:text-7xl text-primary mb-6 leading-tight">
              Analista de <span className="text-secondary">Operaciones</span> | Full Stack Developer en formación
            </h1>
            <p className="text-lg text-text/80 mb-8 max-w-lg">
              Soy Adrián Aguirre, profesional con más de 5 años de experiencia en análisis de datos, visualización de indicadores y mejora de procesos operativos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild 
                size="lg" 
                className="bg-primary text-white hover:bg-primary/90 font-medium"
              >
                <a href="#work">
                  Ver mi trabajo
                  <i className="ri-arrow-right-line ml-2"></i>
                </a>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="border-slate-200 text-primary hover:bg-slate-50 font-medium"
              >
                <a href="#contact">Contáctame</a>
              </Button>
            </div>
          </motion.div>
          
          <motion.div 
            className="order-1 md:order-2 relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden">
              <img 
                src={PROFILE_IMAGE_URL}
                alt="Adrián Aguirre, analista de operaciones" 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/70 to-transparent pt-20 pb-6 px-6">
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
