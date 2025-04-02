import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Project } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

const ProjectCard = ({ project }: { project: Project }) => {
  return (
    <motion.div 
      className="project-card group relative bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 transition-all hover:shadow-md"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="aspect-[16/9] relative overflow-hidden">
        <img 
          src={project.imageUrl || ''}
          alt={project.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="project-overlay opacity-0 transition-opacity absolute inset-0 bg-primary/70 flex items-center justify-center group-hover:opacity-100">
          <a 
            href={project.projectUrl || '#'}
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-white text-primary rounded-md px-4 py-2 text-sm font-medium"
          >
            Ver Proyecto
          </a>
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-clash font-semibold text-xl mb-2">{project.title}</h3>
        <p className="text-text/70 text-sm mb-4">{project.description}</p>
        <div className="flex flex-wrap gap-2">
          {project.technologies?.map((tech, index) => (
            <span key={index} className="bg-slate-100 text-primary/80 px-2 py-1 rounded text-xs">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const ProjectSkeleton = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100">
    <Skeleton className="aspect-[16/9] w-full" />
    <div className="p-6">
      <Skeleton className="h-7 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-4" />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-16 rounded" />
        <Skeleton className="h-6 w-20 rounded" />
        <Skeleton className="h-6 w-14 rounded" />
      </div>
    </div>
  </div>
);

const WorkSection = () => {
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects/featured'],
  });

  return (
    <section id="work" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <motion.h2 
            className="font-clash font-bold text-4xl md:text-5xl text-primary mb-4"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Proyectos Destacados
          </motion.h2>
          <motion.p 
            className="text-text/70 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Una colección de mis trabajos recientes en aplicaciones web, plataformas de comercio electrónico y experiencias interactivas.
          </motion.p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <>
              <ProjectSkeleton />
              <ProjectSkeleton />
              <ProjectSkeleton />
            </>
          ) : (
            projects?.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </div>
        
        <div className="mt-12 text-center">
          <Link href="/projects">
            <motion.div 
              className="inline-flex items-center border-b-2 border-secondary/70 text-secondary font-medium hover:border-secondary transition-colors cursor-pointer"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Ver Portafolio Completo
              <i className="ri-arrow-right-line ml-2"></i>
            </motion.div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WorkSection;
