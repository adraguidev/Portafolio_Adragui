import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Article } from '@shared/schema';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const ArticleDetail = () => {
  const [, params] = useRoute('/articles/:slug');
  const slug = params?.slug;

  // Fetch article by slug
  const { data: article, isLoading, error } = useQuery<Article>({
    queryKey: [`/api/articles/slug/${slug}`],
    enabled: !!slug,
  });

  // Set page title
  useEffect(() => {
    if (article) {
      document.title = `${article.title} | Articles`;
    } else {
      document.title = 'Article | Portfolio';
    }
  }, [article]);

  // Format date
  const formatDate = (dateString: Date | null) => {
    if (!dateString) return 'Draft';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate read time
  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const readTime = Math.ceil(words / wordsPerMinute);
    return readTime < 1 ? 1 : readTime;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        {isLoading ? (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-3xl mx-auto">
              <Skeleton className="h-10 w-3/4 mb-4" />
              <div className="flex items-center mb-8">
                <Skeleton className="h-4 w-32 mr-4" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-60 w-full mb-8" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-clash font-bold text-3xl text-primary mb-4">Article Not Found</h1>
              <p className="text-text/70 mb-8">The article you're looking for doesn't exist or has been removed.</p>
              <Button asChild>
                <a href="/#articles">Back to Articles</a>
              </Button>
            </div>
          </div>
        ) : article ? (
          <article>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="max-w-3xl mx-auto">
                <motion.h1 
                  className="font-clash font-bold text-4xl md:text-5xl text-primary mb-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {article.title}
                </motion.h1>
                
                <motion.div 
                  className="flex items-center text-text/60 mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <span className="bg-accent text-primary text-xs font-medium px-3 py-1 rounded-full mr-4">
                    {article.category}
                  </span>
                  <span>{formatDate(article.publishedAt)}</span>
                  <span className="mx-2">•</span>
                  <span>{calculateReadTime(article.content)} min read</span>
                </motion.div>
                
                {article.imageUrl && (
                  <motion.div 
                    className="mb-8"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <img 
                      src={article.imageUrl} 
                      alt={article.title} 
                      className="w-full h-auto rounded-xl"
                    />
                  </motion.div>
                )}
                
                <motion.div 
                  className="prose prose-lg max-w-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {article.content.split('\n').map((paragraph, index) => (
                    paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
                  ))}
                </motion.div>
                
                <div className="mt-12 pt-8 border-t border-slate-200">
                  <Button asChild variant="outline">
                    <a href="/#articles">
                      <i className="ri-arrow-left-line mr-2"></i>
                      Back to Articles
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </article>
        ) : null}
      </main>
      <Footer />
    </div>
  );
};

export default ArticleDetail;
