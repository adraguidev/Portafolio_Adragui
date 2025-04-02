import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Project } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WEBSITE_TITLE } from '@/lib/constants';
import { Helmet } from 'react-helmet';

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
          src={project.imageUrl || "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=1000&auto=format&fit=crop"} 
          alt={project.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {project.technologies && project.technologies.map((tech: string, index: number) => (
            <Badge key={index} variant="secondary" className="bg-white/90 text-primary hover:bg-white">
              {tech}
            </Badge>
          ))}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-clash font-semibold text-xl text-primary mb-2">{project.title}</h3>
        <p className="text-text/70 text-sm mb-4 line-clamp-2">{project.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-text/50">{project.order ? project.order : "Actualidad"}</span>
          <a 
            href={project.projectUrl || "#"} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-secondary font-medium text-sm hover:text-secondary/80 transition-colors"
          >
            Ver Proyecto
            <i className="ri-external-link-line ml-1"></i>
          </a>
        </div>
      </div>
    </motion.div>
  );
};

const ProjectSkeleton = () => (
  <Card className="overflow-hidden">
    <div className="aspect-[16/9] relative">
      <Skeleton className="w-full h-full" />
      <div className="absolute top-3 left-3 flex gap-2">
        <Skeleton className="w-16 h-6 rounded-full" />
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
    </div>
    <CardHeader className="pb-2">
      <Skeleton className="h-6 w-3/4" />
    </CardHeader>
    <CardContent className="pb-2">
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6" />
    </CardContent>
    <CardFooter className="flex justify-between">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-24" />
    </CardFooter>
  </Card>
);

export default function ProjectsPage() {
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  return (
    <>
      <Helmet>
        <title>Portafolio | {WEBSITE_TITLE}</title>
      </Helmet>

      <div className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16 text-center">
              <motion.h1 
                className="font-clash font-bold text-4xl md:text-5xl lg:text-6xl text-primary mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Mi Portafolio
              </motion.h1>
              <motion.p 
                className="text-text/70 max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Una colección completa de mis proyectos de desarrollo web, aplicaciones y diseños.
              </motion.p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {isLoading ? (
                [...Array(6)].map((_, index) => (
                  <ProjectSkeleton key={index} />
                ))
              ) : !projects?.length ? (
                <div className="col-span-3 text-center py-10">
                  <p className="text-text/70">No hay proyectos disponibles actualmente.</p>
                </div>
              ) : (
                projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}