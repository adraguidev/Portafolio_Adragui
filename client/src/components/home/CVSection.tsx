import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Experience, Education, Skill } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface CVData {
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  cvFileUrl: string | null;
}

const CVSection = () => {
  const { t, i18n } = useTranslation();
  const { data: cvData, isLoading, isError } = useQuery<CVData>({
    queryKey: ['/api/cv', i18n.language],
    queryFn: async () => {
      const response = await fetch(`/api/cv?lang=${i18n.language}`);
      if (!response.ok) throw new Error('Error al cargar datos del CV');
      const data = await response.json();
      return data as CVData;
    },
    staleTime: 1000,
    refetchOnWindowFocus: false
  });

  const containerAnimation = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="cv" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16">
            <motion.h2 
              className="font-clash font-bold text-4xl md:text-5xl text-primary mb-4"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              {t('cv.title')}
            </motion.h2>
            <motion.p 
              className="text-text/70"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {t('cv.subtitle')}
            </motion.p>
          </div>
          
          {/* Experience */}
          <div className="mb-16">
            <h3 className="font-clash font-semibold text-2xl text-primary mb-6 flex items-center">
              <span className="bg-secondary/10 text-secondary p-2 rounded-md mr-3">
                <i className="ri-briefcase-4-line"></i>
              </span>
              {t('cv.professionalExperience')}
            </h3>
            
            <motion.div 
              className="space-y-8"
              variants={containerAnimation}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {isLoading ? (
                [...Array(2)].map((_, index) => (
                  <div key={index} className="relative pl-8 border-l-2 border-slate-200 pb-8">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-300"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                      <Skeleton className="h-7 w-48 mb-2 sm:mb-0" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ))
              ) : isError ? (
                <div className="text-center py-6">
                  <p className="text-red-500">Error al cargar datos de experiencia. Por favor, intenta recargar la página.</p>
                </div>
              ) : !cvData?.experiences?.length ? (
                <div className="text-center py-6">
                  <p className="text-text/70">No hay experiencia profesional disponible.</p>
                </div>
              ) : (
                cvData.experiences.map((experience: Experience) => (
                  <motion.div 
                    key={experience.id} 
                    className="relative pl-8 border-l-2 border-slate-200 pb-8"
                    variants={itemAnimation}
                    initial="hidden"
                    animate="visible"
                  >
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-secondary"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                      <h4 className="font-clash font-semibold text-xl text-primary">{experience.title}</h4>
                      <span className="bg-slate-100 text-primary/70 px-3 py-1 rounded-full text-sm mt-1 sm:mt-0">
                        {experience.startDate} - {experience.endDate || t('cv.current')}
                      </span>
                    </div>
                    <h5 className="text-secondary font-medium mb-2">{experience.company}</h5>
                    <p className="text-text/70 whitespace-pre-line">{experience.description}</p>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
          
          {/* Education */}
          <div className="mb-16">
            <h3 className="font-clash font-semibold text-2xl text-primary mb-6 flex items-center">
              <span className="bg-secondary/10 text-secondary p-2 rounded-md mr-3">
                <i className="ri-graduation-cap-line"></i>
              </span>
              {t('cv.education')}
            </h3>
            
            <motion.div 
              className="space-y-8"
              variants={containerAnimation}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {isLoading ? (
                <div className="relative pl-8 border-l-2 border-slate-200 pb-8">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-300"></div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                    <Skeleton className="h-7 w-48 mb-2 sm:mb-0" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ) : isError ? (
                <div className="text-center py-6">
                  <p className="text-red-500">Error al cargar datos de educación. Por favor, intenta recargar la página.</p>
                </div>
              ) : !cvData?.education?.length ? (
                <div className="text-center py-6">
                  <p className="text-text/70">No hay información educativa disponible.</p>
                </div>
              ) : (
                cvData.education.map((edu: Education) => (
                  <motion.div 
                    key={edu.id} 
                    className="relative pl-8 border-l-2 border-slate-200 pb-8"
                    variants={itemAnimation}
                  >
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-secondary"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                      <h4 className="font-clash font-semibold text-xl text-primary">{edu.degree}</h4>
                      <span className="bg-slate-100 text-primary/70 px-3 py-1 rounded-full text-sm mt-1 sm:mt-0">
                        {edu.startDate} - {edu.endDate || t('cv.current')}
                      </span>
                    </div>
                    <h5 className="text-secondary font-medium mb-2">{edu.institution}</h5>
                    <p className="text-text/70 whitespace-pre-line">{edu.description}</p>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
          
          {/* Skills */}
          <div>
            <h3 className="font-clash font-semibold text-2xl text-primary mb-6 flex items-center">
              <span className="bg-secondary/10 text-secondary p-2 rounded-md mr-3">
                <i className="ri-tools-line"></i>
              </span>
              {t('cv.skills')}
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {isLoading ? (
                [...Array(4)].map((_, index) => (
                  <div key={index} className="space-y-4">
                    <Skeleton className="h-6 w-24 mb-3" />
                    <div className="flex flex-wrap gap-3">
                      {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-9 w-24 rounded-md" />
                      ))}
                    </div>
                  </div>
                ))
              ) : isError ? (
                <div className="text-center py-6">
                  <p className="text-red-500">Error al cargar datos de habilidades. Por favor, intenta recargar la página.</p>
                </div>
              ) : !cvData?.skills?.length ? (
                <div className="text-center py-6">
                  <p className="text-text/70">No hay habilidades disponibles.</p>
                </div>
              ) : (
                cvData.skills.map((skill: Skill) => (
                  <motion.div 
                    key={skill.id} 
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <h4 className="font-clash font-semibold text-lg text-primary mb-3">{skill.category}</h4>
                    <div className="flex flex-wrap gap-3">
                      {skill.items.map((item, index) => (
                        <span key={index} className="bg-slate-100 text-primary/80 px-3 py-2 rounded-md text-sm">
                          {item}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
          
          <div className="mt-12 flex justify-center">
            {cvData?.cvFileUrl ? (
              <Button 
                asChild
                className="bg-primary text-white hover:bg-primary/90 font-medium"
              >
                <a href="/api/cv/download" target="_blank">
                  <i className="ri-download-line mr-2"></i>
                  {t('cv.download')}
                </a>
              </Button>
            ) : (
              <Button 
                disabled
                className="bg-primary/60 text-white font-medium cursor-not-allowed"
              >
                <i className="ri-download-line mr-2"></i>
                {t('cv.download')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CVSection;
