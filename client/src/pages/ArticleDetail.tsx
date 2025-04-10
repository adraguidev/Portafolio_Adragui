import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useRoute } from 'wouter';
import { motion } from 'framer-motion';
import { Article } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { WEBSITE_TITLE } from '@/lib/constants';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/lib/utils';

export default function ArticleDetail() {
  const [, params] = useRoute('/articles/:slug');
  const slug = params?.slug;
  const { t, i18n } = useTranslation();

  const {
    data: article,
    isLoading,
    error,
  } = useQuery<Article>({
    queryKey: [`/api/articles/slug/${slug}?lang=${i18n.language}`],
    enabled: !!slug,
  });

  useEffect(() => {
    // Scroll to top when article loads
    window.scrollTo(0, 0);
  }, [article]);

  if (isLoading) {
    return (
      <div className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-12 w-3/4 mb-6" />
            <div className="flex items-center mb-8">
              <Skeleton className="w-12 h-12 rounded-full mr-4" />
              <div>
                <Skeleton className="h-5 w-40 mb-2" />
                <div className="flex items-center">
                  <Skeleton className="h-4 w-24 mr-3" />
                  <Skeleton className="h-4 w-4 mx-2" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
            </div>
            <Skeleton className="w-full aspect-[16/9] rounded-xl mb-10" />
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-6 w-5/6 mb-4" />
            <Skeleton className="h-6 w-4/6 mb-8" />

            {[...Array(8)].map((_, index) => (
              <div key={index} className="mb-6">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-4/5 mb-2" />
                {index % 2 === 0 && <Skeleton className="h-4 w-3/5 mb-2" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-clash font-bold text-3xl text-primary mb-6">
              {t('common.articleNotFound', 'Artículo no encontrado')}
            </h1>
            <p className="text-text/70 mb-8">
              {t('common.articleNotFoundMessage', 'Lo sentimos, no pudimos encontrar el artículo que estás buscando.')}
            </p>
            <Link href={`/articles?lang=${i18n.language}`}>
              <Button variant="secondary">{t('common.viewAllArticles', 'Ver todos los artículos')}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Estimate reading time based on content length (approx. 200 words per minute)
  const estimatedReadTime = Math.max(
    1,
    Math.ceil(article.content.split(/\s+/).length / 200)
  );

  return (
    <>
      <Helmet>
        <title>
          {article.title} | {WEBSITE_TITLE}
        </title>
        <meta name="description" content={article.summary} />
      </Helmet>

      <div className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <div className="mb-4 flex items-center">
                <Link href={`/articles?lang=${i18n.language}`}>
                  <Button
                    variant="ghost"
                    className="inline-flex items-center text-sm text-text/70 hover:text-text transition-colors mr-6 -ml-2"
                  >
                    <i className="ri-arrow-left-line mr-1"></i>
                    {t('common.backToArticles', 'Volver a Artículos')}
                  </Button>
                </Link>
                <span className="text-sm text-text/50">{article.category}</span>
              </div>

              <motion.h1
                className="font-clash font-bold text-3xl md:text-4xl lg:text-5xl text-primary mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {article.title}
              </motion.h1>

              <div className="flex items-center mb-8">
                <img
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=200&auto=format&fit=crop"
                  alt="Author"
                  className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-white shadow-sm"
                />
                <div>
                  <div className="font-medium text-text">Adrián Aguirre</div>
                  <div className="flex items-center text-sm text-text/60">
                    <span>
                      {article.publishedAt
                        ? formatDate(article.publishedAt, i18n.language)
                        : article.published
                        ? formatDate(article.updatedAt, i18n.language)
                        : t('common.draft', 'Borrador')}
                    </span>
                    <span className="mx-2">•</span>
                    <span>{estimatedReadTime} {t('common.readTime', 'min de lectura')}</span>
                  </div>
                </div>
              </div>
            </div>

            {article.imageUrl && (
              <motion.div
                className="mb-10 rounded-xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-auto aspect-[16/9] object-cover"
                />
              </motion.div>
            )}

            <motion.div
              className="prose prose-lg max-w-none mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            <div className="border-t border-slate-200 pt-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-6 sm:mb-0">
                  <h4 className="font-clash font-semibold text-xl text-primary mb-2">
                    {t('common.likeArticle', '¿Te gustó este artículo?')}
                  </h4>
                  <p className="text-text/70">
                    {t('common.shareArticle', 'Compártelo en tus redes sociales')}
                  </p>
                </div>
                <div className="flex space-x-4">
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                      window.location.href
                    )}&text=${encodeURIComponent(article.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-text/70 hover:bg-primary hover:text-white transition-colors"
                  >
                    <i className="ri-twitter-fill"></i>
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                      window.location.href
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-text/70 hover:bg-primary hover:text-white transition-colors"
                  >
                    <i className="ri-linkedin-fill"></i>
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      window.location.href
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-text/70 hover:bg-primary hover:text-white transition-colors"
                  >
                    <i className="ri-facebook-fill"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
