import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Article } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { WEBSITE_TITLE } from '@/lib/constants';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/lib/utils';

const ArticleCard = ({ article }: { article: Article }) => {
  const { t, i18n } = useTranslation();
  
  // Estimate reading time based on content length (approx. 200 words per minute)
  const estimatedReadTime = Math.max(
    1,
    Math.ceil(article.content.split(/\s+/).length / 200)
  );

  return (
    <motion.article
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 transition-all hover:shadow-md"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="aspect-[16/10] relative overflow-hidden">
        <img
          src={
            article.imageUrl ||
            'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1000&auto=format&fit=crop'
          }
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 text-primary px-3 py-1 rounded-full text-sm font-medium">
            {article.category}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center mb-3">
          <span className="text-text/60 text-sm">
            {article.publishedAt
              ? formatDate(article.publishedAt, i18n.language)
              : article.published
              ? formatDate(article.updatedAt, i18n.language)
              : t('common.draft', 'Borrador')}
          </span>
          <span className="mx-2 text-text/30">•</span>
          <span className="text-text/60 text-sm">
            {estimatedReadTime} {t('common.readTime', 'min de lectura')}
          </span>
        </div>
        <h3 className="font-clash font-semibold text-xl text-primary mb-2 line-clamp-2 h-[56px]">
          {article.title}
        </h3>
        <p className="text-text/70 text-sm mb-4 line-clamp-3 h-[60px]">
          {article.summary}
        </p>
        <Link
          href={`/articles/${article.slug}`}
          className="inline-flex items-center text-secondary font-medium text-sm hover:text-secondary/80 transition-colors"
        >
          {t('common.readArticle', 'Leer Artículo')}
          <i className="ri-arrow-right-line ml-1"></i>
        </Link>
      </div>
    </motion.article>
  );
};

const ArticleSkeleton = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100">
    <div className="aspect-[16/10] relative overflow-hidden">
      <Skeleton className="w-full h-full" />
      <div className="absolute top-4 left-4">
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>
    </div>
    <div className="p-6">
      <div className="flex items-center mb-3">
        <Skeleton className="w-24 h-4 mr-2" />
        <Skeleton className="w-2 h-4 mx-2" />
        <Skeleton className="w-24 h-4" />
      </div>
      <Skeleton className="w-full h-6 mb-2" />
      <Skeleton className="w-3/4 h-6 mb-4" />
      <Skeleton className="w-full h-4 mb-1" />
      <Skeleton className="w-full h-4 mb-1" />
      <Skeleton className="w-2/3 h-4 mb-4" />
      <Skeleton className="w-32 h-5" />
    </div>
  </div>
);

export default function ArticlesPage() {
  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles'],
  });

  // Filter only published articles
  const publishedArticles = articles?.filter((article) => article.published);

  return (
    <>
      <Helmet>
        <title>Artículos | {WEBSITE_TITLE}</title>
      </Helmet>

      <div className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 text-center">
              <motion.h1
                className="font-clash font-bold text-4xl md:text-5xl lg:text-6xl text-primary mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Artículos
              </motion.h1>
              <motion.p
                className="text-text/70 max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Pensamientos, ideas y descubrimientos de mi trayectoria en el
                desarrollo web y diseño.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {isLoading ? (
                <>
                  <ArticleSkeleton />
                  <ArticleSkeleton />
                  <ArticleSkeleton />
                  <ArticleSkeleton />
                  <ArticleSkeleton />
                  <ArticleSkeleton />
                </>
              ) : !publishedArticles?.length ? (
                <div className="col-span-3 text-center py-10">
                  <p className="text-text/70">
                    No hay artículos publicados actualmente.
                  </p>
                </div>
              ) : (
                publishedArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
