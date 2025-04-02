import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Message, Article, Project } from '@shared/schema';

const Dashboard = () => {
  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects']
  });

  const { data: articles, isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles']
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['/api/messages']
  });

  // Get counts and stats
  const projectCount = projects?.length || 0;
  const publishedArticleCount = articles?.filter(a => a.published).length || 0;
  const unreadMessagesCount = messages?.filter(m => !m.read).length || 0;
  
  // Get the most recent messages
  const recentMessages = messages?.slice(0, 3) || [];
  
  // Get draft articles
  const draftArticles = articles?.filter(a => !a.published).slice(0, 2) || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-clash font-bold text-3xl text-primary mb-2">Dashboard</h1>
        <p className="text-text/70">Welcome back! Here's an overview of your portfolio.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Projects Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-text">Total Projects</h3>
              <span className="bg-secondary/10 text-secondary p-2 rounded-md">
                <i className="ri-folder-line"></i>
              </span>
            </div>
            {projectsLoading ? (
              <Skeleton className="h-10 w-16 mb-2" />
            ) : (
              <>
                <p className="font-clash font-bold text-4xl text-primary">{projectCount}</p>
                <p className="text-text/60 text-sm mt-2">
                  <span className="text-green-500">↑ {projectCount > 0 ? '1' : '0'}</span> from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Articles Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-text">Published Articles</h3>
              <span className="bg-secondary/10 text-secondary p-2 rounded-md">
                <i className="ri-article-line"></i>
              </span>
            </div>
            {articlesLoading ? (
              <Skeleton className="h-10 w-16 mb-2" />
            ) : (
              <>
                <p className="font-clash font-bold text-4xl text-primary">{publishedArticleCount}</p>
                <p className="text-text/60 text-sm mt-2">
                  <span className="text-green-500">↑ {publishedArticleCount > 0 ? '1' : '0'}</span> from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Messages Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-text">Unread Messages</h3>
              <span className="bg-secondary/10 text-secondary p-2 rounded-md">
                <i className="ri-message-3-line"></i>
              </span>
            </div>
            {messagesLoading ? (
              <Skeleton className="h-10 w-16 mb-2" />
            ) : (
              <>
                <p className="font-clash font-bold text-4xl text-primary">{unreadMessagesCount}</p>
                <p className="text-text/60 text-sm mt-2">
                  <span className="text-green-500">↑ {unreadMessagesCount > 0 ? unreadMessagesCount : '0'}</span> new messages
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Messages */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-clash font-semibold text-xl text-primary">Recent Messages</h3>
              <Link href="/admin/messages" className="text-secondary text-sm font-medium">View All</Link>
            </div>
            
            <div className="space-y-4">
              {messagesLoading ? (
                [...Array(3)].map((_, index) => (
                  <div key={index} className="flex items-start space-x-4 pb-4 border-b border-slate-100">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-1">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))
              ) : recentMessages.length > 0 ? (
                recentMessages.map((message) => (
                  <div key={message.id} className="flex items-start space-x-4 pb-4 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                      <span className="text-sm font-medium">{message.name.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-primary">{message.name}</h4>
                        <span className="text-text/60 text-xs">
                          {message.createdAt ? new Date(message.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          }) : 'N/A'}
                        </span>
                      </div>
                      <p className="text-sm text-text/70 line-clamp-2">{message.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-text/60 text-center py-4">No messages yet</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Draft Articles */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-clash font-semibold text-xl text-primary">Draft Articles</h3>
              <Link href="/admin/articles" className="text-secondary text-sm font-medium">Manage Articles</Link>
            </div>
            
            <div className="space-y-4">
              {articlesLoading ? (
                [...Array(2)].map((_, index) => (
                  <div key={index} className="p-4 border border-slate-100 rounded-lg">
                    <Skeleton className="h-6 w-3/4 mb-1" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              ) : draftArticles.length > 0 ? (
                draftArticles.map((article) => (
                  <div key={article.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                    <div>
                      <h4 className="font-medium text-primary mb-1">{article.title}</h4>
                      <p className="text-sm text-text/60">
                        Last edited: {article.updatedAt ? new Date(article.updatedAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/admin/articles/edit/${article.id}`}>
                        <button className="text-text/60 hover:text-text p-1">
                          <i className="ri-edit-line"></i>
                        </button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-text/60 text-center py-4">No draft articles</p>
              )}
              
              <Link href="/admin/articles/new" className="flex items-center justify-center p-4 border border-dashed border-slate-200 rounded-lg text-secondary hover:bg-slate-50 transition-colors">
                <i className="ri-add-line mr-2"></i>
                <span>Create New Article</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
