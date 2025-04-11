import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Message, Article, Project } from '@shared/schema';
import { formatDate } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Stats = () => {
  // Obtener datos de proyectos
  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects']
  });

  // Obtener datos de artículos
  const { data: articles, isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles']
  });

  // Obtener datos de mensajes
  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['/api/messages']
  });

  // Preparar datos para el gráfico de mensajes por mes
  const getMessagesByMonth = () => {
    if (!messages) return [];
    
    const months = Array(12).fill(0);
    messages.forEach(message => {
      const date = new Date(message.createdAt);
      const month = date.getMonth();
      months[month]++;
    });
    
    return months.map((count, index) => ({
      name: new Date(2000, index).toLocaleString('es', { month: 'short' }),
      mensajes: count
    }));
  };

  // Calcular estadísticas
  const totalProjects = projects?.length || 0;
  const totalArticles = articles?.length || 0;
  const publishedArticles = articles?.filter(a => a.published).length || 0;
  const draftArticles = articles?.filter(a => !a.published).length || 0;
  const totalMessages = messages?.length || 0;
  const unreadMessages = messages?.filter(m => !m.read).length || 0;
  const messagesByMonth = getMessagesByMonth();

  if (projectsLoading || articlesLoading || messagesLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-clash font-bold text-3xl text-primary mb-2">Estadísticas</h1>
        <p className="text-text/70">Vista general del rendimiento y actividad del sitio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Proyectos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Proyectos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="font-clash font-bold text-4xl text-primary">{totalProjects}</span>
              <span className="text-text/60">total</span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text/60">Proyectos destacados</span>
                <span className="font-medium">{projects?.filter(p => p.featured).length || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Artículos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Artículos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="font-clash font-bold text-4xl text-primary">{totalArticles}</span>
              <span className="text-text/60">total</span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text/60">Publicados</span>
                <span className="font-medium">{publishedArticles}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text/60">Borradores</span>
                <span className="font-medium">{draftArticles}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mensajes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mensajes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="font-clash font-bold text-4xl text-primary">{totalMessages}</span>
              <span className="text-text/60">total</span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text/60">Sin leer</span>
                <span className="font-medium">{unreadMessages}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text/60">Leídos</span>
                <span className="font-medium">{totalMessages - unreadMessages}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de mensajes por mes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mensajes por mes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={messagesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="mensajes" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Stats; 